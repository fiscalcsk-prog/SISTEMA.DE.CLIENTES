import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { toast } from 'sonner';
import { Edit, Trash2, Search, UserPlus, Sun, Moon, Upload, Download } from 'lucide-react';
import Layout from '@/componentes/Layout';
import { supabase } from '@/lib/supabase';

export default function ListaClientes() {
  const navigate = useNavigate();
  const usuario = JSON.parse(localStorage.getItem('usuario') || '{}');
  const fileInputRef = useRef(null);

  const [clientes, setClientes] = useState([]);
  const [clientesFiltrados, setClientesFiltrados] = useState([]);
  const [busca, setBusca] = useState('');
  const [carregando, setCarregando] = useState(true);
  const [modoClaro, setModoClaro] = useState(false);
  const [importando, setImportando] = useState(false);

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
        .is('data_saida', null)
        .order('razao_social', { ascending: true });

      if (error) throw error;
      setClientes(data || []);
      setClientesFiltrados(data || []);
    } catch (error) {
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
      const { error } = await supabase.from('clientes').delete().eq('id', clienteId);
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

  const exportarCSV = () => {
    try {
      const headers = ['razao_social','fantasia','cnpj','ccm','natureza_juridica','regime_tributario','porte','modalidade','certificado','procuracao','contrato','data_inicial','responsavel','telefone','email'];
      const linhas = clientesFiltrados.map(cliente => {
        return headers.map(header => {
          let valor = cliente[header] || '';
          if (header === 'data_inicial' && valor) valor = new Date(valor).toLocaleDateString('pt-BR');
          if (valor.toString().includes(';') || valor.toString().includes('"') || valor.toString().includes('\n')) {
            valor = `"${valor.toString().replace(/"/g, '""')}"`;
          }
          return valor;
        }).join(';');
      });
      const csv = [headers.join(';'), ...linhas].join('\n');
      const blob = new Blob(['\ufeff' + csv], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      const url = URL.createObjectURL(blob);
      link.setAttribute('href', url);
      link.setAttribute('download', `clientes_${new Date().toISOString().split('T')[0]}.csv`);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      toast.success(`${clientesFiltrados.length} cliente(s) exportado(s) com sucesso!`);
    } catch (error) {
      toast.error('Erro ao exportar CSV');
    }
  };

  const importarCSV = async (event) => {
    const file = event.target.files[0];
    if (!file) return;
    setImportando(true);
    try {
      const text = await file.text();
      const linhas = text.split('\n').filter(linha => linha.trim());
      if (linhas.length < 2) {
        toast.error('Arquivo CSV vazio ou inválido');
        return;
      }
      const headers = linhas[0].split(';').map(h => h.trim().replace(/"/g, ''));
      const clientesParaInserir = [];
      for (let i = 1; i < linhas.length; i++) {
        const valores = linhas[i].split(';').map(v => v.trim().replace(/^"|"$/g, ''));
        const cliente = {};
        headers.forEach((header, index) => {
          const valor = valores[index] || null;
          if (header === 'data_inicial' && valor) {
            const partes = valor.split('/');
            if (partes.length === 3) {
              cliente[header] = `${partes[2]}-${partes[1].padStart(2, '0')}-${partes[0].padStart(2, '0')}`;
            } else {
              cliente[header] = valor;
            }
          } else {
            cliente[header] = valor;
          }
        });
        if (cliente.razao_social) clientesParaInserir.push(cliente);
      }
      if (clientesParaInserir.length === 0) {
        toast.error('Nenhum cliente válido para importar');
        return;
      }
      const { error } = await supabase.from('clientes').insert(clientesParaInserir);
      if (error) throw error;
      toast.success(`${clientesParaInserir.length} cliente(s) importado(s) com sucesso!`);
      carregarClientes();
    } catch (error) {
      toast.error('Erro ao importar CSV');
    } finally {
      setImportando(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const podeEditar = usuario.permissoes?.editar || usuario.tipo === 'ADM';
  const podeExcluir = usuario.permissoes?.excluir || usuario.tipo === 'ADM';
  const podeCadastrar = usuario.permissoes?.cadastrar || usuario.tipo === 'ADM';

  const renderModalidadeBadge = (modalidade) => {
    if (!modalidade || modalidade === '-') return '-';
    const isProBono = modalidade.toLowerCase().includes('pró-bono') || modalidade.toLowerCase().includes('pro-bono');
    const isPaga = modalidade.toLowerCase().includes('paga');
    if (isProBono) {
      return <span style={{display:'inline-block',padding:'5px 14px',borderRadius:'16px',fontSize:'11px',fontWeight:'600',background:'linear-gradient(135deg, rgba(59,130,246,0.15) 0%, rgba(37,99,235,0.25) 100%)',border:'1.5px solid rgba(59,130,246,0.4)',color:'#60a5fa',boxShadow:'0 2px 8px rgba(59,130,246,0.15)',letterSpacing:'0.3px'}}>{modalidade}</span>;
    }
    if (isPaga) {
      return <span style={{display:'inline-block',padding:'5px 14px',borderRadius:'16px',fontSize:'11px',fontWeight:'600',background:'linear-gradient(135deg, rgba(34,197,94,0.15) 0%, rgba(22,163,74,0.25) 100%)',border:'1.5px solid rgba(34,197,94,0.4)',color:'#4ade80',boxShadow:'0 2px 8px rgba(34,197,94,0.15)',letterSpacing:'0.3px'}}>{modalidade}</span>;
    }
    return modalidade;
  };

  const renderSimNaoBadge = (valor) => {
    if (!valor || valor === '-') return '-';
    const valorLower = valor.toLowerCase();
    if (valorLower === 'sim') {
      return <span style={{display:'inline-block',padding:'5px 14px',borderRadius:'16px',fontSize:'11px',fontWeight:'600',background:'linear-gradient(135deg, rgba(249,115,22,0.15) 0%, rgba(234,88,12,0.25) 100%)',border:'1.5px solid rgba(249,115,22,0.4)',color:'#fb923c',boxShadow:'0 2px 8px rgba(249,115,22,0.15)',letterSpacing:'0.3px'}}>Sim</span>;
    }
    if (valorLower === 'não' || valorLower === 'nao') {
      return <span style={{display:'inline-block',padding:'5px 14px',borderRadius:'16px',fontSize:'11px',fontWeight:'600',background:'linear-gradient(135deg, rgba(239,68,68,0.15) 0%, rgba(220,38,38,0.25) 100%)',border:'1.5px solid rgba(239,68,68,0.4)',color:'#f87171',boxShadow:'0 2px 8px rgba(239,68,68,0.15)',letterSpacing:'0.3px'}}>Não</span>;
    }
    return valor;
  };

  return (
    <Layout>
      <div style={{ width: '100%', padding: 0, margin: 0 }}> {/* ZERO PADDING - Largura total */}
        <div style={{ padding: '0 19px', marginBottom: '15px' }}> {/* Padding APENAS no cabeçalho */}
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-4xl font-bold text-white mb-2" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>Clientes Ativos</h1>
              <p className="text-gray-300 text-lg">{clientesFiltrados.length} cliente(s) encontrado(s)</p>
            </div>
            <div className="flex gap-2">
            {podeCadastrar && (
              <>
                <input ref={fileInputRef} type="file" accept=".csv" onChange={importarCSV} style={{ display: 'none' }} />
                <Button onClick={() => fileInputRef.current?.click()} disabled={importando} className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white">
                  <Upload className="mr-2 h-4 w-4" />{importando ? 'Importando...' : 'Importar CSV'}
                </Button>
                <Button onClick={exportarCSV} disabled={clientesFiltrados.length === 0} className="bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 text-white">
                  <Download className="mr-2 h-4 w-4" />Exportar CSV
                </Button>
                <Button onClick={() => navigate('/cadastro-cliente')} className="bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white">
                  <UserPlus className="mr-2 h-4 w-4" />Novo Cliente
                </Button>
              </>
            )}
          </div>
        </div>

        <Card className="glass-effect border-blue-500/20" style={{ margin: '0 8px' }}> {/* Margem APENAS no Card */}
          <CardHeader>
            <div className="flex gap-4 items-center">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                <Input placeholder="Buscar por razão social, fantasia, CNPJ, responsável ou e-mail..." value={busca} onChange={(e) => setBusca(e.target.value)} className="pl-10 bg-white/5 border-blue-500/30 text-white placeholder:text-gray-400" />
              </div>
              <Button variant="outline" size="icon" onClick={() => setModoClaro(!modoClaro)} className="bg-white/5 border-blue-500/30 text-white hover:bg-white/10" title={modoClaro ? "Modo Escuro" : "Modo Claro"}>
                {modoClaro ? <Moon className="h-5 w-5" /> : <Sun className="h-5 w-5" />}
              </Button>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            {carregando ? (
              <div className="text-center py-8 text-gray-400">Carregando...</div>
            ) : clientesFiltrados.length === 0 ? (
              <div className="text-center py-8 text-gray-400">{busca ? 'Nenhum cliente encontrado' : 'Nenhum cliente cadastrado'}</div>
            ) : (
              <div style={{ height: 'calc(100vh - 350px)', overflow: 'auto', position: 'relative', width: '100%' }}> {/* Largura 100% */}
                <table style={{ width: '100%', minWidth: '100%', borderCollapse: 'collapse', backgroundColor: modoClaro ? '#ffffff' : '#333F4F' }}> {/* Tabela 100% largura */}
                  <thead style={{ position: 'sticky', top: 0, zIndex: 100, background: modoClaro ? '#1E293B' : 'linear-gradient(to bottom, #222B35 0%, #10151A 100%)' }}>
                    <tr className={modoClaro ? 'border-b-2 border-gray-200' : 'border-b border-blue-500/20'}>
                      <th style={{position:'sticky',left:0,zIndex:101,fontSize:'15px',fontWeight:'bold',color:modoClaro?'#fff':'#BDD7EE',background:modoClaro?'#1E293B':'linear-gradient(to bottom, #222B35 0%, #10151A 100%)',padding:'16px 24px',textAlign:'left',whiteSpace:'nowrap',borderRight:'1px solid rgba(96,165,250,0.2)'}}>Razão Social</th>
                      <th style={{fontSize:'15px',fontWeight:'bold',color:modoClaro?'#fff':'#BDD7EE',padding:'16px 24px',textAlign:'left',whiteSpace:'nowrap'}}>Fantasia</th>
                      <th style={{fontSize:'15px',fontWeight:'bold',color:modoClaro?'#fff':'#BDD7EE',padding:'16px 24px',textAlign:'left',whiteSpace:'nowrap'}}>CNPJ/CPF</th>
                      <th style={{fontSize:'15px',fontWeight:'bold',color:modoClaro?'#fff':'#BDD7EE',padding:'16px 24px',textAlign:'left',whiteSpace:'nowrap'}}>CCM</th>
                      <th style={{fontSize:'15px',fontWeight:'bold',color:modoClaro?'#fff':'#BDD7EE',padding:'16px 24px',textAlign:'left',whiteSpace:'nowrap'}}>Natureza Jurídica</th>
                      <th style={{fontSize:'15px',fontWeight:'bold',color:modoClaro?'#fff':'#BDD7EE',padding:'16px 24px',textAlign:'left',whiteSpace:'nowrap'}}>Regime Tributário</th>
                      <th style={{fontSize:'15px',fontWeight:'bold',color:modoClaro?'#fff':'#BDD7EE',padding:'16px 24px',textAlign:'left',whiteSpace:'nowrap'}}>Porte</th>
                      <th style={{fontSize:'15px',fontWeight:'bold',color:modoClaro?'#fff':'#BDD7EE',padding:'16px 24px',textAlign:'left',whiteSpace:'nowrap'}}>Modalidade</th>
                      <th style={{fontSize:'15px',fontWeight:'bold',color:modoClaro?'#fff':'#BDD7EE',padding:'16px 24px',textAlign:'left',whiteSpace:'nowrap'}}>Certificado</th>
                      <th style={{fontSize:'15px',fontWeight:'bold',color:modoClaro?'#fff':'#BDD7EE',padding:'16px 24px',textAlign:'left',whiteSpace:'nowrap'}}>Procuração</th>
                      <th style={{fontSize:'15px',fontWeight:'bold',color:modoClaro?'#fff':'#BDD7EE',padding:'16px 24px',textAlign:'left',whiteSpace:'nowrap'}}>Contrato</th>
                      <th style={{fontSize:'15px',fontWeight:'bold',color:modoClaro?'#fff':'#BDD7EE',padding:'16px 24px',textAlign:'left',whiteSpace:'nowrap'}}>Data Inicial</th>
                      <th style={{fontSize:'15px',fontWeight:'bold',color:modoClaro?'#fff':'#BDD7EE',padding:'16px 24px',textAlign:'left',whiteSpace:'nowrap'}}>Responsável</th>
                      <th style={{fontSize:'15px',fontWeight:'bold',color:modoClaro?'#fff':'#BDD7EE',padding:'16px 24px',textAlign:'left',whiteSpace:'nowrap'}}>Telefone</th>
                      <th style={{fontSize:'15px',fontWeight:'bold',color:modoClaro?'#fff':'#BDD7EE',padding:'16px 24px',textAlign:'left',whiteSpace:'nowrap'}}>E-mail</th>
                      <th style={{fontSize:'15px',fontWeight:'bold',color:modoClaro?'#fff':'#BDD7EE',padding:'16px 24px',textAlign:'center',whiteSpace:'nowrap'}}>Ações</th>
                    </tr>
                  </thead>
                  <tbody>
                    {clientesFiltrados.map((cliente, index) => {
                      const bgColorEven = modoClaro ? '#ffffff' : '#333F4F';
                      const bgColorOdd = modoClaro ? '#f9fafb' : '#2a3544';
                      const bgColor = index % 2 === 0 ? bgColorEven : bgColorOdd;
                      const hoverColor = modoClaro ? '#dbeafe' : '#3d4f63';
                      return (
                        <tr key={cliente.id} className={modoClaro ? 'border-b border-gray-200' : 'border-b border-blue-500/20'} style={{backgroundColor:bgColor}} onMouseEnter={(e)=>{e.currentTarget.style.backgroundColor=hoverColor;const f=e.currentTarget.querySelector('td:first-child');if(f)f.style.backgroundColor=hoverColor;}} onMouseLeave={(e)=>{e.currentTarget.style.backgroundColor=bgColor;const f=e.currentTarget.querySelector('td:first-child');if(f)f.style.backgroundColor=bgColor;}}>
                          <td style={{position:'sticky',left:0,zIndex:10,backgroundColor:bgColor,fontSize:'12px',fontWeight:modoClaro?'normal':'500',color:modoClaro?'#1f2937':'#fff',padding:'14px 24px',whiteSpace:'nowrap',borderRight:modoClaro?'2px solid #e5e7eb':'1px solid rgba(96,165,250,0.2)'}}>{cliente.razao_social}</td>
                          <td style={{fontSize:'12px',fontWeight:'normal',color:modoClaro?'#1f2937':'#fff',padding:'14px 24px',whiteSpace:'nowrap'}}>{cliente.fantasia||'-'}</td>
                          <td style={{fontSize:'12px',fontWeight:'normal',color:modoClaro?'#1f2937':'#fff',padding:'14px 24px',whiteSpace:'nowrap'}}>{cliente.cnpj||'-'}</td>
                          <td style={{fontSize:'12px',fontWeight:'normal',color:modoClaro?'#1f2937':'#fff',padding:'14px 24px',whiteSpace:'nowrap'}}>{cliente.ccm||'-'}</td>
                          <td style={{fontSize:'12px',fontWeight:'normal',color:modoClaro?'#1f2937':'#fff',padding:'14px 24px',whiteSpace:'nowrap'}}>{cliente.natureza_juridica||'-'}</td>
                          <td style={{fontSize:'12px',fontWeight:'normal',color:modoClaro?'#1f2937':'#fff',padding:'14px 24px',whiteSpace:'nowrap'}}>{cliente.regime_tributario||'-'}</td>
                          <td style={{fontSize:'12px',fontWeight:'normal',color:modoClaro?'#1f2937':'#fff',padding:'14px 24px',whiteSpace:'nowrap'}}>{cliente.porte||'-'}</td>
                          <td style={{fontSize:'12px',fontWeight:'normal',color:modoClaro?'#1f2937':'#fff',padding:'14px 24px',whiteSpace:'nowrap'}}>{renderModalidadeBadge(cliente.modalidade)}</td>
                          <td style={{fontSize:'12px',fontWeight:'normal',color:modoClaro?'#1f2937':'#fff',padding:'14px 24px',whiteSpace:'nowrap'}}>{renderSimNaoBadge(cliente.certificado)}</td>
                          <td style={{fontSize:'12px',fontWeight:'normal',color:modoClaro?'#1f2937':'#fff',padding:'14px 24px',whiteSpace:'nowrap'}}>{renderSimNaoBadge(cliente.procuracao)}</td>
                          <td style={{fontSize:'12px',fontWeight:'normal',color:modoClaro?'#1f2937':'#fff',padding:'14px 24px',whiteSpace:'nowrap'}}>{cliente.contrato||'-'}</td>
                          <td style={{fontSize:'12px',fontWeight:'normal',color:modoClaro?'#1f2937':'#fff',padding:'14px 24px',whiteSpace:'nowrap'}}>{formatarData(cliente.data_inicial)}</td>
                          <td style={{fontSize:'12px',fontWeight:'normal',color:modoClaro?'#1f2937':'#fff',padding:'14px 24px',whiteSpace:'nowrap'}}>{cliente.responsavel||'-'}</td>
                          <td style={{fontSize:'12px',fontWeight:'normal',color:modoClaro?'#1f2937':'#fff',padding:'14px 24px',whiteSpace:'nowrap'}}>{cliente.telefone||'-'}</td>
                          <td style={{fontSize:'12px',fontWeight:'normal',color:modoClaro?'#1f2937':'#fff',padding:'14px 24px',whiteSpace:'nowrap'}}>{cliente.email||'-'}</td>
                          <td style={{padding:'14px 24px',textAlign:'center',whiteSpace:'nowrap'}}>
                            <div className="flex gap-2 justify-center">
                              {podeEditar && <Button variant="outline" size="sm" onClick={()=>navigate(`/cadastro-cliente?id=${cliente.id}`)} className={modoClaro?'bg-blue-50 border-blue-200 text-blue-700 hover:bg-blue-100':'bg-blue-500/10 border-blue-500/30 text-blue-300 hover:bg-blue-500/20'}><Edit className="h-4 w-4"/></Button>}
                              {podeExcluir && (
                                <AlertDialog>
                                  <AlertDialogTrigger asChild>
                                    <Button variant="outline" size="sm" className={modoClaro?'bg-red-50 border-red-200 text-red-700 hover:bg-red-100':'bg-red-500/10 border-red-500/30 text-red-300 hover:bg-red-500/20'}><Trash2 className="h-4 w-4"/></Button>
                                  </AlertDialogTrigger>
                                  <AlertDialogContent className="glass-effect border-blue-500/20">
                                    <AlertDialogHeader>
                                      <AlertDialogTitle className="text-white">Confirmar Exclusão</AlertDialogTitle>
                                      <AlertDialogDescription className="text-gray-300">Tem certeza que deseja excluir o cliente <strong>{cliente.razao_social}</strong>?</AlertDialogDescription>
                                    </AlertDialogHeader>
                                    <AlertDialogFooter>
                                      <AlertDialogCancel className="bg-white/5 border-blue-500/30 text-white hover:bg-white/10">Cancelar</AlertDialogCancel>
                                      <AlertDialogAction onClick={()=>deletarCliente(cliente.id)} className="bg-gradient-to-r from-red-500 to-red-600 text-white">Excluir</AlertDialogAction>
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
            )}
          </CardContent>
        </Card>
      </div>
      </div> {/* Fecha div wrapper */}
    </Layout>
  );
}
