import React, { useState } from 'react';
import { X, MessageCircle, Send, Copy, CheckCircle } from 'lucide-react';
import { Student } from '../types';
import { formatCurrency } from '../utils/helpers';

interface WhatsAppReminderProps {
  student: Student;
  onClose: () => void;
  isOpen: boolean;
}

export const WhatsAppReminder: React.FC<WhatsAppReminderProps> = ({ 
  student, 
  onClose, 
  isOpen 
}) => {
  const [selectedTemplate, setSelectedTemplate] = useState<'lembrete' | 'vencido' | 'motivacional' | 'personalizado'>('lembrete');
  const [customMessage, setCustomMessage] = useState('');
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const templates: Record<'lembrete' | 'vencido' | 'motivacional' | 'personalizado', { title: string; message: string }> = {
    lembrete: {
      title: 'Lembrete de Pagamento',
      message: `Olá ${student.nome.split(' ')[0]}! 😊

Sua mensalidade de ${formatCurrency(student.mensalidade)} vence no dia ${new Date(student.nextPaymentDue).toLocaleDateString('pt-BR')}.

💡 *Dica:* Pague até o vencimento e mantenha suas aulas em dia!

🎨 Continue desenvolvendo seu talento artístico conosco!

Agradecemos sua confiança! 🙏

*Central das Artes*`
    },
    vencido: {
      title: 'Mensalidade Vencida',
      message: `Olá ${student.nome.split(' ')[0]}! 

⚠️ Sua mensalidade de ${formatCurrency(student.mensalidade)} está vencida desde ${new Date(student.nextPaymentDue).toLocaleDateString('pt-BR')}.

💪 Não perca o ritmo das suas aulas! Regularize sua situação e continue evoluindo na arte.

🎯 *Oferta especial:* Pague hoje e ganhe 5% de desconto!

Entre em contato conosco para mais informações.

*Central das Artes*`
    },
    motivacional: {
      title: 'Mensagem Motivacional',
      message: `Olá ${student.nome.split(' ')[0]}! ✨

🌟 *Você é incrível!* Sua dedicação às aulas está transformando sonhos em realidade.

🎨 Cada aula é um passo para o sucesso artístico que você merece!

💫 Mantenha sua mensalidade em dia e continue brilhando conosco.

*Central das Artes - Transformando vidas através da arte* 🎭`
    },
    personalizado: {
      title: 'Mensagem Personalizada',
      message: customMessage || `Olá ${student.nome.split(' ')[0]}! 

Sua mensalidade de ${formatCurrency(student.mensalidade)} vence no dia ${new Date(student.nextPaymentDue).toLocaleDateString('pt-BR')}.

Agradecemos sua confiança!

*Central das Artes*`
    }
  };

  const getPhoneNumber = (phone: string) => {
    // Remove todos os caracteres não numéricos
    const cleanPhone = phone.replace(/\D/g, '');
    
    // Se começar com 55 (Brasil), mantém
    if (cleanPhone.startsWith('55')) {
      return cleanPhone;
    }
    
    // Se não tiver código do país, adiciona 55
    return `55${cleanPhone}`;
  };

  const sendWhatsApp = (templateKey: 'lembrete' | 'vencido' | 'motivacional' | 'personalizado') => {
    const template = templates[templateKey];
    const message = encodeURIComponent(template.message);
    const phone = getPhoneNumber(student.telefone);
    
    const whatsappUrl = `https://wa.me/${phone}?text=${message}`;
    window.open(whatsappUrl, '_blank');
  };

  const copyMessage = (templateKey: 'lembrete' | 'vencido' | 'motivacional' | 'personalizado') => {
    const template = templates[templateKey];
    navigator.clipboard.writeText(template.message);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const getTemplateIcon = (key: 'lembrete' | 'vencido' | 'motivacional' | 'personalizado') => {
    switch (key) {
      case 'lembrete': return '⏰';
      case 'vencido': return '⚠️';
      case 'motivacional': return '✨';
      case 'personalizado': return '✍️';
      default: return '💬';
    }
  };

  return (
    <div className="modal-overlay">
      <div className="absolute inset-0 bg-black/50" onClick={onClose}></div>
      <div className="modal-content">
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold fade-in-up">Enviar Lembrete WhatsApp</h2>
            <button className="btn btn-ghost icon-hover" onClick={onClose}>
              <X className="h-5 w-5" />
            </button>
          </div>

          <div className="mb-6 p-4 bg-green-50 rounded-xl border border-green-200">
            <div className="flex items-center gap-3">
              <div className="avatar h-12 w-12">
                <div className="avatar-fallback text-lg">
                  {student.nome.split(' ').map(n => n[0]).join('').slice(0, 2)}
                </div>
              </div>
              <div>
                <div className="font-semibold text-green-900">{student.nome}</div>
                <div className="text-sm text-green-700">Telefone: {student.telefone}</div>
                <div className="text-sm text-green-600">
                  Mensalidade: {formatCurrency(student.mensalidade)} | 
                  Vencimento: {new Date(student.nextPaymentDue).toLocaleDateString('pt-BR')}
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            {/* Seleção de Template */}
            <div>
              <label className="block text-sm font-medium text-foreground mb-3">
                Escolha um modelo de mensagem:
              </label>
              <div className="grid grid-cols-2 gap-3">
                {(Object.keys(templates) as Array<'lembrete' | 'vencido' | 'motivacional' | 'personalizado'>).map((key) => (
                  <button
                    key={key}
                    type="button"
                    className={`p-4 rounded-xl border-2 transition-all text-left ${
                      selectedTemplate === key
                        ? 'border-green-500 bg-green-50 text-green-700'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                    onClick={() => setSelectedTemplate(key)}
                  >
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-xl">{getTemplateIcon(key)}</span>
                      <span className="font-medium text-sm">{templates[key].title}</span>
                    </div>
                    <p className="text-xs text-gray-600 line-clamp-2">
                      {templates[key].message.split('\n')[0]}...
                    </p>
                  </button>
                ))}
              </div>
            </div>

            {/* Mensagem Personalizada */}
            {selectedTemplate === 'personalizado' && (
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Personalize sua mensagem:
                </label>
                <textarea
                  className="input min-h-[120px] resize-none"
                  placeholder="Digite sua mensagem personalizada..."
                  value={customMessage}
                  onChange={(e) => setCustomMessage(e.target.value)}
                />
                <p className="text-xs text-gray-500 mt-1">
                  Use *texto* para negrito e emojis para tornar a mensagem mais atrativa
                </p>
              </div>
            )}

            {/* Preview da Mensagem */}
            <div className="bg-gray-50 rounded-xl p-4">
              <div className="flex items-center justify-between mb-3">
                <span className="text-sm font-medium text-gray-700">Preview da mensagem:</span>
                <button
                  type="button"
                  onClick={() => copyMessage(selectedTemplate)}
                  className="btn btn-ghost btn-sm text-blue-600 hover:text-blue-700"
                >
                  {copied ? (
                    <>
                      <CheckCircle className="h-4 w-4 mr-1" />
                      Copiado!
                    </>
                  ) : (
                    <>
                      <Copy className="h-4 w-4 mr-1" />
                      Copiar
                    </>
                  )}
                </button>
              </div>
              <div className="bg-white rounded-lg p-3 border text-sm whitespace-pre-wrap">
                {templates[selectedTemplate].message}
              </div>
            </div>

            {/* Ações */}
            <div className="flex gap-3 pt-4">
              <button
                type="button"
                onClick={() => sendWhatsApp(selectedTemplate)}
                className="btn btn-primary flex-1 bg-green-600 hover:bg-green-700"
              >
                <Send className="h-4 w-4 mr-2" />
                Enviar por WhatsApp
              </button>
              <button
                type="button"
                className="btn btn-outline"
                onClick={onClose}
              >
                Cancelar
              </button>
            </div>

            {/* Dicas */}
            <div className="mt-6 p-4 bg-blue-50 rounded-xl border border-blue-200">
              <div className="flex items-start gap-2">
                <MessageCircle className="h-5 w-5 text-blue-600 mt-0.5" />
                <div className="text-sm text-blue-800">
                  <div className="font-medium mb-1">💡 Dicas para mensagens de alta retenção:</div>
                  <ul className="space-y-1 text-xs">
                    <li>• Use o nome do aluno para personalização</li>
                    <li>• Inclua emojis para tornar a mensagem mais amigável</li>
                    <li>• Seja específico sobre valores e datas</li>
                    <li>• Ofereça incentivos ou descontos quando apropriado</li>
                    <li>• Mantenha um tom positivo e motivacional</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
