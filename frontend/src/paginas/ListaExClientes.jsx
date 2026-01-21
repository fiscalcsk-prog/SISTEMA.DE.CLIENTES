import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { toast } from 'sonner';
import { Edit, Trash2, Search, Sun, Moon, RotateCcw } from 'lucide-react';
import Layout from '@/componentes/Layout';
import { supabase } from '@/lib/supabase';

export default function ListaExClientes() {
  const navigate = useNavigate();
  const usuario = JSON.parse(localStorage.getItem('usuario') || '{}');

  const [clientes, setClientes] = useState([]);
  const [clientesFiltrados, setClientesFiltrados] = useState([]);
  const [busca, setBusca] = useState('');
  const [carregando, setCarregando] = useState(true);
  const [modoClaro, setModoClaro] = useState(false);

  useEffect(() => {
    carregarExClientes();
  }, []);

  useEffect(() => {
    filtrarClientes();
  }, [busca, clientes]);

  const carregarExClientes = async () => {
    try {
      const { data, error } = await supabase
        .from('clientes')
        .select('*')
        .not('data_saida', 'is', null)
        .order('razao_social', { ascending: true });

      if (error) {
        console.error('Erro ao carregar ex-clientes:', error);
        throw error;
      }

      setClientes(data || []);
      setClientesFiltrados(data || []);
    } catch (error) {
      console.error('Erro detalhado:', error);
      toast.error('Erro ao carregar ex-clientes: ' + (error.message || 'Erro desconhecido'));
      setClientes([]);
      setClientesFiltrados([]);
    } finally {
      setCarregando(false);
    }
  };

  const filtrarClientes = () => {
    if (!busca.trim()) {
      setClientesFiltrados(clientes);
      return;
    }

    const buscaLower = busca.toLowerCase();
    const filtrados = clientes.filter(cliente =>
      cliente.razao_social?.toLowerCase().includes(buscaLower) ||
      cliente.fantasia?.toLowerCase().includes(buscaLower) ||
      cliente.cnpj?.toLowerCase().includes(buscaLower) ||
      cliente.responsavel?.toLowerCase().includes(buscaLower) ||
      cliente.email?.toLowerCase().includes(buscaLower)
    );

    setClientesFiltrados(filtrados);
  };

  const reativarCliente = async (clienteId) => {
    try {
      const { error } = await supabase
        .from('clientes')
        .update({ data_saida: null })
        .eq('id', clienteId);

      if (error) throw error;

      toast.success('Cliente reativado com sucesso!');
      carregarExClientes();
    } catch (error) {
      toast.error('Erro ao reativar cliente');
    }
  };

  const deletarCliente = async (clienteId) => {
    try {
      const { error } = await supabase
        .from('clientes')
        .delete()
        .eq('id', clienteId);

      if (error) throw error;

      toast.success('Cliente deletado com sucesso!');
      carregarExClientes();
    } catch (error) {
      toast.error('Erro ao deletar cliente');
    }
  };

  const formatarData = (data) => {
    if (!data) return '-';
    return new Date(data).toLocaleDateString('pt-BR');
  };

  const podeEditar = usuario.permissoes?.editar || usuario.tipo === 'ADM';
  const podeExcluir = usuario.permissoes?.excluir || usuario.tipo === 'ADM';

  // Função para renderizar badge de Modalidade
  const renderModalidadeBadge = (modalidade) => {
    if (!modalidade || modalidade === '-') return '-';
    
    const isProBono = modalidade.toLowerCase().includes('pró-bono') || modalidade.toLowerCase().includes('pro-bono');
    const isPaga = modalidade.toLowerCase().includes('paga');
    
    if (isProBono) {
      return (
        <span style={{
          display: 'inline-block',
          padding: '5px 14px',
          borderRadius: '16px',
          fontSize: '11px',
          fontWeight: '600',
          background: 'linear-gradient(135deg, rgba(59, 130, 246, 0.15) 0%, rgba(37, 99, 235, 0.25) 100%)',
          border: '1.5px solid rgba(59, 130, 246, 0.4)',
          color: '#60a5fa',
          boxShadow: '0 2px 8px rgba(59, 130, 246, 0.15)',
          letterSpacing: '0.3px'
        }}>
          {modalidade}
        </span>
      );
    }
    
    if (isPaga) {
      return (
        <span style={{
          display: 'inline-block',
          padding: '5px 14px',
          borderRadius: '16px',
          fontSize: '11px',
          fontWeight: '600',
          background: 'linear-gradient(135deg, rgba(34, 197, 94, 0.15) 0%, rgba(22, 163, 74, 0.25) 100%)',
          border: '1.5px solid rgba(34, 197, 94, 0.4)',
          color: '#4ade80',
          boxShadow: '0 2px 8px rgba(34, 197, 94, 0.15)',
          letterSpacing: '0.3px'
        }}>
          {modalidade}
        </span>
      );
    }
    
    return modalidade;
  };

  // Função para renderizar badge de Sim/Não (Certificado e Procuração)
  const renderSimNaoBadge = (valor) => {
    if (!valor || valor === '-') return '-';
    
    const valorLower = valor.toLowerCase();
    const isSim = valorLower === 'sim';
    const isNao = valorLower === 'não' || valorLower === 'nao';
    
    if (isSim) {
      return (
        <span style={{
          display: 'inline-block',
          padding: '5px 14px',
          borderRadius: '16px',
          fontSize: '11px',
          fontWeight: '600',
          background: 'linear-gradient(135deg, rgba(249, 115, 22, 0.15) 0%, rgba(234, 88, 12, 0.25) 100%)',
          border: '1.5px solid rgba(249, 115, 22, 0.4)',
          color: '#fb923c',
          boxShadow: '0 2px 8px rgba(249, 115, 22, 0.15)',
          letterSpacing: '0.3px'
        }}>
          Sim
        </span>
      );
    }
    
    if (isNao) {
      return (
        <span style={{
          display: 'inline-block',
          padding: '5px 14px',
          borderRadius: '16px',
          fontSize: '11px',
          fontWeight: '600',
          background: 'linear-gradient(135deg, rgba(239, 68, 68, 0.15) 0%, rgba(220, 38, 38, 0.25) 100%)',
          border: '1.5px solid rgba(239, 68, 68, 0.4)',
          color: '#f87171',
          boxShadow: '0 2px 8px rgba(239, 68, 68, 0.15)',
          letterSpacing: '0.3px'
        }}>
          Não
        </span>
      );
    }
    
    return valor;
  };

  return (
    <Layout>
      <div className="animate-fade-in" data-testid="lista-ex-clientes" style={{ maxWidth: '100%', width: '100%', margin: '0', padding: '0 8px' }}>
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-white mb-2" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>
            Ex-Clientes
          </h1>
          <p className="text-gray-300 text-lg">{clientesFiltrados.length} ex-cliente(s) encontrado(s)</p>
        </div>

        <Card className="glass-effect border-blue-500/20">
          <CardHeader>
            <div className="flex gap-4 items-center">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                <Input
                  data-testid="input-busca-ex-cliente"
                  placeholder="Buscar por razão social, fantasia, CNPJ, responsável ou e-mail..."
                  value={busca}
                  onChange={(e) => setBusca(e.target.value)}
                  className="pl-10 bg-white/5 border-blue-500/30 text-white placeholder:text-gray-400"
                />
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
          </CardHeader>
          <CardContent className="p-0">
            {carregando ? (
              <div className="text-center py-8 text-gray-400">Carregando...</div>
            ) : clientesFiltrados.length === 0 ? (
              <div className="text-center py-8 text-gray-400" data-testid="mensagem-sem-ex-clientes">
                {busca ? 'Nenhum ex-cliente encontrado com essa busca' : 'Nenhum ex-cliente cadastrado'}
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
                          className="sticky left-0 z-20 text-left whitespace-nowrap border-r border-blue-500/20"
                          style={{ 
                            fontSize: '15px', 
                            fontWeight: 'bold',
                            color: modoClaro ? '#ffffff' : '#BDD7EE',
                            background: modoClaro 
                              ? '#1E293B' 
                              : 'linear-gradient(to bottom, #222B35 0%, #10151A 100%)',
                            padding: '16px 24px'
                          }}
                        >
                          Razão Social
                        </th>
                        <th className="text-left whitespace-nowrap" style={{ fontSize: '15px', fontWeight: 'bold', color: modoClaro ? '#ffffff' : '#BDD7EE', padding: '16px 24px' }}>Fantasia</th>
                        <th className="text-left whitespace-nowrap" style={{ fontSize: '15px', fontWeight: 'bold', color: modoClaro ? '#ffffff' : '#BDD7EE', padding: '16px 24px' }}>CNPJ/CPF</th>
                        <th className="text-left whitespace-nowrap" style={{ fontSize: '15px', fontWeight: 'bold', color: modoClaro ? '#ffffff' : '#BDD7EE', padding: '16px 24px' }}>CCM</th>
                        <th className="text-left whitespace-nowrap" style={{ fontSize: '15px', fontWeight: 'bold', color: modoClaro ? '#ffffff' : '#BDD7EE', padding: '16px 24px' }}>Natureza Jurídica</th>
                        <th className="text-left whitespace-nowrap" style={{ fontSize: '15px', fontWeight: 'bold', color: modoClaro ? '#ffffff' : '#BDD7EE', padding: '16px 24px' }}>Regime Tributário</th>
                        <th className="text-left whitespace-nowrap" style={{ fontSize: '15px', fontWeight: 'bold', color: modoClaro ? '#ffffff' : '#BDD7EE', padding: '16px 24px' }}>Porte</th>
                        <th className="text-left whitespace-nowrap" style={{ fontSize: '15px', fontWeight: 'bold', color: modoClaro ? '#ffffff' : '#BDD7EE', padding: '16px 24px' }}>Modalidade</th>
                        <th className="text-left whitespace-nowrap" style={{ fontSize: '15px', fontWeight: 'bold', color: modoClaro ? '#ffffff' : '#BDD7EE', padding: '16px 24px' }}>Certificado</th>
                        <th className="text-left whitespace-nowrap" style={{ fontSize: '15px', fontWeight: 'bold', color: modoClaro ? '#ffffff' : '#BDD7EE', padding: '16px 24px' }}>Procuração</th>
                        <th className="text-left whitespace-nowrap" style={{ fontSize: '15px', fontWeight: 'bold', color: modoClaro ? '#ffffff' : '#BDD7EE', padding: '16px 24px' }}>Contrato</th>
                        <th className="text-left whitespace-nowrap" style={{ fontSize: '15px', fontWeight: 'bold', color: modoClaro ? '#ffffff' : '#BDD7EE', padding: '16px 24px' }}>Data Inicial</th>
                        <th className="text-left whitespace-nowrap" style={{ fontSize: '15px', fontWeight: 'bold', color: modoClaro ? '#ffffff' : '#BDD7EE', padding: '16px 24px' }}>Data de Saída</th>
                        <th className="text-left whitespace-nowrap" style={{ fontSize: '15px', fontWeight: 'bold', color: modoClaro ? '#ffffff' : '#BDD7EE', padding: '16px 24px' }}>Responsável</th>
                        <th className="text-left whitespace-nowrap" style={{ fontSize: '15px', fontWeight: 'bold', color: modoClaro ? '#ffffff' : '#BDD7EE', padding: '16px 24px' }}>Telefone</th>
                        <th className="text-left whitespace-nowrap" style={{ fontSize: '15px', fontWeight: 'bold', color: modoClaro ? '#ffffff' : '#BDD7EE', padding: '16px 24px' }}>E-mail</th>
                        <th className="text-center whitespace-nowrap" style={{ fontSize: '15px', fontWeight: 'bold', color: modoClaro ? '#ffffff' : '#BDD7EE', padding: '16px 24px' }}>Ações</th>
                      </tr>
                    </thead>
                    <tbody>
                      {clientesFiltrados.map((cliente, index) => {
                        const bgColorEven = modoClaro ? '#ffffff' : '#333F4F';
                        const bgColorOdd = modoClaro ? '#f9fafb' : '#2a3544';
                        const bgColor = index % 2 === 0 ? bgColorEven : bgColorOdd;
                        const hoverColor = modoClaro ? '#dbeafe' : '#3d4f63';
                        
                        return (
                          <tr 
                            key={cliente.id}
                            data-testid={`ex-cliente-row-${cliente.id}`}
                            className={`
                              ${modoClaro 
                                ? 'border-b border-gray-200' 
                                : 'border-b border-blue-500/20'
                              } transition-colors duration-150 group
                            `}
                            style={{backgroundColor: bgColor}}
                            onMouseEnter={(e) => {
                              e.currentTarget.style.backgroundColor = hoverColor;
                              const firstCell = e.currentTarget.querySelector('td:first-child');
                              if (firstCell) {
                                firstCell.style.backgroundColor = hoverColor;
                              }
                            }}
                            onMouseLeave={(e) => {
                              e.currentTarget.style.backgroundColor = bgColor;
                              const firstCell = e.currentTarget.querySelector('td:first-child');
                              if (firstCell) {
                                firstCell.style.backgroundColor = bgColor;
                              }
                            }}
                          >
                            <td 
                              className={`sticky left-0 whitespace-nowrap z-10 ${
                                modoClaro 
                                  ? 'border-r-2 border-gray-200' 
                                  : 'border-r border-blue-500/20'
                              }`}
                              style={{
                                backgroundColor: bgColor,
                                fontSize: '12px',
                                fontWeight: modoClaro ? 'normal' : '500',
                                color: modoClaro ? '#1f2937' : '#ffffff',
                                padding: '14px 24px'
                              }}
                            >
                              {cliente.razao_social}
                            </td>
                            <td className="whitespace-nowrap" style={{ fontSize: '12px', fontWeight: 'normal', color: modoClaro ? '#1f2937' : '#ffffff', padding: '14px 24px' }}>{cliente.fantasia || '-'}</td>
                            <td className="whitespace-nowrap" style={{ fontSize: '12px', fontWeight: 'normal', color: modoClaro ? '#1f2937' : '#ffffff', padding: '14px 24px' }}>{cliente.cnpj || '-'}</td>
                            <td className="whitespace-nowrap" style={{ fontSize: '12px', fontWeight: 'normal', color: modoClaro ? '#1f2937' : '#ffffff', padding: '14px 24px' }}>{cliente.ccm || '-'}</td>
                            <td className="whitespace-nowrap" style={{ fontSize: '12px', fontWeight: 'normal', color: modoClaro ? '#1f2937' : '#ffffff', padding: '14px 24px' }}>{cliente.natureza_juridica || '-'}</td>
                            <td className="whitespace-nowrap" style={{ fontSize: '12px', fontWeight: 'normal', color: modoClaro ? '#1f2937' : '#ffffff', padding: '14px 24px' }}>{cliente.regime_tributario || '-'}</td>
                            <td className="whitespace-nowrap" style={{ fontSize: '12px', fontWeight: 'normal', color: modoClaro ? '#1f2937' : '#ffffff', padding: '14px 24px' }}>{cliente.porte || '-'}</td>
                            <td className="whitespace-nowrap" style={{ fontSize: '12px', fontWeight: 'normal', color: modoClaro ? '#1f2937' : '#ffffff', padding: '14px 24px' }}>{renderModalidadeBadge(cliente.modalidade)}</td>
                            <td className="whitespace-nowrap" style={{ fontSize: '12px', fontWeight: 'normal', color: modoClaro ? '#1f2937' : '#ffffff', padding: '14px 24px' }}>{renderSimNaoBadge(cliente.certificado)}</td>
                            <td className="whitespace-nowrap" style={{ fontSize: '12px', fontWeight: 'normal', color: modoClaro ? '#1f2937' : '#ffffff', padding: '14px 24px' }}>{renderSimNaoBadge(cliente.procuracao)}</td>
                            <td className="whitespace-nowrap" style={{ fontSize: '12px', fontWeight: 'normal', color: modoClaro ? '#1f2937' : '#ffffff', padding: '14px 24px' }}>{cliente.contrato || '-'}</td>
                            <td className="whitespace-nowrap" style={{ fontSize: '12px', fontWeight: 'normal', color: modoClaro ? '#1f2937' : '#ffffff', padding: '14px 24px' }}>{formatarData(cliente.data_inicial)}</td>
                            <td className="whitespace-nowrap" style={{ fontSize: '12px', fontWeight: 'normal', color: modoClaro ? '#dc2626' : '#f87171', padding: '14px 24px' }}>{formatarData(cliente.data_saida)}</td>
                            <td className="whitespace-nowrap" style={{ fontSize: '12px', fontWeight: 'normal', color: modoClaro ? '#1f2937' : '#ffffff', padding: '14px 24px' }}>{cliente.responsavel || '-'}</td>
                            <td className="whitespace-nowrap" style={{ fontSize: '12px', fontWeight: 'normal', color: modoClaro ? '#1f2937' : '#ffffff', padding: '14px 24px' }}>{cliente.telefone || '-'}</td>
                            <td className="whitespace-nowrap" style={{ fontSize: '12px', fontWeight: 'normal', color: modoClaro ? '#1f2937' : '#ffffff', padding: '14px 24px' }}>{cliente.email || '-'}</td>
                            <td className="text-center whitespace-nowrap" style={{ padding: '14px 24px' }}>
                              <div className="flex gap-2 justify-center">
                                {podeEditar && (
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => navigate(`/cadastro-cliente?id=${cliente.id}`)}
                                    className={modoClaro 
                                      ? 'bg-blue-50 border-blue-200 text-blue-700 hover:bg-blue-100' 
                                      : 'bg-blue-500/10 border-blue-500/30 text-blue-300 hover:bg-blue-500/20'
                                    }
                                  >
                                    <Edit className="h-4 w-4" />
                                  </Button>
                                )}
                                {podeEditar && (
                                  <AlertDialog>
                                    <AlertDialogTrigger asChild>
                                      <Button
                                        variant="outline"
                                        size="sm"
                                        className={modoClaro 
                                          ? 'bg-green-50 border-green-200 text-green-700 hover:bg-green-100' 
                                          : 'bg-green-500/10 border-green-500/30 text-green-300 hover:bg-green-500/20'
                                        }
                                        title="Reativar Cliente"
                                      >
                                        <RotateCcw className="h-4 w-4" />
                                      </Button>
                                    </AlertDialogTrigger>
                                    <AlertDialogContent className="glass-effect border-blue-500/20">
                                      <AlertDialogHeader>
                                        <AlertDialogTitle className="text-white">Reativar Cliente</AlertDialogTitle>
                                        <AlertDialogDescription className="text-gray-300">
                                          Tem certeza que deseja reativar o cliente <strong>{cliente.razao_social}</strong>?
                                          Isso irá remover a data de saída e o cliente voltará para a lista de clientes ativos.
                                        </AlertDialogDescription>
                                      </AlertDialogHeader>
                                      <AlertDialogFooter>
                                        <AlertDialogCancel className="bg-white/5 border-blue-500/30 text-white hover:bg-white/10">
                                          Cancelar
                                        </AlertDialogCancel>
                                        <AlertDialogAction
                                          onClick={() => reativarCliente(cliente.id)}
                                          className="bg-gradient-to-r from-green-500 to-green-600 text-white"
                                        >
                                          Reativar
                                        </AlertDialogAction>
                                      </AlertDialogFooter>
                                    </AlertDialogContent>
                                  </AlertDialog>
                                )}
                                {podeExcluir && (
                                  <AlertDialog>
                                    <AlertDialogTrigger asChild>
                                      <Button
                                        variant="outline"
                                        size="sm"
                                        className={modoClaro 
                                          ? 'bg-red-50 border-red-200 text-red-700 hover:bg-red-100' 
                                          : 'bg-red-500/10 border-red-500/30 text-red-300 hover:bg-red-500/20'
                                        }
                                      >
                                        <Trash2 className="h-4 w-4" />
                                      </Button>
                                    </AlertDialogTrigger>
                                    <AlertDialogContent className="glass-effect border-blue-500/20">
                                      <AlertDialogHeader>
                                        <AlertDialogTitle className="text-white">Confirmar Exclusão</AlertDialogTitle>
                                        <AlertDialogDescription className="text-gray-300">
                                          Tem certeza que deseja excluir permanentemente o cliente <strong>{cliente.razao_social}</strong>?
                                        </AlertDialogDescription>
                                      </AlertDialogHeader>
                                      <AlertDialogFooter>
                                        <AlertDialogCancel className="bg-white/5 border-blue-500/30 text-white hover:bg-white/10">
                                          Cancelar
                                        </AlertDialogCancel>
                                        <AlertDialogAction
                                          onClick={() => deletarCliente(cliente.id)}
                                          className="bg-gradient-to-r from-red-500 to-red-600 text-white"
                                        >
                                          Excluir
                                        </AlertDialogAction>
                                      </AlertDialogFooter>
                                    </AlertDialogContent>
                                  </AlertDialog>
                                )}
                              </div>
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
