# 🚀 MVP Backend - Shop Swift E-commerce (8 dias)

## 📋 Visão Geral

Este documento define a especificação **SIMPLIFICADA** para um MVP do backend que suportará o frontend React do Shop Swift E-commerce. Foco em funcionalidades essenciais para entrega em **8 dias**.

## 🏗️ Arquitetura MVP (Simplificada)

### **Stack Tecnológica MVP**
- **Runtime**: Node.js + TypeScript
- **Framework**: Express.js
- **Banco de Dados**: MongoDB (MongoDB Atlas para produção)
- **ODM**: Mongoose (mais simples que Prisma para MongoDB)
- **Autenticação**: JWT simples (sem refresh tokens)
- **Upload de Arquivos**: Cloudinary (CDN + transformações automáticas)
- **Pagamentos**: PIX via API (Mercado Pago ou similar)
- **Email**: Nodemailer com Gmail SMTP
- **Deploy**: Railway/Vercel (deploy simples)

### **Estrutura de Diretórios MVP**
```
backend/
├── src/
│   ├── models/         # Modelos Mongoose
│   ├── routes/         # Rotas da API
│   ├── middleware/     # Auth e validação
│   ├── services/       # Lógica de negócio
│   ├── utils/          # Utilitários
│   └── app.ts          # Aplicação principal
├── .env                # Variáveis de ambiente
└── package.json
```

## 🗄️ Banco de Dados MVP (MongoDB)

### **Modelos Mongoose Simplificados**

```typescript
// models/Admin.ts
import mongoose, { Schema, Document } from 'mongoose';

export interface IAdmin extends Document {
  email: string;
  password: string;
  name: string;
  createdAt: Date;
  updatedAt: Date;
}

const AdminSchema = new Schema<IAdmin>({
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  name: { type: String, required: true }
}, {
  timestamps: true
});

export default mongoose.model<IAdmin>('Admin', AdminSchema);

// models/Product.ts
export interface IProduct extends Document {
  name: string;
  description: string;
  price: number;
  image?: string;
  category: string;
  sizes: string[]; // ["P", "M", "G", "GG"]
  stock: number;
  featured: boolean;
  isNew: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const ProductSchema = new Schema<IProduct>({
  name: { type: String, required: true },
  description: { type: String, required: true },
  price: { type: Number, required: true },
  image: { type: String },
  category: { type: String, required: true },
  sizes: [{ type: String }],
  stock: { type: Number, default: 0 },
  featured: { type: Boolean, default: false },
  isNew: { type: Boolean, default: false }
}, {
  timestamps: true
});

export default mongoose.model<IProduct>('Product', ProductSchema);

// models/Order.ts
export interface IOrderItem {
  productId: string;
  productName: string;
  price: number;
  quantity: number;
  size?: string;
}

export interface IOrder extends Document {
  orderNumber: string;
  customerName: string;
  customerEmail: string;
  customerPhone?: string;
  total: number;
  status: 'PENDING' | 'CONFIRMED' | 'PROCESSING' | 'SHIPPED' | 'DELIVERED' | 'CANCELLED';
  paymentStatus: 'PENDING' | 'PAID' | 'FAILED' | 'REFUNDED';
  pixCode?: string;
  pixQrCode?: string;
  items: IOrderItem[];
  createdAt: Date;
  updatedAt: Date;
}

const OrderItemSchema = new Schema<IOrderItem>({
  productId: { type: String, required: true },
  productName: { type: String, required: true },
  price: { type: Number, required: true },
  quantity: { type: Number, required: true },
  size: { type: String }
});

const OrderSchema = new Schema<IOrder>({
  orderNumber: { type: String, required: true, unique: true },
  customerName: { type: String, required: true },
  customerEmail: { type: String, required: true },
  customerPhone: { type: String },
  total: { type: Number, required: true },
  status: { 
    type: String, 
    enum: ['PENDING', 'CONFIRMED', 'PROCESSING', 'SHIPPED', 'DELIVERED', 'CANCELLED'],
    default: 'PENDING' 
  },
  paymentStatus: { 
    type: String, 
    enum: ['PENDING', 'PAID', 'FAILED', 'REFUNDED'],
    default: 'PENDING' 
  },
  pixCode: { type: String },
  pixQrCode: { type: String },
  items: [OrderItemSchema]
}, {
  timestamps: true
});

export default mongoose.model<IOrder>('Order', OrderSchema);
```

## 🔐 Sistema de Autenticação (Admin)

### **Endpoints de Autenticação Simplificados**

```typescript
// Login do Admin (único endpoint necessário)
POST /api/admin/login
Body: {
  email: string,
  password: string
}
Response: {
  admin: {
    id: string,
    name: string,
    email: string
  },
  token: string
}

// Middleware de autenticação
Headers: Authorization: Bearer <token>
```

