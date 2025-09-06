# 🛒 Guia da API de Pedidos - Authentic Carabelas

## 📋 Visão Geral

A API de pedidos permite criar, gerenciar e acompanhar pedidos de e-commerce com integração ao WhatsApp para comunicação com clientes.

## 🔗 Endpoints Disponíveis

### **Públicos (Frontend)**
- `POST /orders` - Criar novo pedido
- `GET /orders/:id` - Buscar pedido por ID
- `GET /orders/number/:orderNumber` - Buscar pedido por número
- `GET /orders/:id/whatsapp` - Gerar link do WhatsApp
- `GET /products/:productId/stock` - Verificar estoque de produto

### **Admin (Protegidos)**
- `GET /admin/orders` - Listar pedidos com paginação
- `PUT /admin/orders/:id/status` - Atualizar status do pedido

---

## 🛍️ 1. CRIAR PEDIDO

**POST** `/orders`

**Body (JSON):**
```json
{
  "customerName": "João Silva",
  "customerPhone": "11999999999",
  "items": [
    {
      "productId": "65f8a1b2c3d4e5f6a7b8c9d1",
      "productName": "Camiseta Básica",
      "price": 29.90,
      "quantity": 2,
      "size": "M",
      "imageUrl": "https://example.com/camiseta.jpg"
    },
    {
      "productId": "65f8a1b2c3d4e5f6a7b8c9d2",
      "productName": "Calça Jeans",
      "price": 89.90,
      "quantity": 1,
      "size": "G",
      "imageUrl": "https://example.com/calca.jpg"
    }
  ],
  "total": 149.70
}
```

**Resposta (201):**
```json
{
  "message": "Pedido criado com sucesso!",
  "order": {
    "id": "65f8a1b2c3d4e5f6a7b8c9d3",
    "orderNumber": "ORD-1703123456789-ABC1",
    "customerName": "João Silva",
    "customerPhone": "11999999999",
    "items": [
      {
        "productId": "65f8a1b2c3d4e5f6a7b8c9d1",
        "productName": "Camiseta Básica",
        "price": 29.90,
        "quantity": 2,
        "size": "M",
        "imageUrl": "https://example.com/camiseta.jpg"
      }
    ],
    "total": 149.70,
    "status": "pending",
    "whatsappMessage": "🛍️ *NOVO PEDIDO - ORD-1703123456789-ABC1*\n\n👤 *Cliente:* João Silva\n📱 *Telefone:* 11999999999\n\n📦 *Itens do Pedido:*\n1. *Camiseta Básica*\n   💰 Preço: R$ 29,90\n   📏 Quantidade: 2\n   📐 Tamanho: M\n   💵 Subtotal: R$ 59,80\n\n2. *Calça Jeans*\n   💰 Preço: R$ 89,90\n   📏 Quantidade: 1\n   📐 Tamanho: G\n   💵 Subtotal: R$ 89,90\n\n💰 *TOTAL DO PEDIDO: R$ 149,70*\n\n📞 *Para confirmar o pedido, entre em contato conosco!*\n🕒 *Horário de atendimento: Segunda a Sexta, 9h às 18h*",
    "whatsappLink": "https://wa.me/5511999999999?text=🛍️%20*NOVO%20PEDIDO%20-%20ORD-1703123456789-ABC1*...",
    "createdAt": "2023-12-21T10:30:00.000Z"
  }
}
```

---

## 🔍 2. BUSCAR PEDIDO

**GET** `/orders/:id`

**Resposta (200):**
```json
{
  "order": {
    "id": "65f8a1b2c3d4e5f6a7b8c9d3",
    "orderNumber": "ORD-1703123456789-ABC1",
    "customerName": "João Silva",
    "items": [...],
    "total": 149.70,
    "status": "pending",
    "whatsappMessage": "...",
    "createdAt": "2023-12-21T10:30:00.000Z",
    "updatedAt": "2023-12-21T10:30:00.000Z"
  }
}
```

---

## 📱 3. GERAR LINK DO WHATSAPP

**GET** `/orders/:id/whatsapp`

**Resposta (200):**
```json
{
  "whatsappMessage": "🛍️ *NOVO PEDIDO - ORD-1703123456789-ABC1*\n\n👤 *Cliente:* João Silva\n\n📦 *Itens do Pedido:*\n1. *Camiseta Básica*\n   💰 Preço: R$ 29,90\n   📏 Quantidade: 2\n   📐 Tamanho: M\n   💵 Subtotal: R$ 59,80\n\n💰 *TOTAL DO PEDIDO: R$ 149,70*\n\n📞 *Para confirmar o pedido, entre em contato conosco!*\n🕒 *Horário de atendimento: Segunda a Sexta, 9h às 18h*",
  "message": "Mensagem do WhatsApp gerada com sucesso!"
}
```

