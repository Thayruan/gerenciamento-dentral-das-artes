export interface Payment {
  id: string;
  studentId: string;
  amount: number;
  paymentDate: string; // Data do pagamento (formato ISO)
  dueDate: string; // Data de vencimento original
  paymentMethod: 'dinheiro' | 'pix' | 'cartao' | 'transferencia';
  status: 'pago' | 'pendente' | 'vencido';
  observation?: string; // Observações sobre o pagamento
  receipt?: string; // URL ou base64 do comprovante
  createdAt: string; // Data de criação do registro
}

export interface Task {
  id: string;
  studentId: string;
  date: string; // Data da tarefa (formato ISO)
  title: string; // Título da tarefa
  description: string; // Descrição detalhada da tarefa
  status: 'pendente' | 'em_andamento' | 'concluida' | 'atrasada';
  artImage?: string; // Base64 da imagem de referência da arte
  notes?: string; // Observações sobre a tarefa
  createdAt: string;
  updatedAt: string;
}

export interface ClassSchedule {
  id: string;
  studentId: string;
  dayOfWeek: number; // 0 = Domingo, 1 = Segunda, etc.
  time: string; // Horário fixo da aula (ex: "14:00")
  duration: number; // Duração em minutos
  subject: string; // Matéria/disciplina
  isActive: boolean;
  createdAt: string;
}

export interface Student {
  id: string;
  nome: string;
  status: 'ativo' | 'pendente' | 'trancado';
  mensalidade: number;
  cidade: string;
  email: string;
  telefone: string;
  nasc: string;
  vencimentoMensalidade: string; // Data de vencimento da mensalidade (formato ISO)
  payments: Payment[]; // Histórico de pagamentos
  lastPaymentDate?: string; // Data do último pagamento
  nextPaymentDue: string; // Próxima data de vencimento
  classSchedule?: ClassSchedule[]; // Cronograma de aulas fixas
  tasks?: Task[]; // Tarefas individuais do aluno
}

