# 🧪 Testes da API de Pedidos

Este diretório contém uma suíte completa de testes para verificar se todas as funcionalidades da API estão funcionando corretamente.

## 📋 Testes Disponíveis

### 1. **Testes Gerais da API** (`api-test.js`)
- ✅ Verificação de saúde da API
- ✅ Listagem de produtos
- ✅ Criação de pedidos
- ✅ Busca de pedidos por ID e número
- ✅ Geração de links do WhatsApp
- ✅ Validação de autenticação
- ✅ Tratamento de erros

### 2. **Testes de Controle de Estoque** (`inventory-test.js`)
- ✅ Criação de produtos para teste
- ✅ Verificação de estoque inicial
- ✅ Criação de pedidos com estoque suficiente
- ✅ Validação de estoque insuficiente
- ✅ Verificação de estoque após pedidos

### 3. **Testes de Integração WhatsApp** (`whatsapp-test.js`)
- ✅ Geração de mensagens formatadas
- ✅ Criação de links do WhatsApp
- ✅ Validação de formatação da mensagem
- ✅ Verificação de elementos essenciais
- ✅ Validação de estrutura do link

## 🚀 Como Executar os Testes

### Pré-requisitos
1. **Servidor rodando**: A API deve estar rodando em `http://localhost:3335`
2. **Dependências instaladas**: Node.js com fetch API (Node 18+)

### Executar Todos os Testes
```bash
node test/run-all-tests.js
```

### Executar Testes Individuais
```bash
# Testes gerais
node test/api-test.js

# Testes de estoque
node test/inventory-test.js

# Testes de WhatsApp
node test/whatsapp-test.js
```

## 🔧 Configuração para Testes Completos

### Variáveis de Ambiente Necessárias
```env
# .env
DATABASE_URL=mongodb://admin:secret@mongo:27017/ecommerce
JWT_SECRET=your-jwt-secret
WHATSAPP_ADM=5511999999999
CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret
```

### Iniciar o Servidor
```bash
# Com Docker
docker-compose up --build

# Ou com Bun diretamente
bun run src/index.ts
```

## 📊 O que os Testes Verificam

### ✅ Funcionalidades Básicas
- [x] API respondendo corretamente
- [x] Endpoints funcionando
- [x] Validação de dados
- [x] Tratamento de erros

### ✅ Sistema de Pedidos
- [x] Criação de pedidos
- [x] Busca de pedidos
- [x] Validação de dados obrigatórios
- [x] Geração de números únicos

### ✅ Controle de Estoque
- [x] Verificação de estoque antes de criar pedidos
- [x] Rejeição de pedidos com estoque insuficiente
- [x] Criação de produtos para teste
- [x] Validação de quantidades

### ✅ Integração WhatsApp
- [x] Geração de mensagens formatadas
- [x] Criação de links do WhatsApp
- [x] Formatação correta da mensagem
- [x] Inclusão de todos os dados do pedido

### ✅ Segurança
- [x] Proteção de rotas admin
- [x] Validação de autenticação
- [x] Tratamento de dados inválidos

## 🐛 Solução de Problemas

### Erro: "Servidor não está rodando"
```bash
# Inicie o servidor primeiro
docker-compose up --build
```

### Erro: "fetch is not defined"
```bash
# Use Node.js 18+ ou instale node-fetch
npm install node-fetch
```

### Erro: "WHATSAPP_ADM não configurado"
```bash
# Configure a variável no .env
echo "WHATSAPP_ADM=5511999999999" >> .env
```

### Erro de conexão com banco
```bash
# Verifique se o MongoDB está rodando
docker-compose ps
```

## 📈 Interpretando os Resultados

### ✅ Teste Aprovado
- Funcionalidade está funcionando corretamente
- Pode prosseguir com confiança

### ❌ Teste Falhou
- Verifique os logs para detalhes
- Confirme se o servidor está rodando
- Verifique as configurações

### ⚠️ Aviso
- Funcionalidade funciona, mas requer configuração adicional
- Normal para testes que dependem de autenticação

## 🔄 Executar Testes em CI/CD

```bash
# Exemplo para GitHub Actions
- name: Run API Tests
  run: |
    docker-compose up -d
    sleep 10
    node test/run-all-tests.js
```

## 📝 Adicionando Novos Testes

1. Crie um novo arquivo `test/novo-teste.js`
2. Use a estrutura padrão com `makeRequest()` e `printTestResult()`
3. Adicione ao `run-all-tests.js`
4. Documente no README

## 🎯 Objetivos dos Testes

- **Confiabilidade**: Garantir que a API funciona consistentemente
- **Qualidade**: Detectar problemas antes da produção
- **Documentação**: Mostrar como usar cada funcionalidade
- **Manutenção**: Facilitar futuras mudanças no código

---

**🎉 Execute os testes regularmente para garantir que sua API está funcionando perfeitamente!**
