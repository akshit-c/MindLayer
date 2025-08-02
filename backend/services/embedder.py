import os
import numpy as np

# Suppress TensorFlow warnings
os.environ['TF_CPP_MIN_LOG_LEVEL'] = '2'

from sentence_transformers import SentenceTransformer

model = SentenceTransformer("all-MiniLM-L6-v2")

# Store the vectors and metadata in memory for now
DIMENSION = 384
vectors = []
metadata_store = []

def embed_and_store(content, metadata):
    # Split content into chunks
    chunks = [content[i:i+512] for i in range(0, len(content), 512)]
    
    if not chunks:
        return 0
        
    vectors_chunks = model.encode(chunks)
    
    # Store vectors and metadata
    for i, (chunk, vector) in enumerate(zip(chunks, vectors_chunks)):
        vectors.append(vector)
        metadata_store.append({
            "text": chunk,
            "metadata": metadata,
            "vector_index": len(vectors) - 1
        })

    return len(chunks)

def search_similar(query, top_k=5):
    if not vectors:
        return []
    
    query_vector = model.encode([query])
    
    # Calculate cosine similarity
    similarities = []
    for i, vector in enumerate(vectors):
        similarity = np.dot(query_vector[0], vector) / (np.linalg.norm(query_vector[0]) * np.linalg.norm(vector))
        similarities.append((similarity, i))
    
    # Sort by similarity and return top_k
    similarities.sort(reverse=True)
    results = []
    for similarity, idx in similarities[:top_k]:
        results.append({
            "text": metadata_store[idx]["text"],
            "metadata": metadata_store[idx]["metadata"],
            "similarity": float(similarity)
        })
    
    return results

def search_memory(query, top_k=5):
    """Alias for search_similar to maintain compatibility with query.py"""
    return search_similar(query, top_k)

def get_memory_stats():
    """Get statistics about the current memory"""
    return {
        "total_chunks": len(vectors),
        "total_documents": len(set(item["metadata"].get("filename", "unknown") for item in metadata_store)),
        "has_memory": len(vectors) > 0
    }

