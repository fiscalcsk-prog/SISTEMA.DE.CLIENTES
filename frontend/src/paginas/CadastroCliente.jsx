import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import axios from 'axios';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';
import { API } from '@/App';
import { Save, Plus, Trash2, ArrowLeft } from 'lucide-react';
import Layout from '@/componentes/Layout';

export default function CadastroCliente() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const clienteId = searchParams.get('id');
  const modoEdicao = !!clienteId;

  const [formData, setFormData] = useState({
    razao_social: '',
    cnpj: '',
    ccm: '',
    regime_tributario: '',
    natureza_juridica: '',
    porte_empresa: '',
    nome_responsavel: '',
    telefones: [''],
    emails: [''],
    status: 'ATIVO',
    data_inicial: '',
    data_saida: ''
  });

  const [opcoes, setOpcoes] = useState({
    regimes: [],
    naturezas: [],
    portes: [],
    statusList: []
  });

  const [carregando, setCarregando] = useState(false);

  useEffect(() => {
    carregarOpcoes();
    if (modoEdicao) {
      carregarCliente();
    }
  }, [clienteId]);

  const carregarOpcoes = async () => {
    try {
      const [regimes, naturezas, portes, statusList] = await Promise.all([
        axios.get(`${API}/opcoes/regimes-tributarios`),
        axios.get(`${API}/opcoes/naturezas-juridicas`),
        axios.get(`${API}/opcoes/portes-empresa`),
        axios.get(`${API}/opcoes/status`)
      ]);

      setOpcoes({
        regimes: regimes.data,
        naturezas: naturezas.data,
        portes: portes.data,
        statusList: statusList.data
      });
    } catch (error) {
      toast.error('Erro ao carregar opções');
    }
  };

  const carregarCliente = async () => {
    try {
      const response = await axios.get(`${API}/clientes/${clienteId}`);
      const cliente = response.data;
      setFormData({
        ...cliente,
        telefones: cliente.telefones.length > 0 ? cliente.telefones : [''],
        emails: cliente.emails.length > 0 ? cliente.emails : [''],
        data_inicial: cliente.data_inicial || '',
        data_saida: cliente.data_saida || ''
      });
    } catch (error) {
      toast.error('Erro ao carregar cliente');
      navigate('/clientes');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setCarregando(true);

    try {
      const dados = {
        ...formData,
        telefones: formData.telefones.filter(t => t.trim() !== ''),
        emails: formData.emails.filter(e => e.trim() !== '')
      };

      if (modoEdicao) {
        await axios.put(`${API}/clientes/${clienteId}`, dados);
        toast.success('Cliente atualizado com sucesso!');
      } else {
        await axios.post(`${API}/clientes`, dados);
        toast.success('Cliente cadastrado com sucesso!');
      }

      navigate('/clientes');
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Erro ao salvar cliente');
    } finally {
      setCarregando(false);
    }
  };

  const adicionarTelefone = () => {
    setFormData({ ...formData, telefones: [...formData.telefones, ''] });
  };

  const removerTelefone = (index) => {
    const novosTelefones = formData.telefones.filter((_, i) => i !== index);
    setFormData({ ...formData, telefones: novosTelefones.length > 0 ? novosTelefones : [''] });
  };

  const atualizarTelefone = (index, valor) => {
    const novosTelefones = [...formData.telefones];
    novosTelefones[index] = valor;
    setFormData({ ...formData, telefones: novosTelefones });
  };

  const adicionarEmail = () => {
    setFormData({ ...formData, emails: [...formData.emails, ''] });
  };

  const removerEmail = (index) => {
    const novosEmails = formData.emails.filter((_, i) => i !== index);
    setFormData({ ...formData, emails: novosEmails.length > 0 ? novosEmails : [''] });
  };

  const atualizarEmail = (index, valor) => {
    const novosEmails = [...formData.emails];
    novosEmails[index] = valor;
    setFormData({ ...formData, emails: novosEmails });
  };

  return (
    <Layout>
      <div className="animate-fade-in" data-testid="form-cadastro-cliente">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-4xl font-bold text-white mb-2" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>
              {modoEdicao ? 'Editar Cliente' : 'Cadastrar Cliente'}
            </h1>
            <p className="text-gray-300 text-lg">Preencha as informações do cliente</p>
          </div>
          <Button
            variant="outline"
            onClick={() => navigate('/clientes')}
            className="bg-white/5 border-blue-500/30 text-white hover:bg-white/10"
            data-testid="btn-voltar"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Voltar
          </Button>
        </div>

        <Card className="glass-effect border-blue-500/20">
          <CardHeader>
            <CardTitle className="text-2xl text-white">Informações do Cliente</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="razao_social" className="text-gray-200">Razão Social *</Label>
                  <Input
                    id="razao_social"
                    data-testid="input-razao-social"
                    value={formData.razao_social}
                    onChange={(e) => setFormData({ ...formData, razao_social: e.target.value })}
                    required
                    className="bg-white/5 border-blue-500/30 text-white placeholder:text-gray-400"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="cnpj" className="text-gray-200">CNPJ *</Label>
                  <Input
                    id="cnpj"
                    data-testid="input-cnpj"
                    value={formData.cnpj}
                    onChange={(e) => setFormData({ ...formData, cnpj: e.target.value })}
                    required
                    className="bg-white/5 border-blue-500/30 text-white placeholder:text-gray-400"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="ccm" className="text-gray-200">CCM *</Label>
                  <Input
                    id="ccm"
                    data-testid="input-ccm"
                    value={formData.ccm}
                    onChange={(e) => setFormData({ ...formData, ccm: e.target.value })}
                    required
                    className="bg-white/5 border-blue-500/30 text-white placeholder:text-gray-400"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="regime_tributario" className="text-gray-200">Regime Tributário *</Label>
                  <Select value={formData.regime_tributario} onValueChange={(value) => setFormData({ ...formData, regime_tributario: value })} required>
                    <SelectTrigger data-testid="select-regime-tributario" className="bg-white/5 border-blue-500/30 text-white">
                      <SelectValue placeholder="Selecione" />
                    </SelectTrigger>
                    <SelectContent>
                      {opcoes.regimes.map((regime) => (
                        <SelectItem key={regime} value={regime}>{regime}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="natureza_juridica" className="text-gray-200">Natureza Jurídica *</Label>
                  <Select value={formData.natureza_juridica} onValueChange={(value) => setFormData({ ...formData, natureza_juridica: value })} required>
                    <SelectTrigger data-testid="select-natureza-juridica" className="bg-white/5 border-blue-500/30 text-white">
                      <SelectValue placeholder="Selecione" />
                    </SelectTrigger>
                    <SelectContent>
                      {opcoes.naturezas.map((natureza) => (
                        <SelectItem key={natureza} value={natureza}>{natureza}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="porte_empresa" className="text-gray-200">Porte da Empresa *</Label>
                  <Select value={formData.porte_empresa} onValueChange={(value) => setFormData({ ...formData, porte_empresa: value })} required>
                    <SelectTrigger data-testid="select-porte-empresa" className="bg-white/5 border-blue-500/30 text-white">
                      <SelectValue placeholder="Selecione" />
                    </SelectTrigger>
                    <SelectContent>
                      {opcoes.portes.map((porte) => (
                        <SelectItem key={porte} value={porte}>{porte}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="nome_responsavel" className="text-gray-200">Nome do Responsável *</Label>
                  <Input
                    id="nome_responsavel"
                    data-testid="input-nome-responsavel"
                    value={formData.nome_responsavel}
                    onChange={(e) => setFormData({ ...formData, nome_responsavel: e.target.value })}
                    required
                    className="bg-white/5 border-blue-500/30 text-white placeholder:text-gray-400"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="status" className="text-gray-200">Status *</Label>
                  <Select value={formData.status} onValueChange={(value) => setFormData({ ...formData, status: value })} required>
                    <SelectTrigger data-testid="select-status" className="bg-white/5 border-blue-500/30 text-white">
                      <SelectValue placeholder="Selecione" />
                    </SelectTrigger>
                    <SelectContent>
                      {opcoes.statusList.map((status) => (
                        <SelectItem key={status} value={status}>{status}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="data_inicial" className="text-gray-200">Data Inicial</Label>
                  <Input
                    id="data_inicial"
                    data-testid="input-data-inicial"
                    type="date"
                    value={formData.data_inicial}
                    onChange={(e) => setFormData({ ...formData, data_inicial: e.target.value })}
                    className="bg-white/5 border-blue-500/30 text-white"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="data_saida" className="text-gray-200">Data de Saída</Label>
                  <Input
                    id="data_saida"
                    data-testid="input-data-saida"
                    type="date"
                    value={formData.data_saida}
                    onChange={(e) => setFormData({ ...formData, data_saida: e.target.value })}
                    className="bg-white/5 border-blue-500/30 text-white"
                  />
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <Label className="text-gray-200 text-lg">Telefones</Label>
                  <Button
                    type="button"
                    onClick={adicionarTelefone}
                    variant="outline"
                    size="sm"
                    data-testid="btn-adicionar-telefone"
                    className="bg-blue-500/10 border-blue-500/30 text-blue-300 hover:bg-blue-500/20"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Adicionar Telefone
                  </Button>
                </div>
                {formData.telefones.map((telefone, index) => (
                  <div key={index} className="flex gap-2">
                    <Input
                      data-testid={`input-telefone-${index}`}
                      value={telefone}
                      onChange={(e) => atualizarTelefone(index, e.target.value)}
                      placeholder="(00) 00000-0000"
                      className="bg-white/5 border-blue-500/30 text-white placeholder:text-gray-400"
                    />
                    {formData.telefones.length > 1 && (
                      <Button
                        type="button"
                        onClick={() => removerTelefone(index)}
                        variant="outline"
                        size="icon"
                        data-testid={`btn-remover-telefone-${index}`}
                        className="bg-red-500/10 border-red-500/30 text-red-300 hover:bg-red-500/20"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                ))}
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <Label className="text-gray-200 text-lg">E-mails</Label>
                  <Button
                    type="button"
                    onClick={adicionarEmail}
                    variant="outline"
                    size="sm"
                    data-testid="btn-adicionar-email"
                    className="bg-blue-500/10 border-blue-500/30 text-blue-300 hover:bg-blue-500/20"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Adicionar E-mail
                  </Button>
                </div>
                {formData.emails.map((email, index) => (
                  <div key={index} className="flex gap-2">
                    <Input
                      data-testid={`input-email-${index}`}
                      type="email"
                      value={email}
                      onChange={(e) => atualizarEmail(index, e.target.value)}
                      placeholder="email@exemplo.com"
                      className="bg-white/5 border-blue-500/30 text-white placeholder:text-gray-400"
                    />
                    {formData.emails.length > 1 && (
                      <Button
                        type="button"
                        onClick={() => removerEmail(index)}
                        variant="outline"
                        size="icon"
                        data-testid={`btn-remover-email-${index}`}
                        className="bg-red-500/10 border-red-500/30 text-red-300 hover:bg-red-500/20"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                ))}
              </div>

              <div className="flex gap-4 justify-end pt-6">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => navigate('/clientes')}
                  className="bg-white/5 border-blue-500/30 text-white hover:bg-white/10"
                  data-testid="btn-cancelar"
                >
                  Cancelar
                </Button>
                <Button
                  type="submit"
                  disabled={carregando}
                  className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white"
                  data-testid="btn-salvar-cliente"
                >
                  <Save className="mr-2 h-4 w-4" />
                  {carregando ? 'Salvando...' : (modoEdicao ? 'Atualizar' : 'Cadastrar')}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
}