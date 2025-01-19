#
# Variables for remote host
# =========================
VPS_USER  ?= static_content_user
VPS_HOST  ?= static.europython.eu
VPS_PROD_PATH  ?= /home/static_content_user/content/europython_websites/ep2025test
VPS_PREVIEW_PATH  ?= /home/static_content_user/content/europython_websites/previews/
REMOTE_CMD=ssh $(VPS_USER)@$(VPS_HOST)

# Variables for build/deploy
# ==========================
export TIMESTAMP := $(shell date +%Y%m%d%H%M%S)
export GIT_VERSION := $(shell git rev-parse --short HEAD)

# Variables for deploy
# ====================
# Auto-detect and sanitize current git branch
BRANCH := $(shell git rev-parse --abbrev-ref HEAD)
# Replace "/" and other non-alphanumeric characters with "-"
SAFE_BRANCH := $(shell echo "$(BRANCH)" | sed 's/[^A-Za-z0-9._-]/-/g')

# TODO: update this to the prod branches
ifeq ($(SAFE_BRANCH), deployment-simpler)
	RELEASES_DIR := $(VPS_PATH)/releases
else
	RELEASES_DIR := $(VPS_PATH)/preview/$(SAFE_BRANCH)/releases
endif

TARGET := $(RELEASES_DIR)/$(TIMESTAMP)

.PHONY: build deploy dev clean install

pre:
	npm install -g pnpm

install:
	pnpm install

dev:
	pnpm dev

clean:
	git clean -fdX

build:
	# TODO: update this to just `pnpm build` after resolving the astro-check warnings
	pnpm run astro build

deploy:
	@echo "\n\n**** Deploying branch '$(BRANCH)' (safe: $(SAFE_BRANCH)) to $(TARGET)...\n\n"
	$(REMOTE_CMD) "mkdir -p $(TARGET)"
	rsync -avz --delete ./dist/ $(VPS_USER)@$(VPS_HOST):$(TARGET)/
	$(REMOTE_CMD) "cd $(RELEASES_DIR) && ln -snf $(TIMESTAMP) current"
	@echo "\n\n**** Deployment complete.\n\n"
