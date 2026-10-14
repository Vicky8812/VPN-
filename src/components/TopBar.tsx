import React from 'react';
import { Shield, Lock, Unlock, Zap, Server } from 'lucide-react';

interface TopBarProps {
  currentTab: string;
  onSelectTab: (tab: string) => void;
  isVaultLocked: boolean;
  onToggleVaultLock: () => void;
  isTunnelConnected: boolean;
  activeNodeCity: string;
}

export const TopBar: React.FC<TopBarProps> = ({
  currentTab,
  onSelectTab,
  isVaultLocked,
  onToggleVaultLock,
  isTunnelConnected,
  activeNodeCity,
}) => {
  const navItems = [
    { id: 'tunnel', label: 'Tunnel Gateway' },
    { id: 'wireguard', label: 'WireGuard Profiles' },
    { id: 'dns-leak', label: 'DNS & Leak Test' },
    { id: 'nodes', label: 'Relay Nodes' },
    { id: 'audit', label: 'Security Audit' },
  ];

  return (
    <header className="sticky top-0 z-50 flex items-center justify-between gap-8 px-6 py-3.5 bg-slate-950/90 backdrop-blur-md border-b border-slate-800/80">
      {/* Zone 1: Brand Wordmark */}
      <div className="flex items-center gap-3 shrink-0">
        <div className="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
          <Shield className="w-4 h-4" />
        </div>
        <div className="flex items-baseline gap-2">
          <span className="text-base font-bold tracking-tight text-white whitespace-nowrap">
            AegisVPN
          </span>
          <span className="text-xs text-slate-400 font-mono hidden sm:inline">
            personal
          </span>
        </div>
      </div>

      {/* Zone 2: 4-5 Clean Nav Links */}
      <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-slate-400">
        {navItems.map((item) => {
          const isActive = currentTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onSelectTab(item.id)}
              className={`whitespace-nowrap transition-colors py-1 cursor-pointer relative ${
                isActive
                  ? 'text-emerald-400 font-semibold'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              {item.label}
              {isActive && (
                <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-emerald-400 rounded-full" />
              )}
            </button>
          );
        })}
      </nav>

      {/* Zone 3: 1 Primary Action */}
      <div className="flex items-center gap-3 shrink-0">
        <button
          onClick={onToggleVaultLock}
          className={`px-3.5 py-1.5 text-xs font-medium rounded-lg border transition-all duration-150 flex items-center gap-2 whitespace-nowrap cursor-pointer ${
            isVaultLocked
              ? 'bg-amber-500/10 border-amber-500/30 text-amber-400 hover:bg-amber-500/20'
              : 'bg-slate-900 border-slate-700 text-slate-300 hover:text-white hover:border-slate-600'
          }`}
          title={isVaultLocked ? 'Vault is Locked' : 'Lock Personal Vault'}
        >
          {isVaultLocked ? (
            <>
              <Lock className="w-3.5 h-3.5 text-amber-400" />
              <span>Unlock Vault</span>
            </>
          ) : (
            <>
              <Unlock className="w-3.5 h-3.5 text-slate-400" />
              <span>Lock Vault</span>
            </>
          )}
        </button>
      </div>
    </header>
  );
};
