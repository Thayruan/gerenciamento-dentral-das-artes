import { Student, Payment, Task, ClassSchedule } from '../types';

class LocalStorageService {
  private readonly STORAGE_KEY = 'alunos_data';
  private readonly BACKUP_KEY = 'alunos_backup_';

  // Inicializar dados padrão (vazio)
  private getDefaultStudents(): Student[] {
    // Retornar alguns alunos de exemplo com cronogramas para demonstrar a funcionalidade
    const hoje = new Date();
    const proximoMes = new Date(hoje.getFullYear(), hoje.getMonth() + 1, 5);
    
    return [
      {
        id: 'ALU-0001',
        nome: 'Maria Silva',
        status: 'ativo',
        mensalidade: 150,
        cidade: 'São Paulo',
        email: 'maria@email.com',
        telefone: '(11) 99999-9999',
        nasc: '2010-05-15',
        vencimentoMensalidade: proximoMes.toISOString().split('T')[0],
        payments: [],
        lastPaymentDate: undefined,
        nextPaymentDue: proximoMes.toISOString().split('T')[0],
        classSchedule: [
          {
            id: 'SCH-001',
            studentId: 'ALU-0001',
            dayOfWeek: 1, // Segunda-feira
            time: '14:00',
            duration: 60,
            subject: 'Desenho',
            isActive: true,
            createdAt: new Date().toISOString()
          },
          {
            id: 'SCH-002',
            studentId: 'ALU-0001',
            dayOfWeek: 3, // Quarta-feira
            time: '16:00',
            duration: 60,
            subject: 'Pintura',
            isActive: true,
            createdAt: new Date().toISOString()
          }
        ]
      },
      {
        id: 'ALU-0002',
        nome: 'João Santos',
        status: 'ativo',
        mensalidade: 180,
        cidade: 'São Paulo',
        email: 'joao@email.com',
        telefone: '(11) 88888-8888',
        nasc: '2008-03-20',
        vencimentoMensalidade: proximoMes.toISOString().split('T')[0],
        payments: [],
        lastPaymentDate: undefined,
        nextPaymentDue: proximoMes.toISOString().split('T')[0],
        classSchedule: [
          {
            id: 'SCH-003',
            studentId: 'ALU-0002',
            dayOfWeek: 2, // Terça-feira
            time: '15:00',
            duration: 90,
            subject: 'Arte Digital',
            isActive: true,
            createdAt: new Date().toISOString()
          },
          {
            id: 'SCH-004',
            studentId: 'ALU-0002',
            dayOfWeek: 4, // Quinta-feira
            time: '17:00',
            duration: 60,
            subject: 'Escultura',
            isActive: true,
            createdAt: new Date().toISOString()
          }
        ]
      },
      {
        id: 'ALU-0003',
        nome: 'Ana Costa',
        status: 'ativo',
        mensalidade: 160,
        cidade: 'Campinas',
        email: 'ana@email.com',
        telefone: '(19) 77777-7777',
        nasc: '2012-07-10',
        vencimentoMensalidade: proximoMes.toISOString().split('T')[0],
        payments: [],
        lastPaymentDate: undefined,
        nextPaymentDue: proximoMes.toISOString().split('T')[0],
        classSchedule: [
          {
            id: 'SCH-005',
            studentId: 'ALU-0003',
            dayOfWeek: 1, // Segunda-feira
            time: '16:00',
            duration: 60,
            subject: 'Desenho',
            isActive: true,
            createdAt: new Date().toISOString()
          }
        ]
      }
    ];
  }

