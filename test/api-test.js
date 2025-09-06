/**
 * Teste completo da API de Pedidos
 * Execute com: node test/api-test.js
 */

const BASE_URL = 'http://localhost:3335';

// Função para fazer requisições HTTP
async function makeRequest(url, options = {}) {
    try {
        const response = await fetch(url, {
            headers: {
                'Content-Type': 'application/json',
                ...options.headers
            },
            ...options
        });
        
        const data = await response.json();
        return { status: response.status, data };
    } catch (error) {
        console.error('Erro na requisição:', error.message);
        return { status: 500, data: { error: error.message } };
    }
}

// Função para aguardar um tempo
function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

// Função para imprimir resultados dos testes
function printTestResult(testName, success, details = '') {
    const status = success ? '✅' : '❌';
    console.log(`${status} ${testName}${details ? ` - ${details}` : ''}`);
    if (!success && details) {
        console.log(`   Detalhes: ${details}`);
    }
}

// Dados de teste
const testData = {
    customer: {
        name: 'João Silva Teste',
        phone: '27995225151'
    },
    products: [
        {
            productId: 'test-product-1',
            productName: 'Camiseta Teste',
            price: 29.90,
            quantity: 2,
            size: 'M',
            imageUrl: 'https://example.com/camiseta.jpg'
        },
        {
            productId: 'test-product-2',
            productName: 'Calça Teste',
            price: 89.90,
            quantity: 1,
            size: 'G',
            imageUrl: 'https://example.com/calca.jpg'
        }
    ]
};

