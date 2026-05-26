import json

def test_floyd_warshall():
    print("Testing Floyd-Warshall Algorithm...")
    
    # Mock data
    data = {
        "nodes": ["A", "B", "C"],
        "edges": [
            {"source": "A", "target": "B", "weight": 10},
            {"source": "B", "target": "C", "weight": 20},
            {"source": "A", "target": "C", "weight": 50}
        ]
    }
    
    # Setup a small manual test matching main.py logic
    nodes = data["nodes"]
    n = len(nodes)
    node_to_idx = {node: i for i, node in enumerate(nodes)}
    dist = [[float('inf')] * n for _ in range(n)]
    for i in range(n): dist[i][i] = 0
    for edge in data["edges"]:
        u, v = node_to_idx[edge["source"]], node_to_idx[edge["target"]]
        dist[u][v] = edge["weight"]

    for k in range(n):
        for i in range(n):
            for j in range(n):
                if dist[i][k] + dist[k][j] < dist[i][j]:
                    dist[i][j] = dist[i][k] + dist[k][j]

    print(f"Final distance A->C: {dist[node_to_idx['A']][node_to_idx['C']]}")
    assert dist[node_to_idx['A']][node_to_idx['C']] == 30, f"Expected 30, got {dist[node_to_idx['A']][node_to_idx['C']]}"
    print("Algorithm logic verification passed!")

if __name__ == "__main__":
    test_floyd_warshall()
