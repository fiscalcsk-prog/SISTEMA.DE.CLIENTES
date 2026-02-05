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

const NATUREZAS_JURIDICAS = [
  { grupo: 'Pessoas Jurídicas Empresariais', opcoes: [
    'EI',
    'SLU',
    'LTDA',
    'SA',
    'SCP',
    'Cooperativa',
    'Consórcio de Empresas'
  ]},
  { grupo: 'Pessoas Jurídicas Não Empresariais', opcoes: [
    'Associação',
    'Fundação',
    'Organização Religiosa',
    'Partido Político',
    'Condomínio',
    'Cartório / Registro Público'
  ]},
  { grupo: 'Pessoas Físicas Equiparadas', opcoes: [
    'Produtor Rural (Pessoa Física com CNPJ)',
    'Profissional Autônomo Equiparado a PJ (em situações específicas)'
  ]},
  { grupo: 'Entidades Públicas', opcoes: [
    'Órgão Público do Poder Executivo Federal, Estadual ou Municipal',
    'Autarquia',
    'Fundação Pública',
    'Empresa Pública',
    'Sociedade de Economia Mista'
  ]}
];

const REGIMES_TRIBUTARIOS = [
  'Lucro Real',
  'Lucro Presumido',
  'Simples Nacional',
  'Imune/Isenta'
];

const PORTES = [
  'MEI',
  'ME',
  'EPP',
  'Média Empresa',
  'Grande Empresa'
];

const MODALIDADES = [
  'Pró-Bono',
  'Paga'
];

