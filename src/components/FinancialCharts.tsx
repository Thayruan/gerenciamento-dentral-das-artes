import React from 'react';
import { TrendingUp, TrendingDown, DollarSign } from 'lucide-react';

interface ChartData {
  label: string;
  value: number;
  color: string;
  percentage?: number;
}

interface FinancialChartsProps {
  receitaData: ChartData[];
  statusData: ChartData[];
  monthlyData?: { month: string; value: number; }[];
}

export const FinancialCharts: React.FC<FinancialChartsProps> = ({
  receitaData,
  statusData,
  monthlyData = []
}) => {
  const total = receitaData.reduce((sum, item) => sum + item.value, 0);

  // Calcular percentuais para gráfico de pizza
  const pieData = receitaData.map(item => ({
    ...item,
    percentage: total > 0 ? (item.value / total) * 100 : 0
  }));

  // Criar gráfico de pizza usando CSS
  const PieChart = ({ data }: { data: ChartData[] }) => {
    let cumulativePercentage = 0;

    return (
      <div className="relative w-48 h-48 mx-auto">
        <svg className="w-48 h-48 transform -rotate-90" viewBox="0 0 100 100">
          <circle
            cx="50"
            cy="50"
            r="40"
            fill="transparent"
            stroke="#f3f4f6"
            strokeWidth="10"
          />
          {data.map((item, index) => {
            const percentage = item.percentage || 0;
            const strokeDasharray = `${percentage * 2.51} 251.2`; // 2π * 40 = 251.2
            const strokeDashoffset = -cumulativePercentage * 2.51;
            cumulativePercentage += percentage;

            return (
              <circle
                key={index}
                cx="50"
                cy="50"
                r="40"
                fill="transparent"
                stroke={item.color}
                strokeWidth="10"
                strokeDasharray={strokeDasharray}
                strokeDashoffset={strokeDashoffset}
                className="transition-all duration-1000 ease-in-out"
                style={{
                  animationDelay: `${index * 0.2}s`
                }}
              />
            );
          })}
        </svg>
        
        {/* Centro do gráfico */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center">
            <DollarSign className="h-8 w-8 text-gray-400 mx-auto mb-1" />
            <div className="text-sm text-gray-600">Total</div>
          </div>
        </div>
      </div>
    );
  };

  // Gráfico de barras simples
  const BarChart = ({ data }: { data: ChartData[] }) => {
    const maxValue = Math.max(...data.map(item => item.value));

    return (
      <div className="space-y-4">
        {data.map((item, index) => {
          const percentage = maxValue > 0 ? (item.value / maxValue) * 100 : 0;
          
          return (
            <div key={index} className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium text-gray-700">{item.label}</span>
                <span className="text-sm font-semibold text-gray-900">{item.value}</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-3">
                <div
                  className="h-3 rounded-full transition-all duration-1000 ease-out"
                  style={{
                    width: `${percentage}%`,
                    backgroundColor: item.color,
                    animationDelay: `${index * 0.1}s`
                  }}
                />
              </div>
            </div>
          );
        })}
      </div>
    );
  };

  // Gráfico de linha simples
  const LineChart = ({ data }: { data: { month: string; value: number; }[] }) => {
    if (data.length === 0) return null;

    const maxValue = Math.max(...data.map(item => item.value));
    const minValue = Math.min(...data.map(item => item.value));
    const range = maxValue - minValue;

    return (
      <div className="relative h-64 w-full">
        <svg className="w-full h-full" viewBox="0 0 400 200">
          {/* Grid lines */}
          {[0, 1, 2, 3, 4].map(i => (
            <line
              key={i}
              x1="40"
              y1={40 + i * 32}
              x2="380"
              y2={40 + i * 32}
              stroke="#f3f4f6"
              strokeWidth="1"
            />
          ))}

          {/* Line path */}
          <path
            d={data.map((item, index) => {
              const x = 40 + (index * (340 / (data.length - 1 || 1)));
              const y = range > 0 
                ? 40 + ((maxValue - item.value) / range) * 120
                : 100;
              return `${index === 0 ? 'M' : 'L'} ${x} ${y}`;
            }).join(' ')}
            fill="none"
            stroke="#3b82f6"
            strokeWidth="3"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="animate-pulse"
          />

          {/* Data points */}
          {data.map((item, index) => {
            const x = 40 + (index * (340 / (data.length - 1 || 1)));
            const y = range > 0 
              ? 40 + ((maxValue - item.value) / range) * 120
              : 100;

            return (
              <circle
                key={index}
                cx={x}
                cy={y}
                r="4"
                fill="#3b82f6"
                className="hover:r-6 transition-all cursor-pointer"
              >
                <title>{`${item.month}: ${item.value}`}</title>
              </circle>
            );
          })}

          {/* X-axis labels */}
          {data.map((item, index) => {
            const x = 40 + (index * (340 / (data.length - 1 || 1)));
            return (
              <text
                key={index}
                x={x}
                y="185"
                textAnchor="middle"
                className="text-xs fill-gray-500"
              >
                {item.month}
              </text>
            );
          })}
        </svg>
      </div>
    );
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
      {/* Gráfico de Pizza - Distribuição de Receita */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-6">Distribuição de Receita</h3>
        
        <PieChart data={pieData} />
        
        {/* Legenda */}
        <div className="mt-6 space-y-3">
          {pieData.map((item, index) => (
            <div key={index} className="flex items-center justify-between">
              <div className="flex items-center">
                <div 
                  className="w-4 h-4 rounded-full mr-3"
                  style={{ backgroundColor: item.color }}
                />
                <span className="text-sm text-gray-700">{item.label}</span>
              </div>
              <div className="text-right">
                <div className="text-sm font-semibold text-gray-900">
                  R$ {item.value.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                </div>
                <div className="text-xs text-gray-500">
                  {item.percentage?.toFixed(1)}%
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Gráfico de Barras - Status dos Alunos */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-6">Status dos Alunos</h3>
        <BarChart data={statusData} />
      </div>

      {/* Gráfico de Linha - Evolução Mensal */}
      {monthlyData.length > 0 && (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 lg:col-span-2 xl:col-span-1">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-gray-900">Evolução Mensal</h3>
            <div className="flex items-center text-sm text-green-600">
              <TrendingUp className="h-4 w-4 mr-1" />
              <span>+12.5%</span>
            </div>
          </div>
          <LineChart data={monthlyData} />
        </div>
      )}

      {/* Cards de Métricas Adicionais */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 lg:col-span-2 xl:col-span-3">
        <h3 className="text-lg font-semibold text-gray-900 mb-6">Métricas Detalhadas</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="text-center p-4 bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl">
            <div className="text-2xl font-bold text-blue-600 mb-2">
              {((receitaData[1]?.value || 0) / (receitaData[0]?.value || 1) * 100).toFixed(1)}%
            </div>
            <div className="text-sm text-blue-700 font-medium">Taxa de Recebimento</div>
            <div className="flex items-center justify-center mt-2 text-xs text-blue-600">
              <TrendingUp className="h-3 w-3 mr-1" />
              +5.2% vs mês anterior
            </div>
          </div>

          <div className="text-center p-4 bg-gradient-to-br from-green-50 to-green-100 rounded-xl">
            <div className="text-2xl font-bold text-green-600 mb-2">
              R$ {((receitaData[1]?.value || 0) / (statusData[0]?.value || 1)).toLocaleString('pt-BR', { minimumFractionDigits: 0 })}
            </div>
            <div className="text-sm text-green-700 font-medium">Ticket Médio</div>
            <div className="flex items-center justify-center mt-2 text-xs text-green-600">
              <TrendingUp className="h-3 w-3 mr-1" />
              +8.1% vs mês anterior
            </div>
          </div>

          <div className="text-center p-4 bg-gradient-to-br from-yellow-50 to-yellow-100 rounded-xl">
            <div className="text-2xl font-bold text-yellow-600 mb-2">
              {statusData[2]?.value || 0}
            </div>
            <div className="text-sm text-yellow-700 font-medium">Alunos Pendentes</div>
            <div className="flex items-center justify-center mt-2 text-xs text-yellow-600">
              <TrendingDown className="h-3 w-3 mr-1" />
              -2.3% vs mês anterior
            </div>
          </div>

          <div className="text-center p-4 bg-gradient-to-br from-red-50 to-red-100 rounded-xl">
            <div className="text-2xl font-bold text-red-600 mb-2">
              {((receitaData[2]?.value || 0) / (receitaData[0]?.value || 1) * 100).toFixed(1)}%
            </div>
            <div className="text-sm text-red-700 font-medium">Taxa de Inadimplência</div>
            <div className="flex items-center justify-center mt-2 text-xs text-red-600">
              <TrendingDown className="h-3 w-3 mr-1" />
              -1.8% vs mês anterior
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
