import React from 'react';
import useStore from '../store/useStore';
import { Activity, Map, ArrowRightLeft } from 'lucide-react';

const DataDashboard = () => {
  const { nodes, distanceMatrix, nextHopMatrix, resilienceScore } = useStore();
  const nodeIds = nodes.map(n => n.id);

  const getHeatmapColor = (val) => {
    if (val === 0) return 'bg-obsidian';
    if (val === 'Infinity') return 'bg-rosewood/20 text-rosewood';
    if (val < 20) return 'bg-emeraldSuccess/20 text-emeraldSuccess';
    if (val < 50) return 'bg-cobalt/20 text-cobalt';
    return 'bg-amberGold/20 text-amberGold';
  };

  return (
    <div className="space-y-6">
      {/* Resilience Score */}
      <div className="bg-white/5 border border-white/10 rounded-xl p-6 backdrop-blur-md">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Activity className="text-cobalt" size={20} />
            <h3 className="text-lg font-bold tracking-tight">NETWORK RESILIENCE</h3>
          </div>
          <span className={`text-2xl font-mono font-bold ${resilienceScore > 70 ? 'text-emeraldSuccess' : (resilienceScore > 40 ? 'text-amberGold' : 'text-rosewood')}`}>
            {resilienceScore}%
          </span>
        </div>
        <div className="w-full bg-white/10 h-2 rounded-full overflow-hidden">
          <div 
            className={`h-full transition-all duration-500 ${resilienceScore > 70 ? 'bg-emeraldSuccess' : (resilienceScore > 40 ? 'bg-amberGold' : 'bg-rosewood')}`}
            style={{ width: `${resilienceScore}%` }}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Distance Matrix */}
        <div className="bg-white/5 border border-white/10 rounded-xl p-6 backdrop-blur-md overflow-x-auto">
          <div className="flex items-center gap-2 mb-6">
            <Map className="text-amberGold" size={20} />
            <h3 className="text-lg font-bold tracking-tight uppercase">Latency Matrix (ms)</h3>
          </div>
          <table className="w-full text-left border-collapse">
            <thead>
              <tr>
                <th className="p-2 border-b border-white/10 text-[10px] text-gray-400 font-mono">FROM \ TO</th>
                {nodeIds.map(id => (
                  <th key={id} className="p-2 border-b border-white/10 text-[10px] text-gray-400 font-mono truncate max-w-[80px]">{id}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {nodeIds.map(rowId => (
                <tr key={rowId}>
                  <td className="p-2 border-r border-white/10 text-[10px] font-mono text-cobalt truncate max-w-[80px]">{rowId}</td>
                  {nodeIds.map(colId => {
                    const val = distanceMatrix[rowId]?.[colId] ?? '-';
                    return (
                      <td key={colId} className={`p-2 text-xs font-mono border border-white/5 transition-colors duration-500 ${getHeatmapColor(val)}`}>
                        {val}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Next-Hop Matrix */}
        <div className="bg-white/5 border border-white/10 rounded-xl p-6 backdrop-blur-md overflow-x-auto">
          <div className="flex items-center gap-2 mb-6">
            <ArrowRightLeft className="text-emeraldSuccess" size={20} />
            <h3 className="text-lg font-bold tracking-tight uppercase">Next-Hop Routing</h3>
          </div>
          <table className="w-full text-left border-collapse">
            <thead>
              <tr>
                <th className="p-2 border-b border-white/10 text-[10px] text-gray-400 font-mono">SRC \ DST</th>
                {nodeIds.map(id => (
                  <th key={id} className="p-2 border-b border-white/10 text-[10px] text-gray-400 font-mono truncate max-w-[80px]">{id}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {nodeIds.map(rowId => (
                <tr key={rowId}>
                  <td className="p-2 border-r border-white/10 text-[10px] font-mono text-cobalt truncate max-w-[80px]">{rowId}</td>
                  {nodeIds.map(colId => {
                    const val = nextHopMatrix[rowId]?.[colId] ?? '-';
                    return (
                      <td key={colId} className="p-2 text-xs font-mono border border-white/5 text-gray-300">
                        {val === 'None' ? '×' : (val === '-' ? '-' : val)}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default DataDashboard;
