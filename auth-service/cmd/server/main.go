package main

import (
	"context"
	"encoding/json"
	"fmt"
	"log"
	"net"
	"net/http"
	"strings"
	"time"

	"github.com/rs/cors"
	"google.golang.org/grpc"
	"google.golang.org/grpc/codes"
	"google.golang.org/grpc/keepalive"
	"google.golang.org/grpc/status"

	"auth-service/internal/config"
	"auth-service/internal/db"
	"auth-service/internal/repository"
	"auth-service/internal/service"
	"auth-service/internal/token"
	pb "auth-service/proto/auth/v1"
)

type authServer struct {
	pb.UnimplementedAuthServiceServer
	svc *service.AuthService
}

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

	// --- gRPC server ---
	grpcSrv := grpc.NewServer(
		grpc.KeepaliveParams(keepalive.ServerParameters{
			MaxConnectionAge:      30 * time.Minute,
			MaxConnectionAgeGrace: 5 * time.Second,
			Time:                  10 * time.Second,
			Timeout:               3 * time.Second,
		}),
		grpc.KeepaliveEnforcementPolicy(keepalive.EnforcementPolicy{
			MinTime:             5 * time.Second,
			PermitWithoutStream: true,
		}),
	)
	pb.RegisterAuthServiceServer(grpcSrv, &authServer{svc: authSvc})

	go func() {
		lis, err := net.Listen("tcp", ":"+cfg.ServerPort)
		if err != nil {
			log.Fatalf("failed to listen gRPC: %v", err)
		}
		fmt.Printf("gRPC server running on port %s\n", cfg.ServerPort)
		if err := grpcSrv.Serve(lis); err != nil {
			log.Fatalf("failed to serve gRPC: %v", err)
		}
	}()

	// --- REST HTTP server (for direct frontend access) ---
	httpAddr := ":50052"
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
				Login     string `json:"login"`
				Email     string `json:"email"`
				Password  string `json:"password"`
				FullName  string `json:"fullName"`
				Role      string `json:"role"`
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
		AllowedMethods:   []string{"GET", "POST", "OPTIONS"},
		AllowedHeaders:   []string{"*"},
		AllowCredentials: true,
	}).Handler(mux)

	fmt.Printf("REST API server running on port %s\n", httpAddr)
	if err := http.ListenAndServe(httpAddr, handler); err != nil {
		log.Fatalf("failed to serve REST: %v", err)
	}
}

func (s *authServer) Login(ctx context.Context, req *pb.LoginRequest) (*pb.LoginResponse, error) {
	if req.Login == "" || req.Password == "" {
		return nil, status.Error(codes.InvalidArgument, "login and password are required")
	}

	tokenStr, user, err := s.svc.Login(ctx, req.Login, req.Password)
	if err != nil {
		return nil, status.Error(codes.Unauthenticated, err.Error())
	}

	return &pb.LoginResponse{
		Token: tokenStr,
		User: &pb.User{
			Id:        user.ID,
			Login:     user.Login,
			Email:     user.Email,
			FullName:  user.FullName,
			Role:      user.Role,
			IsActive:  user.IsActive,
			CreatedAt: user.CreatedAt.Format("2006-01-02T15:04:05Z"),
		},
	}, nil
}

func (s *authServer) Register(ctx context.Context, req *pb.RegisterRequest) (*pb.RegisterResponse, error) {
	if req.Login == "" || req.Email == "" || req.Password == "" || req.FullName == "" {
		return nil, status.Error(codes.InvalidArgument, "login, email, password and full_name are required")
	}

	user, err := s.svc.Register(ctx, req.Login, req.Email, req.Password, req.FullName, req.Role, req.PerformedById)
	if err != nil {
		return nil, status.Error(codes.Internal, err.Error())
	}

	return &pb.RegisterResponse{
		User: &pb.User{
			Id:        user.ID,
			Login:     user.Login,
			Email:     user.Email,
			FullName:  user.FullName,
			Role:      user.Role,
			IsActive:  user.IsActive,
			CreatedAt: user.CreatedAt.Format("2006-01-02T15:04:05Z"),
		},
	}, nil
}

func (s *authServer) ListUsers(ctx context.Context, req *pb.ListUsersRequest) (*pb.ListUsersResponse, error) {
	users, err := s.svc.ListUsers(ctx)
	if err != nil {
		return nil, status.Error(codes.Internal, err.Error())
	}

	pbUsers := make([]*pb.User, len(users))
	for i, u := range users {
		pbUsers[i] = &pb.User{
			Id:        u.ID,
			Login:     u.Login,
			Email:     u.Email,
			FullName:  u.FullName,
			Role:      u.Role,
			IsActive:  u.IsActive,
			CreatedAt: u.CreatedAt.Format("2006-01-02T15:04:05Z"),
		}
	}

	return &pb.ListUsersResponse{Users: pbUsers}, nil
}

func (s *authServer) SetUserStatus(ctx context.Context, req *pb.SetUserStatusRequest) (*pb.SetUserStatusResponse, error) {
	if req.UserId == "" {
		return nil, status.Error(codes.InvalidArgument, "user_id is required")
	}

	user, err := s.svc.SetUserStatus(ctx, req.UserId, req.IsActive, req.PerformedById)
	if err != nil {
		return nil, status.Error(codes.Internal, err.Error())
	}

	return &pb.SetUserStatusResponse{
		User: &pb.User{
			Id:        user.ID,
			Login:     user.Login,
			Email:     user.Email,
			FullName:  user.FullName,
			Role:      user.Role,
			IsActive:  user.IsActive,
			CreatedAt: user.CreatedAt.Format("2006-01-02T15:04:05Z"),
		},
	}, nil
}

func (s *authServer) DeleteUser(ctx context.Context, req *pb.DeleteUserRequest) (*pb.DeleteUserResponse, error) {
	if req.UserId == "" {
		return nil, status.Error(codes.InvalidArgument, "user_id is required")
	}

	if err := s.svc.DeleteUser(ctx, req.UserId, req.PerformedById, req.Reason); err != nil {
		return nil, status.Error(codes.Internal, err.Error())
	}

	return &pb.DeleteUserResponse{}, nil
}

func (s *authServer) RestoreUser(ctx context.Context, req *pb.RestoreUserRequest) (*pb.RestoreUserResponse, error) {
	if req.UserId == "" {
		return nil, status.Error(codes.InvalidArgument, "user_id is required")
	}

	if err := s.svc.RestoreUser(ctx, req.UserId, req.PerformedById); err != nil {
		return nil, status.Error(codes.Internal, err.Error())
	}

	return &pb.RestoreUserResponse{}, nil
}

func (s *authServer) Me(ctx context.Context, req *pb.MeRequest) (*pb.MeResponse, error) {
	return &pb.MeResponse{}, nil
}
