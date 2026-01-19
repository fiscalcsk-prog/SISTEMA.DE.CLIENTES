import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';
import { Save, ArrowLeft } from 'lucide-react';
import Layout from '@/componentes/Layout';
import { supabase } from '@/lib/supabase';

export default function CadastroCliente() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const clienteId = searchParams.get('id');
  const modoEdicao = !!clienteId;

  const [formData, setFormData] = useState({
    razao_social: '',
    fantasia: '',
    cnpj: '',
    ccm: '',
    natureza_juridica: '',
    regime_tributario: '',
    porte: '',
    contrato: '',
    data_inicial: '',
    data_saida: '',
    modalidade: '',
    certificado: '',
    procuracao: '',
    responsavel: '',
    telefone: '',
    e_mail: ''
  });

  const [carregando, setCarregando] = useState(false);

  useEffect(() => {
    if (modoEdicao) {
      carregarCliente();
    }
  }, [clienteId]);

  const carregarCliente = async () => {
    try {
      const { data, error } = await supabase
        .from('clientes')
        .select('*')
        .eq('id', clienteId)
        .single();

      if (error) throw error;

      setFormData({
        razao_social: data.razao_social || '',
        fantasia: data.fantasia || '',
        cnpj: data.cnpj || '',
        ccm: data.ccm || '',
        natureza_juridica: data.natureza_juridica || '',
        regime_tributario: data.regime_tributario || '',
        porte: data.porte || '',
        contrato: data.contrato || '',
        data_inicial: data.data_inicial || '',
        data_saida: data.data_saida || '',
        modalidade: data.modalidade || '',
        certificado: data.certificado || '',
        procuracao: data.procuracao || '',
        responsavel: data.responsavel || '',
        telefone: data.telefone || '',
        e_mail: data.e_mail || ''
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
      if (modoEdicao) {
        const { error } = await supabase
          .from('clientes')
          .update(formData)
          .eq('id', clienteId);

        if (error) throw error;
        toast.success('Cliente atualizado com sucesso!');
      } else {
        const { error } = await supabase
          .from('clientes')
          .insert([formData]);

        if (error) throw error;
        toast.success('Cliente cadastrado com sucesso!');
      }

      navigate('/clientes');
    } catch (error) {
      toast.error(error.message || 'Erro ao salvar cliente');
    } finally {
      setCarregando(false);
    }
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
                {/* Razão Social */}
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

                {/* Fantasia */}
                <div className="space-y-2">
                  <Label htmlFor="fantasia" className="text-gray-200">Fantasia</Label>
                  <Input
                    id="fantasia"
                    data-testid="input-fantasia"
                    value={formData.fantasia}
                    onChange={(e) => setFormData({ ...formData, fantasia: e.target.value })}
                    className="bg-white/5 border-blue-500/30 text-white placeholder:text-gray-400"
                  />
                </div>

                {/* CNPJ */}
                <div className="space-y-2">
                  <Label htmlFor="cnpj" className="text-gray-200">CNPJ</Label>
                  <Input
                    id="cnpj"
                    data-testid="input-cnpj"
                    value={formData.cnpj}
                    onChange={(e) => setFormData({ ...formData, cnpj: e.target.value })}
                    className="bg-white/5 border-blue-500/30 text-white placeholder:text-gray-400"
                  />
                </div>

                {/* CCM */}
                <div className="space-y-2">
                  <Label htmlFor="ccm" className="text-gray-200">CCM</Label>
                  <Input
                    id="ccm"
                    data-testid="input-ccm"
                    value={formData.ccm}
                    onChange={(e) => setFormData({ ...formData, ccm: e.target.value })}
                    className="bg-white/5 border-blue-500/30 text-white placeholder:text-gray-400"
                  />
                </div>

                {/* Natureza Jurídica */}
                <div className="space-y-2">
                  <Label htmlFor="natureza_juridica" className="text-gray-200">Natureza Jurídica</Label>
                  <Input
                    id="natureza_juridica"
                    data-testid="input-natureza-juridica"
                    value={formData.natureza_juridica}
                    onChange={(e) => setFormData({ ...formData, natureza_juridica: e.target.value })}
                    className="bg-white/5 border-blue-500/30 text-white placeholder:text-gray-400"
                  />
                </div>

                {/* Regime Tributário */}
                <div className="space-y-2">
                  <Label htmlFor="regime_tributario" className="text-gray-200">Regime Tributário</Label>
                  <Input
                    id="regime_tributario"
                    data-testid="input-regime-tributario"
                    value={formData.regime_tributario}
                    onChange={(e) => setFormData({ ...formData, regime_tributario: e.target.value })}
                    className="bg-white/5 border-blue-500/30 text-white placeholder:text-gray-400"
                  />
                </div>

                {/* Porte */}
                <div className="space-y-2">
                  <Label htmlFor="porte" className="text-gray-200">Porte</Label>
                  <Input
                    id="porte"
                    data-testid="input-porte"
                    value={formData.porte}
                    onChange={(e) => setFormData({ ...formData, porte: e.target.value })}
                    className="bg-white/5 border-blue-500/30 text-white placeholder:text-gray-400"
                  />
                </div>

                {/* Contrato */}
                <div className="space-y-2">
                  <Label htmlFor="contrato" className="text-gray-200">Contrato</Label>
                  <Input
                    id="contrato"
                    data-testid="input-contrato"
                    value={formData.contrato}
                    onChange={(e) => setFormData({ ...formData, contrato: e.target.value })}
                    className="bg-white/5 border-blue-500/30 text-white placeholder:text-gray-400"
                  />
                </div>

                {/* Data Inicial */}
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

                {/* Data Saída */}
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

                {/* Modalidade */}
                <div className="space-y-2">
                  <Label htmlFor="modalidade" className="text-gray-200">Modalidade</Label>
                  <Input
                    id="modalidade"
                    data-testid="input-modalidade"
                    value={formData.modalidade}
                    onChange={(e) => setFormData({ ...formData, modalidade: e.target.value })}
                    className="bg-white/5 border-blue-500/30 text-white placeholder:text-gray-400"
                  />
                </div>

                {/* Certificado */}
                <div className="space-y-2">
                  <Label htmlFor="certificado" className="text-gray-200">Certificado</Label>
                  <Input
                    id="certificado"
                    data-testid="input-certificado"
                    value={formData.certificado}
                    onChange={(e) => setFormData({ ...formData, certificado: e.target.value })}
                    className="bg-white/5 border-blue-500/30 text-white placeholder:text-gray-400"
                  />
                </div>

                {/* Procuração */}
                <div className="space-y-2">
                  <Label htmlFor="procuracao" className="text-gray-200">Procuração</Label>
                  <Input
                    id="procuracao"
                    data-testid="input-procuracao"
                    value={formData.procuracao}
                    onChange={(e) => setFormData({ ...formData, procuracao: e.target.value })}
                    className="bg-white/5 border-blue-500/30 text-white placeholder:text-gray-400"
                  />
                </div>

                {/* Responsável */}
                <div className="space-y-2">
                  <Label htmlFor="responsavel" className="text-gray-200">Responsável</Label>
                  <Input
                    id="responsavel"
                    data-testid="input-responsavel"
                    value={formData.responsavel}
                    onChange={(e) => setFormData({ ...formData, responsavel: e.target.value })}
                    className="bg-white/5 border-blue-500/30 text-white placeholder:text-gray-400"
                  />
                </div>

                {/* Telefone */}
                <div className="space-y-2">
                  <Label htmlFor="telefone" className="text-gray-200">Telefone</Label>
                  <Input
                    id="telefone"
                    data-testid="input-telefone"
                    value={formData.telefone}
                    onChange={(e) => setFormData({ ...formData, telefone: e.target.value })}
                    placeholder="(00) 00000-0000"
                    className="bg-white/5 border-blue-500/30 text-white placeholder:text-gray-400"
                  />
                </div>

                {/* E-mail */}
                <div className="space-y-2">
                  <Label htmlFor="e_mail" className="text-gray-200">E-mail</Label>
                  <Input
                    id="e_mail"
                    data-testid="input-email"
                    type="email"
                    value={formData.e_mail}
                    onChange={(e) => setFormData({ ...formData, e_mail: e.target.value })}
                    placeholder="email@exemplo.com"
                    className="bg-white/5 border-blue-500/30 text-white placeholder:text-gray-400"
                  />
                </div>
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
