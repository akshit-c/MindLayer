import pdfplumber
import docx
import io

async def parse_file(file):
    filename = file.filename
    file_type = filename.split(".")[-1].lower()
    content = ""

    if file_type == "pdf":
        with pdfplumber.open(io.BytesIO(await file.read())) as pdf:
            for page in pdf.pages:
                content += page.extract_text() or ""
    elif file_type == "docx":
        doc = docx.Document(io.BytesIO(await file.read()))
        content = "\n".join([para.text for para in doc.paragraphs])
    elif file_type == "txt":
        content = (await file.read()).decode("utf-8")
    else:
        content = "[Unsupported file type]"

    return content.strip(), file_type
