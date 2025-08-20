# 🎨 Sistema de Gestão de Alunos de Arte

Um sistema completo e robusto para gerenciar alunos de arte, com funcionalidades avançadas de cronograma, tarefas, finanças e integração com IA.

## ✨ Funcionalidades Principais

### 🎯 Gestão de Alunos
- Cadastro completo com informações pessoais e acadêmicas
- Histórico de pagamentos e mensalidades
- Sistema de aniversariantes próximos
- Dashboard com estatísticas em tempo real

### 📅 Cronograma e Tarefas
- Calendário mensal interativo
- Criação de tarefas individuais por aluno
- Sistema de status (pendente, em andamento, concluída)
- Visualização detalhada de tarefas

### 🤖 Integração com IA Gemini
- Geração automática de descrições de tarefas
- Criação de múltiplas imagens de referência
- Formatação rica com HTML (negrito, itálico, cores, links)
- Prompts inteligentes baseados em dados do aluno

### 💰 Sistema Financeiro
- Controle de mensalidades e pagamentos
- Múltiplos métodos de pagamento (PIX, dinheiro, cartão)
- Relatórios financeiros detalhados
- Sistema de lembretes via WhatsApp

### 📊 Relatórios e Analytics
- Dashboard executivo com KPIs
- Gráficos de receita e matrículas
- Relatórios de pagamentos e inadimplência
- Exportação de dados (JSON/CSV)

## 🚀 Tecnologias Utilizadas

- **Frontend**: React 18 + TypeScript
- **Estilização**: Tailwind CSS
- **Ícones**: Lucide React
- **IA**: Google Gemini AI (@google/genai)
- **Estado**: React Hooks + Local Storage
- **Build**: Create React App

## 🎨 Sistema de Imagens de Referência

### ✨ Características
- **Múltiplas imagens** por tarefa (4-6 no total)
- **Formato quadrado** (1:1) para consistência visual
- **Combinação inteligente**: IA + imagens curadas da internet
- **Temas específicos**: paisagem, retrato, animal, flor, abstrato, tatuagem

### 🔄 Fluxo de Geração
1. **Identificação de tema** baseada no título da tarefa
2. **Geração de 2-3 imagens** com IA Gemini
3. **Seleção de 2-3 imagens** curadas por tema
4. **Fallback robusto** com imagens SVG padrão

## 📱 Interface do Usuário

### 🎨 Design System
- **Cores principais**: #000 (preto) + #ff6c00 (laranja)
- **Componentes modais** com overlay fixo
- **Grid responsivo** para múltiplas imagens
- **Navegação intuitiva** entre seções

### 🔧 Componentes Principais
- `TaskModal`: Criação/edição de tarefas com IA
- `TaskViewModal`: Visualização detalhada de tarefas
- `ScheduleSection`: Calendário e cronograma
- `FinancialSection`: Gestão financeira completa
- `RichTextEditor`: Editor de texto rico para descrições

## 🛠️ Instalação e Configuração

### 📋 Pré-requisitos
- Node.js 16+ 
- npm ou yarn
- Chave de API do Google Gemini

### 🔑 Configuração da IA
1. Obter chave de API em [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Configurar no modal de configurações do sistema
3. Definir projeto ID do Gemini

### 📦 Instalação
```bash
# Clonar o repositório
git clone [URL_DO_REPOSITORIO]
cd alunos-manager-react

# Instalar dependências
npm install

# Configurar variáveis de ambiente
# Criar arquivo .env com sua chave da API Gemini

# Executar em desenvolvimento
npm start

# Build para produção
npm run build
```

## 🔧 Estrutura do Projeto

```
src/
├── components/          # Componentes React
│   ├── TaskModal.tsx   # Modal de tarefas com IA
│   ├── ScheduleSection.tsx # Seção de cronograma
│   └── FinancialSection.tsx # Sistema financeiro
├── services/           # Serviços e APIs
│   ├── geminiService.ts # Integração com IA Gemini
│   └── localStorage.ts # Persistência local
├── types/              # Definições TypeScript
├── hooks/              # Hooks customizados
└── utils/              # Utilitários e helpers
```

## 🎯 Casos de Uso

### 👨‍🎨 Para Professores de Arte
- **Criar tarefas** com descrições detalhadas geradas por IA
- **Acompanhar progresso** dos alunos
- **Gerenciar cronograma** de aulas
- **Controlar pagamentos** e mensalidades

### 🏫 Para Escolas de Arte
- **Dashboard executivo** com métricas importantes
- **Relatórios financeiros** detalhados
- **Gestão de alunos** em larga escala
- **Sistema de lembretes** automáticos

## 🔒 Segurança e Privacidade

- **Dados locais**: Todas as informações ficam no navegador
- **Sem servidor**: Aplicação 100% client-side
- **API segura**: Chaves de API não são expostas
- **Backup local**: Exportação de dados para backup

## 🚀 Roadmap

### 🔮 Próximas Funcionalidades
- [ ] Sistema de backup na nuvem
- [ ] Aplicativo mobile (React Native)
- [ ] Integração com calendários externos
- [ ] Sistema de notificações push
- [ ] Analytics avançados com métricas de engajamento

### 🎨 Melhorias de UX
- [ ] Temas personalizáveis
- [ ] Modo escuro/claro
- [ ] Atalhos de teclado
- [ ] Drag & drop para tarefas

## 🤝 Contribuição

### 📝 Como Contribuir
1. Fork do projeto
2. Criar branch para feature (`git checkout -b feature/nova-funcionalidade`)
3. Commit das alterações (`git commit -m 'feat: nova funcionalidade'`)
4. Push para branch (`git push origin feature/nova-funcionalidade`)
5. Abrir Pull Request

### 🐛 Reportar Bugs
- Usar o sistema de Issues do GitHub
- Incluir passos para reproduzir
- Adicionar screenshots quando relevante
- Especificar ambiente (navegador, OS)

## 📄 Licença

Este projeto está sob a licença MIT. Veja o arquivo [LICENSE](LICENSE) para mais detalhes.

## 👨‍💻 Autor

**Thayr** - Desenvolvedor Full Stack
- GitHub: [@seu-usuario](https://github.com/seu-usuario)
- LinkedIn: [seu-perfil](https://linkedin.com/in/seu-perfil)

## 🙏 Agradecimentos

- **Google Gemini AI** pela integração de IA
- **Tailwind CSS** pelo sistema de design
- **React Community** pelos componentes e hooks
- **Lucide** pelos ícones elegantes

---

⭐ **Se este projeto te ajudou, considere dar uma estrela no GitHub!**