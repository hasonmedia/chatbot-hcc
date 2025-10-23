#!/bin/bash

echo "🚀 =========================================="
echo "🚀   Deploy Chatbot Widget to Production   "
echo "🚀 =========================================="
echo ""

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Step 1: Build Frontend
echo "📦 Step 1: Building Frontend..."
npm run build

if [ $? -ne 0 ]; then
    echo -e "${RED}❌ Build failed!${NC}"
    exit 1
fi
echo -e "${GREEN}✅ Build successful!${NC}"
echo ""

# Step 2: Check widget.js
echo "🔍 Step 2: Checking widget.js..."
if [ -f "dist/widget.js" ]; then
    echo -e "${GREEN}✅ widget.js found in dist/${NC}"
else
    echo -e "${RED}❌ widget.js NOT found in dist!${NC}"
    echo -e "${YELLOW}📋 Copying widget.js manually...${NC}"
    cp public/widget.js dist/
    if [ -f "dist/widget.js" ]; then
        echo -e "${GREEN}✅ widget.js copied successfully!${NC}"
    else
        echo -e "${RED}❌ Failed to copy widget.js!${NC}"
        exit 1
    fi
fi
echo ""

# Step 3: List dist contents
echo "📂 Step 3: Dist folder contents:"
ls -lh dist/ | grep -E "widget.js|index.html|assets"
echo ""

# Step 4: Docker build
echo "🐳 Step 4: Building Docker image..."
docker build -t chatbot-frontend .

if [ $? -ne 0 ]; then
    echo -e "${RED}❌ Docker build failed!${NC}"
    exit 1
fi
echo -e "${GREEN}✅ Docker image built successfully!${NC}"
echo ""

# Step 5: Stop old container
echo "🔄 Step 5: Stopping old container..."
docker stop chatbot-fe 2>/dev/null || echo "No old container running"
docker rm chatbot-fe 2>/dev/null || echo "No old container to remove"
echo ""

# Step 6: Start new container
echo "▶️  Step 6: Starting new container..."
docker run -d -p 80:80 --name chatbot-fe chatbot-frontend

if [ $? -ne 0 ]; then
    echo -e "${RED}❌ Failed to start container!${NC}"
    exit 1
fi
echo -e "${GREEN}✅ Container started successfully!${NC}"
echo ""

# Step 7: Verify
echo "🔍 Step 7: Verifying deployment..."
sleep 3

# Check if container is running
if docker ps | grep -q chatbot-fe; then
    echo -e "${GREEN}✅ Container is running${NC}"
else
    echo -e "${RED}❌ Container is NOT running!${NC}"
    echo "📋 Container logs:"
    docker logs chatbot-fe
    exit 1
fi
echo ""

# Final instructions
echo "🎉 =========================================="
echo "🎉   DEPLOYMENT COMPLETED SUCCESSFULLY!    "
echo "🎉 =========================================="
echo ""
echo "📝 Next steps:"
echo "1. Test widget.js: https://chatbotfe.a2alab.vn/widget.js"
echo "2. Create test HTML file with:"
echo ""
echo '<script'
echo '    src="https://chatbotfe.a2alab.vn/widget.js"'
echo '    data-api-url="https://chatbotbe.a2alab.vn"'
echo '    data-ws-url="wss://chatbotbe.a2alab.vn"'
echo '></script>'
echo ""
echo "3. Open test file in browser"
echo "4. Check Console (F12) for logs"
echo "5. Click chat button 💬 and test!"
echo ""
echo -e "${GREEN}✅ All done!${NC}"