  // Gerar ID único para pagamentos
  private generatePaymentId(): string {
    return `PAY-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  // Calcular próxima data de vencimento
  private calculateNextPaymentDue(currentDue: string): string {
    const currentDate = new Date(currentDue);
    const nextMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, currentDate.getDate());
    return nextMonth.toISOString().split('T')[0];
  }

  // Migrar dados antigos para nova estrutura
  private migrateStudentsData(students: any[]): Student[] {
    return students.map(student => {
      // Garantir que todas as propriedades obrigatórias existam
      const migratedStudent: Student = {
        id: student.id || this.generateStudentId([]),
        nome: student.nome || '',
        status: student.status || 'ativo',
        mensalidade: student.mensalidade || 0,
        cidade: student.cidade || '',
        email: student.email || '',
        telefone: student.telefone || '',
        nasc: student.nasc || '',
        vencimentoMensalidade: student.vencimentoMensalidade || (() => {
          const hoje = new Date();
          const proximoMes = new Date(hoje.getFullYear(), hoje.getMonth() + 1, 5);
          return proximoMes.toISOString().split('T')[0];
        })(),
        payments: Array.isArray(student.payments) ? student.payments : [],
        lastPaymentDate: student.lastPaymentDate || undefined,
        nextPaymentDue: student.nextPaymentDue || student.vencimentoMensalidade || (() => {
          const hoje = new Date();
          const proximoMes = new Date(hoje.getFullYear(), hoje.getMonth() + 1, 5);
          return proximoMes.toISOString().split('T')[0];
        })(),
        classSchedule: Array.isArray(student.classSchedule) ? student.classSchedule : [],
        tasks: Array.isArray(student.tasks) ? student.tasks : []
      };
      
      return migratedStudent;
    });
  }

  // Validar estrutura de um aluno
  private validateStudent(student: any): student is Student {
    return student.id && 
           student.nome && 
           student.status && 
           student.mensalidade && 
           student.cidade && 
           student.email && 
           student.telefone && 
           student.nasc &&
           student.vencimentoMensalidade &&
           Array.isArray(student.payments) &&
           student.nextPaymentDue &&
           Array.isArray(student.classSchedule);
  }

  // Salvar dados no localStorage
  private saveToStorage(data: any): void {
    try {
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(data));
    } catch (error) {
      console.error('Erro ao salvar no localStorage:', error);
    }
  }

  // Carregar dados do localStorage
  private loadFromStorage(): any {
    try {
      const data = localStorage.getItem(this.STORAGE_KEY);
      return data ? JSON.parse(data) : null;
    } catch (error) {
      console.error('Erro ao carregar do localStorage:', error);
      return null;
    }
  }

  // Inicializar dados se não existirem
  private initializeData(): void {
    const existingData = this.loadFromStorage();
    if (!existingData || !existingData.students || existingData.students.length === 0) {
      const defaultData = {
        students: this.getDefaultStudents(),
        lastUpdated: new Date().toISOString(),
        version: '1.0'
      };
      this.saveToStorage(defaultData);
    }
  }

  // CRUD de Alunos
  getAllStudents(): Student[] {
    this.initializeData();
    const data = this.loadFromStorage();
    if (!data || !data.students || !Array.isArray(data.students)) {
      // Se os dados estiverem corrompidos, reinicializar
      this.initializeData();
      const freshData = this.loadFromStorage();
      return freshData?.students || [];
    }
    
    // Migrar dados antigos se necessário
    const migratedStudents = this.migrateStudentsData(data.students);
    if (migratedStudents !== data.students) {
      this.saveToStorage({
        ...data,
        students: migratedStudents,
        lastUpdated: new Date().toISOString()
      });
    }
    
    return migratedStudents;
  }

  getStudentById(id: string): Student | null {
    const students = this.getAllStudents();
    return students.find(student => student.id === id) || null;
  }

  createStudent(student: Omit<Student, 'id' | 'payments' | 'lastPaymentDate' | 'nextPaymentDue'>): string | null {
    try {
      const students = this.getAllStudents();
      const id = this.generateStudentId(students);
      
      // Definir data padrão de vencimento se não for fornecida
      let vencimentoMensalidade = student.vencimentoMensalidade;
      if (!vencimentoMensalidade) {
        const hoje = new Date();
        const proximoMes = new Date(hoje.getFullYear(), hoje.getMonth() + 1, 5); // Dia 5 do próximo mês
        vencimentoMensalidade = proximoMes.toISOString().split('T')[0];
      }
      
      const newStudent: Student = {
        ...student,
        id,
        vencimentoMensalidade,
        payments: [], // Histórico de pagamentos vazio
        lastPaymentDate: undefined, // Sem pagamentos ainda
        nextPaymentDue: vencimentoMensalidade, // Primeira data de vencimento
        classSchedule: [] // Cronograma vazio
      };
      
      students.push(newStudent);
      this.saveToStorage({
        students,
        lastUpdated: new Date().toISOString(),
        version: '1.0'
      });
      
      return id;
    } catch (error) {
      console.error('Erro ao criar aluno:', error);
      return null;
    }
  }

  updateStudent(id: string, updates: Partial<Omit<Student, 'id'>>): boolean {
    try {
      const students = this.getAllStudents();
      const index = students.findIndex(student => student.id === id);
      
      if (index === -1) return false;
      
      // Garantir que propriedades importantes não sejam sobrescritas
      const updatedStudent = { ...students[index], ...updates };
      
      // Preservar payments se não estiver sendo atualizado
      if (!updates.payments && !updatedStudent.payments) {
        updatedStudent.payments = students[index].payments || [];
      }
      
      // Preservar nextPaymentDue se não estiver sendo atualizado
      if (!updates.nextPaymentDue && !updatedStudent.nextPaymentDue) {
        updatedStudent.nextPaymentDue = students[index].nextPaymentDue || students[index].vencimentoMensalidade;
      }
      
      // Preservar classSchedule se não estiver sendo atualizado
      if (!updates.classSchedule && !updatedStudent.classSchedule) {
        updatedStudent.classSchedule = students[index].classSchedule || [];
      }
      
      students[index] = updatedStudent;
      
      this.saveToStorage({
        students,
        lastUpdated: new Date().toISOString(),
        version: '1.0'
      });
      
      return true;
    } catch (error) {
      console.error('Erro ao atualizar aluno:', error);
      return false;
    }
  }

  deleteStudent(id: string): boolean {
    try {
      const students = this.getAllStudents();
      const filteredStudents = students.filter(student => student.id !== id);
      
      if (filteredStudents.length === students.length) return false;
      
      this.saveToStorage({
        students: filteredStudents,
        lastUpdated: new Date().toISOString(),
        version: '1.0'
      });
      
      return true;
    } catch (error) {
      console.error('Erro ao deletar aluno:', error);
      return false;
    }
  }

  private generateStudentId(existingStudents: Student[]): string {
    if (existingStudents.length === 0) return 'ALU-0001';
    
    const maxNum = Math.max(
      ...existingStudents.map(student => {
        const num = parseInt(student.id.replace('ALU-', ''));
        return isNaN(num) ? 0 : num;
      })
    );
    
    const nextNum = maxNum + 1;
    return `ALU-${String(nextNum).padStart(4, '0')}`;
  }

  // Estatísticas
  getStats() {
    try {
      const students = this.getAllStudents();
      if (!Array.isArray(students)) {
        return {
          total: 0,
          ativos: 0,
          pendentes: 0,
          trancados: 0,
          receita: 0,
          vencidas: 0
        };
      }
      
      const hoje = new Date();
      const hojeStr = hoje.toISOString().split('T')[0];
      
      const ativos = students.filter(s => s.status === 'ativo').length;
      const pendentes = students.filter(s => s.status === 'pendente').length;
      const trancados = students.filter(s => s.status === 'trancado').length;
      const receita = students
        .filter(s => s.status === 'ativo')
        .reduce((sum, s) => sum + (s.mensalidade || 0), 0);
      
      // Calcular mensalidades vencidas (apenas alunos ativos)
      const vencidas = students.filter(s => 
        s.status === 'ativo' && 
        s.vencimentoMensalidade && 
        s.vencimentoMensalidade < hojeStr
      ).length;
      
      return {
        total: students.length,
        ativos,
        pendentes,
        trancados,
        receita,
        vencidas
      };
    } catch (error) {
      console.error('Erro ao obter estatísticas:', error);
      return {
        total: 0,
        ativos: 0,
        pendentes: 0,
        trancados: 0,
        receita: 0,
        vencidas: 0
      };
    }
  }

  // Exportar dados
  exportDatabase(): string {
    try {
      const data = this.loadFromStorage();
      if (!data) {
        this.initializeData();
        return this.exportDatabase();
      }
      
      const exportData = {
        ...data,
        exportDate: new Date().toISOString(),
        stats: this.getStats()
      };
      
      return JSON.stringify(exportData, null, 2);
    } catch (error) {
      console.error('Erro ao exportar dados:', error);
      return '';
    }
  }

  // Importar dados
  importDatabase(jsonData: string): { success: boolean; message: string; importedCount: number } {
    try {
      const importData = JSON.parse(jsonData);
      
      if (!importData.students || !Array.isArray(importData.students)) {
        return { success: false, message: 'Formato de arquivo inválido', importedCount: 0 };
      }
      
      // Validar estrutura dos dados
      const validStudents = importData.students.filter((student: any) => {
        return this.validateStudent(student);
      });
      
      if (validStudents.length === 0) {
        return { success: false, message: 'Nenhum aluno válido encontrado no arquivo', importedCount: 0 };
      }
      
      // Salvar dados importados
      this.saveToStorage({
        students: validStudents,
        lastUpdated: new Date().toISOString(),
        version: '1.0'
      });
      
      return {
        success: true,
        message: `Importação realizada com sucesso! ${validStudents.length} alunos importados.`,
        importedCount: validStudents.length
      };
      
    } catch (error) {
      console.error('Erro ao importar dados:', error);
      return { success: false, message: 'Erro ao processar arquivo de importação', importedCount: 0 };
    }
  }

  // Criar backup
  createBackup(): { success: boolean; path: string } {
    try {
      const data = this.exportDatabase();
      if (!data) {
        return { success: false, path: '' };
      }
      
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
      const backupKey = `${this.BACKUP_KEY}${timestamp}`;
      
      localStorage.setItem(backupKey, data);
      
      return { 
        success: true, 
        path: `Backup criado: ${backupKey}` 
      };
    } catch (error) {
      console.error('Erro ao criar backup:', error);
      return { success: false, path: '' };
    }
  }

  // Restaurar backup
  restoreBackup(backupKey: string): { success: boolean; message: string } {
    try {
      const backupData = localStorage.getItem(backupKey);
      if (!backupData) {
        return { success: false, message: 'Backup não encontrado' };
      }
      
      const result = this.importDatabase(backupData);
      return {
        success: result.success,
        message: result.success ? 'Backup restaurado com sucesso' : result.message
      };
    } catch (error) {
      console.error('Erro ao restaurar backup:', error);
      return { success: false, message: 'Erro ao restaurar backup' };
    }
  }

  // Listar backups disponíveis
  listBackups(): string[] {
    const backups: string[] = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith(this.BACKUP_KEY)) {
        backups.push(key);
      }
    }
    return backups.sort().reverse(); // Mais recentes primeiro
  }

  // Limpar dados
  clearData(): boolean {
    try {
      localStorage.removeItem(this.STORAGE_KEY);
      return true;
    } catch (error) {
      console.error('Erro ao limpar dados:', error);
      return false;
    }
  }

  // Verificar se há dados
  hasData(): boolean {
    const data = this.loadFromStorage();
    return !!(data && data.students && data.students.length > 0);
  }

  // Obter informações do sistema
  getSystemInfo() {
    return {
      storageType: 'localStorage',
      lastUpdated: this.loadFromStorage()?.lastUpdated || 'Nunca',
      version: this.loadFromStorage()?.version || '1.0',
      totalStudents: this.getAllStudents().length,
      storageSize: this.getStorageSize(),
      backups: this.listBackups().length
    };
  }

  private getStorageSize(): string {
    try {
      const data = this.loadFromStorage();
      const size = new Blob([JSON.stringify(data)]).size;
      return this.formatBytes(size);
    } catch {
      return '0 B';
    }
  }

  private formatBytes(bytes: number): string {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }

  // Registrar pagamento
  registerPayment(paymentData: Omit<Payment, 'id' | 'createdAt'>): boolean {
    try {
      const students = this.getAllStudents();
      const studentIndex = students.findIndex(s => s.id === paymentData.studentId);
      
      if (studentIndex === -1) return false;
      
      const student = students[studentIndex];
      
      // Garantir que payments existe
      if (!student.payments) {
        student.payments = [];
      }
      
      const newPayment: Payment = {
        ...paymentData,
        id: this.generatePaymentId(),
        createdAt: new Date().toISOString()
      };
      
      // Adicionar pagamento ao histórico
      student.payments.push(newPayment);
      
      // Atualizar data do último pagamento
      student.lastPaymentDate = paymentData.paymentDate;
      
      // Calcular próxima data de vencimento
      student.nextPaymentDue = this.calculateNextPaymentDue(student.nextPaymentDue);
      
      // Atualizar status do aluno se necessário
      if (student.status === 'pendente') {
        student.status = 'ativo';
      }
      
      this.saveToStorage({
        students,
        lastUpdated: new Date().toISOString(),
        version: '1.0'
      });
      
      return true;
    } catch (error) {
      console.error('Erro ao registrar pagamento:', error);
      return false;
    }
  }

  // Obter histórico de pagamentos de um aluno
  getStudentPayments(studentId: string): Payment[] {
    try {
      const students = this.getAllStudents();
      const student = students.find(s => s.id === studentId);
      return student?.payments || [];
    } catch (error) {
      console.error('Erro ao obter pagamentos:', error);
      return [];
    }
  }

  // Obter status financeiro de um aluno
  getStudentFinancialStatus(studentId: string) {
    try {
      const students = this.getAllStudents();
      const student = students.find(s => s.id === studentId);
      
      if (!student) return null;
      
      const hoje = new Date();
      const hojeStr = hoje.toISOString().split('T')[0];
      
      const pagamentosMes = (student.payments || []).filter(p => {
        const paymentDate = new Date(p.paymentDate);
        const dueDate = new Date(student.nextPaymentDue);
        return paymentDate.getMonth() === dueDate.getMonth() && 
               paymentDate.getFullYear() === dueDate.getFullYear();
      });
      
      const totalPagoMes = pagamentosMes.reduce((sum, p) => sum + p.amount, 0);
      const valorDevido = student.mensalidade - totalPagoMes;
      const status = valorDevido <= 0 ? 'em_dia' : 
                    student.nextPaymentDue < hojeStr ? 'vencido' : 'pendente';
      
      return {
        studentId,
        mensalidade: student.mensalidade,
        totalPagoMes,
        valorDevido,
        status,
        proximoVencimento: student.nextPaymentDue,
        pagamentosMes,
        historicoCompleto: student.payments || []
      };
    } catch (error) {
      console.error('Erro ao obter status financeiro:', error);
      return null;
    }
  }

  // Obter relatório financeiro geral
  getFinancialReport() {
    try {
      const students = this.getAllStudents();
      const hoje = new Date();
      const hojeStr = hoje.toISOString().split('T')[0];
      
      let receitaTotal = 0;
      let receitaVencida = 0;
      let receitaPendente = 0;
      let totalPagamentos = 0;
      let alunosEmDia = 0;
      let alunosVencidos = 0;
      
      students.forEach(student => {
        if (student.status === 'ativo') {
          receitaTotal += student.mensalidade;
          
          if (student.nextPaymentDue < hojeStr) {
            receitaVencida += student.mensalidade;
            alunosVencidos++;
          } else {
            receitaPendente += student.mensalidade;
          }
        }
        
        totalPagamentos += (student.payments || []).reduce((sum, p) => sum + p.amount, 0);
        
        const status = this.getStudentFinancialStatus(student.id);
        if (status?.status === 'em_dia') {
          alunosEmDia++;
        }
      });
      
      return {
        receitaTotal,
        receitaVencida,
        receitaPendente,
        totalPagamentos,
        alunosEmDia,
        alunosVencidos,
        taxaInadimplencia: receitaTotal > 0 ? (receitaVencida / receitaTotal) * 100 : 0,
        taxaPagamento: receitaTotal > 0 ? (totalPagamentos / receitaTotal) * 100 : 0
      };
    } catch (error) {
      console.error('Erro ao gerar relatório financeiro:', error);
      return null;
    }
  }

  // Métodos para gerenciar tarefas
  createTask(studentId: string, taskData: Omit<Task, 'id' | 'createdAt' | 'updatedAt'>): string {
    const students = this.getAllStudents();
    const studentIndex = students.findIndex(s => s.id === studentId);
    
    if (studentIndex === -1) {
      throw new Error('Aluno não encontrado');
    }

    const taskId = `TASK-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    const now = new Date().toISOString();
    
    const newTask: Task = {
      ...taskData,
      id: taskId,
      studentId,
      createdAt: now,
      updatedAt: now
    };

    if (!students[studentIndex].tasks) {
      students[studentIndex].tasks = [];
    }
    
    students[studentIndex].tasks!.push(newTask);
    
    this.saveToStorage({
      students,
      lastUpdated: new Date().toISOString(),
      version: '1.0'
    });
    
    return taskId;
  }

