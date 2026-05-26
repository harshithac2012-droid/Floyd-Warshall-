import { create } from 'zustand';
import { addEdge, applyNodeChanges, applyEdgeChanges } from '@xyflow/react';

const useStore = create((set, get) => ({
  nodes: [
    { id: 'London-Edge-01', position: { x: 100, y: 100 }, data: { label: 'London-Edge-01', status: 'active' } },
    { id: 'Paris-Edge-01', position: { x: 400, y: 100 }, data: { label: 'Paris-Edge-01', status: 'active' } },
    { id: 'Berlin-Edge-01', position: { x: 250, y: 300 }, data: { label: 'Berlin-Edge-01', status: 'active' } },
  ],
  edges: [
    { id: 'e1-2', source: 'London-Edge-01', target: 'Paris-Edge-01', label: '10ms', data: { weight: 10 } },
    { id: 'e2-3', source: 'Paris-Edge-01', target: 'Berlin-Edge-01', label: '15ms', data: { weight: 15 } },
    { id: 'e1-3', source: 'London-Edge-01', target: 'Berlin-Edge-01', label: '50ms', data: { weight: 50 } },
  ],
  distanceMatrix: {},
  nextHopMatrix: {},
  currentK: null,
  currentI: null,
  currentJ: null,
  traversedEdges: [],   // edge ids that are "active" in this step
  visitedPairs: [],     // [{i,j}] already evaluated
  activeNodes: [],
  resilienceScore: 100,

  onNodesChange: (changes) => {
    set({
      nodes: applyNodeChanges(changes, get().nodes),
    });
  },
  onEdgesChange: (changes) => {
    set({
      edges: applyEdgeChanges(changes, get().edges),
    });
  },
  onConnect: (connection, weight = 10) => {
    const w = Number(weight) || 10;
    const edge = { ...connection, label: `${w}ms`, data: { weight: w } };
    set({
      edges: addEdge(edge, get().edges),
    });
  },
  updateEdgeWeight: (edgeId, newWeight) => {
    const w = Number(newWeight);
    if (isNaN(w) || w <= 0) return;
    set({
      edges: get().edges.map(e =>
        e.id === edgeId
          ? { ...e, label: `${w}ms`, data: { ...e.data, weight: w } }
          : e
      ),
    });
  },
  updateNodeLabel: (nodeId, newLabel) => {
    set({
      nodes: get().nodes.map((node) => 
        node.id === nodeId ? { ...node, id: newLabel, data: { ...node.data, label: newLabel } } : node
      ),
      edges: get().edges.map((edge) => {
        if (edge.source === nodeId) return { ...edge, source: newLabel };
        if (edge.target === nodeId) return { ...edge, target: newLabel };
        return edge;
      })
    });
  },
  toggleNodeStatus: (nodeId) => {
    set({
      nodes: get().nodes.map((node) => 
        node.id === nodeId ? { ...node, data: { ...node.data, status: node.data.status === 'active' ? 'killed' : 'active' } } : node
      )
    });
    get().calculateResilience();
  },
  addNode: (label, x, y) => {
    const newNode = {
      id: label,
      position: { x, y },
      data: { label, status: 'active' },
    };
    set({ nodes: [...get().nodes, newNode] });
  },
  setNodes: (updater) => {
    set({
      nodes: typeof updater === 'function' ? updater(get().nodes) : updater,
    });
  },
  deleteNode: (nodeId) => {
    set({
      nodes: get().nodes.filter(n => n.id !== nodeId),
      edges: get().edges.filter(e => e.source !== nodeId && e.target !== nodeId)
    });
  },
  setResults: (distanceMatrix, nextHopMatrix) => {
    set({ distanceMatrix, nextHopMatrix });
    get().calculateResilience();
  },
  setCurrentK: (k) => set({ currentK: k }),
  setTraversalStep: (k, i, j) => {
    const state = useStore.getState();
    // find edge ids that connect i→k and k→j
    const findEdge = (src, tgt) =>
      state.edges.find(
        e => (e.source === src && e.target === tgt) ||
             (e.source === tgt && e.target === src)
      )?.id;
    const edgeIK = findEdge(i, k);
    const edgeKJ = findEdge(k, j);
    const traversedEdges = [edgeIK, edgeKJ].filter(Boolean);
    set({
      currentK: k,
      currentI: i,
      currentJ: j,
      traversedEdges,
      visitedPairs: [...(state.visitedPairs || []), { i, j }],
    });
  },
  resetTraversal: () => set({ currentK: null, currentI: null, currentJ: null, traversedEdges: [], visitedPairs: [] }),
  calculateResilience: () => {
    const activeNodes = get().nodes.filter(n => n.data.status === 'active').length;
    const totalNodes = get().nodes.length;
    const score = totalNodes > 0 ? (activeNodes / totalNodes) * 100 : 0;
    set({ resilienceScore: Math.round(score) });
  }
}));

export default useStore;
