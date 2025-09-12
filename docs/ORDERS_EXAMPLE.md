# 🛒 Exemplo Prático - API de Pedidos

## 📋 Como Usar a API de Pedidos

### **1. Criar um Pedido (Frontend)**

```javascript
// Exemplo de como criar um pedido no frontend
const createOrder = async (cartItems, customerName, customerPhone) => {
  const orderData = {
    customerName: customerName,
    customerPhone: customerPhone,
    items: cartItems.map(item => ({
      productId: item.id,
      productName: item.name,
      price: item.price,
      quantity: item.quantity,
      size: item.selectedSize,
      imageUrl: item.imageUrl
    })),
    total: cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0)
  };

  try {
    const response = await fetch('http://localhost:3335/orders', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(orderData)
    });

    const result = await response.json();
    
    if (response.ok) {
      // Pedido criado com sucesso
      console.log('Pedido criado:', result.order);
      
      // Mostrar mensagem do WhatsApp para o usuário
      showWhatsAppMessage(result.order.whatsappMessage, result.order.whatsappLink);
      
      return result.order;
    } else {
      throw new Error(result.message);
    }
  } catch (error) {
    console.error('Erro ao criar pedido:', error);
    throw error;
  }
};

// Função para mostrar a mensagem do WhatsApp
const showWhatsAppMessage = (message, whatsappLink) => {
  // Criar um modal ou popup com a mensagem formatada
  const modal = document.createElement('div');
  modal.innerHTML = `
    <div style="position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.5); z-index: 1000;">
      <div style="position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%); background: white; padding: 20px; border-radius: 10px; max-width: 500px; max-height: 80vh; overflow-y: auto;">
        <h3>📱 Mensagem para WhatsApp</h3>
        <div style="background: #f0f0f0; padding: 15px; border-radius: 5px; margin: 10px 0; white-space: pre-line; font-family: monospace;">${message}</div>
        <button onclick="copyToClipboard('${message.replace(/'/g, "\\'")}')" style="background: #25D366; color: white; border: none; padding: 10px 20px; border-radius: 5px; cursor: pointer; margin-right: 10px;">📋 Copiar Mensagem</button>
        <button onclick="window.open('${whatsappLink}', '_blank')" style="background: #25D366; color: white; border: none; padding: 10px 20px; border-radius: 5px; cursor: pointer; margin-right: 10px;">📱 Abrir WhatsApp</button>
        <button onclick="this.parentElement.parentElement.remove()" style="background: #ccc; color: black; border: none; padding: 10px 20px; border-radius: 5px; cursor: pointer;">Fechar</button>
      </div>
    </div>
  `;
  
  document.body.appendChild(modal);
};

// Função para copiar mensagem para área de transferência
const copyToClipboard = (text) => {
  navigator.clipboard.writeText(text).then(() => {
    alert('Mensagem copiada para a área de transferência!');
  });
};
```

### **2. Exemplo de Carrinho de Compras**

```javascript
// Exemplo de estrutura do carrinho
const cartItems = [
  {
    id: "65f8a1b2c3d4e5f6a7b8c9d1",
    name: "Camiseta Básica",
    price: 29.90,
    quantity: 2,
    selectedSize: "M",
    imageUrl: "https://example.com/camiseta.jpg"
  },
  {
    id: "65f8a1b2c3d4e5f6a7b8c9d2",
    name: "Calça Jeans",
    price: 89.90,
    quantity: 1,
    selectedSize: "G",
    imageUrl: "https://example.com/calca.jpg"
  }
];

// Calcular total
const total = cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
console.log('Total do carrinho:', total); // 149.70
```

### **3. Exemplo de Uso Completo**

