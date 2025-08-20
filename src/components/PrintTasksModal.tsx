import React, { useState, useEffect } from 'react';
import { X, Printer, Calendar, User, Check } from 'lucide-react';
import { Student, Task } from '../types';

interface PrintTasksModalProps {
  isOpen: boolean;
  onClose: () => void;
  students: Student[];
  currentMonth: Date;
}

interface StudentWithTasks {
  student: Student;
  tasks: Task[];
  selected: boolean;
}

export const PrintTasksModal: React.FC<PrintTasksModalProps> = ({
  isOpen,
  onClose,
  students,
  currentMonth
}) => {
  const [studentsWithTasks, setStudentsWithTasks] = useState<StudentWithTasks[]>([]);
  const [selectAll, setSelectAll] = useState(true);

  // Filtrar alunos com tarefas no mês atual
  useEffect(() => {
    if (isOpen && students.length > 0) {
      const monthStart = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1);
      const monthEnd = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 0);
      
      const filtered = students
        .filter(student => student.tasks && student.tasks.length > 0)
        .map(student => {
          // TypeScript já garantiu que student.tasks existe aqui devido ao filter acima
          const monthTasks = student.tasks!.filter(task => {
            const taskDate = new Date(task.date);
            return taskDate >= monthStart && taskDate <= monthEnd;
          });
          
          return {
            student,
            tasks: monthTasks,
            selected: true // Por padrão, todos marcados
          };
        })
        .filter(item => item.tasks.length > 0); // Só alunos com tarefas no mês
      
      setStudentsWithTasks(filtered);
      setSelectAll(true);
    }
  }, [isOpen, students, currentMonth]);

  const handleSelectAll = (checked: boolean) => {
    setSelectAll(checked);
    setStudentsWithTasks(prev => 
      prev.map(item => ({ ...item, selected: checked }))
    );
  };

  const handleSelectStudent = (studentId: string, checked: boolean) => {
    setStudentsWithTasks(prev => 
      prev.map(item => 
        item.student.id === studentId 
          ? { ...item, selected: checked }
          : item
      )
    );
    
    // Atualizar selectAll baseado na seleção
    const allSelected = studentsWithTasks.every(item => 
      item.student.id === studentId ? checked : item.selected
    );
    setSelectAll(allSelected);
  };

  const handlePrint = () => {
    const selectedStudents = studentsWithTasks.filter(item => item.selected);
    
    if (selectedStudents.length === 0) {
      alert('Selecione pelo menos um aluno para imprimir.');
      return;
    }

    // Preparar dados para impressão
    const printData = selectedStudents.map(item => ({
      aluno: item.student.nome,
      email: item.student.email,
      telefone: item.student.telefone,
      tarefas: item.tasks.map(task => ({
        titulo: task.title,
        data: new Date(task.date).toLocaleDateString('pt-BR'),
        descricao: task.description,
        status: task.status,
        observacoes: task.notes || 'Nenhuma'
      }))
    }));

    // Criar conteúdo HTML para impressão
    const printWindow = window.open('', '_blank');
    if (printWindow) {
      const monthName = currentMonth.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' });
      
      const htmlContent = `
        <!DOCTYPE html>
        <html>
        <head>
          <title>Tarefas do Mês - ${monthName}</title>
          <style>
            body { font-family: Arial, sans-serif; margin: 20px; }
            .header { text-align: center; margin-bottom: 30px; border-bottom: 2px solid #333; padding-bottom: 20px; }
            .header h1 { color: #333; margin: 0; }
            .header .date { color: #666; font-size: 18px; margin-top: 10px; }
            .student-section { margin-bottom: 30px; page-break-inside: avoid; }
            .student-header { background: #f5f5f5; padding: 15px; border-radius: 8px; margin-bottom: 15px; }
            .student-name { font-size: 20px; font-weight: bold; color: #333; margin-bottom: 5px; }
            .student-info { color: #666; font-size: 14px; }
            .tasks-table { width: 100%; border-collapse: collapse; margin-top: 15px; }
            .tasks-table th, .tasks-table td { border: 1px solid #ddd; padding: 12px; text-align: left; }
            .tasks-table th { background: #f8f9fa; font-weight: bold; }
            
            .status-pendente { color: #f59e0b; font-weight: bold; }
            .status-em-andamento { color: #3b82f6; font-weight: bold; }
            .status-concluida { color: #10b981; font-weight: bold; }
            .status-atrasada { color: #ef4444; font-weight: bold; }
                         .footer { margin-top: 30px; text-align: center; color: #666; font-size: 12px; border-top: 1px solid #ddd; padding-top: 20px; }
             .print-button { 
               position: fixed; 
               top: 20px; 
               right: 20px; 
               background: #3b82f6; 
               color: white; 
               border: none; 
               padding: 10px 20px; 
               border-radius: 5px; 
               cursor: pointer; 
               font-size: 14px; 
               z-index: 1000;
             }
             .print-button:hover { background: #2563eb; }
             @media print {
               body { margin: 0; }
               .student-section { page-break-inside: avoid; }
               .print-button { display: none; }
             }
          </style>
        </head>
        <body>
          <button class="print-button" onclick="window.print()">🖨️ Imprimir</button>
          <div class="header">
            <h1>Relatório de Tarefas do Mês</h1>
            <div class="date">${monthName}</div>
          </div>
          
          ${printData.map(student => `
            <div class="student-section">
              <div class="student-header">
                <div class="student-name">${student.aluno}</div>
                <div class="student-info">
                  ${student.email ? `Email: ${student.email}` : ''}
                  ${student.telefone ? ` | Telefone: ${student.telefone}` : ''}
                </div>
              </div>
              
              <table class="tasks-table">
                <thead>
                  <tr>
                    <th>Data</th>
                    <th>Título</th>
                    <th>Descrição</th>
                    <th>Status</th>
                    <th>Observações</th>
                  </tr>
                </thead>
                <tbody>
                  ${student.tarefas.map(task => `
                    <tr>
                      <td>${task.data}</td>
                      <td><strong>${task.titulo}</strong></td>
                      <td>${task.descricao}</td>
                      <td class="status-${task.status}">${task.status}</td>
                      <td>${task.observacoes}</td>
                    </tr>
                  `).join('')}
                </tbody>
              </table>
            </div>
          `).join('')}
          
          <div class="footer">
            <p>Relatório gerado em ${new Date().toLocaleDateString('pt-BR')} às ${new Date().toLocaleTimeString('pt-BR')}</p>
            <p>Total de alunos: ${printData.length} | Total de tarefas: ${printData.reduce((acc, student) => acc + student.tarefas.length, 0)}</p>
          </div>
        </body>
        </html>
      `;
      
      printWindow.document.write(htmlContent);
      printWindow.document.close();
      
      // Aguardar o carregamento e imprimir com timeout para garantir que o conteúdo seja carregado
      setTimeout(() => {
        printWindow.focus(); // Focar na janela antes de imprimir
        
        // Tentar imprimir automaticamente
        try {
          printWindow.print();
        } catch (error) {
          console.warn('Erro ao imprimir automaticamente:', error);
        }
        
        // Não fechar automaticamente - deixar o usuário controlar
        // A janela permanecerá aberta para o usuário visualizar e imprimir manualmente se necessário
      }, 800);
    }
  };

  if (!isOpen) return null;

  const totalTasks = studentsWithTasks.reduce((acc, item) => acc + item.tasks.length, 0);
  const selectedTasks = studentsWithTasks
    .filter(item => item.selected)
    .reduce((acc, item) => acc + item.tasks.length, 0);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-2xl shadow-xl max-w-4xl w-full mx-4 max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Printer className="h-6 w-6 text-blue-600" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900">Imprimir Tarefas do Mês</h2>
              <p className="text-gray-600">
                {currentMonth.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' })}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="h-5 w-5 text-gray-500" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-140px)]">
          {/* Resumo */}
          <div className="bg-blue-50 rounded-xl p-4 mb-6">
            <div className="flex items-center gap-2 mb-2">
              <Calendar className="h-5 w-5 text-blue-600" />
              <span className="font-medium text-blue-900">Resumo do Mês</span>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
              <div>
                <span className="text-blue-700">Alunos com tarefas:</span>
                <span className="block font-semibold text-blue-900">{studentsWithTasks.length}</span>
              </div>
              <div>
                <span className="text-blue-700">Total de tarefas:</span>
                <span className="block font-semibold text-blue-900">{totalTasks}</span>
              </div>
              <div>
                <span className="text-blue-700">Selecionados:</span>
                <span className="block font-semibold text-blue-900">
                  {studentsWithTasks.filter(s => s.selected).length}
                </span>
              </div>
              <div>
                <span className="text-blue-700">Tarefas selecionadas:</span>
                <span className="block font-semibold text-blue-900">{selectedTasks}</span>
              </div>
            </div>
          </div>

          {/* Seleção de alunos */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900">Selecionar Alunos</h3>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={selectAll}
                  onChange={(e) => handleSelectAll(e.target.checked)}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <span className="text-sm font-medium text-gray-700">Selecionar Todos</span>
              </label>
            </div>

            <div className="space-y-3">
              {studentsWithTasks.map((item) => (
                <div key={item.student.id} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <label className="flex items-center gap-3 cursor-pointer flex-1">
                        <input
                          type="checkbox"
                          checked={item.selected}
                          onChange={(e) => handleSelectStudent(item.student.id, e.target.checked)}
                          className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                        />
                        <div className="flex items-center gap-2">
                          <User className="h-5 w-5 text-gray-500" />
                          <div>
                            <div className="font-medium text-gray-900">{item.student.nome}</div>
                            <div className="text-sm text-gray-500">
                              {item.tasks.length} tarefa{item.tasks.length !== 1 ? 's' : ''} no mês
                            </div>
                          </div>
                        </div>
                      </label>
                    </div>
                    
                    {item.selected && (
                      <div className="flex items-center gap-2 text-green-600">
                        <Check className="h-4 w-4" />
                        <span className="text-sm font-medium">Selecionado</span>
                      </div>
                    )}
                  </div>
                  
                  {/* Preview das tarefas */}
                  {item.selected && item.tasks.length > 0 && (
                    <div className="mt-3 pl-8">
                      <div className="text-xs text-gray-500 mb-2">Tarefas incluídas:</div>
                      <div className="space-y-1">
                        {item.tasks.slice(0, 3).map((task, index) => (
                          <div key={index} className="text-sm text-gray-700 flex items-center gap-2">
                            <span className="w-2 h-2 bg-purple-400 rounded-full"></span>
                            <span className="truncate">{task.title}</span>
                            <span className="text-xs text-gray-500">
                              ({new Date(task.date).toLocaleDateString('pt-BR')})
                            </span>
                          </div>
                        ))}
                        {item.tasks.length > 3 && (
                          <div className="text-xs text-gray-500">
                            +{item.tasks.length - 3} mais tarefas...
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 p-6 border-t border-gray-200 bg-gray-50">
          <button
            onClick={onClose}
            className="btn btn-outline"
          >
            Cancelar
          </button>
          <button
            onClick={handlePrint}
            disabled={studentsWithTasks.filter(s => s.selected).length === 0}
            className="btn btn-primary flex items-center gap-2"
          >
            <Printer className="h-4 w-4" />
            Imprimir Tarefas Selecionadas
          </button>
        </div>
      </div>
    </div>
  );
};
