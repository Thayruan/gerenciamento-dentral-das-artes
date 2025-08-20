import React from 'react';
import { X, Edit3, Calendar, User, Image, Clock } from 'lucide-react';
import { Student, Task } from '../types';

interface TaskViewModalProps {
  student: Student | null;
  task: Task | null;
  isOpen: boolean;
  onClose: () => void;
  onEdit: () => void;
  taskData?: any; // Dados da IA incluindo imagens de referência
}

const TaskViewModal: React.FC<TaskViewModalProps> = ({
  student,
  task,
  isOpen,
  onClose,
  onEdit,
  taskData
}) => {
  if (!isOpen || !task || !student) return null;

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pendente': return 'bg-yellow-100 text-yellow-800 border-yellow-300';
      case 'em_andamento': return 'bg-blue-100 text-blue-800 border-blue-300';
      case 'concluida': return 'bg-green-100 text-green-800 border-green-300';
      case 'atrasada': return 'bg-red-100 text-red-800 border-red-300';
      default: return 'bg-gray-100 text-gray-800 border-gray-300';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'pendente': return 'Pendente';
      case 'em_andamento': return 'Em Andamento';
      case 'concluida': return 'Concluída';
      case 'atrasada': return 'Atrasada';
      default: return status;
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('pt-BR', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  return (
    <div className="fixed top-0 left-0 right-0 bottom-0 z-50 bg-black/50" style={{ margin: 0, padding: 0 }}>
      <div className="absolute inset-0" onClick={onClose}></div>
      <div className="absolute right-0 top-0 w-[540px] h-screen bg-white shadow-xl flex flex-col" style={{ margin: 0, padding: 0 }}>
        {/* Header fixo */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200 bg-gradient-to-r from-purple-50 to-blue-50">
          <h2 className="text-xl font-semibold text-gray-900 flex items-center gap-2">
            <Calendar className="h-5 w-5 text-purple-600" />
            Visualizar Tarefa
          </h2>
          <div className="flex items-center gap-2">
            <button 
              onClick={onEdit}
              className="btn btn-primary btn-sm"
            >
              <Edit3 className="h-4 w-4 mr-2" />
              Editar
            </button>
            <button 
              onClick={onClose}
              className="btn btn-ghost btn-sm icon-hover"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Conteúdo com scroll */}
        <div className="flex-1 overflow-y-auto p-6">
          {/* Informações do Aluno */}
          <div className="bg-gradient-to-r from-purple-50 to-blue-50 rounded-lg p-4 mb-6">
            <div className="flex items-center gap-3">
              <div className="h-12 w-12 rounded-full bg-purple-100 flex items-center justify-center">
                <span className="text-lg font-medium text-purple-600">
                  {student.nome.split(' ').map(n => n[0]).join('').slice(0, 2)}
                </span>
              </div>
              <div>
                <div className="text-lg font-medium text-gray-900">{student.nome}</div>
                <div className="text-sm text-gray-600 flex items-center gap-4">
                  <span>{student.email}</span>
                  <span>•</span>
                  <span>{student.cidade}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Título da Tarefa */}
          <div className="mb-6">
            <h3 className="text-2xl font-bold text-gray-900 mb-2">{task.title}</h3>
            <div className="flex items-center gap-4 text-sm text-gray-600">
              <div className="flex items-center gap-1">
                <Calendar className="h-4 w-4" />
                <span>{formatDate(task.date)}</span>
              </div>
              <div className={`inline-flex items-center px-3 py-1 rounded-full text-sm border ${getStatusColor(task.status)}`}>
                {getStatusText(task.status)}
              </div>
            </div>
          </div>

          {/* Descrição */}
          <div className="mb-6">
            <h4 className="text-lg font-semibold text-gray-900 mb-3">Descrição da Tarefa</h4>
            <div 
              className="task-description-viewer bg-gray-50 rounded-lg p-4 border"
              dangerouslySetInnerHTML={{ __html: task.description }}
              onClick={(e) => {
                // Processar cliques em links para abrir em nova aba
                const target = e.target as HTMLElement;
                if (target.tagName === 'A') {
                  e.preventDefault();
                  const href = target.getAttribute('href');
                  if (href) {
                    window.open(href, '_blank', 'noopener,noreferrer');
                  }
                }
              }}
              style={{
                fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
                fontSize: '14px',
                lineHeight: '1.5'
              }}
            />
          </div>

          {/* Imagens de Referência */}
          {(task.artImage || (taskData?.referenceImages && taskData.referenceImages.length > 0)) && (
            <div className="mb-6">
              <h4 className="text-lg font-semibold text-gray-900 mb-3 flex items-center gap-2">
                <Image className="h-5 w-5" />
                Imagens de Referência
              </h4>
              
              {/* Imagem principal da tarefa */}
              {task.artImage && (
                <div className="mb-4">
                  <p className="text-sm text-gray-600 mb-2">Imagem principal:</p>
                  <div className="border rounded-lg overflow-hidden">
                    <img 
                      src={task.artImage} 
                      alt="Referência da arte" 
                      className="w-full max-h-80 object-contain bg-gray-100"
                    />
                  </div>
                </div>
              )}
              
              {/* Imagens geradas pela IA */}
              {taskData?.referenceImages && taskData.referenceImages.length > 0 && (
                <div>
                  <p className="text-sm text-gray-600 mb-2">Referências geradas pela IA:</p>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                                         {taskData.referenceImages.map((image: string, index: number) => (
                      <div key={index} className="relative group">
                        <img
                          src={image}
                          alt={`Referência ${index + 1}`}
                          className="w-full h-24 object-cover rounded-lg border cursor-pointer hover:opacity-80 transition-opacity"
                          onClick={() => window.open(image, '_blank')}
                        />
                        <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-all duration-200 rounded-lg flex items-center justify-center">
                          <span className="text-white opacity-0 group-hover:opacity-100 text-xs font-medium">
                            Clique para ampliar
                          </span>
                        </div>
                        <div className="absolute top-1 right-1 bg-purple-600 text-white text-xs px-2 py-1 rounded-full">
                          {index + 1}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}



          {/* Informações Adicionais */}
          <div className="bg-gray-50 rounded-lg p-4">
            <h4 className="text-lg font-semibold text-gray-900 mb-3">Informações da Tarefa</h4>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="font-medium text-gray-700">Criada em:</span>
                <p className="text-gray-600 mt-1">
                  {new Date(task.createdAt).toLocaleDateString('pt-BR')}
                </p>
              </div>
              <div>
                <span className="font-medium text-gray-700">Última atualização:</span>
                <p className="text-gray-600 mt-1">
                  {new Date(task.updatedAt).toLocaleDateString('pt-BR')}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Footer fixo */}
        <div className="border-t border-gray-200 bg-gray-50 p-4">
          <div className="flex justify-between items-center">
            <div className="text-sm text-gray-600">
              <Clock className="h-4 w-4 inline mr-1" />
              Tarefa para {formatDate(task.date)}
            </div>
            <div className="flex gap-3">
              <button
                onClick={onClose}
                className="btn btn-outline"
              >
                Fechar
              </button>
              <button
                onClick={onEdit}
                className="btn btn-primary"
              >
                <Edit3 className="h-4 w-4 mr-2" />
                Editar Tarefa
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TaskViewModal;
