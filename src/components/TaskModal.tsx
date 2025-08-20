import React, { useState, useEffect } from 'react';
import { 
  X, 
  Save, 
  Image, 
  Upload, 
  Eye, 
  Trash2,
  Calendar,
  Clock,
  User,
  BookOpen,
  AlertTriangle,
  Sparkles,
  Wand2
} from 'lucide-react';
import { Student, Task } from '../types';
import { createGeminiService } from '../services/geminiService';
import RichTextEditor from './RichTextEditor';

interface TaskModalProps {
  student: Student | null;
  task: Task | null;
  selectedDate?: string | null;
  allStudents?: Student[];
  onClose: () => void;
  onSave: (taskData: Omit<Task, 'id' | 'createdAt' | 'updatedAt'>, studentId: string) => Promise<boolean>;
  isOpen: boolean;
}

const TaskModal: React.FC<TaskModalProps> = ({
  student,
  task,
  selectedDate,
  allStudents = [],
  onClose,
  onSave,
  isOpen
}) => {
  const [formData, setFormData] = useState({
    date: selectedDate || new Date().toISOString().split('T')[0],
    title: '',
    description: '',
    status: 'pendente' as 'pendente' | 'em_andamento' | 'concluida' | 'atrasada',
    artImage: null as File | null
  });

  const [selectedStudentId, setSelectedStudentId] = useState<string>(student?.id || '');

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [aiGenerating, setAiGenerating] = useState(false);
  const [taskData, setTaskData] = useState<any>(null);

  // Preencher dados iniciais se houver uma tarefa sendo editada
  useEffect(() => {
    if (task) {
      setFormData({
        date: task.date,
        title: task.title,
        description: task.description,
        status: task.status,
        artImage: null
      });
      setSelectedStudentId(task.studentId);
      
      if (task.artImage) {
        setImagePreview(task.artImage);
      }
    } else {
      // Se não há tarefa sendo editada, usar dados padrão
      setFormData(prev => ({
        ...prev,
        date: selectedDate || new Date().toISOString().split('T')[0]
      }));
      setSelectedStudentId(student?.id || '');
    }
  }, [task, student, selectedDate]);

  const handleInputChange = (field: string, value: string | number) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) { // 5MB limit
        setErrors(prev => ({ ...prev, artImage: 'Imagem deve ter menos de 5MB' }));
        return;
      }

      setFormData(prev => ({ ...prev, artImage: file }));
      setErrors(prev => ({ ...prev, artImage: '' }));

      // Criar preview
      const reader = new FileReader();
      reader.onload = (e) => {
        setImagePreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const removeImage = () => {
    setFormData(prev => ({ ...prev, artImage: null }));
    setImagePreview(null);
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!selectedStudentId) newErrors.student = 'Selecione um aluno';
    if (!formData.date) newErrors.date = 'Data é obrigatória';
    if (!formData.title) newErrors.title = 'Título é obrigatório';
    if (!formData.description) newErrors.description = 'Descrição é obrigatória';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    setLoading(true);
    try {
      let artImageBase64 = '';
      
      if (formData.artImage) {
        artImageBase64 = await fileToBase64(formData.artImage);
      } else if (imagePreview && !formData.artImage) {
        // Se há preview mas não há arquivo novo, usar o preview existente
        artImageBase64 = imagePreview;
      }

      const taskData = {
        studentId: selectedStudentId,
        date: formData.date,
        title: formData.title,
        description: formData.description,
        status: formData.status,
        artImage: artImageBase64 || undefined
      };

      const success = await onSave(taskData, selectedStudentId);
      if (success) {
        onClose();
      }
    } catch (error) {
      console.error('Erro ao salvar tarefa:', error);
    } finally {
      setLoading(false);
    }
  };

  const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = error => reject(error);
    });
  };

  const generateWithAI = async () => {
    if (!formData.title.trim()) {
      alert('Por favor, insira um título para a tarefa antes de usar a IA');
      return;
    }

    setAiGenerating(true);
    try {
      const geminiService = createGeminiService('AIzaSyDesCM6jbbNy9N8yqq4c1SyXDrM8GeLcl8');
      
      const selectedStudent = allStudents.find(s => s.id === selectedStudentId) || student;
      const studentInfo = selectedStudent ? `${selectedStudent.nome} - ${selectedStudent.email}` : '';
      
      const aiData = await geminiService.generateTaskData({
        title: formData.title,
        imageBase64: imagePreview || undefined,
        studentInfo
      });

      // Aplicar os dados gerados pela IA
      setFormData(prev => ({
        ...prev,
        description: aiData.description
      }));
      setTaskData(aiData);

      // Se a IA gerou imagens de referência, aplicá-las
      if (aiData.referenceImages && aiData.referenceImages.length > 0) {
        setImagePreview(aiData.referenceImages[0]); // Usar a primeira imagem como preview
        setFormData(prev => ({ ...prev, artImage: null })); // Limpar arquivo selecionado
      }

      // Limpar erros relacionados aos campos preenchidos
      setErrors(prev => ({
        ...prev,
        description: ''
      }));

      const message = aiData.referenceImages && aiData.referenceImages.length > 0
        ? `Dados e ${aiData.referenceImages.length} imagens de referência gerados com sucesso pela IA! 🎨`
        : 'Dados gerados com sucesso pela IA!';
      alert(message);
    } catch (error) {
      console.error('Erro ao gerar dados com IA:', error);
      alert('Erro ao gerar dados com IA. Verifique sua conexão e tente novamente.');
    } finally {
      setAiGenerating(false);
    }
  };

  const generateDescriptionOnly = async () => {
    if (!formData.title.trim()) {
      alert('Por favor, insira um título para a tarefa antes de usar a IA');
      return;
    }

    setAiGenerating(true);
    try {
      const geminiService = createGeminiService('AIzaSyDesCM6jbbNy9N8yqq4c1SyXDrM8GeLcl8');
      const selectedStudent = allStudents.find(s => s.id === selectedStudentId) || student;
      const studentInfo = selectedStudent ? `${selectedStudent.nome} - ${selectedStudent.email}` : '';
      
      const aiData = await geminiService.generateTaskData({
        title: formData.title,
        imageBase64: imagePreview || undefined,
        studentInfo
      });

      // Aplicar apenas a descrição gerada pela IA
      setFormData(prev => ({
        ...prev,
        description: aiData.description
      }));

      // Limpar erros relacionados ao campo de descrição
      setErrors(prev => ({
        ...prev,
        description: ''
      }));

      alert('Descrição regenerada com sucesso pela IA! ✨');
    } catch (error) {
      console.error('Erro ao regenerar descrição com IA:', error);
      alert('Erro ao regenerar descrição com IA. Verifique sua conexão e tente novamente.');
    } finally {
      setAiGenerating(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed top-0 left-0 right-0 bottom-0 z-50 bg-black/50" style={{ margin: 0, padding: 0 }}>
      <div className="absolute inset-0" onClick={onClose}></div>
      <div className="absolute right-0 top-0 w-[540px] h-screen bg-white shadow-xl flex flex-col" style={{ margin: 0, padding: 0 }}>
        {/* Header fixo */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">
            {task ? 'Editar Tarefa' : 'Nova Tarefa'}
          </h2>
          <button 
            onClick={onClose}
            className="btn btn-ghost btn-sm icon-hover"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Conteúdo com scroll */}
        <div className="flex-1 overflow-y-auto p-4">
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Seleção de Aluno */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                <User className="h-4 w-4 inline mr-2" />
                Aluno
              </label>
              <select
                value={selectedStudentId}
                onChange={(e) => {
                  setSelectedStudentId(e.target.value);
                  if (errors.student) setErrors(prev => ({ ...prev, student: '' }));
                }}
                className={`input w-full ${errors.student ? 'border-red-500' : ''}`}
                disabled={!!task} // Desabilitar se estiver editando uma tarefa existente
              >
                <option value="">Selecione um aluno</option>
                {allStudents.map(s => (
                  <option key={s.id} value={s.id}>
                    {s.nome} - {s.email}
                  </option>
                ))}
              </select>
              {errors.student && <div className="text-red-500 text-sm mt-1">{errors.student}</div>}
            </div>

            {/* Informações do Aluno Selecionado */}
            {selectedStudentId && (() => {
              const selectedStudent = allStudents.find(s => s.id === selectedStudentId) || student;
              return selectedStudent ? (
                <div className="bg-gray-50 rounded-lg p-4">
                  <div className="flex items-center gap-3">
                    <div className="h-12 w-12 rounded-full bg-purple-100 flex items-center justify-center">
                      <span className="text-lg font-medium text-purple-600">
                        {selectedStudent.nome.split(' ').map(n => n[0]).join('').slice(0, 2)}
                      </span>
                    </div>
                    <div>
                      <div className="text-lg font-medium text-gray-900">{selectedStudent.nome}</div>
                      <div className="text-sm text-gray-600">{selectedStudent.email} • {selectedStudent.cidade}</div>
                    </div>
                  </div>
                </div>
              ) : null;
            })()}

            {/* Grid de Campos */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Data e Título */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  <Calendar className="h-4 w-4 inline mr-2" />
                  Data da Tarefa
                </label>
                <input
                  type="date"
                  value={formData.date}
                  onChange={(e) => handleInputChange('date', e.target.value)}
                  className={`input w-full ${errors.date ? 'border-red-500' : ''}`}
                />
                {errors.date && <div className="text-red-500 text-sm mt-1">{errors.date}</div>}
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-sm font-medium text-gray-700">
                    <BookOpen className="h-4 w-4 inline mr-2" />
                    Título da Tarefa
                  </label>
                  <button
                    type="button"
                    onClick={generateWithAI}
                    disabled={aiGenerating || !formData.title.trim()}
                    className="btn btn-outline btn-sm text-purple-600 hover:text-purple-700 border-purple-300 hover:border-purple-400"
                  >
                    {aiGenerating ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-purple-600 mr-2"></div>
                        Gerando...
                      </>
                    ) : (
                      <>
                        <Sparkles className="h-4 w-4 mr-2" />
                        Gerar com IA
                      </>
                    )}
                  </button>
                </div>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => handleInputChange('title', e.target.value)}
                  className={`input w-full ${errors.title ? 'border-red-500' : ''}`}
                  placeholder="Ex: Desenho de paisagem com lápis"
                />
                {errors.title && <div className="text-red-500 text-sm mt-1">{errors.title}</div>}
                <div className="text-xs text-gray-500 mt-1">
                  💡 <strong>Dica:</strong> Digite o título da tarefa e clique em "Gerar com IA" para criar automaticamente a descrição!
                </div>
              </div>

            </div>

            {/* Descrição */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-sm font-medium text-gray-700">
                  Descrição da Tarefa
                  {formData.description && formData.description.length > 50 && (
                    <span className="ml-2 inline-flex items-center px-2 py-1 rounded-full text-xs bg-purple-800 text-white">
                      <Sparkles className="h-3 w-3 mr-1" />
                      IA
                    </span>
                  )}
                </label>
                <button
                  type="button"
                  onClick={() => generateDescriptionOnly()}
                  disabled={aiGenerating || !formData.title.trim()}
                  className="btn btn-outline btn-sm text-blue-600 hover:text-blue-700 border-blue-300 hover:border-blue-400"
                >
                  {aiGenerating ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600 mr-2"></div>
                      Regenerando...
                    </>
                  ) : (
                    <>
                      <Wand2 className="h-4 w-4 mr-2" />
                      Regenerar Descrição
                    </>
                  )}
                </button>
              </div>
              <RichTextEditor
                value={formData.description}
                onChange={(value) => handleInputChange('description', value)}
                placeholder="Descreva detalhadamente o que o aluno deve fazer... Use a barra de ferramentas para formatação!"
                className={errors.description ? 'border-red-500' : ''}
              />
              {errors.description && <div className="text-red-500 text-sm mt-1">{errors.description}</div>}
            </div>

            {/* Status */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Status da Tarefa
              </label>
              <select
                value={formData.status}
                onChange={(e) => handleInputChange('status', e.target.value)}
                className="input w-full mb-1"
              >
                <option value="pendente">Pendente</option>
                <option value="em_andamento">Em Andamento</option>
                <option value="concluida">Concluída</option>
                <option value="atrasada">Atrasada</option>
              </select>
              
              {/* Botões de ação rápida para status */}
              <div className="flex gap-1 flex-wrap">
                <button
                  type="button"
                  onClick={() => handleInputChange('status', 'pendente')}
                  className={`px-2 py-1 text-xs rounded border transition-colors ${
                    formData.status === 'pendente' 
                      ? 'bg-yellow-100 border-yellow-300 text-yellow-800' 
                      : 'bg-gray-50 border-gray-200 text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  Pendente
                </button>
                <button
                  type="button"
                  onClick={() => handleInputChange('status', 'em_andamento')}
                  className={`px-2 py-1 text-xs rounded border transition-colors ${
                    formData.status === 'em_andamento' 
                      ? 'bg-blue-100 border-blue-300 text-blue-800' 
                      : 'bg-gray-50 border-gray-200 text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  Em Andamento
                </button>
                <button
                  type="button"
                  onClick={() => handleInputChange('status', 'concluida')}
                  className={`px-2 py-1 text-xs rounded border transition-colors ${
                    formData.status === 'concluida' 
                      ? 'bg-green-100 border-green-300 text-green-800' 
                      : 'bg-gray-50 border-gray-200 text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  Concluída
                </button>
              </div>
            </div>

            {/* Upload de Imagem */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                <Image className="h-4 w-4 inline mr-2" />
                Imagem de Referência da Arte
                {imagePreview && !formData.artImage && (
                  <span className="ml-2 inline-flex items-center px-2 py-1 rounded-full text-xs bg-green-100 text-green-800">
                    <Sparkles className="h-3 w-4 mr-1" />
                    IA
                  </span>
                )}
              </label>
              
              {/* Imagem selecionada pelo usuário */}
              {imagePreview ? (
                <div className="relative mb-4">
                  <img 
                    src={imagePreview} 
                    alt="Preview" 
                    className="w-full max-w-md h-32 object-cover rounded-lg border"
                  />
                  <button
                    type="button"
                    onClick={removeImage}
                    className="absolute top-2 right-2 btn btn-ghost btn-sm bg-red-500 text-white hover:bg-red-600"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              ) : (
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center hover:border-gray-400 transition-colors mb-4">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="hidden"
                    id="art-image-upload"
                  />
                  <label htmlFor="art-image-upload" className="cursor-pointer">
                    <Upload className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                    <div className="text-base font-medium text-gray-900 mb-1">
                      Clique para fazer upload
                    </div>
                    <div className="text-xs text-gray-600">
                      PNG, JPG até 5MB
                    </div>
                  </label>
                </div>
              )}
              
              {/* Imagens de referência geradas pela IA */}
              {taskData && taskData.referenceImages && taskData.referenceImages.length > 0 && (
                <div className="mb-4">
                  <div className="flex items-center gap-2 mb-3">
                    <Sparkles className="h-4 w-4 text-purple-600" />
                    <span className="text-sm font-medium text-gray-700">
                      Imagens de Referência Geradas pela IA
                    </span>
                    <span className="text-xs text-gray-500">
                      ({taskData.referenceImages.length} imagens)
                    </span>
                  </div>
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
                  <p className="text-xs text-gray-500 mt-2">
                    💡 As imagens são geradas automaticamente pela IA e incluem referências da internet para maior variedade.
                  </p>
                </div>
              )}
              
              {errors.artImage && <div className="text-red-500 text-sm mt-1">{errors.artImage}</div>}
            </div>
          </form>
        </div>

        {/* Footer fixo com botões */}
        <div className="border-t border-gray-200 bg-gray-50 p-4">
          <div className="flex justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="btn btn-outline"
              disabled={loading}
            >
              Cancelar
            </button>
            <button
              type="submit"
              onClick={handleSubmit}
              className="btn btn-primary"
              disabled={loading}
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Salvando...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4 mr-2" />
                  {task ? 'Atualizar Tarefa' : 'Criar Tarefa'}
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Overlay de Loading durante Geração de IA */}
      {aiGenerating && (
        <div className="fixed inset-0 z-[60] bg-black/20 backdrop-blur-sm flex items-center justify-center">
          <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-md mx-4 text-center">
            <div className="animate-spin rounded-full h-16 w-16 border-4 border-purple-200 border-t-purple-600 mx-auto mb-6"></div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              IA Gerando Conteúdo
            </h3>
            <p className="text-gray-600 mb-4">
              Estamos criando uma descrição personalizada para sua tarefa...
            </p>
            <div className="flex items-center justify-center gap-2 text-purple-600">
              <Sparkles className="h-5 w-5 animate-pulse" />
              <span className="text-sm font-medium">Processando com Gemini AI</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TaskModal;
