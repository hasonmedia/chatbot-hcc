import os
import base64
from datetime import datetime
from PIL import Image
import io
from dotenv import load_dotenv
import os

load_dotenv()  
URL_BE = os.getenv("URL_BE")
URL_IMAGE = os.getenv("URL_IMAGE", URL_BE)  # Fallback to URL_BE if URL_IMAGE not set

UPLOAD_DIR = "upload"
os.makedirs(UPLOAD_DIR, exist_ok=True)

ALLOWED_IMAGE_TYPES = {"jpeg", "png", "gif", "bmp", "webp"}
MAX_SIZE = 500 * 1024  # 500KB

def save_base64_image(base64_list):
    image_urls = []

    for base64_data in base64_list:
        if "," in base64_data:
            base64_data = base64_data.split(",", 1)[1]

        img_bytes = base64.b64decode(base64_data)

        if len(img_bytes) > MAX_SIZE:
            raise ValueError("Image size exceeds 500KB")

        timestamp = datetime.now().strftime("%Y%m%d%H%M%S%f")
        filename = f"{timestamp}.png"
        file_path = os.path.join(UPLOAD_DIR, filename)

        with open(file_path, "wb") as f:
            f.write(img_bytes)

        try:
            with Image.open(io.BytesIO(img_bytes)) as img:
                if img.format.lower() not in ALLOWED_IMAGE_TYPES:
                    os.remove(file_path)
                    raise ValueError("Unsupported image type")
        except Exception as e:
            if os.path.exists(file_path):
                os.remove(file_path)
            raise ValueError("Invalid image data") from e

        image_urls.append(f"{URL_IMAGE}/app/upload/{filename}")

    return image_urls
