# Integração Cloudinary - Guia de Uso

## Configuração

### 1. Variáveis de Ambiente

Adicione as seguintes variáveis ao seu arquivo `.env`:

```env
CLOUDINARY_CLOUD_NAME="seu-cloud-name"
CLOUDINARY_API_KEY="sua-api-key"
CLOUDINARY_API_SECRET="seu-api-secret"
```
CLOUDINARY_API_SECRET=
### 2. Obter Credenciais do Cloudinary

1. Acesse [cloudinary.com](https://cloudinary.com)
2. Crie uma conta gratuita
3. No dashboard, copie:
   - Cloud Name
   - API Key
   - API Secret

## Funcionalidades Implementadas

### 1. Upload de Imagens

#### Upload de Imagem Única
```http
POST /admin/upload/image
Content-Type: multipart/form-data
Authorization: Bearer <token>

{
  "file": <arquivo_imagem>,
  "folder": "products", // opcional
  "publicId": "nome_personalizado" // opcional
}
```

#### Upload de Múltiplas Imagens
```http
POST /admin/upload/images
Content-Type: multipart/form-data
Authorization: Bearer <token>

{
  "files": [<arquivo1>, <arquivo2>, ...],
  "folder": "products" // opcional
}
```

### 2. Criação de Produtos com Imagens

```http
POST /admin/products
Content-Type: multipart/form-data
Authorization: Bearer <token>

{
  "name": "Produto Exemplo",
  "price": "99.99", // Pode ser string ou número
  "description": "Descrição do produto",
  "category": "categoria",
  "stock": "10", // Pode ser string ou número
  "sizes": "P,M,G", // String separada por vírgula ou array
  "images": [<arquivo1>, <arquivo2>] // opcional
}
```

### 3. Atualização de Produtos com Imagens

```http
PUT /admin/products/:id
Content-Type: multipart/form-data
Authorization: Bearer <token>

{
  "name": "Nome Atualizado",
  "images": [<novas_imagens>], // opcional
  "imagesToDelete": ["public_id1", "public_id2"] // opcional
}
```

### 4. Deletar Imagem

```http
DELETE /admin/upload/image/:publicId
Authorization: Bearer <token>
```

## Estrutura do Banco de Dados

O modelo `Product` foi atualizado para incluir:

```prisma
model Product {
  id          String   @id @default(auto()) @map("_id") @db.ObjectId
  name        String
  price       Float
  description String
  imageUrl    String?  // URL única (legado)
  images      String[] // Array de URLs das imagens
  category    String
  sizes       String[]
  stock       Int
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
}
```

## Recursos do CloudinaryService

### Métodos Disponíveis

1. **uploadImage(file, folder?, publicId?)**
   - Upload de uma única imagem
   - Retorna URL, public_id, dimensões

2. **uploadMultipleImages(files, folder?)**
   - Upload de múltiplas imagens
   - Retorna array com informações de cada imagem

3. **deleteImage(publicId)**
   - Deleta imagem do Cloudinary
   - Retorna boolean indicando sucesso

4. **getOptimizedImageUrl(publicId, options?)**
   - Gera URL otimizada com transformações
   - Suporta redimensionamento, qualidade, formato

5. **extractPublicId(url)**
   - Extrai public_id de uma URL do Cloudinary
   - Útil para operações de deleção

### Transformações Automáticas

O Cloudinary está configurado para:
- **Qualidade automática**: `quality: 'auto'`
- **Formato automático**: `fetch_format: 'auto'`
- **Organização**: Imagens salvas na pasta `products`

## Exemplos de Uso

### Frontend (JavaScript)

```javascript
// Upload de imagem única
const formData = new FormData();
formData.append('file', fileInput.files[0]);
formData.append('folder', 'products');

const response = await fetch('/admin/upload/image', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${token}`
  },
  body: formData
});

const result = await response.json();
console.log('URL da imagem:', result.image.secure_url);
```

### Frontend (React)

```jsx
const handleImageUpload = async (files) => {
  const formData = new FormData();
  Array.from(files).forEach(file => {
    formData.append('files', file);
  });
  formData.append('folder', 'products');

  try {
    const response = await fetch('/admin/upload/images', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`
      },
      body: formData
    });

    const result = await response.json();
    if (result.success) {
      const imageUrls = result.images.map(img => img.secure_url);
      // Usar as URLs das imagens
    }
  } catch (error) {
    console.error('Erro no upload:', error);
  }
};
```

## Limitações e Considerações

1. **Autenticação**: Todas as rotas de upload requerem autenticação de admin
2. **Formatos Suportados**: JPG, PNG, GIF, WebP
3. **Tamanho**: Limite padrão do Cloudinary (100MB para contas gratuitas)
4. **Rate Limits**: Respeitar limites da API do Cloudinary
5. **Custos**: Conta gratuita tem limite de 25GB de armazenamento

## Troubleshooting

### Erro de Configuração
```
Error: Cloudinary configuration missing
```
**Solução**: Verificar se as variáveis de ambiente estão definidas corretamente.

### Erro de Upload
```
Error: Failed to upload image
```
**Soluções**:
- Verificar se o arquivo é uma imagem válida
- Verificar se as credenciais do Cloudinary estão corretas
- Verificar se há espaço disponível na conta

### Erro de Deleção
```
Error: Image not found
```
**Solução**: Verificar se o public_id está correto e se a imagem existe.

## Próximos Passos

1. Implementar cache de imagens
2. Adicionar compressão automática
3. Implementar CDN personalizado
4. Adicionar watermark automático
5. Implementar backup de imagens
