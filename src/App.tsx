import React, { useState, useEffect, useRef } from 'react';
import { TopBar } from './components/TopBar';
import { VaultGate } from './components/VaultGate';
import { TunnelBrowser } from './components/TunnelBrowser';
import { WireGuardGenerator } from './components/WireGuardGenerator';
import { DnsLeakTest } from './components/DnsLeakTest';
import { RelayNodes } from './components/RelayNodes';
import { SecurityAudit } from './components/SecurityAudit';
import type { RelayNode, IPTelemetry, ConnectionState } from './types';
import { Wifi, WifiOff, RefreshCw, CheckCircle2, ShieldAlert, X } from 'lucide-react';

// Default Fallback Nodes
const DEFAULT_NODES: RelayNode[] = [
  {
    id: 'ch-zurich-01',
    name: 'Zurich Vault (Swiss Privacy)',
    country: 'Switzerland',
    countryCode: 'CH',
    flag: '🇨🇭',
    city: 'Zurich',
    endpoint: 'ch-zurich.aegisvpn.internal:51820',
    publicIp: '185.148.3.45',
    pingBase: 18,
    uplink: '10 Gbps RAM-Only',
    jurisdiction: 'Swiss FADP (Non-14-Eyes)',
    protocols: ['WireGuard', 'OpenVPN', 'Shadowsocks-2022'],
    serverPublicKey: 'rZ8U3zW0oD1iKj2hF3gX6lP9vM8nB4qA7tE1yU5oI4w=',
  },
  {
    id: 'is-reykjavik-01',
    name: 'Reykjavik Offshore Haven',
    country: 'Iceland',
    countryCode: 'IS',
    flag: '🇮🇸',
    city: 'Reykjavik',
    endpoint: 'is-reyk.aegisvpn.internal:51820',
    publicIp: '82.221.139.12',
    pingBase: 29,
    uplink: '10 Gbps RAM-Only',
    jurisdiction: 'Icelandic Media & Privacy Protection',
    protocols: ['WireGuard', 'OpenVPN', 'VLESS-Reality'],
    serverPublicKey: 'mK9bV4cT7yU1oP3eR5aW8zX2qI6dG0hF4jL7nB9sD1e=',
  },
  {
    id: 'de-frankfurt-01',
    name: 'Frankfurt DE-CIX Backbone',
    country: 'Germany',
    countryCode: 'DE',
    flag: '🇩🇪',
    city: 'Frankfurt',
    endpoint: 'de-fra.aegisvpn.internal:51820',
    publicIp: '194.135.24.89',
    pingBase: 12,
    uplink: '25 Gbps High-Throughput',
    jurisdiction: 'EU GDPR Stronghold',
    protocols: ['WireGuard', 'OpenVPN', 'Shadowsocks-2022'],
    serverPublicKey: 'aP4kL7mN9bV2cX5zQ8wE1rT3yU6iO0pA2sD4fG6hJ8k=',
  },
  {
    id: 'jp-tokyo-01',
    name: 'Tokyo Cloud Anchor',
    country: 'Japan',
    countryCode: 'JP',
    flag: '🇯🇵',
    city: 'Tokyo',
    endpoint: 'jp-tyo.aegisvpn.internal:51820',
    publicIp: '133.242.18.77',
    pingBase: 8,
    uplink: '10 Gbps Low-Latency',
    jurisdiction: 'APPI Privacy Standards',
    protocols: ['WireGuard', 'OpenVPN', 'Shadowsocks-2022'],
    serverPublicKey: 'vB8nN1mQ4wE7rT0yU3iO6pA9sD2fG5hJ8kL1zX4cV7b=',
  },
  {
    id: 'sg-singapore-01',
    name: 'Singapore Equinix SG1',
    country: 'Singapore',
    countryCode: 'SG',
    flag: '🇸🇬',
    city: 'Singapore',
    endpoint: 'sg-sin.aegisvpn.internal:51820',
    publicIp: '103.253.144.20',
    pingBase: 35,
    uplink: '10 Gbps RAM-Only',
    jurisdiction: 'PDPA Compliant Routing',
    protocols: ['WireGuard', 'OpenVPN', 'VLESS-Reality'],
    serverPublicKey: 'xZ3cV6bN9mQ2wE5rT8yU1iO4pA7sD0fG3hJ6kL9zX2c=',
  },
  {
    id: 'us-oregon-01',
    name: 'Oregon Silicon Forest',
    country: 'United States',
    countryCode: 'US',
    flag: '🇺🇸',
    city: 'The Dalles',
    endpoint: 'us-pdx.aegisvpn.internal:51820',
    publicIp: '198.51.100.42',
    pingBase: 42,
    uplink: '20 Gbps Direct Peer',
    jurisdiction: 'Zero-Logs Ramdisk Architecture',
    protocols: ['WireGuard', 'OpenVPN', 'Shadowsocks-2022'],
    serverPublicKey: 'qW7eR0tY3uI6oP9aS2dF5gH8jK1lZ4xC7vB0nN3mQ6w=',
  },
];

