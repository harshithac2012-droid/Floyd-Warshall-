# Mission Control - Network Routing Visualizer

A senior-level, professional-grade dashboard for visualizing and stress-testing network routing using the Floyd-Warshall algorithm.

## Features

- **Mission Control UI**: A sophisticated dark-mode dashboard with glassmorphism and professional aesthetics.
- **Interactive Graph Canvas**: Build your network by adding, renaming, and linking routers.
- **Resiliency Mode**: Simulate network failures by "killing" routers and watch the algorithm recalculate "Plan B" routes.
- **Algorithm Step-Through**: Visualize the Floyd-Warshall O(V³) optimization process node-by-node.
- **Real-Time Data Engine**:
    - **Latency Matrix**: A shaded heatmap showing All-Pairs shortest paths.
    - **Next-Hop Matrix**: A routing table showing the optimal path to every destination.
    - **Resilience Score**: A real-time metric showing the health and fragility of your network mesh.

## Tech Stack

- **Frontend**: React, React Flow, Tailwind CSS, Framer Motion, Zustand.
- **Backend**: Python (FastAPI).
- **Deployment**: Dockerized for Google Cloud Run or any containerized environment.

## Setup & Local Development

### Prerequisites
- Python 3.11+
- Node.js 18+

### 1. Backend Setup
```bash
pip install -r requirements.txt
python main.py
```
The API will be available at `http://localhost:8080`.

### 2. Frontend Setup
```bash
cd frontend
npm install
npm run dev
```
The dashboard will be available at `http://localhost:5173`.

## How it Works

The core of the system is the **Floyd-Warshall Algorithm**, defined by the recurrence relation:
`D[i][j] = min(D[i][j], D[i][k] + D[k][j])`

It builds a global intelligence map by checking if any intermediate router `k` can optimize the connection between every other pair `i` and `j`.

## License
MIT
