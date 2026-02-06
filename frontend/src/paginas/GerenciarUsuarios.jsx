import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { UserPlus, Trash2, Edit, Search, RefreshCw, AlertCircle } from 'lucide-react';
import Layout from '@/componentes/Layout';

export default function GerenciarUsuarios() {
  const [usuarios, setUsuarios] = useState([]);
  const [usuariosFiltrados, setUsuariosFiltrados] = useState([]);
  const [dialogAberto, setDialogAberto] = useState(false);
  const [usuarioEditando, setUsuarioEditando] = useState(null);
  const [carregando, setCarregando] = useState(false);
  const [carregandoLista, setCarregandoLista] = useState(true);
  const [busca, setBusca] = useState('');
  const [erroAPI, setErroAPI] = useState(null);

  const [formData, setFormData] = useState({
    nome: '',
    usuario: '',
    email: '',
    senha: '',
    tipo: 'FISCAL',
    permissoes: {
      consultar: true,
      cadastrar: false,
      editar: false,
      excluir: false
    }
  });

  // ========== FUNÇÃO PARA BUSCAR USUÁRIOS ==========
  const buscarUsuarios = async () => {
    setCarregandoLista(true);
    setErroAPI(null);
    
    try {
      console.log('🔍 Buscando usuários em: /api/usuarios');
      
      const response = await fetch('/api/usuarios', {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' }
      });

      console.log('📡 Status da resposta:', response.status);
      console.log('📡 Headers:', response.headers);

      // Verificar se a resposta é JSON
      const contentType = response.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        const textoResposta = await response.text();
        console.error('❌ Resposta não é JSON:', textoResposta.substring(0, 200));
        
        setErroAPI({
          tipo: 'NAO_JSON',
          mensagem: 'A API retornou HTML ao invés de JSON. A rota /api/usuarios provavelmente não existe no backend.',
          detalhes: `Status: ${response.status}, Content-Type: ${contentType}`
        });
        
        setUsuarios([]);
        setUsuariosFiltrados([]);
        return;
      }

      const data = await response.json();
      console.log('✅ Dados recebidos:', data);

      if (!response.ok) {
        throw new Error(data.error || `Erro HTTP ${response.status}`);
      }

      // Verificar estrutura da resposta
      if (data.usuarios && Array.isArray(data.usuarios)) {
        setUsuarios(data.usuarios);
        setUsuariosFiltrados(data.usuarios);
        setErroAPI(null);
        console.log(`✅ ${data.usuarios.length} usuário(s) carregado(s)`);
      } else {
        console.warn('⚠️ Estrutura inesperada:', data);
        setErroAPI({
          tipo: 'ESTRUTURA_INVALIDA',
          mensagem: 'A API retornou dados em formato inesperado',
          detalhes: 'Esperado: { success: true, usuarios: [...] }'
        });
        setUsuarios([]);
        setUsuariosFiltrados([]);
      }
      
    } catch (error) {
      console.error('❌ Erro ao buscar usuários:', error);
      
      if (error.name === 'SyntaxError') {
        setErroAPI({
          tipo: 'ERRO_JSON',
          mensagem: 'A rota /api/usuarios não existe no backend',
          detalhes: 'Verifique se você criou e registrou a rota no servidor'
        });
      } else {
        setErroAPI({
          tipo: 'ERRO_REDE',
          mensagem: error.message,
          detalhes: 'Verifique se o servidor backend está rodando'
        });
      }
      
      setUsuarios([]);
      setUsuariosFiltrados([]);
    } finally {
      setCarregandoLista(false);
    }
  };

  // ========== CARREGAR USUÁRIOS AO MONTAR COMPONENTE ==========
  useEffect(() => {
    buscarUsuarios();
  }, []);

  // ========== FILTRAR USUÁRIOS PELA BUSCA ==========
  useEffect(() => {
    if (busca.trim() === '') {
      setUsuariosFiltrados(usuarios);
    } else {
      const termo = busca.toLowerCase();
      const filtrados = usuarios.filter(u => 
        u.nome?.toLowerCase().includes(termo) ||
        u.usuario?.toLowerCase().includes(termo) ||
        u.username?.toLowerCase().includes(termo) ||
        u.email?.toLowerCase().includes(termo) ||
        u.tipo?.toLowerCase().includes(termo)
      );
      setUsuariosFiltrados(filtrados);
    }
  }, [busca, usuarios]);

  const limparFormulario = () => {
    setFormData({
      nome: '',
      usuario: '',
      email: '',
      senha: '',
      tipo: 'FISCAL',
      permissoes: {
        consultar: true,
        cadastrar: false,
        editar: false,
        excluir: false
      }
    });
    setUsuarioEditando(null);
  };

  const abrirDialogNovo = () => {
    limparFormulario();
    setDialogAberto(true);
  };

  const abrirDialogEditar = (usuario) => {
    setUsuarioEditando(usuario);
    setFormData({
      nome: usuario.nome,
      usuario: usuario.username || usuario.usuario,
      email: usuario.email,
      senha: '',
      tipo: usuario.tipo,
      permissoes: usuario.permissoes || {
        consultar: true,
        cadastrar: false,
        editar: false,
        excluir: false
      }
    });
    setDialogAberto(true);
  };

  // ========== CRIAR OU EDITAR USUÁRIO ==========
  const handleSubmit = async (e) => {
    e.preventDefault();
    setCarregando(true);

    try {
      const url = usuarioEditando 
        ? `/api/usuarios/${usuarioEditando.id}`
        : '/api/criar-usuario';
      
      const method = usuarioEditando ? 'PUT' : 'POST';

      const body = {
        nome: formData.nome,
        username: formData.usuario,
        email: formData.email,
        tipo: formData.tipo,
        permissoes: formData.permissoes
      };

      if (formData.senha.trim() !== '') {
        body.senha = formData.senha;
      }

      console.log(`📤 ${method} ${url}:`, body);

      const response = await fetch(url, {
        method: method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Erro ao salvar usuário');
      }

      toast.success(usuarioEditando ? 'Usuário atualizado com sucesso!' : 'Usuário criado com sucesso!');
      setDialogAberto(false);
      limparFormulario();
      
      await buscarUsuarios();
      
    } catch (error) {
      console.error('❌ Erro ao salvar:', error);
      toast.error(error.message);
    } finally {
      setCarregando(false);
    }
  };

  // ========== EXCLUIR USUÁRIO ==========
  const handleExcluir = async (id) => {
    try {
      console.log(`🗑️ Excluindo usuário ID: ${id}`);
      
      const response = await fetch(`/api/usuarios/${id}`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' }
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Erro ao excluir usuário');
      }

      toast.success('Usuário excluído com sucesso!');
      await buscarUsuarios();
      
    } catch (error) {
      console.error('❌ Erro ao excluir:', error);
      toast.error(error.message);
    }
  };

  const getTipoBadge = (tipo) => {
    const cores = {
      ADM: 'bg-purple-500/20 text-purple-300 border-purple-500/30',
      FISCAL: 'bg-blue-500/20 text-blue-300 border-blue-500/30',
      CONTABIL: 'bg-green-500/20 text-green-300 border-green-500/30',
      RH: 'bg-orange-500/20 text-orange-300 border-orange-500/30'
    };
    return cores[tipo] || 'bg-gray-500/20 text-gray-300 border-gray-500/30';
  };

  const getTipoTexto = (tipo) => {
    const textos = {
      ADM: 'Administrador',
      FISCAL: 'Fiscal',
      CONTABIL: 'Contábil',
      RH: 'RH'
    };
    return textos[tipo] || tipo;
  };

  return (
    <Layout>
      <div className="animate-fade-in">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-4xl font-bold text-white mb-2">Gerenciar Usuários</h1>
            <p className="text-gray-300 text-lg">
              {carregandoLista ? 'Carregando...' : `${usuarios.length} usuário(s) cadastrado(s)`}
            </p>
          </div>

          <div className="flex gap-3">
            <Button
              onClick={buscarUsuarios}
              variant="outline"
              className="bg-white/5 border-blue-500/30 text-white hover:bg-white/10"
            >
              <RefreshCw className="mr-2 h-4 w-4" />
              Atualizar
            </Button>

            <Dialog open={dialogAberto} onOpenChange={setDialogAberto}>
              <DialogTrigger asChild>
                <Button
                  onClick={abrirDialogNovo}
                  className="bg-gradient-to-r from-purple-500 to-purple-600 text-white"
                >
                  <UserPlus className="mr-2 h-4 w-4" />
                  Novo Usuário
                </Button>
              </DialogTrigger>

              <DialogContent className="glass-effect border-blue-500/20 max-w-2xl">
                <DialogHeader>
                  <DialogTitle className="text-white text-2xl">
                    {usuarioEditando ? 'Editar Usuário' : 'Novo Usuário'}
                  </DialogTitle>
                  <DialogDescription className="text-gray-300">
                    {usuarioEditando ? 'Atualize os dados do usuário' : 'Preencha os dados do usuário'}
                  </DialogDescription>
                </DialogHeader>

                <form onSubmit={handleSubmit}>
                  <div className="space-y-4 py-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label className="text-gray-200">Nome *</Label>
                        <Input
                          value={formData.nome}
                          onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
                          required
                          className="bg-white/5 border-blue-500/30 text-white"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label className="text-gray-200">Username *</Label>
                        <Input
                          value={formData.usuario}
                          onChange={(e) => setFormData({ ...formData, usuario: e.target.value })}
                          required
                          className="bg-white/5 border-blue-500/30 text-white"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label className="text-gray-200">E-mail *</Label>
                        <Input
                          type="email"
                          value={formData.email}
                          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                          required
                          className="bg-white/5 border-blue-500/30 text-white"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label className="text-gray-200">
                          Senha {usuarioEditando ? '(deixe em branco para não alterar)' : '*'}
                        </Label>
                        <Input
                          type="password"
                          value={formData.senha}
                          onChange={(e) => setFormData({ ...formData, senha: e.target.value })}
                          required={!usuarioEditando}
                          className="bg-white/5 border-blue-500/30 text-white"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label className="text-gray-200">Tipo *</Label>
                        <Select value={formData.tipo} onValueChange={(v) => setFormData({ ...formData, tipo: v })}>
                          <SelectTrigger className="bg-white/5 border-blue-500/30 text-white">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="ADM">Administrador</SelectItem>
                            <SelectItem value="FISCAL">Fiscal</SelectItem>
                            <SelectItem value="CONTABIL">Contábil</SelectItem>
                            <SelectItem value="RH">RH</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <div className="pt-4 border-t border-blue-500/20">
                      <Label className="text-gray-200 text-lg mb-4 block">Permissões</Label>

                      {['consultar', 'cadastrar', 'editar', 'excluir'].map((p) => (
                        <div key={p} className="flex items-center justify-between p-3 bg-white/5 rounded-lg mb-2">
                          <span className="text-gray-200 capitalize">{p}</span>
                          <Switch
                            checked={formData.permissoes[p]}
                            onCheckedChange={(checked) =>
                              setFormData({
                                ...formData,
                                permissoes: { ...formData.permissoes, [p]: checked }
                              })
                            }
                          />
                        </div>
                      ))}
                    </div>
                  </div>

                  <DialogFooter>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => {
                        setDialogAberto(false);
                        limparFormulario();
                      }}
                      className="bg-white/5 border-blue-500/30 text-white"
                    >
                      Cancelar
                    </Button>
                    <Button
                      type="submit"
                      disabled={carregando}
                      className="bg-gradient-to-r from-purple-500 to-purple-600 text-white"
                    >
                      {carregando ? 'Salvando...' : usuarioEditando ? 'Atualizar' : 'Criar'}
                    </Button>
                  </DialogFooter>
                </form>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        {/* CARD DE ERRO DA API */}
        {erroAPI && (
          <Card className="glass-effect border-red-500/40 bg-red-500/10 mb-6">
            <CardContent className="pt-6">
              <div className="flex items-start gap-4">
                <AlertCircle className="h-6 w-6 text-red-400 flex-shrink-0 mt-1" />
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-red-300 mb-2">
                    ⚠️ Erro ao conectar com a API
                  </h3>
                  <p className="text-red-200 mb-3">{erroAPI.mensagem}</p>
                  <div className="bg-black/30 p-3 rounded-lg">
                    <p className="text-xs text-red-300 font-mono">{erroAPI.detalhes}</p>
                  </div>
                  
                  <div className="mt-4 p-4 bg-blue-500/10 border border-blue-500/30 rounded-lg">
                    <p className="text-sm text-blue-200 font-semibold mb-2">🔧 Como resolver:</p>
                    <ol className="text-sm text-blue-100 space-y-2 ml-4 list-decimal">
                      <li>Certifique-se que o servidor backend está rodando</li>
                      <li>Verifique se criou o arquivo <code className="bg-black/30 px-1 rounded">listar-usuarios.js</code></li>
                      <li>Verifique se registrou as rotas no <code className="bg-black/30 px-1 rounded">server.js</code></li>
                      <li>Abra o Console (F12) para mais detalhes</li>
                    </ol>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        <Card className="glass-effect border-blue-500/20">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-2xl text-white">Usuários</CardTitle>
              
              {!erroAPI && (
                <div className="relative w-72">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder="Buscar usuário..."
                    value={busca}
                    onChange={(e) => setBusca(e.target.value)}
                    className="pl-10 bg-white/5 border-blue-500/30 text-white"
                  />
                </div>
              )}
            </div>
          </CardHeader>
          
          <CardContent>
            {carregandoLista ? (
              <div className="text-center py-12">
                <RefreshCw className="h-8 w-8 animate-spin text-purple-500 mx-auto mb-4" />
                <p className="text-gray-400">Carregando usuários...</p>
              </div>
            ) : erroAPI ? (
              <div className="text-center py-12">
                <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
                <p className="text-gray-400 text-lg mb-4">
                  Não foi possível carregar os usuários
                </p>
                <Button
                  onClick={buscarUsuarios}
                  className="bg-gradient-to-r from-blue-500 to-blue-600 text-white"
                >
                  <RefreshCw className="mr-2 h-4 w-4" />
                  Tentar novamente
                </Button>
              </div>
            ) : usuariosFiltrados.length === 0 ? (
              <div className="text-center py-12">
                <UserPlus className="h-12 w-12 text-gray-600 mx-auto mb-4" />
                <p className="text-gray-400 text-lg">
                  {busca ? 'Nenhum usuário encontrado' : 'Nenhum usuário cadastrado ainda'}
                </p>
                {busca && (
                  <Button
                    onClick={() => setBusca('')}
                    variant="outline"
                    className="mt-4 bg-white/5 border-blue-500/30 text-white"
                  >
                    Limpar busca
                  </Button>
                )}
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="border-blue-500/20 hover:bg-white/5">
                      <TableHead className="text-gray-300">Nome</TableHead>
                      <TableHead className="text-gray-300">Username</TableHead>
                      <TableHead className="text-gray-300">E-mail</TableHead>
                      <TableHead className="text-gray-300">Tipo</TableHead>
                      <TableHead className="text-gray-300">Permissões</TableHead>
                      <TableHead className="text-gray-300 text-right">Ações</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {usuariosFiltrados.map((usuario) => (
                      <TableRow key={usuario.id} className="border-blue-500/20 hover:bg-white/5">
                        <TableCell className="text-white font-medium">{usuario.nome}</TableCell>
                        <TableCell className="text-gray-300">{usuario.username || usuario.usuario}</TableCell>
                        <TableCell className="text-gray-300">{usuario.email}</TableCell>
                        <TableCell>
                          <Badge className={getTipoBadge(usuario.tipo)}>
                            {getTipoTexto(usuario.tipo)}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex gap-1 flex-wrap">
                            {usuario.permissoes?.consultar && (
                              <Badge variant="outline" className="bg-blue-500/10 text-blue-300 border-blue-500/30 text-xs">
                                Consultar
                              </Badge>
                            )}
                            {usuario.permissoes?.cadastrar && (
                              <Badge variant="outline" className="bg-green-500/10 text-green-300 border-green-500/30 text-xs">
                                Cadastrar
                              </Badge>
                            )}
                            {usuario.permissoes?.editar && (
                              <Badge variant="outline" className="bg-yellow-500/10 text-yellow-300 border-yellow-500/30 text-xs">
                                Editar
                              </Badge>
                            )}
                            {usuario.permissoes?.excluir && (
                              <Badge variant="outline" className="bg-red-500/10 text-red-300 border-red-500/30 text-xs">
                                Excluir
                              </Badge>
                            )}
                          </div>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            <Button
                              onClick={() => abrirDialogEditar(usuario)}
                              variant="outline"
                              size="sm"
                              className="bg-blue-500/10 border-blue-500/30 text-blue-300 hover:bg-blue-500/20"
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            
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
                              <AlertDialogContent className="glass-effect border-red-500/20">
                                <AlertDialogHeader>
                                  <AlertDialogTitle className="text-white">Confirmar exclusão</AlertDialogTitle>
                                  <AlertDialogDescription className="text-gray-300">
                                    Tem certeza que deseja excluir o usuário <strong>{usuario.nome}</strong>? 
                                    Esta ação não pode ser desfeita.
                                  </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                  <AlertDialogCancel className="bg-white/5 border-blue-500/30 text-white">
                                    Cancelar
                                  </AlertDialogCancel>
                                  <AlertDialogAction
                                    onClick={() => handleExcluir(usuario.id)}
                                    className="bg-red-500 hover:bg-red-600 text-white"
                                  >
                                    Excluir
                                  </AlertDialogAction>
                                </AlertDialogFooter>
                              </AlertDialogContent>
                            </AlertDialog>
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
