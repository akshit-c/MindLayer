import os
import google.generativeai as genai
from fastapi import APIRouter
from pydantic import BaseModel
from services.embedder import search_memory, get_memory_stats
from dotenv import load_dotenv

load_dotenv()
genai.configure(api_key=os.getenv("GEMINI_API_KEY"))

router = APIRouter()

class QueryRequest(BaseModel):
    question: str
    top_k: int = 5

@router.get("/memory-status/")
def get_memory_status():
    """Check if there are any documents in memory"""
    stats = get_memory_stats()
    return {
        "has_memory": stats["has_memory"],
        "total_chunks": stats["total_chunks"],
        "total_documents": stats["total_documents"],
        "message": f"Found {stats['total_documents']} documents with {stats['total_chunks']} chunks" if stats["has_memory"] else "No documents uploaded yet"
    }

@router.post("/query/")
def ask_memory_based_question(payload: QueryRequest):
    # Step 1: Search top-k relevant memory
    results = search_memory(payload.question, payload.top_k)
    
    # Step 2: Check if we have any memory to work with
    if not results:
        return {
            "answer": "I don't have any documents in my memory yet. Please upload some documents first so I can help answer your questions about them.",
            "used_chunks": 0,
            "status": "no_memory"
        }
    
    # Step 3: Join memory chunks into context
    memory_context = "\n---\n".join([r["text"] for r in results])

    # Step 4: Create Gemini prompt
    prompt = f"""
You are a helpful personal assistant that has access to the user's uploaded documents and notes.
Use the content below (retrieved from past uploads) to answer their question.

Memory (from uploaded documents):
{memory_context}

Question: {payload.question}

Please provide a helpful answer based on the content above. If the content doesn't contain enough information to answer the question, say so.
Answer:"""

    # Step 5: Send to Gemini
    model = genai.GenerativeModel("gemini-1.5-flash")
    response = model.generate_content(prompt)

    print("Gemini response:", response.text)

    # Step 6: Return the response
    return {
        "answer": response.text,
        "used_chunks": len(results),
        "status": "success"
    }
