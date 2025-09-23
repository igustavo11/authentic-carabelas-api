# Authentic Carabelas E-commerce API

## 📋 Descrição do Projeto

A **Authentic Carabelas API** é uma API RESTful completa para um sistema de e-commerce, desenvolvida com foco em simplicidade, performance e integração com ferramentas modernas. Construída utilizando o runtime **Bun** e o framework **Elysia**, oferece funcionalidades essenciais para gerenciamento de produtos, pedidos, autenticação de administradores e integração com WhatsApp para comunicação automatizada com clientes.

O projeto foi desenvolvido como um MVP (Minimum Viable Product) para demonstrar habilidades em desenvolvimento backend, integração de APIs externas e gerenciamento de banco de dados NoSQL. Inclui recursos avançados como upload de imagens via Cloudinary, controle automático de estoque e geração de links diretos para WhatsApp.

## 🚀 Tecnologias Utilizadas

- **Runtime**: [Bun](https://bun.com) - Runtime JavaScript rápido e moderno
- **Framework**: [Elysia](https://elysiajs.com) - Framework web leve e performático para Bun
- **Banco de Dados**: MongoDB com [Prisma](https://prisma.io) como ORM
- **Autenticação**: JWT (JSON Web Tokens) para sessões seguras
- **Upload de Imagens**: [Cloudinary](https://cloudinary.com) para armazenamento e otimização de imagens
- **Integração WhatsApp**: Geração automática de mensagens e links para comunicação com clientes
- **Documentação**: Swagger UI integrada para documentação interativa da API
- **Containerização**: Docker e Docker Compose para desenvolvimento e deploy
- **Linguagem**: TypeScript para tipagem forte e melhor manutenção

## ✨ Funcionalidades Principais

### 🔐 Sistema de Autenticação
- Registro e login de usuários administradores
- Middleware JWT para proteção de rotas administrativas
- Suporte a múltiplos administradores com credenciais fixas

### 🛍️ Gerenciamento de Produtos
- **CRUD completo**: Criar, listar, atualizar e deletar produtos
- Upload de imagens únicas e múltiplas via Cloudinary
- Suporte a categorias, tamanhos, preços e controle de estoque
- Filtros de busca por categoria e nome
- Transformações automáticas de imagens (redimensionamento, otimização)

### 📦 Sistema de Pedidos
- Criação de pedidos com validação automática de estoque
- Geração automática de números únicos para pedidos
- Integração com WhatsApp para envio de mensagens formatadas
- Controle de status de pedidos (pendente, confirmado, processando, enviado, entregue, cancelado)
- Redução automática de estoque ao confirmar entrega

### 📱 Integração com WhatsApp
- Geração automática de mensagens formatadas com detalhes do pedido
- Criação de links diretos (`wa.me`) para abertura automática do WhatsApp
- Suporte a formatação de números de telefone brasileiros
- Mensagens personalizadas com emojis e estrutura clara

### 👨‍💼 Painel Administrativo
- Dashboard para gerenciamento de produtos e pedidos
- Listagem paginada de pedidos com filtros por status
- Atualização de status de pedidos
- Verificação de estoque em tempo real

### 🔍 Outros Recursos
- Documentação interativa via Swagger UI
- CORS configurado para integração com frontends
- Logs de desenvolvimento no banco de dados
- Estrutura modular com separação clara de responsabilidades (controllers, routes, utils)

## 📡 Principais Endpoints da API

### Autenticação
- `POST /register` - Registrar novo usuário admin
- `POST /admin/login` - Login de administrador
- `GET /admin/profile` - Verificar perfil do usuário logado

### Produtos (Público)
- `GET /products` - Listar produtos com filtros (categoria, busca)
- `GET /products/:id` - Buscar produto específico

### Produtos (Admin)
- `GET /admin/products` - Listar produtos (admin)
- `POST /admin/products` - Criar novo produto
- `PUT /admin/products/:id` - Atualizar produto
- `DELETE /admin/products/:id` - Deletar produto

### Upload de Imagens
- `POST /admin/upload/image` - Upload de imagem única
- `POST /admin/upload/images` - Upload de múltiplas imagens
- `DELETE /admin/upload/image/:publicId` - Deletar imagem

### Pedidos
- `POST /orders` - Criar novo pedido
- `GET /orders/:id` - Buscar pedido por ID
- `GET /orders/number/:orderNumber` - Buscar pedido por número
- `GET /orders/:id/whatsapp` - Gerar link do WhatsApp
- `GET /inventory/products/:productId/stock` - Verificar estoque

### Pedidos (Admin)
- `GET /admin/orders` - Listar pedidos com paginação
- `PUT /admin/orders/:id/status` - Atualizar status do pedido

### Documentação
- `GET /docs` - Documentação Swagger interativa

## 🏗️ Arquitetura do Projeto

```
src/
├── config/          # Configurações (Swagger, etc.)
├── controllers/     # Lógica de negócio (Auth, Products, Orders)
├── db/              # Configuração do Prisma/MongoDB
├── routes/          # Definição de rotas da API
├── schemas/         # Validações Elysia (request/response)
├── types/           # Tipos TypeScript personalizados
├── utils/           # Utilitários (Auth, WhatsApp, Cloudinary)
└── index.ts         # Ponto de entrada da aplicação

docs/                # Documentação detalhada
prisma/              # Schema do banco de dados
```

## 🛠️ Instalação e Configuração

### Pré-requisitos
- [Bun](https://bun.sh) instalado
- [Docker](https://docker.com) e Docker Compose
- Conta no [Cloudinary](https://cloudinary.com) para upload de imagens
- MongoDB (local via Docker ou Atlas)

### Passos de Instalação

1. **Clone o repositório**:
   ```bash
   git clone <url-do-repositorio>
   cd api-bun
   ```

2. **Instale as dependências**:
   ```bash
   bun install
   ```

3. **Configure as variáveis de ambiente**:
   Copie o arquivo `.env.example` para `.env` e preencha com suas configurações:
   ```bash
   cp .env.example .env
   ```
   Edite o arquivo `.env` com os valores reais:
   ```env
   DATABASE_URL="mongodb://admin:secret@mongo:27017/ecommerce"
   JWT_SECRET="your-super-secret-jwt-key"
   CLOUDINARY_CLOUD_NAME="your-cloud-name"
   CLOUDINARY_API_KEY="your-api-key"
   CLOUDINARY_API_SECRET="your-api-secret"
   WHATSAPP_ADM="5511999999999"  # Número do admin para WhatsApp
   ALLOWED_ORIGINS="https://your-frontend-domain.com,http://localhost:3000"  # Lista de origens permitidas separadas por vírgula
   NODE_ENV="development"
   ```

4. **Suba os serviços com Docker**:
   ```bash
   docker-compose up --build
   ```

5. **Execute as migrações do banco**:
   ```bash
   bun run prisma:generate
   bun run prisma:push
   ```

6. **Inicie o servidor**:
   ```bash
   bun run index.ts
   ```



## 🎯 Destaques Técnicos

- **Performance**: Utilização do Bun para tempos de inicialização e execução superiores ao Node.js
- **Type Safety**: TypeScript em toda a aplicação para prevenção de erros em runtime
- **Integração Moderna**: Uso de Elysia para APIs rápidas e declarativas
- **Banco de Dados**: Prisma com MongoDB para flexibilidade e escalabilidade
- **Segurança**: JWT para autenticação e validações rigorosas de entrada
- **CDN Integrado**: Cloudinary para otimização automática de imagens
- **Automação**: Controle de estoque e geração de mensagens WhatsApp automática
- **Documentação**: Swagger para API self-documenting

## 📄 Licença

Este projeto está licenciado sob a MIT License - veja o arquivo [`LICENSE`](LICENSE ) para detalhes.

---

**Desenvolvido por Gustavo Bruno Ferreira** - Demonstrando expertise em desenvolvimento backend moderno, integração de APIs e arquitetura de sistemas e-commerce.
