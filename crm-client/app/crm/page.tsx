'use client';

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect, useState, Suspense } from 'react';
import Sidebar from '@/components/Sidebar';
import { useLeads, Lead } from '@/hooks/useLeads';
import { useUsuarios, UserRole as UsuarioRole } from '@/hooks/useUsuarios';
import { useOrcamentos } from '@/hooks/useOrcamentos';
import { useDocumentos, TipoDocumento } from '@/hooks/useDocumentos';
import { useProdutos } from '@/hooks/useProdutos';
import { useEmpresas } from '@/hooks/useEmpresas';
import { useNotification } from '@/contexts/NotificationContext';
import ConfirmModal from '@/components/ConfirmModal';
import { HiPlus, HiPencil, HiTrash, HiMail, HiPhone, HiChevronLeft, HiChevronRight, HiFolder, HiClipboardList, HiCurrencyDollar, HiDocumentText, HiSearch, HiExclamation } from 'react-icons/hi';
import dynamic from 'next/dynamic';
import { api } from '@/lib/api';

const MapPicker = dynamic(() => import('@/components/MapPicker'), {
  ssr: false,
  loading: () => <div className="h-64 bg-gray-100 rounded-lg flex items-center justify-center">Carregando mapa...</div>
});

const stages = [
  { id: 'contato_inicial', label: 'Contato Inicial', color: 'bg-blue-500', lightColor: 'bg-blue-50', borderColor: 'border-blue-200' },
  { id: 'negociacao_inicial', label: 'Negociação Inicial', color: 'bg-yellow-500', lightColor: 'bg-yellow-50', borderColor: 'border-yellow-200' },
  { id: 'orcamento_aprovacao', label: 'Orçamento - Aprovação', color: 'bg-amber-500', lightColor: 'bg-amber-50', borderColor: 'border-amber-200' },
  { id: 'negociacao_fechamento', label: 'Negociação de Fechamento', color: 'bg-orange-500', lightColor: 'bg-orange-50', borderColor: 'border-orange-200' },
  { id: 'contrato', label: 'Contrato', color: 'bg-emerald-500', lightColor: 'bg-emerald-50', borderColor: 'border-emerald-200' },
];

const servicoOptions = [
  'Perfuração',
  'Limpeza',
  'Montagem de Bomba',
  'Pescaria',
  'Licenças/Outorga',
  'Manutenção de Poços',
  'Manutenção de Bombas',
  'Teste de Vazão',
  'Locação Geológica',
  'Outros',
];

const origemOptions = [
  'Marketing (Instagram)',
  'Marketing (Facebook)',
  'Site',
  'Indicação',
  'Presencial',
  'Google',
  'Outros',
];

const tagNegociacaoOptions = [
  { value: 'aguardando_cliente', label: 'Aguardando Cliente', color: 'bg-yellow-100 text-yellow-800' },
  { value: 'aguardando_pagamento', label: 'Aguardando Pagamento', color: 'bg-orange-100 text-orange-800' },
  { value: 'em_analise', label: 'Em Análise', color: 'bg-indigo-100 text-indigo-800' },
  { value: 'pronto_envio', label: 'Pronto para Envio', color: 'bg-green-100 text-green-800' },
  { value: 'orcamento_criado', label: 'Orçamento Criado!', color: 'bg-emerald-100 text-emerald-800' },
];

const contractTagOptions = [
  { value: 'enviado_cliente', label: 'Enviado ao Cliente', color: 'bg-blue-100 text-blue-800' },
  { value: 'aguardando_assinatura', label: 'Aguardando Assinatura', color: 'bg-purple-100 text-purple-800' },
  { value: 'aguardando_material', label: 'Aguardando Material', color: 'bg-pink-100 text-pink-800' },
  { value: 'aguardando_execucao', label: 'Aguardando Execução', color: 'bg-cyan-100 text-cyan-800' },
  { value: 'aguardando_agenda', label: 'Aguardando Agenda', color: 'bg-teal-100 text-teal-800' },
];

type StatusKey = 'novo' | 'negociando' | 'ganho' | 'perdido' | 'arquivado';

const statusOptions: Record<StatusKey, { label: string; className: string }> = {
  novo: { label: 'Novo', className: 'bg-gray-100 text-gray-800' },
  negociando: { label: 'Negociando', className: 'bg-amber-100 text-amber-800' },
  ganho: { label: 'Ganho', className: 'bg-emerald-100 text-emerald-800' },
  perdido: { label: 'Perdido', className: 'bg-red-100 text-red-700' },
  arquivado: { label: 'Arquivado', className: 'bg-gray-100 text-gray-600' },
};

const estadosBrasil = [
  { sigla: 'AC', nome: 'Acre', cidades: ['Rio Branco', 'Cruzeiro do Sul', 'Sena Madureira', 'Tarauacá'] },
  { sigla: 'AL', nome: 'Alagoas', cidades: ['Maceió', 'Arapiraca', 'Palmeira dos Índios', 'Rio Largo'] },
  { sigla: 'AP', nome: 'Amapá', cidades: ['Macapá', 'Santana', 'Laranjal do Jari', 'Oiapoque'] },
  { sigla: 'AM', nome: 'Amazonas', cidades: ['Manaus', 'Parintins', 'Itacoatiara', 'Manacapuru'] },
  { sigla: 'BA', nome: 'Bahia', cidades: ['Salvador', 'Feira de Santana', 'Vitória da Conquista', 'Camaçari', 'Itabuna', 'Juazeiro'] },
  { sigla: 'CE', nome: 'Ceará', cidades: ['Fortaleza', 'Caucaia', 'Juazeiro do Norte', 'Maracanaú', 'Sobral'] },
  { sigla: 'DF', nome: 'Distrito Federal', cidades: ['Brasília'] },
  { sigla: 'ES', nome: 'Espírito Santo', cidades: ['Vitória', 'Vila Velha', 'Serra', 'Cariacica', 'Linhares'] },
  { sigla: 'GO', nome: 'Goiás', cidades: ['Goiânia', 'Aparecida de Goiânia', 'Anápolis', 'Rio Verde', 'Luziânia'] },
  { sigla: 'MA', nome: 'Maranhão', cidades: ['São Luís', 'Imperatriz', 'São José de Ribamar', 'Timon', 'Caxias'] },
  { sigla: 'MT', nome: 'Mato Grosso', cidades: ['Cuiabá', 'Várzea Grande', 'Rondonópolis', 'Sinop', 'Tangará da Serra'] },
  { sigla: 'MS', nome: 'Mato Grosso do Sul', cidades: ['Campo Grande', 'Dourados', 'Três Lagoas', 'Corumbá', 'Ponta Porã'] },
  { sigla: 'MG', nome: 'Minas Gerais', cidades: ['Belo Horizonte', 'Uberlândia', 'Contagem', 'Juiz de Fora', 'Betim', 'Montes Claros'] },
  { sigla: 'PA', nome: 'Pará', cidades: ['Belém', 'Ananindeua', 'Santarém', 'Marabá', 'Castanhal'] },
  { sigla: 'PB', nome: 'Paraíba', cidades: ['João Pessoa', 'Campina Grande', 'Santa Rita', 'Patos', 'Bayeux'] },
  { sigla: 'PR', nome: 'Paraná', cidades: ['Curitiba', 'Londrina', 'Maringá', 'Ponta Grossa', 'Cascavel', 'Foz do Iguaçu'] },
  { sigla: 'PE', nome: 'Pernambuco', cidades: ['Recife', 'Jaboatão dos Guararapes', 'Olinda', 'Caruaru', 'Petrolina'] },
  { sigla: 'PI', nome: 'Piauí', cidades: ['Teresina', 'Parnaíba', 'Picos', 'Floriano', 'Piripiri'] },
  { sigla: 'RJ', nome: 'Rio de Janeiro', cidades: ['Rio de Janeiro', 'Niterói', 'Duque de Caxias', 'Nova Iguaçu', 'Campos dos Goytacazes'] },
  { sigla: 'RN', nome: 'Rio Grande do Norte', cidades: ['Natal', 'Mossoró', 'Parnamirim', 'São Gonçalo do Amarante', 'Macaíba'] },
  { sigla: 'RS', nome: 'Rio Grande do Sul', cidades: ['Porto Alegre', 'Caxias do Sul', 'Pelotas', 'Canoas', 'Santa Maria'] },
  { sigla: 'RO', nome: 'Rondônia', cidades: ['Porto Velho', 'Ji-Paraná', 'Ariquemes', 'Vilhena', 'Cacoal'] },
  { sigla: 'RR', nome: 'Roraima', cidades: ['Boa Vista', 'Rorainópolis', 'Caracaraí', 'Mucajaí'] },
  { sigla: 'SC', nome: 'Santa Catarina', cidades: ['Florianópolis', 'Joinville', 'Blumenau', 'São José', 'Criciúma', 'Chapecó'] },
  { sigla: 'SP', nome: 'São Paulo', cidades: ['São Paulo', 'Campinas', 'Santos', 'São Bernardo do Campo', 'Guarulhos', 'Ribeirão Preto'] },
  { sigla: 'SE', nome: 'Sergipe', cidades: ['Aracaju', 'Nossa Senhora do Socorro', 'Lagarto', 'Itabaiana', 'Estância'] },
  { sigla: 'TO', nome: 'Tocantins', cidades: ['Palmas', 'Araguaína', 'Gurupi', 'Porto Nacional', 'Paraíso do Tocantins'] },
];

