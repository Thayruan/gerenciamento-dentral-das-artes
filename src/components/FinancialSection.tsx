import React, { useState, useMemo } from 'react';
import { 
  DollarSign, 
  TrendingUp, 
  TrendingDown, 
  AlertTriangle, 
  CheckCircle, 
  Clock, 
  Calendar,
  Filter,
  Download,
  Search,
  Eye,
  MessageCircle,
  CreditCard,
  BarChart3,
  PieChart,
  Users,
  Target,
  X
} from 'lucide-react';
import { Student, Payment } from '../types';
import { formatCurrency } from '../utils/helpers';
import { PaymentModal } from './PaymentModal';
import { WhatsAppReminder } from './WhatsAppReminder';
import { FinancialCharts } from './FinancialCharts';

interface FinancialSectionProps {
  students: Student[];
  onRegisterPayment: (payment: Omit<Payment, 'id' | 'createdAt'>) => Promise<boolean>;
  onOpenWhatsApp: (student: Student) => void;
}

export const FinancialSection: React.FC<FinancialSectionProps> = ({ 
  students, 
  onRegisterPayment,
  onOpenWhatsApp
}) => {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [showWhatsAppModal, setShowWhatsAppModal] = useState(false);
  const [showHistoryModal, setShowHistoryModal] = useState(false);
  const [showStudentSelector, setShowStudentSelector] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('todos');
  const [periodFilter, setPeriodFilter] = useState('mes_atual');

  // Calcular métricas financeiras
  const financialMetrics = useMemo(() => {
    if (!Array.isArray(students) || students.length === 0) {
      return {
        receitaTotal: 0,
        receitaRecebida: 0,
        receitaPendente: 0,
        receitaVencida: 0,
        totalAlunos: 0,
        alunosEmDia: 0,
        alunosVencidos: 0,
        alunosPendentes: 0,
        taxaInadimplencia: 0,
        crescimentoMensal: 0,
        ticketMedio: 0,
        pagamentosHoje: 0,
        vencimentosProximos: 0
      };
    }

    const hoje = new Date();
    const hojeStr = hoje.toISOString().split('T')[0];
    const proximosSete = new Date(hoje.getTime() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

    let receitaTotal = 0;
    let receitaRecebida = 0;
    let receitaPendente = 0;
    let receitaVencida = 0;
    let alunosEmDia = 0;
    let alunosVencidos = 0;
    let alunosPendentes = 0;
    let pagamentosHoje = 0;
    let vencimentosProximos = 0;

    students.forEach(student => {
      if (student.status === 'ativo') {
        receitaTotal += student.mensalidade;

        // Verificar status de pagamento
        const ultimoPagamento = student.payments?.length > 0 
          ? student.payments[student.payments.length - 1] 
          : null;

        if (ultimoPagamento && ultimoPagamento.paymentDate >= student.nextPaymentDue) {
          receitaRecebida += student.mensalidade;
          alunosEmDia++;
        } else if (student.nextPaymentDue < hojeStr) {
          receitaVencida += student.mensalidade;
          alunosVencidos++;
        } else {
          receitaPendente += student.mensalidade;
          alunosPendentes++;
        }

        // Pagamentos de hoje
        if (ultimoPagamento && ultimoPagamento.paymentDate === hojeStr) {
          pagamentosHoje++;
        }

        // Vencimentos próximos (7 dias)
        if (student.nextPaymentDue >= hojeStr && student.nextPaymentDue <= proximosSete) {
          vencimentosProximos++;
        }
      }
    });

    const totalAlunos = students.filter(s => s.status === 'ativo').length;
    const taxaInadimplencia = receitaTotal > 0 ? (receitaVencida / receitaTotal) * 100 : 0;
    const ticketMedio = totalAlunos > 0 ? receitaTotal / totalAlunos : 0;

    return {
      receitaTotal,
      receitaRecebida,
      receitaPendente,
      receitaVencida,
      totalAlunos,
      alunosEmDia,
      alunosVencidos,
      alunosPendentes,
      taxaInadimplencia,
      crescimentoMensal: 0, // Implementar cálculo histórico
      ticketMedio,
      pagamentosHoje,
      vencimentosProximos
    };
  }, [students]);

  // Filtrar estudantes para tabela de pagamentos
  const filteredStudents = useMemo(() => {
    if (!Array.isArray(students)) return [];

    return students.filter(student => {
      // Filtro por busca
      if (searchQuery && !student.nome.toLowerCase().includes(searchQuery.toLowerCase())) {
        return false;
      }

      // Filtro por status
      if (statusFilter !== 'todos') {
        const hoje = new Date().toISOString().split('T')[0];
        const ultimoPagamento = student.payments?.length > 0 
          ? student.payments[student.payments.length - 1] 
          : null;

        const status = ultimoPagamento && ultimoPagamento.paymentDate >= student.nextPaymentDue
          ? 'em_dia'
          : student.nextPaymentDue < hoje
          ? 'vencido'
          : 'pendente';

        if (statusFilter !== status) return false;
      }

      return true;
    });
  }, [students, searchQuery, statusFilter]);

  const handleOpenPaymentModal = (student: Student) => {
    setSelectedStudent(student);
    setShowPaymentModal(true);
  };

  const handleClosePaymentModal = () => {
    setShowPaymentModal(false);
    setSelectedStudent(null);
  };

  const handleSavePayment = async (paymentData: Omit<Payment, 'id' | 'createdAt'>) => {
    const success = await onRegisterPayment(paymentData);
    if (success) {
      handleClosePaymentModal();
    }
    return success;
  };

  const handleOpenWhatsAppModal = (student: Student) => {
    setSelectedStudent(student);
    setShowWhatsAppModal(true);
  };

  const handleCloseWhatsAppModal = () => {
    setShowWhatsAppModal(false);
    setSelectedStudent(null);
  };

  const handleOpenHistoryModal = (student: Student) => {
    setSelectedStudent(student);
    setShowHistoryModal(true);
  };

  const handleCloseHistoryModal = () => {
    setShowHistoryModal(false);
    setSelectedStudent(null);
  };

  const handleExportData = () => {
    try {
      // Preparar dados para exportação
      const exportData = {
        alunos: students,
        relatorio: {
          dataExportacao: new Date().toISOString(),
          totalAlunos: students.length,
          alunosAtivos: students.filter(s => s.status === 'ativo').length,
          receitaTotal: financialMetrics.receitaTotal,
          receitaRecebida: financialMetrics.receitaRecebida,
          receitaVencida: financialMetrics.receitaVencida,
          taxaInadimplencia: financialMetrics.taxaInadimplencia
        }
      };

      // Criar arquivo para download
      const dataStr = JSON.stringify(exportData, null, 2);
      const dataBlob = new Blob([dataStr], { type: 'application/json' });
      const url = URL.createObjectURL(dataBlob);
      
      const link = document.createElement('a');
      link.href = url;
      link.download = `relatorio-financeiro-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Erro ao exportar dados:', error);
      alert('Erro ao exportar dados. Tente novamente.');
    }
  };

  const handleExportExcel = () => {
    try {
      // Preparar dados para CSV (Excel)
      const headers = [
        'ID',
        'Nome',
        'Email',
        'Telefone',
        'Status',
        'Mensalidade',
        'Vencimento Mensalidade',
        'Próximo Vencimento',
        'Último Pagamento',
        'Total Pago',
        'Dias em Atraso'
      ];

      const csvData = students.map(student => {
        const ultimoPagamento = student.payments?.length > 0 
          ? student.payments[student.payments.length - 1] 
          : null;
        const totalPago = student.payments?.reduce((sum, p) => sum + p.amount, 0) || 0;
        const diasAtraso = Math.max(0, Math.floor(
          (new Date().getTime() - new Date(student.nextPaymentDue).getTime()) / (1000 * 60 * 60 * 24)
        ));

        return [
          student.id,
          student.nome,
          student.email,
          student.telefone,
          student.status,
          student.mensalidade,
          new Date(student.vencimentoMensalidade).toLocaleDateString('pt-BR'),
          new Date(student.nextPaymentDue).toLocaleDateString('pt-BR'),
          ultimoPagamento ? new Date(ultimoPagamento.paymentDate).toLocaleDateString('pt-BR') : 'Nenhum',
          totalPago,
          diasAtraso
        ].join(',');
      });

      const csvContent = [headers.join(','), ...csvData].join('\n');
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      
      const link = document.createElement('a');
      link.href = url;
      link.download = `alunos-financeiro-${new Date().toISOString().split('T')[0]}.csv`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Erro ao exportar Excel:', error);
      alert('Erro ao exportar Excel. Tente novamente.');
    }
  };

  const handleNewPayment = () => {
    if (students.length === 0) {
      alert('Não há alunos cadastrados. Adicione alunos primeiro.');
      return;
    }
    setShowStudentSelector(true);
  };

  const handleSelectStudentForPayment = (student: Student) => {
    setSelectedStudent(student);
    setShowStudentSelector(false);
    setShowPaymentModal(true);
  };

  const getStatusBadge = (student: Student) => {
    const hoje = new Date().toISOString().split('T')[0];
    const ultimoPagamento = student.payments?.length > 0 
      ? student.payments[student.payments.length - 1] 
      : null;

    const status = ultimoPagamento && ultimoPagamento.paymentDate >= student.nextPaymentDue
      ? 'em_dia'
      : student.nextPaymentDue < hoje
      ? 'vencido'
      : 'pendente';

    const config = {
      em_dia: { label: 'Em dia', color: 'bg-green-100 text-green-800', icon: CheckCircle },
      vencido: { label: 'Vencido', color: 'bg-red-100 text-red-800', icon: AlertTriangle },
      pendente: { label: 'Pendente', color: 'bg-yellow-100 text-yellow-800', icon: Clock }
    };

    const { label, color, icon: Icon } = config[status];

    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${color}`}>
        <Icon className="h-3 w-3 mr-1" />
        {label}
      </span>
    );
  };

  const tabs = [
    { id: 'dashboard', label: 'Dashboard', icon: BarChart3 },
    { id: 'pagamentos', label: 'Pagamentos', icon: CreditCard },
    { id: 'cobranca', label: 'Cobrança', icon: MessageCircle },
    { id: 'relatorios', label: 'Relatórios', icon: PieChart }
  ];

  return (
    <div className="space-y-6">
      {/* Header com Tabs */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Financeiro</h1>
            <p className="text-gray-600 mt-1">Gestão completa de pagamentos e receitas</p>
          </div>
          <div className="flex items-center gap-3">
            <div className="relative group">
              <button className="btn btn-outline">
                <Download className="h-4 w-4 mr-2" />
                Exportar
              </button>
              <div className="absolute top-full left-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
                <div className="py-2">
                  <button
                    onClick={handleExportData}
                    className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-100 flex items-center"
                  >
                    <Download className="h-4 w-4 mr-2" />
                    Exportar JSON
                  </button>
                  <button
                    onClick={handleExportExcel}
                    className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-100 flex items-center"
                  >
                    <Download className="h-4 w-4 mr-2" />
                    Exportar Excel (CSV)
                  </button>
                </div>
              </div>
            </div>
            <button 
              onClick={handleNewPayment}
              className="btn btn-primary"
            >
              <DollarSign className="h-4 w-4 mr-2" />
              Novo Pagamento
            </button>
          </div>
        </div>

        <div className="flex space-x-1 bg-gray-100 p-1 rounded-xl">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                  activeTab === tab.id
                    ? 'bg-white text-blue-600 shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                <Icon className="h-4 w-4 mr-2" />
                {tab.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Dashboard Tab */}
      {activeTab === 'dashboard' && (
        <div className="space-y-6">
          {/* KPIs Principais */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
              <div className="flex items-center">
                <div className="p-2 bg-green-100 rounded-lg">
                  <DollarSign className="h-6 w-6 text-green-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Receita Total</p>
                  <p className="text-2xl font-bold text-gray-900">{formatCurrency(financialMetrics.receitaTotal)}</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
              <div className="flex items-center">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <CheckCircle className="h-6 w-6 text-blue-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Recebido</p>
                  <p className="text-2xl font-bold text-gray-900">{formatCurrency(financialMetrics.receitaRecebida)}</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
              <div className="flex items-center">
                <div className="p-2 bg-red-100 rounded-lg">
                  <AlertTriangle className="h-6 w-6 text-red-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Vencido</p>
                  <p className="text-2xl font-bold text-gray-900">{formatCurrency(financialMetrics.receitaVencida)}</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
              <div className="flex items-center">
                <div className="p-2 bg-yellow-100 rounded-lg">
                  <Clock className="h-6 w-6 text-yellow-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Pendente</p>
                  <p className="text-2xl font-bold text-gray-900">{formatCurrency(financialMetrics.receitaPendente)}</p>
                </div>
              </div>
            </div>
          </div>

          {/* KPIs Secundários */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Taxa de Inadimplência</p>
                  <p className="text-2xl font-bold text-red-600">{financialMetrics.taxaInadimplencia.toFixed(1)}%</p>
                </div>
                <TrendingDown className="h-8 w-8 text-red-400" />
              </div>
            </div>

            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Ticket Médio</p>
                  <p className="text-2xl font-bold text-blue-600">{formatCurrency(financialMetrics.ticketMedio)}</p>
                </div>
                <Target className="h-8 w-8 text-blue-400" />
              </div>
            </div>

            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Pagamentos Hoje</p>
                  <p className="text-2xl font-bold text-green-600">{financialMetrics.pagamentosHoje}</p>
                </div>
                <Calendar className="h-8 w-8 text-green-400" />
              </div>
            </div>

            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Vencem em 7 dias</p>
                  <p className="text-2xl font-bold text-yellow-600">{financialMetrics.vencimentosProximos}</p>
                </div>
                <AlertTriangle className="h-8 w-8 text-yellow-400" />
              </div>
            </div>
          </div>

          {/* Resumo por Status */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-6">Situação dos Alunos</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <CheckCircle className="h-8 w-8 text-green-600" />
                </div>
                <p className="text-2xl font-bold text-green-600">{financialMetrics.alunosEmDia}</p>
                <p className="text-sm text-gray-600">Alunos em dia</p>
              </div>
              
              <div className="text-center">
                <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Clock className="h-8 w-8 text-yellow-600" />
                </div>
                <p className="text-2xl font-bold text-yellow-600">{financialMetrics.alunosPendentes}</p>
                <p className="text-sm text-gray-600">Alunos pendentes</p>
              </div>
              
              <div className="text-center">
                <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <AlertTriangle className="h-8 w-8 text-red-600" />
                </div>
                <p className="text-2xl font-bold text-red-600">{financialMetrics.alunosVencidos}</p>
                <p className="text-sm text-gray-600">Alunos vencidos</p>
              </div>
            </div>
          </div>

          {/* Gráficos Financeiros */}
          <FinancialCharts
            receitaData={[
              { label: 'Receita Total', value: financialMetrics.receitaTotal, color: '#3b82f6' },
              { label: 'Recebido', value: financialMetrics.receitaRecebida, color: '#10b981' },
              { label: 'Vencido', value: financialMetrics.receitaVencida, color: '#ef4444' },
              { label: 'Pendente', value: financialMetrics.receitaPendente, color: '#f59e0b' }
            ]}
            statusData={[
              { label: 'Em dia', value: financialMetrics.alunosEmDia, color: '#10b981' },
              { label: 'Pendentes', value: financialMetrics.alunosPendentes, color: '#f59e0b' },
              { label: 'Vencidos', value: financialMetrics.alunosVencidos, color: '#ef4444' }
            ]}
            monthlyData={[
              { month: 'Jan', value: financialMetrics.receitaTotal * 0.8 },
              { month: 'Fev', value: financialMetrics.receitaTotal * 0.9 },
              { month: 'Mar', value: financialMetrics.receitaTotal * 0.95 },
              { month: 'Abr', value: financialMetrics.receitaTotal },
              { month: 'Mai', value: financialMetrics.receitaTotal * 1.1 },
              { month: 'Jun', value: financialMetrics.receitaTotal * 1.15 }
            ]}
          />
        </div>
      )}

      {/* Pagamentos Tab */}
      {activeTab === 'pagamentos' && (
        <div className="space-y-6">
          {/* Resumo Rápido */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-white rounded-xl p-4 border border-gray-200">
              <div className="text-sm text-gray-600">Total de Alunos</div>
              <div className="text-2xl font-bold text-gray-900">{filteredStudents.length}</div>
            </div>
            <div className="bg-white rounded-xl p-4 border border-gray-200">
              <div className="text-sm text-gray-600">Em Dia</div>
              <div className="text-2xl font-bold text-green-600">
                {filteredStudents.filter(s => {
                  const hoje = new Date().toISOString().split('T')[0];
                  const ultimoPagamento = s.payments?.length > 0 ? s.payments[s.payments.length - 1] : null;
                  return ultimoPagamento && ultimoPagamento.paymentDate >= s.nextPaymentDue;
                }).length}
              </div>
            </div>
            <div className="bg-white rounded-xl p-4 border border-gray-200">
              <div className="text-sm text-gray-600">Pendentes</div>
              <div className="text-2xl font-bold text-yellow-600">
                {filteredStudents.filter(s => {
                  const hoje = new Date().toISOString().split('T')[0];
                  const ultimoPagamento = s.payments?.length > 0 ? s.payments[s.payments.length - 1] : null;
                  return !ultimoPagamento || ultimoPagamento.paymentDate < s.nextPaymentDue;
                }).length}
              </div>
            </div>
            <div className="bg-white rounded-xl p-4 border border-gray-200">
              <div className="text-sm text-gray-600">Vencidos</div>
              <div className="text-2xl font-bold text-red-600">
                {filteredStudents.filter(s => {
                  const hoje = new Date().toISOString().split('T')[0];
                  return s.nextPaymentDue < hoje;
                }).length}
              </div>
            </div>
          </div>

          {/* Ações Rápidas */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Ações Rápidas</h3>
            <div className="flex flex-wrap gap-3">
              <button
                onClick={() => {
                  const alunosVencidos = filteredStudents.filter(s => {
                    const hoje = new Date().toISOString().split('T')[0];
                    return s.nextPaymentDue < hoje;
                  });
                  if (alunosVencidos.length > 0) {
                    alunosVencidos.forEach(student => {
                      setTimeout(() => handleOpenWhatsAppModal(student), 100);
                    });
                  }
                }}
                className="btn btn-outline text-red-600 hover:text-red-700 border-red-300 hover:border-red-400"
                disabled={filteredStudents.filter(s => {
                  const hoje = new Date().toISOString().split('T')[0];
                  return s.nextPaymentDue < hoje;
                }).length === 0}
              >
                <MessageCircle className="h-4 w-4 mr-2" />
                Lembrar Todos Vencidos
              </button>
              
              <button
                onClick={() => {
                  const alunosPendentes = filteredStudents.filter(s => {
                    const hoje = new Date().toISOString().split('T')[0];
                    const ultimoPagamento = s.payments?.length > 0 ? s.payments[s.payments.length - 1] : null;
                    return (!ultimoPagamento || ultimoPagamento.paymentDate < s.nextPaymentDue) && s.nextPaymentDue >= hoje;
                  });
                  if (alunosPendentes.length > 0) {
                    alunosPendentes.forEach(student => {
                      setTimeout(() => handleOpenWhatsAppModal(student), 100);
                    });
                  }
                }}
                className="btn btn-outline text-yellow-600 hover:text-yellow-700 border-yellow-300 hover:border-yellow-400"
                disabled={filteredStudents.filter(s => {
                  const hoje = new Date().toISOString().split('T')[0];
                  const ultimoPagamento = s.payments?.length > 0 ? s.payments[s.payments.length - 1] : null;
                  return (!ultimoPagamento || ultimoPagamento.paymentDate < s.nextPaymentDue) && s.nextPaymentDue >= hoje;
                }).length === 0}
              >
                <MessageCircle className="h-4 w-4 mr-2" />
                Lembrar Pendentes
              </button>
              
              <button
                className="btn btn-primary"
                onClick={() => {
                  // Aqui você pode implementar um modal para pagamento em massa
                  console.log('Pagamento em massa para:', filteredStudents.length, 'alunos');
                }}
              >
                <CreditCard className="h-4 w-4 mr-2" />
                Pagamento em Massa
              </button>
            </div>
          </div>

          {/* Filtros */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
            <div className="flex flex-col lg:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <input
                    type="text"
                    placeholder="Buscar aluno por nome, email ou cidade..."
                    className="input pl-10"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
              </div>
              <div className="flex gap-4">
                <select
                  className="input min-w-[150px]"
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                >
                  <option value="todos">Todos os status</option>
                  <option value="em_dia">Em dia</option>
                  <option value="pendente">Pendente</option>
                  <option value="vencido">Vencido</option>
                </select>
                <select
                  className="input min-w-[150px]"
                  value={periodFilter}
                  onChange={(e) => setPeriodFilter(e.target.value)}
                >
                  <option value="mes_atual">Mês atual</option>
                  <option value="mes_anterior">Mês anterior</option>
                  <option value="ultimos_3_meses">Últimos 3 meses</option>
                  <option value="todos">Todos os períodos</option>
                </select>
                <button
                  onClick={() => {
                    setSearchQuery('');
                    setStatusFilter('todos');
                    setPeriodFilter('mes_atual');
                  }}
                  className="btn btn-outline btn-sm"
                >
                  Limpar Filtros
                </button>
              </div>
            </div>
          </div>

          {/* Tabela de Pagamentos */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-900">Controle de Pagamentos</h3>
                <div className="flex items-center gap-2">
                  <span className="text-sm text-gray-600">
                    Mostrando {filteredStudents.length} de {students.length} alunos
                  </span>
                  <button
                    onClick={() => {
                      const alunosVencidos = filteredStudents.filter(s => {
                        const hoje = new Date().toISOString().split('T')[0];
                        return s.nextPaymentDue < hoje;
                      });
                      if (alunosVencidos.length > 0) {
                        alunosVencidos.forEach(student => {
                          setTimeout(() => handleOpenWhatsAppModal(student), 100);
                        });
                      }
                    }}
                    className="btn btn-outline btn-sm text-red-600 hover:text-red-700"
                    disabled={filteredStudents.filter(s => {
                      const hoje = new Date().toISOString().split('T')[0];
                      return s.nextPaymentDue < hoje;
                    }).length === 0}
                  >
                    <MessageCircle className="h-4 w-4 mr-1" />
                    Lembrar Vencidos
                  </button>
                </div>
              </div>
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Aluno
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Mensalidade
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Vencimento
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Último Pagamento
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Histórico
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Ações
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredStudents.map((student) => {
                    const ultimoPagamento = student.payments?.length > 0 
                      ? student.payments[student.payments.length - 1] 
                      : null;
                    const totalPagamentos = student.payments?.length || 0;
                    const diasAtraso = Math.max(0, Math.floor(
                      (new Date().getTime() - new Date(student.nextPaymentDue).getTime()) / (1000 * 60 * 60 * 24)
                    ));

                    return (
                      <tr key={student.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                              <span className="text-sm font-medium text-blue-600">
                                {student.nome.split(' ').map(n => n[0]).join('').slice(0, 2)}
                              </span>
                            </div>
                            <div className="ml-4">
                              <div className="text-sm font-medium text-gray-900">{student.nome}</div>
                              <div className="text-sm text-gray-500">{student.email}</div>
                              <div className="text-xs text-gray-400">{student.telefone}</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">
                            {formatCurrency(student.mensalidade)}
                          </div>
                          <div className="text-xs text-gray-500">
                            Vencimento: {new Date(student.vencimentoMensalidade).toLocaleDateString('pt-BR')}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">
                            {new Date(student.nextPaymentDue).toLocaleDateString('pt-BR')}
                          </div>
                          {diasAtraso > 0 && (
                            <div className="text-xs text-red-500">
                              {diasAtraso} dia{diasAtraso > 1 ? 's' : ''} em atraso
                            </div>
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {getStatusBadge(student)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {ultimoPagamento ? (
                            <div>
                              <div className="text-sm text-gray-900">
                                {new Date(ultimoPagamento.paymentDate).toLocaleDateString('pt-BR')}
                              </div>
                              <div className="text-sm text-gray-500">
                                {formatCurrency(ultimoPagamento.amount)} - {ultimoPagamento.paymentMethod}
                              </div>
                              {ultimoPagamento.observation && (
                                <div className="text-xs text-gray-400 truncate max-w-[150px]" title={ultimoPagamento.observation}>
                                  {ultimoPagamento.observation}
                                </div>
                              )}
                            </div>
                          ) : (
                            <span className="text-sm text-gray-500">Nenhum pagamento</span>
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">
                            {totalPagamentos} pagamento{totalPagamentos !== 1 ? 's' : ''}
                          </div>
                          <div className="text-xs text-gray-500">
                            Total: {formatCurrency(student.payments?.reduce((sum, p) => sum + p.amount, 0) || 0)}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <div className="flex items-center justify-end gap-2">
                            <button
                              onClick={() => handleOpenPaymentModal(student)}
                              className="btn btn-ghost btn-sm text-green-600 hover:text-green-700"
                              title="Registrar pagamento"
                            >
                              <CreditCard className="h-4 w-4" />
                            </button>
                            <button
                              onClick={() => handleOpenWhatsAppModal(student)}
                              className="btn btn-ghost btn-sm text-green-500 hover:text-green-700"
                              title="Enviar lembrete"
                            >
                              <MessageCircle className="h-4 w-4" />
                            </button>
                            <button
                              className="btn btn-ghost btn-sm text-blue-600 hover:text-blue-700"
                              title="Ver histórico completo"
                              onClick={() => handleOpenHistoryModal(student)}
                            >
                              <Eye className="h-4 w-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
            
            {filteredStudents.length === 0 && (
              <div className="px-6 py-12 text-center">
                <div className="text-lg font-medium text-gray-900 mb-2">Nenhum aluno encontrado</div>
                <div className="text-sm text-gray-600">
                  {searchQuery || statusFilter !== 'todos' 
                    ? 'Tente ajustar os filtros de busca' 
                    : 'Comece adicionando seu primeiro aluno'
                  }
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Cobrança Tab */}
      {activeTab === 'cobranca' && (
        <div className="space-y-6">
          {/* Ações Rápidas de Cobrança */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-6">Ações Rápidas de Cobrança</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <button className="p-4 border-2 border-dashed border-yellow-300 rounded-xl hover:border-yellow-400 hover:bg-yellow-50 transition-all">
                <div className="text-center">
                  <Clock className="h-8 w-8 text-yellow-600 mx-auto mb-2" />
                  <div className="text-sm font-medium text-gray-900">Lembrete Vencimento</div>
                  <div className="text-xs text-gray-600 mt-1">{financialMetrics.vencimentosProximos} alunos</div>
                </div>
              </button>

              <button 
                onClick={() => {
                  const alunosVencidos = filteredStudents.filter(student => {
                    const hoje = new Date().toISOString().split('T')[0];
                    return student.nextPaymentDue < hoje;
                  });
                  
                  if (alunosVencidos.length > 0) {
                    // Enviar lembretes para todos os vencidos
                    alunosVencidos.forEach(student => {
                      setTimeout(() => handleOpenWhatsAppModal(student), 100);
                    });
                  }
                }}
                className="p-4 border-2 border-dashed border-red-300 rounded-xl hover:border-red-400 hover:bg-red-50 transition-all"
              >
                <div className="text-center">
                  <AlertTriangle className="h-8 w-8 text-red-600 mx-auto mb-2" />
                  <div className="text-sm font-medium text-gray-900">Cobrança Vencidos</div>
                  <div className="text-xs text-gray-600 mt-1">{financialMetrics.alunosVencidos} alunos</div>
                </div>
              </button>

              <button className="p-4 border-2 border-dashed border-green-300 rounded-xl hover:border-green-400 hover:bg-green-50 transition-all">
                <div className="text-center">
                  <MessageCircle className="h-8 w-8 text-green-600 mx-auto mb-2" />
                  <div className="text-sm font-medium text-gray-900">WhatsApp em Massa</div>
                  <div className="text-xs text-gray-600 mt-1">Enviar para todos</div>
                </div>
              </button>

              <button className="p-4 border-2 border-dashed border-blue-300 rounded-xl hover:border-blue-400 hover:bg-blue-50 transition-all">
                <div className="text-center">
                  <Download className="h-8 w-8 text-blue-600 mx-auto mb-2" />
                  <div className="text-sm font-medium text-gray-900">Relatório Cobrança</div>
                  <div className="text-xs text-gray-600 mt-1">Exportar dados</div>
                </div>
              </button>
            </div>
          </div>

          {/* Lista de Alunos para Cobrança */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200">
            <div className="px-6 py-4 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-900">Alunos Pendentes de Cobrança</h3>
                <div className="flex items-center gap-2">
                  <span className="text-sm text-gray-600">
                    {filteredStudents.filter(s => {
                      const hoje = new Date().toISOString().split('T')[0];
                      return s.nextPaymentDue <= hoje;
                    }).length} alunos
                  </span>
                </div>
              </div>
            </div>

            <div className="divide-y divide-gray-200">
              {filteredStudents
                .filter(student => {
                  const hoje = new Date().toISOString().split('T')[0];
                  return student.nextPaymentDue <= hoje;
                })
                .map((student) => {
                  const diasVencido = Math.floor(
                    (new Date().getTime() - new Date(student.nextPaymentDue).getTime()) / (1000 * 60 * 60 * 24)
                  );

                  return (
                    <div key={student.id} className="px-6 py-4 hover:bg-gray-50">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4">
                          <div className="h-12 w-12 rounded-full bg-red-100 flex items-center justify-center">
                            <span className="text-sm font-medium text-red-600">
                              {student.nome.split(' ').map(n => n[0]).join('').slice(0, 2)}
                            </span>
                          </div>
                          
                          <div>
                            <div className="text-sm font-medium text-gray-900">{student.nome}</div>
                            <div className="text-sm text-gray-500">{student.telefone}</div>
                          </div>

                          <div className="text-center">
                            <div className="text-sm font-medium text-red-600">
                              {formatCurrency(student.mensalidade)}
                            </div>
                            <div className="text-xs text-red-500">
                              {diasVencido > 0 ? `${diasVencido} dias vencido` : 'Vence hoje'}
                            </div>
                          </div>

                          <div className="text-center">
                            <div className="text-sm text-gray-900">
                              Vencimento: {new Date(student.nextPaymentDue).toLocaleDateString('pt-BR')}
                            </div>
                            <div className="text-xs text-gray-500">
                              Último pagamento: {
                                student.payments?.length > 0 
                                  ? new Date(student.payments[student.payments.length - 1].paymentDate).toLocaleDateString('pt-BR')
                                  : 'Nenhum'
                              }
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleOpenWhatsAppModal(student)}
                            className="btn btn-ghost btn-sm text-green-600 hover:text-green-700"
                            title="Enviar lembrete"
                          >
                            <MessageCircle className="h-4 w-4" />
                          </button>
                          
                          <button
                            onClick={() => handleOpenPaymentModal(student)}
                            className="btn btn-ghost btn-sm text-blue-600 hover:text-blue-700"
                            title="Registrar pagamento"
                          >
                            <CreditCard className="h-4 w-4" />
                          </button>

                          <div className={`px-3 py-1 rounded-full text-xs font-medium ${
                            diasVencido > 30 ? 'bg-red-100 text-red-800' :
                            diasVencido > 15 ? 'bg-orange-100 text-orange-800' :
                            diasVencido > 7 ? 'bg-yellow-100 text-yellow-800' :
                            'bg-red-100 text-red-800'
                          }`}>
                            {diasVencido > 30 ? 'Crítico' :
                             diasVencido > 15 ? 'Urgente' :
                             diasVencido > 7 ? 'Atenção' :
                             'Novo'}
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
            </div>

            {filteredStudents.filter(s => {
              const hoje = new Date().toISOString().split('T')[0];
              return s.nextPaymentDue <= hoje;
            }).length === 0 && (
              <div className="px-6 py-12 text-center">
                <CheckCircle className="h-12 w-12 text-green-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">Parabéns!</h3>
                <p className="text-gray-600">Não há alunos com pagamentos vencidos no momento.</p>
              </div>
            )}
          </div>

          {/* Configurações de Cobrança */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-6">Configurações de Cobrança</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Lembrete antes do vencimento
                </label>
                <select className="input">
                  <option value="3">3 dias antes</option>
                  <option value="5">5 dias antes</option>
                  <option value="7">7 dias antes</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Frequência de cobrança após vencimento
                </label>
                <select className="input">
                  <option value="daily">Diária</option>
                  <option value="weekly">Semanal</option>
                  <option value="biweekly">Quinzenal</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Desconto para pagamento antecipado
                </label>
                <input type="number" className="input" placeholder="5%" />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Juros por atraso (% ao mês)
                </label>
                <input type="number" className="input" placeholder="2%" />
              </div>
            </div>

            <div className="mt-6 flex justify-end">
              <button className="btn btn-primary">
                Salvar Configurações
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Relatórios Tab */}
      {activeTab === 'relatorios' && (
        <div className="space-y-6">
          {/* Filtros de Relatório */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-6">Filtros de Relatório</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Período</label>
                <select className="input">
                  <option value="mes_atual">Mês atual</option>
                  <option value="mes_anterior">Mês anterior</option>
                  <option value="trimestre">Último trimestre</option>
                  <option value="semestre">Último semestre</option>
                  <option value="ano">Último ano</option>
                  <option value="personalizado">Personalizado</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Tipo de Relatório</label>
                <select className="input">
                  <option value="completo">Completo</option>
                  <option value="receitas">Apenas Receitas</option>
                  <option value="inadimplencia">Inadimplência</option>
                  <option value="comparativo">Comparativo</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
                <select className="input">
                  <option value="todos">Todos</option>
                  <option value="ativos">Apenas ativos</option>
                  <option value="inativos">Apenas inativos</option>
                </select>
              </div>

              <div className="flex items-end">
                <button className="btn btn-primary w-full">
                  <BarChart3 className="h-4 w-4 mr-2" />
                  Gerar Relatório
                </button>
              </div>
            </div>
          </div>

          {/* Resumo Executivo */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-6">Resumo Executivo</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-blue-700">Faturamento Total</p>
                    <p className="text-2xl font-bold text-blue-900">{formatCurrency(financialMetrics.receitaTotal)}</p>
                    <p className="text-xs text-blue-600 mt-1">+12.5% vs mês anterior</p>
                  </div>
                  <DollarSign className="h-8 w-8 text-blue-400" />
                </div>
              </div>

              <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-xl p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-green-700">Taxa de Recebimento</p>
                    <p className="text-2xl font-bold text-green-900">
                      {((financialMetrics.receitaRecebida / financialMetrics.receitaTotal) * 100 || 0).toFixed(1)}%
                    </p>
                    <p className="text-xs text-green-600 mt-1">+3.2% vs mês anterior</p>
                  </div>
                  <TrendingUp className="h-8 w-8 text-green-400" />
                </div>
              </div>

              <div className="bg-gradient-to-br from-red-50 to-red-100 rounded-xl p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-red-700">Inadimplência</p>
                    <p className="text-2xl font-bold text-red-900">{financialMetrics.taxaInadimplencia.toFixed(1)}%</p>
                    <p className="text-xs text-red-600 mt-1">-1.8% vs mês anterior</p>
                  </div>
                  <TrendingDown className="h-8 w-8 text-red-400" />
                </div>
              </div>

              <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-purple-700">Ticket Médio</p>
                    <p className="text-2xl font-bold text-purple-900">{formatCurrency(financialMetrics.ticketMedio)}</p>
                    <p className="text-xs text-purple-600 mt-1">+8.1% vs mês anterior</p>
                  </div>
                  <Target className="h-8 w-8 text-purple-400" />
                </div>
              </div>
            </div>
          </div>

          {/* Análise Detalhada */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Receitas por Método de Pagamento */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-6">Receitas por Método de Pagamento</h3>
              
              <div className="space-y-4">
                {[
                  { method: 'PIX', amount: financialMetrics.receitaRecebida * 0.6, percentage: 60, color: 'bg-green-500' },
                  { method: 'Dinheiro', amount: financialMetrics.receitaRecebida * 0.25, percentage: 25, color: 'bg-blue-500' },
                  { method: 'Cartão', amount: financialMetrics.receitaRecebida * 0.12, percentage: 12, color: 'bg-purple-500' },
                  { method: 'Transferência', amount: financialMetrics.receitaRecebida * 0.03, percentage: 3, color: 'bg-yellow-500' }
                ].map((item, index) => (
                  <div key={index} className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium text-gray-700">{item.method}</span>
                      <span className="text-sm font-semibold text-gray-900">{formatCurrency(item.amount)}</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className={`h-2 rounded-full ${item.color} transition-all duration-1000`}
                        style={{ width: `${item.percentage}%` }}
                      />
                    </div>
                    <div className="text-xs text-gray-500">{item.percentage}% do total</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Evolução de Inadimplência */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-6">Evolução da Inadimplência</h3>
              
              <div className="space-y-4">
                {[
                  { period: 'Janeiro', rate: 8.5, trend: 'up' },
                  { period: 'Fevereiro', rate: 7.2, trend: 'down' },
                  { period: 'Março', rate: 6.8, trend: 'down' },
                  { period: 'Abril', rate: 5.4, trend: 'down' },
                  { period: 'Maio', rate: 4.9, trend: 'down' },
                  { period: 'Junho', rate: 4.2, trend: 'down' }
                ].map((item, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <span className="text-sm font-medium text-gray-700">{item.period}</span>
                      {item.trend === 'down' ? (
                        <TrendingDown className="h-4 w-4 text-green-500" />
                      ) : (
                        <TrendingUp className="h-4 w-4 text-red-500" />
                      )}
                    </div>
                    <span className={`text-sm font-semibold ${
                      item.rate > 7 ? 'text-red-600' : 
                      item.rate > 5 ? 'text-yellow-600' : 'text-green-600'
                    }`}>
                      {item.rate}%
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Relatório de Alunos */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200">
            <div className="px-6 py-4 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-900">Relatório Detalhado de Alunos</h3>
                <button className="btn btn-outline btn-sm">
                  <Download className="h-4 w-4 mr-2" />
                  Exportar Excel
                </button>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Aluno</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Mensalidade</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Último Pagamento</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Total Pago</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Dias em Atraso</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredStudents.slice(0, 10).map((student) => {
                    const ultimoPagamento = student.payments?.length > 0 
                      ? student.payments[student.payments.length - 1] 
                      : null;
                    const totalPago = student.payments?.reduce((sum, p) => sum + p.amount, 0) || 0;
                    const diasAtraso = Math.max(0, Math.floor(
                      (new Date().getTime() - new Date(student.nextPaymentDue).getTime()) / (1000 * 60 * 60 * 24)
                    ));

                    return (
                      <tr key={student.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">{student.nome}</div>
                          <div className="text-sm text-gray-500">{student.email}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">{formatCurrency(student.mensalidade)}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {getStatusBadge(student)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {ultimoPagamento ? (
                            <div>
                              <div className="text-sm text-gray-900">
                                {new Date(ultimoPagamento.paymentDate).toLocaleDateString('pt-BR')}
                              </div>
                              <div className="text-sm text-gray-500">{ultimoPagamento.paymentMethod}</div>
                            </div>
                          ) : (
                            <span className="text-sm text-gray-500">Nenhum</span>
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">{formatCurrency(totalPago)}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`text-sm font-medium ${
                            diasAtraso > 0 ? 'text-red-600' : 'text-green-600'
                          }`}>
                            {diasAtraso > 0 ? `${diasAtraso} dias` : 'Em dia'}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* Ações de Relatório */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-6">Exportar Relatórios</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <button 
                onClick={handleExportData}
                className="btn btn-outline flex items-center justify-center"
              >
                <Download className="h-4 w-4 mr-2" />
                Relatório JSON
              </button>
              
              <button 
                onClick={handleExportExcel}
                className="btn btn-outline flex items-center justify-center"
              >
                <Download className="h-4 w-4 mr-2" />
                Planilha Excel
              </button>
              
              <button 
                onClick={() => {
                  // Aqui você pode implementar exportação para PDF
                  alert('Funcionalidade de exportação para PDF será implementada em breve.');
                }}
                className="btn btn-outline flex items-center justify-center"
              >
                <Download className="h-4 w-4 mr-2" />
                Relatório PDF
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modals */}
      {/* Modal de Seleção de Aluno para Pagamento */}
      {showStudentSelector && (
        <div className="modal-overlay">
          <div className="absolute inset-0 bg-black/50" onClick={() => setShowStudentSelector(false)}></div>
          <div className="modal-content max-w-2xl">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-semibold fade-in-up">Selecionar Aluno para Pagamento</h2>
                <button className="btn btn-ghost icon-hover" onClick={() => setShowStudentSelector(false)}>
                  <X className="h-5 w-5" />
                </button>
              </div>

              <div className="mb-4">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <input
                    type="text"
                    placeholder="Buscar aluno por nome..."
                    className="input pl-10 w-full"
                    onChange={(e) => {
                      const query = e.target.value.toLowerCase();
                      const filtered = students.filter(s => 
                        s.nome.toLowerCase().includes(query) || 
                        s.email.toLowerCase().includes(query)
                      );
                      // Aqui você pode implementar filtro em tempo real se necessário
                    }}
                  />
                </div>
              </div>

              <div className="max-h-96 overflow-y-auto space-y-2">
                {students.map((student) => (
                  <div
                    key={student.id}
                    className="p-4 border border-gray-200 rounded-lg hover:border-blue-300 hover:bg-blue-50 cursor-pointer transition-all"
                    onClick={() => handleSelectStudentForPayment(student)}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                          <span className="text-sm font-medium text-blue-600">
                            {student.nome.split(' ').map(n => n[0]).join('').slice(0, 2)}
                          </span>
                        </div>
                        <div>
                          <div className="font-medium text-gray-900">{student.nome}</div>
                          <div className="text-sm text-gray-600">{student.email}</div>
                          <div className="text-xs text-gray-500">
                            Mensalidade: {formatCurrency(student.mensalidade)}
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className={`badge rounded-full capitalize ${getStatusBadge(student).props.className}`}>
                          {getStatusBadge(student).props.children[1]}
                        </div>
                        <div className="text-xs text-gray-500 mt-1">
                          Vence: {new Date(student.nextPaymentDue).toLocaleDateString('pt-BR')}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {students.length === 0 && (
                <div className="text-center py-8">
                  <div className="text-lg font-medium text-gray-900 mb-2">Nenhum aluno cadastrado</div>
                  <div className="text-sm text-gray-600">Adicione alunos primeiro para poder registrar pagamentos.</div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {showPaymentModal && selectedStudent && (
        <PaymentModal
          student={selectedStudent}
          onClose={handleClosePaymentModal}
          onSavePayment={handleSavePayment}
          isOpen={showPaymentModal}
        />
      )}

      {showWhatsAppModal && selectedStudent && (
        <WhatsAppReminder
          student={selectedStudent}
          onClose={handleCloseWhatsAppModal}
          isOpen={showWhatsAppModal}
        />
      )}

      {/* Modal de Histórico de Pagamentos */}
      {showHistoryModal && selectedStudent && (
        <div className="modal-overlay">
          <div className="absolute inset-0 bg-black/50" onClick={handleCloseHistoryModal}></div>
          <div className="modal-content max-w-4xl">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-semibold fade-in-up">Histórico de Pagamentos</h2>
                <button className="btn btn-ghost icon-hover" onClick={handleCloseHistoryModal}>
                  <X className="h-5 w-5" />
                </button>
              </div>

              <div className="mb-6 p-4 bg-blue-50 rounded-xl border border-blue-200">
                <div className="flex items-center gap-3">
                  <div className="avatar h-12 w-12">
                    <div className="avatar-fallback text-lg">
                      {selectedStudent.nome.split(' ').map(n => n[0]).join('').slice(0, 2)}
                    </div>
                  </div>
                  <div>
                    <div className="font-semibold text-blue-900">{selectedStudent.nome}</div>
                    <div className="text-sm text-blue-700">Mensalidade: {formatCurrency(selectedStudent.mensalidade)}</div>
                    <div className="text-sm text-blue-600">
                      Vencimento: {new Date(selectedStudent.nextPaymentDue).toLocaleDateString('pt-BR')}
                    </div>
                  </div>
                </div>
              </div>

              {selectedStudent.payments && selectedStudent.payments.length > 0 ? (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-md font-semibold text-gray-900">
                      Total de Pagamentos: {selectedStudent.payments.length}
                    </h3>
                    <div className="text-sm text-gray-600">
                      Valor Total: {formatCurrency(selectedStudent.payments.reduce((sum, p) => sum + p.amount, 0))}
                    </div>
                  </div>

                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Data</th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Valor</th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Método</th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Observação</th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Comprovante</th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {selectedStudent.payments.map((payment, index) => (
                          <tr key={payment.id} className="hover:bg-gray-50">
                            <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">
                              {new Date(payment.paymentDate).toLocaleDateString('pt-BR')}
                            </td>
                            <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-gray-900">
                              {formatCurrency(payment.amount)}
                            </td>
                            <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-700">
                              <span className="capitalize">{payment.paymentMethod}</span>
                            </td>
                            <td className="px-4 py-3 whitespace-nowrap">
                              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                payment.status === 'pago' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                              }`}>
                                {payment.status === 'pago' ? 'Pago' : 'Pendente'}
                              </span>
                            </td>
                            <td className="px-4 py-3 text-sm text-gray-700 max-w-[200px]">
                              {payment.observation || '-'}
                            </td>
                            <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-700">
                              {payment.receipt ? (
                                <button
                                  onClick={() => window.open(payment.receipt, '_blank')}
                                  className="btn btn-ghost btn-sm text-blue-600 hover:text-blue-700"
                                >
                                  <Eye className="h-4 w-4" />
                                  Ver
                                </button>
                              ) : (
                                <span className="text-gray-400">-</span>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              ) : (
                <div className="text-center py-8">
                  <div className="text-lg font-medium text-gray-900 mb-2">Nenhum pagamento registrado</div>
                  <div className="text-sm text-gray-600">Este aluno ainda não possui histórico de pagamentos.</div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
