import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import { X, MapPin, Phone, Mail, Edit, Download, Trash2, Calendar, AlertTriangle, CheckCircle, MessageCircle } from 'lucide-react';
import { Student } from '../types';
import { getInitials, formatCurrency } from '../utils/helpers';

interface StudentDetailsModalProps {
  student: Student | null;
  onClose: () => void;
  onEdit?: (student: Student) => void;
  onDelete?: (student: Student) => void;
  onOpenPayment?: (student: Student) => void;
  onOpenWhatsApp?: (student: Student) => void;
}

export const StudentDetailsModal: React.FC<StudentDetailsModalProps> = ({ 
  student, 
  onClose, 
  onEdit,
  onDelete,
  onOpenPayment,
  onOpenWhatsApp
}) => {
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  if (!student) return null;

  const handleEdit = () => {
    if (onEdit) {
      onEdit(student);
      onClose();
    }
  };

  const handleDeleteClick = () => {
    setShowDeleteConfirm(true);
  };

  const handleDeleteConfirm = () => {
    if (onDelete) {
      onDelete(student);
      onClose();
    }
  };

  const handleDeleteCancel = () => {
    setShowDeleteConfirm(false);
  };

  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('pt-BR');
    } catch {
      return dateString;
    }
  };

  // Modal de confirmação usando Portal para renderizar no body
  const DeleteConfirmModal = () => {
    if (!showDeleteConfirm) return null;
    
    return createPortal(
      <div 
        className="fixed inset-0 flex items-center justify-center" 
        style={{ 
          zIndex: 99999,
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0
        }}
      >
        <div 
          className="absolute inset-0 bg-black/80" 
          onClick={handleDeleteCancel}
          style={{ zIndex: 99999 }}
        ></div>
        <div 
          className="relative bg-white rounded-2xl shadow-2xl max-w-md w-full mx-4 transform transition-all"
          style={{ zIndex: 100000 }}
        >
          <div className="p-6 text-center">
            <AlertTriangle className="mx-auto h-12 w-12 text-red-500 mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-3">Confirmar Exclusão</h3>
            <div className="mb-6">
              <p className="text-sm text-gray-600">
                Tem certeza que deseja excluir o aluno <strong className="text-gray-900">{student.nome}</strong>? Esta ação não pode ser desfeita.
              </p>
            </div>
            <div className="flex gap-3 justify-center">
              <button
                className="btn btn-outline rounded-xl text-red-600 hover:bg-red-50"
                onClick={handleDeleteConfirm}
              >
                Excluir
              </button>
              <button
                className="btn btn-ghost rounded-xl"
                onClick={handleDeleteCancel}
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>
      </div>,
      document.body
    );
  };

  return (
    <>
      <div className="modal-overlay">
        <div className="absolute inset-0 bg-black/50" onClick={onClose}></div>
        <div className="modal-content">
          <div className="p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-semibold fade-in-up">Detalhes do Aluno</h2>
              <button className="btn btn-ghost icon-hover" onClick={onClose}>
                <X className="h-5 w-5" />
              </button>
            </div>
            
            <div className="space-y-4 text-sm">
              <div className="flex items-center gap-3 fade-in-up" style={{ animationDelay: '0.1s' }}>
                <div className="avatar h-16 w-16">
                  <div className="avatar-fallback text-lg">{getInitials(student.nome)}</div>
                </div>
                <div className="flex-1">
                  <div className="text-xl font-semibold">{student.nome}</div>
                  <div className="text-muted-foreground font-mono">{student.id}</div>
                  <div className="mt-2">
                    <span className={`badge rounded-xl capitalize status-badge ${student.status === 'ativo' ? 'badge-default' : student.status === 'pendente' ? 'badge-secondary' : 'badge-outline'}`}>
                      {student.status}
                    </span>
                  </div>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-3">
                {[
                  { label: 'Mensalidade', value: formatCurrency(student.mensalidade), icon: null, color: 'bg-green-50 border-green-200' },
                  { label: 'Data de Nascimento', value: formatDate(student.nasc), icon: Calendar, color: 'bg-blue-50 border-blue-200' },
                  { label: 'Vencimento da Mensalidade', value: formatDate(student.vencimentoMensalidade), icon: Calendar, color: 'bg-orange-50 border-orange-200' },
                  { label: 'Cidade', value: student.cidade, icon: MapPin, color: 'bg-purple-50 border-purple-200' },
                  { label: 'Telefone', value: student.telefone, icon: Phone, color: 'bg-orange-50 border-orange-200' },
                  { label: 'E-mail', value: student.email, icon: Mail, color: 'bg-indigo-50 border-indigo-200', colSpan: 2 }
                ].map((item, index) => (
                  <div 
                    key={item.label} 
                    className={`p-4 rounded-xl border ${item.color} stagger-item hover:shadow-md transition-all duration-200 ${
                      item.colSpan === 2 ? 'col-span-2' : ''
                    }`} 
                    style={{ animationDelay: `${0.2 + index * 0.05}s` }}
                  >
                    <div className="text-xs text-muted-foreground uppercase tracking-wide font-medium mb-1">{item.label}</div>
                    <div className="font-medium flex items-center gap-2">
                      {item.icon && <item.icon className="h-4 w-4 icon-hover" />}
                      <span className="break-all">{item.value}</span>
                    </div>
                  </div>
                ))}
              </div>
              
              <div className="flex gap-2 pt-4 fade-in-up" style={{ animationDelay: '0.5s' }}>
                {onEdit && (
                  <button className="btn btn-primary rounded-xl flex-1" onClick={handleEdit}>
                    <Edit className="h-4 w-4 mr-2" />
                    Editar
                  </button>
                )}
                {onOpenPayment && (
                  <button className="btn btn-primary rounded-xl flex-1 bg-green-600 hover:bg-green-700" onClick={() => onOpenPayment(student)}>
                    <CheckCircle className="h-4 w-4 mr-2" />
                    Registrar Pagamento
                  </button>
                )}
                {onOpenWhatsApp && (
                  <button className="btn btn-outline rounded-xl flex-1 text-green-600 hover:bg-green-50" onClick={() => onOpenWhatsApp(student)}>
                    <MessageCircle className="h-4 w-4 mr-2" />
                    Lembrete WhatsApp
                  </button>
                )}
                <button className="btn btn-outline rounded-xl flex-1">
                  <Download className="h-4 w-4 mr-2" />
                  Gerar boleto
                </button>
                {onDelete && (
                  <button className="btn btn-ghost rounded-xl text-red-600 flex-1" onClick={handleDeleteClick}>
                    <Trash2 className="h-4 w-4 mr-2" />
                    Excluir
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Modal de confirmação usando Portal */}
      <DeleteConfirmModal />
    </>
  );
};
