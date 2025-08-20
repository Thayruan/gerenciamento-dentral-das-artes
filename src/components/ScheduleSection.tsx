import React, { useState, useMemo } from 'react';
import { 
  Calendar, 
  Clock, 
  User, 
  BookOpen, 
  Plus, 
  Edit, 
  Trash2, 
  Image, 
  CheckCircle, 
  Play, 
  XCircle, 
  ChevronLeft, 
  ChevronRight,
  Download,
  Upload,
  Eye,
  MessageCircle,
  Settings,
  Edit3,
  Printer
} from 'lucide-react';
import { Student, ClassSchedule, Task } from '../types';
import TaskModal from './TaskModal';
import TaskViewModal from './TaskViewModal';
import ClassScheduleModal from './ClassScheduleModal';
import { PrintTasksModal } from './PrintTasksModal';
import { useStudents } from '../hooks/useStudents';

interface ScheduleSectionProps {
  students: Student[];
  onOpenWhatsApp?: (student: Student) => void;
}

export const ScheduleSection: React.FC<ScheduleSectionProps> = ({ 
  students, 
  onOpenWhatsApp 
}) => {
  const {
    createTask,
    updateTask,
    deleteTask,
    createClassSchedule,
    updateClassSchedule,
    updateStudentClassSchedule,
    deleteClassSchedule
  } = useStudents();

  // Função para alterar status das tarefas rapidamente
  const handleQuickStatusChange = async (taskId: string, newStatus: 'pendente' | 'em_andamento' | 'concluida' | 'atrasada') => {
    try {
      // Encontrar a tarefa e o aluno
      let taskToUpdate: any = null;
      let studentId: string = '';
      
      for (const student of students) {
        if (student.tasks) {
          const task = student.tasks.find(t => t.id === taskId);
          if (task) {
            taskToUpdate = task;
            studentId = student.id;
            break;
          }
        }
      }
      
      if (taskToUpdate && studentId) {
        const updatedTask = { ...taskToUpdate, status: newStatus };
        const result = await updateTask(taskId, updatedTask);
        
        if (result.success) {
          // Recarregar os dados para atualizar a interface
          window.location.reload(); // Solução temporária - ideal seria atualizar o estado
        } else {
          alert('Erro ao atualizar status da tarefa');
        }
      }
    } catch (error) {
      console.error('Erro ao alterar status da tarefa:', error);
      alert('Erro ao alterar status da tarefa');
    }
  };

  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [showTaskModal, setShowTaskModal] = useState(false);
  const [showTaskViewModal, setShowTaskViewModal] = useState(false);
  const [showClassScheduleModal, setShowClassScheduleModal] = useState(false);
  const [showPrintModal, setShowPrintModal] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [viewingTask, setViewingTask] = useState<Task | null>(null);
  const [taskData, setTaskData] = useState<any>(null);
  const [editingClassSchedule, setEditingClassSchedule] = useState<ClassSchedule | null>(null);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);

  // Calcular datas do calendário
  const calendarData = useMemo(() => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const startDate = new Date(firstDay);
    startDate.setDate(startDate.getDate() - firstDay.getDay());
    
    const days = [];
    const currentDateCopy = new Date(startDate);
    
    while (currentDateCopy <= lastDay || days.length < 42) {
      days.push(new Date(currentDateCopy));
      currentDateCopy.setDate(currentDateCopy.getDate() + 1);
    }
    
    return days;
  }, [currentDate]);

  // Obter tarefas para uma data específica
  const getTasksForDate = (date: Date) => {
    const dateStr = date.toISOString().split('T')[0];
    
    const tasks: Array<{
      student: Student;
      task: Task;
    }> = [];
    
    students.forEach(student => {
      if (student.tasks && student.status === 'ativo') {
        student.tasks.forEach(task => {
          if (task.date === dateStr) {
            tasks.push({
              student,
              task
            });
          }
        });
      }
    });
    
    return tasks;
  };

  // Obter aulas para uma data específica (baseado no cronograma fixo)
  const getClassesForDate = (date: Date) => {
    const dayOfWeek = date.getDay();
    
    const classes: Array<{
      student: Student;
      classSchedule: ClassSchedule;
    }> = [];
    
    students.forEach(student => {
      if (student.classSchedule && student.status === 'ativo') {
        student.classSchedule.forEach(classSchedule => {
          if (classSchedule.isActive && classSchedule.dayOfWeek === dayOfWeek) {
            classes.push({
              student,
              classSchedule
            });
          }
        });
      }
    });
    
    return classes.sort((a, b) => a.classSchedule.time.localeCompare(b.classSchedule.time));
  };

  // Navegar para mês anterior/próximo
  const goToPreviousMonth = () => {
    setCurrentDate(prev => new Date(prev.getFullYear(), prev.getMonth() - 1, 1));
  };

  const goToNextMonth = () => {
    setCurrentDate(prev => new Date(prev.getFullYear(), prev.getMonth() + 1, 1));
  };

  // Formatar data
  const formatDate = (date: Date) => {
    return date.toLocaleDateString('pt-BR', { 
      month: 'long', 
      year: 'numeric' 
    });
  };

  // Verificar se é hoje
  const isToday = (date: Date) => {
    const today = new Date();
    return date.toDateString() === today.toDateString();
  };

  // Verificar se é o mês atual
  const isCurrentMonth = (date: Date) => {
    const today = new Date();
    return date.getMonth() === today.getMonth() && date.getFullYear() === today.getFullYear();
  };

  // Obter cor do status
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'concluida': return 'bg-green-100 text-green-800 border-green-200';
      case 'em_andamento': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'pendente': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'atrasada': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  return (
    <div className="space-y-6 fade-in-up">
      {/* Header da Seção de Cronograma */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Cronograma e Tarefas</h1>
            <p className="text-gray-600 mt-1">Gerencie os dias de aula dos alunos e acompanhe o progresso das tarefas artísticas</p>
          </div>
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 sm:gap-3">
            <button 
              onClick={() => setShowClassScheduleModal(true)}
              className="btn btn-primary"
            >
              <Settings className="h-4 w-4 mr-2" />
              Configurar Dias de Aula
            </button>
            <button 
              onClick={() => setShowTaskModal(true)}
              className="btn btn-outline"
            >
              <Plus className="h-4 w-4 mr-2" />
              Nova Tarefa
            </button>
            <button 
              onClick={() => setShowPrintModal(true)}
              className="btn btn-outline"
            >
              <Printer className="h-4 w-4 mr-2" />
              Imprimir Tarefas
            </button>
          </div>
        </div>
      </div>

      {/* Controles do Calendário */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-gray-900">Calendário de Tarefas e Aulas</h2>
          <div className="flex items-center gap-2">
            <button
              onClick={goToPreviousMonth}
              className="btn btn-ghost btn-sm"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <div className="text-lg font-medium text-gray-900 px-4">
              {formatDate(currentDate)}
            </div>
            <button
              onClick={goToNextMonth}
              className="btn btn-ghost btn-sm"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Calendário */}
        <div className="grid grid-cols-7 gap-1">
          {/* Cabeçalhos dos dias da semana */}
          {['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'].map(day => (
            <div key={day} className="p-3 text-center text-sm font-medium text-gray-500 bg-gray-50 rounded-lg">
              {day}
            </div>
          ))}
          
          {/* Dias do calendário */}
          {calendarData.map((date, index) => {
            const tasks = getTasksForDate(date);
            const classes = getClassesForDate(date);
            const isCurrentMonthDate = date.getMonth() === currentDate.getMonth();
            
            return (
              <div
                key={index}
                className={`min-h-[160px] p-2 border rounded-lg transition-all duration-200 cursor-pointer ${
                  isToday(date) 
                    ? 'bg-blue-50 border-blue-200 ring-2 ring-blue-300' 
                    : isCurrentMonthDate 
                      ? 'bg-white border-gray-200 hover:border-gray-300 hover:bg-gray-50' 
                      : 'bg-gray-50 border-gray-100'
                }`}
                onClick={() => {
                  // Só abre modal de criação se não há tarefas nem aulas
                  if (isCurrentMonthDate && tasks.length === 0 && classes.length === 0) {
                    setSelectedDate(date.toISOString().split('T')[0]);
                    setSelectedStudent(null);
                    setEditingTask(null);
                    setShowTaskModal(true);
                  }
                }}
              >
                <div className={`text-sm font-medium mb-2 ${
                  isToday(date) 
                    ? 'text-blue-600' 
                    : isCurrentMonthDate 
                      ? 'text-gray-900' 
                      : 'text-gray-400'
                }`}>
                  {date.getDate()}
                </div>
                
                {/* Aulas do dia (cronograma fixo) */}
                {classes.length > 0 && (
                  <div className="mb-2">
                    <div className="text-xs text-gray-500 mb-1">Aulas:</div>
                    {classes.slice(0, 2).map((classItem, classIndex) => (
                      <div
                        key={classIndex}
                        className="p-1 bg-blue-100 rounded text-xs cursor-pointer hover:bg-blue-200 transition-colors mb-1"
                        onClick={() => {
                          setSelectedStudent(classItem.student);
                          setShowClassScheduleModal(true);
                        }}
                      >
                        <div className="font-medium text-blue-900 truncate">
                          {classItem.student.nome}
                        </div>
                        <div className="text-blue-700 truncate">
                          {classItem.classSchedule.time} - {classItem.classSchedule.subject}
                        </div>
                      </div>
                    ))}
                    {classes.length > 2 && (
                      <div className="text-xs text-gray-500 text-center">
                        +{classes.length - 2} mais aulas
                      </div>
                    )}
                  </div>
                )}
                
                                {/* Tarefas do dia */}
                {tasks.length > 0 && (
                  <div>
                    <div className="text-xs text-gray-500 mb-1 flex items-center gap-1">
                      <span>Tarefas:</span>
                      <Eye className="h-3 w-3 text-gray-400" />
                      <span className="text-xs text-gray-400">(clique para visualizar)</span>
                    </div>
                    {tasks.map((taskItem, taskIndex) => (
                      <div
                        key={taskIndex}
                        className="p-1 bg-purple-100 rounded text-xs hover:bg-purple-200 transition-colors mb-1 cursor-pointer border border-purple-200 hover:border-purple-300"
                        onClick={() => {
                          setSelectedStudent(taskItem.student);
                          setViewingTask(taskItem.task);
                          setShowTaskViewModal(true);
                        }}
                        title="Clique para visualizar a tarefa"
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex-1">
                            <div className="font-medium text-purple-900 truncate flex items-center gap-1">
                              {taskItem.task.title}
                              <Eye className="h-3 w-3 text-purple-500" />
                            </div>
                            <div className="text-purple-700 truncate">
                              {taskItem.student.nome}
                            </div>
                          </div>
                          
                          {/* Botões de ação rápida */}
                          <div className="flex flex-col gap-1 ml-1">
                            {taskItem.task.status !== 'concluida' && (
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleQuickStatusChange(taskItem.task.id, 'concluida');
                                }}
                                className="w-5 h-5 bg-green-500 hover:bg-green-600 rounded-full flex items-center justify-center text-white text-xs"
                                title="Marcar como concluída"
                              >
                                ✓
                              </button>
                            )}
                            {taskItem.task.status === 'pendente' && (
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleQuickStatusChange(taskItem.task.id, 'em_andamento');
                                }}
                                className="w-5 h-5 bg-blue-500 hover:bg-blue-600 rounded-full flex items-center justify-center text-white text-xs"
                                title="Marcar como em andamento"
                                >
                                ▶
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                    
                    {/* Indicador para adicionar mais tarefas */}
                    <div 
                      className="mt-2 p-1 bg-green-50 border border-green-200 rounded text-xs text-center text-green-700 hover:bg-green-100 transition-colors cursor-pointer"
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedDate(date.toISOString().split('T')[0]);
                        setSelectedStudent(null);
                        setEditingTask(null);
                        setShowTaskModal(true);
                      }}
                    >
                      <Plus className="h-3 w-3 inline mr-1" />
                      Adicionar mais tarefas
                    </div>
                  </div>
                )}
                
                {/* Se não há tarefas, mostrar indicador para adicionar */}
                {tasks.length === 0 && isCurrentMonthDate && (
                  <div 
                    className="mt-2 p-1 bg-blue-50 border border-blue-200 rounded text-xs text-center text-blue-700 hover:bg-blue-100 transition-colors cursor-pointer"
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedDate(date.toISOString().split('T')[0]);
                      setSelectedStudent(null);
                      setEditingTask(null);
                      setShowTaskModal(true);
                    }}
                  >
                    <Plus className="h-3 w-3 inline mr-1" />
                    Adicionar tarefa
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Resumo das Aulas da Semana */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Cronograma Semanal de Aulas</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3, 4, 5].map(dayOfWeek => {
            const dayNames = ['', 'Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta'];
            const classes = students.flatMap(student => 
              student.classSchedule?.filter(s => s.isActive && s.dayOfWeek === dayOfWeek) || []
            ).map(classSchedule => ({
              student: students.find(s => s.id === classSchedule.studentId)!,
              classSchedule
            }));
            
            if (classes.length === 0) return null;
            
            return (
              <div key={dayOfWeek} className="border rounded-lg p-4">
                <div className="font-medium text-gray-900 mb-3">{dayNames[dayOfWeek]}</div>
                <div className="space-y-2">
                  {classes.map((classItem, index) => (
                    <div key={index} className="flex items-center justify-between p-2 bg-blue-50 rounded">
                      <div className="flex items-center gap-2">
                        <div className="h-6 w-6 rounded-full bg-blue-100 flex items-center justify-center">
                          <span className="text-xs font-medium text-blue-600">
                            {classItem.student.nome.split(' ').map(n => n[0]).join('').slice(0, 2)}
                          </span>
                        </div>
                        <div>
                          <div className="text-sm font-medium text-gray-900">{classItem.student.nome}</div>
                          <div className="text-xs text-gray-500">{classItem.classSchedule.subject}</div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-sm font-medium text-gray-900">{classItem.classSchedule.time}</div>
                        <div className="text-xs text-gray-500">{classItem.classSchedule.duration} min</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Tarefas Pendentes */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Tarefas Pendentes</h3>
        <div className="space-y-3">
          {students.flatMap(student => 
            student.tasks?.filter(task => task.status === 'pendente' || task.status === 'em_andamento') || []
          ).map(task => {
            const student = students.find(s => s.id === task.studentId)!;
            return (
              <div key={task.id} className="flex items-center justify-between p-3 border rounded-lg hover:shadow-md transition-all">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-full bg-purple-100 flex items-center justify-center">
                    <span className="text-sm font-medium text-purple-600">
                      {student.nome.split(' ').map(n => n[0]).join('').slice(0, 2)}
                    </span>
                  </div>
                  <div>
                    <div className="font-medium text-gray-900">{task.title}</div>
                    <div className="text-sm text-gray-600">{student.nome} • {task.title}</div>
                    <div className="text-xs text-gray-500">Vence: {new Date(task.date).toLocaleDateString('pt-BR')}</div>
                  </div>
                </div>
                
                <div className="flex items-center gap-2">
                  <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs border ${getStatusColor(task.status)}`}>
                    {task.status}
                  </span>
                  <button
                    onClick={() => {
                      setSelectedStudent(student);
                      setEditingTask(task);
                      setShowTaskModal(true);
                    }}
                    className="btn btn-ghost btn-sm text-blue-600 hover:text-blue-700"
                  >
                    <Edit className="h-4 w-4" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Ações Rápidas */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Ações Rápidas</h3>
        <div className="flex flex-wrap gap-3">
          <button
            onClick={() => setShowTaskModal(true)}
            className="btn btn-outline text-purple-600 hover:text-purple-700 border-purple-300 hover:border-purple-400"
          >
            <Plus className="h-4 w-4 mr-2" />
            Criar Nova Tarefa
          </button>
          
          <button
            onClick={() => setShowClassScheduleModal(true)}
            className="btn btn-outline text-blue-600 hover:text-blue-700 border-blue-300 hover:border-blue-400"
          >
            <Settings className="h-4 w-4 mr-2" />
            Configurar Dias de Aula
          </button>
          
          <button
            onClick={() => {
              // Exportar cronograma
              const data = students.map(s => ({
                nome: s.nome,
                cronograma: s.classSchedule?.map(sch => ({
                  dia: ['Domingo', 'Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado'][sch.dayOfWeek],
                  horario: sch.time,
                  disciplina: sch.subject,
                  duracao: sch.duration
                })),
                tarefas: s.tasks?.map(task => ({
                  titulo: task.title,
                  data: task.date,
                  status: task.status
                }))
              }));
              
              const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
              const url = URL.createObjectURL(blob);
              const a = document.createElement('a');
              a.href = url;
              a.download = 'cronograma-e-tarefas.json';
              a.click();
            }}
            className="btn btn-outline"
          >
            <Download className="h-4 w-4 mr-2" />
            Exportar Dados
          </button>
        </div>
      </div>

      {/* Modais */}
      <TaskModal
        student={selectedStudent}
        task={editingTask}
        selectedDate={selectedDate}
        allStudents={students}
        onClose={() => {
          setShowTaskModal(false);
          setSelectedStudent(null);
          setEditingTask(null);
          setSelectedDate(null);
        }}
        onSave={async (taskData, studentId) => {
          try {
            if (editingTask) {
              // Atualizar tarefa existente
              const result = await updateTask(editingTask.id, taskData);
              if (result.success) {
                // Atualizar o estado local da tarefa sendo visualizada
                if (viewingTask && viewingTask.id === editingTask.id) {
                  setViewingTask({
                    ...viewingTask,
                    ...taskData,
                    updatedAt: new Date().toISOString()
                  });
                }
                // Atualizar o estado local da tarefa sendo editada
                setEditingTask({
                  ...editingTask,
                  ...taskData,
                  updatedAt: new Date().toISOString()
                });
              }
              return result.success;
            } else {
              // Criar nova tarefa
              const result = await createTask(studentId, taskData);
              return result.success;
            }
          } catch (error) {
            console.error('Erro ao salvar tarefa:', error);
            return false;
          }
        }}
        isOpen={showTaskModal}
      />

      <ClassScheduleModal
        student={selectedStudent}
        classSchedule={editingClassSchedule}
        onClose={() => {
          setShowClassScheduleModal(false);
          setSelectedStudent(null);
          setEditingClassSchedule(null);
        }}
        onSave={async (scheduleData) => {
          if (!selectedStudent) return false;
          
          try {
            if (editingClassSchedule) {
              // Atualizar cronograma existente (single schedule)
              if (Array.isArray(scheduleData)) {
                return false; // Não deveria acontecer
              }
              const result = await updateClassSchedule(editingClassSchedule.id, scheduleData);
              return result.success;
            } else {
              // Configurar cronograma completo do aluno (multiple schedules)
              if (Array.isArray(scheduleData)) {
                const result = await updateStudentClassSchedule(selectedStudent.id, scheduleData);
                return result.success;
              } else {
                // Criar novo cronograma individual
                const result = await createClassSchedule(selectedStudent.id, scheduleData);
                return result.success;
              }
            }
          } catch (error) {
            console.error('Erro ao salvar cronograma:', error);
            return false;
          }
        }}
        isOpen={showClassScheduleModal}
      />

      <TaskViewModal
        student={selectedStudent}
        task={viewingTask}
        isOpen={showTaskViewModal}
        onClose={() => {
          setShowTaskViewModal(false);
          setSelectedStudent(null);
          setViewingTask(null);
        }}
        onEdit={() => {
          // Fechar modal de visualização e abrir modal de edição
          setShowTaskViewModal(false);
          setEditingTask(viewingTask);
          setShowTaskModal(true);
        }}
        taskData={viewingTask ? taskData : undefined}
      />

      <PrintTasksModal
        isOpen={showPrintModal}
        onClose={() => setShowPrintModal(false)}
        students={students}
        currentMonth={currentDate}
      />
    </div>
  );
};