const OPCOES_SIM_NAO = [
  'Sim',
  'Não'
];

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
    email: ''
  });

  const [carregando, setCarregando] = useState(false);

  // Função para formatar CNPJ/CPF automaticamente
  const formatarCNPJCPF = (valor) => {
    const apenasNumeros = valor.replace(/\D/g, '');
    
    if (apenasNumeros.length <= 11) {
      return apenasNumeros
        .replace(/(\d{3})(\d)/, '$1.$2')
        .replace(/(\d{3})(\d)/, '$1.$2')
        .replace(/(\d{3})(\d{1,2})$/, '$1-$2');
    }
    
    return apenasNumeros
      .replace(/(\d{2})(\d)/, '$1.$2')
      .replace(/(\d{3})(\d)/, '$1.$2')
      .replace(/(\d{3})(\d)/, '$1/$2')
      .replace(/(\d{4})(\d{1,2})$/, '$1-$2');
  };

  const formatarTelefone = (valor) => {
    const apenasNumeros = valor.replace(/\D/g, '');
    
    if (apenasNumeros.length === 11) {
      return apenasNumeros
        .replace(/(\d{2})(\d)/, '($1) $2')
        .replace(/(\d{5})(\d{4})$/, '$1-$2');
    }
    
    if (apenasNumeros.length === 10) {
      return apenasNumeros
        .replace(/(\d{2})(\d)/, '($1) $2')
        .replace(/(\d{4})(\d{4})$/, '$1-$2');
    }
    
    if (apenasNumeros.length > 2) {
      let formatted = apenasNumeros.replace(/(\d{2})(\d)/, '($1) $2');
      
      if (apenasNumeros.length > 6) {
        formatted = formatted.replace(/(\d{5})(\d)/, '$1-$2');
      } else if (apenasNumeros.length > 5) {
        formatted = formatted.replace(/(\d{4})(\d)/, '$1-$2');
      }
      
      return formatted;
    }
    
    return apenasNumeros;
  };

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
        email: data.email || ''
      });
    } catch (error) {
      toast.error('Erro ao carregar cliente');
      navigate('/clientes');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setCarregando(true);

    console.log('🟢 INICIANDO CADASTRO/ATUALIZAÇÃO');

    try {
      const usuarioLogado = JSON.parse(localStorage.getItem('usuario') || '{}');
      
      console.log('👤 Usuário logado:', usuarioLogado);
      console.log('📝 Modo edição:', modoEdicao);
      console.log('🆔 Cliente ID:', clienteId);
      
      const dadosParaSalvar = {
        razao_social: String(formData.razao_social || ''),
        fantasia: String(formData.fantasia || ''),
        cnpj: String(formData.cnpj || ''),
        ccm: String(formData.ccm || ''),
        natureza_juridica: String(formData.natureza_juridica || ''),
        regime_tributario: String(formData.regime_tributario || ''),
        porte: String(formData.porte || ''),
        contrato: String(formData.contrato || ''),
        data_inicial: formData.data_inicial || null,
        data_saida: formData.data_saida || null,
        modalidade: String(formData.modalidade || ''),
        certificado: String(formData.certificado || ''),
        procuracao: String(formData.procuracao || ''),
        responsavel: String(formData.responsavel || ''),
        telefone: String(formData.telefone || ''),
        email: String(formData.email || '')
      };

      console.log('📦 Dados base preparados:', dadosParaSalvar);

      if (modoEdicao) {
        console.log('✏️ MODO EDIÇÃO - Atualizando cliente...');
        
        const { data: resultado, error } = await supabase
          .from('clientes')
          .update(dadosParaSalvar)
          .eq('id', clienteId)
          .select();

        console.log('📤 Resultado da atualização:', { resultado, error });

        if (error) {
          console.error('❌ ERRO ao atualizar:', error);
          throw error;
        }
        
        console.log('✅ Cliente atualizado com sucesso!');
        toast.success('Cliente atualizado com sucesso!');
      } else {
        console.log('➕ MODO INSERÇÃO - Cadastrando novo cliente...');
        
        const dadosComUsuario = {
          ...dadosParaSalvar,
          usuario_cadastro: usuarioLogado.id || null
        };

        console.log('📦 Dados completos para inserção:', dadosComUsuario);

        const { data: resultado, error } = await supabase
          .from('clientes')
          .insert([dadosComUsuario])
          .select();

        console.log('📤 Resultado da inserção:', { resultado, error });

        if (error) {
          console.error('❌ ERRO DETALHADO ao inserir:', {
            message: error.message,
            details: error.details,
            hint: error.hint,
            code: error.code,
            errorCompleto: error
          });
          throw error;
        }

        if (resultado && resultado.length > 0) {
          console.log('✅ Cliente inserido com sucesso! ID:', resultado[0].id);
          console.log('📊 Dados do cliente inserido:', resultado[0]);
        } else {
          console.warn('⚠️ Insert retornou sucesso mas sem dados de retorno');
        }
        
        toast.success('Cliente cadastrado com sucesso!');

        // Verificação adicional - tentar buscar o cliente recém-criado
        console.log('🔍 Verificando se cliente foi realmente salvo...');
        const { data: verificacao, error: erroVerificacao } = await supabase
          .from('clientes')
          .select('id, razao_social, created_at')
          .eq('razao_social', dadosComUsuario.razao_social)
          .order('created_at', { ascending: false })
          .limit(1);

        console.log('🔍 Resultado da verificação:', { verificacao, erroVerificacao });
      }

      console.log('🚀 Redirecionando para /dashboard...');
      navigate('/dashboard');
    } catch (error) {
      console.error('❌ ERRO GERAL:', error);
      console.error('❌ Stack trace:', error.stack);
      
      if (error.code === '23505') {
        toast.error('Erro: Cliente com este CNPJ já existe!');
      } else if (error.code === '23502') {
        toast.error('Erro: Campo obrigatório não preenchido!');
      } else if (error.code === '23503') {
        toast.error('Erro: Usuário de cadastro inválido!');
      } else {
        toast.error(error.message || 'Erro ao salvar cliente');
      }
    } finally {
      setCarregando(false);
      console.log('🏁 Processo finalizado. Carregando:', carregando);
    }
  };

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8 animate-fade-in">
        <Card className="glass-effect border-blue-500/20">
          <CardHeader>
            <div className="flex items-center gap-3 mb-2">
              <Button
                variant="outline"
                size="icon"
                onClick={() => navigate('/clientes')}
                className="bg-white/5 border-blue-500/30 text-white hover:bg-white/10"
                data-testid="btn-voltar"
              >
                <ArrowLeft className="h-4 w-4" />
              </Button>
              <CardTitle className="text-3xl text-white" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>
                {modoEdicao ? 'Editar Cliente' : 'Cadastro de Cliente'}
              </CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Razão Social */}
                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="razao_social" className="text-gray-200">
                    Razão Social <span className="text-red-400">*</span>
                  </Label>
                  <Input
                    id="razao_social"
                    data-testid="input-razao-social"
                    required
                    value={formData.razao_social}
                    onChange={(e) => setFormData({ ...formData, razao_social: e.target.value })}
                    className="bg-white/5 border-blue-500/30 text-white placeholder:text-gray-400"
                  />
                </div>

                {/* Nome Fantasia */}
                <div className="space-y-2">
                  <Label htmlFor="fantasia" className="text-gray-200">Nome Fantasia</Label>
                  <Input
                    id="fantasia"
                    data-testid="input-fantasia"
                    value={formData.fantasia}
                    onChange={(e) => setFormData({ ...formData, fantasia: e.target.value })}
                    className="bg-white/5 border-blue-500/30 text-white placeholder:text-gray-400"
                  />
                </div>

                {/* CNPJ/CPF */}
                <div className="space-y-2">
                  <Label htmlFor="cnpj" className="text-gray-200">CNPJ/CPF</Label>
                  <Input
                    id="cnpj"
                    data-testid="input-cnpj"
                    value={formData.cnpj}
                    onChange={(e) => {
                      const valorFormatado = formatarCNPJCPF(e.target.value);
                      setFormData({ ...formData, cnpj: valorFormatado });
                    }}
                    placeholder="00.000.000/0000-00"
                    maxLength={18}
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
                  <Label className="text-gray-200">Natureza Jurídica</Label>
                  <Select 
                    value={formData.natureza_juridica} 
                    onValueChange={(value) => setFormData({ ...formData, natureza_juridica: value })}
                  >
                    <SelectTrigger 
                      id="natureza_juridica"
                      data-testid="select-natureza-juridica" 
                      className="bg-white/5 border-blue-500/30 text-white"
                    >
                      <SelectValue placeholder="Selecione a natureza jurídica" />
                    </SelectTrigger>
                    <SelectContent>
                      {NATUREZAS_JURIDICAS.map((grupo) => (
                        <div key={grupo.grupo}>
                          <div className="px-2 py-1.5 text-sm font-semibold text-gray-500">
                            {grupo.grupo}
                          </div>
                          {grupo.opcoes.map((opcao) => (
                            <SelectItem key={opcao} value={opcao}>
                              {opcao}
                            </SelectItem>
                          ))}
                        </div>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Regime Tributário */}
                <div className="space-y-2">
                  <Label className="text-gray-200">Regime Tributário</Label>
                  <Select 
                    value={formData.regime_tributario} 
                    onValueChange={(value) => setFormData({ ...formData, regime_tributario: value })}
                  >
                    <SelectTrigger 
                      id="regime_tributario"
                      data-testid="select-regime-tributario" 
                      className="bg-white/5 border-blue-500/30 text-white"
                    >
                      <SelectValue placeholder="Selecione o regime tributário" />
                    </SelectTrigger>
                    <SelectContent>
                      {REGIMES_TRIBUTARIOS.map((regime) => (
                        <SelectItem key={regime} value={regime}>
                          {regime}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Porte */}
                <div className="space-y-2">
                  <Label className="text-gray-200">Porte</Label>
                  <Select 
                    value={formData.porte} 
                    onValueChange={(value) => setFormData({ ...formData, porte: value })}
                  >
                    <SelectTrigger 
                      id="porte"
                      data-testid="select-porte" 
                      className="bg-white/5 border-blue-500/30 text-white"
                    >
                      <SelectValue placeholder="Selecione o porte" />
                    </SelectTrigger>
                    <SelectContent>
                      {PORTES.map((porte) => (
                        <SelectItem key={porte} value={porte}>
                          {porte}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Modalidade */}
                <div className="space-y-2">
                  <Label className="text-gray-200">Modalidade</Label>
                  <Select 
                    value={formData.modalidade} 
                    onValueChange={(value) => setFormData({ ...formData, modalidade: value })}
                  >
                    <SelectTrigger 
                      id="modalidade"
                      data-testid="select-modalidade" 
                      className="bg-white/5 border-blue-500/30 text-white"
                    >
                      <SelectValue placeholder="Selecione a modalidade" />
                    </SelectTrigger>
                    <SelectContent>
                      {MODALIDADES.map((modalidade) => (
                        <SelectItem key={modalidade} value={modalidade}>
                          {modalidade}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Certificado Digital */}
                <div className="space-y-2">
                  <Label className="text-gray-200">Certificado Digital</Label>
                  <Select 
                    value={formData.certificado} 
                    onValueChange={(value) => setFormData({ ...formData, certificado: value })}
                  >
                    <SelectTrigger 
                      id="certificado"
                      data-testid="select-certificado" 
                      className="bg-white/5 border-blue-500/30 text-white"
                    >
                      <SelectValue placeholder="Possui certificado digital?" />
                    </SelectTrigger>
                    <SelectContent>
                      {OPCOES_SIM_NAO.map((opcao) => (
                        <SelectItem key={opcao} value={opcao}>
                          {opcao}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Procuração */}
                <div className="space-y-2">
                  <Label className="text-gray-200">Procuração</Label>
                  <Select 
                    value={formData.procuracao} 
                    onValueChange={(value) => setFormData({ ...formData, procuracao: value })}
                  >
                    <SelectTrigger 
                      id="procuracao"
                      data-testid="select-procuracao" 
                      className="bg-white/5 border-blue-500/30 text-white"
                    >
                      <SelectValue placeholder="Possui procuração?" />
                    </SelectTrigger>
                    <SelectContent>
                      {OPCOES_SIM_NAO.map((opcao) => (
                        <SelectItem key={opcao} value={opcao}>
                          {opcao}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
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
                    onChange={(e) => {
                      const valorFormatado = formatarTelefone(e.target.value);
                      setFormData({ ...formData, telefone: valorFormatado });
                    }}
                    placeholder="(00) 00000-0000"
                    maxLength={15}
                    className="bg-white/5 border-blue-500/30 text-white placeholder:text-gray-400"
                  />
                </div>

                {/* E-mail */}
                <div className="space-y-2">
                  <Label htmlFor="e_mail" className="text-gray-200">E-mail</Label>
                  <Input
                    id="email"
                    data-testid="input-email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
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