export default function CRMPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const { leads, loading, createLead, updateLead, deleteLead, updateLeadStage } = useLeads();
  const { uploadDocumento } = useDocumentos();
  const { createOrcamento } = useOrcamentos();
  const { produtos, loading: loadingProdutos } = useProdutos();
  const { usuarios: usuariosData, loading: loadingUsuarios } = useUsuarios();
  const { createEmpresa } = useEmpresas();
  const { success, error } = useNotification();
  const [showModal, setShowModal] = useState(false);
  const [editingLead, setEditingLead] = useState<Lead | null>(null);
  const [draggedLead, setDraggedLead] = useState<Lead | null>(null);
  const [filterStage, setFilterStage] = useState<string>('all');
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [leadToDelete, setLeadToDelete] = useState<number | null>(null);
  const [mapLocation, setMapLocation] = useState<{ lat: number; lng: number; address: string }>({ lat: -15.7939, lng: -47.8828, address: '' });
  const [tipoPessoaForm, setTipoPessoaForm] = useState<'PF' | 'PJ'>('PJ');
  const [cep, setCep] = useState('');
  const [endereco, setEndereco] = useState('');
  const [numero, setNumero] = useState('');
  const [complemento, setComplemento] = useState('');
  const [bairro, setBairro] = useState('');
  const [cidade, setCidade] = useState('');
  const [estado, setEstado] = useState('');
  const [buscandoCep, setBuscandoCep] = useState(false);
  const [nomeResponsavel, setNomeResponsavel] = useState('');
  const [empresa, setEmpresa] = useState('');
  const [empresaId, setEmpresaId] = useState<number | null>(null);
  const [cnpjCpf, setCnpjCpf] = useState('');
  const [enderecoMapa, setEnderecoMapa] = useState('');
  const [servico, setServico] = useState<string[]>([]);
  const [origem, setOrigem] = useState('');
  const [statusNegociacao, setStatusNegociacao] = useState<'novo' | 'negociando' | 'ganho' | 'perdido'>('novo');
  const [proximaData, setProximaData] = useState('');
  const [andamento, setAndamento] = useState('');
  const [responsavelId, setResponsavelId] = useState<number | null>(null);
  const [tagNegociacao, setTagNegociacao] = useState<string>('');
  const [buscandoCpf, setBuscandoCpf] = useState(false);
  const [clienteExistente, setClienteExistente] = useState<any>(null);
  const [filterTag, setFilterTag] = useState<string>('all');
    const [showContratoModal, setShowContratoModal] = useState<boolean>(false);
    const [leadToGenerateContrato, setLeadToGenerateContrato] = useState<Lead | null>(null);
    const [contratoFile, setContratoFile] = useState<File | null>(null);
  const [showVendedorModal, setShowVendedorModal] = useState(false);
  const [leadToAssignVendedor, setLeadToAssignVendedor] = useState<{ leadId: number; nextStage: string } | null>(null);
  const [selectedVendedor, setSelectedVendedor] = useState<number | null>(null);
  const [showDadosModal, setShowDadosModal] = useState(false);
  const [leadToFillData, setLeadToFillData] = useState<Lead | null>(null);
  const [emailDados, setEmailDados] = useState('');
  const [telefoneDados, setTelefoneDados] = useState('');
  const [showOrcamentoModal, setShowOrcamentoModal] = useState(false);
  const [leadToCreateOrcamento, setLeadToCreateOrcamento] = useState<Lead | null>(null);
  const [orcamentoItens, setOrcamentoItens] = useState<Array<{ produtoId: number; codigo: string; nome: string; descricao: string; quantidade: number; unidade: string; precoUnitario: number; subtotal: number }>>([]);
  const [orcamentoDesconto, setOrcamentoDesconto] = useState(0);
  const [orcamentoObservacoes, setOrcamentoObservacoes] = useState('');
  const [orcamentoCondicoesPagamento, setOrcamentoCondicoesPagamento] = useState('');
  const [selectedProdutoIds, setSelectedProdutoIds] = useState<number[]>([]);
  const [produtoSearch, setProdutoSearch] = useState<string>('');

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login');
    }
  }, [status, router]);

  async function buscarCep(cepValue: string) {
    const cepLimpo = cepValue.replace(/\D/g, '');
    
    if (cepLimpo.length !== 8) return;

    setBuscandoCep(true);
    try {
      const response = await fetch(`https://viacep.com.br/ws/${cepLimpo}/json/`);
      const data = await response.json();

      if (!data.erro) {
        setEndereco(data.logradouro || '');
        setBairro(data.bairro || '');
        setComplemento(data.complemento || '');
        setCidade(data.localidade);
        setEstado(data.uf);
        
        // Montar endereço completo para busca no mapa
        let enderecoCompleto = '';
        if (data.logradouro) {
          enderecoCompleto = `${data.logradouro}, ${data.bairro || ''}, ${data.localidade}, ${data.uf}, Brasil`;
        } else {
          enderecoCompleto = `${data.localidade}, ${data.uf}, Brasil`;
        }
        
        // Passar o endereço completo para o MapPicker
        setEnderecoMapa(enderecoCompleto.replace(/,\s*,/g, ',').trim());
        success('CEP encontrado!');
      } else {
        error('CEP não encontrado. Preencha manualmente.');
      }
    } catch (err) {
      error('Erro ao buscar CEP. Preencha manualmente.');
    } finally {
      setBuscandoCep(false);
    }
  }

  async function buscarClientePorCpf(cpfValue: string) {
    const cpfLimpo = cpfValue.replace(/\D/g, '');
    
    if (cpfLimpo.length < 11) return;

    setBuscandoCpf(true);
    try {
      // Buscar empresas pelo CNPJ/CPF
      const response = await api.get(`/empresas`, session?.accessToken || '');
      
      if (response.data && Array.isArray(response.data)) {
        const empresaEncontrada = response.data.find((emp: any) => 
          emp.cnpj.replace(/\D/g, '') === cpfLimpo
        );
        
        if (empresaEncontrada) {
          setClienteExistente(empresaEncontrada);
          success('Cliente encontrado! Dados carregados.');
          
          // Preencher formulário com dados do cliente
          setEmpresa(empresaEncontrada.nome);
          setEmpresaId(empresaEncontrada.id);
          setNomeResponsavel(empresaEncontrada.responsavel || '');
          // Email e telefone do lead serão do formulário
          setCidade(empresaEncontrada.cidade || '');
          setEstado(empresaEncontrada.estado || '');
          setCep(empresaEncontrada.cep || '');
        } else {
          setClienteExistente(null);
          success('CPF/CNPJ não cadastrado. Novo cliente.');
        }
      }
    } catch (err) {
      console.error('Erro ao buscar cliente:', err);
    } finally {
      setBuscandoCpf(false);
    }
  }

  async function handleSaveLead(formData: FormData) {
    const tipoPessoa = formData.get('tipoPessoa') as string;
    const nomeResponsavel = formData.get('nomeResponsavel') as string;
    const cidadeForm = formData.get('cidade') as string;
    const estadoForm = formData.get('estado') as string;
    const cnpjValue = (formData.get('cnpjCpf') as string) || '';
    const emailValue = (formData.get('email') as string) || '';
    const telefoneValue = (formData.get('telefone') as string) || '';
    const data: any = {
      nomeResponsavel: nomeResponsavel,
      tipoPessoa: tipoPessoa,
      cnpjCpf: cnpjValue || undefined,
      cep: formData.get('cep') as string || undefined,
      localidade: cidadeForm && estadoForm ? `${cidadeForm}/${estadoForm}` : undefined,
      latitude: mapLocation?.lat,
      longitude: mapLocation?.lng,
      email: emailValue || undefined,
      telefone: telefoneValue || undefined,
      observacoes: formData.get('observacoes') as string || undefined,
      servicos: servico.length > 0 ? servico : undefined,
      origem: origem || undefined,
      tagNegociacao: tagNegociacao || undefined,
      proximaData: proximaData || undefined,
      andamento: andamento || undefined,
      responsavel_id: responsavelId || undefined,
    };

    // Para atualização, enviar empresa_id se disponível
    if (editingLead) {
      if (empresaId) {
        data.empresa = empresaId;
      }
    } else {
      // Para criação, enviar nome da empresa
      data.empresa = tipoPessoa === 'PF' ? nomeResponsavel : (formData.get('empresa') as string);
    }

    const isSuccess = editingLead
      ? await updateLead(editingLead.id, data)
      : await createLead(data);

    if (isSuccess) {
      success(editingLead ? 'Lead atualizado com sucesso!' : 'Lead criado com sucesso!');
      setShowModal(false);
      setEditingLead(null);
      setMapLocation({ lat: -15.7939, lng: -47.8828, address: '' }); // Reset para Brasília
      setTipoPessoaForm('PJ');
      setCep('');
      setCidade('');
      setEstado('');
      setNomeResponsavel('');
      setEmpresa('');
      setEmpresaId(null);
      setCnpjCpf('');
      setEnderecoMapa('');
      setServico([]);
      setOrigem('');
      setStatusNegociacao('novo');
      setTagNegociacao('');
      setProximaData('');
      setAndamento('');
      setResponsavelId(null);
    } else {
      error('Erro ao salvar lead. Tente novamente.');
    }
  }

  async function handleDeleteLead(id: number) {
    setLeadToDelete(id);
    setShowConfirmModal(true);
  }

  async function confirmDelete() {
    if (leadToDelete === null) return;
    const isSuccess = await deleteLead(leadToDelete);
    if (isSuccess) {
      success('Lead excluído com sucesso!');
    } else {
      error('Erro ao excluir lead.');
    }
    setLeadToDelete(null);
  }

  async function handleDrop(stageId: string) {
    if (!draggedLead) return;
    await updateLeadStage(draggedLead.id, stageId as Lead['etapa']);
    setDraggedLead(null);
  }

  if (status === 'loading' || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-xl">Carregando...</div>
      </div>
    );
  }

  if (!session) return null;

  const getStageInfo = (stageId: string) => stages.find(s => s.id === stageId);
  const getStageIndex = (stageId: string) => stages.findIndex(s => s.id === stageId);
  const vendedores = (usuariosData || []).filter((usuario) => usuario.funcao === UsuarioRole.VENDEDOR);

  const filteredLeads = filterStage === 'all'
    ? (filterTag === 'all'
        ? leads
        : leads.filter(lead => lead.etapa === 'contrato'
          ? (lead as any).tagContrato === filterTag
          : (lead as any).tagNegociacao === filterTag))
    : leads.filter(lead => {
        const stageMatch = lead.etapa === filterStage;
        if (!stageMatch) return false;
        if (filterTag === 'all') return true;
        return lead.etapa === 'contrato'
          ? (lead as any).tagContrato === filterTag
          : (lead as any).tagNegociacao === filterTag;
      });

  async function handleMoveStage(leadId: number, currentStage: string, direction: 'forward' | 'back') {
    const currentIndex = getStageIndex(currentStage);
    const newIndex = direction === 'forward' ? currentIndex + 1 : currentIndex - 1;
    
    if (newIndex < 0 || newIndex >= stages.length) return;
    
    // Validações antes de avançar
    if (direction === 'forward') {
      const lead = leads.find(l => l.id === leadId);
      
      // Card 1 -> Card 2: Abrir modal para atribuir vendedor
      if (currentStage === 'contato_inicial') {
        setLeadToAssignVendedor({ leadId, nextStage: stages[newIndex].id });
        setSelectedVendedor(lead?.responsavel_id || null);
        setShowVendedorModal(true);
        return;
      }
      
      // Card 2 -> Card 3: Pode adicionar validações futuras (ex: Serasa feito)
      // if (currentStage === 'negociacao_inicial' && !lead?.consultaSerasa) {
      //   error('Você precisa realizar a consulta Serasa antes de avançar.');
      //   return;
      // }
    }
    
    const newStage = stages[newIndex].id;
    await updateLeadStage(leadId, newStage as Lead['etapa']);
  }

  async function confirmVendedorAndAdvance() {
    if (!leadToAssignVendedor) return;

    // Atualizar o vendedor do lead
    const updateSuccess = await updateLead(leadToAssignVendedor.leadId, {
      responsavel_id: selectedVendedor || undefined,
    });

    if (!updateSuccess) {
      error('Erro ao atribuir vendedor.');
      return;
    }

    // Avançar para a próxima etapa
    await updateLeadStage(leadToAssignVendedor.leadId, leadToAssignVendedor.nextStage as Lead['etapa']);
    
    success(selectedVendedor ? 'Vendedor atribuído e lead avançado!' : 'Lead avançado sem vendedor.');
    setShowVendedorModal(false);
    setLeadToAssignVendedor(null);
    setSelectedVendedor(null);
  }

  async function handleSaveDadosCliente() {
    if (!leadToFillData) return;

    // Criar empresa (PF ou PJ) se houver dados suficientes
    let empresaIdToLink: number | null = null;
    if (cnpjCpf && leadToFillData.tipoPessoa) {
      const nomeEmpresa = leadToFillData.tipoPessoa === 'PJ'
        ? (typeof leadToFillData.empresa === 'object' && leadToFillData.empresa ? leadToFillData.empresa.nome : leadToFillData.empresa || leadToFillData.nomeResponsavel)
        : leadToFillData.nomeResponsavel;

      const empresaData = {
        nome: nomeEmpresa,
        cnpj: cnpjCpf.replace(/[.\-\/]/g, ''),
        responsavel: leadToFillData.nomeResponsavel,
        email: emailDados || '',
        telefone: telefoneDados || '',
        endereco: endereco || '',
        numero: numero || '',
        complemento: complemento || '',
        bairro: bairro || '',
        cidade: cidade || '',
        estado: estado || '',
        cep: cep || '',
      };

      const novaEmpresa = await createEmpresa(empresaData);
      if (novaEmpresa) {
        empresaIdToLink = novaEmpresa.id;
      }
    }

    const updateSuccess = await updateLead(leadToFillData.id, {
      cep: cep || undefined,
      endereco: endereco || undefined,
      numero: numero || undefined,
      complemento: complemento || undefined,
      bairro: bairro || undefined,
      cidade: cidade || undefined,
      estado: estado || undefined,
      localidade: cidade && estado ? `${cidade}/${estado}` : undefined,
      email: emailDados || undefined,
      telefone: telefoneDados || undefined,
      cnpjCpf: cnpjCpf || undefined,
      latitude: mapLocation?.lat,
      longitude: mapLocation?.lng,
      empresa: empresaIdToLink ? empresaIdToLink.toString() : undefined,
    });

    if (updateSuccess) {
      success(empresaIdToLink ? 'Cliente criado e dados atualizados com sucesso!' : 'Dados do cliente atualizados com sucesso!');
      setShowDadosModal(false);
      setLeadToFillData(null);
      // Reset dos campos
      setCep('');
      setEndereco('');
      setNumero('');
      setComplemento('');
      setBairro('');
      setCidade('');
      setEstado('');
      setCnpjCpf('');
      setEmailDados('');
      setTelefoneDados('');
    } else {
      error('Erro ao atualizar dados do cliente.');
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 flex">
      <Sidebar />
      
      <div className="flex-1 lg:ml-20">
        <header className="bg-white shadow-sm sticky top-0 z-30">
          <div className="px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
            <h1 className="text-xl font-semibold text-gray-900 ml-12 lg:ml-0">Painel de Gestão</h1>
            <button
              onClick={() => {
                setEditingLead(null);
                setTipoPessoaForm('PJ');
                setCep('');
                setEndereco('');
                setNumero('');
                setComplemento('');
                setBairro('');
                setCidade('');
                setEstado('');
                setNomeResponsavel('');
                setEmpresa('');
                setEmpresaId(null);
                setCnpjCpf('');
                setEnderecoMapa('');
                setServico([]);
                setOrigem('');
                setStatusNegociacao('novo');
                setTagNegociacao('');
                setProximaData('');
                setAndamento('');
                setResponsavelId(session?.user?.id ? Number(session.user.id) : null);
                setShowModal(true);
              }}
              className="flex items-center gap-2 px-2 sm:px-4 py-2 sm:py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition shadow-sm"
              title="Novo Lead"
            >
              <HiPlus className="h-5 w-5" />
              <span className="hidden sm:inline">Novo Lead</span>
            </button>
          </div>
        </header>

        <main className="p-4 sm:p-6 lg:p-8">
          {/* Estatísticas */}
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4 mb-6">
            {stages.map(stage => {
              const stageLeads = leads.filter(lead => lead.etapa === stage.id);
              const totalValue = stageLeads.reduce((sum, lead) => sum + (lead.valorEstimado || 0), 0);
              
              return (
                <div key={stage.id} className="bg-white rounded-lg shadow-sm p-4 border border-gray-100">
                  <div className="flex items-center gap-2 mb-2">
                    <div className={`w-3 h-3 rounded-full ${stage.color}`}></div>
                    <h3 className="font-semibold text-gray-900">{stage.label}</h3>
                  </div>
                  <div className="text-2xl font-bold text-gray-900">{stageLeads.length}</div>

                </div>
              );
            })}
          </div>

          {/* Filtro por etapa */}
          <div className="bg-white rounded-lg shadow-sm p-4 mb-4 border border-gray-100">
            <h3 className="text-sm font-semibold text-gray-700 mb-2">Filtrar por Etapa</h3>
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => setFilterStage('all')}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
                  filterStage === 'all'
                    ? 'bg-gray-900 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                Todos ({leads.length})
              </button>
              {stages.map(stage => {
                const count = leads.filter(lead => lead.etapa === stage.id).length;
                return (
                  <button
                    key={stage.id}
                    onClick={() => setFilterStage(stage.id)}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition flex items-center gap-2 ${
                      filterStage === stage.id
                        ? `${stage.color} text-white`
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    <div className={`w-2 h-2 rounded-full ${filterStage === stage.id ? 'bg-white' : stage.color}`}></div>
                    {stage.label} ({count})
                  </button>
                );
              })}
            </div>
          </div>

          {/* Filtro por TAG de Negociação */}
          {(filterStage === 'orcamento_aprovacao' || filterStage === 'negociacao_fechamento') && (
            <div className="bg-white rounded-lg shadow-sm p-4 mb-6 border border-gray-100">
              <h3 className="text-sm font-semibold text-gray-700 mb-2">Filtrar por Tag de Negociação</h3>
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => setFilterTag('all')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium transition ${
                    filterTag === 'all'
                      ? 'bg-gray-700 text-white'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  Todas
                </button>
                {tagNegociacaoOptions.map(tag => {
                  const count = leads.filter(lead => (lead as any).tagNegociacao === tag.value).length;
                  return (
                    <button
                      key={tag.value}
                      onClick={() => setFilterTag(tag.value)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-medium transition ${
                        filterTag === tag.value
                          ? tag.color
                          : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                      }`}
                    >
                      {tag.label} ({count})
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Filtro por TAG de Contrato */}
          {filterStage === 'contrato' && (
            <div className="bg-white rounded-lg shadow-sm p-4 mb-6 border border-gray-100">
              <h3 className="text-sm font-semibold text-gray-700 mb-2">Filtrar por Tag de Contrato</h3>
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => setFilterTag('all')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium transition ${
                    filterTag === 'all'
                      ? 'bg-gray-700 text-white'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  Todas
                </button>
                {contractTagOptions.map(tag => {
                  const count = leads.filter(lead => lead.etapa === 'contrato' && (lead as any).tagContrato === tag.value).length;
                  return (
                    <button
                      key={tag.value}
                      onClick={() => setFilterTag(tag.value)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-medium transition ${
                        filterTag === tag.value
                          ? tag.color
                          : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                      }`}
                    >
                      {tag.label} ({count})
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Grid de Leads */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {filteredLeads.map(lead => {
              const stageInfo = getStageInfo(lead.etapa);
              const currentIndex = getStageIndex(lead.etapa);
              const canMoveBack = currentIndex > 0;
              const canMoveForward = currentIndex < stages.length - 1;
              const statusKey = ((lead as any).statusNegociacao as StatusKey) || 'novo';
              
              // Verificar se pode avançar baseado na etapa atual
              const canAdvance = () => {
                // Negociação Inicial: precisa ter CPF/CNPJ preenchido
                if (lead.etapa === 'negociacao_inicial' && !lead.cnpjCpf) {
                  return false;
                }
                return canMoveForward;
              };

              return (
                <div
                  key={lead.id}
                  className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition"
                >
                  {/* Header colorido */}
                  <div className={`${stageInfo?.color} p-4`}>
                    <div className="flex items-center justify-between">
                      <span className="text-white text-sm font-semibold">{stageInfo?.label}</span>
                      <div className="flex gap-1">
                        <button
                          onClick={() => {
                            setEditingLead(lead);
                            setTipoPessoaForm((lead.tipoPessoa as 'PF' | 'PJ') || 'PJ');
                            // Extrair cidade e estado de localidade
                            if (lead.localidade && lead.localidade.includes('/')) {
                              const [cidadeLead, estadoLead] = lead.localidade.split('/');
                              setCidade(cidadeLead || '');
                              setEstado(estadoLead || '');
                            } else {
                              setCidade('');
                              setEstado('');
                            }
                            setCep(lead.cep || '');
                            setNomeResponsavel(lead.nomeResponsavel || '');
                            if (typeof lead.empresa === 'object') {
                              setEmpresa(lead.empresa.nome);
                              setEmpresaId(lead.empresa.id);
                            } else {
                              setEmpresa(lead.empresa || '');
                              setEmpresaId(null);
                            }
                            setCnpjCpf(lead.cnpjCpf || '');
                            setEnderecoMapa('');
                            setServico(Array.isArray((lead as any).servicos) ? (lead as any).servicos : []);
                            setOrigem(lead.origem || '');
                            setStatusNegociacao((lead as any).statusNegociacao || 'novo');
                            setTagNegociacao((lead as any).tagNegociacao || '');
                            setProximaData(lead.proximaData ? lead.proximaData.slice(0, 10) : '');
                            setAndamento((lead as any).andamento || '');
                            setResponsavelId(lead.responsavel?.id ?? null);
                            // Atualizar localização do mapa se tiver coordenadas
                            if (lead.latitude && lead.longitude) {
                              setMapLocation({
                                lat: lead.latitude,
                                lng: lead.longitude,
                                address: lead.localidade || ''
                              });
                            } else {
                              setMapLocation({ lat: -15.7939, lng: -47.8828, address: '' });
                            }
                            setShowModal(true);
                          }}
                          className="p-1.5 bg-white/20 hover:bg-white/30 rounded text-white transition"
                        >
                          <HiPencil className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteLead(lead.id)}
                          className="p-1.5 bg-white/20 hover:bg-white/30 rounded text-white transition"
                        >
                          <HiTrash className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Conteúdo */}
                  <div className="p-4 space-y-3">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-bold text-gray-900 text-lg">{lead.nomeResponsavel}</h3>
                        {lead.tipoPessoa && (
                          <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                            lead.tipoPessoa === 'PF' ? 'bg-blue-100 text-blue-700' : 'bg-purple-100 text-purple-700'
                          }`}>
                            {lead.tipoPessoa}
                          </span>
                        )}
                        {statusOptions[statusKey] && (
                          <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${statusOptions[statusKey].className}`}>
                            {statusOptions[statusKey].label}
                          </span>
                        )}
                      </div>
                      {lead.tipoPessoa === 'PJ' && (
                        <p className="text-sm text-gray-600">
                          {typeof lead.empresa === 'object' && lead.empresa !== null ? lead.empresa.nome : lead.empresa || '-'}
                        </p>
                      )}
                      {lead.cnpjCpf && (
                        <p className="text-xs text-gray-500 mt-1">CNPJ/CPF: {lead.cnpjCpf}</p>
                      )}
                      {lead.localidade && (
                        <div className="flex items-center gap-1 mt-1">
                          <p className="text-xs text-gray-500">📍 {lead.localidade}</p>
                          {lead.latitude && lead.longitude && (
                            <a
                              href={`https://www.google.com/maps?q=${lead.latitude},${lead.longitude}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-xs text-blue-600 hover:text-blue-800 underline"
                              onClick={(e) => e.stopPropagation()}
                            >
                              (mapa)
                            </a>
                          )}
                        </div>
                      )}
                      {(lead as any).servicos && Array.isArray((lead as any).servicos) && (lead as any).servicos.length > 0 && (
                        <p className="text-xs text-gray-600">Serviços: {((lead as any).servicos as string[]).join(', ')}</p>
                      )}
                      {(lead as any).origem && (
                        <p className="text-xs text-gray-600">Origem: {(lead as any).origem}</p>
                      )}
                      {(lead as any).proximaData && (
                        <p className="text-xs text-gray-500">Próxima ação: {(lead as any).proximaData?.slice(0, 10)}</p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <HiMail className="h-4 w-4 text-gray-400" />
                        <span className="truncate">{lead.email}</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <HiPhone className="h-4 w-4 text-gray-400" />
                        {lead.telefone}
                      </div>
                      {(lead as any).responsavel && (
                        <p className="text-xs text-gray-600">Vendedor: {(lead as any).responsavel?.nome}</p>
                      )}
                      {/* Negotiation tag pill for non-contract stages */}
                      {lead.etapa !== 'contrato' && (lead as any).tagNegociacao && (
                        <div className="mt-2">
                          <span className={`inline-block text-xs px-2 py-1 rounded-full font-medium ${
                            tagNegociacaoOptions.find(t => t.value === (lead as any).tagNegociacao)?.color || 'bg-gray-100 text-gray-800'
                          }`}>
                            {tagNegociacaoOptions.find(t => t.value === (lead as any).tagNegociacao)?.label || (lead as any).tagNegociacao}
                          </span>
                          {/* Quick negotiation tag change */}
                          {['orcamento_aprovacao', 'negociacao_fechamento'].includes(lead.etapa) && (
                            <div className="mt-2">
                              <select
                                value={(lead as any).tagNegociacao || ''}
                                onChange={async (e) => {
                                  const value = e.target.value;
                                  await updateLead(lead.id, { tagNegociacao: value as any });
                                }}
                                className="w-full px-2 py-1 border border-gray-300 rounded text-xs focus:ring-2 focus:ring-emerald-400 placeholder-gray-400"
                              >
                                <option value="">Definir Tag</option>
                                {tagNegociacaoOptions.map(opt => (
                                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                                ))}
                              </select>
                            </div>
                          )}
                        </div>
                      )}

                      {/* Contract tag pill and selector only in contrato stage */}
                      {lead.etapa === 'contrato' && (
                        <div className="mt-2">
                          {(lead as any).tagContrato && (
                            <span className={`inline-block text-xs px-2 py-1 rounded-full font-medium ${
                              contractTagOptions.find(t => t.value === (lead as any).tagContrato)?.color || 'bg-gray-100 text-gray-800'
                            }`}>
                              {contractTagOptions.find(t => t.value === (lead as any).tagContrato)?.label || (lead as any).tagContrato}
                            </span>
                          )}
                          <div className="mt-2">
                            <select
                              value={(lead as any).tagContrato || ''}
                              onChange={async (e) => {
                                const value = e.target.value;
                                await updateLead(lead.id, { tagContrato: value as any });
                              }}
                              className="w-full px-2 py-1 border border-gray-300 rounded text-xs focus:ring-2 focus:ring-emerald-400 placeholder-gray-400"
                            >
                              <option value="">Definir Tag</option>
                              {contractTagOptions.map(opt => (
                                <option key={opt.value} value={opt.value}>{opt.label}</option>
                              ))}
                            </select>
                          </div>
                        </div>
                      )}
                    </div>

                    {lead.observacoes && (
                      <div className="pt-2">
                        <p className="text-xs text-gray-500 line-clamp-2">{lead.observacoes}</p>
                      </div>
                    )}

                    {/* Alertas específicos por etapa */}
                    {lead.etapa === 'negociacao_inicial' && !lead.cnpjCpf && (
                      <div className="pt-2">
                        <div className="bg-orange-50 border border-orange-200 rounded-lg p-2">
                          <div className="flex items-center gap-2">
                            <HiExclamation className="h-4 w-4 text-orange-600" />
                            <p className="text-xs text-orange-800">
                              Preencha o {lead.tipoPessoa === 'PF' ? 'CPF' : 'CNPJ'} para avançar
                            </p>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Botões de navegação */}
                  <div className="px-4 pb-4 space-y-2">
                    {/* Botões de ação específicos por etapa */}
                    {lead.etapa === 'negociacao_inicial' && (
                      <button
                        onClick={() => {
                          setLeadToFillData(lead);
                          // Pré-preencher com dados existentes
                          setCep(lead.cep || '');
                          if (lead.localidade && lead.localidade.includes('/')) {
                            const [cidadeLead, estadoLead] = lead.localidade.split('/');
                            setCidade(cidadeLead || '');
                            setEstado(estadoLead || '');
                          }
                          setCnpjCpf(lead.cnpjCpf || '');
                          setEmailDados(lead.email || '');
                          setTelefoneDados(lead.telefone || '');
                          if (lead.latitude && lead.longitude) {
                            setMapLocation({ lat: lead.latitude, lng: lead.longitude, address: lead.localidade || '' });
                          }
                          setShowDadosModal(true);
                        }}
                        className="w-full flex items-center justify-center gap-2 px-3 py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700 transition"
                      >
                        <HiClipboardList className="h-5 w-5" />
                        Preencher Dados
                      </button>
                    )}

                    {lead.etapa === 'orcamento_aprovacao' && (
                      <button
                        onClick={() => {
                          setLeadToCreateOrcamento(lead);
                          setShowOrcamentoModal(true);
                        }}
                        className="w-full flex items-center justify-center gap-2 px-3 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition"
                      >
                        <HiCurrencyDollar className="h-5 w-5" />
                        Criar Orçamento
                      </button>
                    )}
                    
                    {lead.etapa === 'negociacao_fechamento' && (
                      <div className="grid grid-cols-2 gap-2">
                        <button
                          onClick={() => {/* TODO: Gerar PDF */}}
                          className="flex items-center justify-center gap-1 px-2 py-2 bg-purple-600 text-white rounded-lg text-xs font-medium hover:bg-purple-700 transition"
                        >
                          <HiDocumentText className="h-4 w-4" />
                          PDF
                        </button>
                        <button
                          onClick={() => {/* TODO: Enviar Email */}}
                          className="flex items-center justify-center gap-1 px-2 py-2 bg-indigo-600 text-white rounded-lg text-xs font-medium hover:bg-indigo-700 transition"
                        >
                          <HiMail className="h-4 w-4" />
                          Email
                        </button>
                      </div>
                    )}

                    {lead.etapa === 'contrato' && (
                      <div className="flex gap-2">
                        <button
                          onClick={() => {
                            setLeadToGenerateContrato(lead);
                            setShowContratoModal(true);
                          }}
                          className="flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition bg-indigo-600 text-white hover:bg-indigo-700"
                        >
                          Botão Gerar Contrato
                        </button>
                      </div>
                    )}

                    {/* Navegação padrão */}
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleMoveStage(lead.id, lead.etapa, 'back')}
                        disabled={!canMoveBack}
                        className={`flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition ${
                          canMoveBack
                            ? 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                            : 'bg-gray-50 text-gray-300 cursor-not-allowed'
                        }`}
                      >
                        <HiChevronLeft className="h-4 w-4" />
                        Voltar
                      </button>
                      <button
                        onClick={() => handleMoveStage(lead.id, lead.etapa, 'forward')}
                        disabled={!canAdvance()}
                        className={`flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition ${
                          canAdvance()
                            ? 'bg-emerald-600 text-white hover:bg-emerald-700'
                            : 'bg-gray-50 text-gray-300 cursor-not-allowed'
                        }`}
                      >
                        Avançar
                        <HiChevronRight className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {filteredLeads.length === 0 && (
            <div className="text-center py-12">
              <HiFolder className="h-16 w-16 mx-auto text-gray-300 mb-4" />
              <p className="text-gray-500 text-lg font-medium">Nenhum lead encontrado</p>
              <p className="text-gray-400 text-sm mt-1">Clique em "Novo Lead" para começar</p>
            </div>
          )}
        </main>
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-xl font-bold text-gray-900">
                {editingLead ? 'Editar Lead' : 'Novo Lead'}
              </h2>
            </div>
            
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSaveLead(new FormData(e.currentTarget));
              }}
              className="p-6 space-y-4"
            >
              {/* Busca por CPF/CNPJ existente - apenas para novo lead */}
              {!editingLead && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <h3 className="text-sm font-semibold text-blue-900 mb-2 ">🔍 Buscar Cliente Existente</h3>
                  <p className="text-xs text-blue-700 mb-3">
                    Digite o CPF/CNPJ para verificar se o cliente já está cadastrado
                  </p>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={cnpjCpf}
                      onChange={(e) => setCnpjCpf(e.target.value)}
                      placeholder="000.000.000-00 ou 00.000.000/0000-00"
                      className="flex-1 px-3 py-2 border border-blue-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-400 placeholder-gray-400"
                      maxLength={18}
                    />
                    <button
                      type="button"
                      onClick={() => buscarClientePorCpf(cnpjCpf)}
                      disabled={buscandoCpf}
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition disabled:opacity-50"
                    >
                      {buscandoCpf ? 'Buscando...' : 'Buscar'}
                    </button>
                  </div>
                  {clienteExistente && (
                    <div className="mt-3 p-3 bg-green-50 border border-green-200 rounded-lg">
                      <p className="text-xs text-green-800 font-medium">
                        ✅ Cliente encontrado: {clienteExistente.nome}
                      </p>
                      <p className="text-xs text-green-700 mt-1">
                        Dados foram preenchidos automaticamente
                      </p>
                    </div>
                  )}
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Tipo de Pessoa *</label>
                  <select
                    name="tipoPessoa"
                    required
                    value={tipoPessoaForm}
                    onChange={(e) => setTipoPessoaForm(e.target.value as 'PF' | 'PJ')}
                    className="block w-full px-4 py-2.5 border border-gray-200 rounded-lg text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-400"
                  >
                    <option value="">Selecione</option>
                    <option value="PF">Pessoa Física (PF)</option>
                    <option value="PJ">Pessoa Jurídica (PJ)</option>
                  </select>
                </div>
                {tipoPessoaForm === 'PJ' ? (
                  <>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Nome da Empresa *</label>
                      <input
                        name="empresa"
                        type="text"
                        required
                        value={empresa}
                        onChange={(e) => setEmpresa(e.target.value)}
                        className="block w-full px-4 py-2.5 border border-gray-200 rounded-lg text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-400"
                        placeholder="Nome da empresa"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Responsável *</label>
                      <input
                        name="nomeResponsavel"
                        type="text"
                        required
                        value={nomeResponsavel}
                        onChange={(e) => setNomeResponsavel(e.target.value)}
                        className="block w-full px-4 py-2.5 border border-gray-200 rounded-lg text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-400"
                        placeholder="Nome do responsável"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">CNPJ</label>
                      <input
                        name="cnpjCpf"
                        type="text"
                        maxLength={20}
                        value={cnpjCpf}
                        onChange={(e) => setCnpjCpf(e.target.value)}
                        className="block w-full px-4 py-2.5 border border-gray-200 rounded-lg text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-400"
                        placeholder="00.000.000/0000-00"
                      />
                    </div>
                  </>
                ) : (
                  <>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Nome Completo *</label>
                      <input
                        name="nomeResponsavel"
                        type="text"
                        required
                        value={nomeResponsavel}
                        onChange={(e) => setNomeResponsavel(e.target.value)}
                        className="block w-full px-4 py-2.5 border border-gray-200 rounded-lg text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-400"
                        placeholder="Nome completo"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">CPF</label>
                      <input
                        name="cnpjCpf"
                        type="text"
                        maxLength={14}
                        value={cnpjCpf}
                        onChange={(e) => setCnpjCpf(e.target.value)}
                        className="block w-full px-4 py-2.5 border border-gray-200 rounded-lg text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-400"
                        placeholder="000.000.000-00"
                      />
                    </div>
                  </>
                )}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">CEP</label>
                  <input
                    name="cep"
                    type="text"
                    value={cep}
                    onChange={(e) => {
                      const value = e.target.value.replace(/\D/g, '').slice(0, 8);
                      setCep(value);
                      if (value.length === 8) {
                        buscarCep(value);
                      }
                    }}
                    className="block w-full px-4 py-2.5 border border-gray-200 rounded-lg text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-400"
                    placeholder="00000-000"
                    maxLength={8}
                  />
                  {buscandoCep && <p className="text-xs text-blue-600 mt-1">Buscando CEP...</p>}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Endereço</label>
                  <input
                    name="endereco"
                    type="text"
                    value={endereco}
                    onChange={(e) => setEndereco(e.target.value)}
                    className="block w-full px-4 py-2.5 border border-gray-200 rounded-lg text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-400"
                    placeholder="Rua, Avenida, etc"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Número</label>
                  <input
                    name="numero"
                    type="text"
                    value={numero}
                    onChange={(e) => setNumero(e.target.value)}
                    className="block w-full px-4 py-2.5 border border-gray-200 rounded-lg text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-400"
                    placeholder="Número"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Complemento</label>
                  <input
                    name="complemento"
                    type="text"
                    value={complemento}
                    onChange={(e) => setComplemento(e.target.value)}
                    className="block w-full px-4 py-2.5 border border-gray-200 rounded-lg text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-400"
                    placeholder="Apto, Sala, etc (opcional)"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Bairro</label>
                  <input
                    name="bairro"
                    type="text"
                    value={bairro}
                    onChange={(e) => setBairro(e.target.value)}
                    className="block w-full px-4 py-2.5 border border-gray-200 rounded-lg text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-400"
                    placeholder="Bairro"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Cidade</label>
                  <input
                    name="cidade"
                    type="text"
                    value={cidade}
                    onChange={(e) => setCidade(e.target.value)}
                    className="block w-full px-4 py-2.5 border border-gray-200 rounded-lg text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-400"
                    placeholder="Cidade"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Estado</label>
                  <select
                    name="estado"
                    value={estado}
                    onChange={(e) => setEstado(e.target.value)}
                    className="block w-full px-4 py-2.5 border border-gray-200 rounded-lg text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-400"
                  >
                    <option value="">Selecione o estado</option>
                    {estadosBrasil.map(uf => (
                      <option key={uf.sigla} value={uf.sigla}>{uf.nome} ({uf.sigla})</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                  <input
                    name="email"
                    type="email"
                    defaultValue={editingLead?.email}
                    className="block w-full px-4 py-2.5 border border-gray-200 rounded-lg text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-400"
                    placeholder="email@exemplo.com"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Telefone</label>
                  <input
                    name="telefone"
                    type="tel"
                    defaultValue={editingLead?.telefone}
                    className="block w-full px-4 py-2.5 border border-gray-200 rounded-lg text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-400"
                    placeholder="(00) 00000-0000"
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Tipo de Serviço *</label>
                  <div className="flex flex-wrap gap-2">
                    {servicoOptions.map((option) => (
                      <button
                        key={option}
                        type="button"
                        onClick={() => {
                          if (servico.includes(option)) {
                            setServico(servico.filter(s => s !== option));
                          } else {
                            setServico([...servico, option]);
                          }
                        }}
                        className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
                          servico.includes(option)
                            ? 'bg-emerald-600 text-white'
                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                        }`}
                      >
                        {option}
                      </button>
                    ))}
                  </div>
                  {servico.length === 0 && (
                    <p className="text-xs text-red-600 mt-2">Selecione pelo menos um serviço</p>
                  )}
                  {servico.length > 0 && (
                    <div className="mt-3 flex flex-wrap gap-2">
                      {servico.map((s) => (
                        <div key={s} className="bg-emerald-50 border border-emerald-200 rounded-lg px-3 py-1.5 flex items-center gap-2">
                          <span className="text-sm text-emerald-700">{s}</span>
                          <button
                            type="button"
                            onClick={() => setServico(servico.filter(item => item !== s))}
                            className="text-emerald-600 hover:text-emerald-800 font-bold"
                          >
                            ✕
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Origem do Cliente *</label>
                  <select
                    value={origem}
                    onChange={(e) => setOrigem(e.target.value)}
                    required
                    className="block w-full px-4 py-2.5 border border-gray-200 rounded-lg text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-400"
                  >
                    <option value="">Selecione a origem</option>
                    {origemOptions.map((option) => (
                      <option key={option} value={option}>{option}</option>
                    ))}
                  </select>
                </div>
                {/* <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Localização do Poço</label>
                  <MapPicker
                    initialLatitude={typeof editingLead?.latitude === 'number' ? editingLead.latitude : typeof editingLead?.latitude === 'string' ? parseFloat(editingLead.latitude) : mapLocation.lat}
                    initialLongitude={typeof editingLead?.longitude === 'number' ? editingLead.longitude : typeof editingLead?.longitude === 'string' ? parseFloat(editingLead.longitude) : mapLocation.lng}
                    initialAddress={mapLocation.address}
                    searchAddress={enderecoMapa}
                    onLocationChange={(location) => setMapLocation(location)}
                  />
                </div> */}
                
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Observações</label>
                  <textarea
                    name="observacoes"
                    rows={3}
                    defaultValue={editingLead?.observacoes || ''}
                    className="block w-full px-4 py-2.5 border border-gray-200 rounded-lg text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-400"
                    placeholder="Informações adicionais sobre o lead..."
                  />
                </div>

                {/* Campos específicos por etapa */}
                {editingLead && (
                  <>
                    {/* Card 2: Negociação Inicial - Consulta Serasa e Pré-Orçamento */}
                    {editingLead.etapa === 'negociacao_inicial' && (
                      <>
                        <div className="md:col-span-2 border-t pt-4">
                          <h3 className="text-md font-semibold text-gray-900 mb-3">📋 Negociação Inicial</h3>
                        </div>
                        <div className="md:col-span-2">
                          <label className="block text-sm font-medium text-gray-700 mb-1">Consulta Serasa</label>
                          <textarea
                            rows={3}
                            defaultValue={(editingLead as any).consultaSerasa || ''}
                            className="block w-full px-4 py-2.5 border border-gray-200 rounded-lg text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-400"
                            placeholder="Cole aqui os dados da consulta Serasa pelo CPF..."
                          />
                        </div>
                        <div className="md:col-span-2">
                          <label className="block text-sm font-medium text-gray-700 mb-1">Pré-Orçamento</label>
                          <textarea
                            rows={4}
                            defaultValue={(editingLead as any).preOrcamento || ''}
                            className="block w-full px-4 py-2.5 border border-gray-200 rounded-lg text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-400"
                            placeholder="Descreva o pré-orçamento: serviços estimados, valores aproximados, etc..."
                          />
                        </div>
                      </>
                    )}

                    {/* Card 3: Orçamento - Aprovação */}
                    {editingLead.etapa === 'orcamento_aprovacao' && (
                      <>
                        <div className="md:col-span-2 border-t pt-4">
                          <h3 className="text-md font-semibold text-gray-900 mb-3">💰 Orçamento - Aprovação</h3>
                          <p className="text-sm text-gray-600">
                            Para criar um orçamento formal, vá para a seção "Orçamentos" no menu.
                          </p>
                        </div>
                      </>
                    )}

                    {/* Card 4: Negociação de Fechamento - Tags e Ações */}
                    {editingLead.etapa === 'negociacao_fechamento' && (
                      <>
                        <div className="md:col-span-2 border-t pt-4">
                          <h3 className="text-md font-semibold text-gray-900 mb-3">🤝 Negociação de Fechamento</h3>
                          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-3">
                            <p className="text-sm text-blue-800">
                              <strong>Dica:</strong> Use as Tags de Negociação acima para acompanhar o status com o cliente.
                            </p>
                          </div>
                        </div>
                      </>
                    )}

                    {/* Card 5: Contrato */}
                    {editingLead.etapa === 'contrato' && (
                      <>
                        <div className="md:col-span-2 border-t pt-4">
                          <h3 className="text-md font-semibold text-gray-900 mb-3">📄 Contrato e Assinatura</h3>
                          <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                            <p className="text-sm text-green-800">
                              <strong>Contrato em andamento!</strong> Utilize a seção de Documentos para anexar contratos assinados.
                            </p>
                          </div>
                        </div>
                      </>
                    )}
                  </>
                )}
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setShowModal(false);
                    setEditingLead(null);
                    setMapLocation({ lat: -15.7939, lng: -47.8828, address: '' });
                    setTipoPessoaForm('PJ');
                    setCep('');
                    setEndereco('');
                    setNumero('');
                    setComplemento('');
                    setBairro('');
                    setCidade('');
                    setEstado('');
                    setNomeResponsavel('');
                    setEmpresa('');
                    setCnpjCpf('');
                    setEnderecoMapa('');
                    setServico([]);
                    setOrigem('');
                    setStatusNegociacao('novo');
                    setTagNegociacao('');
                    setProximaData('');
                    setAndamento('');
                    setResponsavelId(null);
                  }}
                  className="flex-1 px-4 py-2.5 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2.5 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition"
                >
                  {editingLead ? 'Salvar Alterações' : 'Criar Lead'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal de Criar Orçamento */}
      {showOrcamentoModal && leadToCreateOrcamento && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-5xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-xl font-bold text-gray-900">Criar Orçamento</h2>
              <p className="text-sm text-gray-600 mt-1">Monte o orçamento para {leadToCreateOrcamento.nomeResponsavel}</p>
            </div>
            
            <div className="p-6 space-y-6">
              {/* Info do Cliente */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div>
                    <h3 className="text-sm font-semibold text-blue-900 mb-1">Cliente</h3>
                    <p className="text-sm text-blue-700">{leadToCreateOrcamento.nomeResponsavel}</p>
                    {leadToCreateOrcamento.tipoPessoa === 'PJ' && (
                      <p className="text-xs text-blue-600 mt-1">
                        Empresa: {typeof leadToCreateOrcamento.empresa === 'object' && leadToCreateOrcamento.empresa !== null ? leadToCreateOrcamento.empresa.nome : leadToCreateOrcamento.empresa || '-'}
                      </p>
                    )}
                    <p className="text-xs text-blue-600 mt-1">
                      {leadToCreateOrcamento.tipoPessoa === 'PF' ? 'CPF' : 'CNPJ'}: {leadToCreateOrcamento.cnpjCpf || '-'}
                    </p>
                  </div>
                  <div>
                    <h3 className="text-sm font-semibold text-blue-900 mb-1">Endereço</h3>
                    {leadToCreateOrcamento.endereco ? (
                      <>
                        <p className="text-sm text-blue-700">
                          {leadToCreateOrcamento.endereco}
                          {leadToCreateOrcamento.numero && `, ${leadToCreateOrcamento.numero}`}
                          {leadToCreateOrcamento.complemento && ` - ${leadToCreateOrcamento.complemento}`}
                        </p>
                        {leadToCreateOrcamento.bairro && (
                          <p className="text-xs text-blue-600">Bairro: {leadToCreateOrcamento.bairro}</p>
                        )}
                        {(leadToCreateOrcamento.cidade || leadToCreateOrcamento.estado) && (
                          <p className="text-xs text-blue-600">
                            {leadToCreateOrcamento.cidade}{leadToCreateOrcamento.estado && ` - ${leadToCreateOrcamento.estado}`}
                          </p>
                        )}
                        {leadToCreateOrcamento.cep && (
                          <p className="text-xs text-blue-600">CEP: {leadToCreateOrcamento.cep}</p>
                        )}
                      </>
                    ) : (
                      <p className="text-sm text-blue-700">Não informado</p>
                    )}
                    {leadToCreateOrcamento.email && (
                      <p className="text-xs text-blue-600 mt-1">Email: {leadToCreateOrcamento.email}</p>
                    )}
                    {leadToCreateOrcamento.telefone && (
                      <p className="text-xs text-blue-600 mt-1">Tel: {leadToCreateOrcamento.telefone}</p>
                    )}
                  </div>
                </div>
              </div>

              {/* Adicionar Item */}
              <div className="border border-gray-200 rounded-lg p-4">
                <h3 className="text-sm font-semibold text-gray-900 mb-3">Adicionar Itens ao Orçamento</h3>
                <div className="grid grid-cols-1 gap-3">
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">Produtos/Serviços</label>
                    <input
                      type="text"
                      value={produtoSearch}
                      onChange={(e) => setProdutoSearch(e.target.value)}
                      placeholder="Buscar por nome, código ou descrição"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-sm placeholder-gray-400 mb-2"
                    />
                    <div className="border border-gray-300 rounded-lg max-h-64 overflow-y-auto">
                      {produtos
                        .filter((produto) => {
                          const q = produtoSearch.trim().toLowerCase();
                          if (!q) return true;
                          const texto = `${produto.nome} ${produto.codigo || ''} ${produto.descricao || ''}`.toLowerCase();
                          return texto.includes(q);
                        })
                        .map((produto) => {
                          const checked = selectedProdutoIds.includes(produto.id);
                          return (
                            <label key={produto.id} className="flex items-center justify-between p-2 border-b last:border-b-0 hover:bg-gray-50">
                              <span className="flex items-center gap-3">
                                <input
                                  type="checkbox"
                                  checked={checked}
                                  onChange={() => {
                                    setSelectedProdutoIds((prev) =>
                                      prev.includes(produto.id)
                                        ? prev.filter((id) => id !== produto.id)
                                        : [...prev, produto.id]
                                    );
                                  }}
                                  className="w-4 h-4 text-blue-600 focus:ring-blue-500"
                                />
                                <span className="text-sm text-gray-900">{produto.nome}</span>
                              </span>
                              <span className="text-xs text-gray-600">
                                {produto.preco.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                              </span>
                            </label>
                          );
                        })}
                      {produtos.filter((p) => {
                        const q = produtoSearch.trim().toLowerCase();
                        if (!q) return true;
                        const texto = `${p.nome} ${p.codigo || ''} ${p.descricao || ''}`.toLowerCase();
                        return texto.includes(q);
                      }).length === 0 && (
                        <div className="p-3 text-xs text-gray-500">Nenhum produto/serviço encontrado</div>
                      )}
                    </div>
                    <div className="mt-3 flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => {
                          // Selecionar todos os produtos filtrados exibidos
                          const filtrados = produtos.filter((p) => {
                            const q = produtoSearch.trim().toLowerCase();
                            if (!q) return true;
                            const texto = `${p.nome} ${p.codigo || ''} ${p.descricao || ''}`.toLowerCase();
                            return texto.includes(q);
                          }).map(p => p.id);
                          setSelectedProdutoIds(filtrados);
                        }}
                        className="px-3 py-2 border border-gray-300 text-gray-700 rounded-lg text-sm hover:bg-gray-50"
                      >
                        Selecionar todos exibidos
                      </button>
                      <span className="text-xs text-gray-600">Selecionados: {selectedProdutoIds.length}</span>
                      <button
                        type="button"
                        onClick={() => {
                          if (selectedProdutoIds.length === 0) return;
                          const novosItens = [...orcamentoItens];
                          selectedProdutoIds.forEach((id) => {
                            const produto = produtos.find(p => p.id === id);
                            if (!produto) return;
                            const jaExiste = novosItens.some(it => it.produtoId === id);
                            if (jaExiste) return;
                            novosItens.push({
                              produtoId: produto.id,
                              codigo: produto.codigo || '',
                              nome: produto.nome,
                              descricao: produto.descricao || '',
                              quantidade: 1,
                              unidade: produto.unidade || 'un',
                              precoUnitario: produto.preco,
                              subtotal: produto.preco,
                            });
                          });
                          setOrcamentoItens(novosItens);
                          setSelectedProdutoIds([]);
                        }}
                        className="ml-auto px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition disabled:opacity-50"
                        disabled={selectedProdutoIds.length === 0}
                      >
                        Adicionar Selecionados
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Lista de Itens */}
              {orcamentoItens.length > 0 && (
                <div className="border border-gray-200 rounded-lg p-4">
                  <h3 className="text-sm font-semibold text-gray-900 mb-3">Itens do Orçamento</h3>
                  <div className="space-y-2">
                    {orcamentoItens.map((item, idx) => (
                      <div key={idx} className="bg-gray-50 p-3 rounded-lg">
                        <div className="flex items-start justify-between mb-2">
                          <div className="flex-1">
                            <p className="text-sm font-medium text-gray-900">{item.nome}</p>
                            {item.codigo && <p className="text-xs text-gray-500">Código: {item.codigo}</p>}
                            {item.descricao && <p className="text-xs text-gray-600 mt-1">{item.descricao}</p>}
                          </div>
                          <button
                            onClick={() => setOrcamentoItens(orcamentoItens.filter((_, i) => i !== idx))}
                            className="text-red-600 hover:text-red-800"
                          >
                            <HiTrash className="h-4 w-4" />
                          </button>
                        </div>
                        <div className="flex items-center gap-4">
                          <div className="flex items-center gap-2">
                            <label className="text-xs text-gray-600">Qtd:</label>
                            <input
                              type="number"
                              value={item.quantidade}
                              onChange={(e) => {
                                const newItens = [...orcamentoItens];
                                newItens[idx].quantidade = Number(e.target.value);
                                newItens[idx].subtotal = newItens[idx].quantidade * newItens[idx].precoUnitario;
                                setOrcamentoItens(newItens);
                              }}
                              min="1"
                              placeholder="Qtd"
                              className="w-20 px-2 py-1 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 placeholder-gray-400"
                            />
                          </div>
                          <div className="flex items-center gap-2">
                            <label className="text-xs text-gray-600">Preço Unit.:</label>
                            <input
                              type="number"
                              value={item.precoUnitario}
                              onChange={(e) => {
                                const newItens = [...orcamentoItens];
                                newItens[idx].precoUnitario = Number(e.target.value);
                                newItens[idx].subtotal = newItens[idx].quantidade * newItens[idx].precoUnitario;
                                setOrcamentoItens(newItens);
                              }}
                              min="0"
                              step="0.01"
                              placeholder="0,00"
                              className="w-28 px-2 py-1 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 placeholder-gray-400"
                            />
                          </div>
                          <div className="ml-auto">
                            <p className="text-sm font-semibold text-gray-900">
                              Subtotal: {item.subtotal.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Valores, Desconto e Total */}
                  <div className="mt-4 space-y-3 bg-white border border-gray-200 rounded-lg p-4">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-600">Subtotal</span>
                      <span className="font-medium text-gray-900">
                        {orcamentoItens.reduce((sum, item) => sum + item.subtotal, 0).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <label className="text-sm font-medium text-gray-700">Desconto (R$)</label>
                      <input
                        type="number"
                        value={orcamentoDesconto}
                        onChange={(e) => setOrcamentoDesconto(Number(e.target.value))}
                        min="0"
                        step="0.01"
                        placeholder="0,00"
                        className="w-32 px-3 py-1.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-sm placeholder-gray-400"
                      />
                    </div>
                    <div className="flex items-center justify-between border-t pt-3">
                      <p className="text-lg font-bold text-gray-900">Total</p>
                      <p className="text-lg font-bold text-blue-600">
                        {(orcamentoItens.reduce((sum, item) => sum + item.subtotal, 0) - orcamentoDesconto).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Observações e Condições de Pagamento */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Observações</label>
                  <textarea
                    value={orcamentoObservacoes}
                    onChange={(e) => setOrcamentoObservacoes(e.target.value)}
                    rows={3}
                    placeholder="Observações adicionais sobre o orçamento..."
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-sm placeholder-gray-400"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Condições de Pagamento</label>
                  <textarea
                    value={orcamentoCondicoesPagamento}
                    onChange={(e) => setOrcamentoCondicoesPagamento(e.target.value)}
                    rows={3}
                    placeholder="Ex: 30% entrada, saldo em 3x..."
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-sm placeholder-gray-400"
                  />
                </div>
              </div>
            </div>

            <div className="p-6 border-t border-gray-200 flex gap-3">
              <button
                onClick={() => {
                  setShowOrcamentoModal(false);
                  setLeadToCreateOrcamento(null);
                  setOrcamentoItens([]);
                  setOrcamentoDesconto(0);
                  setOrcamentoObservacoes('');
                  setOrcamentoCondicoesPagamento('');
                  setSelectedProdutoIds([]);
                }}
                className="flex-1 px-4 py-2.5 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition"
              >
                Cancelar
              </button>
              <button
                onClick={async () => {
                  if (orcamentoItens.length === 0) {
                    error('Adicione pelo menos um item ao orçamento');
                    return;
                  }

                  if (!leadToCreateOrcamento?.empresa) {
                    error('Lead não possui empresa associada');
                    return;
                  }

                  const empresaId = typeof leadToCreateOrcamento.empresa === 'object' 
                    ? leadToCreateOrcamento.empresa.id 
                    : null;

                  if (!empresaId) {
                    error('Empresa inválida');
                    return;
                  }

                  const valorTotal = orcamentoItens.reduce((sum, item) => sum + item.subtotal, 0) - orcamentoDesconto;
                  
                  const dataAtual = new Date().toISOString().split('T')[0];
                  const dataValidade = new Date();
                  dataValidade.setDate(dataValidade.getDate() + 30);
                  
                  const orcamentoData = {
                    empresa: { id: empresaId },
                    lead: { id: leadToCreateOrcamento.id },
                    status: 'RASCUNHO',
                    statusPagamento: 'PENDENTE',
                    dataEmissao: dataAtual,
                    dataValidade: dataValidade.toISOString().split('T')[0],
                    itens: orcamentoItens,
                    desconto: orcamentoDesconto,
                    valorTotal,
                    observacoes: orcamentoObservacoes || undefined,
                    condicoesPagamento: orcamentoCondicoesPagamento || undefined,
                  };

                  const result = await createOrcamento(orcamentoData);
                  
                  if (result) {
                    success('Orçamento criado com sucesso!');
                    await updateLead(leadToCreateOrcamento.id, { tagNegociacao: 'orcamento_criado' as any });
                    setShowOrcamentoModal(false);
                    setLeadToCreateOrcamento(null);
                    setOrcamentoItens([]);
                    setOrcamentoDesconto(0);
                    setOrcamentoObservacoes('');
                    setOrcamentoCondicoesPagamento('');
                    setSelectedProdutoIds([]);
                  } else {
                    error('Erro ao criar orçamento');
                  }
                }}
                className="flex-1 px-4 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
              >
                Salvar Orçamento
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Gerar Contrato */}
      {showContratoModal && leadToGenerateContrato && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-xl font-bold text-gray-900">Gerar Contrato</h2>
              <p className="text-sm text-gray-600 mt-1">Anexe ou gere o contrato para {leadToGenerateContrato.nomeResponsavel}</p>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Arquivo do Contrato</label>
                <input
                  type="file"
                  onChange={(e) => setContratoFile(e.target.files?.[0] || null)}
                  className="block w-full text-sm"
                />
                <p className="text-xs text-gray-500 mt-1">Formatos suportados: PDF, DOCX, etc.</p>
              </div>
            </div>
            <div className="p-6 border-t border-gray-200 flex gap-3">
              <button
                onClick={() => {
                  setShowContratoModal(false);
                  setLeadToGenerateContrato(null);
                  setContratoFile(null);
                }}
                className="flex-1 px-4 py-2.5 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition"
              >
                Cancelar
              </button>
              <button
                onClick={async () => {
                  if (!contratoFile) {
                    error('Selecione um arquivo de contrato');
                    return;
                  }
                  const empresaId = typeof leadToGenerateContrato.empresa === 'object' ? (leadToGenerateContrato.empresa as any).id : null;
                  if (!empresaId) {
                    error('Empresa inválida para upload');
                    return;
                  }
                  const ok = await uploadDocumento(contratoFile, TipoDocumento.CONTRATO, empresaId);
                  if (ok) {
                    success('Contrato enviado com sucesso!');
                    setShowContratoModal(false);
                    setLeadToGenerateContrato(null);
                    setContratoFile(null);
                  } else {
                    error('Falha ao enviar contrato');
                  }
                }}
                className="flex-1 px-4 py-2.5 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition"
              >
                Enviar Contrato
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal de Preenchimento de Dados do Cliente */}
      {showDadosModal && leadToFillData && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-xl font-bold text-gray-900">Preencher Dados do Cliente</h2>
              <p className="text-sm text-gray-600 mt-1">Complete as informações faltantes do cliente</p>
            </div>
            
            <div className="p-6 space-y-4">
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
                <h3 className="text-sm font-semibold text-blue-900 mb-2">Cliente: {leadToFillData.nomeResponsavel}</h3>
                {leadToFillData.tipoPessoa === 'PJ' && (
                  <p className="text-xs text-blue-700">
                    Empresa: {typeof leadToFillData.empresa === 'object' && leadToFillData.empresa !== null ? leadToFillData.empresa.nome : leadToFillData.empresa || '-'}
                  </p>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {leadToFillData.tipoPessoa === 'PF' ? 'CPF *' : 'CNPJ'}
                  </label>
                  <input
                    type="text"
                    value={cnpjCpf}
                    onChange={(e) => setCnpjCpf(e.target.value)}
                    className="block w-full px-4 py-2.5 border border-gray-200 rounded-lg text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-400"
                    placeholder={leadToFillData.tipoPessoa === 'PF' ? '000.000.000-00' : '00.000.000/0000-00'}
                    maxLength={leadToFillData.tipoPessoa === 'PF' ? 14 : 18}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">CEP</label>
                  <input
                    type="text"
                    value={cep}
                    onChange={(e) => {
                      const value = e.target.value.replace(/\D/g, '').slice(0, 8);
                      setCep(value);
                      if (value.length === 8) {
                        buscarCep(value);
                      }
                    }}
                    className="block w-full px-4 py-2.5 border border-gray-200 rounded-lg text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-400"
                    placeholder="00000-000"
                    maxLength={8}
                  />
                  {buscandoCep && <p className="text-xs text-blue-600 mt-1">Buscando CEP...</p>}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Endereço</label>
                  <input
                    type="text"
                    value={endereco}
                    onChange={(e) => setEndereco(e.target.value)}
                    className="block w-full px-4 py-2.5 border border-gray-200 rounded-lg text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-400"
                    placeholder="Rua, Avenida, etc"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Número</label>
                  <input
                    type="text"
                    value={numero}
                    onChange={(e) => setNumero(e.target.value)}
                    className="block w-full px-4 py-2.5 border border-gray-200 rounded-lg text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-400"
                    placeholder="Número"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Complemento</label>
                  <input
                    type="text"
                    value={complemento}
                    onChange={(e) => setComplemento(e.target.value)}
                    className="block w-full px-4 py-2.5 border border-gray-200 rounded-lg text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-400"
                    placeholder="Apto, Sala, etc"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Bairro</label>
                  <input
                    type="text"
                    value={bairro}
                    onChange={(e) => setBairro(e.target.value)}
                    className="block w-full px-4 py-2.5 border border-gray-200 rounded-lg text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-400"
                    placeholder="Bairro"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Cidade</label>
                  <input
                    type="text"
                    value={cidade}
                    onChange={(e) => setCidade(e.target.value)}
                    className="block w-full px-4 py-2.5 border border-gray-200 rounded-lg text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-400"
                    placeholder="Cidade"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Estado</label>
                  <select
                    value={estado}
                    onChange={(e) => setEstado(e.target.value)}
                    className="block w-full px-4 py-2.5 border border-gray-200 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-emerald-400"
                  >
                    <option value="">Selecione</option>
                    {estadosBrasil.map(uf => (
                      <option key={uf.sigla} value={uf.sigla}>{uf.nome} ({uf.sigla})</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Email *</label>
                  <input
                    id="email-dados"
                    type="email"
                    value={emailDados}
                    onChange={(e) => setEmailDados(e.target.value)}
                    className="block w-full px-4 py-2.5 border border-gray-200 rounded-lg text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-400"
                    placeholder="email@exemplo.com"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Telefone *</label>
                  <input
                    id="telefone-dados"
                    type="tel"
                    value={telefoneDados}
                    onChange={(e) => setTelefoneDados(e.target.value)}
                    className="block w-full px-4 py-2.5 border border-gray-200 rounded-lg text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-400"
                    placeholder="(00) 00000-0000"
                  />
                </div>
              </div>

              <div className="border-t pt-4 mt-4">
                <button
                  type="button"
                  onClick={() => {
                    // TODO: Implementar consulta Serasa
                    alert('Funcionalidade de consulta Serasa será implementada em breve!');
                  }}
                  className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-purple-600 text-white rounded-lg font-medium hover:bg-purple-700 transition"
                >
                  <HiSearch className="h-5 w-5" />
                  Consultar Serasa
                </button>
                <p className="text-xs text-gray-500 text-center mt-2">Realize a consulta de crédito do cliente</p>
              </div>
            </div>

            <div className="p-6 border-t border-gray-200 flex gap-3">
              <button
                onClick={() => {
                  setShowDadosModal(false);
                  setLeadToFillData(null);
                  setCep('');
                  setEndereco('');
                  setNumero('');
                  setComplemento('');
                  setBairro('');
                  setCidade('');
                  setEstado('');
                  setCnpjCpf('');
                  setEmailDados('');
                  setTelefoneDados('');
                }}
                className="flex-1 px-4 py-2.5 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition"
              >
                Cancelar
              </button>
              <button
                onClick={handleSaveDadosCliente}
                disabled={
                  (leadToFillData?.tipoPessoa === 'PF' && !cnpjCpf) ||
                  !emailDados ||
                  !telefoneDados
                }
                className="flex-1 px-4 py-2.5 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Salvar Dados
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal de Seleção de Vendedor */}
      {showVendedorModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-xl font-bold text-gray-900">Atribuir Vendedor</h2>
              <p className="text-sm text-gray-600 mt-1">Selecione um vendedor para acompanhar este lead na Negociação Inicial</p>
            </div>
            
            <div className="p-6">
              <label className="block text-sm font-medium text-gray-700 mb-3">Vendedor Responsável</label>
              <div className="space-y-2">
                <label className="flex items-center gap-3 p-3 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50 transition">
                  <input
                    type="radio"
                    name="vendedor"
                    checked={selectedVendedor === null}
                    onChange={() => setSelectedVendedor(null)}
                    className="w-4 h-4 text-emerald-600 focus:ring-emerald-500"
                  />
                  <span className="text-sm text-gray-700">Sem vendedor (atribuir depois)</span>
                </label>
                {vendedores.map((vend) => (
                  <label key={vend.id} className="flex items-center gap-3 p-3 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50 transition">
                    <input
                      type="radio"
                      name="vendedor"
                      checked={selectedVendedor === vend.id}
                      onChange={() => setSelectedVendedor(vend.id)}
                      className="w-4 h-4 text-emerald-600 focus:ring-emerald-500"
                    />
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-900">{vend.nome}</p>
                      <p className="text-xs text-gray-500">{vend.email}</p>
                    </div>
                  </label>
                ))}
              </div>
              {vendedores.length === 0 && (
                <p className="text-sm text-amber-600 mt-3">Nenhum vendedor cadastrado. Cadastre vendedores no menu.</p>
              )}
            </div>

            <div className="p-6 border-t border-gray-200 flex gap-3">
              <button
                onClick={() => {
                  setShowVendedorModal(false);
                  setLeadToAssignVendedor(null);
                  setSelectedVendedor(null);
                }}
                className="flex-1 px-4 py-2.5 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition"
              >
                Cancelar
              </button>
              <button
                onClick={confirmVendedorAndAdvance}
                className="flex-1 px-4 py-2.5 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition"
              >
                Confirmar e Avançar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Confirm Delete Modal */}
      <ConfirmModal
        isOpen={showConfirmModal}
        onClose={() => {
          setShowConfirmModal(false);
          setLeadToDelete(null);
        }}
        onConfirm={confirmDelete}
        title="Excluir Lead"
        message="Tem certeza que deseja excluir este lead? Esta ação não pode ser desfeita."
        confirmText="Excluir"
        cancelText="Cancelar"
        type="danger"
      />
    </div>
  );
}