### **Middleware de Autenticação**

```typescript
// middleware/auth.ts
import jwt from 'jsonwebtoken';
import { Request, Response, NextFunction } from 'express';

export const authenticateAdmin = (req: Request, res: Response, next: NextFunction) => {
  const token = req.headers.authorization?.split(' ')[1];
  
  if (!token) {
    return res.status(401).json({ error: 'Token requerido' });
  }
  
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as any;
    req.admin = decoded;
    next();
  } catch (error) {
    return res.status(403).json({ error: 'Token inválido' });
  }
};
```

## 🛍️ API de Produtos (MVP)

### **Endpoints Públicos (Frontend)**

```typescript
// Listar todos os produtos
GET /api/products
Query: {
  category?: string,
  search?: string,
  featured?: boolean,
  isNew?: boolean
}
Response: {
  products: Product[]
}

// Buscar produto por ID
GET /api/products/:id
Response: {
  product: Product
}
```

### **Endpoints Admin (Protegidos)**

```typescript
// CRUD de produtos (admin)
GET /api/admin/products
POST /api/admin/products
PUT /api/admin/products/:id
DELETE /api/admin/products/:id

// Upload de imagem via Cloudinary
POST /api/admin/upload
Body: FormData com arquivo
Response: {
  url: string,
  publicId: string
}
```

### **Estrutura de Resposta do Produto (Simplificada)**

```typescript
interface Product {
  _id: string;
  name: string;
  description: string;
  price: number;
  image?: string;
  category: string;
  sizes: string[]; // ["P", "M", "G", "GG"]
  stock: number;
  featured: boolean;
  isNew: boolean;
  createdAt: string;
  updatedAt: string;
}
```

## 🛒 API de Pedidos (MVP)

### **Endpoints de Pedidos**

```typescript
// Criar pedido (checkout)
POST /api/orders
Body: {
  customerName: string,
  customerEmail: string,
  customerPhone?: string,
  items: {
    productId: string,
    productName: string,
    price: number,
    quantity: number,
    size?: string
  }[],
  total: number
}
Response: {
  order: Order,
  pixCode: string,
  pixQrCode: string
}

// Buscar pedido por ID
GET /api/orders/:id
Response: {
  order: Order
}
```

## 👨‍💼 API Admin (Protegida)

### **Endpoints Admin**

```typescript
// Dashboard básico
GET /api/admin/dashboard
Response: {
  totalProducts: number,
  totalOrders: number,
  pendingOrders: number,
  totalRevenue: number
}

// Listar pedidos
GET /api/admin/orders
Query: {
  status?: string,
  page?: number
}

// Atualizar status do pedido
PUT /api/admin/orders/:id/status
Body: {
  status: 'CONFIRMED' | 'PROCESSING' | 'SHIPPED' | 'DELIVERED' | 'CANCELLED'
}
```

## 📸 Upload de Imagens (Cloudinary)

### **Configuração Cloudinary**

```typescript
// utils/cloudinary.ts
import { v2 as cloudinary } from 'cloudinary';
import multer from 'multer';

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

// Upload de imagem
export const uploadImage = async (file: Express.Multer.File) => {
  const result = await cloudinary.uploader.upload(file.path, {
    folder: 'shopswift/products',
    transformation: [
      { width: 800, height: 800, crop: 'fill', quality: 'auto' }
    ]
  });
  return {
    url: result.secure_url,
    publicId: result.public_id
  };
};
```

### **Setup dos 2 Admins**

```typescript
// scripts/seedAdmins.ts
import bcrypt from 'bcryptjs';
import Admin from '../src/models/Admin';

const seedAdmins = async () => {
  const admins = [
    {
      email: 'admin1@shopswift.com',
      password: await bcrypt.hash('admin123', 10),
      name: 'Admin Principal'
    },
    {
      email: 'admin2@shopswift.com', 
      password: await bcrypt.hash('admin456', 10),
      name: 'Admin Secundário'
    }
  ];

  await Admin.insertMany(admins);
  console.log('Admins criados com sucesso!');
};
```

### **Upload via Postman**

```typescript
// Endpoint para upload
POST /api/admin/upload
Headers: {
  Authorization: Bearer <admin-token>
}
Body: form-data
  - file: [selecionar arquivo de imagem]

Response: {
  url: "https://res.cloudinary.com/.../image/upload/v1234567890/shopswift/products/abc123.jpg",
  publicId: "shopswift/products/abc123"
}
```

**Como usar no Postman:**
1. Selecionar método `POST`
2. URL: `http://localhost:3000/api/admin/upload`
3. Headers: `Authorization: Bearer <seu-token>`
4. Body → form-data → key: `file` (tipo File) → selecionar imagem
5. Send

