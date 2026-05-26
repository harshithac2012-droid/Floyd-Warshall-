import { useRef, useCallback } from 'react';
import {
  forceSimulation,
  forceLink,
  forceManyBody,
  forceCollide,
  forceX,
  forceY,
} from 'd3-force';

/**
 * On-demand force-directed layout hook for ReactFlow.
 *
 * The simulation does NOT run automatically — it only fires when you
 * call `runLayout()`.  This means users can freely drag nodes around
 * without the simulation snapping them back.
 *
 * @param {Function} getNodes  – returns current ReactFlow nodes
 * @param {Function} getEdges  – returns current ReactFlow edges
 * @param {Function} setNodes  – function-based node setter
 * @param {Object}   options   – tuning knobs
 */
export default function useForceLayout(
  getNodes,
  getEdges,
  setNodes,
  {
    strength      = -500,
    linkDistance   = 200,
    collideRadius = 100,
    centerX       = 400,
    centerY       = 300,
    alphaDecay    = 0.028,
    velocityDecay = 0.4,
  } = {}
) {
  const rafId     = useRef(null);
  const simRef    = useRef(null);

  /**
   * Run / re-run the force layout from scratch.
   * Nodes animate smoothly to their computed positions via rAF.
   */
  const runLayout = useCallback((alpha = 1.0) => {
    // Cancel any previous animation
    if (rafId.current) cancelAnimationFrame(rafId.current);
    if (simRef.current) simRef.current.stop();

    const nodes = typeof getNodes === 'function' ? getNodes() : getNodes;
    const edges = typeof getEdges === 'function' ? getEdges() : getEdges;

    if (!nodes.length) return;

    // Build d3 simulation nodes from current positions
    const simNodes = nodes.map(n => ({
      id: n.id,
      x: n.position?.x ?? Math.random() * 600,
      y: n.position?.y ?? Math.random() * 400,
    }));

    // Build links with weights
    const simLinks = edges.map(e => ({
      source: e.source,
      target: e.target,
      weight: e.data?.weight ?? 10,
    }));

    // Scale link distance proportionally to weight
    const baseWeight = Math.min(...simLinks.map(l => l.weight), 10) || 10;
    const distanceFn = (link) => {
      const ratio = (link.weight || baseWeight) / baseWeight;
      return linkDistance * ratio;
    };

    const sim = forceSimulation(simNodes)
      .force('charge',  forceManyBody().strength(strength))
      .force('link',    forceLink(simLinks).id(d => d.id).distance(distanceFn).strength(0.5))
      .force('collide', forceCollide(collideRadius))
      .force('centerX', forceX(centerX).strength(0.05))
      .force('centerY', forceY(centerY).strength(0.05))
      .alphaDecay(alphaDecay)
      .velocityDecay(velocityDecay)
      .alpha(alpha);

    sim.stop(); // we drive via rAF
    simRef.current = sim;

    const tick = () => {
      sim.tick();

      const simN = sim.nodes();
      const posMap = {};
      simN.forEach(sn => { posMap[sn.id] = { x: sn.x, y: sn.y }; });

      setNodes(prev =>
        prev.map(n => {
          const p = posMap[n.id];
          if (!p) return n;
          const dx = Math.abs((n.position?.x ?? 0) - p.x);
          const dy = Math.abs((n.position?.y ?? 0) - p.y);
          if (dx < 0.5 && dy < 0.5) return n;
          return { ...n, position: { x: p.x, y: p.y } };
        })
      );

      if (sim.alpha() > sim.alphaMin()) {
        rafId.current = requestAnimationFrame(tick);
      }
    };

    rafId.current = requestAnimationFrame(tick);
  }, [getNodes, getEdges, setNodes, strength, linkDistance, collideRadius, centerX, centerY, alphaDecay, velocityDecay]);

  return { runLayout };
}
