import React, { useState, useEffect, useRef } from 'react';
import { 
  Shield, 
  ShieldAlert, 
  Power, 
  Globe, 
  ArrowRight, 
  RefreshCw, 
  Lock, 
  ExternalLink, 
  CheckCircle2, 
  Activity, 
  Zap, 
  SlidersHorizontal,
  Layers,
  ArrowUpRight,
  ShieldCheck,
  Cpu,
  Gauge
} from 'lucide-react';
import type { RelayNode, IPTelemetry } from '../types';
import { NodeThroughputSpeedTest } from './NodeThroughputSpeedTest';

interface TunnelBrowserProps {
  activeNode: RelayNode;
  nodes: RelayNode[];
  onSelectNode: (node: RelayNode) => void;
  telemetry: IPTelemetry | null;
  isConnected: boolean;
  onToggleConnect: () => void;
  killSwitchEnabled: boolean;
}

export const TunnelBrowser: React.FC<TunnelBrowserProps> = ({
  activeNode,
  nodes,
  onSelectNode,
  telemetry,
  isConnected,
  onToggleConnect,
  killSwitchEnabled,
}) => {
  const [activeTunnelSubView, setActiveTunnelSubView] = useState<'browser' | 'speedtest'>('browser');
  const [targetUrl, setTargetUrl] = useState('https://icanhazip.com');
  const [currentTunnelUrl, setCurrentTunnelUrl] = useState('https://icanhazip.com');
  const [adBlock, setAdBlock] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [sessionSeconds, setSessionSeconds] = useState(0);
  const [downloadedBytes, setDownloadedBytes] = useState(24.5);
  const [uploadedBytes, setUploadedBytes] = useState(4.2);
  const iframeRef = useRef<HTMLIFrameElement>(null);

  // Timer when connected
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isConnected) {
      interval = setInterval(() => {
        setSessionSeconds((prev) => prev + 1);
        // Slightly increment bandwidth simulation
        setDownloadedBytes((prev) => +(prev + Math.random() * 0.15).toFixed(2));
        setUploadedBytes((prev) => +(prev + Math.random() * 0.04).toFixed(2));
      }, 1000);
    } else {
      setSessionSeconds(0);
    }
    return () => clearInterval(interval);
  }, [isConnected]);

  const handleNavigate = (urlToLoad?: string) => {
    const nextUrl = urlToLoad || targetUrl;
    if (!nextUrl) return;
    setIsLoading(true);
    setCurrentTunnelUrl(nextUrl);
    setDownloadedBytes((prev) => +(prev + 0.8).toFixed(2));
  };

  const handlePreset = (url: string) => {
    setTargetUrl(url);
    handleNavigate(url);
  };

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const iframeSrc = isConnected
    ? `/api/tunnel?url=${encodeURIComponent(currentTunnelUrl)}&adblock=${adBlock ? '1' : '0'}`
    : 'about:blank';

  return (
    <div className="space-y-6">
      {/* Hero Master Connection Card */}
      <div className="relative rounded-2xl bg-gradient-to-b from-slate-900 to-slate-950 border border-slate-800 p-6 md:p-8 overflow-hidden">
        {/* Subtle background glow */}
        <div
          className={`absolute -right-20 -top-20 w-80 h-80 rounded-full blur-3xl transition-opacity duration-700 pointer-events-none ${
            isConnected ? 'bg-emerald-500/15' : 'bg-rose-500/10'
          }`}
        />

        <div className="relative flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          {/* Left: Status & Identity */}
          <div className="space-y-2">
            <div className="flex items-center gap-2.5">
              <span
                className={`inline-block w-2.5 h-2.5 rounded-full ${
                  isConnected ? 'bg-emerald-400' : 'bg-slate-600'
                }`}
              />
              <span className="text-xs font-mono uppercase tracking-wider text-slate-400">
                {isConnected ? 'Tunnel Established' : 'Tunnel Inactive'}
              </span>
              <span className="text-slate-600">·</span>
              <span className="text-xs font-mono text-slate-400">
                {activeNode.flag} {activeNode.name}
              </span>
            </div>

            <h1 className="text-2xl md:text-3xl font-extrabold text-white tracking-tight">
              {isConnected
                ? 'Traffic Routed via Personal Encrypted Tunnel'
                : 'Direct Connection (Unprotected)'}
            </h1>

            <p className="text-xs md:text-sm text-slate-400 max-w-xl">
              {isConnected
                ? `Packets are encapsulated in ChaCha20-Poly1305 over ${activeNode.city}. Hardware DNSSEC and strict RAM-disk zero-logs active.`
                : 'Activate your private gateway to cloak your IP address and route all outbound requests through RAM-disk relay.'}
            </p>
          </div>

          {/* Right: Master Power Toggle & Quick Speed Test Shortcut */}
          <div className="flex items-center gap-3.5 self-stretch md:self-auto justify-between md:justify-end flex-wrap">
            {isConnected && (
              <div className="text-right hidden sm:block">
                <div className="text-xs text-slate-400 font-mono">Session Uptime</div>
                <div className="text-sm font-mono font-bold text-emerald-400 tabular-nums">
                  {formatTime(sessionSeconds)}
                </div>
              </div>
            )}

            <button
              onClick={() => setActiveTunnelSubView(activeTunnelSubView === 'speedtest' ? 'browser' : 'speedtest')}
              className={`px-3.5 py-3 rounded-xl text-xs font-semibold border transition-all flex items-center gap-2 cursor-pointer ${
                activeTunnelSubView === 'speedtest'
                  ? 'bg-emerald-500/20 border-emerald-500/40 text-emerald-300'
                  : 'bg-slate-900 border-slate-700 text-slate-300 hover:text-white hover:border-slate-600'
              }`}
            >
              <Gauge className="w-4 h-4 text-emerald-400" />
              <span>{activeTunnelSubView === 'speedtest' ? 'View Browser' : 'Speed Benchmark'}</span>
            </button>

            <button
              onClick={onToggleConnect}
              className={`px-5 py-3 rounded-xl font-bold text-sm transition-all duration-200 flex items-center gap-2.5 shadow-lg cursor-pointer ${
                isConnected
                  ? 'bg-rose-600 hover:bg-rose-500 text-white shadow-rose-950/40'
                  : 'bg-emerald-500 hover:bg-emerald-400 text-slate-950 shadow-emerald-500/20'
              }`}
            >
              <Power className="w-4 h-4 stroke-[2.5]" />
              <span>{isConnected ? 'Disconnect' : 'Connect VPN'}</span>
            </button>
          </div>
        </div>

        {/* Live Telemetry Grid */}
        <div className="mt-6 pt-6 border-t border-slate-800/80 grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800/80">
            <div className="text-[11px] text-slate-400 uppercase font-mono">Exit Node IP</div>
            <div className="text-sm font-mono font-semibold text-white mt-1 tabular-nums">
              {isConnected ? activeNode.publicIp : (telemetry?.client.detectedIp || 'Direct (Local)')}
            </div>
            <div className="text-[11px] text-slate-500 mt-0.5">
              {isConnected ? `${activeNode.city}, ${activeNode.country}` : 'Local ISP Assigned'}
            </div>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800/80">
            <div className="text-[11px] text-slate-400 uppercase font-mono">Encryption Cipher</div>
            <div className="text-sm font-mono font-semibold text-emerald-400 mt-1">
              {isConnected ? 'ChaCha20-Poly1305' : 'None (Cleartext)'}
            </div>
            <div className="text-[11px] text-slate-500 mt-0.5">
              {isConnected ? 'Curve25519 Ephemeral' : 'Vulnerable to DPI'}
            </div>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800/80">
            <div className="text-[11px] text-slate-400 uppercase font-mono flex items-center justify-between">
              <span>Throughput Data</span>
              <button
                onClick={() => setActiveTunnelSubView('speedtest')}
                className="text-[10px] text-emerald-400 hover:underline font-normal cursor-pointer"
              >
                Test Speed ↗
              </button>
            </div>
            <div className="text-sm font-mono font-semibold text-white mt-1 tabular-nums">
              ↓ {downloadedBytes} MB · ↑ {uploadedBytes} MB
            </div>
            <div className="text-[11px] text-slate-500 mt-0.5">
              Zero-Buffer Tunneling
            </div>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800/80">
            <div className="text-[11px] text-slate-400 uppercase font-mono">Kill Switch</div>
            <div className="text-sm font-mono font-semibold text-white mt-1 flex items-center gap-1.5">
              {killSwitchEnabled ? (
                <>
                  <ShieldCheck className="w-4 h-4 text-emerald-400" />
                  <span className="text-emerald-400">Engaged</span>
                </>
              ) : (
                <>
                  <ShieldAlert className="w-4 h-4 text-amber-400" />
                  <span className="text-amber-400">Off</span>
                </>
              )}
            </div>
            <div className="text-[11px] text-slate-500 mt-0.5">
              Fail-safe drop prevention
            </div>
          </div>
        </div>
      </div>

      {/* Segmented View Switcher in the Tunnel Tab */}
      <div className="flex items-center justify-between border-b border-slate-800 pb-3">
        <div className="flex items-center gap-2 p-1 bg-slate-900 rounded-xl border border-slate-800">
          <button
            onClick={() => setActiveTunnelSubView('browser')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-colors flex items-center gap-2 cursor-pointer ${
              activeTunnelSubView === 'browser'
                ? 'bg-emerald-500 text-slate-950 shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Globe className="w-3.5 h-3.5" />
            <span>Encrypted Web Tunnel & Proxy</span>
          </button>

          <button
            onClick={() => setActiveTunnelSubView('speedtest')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-colors flex items-center gap-2 cursor-pointer ${
              activeTunnelSubView === 'speedtest'
                ? 'bg-emerald-500 text-slate-950 shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Gauge className="w-3.5 h-3.5" />
            <span>Node Throughput Speed Test</span>
          </button>
        </div>

        <div className="text-xs font-mono text-slate-500 hidden sm:block">
          Active Relay: <span className="text-emerald-400 font-semibold">{activeNode.name}</span>
        </div>
      </div>

      {/* VIEW 1: Network Throughput Speed Test */}
      {activeTunnelSubView === 'speedtest' && (
        <NodeThroughputSpeedTest
          activeNode={activeNode}
          nodes={nodes}
          onSelectNode={onSelectNode}
          isTunnelConnected={isConnected}
        />
      )}

      {/* VIEW 2: In-App Encrypted Web Tunnel Browser */}
      {activeTunnelSubView === 'browser' && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
          {/* Browser Top Navigation & URL Bar */}
          <div className="p-4 bg-slate-950/80 border-b border-slate-800 space-y-3">
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
              {/* Presets & Controls */}
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-slate-900 border border-slate-800 text-xs font-mono text-emerald-400">
                  <Lock className="w-3.5 h-3.5" />
                  <span>TUNNEL</span>
                </div>

                <button
                  onClick={() => setAdBlock(!adBlock)}
                  className={`px-2.5 py-1.5 rounded-lg text-xs font-medium border transition-colors cursor-pointer ${
                    adBlock
                      ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'
                      : 'bg-slate-900 border-slate-800 text-slate-400'
                  }`}
                  title="Block third-party tracker scripts and analytics pixels"
                >
                  Shield: {adBlock ? 'On' : 'Off'}
                </button>
              </div>

              {/* URL Input */}
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  handleNavigate();
                }}
                className="flex-1 flex items-center gap-2"
              >
                <div className="relative flex-1">
                  <input
                    type="text"
                    value={targetUrl}
                    onChange={(e) => setTargetUrl(e.target.value)}
                    placeholder="Enter destination URL (e.g. icanhazip.com, wikipedia.org)..."
                    className="w-full px-3.5 py-2 pl-9 bg-slate-900/90 border border-slate-800 rounded-xl text-xs font-mono text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500/60 focus:ring-1 focus:ring-emerald-500/40"
                  />
                  <Globe className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                </div>

                <button
                  type="submit"
                  disabled={!isConnected}
                  className="px-4 py-2 bg-emerald-500 hover:bg-emerald-400 disabled:bg-slate-800 disabled:text-slate-500 text-slate-950 font-semibold text-xs rounded-xl transition-colors flex items-center gap-1.5 shrink-0 cursor-pointer disabled:cursor-not-allowed"
                >
                  <span>Tunnel Request</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </form>

              <button
                onClick={() => handleNavigate()}
                disabled={!isConnected}
                className="p-2 bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-white rounded-xl border border-slate-800 transition-colors cursor-pointer"
                title="Reload Frame"
              >
                <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
              </button>
            </div>

            {/* Quick Target Presets */}
            <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs text-slate-400">
              <span className="text-[11px] text-slate-500 shrink-0">Quick Destinations:</span>
              {[
                { label: 'Check IP (icanhazip)', url: 'https://icanhazip.com' },
                { label: 'Wikipedia (VPN)', url: 'https://en.wikipedia.org/wiki/Virtual_private_network' },
                { label: 'Hacker News', url: 'https://news.ycombinator.com' },
                { label: 'Example.com', url: 'https://example.com' },
              ].map((preset) => (
                <button
                  key={preset.url}
                  onClick={() => handlePreset(preset.url)}
                  className="px-2.5 py-1 rounded-md bg-slate-900 hover:bg-slate-800 border border-slate-800 hover:border-slate-700 text-slate-300 hover:text-emerald-400 transition-colors whitespace-nowrap shrink-0 text-[11px] font-mono cursor-pointer"
                >
                  {preset.label}
                </button>
              ))}
            </div>
          </div>

          {/* Browser Content Area */}
          <div className="relative min-h-[500px] h-[550px] bg-slate-950 flex flex-col">
            {!isConnected ? (
              <div className="m-auto text-center p-8 max-w-sm">
                <div className="w-12 h-12 mx-auto mb-3 rounded-2xl bg-slate-900 border border-slate-800 flex items-center justify-center text-slate-500">
                  <Power className="w-6 h-6" />
                </div>
                <h3 className="text-base font-bold text-white">Tunnel Disconnected</h3>
                <p className="text-xs text-slate-400 mt-1">
                  Web traffic is not routing through the personal encrypted node. Click "Connect VPN" above to establish a secure session.
                </p>
                <button
                  onClick={onToggleConnect}
                  className="mt-4 px-4 py-2 bg-emerald-500 text-slate-950 font-semibold text-xs rounded-xl hover:bg-emerald-400 transition-colors cursor-pointer"
                >
                  Activate Secure Tunnel
                </button>
              </div>
            ) : (
              <iframe
                ref={iframeRef}
                src={iframeSrc}
                title="Aegis Encrypted Tunnel Viewport"
                sandbox="allow-same-origin allow-scripts allow-forms"
                onLoad={() => setIsLoading(false)}
                className="w-full flex-1 border-0 bg-white"
              />
            )}
          </div>

          {/* Bottom Inspection Bar */}
          <div className="px-4 py-2.5 bg-slate-950 border-t border-slate-800/80 flex flex-wrap items-center justify-between text-xs text-slate-400 gap-3">
            <div className="flex items-center gap-3">
              <span className="font-mono text-[11px] text-emerald-400 flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                TLS 1.3 Strict Mode
              </span>
              <span className="text-slate-700">|</span>
              <span className="text-[11px]">Strict-Transport-Security: Enforced</span>
              <span className="text-slate-700 hidden sm:inline">|</span>
              <span className="text-[11px] hidden sm:inline">HTTP Referrer Stripped: Yes</span>
            </div>

            <div className="flex items-center gap-2">
              <a
                href={currentTunnelUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-[11px] text-slate-400 hover:text-white flex items-center gap-1 font-mono"
              >
                <span>Inspect Outside Sandbox</span>
                <ArrowUpRight className="w-3 h-3" />
              </a>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
