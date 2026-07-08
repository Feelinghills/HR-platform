package main

import (
	"context"
	"encoding/json"
	"fmt"
	"log"
	"net/http"
	"strings"

	"github.com/rs/cors"

	"auth-service/internal/config"
	"auth-service/internal/db"
	"auth-service/internal/repository"
	"auth-service/internal/service"
	"auth-service/internal/token"
)

func main() {
	cfg := config.Load()
	ctx := context.Background()

	pool, err := db.New(ctx, cfg.PostgresDSN)
	if err != nil {
		log.Fatalf("failed to connect to database: %v", err)
	}
	defer pool.Close()

	userRepo := repository.NewUserRepository(pool)
	jwtMgr := token.NewJWTManager(cfg.JWTSecret, cfg.JWTIssuer, cfg.JWTAudience, cfg.JWTExpiry, cfg.RefreshExpiry)
	authSvc := service.NewAuthService(userRepo, jwtMgr)

	// --- REST HTTP server ---
	mux := http.NewServeMux()

	mux.HandleFunc("/api/auth/login", func(w http.ResponseWriter, r *http.Request) {
		if r.Method != http.MethodPost {
			http.Error(w, "method not allowed", http.StatusMethodNotAllowed)
			return
		}
		var req struct {
			Email    string `json:"email"`
			Password string `json:"password"`
		}
		if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
			http.Error(w, "invalid request body", http.StatusBadRequest)
			return
		}

		tokenStr, user, err := authSvc.Login(r.Context(), req.Email, req.Password)
		if err != nil {
			w.Header().Set("Content-Type", "application/json")
			w.WriteHeader(http.StatusUnauthorized)
			json.NewEncoder(w).Encode(map[string]string{"detail": err.Error()})
			return
		}

		w.Header().Set("Content-Type", "application/json")
		json.NewEncoder(w).Encode(map[string]interface{}{
			"token": tokenStr,
			"user": map[string]interface{}{
				"id":        user.ID,
				"login":     user.Login,
				"email":     user.Email,
				"fullName":  user.FullName,
				"role":      user.Role,
				"isActive":  user.IsActive,
				"createdAt": user.CreatedAt.Format("2006-01-02T15:04:05Z"),
			},
		})
	})

	mux.HandleFunc("/api/auth/me", func(w http.ResponseWriter, r *http.Request) {
		if r.Method != http.MethodGet {
			http.Error(w, "method not allowed", http.StatusMethodNotAllowed)
			return
		}

		authHeader := r.Header.Get("Authorization")
		if authHeader == "" || !strings.HasPrefix(authHeader, "Bearer ") {
			http.Error(w, "unauthorized", http.StatusUnauthorized)
			return
		}

		tokenStr := strings.TrimPrefix(authHeader, "Bearer ")

		userID, email, name, role, err := jwtMgr.ValidateAccessToken(tokenStr)
		if err != nil {
			http.Error(w, "unauthorized", http.StatusUnauthorized)
			return
		}

		w.Header().Set("Content-Type", "application/json")
		json.NewEncoder(w).Encode(map[string]interface{}{
			"id":       userID,
			"email":    email,
			"fullName": name,
			"role":     role,
		})
	})

	// Users REST endpoints
	mux.HandleFunc("/api/users", func(w http.ResponseWriter, r *http.Request) {
		authHeader := r.Header.Get("Authorization")
		if authHeader == "" || !strings.HasPrefix(authHeader, "Bearer ") {
			http.Error(w, "unauthorized", http.StatusUnauthorized)
			return
		}

		switch r.Method {
		case http.MethodGet:
			users, err := authSvc.ListUsers(r.Context())
			if err != nil {
				http.Error(w, err.Error(), http.StatusInternalServerError)
				return
			}
			w.Header().Set("Content-Type", "application/json")
			json.NewEncoder(w).Encode(users)

		case http.MethodPost:
			var req struct {
				Login       string `json:"login"`
				Email       string `json:"email"`
				Password    string `json:"password"`
				FullName    string `json:"fullName"`
				Role        string `json:"role"`
				PerformedBy string `json:"performedById"`
			}
			if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
				http.Error(w, "invalid request body", http.StatusBadRequest)
				return
			}
			user, err := authSvc.Register(r.Context(), req.Login, req.Email, req.Password, req.FullName, req.Role, req.PerformedBy)
			if err != nil {
				http.Error(w, err.Error(), http.StatusInternalServerError)
				return
			}
			w.Header().Set("Content-Type", "application/json")
			w.WriteHeader(http.StatusCreated)
			json.NewEncoder(w).Encode(user)

		default:
			http.Error(w, "method not allowed", http.StatusMethodNotAllowed)
		}
	})

	mux.HandleFunc("/api/users/", func(w http.ResponseWriter, r *http.Request) {
		authHeader := r.Header.Get("Authorization")
		if authHeader == "" || !strings.HasPrefix(authHeader, "Bearer ") {
			http.Error(w, "unauthorized", http.StatusUnauthorized)
			return
		}

		path := strings.TrimPrefix(r.URL.Path, "/api/users/")
		parts := strings.Split(path, "/")
		if len(parts) < 1 {
			http.Error(w, "user id required", http.StatusBadRequest)
			return
		}
		userID := parts[0]

		if r.Method == http.MethodPut && len(parts) == 1 {
			var req struct {
				Login    string `json:"login"`
				Email    string `json:"email"`
				FullName string `json:"fullName"`
				Role     string `json:"role"`
				Password string `json:"password"`
			}
			if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
				http.Error(w, "invalid request body", http.StatusBadRequest)
				return
			}
			user, err := authSvc.UpdateUser(r.Context(), userID, req.Login, req.Email, req.FullName, req.Role, req.Password)
			if err != nil {
				http.Error(w, err.Error(), http.StatusInternalServerError)
				return
			}
			w.Header().Set("Content-Type", "application/json")
			json.NewEncoder(w).Encode(user)
			return
		}

		if len(parts) == 2 && parts[1] == "status" && r.Method == http.MethodPatch {
			var req struct {
				IsActive    bool   `json:"isActive"`
				PerformedBy string `json:"performedById"`
			}
			if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
				http.Error(w, "invalid request body", http.StatusBadRequest)
				return
			}
			user, err := authSvc.SetUserStatus(r.Context(), userID, req.IsActive, req.PerformedBy)
			if err != nil {
				http.Error(w, err.Error(), http.StatusInternalServerError)
				return
			}
			w.Header().Set("Content-Type", "application/json")
			json.NewEncoder(w).Encode(user)
			return
		}

		if len(parts) == 2 && parts[1] == "delete" && r.Method == http.MethodPost {
			var req struct {
				PerformedBy string `json:"performedById"`
				Reason      string `json:"reason"`
			}
			if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
				http.Error(w, "invalid request body", http.StatusBadRequest)
				return
			}
			if err := authSvc.DeleteUser(r.Context(), userID, req.PerformedBy, req.Reason); err != nil {
				http.Error(w, err.Error(), http.StatusInternalServerError)
				return
			}
			w.WriteHeader(http.StatusNoContent)
			return
		}

		if len(parts) == 2 && parts[1] == "restore" && r.Method == http.MethodPost {
			var req struct {
				PerformedBy string `json:"performedById"`
			}
			if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
				http.Error(w, "invalid request body", http.StatusBadRequest)
				return
			}
			if err := authSvc.RestoreUser(r.Context(), userID, req.PerformedBy); err != nil {
				http.Error(w, err.Error(), http.StatusInternalServerError)
				return
			}
			w.WriteHeader(http.StatusNoContent)
			return
		}

		http.Error(w, "not found", http.StatusNotFound)
	})

	handler := cors.New(cors.Options{
		AllowedOrigins:   []string{"*"},
		AllowedMethods:   []string{"GET", "POST", "PATCH", "OPTIONS"},
		AllowedHeaders:   []string{"*"},
		AllowCredentials: true,
	}).Handler(mux)

	httpAddr := ":" + cfg.ServerPort
	fmt.Printf("REST API server running on port %s\n", httpAddr)
	if err := http.ListenAndServe(httpAddr, handler); err != nil {
		log.Fatalf("failed to serve REST: %v", err)
	}
}
