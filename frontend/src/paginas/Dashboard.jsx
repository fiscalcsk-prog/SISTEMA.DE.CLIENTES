import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Users, UserPlus, UserMinus, Settings, LogOut } from 'lucide-react';
import Layout from '@/componentes/Layout';

export default function Dashboard() {
  const navigate = useNavigate();
  const usuario = JSON.parse(localStorage.getItem('usuario') || '{}');

  const cards = [
    {
      titulo: 'Cadastrar Cliente',
      descricao: 'Adicione um novo cliente ao sistema',
      icon: UserPlus,
      rota: '/cadastro-cliente',
      cor: 'from-green-500 to-emerald-600',
      testId: 'card-cadastrar-cliente',
      mostrar: usuario.permissoes?.cadastrar || usuario.tipo === 'ADM'
    },
    {
      titulo: 'Clientes Ativos',
      descricao: 'Visualize todos os clientes ativos',
      icon: Users,
      rota: '/clientes',
      cor: 'from-blue-500 to-blue-600',
      testId: 'card-clientes-ativos',
      mostrar: true
    },
    {
      titulo: 'Ex-Clientes',
      descricao: 'Visualize clientes inativos',
      icon: UserMinus,
      rota: '/ex-clientes',
      cor: 'from-orange-500 to-red-600',
      testId: 'card-ex-clientes',
      mostrar: true
    },
    {
      titulo: 'Gerenciar Usuários',
      descricao: 'Configure usuários e permissões',
      icon: Settings,
      rota: '/usuarios',
      cor: 'from-purple-500 to-purple-600',
      testId: 'card-gerenciar-usuarios',
      mostrar: usuario.tipo === 'ADM'
    }
  ];

  return (
    <Layout>
      <div className="animate-fade-in" data-testid="dashboard">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-white mb-2" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>
            Dashboard
          </h1>
          <p className="text-gray-300 text-lg">Bem-vindo(a), {usuario.nome}</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {cards.filter(card => card.mostrar).map((card, index) => {
            const Icon = card.icon;
            return (
              <Card
                key={index}
                data-testid={card.testId}
                className="glass-effect border-blue-500/20 card-hover cursor-pointer group"
                onClick={() => navigate(card.rota)}
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <CardHeader>
                  <div className={`w-16 h-16 rounded-full bg-gradient-to-r ${card.cor} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                    <Icon className="h-8 w-8 text-white" />
                  </div>
                  <CardTitle className="text-xl text-white">{card.titulo}</CardTitle>
                  <CardDescription className="text-gray-300">{card.descricao}</CardDescription>
                </CardHeader>
              </Card>
            );
          })}
        </div>
      </div>
    </Layout>
  );
}