export default function App() {
  const [currentTab, setCurrentTab] = useState('tunnel');
  const [nodes, setNodes] = useState<RelayNode[]>(DEFAULT_NODES);
  const [activeNode, setActiveNode] = useState<RelayNode>(DEFAULT_NODES[0]);
  const [telemetry, setTelemetry] = useState<IPTelemetry | null>(null);
  
  // Connection state & auto-connect
  const [isTunnelConnected, setIsTunnelConnected] = useState(true);
  const [connectionState, setConnectionState] = useState<ConnectionState>('connected');
  const [autoConnectEnabled, setAutoConnectEnabled] = useState<boolean>(() => {
    return localStorage.getItem('aegis_autoconnect') !== 'false';
  });
  const [isOnline, setIsOnline] = useState<boolean>(() => {
    return typeof navigator !== 'undefined' ? navigator.onLine : true;
  });
  const [networkAlert, setNetworkAlert] = useState<{
    id: number;
    message: string;
    type: 'success' | 'warning' | 'info';
  } | null>(null);

  const [killSwitchEnabled, setKillSwitchEnabled] = useState(true);

  // Vault security state
  const [isVaultConfigured, setIsVaultConfigured] = useState(false);
  const [isVaultLocked, setIsVaultLocked] = useState(false);

  // Ref to track latest active node in event listeners
  const activeNodeRef = useRef(activeNode);
  useEffect(() => {
    activeNodeRef.current = activeNode;
  }, [activeNode]);

  // Check stored vault password hash
  useEffect(() => {
    const storedHash = localStorage.getItem('aegis_vault_hash');
    if (storedHash) {
      setIsVaultConfigured(true);
      setIsVaultLocked(true);
    } else {
      setIsVaultConfigured(false);
      setIsVaultLocked(false);
    }
  }, []);

  // Fetch nodes and IP telemetry from backend
  useEffect(() => {
    fetch('/api/nodes')
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data && data.nodes && data.nodes.length > 0) {
          setNodes(data.nodes);
          setActiveNode(data.nodes[0]);
        }
      })
      .catch((err) => console.log('Using local fallback nodes', err));

    fetch('/api/ip-info')
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data) {
          setTelemetry(data);
        }
      })
      .catch((err) => console.log('IP telemetry unavailable', err));
  }, []);

  // Establish / Handshake Tunnel connection
  const establishTunnel = async (isAuto = false) => {
    setConnectionState(isAuto ? 'reconnecting' : 'connecting');
    try {
      // Simulate real Curve25519 handshake against backend node
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 4000);
      await fetch(`/api/speedtest/ping?nodeId=${activeNodeRef.current.id}`, { signal: controller.signal });
      clearTimeout(timeout);

      setIsTunnelConnected(true);
      setConnectionState('connected');

      if (isAuto) {
        setNetworkAlert({
          id: Date.now(),
          message: `Network restored · Auto-connect re-established tunnel via ${activeNodeRef.current.name}`,
          type: 'success',
        });
      }
    } catch {
      // If error or offline, fallback
      setIsTunnelConnected(false);
      setConnectionState('disconnected');
    }
  };

  // 1. Initial Load Auto-Connect
  useEffect(() => {
    if (autoConnectEnabled && isOnline) {
      establishTunnel(false);
    }
  }, [autoConnectEnabled]);

  // 2. Network Transitions (Offline -> Online & Online -> Offline)
  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      if (autoConnectEnabled) {
        setNetworkAlert({
          id: Date.now(),
          message: 'Network connection detected. Auto-connecting to encrypted relay...',
          type: 'info',
        });
        establishTunnel(true);
      } else {
        setNetworkAlert({
          id: Date.now(),
          message: 'Network connection restored. Auto-connect is disabled.',
          type: 'info',
        });
      }
    };

    const handleOffline = () => {
      setIsOnline(false);
      setIsTunnelConnected(false);
      setConnectionState('disconnected');
      setNetworkAlert({
        id: Date.now(),
        message: 'Network offline. Outbound sockets halted by Kill Switch to prevent cleartext leakage.',
        type: 'warning',
      });
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [autoConnectEnabled]);

  // Auto-dismiss alert after 6 seconds
  useEffect(() => {
    if (networkAlert && networkAlert.type === 'success') {
      const timer = setTimeout(() => {
        setNetworkAlert(null);
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [networkAlert]);

  const handleToggleAutoConnect = () => {
    const nextVal = !autoConnectEnabled;
    setAutoConnectEnabled(nextVal);
    localStorage.setItem('aegis_autoconnect', String(nextVal));
    setNetworkAlert({
      id: Date.now(),
      message: nextVal
        ? 'Auto-Connect enabled: The tunnel will automatically restore on app load and network transitions.'
        : 'Auto-Connect disabled: Manual connection required after network interruption.',
      type: 'info',
    });
  };

  const handleToggleConnect = () => {
    if (isTunnelConnected) {
      setIsTunnelConnected(false);
      setConnectionState('disconnected');
    } else {
      establishTunnel(false);
    }
  };

  // Simulate network toggle for testing
  const handleSimulateNetworkToggle = () => {
    if (isOnline) {
      window.dispatchEvent(new Event('offline'));
    } else {
      window.dispatchEvent(new Event('online'));
    }
  };

  const handleSetupVault = (passphrase: string) => {
    const simpleHash = btoa(unescape(encodeURIComponent(passphrase + '_aegis_personal_salt')));
    localStorage.setItem('aegis_vault_hash', simpleHash);
    setIsVaultConfigured(true);
    setIsVaultLocked(false);
  };

  const handleUnlockVault = (passphrase: string) => {
    const expected = localStorage.getItem('aegis_vault_hash');
    const inputHash = btoa(unescape(encodeURIComponent(passphrase + '_aegis_personal_salt')));
    if (expected === inputHash) {
      setIsVaultLocked(false);
      // If auto-connect is enabled, ensure tunnel connects upon unlock
      if (autoConnectEnabled && isOnline) {
        establishTunnel(false);
      }
      return true;
    }
    return false;
  };

  const handleToggleVaultLock = () => {
    if (!isVaultLocked) {
      setIsVaultLocked(true);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-emerald-500/20 selection:text-emerald-300">
      {/* Top Navigation conforming to Top Bar Contract */}
      <TopBar
        currentTab={currentTab}
        onSelectTab={(tab) => {
          if (!isVaultLocked) setCurrentTab(tab);
        }}
        isVaultLocked={isVaultLocked}
        onToggleVaultLock={handleToggleVaultLock}
        isTunnelConnected={isTunnelConnected}
        activeNodeCity={activeNode.city}
      />

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 md:py-8 space-y-4">
        {/* Network & Auto-Connect Notification Banner */}
        {networkAlert && (
          <div
            className={`p-3.5 rounded-xl border flex items-center justify-between gap-3 text-xs animate-in fade-in slide-in-from-top-1 duration-200 ${
              networkAlert.type === 'success'
                ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300'
                : networkAlert.type === 'warning'
                ? 'bg-amber-500/10 border-amber-500/30 text-amber-300'
                : 'bg-slate-900 border-slate-800 text-slate-300'
            }`}
          >
            <div className="flex items-center gap-2.5">
              {networkAlert.type === 'success' && <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />}
              {networkAlert.type === 'warning' && <ShieldAlert className="w-4 h-4 text-amber-400 shrink-0" />}
              {networkAlert.type === 'info' && <RefreshCw className="w-4 h-4 text-cyan-400 shrink-0 animate-spin" />}
              <span className="font-medium">{networkAlert.message}</span>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={handleSimulateNetworkToggle}
                className="px-2 py-0.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white font-mono text-[10px] transition-colors cursor-pointer"
                title="Test network online/offline transition event"
              >
                {isOnline ? 'Simulate Drop' : 'Simulate Reconnect'}
              </button>

              <button
                onClick={() => setNetworkAlert(null)}
                className="p-1 hover:text-white transition-colors cursor-pointer"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        )}

        {isVaultLocked ? (
          <VaultGate
            isConfigured={isVaultConfigured}
            onUnlock={handleUnlockVault}
            onSetup={handleSetupVault}
          />
        ) : (
          <>
            {currentTab === 'tunnel' && (
              <TunnelBrowser
                activeNode={activeNode}
                nodes={nodes}
                onSelectNode={(node) => setActiveNode(node)}
                telemetry={telemetry}
                isConnected={isTunnelConnected}
                connectionState={connectionState}
                autoConnectEnabled={autoConnectEnabled}
                onToggleAutoConnect={handleToggleAutoConnect}
                isOnline={isOnline}
                onToggleConnect={handleToggleConnect}
                killSwitchEnabled={killSwitchEnabled}
              />
            )}

            {currentTab === 'wireguard' && (
              <WireGuardGenerator
                nodes={nodes}
                activeNode={activeNode}
                onSelectNode={(node) => setActiveNode(node)}
              />
            )}

            {currentTab === 'dns-leak' && (
              <DnsLeakTest
                killSwitchEnabled={killSwitchEnabled}
                onToggleKillSwitch={() => setKillSwitchEnabled(!killSwitchEnabled)}
                isTunnelConnected={isTunnelConnected}
              />
            )}

            {currentTab === 'nodes' && (
              <RelayNodes
                nodes={nodes}
                activeNode={activeNode}
                onSelectNode={(node) => setActiveNode(node)}
              />
            )}

            {currentTab === 'audit' && <SecurityAudit />}
          </>
        )}
      </main>

      {/* Mobile Bottom Navigation Bar */}
      {!isVaultLocked && (
        <div className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-slate-950/95 border-t border-slate-800/90 px-3 py-2 flex items-center justify-around backdrop-blur-lg">
          {[
            { id: 'tunnel', label: 'Tunnel' },
            { id: 'wireguard', label: 'Keys' },
            { id: 'dns-leak', label: 'DNS' },
            { id: 'nodes', label: 'Nodes' },
            { id: 'audit', label: 'Audit' },
          ].map((item) => (
            <button
              key={item.id}
              onClick={() => setCurrentTab(item.id)}
              className={`px-3 py-1 text-xs font-semibold rounded-lg transition-colors cursor-pointer ${
                currentTab === item.id
                  ? 'text-emerald-400 bg-emerald-500/10'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>
      )}

      {/* Footer conforming to Zero-Pill & Metadata guidelines */}
      <footer className="mt-auto border-t border-slate-800/80 py-6 px-6 text-xs text-slate-500 pb-16 md:pb-6">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-slate-400">AegisVPN Gateway</span>
            <span aria-hidden="true">·</span>
            <span>Single-Tenant Personal Instance</span>
            <span aria-hidden="true">·</span>
            <span>Curve25519 / ChaCha20-Poly1305</span>
          </div>

          <div className="flex items-center gap-2 text-slate-500">
            <span>RAM-Only Diskless OS</span>
            <span aria-hidden="true">·</span>
            <span>Auto-Connect {autoConnectEnabled ? 'Active' : 'Disabled'}</span>
            <span aria-hidden="true">·</span>
            <span>DNSSEC Enforced</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
