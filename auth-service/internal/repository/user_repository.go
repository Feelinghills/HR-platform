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
		`INSERT INTO users (id, login, email, full_name, password_hash, role) VALUES ($1, $2, $3, $4, $5, $6)`,
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
		`SELECT id, login, email, full_name, password_hash, role, is_active, is_deleted, created_at
		 FROM users WHERE id = $1`, id,
	).Scan(&user.ID, &user.Login, &user.Email, &user.FullName, &user.PasswordHash, &user.Role, &user.IsActive, &user.IsDeleted, &user.CreatedAt)
	if err != nil {
		return nil, fmt.Errorf("get user by id: %w", err)
	}
	return user, nil
}

func (r *UserRepository) FindByLoginOrEmail(ctx context.Context, loginOrEmail string) (*model.User, error) {
	user := &model.User{}
	err := r.db.QueryRow(ctx,
		`SELECT id, login, email, full_name, password_hash, role, is_active, is_deleted, created_at
		 FROM users
		 WHERE is_active = true AND is_deleted = false
		   AND (LOWER(login) = LOWER($1) OR LOWER(email) = LOWER($1) OR LOWER(full_name) = LOWER($1))`,
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
		`SELECT EXISTS(SELECT 1 FROM users WHERE LOWER(login) = LOWER($1))`, login,
	).Scan(&exists)
	return exists, err
}

func (r *UserRepository) EmailExists(ctx context.Context, email string) (bool, error) {
	var exists bool
	err := r.db.QueryRow(ctx,
		`SELECT EXISTS(SELECT 1 FROM users WHERE LOWER(email) = LOWER($1))`, email,
	).Scan(&exists)
	return exists, err
}

func (r *UserRepository) UpdatePassword(ctx context.Context, userID, passwordHash string) error {
	_, err := r.db.Exec(ctx,
		`UPDATE users SET password_hash = $1 WHERE id = $2`,
		passwordHash, userID,
	)
	return err
}

func (r *UserRepository) ListAll(ctx context.Context) ([]*model.User, error) {
	rows, err := r.db.Query(ctx,
		`SELECT id, login, email, full_name, password_hash, role, is_active, is_deleted, created_at
		 FROM users WHERE is_deleted = false ORDER BY full_name`,
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
		`UPDATE users SET is_active = $1 WHERE id = $2`,
		isActive, id,
	)
	return err
}

func (r *UserRepository) SoftDelete(ctx context.Context, id, deletedById, reason string) error {
	_, err := r.db.Exec(ctx,
		`UPDATE users SET is_deleted = true, deleted_at = $1, deleted_by_id = $2::uuid, deleted_reason = $3 WHERE id = $4`,
		time.Now(), deletedById, reason, id,
	)
	return err
}

func (r *UserRepository) Restore(ctx context.Context, id string) error {
	_, err := r.db.Exec(ctx,
		`UPDATE users SET is_deleted = false, deleted_at = NULL, deleted_by_id = NULL, deleted_reason = NULL WHERE id = $1`,
		id,
	)
	return err
}
