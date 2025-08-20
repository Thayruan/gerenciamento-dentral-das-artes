import { useState, useEffect, useCallback } from 'react';
import { Student, Payment, Task, ClassSchedule } from '../types';
import { localStorageService } from '../services/localStorage';

export const useStudents = () => {
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Carregar alunos
  const loadStudents = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = localStorageService.getAllStudents();
      setStudents(Array.isArray(data) ? data : []);
    } catch (err) {
      setError('Erro ao carregar alunos');
      console.error(err);
      setStudents([]);
    } finally {
      setLoading(false);
    }
  }, []);

  // Criar aluno
  const createStudent = useCallback(async (studentData: Omit<Student, 'id'>) => {
    try {
      setError(null);
      const id = localStorageService.createStudent(studentData);
      if (id) {
        await loadStudents();
        return { success: true, id };
      } else {
        setError('Erro ao criar aluno');
        return { success: false, id: null };
      }
    } catch (err) {
      setError('Erro ao criar aluno');
      console.error(err);
      return { success: false, id: null };
    }
  }, [loadStudents]);

  // Atualizar aluno
  const updateStudent = useCallback(async (id: string, updates: Partial<Omit<Student, 'id'>>) => {
    try {
      setError(null);
      const success = localStorageService.updateStudent(id, updates);
      if (success) {
        await loadStudents();
        return { success: true };
      } else {
        setError('Erro ao atualizar aluno');
        return { success: false };
      }
    } catch (err) {
      setError('Erro ao atualizar aluno');
      console.error(err);
      return { success: false };
    }
  }, [loadStudents]);

  // Deletar aluno
  const deleteStudent = useCallback(async (id: string) => {
    try {
      setError(null);
      const success = localStorageService.deleteStudent(id);
      if (success) {
        await loadStudents();
        return { success: true };
      } else {
        setError('Erro ao deletar aluno');
        return { success: false };
      }
    } catch (err) {
      setError('Erro ao deletar aluno');
      console.error(err);
      return { success: false };
    }
  }, [loadStudents]);

  // Buscar aluno por ID
  const getStudentById = useCallback((id: string) => {
    return localStorageService.getStudentById(id);
  }, []);

  // Obter estatísticas
  const getStats = useCallback(() => {
    try {
      return localStorageService.getStats();
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
  }, []);

  // Exportar banco
  const exportDatabase = useCallback(() => {
    try {
      const data = localStorageService.exportDatabase();
      if (data) {
        const blob = new Blob([data], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `alunos_export_${new Date().toISOString().split('T')[0]}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        return { success: true };
      } else {
        setError('Erro ao exportar dados');
        return { success: false };
      }
    } catch (err) {
      setError('Erro ao exportar dados');
      console.error(err);
      return { success: false };
    }
  }, []);

  // Importar banco
  const importDatabase = useCallback(async (file: File) => {
    try {
      setError(null);
      const text = await file.text();
      const result = localStorageService.importDatabase(text);
      
      if (result.success) {
        await loadStudents();
        return result;
      } else {
        setError(result.message);
        return result;
      }
    } catch (err) {
      setError('Erro ao importar dados');
      console.error(err);
      return { success: false, message: 'Erro ao processar arquivo', importedCount: 0 };
    }
  }, [loadStudents]);

  // Criar backup
  const createBackup = useCallback(() => {
    try {
      const result = localStorageService.createBackup();
      if (result.success) {
        return { success: true, path: result.path };
      } else {
        setError('Erro ao criar backup');
        return { success: false, path: null };
      }
    } catch (err) {
      setError('Erro ao criar backup');
      console.error(err);
      return { success: false, path: null };
    }
  }, []);

  // Restaurar backup
  const restoreBackup = useCallback(async (backupKey: string) => {
    try {
      setError(null);
      const result = localStorageService.restoreBackup(backupKey);
      if (result.success) {
        await loadStudents();
        return result;
      } else {
        setError(result.message);
        return result;
      }
    } catch (err) {
      setError('Erro ao restaurar backup');
      console.error(err);
      return { success: false, message: 'Erro ao restaurar backup' };
    }
  }, [loadStudents]);

  // Listar backups
  const listBackups = useCallback(() => {
    return localStorageService.listBackups();
  }, []);

  // Obter informações do sistema
  const getSystemInfo = useCallback(() => {
    return localStorageService.getSystemInfo();
  }, []);

  // Registrar pagamento
  const registerPayment = useCallback(async (paymentData: Omit<Payment, 'id' | 'createdAt'>) => {
    try {
      setError(null);
      const success = localStorageService.registerPayment(paymentData);
      if (success) {
        await loadStudents();
        return { success: true };
      } else {
        setError('Erro ao registrar pagamento');
        return { success: false };
      }
    } catch (err) {
      setError('Erro ao registrar pagamento');
      console.error(err);
      return { success: false };
    }
  }, [loadStudents]);

  // Obter histórico de pagamentos
  const getStudentPayments = useCallback((studentId: string) => {
    return localStorageService.getStudentPayments(studentId);
  }, []);

  // Obter status financeiro
  const getStudentFinancialStatus = useCallback((studentId: string) => {
    return localStorageService.getStudentFinancialStatus(studentId);
  }, []);

  // Obter relatório financeiro
  const getFinancialReport = useCallback(() => {
    return localStorageService.getFinancialReport();
  }, []);

  // Métodos para gerenciar tarefas
  const createTask = useCallback(async (studentId: string, taskData: Omit<Task, 'id' | 'createdAt' | 'updatedAt'>) => {
    try {
      setError(null);
      const taskId = localStorageService.createTask(studentId, taskData);
      if (taskId) {
        await loadStudents();
        return { success: true, id: taskId };
      } else {
        setError('Erro ao criar tarefa');
        return { success: false, id: null };
      }
    } catch (err) {
      setError('Erro ao criar tarefa');
      console.error(err);
      return { success: false, id: null };
    }
  }, [loadStudents]);

  const updateTask = useCallback(async (taskId: string, updates: Partial<Omit<Task, 'id' | 'studentId' | 'createdAt'>>) => {
    try {
      setError(null);
      const success = localStorageService.updateTask(taskId, updates);
      if (success) {
        await loadStudents();
        return { success: true };
      } else {
        setError('Erro ao atualizar tarefa');
        return { success: false };
      }
    } catch (err) {
      setError('Erro ao atualizar tarefa');
      console.error(err);
      return { success: false };
    }
  }, [loadStudents]);

  const deleteTask = useCallback(async (taskId: string) => {
    try {
      setError(null);
      const success = localStorageService.deleteTask(taskId);
      if (success) {
        await loadStudents();
        return { success: true };
      } else {
        setError('Erro ao deletar tarefa');
        return { success: false };
      }
    } catch (err) {
      setError('Erro ao deletar tarefa');
      console.error(err);
      return { success: false };
    }
  }, [loadStudents]);

  const getStudentTasks = useCallback((studentId: string) => {
    return localStorageService.getStudentTasks(studentId);
  }, []);

  // Métodos para gerenciar cronograma de aulas
  const createClassSchedule = useCallback(async (studentId: string, scheduleData: Omit<ClassSchedule, 'id' | 'createdAt'>) => {
    try {
      setError(null);
      const scheduleId = localStorageService.createClassSchedule(studentId, scheduleData);
      if (scheduleId) {
        await loadStudents();
        return { success: true, id: scheduleId };
      } else {
        setError('Erro ao criar cronograma');
        return { success: false, id: null };
      }
    } catch (err) {
      setError('Erro ao criar cronograma');
      console.error(err);
      return { success: false, id: null };
    }
  }, [loadStudents]);

  const updateClassSchedule = useCallback(async (scheduleId: string, updates: Partial<Omit<ClassSchedule, 'id' | 'studentId' | 'createdAt'>>) => {
    try {
      setError(null);
      const success = localStorageService.updateClassSchedule(scheduleId, updates);
      if (success) {
        await loadStudents();
        return { success: true };
      } else {
        setError('Erro ao atualizar cronograma');
        return { success: false };
      }
    } catch (err) {
      setError('Erro ao atualizar cronograma');
      console.error(err);
      return { success: false };
    }
  }, [loadStudents]);

  const updateStudentClassSchedule = useCallback(async (studentId: string, schedules: Omit<ClassSchedule, 'id' | 'createdAt'>[]) => {
    try {
      setError(null);
      const success = localStorageService.updateStudentClassSchedule(studentId, schedules);
      if (success) {
        await loadStudents();
        return { success: true };
      } else {
        setError('Erro ao atualizar cronograma do aluno');
        return { success: false };
      }
    } catch (err) {
      setError('Erro ao atualizar cronograma do aluno');
      console.error(err);
      return { success: false };
    }
  }, [loadStudents]);

  const deleteClassSchedule = useCallback(async (scheduleId: string) => {
    try {
      setError(null);
      const success = localStorageService.deleteClassSchedule(scheduleId);
      if (success) {
        await loadStudents();
        return { success: true };
      } else {
        setError('Erro ao deletar cronograma');
        return { success: false };
      }
    } catch (err) {
      setError('Erro ao deletar cronograma');
      console.error(err);
      return { success: false };
    }
  }, [loadStudents]);

  const getStudentClassSchedule = useCallback((studentId: string) => {
    return localStorageService.getStudentClassSchedule(studentId);
  }, []);

  // Carregar alunos na inicialização
  useEffect(() => {
    loadStudents();
  }, [loadStudents]);

  return {
    students,
    loading,
    error,
    createStudent,
    updateStudent,
    deleteStudent,
    getStudentById,
    getStats,
    exportDatabase,
    importDatabase,
    createBackup,
    restoreBackup,
    listBackups,
    getSystemInfo,
    refreshStudents: loadStudents,
    clearError: () => setError(null),
    registerPayment,
    getStudentPayments,
    getStudentFinancialStatus,
    getFinancialReport,
    // Métodos de tarefas
    createTask,
    updateTask,
    deleteTask,
    getStudentTasks,
    // Métodos de cronograma
    createClassSchedule,
    updateClassSchedule,
    updateStudentClassSchedule,
    deleteClassSchedule,
    getStudentClassSchedule
  };
};
