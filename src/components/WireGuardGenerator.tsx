import React, { useState, useEffect } from 'react';
import QRCode from 'qrcode';
import { 
  Key, 
  Download, 
  Copy, 
  Check, 
  QrCode, 
  RefreshCw, 
  Smartphone, 
  Laptop, 
  Terminal, 
  Shield, 
  Sliders, 
  CheckCircle2,
  FileCode,
  Share2
} from 'lucide-react';
import type { RelayNode } from '../types';

interface WireGuardGeneratorProps {
  nodes: RelayNode[];
  activeNode: RelayNode;
  onSelectNode: (node: RelayNode) => void;
}

export const WireGuardGenerator: React.FC<WireGuardGeneratorProps> = ({
  nodes,
  activeNode,
  onSelectNode,
}) => {
  const [deviceName, setDeviceName] = useState('Personal-Device');
  const [selectedNodeId, setSelectedNodeId] = useState(activeNode.id);
  const [dnsPreset, setDnsPreset] = useState('1.1.1.1, 1.0.0.1');
  const [mtu, setMtu] = useState('1420');
  const [allowedIps, setAllowedIps] = useState('0.0.0.0/0, ::/0');

  // Keys state
  const [privateKey, setPrivateKey] = useState('');
  const [publicKey, setPublicKey] = useState('');
  const [presharedKey, setPresharedKey] = useState('');
  const [isGeneratingKeys, setIsGeneratingKeys] = useState(false);

  // Config output
  const [wireguardConf, setWireguardConf] = useState('');
  const [openvpnConf, setOpenvpnConf] = useState('');
  const [qrDataUrl, setQrDataUrl] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'wireguard' | 'openvpn' | 'instructions'>('wireguard');
  const [copied, setCopied] = useState(false);

  // Generate initial keys on mount
  useEffect(() => {
    generateNewKeys();
  }, []);

  const generateNewKeys = async () => {
    setIsGeneratingKeys(true);
    try {
      const res = await fetch('/api/wireguard/keys', { method: 'POST' });
      if (res.ok) {
        const data = await res.json();
        setPrivateKey(data.privateKey);
        setPublicKey(data.publicKey);
        setPresharedKey(data.presharedKey);
      }
    } catch (err) {
      console.error('Failed to generate keys', err);
    } finally {
      setIsGeneratingKeys(false);
    }
  };

  // Re-generate config and QR code whenever parameters change
  useEffect(() => {
    if (!privateKey) return;

    const buildConfig = async () => {
      try {
        const res = await fetch('/api/wireguard/generate-config', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            deviceName,
            privateKey,
            publicKey,
            presharedKey,
            nodeId: selectedNodeId,
            dnsProvider: dnsPreset,
            mtu,
            allowedIps,
          }),
        });

        if (res.ok) {
          const data = await res.json();
          setWireguardConf(data.wireguardConf);
          setOpenvpnConf(data.openvpnConf);

          // Generate QR Code data URL for mobile scan
          const qrCodeUrl = await QRCode.toDataURL(data.wireguardConf, {
            margin: 2,
            width: 320,
            color: {
              dark: '#0f172a',
              light: '#ffffff',
            },
          });
          setQrDataUrl(qrCodeUrl);
        }
      } catch (err) {
        console.error('Failed to build config', err);
      }
    };

    buildConfig();
  }, [deviceName, selectedNodeId, dnsPreset, mtu, allowedIps, privateKey, presharedKey]);

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = (content: string, filename: string) => {
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const selectedNode = nodes.find((n) => n.id === selectedNodeId) || activeNode;

  return (
    <div className="space-y-6">
      {/* Header Info */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-6 bg-slate-900 border border-slate-800 rounded-2xl">
        <div>
          <div className="flex items-center gap-2 text-xs font-mono text-emerald-400 uppercase tracking-wider">
            <Key className="w-3.5 h-3.5" />
            <span>Cryptographic Profile Generator</span>
          </div>
          <h2 className="text-xl font-bold text-white mt-1">
            Personal WireGuard & OpenVPN Profiles
          </h2>
          <p className="text-xs text-slate-400 mt-1 max-w-xl">
            Generate authentic Curve25519 keypairs and scan the instant QR code into your official WireGuard app on iPhone, Android, Mac, or Windows.
          </p>
        </div>

        <button
          onClick={generateNewKeys}
          disabled={isGeneratingKeys}
          className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-white rounded-xl border border-slate-700 font-medium text-xs flex items-center gap-2 transition-colors cursor-pointer shrink-0 disabled:opacity-50"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isGeneratingKeys ? 'animate-spin' : ''}`} />
          <span>Regenerate Curve25519 Keys</span>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Col: Config Parameters (5 cols) */}
        <div className="lg:col-span-5 space-y-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4">
            <div className="flex items-center gap-2 pb-3 border-b border-slate-800">
              <Sliders className="w-4 h-4 text-emerald-400" />
              <h3 className="text-sm font-semibold text-white">Tunnel Parameters</h3>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1.5">
                Client Device Identifier
              </label>
              <input
                type="text"
                value={deviceName}
                onChange={(e) => setDeviceName(e.target.value)}
                placeholder="e.g. iPhone-16-Pro, Laptop-MacBook"
                className="w-full px-3.5 py-2 bg-slate-950/80 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-emerald-500/60"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1.5">
                Target Relay Node
              </label>
              <select
                value={selectedNodeId}
                onChange={(e) => {
                  setSelectedNodeId(e.target.value);
                  const matched = nodes.find((n) => n.id === e.target.value);
                  if (matched) onSelectNode(matched);
                }}
                className="w-full px-3.5 py-2 bg-slate-950/80 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-emerald-500/60"
              >
                {nodes.map((node) => (
                  <option key={node.id} value={node.id}>
                    {node.flag} {node.name} ({node.city})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1.5">
                Encrypted DNS Provider
              </label>
              <select
                value={dnsPreset}
                onChange={(e) => setDnsPreset(e.target.value)}
                className="w-full px-3.5 py-2 bg-slate-950/80 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-emerald-500/60"
              >
                <option value="9.9.9.9, 149.112.112.112">Quad9 (Malware & Phishing Filtered)</option>
                <option value="1.1.1.1, 1.0.0.1">Cloudflare (High Speed Privacy)</option>
                <option value="100.64.0.7">Mullvad (Strict Non-Logging DNS)</option>
                <option value="94.140.14.14, 94.140.15.15">AdGuard DNS (Ad & Tracker Stripping)</option>
              </select>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1.5">
                  MTU Packet Size
                </label>
                <select
                  value={mtu}
                  onChange={(e) => setMtu(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-950/80 border border-slate-800 rounded-xl text-xs text-white font-mono"
                >
                  <option value="1420">1420 (Ethernet Standard)</option>
                  <option value="1360">1360 (LTE / 5G Optimized)</option>
                  <option value="1280">1280 (Minimum IPv6/Satellite)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1.5">
                  Allowed Routing
                </label>
                <select
                  value={allowedIps}
                  onChange={(e) => setAllowedIps(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-950/80 border border-slate-800 rounded-xl text-xs text-white font-mono"
                >
                  <option value="0.0.0.0/0, ::/0">Full Tunnel (All IPv4/IPv6)</option>
                  <option value="10.0.0.0/8, 192.168.0.0/16">Split Tunnel (Internal LAN)</option>
                </select>
              </div>
            </div>

            {/* Cryptographic Key Details Accordion */}
            <div className="pt-3 border-t border-slate-800/80 space-y-2.5">
              <div className="text-[11px] font-mono uppercase text-slate-400">Curve25519 Key Material</div>
              
              <div className="p-2.5 rounded-lg bg-slate-950 border border-slate-800 text-[11px] font-mono space-y-1">
                <div className="text-slate-500">Public Key:</div>
                <div className="text-emerald-400 truncate select-all">{publicKey || 'Generating...'}</div>
              </div>

              <div className="p-2.5 rounded-lg bg-slate-950 border border-slate-800 text-[11px] font-mono space-y-1">
                <div className="text-slate-500">Pre-Shared Key (PSK / Quantum Guard):</div>
                <div className="text-cyan-400 truncate select-all">{presharedKey || 'Generating...'}</div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Col: QR Code & Config Output (7 cols) */}
        <div className="lg:col-span-7 space-y-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5">
            {/* Format Tabs */}
            <div className="flex items-center justify-between pb-4 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setActiveTab('wireguard')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
                    activeTab === 'wireguard'
                      ? 'bg-emerald-500 text-slate-950'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  WireGuard (.conf)
                </button>
                <button
                  onClick={() => setActiveTab('openvpn')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
                    activeTab === 'openvpn'
                      ? 'bg-emerald-500 text-slate-950'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  OpenVPN (.ovpn)
                </button>
                <button
                  onClick={() => setActiveTab('instructions')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
                    activeTab === 'instructions'
                      ? 'bg-emerald-500 text-slate-950'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  Setup Guide
                </button>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleCopy(activeTab === 'openvpn' ? openvpnConf : wireguardConf)}
                  className="px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copied ? 'Copied' : 'Copy'}</span>
                </button>

                <button
                  onClick={() =>
                    handleDownload(
                      activeTab === 'openvpn' ? openvpnConf : wireguardConf,
                      activeTab === 'openvpn' ? `${deviceName}-aegis.ovpn` : `${deviceName}-wg0.conf`
                    )
                  }
                  className="px-3 py-1.5 rounded-lg bg-emerald-500/10 border border-emerald-500/30 hover:bg-emerald-500/20 text-emerald-400 text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Download File</span>
                </button>
              </div>
            </div>

            {/* Tab 1: WireGuard (.conf) + QR Code */}
            {activeTab === 'wireguard' && (
              <div className="mt-4 grid grid-cols-1 md:grid-cols-12 gap-5 items-start">
                {/* QR Code Container */}
                <div className="md:col-span-5 bg-slate-950 p-4 rounded-xl border border-slate-800 flex flex-col items-center text-center">
                  <div className="text-xs font-medium text-slate-300 mb-2 flex items-center gap-1.5">
                    <QrCode className="w-4 h-4 text-emerald-400" />
                    <span>Scan into Mobile App</span>
                  </div>
                  
                  {qrDataUrl ? (
                    <div className="p-2 bg-white rounded-lg shadow-lg">
                      <img
                        src={qrDataUrl}
                        alt="WireGuard Mobile QR Code"
                        className="w-44 h-44 object-contain"
                      />
                    </div>
                  ) : (
                    <div className="w-44 h-44 bg-slate-900 rounded-lg flex items-center justify-center text-slate-600 text-xs font-mono">
                      Generating QR...
                    </div>
                  )}

                  <div className="text-[11px] text-slate-500 mt-3 leading-tight">
                    Open official WireGuard app on iPhone or Android and choose <strong>"Add a tunnel" → "Scan from QR code"</strong>.
                  </div>
                </div>

                {/* Raw Config Code View */}
                <div className="md:col-span-7">
                  <div className="text-xs font-mono text-slate-400 mb-1.5 flex items-center justify-between">
                    <span>wg0.conf configuration</span>
                    <span className="text-[10px] text-emerald-400 font-semibold">Strict No-Logs</span>
                  </div>
                  <pre className="p-3 bg-slate-950 rounded-xl border border-slate-800 text-[11px] font-mono text-slate-300 overflow-x-auto max-h-[300px] leading-relaxed selection:bg-emerald-500/30">
                    {wireguardConf}
                  </pre>
                </div>
              </div>
            )}

            {/* Tab 2: OpenVPN (.ovpn) */}
            {activeTab === 'openvpn' && (
              <div className="mt-4">
                <div className="text-xs font-mono text-slate-400 mb-1.5">
                  client.ovpn profile (AES-256-GCM / TLS 1.3)
                </div>
                <pre className="p-3.5 bg-slate-950 rounded-xl border border-slate-800 text-[11px] font-mono text-slate-300 overflow-x-auto max-h-[340px] leading-relaxed">
                  {openvpnConf}
                </pre>
              </div>
            )}

            {/* Tab 3: Step-by-Step Instructions */}
            {activeTab === 'instructions' && (
              <div className="mt-4 space-y-3.5 text-xs text-slate-300">
                <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 flex items-start gap-3">
                  <Smartphone className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                  <div>
                    <h4 className="font-semibold text-white">Apple iOS / Android Setup</h4>
                    <p className="text-slate-400 mt-0.5">
                      1. Install the free, open-source <strong>WireGuard</strong> app from the App Store or Google Play.<br />
                      2. Tap <strong>+</strong> and select <strong>Scan from QR code</strong>.<br />
                      3. Aim your camera at the QR code above and give the tunnel a name (e.g. "Aegis Zurich").
                    </p>
                  </div>
                </div>

                <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 flex items-start gap-3">
                  <Laptop className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
                  <div>
                    <h4 className="font-semibold text-white">macOS / Windows Setup</h4>
                    <p className="text-slate-400 mt-0.5">
                      1. Download and install WireGuard from <code>wireguard.com/install</code>.<br />
                      2. Click <strong>Download File</strong> above to save <code>{deviceName}-wg0.conf</code>.<br />
                      3. Open WireGuard, click <strong>Import tunnel(s) from file</strong>, select the conf file, and click <strong>Activate</strong>.
                    </p>
                  </div>
                </div>

                <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 flex items-start gap-3">
                  <Terminal className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                  <div>
                    <h4 className="font-semibold text-white">Linux CLI / Server Setup</h4>
                    <p className="text-slate-400 mt-0.5">
                      Copy the file to <code>/etc/wireguard/wg0.conf</code> and start the interface with:<br />
                      <code className="block mt-1 p-2 bg-slate-900 rounded font-mono text-emerald-400">sudo wg-quick up wg0</code>
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