---

## 👨‍💼 4. LISTAR PEDIDOS (ADMIN)

**GET** `/admin/orders`

**Query Parameters:**
- `status` (opcional): Filtrar por status
- `page` (opcional): Número da página (padrão: 1)
- `limit` (opcional): Itens por página (padrão: 10)

**Exemplos:**
- `GET /admin/orders`
- `GET /admin/orders?status=pending`
- `GET /admin/orders?page=2&limit=5`

**Headers:**
```
Authorization: Bearer SEU_TOKEN_AQUI
```

**Resposta (200):**
```json
{
  "orders": [
    {
      "id": "65f8a1b2c3d4e5f6a7b8c9d3",
      "orderNumber": "ORD-1703123456789-ABC1",
      "customerName": "João Silva",
      "total": 149.70,
      "status": "pending",
      "createdAt": "2023-12-21T10:30:00.000Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 25,
    "totalPages": 3
  }
}
```

---

## 🔄 5. ATUALIZAR STATUS (ADMIN)

**PUT** `/admin/orders/:id/status`

**Headers:**
```
Authorization: Bearer SEU_TOKEN_AQUI
Content-Type: application/json
```

**Body (JSON):**
```json
{
  "status": "confirmed"
}
```

**Status disponíveis:**
- `pending` - Pendente
- `confirmed` - Confirmado
- `processing` - Processando
- `shipped` - Enviado
- `delivered` - Entregue
- `cancelled` - Cancelado

**Resposta (200):**
```json
{
  "message": "Status do pedido atualizado com sucesso!",
  "order": {
    "id": "65f8a1b2c3d4e5f6a7b8c9d3",
    "orderNumber": "ORD-1703123456789-ABC1",
    "status": "confirmed"
  },
  "whatsappMessage": "🔄 *ATUALIZAÇÃO DE PEDIDO*\n\n📋 Número do Pedido: *ORD-1703123456789-ABC1*\n📊 Status Anterior: *⏳ Pendente*\n📊 Novo Status: *✅ Confirmado*\n\n"
}
```

---

## 📦 6. CONTROLE DE ESTOQUE

### **6.1 Verificação Automática de Estoque**

A API verifica automaticamente o estoque antes de criar pedidos:

**Resposta de erro (400) quando estoque insuficiente:**
```json
{
  "message": "Estoque insuficiente para alguns produtos",
  "errors": [
    "Estoque insuficiente para Camiseta Básica. Disponível: 5, Solicitado: 10",
    "Produto Calça Jeans (ID: 65f8a1b2c3d4e5f6a7b8c9d2) não encontrado"
  ]
}
```

### **6.2 Redução Automática de Estoque**

Quando um pedido é marcado como **"delivered"** (entregue):
- ✅ Estoque é reduzido automaticamente
- ✅ Quantidade vendida é subtraída do estoque
- ✅ Logs são gerados para auditoria

### **6.3 Restauração de Estoque**

Quando um pedido é cancelado após entrega:
- ✅ Estoque é restaurado automaticamente
- ✅ Quantidade é devolvida ao estoque
- ✅ Logs são gerados para auditoria

### **6.4 Verificar Estoque de Produto**

**GET** `/inventory/products/:productId/stock`

**Resposta (200):**
```json
{
  "productId": "65f8a1b2c3d4e5f6a7b8c9d1",
  "stock": 25,
  "available": true
}
```

**Resposta (404):**
```json
{
  "message": "Produto não encontrado"
}
```

### **6.5 Atualização de Status com Controle de Estoque**

**PUT** `/admin/orders/:id/status`

**Body (JSON):**
```json
{
  "status": "delivered"
}
```

**Resposta (200) - Sucesso:**
```json
{
  "message": "Status do pedido atualizado com sucesso!",
  "order": {
    "id": "65f8a1b2c3d4e5f6a7b8c9d3",
    "orderNumber": "ORD-1703123456789-ABC1",
    "status": "delivered"
  },
  "whatsappMessage": "🔄 *ATUALIZAÇÃO DE PEDIDO*...",
  "whatsappLink": "https://wa.me/5511999999999?text=..."
}
```

