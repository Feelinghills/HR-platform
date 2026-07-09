package config

import (
	"os"
	"time"
)

type Config struct {
	ServerPort    string
	PostgresDSN   string
	JWTSecret     string
	JWTIssuer     string
	JWTAudience   string
	JWTExpiry     time.Duration
	RefreshExpiry time.Duration
	InternalKey   string
}

func Load() *Config {
	return &Config{
		ServerPort:    getEnv("SERVER_PORT", "50051"),
		PostgresDSN:   getEnv("POSTGRES_DSN", "Host=localhost;Port=5432;Database=interview_platform;Username=postgres;Password=postgres"),
		JWTSecret:     getEnv("JWT_SECRET", "InterviewPlatformPracticeSecret_ChangeForProduction_2026"),
		JWTIssuer:     getEnv("JWT_ISSUER", "InterviewPlatform"),
		JWTAudience:   getEnv("JWT_AUDIENCE", "InterviewPlatform"),
		JWTExpiry:     getDurationEnv("JWT_EXPIRY", 120*time.Minute),
		RefreshExpiry: getDurationEnv("REFRESH_EXPIRY", 7*24*time.Hour),
		InternalKey:   getEnv("INTERNAL_API_KEY", "hr-platform-internal-2026"),
	}
}

func getEnv(key, fallback string) string {
	if v := os.Getenv(key); v != "" {
		return v
	}
	return fallback
}

func getDurationEnv(key string, fallback time.Duration) time.Duration {
	if v := os.Getenv(key); v != "" {
		if d, err := time.ParseDuration(v); err == nil {
			return d
		}
	}
	return fallback
}
