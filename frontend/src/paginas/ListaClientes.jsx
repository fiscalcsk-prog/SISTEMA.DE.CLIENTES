import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Home, Users, UserMinus, Settings, LogOut, UserPlus, Menu, X } from 'lucide-react';

export default function Layout({ children }) {
  const [menuAberto, setMenuAberto] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const usuario = JSON.parse(localStorage.getItem('usuario') || '{}');

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('usuario');
    navigate('/');
  };

  const toggleMenu = () => {
    setMenuAberto(!menuAberto);
  };

  const navegarPara = (rota) => {
    navigate(rota);
    setMenuAberto(false); // Fecha o menu após navegar
  };

  const menuItems = [
    {
      label: 'Dashboard',
      icon: Home,
      rota: '/dashboard',
      mostrar: true
    },
    {
      label: 'Cadastrar Cliente',
      icon: UserPlus,
      rota: '/cadastro-cliente',
      mostrar: usuario.permissoes?.cadastrar || usuario.tipo === 'ADM'
    },
    {
      label: 'Clientes Ativos',
      icon: Users,
      rota: '/clientes',
      mostrar: true
    },
    {
      label: 'Ex-Clientes',
      icon: UserMinus,
      rota: '/ex-clientes',
      mostrar: true
    },
    {
      label: 'Gerenciar Usuários',
      icon: Settings,
      rota: '/usuarios',
      mostrar: usuario.tipo === 'ADM'
    }
  ];

  const estaAtivo = (rota) => location.pathname === rota;

  return (
    <div className="min-h-screen" style={{ background: 'linear-gradient(135deg, rgb(15, 26, 47) 0%, rgb(25, 40, 65) 50%, rgb(15, 26, 47) 100%)' }}>
      
      {/* Overlay (fundo escuro quando menu está aberto) - CLICA PARA FECHAR */}
      {menuAberto && (
        <div
          className="fixed inset-0 bg-black/60 z-[999] animate-fade-in cursor-pointer"
          style={{ backdropFilter: 'blur(2px)' }}
          onClick={toggleMenu}
        ></div>
      )}

      {/* Sidebar */}
      <aside
        className={`fixed left-0 top-0 h-full w-72 border-r border-blue-500/20 z-[1000] transition-all duration-400 ease-in-out ${
          menuAberto ? 'translate-x-0' : '-translate-x-full'
        }`}
        style={{
          background: 'linear-gradient(180deg, rgba(8, 15, 30, 0.98) 0%, rgba(12, 20, 38, 0.98) 50%, rgba(8, 15, 30, 0.98) 100%)',
          boxShadow: '4px 0 30px rgba(0, 0, 0, 0.7)',
          backdropFilter: 'blur(15px)'
        }}
      >
        {/* Header do Menu com Botão de Fechar */}
        <div 
          className="p-6 border-b border-blue-500/15 relative"
          style={{
            background: 'linear-gradient(135deg, rgba(15, 23, 42, 0.5) 0%, rgba(30, 41, 59, 0.3) 100%)'
          }}
        >
          {/* Botão X para fechar (dentro do menu) */}
          <button
            onClick={toggleMenu}
            className="absolute top-4 right-4 p-2 rounded-lg text-white/70 hover:text-white hover:bg-white/10 transition-all duration-200"
            aria-label="Fechar menu"
          >
            <X size={20} />
          </button>

          <h2 
            className="text-2xl font-bold mb-2 pr-10" 
            style={{ 
              fontFamily: 'Space Grotesk, sans-serif',
              background: 'linear-gradient(135deg, #60a5fa 0%, #3b82f6 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text'
            }}
          >
            Sistema de Controle
          </h2>
          <p className="text-sm text-slate-400">Gestão de Clientes</p>
        </div>

        {/* Menu de Navegação */}
        <nav className="px-4 py-5 space-y-2 overflow-y-auto" style={{ maxHeight: 'calc(100vh - 280px)' }}>
          {menuItems.filter(item => item.mostrar).map((item) => {
            const Icon = item.icon;
            const ativo = estaAtivo(item.rota);
            return (
              <Button
                key={item.rota}
                onClick={() => navegarPara(item.rota)}
                className={`w-full justify-start gap-3 transition-all duration-300 ${
                  ativo
                    ? 'bg-gradient-to-r from-blue-500/20 to-blue-600/20 text-white border border-blue-500/50'
                    : 'bg-transparent text-slate-300 hover:bg-blue-500/10 hover:text-white hover:translate-x-1 border border-transparent hover:border-blue-500/30'
                }`}
                data-testid={`menu-${item.rota.replace('/', '')}`}
                style={ativo ? { boxShadow: '0 4px 15px rgba(59, 130, 246, 0.2)' } : {}}
              >
                <Icon className="h-5 w-5" />
                {item.label}
              </Button>
            );
          })}
        </nav>

        {/* Footer do Menu */}
        <div 
          className="absolute bottom-0 left-0 right-0 p-4 border-t border-blue-500/15"
          style={{
            background: 'linear-gradient(135deg, rgba(15, 23, 42, 0.5) 0%, rgba(30, 41, 59, 0.3) 100%)'
          }}
        >
          <div 
            className="mb-4 p-3 rounded-lg border border-blue-500/10"
            style={{ background: 'rgba(30, 41, 59, 0.4)' }}
          >
            <p className="text-xs text-slate-400 mb-1">Logado como:</p>
            <p className="text-white font-semibold text-sm">{usuario.nome}</p>
            <p className="text-xs text-blue-300">{usuario.tipo}</p>
          </div>
          <Button
            onClick={handleLogout}
            variant="outline"
            className="w-full bg-red-500/10 border-red-500/30 text-red-300 hover:bg-red-500/20 font-semibold"
            data-testid="btn-logout"
          >
            <LogOut className="mr-2 h-4 w-4" />
            Sair
          </Button>
        </div>
      </aside>

      {/* Botão Hambúrguer - SÓ APARECE QUANDO MENU ESTÁ FECHADO */}
      {!menuAberto && (
        <button
          onClick={toggleMenu}
          className="fixed top-5 left-5 z-50 p-3 rounded-xl text-white transition-all duration-300 hover:scale-105"
          style={{
            background: 'linear-gradient(135deg, rgba(8, 15, 30, 0.95) 0%, rgba(15, 23, 42, 0.95) 100%)',
            border: '1px solid rgba(96, 165, 250, 0.3)',
            boxShadow: '0 4px 20px rgba(0, 0, 0, 0.5)',
            backdropFilter: 'blur(10px)'
          }}
          aria-label="Abrir menu"
        >
          <Menu size={24} />
        </button>
      )}

      {/* Main Content */}
      <main className="p-8 pt-20" style={{ padding: '80px 20px 20px 20px' }}> {/* REDUZIR PADDING LATERAL: mude '20px' para '10px' ou '5px' para tabela AINDA MAIS LARGA */}
        <div className="mx-auto" style={{ maxWidth: '100%', width: '100%' }}> {/* LARGURA MÁXIMA 100% */}
          {children}
        </div>
      </main>
    </div>
  );
}