**Resposta (200) - Com avisos de estoque:**
```json
{
  "message": "Status do pedido atualizado com sucesso!",
  "order": {
    "id": "65f8a1b2c3d4e5f6a7b8c9d3",
    "orderNumber": "ORD-1703123456789-ABC1",
    "status": "delivered"
  },
  "whatsappMessage": "🔄 *ATUALIZAÇÃO DE PEDIDO*...",
  "whatsappLink": "https://wa.me/5511999999999?text=...",
  "stockWarnings": [
    "Erro ao reduzir estoque de Camiseta Básica: Produto não encontrado"
  ]
}
```

---

## 📱 7. INTEGRAÇÃO COM WHATSAPP

### **Mensagem de Pedido**
A API gera automaticamente uma mensagem formatada para WhatsApp com:
- ✅ Número do pedido
- 👤 Dados do cliente
- 📦 Lista detalhada de produtos
- 💰 Preço total
- 📝 Observações
- 📞 Informações de contato

### **Exemplo de Mensagem:**
```
🛍️ *NOVO PEDIDO - ORD-1703123456789-ABC1*

👤 *Cliente:* João Silva

📦 *Itens do Pedido:*
1. *Camiseta Básica*
   💰 Preço: R$ 29,90
   📏 Quantidade: 2
   📐 Tamanho: M
   💵 Subtotal: R$ 59,80

2. *Calça Jeans*
   💰 Preço: R$ 89,90
   📏 Quantidade: 1
   📐 Tamanho: G
   💵 Subtotal: R$ 89,90

💰 *TOTAL DO PEDIDO: R$ 149,70*

📞 *Para confirmar o pedido, entre em contato conosco!*
🕒 *Horário de atendimento: Segunda a Sexta, 9h às 18h*
```

---

## 🧪 7. SEQUÊNCIA DE TESTES

1. **Criar pedido** com `POST /orders`
2. **Buscar pedido** com `GET /orders/:id`
3. **Gerar link WhatsApp** com `GET /orders/:id/whatsapp`
4. **Listar pedidos** (admin) com `GET /admin/orders`
5. **Atualizar status** (admin) com `PUT /admin/orders/:id/status`

---

## ⚠️ 8. CÓDIGOS DE ERRO

- **400 Bad Request**: Dados inválidos
- **401 Unauthorized**: Token inválido (admin)
- **404 Not Found**: Pedido não encontrado
- **500 Internal Server Error**: Erro no servidor

---

## 🔧 9. CONFIGURAÇÃO

### **Variáveis de Ambiente Necessárias:**
```env
DATABASE_URL=mongodb://admin:secret@mongo:27017/ecommerce
JWT_SECRET=your-jwt-secret
WHATSAPP_ADM=5511999999999
```

**Configuração do WhatsApp Admin:**
- `WHATSAPP_ADM`: Número do WhatsApp do administrador (formato: 5511999999999)
- Este número receberá os pedidos criados pelos clientes
- Deve incluir o código do país (55 para Brasil) e DDD

### **Dependências:**
- Prisma Client
- Elysia Framework
- MongoDB

---

## 📊 10. ESTRUTURA DO BANCO

### **Tabela Orders:**
- `id` - ID único do pedido
- `orderNumber` - Número do pedido (único)
- `customerName` - Nome do cliente
- `items` - JSON string com os itens do pedido
- `total` - Valor total
- `status` - Status do pedido
- `whatsappMessage` - Mensagem formatada para WhatsApp
- `createdAt` - Data de criação
- `updatedAt` - Data de atualização

---

## 🔄 11. FLUXO COMPLETO COM CONTROLE DE ESTOQUE

### **Fluxo de Pedido Completo:**

1. **Cliente adiciona produtos** ao carrinho
2. **Sistema verifica estoque** automaticamente
3. **Cliente informa nome e telefone** antes de finalizar
4. **Sistema cria o pedido** via API (se estoque disponível)
5. **API gera mensagem e link** formatados para WhatsApp
6. **Sistema mostra a mensagem** para o vendedor
7. **Vendedor clica no link** para abrir WhatsApp automaticamente
8. **Cliente confirma** o pedido via WhatsApp
9. **Admin atualiza status** para "delivered"
10. **Sistema reduz estoque** automaticamente
11. **Admin envia notificação** via WhatsApp para o cliente

### **Cenários de Estoque:**

- ✅ **Estoque suficiente**: Pedido criado normalmente
- ❌ **Estoque insuficiente**: Pedido rejeitado com erro detalhado
- 🔄 **Status "delivered"**: Estoque reduzido automaticamente
- 🔄 **Cancelamento após entrega**: Estoque restaurado automaticamente

---

**🎉 A API de pedidos está pronta para uso! Agora você pode criar pedidos, gerenciá-los, controlar estoque automaticamente e enviar mensagens formatadas via WhatsApp para seus clientes.**
