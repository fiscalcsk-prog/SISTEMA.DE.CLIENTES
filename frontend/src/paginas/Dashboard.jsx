import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Users, UserPlus, UserMinus, Settings, Sun, Moon } from 'lucide-react';
import Layout from '@/componentes/Layout';
import { supabase } from '@/lib/supabase';

export default function Dashboard() {
  const navigate = useNavigate();
  const usuario = JSON.parse(localStorage.getItem('usuario') || '{}');
  
  const [ultimosClientes, setUltimosClientes] = useState([]);
  const [carregando, setCarregando] = useState(true);
  const [modoClaro, setModoClaro] = useState(false);

  useEffect(() => {
    carregarUltimosClientes();
  }, []);

  const carregarUltimosClientes = async () => {
    try {
      const { data, error } = await supabase
        .from('clientes')
        .select('id, razao_social, data_inicial, created_at, created_by')
        .is('data_saida', null)
        .order('created_at', { ascending: false })
        .limit(10);

      if (error) throw error;

      setUltimosClientes(data || []);
    } catch (error) {
      console.error('Erro ao carregar últimos clientes:', error);
    } finally {
      setCarregando(false);
    }
  };

  const formatarData = (data) => {
    if (!data) return '-';
    return new Date(data).toLocaleDateString('pt-BR');
  };

  const formatarDataHora = (data) => {
    if (!data) return '-';
    return new Date(data).toLocaleString('pt-BR');
  };

  const cards = [
    {
      titulo: 'Cadastrar Cliente',
      descricao: 'Adicione um novo cliente',
      icon: UserPlus,
      rota: '/cadastro-cliente',
      cor: 'from-green-500 to-emerald-600',
      testId: 'card-cadastrar-cliente',
      mostrar: usuario.permissoes?.cadastrar || usuario.tipo === 'ADM'
    },
    {
      titulo: 'Clientes Ativos',
      descricao: 'Visualize clientes ativos',
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
      descricao: 'Configure usuários',
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
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-4xl font-bold text-white mb-2" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>
              Dashboard
            </h1>
            <p className="text-gray-300 text-lg">Bem-vindo(a), {usuario.nome}</p>
          </div>
          <Button
            variant="outline"
            size="icon"
            onClick={() => setModoClaro(!modoClaro)}
            className="bg-white/5 border-blue-500/30 text-white hover:bg-white/10"
            title={modoClaro ? "Modo Escuro" : "Modo Claro"}
          >
            {modoClaro ? <Moon className="h-5 w-5" /> : <Sun className="h-5 w-5" />}
          </Button>
        </div>

        {/* Cards de Navegação - 4 colunas */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
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
                <CardHeader className="pb-3">
                  <div className={`w-12 h-12 rounded-full bg-gradient-to-r ${card.cor} flex items-center justify-center mb-3 group-hover:scale-110 transition-transform`}>
                    <Icon className="h-6 w-6 text-white" />
                  </div>
                  <CardTitle className="text-lg text-white">{card.titulo}</CardTitle>
                  <CardDescription className="text-gray-300 text-sm">{card.descricao}</CardDescription>
                </CardHeader>
              </Card>
            );
          })}
        </div>

        {/* Tabela dos Últimos 10 Clientes Cadastrados */}
        <Card className="glass-effect border-blue-500/20">
          <CardHeader>
            <CardTitle className="text-2xl text-white" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>
              Últimos Clientes Cadastrados
            </CardTitle>
            <CardDescription className="text-gray-300">
              Os 10 clientes mais recentes no sistema
            </CardDescription>
          </CardHeader>
          <CardContent className="p-0">
            {carregando ? (
              <div className="text-center py-8 text-gray-400">Carregando...</div>
            ) : ultimosClientes.length === 0 ? (
              <div className="text-center py-8 text-gray-400">
                Nenhum cliente cadastrado ainda
              </div>
            ) : (
              <div className="overflow-x-auto">
                <div className="min-w-full" style={{ backgroundColor: modoClaro ? '#ffffff' : '#333F4F' }}>
                  <table className="w-full border-collapse">
                    <thead 
                      className="sticky top-0 z-10"
                      style={{ 
                        background: modoClaro 
                          ? '#1E293B' 
                          : 'linear-gradient(to bottom, #222B35 0%, #10151A 100%)'
                      }}
                    >
                      <tr className={modoClaro ? 'border-b-2 border-gray-200' : 'border-b border-blue-500/20'}>
                        <th 
                          className="text-left whitespace-nowrap"
                          style={{ 
                            fontSize: '15px', 
                            fontWeight: 'bold',
                            color: modoClaro ? '#ffffff' : '#BDD7EE',
                            padding: '16px 24px'
                          }}
                        >
                          Razão Social
                        </th>
                        <th 
                          className="text-left whitespace-nowrap" 
                          style={{ 
                            fontSize: '15px', 
                            fontWeight: 'bold', 
                            color: modoClaro ? '#ffffff' : '#BDD7EE', 
                            padding: '16px 24px' 
                          }}
                        >
                          Cadastrado Por
                        </th>
                        <th 
                          className="text-left whitespace-nowrap" 
                          style={{ 
                            fontSize: '15px', 
                            fontWeight: 'bold', 
                            color: modoClaro ? '#ffffff' : '#BDD7EE', 
                            padding: '16px 24px' 
                          }}
                        >
                          Data do Cadastro
                        </th>
                        <th 
                          className="text-left whitespace-nowrap" 
                          style={{ 
                            fontSize: '15px', 
                            fontWeight: 'bold', 
                            color: modoClaro ? '#ffffff' : '#BDD7EE', 
                            padding: '16px 24px' 
                          }}
                        >
                          Data Inicial Cliente
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {ultimosClientes.map((cliente, index) => {
                        const bgColorEven = modoClaro ? '#ffffff' : '#333F4F';
                        const bgColorOdd = modoClaro ? '#f9fafb' : '#2a3544';
                        const bgColor = index % 2 === 0 ? bgColorEven : bgColorOdd;
                        const hoverColor = modoClaro ? '#dbeafe' : '#3d4f63';
                        
                        return (
                          <tr 
                            key={cliente.id}
                            className={`
                              ${modoClaro 
                                ? 'border-b border-gray-200' 
                                : 'border-b border-blue-500/20'
                              } transition-colors duration-150 cursor-pointer
                            `}
                            style={{backgroundColor: bgColor}}
                            onClick={() => navigate(`/cadastro-cliente?id=${cliente.id}`)}
                            onMouseEnter={(e) => {
                              e.currentTarget.style.backgroundColor = hoverColor;
                            }}
                            onMouseLeave={(e) => {
                              e.currentTarget.style.backgroundColor = bgColor;
                            }}
                          >
                            <td 
                              className="whitespace-nowrap" 
                              style={{ 
                                fontSize: '13px', 
                                fontWeight: modoClaro ? '500' : '500',
                                color: modoClaro ? '#1f2937' : '#ffffff', 
                                padding: '14px 24px' 
                              }}
                            >
                              {cliente.razao_social}
                            </td>
                            <td 
                              className="whitespace-nowrap" 
                              style={{ 
                                fontSize: '13px', 
                                fontWeight: 'normal', 
                                color: modoClaro ? '#1f2937' : '#ffffff', 
                                padding: '14px 24px' 
                              }}
                            >
                              {cliente.created_by || '-'}
                            </td>
                            <td 
                              className="whitespace-nowrap" 
                              style={{ 
                                fontSize: '13px', 
                                fontWeight: 'normal', 
                                color: modoClaro ? '#1f2937' : '#ffffff', 
                                padding: '14px 24px' 
                              }}
                            >
                              {formatarDataHora(cliente.created_at)}
                            </td>
                            <td 
                              className="whitespace-nowrap" 
                              style={{ 
                                fontSize: '13px', 
                                fontWeight: 'normal', 
                                color: modoClaro ? '#1f2937' : '#ffffff', 
                                padding: '14px 24px' 
                              }}
                            >
                              {formatarData(cliente.data_inicial)}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
}
