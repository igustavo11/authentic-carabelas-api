/**
 * Configuração para os testes
 */

module.exports = {
    // URL base da API
    BASE_URL: process.env.API_URL || 'http://localhost:3335',
    
    // Timeout para requisições (em ms)
    REQUEST_TIMEOUT: 10000,
    
    // Dados de teste padrão
    TEST_DATA: {
        customer: {
            name: 'Cliente Teste',
            phone: '11999999999'
        },
        products: [
            {
                name: 'Produto Teste 1',
                price: 29.90,
                description: 'Produto para teste',
                category: 'teste',
                sizes: ['P', 'M', 'G'],
                stock: 10
            },
            {
                name: 'Produto Teste 2',
                price: 59.90,
                description: 'Outro produto para teste',
                category: 'teste',
                sizes: ['M', 'G', 'GG'],
                stock: 5
            }
        ]
    },
    
    // Configurações de WhatsApp
    WHATSAPP: {
        // Número do admin para testes (deve ser configurado no .env)
        ADMIN_PHONE: process.env.WHATSAPP_ADM || '5511999999999',
        
        // Padrões para validação de links
        LINK_PATTERN: /^https:\/\/wa\.me\/\d+\?text=.+$/,
        
        // Elementos obrigatórios na mensagem
        REQUIRED_MESSAGE_ELEMENTS: [
            'NOVO PEDIDO',
            'Cliente:',
            'Telefone:',
            'Itens do Pedido',
            'TOTAL DO PEDIDO'
        ]
    },
    
    // Configurações de estoque
    INVENTORY: {
        // Quantidade mínima para teste de estoque insuficiente
        INSUFFICIENT_STOCK_QUANTITY: 999,
        
        // Produtos que devem existir para os testes
        REQUIRED_PRODUCTS: [
            'test-product-1',
            'test-product-2'
        ]
    },
    
    // Configurações de autenticação
    AUTH: {
        // Rotas que devem retornar 401 sem autenticação
        PROTECTED_ROUTES: [
            '/admin/orders',
            '/admin/products'
        ]
    },
    
    // Configurações de timeout
    TIMEOUTS: {
        // Tempo para aguardar entre testes (em ms)
        BETWEEN_TESTS: 1000,
        
        // Tempo para aguardar resposta da API (em ms)
        API_RESPONSE: 5000
    }
};
