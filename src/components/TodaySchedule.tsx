import React from 'react';
import { Clock, User, BookOpen, CheckCircle, Play, XCircle } from 'lucide-react';
import { Student, ClassSchedule } from '../types';

interface TodayScheduleProps {
  students: Student[];
}

export const TodaySchedule: React.FC<TodayScheduleProps> = ({ students }) => {
  // Função para obter aulas de hoje baseado no cronograma fixo dos alunos
  const getTodayLessons = () => {
    const hoje = new Date();
    const diaSemana = hoje.getDay(); // 0 = Domingo, 1 = Segunda, etc.
    
    const aulasHoje: Array<{
      student: Student;
      classSchedule: ClassSchedule;
      time: string;
      status: 'agendada' | 'em_andamento' | 'concluida' | 'cancelada';
    }> = [];
    
    students.forEach(student => {
      if (student.classSchedule && student.status === 'ativo') {
        student.classSchedule.forEach(classSchedule => {
          if (classSchedule.isActive && classSchedule.dayOfWeek === diaSemana) {
            aulasHoje.push({
              student,
              classSchedule,
              time: classSchedule.time,
              status: 'agendada' // Por padrão, aulas agendadas
            });
          }
        });
      }
    });
    
    // Ordenar por horário
    return aulasHoje.sort((a, b) => a.time.localeCompare(b.time));
  };

  // Função para obter tarefas de hoje
  const getTodayTasks = () => {
    const hoje = new Date();
    const hojeStr = hoje.toISOString().split('T')[0];
    
    console.log('🔍 Debug - Data de hoje:', hojeStr);
    console.log('🔍 Debug - Total de alunos:', students.length);
    
    const tarefasHoje: Array<{
      student: Student;
      task: any; // Task type
      type: 'tarefa';
    }> = [];
    
    students.forEach(student => {
      if (student.tasks && student.status === 'ativo') {
        console.log(`🔍 Debug - Aluno ${student.nome}:`, {
          status: student.status,
          totalTasks: student.tasks.length,
          tasks: student.tasks.map(t => ({ id: t.id, title: t.title, date: t.date, status: t.status }))
        });
        
        student.tasks.forEach(task => {
          // Normalizar a data da tarefa para garantir compatibilidade
          let taskDateStr = task.date;
          if (typeof task.date === 'string') {
            // Se a data já é uma string, usar como está
            taskDateStr = task.date;
          } else if (task.date && typeof task.date === 'object' && 'toISOString' in task.date) {
            // Se é um objeto Date, converter para string
            taskDateStr = (task.date as any).toISOString().split('T')[0];
          }
          
          // Verificar se a tarefa é para hoje usando múltiplas estratégias
          const isToday = 
            taskDateStr === hojeStr || // Formato ISO padrão
            taskDateStr === hoje.toLocaleDateString('pt-BR').split('/').reverse().join('-') || // Formato brasileiro
            taskDateStr === hoje.toLocaleDateString('en-CA'); // Formato canadense (YYYY-MM-DD)
          
          console.log(`🔍 Debug - Comparando tarefa:`, {
            taskDate: task.date,
            taskDateStr: taskDateStr,
            hojeStr: hojeStr,
            hojeBR: hoje.toLocaleDateString('pt-BR'),
            hojeCA: hoje.toLocaleDateString('en-CA'),
            isEqual: isToday,
            taskTitle: task.title
          });
          
          if (isToday) {
            tarefasHoje.push({
              student,
              task,
              type: 'tarefa'
            });
          }
        });
      }
    });
    
    console.log('🔍 Debug - Tarefas encontradas para hoje:', tarefasHoje.length);
    
    // Debug: mostrar todas as tarefas existentes
    const todasTarefas = students.flatMap(s => s.tasks || []);
    console.log('🔍 Debug - Todas as tarefas no sistema:', todasTarefas.map(t => ({
      id: t.id,
      title: t.title,
      date: t.date,
      studentId: t.studentId,
      status: t.status
    })));
    
    return tarefasHoje.sort((a, b) => {
      // Ordenar por prioridade: alta > média > baixa
      const priorityOrder = { alta: 3, media: 2, baixa: 1 };
      return (priorityOrder[b.task.priority as keyof typeof priorityOrder] || 0) - (priorityOrder[a.task.priority as keyof typeof priorityOrder] || 0);
    });
  };

  const aulasHoje = getTodayLessons();
  const tarefasHoje = getTodayTasks();
  const agora = new Date();
  const horaAtual = agora.getHours() * 60 + agora.getMinutes(); // Minutos desde meia-noite

  const getStatusIcon = (time: string, status: string) => {
    const [hora, minuto] = time.split(':').map(Number);
    const horaAula = hora * 60 + minuto;
    
    if (status === 'concluida') {
      return <CheckCircle className="h-4 w-4 text-green-500" />;
    } else if (status === 'cancelada') {
      return <XCircle className="h-4 w-4 text-red-500" />;
    } else if (horaAula <= horaAtual && horaAula + 60 > horaAtual) {
      return <Play className="h-4 w-4 text-blue-500 animate-pulse" />;
    } else if (horaAula < horaAtual) {
      return <Clock className="h-4 w-4 text-gray-400" />;
    } else {
      return <Clock className="h-4 w-4 text-blue-400" />;
    }
  };

  const getStatusText = (time: string, status: string) => {
    const [hora, minuto] = time.split(':').map(Number);
    const horaAula = hora * 60 + minuto;
    
    if (status === 'concluida') {
      return 'Concluída';
    } else if (status === 'cancelada') {
      return 'Cancelada';
    } else if (horaAula <= horaAtual && horaAula + 60 > horaAtual) {
      return 'Em andamento';
    } else if (horaAula < horaAtual) {
      return 'Passou';
    } else {
      const minutosRestantes = horaAula - horaAtual;
      if (minutosRestantes < 60) {
        return `Em ${minutosRestantes} min`;
      } else {
        const horas = Math.floor(minutosRestantes / 60);
        const minutos = minutosRestantes % 60;
        return `Em ${horas}h ${minutos}min`;
      }
    }
  };

  const getStatusColor = (time: string, status: string) => {
    const [hora, minuto] = time.split(':').map(Number);
    const horaAula = hora * 60 + minuto;
    
    if (status === 'concluida') {
      return 'text-green-600 bg-green-50 border-green-200';
    } else if (status === 'cancelada') {
      return 'text-red-600 bg-red-50 border-red-200';
    } else if (horaAula <= horaAtual && horaAula + 60 > horaAtual) {
      return 'text-blue-600 bg-blue-50 border-blue-200';
    } else if (horaAula < horaAtual) {
      return 'text-gray-500 bg-gray-50 border-gray-200';
    } else {
      return 'text-blue-600 bg-blue-50 border-blue-200';
    }
  };

  // Funções auxiliares para tarefas
  const getTaskPriorityColor = (priority: string) => {
    switch (priority) {
      case 'alta': return 'bg-red-100 text-red-800 border-red-200';
      case 'media': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'baixa': return 'bg-green-100 text-green-800 border-green-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getTaskStatusColor = (status: string) => {
    switch (status) {
      case 'concluida': return 'bg-green-100 text-green-800 border-green-200';
      case 'em_andamento': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'pendente': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'atrasada': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getTaskStatusText = (status: string) => {
    switch (status) {
      case 'concluida': return 'Concluída';
      case 'em_andamento': return 'Em andamento';
      case 'pendente': return 'Pendente';
      case 'atrasada': return 'Atrasada';
      default: return 'Pendente';
    }
  };

  if (aulasHoje.length === 0 && tarefasHoje.length === 0) {
    return (
      <div className="card rounded-2xl fade-in-up" style={{ animationDelay: '0.3s' }}>
        <div className="card-header">
          <div className="card-title text-base flex items-center gap-2">
            <Clock className="h-5 w-5 text-blue-500" />
            Agenda de Hoje
          </div>
        </div>
        <div className="card-content">
          <div className="text-center py-8">
            <Clock className="h-12 w-12 text-gray-300 mx-auto mb-4" />
            <div className="text-lg font-medium text-gray-900 mb-2">Nada agendado para hoje</div>
            <div className="text-sm text-gray-600">Aproveite para organizar a agenda da semana</div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="card rounded-2xl fade-in-up" style={{ animationDelay: '0.3s' }}>
      <div className="card-header">
        <div className="card-title text-base flex items-center gap-2">
          <Clock className="h-5 w-5 text-blue-500" />
          Agenda de Hoje
        </div>
        <div className="text-sm text-muted-foreground">
          {aulasHoje.length + tarefasHoje.length} item{aulasHoje.length + tarefasHoje.length !== 1 ? 's' : ''} programado{aulasHoje.length + tarefasHoje.length !== 1 ? 's' : ''}
        </div>
      </div>
      <div className="card-content">
        <div className="space-y-3">
          {/* Aulas de hoje */}
          {aulasHoje.map((aula, index) => (
            <div 
              key={`aula-${aula.student.id}-${aula.classSchedule.id}`} 
              className="stagger-item p-3 rounded-xl border border-blue-200 bg-blue-50 hover:shadow-md transition-all duration-200"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  {getStatusIcon(aula.time, aula.status)}
                  <div className="flex items-center gap-2">
                    <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center">
                      <span className="text-sm font-medium text-blue-600">
                        {aula.student.nome.split(' ').map(n => n[0]).join('').slice(0, 2)}
                      </span>
                    </div>
                    <div>
                      <div className="text-sm font-medium text-gray-900">{aula.student.nome}</div>
                      <div className="text-xs text-blue-600 font-medium">📚 AULA</div>
                      <div className="text-xs text-gray-500">{aula.classSchedule.subject}</div>
                    </div>
                  </div>
                </div>
                
                <div className="text-right">
                  <div className="text-sm font-medium text-gray-900">{aula.time}</div>
                  <div className={`text-xs px-2 py-1 rounded-full border ${getStatusColor(aula.time, aula.status)}`}>
                    {getStatusText(aula.time, aula.status)}
                  </div>
                </div>
              </div>
              
              <div className="mt-2 flex items-center justify-between text-xs text-gray-500">
                <div className="flex items-center gap-1">
                  <User className="h-3 w-3" />
                  {aula.student.cidade}
                </div>
                <div className="flex items-center gap-1">
                  <BookOpen className="h-3 w-3" />
                  {aula.classSchedule.duration} min
                </div>
              </div>
            </div>
          ))}

          {/* Tarefas de hoje */}
          {tarefasHoje.map((tarefa, index) => (
            <div 
              key={`tarefa-${tarefa.student.id}-${tarefa.task.id}`} 
              className="stagger-item p-3 rounded-xl border border-purple-200 bg-purple-50 hover:shadow-md transition-all duration-200"
              style={{ animationDelay: `${(aulasHoje.length + index) * 0.1}s` }}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="h-8 w-8 rounded-full bg-purple-100 flex items-center justify-center">
                    <span className="text-sm font-medium text-purple-600">
                      {tarefa.student.nome.split(' ').map(n => n[0]).join('').slice(0, 2)}
                    </span>
                  </div>
                  <div>
                    <div className="text-sm font-medium text-gray-900">{tarefa.student.nome}</div>
                    <div className="text-xs text-purple-600 font-medium">🎨 TAREFA</div>
                    <div className="text-sm font-medium text-gray-900">{tarefa.task.title}</div>
                  </div>
                </div>
                
                <div className="text-right">
                  <div className={`text-xs px-2 py-1 rounded-full border ${getTaskPriorityColor(tarefa.task.priority)}`}>
                    {tarefa.task.priority}
                  </div>
                  <div className={`text-xs px-2 py-1 rounded-full border mt-1 ${getTaskStatusColor(tarefa.task.status)}`}>
                    {getTaskStatusText(tarefa.task.status)}
                  </div>
                </div>
              </div>
              
              <div className="mt-2 flex items-center justify-between text-xs text-gray-500">
                <div className="flex items-center gap-1">
                  <User className="h-3 w-3" />
                  {tarefa.student.cidade}
                </div>
                <div className="flex items-center gap-1">
                  <Clock className="h-3 w-3" />
                  {tarefa.task.estimatedDuration} min
                </div>
              </div>
            </div>
          ))}
        </div>
        
        {(aulasHoje.length + tarefasHoje.length) > 3 && (
          <div className="mt-4 pt-3 border-t border-gray-200">
            <div className="text-center">
              <button className="text-sm text-blue-600 hover:text-blue-700 font-medium">
                Ver todos os {aulasHoje.length + tarefasHoje.length} itens
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
