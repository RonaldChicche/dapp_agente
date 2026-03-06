'use client';

import { useState } from 'react';

interface WalletData {
  address: string;
  balance: string;
  transactionCount: number;
  network: string;
}

export default function Home() {
  const [walletAddress, setWalletAddress] = useState('');
  const [walletData, setWalletData] = useState<WalletData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setWalletData(null);
    setLoading(true);

    try {
      const response = await fetch('/api/wallet', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ address: walletAddress }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || 'Error al consultar la wallet');
        return;
      }

      setWalletData(data);
    } catch (err) {
      setError('Error de conexión');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-50 font-sans dark:bg-zinc-900 p-4">
      <main className="w-full max-w-2xl">
        <div className="bg-white dark:bg-black rounded-lg shadow-lg p-8">
          <h1 className="text-3xl font-bold text-center mb-8 text-black dark:text-white">
            Consulta de Wallet Rollux
          </h1>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="wallet" className="block text-sm font-medium mb-2 text-zinc-700 dark:text-zinc-300">
                Dirección de Wallet
              </label>
              <input
                id="wallet"
                type="text"
                value={walletAddress}
                onChange={(e) => setWalletAddress(e.target.value)}
                placeholder="0x..."
                className="w-full px-4 py-3 border border-zinc-300 dark:border-zinc-700 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-zinc-800 text-black dark:text-white"
                required
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-zinc-400 text-white font-medium py-3 rounded-lg transition-colors"
            >
              {loading ? 'Consultando...' : 'Consultar'}
            </button>
          </form>

          {error && (
            <div className="mt-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
              <p className="text-red-600 dark:text-red-400">{error}</p>
            </div>
          )}

          {walletData && (
            <div className="mt-6 space-y-4">
              <div className="p-4 bg-zinc-50 dark:bg-zinc-800 rounded-lg">
                <p className="text-sm text-zinc-600 dark:text-zinc-400 mb-1">Red</p>
                <p className="font-medium text-black dark:text-white">{walletData.network}</p>
              </div>

              <div className="p-4 bg-zinc-50 dark:bg-zinc-800 rounded-lg">
                <p className="text-sm text-zinc-600 dark:text-zinc-400 mb-1">Balance</p>
                <p className="text-2xl font-bold text-black dark:text-white">{walletData.balance} TSYS</p>
              </div>

              <div className="p-4 bg-zinc-50 dark:bg-zinc-800 rounded-lg">
                <p className="text-sm text-zinc-600 dark:text-zinc-400 mb-1">Transacciones</p>
                <p className="font-medium text-black dark:text-white">{walletData.transactionCount}</p>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
