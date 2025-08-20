import React, { useState, useEffect } from 'react';
import { X, Save, UserPlus } from 'lucide-react';
import { Student } from '../types';

interface StudentFormProps {
  student?: Student | null;
  onSave: (student: Omit<Student, 'id'>) => Promise<{ success: boolean; id?: string }>;
  onClose: () => void;
  isOpen: boolean;
}

export const StudentForm: React.FC<StudentFormProps> = ({ 
  student, 
  onSave, 
  onClose, 
  isOpen 
}) => {
  const [formData, setFormData] = useState<Omit<Student, 'id'>>({
    nome: '',
    status: 'ativo',
    mensalidade: 0,
    cidade: '',
    email: '',
    telefone: '',
    nasc: '',
    vencimentoMensalidade: (() => {
      const hoje = new Date();
      const proximoMes = new Date(hoje.getFullYear(), hoje.getMonth() + 1, 5);
      return proximoMes.toISOString().split('T')[0];
    })(),
    payments: [],
    nextPaymentDue: (() => {
      const hoje = new Date();
      const proximoMes = new Date(hoje.getFullYear(), hoje.getMonth() + 1, 5);
      return proximoMes.toISOString().split('T')[0];
    })()
  });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (student) {
      setFormData({
        nome: student.nome,
        status: student.status,
        mensalidade: student.mensalidade,
        cidade: student.cidade,
        email: student.email,
        telefone: student.telefone,
        nasc: student.nasc,
        vencimentoMensalidade: student.vencimentoMensalidade,
        payments: student.payments,
        nextPaymentDue: student.nextPaymentDue
      });
    } else {
      // Definir data padrão de vencimento para novos alunos (dia 5 do próximo mês)
      const hoje = new Date();
      const proximoMes = new Date(hoje.getFullYear(), hoje.getMonth() + 1, 5);
      const vencimentoPadrao = proximoMes.toISOString().split('T')[0];
      
      setFormData({
        nome: '',
        status: 'ativo',
        mensalidade: 0,
        cidade: '',
        email: '',
        telefone: '',
        nasc: '',
        vencimentoMensalidade: vencimentoPadrao,
        payments: [],
        nextPaymentDue: vencimentoPadrao
      });
    }
    setErrors({});
  }, [student]);

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.nome.trim()) {
      newErrors.nome = 'Nome é obrigatório';
    }

    if (!formData.email.trim()) {
      newErrors.email = 'E-mail é obrigatório';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'E-mail inválido';
    }

    if (!formData.telefone.trim()) {
      newErrors.telefone = 'Telefone é obrigatório';
    }

    if (!formData.cidade.trim()) {
      newErrors.cidade = 'Cidade é obrigatória';
    }

    if (formData.mensalidade <= 0) {
      newErrors.mensalidade = 'Mensalidade deve ser maior que zero';
    }

    if (!formData.nasc) {
      newErrors.nasc = 'Data de nascimento é obrigatória';
    }

    if (!formData.vencimentoMensalidade) {
      newErrors.vencimentoMensalidade = 'Data de vencimento da mensalidade é obrigatória';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    setLoading(true);
    try {
      const result = await onSave(formData);
      if (result.success) {
        onClose();
      }
    } catch (error) {
      console.error('Erro ao salvar aluno:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field: keyof Omit<Student, 'id'>, value: string | number) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay">
      <div className="absolute inset-0 bg-black/50" onClick={onClose}></div>
      <div className="modal-content">
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold fade-in-up">
              {student ? 'Editar Aluno' : 'Novo Aluno'}
            </h2>
            <button className="btn btn-ghost icon-hover" onClick={onClose}>
              <X className="h-5 w-5" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Nome Completo *
                </label>
                <input
                  type="text"
                  className={`input ${errors.nome !== '' ? 'border-red-500' : ''}`}
                  value={formData.nome}
                  onChange={(e) => handleInputChange('nome', e.target.value)}
                  placeholder="Digite o nome completo"
                />
                {errors.nome !== '' && (
                  <p className="text-red-500 text-xs mt-1">{errors.nome}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Status *
                </label>
                <select
                  className="input"
                  value={formData.status}
                  onChange={(e) => handleInputChange('status', e.target.value)}
                >
                  <option value="ativo">Ativo</option>
                  <option value="pendente">Pendente</option>
                  <option value="trancado">Trancado</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Mensalidade (R$) *
                </label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  className={`input ${errors.mensalidade !== '' ? 'border-red-500' : ''}`}
                  value={formData.mensalidade}
                  onChange={(e) => handleInputChange('mensalidade', parseFloat(e.target.value) || 0)}
                  placeholder="0.00"
                />
                {errors.mensalidade !== '' && (
                  <p className="text-red-500 text-xs mt-1">{errors.mensalidade}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Data de Nascimento *
                </label>
                <input
                  type="date"
                  className={`input ${errors.nasc !== '' ? 'border-red-500' : ''}`}
                  value={formData.nasc}
                  onChange={(e) => handleInputChange('nasc', e.target.value)}
                />
                {errors.nasc !== '' && (
                  <p className="text-red-500 text-xs mt-1">{errors.nasc}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Vencimento da Mensalidade *
                </label>
                <input
                  type="date"
                  className={`input ${errors.vencimentoMensalidade ? 'border-red-500' : ''}`}
                  value={formData.vencimentoMensalidade}
                  onChange={(e) => handleInputChange('vencimentoMensalidade', e.target.value)}
                />
                {errors.vencimentoMensalidade && (
                  <p className="text-red-500 text-xs mt-1">{errors.vencimentoMensalidade}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Cidade *
                </label>
                <input
                  type="text"
                  className={`input ${errors.cidade ? 'border-red-500' : ''}`}
                  value={formData.cidade}
                  onChange={(e) => handleInputChange('cidade', e.target.value)}
                  placeholder="Digite a cidade"
                />
                {errors.cidade && (
                  <p className="text-red-500 text-xs mt-1">{errors.cidade}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Telefone *
                </label>
                <input
                  type="tel"
                  className={`input ${errors.telefone ? 'border-red-500' : ''}`}
                  value={formData.telefone}
                  onChange={(e) => handleInputChange('telefone', e.target.value)}
                  placeholder="+55 33 99999-9999"
                />
                {errors.telefone && (
                  <p className="text-red-500 text-xs mt-1">{errors.telefone}</p>
                )}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                E-mail *
              </label>
              <input
                type="email"
                className={`input ${errors.email ? 'border-red-500' : ''}`}
                value={formData.email}
                onChange={(e) => handleInputChange('email', e.target.value)}
                placeholder="exemplo@email.com"
              />
              {errors.email && (
                <p className="text-red-500 text-xs mt-1">{errors.email}</p>
              )}
            </div>

            <div className="flex gap-3 pt-4">
              <button
                type="submit"
                className="btn btn-primary flex-1"
                disabled={loading}
              >
                {loading ? (
                  <div className="loading-spinner h-4 w-4 border-2 border-white border-t-transparent rounded-full"></div>
                ) : (
                  <>
                    {student ? <Save className="h-4 w-4 mr-2" /> : <UserPlus className="h-4 w-4 mr-2" />}
                    {student ? 'Salvar' : 'Criar Aluno'}
                  </>
                )}
              </button>
              <button
                type="button"
                className="btn btn-outline"
                onClick={onClose}
                disabled={loading}
              >
                Cancelar
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};
