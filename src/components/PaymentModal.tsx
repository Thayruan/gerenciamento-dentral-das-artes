import React, { useState, useRef } from 'react';
import { X, Save, Upload, Download, CheckCircle, AlertCircle } from 'lucide-react';
import { Student, Payment } from '../types';
import { formatCurrency } from '../utils/helpers';

interface PaymentModalProps {
  student: Student;
  onClose: () => void;
  onSavePayment: (payment: Omit<Payment, 'id' | 'createdAt'>) => Promise<boolean>;
  isOpen: boolean;
}

interface FormData {
  amount: number;
  paymentDate: string;
  paymentMethod: 'pix' | 'dinheiro' | 'cartao' | 'transferencia';
  observation: string;
  receipt: File | null;
}

export const PaymentModal: React.FC<PaymentModalProps> = ({ 
  student, 
  onClose, 
  onSavePayment,
  isOpen 
}) => {
  const [formData, setFormData] = useState<FormData>({
    amount: student.mensalidade,
    paymentDate: new Date().toISOString().split('T')[0],
    paymentMethod: 'pix',
    observation: '',
    receipt: null
  });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (formData.amount <= 0) {
      newErrors.amount = 'Valor deve ser maior que zero';
    }

    if (!formData.paymentDate) {
      newErrors.paymentDate = 'Data do pagamento é obrigatória';
    }

    if (!formData.paymentMethod) {
      newErrors.paymentMethod = 'Forma de pagamento é obrigatória';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    setLoading(true);
    try {
      // Converter arquivo para base64 se existir
      let receiptBase64: string | undefined;
      if (formData.receipt) {
        receiptBase64 = await fileToBase64(formData.receipt);
      }

      const paymentData = {
        studentId: student.id,
        amount: formData.amount,
        paymentDate: formData.paymentDate,
        dueDate: student.nextPaymentDue,
        paymentMethod: formData.paymentMethod,
        status: 'pago' as const,
        observation: formData.observation,
        receipt: receiptBase64
      };

      const success = await onSavePayment(paymentData);
      if (success) {
        onClose();
      }
    } catch (error) {
      console.error('Erro ao salvar pagamento:', error);
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

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validar tipo de arquivo
      if (!file.type.startsWith('image/') && !file.type.includes('pdf')) {
        setErrors({ receipt: 'Apenas imagens e PDFs são permitidos' });
        return;
      }
      
      // Validar tamanho (máximo 5MB)
      if (file.size > 5 * 1024 * 1024) {
        setErrors({ receipt: 'Arquivo muito grande. Máximo 5MB' });
        return;
      }

      setFormData(prev => ({ ...prev, receipt: file }));
      setErrors(prev => ({ ...prev, receipt: '' }));
    }
  };

  const removeFile = () => {
    setFormData(prev => ({ ...prev, receipt: null }));
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const getPaymentMethodIcon = (method: string) => {
    switch (method) {
      case 'pix': return '💳';
      case 'dinheiro': return '💰';
      case 'cartao': return '💳';
      case 'transferencia': return '🏦';
      default: return '💳';
    }
  };

  return (
    <div className="modal-overlay">
      <div className="absolute inset-0 bg-black/50" onClick={onClose}></div>
      <div className="modal-content">
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold fade-in-up">Registrar Pagamento</h2>
            <button className="btn btn-ghost icon-hover" onClick={onClose}>
              <X className="h-5 w-5" />
            </button>
          </div>

          <div className="mb-6 p-4 bg-blue-50 rounded-xl border border-blue-200">
            <div className="flex items-center gap-3">
              <div className="avatar h-12 w-12">
                <div className="avatar-fallback text-lg">
                  {student.nome.split(' ').map(n => n[0]).join('').slice(0, 2)}
                </div>
              </div>
              <div>
                <div className="font-semibold text-blue-900">{student.nome}</div>
                <div className="text-sm text-blue-700">Mensalidade: {formatCurrency(student.mensalidade)}</div>
                <div className="text-sm text-blue-600">Vencimento: {new Date(student.nextPaymentDue).toLocaleDateString('pt-BR')}</div>
              </div>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Valor Pago *
                </label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  className={`input ${errors.amount ? 'border-red-500' : ''}`}
                  value={formData.amount}
                  onChange={(e) => {
                    setFormData(prev => ({ ...prev, amount: parseFloat(e.target.value) || 0 }));
                    if (errors.amount) setErrors(prev => ({ ...prev, amount: '' }));
                  }}
                  placeholder="0.00"
                />
                {errors.amount && (
                  <p className="text-red-500 text-xs mt-1">{errors.amount}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Data do Pagamento *
                </label>
                <input
                  type="date"
                  className={`input ${errors.paymentDate ? 'border-red-500' : ''}`}
                  value={formData.paymentDate}
                  onChange={(e) => {
                    setFormData(prev => ({ ...prev, paymentDate: e.target.value }));
                    if (errors.paymentDate) setErrors(prev => ({ ...prev, paymentDate: '' }));
                  }}
                />
                {errors.paymentDate && (
                  <p className="text-red-500 text-xs mt-1">{errors.paymentDate}</p>
                )}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Forma de Pagamento *
              </label>
              <div className="grid grid-cols-2 gap-2">
                {(['pix', 'dinheiro', 'cartao', 'transferencia'] as const).map((method) => (
                  <button
                    key={method}
                    type="button"
                    className={`p-3 rounded-xl border-2 transition-all ${
                      formData.paymentMethod === method
                        ? 'border-blue-500 bg-blue-50 text-blue-700'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                    onClick={() => {
                      setFormData(prev => ({ ...prev, paymentMethod: method }));
                      if (errors.paymentMethod) setErrors(prev => ({ ...prev, paymentMethod: '' }));
                    }}
                  >
                    <div className="flex items-center gap-2">
                      <span className="text-lg">{getPaymentMethodIcon(method)}</span>
                      <span className="capitalize">{method}</span>
                    </div>
                  </button>
                ))}
              </div>
              {errors.paymentMethod && (
                <p className="text-red-500 text-xs mt-1">{errors.paymentMethod}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Observações
              </label>
              <textarea
                className="input min-h-[80px] resize-none"
                placeholder="Observações sobre o pagamento..."
                value={formData.observation}
                onChange={(e) => setFormData(prev => ({ ...prev, observation: e.target.value }))}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Comprovante
              </label>
              <div className="border-2 border-dashed border-gray-300 rounded-xl p-4 text-center hover:border-gray-400 transition-colors">
                {formData.receipt ? (
                  <div className="space-y-3">
                    <div className="flex items-center justify-center gap-2 text-green-600">
                      <CheckCircle className="h-5 w-5" />
                      <span className="font-medium">Arquivo selecionado</span>
                    </div>
                    <div className="text-sm text-gray-600">
                      {formData.receipt.name} ({(formData.receipt.size / 1024 / 1024).toFixed(2)} MB)
                    </div>
                    <button
                      type="button"
                      onClick={removeFile}
                      className="btn btn-outline btn-sm text-red-600 hover:bg-red-50"
                    >
                      Remover arquivo
                    </button>
                  </div>
                ) : (
                  <div className="space-y-3">
                    <Upload className="h-8 w-8 text-gray-400 mx-auto" />
                    <div>
                      <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        className="text-blue-600 hover:text-blue-700 font-medium"
                      >
                        Clique para selecionar
                      </button>
                      <p className="text-sm text-gray-500 mt-1">
                        ou arraste e solte aqui
                      </p>
                    </div>
                    <p className="text-xs text-gray-400">
                      PNG, JPG, PDF até 5MB
                    </p>
                  </div>
                )}
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*,.pdf"
                  onChange={handleFileChange}
                  className="hidden"
                />
              </div>
              {errors.receipt && (
                <p className="text-red-500 text-xs mt-1">{errors.receipt}</p>
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
                    <CheckCircle className="h-4 w-4 mr-2" />
                    Confirmar Pagamento
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
