# 🚀 Guia de Testes - Shop Swift API

## 📋 Pré-requisitos

1. **Docker rodando com watch mode:**
   ```bash
   docker-compose down
   docker-compose up --build
   ```

2. **Registrar usuário via API** (veja seção 1.1)

3. **Base URL:** `http://localhost:3335`

---

## 🔐 1. AUTENTICAÇÃO

### 1.1 Registrar Usuário
**POST** `/register`

**Headers:**
```
Content-Type: application/json
```

**Body (JSON):**
```json
{
  "email": "gustavobrun1224@gmail.com",
  "password": "gustavo12",
  "role": "admin"
}
```

**Resposta esperada (201):**
```json
{
  "message": "User created successfully",
  "user": {
    "id": "65f8a1b2c3d4e5f6a7b8c9d0",
    "email": "gustavobrun1224@gmail.com",
    "role": "admin"
  }
}
```

### 1.2 Login Admin
**POST** `/admin/login`

**Headers:**
```
Content-Type: application/json
```

**Body (JSON):**
```json
{
  "email": "admin@shopswift.com",
  "password": "admin123"
}
```

**Resposta esperada (200):**
```json
{
  "message": "Login successful",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "65f8a1b2c3d4e5f6a7b8c9d0",
    "email": "admin@shopswift.com",
    "role": "admin"
  }
}
```

**💡 Salve o token retornado para usar nos próximos requests!**

### 1.2 Verificar Perfil Admin
**GET** `/admin/profile`

**Headers:**
```
Authorization: Bearer SEU_TOKEN_AQUI
```

**Resposta esperada (200):**
```json
{
  "message": "Profile data",
  "user": {
    "id": "65f8a1b2c3d4e5f6a7b8c9d0",
    "email": "admin@shopswift.com",
    "role": "admin"
  }
}
```

---

## 🛍️ 2. PRODUTOS (Público)

### 2.1 Listar Produtos
**GET** `/products`

**Query Parameters (opcionais):**
- `category`: Filtrar por categoria
- `search`: Buscar por nome/descrição

**Exemplos:**
- `GET /products`
- `GET /products?category=roupas`
- `GET /products?search=camiseta`

**Resposta esperada (200):**
```json
{
  "products": [
    {
      "id": "65f8a1b2c3d4e5f6a7b8c9d1",
      "name": "Camiseta Básica",
      "price": 29.90,
      "description": "Camiseta 100% algodão",
      "imageUrl": "https://example.com/image.jpg",
      "category": "roupas",
      "sizes": ["P", "M", "G", "GG"],
      "stock": 50
    }
  ]
}
```

### 2.2 Buscar Produto por ID
**GET** `/products/:id`

**Exemplo:**
- `GET /products/65f8a1b2c3d4e5f6a7b8c9d1`

**Resposta esperada (200):**
```json
{
  "product": {
    "id": "65f8a1b2c3d4e5f6a7b8c9d1",
    "name": "Camiseta Básica",
    "price": 29.90,
    "description": "Camiseta 100% algodão",
    "imageUrl": "https://example.com/image.jpg",
    "category": "roupas",
    "sizes": ["P", "M", "G", "GG"],
    "stock": 50
  }
}
```

---

## 👨‍💼 3. PRODUTOS (Admin - Requer Token)

### 3.1 Listar Produtos (Admin)
**GET** `/admin/products`

**Headers:**
```
Authorization: Bearer SEU_TOKEN_AQUI
```

### 3.2 Criar Produto
**POST** `/admin/products`

**Headers:**
```
Content-Type: application/json
Authorization: Bearer SEU_TOKEN_AQUI
```

**Body (JSON):**
```json
{
  "name": "Camiseta Premium",
  "price": 49.90,
  "description": "Camiseta premium 100% algodão orgânico",
  "imageUrl": "https://example.com/premium-shirt.jpg",
  "category": "roupas",
  "sizes": ["P", "M", "G", "GG"],
  "stock": 25
}
```

**Resposta esperada (201):**
```json
{
  "product": {
    "id": "65f8a1b2c3d4e5f6a7b8c9d2",
    "name": "Camiseta Premium",
    "price": 49.90,
    "description": "Camiseta premium 100% algodão orgânico",
    "imageUrl": "https://example.com/premium-shirt.jpg",
    "category": "roupas",
    "sizes": ["P", "M", "G", "GG"],
    "stock": 25
  }
}
```

### 3.3 Atualizar Produto
**PUT** `/admin/products/:id`

**Headers:**
```
Content-Type: application/json
Authorization: Bearer SEU_TOKEN_AQUI
```

**Body (JSON) - todos os campos são opcionais:**
```json
{
  "name": "Camiseta Premium Atualizada",
  "price": 59.90,
  "stock": 30
}
```

### 3.4 Deletar Produto
**DELETE** `/admin/products/:id`

**Headers:**
```
Authorization: Bearer SEU_TOKEN_AQUI
```

**Resposta esperada (200):**
```json
{
  "success": true
}
```

---

## 📚 4. DOCUMENTAÇÃO SWAGGER

Acesse a documentação interativa em:
**GET** `http://localhost:3335/docs`

---

## 🧪 5. SEQUÊNCIA DE TESTES RECOMENDADA

1. **Registrar usuário** com `/register`
2. **Fazer login** e salvar o token
3. **Verificar perfil** com o token
4. **Listar produtos** (público)
5. **Criar produto** (admin)
6. **Listar produtos** novamente para ver o novo produto
7. **Atualizar produto** criado
8. **Deletar produto** (opcional)

---

## ⚠️ 6. CÓDIGOS DE ERRO COMUNS

- **401 Unauthorized**: Token inválido ou expirado
- **404 Not Found**: Produto ou usuário não encontrado
- **500 Internal Server Error**: Erro no servidor

---

## 🔧 7. COMANDOS ÚTEIS

```bash
# Parar containers
docker-compose down

# Subir com watch mode
docker-compose up --build

# Ver logs
docker-compose logs -f api

# Registrar usuário via API
POST /register

# Acessar container
docker-compose exec api sh
```

---

## 📝 8. EXEMPLOS DE PRODUTOS PARA TESTE

```json
{
  "name": "Tênis Esportivo",
  "price": 199.90,
  "description": "Tênis para corrida e caminhada",
  "imageUrl": "https://example.com/tenis.jpg",
  "category": "calçados",
  "sizes": ["36", "37", "38", "39", "40", "41", "42"],
  "stock": 15
}
```

```json
{
  "name": "Moletom Canguru",
  "price": 89.90,
  "description": "Moletom com capuz e bolso canguru",
  "imageUrl": "https://example.com/moletom.jpg",
  "category": "roupas",
  "sizes": ["P", "M", "G", "GG"],
  "stock": 20
}
```
