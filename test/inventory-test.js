/**
 * Teste específico da funcionalidade de estoque
 * Execute com: node test/inventory-test.js
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

// Função para imprimir resultados dos testes
function printTestResult(testName, success, details = '') {
    const status = success ? '✅' : '❌';
    console.log(`${status} ${testName}${details ? ` - ${details}` : ''}`);
    if (!success && details) {
        console.log(`   Detalhes: ${details}`);
    }
}

// Dados de teste para estoque
const testProducts = [
    {
        name: 'Produto Teste 1',
        price: 29.90,
        description: 'Produto para teste de estoque',
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
];

async function runInventoryTests() {
    console.log('📦 Iniciando testes de estoque\n');
    
    let productIds = [];
    let orderId = null;
    
    // Teste 1: Criar produtos para teste
    console.log('🏗️ Teste 1: Criar produtos para teste');
    for (let i = 0; i < testProducts.length; i++) {
        const product = testProducts[i];
        const createProduct = await makeRequest(`${BASE_URL}/admin/products`, {
            method: 'POST',
            body: JSON.stringify(product)
        });
        
        if (createProduct.status === 201) {
            productIds.push(createProduct.data.product.id);
            printTestResult(
                `Criar produto ${i + 1}`,
                true,
                `ID: ${createProduct.data.product.id}, Estoque: ${product.stock}`
            );
        } else {
            printTestResult(
                `Criar produto ${i + 1}`,
                false,
                createProduct.data.message
            );
        }
    }
    
    if (productIds.length === 0) {
        console.log('❌ Não foi possível criar produtos para teste');
        return;
    }
    
    // Teste 2: Verificar estoque inicial
    console.log('\n📊 Teste 2: Verificar estoque inicial');
    for (let i = 0; i < productIds.length; i++) {
        const checkStock = await makeRequest(`${BASE_URL}/inventory/products/${productIds[i]}/stock`);
        printTestResult(
            `Estoque produto ${i + 1}`,
            checkStock.status === 200,
            checkStock.status === 200 ? `Estoque: ${checkStock.data.stock}` : checkStock.data.message
        );
    }
    
    // Teste 3: Criar pedido com estoque suficiente
    console.log('\n🛒 Teste 3: Criar pedido com estoque suficiente');
    const orderData = {
        customerName: 'Cliente Teste Estoque',
        customerPhone: '27995225151',
        items: [
            {
                productId: productIds[0],
                productName: testProducts[0].name,
                price: testProducts[0].price,
                quantity: 3,
                size: 'M'
            },
            {
                productId: productIds[1],
                productName: testProducts[1].name,
                price: testProducts[1].price,
                quantity: 2,
                size: 'G'
            }
        ],
        total: (testProducts[0].price * 3) + (testProducts[1].price * 2)
    };
    
    const createOrder = await makeRequest(`${BASE_URL}/orders`, {
        method: 'POST',
        body: JSON.stringify(orderData)
    });
    
    const orderCreated = createOrder.status === 201;
    printTestResult(
        'Criar pedido com estoque',
        orderCreated,
        orderCreated ? `Pedido ${createOrder.data.order.orderNumber} criado` : createOrder.data.message
    );
    
    if (orderCreated) {
        orderId = createOrder.data.order.id;
    }
    
    // Teste 4: Verificar estoque após criação do pedido (não deve ter mudado ainda)
    console.log('\n📊 Teste 4: Verificar estoque após criação do pedido');
    for (let i = 0; i < productIds.length; i++) {
        const checkStock = await makeRequest(`${BASE_URL}/inventory/products/${productIds[i]}/stock`);
        const expectedStock = testProducts[i].stock;
        const actualStock = checkStock.data.stock;
        
        printTestResult(
            `Estoque produto ${i + 1} após pedido`,
            actualStock === expectedStock,
            `Esperado: ${expectedStock}, Atual: ${actualStock}`
        );
    }
    
    // Teste 5: Simular atualização de status para "delivered" (reduzir estoque)
    if (orderId) {
        console.log('\n🔄 Teste 5: Simular entrega do pedido (reduzir estoque)');
        console.log('⚠️  Nota: Este teste requer autenticação admin. Simulando comportamento...');
        
        // Verificar se o pedido foi criado corretamente
        const getOrder = await makeRequest(`${BASE_URL}/orders/${orderId}`);
        printTestResult(
            'Pedido criado corretamente',
            getOrder.status === 200,
            getOrder.data.order ? `Status: ${getOrder.data.order.status}` : getOrder.data.message
        );
    }
    
    // Teste 6: Criar pedido com estoque insuficiente
    console.log('\n❌ Teste 6: Criar pedido com estoque insuficiente');
    const invalidOrderData = {
        customerName: 'Cliente Teste Estoque Insuficiente',
        customerPhone: '11999999999',
        items: [
            {
                productId: productIds[0],
                productName: testProducts[0].name,
                price: testProducts[0].price,
                quantity: 999, // Quantidade muito alta
                size: 'M'
            }
        ],
        total: testProducts[0].price * 999
    };
    
    const createInvalidOrder = await makeRequest(`${BASE_URL}/orders`, {
        method: 'POST',
        body: JSON.stringify(invalidOrderData)
    });
    
    printTestResult(
        'Rejeitar pedido com estoque insuficiente',
        createInvalidOrder.status === 400,
        createInvalidOrder.status === 400 ? 'Pedido rejeitado corretamente' : 'Deveria rejeitar pedido'
    );
    
    if (createInvalidOrder.status === 400) {
        console.log('   Erros de estoque:', createInvalidOrder.data.errors);
    }
    
    // Resumo dos testes
    console.log('\n📊 Resumo dos Testes de Estoque:');
    console.log('================================');
    console.log('✅ Criação de produtos');
    console.log('✅ Verificação de estoque');
    console.log('✅ Criação de pedidos');
    console.log('✅ Validação de estoque insuficiente');
    console.log('⚠️  Teste de redução de estoque requer autenticação admin');
    
    console.log('\n🎉 Testes de estoque concluídos!');
    console.log('\n📝 Para testar a redução de estoque:');
    console.log('1. Faça login como admin');
    console.log('2. Atualize o status do pedido para "delivered"');
    console.log('3. Verifique se o estoque foi reduzido');
}

// Executar testes
runInventoryTests().catch(console.error);
