import axios from 'axios';

const api = axios.create({
  baseURL: '', // Proxied in vite config or absolute if known
});

export const calculateRouting = async (nodes, edges) => {
  const activeNodes = nodes.filter(n => n.data.status === 'active').map(n => n.id);
  const activeEdges = edges.filter(e => {
    const sourceNode = nodes.find(n => n.id === e.source);
    const targetNode = nodes.find(n => n.id === e.target);
    return sourceNode?.data.status === 'active' && targetNode?.data.status === 'active';
  }).map(e => ({
    source: e.source,
    target: e.target,
    weight: e.data.weight || 10
  }));

  const response = await api.post('/calculate-routing', {
    nodes: activeNodes,
    edges: activeEdges
  });
  return response.data;
};
