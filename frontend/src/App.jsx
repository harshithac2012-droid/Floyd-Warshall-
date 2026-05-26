import React, { useState } from 'react';
import HeroSection from './components/HeroSection';
import IntroDrawer from './components/IntroDrawer';
import NetworkCanvas from './components/NetworkCanvas';
import DataDashboard from './components/DataDashboard';
import useStore from './store/useStore';
import { calculateRouting } from './api/client';
import { Play, StepForward, RotateCcw, Loader2 } from 'lucide-react';

function App() {
  const { nodes, edges, setResults, setCurrentK, setTraversalStep, resetTraversal } = useStore();
  const [isCalculating, setIsCalculating] = useState(false);
  const [steps, setSteps] = useState([]);
  const [currentStepIdx, setCurrentStepIdx] = useState(-1);

  const handleCalculate = async () => {
    setIsCalculating(true);
    try {
      const data = await calculateRouting(nodes, edges);
      setResults(data.distance_matrix, data.next_hop_matrix);
      setSteps(data.steps);
      setCurrentStepIdx(-1);
      resetTraversal();
    } catch (error) {
      console.error("Calculation failed", error);
      alert("Backend error: Make sure the FastAPI server is running on :8080");
    } finally {
      setIsCalculating(false);
    }
  };

  const handleNextStep = () => {
    if (currentStepIdx < steps.length - 1) {
      const nextIdx = currentStepIdx + 1;
      const step = steps[nextIdx];
      setCurrentStepIdx(nextIdx);
      setTraversalStep(step.k, step.i, step.j);
      
      // Update local distance matrix incrementally for visualization
      useStore.setState((state) => {
        const newDist = { ...state.distanceMatrix };
        if (!newDist[step.i]) newDist[step.i] = {};
        newDist[step.i][step.j] = step.new_dist;
        return { distanceMatrix: newDist };
      });
    }
  };

  const handleReset = () => {
    setCurrentStepIdx(-1);
    resetTraversal();
    setResults({}, {});
    setSteps([]);
  };

  return (
    <div className="min-h-screen bg-obsidian text-white font-mono">
      <HeroSection />
      <IntroDrawer />
      
      <main className="max-w-7xl mx-auto px-6 py-12 space-y-12">
        <section className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold border-l-4 border-cobalt pl-4">NETWORK TOPOLOGY</h2>
            <div className="flex gap-4">
              <button 
                onClick={handleReset}
                className="flex items-center gap-2 px-4 py-2 rounded-lg border border-white/10 hover:bg-white/5 transition-colors"
              >
                <RotateCcw size={18} /> RESET
              </button>
              <button 
                onClick={handleCalculate}
                disabled={isCalculating}
                className="flex items-center gap-2 bg-cobalt hover:bg-cobalt/80 text-obsidian px-6 py-2 rounded-lg font-bold transition-colors disabled:opacity-50"
              >
                {isCalculating ? <Loader2 className="animate-spin" size={18} /> : <Play size={18} />}
                EXECUTE FLOYD-WARSHALL
              </button>
            </div>
          </div>

          <NetworkCanvas />
          
          {steps.length > 0 && (
            <div className="flex items-center justify-center gap-4 bg-white/5 p-4 rounded-xl border border-white/10">
              <span className="text-sm text-gray-400">ALGORITHM STEP-THROUGH: {currentStepIdx + 1} / {steps.length}</span>
              <button 
                onClick={handleNextStep}
                disabled={currentStepIdx >= steps.length - 1}
                className="flex items-center gap-2 bg-amberGold hover:bg-amberGold/80 text-obsidian px-4 py-1 rounded-lg font-bold transition-colors disabled:opacity-50"
              >
                <StepForward size={18} /> STEP
              </button>
            </div>
          )}
        </section>

        <section className="space-y-6">
          <h2 className="text-2xl font-bold border-l-4 border-emeraldSuccess pl-4">REAL-TIME DATA ENGINE</h2>
          <DataDashboard />
        </section>
      </main>

      <footer className="py-12 border-t border-white/5 text-center text-gray-500 text-sm">
        <p>© 2025 MISSION CONTROL | DESIGNED FOR SENIOR ARCHITECTS</p>
      </footer>
    </div>
  );
}

export default App;
