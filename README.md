# InfraKW - Sistema de Gestão de Equipamentos de TI

Sistema web profissional para gestão de equipamentos de tecnologia e controle de manutenções, desenvolvido especificamente para empresas de varejo.

## 🎯 Funcionalidades Principais

- **Gestão de Equipamentos**: Cadastro completo de computadores, impressoras, roteadores, nobreaks e outros equipamentos de TI
- **Controle de Manutenções**: Registro e acompanhamento de manutenções preventivas e corretivas (internas e externas)
- **Upload de Documentos**: Armazenamento de notas fiscais, laudos técnicos e documentos relacionados
- **Dashboard Interativo**: Visão geral com métricas, alertas e indicadores de performance
- **Relatórios Estratégicos**: Análise de custos, frequência de manutenções e equipamentos críticos
- **Controle de Acesso**: Sistema com 4 perfis de usuário (Admin TI, Técnico TI, Diretor, Visualizador)
- **Busca Avançada**: Filtros múltiplos para localização rápida de equipamentos e manutenções

## 🛠️ Tecnologias Utilizadas

- **Frontend**: Vue.js 3 + Composition API + TypeScript
- **Styling**: CSS Global + Scoped Styles
- **Ícones**: Font Awesome
- **Backend**: Firebase (Firestore + Authentication + Storage)
- **Roteamento**: Vue Router
- **Build**: Vite

## 👥 Perfis de Usuário

| Perfil | Permissões |
|--------|------------|
| **Admin TI** | Acesso total (cadastro, edição, manutenções, relatórios, usuários) |
| **Técnico TI** | Registra e consulta manutenções, visualiza equipamentos |
| **Diretor** | Consulta geral + acesso a relatórios estratégicos |
| **Visualizador** | Acesso somente leitura |

## 📋 Módulos do Sistema

### 1. Dashboard
- Métricas de equipamentos por loja
- Equipamentos em manutenção
- Alertas de garantia
- Estatísticas de custos
- Ações rápidas

### 2. Gestão de Equipamentos
- Cadastro com dados completos
- Controle de garantia
- Upload de nota fiscal
- Localização por loja/setor
- Histórico de manutenções

### 3. Controle de Manutenções
- Manutenções preventivas e corretivas
- Registro de custos
- Anexos de laudos e notas
- Controle de prazos
- Histórico completo

### 4. Relatórios Estratégicos
- Gastos com manutenção por período
- Equipamentos fora de garantia
- Frequência de manutenções por loja
- Análise de equipamentos críticos
- Exportação em Excel/PDF

### 5. Gestão de Usuários
- Cadastro de usuários
- Controle de perfis
- Logs de acesso
- Ativação/desativação

## 🎨 Design System

### Cores
- **Primária**: Azul (#2563eb)
- **Secundária**: Teal (#14b8a6)
- **Accent**: Laranja (#f97316)
- **Sucesso**: Verde (#22c55e)
- **Aviso**: Amarelo (#f59e0b)
- **Erro**: Vermelho (#ef4444)
- **Neutros**: Escala de cinza

### Tipografia
- **Fonte**: Inter (400, 500, 600, 700)
- **Escala**: 12px - 36px
- **Espaçamento**: Sistema baseado em 8px

### Componentes
- Cards com sombras suaves
- Botões com estados hover
- Formulários com validação
- Tabelas responsivas
- Modais e overlays

## 🔧 Configuração do Projeto

### Instalação
```bash
npm install
```

### Configuração do Firebase
1. Crie um projeto no Firebase Console
2. Configure Authentication, Firestore e Storage
3. Atualize as credenciais em `src/firebase/config.ts`

### Desenvolvimento
```bash
npm run dev
```

### Build para Produção
```bash
npm run build
```

## 📁 Estrutura de Pastas

```
src/
├── assets/styles/      # Estilos globais
├── components/         # Componentes reutilizáveis
├── composables/        # Lógica de negócio
├── firebase/           # Configuração Firebase
├── router/             # Roteamento
├── types/              # Interfaces TypeScript
├── views/              # Páginas do sistema
├── App.vue             # Componente principal
└── main.ts             # Configuração da aplicação
```

## 🔐 Estrutura do Banco de Dados

### Firestore Collections
```
usuarios/
  └─ uid/
      ├─ nome
      ├─ email
      └─ role: "admin" | "tecnico" | "diretor" | "visualizador"

equipamentos/
  └─ equipamentoId/
      ├─ dados gerais
      ├─ notaFiscalUrl
      └─ manutencoes/
          └─ manutencaoId/
              ├─ tipo
              ├─ realizadaPor
              └─ anexoUrl
```

## 📱 Responsividade

O sistema é totalmente responsivo com breakpoints:
- **Mobile**: < 768px
- **Tablet**: 768px - 1024px
- **Desktop**: > 1024px

## 🚀 Funcionalidades Avançadas

- **Busca em tempo real**
- **Filtros múltiplos**
- **Upload de arquivos**
- **Exportação de relatórios**
- **Notificações push**
- **Logs de auditoria**
- **Backup automático**

## 📊 Métricas e Indicadores

- Total de equipamentos por loja
- Equipamentos em manutenção
- Garantias vencendo
- Custos mensais
- Frequência de manutenções
- Equipamentos críticos

## 🔒 Segurança

- Autenticação Firebase
- Controle de acesso baseado em roles
- Validação de dados
- Criptografia de documentos
- Logs de auditoria

## 📞 Suporte

Para suporte técnico ou dúvidas sobre o sistema, entre em contato com a equipe de desenvolvimento.

---

**InfraKW** - Sistema profissional para gestão de equipamentos de TI
© 2024 - Todos os direitos reservados