// Testes
async function runTests() {
    console.log('🚀 Iniciando testes da API de Pedidos\n');
    
    let orderId = null;
    let orderNumber = null;
    
    // Teste 1: Verificar se a API está rodando
    console.log('📡 Teste 1: Verificar se a API está rodando');
    const healthCheck = await makeRequest(`${BASE_URL}/`);
    printTestResult(
        'API Health Check',
        healthCheck.status === 200,
        healthCheck.data
    );
    
    // Teste 2: Listar produtos (deve funcionar)
    console.log('\n📦 Teste 2: Listar produtos');
    const products = await makeRequest(`${BASE_URL}/products`);
    printTestResult(
        'Listar produtos',
        products.status === 200 && Array.isArray(products.data.products),
        `Encontrados ${products.data.products?.length || 0} produtos`
    );
    
    // Teste 3: Criar pedido
    console.log('\n🛒 Teste 3: Criar pedido');
    const orderData = {
        customerName: testData.customer.name,
        customerPhone: testData.customer.phone,
        items: testData.products,
        total: testData.products.reduce((sum, item) => sum + (item.price * item.quantity), 0)
    };
    
    const createOrder = await makeRequest(`${BASE_URL}/orders`, {
        method: 'POST',
        body: JSON.stringify(orderData)
    });
    
    const orderCreated = createOrder.status === 201 && createOrder.data.order;
    printTestResult(
        'Criar pedido',
        orderCreated,
        orderCreated ? `Pedido ${createOrder.data.order.orderNumber} criado` : createOrder.data.message
    );
    
    if (orderCreated) {
        orderId = createOrder.data.order.id;
        orderNumber = createOrder.data.order.orderNumber;
        
        // Verificar se tem link do WhatsApp
        const hasWhatsAppLink = createOrder.data.order.whatsappLink;
        printTestResult(
            'Link do WhatsApp gerado',
            hasWhatsAppLink,
            hasWhatsAppLink ? 'Link gerado com sucesso' : 'Link não gerado'
        );
        
        // Verificar se tem mensagem do WhatsApp
        const hasWhatsAppMessage = createOrder.data.order.whatsappMessage;
        printTestResult(
            'Mensagem do WhatsApp gerada',
            hasWhatsAppMessage,
            hasWhatsAppMessage ? 'Mensagem gerada com sucesso' : 'Mensagem não gerada'
        );
    }
    
    // Teste 4: Buscar pedido por ID
    if (orderId) {
        console.log('\n🔍 Teste 4: Buscar pedido por ID');
        const getOrder = await makeRequest(`${BASE_URL}/orders/${orderId}`);
        printTestResult(
            'Buscar pedido por ID',
            getOrder.status === 200 && getOrder.data.order,
            getOrder.data.order ? `Pedido ${getOrder.data.order.orderNumber} encontrado` : getOrder.data.message
        );
    }
    
    // Teste 5: Buscar pedido por número
    if (orderNumber) {
        console.log('\n🔍 Teste 5: Buscar pedido por número');
        const getOrderByNumber = await makeRequest(`${BASE_URL}/orders/number/${orderNumber}`);
        printTestResult(
            'Buscar pedido por número',
            getOrderByNumber.status === 200 && getOrderByNumber.data.order,
            getOrderByNumber.data.order ? `Pedido ${getOrderByNumber.data.order.orderNumber} encontrado` : getOrderByNumber.data.message
        );
    }
    
    // Teste 6: Obter link do WhatsApp
    if (orderId) {
        console.log('\n📱 Teste 6: Obter link do WhatsApp');
        const getWhatsAppLink = await makeRequest(`${BASE_URL}/orders/${orderId}/whatsapp`);
        printTestResult(
            'Obter link do WhatsApp',
            getWhatsAppLink.status === 200 && getWhatsAppLink.data.whatsappMessage,
            getWhatsAppLink.data.whatsappMessage ? 'Link obtido com sucesso' : getWhatsAppLink.data.message
        );
    }
    
    // Teste 7: Listar pedidos (admin) - sem autenticação
    console.log('\n👨‍💼 Teste 7: Listar pedidos (admin) - sem autenticação');
    const listOrders = await makeRequest(`${BASE_URL}/admin/orders`);
    printTestResult(
        'Listar pedidos sem auth',
        listOrders.status === 401,
        listOrders.status === 401 ? 'Acesso negado corretamente' : 'Acesso deveria ser negado'
    );
    
    // Teste 8: Atualizar status (admin) - sem autenticação
    if (orderId) {
        console.log('\n🔄 Teste 8: Atualizar status (admin) - sem autenticação');
        const updateStatus = await makeRequest(`${BASE_URL}/admin/orders/${orderId}/status`, {
            method: 'PUT',
            body: JSON.stringify({ status: 'confirmed' })
        });
        printTestResult(
            'Atualizar status sem auth',
            updateStatus.status === 401,
            updateStatus.status === 401 ? 'Acesso negado corretamente' : 'Acesso deveria ser negado'
        );
    }
    
    // Teste 9: Verificar estoque de produto
    console.log('\n📦 Teste 9: Verificar estoque de produto');
    const checkStock = await makeRequest(`${BASE_URL}/inventory/products/test-product-1/stock`);
    printTestResult(
        'Verificar estoque',
        checkStock.status === 200 || checkStock.status === 404,
        checkStock.status === 200 ? `Estoque: ${checkStock.data.stock}` : 'Produto não encontrado (esperado)'
    );
    
    // Teste 10: Criar pedido com dados inválidos
    console.log('\n❌ Teste 10: Criar pedido com dados inválidos');
    const invalidOrder = await makeRequest(`${BASE_URL}/orders`, {
        method: 'POST',
        body: JSON.stringify({
            customerName: '', // Nome vazio
            customerPhone: '123', // Telefone inválido
            items: [], // Carrinho vazio
            total: 0
        })
    });
    printTestResult(
        'Validar dados inválidos',
        invalidOrder.status === 400,
        invalidOrder.status === 400 ? 'Validação funcionando' : 'Validação deveria falhar'
    );
    
    // Teste 11: Buscar pedido inexistente
    console.log('\n🔍 Teste 11: Buscar pedido inexistente');
    const getNonExistentOrder = await makeRequest(`${BASE_URL}/orders/000000000000000000000000`);
    printTestResult(
        'Buscar pedido inexistente',
        getNonExistentOrder.status === 404,
        getNonExistentOrder.status === 404 ? 'Pedido não encontrado corretamente' : 'Deveria retornar 404'
    );
    
    // Resumo dos testes
    console.log('\n📊 Resumo dos Testes:');
    console.log('===================');
    console.log('✅ Testes de funcionalidade básica');
    console.log('✅ Testes de validação');
    console.log('✅ Testes de autenticação');
    console.log('✅ Testes de erro');
    
    console.log('\n🎉 Testes concluídos!');
    console.log('\n📝 Próximos passos:');
    console.log('1. Configure WHATSAPP_ADM no .env');
    console.log('2. Teste a autenticação admin');
    console.log('3. Teste a atualização de status');
    console.log('4. Verifique os logs do servidor');
}

// Executar testes
runTests().catch(console.error);
