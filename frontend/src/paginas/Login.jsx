import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { supabase } from '@/lib/supabase';
import { User, Lock, Eye, EyeOff } from 'lucide-react';

export default function Login() {
  const navigate = useNavigate();
  const [usuario, setUsuario] = useState('');
  const [senha, setSenha] = useState('');
  const [carregando, setCarregando] = useState(false);
  const [mostrarSenha, setMostrarSenha] = useState(false);

  const handleLogin = async (e) => {
  e.preventDefault();
  setCarregando(true);

  try {
    const response = await fetch('/api/login-username', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        username: usuario,
        senha,
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || 'Erro ao fazer login');
    }

    localStorage.setItem(
      'usuario',
      JSON.stringify({
        id: data.user.id,
        email: data.user.email,
        username: data.user.username,
      })
    );

    toast.success('Login realizado com sucesso!');
    navigate('/dashboard');
  } catch (error) {
    toast.error(error.message || 'Usuário ou senha inválidos');
  } finally {
    setCarregando(false);
  }
};


  return (
    <>
      <style>{`
        .login-card {
          transition: all 0.3s ease;
        }
        .login-card:hover {
          transform: scale(1.02);
          background: rgba(255, 255, 255, 0.08) !important;
          border-color: rgba(255, 255, 255, 0.15) !important;
          box-shadow: 0 12px 40px 0 rgba(0, 0, 0, 0.5) !important;
        }
      `}</style>

      <div
        className="min-h-screen flex items-center justify-center p-4"
        style={{
          background:
            'linear-gradient(135deg, #0f1a2f 0%, #1a2744 50%, #0f1a2f 100%)',
        }}
      >
        <div className="w-full max-w-md">
          <div
            className="login-card p-8 space-y-6 rounded-2xl shadow-2xl backdrop-blur-xl border"
            style={{
              background: 'rgba(255, 255, 255, 0.05)',
              borderColor: 'rgba(255, 255, 255, 0.1)',
              boxShadow: '0 8px 32px 0 rgba(0, 0, 0, 0.37)',
            }}
          >
            <div className="text-center space-y-2">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 mb-4">
                <Lock className="w-8 h-8 text-white" />
              </div>
              <h1
                className="text-3xl font-bold text-white"
                style={{ fontFamily: 'Space Grotesk' }}
              >
                Sistema de Clientes
              </h1>
              <p className="text-gray-400 text-sm">
                Entre com suas credenciais
              </p>
            </div>

            <form onSubmit={handleLogin} className="space-y-5">
              <div className="space-y-2">
                <Label htmlFor="usuario" className="text-gray-300">
                  Usuário (e-mail)
                </Label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <Input
                    id="usuario"
                    type="email"
                    placeholder="email@empresa.com"
                    value={usuario}
                    onChange={(e) => setUsuario(e.target.value)}
                    required
                    className="pl-11 bg-white/5 border-white/10 text-white placeholder:text-gray-500 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="senha" className="text-gray-300">
                  Senha
                </Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <Input
                    id="senha"
                    type={mostrarSenha ? 'text' : 'password'}
                    placeholder="Digite sua senha"
                    value={senha}
                    onChange={(e) => setSenha(e.target.value)}
                    required
                    className="pl-11 pr-11 bg-white/5 border-white/10 text-white placeholder:text-gray-500 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
                  />
                  <button
                    type="button"
                    onClick={() => setMostrarSenha(!mostrarSenha)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-300"
                  >
                    {mostrarSenha ? (
                      <EyeOff className="w-5 h-5" />
                    ) : (
                      <Eye className="w-5 h-5" />
                    )}
                  </button>
                </div>
              </div>

              <Button
                type="submit"
                disabled={carregando}
                className="w-full bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white font-semibold py-6 rounded-lg shadow-lg shadow-blue-500/20 hover:shadow-blue-500/40"
              >
                {carregando ? 'Entrando...' : 'Entrar'}
              </Button>
            </form>

            <div className="pt-4 border-t border-white/10"></div>
          </div>
        </div>
      </div>
    </>
  );
}
