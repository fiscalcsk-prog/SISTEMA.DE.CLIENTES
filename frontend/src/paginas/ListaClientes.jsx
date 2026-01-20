import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Edit, Trash2, Search, UserPlus, Sun, Moon } from 'lucide-react';

export default function ListaClientes() {
  const [clientes, setClientes] = useState([
    {
      id: 1,
      razao_social: 'Empresa ABC Ltda',
      fantasia: 'ABC',
      cnpj: '12.345.678/0001-90',
      ccm: '123456',
      natureza_juridica: 'Ltda',
      regime_tributario: 'Simples Nacional',
      porte: 'ME',
      modalidade: 'Presencial',
      certificado: 'A1',
      procuracao: 'Sim',
      contrato: 'Ativo',
      data_inicial: '2024-01-15',
      responsavel: 'João Silva',
      telefone: '(11) 98765-4321',
      email: 'contato@abc.com.br'
    },
    {
      id: 2,
      razao_social: 'XYZ Comércio e Serviços S.A.',
      fantasia: 'XYZ',
      cnpj: '98.765.432/0001-10',
      ccm: '654321',
      natureza_juridica: 'S.A.',
      regime_tributario: 'Lucro Real',
      porte: 'EPP',
      modalidade: 'Online',
      certificado: 'A3',
      procuracao: 'Não',
      contrato: 'Ativo',
      data_inicial: '2023-06-20',
      responsavel: 'Maria Santos',
      telefone: '(11) 91234-5678',
      email: 'contato@xyz.com.br'
    }
  ]);
  
  const [clientesFiltrados, setClientesFiltrados] = useState(clientes);
  const [busca, setBusca] = useState('');
  const [carregando, setCarregando] = useState(false);
  const [modoClaro, setModoClaro] = useState(false);

  useEffect(() => {
    filtrarClientes();
  }, [busca, clientes]);

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
    setClientes(clientes.filter(c => c.id !== clienteId));
  };

  const formatarData = (data) => {
    if (!data) return '-';
    return new Date(data).toLocaleDateString('pt-BR');
  };

  const podeEditar = true;
  const podeExcluir = true;
  const podeCadastrar = true;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 p-4">
      <div className="animate-fade-in mx-auto" style={{ maxWidth: '98%', width: '100%' }}>
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-4xl font-bold text-white mb-2" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>
              Clientes Ativos
            </h1>
            <p className="text-gray-300 text-lg">{clientesFiltrados.length} cliente(s) encontrado(s)</p>
          </div>
          {podeCadastrar && (
            <Button
              className="bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white"
            >
              <UserPlus className="mr-2 h-4 w-4" />
              Novo Cliente
            </Button>
          )}
        </div>

        <Card className="border-blue-500/20 bg-slate-800/50 backdrop-blur">
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
                            padding: '16px 16px'
                          }}
                        >
                          Razão Social
                        </th>
                        <th className="text-left whitespace-nowrap" style={{ fontSize: '15px', fontWeight: 'bold', color: modoClaro ? '#ffffff' : '#BDD7EE', padding: '16px 16px' }}>Fantasia</th>
                        <th className="text-left whitespace-nowrap" style={{ fontSize: '15px', fontWeight: 'bold', color: modoClaro ? '#ffffff' : '#BDD7EE', padding: '16px 16px' }}>CNPJ/CPF</th>
                        <th className="text-left whitespace-nowrap" style={{ fontSize: '15px', fontWeight: 'bold', color: modoClaro ? '#ffffff' : '#BDD7EE', padding: '16px 16px' }}>CCM</th>
                        <th className="text-left whitespace-nowrap" style={{ fontSize: '15px', fontWeight: 'bold', color: modoClaro ? '#ffffff' : '#BDD7EE', padding: '16px 16px' }}>Natureza Jurídica</th>
                        <th className="text-left whitespace-nowrap" style={{ fontSize: '15px', fontWeight: 'bold', color: modoClaro ? '#ffffff' : '#BDD7EE', padding: '16px 16px' }}>Regime Tributário</th>
                        <th className="text-left whitespace-nowrap" style={{ fontSize: '15px', fontWeight: 'bold', color: modoClaro ? '#ffffff' : '#BDD7EE', padding: '16px 16px' }}>Porte</th>
                        <th className="text-left whitespace-nowrap" style={{ fontSize: '15px', fontWeight: 'bold', color: modoClaro ? '#ffffff' : '#BDD7EE', padding: '16px 16px' }}>Modalidade</th>
                        <th className="text-left whitespace-nowrap" style={{ fontSize: '15px', fontWeight: 'bold', color: modoClaro ? '#ffffff' : '#BDD7EE', padding: '16px 16px' }}>Certificado</th>
                        <th className="text-left whitespace-nowrap" style={{ fontSize: '15px', fontWeight: 'bold', color: modoClaro ? '#ffffff' : '#BDD7EE', padding: '16px 16px' }}>Procuração</th>
                        <th className="text-left whitespace-nowrap" style={{ fontSize: '15px', fontWeight: 'bold', color: modoClaro ? '#ffffff' : '#BDD7EE', padding: '16px 16px' }}>Contrato</th>
                        <th className="text-left whitespace-nowrap" style={{ fontSize: '15px', fontWeight: 'bold', color: modoClaro ? '#ffffff' : '#BDD7EE', padding: '16px 16px' }}>Data Inicial</th>
                        <th className="text-left whitespace-nowrap" style={{ fontSize: '15px', fontWeight: 'bold', color: modoClaro ? '#ffffff' : '#BDD7EE', padding: '16px 16px' }}>Responsável</th>
                        <th className="text-left whitespace-nowrap" style={{ fontSize: '15px', fontWeight: 'bold', color: modoClaro ? '#ffffff' : '#BDD7EE', padding: '16px 16px' }}>Telefone</th>
                        <th className="text-left whitespace-nowrap" style={{ fontSize: '15px', fontWeight: 'bold', color: modoClaro ? '#ffffff' : '#BDD7EE', padding: '16px 16px' }}>E-mail</th>
                        <th className="text-center whitespace-nowrap" style={{ fontSize: '15px', fontWeight: 'bold', color: modoClaro ? '#ffffff' : '#BDD7EE', padding: '16px 16px' }}>Ações</th>
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
                                padding: '14px 16px'
                              }}
                            >
                              {cliente.razao_social}
                            </td>
                            <td className="whitespace-nowrap" style={{ fontSize: '12px', fontWeight: 'normal', color: modoClaro ? '#1f2937' : '#ffffff', padding: '14px 16px' }}>{cliente.fantasia || '-'}</td>
                            <td className="whitespace-nowrap" style={{ fontSize: '12px', fontWeight: 'normal', color: modoClaro ? '#1f2937' : '#ffffff', padding: '14px 16px' }}>{cliente.cnpj || '-'}</td>
                            <td className="whitespace-nowrap" style={{ fontSize: '12px', fontWeight: 'normal', color: modoClaro ? '#1f2937' : '#ffffff', padding: '14px 16px' }}>{cliente.ccm || '-'}</td>
                            <td className="whitespace-nowrap" style={{ fontSize: '12px', fontWeight: 'normal', color: modoClaro ? '#1f2937' : '#ffffff', padding: '14px 16px' }}>{cliente.natureza_juridica || '-'}</td>
                            <td className="whitespace-nowrap" style={{ fontSize: '12px', fontWeight: 'normal', color: modoClaro ? '#1f2937' : '#ffffff', padding: '14px 16px' }}>{cliente.regime_tributario || '-'}</td>
                            <td className="whitespace-nowrap" style={{ fontSize: '12px', fontWeight: 'normal', color: modoClaro ? '#1f2937' : '#ffffff', padding: '14px 16px' }}>{cliente.porte || '-'}</td>
                            <td className="whitespace-nowrap" style={{ fontSize: '12px', fontWeight: 'normal', color: modoClaro ? '#1f2937' : '#ffffff', padding: '14px 16px' }}>{cliente.modalidade || '-'}</td>
                            <td className="whitespace-nowrap" style={{ fontSize: '12px', fontWeight: 'normal', color: modoClaro ? '#1f2937' : '#ffffff', padding: '14px 16px' }}>{cliente.certificado || '-'}</td>
                            <td className="whitespace-nowrap" style={{ fontSize: '12px', fontWeight: 'normal', color: modoClaro ? '#1f2937' : '#ffffff', padding: '14px 16px' }}>{cliente.procuracao || '-'}</td>
                            <td className="whitespace-nowrap" style={{ fontSize: '12px', fontWeight: 'normal', color: modoClaro ? '#1f2937' : '#ffffff', padding: '14px 16px' }}>{cliente.contrato || '-'}</td>
                            <td className="whitespace-nowrap" style={{ fontSize: '12px', fontWeight: 'normal', color: modoClaro ? '#1f2937' : '#ffffff', padding: '14px 16px' }}>{formatarData(cliente.data_inicial)}</td>
                            <td className="whitespace-nowrap" style={{ fontSize: '12px', fontWeight: 'normal', color: modoClaro ? '#1f2937' : '#ffffff', padding: '14px 16px' }}>{cliente.responsavel || '-'}</td>
                            <td className="whitespace-nowrap" style={{ fontSize: '12px', fontWeight: 'normal', color: modoClaro ? '#1f2937' : '#ffffff', padding: '14px 16px' }}>{cliente.telefone || '-'}</td>
                            <td className="whitespace-nowrap" style={{ fontSize: '12px', fontWeight: 'normal', color: modoClaro ? '#1f2937' : '#ffffff', padding: '14px 16px' }}>{cliente.email || '-'}</td>
                            <td className="text-center whitespace-nowrap" style={{ padding: '14px 16px' }}>
                              <div className="flex gap-2 justify-center">
                                {podeEditar && (
                                  <Button
                                    variant="outline"
                                    size="sm"
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
                                    <AlertDialogContent className="bg-slate-800 border-blue-500/20">
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
    </div>
  );
}
