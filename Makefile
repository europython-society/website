#
# Variables for remote host
# =========================
VPS_USER  ?= static_content_user
VPS_HOST  ?= static.europython.eu
VPS_PROD_PATH  ?= /home/static_content_user/content/europython_websites/ep2025
VPS_PREVIEW_PATH  ?= /home/static_content_user/content/previews
REMOTE_CMD=ssh $(VPS_USER)@$(VPS_HOST)

# Variables for build/deploy
# ==========================
export TIMESTAMP ?= $(shell date +%Y%m%d%H%M%S)
export GIT_VERSION ?= $(shell git rev-parse --short HEAD)

# Variables for deploy
# ====================
# Auto-detect and sanitize current git branch
BRANCH ?= $(shell git rev-parse --abbrev-ref HEAD)
# Replace "/" and other non-alphanumeric characters with "-"
SAFE_BRANCH := $(shell echo "$(BRANCH)" | sed 's/[^A-Za-z0-9._-]/-/g')
FORCE_DEPLOY ?= false

.PHONY: build deploy dev clean install


safe_branch:
	@echo $(SAFE_BRANCH)

pre:
	npm install -g pnpm

install:
	pnpm install

dev:
	pnpm dev

clean:
	git clean -fdX

check:
	pnpm run astro check

build:
	# TODO: update this to just `pnpm build` after resolving the astro-check warnings
	pnpm run astro build
	# NOTE: also let's find a better way to do this :D
	find ./dist/_astro/ -iname '*.jpg' -delete

preview: RELEASES_DIR = $(VPS_PREVIEW_PATH)/$(SAFE_BRANCH)/releases
preview: TARGET = $(RELEASES_DIR)/$(TIMESTAMP)
preview:
	echo $(TARGET)
	@echo "\n\n**** Deploying preview of a branch '$(BRANCH)' (safe: $(SAFE_BRANCH)) to $(TARGET)...\n\n"
	$(REMOTE_CMD) "mkdir -p $(TARGET)"
	rsync -avz --delete ./dist/ $(VPS_USER)@$(VPS_HOST):$(TARGET)/
	$(REMOTE_CMD) "cd $(RELEASES_DIR) && ln -snf $(TIMESTAMP) current"
	@echo "\n\n**** Preview complete.\n\n"


ifeq ($(FORCE_DEPLOY), true)
deploy: RELEASES_DIR = $(VPS_PROD_PATH)/$(SAFE_BRANCH)/releases
deploy: TARGET = $(RELEASES_DIR)/$(TIMESTAMP)
deploy:
	@echo "\n\n**** Deploying branch '$(BRANCH)' (safe: $(SAFE_BRANCH)) to $(TARGET)...\n\n"
	$(REMOTE_CMD) "mkdir -p $(TARGET)"
	rsync -avz --delete ./dist/ $(VPS_USER)@$(VPS_HOST):$(TARGET)/
	$(REMOTE_CMD) "cd $(RELEASES_DIR) && ln -snf $(TIMESTAMP) current"
	@echo "\n\n**** Deployment complete.\n\n"
endif
