from fastapi import FastAPI, HTTPException
from fastapi.staticfiles import StaticFiles
from pydantic import BaseModel
from typing import List, Dict, Optional
import math
import os

app = FastAPI(title="Mission Control Routing API")

class Edge(BaseModel):
    source: str
    target: str
    weight: float

class GraphData(BaseModel):
    nodes: List[str]
    edges: List[Edge]

@app.post("/calculate-routing")
async def calculate_routing(graph: GraphData):
    nodes = graph.nodes
    n = len(nodes)
    node_to_idx = {node: i for i, node in enumerate(nodes)}
    
    # Initialize distance and next-hop matrices
    dist = [[float('inf')] * n for _ in range(n)]
    next_hop = [[None] * n for _ in range(n)]
    
    for i in range(n):
        dist[i][i] = 0
        
    for edge in graph.edges:
        if edge.source in node_to_idx and edge.target in node_to_idx:
            u = node_to_idx[edge.source]
            v = node_to_idx[edge.target]
            dist[u][v] = edge.weight
            next_hop[u][v] = edge.target

    # Floyd-Warshall Algorithm
    # We will return the steps if requested, but for now just the final result
    # and intermediate states for visualization could be handled frontend-side 
    # or we can provide a sequence of updates.
    
    steps = []
    
    for k in range(n):
        for i in range(n):
            for j in range(n):
                if dist[i][k] + dist[k][j] < dist[i][j]:
                    dist[i][j] = dist[i][k] + dist[k][j]
                    next_hop[i][j] = next_hop[i][k]
                    steps.append({
                        "k": nodes[k],
                        "i": nodes[i],
                        "j": nodes[j],
                        "new_dist": dist[i][j]
                    })

    # Prepare readable results
    readable_dist = {}
    for i in range(n):
        readable_dist[nodes[i]] = {}
        for j in range(n):
            val = dist[i][j]
            readable_dist[nodes[i]][nodes[j]] = val if val != float('inf') else "Infinity"

    readable_next_hop = {}
    for i in range(n):
        readable_next_hop[nodes[i]] = {}
        for j in range(n):
            readable_next_hop[nodes[i]][nodes[j]] = next_hop[i][j] if next_hop[i][j] is not None else "None"

    return {
        "distance_matrix": readable_dist,
        "next_hop_matrix": readable_next_hop,
        "steps": steps
    }

@app.get("/health")
async def health():
    return {"status": "operational"}

from fastapi.responses import FileResponse

# Serve static files from React build
@app.get("/{full_path:path}")
async def serve_spa(full_path: str):
    dist_dir = "frontend/dist"
    file_path = os.path.join(dist_dir, full_path)
    
    # If the user is requesting an actual file (like .js, .css, .png)
    if full_path != "" and os.path.exists(file_path):
        return FileResponse(file_path)
        
    # Otherwise fallback to index.html for React routing
    index_file = os.path.join(dist_dir, "index.html")
    if os.path.exists(index_file):
        return FileResponse(index_file)
    
    return {"message": "Frontend build not found. Please run 'npm run build' inside the frontend directory."}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8080)
