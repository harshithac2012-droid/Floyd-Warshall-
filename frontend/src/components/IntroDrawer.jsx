import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Info, X, ArrowRight, Network } from 'lucide-react';

const IntroDrawer = () => {
  const [isOpen, setIsOpen] = useState(true);

  return (
    <>
      <button 
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 bg-cobalt hover:bg-cobalt/80 p-4 rounded-full shadow-lg z-40 transition-colors"
      >
        <Info className="text-obsidian" size={24} />
      </button>

      <AnimatePresence>
        {isOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsOpen(false)}
              className="absolute inset-0 bg-obsidian/80 backdrop-blur-sm"
            />
            
            <motion.div 
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className="bg-[#1e293b] border border-cobalt/30 p-8 rounded-2xl max-w-2xl w-full relative overflow-hidden"
            >
              <button 
                onClick={() => setIsOpen(false)}
                className="absolute top-4 right-4 text-gray-400 hover:text-white transition-colors"
              >
                <X size={24} />
              </button>

              <h2 className="text-3xl font-bold mb-6 flex items-center gap-3">
                <Network className="text-cobalt" />
                Floyd-Warshall Intelligence
              </h2>

              <div className="space-y-6">
                <div className="relative h-40 bg-obsidian/50 rounded-xl flex items-center justify-center p-4 border border-white/5">
                  {/* Packet Animation Concept Simulation */}
                  <div className="flex items-center gap-12">
                    <motion.div 
                      className="w-4 h-4 bg-cobalt rounded-full"
                      animate={{ x: [0, 200, 0] }}
                      transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                    />
                    <div className="absolute top-1/2 left-1/4 w-1/2 h-[2px] bg-white/10 -z-10" />
                    <div className="absolute top-1/3 left-1/2 -translate-x-1/2 text-[10px] text-amberGold font-mono">LONG ROUTE (LATENCY: 50ms)</div>
                    <div className="absolute bottom-1/3 left-1/2 -translate-x-1/2 text-[10px] text-emeraldSuccess font-mono">SHORTCUT FOUND! (LATENCY: 12ms)</div>
                  </div>
                </div>

                <p className="text-gray-300 leading-relaxed">
                  <span className="text-cobalt font-bold">Floyd-Warshall</span> is an All-Pairs Shortest Path algorithm. 
                  It doesn't just find one path; it builds a global intelligence map, checking every router 
                  <span className="text-amberGold font-mono mx-1">(k)</span> to see if it can optimize the connection 
                  between every other pair <span className="text-emeraldSuccess font-mono mx-1">(i,j)</span>.
                </p>

                <div className="bg-white/5 p-4 rounded-lg border-l-4 border-cobalt">
                  <p className="text-sm font-mono text-cobalt mb-1">RECURRENCE RELATION</p>
                  <p className="text-lg font-mono">D[i][j] = min(D[i][j], D[i][k] + D[k][j])</p>
                </div>

                <button 
                  onClick={() => setIsOpen(false)}
                  className="w-full bg-cobalt hover:bg-cobalt/80 text-obsidian font-bold py-3 rounded-lg flex items-center justify-center gap-2 transition-colors"
                >
                  ENTER MISSION CONTROL <ArrowRight size={20} />
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
};

export default IntroDrawer;
