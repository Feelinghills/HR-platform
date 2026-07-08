package main

import (
	"context"
	"fmt"
	"log"
	"net"

	"google.golang.org/grpc"
	"google.golang.org/grpc/codes"
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

	srv := grpc.NewServer()
	pb.RegisterAuthServiceServer(srv, &authServer{svc: authSvc})

	lis, err := net.Listen("tcp", ":"+cfg.ServerPort)
	if err != nil {
		log.Fatalf("failed to listen: %v", err)
	}

	fmt.Printf("gRPC auth server running on port %s\n", cfg.ServerPort)
	if err := srv.Serve(lis); err != nil {
		log.Fatalf("failed to serve: %v", err)
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
	// Me is handled by C# via JWT claims — this is a placeholder
	return &pb.MeResponse{}, nil
}