```html
<!DOCTYPE html>
<html>
<head>
    <title>Carrinho de Compras</title>
</head>
<body>
    <div id="cart">
        <h2>🛒 Carrinho de Compras</h2>
        <div id="cart-items"></div>
        <div id="cart-total"></div>
        <input type="text" id="customer-name" placeholder="Seu nome" />
        <input type="tel" id="customer-phone" placeholder="Seu telefone (ex: 11999999999)" />
        <button onclick="checkout()">Finalizar Pedido</button>
    </div>

    <script>
        // Simular carrinho
        let cart = [
            {
                id: "65f8a1b2c3d4e5f6a7b8c9d1",
                name: "Camiseta Básica",
                price: 29.90,
                quantity: 2,
                selectedSize: "M",
                imageUrl: "https://example.com/camiseta.jpg"
            }
        ];

        // Renderizar carrinho
        function renderCart() {
            const cartItems = document.getElementById('cart-items');
            const cartTotal = document.getElementById('cart-total');
            
            cartItems.innerHTML = cart.map(item => `
                <div style="border: 1px solid #ccc; padding: 10px; margin: 5px 0;">
                    <h4>${item.name}</h4>
                    <p>Preço: R$ ${item.price.toFixed(2)}</p>
                    <p>Quantidade: ${item.quantity}</p>
                    <p>Tamanho: ${item.selectedSize}</p>
                    <p>Subtotal: R$ ${(item.price * item.quantity).toFixed(2)}</p>
                </div>
            `).join('');

            const total = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
            cartTotal.innerHTML = `<h3>Total: R$ ${total.toFixed(2)}</h3>`;
        }

        // Finalizar pedido
        async function checkout() {
            const customerName = document.getElementById('customer-name').value;
            const customerPhone = document.getElementById('customer-phone').value;
            
            if (!customerName) {
                alert('Por favor, informe seu nome');
                return;
            }

            if (!customerPhone) {
                alert('Por favor, informe seu telefone');
                return;
            }

            if (cart.length === 0) {
                alert('Carrinho vazio');
                return;
            }

            try {
                const orderData = {
                    customerName: customerName,
                    customerPhone: customerPhone,
                    items: cart,
                    total: cart.reduce((sum, item) => sum + (item.price * item.quantity), 0)
                };

                const response = await fetch('http://localhost:3335/orders', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(orderData)
                });

                const result = await response.json();

                if (response.ok) {
                    alert('Pedido criado com sucesso!');
                    showWhatsAppMessage(result.order.whatsappMessage, result.order.whatsappLink);
                    cart = []; // Limpar carrinho
                    renderCart();
                } else {
                    alert('Erro: ' + result.message);
                }
            } catch (error) {
                alert('Erro ao criar pedido: ' + error.message);
            }
        }

        // Mostrar mensagem do WhatsApp
        function showWhatsAppMessage(message, whatsappLink) {
            const modal = document.createElement('div');
            modal.innerHTML = `
                <div style="position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.5); z-index: 1000;">
                    <div style="position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%); background: white; padding: 20px; border-radius: 10px; max-width: 500px; max-height: 80vh; overflow-y: auto;">
                        <h3>📱 Mensagem para WhatsApp</h3>
                        <div style="background: #f0f0f0; padding: 15px; border-radius: 5px; margin: 10px 0; white-space: pre-line; font-family: monospace;">${message}</div>
                        <button onclick="copyToClipboard('${message.replace(/'/g, "\\'")}')" style="background: #25D366; color: white; border: none; padding: 10px 20px; border-radius: 5px; cursor: pointer; margin-right: 10px;">📋 Copiar Mensagem</button>
                        <button onclick="window.open('${whatsappLink}', '_blank')" style="background: #25D366; color: white; border: none; padding: 10px 20px; border-radius: 5px; cursor: pointer; margin-right: 10px;">📱 Abrir WhatsApp</button>
                        <button onclick="this.parentElement.parentElement.remove()" style="background: #ccc; color: black; border: none; padding: 10px 20px; border-radius: 5px; cursor: pointer;">Fechar</button>
                    </div>
                </div>
            `;
            
            document.body.appendChild(modal);
        }

        // Copiar para área de transferência
        function copyToClipboard(text) {
            navigator.clipboard.writeText(text).then(() => {
                alert('Mensagem copiada para a área de transferência!');
            });
        }

        // Inicializar
        renderCart();
    </script>
</body>
</html>
```

### **4. Exemplo de Mensagem Gerada**

Quando o pedido for criado, a API retornará uma mensagem formatada como esta:

```
🛍️ *NOVO PEDIDO - ORD-1703123456789-ABC1*

👤 *Cliente:* João Silva
📱 *Telefone:* 11999999999

📦 *Itens do Pedido:*
1. *Camiseta Básica*
   💰 Preço: R$ 29,90
   📏 Quantidade: 2
   📐 Tamanho: M
   💵 Subtotal: R$ 59,80

2. *Calça Jeans*
   💰 Preço: R$ 89,90
   📏 Quantidade: 1
   📐 Tamanho: G
   💵 Subtotal: R$ 89,90

💰 *TOTAL DO PEDIDO: R$ 149,70*

📞 *Para confirmar o pedido, entre em contato conosco!*
🕒 *Horário de atendimento: Segunda a Sexta, 9h às 18h*
```

### **5. Como Usar no WhatsApp**

1. **Copie a mensagem** gerada pela API
2. **Abra o WhatsApp** no seu celular ou computador
3. **Cole a mensagem** na conversa com o cliente
4. **Envie a mensagem** para confirmar o pedido

### **6. Fluxo Completo**

1. **Cliente adiciona produtos** ao carrinho
2. **Cliente informa nome e telefone** antes de finalizar
3. **Sistema cria o pedido** via API
4. **API gera mensagem e link** formatados para WhatsApp
5. **Sistema mostra a mensagem** para o vendedor
6. **Vendedor clica no link** para abrir WhatsApp automaticamente
7. **Cliente confirma** o pedido via WhatsApp
8. **Admin atualiza status** e envia notificação via WhatsApp

---

**🎉 Agora você tem um sistema completo de pedidos com integração ao WhatsApp!**
