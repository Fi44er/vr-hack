package main

import (
	"root/pkg/config"
	"root/pkg/dbs"

	"root/internal/eventbus"
	orderModel "root/internal/order/model"
	httpServer "root/internal/server/http"
	teamModel "root/internal/team/model"

	"github.com/go-playground/validator/v10"
	"github.com/gofiber/fiber/v2/log"
)

func main() {
	cfg := config.LoadConfig()

	db, err := dbs.NewDatabase(cfg.DatabaseURI)
	if err != nil {
		log.Fatal("Cannot connnect to database", err)
	}

	if err = db.AutoMigrate(&teamModel.Team{}, &orderModel.Order{}); err != nil {
		log.Fatal("Database migration fail", err)
	}

	eventBus := eventbus.New()

	validator := validator.New()
	httpSvr := httpServer.NewServer(*validator, db, eventBus)
	if err = httpSvr.Run(); err != nil {
		log.Fatal(err)
	}
}
