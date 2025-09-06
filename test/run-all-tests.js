/**
 * Script principal para executar todos os testes
 * Execute com: node test/run-all-tests.js
 */

const { spawn } = require('child_process');
const path = require('path');

// Cores para output
const colors = {
    reset: '\x1b[0m',
    bright: '\x1b[1m',
    red: '\x1b[31m',
    green: '\x1b[32m',
    yellow: '\x1b[33m',
    blue: '\x1b[34m',
    magenta: '\x1b[35m',
    cyan: '\x1b[36m'
};

// Função para executar um teste
function runTest(testFile, testName) {
    return new Promise((resolve) => {
        console.log(`\n${colors.cyan}${colors.bright}🧪 Executando: ${testName}${colors.reset}`);
        console.log(`${colors.blue}================================${colors.reset}`);
        
        const testProcess = spawn('node', [testFile], {
            stdio: 'inherit',
            cwd: process.cwd()
        });
        
        testProcess.on('close', (code) => {
            if (code === 0) {
                console.log(`${colors.green}✅ ${testName} - Concluído com sucesso${colors.reset}`);
            } else {
                console.log(`${colors.red}❌ ${testName} - Falhou com código ${code}${colors.reset}`);
            }
            resolve(code === 0);
        });
        
        testProcess.on('error', (error) => {
            console.log(`${colors.red}❌ ${testName} - Erro: ${error.message}${colors.reset}`);
            resolve(false);
        });
    });
}

// Função principal
async function runAllTests() {
    console.log(`${colors.magenta}${colors.bright}🚀 Iniciando Suite de Testes da API de Pedidos${colors.reset}`);
    console.log(`${colors.blue}================================================${colors.reset}`);
    
    const tests = [
        {
            file: path.join(__dirname, 'api-test.js'),
            name: 'Testes Gerais da API'
        },
        {
            file: path.join(__dirname, 'inventory-test.js'),
            name: 'Testes de Controle de Estoque'
        },
        {
            file: path.join(__dirname, 'whatsapp-test.js'),
            name: 'Testes de Integração WhatsApp'
        }
    ];
    
    const results = [];
    
    for (const test of tests) {
        const success = await runTest(test.file, test.name);
        results.push({ name: test.name, success });
        
        // Aguardar um pouco entre os testes
        await new Promise(resolve => setTimeout(resolve, 1000));
    }
    
    // Resumo final
    console.log(`\n${colors.magenta}${colors.bright}📊 RESUMO FINAL DOS TESTES${colors.reset}`);
    console.log(`${colors.blue}============================${colors.reset}`);
    
    let passedTests = 0;
    let totalTests = results.length;
    
    results.forEach((result, index) => {
        const status = result.success ? '✅' : '❌';
        const color = result.success ? colors.green : colors.red;
        console.log(`${color}${status} ${index + 1}. ${result.name}${colors.reset}`);
        if (result.success) passedTests++;
    });
    
    console.log(`\n${colors.cyan}📈 Estatísticas:${colors.reset}`);
    console.log(`   Total de testes: ${totalTests}`);
    console.log(`   Aprovados: ${colors.green}${passedTests}${colors.reset}`);
    console.log(`   Falharam: ${colors.red}${totalTests - passedTests}${colors.reset}`);
    console.log(`   Taxa de sucesso: ${colors.yellow}${((passedTests / totalTests) * 100).toFixed(1)}%${colors.reset}`);
    
    if (passedTests === totalTests) {
        console.log(`\n${colors.green}${colors.bright}🎉 Todos os testes passaram! A API está funcionando corretamente.${colors.reset}`);
    } else {
        console.log(`\n${colors.yellow}${colors.bright}⚠️  Alguns testes falharam. Verifique os logs acima para detalhes.${colors.reset}`);
    }
    
    console.log(`\n${colors.blue}📝 Próximos passos:${colors.reset}`);
    console.log('1. Configure as variáveis de ambiente necessárias');
    console.log('2. Teste a autenticação admin');
    console.log('3. Teste o envio real de mensagens WhatsApp');
    console.log('4. Verifique os logs do servidor para mais detalhes');
    
    process.exit(passedTests === totalTests ? 0 : 1);
}

// Verificar se o servidor está rodando
async function checkServer() {
    try {
        const response = await fetch('http://localhost:3335/');
        if (response.ok) {
            console.log(`${colors.green}✅ Servidor está rodando em http://localhost:3335${colors.reset}`);
            return true;
        }
    } catch (error) {
        console.log(`${colors.red}❌ Servidor não está rodando em http://localhost:3335${colors.reset}`);
        console.log(`${colors.yellow}⚠️  Inicie o servidor antes de executar os testes:${colors.reset}`);
        console.log('   docker-compose up --build');
        console.log('   ou');
        console.log('   bun run src/index.ts');
        return false;
    }
}

// Executar verificação e testes
async function main() {
    const serverRunning = await checkServer();
    if (!serverRunning) {
        process.exit(1);
    }
    
    await runAllTests();
}

main().catch(console.error);
