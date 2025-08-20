import React, { useMemo } from 'react';
import { 
  TrendingUp, 
  TrendingDown, 
  Calendar, 
  MapPin, 
  Users, 
  CreditCard, 
  AlertTriangle,
  Download,
  BarChart3,
  PieChart,
  Activity
} from 'lucide-react';
import { Student } from '../types';
import { formatCurrency } from '../utils/helpers';

interface ReportsSectionProps {
  students: Student[];
}

export const ReportsSection: React.FC<ReportsSectionProps> = ({ students }) => {
  const reports = useMemo(() => {
    if (!Array.isArray(students) || students.length === 0) {
      return {
        financeiro: { receitaTotal: 0, receitaVencida: 0, receitaPendente: 0, inadimplencia: 0 },
        vencimentos: { vencidas: 0, vencemHoje: 0, vencemProximos7Dias: 0, vencemProximos30Dias: 0 },
        demografico: { porCidade: {}, porIdade: {}, porStatus: {} },
        tendencias: { crescimento: 0, evasao: 0, retencao: 0 }
      };
    }

    const hoje = new Date();
    const hojeStr = hoje.toISOString().split('T')[0];
    
    // Análise Financeira
    const ativos = students.filter(s => s.status === 'ativo');
    const pendentes = students.filter(s => s.status === 'pendente');
    
    const receitaTotal = ativos.reduce((sum, s) => sum + s.mensalidade, 0);
    const receitaVencida = ativos
      .filter(s => s.vencimentoMensalidade && s.vencimentoMensalidade < hojeStr)
      .reduce((sum, s) => sum + s.mensalidade, 0);
    const receitaPendente = pendentes.reduce((sum, s) => sum + s.mensalidade, 0);
    const inadimplencia = receitaTotal > 0 ? (receitaVencida / receitaTotal) * 100 : 0;

    // Análise de Vencimentos
    const vencidas = ativos.filter(s => s.vencimentoMensalidade && s.vencimentoMensalidade < hojeStr);
    const vencemHoje = ativos.filter(s => s.vencimentoMensalidade === hojeStr);
    
    const proximos7Dias = new Date(hoje);
    proximos7Dias.setDate(hoje.getDate() + 7);
    const vencemProximos7Dias = ativos.filter(s => {
      if (!s.vencimentoMensalidade) return false;
      const vencimento = new Date(s.vencimentoMensalidade);
      return vencimento > hoje && vencimento <= proximos7Dias;
    });
    
    const proximos30Dias = new Date(hoje);
    proximos30Dias.setDate(hoje.getDate() + 30);
    const vencemProximos30Dias = ativos.filter(s => {
      if (!s.vencimentoMensalidade) return false;
      const vencimento = new Date(s.vencimentoMensalidade);
      return vencimento > hoje && vencimento <= proximos30Dias;
    });

    // Análise Demográfica
    const porCidade = students.reduce((acc, s) => {
      acc[s.cidade] = (acc[s.cidade] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const porStatus = students.reduce((acc, s) => {
      acc[s.status] = (acc[s.status] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const porIdade = students.reduce((acc, s) => {
      const idade = hoje.getFullYear() - new Date(s.nasc).getFullYear();
      const faixa = idade < 18 ? '17 anos ou menos' : 
                   idade < 25 ? '18-24 anos' : 
                   idade < 35 ? '25-34 anos' : '35 anos ou mais';
      acc[faixa] = (acc[faixa] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    // Análise de Tendências (simulada)
    const crescimento = ativos.length > 0 ? Math.round((ativos.length / students.length) * 100) : 0;
    const evasao = pendentes.length > 0 ? Math.round((pendentes.length / students.length) * 100) : 0;
    const retencao = 100 - evasao;

    return {
      financeiro: { receitaTotal, receitaVencida, receitaPendente, inadimplencia },
      vencimentos: { 
        vencidas: vencidas.length, 
        vencemHoje: vencemHoje.length, 
        vencemProximos7Dias: vencemProximos7Dias.length, 
        vencemProximos30Dias: vencemProximos30Dias.length 
      },
      demografico: { porCidade, porIdade, porStatus },
      tendencias: { crescimento, evasao, retencao }
    };
  }, [students]);

  const exportReport = () => {
    const reportData = {
      dataGeracao: new Date().toISOString(),
      totalAlunos: students.length,
      relatorio: reports
    };
    
    const blob = new Blob([JSON.stringify(reportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `relatorio_alunos_${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      {/* Cabeçalho dos Relatórios */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Relatórios e Análises</h2>
          <p className="text-gray-600 mt-1">Análises detalhadas sobre alunos, finanças e tendências</p>
        </div>
        <button 
          onClick={exportReport}
          className="btn btn-primary rounded-xl flex items-center gap-2"
        >
          <Download className="h-4 w-4" />
          Exportar Relatório
        </button>
      </div>

      {/* KPIs Principais */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="card rounded-2xl">
          <div className="card-content p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Receita Total</p>
                <p className="text-2xl font-bold text-green-600">
                  {formatCurrency(reports.financeiro.receitaTotal)}
                </p>
              </div>
              <div className="h-12 w-12 bg-green-100 rounded-full flex items-center justify-center">
                <CreditCard className="h-6 w-6 text-green-600" />
              </div>
            </div>
          </div>
        </div>

        <div className="card rounded-2xl">
          <div className="card-content p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Mensalidades Vencidas</p>
                <p className="text-2xl font-bold text-red-600">
                  {formatCurrency(reports.financeiro.receitaVencida)}
                </p>
              </div>
              <div className="h-12 w-12 bg-red-100 rounded-full flex items-center justify-center">
                <AlertTriangle className="h-6 w-6 text-red-600" />
              </div>
            </div>
          </div>
        </div>

        <div className="card rounded-2xl">
          <div className="card-content p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Taxa de Inadimplência</p>
                <p className="text-2xl font-bold text-orange-600">
                  {reports.financeiro.inadimplencia.toFixed(1)}%
                </p>
              </div>
              <div className="h-12 w-12 bg-orange-100 rounded-full flex items-center justify-center">
                <TrendingDown className="h-6 w-6 text-orange-600" />
              </div>
            </div>
          </div>
        </div>

        <div className="card rounded-2xl">
          <div className="card-content p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Taxa de Retenção</p>
                <p className="text-2xl font-bold text-blue-600">
                  {reports.tendencias.retencao}%
                </p>
              </div>
              <div className="h-12 w-12 bg-blue-100 rounded-full flex items-center justify-center">
                <TrendingUp className="h-6 w-6 text-blue-600" />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Análise de Vencimentos */}
      <div className="card rounded-2xl">
        <div className="card-header">
          <div className="card-title flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Análise de Vencimentos
          </div>
        </div>
        <div className="card-content">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="text-center p-4 bg-red-50 rounded-xl border border-red-200">
              <div className="text-2xl font-bold text-red-600">{reports.vencimentos.vencidas}</div>
              <div className="text-sm text-red-700">Vencidas</div>
            </div>
            <div className="text-center p-4 bg-orange-50 rounded-xl border border-orange-200">
              <div className="text-2xl font-bold text-orange-600">{reports.vencimentos.vencemHoje}</div>
              <div className="text-sm text-orange-700">Vencem Hoje</div>
            </div>
            <div className="text-center p-4 bg-yellow-50 rounded-xl border border-yellow-200">
              <div className="text-2xl font-bold text-yellow-600">{reports.vencimentos.vencemProximos7Dias}</div>
              <div className="text-sm text-yellow-700">Próximos 7 dias</div>
            </div>
            <div className="text-center p-4 bg-green-50 rounded-xl border border-green-200">
              <div className="text-2xl font-bold text-green-600">{reports.vencimentos.vencemProximos30Dias}</div>
              <div className="text-sm text-green-700">Próximos 30 dias</div>
            </div>
          </div>
        </div>
      </div>

      {/* Análises Demográficas */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Distribuição por Cidade */}
        <div className="card rounded-2xl">
          <div className="card-header">
            <div className="card-title flex items-center gap-2">
              <MapPin className="h-5 w-5" />
              Distribuição por Cidade
            </div>
          </div>
          <div className="card-content">
            <div className="space-y-3">
              {Object.entries(reports.demografico.porCidade)
                .sort(([,a], [,b]) => b - a)
                .map(([cidade, quantidade]) => (
                  <div key={cidade} className="flex items-center justify-between">
                    <span className="text-sm font-medium">{cidade}</span>
                    <div className="flex items-center gap-2">
                      <div className="w-24 bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-blue-600 h-2 rounded-full" 
                          style={{ width: `${(quantidade / students.length) * 100}%` }}
                        ></div>
                      </div>
                      <span className="text-sm text-muted-foreground w-8 text-right">
                        {quantidade}
                      </span>
                    </div>
                  </div>
                ))}
            </div>
          </div>
        </div>

        {/* Distribuição por Status */}
        <div className="card rounded-2xl">
          <div className="card-header">
            <div className="card-title flex items-center gap-2">
              <Users className="h-5 w-5" />
              Distribuição por Status
            </div>
          </div>
          <div className="card-content">
            <div className="space-y-3">
              {Object.entries(reports.demografico.porStatus).map(([status, quantidade]) => {
                const cores = {
                  ativo: 'bg-green-600',
                  pendente: 'bg-orange-600',
                  trancado: 'bg-red-600'
                };
                const labels = {
                  ativo: 'Ativo',
                  pendente: 'Pendente',
                  trancado: 'Trancado'
                };
                
                return (
                  <div key={status} className="flex items-center justify-between">
                    <span className="text-sm font-medium capitalize">{labels[status as keyof typeof labels]}</span>
                    <div className="flex items-center gap-2">
                      <div className="w-24 bg-gray-200 rounded-full h-2">
                        <div 
                          className={`h-2 rounded-full ${cores[status as keyof typeof cores]}`}
                          style={{ width: `${(quantidade / students.length) * 100}%` }}
                        ></div>
                      </div>
                      <span className="text-sm text-muted-foreground w-8 text-right">
                        {quantidade}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Análise de Tendências */}
      <div className="card rounded-2xl">
        <div className="card-header">
          <div className="card-title flex items-center gap-2">
            <Activity className="h-5 w-5" />
            Análise de Tendências
          </div>
        </div>
        <div className="card-content">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="text-3xl font-bold text-green-600 mb-2">
                {reports.tendencias.crescimento}%
              </div>
              <div className="text-sm text-muted-foreground">Taxa de Crescimento</div>
              <div className="text-xs text-green-600 mt-1">Alunos ativos</div>
            </div>
            
            <div className="text-center">
              <div className="text-3xl font-bold text-blue-600 mb-2">
                {reports.tendencias.retencao}%
              </div>
              <div className="text-sm text-muted-foreground">Taxa de Retenção</div>
              <div className="text-xs text-blue-600 mt-1">Alunos fiéis</div>
            </div>
            
            <div className="text-center">
              <div className="text-3xl font-bold text-orange-600 mb-2">
                {reports.tendencias.evasao}%
              </div>
              <div className="text-sm text-muted-foreground">Taxa de Evasão</div>
              <div className="text-xs text-orange-600 mt-1">Alunos em risco</div>
            </div>
          </div>
        </div>
      </div>

      {/* Recomendações */}
      <div className="card rounded-2xl">
        <div className="card-header">
          <div className="card-title flex items-center gap-2">
            <BarChart3 className="h-5 w-5" />
            Recomendações e Insights
          </div>
        </div>
        <div className="card-content">
          <div className="space-y-4">
            {reports.financeiro.inadimplencia > 10 && (
              <div className="p-4 bg-red-50 rounded-xl border border-red-200">
                <div className="flex items-center gap-2 mb-2">
                  <AlertTriangle className="h-5 w-5 text-red-600" />
                  <span className="font-medium text-red-800">Atenção à Inadimplência</span>
                </div>
                <p className="text-sm text-red-700">
                  A taxa de inadimplência está em {reports.financeiro.inadimplencia.toFixed(1)}%. 
                  Considere implementar estratégias de cobrança mais proativas.
                </p>
              </div>
            )}
            
            {reports.vencimentos.vencidas > 0 && (
              <div className="p-4 bg-orange-50 rounded-xl border border-orange-200">
                <div className="flex items-center gap-2 mb-2">
                  <Calendar className="h-5 w-5 text-orange-600" />
                  <span className="font-medium text-orange-800">Mensalidades Vencidas</span>
                </div>
                <p className="text-sm text-orange-700">
                  {reports.vencimentos.vencidas} mensalidade(s) vencida(s) totalizando {formatCurrency(reports.financeiro.receitaVencida)}. 
                  Priorize o contato com estes alunos.
                </p>
              </div>
            )}
            
            {reports.tendencias.retencao > 80 && (
              <div className="p-4 bg-green-50 rounded-xl border border-green-200">
                <div className="flex items-center gap-2 mb-2">
                  <TrendingUp className="h-5 w-5 text-green-600" />
                  <span className="font-medium text-green-800">Excelente Retenção</span>
                </div>
                <p className="text-sm text-green-700">
                  Taxa de retenção de {reports.tendencias.retencao}% indica alta satisfação dos alunos. 
                  Continue mantendo a qualidade do serviço!
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
