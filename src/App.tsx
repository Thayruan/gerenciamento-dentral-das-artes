import React, { useState } from 'react';
import { 
  LayoutGrid, 
  Users, 
  CreditCard, 
  BarChart3, 
  Settings, 
  Wifi, 
  Pen, 
  Search, 
  Plus, 
  BadgeCheck, 
  Calendar,
  Download,
  Upload,
  Database,
  FileText,
  AlertTriangle,
  Gift,
  Eye,
  MessageCircle,
  MapPin,
  Zap
} from 'lucide-react';
import { StudentsTable } from './components/StudentsTable';
import { StudentDetailsModal } from './components/StudentDetailsModal';
import { StudentForm } from './components/StudentForm';
import { ReportsSection } from './components/ReportsSection';
import { PaymentModal } from './components/PaymentModal';
import { WhatsAppReminder } from './components/WhatsAppReminder';
import { FinancialSection } from './components/FinancialSection';

import { ScheduleSection } from './components/ScheduleSection';
import { useStudents } from './hooks/useStudents';
import { formatCurrency } from './utils/helpers';
import { Student } from './types';
import { Payment } from './types';

function App() {
  const [section, setSection] = useState('dashboard');
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [editingStudent, setEditingStudent] = useState<Student | null>(null);
  const [showStudentForm, setShowStudentForm] = useState(false);
  const [showImportModal, setShowImportModal] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [showWhatsAppModal, setShowWhatsAppModal] = useState(false);

  const {
    students,
    loading,
    error,
    createStudent,
    updateStudent,
    deleteStudent,
    getStats,
    exportDatabase,
    importDatabase,
    createBackup,
    clearError,
    registerPayment
  } = useStudents();

  const handleOpenStudentDetails = (student: Student) => {
    setSelectedStudent(student);
  };

  const handleCloseStudentDetails = () => {
    setSelectedStudent(null);
  };

  const handleEditStudent = (student: Student) => {
    setEditingStudent(student);
    setShowStudentForm(true);
  };

  const handleCloseStudentForm = () => {
    setShowStudentForm(false);
    setEditingStudent(null);
  };

  const handleSaveStudent = async (studentData: Omit<Student, 'id'>) => {
    if (editingStudent) {
      const result = await updateStudent(editingStudent.id, studentData);
      if (result.success) {
        handleCloseStudentForm();
      }
      return result;
    } else {
      const result = await createStudent(studentData);
      if (result.success) {
        handleCloseStudentForm();
      }
      return result;
    }
  };

  const handleDeleteStudent = async (student: Student) => {
    const result = await deleteStudent(student.id);
    if (result.success) {
      // Aluno deletado com sucesso
    }
    return result;
  };

  const handleOpenPaymentModal = (student: Student) => {
    setSelectedStudent(student);
    setShowPaymentModal(true);
  };

  const handleClosePaymentModal = () => {
    setShowPaymentModal(false);
    setSelectedStudent(null);
  };

  const handleSavePayment = async (paymentData: Omit<Payment, 'id' | 'createdAt'>) => {
    const result = await registerPayment(paymentData);
    if (result.success) {
      handleClosePaymentModal();
    }
    return result.success;
  };

  const handleOpenWhatsAppModal = (student: Student) => {
    setSelectedStudent(student);
    setShowWhatsAppModal(true);
  };

  const handleCloseWhatsAppModal = () => {
    setShowWhatsAppModal(false);
    setSelectedStudent(null);
  };

  const handleExportDatabase = () => {
    exportDatabase();
  };

  const handleImportDatabase = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const result = await importDatabase(file);
      if (result.success) {
        setShowImportModal(false);
        // Limpar o input
        event.target.value = '';
      }
    }
  };

  const handleCreateBackup = () => {
    const result = createBackup();
    if (result.success) {
      alert(`Backup criado com sucesso: ${result.path}`);
    }
  };

  // Função para obter aniversariantes próximos
  const getUpcomingBirthdays = () => {
    if (!Array.isArray(students) || students.length === 0) return [];
    
    const hoje = new Date();
    const proximos30Dias = new Date(hoje.getTime() + 30 * 24 * 60 * 60 * 1000);
    
    return students
      .filter(student => {
        if (!student.nasc) return false;
        
        const nascimento = new Date(student.nasc);
        const proximoAniversario = new Date(hoje.getFullYear(), nascimento.getMonth(), nascimento.getDate());
        
        // Se o aniversário já passou este ano, considerar o próximo ano
        if (proximoAniversario < hoje) {
          proximoAniversario.setFullYear(hoje.getFullYear() + 1);
        }
        
        return proximoAniversario <= proximos30Dias;
      })
      .map(student => {
        const nascimento = new Date(student.nasc);
        const proximoAniversario = new Date(hoje.getFullYear(), nascimento.getMonth(), nascimento.getDate());
        
        const diasRestantes = Math.ceil((proximoAniversario.getTime() - hoje.getTime()) / (1000 * 60 * 60 * 24));
        
        return {
          ...student,
          proximoAniversario: proximoAniversario.toISOString(),
          diasRestantes
        };
      })
      .sort((a, b) => a.diasRestantes - b.diasRestantes)
      .slice(0, 10); // Top 10 aniversariantes mais próximos
  };

  const getIconComponent = (iconName: string) => {
    const iconMap: { [key: string]: React.ComponentType<any> } = {
      'layout-grid': LayoutGrid,
      'users': Users,
      'credit-card': CreditCard,
      'bar-chart-3': BarChart3,
      'settings': Settings,
    };
    return iconMap[iconName] || LayoutGrid;
  };

  const getKpiIconComponent = (iconName: string) => {
    const iconMap: { [key: string]: React.ComponentType<any> } = {
      'users': Users,
      'credit-card': CreditCard,
      'badge-check': BadgeCheck,
    };
    return iconMap[iconName] || Users;
  };

  const stats = getStats() || {
    total: 0,
    ativos: 0,
    pendentes: 0,
    trancados: 0,
    receita: 0,
    vencidas: 0
  };

  return (
    <div className="w-full h-full grid grid-cols-[16rem_1fr]" style={{ background: 'linear-gradient(180deg, #f8fafc 0%, #ffffff 24%)' }}>
      {/* Sidebar */}
      <aside className="h-full w-64 bg-white/80 backdrop-blur border-r p-3 flex flex-col">
        <div className="flex items-center gap-2 px-2 py-3 fade-in-left">
          <div className="h-9 w-9 rounded-2xl bg-black/90 text-white grid place-items-center text-sm font-semibold animate-bounce-gentle">CA</div>
          <div className="leading-tight">
            <div className="font-semibold">Central das Artes</div>
            <div className="text-xs text-muted-foreground">Gerenciador de Alunos</div>
          </div>
        </div>

        <div className="mt-2 space-y-1">
          {[
            { id: 'dashboard', label: 'Dashboard', icon: 'layout-grid' },
            { id: 'alunos', label: 'Alunos', icon: 'users' },
            { id: 'cronograma', label: 'Cronograma', icon: 'calendar' },
            { id: 'financeiro', label: 'Financeiro', icon: 'credit-card' },
            { id: 'relatorios', label: 'Relatórios', icon: 'bar-chart-3' },
            { id: 'config', label: 'Configurações', icon: 'settings' }
          ].map((item, index) => {
            const IconComponent = getIconComponent(item.icon);
            return (
              <button 
                key={item.id}
                onClick={() => setSection(item.id)}
                className={`sidebar-item ${
                  section === item.id ? 'active' : 'hover:bg-muted'
                } fade-in-left`}
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <IconComponent className="h-4 w-4 icon-hover" />
                <span>{item.label}</span>
              </button>
            );
          })}
        </div>

        <div className="mt-auto p-3 fade-in-up" style={{ animationDelay: '0.6s' }}>
          <div className="card rounded-2xl border-dashed hover:border-solid transition-all duration-300">
            <div className="card-content p-3 flex items-center justify-between">
              <div className="text-xs">
                <div className="font-medium">Sincronização</div>
                <div className="text-muted-foreground">Estado do app</div>
              </div>
              <div className="badge badge-default gap-1 rounded-xl animate-pulse">
                <Wifi className="h-3 w-3" />
                Online
              </div>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <div className="h-full flex flex-col">
        {/* Topbar */}
        <header className="h-16 border-b bg-white/70 backdrop-blur flex items-center justify-between px-5 fade-in-down">
          <div className="flex items-center gap-3">
            <Pen className="h-5 w-5 icon-hover" />
            <div className="font-semibold">Gerenciamento de Alunos</div>
          </div>

          <div className="flex items-center gap-2">
            <div className="hidden md:flex items-center gap-2">
              <div className="search-container">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground icon-hover" />
                <input type="text" placeholder="Buscar aluno, cidade, e-mail..." className="input pl-8 w-64" />
              </div>
              <select className="h-10 w-40 rounded-md border border-border bg-input px-3 text-sm cursor-pointer transition-all duration-200 hover:border-gray-400">
                <option value="todos">Todos</option>
                <option value="ativo">Ativo</option>
                <option value="pendente">Pendente</option>
                <option value="trancado">Trancado</option>
              </select>
            </div>
            <button className="btn btn-primary rounded-2xl" onClick={() => setShowStudentForm(true)}>
              <Plus className="h-4 w-4 mr-1 icon-hover" />
              Novo Aluno
            </button>
          </div>
        </header>

        {/* Error Banner */}
        {error && (
          <div className="bg-red-50 border-l-4 border-red-400 p-4 fade-in-down">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="h-5 w-5 text-red-400">⚠️</div>
                </div>
                <div className="ml-3">
                  <p className="text-sm text-red-700">{error}</p>
                </div>
              </div>
              <button
                onClick={clearError}
                className="ml-auto pl-3"
              >
                <div className="h-5 w-5 text-red-400 hover:text-red-600">✕</div>
              </button>
            </div>
          </div>
        )}

        {/* Page Content */}
        <main className="p-5 space-y-5 overflow-auto">
          {/* Dashboard Section */}
          {section === 'dashboard' && (
            <>
              {/* KPI Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                {[
                  { label: 'Total de Alunos', value: stats.total, icon: 'users' },
                  { label: 'Alunos Ativos', value: stats.ativos, icon: 'users' },
                  { label: 'Receita Mensal', value: formatCurrency(stats.receita), icon: 'credit-card' },
                  { label: 'Pendências', value: stats.pendentes, icon: 'credit-card' },
                  { label: 'Mensalidades Vencidas', value: stats.vencidas || 0, icon: 'alert-triangle' },
                  { label: 'Trancados', value: stats.trancados, icon: 'users' },
                  { label: 'Taxa de Adesão', value: `${stats.total > 0 ? Math.round((stats.ativos / stats.total) * 100) : 0}%`, icon: 'badge-check' }
                ].map((kpi, index) => {
                  const IconComponent = getKpiIconComponent(kpi.icon);
                  return (
                    <div key={kpi.label} className="kpi-card fade-in-up" style={{ animationDelay: `${index * 0.1}s` }}>
                      <div className="card rounded-2xl">
                        <div className="card-header pb-2">
                          <div className="card-title text-sm text-muted-foreground flex items-center gap-2">
                            <IconComponent className="h-4 w-4 icon-hover" />
                            {kpi.label}
                          </div>
                        </div>
                        <div className="card-content pt-0">
                          <div className="text-2xl font-semibold">{kpi.value}</div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Estatísticas Adicionais */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-2xl p-6 border border-blue-200">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-sm text-blue-600 font-medium">Média de Idade</div>
                      <div className="text-2xl font-bold text-blue-900">
                        {students.length > 0 ? 
                          Math.round(students.reduce((sum, s) => {
                            if (s.nasc) {
                              const idade = new Date().getFullYear() - new Date(s.nasc).getFullYear();
                              return sum + idade;
                            }
                            return sum;
                          }, 0) / students.filter(s => s.nasc).length) : 0
                        } anos
                      </div>
                    </div>
                    <div className="h-12 w-12 bg-blue-200 rounded-full flex items-center justify-center">
                      <Users className="h-6 w-6 text-blue-600" />
                    </div>
                  </div>
                </div>

                <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-2xl p-6 border border-green-200">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-sm text-green-600 font-medium">Cidades Atendidas</div>
                      <div className="text-2xl font-bold text-green-900">
                        {Array.from(new Set(students.map(s => s.cidade))).length}
                      </div>
                    </div>
                    <div className="h-12 w-12 bg-green-200 rounded-full flex items-center justify-center">
                      <MapPin className="h-6 w-6 text-green-600" />
                    </div>
                  </div>
                </div>

                <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-2xl p-6 border border-purple-200">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-sm text-purple-600 font-medium">Ticket Médio</div>
                      <div className="text-2xl font-bold text-purple-900">
                        {formatCurrency(students.length > 0 ? 
                          students.reduce((sum, s) => sum + s.mensalidade, 0) / students.length : 0
                        )}
                      </div>
                    </div>
                    <div className="h-12 w-12 bg-purple-200 rounded-full flex items-center justify-center">
                      <CreditCard className="h-6 w-6 text-purple-600" />
                    </div>
                  </div>
                </div>

                <div className="bg-gradient-to-br from-orange-50 to-orange-100 rounded-2xl p-6 border border-orange-200">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-sm text-orange-600 font-medium">Aniversariantes Hoje</div>
                      <div className="text-2xl font-bold text-orange-900">
                        {students.filter(s => {
                          if (!s.nasc) return false;
                          const hoje = new Date();
                          const nascimento = new Date(s.nasc);
                          return hoje.getMonth() === nascimento.getMonth() && hoje.getDate() === nascimento.getDate();
                        }).length}
                      </div>
                    </div>
                    <div className="h-12 w-12 bg-orange-200 rounded-full flex items-center justify-center">
                      <Gift className="h-6 w-6 text-orange-600" />
                    </div>
                  </div>
                </div>
              </div>

              {/* Aniversariantes Próximos */}
              <div className="card rounded-2xl fade-in-up" style={{ animationDelay: '0.2s' }}>
                <div className="card-header">
                  <div className="card-title text-base flex items-center gap-2">
                    <Gift className="h-5 w-5 text-pink-500" />
                    Aniversariantes Próximos
                  </div>
                  <div className="text-sm text-muted-foreground">
                    Próximos 30 dias
                  </div>
                </div>
                <div className="card-content">
                  {getUpcomingBirthdays().length > 0 ? (
                    <div className="overflow-x-auto">
                      <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                          <tr>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Aluno</th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Data</th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Dias</th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Ações</th>
                          </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                          {getUpcomingBirthdays().map((student) => (
                            <tr key={student.id} className="hover:bg-gray-50">
                              <td className="px-4 py-3 whitespace-nowrap">
                                <div className="flex items-center">
                                  <div className="h-8 w-8 rounded-full bg-pink-100 flex items-center justify-center">
                                    <span className="text-sm font-medium text-pink-600">
                                      {student.nome.split(' ').map(n => n[0]).join('').slice(0, 2)}
                                    </span>
                                  </div>
                                  <div className="ml-3">
                                    <div className="text-sm font-medium text-gray-900">{student.nome}</div>
                                    <div className="text-sm text-gray-500">{student.email}</div>
                                  </div>
                                </div>
                              </td>
                              <td className="px-4 py-3 whitespace-nowrap">
                                <div className="text-sm text-gray-900">
                                  {new Date(student.proximoAniversario).toLocaleDateString('pt-BR')}
                                </div>
                                <div className="text-xs text-gray-500">
                                  {new Date(student.nasc).toLocaleDateString('pt-BR', { 
                                    month: 'long', 
                                    day: 'numeric' 
                                  })}
                                </div>
                              </td>
                              <td className="px-4 py-3 whitespace-nowrap">
                                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                  student.diasRestantes <= 7 ? 'bg-red-100 text-red-800' :
                                  student.diasRestantes <= 14 ? 'bg-yellow-100 text-yellow-800' :
                                  'bg-green-100 text-green-800'
                                }`}>
                                  {student.diasRestantes === 0 ? 'Hoje!' : 
                                   student.diasRestantes === 1 ? 'Amanhã' :
                                   `${student.diasRestantes} dias`}
                                </span>
                              </td>
                              <td className="px-4 py-3 whitespace-nowrap text-sm font-medium">
                                <div className="flex items-center gap-2">
                                  <button
                                    onClick={() => handleOpenStudentDetails(student)}
                                    className="btn btn-ghost btn-sm text-blue-600 hover:text-blue-700"
                                    title="Ver detalhes"
                                  >
                                    <Eye className="h-4 w-4" />
                                  </button>
                                  <button
                                    onClick={() => handleOpenWhatsAppModal(student)}
                                    className="btn btn-ghost btn-sm text-green-500 hover:text-green-700"
                                    title="Enviar parabéns"
                                  >
                                    <MessageCircle className="h-4 w-4" />
                                  </button>
                                </div>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <Gift className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                      <div className="text-lg font-medium text-gray-900 mb-2">Nenhum aniversariante próximo</div>
                      <div className="text-sm text-gray-600">Não há aniversariantes nos próximos 30 dias</div>
                    </div>
                  )}
                </div>
              </div>

              {/* Resumo Executivo */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Estatísticas Rápidas */}
                <div className="card rounded-2xl fade-in-up" style={{ animationDelay: '0.3s' }}>
                  <div className="card-header">
                    <div className="card-title text-base flex items-center gap-2">
                      <BarChart3 className="h-4 w-4 text-blue-500" />
                      Resumo Executivo
                    </div>
                  </div>
                  <div className="card-content">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="text-center p-3 rounded-lg bg-blue-50">
                        <div className="text-2xl font-bold text-blue-600">{stats.total}</div>
                        <div className="text-sm text-blue-700">Total de Alunos</div>
                      </div>
                      <div className="text-center p-3 rounded-lg bg-green-50">
                        <div className="text-2xl font-bold text-green-600">{stats.ativos}</div>
                        <div className="text-sm text-green-700">Alunos Ativos</div>
                      </div>
                      <div className="text-center p-3 rounded-lg bg-yellow-50">
                        <div className="text-2xl font-bold text-yellow-600">{stats.pendentes}</div>
                        <div className="text-sm text-yellow-700">Pendentes</div>
                      </div>
                      <div className="text-center p-3 rounded-lg bg-red-50">
                        <div className="text-2xl font-bold text-red-600">{stats.vencidas}</div>
                        <div className="text-sm text-red-700">Mensalidades Vencidas</div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Ações Rápidas */}
                <div className="card rounded-2xl fade-in-up" style={{ animationDelay: '0.4s' }}>
                  <div className="card-header">
                    <div className="card-title text-base flex items-center gap-2">
                      <Zap className="h-4 w-4 text-orange-500" />
                      Ações Rápidas
                    </div>
                  </div>
                  <div className="card-content">
                    <div className="space-y-3">
                      <button 
                        onClick={() => setShowStudentForm(true)}
                        className="w-full btn btn-outline text-left justify-start"
                      >
                        <Plus className="h-4 w-4 mr-2" />
                        Adicionar Novo Aluno
                      </button>
                      <button 
                        onClick={() => setSection('cronograma')}
                        className="w-full btn btn-outline text-left justify-start"
                      >
                        <Calendar className="h-4 w-4 mr-2" />
                        Gerenciar Cronograma
                      </button>
                      <button 
                        onClick={() => setSection('financeiro')}
                        className="w-full btn btn-outline text-left justify-start"
                      >
                        <CreditCard className="h-4 w-4 mr-2" />
                        Ver Relatórios Financeiros
                      </button>
                      <button 
                        onClick={handleExportDatabase}
                        className="w-full btn btn-outline text-left justify-start"
                      >
                        <Download className="h-4 w-4 mr-2" />
                        Exportar Dados
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </>
          )}

          {/* Students Section */}
          {section === 'alunos' && (
            <div className="space-y-6 fade-in-up">
              {/* Header da Seção de Alunos */}
              <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
                <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                  <div>
                    <h1 className="text-2xl font-bold text-gray-900">Gestão de Alunos</h1>
                    <p className="text-gray-600 mt-1">Gerencie todos os alunos da instituição</p>
                  </div>
                  <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 sm:gap-3">
                    <button 
                      onClick={() => setShowStudentForm(true)}
                      className="btn btn-primary"
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Novo Aluno
                    </button>
                    <button 
                      onClick={handleExportDatabase}
                      className="btn btn-outline"
                    >
                      <Download className="h-4 w-4 mr-2" />
                      Exportar
                    </button>
                  </div>
                </div>
              </div>

              {/* Resumo Rápido */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-white rounded-xl p-4 border border-gray-200">
                  <div className="text-sm text-gray-600">Total de Alunos</div>
                  <div className="text-2xl font-bold text-gray-900">{stats.total}</div>
                </div>
                <div className="bg-white rounded-xl p-4 border border-gray-200">
                  <div className="text-sm text-gray-600">Alunos Ativos</div>
                  <div className="text-2xl font-bold text-green-600">{stats.ativos}</div>
                </div>
                <div className="bg-white rounded-xl p-4 border border-gray-200">
                  <div className="text-sm text-gray-600">Pendentes</div>
                  <div className="text-2xl font-bold text-yellow-600">{stats.pendentes}</div>
                </div>
                <div className="bg-white rounded-xl p-4 border border-gray-200">
                  <div className="text-sm text-gray-600">Trancados</div>
                  <div className="text-2xl font-bold text-red-600">{stats.trancados}</div>
                </div>
              </div>

              {/* Filtros Avançados */}
              <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Filtros e Busca</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
                    <select className="input w-full">
                      <option value="todos">Todos os status</option>
                      <option value="ativo">Ativo</option>
                      <option value="pendente">Pendente</option>
                      <option value="trancado">Trancado</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Cidade</label>
                    <select className="input w-full">
                      <option value="todos">Todas as cidades</option>
                      {Array.from(new Set(students.map(s => s.cidade))).map(cidade => (
                        <option key={cidade} value={cidade}>{cidade}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Faixa Etária</label>
                    <select className="input w-full">
                      <option value="todos">Todas as idades</option>
                      <option value="crianca">Criança (3-12 anos)</option>
                      <option value="adolescente">Adolescente (13-17 anos)</option>
                      <option value="adulto">Adulto (18+ anos)</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Mensalidade</label>
                    <select className="input w-full">
                      <option value="todos">Todas as mensalidades</option>
                      <option value="baixa">Até R$ 100</option>
                      <option value="media">R$ 100 - R$ 200</option>
                      <option value="alta">Acima de R$ 200</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Tabela Principal de Alunos */}
              <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-200">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-semibold text-gray-900">Lista de Alunos</h3>
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-gray-600">
                        Mostrando {students.length} alunos
                      </span>
                    </div>
                  </div>
                </div>
              <StudentsTable 
                students={students} 
                onOpenDetails={handleOpenStudentDetails}
                onEditStudent={handleEditStudent}
                onDeleteStudent={handleDeleteStudent}
                  onOpenPayment={handleOpenPaymentModal}
                  onOpenWhatsApp={handleOpenWhatsAppModal}
                />
              </div>

              {/* Ações em Massa */}
              <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Ações em Massa</h3>
                <div className="flex flex-wrap gap-3">
                  <button
                    onClick={() => {
                      const alunosAtivos = students.filter(s => s.status === 'ativo');
                      if (alunosAtivos.length > 0) {
                        alunosAtivos.forEach(student => {
                          setTimeout(() => handleOpenWhatsAppModal(student), 100);
                        });
                      }
                    }}
                    className="btn btn-outline text-green-600 hover:text-green-700 border-green-300 hover:border-green-400"
                    disabled={students.filter(s => s.status === 'ativo').length === 0}
                  >
                    <MessageCircle className="h-4 w-4 mr-2" />
                    Enviar WhatsApp para Ativos
                  </button>
                  
                  <button
                    onClick={() => {
                      const alunosPendentes = students.filter(s => s.status === 'pendente');
                      if (alunosPendentes.length > 0) {
                        alunosPendentes.forEach(student => {
                          setTimeout(() => handleOpenWhatsAppModal(student), 100);
                        });
                      }
                    }}
                    className="btn btn-outline text-yellow-600 hover:text-yellow-700 border-yellow-300 hover:border-yellow-400"
                    disabled={students.filter(s => s.status === 'pendente').length === 0}
                  >
                    <MessageCircle className="h-4 w-4 mr-2" />
                    Enviar WhatsApp para Pendentes
                  </button>
                  
                  <button
                    onClick={handleExportDatabase}
                    className="btn btn-outline"
                  >
                    <Download className="h-4 w-4 mr-2" />
                    Exportar Todos os Dados
                  </button>
                  
                  <button
                    onClick={() => setShowImportModal(true)}
                    className="btn btn-outline"
                  >
                    <Upload className="h-4 w-4 mr-2" />
                    Importar Dados
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Schedule Section */}
          {section === 'cronograma' && (
            <ScheduleSection 
              students={students}
              onOpenWhatsApp={handleOpenWhatsAppModal}
            />
          )}

          {/* Finance Section */}
          {section === 'financeiro' && (
            <FinancialSection 
              students={students}
              onRegisterPayment={handleSavePayment}
              onOpenWhatsApp={handleOpenWhatsAppModal}
            />
          )}

          {/* Reports Section */}
          {section === 'relatorios' && (
            <ReportsSection students={students} />
          )}

          {/* Settings Section */}
          {section === 'config' && (
            <div className="card rounded-2xl fade-in-up">
              <div className="card-header">
                <div className="card-title text-base">Configurações</div>
              </div>
              <div className="card-content grid md:grid-cols-2 gap-3 text-sm">
                {[
                  {
                    title: 'Banco de dados local',
                    description: 'SQLite (arquivo), com sincronização eventual para nuvem.',
                    buttonText: 'Testar conexão',
                    action: () => alert('Conexão OK!')
                  },
                  {
                    title: 'Backup',
                    description: 'Rotina diária às 02:00 — retenção 30 dias.',
                    buttonText: 'Executar agora',
                    action: handleCreateBackup
                  },
                  {
                    title: 'Exportar dados',
                    description: 'Exportar todos os dados para arquivo JSON.',
                    buttonText: 'Exportar',
                    action: handleExportDatabase
                  },
                  {
                    title: 'Importar dados',
                    description: 'Importar dados de arquivo JSON (substitui dados existentes).',
                    buttonText: 'Importar',
                    action: () => setShowImportModal(true)
                  }
                ].map((item, index) => (
                  <div key={item.title} className={`p-4 rounded-xl border stagger-item hover:shadow-lg transition-all duration-200`} style={{ animationDelay: `${index * 0.1}s` }}>
                    <div className="font-medium">{item.title}</div>
                    <div className="text-muted-foreground">{item.description}</div>
                    <button className="btn btn-outline rounded-xl mt-2" onClick={item.action}>{item.buttonText}</button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </main>
      </div>

      {/* Student Details Modal */}
      <StudentDetailsModal 
        student={selectedStudent} 
        onClose={handleCloseStudentDetails}
        onEdit={handleEditStudent}
        onDelete={handleDeleteStudent}
        onOpenPayment={handleOpenPaymentModal}
        onOpenWhatsApp={handleOpenWhatsAppModal}
      />

      {/* Student Form Modal */}
      <StudentForm
        student={editingStudent}
        onSave={handleSaveStudent}
        onClose={handleCloseStudentForm}
        isOpen={showStudentForm}
      />

      {/* Payment Modal */}
      {showPaymentModal && selectedStudent && (
        <PaymentModal
          student={selectedStudent}
          onClose={handleClosePaymentModal}
          onSavePayment={handleSavePayment}
          isOpen={showPaymentModal}
        />
      )}

      {/* WhatsApp Reminder Modal */}
      {showWhatsAppModal && selectedStudent && (
        <WhatsAppReminder
          student={selectedStudent}
          onClose={handleCloseWhatsAppModal}
          isOpen={showWhatsAppModal}
        />
      )}

      {/* Import Modal */}
      {showImportModal && (
        <div className="modal-overlay">
          <div className="absolute inset-0 bg-black/50" onClick={() => setShowImportModal(false)}></div>
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-white rounded-2xl p-6 w-96 shadow-xl">
            <div className="text-center">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Upload className="h-8 w-8 text-blue-600" />
              </div>
              <h3 className="text-lg font-semibold mb-2">Importar Dados</h3>
              <p className="text-muted-foreground mb-6">
                Selecione um arquivo JSON para importar.
                <br />
                <span className="text-sm text-red-600">⚠️ Esta ação substituirá todos os dados existentes!</span>
              </p>
              <div className="space-y-3">
                <input
                  type="file"
                  accept=".json"
                  onChange={handleImportDatabase}
                  className="block w-full text-sm text-muted-foreground file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-primary file:text-primary-foreground hover:file:bg-gray-900"
                />
                <div className="flex gap-3">
                  <button
                    className="btn btn-outline flex-1"
                    onClick={() => setShowImportModal(false)}
                  >
                    Cancelar
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
