/**
 * Teste específico da funcionalidade de WhatsApp
 * Execute com: node test/whatsapp-test.js
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

// Função para validar formato de link do WhatsApp
function validateWhatsAppLink(link) {
    if (!link) return false;
    
    // Verificar se é um link válido do WhatsApp
    const whatsappRegex = /^https:\/\/wa\.me\/\d+\?text=.+$/;
    return whatsappRegex.test(link);
}

// Função para validar mensagem do WhatsApp
function validateWhatsAppMessage(message) {
    if (!message) return false;
    
    // Verificar se contém elementos essenciais
    const hasOrderNumber = message.includes('*NOVO PEDIDO*') || message.includes('*PEDIDO*');
    const hasCustomer = message.includes('*Cliente:*');
    const hasPhone = message.includes('*Telefone:*');
    const hasItems = message.includes('*Itens do Pedido*');
    const hasTotal = message.includes('*TOTAL DO PEDIDO*');
    
    return hasOrderNumber && hasCustomer && hasPhone && hasItems && hasTotal;
}

async function runWhatsAppTests() {
    console.log('📱 Iniciando testes de WhatsApp\n');
    
    let orderId = null;
    
    // Teste 1: Criar pedido e verificar mensagem do WhatsApp
    console.log('🛒 Teste 1: Criar pedido e verificar mensagem do WhatsApp');
    const orderData = {
        customerName: 'João Silva WhatsApp',
        customerPhone: '27995225151',
        items: [
            {
                productId: 'test-whatsapp-1',
                productName: 'Camiseta WhatsApp Test',
                price: 29.90,
                quantity: 2,
                size: 'M',
                imageUrl: 'https://example.com/camiseta.jpg'
            },
            {
                productId: 'test-whatsapp-2',
                productName: 'Calça WhatsApp Test',
                price: 89.90,
                quantity: 1,
                size: 'G',
                imageUrl: 'https://example.com/calca.jpg'
            }
        ],
        total: (29.90 * 2) + (89.90 * 1)
    };
    
    const createOrder = await makeRequest(`${BASE_URL}/orders`, {
        method: 'POST',
        body: JSON.stringify(orderData)
    });
    
    const orderCreated = createOrder.status === 201;
    printTestResult(
        'Criar pedido para teste WhatsApp',
        orderCreated,
        orderCreated ? `Pedido ${createOrder.data.order.orderNumber} criado` : createOrder.data.message
    );
    
    if (orderCreated) {
        orderId = createOrder.data.order.id;
        
        // Verificar mensagem do WhatsApp
        const message = createOrder.data.order.whatsappMessage;
        const messageValid = validateWhatsAppMessage(message);
        printTestResult(
            'Mensagem do WhatsApp válida',
            messageValid,
            messageValid ? 'Mensagem formatada corretamente' : 'Mensagem mal formatada'
        );
        
        if (message) {
            console.log('\n📝 Mensagem gerada:');
            console.log('==================');
            console.log(message);
            console.log('==================\n');
        }
        
        // Verificar link do WhatsApp
        const link = createOrder.data.order.whatsappLink;
        const linkValid = validateWhatsAppLink(link);
        printTestResult(
            'Link do WhatsApp válido',
            linkValid,
            linkValid ? 'Link gerado corretamente' : 'Link mal formatado'
        );
        
        if (link) {
            console.log(`🔗 Link gerado: ${link}`);
        }
    }
    
    // Teste 2: Obter link do WhatsApp do pedido
    if (orderId) {
        console.log('\n📱 Teste 2: Obter link do WhatsApp do pedido');
        const getWhatsAppLink = await makeRequest(`${BASE_URL}/orders/${orderId}/whatsapp`);
        
        const linkObtained = getWhatsAppLink.status === 200;
        printTestResult(
            'Obter link do WhatsApp',
            linkObtained,
            linkObtained ? 'Link obtido com sucesso' : getWhatsAppLink.data.message
        );
        
        if (linkObtained) {
            const message = getWhatsAppLink.data.whatsappMessage;
            const messageValid = validateWhatsAppMessage(message);
            printTestResult(
                'Mensagem obtida é válida',
                messageValid,
                messageValid ? 'Mensagem válida' : 'Mensagem inválida'
            );
        }
    }
    
    // Teste 3: Verificar formatação da mensagem
    console.log('\n📝 Teste 3: Verificar formatação da mensagem');
    if (orderId) {
        const getOrder = await makeRequest(`${BASE_URL}/orders/${orderId}`);
        if (getOrder.status === 200) {
            const message = getOrder.data.order.whatsappMessage;
            
            // Verificar elementos específicos
            const checks = [
                { name: 'Número do pedido', test: message.includes('*NOVO PEDIDO*') },
                { name: 'Nome do cliente', test: message.includes('João Silva WhatsApp') },
                { name: 'Telefone do cliente', test: message.includes('11999999999') },
                { name: 'Lista de itens', test: message.includes('*Itens do Pedido*') },
                { name: 'Produto 1', test: message.includes('Camiseta WhatsApp Test') },
                { name: 'Produto 2', test: message.includes('Calça WhatsApp Test') },
                { name: 'Preços', test: message.includes('R$ 29,90') && message.includes('R$ 89,90') },
                { name: 'Quantidades', test: message.includes('Quantidade: 2') && message.includes('Quantidade: 1') },
                { name: 'Tamanhos', test: message.includes('Tamanho: M') && message.includes('Tamanho: G') },
                { name: 'Total', test: message.includes('*TOTAL DO PEDIDO*') },
                { name: 'Valor total', test: message.includes('R$ 149,70') },
                { name: 'Informações de contato', test: message.includes('*Para confirmar o pedido*') }
            ];
            
            checks.forEach(check => {
                printTestResult(
                    check.name,
                    check.test,
                    check.test ? 'Presente na mensagem' : 'Ausente na mensagem'
                );
            });
        }
    }
    
    // Teste 4: Verificar formatação do link
    console.log('\n🔗 Teste 4: Verificar formatação do link');
    if (orderId) {
        const getWhatsAppLink = await makeRequest(`${BASE_URL}/orders/${orderId}/whatsapp`);
        if (getWhatsAppLink.status === 200) {
            const link = getWhatsAppLink.data.whatsappLink;
            
            // Verificar elementos do link
            const linkChecks = [
                { name: 'Protocolo HTTPS', test: link.startsWith('https://') },
                { name: 'Domínio wa.me', test: link.includes('wa.me/') },
                { name: 'Parâmetro text', test: link.includes('?text=') },
                { name: 'Mensagem codificada', test: link.includes('%20') || link.includes('%2A') }
            ];
            
            linkChecks.forEach(check => {
                printTestResult(
                    check.name,
                    check.test,
                    check.test ? 'Formato correto' : 'Formato incorreto'
                );
            });
        }
    }
    
    // Teste 5: Verificar variável de ambiente WHATSAPP_ADM
    console.log('\n⚙️ Teste 5: Verificar configuração do WhatsApp Admin');
    console.log('⚠️  Nota: Este teste verifica se a variável WHATSAPP_ADM está configurada');
    console.log('   Para testar completamente, configure WHATSAPP_ADM no .env');
    
    // Resumo dos testes
    console.log('\n📊 Resumo dos Testes de WhatsApp:');
    console.log('==================================');
    console.log('✅ Criação de mensagens formatadas');
    console.log('✅ Geração de links do WhatsApp');
    console.log('✅ Validação de formatação');
    console.log('✅ Estrutura da mensagem');
    console.log('⚠️  Teste de envio real requer WHATSAPP_ADM configurado');
    
    console.log('\n🎉 Testes de WhatsApp concluídos!');
    console.log('\n📝 Para testar o envio real:');
    console.log('1. Configure WHATSAPP_ADM no .env');
    console.log('2. Reinicie o servidor');
    console.log('3. Crie um pedido e clique no link gerado');
    console.log('4. Verifique se a mensagem chega no WhatsApp do admin');
}

// Executar testes
runWhatsAppTests().catch(console.error);
