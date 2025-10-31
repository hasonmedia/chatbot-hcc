# Chatbot HCC - Frontend Deploy Branch

This branch contains built frontend files ready for deployment.

## Files:
- `dist/` - Built frontend files
- `Dockerfile` - Docker configuration
- `nginx.conf` - Nginx configuration

## Deploy:
```bash
docker build -t chatbot-frontend .
docker run -d -p 80:80 --name chatbot-frontend chatbot-frontend
```

**Auto-generated from main branch**
