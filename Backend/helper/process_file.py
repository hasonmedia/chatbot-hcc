import logging
from typing import Dict
from pypdf import PdfReader
from docx import Document
import pandas as pd
from typing import Optional
logger = logging.getLogger(__name__)

async def extract_text_from_pdf(file_path: str) -> Optional[str]:
    try:
        reader = PdfReader(file_path)
        contents = []

        for page in reader.pages:
            text = page.extract_text()
            if text:
                contents.append(text.strip())

        return "\n\n".join(contents).strip()

    except Exception as e:
        logger.error(f"Lỗi đọc file PDF: {e}")
        return None

async def extract_text_from_docx(file_path: str) -> Optional[str]:

    try:
        doc = Document(file_path)
        contents = []

        for para in doc.paragraphs:
            text = para.text.strip()
            if text:
                contents.append(text)

        for table in doc.tables:
            for row in table.rows:
                row_text = " | ".join(cell.text.strip() for cell in row.cells if cell.text.strip())
                if row_text:
                    contents.append(row_text)

        return "\n\n".join(contents).strip()

    except Exception as e:
        return None

async def extract_text_from_excel(file_path: str) -> Optional[str]:
    """
    Đọc nội dung từ file Excel sử dụng pandas
    """
    try:
        excel = pd.ExcelFile(file_path)
        sheet_texts = []

        for sheet in excel.sheet_names:
            try:
                df = pd.read_excel(file_path, sheet)
                if df.empty:
                    continue

                lines = []

                # Mỗi dòng: "Header1: Value1 | Header2: Value2 | ..."
                for _, row in df.iterrows():
                    row_items = []
                    for col, val in row.items():
                        if pd.notna(val):
                            row_items.append(f"{col}: {val}")
                    if row_items:
                        lines.append(" | ".join(row_items))

                if lines:
                    sheet_texts.append("\n".join(lines))

            except Exception:
                continue

        return "\n\n".join(sheet_texts).strip() if sheet_texts else None

    except Exception as e:
        logger.error(f"Lỗi đọc file Excel: {e}")
        return None
