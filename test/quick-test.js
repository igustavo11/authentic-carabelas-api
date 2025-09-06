/**
 * Teste rápido para verificar se a API está funcionando
 * Execute com: node test/quick-test.js
 */

const BASE_URL = 'http://localhost:3335';

async function quickTest() {
    console.log('⚡ Teste Rápido da API de Pedidos\n');
    
    try {
        // Teste 1: Health Check
        console.log('1. Verificando se a API está rodando...');
        const health = await fetch(`${BASE_URL}/`);
        if (health.ok) {
            console.log('   ✅ API está rodando');
        } else {
            console.log('   ❌ API não está respondendo');
            return;
        }
        
        // Teste 2: Listar produtos
        console.log('2. Testando listagem de produtos...');
        const products = await fetch(`${BASE_URL}/products`);
        if (products.ok) {
            const data = await products.json();
            console.log(`   ✅ Produtos listados (${data.products?.length || 0} encontrados)`);
        } else {
            console.log('   ❌ Erro ao listar produtos');
        }
        
        // Teste 3: Criar pedido
        console.log('3. Testando criação de pedido...');
        const orderData = {
            customerName: 'Teste Rápido',
            customerPhone: '11999999999',
            items: [
                {
                    productId: 'test-quick-1',
                    productName: 'Produto Teste',
                    price: 29.90,
                    quantity: 1,
                    size: 'M'
                }
            ],
            total: 29.90
        };
        
        const createOrder = await fetch(`${BASE_URL}/orders`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(orderData)
        });
        
        if (createOrder.ok) {
            const order = await createOrder.json();
            console.log(`   ✅ Pedido criado: ${order.order.orderNumber}`);
            
            // Teste 4: Verificar WhatsApp
            console.log('4. Testando integração WhatsApp...');
            if (order.order.whatsappMessage && order.order.whatsappLink) {
                console.log('   ✅ Mensagem e link do WhatsApp gerados');
            } else {
                console.log('   ⚠️  WhatsApp não configurado');
            }
            
            // Teste 5: Buscar pedido
            console.log('5. Testando busca de pedido...');
            const getOrder = await fetch(`${BASE_URL}/orders/${order.order.id}`);
            if (getOrder.ok) {
                console.log('   ✅ Pedido encontrado');
            } else {
                console.log('   ❌ Erro ao buscar pedido');
            }
        } else {
            const error = await createOrder.json();
            console.log(`   ❌ Erro ao criar pedido: ${error.message}`);
        }
        
        // Teste 6: Verificar autenticação admin
        console.log('6. Testando proteção de rotas admin...');
        const adminTest = await fetch(`${BASE_URL}/admin/orders`);
        if (adminTest.status === 401) {
            console.log('   ✅ Rotas admin protegidas');
        } else {
            console.log('   ⚠️  Rotas admin podem não estar protegidas');
        }
        
        console.log('\n🎉 Teste rápido concluído!');
        console.log('\n📝 Para testes completos, execute:');
        console.log('   node test/run-all-tests.js');
        
    } catch (error) {
        console.log(`❌ Erro durante o teste: ${error.message}`);
        console.log('\n🔧 Verifique se:');
        console.log('1. O servidor está rodando (docker-compose up --build)');
        console.log('2. A API está acessível em http://localhost:3335');
        console.log('3. O banco de dados está conectado');
    }
}

quickTest();
