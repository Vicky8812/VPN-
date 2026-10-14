import React, { useState } from 'react';
import { 
  Server, 
  MapPin, 
  Cpu, 
  ShieldCheck, 
  Zap, 
  Check, 
  ArrowRight, 
  RefreshCw,
  Globe
} from 'lucide-react';
import type { RelayNode } from '../types';

interface RelayNodesProps {
  nodes: RelayNode[];
  activeNode: RelayNode;
  onSelectNode: (node: RelayNode) => void;
}

export const RelayNodes: React.FC<RelayNodesProps> = ({
  nodes,
  activeNode,
  onSelectNode,
}) => {
  const [pingPings, setPingPings] = useState<Record<string, number>>({});
  const [isPinging, setIsPinging] = useState(false);

  const handleTestPings = () => {
    setIsPinging(true);
    setTimeout(() => {
      const results: Record<string, number> = {};
      nodes.forEach((n) => {
        // slight jitter
        results[n.id] = Math.max(5, n.pingBase + Math.floor(Math.random() * 8) - 4);
      });
      setPingPings(results);
      setIsPinging(false);
    }, 600);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-6 bg-slate-900 border border-slate-800 rounded-2xl">
        <div>
          <div className="flex items-center gap-2 text-xs font-mono text-emerald-400 uppercase tracking-wider">
            <Server className="w-3.5 h-3.5" />
            <span>Dedicated Personal Cluster</span>
          </div>
          <h2 className="text-xl font-bold text-white mt-1">
            Global Relay Node Infrastructure
          </h2>
          <p className="text-xs text-slate-400 mt-1 max-w-xl">
            Bare-metal, diskless RAM-only gateway nodes running ephemeral Linux kernels. No user logs or connection records can be written to physical storage.
          </p>
        </div>

        <button
          onClick={handleTestPings}
          disabled={isPinging}
          className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-xl border border-slate-700 font-medium text-xs flex items-center gap-2 transition-colors cursor-pointer shrink-0"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isPinging ? 'animate-spin' : ''}`} />
          <span>Ping All Nodes</span>
        </button>
      </div>

      {/* Nodes Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {nodes.map((node) => {
          const isActive = activeNode.id === node.id;
          const currentPing = pingPings[node.id] || node.pingBase;

          return (
            <div
              key={node.id}
              className={`p-5 rounded-2xl border transition-all duration-200 flex flex-col justify-between relative overflow-hidden ${
                isActive
                  ? 'bg-slate-900/90 border-emerald-500/50 shadow-lg shadow-emerald-950/20'
                  : 'bg-slate-900/60 border-slate-800 hover:border-slate-700'
              }`}
            >
              <div>
                {/* Node Title & Flag */}
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <span className="text-2xl" role="img" aria-label={node.country}>
                      {node.flag}
                    </span>
                    <div>
                      <h3 className="text-sm font-bold text-white leading-snug">
                        {node.name}
                      </h3>
                      <div className="text-xs text-slate-400 font-mono mt-0.5 flex items-center gap-1.5">
                        <MapPin className="w-3 h-3 text-slate-500" />
                        <span>{node.city}, {node.country}</span>
                      </div>
                    </div>
                  </div>

                  {isActive && (
                    <span className="px-2 py-0.5 rounded-md bg-emerald-500/20 text-emerald-400 text-[10px] font-mono font-bold uppercase tracking-wider shrink-0">
                      Active
                    </span>
                  )}
                </div>

                {/* Specs */}
                <div className="mt-4 pt-4 border-t border-slate-800/80 space-y-2 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-500 font-mono text-[11px]">Latency:</span>
                    <span className="font-mono text-emerald-400 font-semibold tabular-nums">
                      {currentPing} ms
                    </span>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-slate-500 font-mono text-[11px]">Hardware Uplink:</span>
                    <span className="font-mono text-slate-300 text-[11px]">
                      {node.uplink}
                    </span>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-slate-500 font-mono text-[11px]">Legal Shield:</span>
                    <span className="text-slate-300 text-[11px] truncate max-w-[150px]">
                      {node.jurisdiction}
                    </span>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-slate-500 font-mono text-[11px]">Gateway IP:</span>
                    <span className="font-mono text-slate-400 text-[11px]">
                      {node.publicIp}
                    </span>
                  </div>
                </div>

                {/* Protocol Tags */}
                <div className="mt-3.5 flex flex-wrap gap-1.5">
                  {node.protocols.map((proto) => (
                    <span
                      key={proto}
                      className="px-2 py-0.5 rounded-md bg-slate-950 border border-slate-800 text-[10px] font-mono text-slate-400"
                    >
                      {proto}
                    </span>
                  ))}
                </div>
              </div>

              {/* Action */}
              <div className="mt-5 pt-4 border-t border-slate-800">
                <button
                  onClick={() => onSelectNode(node)}
                  disabled={isActive}
                  className={`w-full py-2 px-3 rounded-xl text-xs font-semibold transition-colors flex items-center justify-center gap-1.5 cursor-pointer ${
                    isActive
                      ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 cursor-default'
                      : 'bg-slate-800 hover:bg-slate-700 text-white'
                  }`}
                >
                  {isActive ? (
                    <>
                      <Check className="w-3.5 h-3.5" />
                      <span>Current Active Exit</span>
                    </>
                  ) : (
                    <>
                      <span>Route Traffic Through {node.city}</span>
                      <ArrowRight className="w-3 h-3" />
                    </>
                  )}
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
