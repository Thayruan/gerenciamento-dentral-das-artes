export function formatCurrency(value: number): string {
  try {
    return value?.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
  } catch (_) {
    return `R$ ${Number(value || 0).toFixed(2).replace('.', ',')}`;
  }
}

export function getInitials(name: string): string {
  return String(name || '?')
    .split(' ')
    .filter(Boolean)
    .map((p) => p[0])
    .slice(0, 2)
    .join('');
}

export function getStatusClass(status: string): string {
  switch (status) {
    case 'ativo': return 'badge-default';
    case 'pendente': return 'badge-secondary';
    case 'trancado': return 'badge-outline';
    default: return 'badge-secondary';
  }
}


