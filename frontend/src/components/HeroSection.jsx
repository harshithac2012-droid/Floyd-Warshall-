import React from 'react';
import { Shield, Zap, Activity } from 'lucide-react';

const HeroSection = () => {
  return (
    <div className="bg-obsidian py-12 px-6 border-b border-cobalt/20">
      <div className="max-w-7xl mx-auto text-center">
        <h1 className="text-5xl md:text-7xl font-bold mb-6 bg-gradient-to-r from-cobalt to-emeraldSuccess bg-clip-text text-transparent">
          MISSION CONTROL
        </h1>
        <p className="text-xl md:text-2xl text-gray-400 max-w-3xl mx-auto mb-10">
          Professional-Grade Network Routing Visualizer powered by the Floyd-Warshall Algorithm. 
          Build, optimize, and stress-test your global intelligence map.
        </p>
        <div className="flex flex-wrap justify-center gap-8">
          <div className="flex items-center gap-3 bg-white/5 backdrop-blur-md px-6 py-3 rounded-full border border-white/10">
            <Shield className="text-cobalt" size={24} />
            <span className="text-sm font-mono tracking-wider">RESILIENT ARCHITECTURE</span>
          </div>
          <div className="flex items-center gap-3 bg-white/5 backdrop-blur-md px-6 py-3 rounded-full border border-white/10">
            <Zap className="text-amberGold" size={24} />
            <span className="text-sm font-mono tracking-wider">O(V³) OPTIMIZATION</span>
          </div>
          <div className="flex items-center gap-3 bg-white/5 backdrop-blur-md px-6 py-3 rounded-full border border-white/10">
            <Activity className="text-emeraldSuccess" size={24} />
            <span className="text-sm font-mono tracking-wider">LIVE TRAFFIC ANALYSIS</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HeroSection;
