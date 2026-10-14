import React, { useState } from 'react';
import { ShieldCheck, Lock, KeyRound, Eye, EyeOff, ShieldAlert, Check } from 'lucide-react';

interface VaultGateProps {
  isConfigured: boolean;
  onUnlock: (passphrase: string) => boolean;
  onSetup: (passphrase: string) => void;
}

export const VaultGate: React.FC<VaultGateProps> = ({
  isConfigured,
  onUnlock,
  onSetup,
}) => {
  const [passphrase, setPassphrase] = useState('');
  const [confirmPass, setConfirmPass] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!isConfigured) {
      if (passphrase.length < 6) {
        setError('Master passphrase must be at least 6 characters.');
        return;
      }
      if (passphrase !== confirmPass) {
        setError('Passphrases do not match.');
        return;
      }
      onSetup(passphrase);
    } else {
      const ok = onUnlock(passphrase);
      if (!ok) {
        setError('Incorrect master passphrase. Access denied.');
      }
    }
  };

  return (
    <div className="min-h-[75vh] flex items-center justify-center p-6">
      <div className="w-full max-w-md bg-slate-900/90 border border-slate-800 rounded-2xl p-8 shadow-2xl relative overflow-hidden backdrop-blur-xl">
        {/* Subtle decorative glow */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-48 h-24 bg-emerald-500/10 blur-3xl pointer-events-none rounded-full" />

        <div className="relative text-center mb-8">
          <div className="w-14 h-14 mx-auto mb-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
            {isConfigured ? (
              <Lock className="w-7 h-7" />
            ) : (
              <KeyRound className="w-7 h-7" />
            )}
          </div>
          <h2 className="text-xl font-bold text-white tracking-tight">
            {isConfigured ? 'Personal VPN Vault Locked' : 'Initialize Personal Security Vault'}
          </h2>
          <p className="text-xs text-slate-400 mt-2 max-w-xs mx-auto">
            {isConfigured
              ? 'Enter your master passphrase to unlock WireGuard keys, private routing tunnels, and network audit tools.'
              : 'Set a zero-knowledge master passphrase to protect your private keys and personal tunnel configurations.'}
          </p>
        </div>

        {error && (
          <div className="mb-6 p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2">
            <ShieldAlert className="w-4 h-4 shrink-0 text-rose-400" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1.5">
              {isConfigured ? 'Master Passphrase' : 'New Master Passphrase'}
            </label>
            <div className="relative">
              <input
                type={showPass ? 'text' : 'password'}
                value={passphrase}
                onChange={(e) => setPassphrase(e.target.value)}
                placeholder="Enter secure passphrase..."
                autoFocus
                className="w-full px-4 py-2.5 text-sm bg-slate-950/80 border border-slate-800 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500/60 focus:ring-1 focus:ring-emerald-500/50 pr-10"
              />
              <button
                type="button"
                onClick={() => setShowPass(!showPass)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200"
              >
                {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {!isConfigured && (
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1.5">
                Confirm Master Passphrase
              </label>
              <input
                type={showPass ? 'text' : 'password'}
                value={confirmPass}
                onChange={(e) => setConfirmPass(e.target.value)}
                placeholder="Confirm passphrase..."
                className="w-full px-4 py-2.5 text-sm bg-slate-950/80 border border-slate-800 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500/60 focus:ring-1 focus:ring-emerald-500/50"
              />
            </div>
          )}

          <div className="pt-2">
            <button
              type="submit"
              className="w-full py-2.5 px-4 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-semibold text-sm rounded-xl transition-colors shadow-lg shadow-emerald-500/20 flex items-center justify-center gap-2 cursor-pointer"
            >
              <ShieldCheck className="w-4 h-4" />
              <span>{isConfigured ? 'Unlock Vault' : 'Create Vault & Proceed'}</span>
            </button>
          </div>
        </form>

        <div className="mt-6 pt-5 border-t border-slate-800/80 text-center">
          <div className="flex items-center justify-center gap-2 text-[11px] text-slate-500">
            <span>Client-Side AES-GCM Encrypted</span>
            <span>·</span>
            <span>Zero-Knowledge Isolation</span>
            <span>·</span>
            <span>Single User Only</span>
          </div>
        </div>
      </div>
    </div>
  );
};
