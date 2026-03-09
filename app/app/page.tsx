'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { GlassCard } from '@/components/ui/GlassCard';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Wallet, ArrowRight, User } from 'lucide-react';

export default function Home() {
  const router = useRouter();
  const [name, setName] = useState('');
  const [wallet, setWallet] = useState('');
  const [showWallet, setShowWallet] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!name.trim()) {
      setError('Por favor, ingresa tu nombre.');
      return;
    }

    if (showWallet && wallet) {
      // Basic Syscoin wallet validation example (starts with sys or similar prefix depending on the network, often sys1)
      if (!wallet.toLowerCase().startsWith('sys')) {
        setError('La billetera debe ser una dirección válida de Syscoin (ej. sys1...).');
        return;
      }
    }

    setLoading(true);

    try {
      // Create user in Supabase
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_SUPABASE_URL}/rest/v1/users`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "apikey": process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "",
            "Authorization": `Bearer ${process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ""}`,
            "Prefer": "return=representation",
          },
          body: JSON.stringify({
            name: name.trim(),
            syscoin_wallet: wallet.trim() || null,
          }),
        }
      );

      if (!response.ok) {
        throw new Error("No se pudo crear el usuario.");
      }

      const [user] = await response.json();

      // Navigate to interview with real user ID
      router.push(`/interview?name=${encodeURIComponent(name.trim())}&userId=${user.id}`);
    } catch (err) {
      setError('Ocurrió un error. Intenta nuevamente.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-4">
      <main className="w-full max-w-md animate-in fade-in slide-in-from-bottom-4 duration-700">

        <div className="text-center mb-10">
          <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight text-lavender-900 mb-4">
            Refinance
          </h1>
          <p className="text-lg text-lavender-900/70 max-w-sm mx-auto">
            Descubre tu score crediticio en minutos con una simple conversación.
          </p>
        </div>

        <GlassCard>
          <form onSubmit={handleSubmit} className="flex flex-col space-y-6">
            <div className="space-y-2">
              <label htmlFor="name" className="text-sm font-medium text-lavender-900 ml-1">
                ¿Cómo te llamas?
              </label>
              <div className="relative">
                <User className="absolute left-4 top-1/2 -translate-y-1/2 text-lavender-500 h-5 w-5" />
                <Input
                  id="name"
                  type="text"
                  placeholder="Tu nombre"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="pl-12"
                  autoComplete="off"
                />
              </div>
            </div>

            {!showWallet ? (
              <Button
                type="button"
                variant="ghost"
                onClick={() => setShowWallet(true)}
                className="w-full justify-start text-lavender-900/70 hover:text-lavender-900"
              >
                <Wallet className="mr-2 h-4 w-4" />
                ¿Tienes una billetera Syscoin? Conéctala (Opcional)
              </Button>
            ) : (
              <div className="space-y-2 animate-in fade-in slide-in-from-top-2">
                <label htmlFor="wallet" className="text-sm font-medium text-lavender-900 ml-1">
                  Tu billetera Syscoin (Opcional)
                </label>
                <div className="relative">
                  <Wallet className="absolute left-4 top-1/2 -translate-y-1/2 text-lavender-500 h-5 w-5" />
                  <Input
                    id="wallet"
                    type="text"
                    placeholder="sys1..."
                    value={wallet}
                    onChange={(e) => setWallet(e.target.value)}
                    className="pl-12"
                    autoComplete="off"
                  />
                </div>
              </div>
            )}

            {error && (
              <p className="text-sm text-red-500 bg-red-50/50 p-3 rounded-lg border border-red-100 animate-in fade-in">
                {error}
              </p>
            )}

            <Button
              type="submit"
              size="lg"
              disabled={loading || !name.trim()}
              className="mt-4 w-full group"
            >
              {loading ? 'Preparando...' : 'Comenzar entrevista'}
              {!loading && <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />}
            </Button>
          </form>
        </GlassCard>

        <p className="text-center text-xs text-lavender-900/50 mt-8">
          Tus datos están seguros y protegidos.
        </p>
      </main>
    </div>
  );
}