  updateTask(taskId: string, updates: Partial<Omit<Task, 'id' | 'studentId' | 'createdAt'>>): boolean {
    const students = this.getAllStudents();
    let found = false;

    for (let i = 0; i < students.length; i++) {
      if (students[i].tasks) {
        const taskIndex = students[i].tasks!.findIndex(t => t.id === taskId);
        if (taskIndex !== -1) {
          students[i].tasks![taskIndex] = {
            ...students[i].tasks![taskIndex],
            ...updates,
            updatedAt: new Date().toISOString()
          };
          found = true;
          break;
        }
      }
    }

    if (found) {
      this.saveToStorage({
        students,
        lastUpdated: new Date().toISOString(),
        version: '1.0'
      });
    }

    return found;
  }

  deleteTask(taskId: string): boolean {
    const students = this.getAllStudents();
    let found = false;

    for (let i = 0; i < students.length; i++) {
      if (students[i].tasks) {
        const taskIndex = students[i].tasks!.findIndex(t => t.id === taskId);
        if (taskIndex !== -1) {
          students[i].tasks!.splice(taskIndex, 1);
          found = true;
          break;
        }
      }
    }

    if (found) {
      this.saveToStorage({
        students,
        lastUpdated: new Date().toISOString(),
        version: '1.0'
      });
    }

    return found;
  }

