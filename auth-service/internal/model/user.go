package model

import "time"

type User struct {
	ID           string    `json:"id"`
	Login        string    `json:"login"`
	Email        string    `json:"email"`
	FullName     string    `json:"fullName"`
	PasswordHash string    `json:"-"`
	Role         string    `json:"role"`
	IsActive     bool      `json:"isActive"`
	IsDeleted    bool      `json:"isDeleted"`
	CreatedAt    time.Time `json:"createdAt"`
}
