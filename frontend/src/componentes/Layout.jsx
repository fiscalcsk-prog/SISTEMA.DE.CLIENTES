import { useNavigate, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Home, Users, UserMinus, Settings, LogOut, UserPlus } from 'lucide-react';

export default function Layout({ children }) {
  const navigate = useNavigate();
  const location = useLocation();
  const usuario = JSON.parse(localStorage.getItem('usuario') || '{}');

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('usuario');
    navigate('/');
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
      {/* Sidebar */}
      <aside className="fixed left-0 top-0 h-full w-64 glass-effect border-r border-blue-500/20 z-50">
        <div className="p-6">
          <h2 className="text-2xl font-bold text-white mb-2" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>
            Sistema de Controle
          </h2>
          <p className="text-sm text-blue-300">Gestão de Clientes</p>
        </div>

        <nav className="px-4 space-y-2">
          {menuItems.filter(item => item.mostrar).map((item) => {
            const Icon = item.icon;
            const ativo = estaAtivo(item.rota);
            return (
              <Button
                key={item.rota}
                onClick={() => navigate(item.rota)}
                className={`w-full justify-start gap-3 transition-all ${
                  ativo
                    ? 'bg-gradient-to-r from-blue-500 to-blue-600 text-white'
                    : 'bg-white/5 text-gray-300 hover:bg-white/10 hover:text-white'
                }`}
                data-testid={`menu-${item.rota.replace('/', '')}`}
              >
                <Icon className="h-5 w-5" />
                {item.label}
              </Button>
            );
          })}
        </nav>

        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-blue-500/20">
          <div className="mb-4 p-3 bg-white/5 rounded-lg">
            <p className="text-sm text-gray-300 mb-1">Logado como:</p>
            <p className="text-white font-semibold">{usuario.nome}</p>
            <p className="text-xs text-blue-300">{usuario.tipo}</p>
          </div>
          <Button
            onClick={handleLogout}
            variant="outline"
            className="w-full bg-red-500/10 border-red-500/30 text-red-300 hover:bg-red-500/20"
            data-testid="btn-logout"
          >
            <LogOut className="mr-2 h-4 w-4" />
            Sair
          </Button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="ml-64 p-8">
        <div className="max-w-7xl mx-auto">
          {children}
        </div>
      </main>
    </div>
  );
}