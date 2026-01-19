import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { Edit, Trash2, Search, UserPlus } from 'lucide-react';
import Layout from '@/componentes/Layout';
import { supabase } from '@/lib/supabase';

export default function ListaClientes() {
  const navigate = useNavigate();
  const usuario = JSON.parse(localStorage.getItem('usuario') || '{}');

  const [clientes, setClientes] = useState([]);
  const [clientesFiltrados, setClientesFiltrados] = useState([]);
  const [busca, setBusca] = useState('');
  const [carregando, setCarregando] = useState(true);

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
      cliente.responsavel?.toLowerCase().includes(buscaLower)
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

  const getStatusBadge = (status) => {
    const cores = {
      ATIVO: 'bg-green-500/20 text-green-300 border-green-500/30',
      INATIVO: 'bg-red-500/20 text-red-300 border-red-500/30',
      PROBONO: 'bg-blue-500/20 text-blue-300 border-blue-500/30',
    };
    return cores[status] || 'bg-gray-500/20 text-gray-300 border-gray-500/30';
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
            <div className="relative flex-1">
              <Search className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
              <Input
                placeholder="Buscar por razão social, fantasia, CNPJ ou responsável..."
                value={busca}
                onChange={(e) => setBusca(e.target.value)}
                className="pl-10 bg-white/5 border-blue-500/30 text-white placeholder:text-gray-400"
              />
            </div>
          </CardHeader>
          <CardContent>
            {carregando ? (
              <div className="text-center py-8 text-gray-400">Carregando...</div>
            ) : clientesFiltrados.length === 0 ? (
              <div className="text-center py-8 text-gray-400">
                {busca ? 'Nenhum cliente encontrado com essa busca' : 'Nenhum cliente cadastrado'}
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="border-blue-500/20 hover:bg-white/5">
                      <TableHead className="text-gray-300">Razão Social</TableHead>
                      <TableHead className="text-gray-300">Fantasia</TableHead>
                      <TableHead className="text-gray-300">CNPJ</TableHead>
                      <TableHead className="text-gray-300">CCM</TableHead>
                      <TableHead className="text-gray-300">Responsável</TableHead>
                      <TableHead className="text-gray-300">Telefone</TableHead>
                      <TableHead className="text-gray-300">E-mail</TableHead>
                      <TableHead className="text-gray-300">Modalidade</TableHead>
                      <TableHead className="text-gray-300">Contrato</TableHead>
                      <TableHead className="text-gray-300">Data Inicial</TableHead>
                      <TableHead className="text-gray-300">Ações</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {clientesFiltrados.map((cliente) => (
                      <TableRow key={cliente.id} className="border-blue-500/20 hover:bg-white/5">
                        <TableCell className="text-white font-medium">{cliente.razao_social}</TableCell>
                        <TableCell className="text-gray-300">{cliente.fantasia || '-'}</TableCell>
                        <TableCell className="text-gray-300">{cliente.cnpj}</TableCell>
                        <TableCell className="text-gray-300">{cliente.ccm || '-'}</TableCell>
                        <TableCell className="text-gray-300">{cliente.responsavel || '-'}</TableCell>
                        <TableCell className="text-gray-300">{cliente.telefone || '-'}</TableCell>
                        <TableCell className="text-gray-300 max-w-[200px] truncate">{cliente.email || '-'}</TableCell>
                        <TableCell className="text-gray-300">{cliente.modalidade || '-'}</TableCell>
                        <TableCell className="text-gray-300">{cliente.contrato || '-'}</TableCell>
                        <TableCell className="text-gray-300">{formatarData(cliente.data_inicial)}</TableCell>
                        <TableCell className="text-right">
                          <div className="flex gap-2 justify-end">
                            {podeEditar && (
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => navigate(`/cadastro-cliente?id=${cliente.id}`)}
                                className="bg-blue-500/10 border-blue-500/30 text-blue-300 hover:bg-blue-500/20"
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
                                    className="bg-red-500/10 border-red-500/30 text-red-300 hover:bg-red-500/20"
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
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
}
