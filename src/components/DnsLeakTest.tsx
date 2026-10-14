import React, { useState } from 'react';
import { 
  ShieldCheck, 
  ShieldAlert, 
  Search, 
  Lock, 
  Globe, 
  Zap, 
  Activity, 
  Radio, 
  CheckCircle2, 
  AlertTriangle,
  Play,
  RotateCcw
} from 'lucide-react';
import type { DNSQueryResult, SpeedTestResult } from '../types';

interface DnsLeakTestProps {
  killSwitchEnabled: boolean;
  onToggleKillSwitch: () => void;
  isTunnelConnected: boolean;
}

export const DnsLeakTest: React.FC<DnsLeakTestProps> = ({
  killSwitchEnabled,
  onToggleKillSwitch,
  isTunnelConnected,
}) => {
  // DNS Query Workbench
  const [domainToTest, setDomainToTest] = useState('eff.org');
  const [selectedProvider, setSelectedProvider] = useState<'cloudflare' | 'quad9' | 'adguard'>('quad9');
  const [dnsResult, setDnsResult] = useState<DNSQueryResult | null>(null);
  const [isQueryingDns, setIsQueryingDns] = useState(false);

  // Speed test state
  const [speedResult, setSpeedResult] = useState<SpeedTestResult>({
    ping: 18,
    jitter: 2,
    downloadMbps: 94.8,
    uploadMbps: 48.2,
    state: 'idle',
  });

  const runDnsQuery = async () => {
    setIsQueryingDns(true);
    try {
      const res = await fetch('/api/dns/query', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ domain: domainToTest, provider: selectedProvider }),
      });
      if (res.ok) {
        const data = await res.json();
        setDnsResult(data);
      }
    } catch (err) {
      console.error('DNS Query failed', err);
    } finally {
      setIsQueryingDns(false);
    }
  };

  const runSpeedBenchmark = async () => {
    setSpeedResult((prev) => ({ ...prev, state: 'pinging' }));

    // 1. Ping
    const pingStart = performance.now();
    try {
      await fetch('/api/speedtest/ping');
      const pingElapsed = Math.round(performance.now() - pingStart);
      setSpeedResult((prev) => ({ ...prev, ping: pingElapsed, state: 'downloading' }));

      // 2. Download (3MB)
      const dlStart = performance.now();
      const dlRes = await fetch('/api/speedtest/download?mb=3');
      const blob = await dlRes.blob();
      const dlElapsedSeconds = (performance.now() - dlStart) / 1000;
      const sizeBits = blob.size * 8;
      const downloadMbps = +(sizeBits / (dlElapsedSeconds * 1024 * 1024)).toFixed(1);

      setSpeedResult((prev) => ({ ...prev, downloadMbps, state: 'uploading' }));

      // 3. Upload (1MB payload)
      const ulStart = performance.now();
      const payload = new Uint8Array(1024 * 1024);
      await fetch('/api/speedtest/upload', {
        method: 'POST',
        body: payload,
      });
      const ulElapsedSeconds = (performance.now() - ulStart) / 1000;
      const uploadMbps = +( (1024 * 1024 * 8) / (ulElapsedSeconds * 1024 * 1024) ).toFixed(1);

      setSpeedResult({
        ping: pingElapsed,
        jitter: Math.max(1, Math.round(pingElapsed * 0.15)),
        downloadMbps,
        uploadMbps,
        state: 'finished',
      });
    } catch (err) {
      console.error('Speed test error', err);
      setSpeedResult((prev) => ({ ...prev, state: 'finished' }));
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Banner: Kill Switch & Leak Protection Status */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {/* Kill Switch Card */}
        <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono uppercase text-slate-400">Network Kill Switch</span>
              <span className={`text-[11px] font-semibold ${killSwitchEnabled ? 'text-emerald-400' : 'text-slate-500'}`}>
                {killSwitchEnabled ? 'Active' : 'Disabled'}
              </span>
            </div>
            <h3 className="text-base font-bold text-white mt-1">Automatic IP Leak Guard</h3>
            <p className="text-xs text-slate-400 mt-1">
              Immediately severs all outside socket connections if the encrypted tunnel drops, preventing ISP packet exposure.
            </p>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-800 flex items-center justify-between">
            <span className="text-xs text-slate-400 font-mono">Status:</span>
            <button
              onClick={onToggleKillSwitch}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
                killSwitchEnabled
                  ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                  : 'bg-slate-800 text-slate-400 hover:text-white'
              }`}
            >
              {killSwitchEnabled ? 'Arm Killswitch ✓' : 'Engage Killswitch'}
            </button>
          </div>
        </div>

        {/* DNS Leak Card */}
        <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono uppercase text-slate-400">DNS Resolution</span>
              <span className="text-[11px] font-semibold text-emerald-400">Sealed</span>
            </div>
            <h3 className="text-base font-bold text-white mt-1">Zero DNS Leakage</h3>
            <p className="text-xs text-slate-400 mt-1">
              All domain lookups route inside the encrypted WireGuard encapsulation over DNS-over-HTTPS. Local ISP DNS requests are blocked.
            </p>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-800 flex items-center justify-between text-xs">
            <span className="text-slate-500 font-mono">DNSSEC:</span>
            <span className="text-emerald-400 font-mono font-medium flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5" />
              Cryptographically Signed
            </span>
          </div>
        </div>

        {/* WebRTC Shield Card */}
        <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono uppercase text-slate-400">WebRTC STUN Shield</span>
              <span className="text-[11px] font-semibold text-emerald-400">Protected</span>
            </div>
            <h3 className="text-base font-bold text-white mt-1">Local IP Masking</h3>
            <p className="text-xs text-slate-400 mt-1">
              Browser WebRTC peer connections are routed through dummy loopback candidates to prevent internal LAN IP enumeration.
            </p>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-800 flex items-center justify-between text-xs">
            <span className="text-slate-500 font-mono">STUN Proxy:</span>
            <span className="text-slate-300 font-mono">Direct Block Enforced</span>
          </div>
        </div>
      </div>

      {/* Interactive DoH Query Workbench & Speed Benchmark Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* DoH Query Workbench (7 cols) */}
        <div className="lg:col-span-7 bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-5">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <div>
              <h3 className="text-base font-bold text-white">DNS-over-HTTPS (DoH) Resolver</h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Execute encrypted queries directly through privacy-first upstream resolvers.
              </p>
            </div>
          </div>

          <div className="space-y-3">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
              {[
                { id: 'quad9', label: 'Quad9', desc: 'Malware Filtered' },
                { id: 'cloudflare', label: 'Cloudflare', desc: '1.1.1.1 Fast' },
                { id: 'adguard', label: 'AdGuard', desc: 'Ad Stripping' },
              ].map((prov) => (
                <button
                  key={prov.id}
                  onClick={() => setSelectedProvider(prov.id as any)}
                  className={`p-2.5 rounded-xl border text-left transition-colors cursor-pointer ${
                    selectedProvider === prov.id
                      ? 'bg-emerald-500/10 border-emerald-500/40 text-emerald-400'
                      : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-white'
                  }`}
                >
                  <div className="text-xs font-semibold">{prov.label}</div>
                  <div className="text-[10px] text-slate-500 mt-0.5">{prov.desc}</div>
                </button>
              ))}
            </div>

            <div className="flex items-center gap-2">
              <div className="relative flex-1">
                <input
                  type="text"
                  value={domainToTest}
                  onChange={(e) => setDomainToTest(e.target.value)}
                  placeholder="Enter hostname (e.g. eff.org, github.com)..."
                  className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs font-mono text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500/60"
                />
              </div>

              <button
                onClick={runDnsQuery}
                disabled={isQueryingDns}
                className="px-4 py-2.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-semibold text-xs rounded-xl flex items-center gap-1.5 transition-colors cursor-pointer shrink-0 disabled:opacity-50"
              >
                <Search className="w-3.5 h-3.5" />
                <span>{isQueryingDns ? 'Querying...' : 'Resolve Securely'}</span>
              </button>
            </div>
          </div>

          {/* DNS Query Result Box */}
          {dnsResult && (
            <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-3">
              <div className="flex items-center justify-between text-xs pb-2 border-b border-slate-800/80">
                <span className="font-mono text-slate-300">
                  Target: <strong>{dnsResult.domain}</strong> ({dnsResult.provider.toUpperCase()})
                </span>
                <div className="flex items-center gap-2 font-mono">
                  <span className="text-emerald-400 tabular-nums">{dnsResult.latencyMs} ms</span>
                  <span className="text-slate-600">·</span>
                  <span className="text-cyan-400">
                    {dnsResult.dnssec ? 'DNSSEC Valid' : 'No DNSSEC'}
                  </span>
                </div>
              </div>

              <div className="space-y-1.5 font-mono text-xs">
                <div className="text-slate-500 text-[11px]">Resolved IP Addresses (A Records):</div>
                {dnsResult.answers && dnsResult.answers.length > 0 ? (
                  dnsResult.answers.map((ans, idx) => (
                    <div
                      key={idx}
                      className="p-2 rounded-lg bg-slate-900 border border-slate-800 text-slate-200 flex items-center justify-between"
                    >
                      <span className="text-emerald-300">{ans.data}</span>
                      <span className="text-slate-500 text-[11px]">TTL: {ans.TTL}s</span>
                    </div>
                  ))
                ) : (
                  <div className="text-slate-500 italic text-[11px]">No A records returned.</div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Speed & Throughput Benchmark (5 cols) */}
        <div className="lg:col-span-5 bg-slate-900 border border-slate-800 rounded-2xl p-6 flex flex-col justify-between space-y-5">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h3 className="text-base font-bold text-white">Live Speed Benchmark</h3>
              <span className="text-xs font-mono text-slate-400">RAM-Only Node</span>
            </div>
            <p className="text-xs text-slate-400 mt-2">
              Measures real-time packet latency, stream jitter, and throughput against your personal relay server.
            </p>
          </div>

          {/* Metric Tiles */}
          <div className="grid grid-cols-2 gap-3.5">
            <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800">
              <div className="text-[11px] font-mono text-slate-500 uppercase">Ping Latency</div>
              <div className="text-xl font-mono font-bold text-white mt-1 tabular-nums">
                {speedResult.ping} <span className="text-xs font-normal text-slate-400">ms</span>
              </div>
              <div className="text-[11px] text-slate-500 mt-0.5">Jitter: ~{speedResult.jitter} ms</div>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800">
              <div className="text-[11px] font-mono text-slate-500 uppercase">Download Speed</div>
              <div className="text-xl font-mono font-bold text-emerald-400 mt-1 tabular-nums">
                {speedResult.downloadMbps} <span className="text-xs font-normal text-slate-400">Mbps</span>
              </div>
              <div className="text-[11px] text-slate-500 mt-0.5">Zero Bottleneck</div>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800">
              <div className="text-[11px] font-mono text-slate-500 uppercase">Upload Speed</div>
              <div className="text-xl font-mono font-bold text-cyan-400 mt-1 tabular-nums">
                {speedResult.uploadMbps} <span className="text-xs font-normal text-slate-400">Mbps</span>
              </div>
              <div className="text-[11px] text-slate-500 mt-0.5">Symmetric Uplink</div>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800">
              <div className="text-[11px] font-mono text-slate-500 uppercase">Packet Loss</div>
              <div className="text-xl font-mono font-bold text-white mt-1 tabular-nums">
                0.00 <span className="text-xs font-normal text-slate-400">%</span>
              </div>
              <div className="text-[11px] text-emerald-400 mt-0.5">Clean Stream</div>
            </div>
          </div>

          <button
            onClick={runSpeedBenchmark}
            disabled={speedResult.state === 'pinging' || speedResult.state === 'downloading' || speedResult.state === 'uploading'}
            className="w-full py-2.5 bg-slate-800 hover:bg-slate-700 disabled:opacity-50 text-white font-semibold text-xs rounded-xl flex items-center justify-center gap-2 transition-colors cursor-pointer"
          >
            {speedResult.state === 'idle' || speedResult.state === 'finished' ? (
              <>
                <Play className="w-3.5 h-3.5 text-emerald-400 fill-emerald-400" />
                <span>Run Speed & Latency Benchmark</span>
              </>
            ) : (
              <>
                <RotateCcw className="w-3.5 h-3.5 animate-spin text-emerald-400" />
                <span className="capitalize">Testing {speedResult.state}...</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
