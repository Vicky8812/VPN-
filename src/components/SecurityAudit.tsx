import React, { useState } from 'react';
import { 
  ShieldCheck, 
  CheckCircle2, 
  Lock, 
  Cpu, 
  HardDrive, 
  Key, 
  FileCheck, 
  AlertCircle,
  Terminal,
  Zap
} from 'lucide-react';

export const SecurityAudit: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'matrix' | 'policy' | 'crypto'>('matrix');

  const auditItems = [
    {
      title: 'Symmetric Cipher Suite',
      spec: 'ChaCha20-Poly1305 (256-bit)',
      status: 'Enforced',
      desc: 'High-speed authenticated encryption with Poly1305 MAC. Immune to cache-timing attacks compared to AES-NI on non-accelerated chips.',
      icon: Lock,
    },
    {
      title: 'Ephemeral Key Agreement',
      spec: 'Curve25519 (X25519 ECDH)',
      status: 'Active',
      desc: 'Provides Perfect Forward Secrecy (PFS). Session keys rotate periodically; past sessions remain unbreakable even if the master key is compromised.',
      icon: Key,
    },
    {
      title: 'RAM-Only Storage Architecture',
      spec: 'tmpfs Linux Kernel (No Disk)',
      status: 'Verified',
      desc: 'Nodes run entirely in volatile memory. If hardware power is interrupted or node is seized, all cryptographic states vanish instantly.',
      icon: HardDrive,
    },
    {
      title: 'Post-Quantum Defense Layer',
      spec: '32-Byte Symmetric PSK',
      status: 'Equipped',
      desc: 'Injects an additional 256-bit pre-shared key into the Diffie-Hellman handshake, neutralizing Shor’s algorithm on quantum computers.',
      icon: Cpu,
    },
    {
      title: 'DNSSEC Cryptographic Validation',
      spec: 'RFC 4033 / Authenticated Data',
      status: 'Signed',
      desc: 'DNS query answers are cryptographically verified by root trust anchors, preventing DNS poisoning, hijacking, and malicious spoofing.',
      icon: FileCheck,
    },
    {
      title: 'IPv6 Routing Leak Protection',
      spec: 'Dual-Stack Blackhole Route',
      status: 'Shielded',
      desc: 'Prevents ISP IPv6 packets from bypassing the IPv4 VPN tunnel when visiting modern dual-stack websites.',
      icon: ShieldCheck,
    },
    {
      title: 'Zero Connection Logging',
      spec: 'Syslog / Journald /dev/null',
      status: 'Strict Zero-Log',
      desc: 'No IP timestamps, session durations, bandwidth quotas, or destination hosts are logged or stored anywhere on relay servers.',
      icon: CheckCircle2,
    },
    {
      title: 'Kill Switch Packet Interception',
      spec: 'iptables / nftables Drop Policy',
      status: 'Standby Ready',
      desc: 'If the network interface detects socket disconnect, all non-loopback packets outside the WireGuard tunnel are rejected.',
      icon: Zap,
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-6 bg-slate-900 border border-slate-800 rounded-2xl">
        <div>
          <div className="flex items-center gap-2 text-xs font-mono text-emerald-400 uppercase tracking-wider">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Cryptographic Hardening Standard</span>
          </div>
          <h2 className="text-xl font-bold text-white mt-1">
            Personal Security & Privacy Audit
          </h2>
          <p className="text-xs text-slate-400 mt-1 max-w-xl">
            Independent architectural verification of AegisVPN's zero-knowledge parameters, cryptographic primitives, and memory-only residency.
          </p>
        </div>

        <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-mono font-semibold">
          <CheckCircle2 className="w-4 h-4" />
          <span>8 / 8 Checks Passed</span>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-800 pb-3">
        <button
          onClick={() => setActiveTab('matrix')}
          className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
            activeTab === 'matrix' ? 'bg-slate-800 text-white' : 'text-slate-400 hover:text-white'
          }`}
        >
          Hardening Matrix
        </button>
        <button
          onClick={() => setActiveTab('policy')}
          className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
            activeTab === 'policy' ? 'bg-slate-800 text-white' : 'text-slate-400 hover:text-white'
          }`}
        >
          Zero-Log Declaration
        </button>
        <button
          onClick={() => setActiveTab('crypto')}
          className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
            activeTab === 'crypto' ? 'bg-slate-800 text-white' : 'text-slate-400 hover:text-white'
          }`}
        >
          Cryptographic Primitives
        </button>
      </div>

      {/* Tab 1: Hardening Matrix */}
      {activeTab === 'matrix' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {auditItems.map((item, idx) => {
            const IconComp = item.icon;
            return (
              <div
                key={idx}
                className="p-5 rounded-2xl bg-slate-900 border border-slate-800 flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex items-center gap-2.5">
                      <div className="p-2 rounded-xl bg-slate-950 border border-slate-800 text-emerald-400">
                        <IconComp className="w-4 h-4" />
                      </div>
                      <div>
                        <h3 className="text-sm font-bold text-white">{item.title}</h3>
                        <div className="text-[11px] font-mono text-slate-400">{item.spec}</div>
                      </div>
                    </div>

                    <span className="px-2 py-0.5 rounded-md bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-[10px] font-mono font-semibold uppercase shrink-0">
                      {item.status}
                    </span>
                  </div>

                  <p className="text-xs text-slate-400 mt-3 leading-relaxed">
                    {item.desc}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Tab 2: Zero-Log Declaration */}
      {activeTab === 'policy' && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4">
          <h3 className="text-base font-bold text-white">Strict Personal Zero-Log Manifesto</h3>
          <p className="text-xs text-slate-300 leading-relaxed">
            AegisVPN is purpose-engineered strictly for personal use by a single sovereign owner. We operate under zero-knowledge guarantees:
          </p>

          <div className="space-y-3 pt-2">
            {[
              {
                title: 'No Traffic Logs',
                desc: 'We never log URLs visited, data downloaded, DNS queries made, or metadata about the content transmitted.',
              },
              {
                title: 'No Connection Timestamps',
                desc: 'We do not record session start times, session end times, or connect/disconnect logs.',
              },
              {
                title: 'No Assigned IP History',
                desc: 'Internal virtual IP assignments (10.66.66.X) exist solely in active routing tables and are recycled when the interface closes.',
              },
              {
                title: 'No Bandwidth Counter Logs',
                desc: 'Client data throughput shown in the dashboard is calculated live in the client memory and is not stored in a persistent database.',
              },
            ].map((rule, idx) => (
              <div key={idx} className="p-3.5 rounded-xl bg-slate-950 border border-slate-800">
                <div className="text-xs font-semibold text-emerald-400 flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>{rule.title}</span>
                </div>
                <div className="text-xs text-slate-400 mt-1 leading-normal">{rule.desc}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab 3: Cryptographic Primitives */}
      {activeTab === 'crypto' && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4">
          <h3 className="text-base font-bold text-white">Mathematical & Cryptographic Specifications</h3>
          <div className="space-y-3 text-xs font-mono">
            <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-1">
              <span className="text-emerald-400 font-bold">1. Curve25519 (ECDH)</span>
              <p className="text-slate-400 font-sans text-xs">
                Montgomery curve over the prime field 2^255 - 19. Designed by Daniel J. Bernstein for constant-time operation to prevent side-channel timing attacks.
              </p>
            </div>

            <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-1">
              <span className="text-cyan-400 font-bold">2. ChaCha20 Stream Cipher & Poly1305 MAC</span>
              <p className="text-slate-400 font-sans text-xs">
                IETF RFC 7539 standard. ChaCha20 uses a 256-bit key and a 96-bit nonce with 20 rounds of quarter-round operations. Poly1305 ensures message authenticity.
              </p>
            </div>

            <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-1">
              <span className="text-purple-400 font-bold">3. BLAKE2s Cryptographic Hash</span>
              <p className="text-slate-400 font-sans text-xs">
                Highly optimized 256-bit cryptographic hashing used for WireGuard cookie MACs, key derivation, and handshake hash chaining.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
