package service

import (
	"context"
	"crypto/rand"
	"crypto/sha256"
	"encoding/base64"
	"fmt"
	"strconv"
	"strings"
	"sync"
	"time"

	"github.com/google/uuid"
	"golang.org/x/crypto/bcrypt"
	"golang.org/x/crypto/pbkdf2"

	"auth-service/internal/model"
	"auth-service/internal/repository"
	"auth-service/internal/token"
)

// --- In-memory user cache ---

type userCacheEntry struct {
	user      *model.User
	expiresAt time.Time
}

type userCache struct {
	mu      sync.RWMutex
	entries map[string]*userCacheEntry
	ttl     time.Duration
}

func newUserCache(ttl time.Duration) *userCache {
	return &userCache{
		entries: make(map[string]*userCacheEntry),
		ttl:     ttl,
	}
}

func (c *userCache) Get(key string) *model.User {
	c.mu.RLock()
	entry, ok := c.entries[key]
	c.mu.RUnlock()
	if !ok || time.Now().After(entry.expiresAt) {
		return nil
	}
	return entry.user
}

func (c *userCache) Set(key string, user *model.User) {
	c.mu.Lock()
	c.entries[key] = &userCacheEntry{user: user, expiresAt: time.Now().Add(c.ttl)}
	c.mu.Unlock()
}

func (c *userCache) Invalidate(key string) {
	c.mu.Lock()
	delete(c.entries, key)
	c.mu.Unlock()
}

// --- Auth service ---

type AuthService struct {
	repo  *repository.UserRepository
	jwt   *token.JWTManager
	cache *userCache
}

func NewAuthService(repo *repository.UserRepository, jwt *token.JWTManager) *AuthService {
	return &AuthService{
		repo:  repo,
		jwt:   jwt,
		cache: newUserCache(5 * time.Minute),
	}
}

// --- Password hashing compatible with C# PBKDF2 ---

func hashPasswordPBKDF2(password string) string {
	salt := make([]byte, 16)
	rand.Read(salt)
	key := pbkdf2SHA256(password, salt, 100_000, 32)
	return fmt.Sprintf("PBKDF2$SHA256$100000$%s$%s",
		base64.StdEncoding.EncodeToString(salt),
		base64.StdEncoding.EncodeToString(key))
}

func pbkdf2SHA256(password string, salt []byte, iterations, keyLen int) []byte {
	return pbkdf2.Key([]byte(password), salt, iterations, keyLen, sha256.New)
}

func verifyPassword(password, hash string) bool {
	if strings.HasPrefix(hash, "PBKDF2$") {
		return verifyPBKDF2(password, hash)
	}
	return bcrypt.CompareHashAndPassword([]byte(hash), []byte(password)) == nil
}

func verifyPBKDF2(password, hash string) bool {
	parts := strings.Split(hash, "$")
	if len(parts) != 5 || parts[0] != "PBKDF2" || parts[1] != "SHA256" {
		return false
	}
	iterations, err := strconv.Atoi(parts[2])
	if err != nil {
		return false
	}
	salt, err := base64.StdEncoding.DecodeString(parts[3])
	if err != nil {
		return false
	}
	expectedKey, err := base64.StdEncoding.DecodeString(parts[4])
	if err != nil {
		return false
	}
	actualKey := pbkdf2SHA256(password, salt, iterations, len(expectedKey))
	if len(actualKey) != len(expectedKey) {
		return false
	}
	for i := range actualKey {
		if actualKey[i] != expectedKey[i] {
			return false
		}
	}
	return true
}

// --- Business logic ---

func (s *AuthService) Login(ctx context.Context, login, password string) (string, *model.User, error) {
	// Try cache first
	cacheKey := strings.ToLower(login)
	if cached := s.cache.Get(cacheKey); cached != nil {
		if verifyPassword(password, cached.PasswordHash) {
			tokenStr, err := s.jwt.GenerateAccessToken(cached.ID, cached.Email, cached.FullName, cached.Role)
			if err != nil {
				return "", nil, fmt.Errorf("generate token: %w", err)
			}
			return tokenStr, cached, nil
		}
		return "", nil, fmt.Errorf("неверный логин или пароль")
	}

	user, err := s.repo.FindByLoginOrEmail(ctx, login)
	if err != nil {
		return "", nil, fmt.Errorf("неверный логин или пароль")
	}

	if !verifyPassword(password, user.PasswordHash) {
		return "", nil, fmt.Errorf("неверный логин или пароль")
	}

	// Cache user for faster subsequent logins
	s.cache.Set(cacheKey, user)
	s.cache.Set(strings.ToLower(user.Email), user)

	tokenStr, err := s.jwt.GenerateAccessToken(user.ID, user.Email, user.FullName, user.Role)
	if err != nil {
		return "", nil, fmt.Errorf("generate token: %w", err)
	}

	return tokenStr, user, nil
}

func (s *AuthService) Register(ctx context.Context, login, email, password, fullName, role string, performedById string) (*model.User, error) {
	login = strings.TrimSpace(strings.ToLower(login))
	email = strings.TrimSpace(strings.ToLower(email))

	exists, _ := s.repo.LoginExists(ctx, login)
	if exists {
		return nil, fmt.Errorf("пользователь с таким логином уже существует")
	}

	exists, _ = s.repo.EmailExists(ctx, email)
	if exists {
		return nil, fmt.Errorf("пользователь с таким email уже существует")
	}

	user := &model.User{
		ID:           uuid.New().String(),
		Login:        login,
		Email:        email,
		FullName:     strings.TrimSpace(fullName),
		PasswordHash: hashPasswordPBKDF2(password),
		Role:         role,
		IsActive:     true,
	}

	if err := s.repo.Create(ctx, user); err != nil {
		return nil, fmt.Errorf("create user: %w", err)
	}

	// Cache new user
	s.cache.Set(login, user)
	s.cache.Set(email, user)

	return user, nil
}

func (s *AuthService) ListUsers(ctx context.Context) ([]*model.User, error) {
	return s.repo.ListAll(ctx)
}

func (s *AuthService) SetUserStatus(ctx context.Context, id string, isActive bool, performedById string) (*model.User, error) {
	if err := s.repo.SetStatus(ctx, id, isActive); err != nil {
		return nil, fmt.Errorf("set status: %w", err)
	}
	s.cache.Invalidate(id)
	return s.repo.GetByID(ctx, id)
}

func (s *AuthService) DeleteUser(ctx context.Context, id, performedById, reason string) error {
	user, err := s.repo.GetByID(ctx, id)
	if err != nil {
		return fmt.Errorf("пользователь не найден")
	}
	if user.IsDeleted {
		return fmt.Errorf("пользователь уже удалён")
	}
	s.cache.Invalidate(strings.ToLower(user.Login))
	s.cache.Invalidate(strings.ToLower(user.Email))
	return s.repo.SoftDelete(ctx, id, performedById, reason)
}

func (s *AuthService) RestoreUser(ctx context.Context, id, performedById string) error {
	user, err := s.repo.GetByID(ctx, id)
	if err != nil {
		return fmt.Errorf("пользователь не найден")
	}
	if !user.IsDeleted {
		return fmt.Errorf("пользователь не удалён")
	}
	s.cache.Invalidate(id)
	return s.repo.Restore(ctx, id)
}
