import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { toast } from 'sonner';
import { Edit, Trash2, Search, UserPlus, Sun, Moon } from 'lucide-react';
import Layout from '@/componentes/Layout';
import { supabase } from '@/lib/supabase';

export default function ListaClientes() {
  const navigate = useNavigate();
  const usuario = JSON.parse(localStorage.getItem('usuario') || '{}');

  const [clientes, setClientes] = useState([]);
  const [clientesFiltrados, setClientesFiltrados] = useState([]);
  const [busca, setBusca] = useState('');
  const [carregando, setCarregando] = useState(true);
  const [modoClaro, setModoClaro] = useState(false);

  useEffect(() => {
    carregarClientes();
  }, []);

  useEffect(() => {
    filtrarClientes();
  }, [busca, clientes]);

  const carregarClientes = async () => {
    try {
      const { data, error } = await supabase
        .from('clientes')
        .select('*')
        .order('razao_social', { ascending: true });

      if (error) {
        console.error('Erro ao carregar clientes:', error);
        throw error;
      }

      setClientes(data || []);
      setClientesFiltrados(data || []);
    } catch (error) {
      console.error('Erro detalhado:', error);
      toast.error('Erro ao carregar clientes: ' + (error.message || 'Erro desconhecido'));
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

  const deletarCliente = async (clienteId) => {
    try {
      const { error } = await supabase
        .from('clientes')
        .delete()
        .eq('id', clienteId);

      if (error) throw error;

      toast.success('Cliente deletado com sucesso!');
      carregarClientes();
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
  const podeCadastrar = usuario.permissoes?.cadastrar || usuario.tipo === 'ADM';

  return (
    <Layout>
      <div className="animate-fade-in" data-testid="lista-clientes">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-4xl font-bold text-white mb-2" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>
              Clientes Ativos
            </h1>
            <p className="text-gray-300 text-lg">{clientesFiltrados.length} cliente(s) encontrado(s)</p>
          </div>
          {podeCadastrar && (
            <Button
              onClick={() => navigate('/cadastro-cliente')}
              className="bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white"
            >
              <UserPlus className="mr-2 h-4 w-4" />
              Novo Cliente
            </Button>
          )}
        </div>

        <Card className="glass-effect border-blue-500/20">
          <CardHeader>
            <div className="flex gap-4 items-center">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                <Input
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
              <div className="text-center py-8 text-gray-400">
                {busca ? 'Nenhum cliente encontrado com essa busca' : 'Nenhum cliente cadastrado'}
              </div>
            ) : (
              <div className="overflow-x-auto">
                <div className={`min-w-full ${modoClaro ? 'bg-white' : ''}`}>
                  <table className="w-full border-collapse">
                    <thead className={`sticky top-0 z-10 ${modoClaro ? 'bg-gradient-to-r from-slate-50 to-gray-50' : ''}`} style={!modoClaro ? {backgroundColor: '#222B35'} : {}}>
                      <tr className={modoClaro ? 'border-b-2 border-gray-200' : 'border-b border-blue-500/20'}>
                        <th className={`sticky left-0 z-20 px-4 py-4 text-left text-sm font-semibold whitespace-nowrap ${modoClaro ? 'bg-gradient-to-r from-slate-50 to-gray-50 text-gray-800 border-r-2 border-gray-200' : 'border-r border-blue-500/20'}`} style={!modoClaro ? {backgroundColor: '#222B35', color: '#8EA9DB'} : {}}>
                          Razão Social
                        </th>
                        <th className={`px-4 py-4 text-left text-sm font-semibold whitespace-nowrap ${modoClaro ? 'text-gray-700' : ''}`} style={!modoClaro ? {color: '#8EA9DB'} : {}}>Fantasia</th>
                        <th className={`px-4 py-4 text-left text-sm font-semibold whitespace-nowrap ${modoClaro ? 'text-gray-700' : ''}`} style={!modoClaro ? {color: '#8EA9DB'} : {}}>CNPJ/CPF</th>
                        <th className={`px-4 py-4 text-left text-sm font-semibold whitespace-nowrap ${modoClaro ? 'text-gray-700' : ''}`} style={!modoClaro ? {color: '#8EA9DB'} : {}}>CCM</th>
                        <th className={`px-4 py-4 text-left text-sm font-semibold whitespace-nowrap ${modoClaro ? 'text-gray-700' : ''}`} style={!modoClaro ? {color: '#8EA9DB'} : {}}>Natureza Jurídica</th>
                        <th className={`px-4 py-4 text-left text-sm font-semibold whitespace-nowrap ${modoClaro ? 'text-gray-700' : ''}`} style={!modoClaro ? {color: '#8EA9DB'} : {}}>Regime Tributário</th>
                        <th className={`px-4 py-4 text-left text-sm font-semibold whitespace-nowrap ${modoClaro ? 'text-gray-700' : ''}`} style={!modoClaro ? {color: '#8EA9DB'} : {}}>Porte</th>
                        <th className={`px-4 py-4 text-left text-sm font-semibold whitespace-nowrap ${modoClaro ? 'text-gray-700' : ''}`} style={!modoClaro ? {color: '#8EA9DB'} : {}}>Modalidade</th>
                        <th className={`px-4 py-4 text-left text-sm font-semibold whitespace-nowrap ${modoClaro ? 'text-gray-700' : ''}`} style={!modoClaro ? {color: '#8EA9DB'} : {}}>Certificado</th>
                        <th className={`px-4 py-4 text-left text-sm font-semibold whitespace-nowrap ${modoClaro ? 'text-gray-700' : ''}`} style={!modoClaro ? {color: '#8EA9DB'} : {}}>Procuração</th>
                        <th className={`px-4 py-4 text-left text-sm font-semibold whitespace-nowrap ${modoClaro ? 'text-gray-700' : ''}`} style={!modoClaro ? {color: '#8EA9DB'} : {}}>Contrato</th>
                        <th className={`px-4 py-4 text-left text-sm font-semibold whitespace-nowrap ${modoClaro ? 'text-gray-700' : ''}`} style={!modoClaro ? {color: '#8EA9DB'} : {}}>Data Inicial</th>
                        <th className={`px-4 py-4 text-left text-sm font-semibold whitespace-nowrap ${modoClaro ? 'text-gray-700' : ''}`} style={!modoClaro ? {color: '#8EA9DB'} : {}}>Data de Saída</th>
                        <th className={`px-4 py-4 text-left text-sm font-semibold whitespace-nowrap ${modoClaro ? 'text-gray-700' : ''}`} style={!modoClaro ? {color: '#8EA9DB'} : {}}>Responsável</th>
                        <th className={`px-4 py-4 text-left text-sm font-semibold whitespace-nowrap ${modoClaro ? 'text-gray-700' : ''}`} style={!modoClaro ? {color: '#8EA9DB'} : {}}>Telefone</th>
                        <th className={`px-4 py-4 text-left text-sm font-semibold whitespace-nowrap ${modoClaro ? 'text-gray-700' : ''}`} style={!modoClaro ? {color: '#8EA9DB'} : {}}>E-mail</th>
                        <th className={`px-4 py-4 text-center text-sm font-semibold whitespace-nowrap ${modoClaro ? 'text-gray-700' : ''}`} style={!modoClaro ? {color: '#8EA9DB'} : {}}>Ações</th>
                      </tr>
                    </thead>
                    <tbody>
                      {clientesFiltrados.map((cliente, index) => (
                        <tr 
                          key={cliente.id} 
                          className={`
                            ${modoClaro 
                              ? `border-b border-gray-200 hover:bg-blue-50` 
                              : 'border-b border-blue-500/20 hover:bg-white/5'
                            } transition-colors duration-150 group
                          `}
                          style={!modoClaro ? {backgroundColor: index % 2 === 0 ? '#222B35' : '#1a2129'} : {backgroundColor: index % 2 === 0 ? '#ffffff' : '#f9fafb'}}
                        >
                          <td 
                            className={`sticky left-0 z-10 px-4 py-3 font-medium whitespace-nowrap ${modoClaro ? 'text-gray-900 border-r-2 border-gray-200 group-hover:bg-blue-50' : 'text-white border-r border-blue-500/20'}`}
                            style={!modoClaro ? {backgroundColor: index % 2 === 0 ? '#222B35' : '#1a2129'} : {}}
                          >
                            {cliente.razao_social}
                          </td>
                          <td className={`px-4 py-3 whitespace-nowrap ${modoClaro ? 'text-gray-700' : 'text-gray-300'}`}>{cliente.fantasia || '-'}</td>
                          <td className={`px-4 py-3 whitespace-nowrap ${modoClaro ? 'text-gray-700' : 'text-gray-300'}`}>{cliente.cnpj || '-'}</td>
                          <td className={`px-4 py-3 whitespace-nowrap ${modoClaro ? 'text-gray-700' : 'text-gray-300'}`}>{cliente.ccm || '-'}</td>
                          <td className={`px-4 py-3 whitespace-nowrap ${modoClaro ? 'text-gray-700' : 'text-gray-300'}`}>{cliente.natureza_juridica || '-'}</td>
                          <td className={`px-4 py-3 whitespace-nowrap ${modoClaro ? 'text-gray-700' : 'text-gray-300'}`}>{cliente.regime_tributario || '-'}</td>
                          <td className={`px-4 py-3 whitespace-nowrap ${modoClaro ? 'text-gray-700' : 'text-gray-300'}`}>{cliente.porte || '-'}</td>
                          <td className={`px-4 py-3 whitespace-nowrap ${modoClaro ? 'text-gray-700' : 'text-gray-300'}`}>{cliente.modalidade || '-'}</td>
                          <td className={`px-4 py-3 whitespace-nowrap ${modoClaro ? 'text-gray-700' : 'text-gray-300'}`}>{cliente.certificado || '-'}</td>
                          <td className={`px-4 py-3 whitespace-nowrap ${modoClaro ? 'text-gray-700' : 'text-gray-300'}`}>{cliente.procuracao || '-'}</td>
                          <td className={`px-4 py-3 whitespace-nowrap ${modoClaro ? 'text-gray-700' : 'text-gray-300'}`}>{cliente.contrato || '-'}</td>
                          <td className={`px-4 py-3 whitespace-nowrap ${modoClaro ? 'text-gray-700' : 'text-gray-300'}`}>{formatarData(cliente.data_inicial)}</td>
                          <td className={`px-4 py-3 whitespace-nowrap ${modoClaro ? 'text-gray-700' : 'text-gray-300'}`}>{formatarData(cliente.data_saida)}</td>
                          <td className={`px-4 py-3 whitespace-nowrap ${modoClaro ? 'text-gray-700' : 'text-gray-300'}`}>{cliente.responsavel || '-'}</td>
                          <td className={`px-4 py-3 whitespace-nowrap ${modoClaro ? 'text-gray-700' : 'text-gray-300'}`}>{cliente.telefone || '-'}</td>
                          <td className={`px-4 py-3 whitespace-nowrap ${modoClaro ? 'text-gray-700' : 'text-gray-300'}`}>{cliente.email || '-'}</td>
                          <td className="px-4 py-3 text-center whitespace-nowrap">
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
                                        Tem certeza que deseja excluir o cliente <strong>{cliente.razao_social}</strong>?
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
                      ))}
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
