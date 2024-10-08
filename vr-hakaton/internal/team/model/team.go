package model

import (
	"root/internal/order/model"

	"github.com/google/uuid"
	"gorm.io/gorm"
)

type Track string

const (
	AR     Track = "AR"
	ThreeD Track = "3D"
	VR     Track = "VR"
)

type Team struct {
	ID       string        `json:"id" gorm:"type:string;not null;unique"`
	TeamName string        `json:"team_name" gorm:"type:string;unique;not null"`
	Link     string        `json:"link" gorm:"type:string"`
	Track    Track         `json:"track" gorm:"type:string"`
	Orders   []model.Order `gorm:"constraint:OnUpdate:CASCADE,OnDelete:CASCADE;"`
}

func (team *Team) BeforeCreate(tx *gorm.DB) error {
	team.ID = uuid.New().String()
	return nil
}
