import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Users, UserPlus, UserMinus, Settings, Sun, Moon, Calendar, User, Building2 } from 'lucide-react';
import Layout from '@/componentes/Layout';
import { supabase } from '@/lib/supabase';

export default function Dashboard() {
  const navigate = useNavigate();
  const usuario = JSON.parse(localStorage.getItem('usuario') || '{}');
  
  const [ultimosClientes, setUltimosClientes] = useState([]);
  const [carregando, setCarregando] = useState(true);
  const [modoClaro, setModoClaro] = useState(false);

  // ✅ Recarrega automaticamente quando a página fica visível
  useEffect(() => {
    carregarUltimosClientes();

    // Recarrega ao voltar para a aba
    const handleVisibilityChange = () => {
      if (!document.hidden) {
        carregarUltimosClientes();
      }
    };

    // ✅ Recarrega quando volta para a página (focus)
    const handleFocus = () => {
      carregarUltimosClientes();
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('focus', handleFocus);

    // ✅ Atualiza a cada 30 segundos automaticamente
    const intervalo = setInterval(() => {
      carregarUltimosClientes();
    }, 30000); // 30 segundos

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('focus', handleFocus);
      clearInterval(intervalo);
    };
  }, []);

  const carregarUltimosClientes = async () => {
    try {
      // Buscar todos os clientes ativos, ordenados por data de criação
      const { data: clientesData, error: clientesError } = await supabase
        .from('clientes')
        .select('*')
        .is('data_saida', null)
        .order('created_at', { ascending: false })
        .limit(10);

      if (clientesError) throw clientesError;

      // Buscar informações dos usuários que cadastraram
      const usuariosIds = [...new Set(clientesData?.map(c => c.usuario_cadastro).filter(Boolean))];
      
      let usuariosMap = {};
      if (usuariosIds.length > 0) {
        const { data: usuariosData, error: usuariosError } = await supabase
          .from('usuarios')
          .select('id, username')
          .in('id', usuariosIds);

        if (!usuariosError && usuariosData) {
          usuariosMap = usuariosData.reduce((acc, user) => {
            acc[user.id] = user.username;
            return acc;
          }, {});
        }
      }

      // Adicionar nome do usuário aos clientes
      const clientesComUsuario = clientesData?.map(cliente => ({
        ...cliente,
        nome_usuario: usuariosMap[cliente.usuario_cadastro] || 'Sistema'
      })) || [];

      setUltimosClientes(clientesComUsuario);
    } catch (error) {
      console.error('Erro ao carregar últimos clientes:', error);
      setUltimosClientes([]);
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
    const date = new Date(data);
    return date.toLocaleString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
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
      <div className="animate-fade-in px-6 py-8" data-testid="dashboard">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-4xl font-bold text-white mb-2" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>
              Dashboard
            </h1>
            <p className="text-gray-300 text-lg">Bem-vindo(a), {usuario.username}</p>
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

        {/* Cards dos Últimos 10 Clientes Cadastrados - RETANGULARES */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-2xl font-bold text-white" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>
                Últimos Clientes Cadastrados
              </h2>
              <p className="text-gray-300 text-sm mt-1">
                Os 10 clientes mais recentes no sistema
              </p>
            </div>
            <Button
              onClick={carregarUltimosClientes}
              variant="outline"
              size="sm"
              className="bg-white/5 border-blue-500/30 text-white hover:bg-white/10"
            >
              🔄 Atualizar
            </Button>
          </div>

          {carregando ? (
            <div className="text-center py-12">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
              <p className="text-gray-400 mt-4">Carregando...</p>
            </div>
          ) : ultimosClientes.length === 0 ? (
            <Card className="glass-effect border-blue-500/20">
              <CardContent className="py-12 text-center">
                <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-400 text-lg">Nenhum cliente cadastrado ainda</p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {ultimosClientes.map((cliente, index) => (
                <Card
                  key={cliente.id}
                  className="glass-effect border-blue-500/20 hover:border-blue-500/40 cursor-pointer transition-all duration-300 hover:scale-[1.01] hover:shadow-xl"
                  onClick={() => navigate(`/cadastro-cliente?id=${cliente.id}`)}
                  style={{ animationDelay: `${index * 0.05}s` }}
                >
                  <CardContent className="p-4">
                    <div className="flex gap-4">
                      {/* Ícone à esquerda */}
                      <div className="flex-shrink-0">
                        <div className="w-12 h-12 rounded-lg bg-gradient-to-r from-blue-500 to-blue-600 flex items-center justify-center">
                          <Building2 className="h-6 w-6 text-white" />
                        </div>
                      </div>

                      {/* Conteúdo principal */}
                      <div className="flex-1 min-w-0">
                        {/* Título e tags */}
                        <div className="mb-2">
                          <h3 className="text-white font-semibold text-base leading-tight mb-1 truncate">
                            {cliente.razao_social}
                          </h3>
                          {cliente.fantasia && (
                            <p className="text-gray-400 text-sm truncate">
                              {cliente.fantasia}
                            </p>
                          )}
                        </div>

                        {/* Informações em linha */}
                        <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-xs">
                          {/* Cadastrado por */}
                          <div className="flex items-center gap-1.5">
                            <User className="h-3.5 w-3.5 text-purple-400 flex-shrink-0" />
                            <span className="text-gray-400 truncate">{cliente.nome_usuario}</span>
                          </div>

                          {/* Data do cadastro */}
                          <div className="flex items-center gap-1.5">
                            <Calendar className="h-3.5 w-3.5 text-blue-400 flex-shrink-0" />
                            <span className="text-gray-400 truncate">{formatarDataHora(cliente.created_at)}</span>
                          </div>

                          {/* Início como cliente */}
                          {cliente.data_inicial && (
                            <div className="flex items-center gap-1.5 col-span-2">
                              <Calendar className="h-3.5 w-3.5 text-green-400 flex-shrink-0" />
                              <span className="text-gray-400">
                                Início: {formatarData(cliente.data_inicial)}
                              </span>
                            </div>
                          )}
                        </div>

                        {/* Tags na parte inferior */}
                        <div className="mt-2 flex flex-wrap gap-1.5">
                          {cliente.regime_tributario && (
                            <span className="px-2 py-0.5 bg-blue-500/10 text-blue-300 text-xs rounded">
                              {cliente.regime_tributario}
                            </span>
                          )}
                          {cliente.porte && (
                            <span className="px-2 py-0.5 bg-purple-500/10 text-purple-300 text-xs rounded">
                              {cliente.porte}
                            </span>
                          )}
                          {cliente.modalidade && (
                            <span className={`px-2 py-0.5 text-xs rounded ${
                              cliente.modalidade === 'Pró-Bono' 
                                ? 'bg-orange-500/10 text-orange-300' 
                                : 'bg-green-500/10 text-green-300'
                            }`}>
                              {cliente.modalidade}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
}
