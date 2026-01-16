import { useState, useEffect } from 'react';
import axios from 'axios';
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
import { API } from '@/App';
import { UserPlus, Trash2, Edit } from 'lucide-react';
import Layout from '@/componentes/Layout';

export default function GerenciarUsuarios() {
  const [usuarios, setUsuarios] = useState([]);
  const [dialogAberto, setDialogAberto] = useState(false);
  const [usuarioEditando, setUsuarioEditando] = useState(null);
  const [carregando, setCarregando] = useState(false);

  const [formData, setFormData] = useState({
    nome: '',
    usuario: '',
    senha: '',
    tipo: 'FISCAL',
    permissoes: {
      consultar: true,
      cadastrar: false,
      editar: false,
      excluir: false
    }
  });

  useEffect(() => {
    carregarUsuarios();
  }, []);

  const carregarUsuarios = async () => {
    try {
      const response = await axios.get(`${API}/usuarios`);
      setUsuarios(response.data);
    } catch (error) {
      toast.error('Erro ao carregar usuários');
    }
  };

  const limparFormulario = () => {
    setFormData({
      nome: '',
      usuario: '',
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
      usuario: usuario.usuario,
      senha: '',
      tipo: usuario.tipo,
      permissoes: usuario.permissoes
    });
    setDialogAberto(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setCarregando(true);

    try {
      if (usuarioEditando) {
        await axios.put(`${API}/usuarios/${usuarioEditando.id}`, formData);
        toast.success('Usuário atualizado com sucesso!');
      } else {
        await axios.post(`${API}/usuarios`, formData);
        toast.success('Usuário criado com sucesso!');
      }

      setDialogAberto(false);
      limparFormulario();
      carregarUsuarios();
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Erro ao salvar usuário');
    } finally {
      setCarregando(false);
    }
  };

  const deletarUsuario = async (usuarioId) => {
    try {
      await axios.delete(`${API}/usuarios/${usuarioId}`);
      toast.success('Usuário deletado com sucesso!');
      carregarUsuarios();
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Erro ao deletar usuário');
    }
  };

  const getTipoBadge = (tipo) => {
    const cores = {
      'ADM': 'bg-purple-500/20 text-purple-300 border-purple-500/30',
      'FISCAL': 'bg-blue-500/20 text-blue-300 border-blue-500/30',
      'CONTABIL': 'bg-green-500/20 text-green-300 border-green-500/30',
      'RH': 'bg-orange-500/20 text-orange-300 border-orange-500/30'
    };
    return cores[tipo] || 'bg-gray-500/20 text-gray-300 border-gray-500/30';
  };

  return (
    <Layout>
      <div className="animate-fade-in" data-testid="gerenciar-usuarios">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-4xl font-bold text-white mb-2" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>
              Gerenciar Usuários
            </h1>
            <p className="text-gray-300 text-lg">{usuarios.length} usuário(s) cadastrado(s)</p>
          </div>

          <Dialog open={dialogAberto} onOpenChange={setDialogAberto}>
            <DialogTrigger asChild>
              <Button
                onClick={abrirDialogNovo}
                className="bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 text-white"
                data-testid="btn-novo-usuario"
              >
                <UserPlus className="mr-2 h-4 w-4" />
                Novo Usuário
              </Button>
            </DialogTrigger>
            <DialogContent className="glass-effect border-blue-500/20 max-w-2xl" data-testid="dialog-usuario">
              <DialogHeader>
                <DialogTitle className="text-white text-2xl">
                  {usuarioEditando ? 'Editar Usuário' : 'Novo Usuário'}
                </DialogTitle>
                <DialogDescription className="text-gray-300">
                  {usuarioEditando ? 'Atualize as informações do usuário' : 'Preencha os dados do novo usuário'}
                </DialogDescription>
              </DialogHeader>

              <form onSubmit={handleSubmit}>
                <div className="space-y-4 py-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="nome" className="text-gray-200">Nome Completo *</Label>
                      <Input
                        id="nome"
                        data-testid="input-nome-usuario"
                        value={formData.nome}
                        onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
                        required
                        className="bg-white/5 border-blue-500/30 text-white"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="usuario" className="text-gray-200">Nome de Usuário *</Label>
                      <Input
                        id="usuario"
                        data-testid="input-usuario-login"
                        value={formData.usuario}
                        onChange={(e) => setFormData({ ...formData, usuario: e.target.value })}
                        required
                        className="bg-white/5 border-blue-500/30 text-white"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="senha" className="text-gray-200">
                        Senha {usuarioEditando ? '(deixe em branco para manter)' : '*'}
                      </Label>
                      <Input
                        id="senha"
                        data-testid="input-senha-usuario"
                        type="password"
                        value={formData.senha}
                        onChange={(e) => setFormData({ ...formData, senha: e.target.value })}
                        required={!usuarioEditando}
                        className="bg-white/5 border-blue-500/30 text-white"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="tipo" className="text-gray-200">Tipo de Usuário *</Label>
                      <Select value={formData.tipo} onValueChange={(value) => setFormData({ ...formData, tipo: value })} required>
                        <SelectTrigger data-testid="select-tipo-usuario" className="bg-white/5 border-blue-500/30 text-white">
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
                    <div className="space-y-3">
                      <div className="flex items-center justify-between p-3 bg-white/5 rounded-lg">
                        <Label htmlFor="perm-consultar" className="text-gray-200 cursor-pointer">Consultar</Label>
                        <Switch
                          id="perm-consultar"
                          data-testid="switch-consultar"
                          checked={formData.permissoes.consultar}
                          onCheckedChange={(checked) => setFormData({
                            ...formData,
                            permissoes: { ...formData.permissoes, consultar: checked }
                          })}
                        />
                      </div>

                      <div className="flex items-center justify-between p-3 bg-white/5 rounded-lg">
                        <Label htmlFor="perm-cadastrar" className="text-gray-200 cursor-pointer">Cadastrar</Label>
                        <Switch
                          id="perm-cadastrar"
                          data-testid="switch-cadastrar"
                          checked={formData.permissoes.cadastrar}
                          onCheckedChange={(checked) => setFormData({
                            ...formData,
                            permissoes: { ...formData.permissoes, cadastrar: checked }
                          })}
                        />
                      </div>

                      <div className="flex items-center justify-between p-3 bg-white/5 rounded-lg">
                        <Label htmlFor="perm-editar" className="text-gray-200 cursor-pointer">Editar</Label>
                        <Switch
                          id="perm-editar"
                          data-testid="switch-editar"
                          checked={formData.permissoes.editar}
                          onCheckedChange={(checked) => setFormData({
                            ...formData,
                            permissoes: { ...formData.permissoes, editar: checked }
                          })}
                        />
                      </div>

                      <div className="flex items-center justify-between p-3 bg-white/5 rounded-lg">
                        <Label htmlFor="perm-excluir" className="text-gray-200 cursor-pointer">Excluir</Label>
                        <Switch
                          id="perm-excluir"
                          data-testid="switch-excluir"
                          checked={formData.permissoes.excluir}
                          onCheckedChange={(checked) => setFormData({
                            ...formData,
                            permissoes: { ...formData.permissoes, excluir: checked }
                          })}
                        />
                      </div>
                    </div>
                  </div>
                </div>

                <DialogFooter>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setDialogAberto(false)}
                    className="bg-white/5 border-blue-500/30 text-white hover:bg-white/10"
                    data-testid="btn-cancelar-usuario"
                  >
                    Cancelar
                  </Button>
                  <Button
                    type="submit"
                    disabled={carregando}
                    className="bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 text-white"
                    data-testid="btn-salvar-usuario"
                  >
                    {carregando ? 'Salvando...' : (usuarioEditando ? 'Atualizar' : 'Criar')}
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        <Card className="glass-effect border-blue-500/20">
          <CardHeader>
            <CardTitle className="text-2xl text-white">Usuários do Sistema</CardTitle>
          </CardHeader>
          <CardContent>
            {usuarios.length === 0 ? (
              <div className="text-center py-8 text-gray-400">Nenhum usuário cadastrado</div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="border-blue-500/20 hover:bg-white/5">
                      <TableHead className="text-gray-300">Nome</TableHead>
                      <TableHead className="text-gray-300">Usuário</TableHead>
                      <TableHead className="text-gray-300">Tipo</TableHead>
                      <TableHead className="text-gray-300">Permissões</TableHead>
                      <TableHead className="text-gray-300 text-right">Ações</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {usuarios.map((usuario) => (
                      <TableRow key={usuario.id} className="border-blue-500/20 hover:bg-white/5" data-testid={`usuario-row-${usuario.id}`}>
                        <TableCell className="text-white font-medium">{usuario.nome}</TableCell>
                        <TableCell className="text-gray-300">{usuario.usuario}</TableCell>
                        <TableCell>
                          <Badge className={getTipoBadge(usuario.tipo)}>{usuario.tipo}</Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex gap-1 flex-wrap">
                            {usuario.permissoes.consultar && (
                              <Badge className="bg-blue-500/10 text-blue-300 border-blue-500/20 text-xs">Consultar</Badge>
                            )}
                            {usuario.permissoes.cadastrar && (
                              <Badge className="bg-green-500/10 text-green-300 border-green-500/20 text-xs">Cadastrar</Badge>
                            )}
                            {usuario.permissoes.editar && (
                              <Badge className="bg-yellow-500/10 text-yellow-300 border-yellow-500/20 text-xs">Editar</Badge>
                            )}
                            {usuario.permissoes.excluir && (
                              <Badge className="bg-red-500/10 text-red-300 border-red-500/20 text-xs">Excluir</Badge>
                            )}
                          </div>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex gap-2 justify-end">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => abrirDialogEditar(usuario)}
                              data-testid={`btn-editar-usuario-${usuario.id}`}
                              className="bg-blue-500/10 border-blue-500/30 text-blue-300 hover:bg-blue-500/20"
                            >
                              <Edit className="h-4 w-4" />
                            </Button>

                            <AlertDialog>
                              <AlertDialogTrigger asChild>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  data-testid={`btn-excluir-usuario-${usuario.id}`}
                                  className="bg-red-500/10 border-red-500/30 text-red-300 hover:bg-red-500/20"
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </AlertDialogTrigger>
                              <AlertDialogContent className="glass-effect border-blue-500/20">
                                <AlertDialogHeader>
                                  <AlertDialogTitle className="text-white">Confirmar Exclusão</AlertDialogTitle>
                                  <AlertDialogDescription className="text-gray-300">
                                    Tem certeza que deseja excluir o usuário <strong>{usuario.nome}</strong>?
                                  </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                  <AlertDialogCancel className="bg-white/5 border-blue-500/30 text-white hover:bg-white/10">Cancelar</AlertDialogCancel>
                                  <AlertDialogAction
                                    onClick={() => deletarUsuario(usuario.id)}
                                    className="bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white"
                                    data-testid={`btn-confirmar-excluir-usuario-${usuario.id}`}
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