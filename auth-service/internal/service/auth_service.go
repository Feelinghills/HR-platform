package service

import (
	"context"
	"crypto/rand"
	"crypto/sha256"
	"encoding/base64"
	"fmt"
	"strconv"
	"strings"

	"github.com/google/uuid"
	"golang.org/x/crypto/bcrypt"
	"golang.org/x/crypto/pbkdf2"

	"auth-service/internal/model"
	"auth-service/internal/repository"
	"auth-service/internal/token"
)

type AuthService struct {
	repo *repository.UserRepository
	jwt  *token.JWTManager
}

func NewAuthService(repo *repository.UserRepository, jwt *token.JWTManager) *AuthService {
	return &AuthService{repo: repo, jwt: jwt}
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

// pbkdf2SHA256 implements PBKDF2-HMAC-SHA256 compatible with C# Rfc2898DeriveBytes
func pbkdf2SHA256(password string, salt []byte, iterations, keyLen int) []byte {
	return pbkdf2.Key([]byte(password), salt, iterations, keyLen, sha256.New)
}

func verifyPassword(password, hash string) bool {
	if strings.HasPrefix(hash, "PBKDF2$") {
		fmt.Printf("DEBUG: verifying PBKDF2, pw_len=%d, hash=%s\n", len(password), hash[:40])
		result := verifyPBKDF2(password, hash)
		fmt.Printf("DEBUG: PBKDF2 result=%v\n", result)
		return result
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

// --- Business logic matching C# IAuthService ---

func (s *AuthService) Login(ctx context.Context, login, password string) (string, *model.User, error) {
	fmt.Printf("DEBUG Login called: login=%s\n", login)
	user, err := s.repo.FindByLoginOrEmail(ctx, login)
	if err != nil {
		fmt.Printf("DEBUG Login find user error: %v\n", err)
		return "", nil, fmt.Errorf("Неверный логин или пароль.")
	}
	fmt.Printf("DEBUG Login user found: id=%s, hash_prefix=%s\n", user.ID, user.PasswordHash[:20])
	if !verifyPassword(password, user.PasswordHash) {
		fmt.Printf("DEBUG Login password mismatch\n")
		return "", nil, fmt.Errorf("Неверный логин или пароль.")
	}

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
		return nil, fmt.Errorf("Пользователь с таким логином уже существует.")
	}

	exists, _ = s.repo.EmailExists(ctx, email)
	if exists {
		return nil, fmt.Errorf("Пользователь с таким email уже существует.")
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

	return user, nil
}

func (s *AuthService) ListUsers(ctx context.Context) ([]*model.User, error) {
	return s.repo.ListAll(ctx)
}

func (s *AuthService) SetUserStatus(ctx context.Context, id string, isActive bool, performedById string) (*model.User, error) {
	if err := s.repo.SetStatus(ctx, id, isActive); err != nil {
		return nil, fmt.Errorf("set status: %w", err)
	}
	return s.repo.GetByID(ctx, id)
}

func (s *AuthService) DeleteUser(ctx context.Context, id, performedById, reason string) error {
	user, err := s.repo.GetByID(ctx, id)
	if err != nil {
		return fmt.Errorf("Пользователь не найден.")
	}
	if user.IsDeleted {
		return fmt.Errorf("Пользователь уже удалён.")
	}
	return s.repo.SoftDelete(ctx, id, performedById, reason)
}

func (s *AuthService) RestoreUser(ctx context.Context, id, performedById string) error {
	user, err := s.repo.GetByID(ctx, id)
	if err != nil {
		return fmt.Errorf("Пользователь не найден.")
	}
	if !user.IsDeleted {
		return fmt.Errorf("Пользователь не удалён.")
	}
	return s.repo.Restore(ctx, id)
}
