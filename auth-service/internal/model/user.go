package model

import "time"

type User struct {
	ID           string
	Login        string
	Email        string
	FullName     string
	PasswordHash string
	Role         string
	IsActive     bool
	IsDeleted    bool
	CreatedAt    time.Time
}
