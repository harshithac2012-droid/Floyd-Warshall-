import React, { useCallback, useState, useRef, useMemo } from 'react';
import { 
  ReactFlow, 
  Controls, 
  Background, 
  useNodesState, 
  useEdgesState, 
  addEdge,
  Panel,
  BaseEdge,
  getStraightPath,
  EdgeLabelRenderer
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import useStore from '../store/useStore';
import useForceLayout from '../hooks/useForceLayout';
import { Plus, RefreshCw } from 'lucide-react';
import WeightModal from './WeightModal';

/* ─── Inject CSS animations once ─────────────────────────────────────── */
const STYLE_ID = 'nc-traverse-styles';
if (!document.getElementById(STYLE_ID)) {
  const style = document.createElement('style');
  style.id = STYLE_ID;
  style.textContent = `
    @keyframes nc-pulse-k {
      0%, 100% { box-shadow: 0 0 0 0 rgba(245,158,11,0.9), 0 0 18px 6px rgba(245,158,11,0.55); }
      50%       { box-shadow: 0 0 0 8px rgba(245,158,11,0), 0 0 30px 12px rgba(245,158,11,0.25); }
    }
    @keyframes nc-pulse-i {
      0%, 100% { box-shadow: 0 0 0 0 rgba(56,189,248,0.9), 0 0 18px 6px rgba(56,189,248,0.55); }
      50%       { box-shadow: 0 0 0 8px rgba(56,189,248,0), 0 0 30px 12px rgba(56,189,248,0.25); }
    }
    @keyframes nc-pulse-j {
      0%, 100% { box-shadow: 0 0 0 0 rgba(167,139,250,0.9), 0 0 18px 6px rgba(167,139,250,0.55); }
      50%       { box-shadow: 0 0 0 8px rgba(167,139,250,0), 0 0 30px 12px rgba(167,139,250,0.25); }
    }
    @keyframes nc-dash {
      to { stroke-dashoffset: -20; }
    }
    @keyframes nc-glow-ik {
      0%, 100% { filter: drop-shadow(0 0 4px #38BDF8) drop-shadow(0 0 8px #38BDF8); }
      50%       { filter: drop-shadow(0 0 10px #38BDF8) drop-shadow(0 0 20px #38BDF8aa); }
    }
    @keyframes nc-glow-kj {
      0%, 100% { filter: drop-shadow(0 0 4px #a78bfa) drop-shadow(0 0 8px #a78bfa); }
      50%       { filter: drop-shadow(0 0 10px #a78bfa) drop-shadow(0 0 20px #a78bfaaa); }
    }
    .nc-edge-ik { animation: nc-glow-ik 1s ease-in-out infinite; }
    .nc-edge-kj { animation: nc-glow-kj 1s ease-in-out infinite; }
    .nc-dash-path {
      stroke-dasharray: 8 4;
      animation: nc-dash 0.5s linear infinite;
    }
    @keyframes nc-spin {
      from { transform: rotate(0deg); }
      to   { transform: rotate(360deg); }
    }
  `;
  document.head.appendChild(style);
}

/* ─── Role detection helpers ─────────────────────────────────────────── */
const getNodeRole = (nodeId, currentK, currentI, currentJ) => {
  if (nodeId === currentK) return 'k';
  if (nodeId === currentI) return 'i';
  if (nodeId === currentJ) return 'j';
  return null;
};

const getEdgeRole = (edgeId, traversedEdges, nodes, edges, currentK, currentI, currentJ) => {
  if (!traversedEdges || !traversedEdges.includes(edgeId)) return null;
  const edge = edges.find(e => e.id === edgeId);
  if (!edge) return null;
  const isIK = (edge.source === currentI && edge.target === currentK) ||
               (edge.source === currentK && edge.target === currentI);
  return isIK ? 'ik' : 'kj';
};

/* ─── Node style factory ─────────────────────────────────────────────── */
const nodeStyles = (node, currentK, currentI, currentJ, visitedPairs) => {
  const role = getNodeRole(node.id, currentK, currentI, currentJ);
  const isKilled = node.data.status !== 'active';
  const wasVisited = visitedPairs?.some(p => p.i === node.id || p.j === node.id);

  if (isKilled) {
    return {
      background: '#1C0A0E',
      color: '#F87171',
      border: '1px solid #E11D48',
      borderRadius: '10px',
      padding: '10px 14px',
      fontSize: '11px',
      fontWeight: 'bold',
      width: '150px',
      textAlign: 'center',
      opacity: 0.6,
      transition: 'all 0.3s ease',
    };
  }

  switch (role) {
    case 'k':
      return {
        background: 'linear-gradient(135deg, #78350F, #F59E0B)',
        color: '#0F172A',
        border: '2px solid #F59E0B',
        borderRadius: '10px',
        padding: '10px 14px',
        fontSize: '11px',
        fontWeight: '900',
        width: '150px',
        textAlign: 'center',
        animation: 'nc-pulse-k 1s ease-in-out infinite',
        transition: 'all 0.3s ease',
      };
    case 'i':
      return {
        background: 'linear-gradient(135deg, #0C4A6E, #38BDF8)',
        color: '#0F172A',
        border: '2px solid #38BDF8',
        borderRadius: '10px',
        padding: '10px 14px',
        fontSize: '11px',
        fontWeight: '900',
        width: '150px',
        textAlign: 'center',
        animation: 'nc-pulse-i 1s ease-in-out infinite',
        transition: 'all 0.3s ease',
      };
    case 'j':
      return {
        background: 'linear-gradient(135deg, #2E1065, #a78bfa)',
        color: '#F8FAFC',
        border: '2px solid #a78bfa',
        borderRadius: '10px',
        padding: '10px 14px',
        fontSize: '11px',
        fontWeight: '900',
        width: '150px',
        textAlign: 'center',
        animation: 'nc-pulse-j 1s ease-in-out infinite',
        transition: 'all 0.3s ease',
      };
    default:
      return {
        background: wasVisited ? '#0F2A1F' : '#0F172A',
        color: wasVisited ? '#6EE7B7' : '#CBD5E1',
        border: wasVisited ? '1px solid #34D399' : '1px solid #334155',
        borderRadius: '10px',
        padding: '10px 14px',
        fontSize: '11px',
        fontWeight: 'bold',
        width: '150px',
        textAlign: 'center',
        transition: 'all 0.35s ease',
        opacity: wasVisited ? 0.9 : 0.75,
      };
  }
};

/* ─── Edge style factory ─────────────────────────────────────────────── */
const buildStyledEdges = (edges, traversedEdges, nodes, currentK, currentI, currentJ) =>
  edges.map(edge => {
    const role = getEdgeRole(edge.id, traversedEdges, nodes, edges, currentK, currentI, currentJ);
    const base = {
      ...edge,
      type: 'default',
      animated: false,
      style: {},
      labelStyle: { fill: '#94A3B8', fontSize: 10, fontWeight: 'bold' },
      labelBgStyle: { fill: '#0F172A', fillOpacity: 0.8 },
    };

    if (role === 'ik') {
      return {
        ...base,
        animated: true,
        style: { stroke: '#38BDF8', strokeWidth: 3 },
        className: 'nc-edge-ik',
        labelStyle: { fill: '#38BDF8', fontSize: 11, fontWeight: '900' },
      };
    }
    if (role === 'kj') {
      return {
        ...base,
        animated: true,
        style: { stroke: '#a78bfa', strokeWidth: 3 },
        className: 'nc-edge-kj',
        labelStyle: { fill: '#a78bfa', fontSize: 11, fontWeight: '900' },
      };
    }
    return base;
  });

/* ─── Step info badge ────────────────────────────────────────────────── */
const StepInfoBadge = ({ currentK, currentI, currentJ }) => {
  if (!currentK && !currentI && !currentJ) return null;
  return (
    <div style={{
      background: 'rgba(15,23,42,0.92)',
      border: '1px solid rgba(255,255,255,0.12)',
      borderRadius: '10px',
      padding: '12px 16px',
      minWidth: '200px',
      backdropFilter: 'blur(12px)',
    }}>
      <p style={{ color: '#64748B', fontSize: '9px', letterSpacing: '2px', marginBottom: '10px', textTransform: 'uppercase' }}>
        Current Step
      </p>
      {currentI && (
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
          <div style={{ width: 10, height: 10, borderRadius: '50%', background: '#38BDF8', boxShadow: '0 0 8px #38BDF8' }} />
          <span style={{ fontSize: '11px', color: '#CBD5E1' }}>
            <span style={{ color: '#38BDF8', fontWeight: 900 }}>SRC (i)</span>: {currentI}
          </span>
        </div>
      )}
      {currentK && (
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
          <div style={{ width: 10, height: 10, borderRadius: '50%', background: '#F59E0B', boxShadow: '0 0 8px #F59E0B' }} />
          <span style={{ fontSize: '11px', color: '#CBD5E1' }}>
            <span style={{ color: '#F59E0B', fontWeight: 900 }}>VIA (k)</span>: {currentK}
          </span>
        </div>
      )}
      {currentJ && (
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <div style={{ width: 10, height: 10, borderRadius: '50%', background: '#a78bfa', boxShadow: '0 0 8px #a78bfa' }} />
          <span style={{ fontSize: '11px', color: '#CBD5E1' }}>
            <span style={{ color: '#a78bfa', fontWeight: 900 }}>DST (j)</span>: {currentJ}
          </span>
        </div>
      )}
    </div>
  );
};

/* ─── Main component ─────────────────────────────────────────────────── */
const NetworkCanvas = () => {
  const { 
    nodes, edges, onNodesChange, onEdgesChange, onConnect, 
    addNode, setNodes, toggleNodeStatus, deleteNode, updateEdgeWeight,
    currentK, currentI, currentJ, traversedEdges, visitedPairs,
  } = useStore();

  const [newNodeName, setNewNodeName] = useState('');
  const [isLayouting, setIsLayouting] = useState(false);

  // ── Weight modal state ──
  const [modal, setModal] = useState({ visible: false, title: '', subtitle: '', initial: 10, mode: null, payload: null });

  // ── On-demand force layout (nodes stay wherever you drag them) ──
  const getNodes = useCallback(() => useStore.getState().nodes, []);
  const getEdges = useCallback(() => useStore.getState().edges, []);
  const { runLayout } = useForceLayout(getNodes, getEdges, setNodes, {
    strength: -500, linkDistance: 220, collideRadius: 100, centerX: 400, centerY: 300,
  });

  const onRelayout = () => {
    setIsLayouting(true);
    runLayout(1.0);
    setTimeout(() => setIsLayouting(false), 2000);
  };

  const onAddNode = () => {
    if (newNodeName.trim()) {
      addNode(newNodeName.trim(), 100 + Math.random() * 400, 100 + Math.random() * 300);
      setNewNodeName('');
    }
  };

  // ── New connection → open weight modal ──
  const pendingConnection = useRef(null);
  const handleConnect = useCallback((connection) => {
    pendingConnection.current = connection;
    const src = connection.source || '?';
    const tgt = connection.target || '?';
    setModal({ visible: true, title: 'New Link', subtitle: `${src} ↔ ${tgt}`, initial: 10, mode: 'connect', payload: connection });
  }, []);

  // ── Click edge → open edit weight modal ──
  const onEdgeClick = useCallback((event, edge) => {
    setModal({
      visible: true, title: 'Edit Link Weight',
      subtitle: `${edge.source} ↔ ${edge.target}`,
      initial: edge.data?.weight ?? 10, mode: 'edit', payload: edge,
    });
  }, []);

  // ── Modal confirm ──
  const onModalConfirm = useCallback((weight) => {
    if (modal.mode === 'connect' && modal.payload) {
      onConnect(modal.payload, weight);
    } else if (modal.mode === 'edit' && modal.payload) {
      updateEdgeWeight(modal.payload.id, weight);
    }
    setModal(m => ({ ...m, visible: false }));
  }, [modal, onConnect, updateEdgeWeight]);

  const onModalCancel = useCallback(() => setModal(m => ({ ...m, visible: false })), []);

  const onNodeDoubleClick = (event, node) => toggleNodeStatus(node.id);
  const onNodeContextMenu = (event, node) => {
    event.preventDefault();
    if (window.confirm(`Delete router "${node.id}"?`)) deleteNode(node.id);
  };

  const styledNodes = nodes.map(n => ({
    ...n,
    style: nodeStyles(n, currentK, currentI, currentJ, visitedPairs),
  }));

  const styledEdges = buildStyledEdges(edges, traversedEdges, nodes, currentK, currentI, currentJ);

  return (
    <div className="h-[620px] w-full bg-obsidian border border-white/10 rounded-xl overflow-hidden relative">
      <ReactFlow
        nodes={styledNodes}
        edges={styledEdges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={handleConnect}
        onEdgeClick={onEdgeClick}
        onNodeDoubleClick={onNodeDoubleClick}
        onNodeContextMenu={onNodeContextMenu}
        fitView
      >
        <Background color="#1E293B" gap={24} size={1.2} />
        <Controls />

        {/* ── Top-left: Add node + instructions ── */}
        <Panel position="top-left" style={{ background: 'rgba(15,23,42,0.88)', backdropFilter: 'blur(12px)', padding: '14px', borderRadius: '10px', border: '1px solid rgba(255,255,255,0.1)', minWidth: '200px' }}>
          <div style={{ display: 'flex', gap: 8, marginBottom: 10 }}>
            <input
              type="text"
              value={newNodeName}
              onChange={e => setNewNodeName(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && onAddNode()}
              placeholder="Router name…"
              style={{
                flex: 1, background: '#0F172A', border: '1px solid rgba(255,255,255,0.15)',
                borderRadius: 6, padding: '5px 10px', fontSize: 12, color: '#E2E8F0', outline: 'none',
              }}
            />
            <button onClick={onAddNode}
              style={{ background: '#38BDF8', borderRadius: 6, padding: '5px 10px', cursor: 'pointer', border: 'none', color: '#0F172A', fontWeight: 900 }}>
              <Plus size={16} />
            </button>
          </div>

          <button onClick={onRelayout}
            style={{
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
              width: '100%', background: 'rgba(56,189,248,0.12)', border: '1px solid rgba(56,189,248,0.3)',
              borderRadius: 6, padding: '6px 10px', fontSize: 10, color: '#38BDF8',
              cursor: 'pointer', fontWeight: 700, letterSpacing: '1px', textTransform: 'uppercase',
              marginBottom: 10, transition: 'all 0.2s ease',
            }}
            onMouseEnter={e => { e.currentTarget.style.background = 'rgba(56,189,248,0.22)'; }}
            onMouseLeave={e => { e.currentTarget.style.background = 'rgba(56,189,248,0.12)'; }}
          >
            <RefreshCw size={12} style={isLayouting ? { animation: 'nc-spin 0.6s linear infinite' } : {}} />
            Auto-Layout
          </button>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
            {[
              '⌥ Drag node       → Reposition freely',
              '⌥ Double-click     → Kill / Restore',
              '⌥ Right-click      → Delete',
              '⌥ Drag between     → Link (set weight)',
              '⌥ Click edge       → Edit weight',
            ].map(tip => (
              <p key={tip} style={{ fontSize: 9, color: '#64748B', letterSpacing: '1px', textTransform: 'uppercase' }}>{tip}</p>
            ))}
          </div>
        </Panel>

        <Panel position="top-right">
          <StepInfoBadge currentK={currentK} currentI={currentI} currentJ={currentJ} />
        </Panel>

        <Panel position="bottom-right" style={{ background: 'rgba(15,23,42,0.88)', backdropFilter: 'blur(12px)', padding: '12px 16px', borderRadius: '10px', border: '1px solid rgba(255,255,255,0.1)' }}>
          <p style={{ color: '#64748B', fontSize: '9px', letterSpacing: '2px', textTransform: 'uppercase', marginBottom: 8 }}>Legend</p>
          {[
            { color: '#38BDF8', label: 'Source node (i)', glow: true },
            { color: '#F59E0B', label: 'Intermediate (k)', glow: true },
            { color: '#a78bfa', label: 'Destination (j)', glow: true },
            { color: '#34D399', label: 'Visited node', glow: false },
            { color: '#E11D48', label: 'Killed / Broken', glow: false },
          ].map(({ color, label, glow }) => (
            <div key={label} style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
              <div style={{ width: 10, height: 10, borderRadius: '50%', background: color, boxShadow: glow ? `0 0 6px ${color}` : 'none' }} />
              <span style={{ fontSize: 10, color: '#94A3B8' }}>{label}</span>
            </div>
          ))}
        </Panel>
      </ReactFlow>

      {/* ── Weight modal overlay ── */}
      <WeightModal
        visible={modal.visible}
        title={modal.title}
        subtitle={modal.subtitle}
        initial={modal.initial}
        onConfirm={onModalConfirm}
        onCancel={onModalCancel}
      />
    </div>
  );
};

export default NetworkCanvas;

