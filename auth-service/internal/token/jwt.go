package token

import (
	"crypto/rand"
	"encoding/hex"
	"fmt"
	"time"

	"github.com/golang-jwt/jwt/v5"
)

// C# ClaimTypes mapped to their URI representations
const (
	claimNameIdentifier = "http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier"
	claimEmail          = "http://schemas.xmlsoap.org/ws/2005/05/identity/claims/emailaddress"
	claimName           = "http://schemas.xmlsoap.org/ws/2005/05/identity/claims/name"
	claimRole           = "http://schemas.microsoft.com/ws/2008/06/identity/claims/role"
)

type Claims struct {
	jwt.RegisteredClaims
}

type customClaims struct {
	NameIdentifier string `json:"http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier"`
	Email          string `json:"http://schemas.xmlsoap.org/ws/2005/05/identity/claims/emailaddress"`
	Name           string `json:"http://schemas.xmlsoap.org/ws/2005/05/identity/claims/name"`
	Role           string `json:"http://schemas.microsoft.com/ws/2008/06/identity/claims/role"`
}

type JWTManager struct {
	secret     []byte
	issuer     string
	audience   string
	expiry     time.Duration
	refreshExp time.Duration
}

func NewJWTManager(secret, issuer, audience string, expiry, refreshExp time.Duration) *JWTManager {
	return &JWTManager{
		secret:     []byte(secret),
		issuer:     issuer,
		audience:   audience,
		expiry:     expiry,
		refreshExp: refreshExp,
	}
}

func (m *JWTManager) GenerateAccessToken(userID, email, name, role string) (string, error) {
	claims := jwt.MapClaims{
		"sub": userID,
		"iss": m.issuer,
		"aud": m.audience,
		"exp": time.Now().Add(m.expiry).Unix(),
		"iat": time.Now().Unix(),
		claimNameIdentifier: userID,
		claimEmail:          email,
		claimName:           name,
		claimRole:           role,
	}

	token := jwt.NewWithClaims(jwt.SigningMethodHS256, claims)
	return token.SignedString(m.secret)
}

func (m *JWTManager) ValidateAccessToken(tokenStr string) (userID, email, name, role string, err error) {
	token, err := jwt.Parse(tokenStr, func(t *jwt.Token) (interface{}, error) {
		if _, ok := t.Method.(*jwt.SigningMethodHMAC); !ok {
			return nil, fmt.Errorf("unexpected signing method: %v", t.Header["alg"])
		}
		return m.secret, nil
	})
	if err != nil {
		return "", "", "", "", fmt.Errorf("parse token: %w", err)
	}

	if claims, ok := token.Claims.(jwt.MapClaims); ok && token.Valid {
		userID, _ = claims[claimNameIdentifier].(string)
		email, _ = claims[claimEmail].(string)
		name, _ = claims[claimName].(string)
		role, _ = claims[claimRole].(string)
		return
	}

	return "", "", "", "", fmt.Errorf("invalid token")
}

func (m *JWTManager) GenerateRefreshToken() (string, error) {
	b := make([]byte, 32)
	if _, err := rand.Read(b); err != nil {
		return "", fmt.Errorf("generate random: %w", err)
	}
	return hex.EncodeToString(b), nil
}

func (m *JWTManager) RefreshExpiry() time.Duration {
	return m.refreshExp
}
