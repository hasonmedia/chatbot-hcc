from fastapi import APIRouter
from fastapi.responses import PlainTextResponse

router = APIRouter()

@router.get("/robots.txt", response_class=PlainTextResponse)
async def get_robots():
    print("robots.txt requested")
    return """User-agent: Facebot
Allow: /

User-agent: facebookexternalhit
Allow: /

User-agent: *
Allow: /"""