  getStudentTasks(studentId: string): Task[] {
    const student = this.getStudentById(studentId);
    return student?.tasks || [];
  }

  // Métodos para gerenciar cronograma de aulas
  createClassSchedule(studentId: string, scheduleData: Omit<ClassSchedule, 'id' | 'createdAt'>): string {
    const students = this.getAllStudents();
    const studentIndex = students.findIndex(s => s.id === studentId);
    
    if (studentIndex === -1) {
      throw new Error('Aluno não encontrado');
    }

    const scheduleId = `SCH-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    const now = new Date().toISOString();
    
    const newSchedule: ClassSchedule = {
      ...scheduleData,
      id: scheduleId,
      studentId,
      createdAt: now
    };

    if (!students[studentIndex].classSchedule) {
      students[studentIndex].classSchedule = [];
    }
    
    students[studentIndex].classSchedule!.push(newSchedule);
    
    this.saveToStorage({
      students,
      lastUpdated: new Date().toISOString(),
      version: '1.0'
    });
    
    return scheduleId;
  }

  updateClassSchedule(scheduleId: string, updates: Partial<Omit<ClassSchedule, 'id' | 'studentId' | 'createdAt'>>): boolean {
    const students = this.getAllStudents();
    let found = false;

    for (let i = 0; i < students.length; i++) {
      if (students[i].classSchedule) {
        const scheduleIndex = students[i].classSchedule!.findIndex(s => s.id === scheduleId);
        if (scheduleIndex !== -1) {
          students[i].classSchedule![scheduleIndex] = {
            ...students[i].classSchedule![scheduleIndex],
            ...updates
          };
          found = true;
          break;
        }
      }
    }

    if (found) {
      this.saveToStorage({
        students,
        lastUpdated: new Date().toISOString(),
        version: '1.0'
      });
    }

    return found;
  }

  updateStudentClassSchedule(studentId: string, schedules: Omit<ClassSchedule, 'id' | 'createdAt'>[]): boolean {
    const students = this.getAllStudents();
    const studentIndex = students.findIndex(s => s.id === studentId);
    
    if (studentIndex === -1) {
      return false;
    }

    const now = new Date().toISOString();
    
    const newSchedules: ClassSchedule[] = schedules.map((schedule, index) => ({
      ...schedule,
      id: `SCH-${Date.now()}-${index}-${Math.random().toString(36).substr(2, 9)}`,
      studentId,
      createdAt: now
    }));

    students[studentIndex].classSchedule = newSchedules;
    
    this.saveToStorage({
      students,
      lastUpdated: new Date().toISOString(),
      version: '1.0'
    });
    
    return true;
  }

  deleteClassSchedule(scheduleId: string): boolean {
    const students = this.getAllStudents();
    let found = false;

    for (let i = 0; i < students.length; i++) {
      if (students[i].classSchedule) {
        const scheduleIndex = students[i].classSchedule!.findIndex(s => s.id === scheduleId);
        if (scheduleIndex !== -1) {
          students[i].classSchedule!.splice(scheduleIndex, 1);
          found = true;
          break;
        }
      }
    }

    if (found) {
      this.saveToStorage({
        students,
        lastUpdated: new Date().toISOString(),
        version: '1.0'
      });
    }

    return found;
  }

  getStudentClassSchedule(studentId: string): ClassSchedule[] {
    const student = this.getStudentById(studentId);
    return student?.classSchedule || [];
  }
}

// Instância singleton
export const localStorageService = new LocalStorageService();
