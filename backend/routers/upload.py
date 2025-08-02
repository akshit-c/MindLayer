from fastapi import APIRouter, File, UploadFile
from services.embedder import embed_and_store, search_similar
from services.parser import parse_file
from datetime import datetime
from pydantic import BaseModel

router = APIRouter()

class SearchQuery(BaseModel):
    query: str
    top_k: int = 5

@router.post("/upload/")
async def upload_file(file: UploadFile = File(...)):
    content, file_type = await parse_file(file)
    
    metadata = {
        "filename": file.filename,
        "type": file_type,
        "upload_time": datetime.utcnow().isoformat(),
    }

    num_chunks = embed_and_store(content, metadata)

    return {
        "filename": file.filename,
        "type": file_type,
        "upload_time": metadata["upload_time"],
        "content": content[:1000],
        "embedded_chunks": num_chunks
    }

@router.post("/search/")
async def search_documents(search_query: SearchQuery):
    results = search_similar(search_query.query, search_query.top_k)
    return {
        "query": search_query.query,
        "results": results
    }

