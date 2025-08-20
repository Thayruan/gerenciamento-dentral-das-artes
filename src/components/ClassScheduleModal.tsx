import React, { useState, useEffect } from 'react';
import { 
  X, 
  Save, 
  Plus,
  Trash2,
  Clock,
  BookOpen,
  Calendar,
  User
} from 'lucide-react';
import { Student, ClassSchedule } from '../types';

interface ClassScheduleModalProps {
  student: Student | null;
  classSchedule: ClassSchedule | null;
  onClose: () => void;
  onSave: (scheduleData: Omit<ClassSchedule, 'id' | 'createdAt'> | Omit<ClassSchedule, 'id' | 'createdAt'>[]) => Promise<boolean>;
  isOpen: boolean;
}

const ClassScheduleModal: React.FC<ClassScheduleModalProps> = ({
  student,
  classSchedule,
  onClose,
  onSave,
  isOpen
}) => {
  const [schedules, setSchedules] = useState<Array<{
    dayOfWeek: number;
    time: string;
    duration: number;
    subject: string;
    isActive: boolean;
  }>>([]);

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);

  // Preencher dados iniciais se houver um cronograma sendo editado
  useEffect(() => {
    if (classSchedule) {
      setSchedules([{
        dayOfWeek: classSchedule.dayOfWeek,
        time: classSchedule.time,
        duration: classSchedule.duration,
        subject: classSchedule.subject,
        isActive: classSchedule.isActive
      }]);
    } else if (student && student.classSchedule && student.classSchedule.length > 0) {
      // Preencher com o cronograma existente do aluno
      setSchedules(student.classSchedule.map(sch => ({
        dayOfWeek: sch.dayOfWeek,
        time: sch.time,
        duration: sch.duration,
        subject: sch.subject,
        isActive: sch.isActive
      })));
    } else {
      // Cronograma vazio
      setSchedules([]);
    }
  }, [classSchedule, student]);

  const addSchedule = () => {
    setSchedules(prev => [...prev, {
      dayOfWeek: 1, // Segunda-feira por padrão
      time: '14:00',
      duration: 60,
      subject: 'Desenho',
      isActive: true
    }]);
  };

  const removeSchedule = (index: number) => {
    setSchedules(prev => prev.filter((_, i) => i !== index));
  };

  const updateSchedule = (index: number, field: string, value: string | number | boolean) => {
    setSchedules(prev => prev.map((schedule, i) => 
      i === index ? { ...schedule, [field]: value } : schedule
    ));
  };

  const validateSchedules = () => {
    const newErrors: Record<string, string> = {};

    if (schedules.length === 0) {
      newErrors.general = 'Adicione pelo menos um horário de aula';
    }

    schedules.forEach((schedule, index) => {
      if (!schedule.time) {
        newErrors[`time_${index}`] = 'Horário é obrigatório';
      }
      if (!schedule.subject) {
        newErrors[`subject_${index}`] = 'Disciplina é obrigatória';
      }
      if (schedule.duration < 15 || schedule.duration > 240) {
        newErrors[`duration_${index}`] = 'Duração deve ser entre 15 e 240 minutos';
      }
    });

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateSchedules() || !student) return;

    setLoading(true);
    try {
      // Se estamos editando um cronograma específico, atualizar apenas ele
      if (classSchedule) {
        const scheduleData = {
          studentId: student.id,
          dayOfWeek: schedules[0].dayOfWeek,
          time: schedules[0].time,
          duration: schedules[0].duration,
          subject: schedules[0].subject,
          isActive: schedules[0].isActive
        };

        const success = await onSave(scheduleData);
        if (success) {
          onClose();
        }
              } else {
          // Se estamos configurando o cronograma completo do aluno, salvar todos
          const schedulesWithStudentId = schedules.map(schedule => ({
            ...schedule,
            studentId: student.id
          }));
          const success = await onSave(schedulesWithStudentId);
          if (success) {
            onClose();
          }
        }
    } catch (error) {
      console.error('Erro ao salvar cronograma:', error);
    } finally {
      setLoading(false);
    }
  };

  const dayNames = [
    'Domingo', 'Segunda-feira', 'Terça-feira', 'Quarta-feira', 
    'Quinta-feira', 'Sexta-feira', 'Sábado'
  ];

  if (!isOpen) return null;

  return (
    <div className="modal-overlay">
      <div className="absolute inset-0 bg-black/50" onClick={onClose}></div>
      <div className="modal-content max-w-4xl">
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-gray-900">
              {classSchedule ? 'Editar Horário de Aula' : 'Configurar Dias de Aula'}
            </h2>
            <button 
              onClick={onClose}
              className="btn btn-ghost btn-sm icon-hover"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Informações do Aluno */}
            {student && (
              <div className="bg-blue-50 rounded-lg p-4">
                <div className="flex items-center gap-3">
                  <div className="h-12 w-12 rounded-full bg-blue-100 flex items-center justify-center">
                    <span className="text-lg font-medium text-blue-600">
                      {student.nome.split(' ').map(n => n[0]).join('').slice(0, 2)}
                    </span>
                  </div>
                  <div>
                    <div className="text-lg font-medium text-gray-900">{student.nome}</div>
                    <div className="text-sm text-gray-600">{student.email} • {student.cidade}</div>
                  </div>
                </div>
              </div>
            )}

            {/* Lista de Horários */}
            <div>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-medium text-gray-900">Horários de Aula</h3>
                {!classSchedule && (
                  <button
                    type="button"
                    onClick={addSchedule}
                    className="btn btn-outline btn-sm"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Adicionar Horário
                  </button>
                )}
              </div>

              {errors.general && (
                <div className="text-red-500 text-sm mb-4 p-3 bg-red-50 rounded-lg border border-red-200">
                  {errors.general}
                </div>
              )}

              <div className="space-y-4">
                {schedules.map((schedule, index) => (
                  <div key={index} className="border rounded-lg p-4 bg-gray-50">
                    <div className="flex items-center justify-between mb-3">
                      <h4 className="font-medium text-gray-900">
                        Horário {index + 1}
                      </h4>
                      {!classSchedule && schedules.length > 1 && (
                        <button
                          type="button"
                          onClick={() => removeSchedule(index)}
                          className="btn btn-ghost btn-sm text-red-600 hover:text-red-700"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      )}
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                      {/* Dia da Semana */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          <Calendar className="h-4 w-4 inline mr-2" />
                          Dia da Semana
                        </label>
                        <select
                          value={schedule.dayOfWeek}
                          onChange={(e) => updateSchedule(index, 'dayOfWeek', parseInt(e.target.value))}
                          className="input w-full"
                        >
                          {dayNames.map((day, dayIndex) => (
                            <option key={dayIndex} value={dayIndex}>
                              {day}
                            </option>
                          ))}
                        </select>
                      </div>

                      {/* Horário */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          <Clock className="h-4 w-4 inline mr-2" />
                          Horário
                        </label>
                        <input
                          type="time"
                          value={schedule.time}
                          onChange={(e) => updateSchedule(index, 'time', e.target.value)}
                          className={`input w-full ${errors[`time_${index}`] ? 'border-red-500' : ''}`}
                        />
                        {errors[`time_${index}`] && (
                          <div className="text-red-500 text-sm mt-1">{errors[`time_${index}`]}</div>
                        )}
                      </div>

                      {/* Duração */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          <Clock className="h-4 w-4 inline mr-2" />
                          Duração (min)
                        </label>
                        <input
                          type="number"
                          min="15"
                          max="240"
                          value={schedule.duration}
                          onChange={(e) => updateSchedule(index, 'duration', parseInt(e.target.value))}
                          className={`input w-full ${errors[`duration_${index}`] ? 'border-red-500' : ''}`}
                        />
                        {errors[`duration_${index}`] && (
                          <div className="text-red-500 text-sm mt-1">{errors[`duration_${index}`]}</div>
                        )}
                      </div>

                      {/* Disciplina */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          <BookOpen className="h-4 w-4 inline mr-2" />
                          Disciplina
                        </label>
                        <select
                          value={schedule.subject}
                          onChange={(e) => updateSchedule(index, 'subject', e.target.value)}
                          className={`input w-full ${errors[`subject_${index}`] ? 'border-red-500' : ''}`}
                        >
                          <option value="">Selecione</option>
                          <option value="Desenho">Desenho</option>
                          <option value="Pintura">Pintura</option>
                          <option value="Arte Digital">Arte Digital</option>
                          <option value="Escultura">Escultura</option>
                          <option value="História da Arte">História da Arte</option>
                          <option value="Teoria da Cor">Teoria da Cor</option>
                          <option value="Composição">Composição</option>
                        </select>
                        {errors[`subject_${index}`] && (
                          <div className="text-red-500 text-sm mt-1">{errors[`subject_${index}`]}</div>
                        )}
                      </div>
                    </div>

                    {/* Ativo/Inativo */}
                    <div className="mt-4">
                      <label className="flex items-center">
                        <input
                          type="checkbox"
                          checked={schedule.isActive}
                          onChange={(e) => updateSchedule(index, 'isActive', e.target.checked)}
                          className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                        />
                        <span className="ml-2 text-sm text-gray-700">Horário ativo</span>
                      </label>
                    </div>
                  </div>
                ))}
              </div>

              {schedules.length === 0 && (
                <div className="text-center py-8 text-gray-500">
                  <Calendar className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                  <div className="text-lg font-medium mb-2">Nenhum horário configurado</div>
                  <div className="text-sm">Clique em "Adicionar Horário" para começar</div>
                </div>
              )}
            </div>

            {/* Botões */}
            <div className="flex justify-end gap-3 pt-4 border-t">
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
                    {classSchedule ? 'Atualizar Horário' : 'Salvar Cronograma'}
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ClassScheduleModal;
