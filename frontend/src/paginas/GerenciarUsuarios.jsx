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

  const handleSubmit = async (e) => {
    e.preventDefault();
    setCarregando(true);

    try {
      const response = await fetch('/api/criar-usuario', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          nome: formData.nome,
          username: formData.usuario,
          email: formData.email,
          senha: formData.senha,
          tipo: formData.tipo,
          permissoes: formData.permissoes
        })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Erro ao criar usuário');
      }

      toast.success('Usuário criado com sucesso!');
      setDialogAberto(false);
      limparFormulario();
    } catch (error) {
      toast.error(error.message);
    } finally {
      setCarregando(false);
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

  return (
    <Layout>
      <div className="animate-fade-in">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-4xl font-bold text-white mb-2">Gerenciar Usuários</h1>
            <p className="text-gray-300 text-lg">{usuarios.length} usuário(s)</p>
          </div>

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
                  Preencha os dados do usuário
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
                      <Label className="text-gray-200">Senha *</Label>
                      <Input
                        type="password"
                        value={formData.senha}
                        onChange={(e) => setFormData({ ...formData, senha: e.target.value })}
                        required
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
                    onClick={() => setDialogAberto(false)}
                    className="bg-white/5 border-blue-500/30 text-white"
                  >
                    Cancelar
                  </Button>
                  <Button
                    type="submit"
                    disabled={carregando}
                    className="bg-gradient-to-r from-purple-500 to-purple-600 text-white"
                  >
                    {carregando ? 'Salvando...' : 'Criar'}
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        <Card className="glass-effect border-blue-500/20">
          <CardHeader>
            <CardTitle className="text-2xl text-white">Usuários</CardTitle>
          </CardHeader>
          <CardContent>
            {usuarios.length === 0 && (
              <div className="text-center py-8 text-gray-400">
                Nenhum usuário cadastrado ainda
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
}
