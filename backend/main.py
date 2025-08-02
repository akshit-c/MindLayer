from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from routers import upload, search, query
from dotenv import load_dotenv

load_dotenv()
app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],  # or ["*"] for development
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


app.include_router(upload.router)
app.include_router(search.router)
app.include_router(query.router)

@app.get("/")
def root():
    return {"message": "MindLayer backend is running"}

