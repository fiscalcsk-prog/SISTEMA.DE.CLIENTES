import { useState, useEffect } from 'react';
import axios from 'axios';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { API } from '@/App';
import { Search } from 'lucide-react';
import Layout from '@/componentes/Layout';

export default function ListaExClientes() {
  const [clientes, setClientes] = useState([]);
  const [clientesFiltrados, setClientesFiltrados] = useState([]);
  const [busca, setBusca] = useState('');
  const [carregando, setCarregando] = useState(true);

  useEffect(() => {
    carregarExClientes();
  }, []);

  useEffect(() => {
    filtrarClientes();
  }, [busca, clientes]);

  const carregarExClientes = async () => {
    try {
      const response = await axios.get(`${API}/clientes/ex-clientes`);
      setClientes(response.data);
      setClientesFiltrados(response.data);
    } catch (error) {
      toast.error('Erro ao carregar ex-clientes');
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
      cliente.razao_social.toLowerCase().includes(buscaLower) ||
      cliente.cnpj.toLowerCase().includes(buscaLower) ||
      cliente.nome_responsavel.toLowerCase().includes(buscaLower)
    );
    setClientesFiltrados(filtrados);
  };

  const formatarData = (dataISO) => {
    if (!dataISO) return '-';
    try {
      return new Date(dataISO).toLocaleDateString('pt-BR');
    } catch {
      return '-';
    }
  };

  return (
    <Layout>
      <div className="animate-fade-in" data-testid="lista-ex-clientes">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-white mb-2" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>
            Ex-Clientes
          </h1>
          <p className="text-gray-300 text-lg">{clientesFiltrados.length} ex-cliente(s) encontrado(s)</p>
        </div>

        <Card className="glass-effect border-blue-500/20">
          <CardHeader>
            <div className="flex items-center gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                <Input
                  data-testid="input-busca-ex-cliente"
                  placeholder="Buscar por razão social, CNPJ ou responsável..."
                  value={busca}
                  onChange={(e) => setBusca(e.target.value)}
                  className="pl-10 bg-white/5 border-blue-500/30 text-white placeholder:text-gray-400"
                />
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {carregando ? (
              <div className="text-center py-8 text-gray-400">Carregando...</div>
            ) : clientesFiltrados.length === 0 ? (
              <div className="text-center py-8 text-gray-400" data-testid="mensagem-sem-ex-clientes">
                {busca ? 'Nenhum ex-cliente encontrado com essa busca' : 'Nenhum ex-cliente cadastrado'}
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="border-blue-500/20 hover:bg-white/5">
                      <TableHead className="text-gray-300">Razão Social</TableHead>
                      <TableHead className="text-gray-300">CNPJ</TableHead>
                      <TableHead className="text-gray-300">Responsável</TableHead>
                      <TableHead className="text-gray-300">Data Inicial</TableHead>
                      <TableHead className="text-gray-300">Data Saída</TableHead>
                      <TableHead className="text-gray-300">Porte</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {clientesFiltrados.map((cliente) => (
                      <TableRow key={cliente.id} className="border-blue-500/20 hover:bg-white/5" data-testid={`ex-cliente-row-${cliente.id}`}>
                        <TableCell className="text-white font-medium">{cliente.razao_social}</TableCell>
                        <TableCell className="text-gray-300">{cliente.cnpj}</TableCell>
                        <TableCell className="text-gray-300">{cliente.nome_responsavel}</TableCell>
                        <TableCell className="text-gray-300">{formatarData(cliente.data_inicial)}</TableCell>
                        <TableCell className="text-red-300 font-medium">{formatarData(cliente.data_saida)}</TableCell>
                        <TableCell className="text-gray-300">{cliente.porte_empresa}</TableCell>
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