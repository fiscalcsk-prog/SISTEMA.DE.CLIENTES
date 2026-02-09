import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '../componentes/Layout';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  UserPlus, 
  Search, 
  AlertCircle, 
  RefreshCw, 
  User, 
  Mail, 
  Shield,
  Eye,
  FileText,
  Edit,
  Trash2,
  CheckCircle2,
  XCircle,
  Save,
  X as CloseIcon
} from 'lucide-react';

export default function GerenciarUsuarios() {
  const [usuarios, setUsuarios] = useState([]);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState(null);
  const [busca, setBusca] = useState('');
  const navigate = useNavigate();

  // Estados do modal de edição
  const [modalAberto, setModalAberto] = useState(false);
  const [usuarioEditando, setUsuarioEditando] = useState(null);
  const [salvando, setSalvando] = useState(false);
  const [formData, setFormData] = useState({
    nome: '',
    username: '',
    tipo: '',
    permissoes: {
      consultar: false,
      cadastrar: false,
      editar: false,
      excluir: false
    }
  });

  const carregarUsuarios = async () => {
    setCarregando(true);
    setErro(null);
    
    try {
      const response = await fetch('/api/usuarios');
      
      if (!response.ok) {
        throw new Error(`Erro HTTP: ${response.status}`);
      }

      const data = await response.json();
      
      if (data.usuarios) {
        setUsuarios(data.usuarios);
      } else {
        throw new Error('Formato de resposta inválido');
      }
    } catch (error) {
      console.error('Erro ao carregar usuários:', error);
      setErro(error.message);
    } finally {
      setCarregando(false);
    }
  };

  // Abrir modal de edição
  const abrirModalEdicao = (usuario) => {
    setUsuarioEditando(usuario);
    setFormData({
      nome: usuario.nome || '',
      username: usuario.username || '',
      tipo: usuario.tipo || 'USUARIO',
      permissoes: {
        consultar: usuario.permissoes?.consultar || false,
        cadastrar: usuario.permissoes?.cadastrar || false,
        editar: usuario.permissoes?.editar || false,
        excluir: usuario.permissoes?.excluir || false
      }
    });
    setModalAberto(true);
  };

  // Fechar modal
  const fecharModal = () => {
    setModalAberto(false);
    setUsuarioEditando(null);
    setSalvando(false);
  };

  // Salvar edição
  const salvarEdicao = async () => {
    setSalvando(true);
    
    try {
      const response = await fetch(`/api/atualizar-usuario`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          id: usuarioEditando.id,
          ...formData
        })
      });

      if (!response.ok) {
        throw new Error('Erro ao atualizar usuário');
      }

      // Recarregar lista
      await carregarUsuarios();
      fecharModal();
      
      alert('Usuário atualizado com sucesso!');
    } catch (error) {
      console.error('Erro ao salvar:', error);
      alert('Erro ao atualizar usuário. Tente novamente.');
    } finally {
      setSalvando(false);
    }
  };

  // Excluir usuário
  const excluirUsuario = async (usuario) => {
    if (!window.confirm(`Deseja realmente excluir ${usuario.nome}?`)) {
      return;
    }

    try {
      const response = await fetch(`/api/excluir-usuario`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ id: usuario.id })
      });

      if (!response.ok) {
        throw new Error('Erro ao excluir usuário');
      }

      // Recarregar lista
      await carregarUsuarios();
      alert('Usuário excluído com sucesso!');
    } catch (error) {
      console.error('Erro ao excluir:', error);
      alert('Erro ao excluir usuário. Tente novamente.');
    }
  };

  useEffect(() => {
    carregarUsuarios();
  }, []);

  // Filtrar usuários pela busca
  const usuariosFiltrados = usuarios.filter(usuario => 
    usuario.nome?.toLowerCase().includes(busca.toLowerCase()) ||
    usuario.username?.toLowerCase().includes(busca.toLowerCase()) ||
    usuario.tipo?.toLowerCase().includes(busca.toLowerCase())
  );

  // Função para obter cor do badge baseado no tipo
  const getBadgeStyle = (tipo) => {
    switch(tipo) {
      case 'ADM':
        return {
          bg: 'bg-blue-500/20',
          border: 'border-blue-500/50',
          text: 'text-blue-300'
        };
      case 'FISCAL':
        return {
          bg: 'bg-purple-500/20',
          border: 'border-purple-500/50',
          text: 'text-purple-300'
        };
      case 'USUARIO':
        return {
          bg: 'bg-green-500/20',
          border: 'border-green-500/50',
          text: 'text-green-300'
        };
      default:
        return {
          bg: 'bg-slate-500/20',
          border: 'border-slate-500/50',
          text: 'text-slate-300'
        };
    }
  };

  // Função para renderizar ícones de permissões com cores diferentes
  const renderPermissoes = (permissoes) => {
    if (!permissoes) return null;
    
    const permissoesLista = [
      { 
        key: 'consultar', 
        label: 'Consultar', 
        icon: Eye,
        colors: {
          active: { bg: 'bg-blue-500/20', text: 'text-blue-300', border: 'border-blue-500/40' },
          inactive: { bg: 'bg-blue-500/5', text: 'text-blue-400/30', border: 'border-blue-500/10' }
        }
      },
      { 
        key: 'cadastrar', 
        label: 'Cadastrar', 
        icon: UserPlus,
        colors: {
          active: { bg: 'bg-green-500/20', text: 'text-green-300', border: 'border-green-500/40' },
          inactive: { bg: 'bg-green-500/5', text: 'text-green-400/30', border: 'border-green-500/10' }
        }
      },
      { 
        key: 'editar', 
        label: 'Editar', 
        icon: Edit,
        colors: {
          active: { bg: 'bg-amber-500/20', text: 'text-amber-300', border: 'border-amber-500/40' },
          inactive: { bg: 'bg-amber-500/5', text: 'text-amber-400/30', border: 'border-amber-500/10' }
        }
      },
      { 
        key: 'excluir', 
        label: 'Excluir', 
        icon: Trash2,
        colors: {
          active: { bg: 'bg-red-500/20', text: 'text-red-300', border: 'border-red-500/40' },
          inactive: { bg: 'bg-red-500/5', text: 'text-red-400/30', border: 'border-red-500/10' }
        }
      }
    ];

    return (
      <div className="flex flex-wrap gap-1.5 mt-2">
        {permissoesLista.map(({ key, label, icon: Icon, colors }) => {
          const isActive = permissoes[key];
          const colorSet = isActive ? colors.active : colors.inactive;
          
          return (
            <div
              key={key}
              className={`flex items-center gap-1 px-2 py-1 rounded-md text-xs border ${colorSet.bg} ${colorSet.text} ${colorSet.border}`}
              title={`${label}: ${isActive ? 'Ativado' : 'Desativado'}`}
            >
              <Icon size={11} />
              <span className="text-[10px] font-medium">{label}</span>
              {isActive ? <CheckCircle2 size={10} /> : <XCircle size={10} />}
            </div>
          );
        })}
      </div>
    );
  };

  return (
    <Layout>
      <div className="min-h-screen p-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h1 
                className="text-4xl font-bold mb-2"
                style={{
                  fontFamily: 'Space Grotesk, sans-serif',
                  background: 'linear-gradient(135deg, #60a5fa 0%, #3b82f6 100%)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  backgroundClip: 'text'
                }}
              >
                Gerenciar Usuários
              </h1>
              <p className="text-slate-400">
                {carregando ? 'Carregando...' : `${usuariosFiltrados.length} usuário(s) cadastrado(s)`}
              </p>
            </div>

            <div className="flex gap-3">
              <Button
                onClick={carregarUsuarios}
                variant="outline"
                className="bg-blue-500/10 border-blue-500/30 text-blue-300 hover:bg-blue-500/20"
                disabled={carregando}
              >
                <RefreshCw className={`mr-2 h-4 w-4 ${carregando ? 'animate-spin' : ''}`} />
                Atualizar
              </Button>
              
              <Button
                onClick={() => navigate('/cadastro-usuario')}
                className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white shadow-lg shadow-blue-500/30"
              >
                <UserPlus className="mr-2 h-4 w-4" />
                Novo Usuário
              </Button>
            </div>
          </div>

          {/* Barra de Busca */}
          <div className="mt-6 relative">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-slate-400" size={20} />
            <input
              type="text"
              placeholder="Buscar por nome, username ou tipo..."
              value={busca}
              onChange={(e) => setBusca(e.target.value)}
              className="w-full pl-12 pr-4 py-3 rounded-xl border border-blue-500/20 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all"
              style={{
                background: 'linear-gradient(135deg, rgba(15, 23, 42, 0.6) 0%, rgba(30, 41, 59, 0.4) 100%)',
                backdropFilter: 'blur(10px)'
              }}
            />
          </div>
        </div>

        {/* Estado de Erro */}
        {erro && (
          <div 
            className="mb-6 p-4 rounded-xl border border-red-500/30 flex items-start gap-3"
            style={{
              background: 'linear-gradient(135deg, rgba(239, 68, 68, 0.1) 0%, rgba(220, 38, 38, 0.05) 100%)'
            }}
          >
            <AlertCircle className="text-red-400 mt-0.5" size={20} />
            <div>
              <h3 className="text-red-300 font-semibold mb-1">⚠️ Erro ao conectar com a API</h3>
              <p className="text-red-400/80 text-sm mb-3">{erro}</p>
              <div className="text-sm text-red-400/60 space-y-1">
                <p className="font-semibold">✓ Como resolver:</p>
                <ol className="list-decimal list-inside space-y-1 ml-2">
                  <li>Certifique-se que o servidor backend está rodando</li>
                  <li>Verifique se criou o arquivo <code className="bg-red-500/20 px-1 rounded">api/usuarios.js</code></li>
                  <li>Verifique se registrou as rotas no <code className="bg-red-500/20 px-1 rounded">server.js</code></li>
                  <li>Abra o Console (F12) para mais detalhes</li>
                </ol>
              </div>
            </div>
          </div>
        )}

        {/* Estado de Carregamento */}
        {carregando && (
          <div className="flex flex-col items-center justify-center py-20">
            <RefreshCw className="animate-spin text-blue-400 mb-4" size={48} />
            <p className="text-slate-400 text-lg">Carregando usuários...</p>
          </div>
        )}

        {/* Estado Vazio */}
        {!carregando && !erro && usuariosFiltrados.length === 0 && (
          <div className="flex flex-col items-center justify-center py-20">
            <div 
              className="w-24 h-24 rounded-full flex items-center justify-center mb-6"
              style={{
                background: 'linear-gradient(135deg, rgba(59, 130, 246, 0.2) 0%, rgba(37, 99, 235, 0.1) 100%)',
                border: '2px solid rgba(59, 130, 246, 0.3)'
              }}
            >
              <User className="text-blue-400" size={40} />
            </div>
            <h3 className="text-xl font-semibold text-white mb-2">
              {busca ? 'Nenhum usuário encontrado' : 'Nenhum usuário cadastrado'}
            </h3>
            <p className="text-slate-400 mb-6">
              {busca 
                ? 'Tente ajustar os filtros de busca' 
                : 'Comece cadastrando seu primeiro usuário'}
            </p>
            {!busca && (
              <Button
                onClick={() => navigate('/cadastro-usuario')}
                className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700"
              >
                <UserPlus className="mr-2 h-4 w-4" />
                Cadastrar Primeiro Usuário
              </Button>
            )}
          </div>
        )}

        {/* Grid de Cards - Cards menores e mais compridos */}
        {!carregando && !erro && usuariosFiltrados.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {usuariosFiltrados.map((usuario) => {
              const badgeStyle = getBadgeStyle(usuario.tipo);
              
              return (
                <Card
                  key={usuario.id}
                  className="border-blue-500/20 transition-all duration-300 hover:scale-[1.02] hover:shadow-xl hover:shadow-blue-500/10 group"
                  style={{
                    background: 'linear-gradient(135deg, rgba(15, 23, 42, 0.8) 0%, rgba(30, 41, 59, 0.6) 100%)',
                    backdropFilter: 'blur(15px)'
                  }}
                >
                  <CardHeader className="pb-2 pt-4 px-4">
                    <div className="flex items-start justify-between mb-2">
                      <div 
                        className="w-12 h-12 rounded-lg flex items-center justify-center text-lg font-bold transition-all duration-300 group-hover:scale-110"
                        style={{
                          background: 'linear-gradient(135deg, rgba(59, 130, 246, 0.3) 0%, rgba(37, 99, 235, 0.2) 100%)',
                          border: '2px solid rgba(59, 130, 246, 0.4)',
                          color: '#60a5fa'
                        }}
                      >
                        {usuario.nome?.charAt(0).toUpperCase() || 'U'}
                      </div>
                      
                      <div 
                        className={`px-2 py-1 rounded-md text-[10px] font-semibold border ${badgeStyle.bg} ${badgeStyle.border} ${badgeStyle.text}`}
                      >
                        {usuario.tipo || 'N/A'}
                      </div>
                    </div>

                    <CardTitle className="text-base text-white font-bold leading-tight">
                      {usuario.nome || 'Nome não disponível'}
                    </CardTitle>
                    
                    <CardDescription className="text-slate-400 flex items-center gap-1.5 mt-1 text-xs">
                      <User size={12} />
                      @{usuario.username || 'username'}
                    </CardDescription>
                  </CardHeader>

                  <CardContent className="px-4 pb-3">
                    {/* Permissões */}
                    <div>
                      <p className="text-[10px] text-slate-400 mb-1 font-semibold uppercase tracking-wide">Permissões:</p>
                      {renderPermissoes(usuario.permissoes)}
                    </div>
                  </CardContent>

                  <CardFooter className="gap-1.5 pt-3 px-4 pb-4 border-t border-blue-500/10">
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex-1 bg-amber-500/10 border-amber-500/30 text-amber-300 hover:bg-amber-500/20 h-8 text-xs"
                      onClick={() => abrirModalEdicao(usuario)}
                    >
                      <Edit className="mr-1 h-3 w-3" />
                      Editar
                    </Button>
                    
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex-1 bg-red-500/10 border-red-500/30 text-red-300 hover:bg-red-500/20 h-8 text-xs"
                      onClick={() => excluirUsuario(usuario)}
                    >
                      <Trash2 className="mr-1 h-3 w-3" />
                      Excluir
                    </Button>
                  </CardFooter>
                </Card>
              );
            })}
          </div>
        )}
      </div>

      {/* Modal de Edição */}
      <Dialog open={modalAberto} onOpenChange={setModalAberto}>
        <DialogContent 
          className="sm:max-w-[500px] border-blue-500/20"
          style={{
            background: 'linear-gradient(135deg, rgba(15, 23, 42, 0.98) 0%, rgba(30, 41, 59, 0.98) 100%)',
            backdropFilter: 'blur(20px)'
          }}
        >
          <DialogHeader>
            <DialogTitle 
              className="text-2xl"
              style={{
                background: 'linear-gradient(135deg, #60a5fa 0%, #3b82f6 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text'
              }}
            >
              Editar Usuário
            </DialogTitle>
            <DialogDescription className="text-slate-400">
              Atualize as informações do usuário abaixo
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            {/* Nome */}
            <div className="space-y-2">
              <Label htmlFor="nome" className="text-slate-300">Nome Completo</Label>
              <Input
                id="nome"
                value={formData.nome}
                onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
                className="bg-slate-800/50 border-blue-500/20 text-white focus:border-blue-500/50"
                placeholder="Digite o nome completo"
              />
            </div>

            {/* Username */}
            <div className="space-y-2">
              <Label htmlFor="username" className="text-slate-300">Username</Label>
              <Input
                id="username"
                value={formData.username}
                onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                className="bg-slate-800/50 border-blue-500/20 text-white focus:border-blue-500/50"
                placeholder="Digite o username"
              />
            </div>

            {/* Tipo */}
            <div className="space-y-2">
              <Label htmlFor="tipo" className="text-slate-300">Tipo de Usuário</Label>
              <Select 
                value={formData.tipo} 
                onValueChange={(value) => setFormData({ ...formData, tipo: value })}
              >
                <SelectTrigger className="bg-slate-800/50 border-blue-500/20 text-white">
                  <SelectValue placeholder="Selecione o tipo" />
                </SelectTrigger>
                <SelectContent className="bg-slate-800 border-blue-500/20">
                  <SelectItem value="ADM">Administrador</SelectItem>
                  <SelectItem value="FISCAL">Fiscal</SelectItem>
                  <SelectItem value="USUARIO">Usuário</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Permissões */}
            <div className="space-y-3">
              <Label className="text-slate-300">Permissões</Label>
              
              <div className="space-y-3 p-4 rounded-lg border border-blue-500/20 bg-slate-800/30">
                {/* Consultar */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Eye className="text-blue-400" size={16} />
                    <Label htmlFor="perm-consultar" className="text-slate-300 cursor-pointer">
                      Consultar
                    </Label>
                  </div>
                  <Switch
                    id="perm-consultar"
                    checked={formData.permissoes.consultar}
                    onCheckedChange={(checked) => 
                      setFormData({ 
                        ...formData, 
                        permissoes: { ...formData.permissoes, consultar: checked }
                      })
                    }
                  />
                </div>

                {/* Cadastrar */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <UserPlus className="text-green-400" size={16} />
                    <Label htmlFor="perm-cadastrar" className="text-slate-300 cursor-pointer">
                      Cadastrar
                    </Label>
                  </div>
                  <Switch
                    id="perm-cadastrar"
                    checked={formData.permissoes.cadastrar}
                    onCheckedChange={(checked) => 
                      setFormData({ 
                        ...formData, 
                        permissoes: { ...formData.permissoes, cadastrar: checked }
                      })
                    }
                  />
                </div>

                {/* Editar */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Edit className="text-amber-400" size={16} />
                    <Label htmlFor="perm-editar" className="text-slate-300 cursor-pointer">
                      Editar
                    </Label>
                  </div>
                  <Switch
                    id="perm-editar"
                    checked={formData.permissoes.editar}
                    onCheckedChange={(checked) => 
                      setFormData({ 
                        ...formData, 
                        permissoes: { ...formData.permissoes, editar: checked }
                      })
                    }
                  />
                </div>

                {/* Excluir */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Trash2 className="text-red-400" size={16} />
                    <Label htmlFor="perm-excluir" className="text-slate-300 cursor-pointer">
                      Excluir
                    </Label>
                  </div>
                  <Switch
                    id="perm-excluir"
                    checked={formData.permissoes.excluir}
                    onCheckedChange={(checked) => 
                      setFormData({ 
                        ...formData, 
                        permissoes: { ...formData.permissoes, excluir: checked }
                      })
                    }
                  />
                </div>
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={fecharModal}
              disabled={salvando}
              className="bg-slate-700/50 border-slate-600 text-slate-300 hover:bg-slate-700"
            >
              <CloseIcon className="mr-2 h-4 w-4" />
              Cancelar
            </Button>
            <Button
              onClick={salvarEdicao}
              disabled={salvando}
              className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700"
            >
              {salvando ? (
                <>
                  <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                  Salvando...
                </>
              ) : (
                <>
                  <Save className="mr-2 h-4 w-4" />
                  Salvar Alterações
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Layout>
  );
}
