import React, { useState, useEffect } from 'react';
import { TopBar } from './components/TopBar';
import { VaultGate } from './components/VaultGate';
import { TunnelBrowser } from './components/TunnelBrowser';
import { WireGuardGenerator } from './components/WireGuardGenerator';
import { DnsLeakTest } from './components/DnsLeakTest';
import { RelayNodes } from './components/RelayNodes';
import { SecurityAudit } from './components/SecurityAudit';
import type { RelayNode, IPTelemetry } from './types';

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
  const [isTunnelConnected, setIsTunnelConnected] = useState(true);
  const [killSwitchEnabled, setKillSwitchEnabled] = useState(true);

  // Vault security state
  const [isVaultConfigured, setIsVaultConfigured] = useState(false);
  const [isVaultLocked, setIsVaultLocked] = useState(false);

  // Check stored vault password hash
  useEffect(() => {
    const storedHash = localStorage.getItem('aegis_vault_hash');
    if (storedHash) {
      setIsVaultConfigured(true);
      // Auto-lock on fresh page load if configured
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

  const handleSetupVault = (passphrase: string) => {
    // Simple fast client hash
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
      return true;
    }
    return false;
  };

  const handleToggleVaultLock = () => {
    if (isVaultLocked) {
      // User clicked unlock while locked -> stays on gate or triggers prompt
    } else {
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
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 md:py-8">
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
                onToggleConnect={() => setIsTunnelConnected(!isTunnelConnected)}
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
            <span>Zero Persistent Logs</span>
            <span aria-hidden="true">·</span>
            <span>DNSSEC Enforced</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