## 💳 Integração PIX

### **Configuração PIX**

```typescript
// Usar API do Mercado Pago ou similar
// Gerar PIX ao criar pedido
POST /api/orders
// Retorna: pixCode e pixQrCode

// Webhook para confirmar pagamento
POST /api/webhooks/pix
// Atualiza status do pedido automaticamente
```

## 🔒 Segurança MVP

### **Middlewares Básicos**

```typescript
// CORS básico
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true
}));

// Validação simples com express-validator
import { body, validationResult } from 'express-validator';

// Exemplo de validação
const validateProduct = [
  body('name').notEmpty().withMessage('Nome é obrigatório'),
  body('price').isNumeric().withMessage('Preço deve ser numérico'),
  body('category').notEmpty().withMessage('Categoria é obrigatória')
];
```

## 🔧 Configuração MVP

### **Variáveis de Ambiente**

```env
# Database
MONGODB_URI=mongodb://localhost:27017/shopswift
# ou MongoDB Atlas: mongodb+srv://user:pass@cluster.mongodb.net/shopswift

# Authentication
JWT_SECRET=your-super-secret-key

# Cloudinary (Upload de imagens)
CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret

# Payment (Mercado Pago ou similar)
PIX_API_KEY=your-pix-api-key
PIX_WEBHOOK_SECRET=your-webhook-secret

# App
NODE_ENV=development
PORT=3000
FRONTEND_URL=http://localhost:5173
```

### **Package.json Dependências**

```json
{
  "dependencies": {
    "express": "^4.18.2",
    "mongoose": "^7.5.0",
    "jsonwebtoken": "^9.0.2",
    "bcryptjs": "^2.4.3",
    "cloudinary": "^1.40.0",
    "multer": "^1.4.5",
    "cors": "^2.8.5",
    "express-validator": "^7.0.1",
    "dotenv": "^16.3.1"
  },
  "devDependencies": {
    "@types/express": "^4.17.17",
    "@types/node": "^20.5.0",
    "@types/multer": "^1.4.7",
    "typescript": "^5.1.6",
    "ts-node": "^10.9.1",
    "nodemon": "^3.0.1"
  }
}
```

## 🚀 Roadmap MVP (8 dias)

### **Dia 1-2: Setup e Estrutura Base**
- [ ] Configurar projeto Node.js + TypeScript
- [ ] Configurar MongoDB + Mongoose
- [ ] Estrutura básica de pastas
- [ ] Configurar Express + middlewares básicos

### **Dia 3-4: Autenticação e Produtos**
- [ ] Sistema de login admin (JWT) - apenas 2 usuários
- [ ] CRUD completo de produtos
- [ ] Upload de imagens (Cloudinary)
- [ ] Endpoints públicos para frontend

### **Dia 5-6: Sistema de Pedidos**
- [ ] Modelo de pedidos
- [ ] Endpoint de criação de pedidos
- [ ] Integração PIX (Mercado Pago)
- [ ] Webhook para confirmação de pagamento

### **Dia 7-8: Admin e Deploy**
- [ ] Dashboard admin básico
- [ ] Gestão de pedidos
- [ ] Deploy no Railway/Vercel
- [ ] Testes básicos e ajustes finais

## 📋 Checklist MVP

### **Funcionalidades Essenciais**
- ✅ CRUD de produtos (admin)
- ✅ Listagem de produtos (público)
- ✅ Sistema de pedidos com PIX
- ✅ Autenticação admin
- ✅ Upload de imagens
- ✅ Dashboard básico

### **APIs Implementadas**
- ✅ `GET /api/products` - Listar produtos
- ✅ `GET /api/products/:id` - Buscar produto
- ✅ `POST /api/orders` - Criar pedido
- ✅ `GET /api/orders/:id` - Buscar pedido
- ✅ `POST /api/admin/login` - Login admin (2 usuários)
- ✅ `GET /api/admin/products` - CRUD produtos
- ✅ `POST /api/admin/upload` - Upload imagens (Cloudinary)
- ✅ `GET /api/admin/orders` - Listar pedidos
- ✅ `PUT /api/admin/orders/:id/status` - Atualizar status

### **Configurações Especiais**
- 🔐 **2 Admins fixos**: admin1@shopswift.com / admin2@shopswift.com
- 📸 **Cloudinary**: CDN automático + transformações de imagem
- 🛠️ **Upload via Postman**: Interface simples para gerenciar produtos
- 💳 **PIX**: Integração direta com Mercado Pago

---

**Este MVP foca no essencial para um e-commerce funcional em 8 dias, com upload via Cloudinary e gestão simplificada via Postman.**
