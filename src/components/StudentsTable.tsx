import React, { useState, useMemo } from 'react';
import { Search, MoreVertical, Mail, MapPin, Edit, Trash2, Eye, CheckCircle, MessageCircle } from 'lucide-react';
import { Student } from '../types';
import { getInitials, formatCurrency, getStatusClass } from '../utils/helpers';

interface StudentsTableProps {
  students: Student[];
  onOpenDetails: (student: Student) => void;
  onEditStudent: (student: Student) => void;
  onDeleteStudent: (student: Student) => void;
  onOpenPayment?: (student: Student) => void;
  onOpenWhatsApp?: (student: Student) => void;
}

export const StudentsTable: React.FC<StudentsTableProps> = ({ 
  students, 
  onOpenDetails, 
  onEditStudent,
  onDeleteStudent,
  onOpenPayment,
  onOpenWhatsApp
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('todos');
  const [openDropdownId, setOpenDropdownId] = useState<string | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

  const filteredStudents = useMemo(() => {
    return students.filter(student => {
      const matchesSearch = 
        student.nome.toLowerCase().includes(searchQuery.toLowerCase()) ||
        student.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
        student.cidade.toLowerCase().includes(searchQuery.toLowerCase()) ||
        student.email.toLowerCase().includes(searchQuery.toLowerCase());
      
      const matchesStatus = statusFilter === 'todos' || student.status === statusFilter;
      
      return matchesSearch && matchesStatus;
    });
  }, [students, searchQuery, statusFilter]);

  const toggleDropdown = (studentId: string) => {
    setOpenDropdownId(openDropdownId === studentId ? null : studentId);
  };

  const handleDelete = (student: Student) => {
    setDeleteConfirm(student.id);
    setOpenDropdownId(null);
  };

  const confirmDelete = async (student: Student) => {
    await onDeleteStudent(student);
    setDeleteConfirm(null);
  };

  const closeDropdown = () => {
    setOpenDropdownId(null);
  };

  // Fechar dropdown ao clicar fora
  React.useEffect(() => {
    const handleClickOutside = () => closeDropdown();
    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, []);

  return (
    <div className="card rounded-2xl">
      <div className="card-header pb-2">
        <div className="card-title flex items-center justify-between">
          <span className="text-base">Alunos ({filteredStudents.length})</span>
          <div className="flex items-center gap-2">
            <div className="search-container">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground icon-hover" />
              <input 
                type="text" 
                placeholder="Buscar por nome, ID, cidade ou e-mail" 
                className="input pl-8 w-56"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <select 
              className="h-10 w-36 rounded-md border border-border bg-input px-3 text-sm cursor-pointer transition-all duration-200 hover:border-gray-400"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="todos">Todos</option>
              <option value="ativo">Ativo</option>
              <option value="pendente">Pendente</option>
              <option value="trancado">Trancado</option>
            </select>
          </div>
        </div>
      </div>
      
      <div className="card-content pt-0">
        <div className="overflow-x-auto">
          <table className="table min-w-full text-sm">
            <thead>
              <tr className="text-left text-muted-foreground">
                <th className="py-2 pr-3">ID</th>
                <th className="py-2 pr-3">Aluno</th>
                <th className="py-2 pr-3">Status</th>
                <th className="py-2 pr-3">Mensalidade</th>
                <th className="py-2 pr-3">Cidade</th>
                <th className="py-2 pr-3 text-right">Ações</th>
              </tr>
            </thead>
            <tbody>
              {filteredStudents.map((student, index) => (
                <tr key={student.id} className="border-t stagger-item" style={{ animationDelay: `${index * 0.05}s` }}>
                  <td className="py-3 pr-3 font-mono text-xs">{student.id}</td>
                  <td className="py-3 pr-3">
                    <div className="flex items-center gap-2">
                      <div className="avatar h-7 w-7">
                        <div className="avatar-fallback">{getInitials(student.nome)}</div>
                      </div>
                      <div>
                        <div className="font-medium">{student.nome}</div>
                        <div className="text-xs text-muted-foreground flex items-center gap-2">
                          <Mail className="h-3 w-3 icon-hover" />
                          {student.email}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="py-3 pr-3">
                    <div className={`badge rounded-xl capitalize status-badge ${getStatusClass(student.status)}`}>
                      {student.status}
                    </div>
                  </td>
                  <td className="py-3 pr-3">{formatCurrency(student.mensalidade)}</td>
                  <td className="py-3 pr-3 flex items-center gap-1">
                    <MapPin className="h-3 w-3 icon-hover" />
                    {student.cidade}
                  </td>
                  <td className="py-3 pr-3">
                    <div className="flex items-center justify-end gap-2">
                      {/* Botões de ação diretos */}
                      <button
                        className="btn btn-ghost btn-sm p-1.5 icon-hover"
                        onClick={() => onOpenDetails(student)}
                        title="Ver detalhes"
                      >
                        <Eye className="h-4 w-4" />
                      </button>
                      
                      {onOpenPayment && (
                        <button
                          className="btn btn-ghost btn-sm p-1.5 icon-hover text-green-600 hover:text-green-700"
                          onClick={() => onOpenPayment(student)}
                          title="Registrar pagamento"
                        >
                          <CheckCircle className="h-4 w-4" />
                        </button>
                      )}
                      
                      {onOpenWhatsApp && (
                        <button
                          className="btn btn-ghost btn-sm p-1.5 icon-hover text-green-500 hover:text-green-700"
                          onClick={() => onOpenWhatsApp(student)}
                          title="Enviar lembrete WhatsApp"
                        >
                          <MessageCircle className="h-4 w-4" />
                        </button>
                      )}
                      
                      <button
                        className="btn btn-ghost btn-sm p-1.5 icon-hover"
                        onClick={() => onEditStudent(student)}
                        title="Editar"
                      >
                        <Edit className="h-4 w-4" />
                      </button>
                      
                      <button
                        className="btn btn-ghost btn-sm p-1.5 icon-hover text-red-500 hover:text-red-700"
                        onClick={() => handleDelete(student)}
                        title="Excluir"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          
          {filteredStudents.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              <div className="text-lg font-medium mb-2">Nenhum aluno encontrado</div>
              <div className="text-sm">
                {searchQuery || statusFilter !== 'todos' 
                  ? 'Tente ajustar os filtros de busca' 
                  : 'Comece adicionando seu primeiro aluno'
                }
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Modal de confirmação de exclusão */}
      {deleteConfirm && (
        <div className="modal-overlay">
          <div className="absolute inset-0 bg-black/50" onClick={() => setDeleteConfirm(null)}></div>
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-white rounded-2xl p-6 w-96 shadow-xl">
            <div className="text-center">
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Trash2 className="h-8 w-8 text-red-600" />
              </div>
              <h3 className="text-lg font-semibold mb-2">Confirmar exclusão</h3>
              <p className="text-muted-foreground mb-6">
                Tem certeza que deseja excluir o aluno <strong>{students.find(s => s.id === deleteConfirm)?.nome}</strong>?
                <br />
                <span className="text-sm">Esta ação não pode ser desfeita.</span>
              </p>
              <div className="flex gap-3">
                <button
                  className="btn btn-outline flex-1"
                  onClick={() => setDeleteConfirm(null)}
                >
                  Cancelar
                </button>
                <button
                  className="btn btn-primary flex-1 bg-red-600 hover:bg-red-700"
                  onClick={() => {
                    const student = students.find(s => s.id === deleteConfirm);
                    if (student) confirmDelete(student);
                  }}
                >
                  Excluir
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
