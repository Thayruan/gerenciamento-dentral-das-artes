# Gerenciador de Alunos - React + Tailwind CSS

Sistema de gerenciamento de alunos desenvolvido com React 18, TypeScript e Tailwind CSS, baseado no design do JSX mock original.

## 🚀 Tecnologias

- **React 18** - Biblioteca para interfaces de usuário
- **TypeScript** - Superset tipado do JavaScript
- **Tailwind CSS** - Framework CSS utilitário
- **Lucide React** - Biblioteca de ícones
- **Vite** - Build tool e dev server

## ✨ Funcionalidades

- **Dashboard** com KPIs e visão geral
- **Gestão de Alunos** com tabela interativa
- **Filtros e Busca** por nome, ID, cidade ou email
- **Status dos Alunos** (Ativo, Pendente, Trancado)
- **Modal de Detalhes** com informações completas
- **Seções** para Financeiro, Relatórios e Configurações
- **Design Responsivo** com Tailwind CSS

## 🎨 Design System

- **Cores**: Paleta baseada em preto como cor primária
- **Componentes**: Cards, botões, inputs e badges customizados
- **Tipografia**: Fonte Inter para melhor legibilidade
- **Animações**: Transições suaves e animações de fade-in
- **Layout**: Grid system responsivo com sidebar fixa

## 📁 Estrutura do Projeto

```
src/
├── components/          # Componentes React
│   ├── StudentsTable.tsx
│   ├── StudentDetailsModal.tsx
│   ├── StudentForm.tsx
│   └── ReportsSection.tsx
├── hooks/              # Hooks customizados
│   └── useStudents.ts
├── services/           # Serviços de dados
│   └── localStorage.ts
├── types/              # Definições TypeScript
│   └── index.ts
├── utils/              # Funções utilitárias
│   └── helpers.ts
├── App.tsx             # Componente principal
├── index.tsx           # Ponto de entrada
└── index.css           # Estilos globais e Tailwind
```