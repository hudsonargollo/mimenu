#!/bin/bash

# Production deployment to Cloudflare Pages (KV-only stack, no external DB)

set -e

echo "🚀 Starting production deployment..."
echo ""

GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

command -v node >/dev/null 2>&1 || { echo -e "${RED}❌ Node.js is required but not installed.${NC}" >&2; exit 1; }
command -v npm >/dev/null 2>&1 || { echo -e "${RED}❌ npm is required but not installed.${NC}" >&2; exit 1; }

echo -e "${YELLOW}📦 Step 1: Installing dependencies${NC}"
npm install
echo -e "${GREEN}✅ Dependencies installed${NC}"
echo ""

echo -e "${YELLOW}🧪 Step 2: Running tests${NC}"
if npm run test:run; then
    echo -e "${GREEN}✅ All tests passed${NC}"
else
    echo -e "${RED}❌ Tests failed${NC}"
    exit 1
fi
echo ""

echo -e "${YELLOW}🔨 Step 3: Building application${NC}"
npm run build
echo -e "${GREEN}✅ Build completed${NC}"
echo ""

if [ ! -d "dist" ]; then
    echo -e "${RED}❌ Build output directory 'dist' not found${NC}"
    exit 1
fi

if ! command -v wrangler >/dev/null 2>&1; then
    echo -e "${YELLOW}⚠️  Wrangler CLI not found, installing locally${NC}"
    npm install -g wrangler
fi

echo -e "${YELLOW}🚀 Step 4: Deploying to Cloudflare Pages${NC}"
echo "This will deploy to production. Continue? (y/n)"
read -r response

if [[ "$response" =~ ^([yY][eE][sS]|[yY])$ ]]; then
    wrangler pages deploy dist --project-name=mimenu --branch=main
    echo ""
    echo -e "${GREEN}✅ Deployment completed successfully!${NC}"
    echo "Verify: https://mimenu.clubemkt.digital"
    echo "Health: https://mimenu.clubemkt.digital/api/health"
else
    echo -e "${YELLOW}Deployment cancelled${NC}"
    exit 0
fi
