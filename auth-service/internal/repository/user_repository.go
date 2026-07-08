package repository

import (
	"context"
	"fmt"
	"time"

	"github.com/jackc/pgx/v5/pgxpool"

	"auth-service/internal/model"
)

type UserRepository struct {
	db *pgxpool.Pool
}

func NewUserRepository(db *pgxpool.Pool) *UserRepository {
	return &UserRepository{db: db}
}

func (r *UserRepository) Create(ctx context.Context, user *model.User) error {
	_, err := r.db.Exec(ctx,
		`INSERT INTO users ("Id", "Login", "Email", "FullName", "PasswordHash", "Role") VALUES ($1, $2, $3, $4, $5, $6)`,
		user.ID, user.Login, user.Email, user.FullName, user.PasswordHash, user.Role,
	)
	if err != nil {
		return fmt.Errorf("insert user: %w", err)
	}
	return nil
}

func (r *UserRepository) GetByID(ctx context.Context, id string) (*model.User, error) {
	user := &model.User{}
	err := r.db.QueryRow(ctx,
		`SELECT "Id", "Login", "Email", "FullName", "PasswordHash", "Role", "IsActive", "IsDeleted", "CreatedAt"
		 FROM users WHERE "Id" = $1`, id,
	).Scan(&user.ID, &user.Login, &user.Email, &user.FullName, &user.PasswordHash, &user.Role, &user.IsActive, &user.IsDeleted, &user.CreatedAt)
	if err != nil {
		return nil, fmt.Errorf("get user by id: %w", err)
	}
	return user, nil
}

func (r *UserRepository) FindByLoginOrEmail(ctx context.Context, loginOrEmail string) (*model.User, error) {
	user := &model.User{}
	err := r.db.QueryRow(ctx,
		`SELECT "Id", "Login", "Email", "FullName", "PasswordHash", "Role", "IsActive", "IsDeleted", "CreatedAt"
		 FROM users
		 WHERE "IsActive" = true AND "IsDeleted" = false
		   AND (LOWER("Login") = LOWER($1) OR LOWER("Email") = LOWER($1) OR LOWER("FullName") = LOWER($1))`,
		loginOrEmail,
	).Scan(&user.ID, &user.Login, &user.Email, &user.FullName, &user.PasswordHash, &user.Role, &user.IsActive, &user.IsDeleted, &user.CreatedAt)
	if err != nil {
		return nil, fmt.Errorf("find user: %w", err)
	}
	return user, nil
}

func (r *UserRepository) LoginExists(ctx context.Context, login string) (bool, error) {
	var exists bool
	err := r.db.QueryRow(ctx,
		`SELECT EXISTS(SELECT 1 FROM users WHERE LOWER("Login") = LOWER($1))`, login,
	).Scan(&exists)
	return exists, err
}

func (r *UserRepository) EmailExists(ctx context.Context, email string) (bool, error) {
	var exists bool
	err := r.db.QueryRow(ctx,
		`SELECT EXISTS(SELECT 1 FROM users WHERE LOWER("Email") = LOWER($1))`, email,
	).Scan(&exists)
	return exists, err
}

func (r *UserRepository) UpdatePassword(ctx context.Context, userID, passwordHash string) error {
	_, err := r.db.Exec(ctx,
		`UPDATE users SET "PasswordHash" = $1 WHERE "Id" = $2`,
		passwordHash, userID,
	)
	return err
}

func (r *UserRepository) ListAll(ctx context.Context) ([]*model.User, error) {
	rows, err := r.db.Query(ctx,
		`SELECT "Id", "Login", "Email", "FullName", "PasswordHash", "Role", "IsActive", "IsDeleted", "CreatedAt"
		 FROM users WHERE "IsDeleted" = false ORDER BY "FullName"`,
	)
	if err != nil {
		return nil, fmt.Errorf("list users: %w", err)
	}
	defer rows.Close()

	var users []*model.User
	for rows.Next() {
		u := &model.User{}
		if err := rows.Scan(&u.ID, &u.Login, &u.Email, &u.FullName, &u.PasswordHash, &u.Role, &u.IsActive, &u.IsDeleted, &u.CreatedAt); err != nil {
			return nil, fmt.Errorf("scan user: %w", err)
		}
		users = append(users, u)
	}
	return users, nil
}

func (r *UserRepository) SetStatus(ctx context.Context, id string, isActive bool) error {
	_, err := r.db.Exec(ctx,
		`UPDATE users SET "IsActive" = $1 WHERE "Id" = $2`,
		isActive, id,
	)
	return err
}

func (r *UserRepository) SoftDelete(ctx context.Context, id, deletedById, reason string) error {
	_, err := r.db.Exec(ctx,
		`UPDATE users SET "IsDeleted" = true, "DeletedAt" = $1, "DeletedById" = $2::uuid, "DeletedReason" = $3 WHERE "Id" = $4`,
		time.Now(), deletedById, reason, id,
	)
	return err
}

func (r *UserRepository) Restore(ctx context.Context, id string) error {
	_, err := r.db.Exec(ctx,
		`UPDATE users SET "IsDeleted" = false, "DeletedAt" = NULL, "DeletedById" = NULL, "DeletedReason" = NULL WHERE "Id" = $1`,
		id,
	)
	return err
}
