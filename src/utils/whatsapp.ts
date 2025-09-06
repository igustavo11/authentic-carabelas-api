export interface OrderItem {
    productId: string;
    productName: string;
    price: number;
    quantity: number;
    size?: string;
    imageUrl?: string;
}

export interface OrderData {
    orderNumber: string;
    customerName: string;
    customerPhone: string;
    items: OrderItem[];
    total: number;
}

export class WhatsAppService {
    /**
     * Gera uma mensagem formatada para WhatsApp com os detalhes do pedido
     */
    static generateOrderMessage(orderData: OrderData): string {
        const { orderNumber, customerName, customerPhone, items, total } = orderData;
        
        let message = `🛍️ *NOVO PEDIDO - ${orderNumber}*\n\n`;
        
        // Informações do cliente
        message += `👤 *Cliente:* ${customerName}\n`;
        message += `📱 *Telefone:* ${customerPhone}\n\n`;
        
        // Itens do pedido
        message += `📦 *Itens do Pedido:*\n`;
        items.forEach((item, index) => {
            message += `${index + 1}. *${item.productName}*\n`;
            message += `   💰 Preço: R$ ${item.price.toFixed(2)}\n`;
            message += `   📏 Quantidade: ${item.quantity}\n`;
            if (item.size) {
                message += `   📐 Tamanho: ${item.size}\n`;
            }
            message += `   💵 Subtotal: R$ ${(item.price * item.quantity).toFixed(2)}\n\n`;
        });
        
        // Total
        message += `💰 *TOTAL DO PEDIDO: R$ ${total.toFixed(2)}*\n\n`;
        
        // Informações de contato
        message += `📞 *Para confirmar o pedido, entre em contato conosco!*\n`;
        message += `🕒 *Horário de atendimento: Segunda a Sexta, 9h às 18h*`;
        
        return message;
    }
    
    /**
     * Gera uma mensagem de confirmação de pedido
     */
    static generateOrderConfirmationMessage(orderNumber: string, status: string): string {
        let message = `✅ *PEDIDO CONFIRMADO*\n\n`;
        message += `📋 Número do Pedido: *${orderNumber}*\n`;
        message += `📊 Status: *${this.getStatusEmoji(status)} ${this.getStatusText(status)}*\n\n`;
        message += `Obrigado pela sua compra! Em breve entraremos em contato para mais detalhes.`;
        
        return message;
    }
    
    /**
     * Gera uma mensagem de atualização de status
     */
    static generateStatusUpdateMessage(orderNumber: string, oldStatus: string, newStatus: string): string {
        let message = `🔄 *ATUALIZAÇÃO DE PEDIDO*\n\n`;
        message += `📋 Número do Pedido: *${orderNumber}*\n`;
        message += `📊 Status Anterior: *${this.getStatusEmoji(oldStatus)} ${this.getStatusText(oldStatus)}*\n`;
        message += `📊 Novo Status: *${this.getStatusEmoji(newStatus)} ${this.getStatusText(newStatus)}*\n\n`;
        
        if (newStatus === 'shipped') {
            message += `🚚 Seu pedido foi enviado! Em breve você receberá o código de rastreamento.`;
        } else if (newStatus === 'delivered') {
            message += `🎉 Seu pedido foi entregue! Obrigado pela compra!`;
        } else if (newStatus === 'cancelled') {
            message += `❌ Seu pedido foi cancelado. Entre em contato conosco para mais informações.`;
        }
        
        return message;
    }
    
    /**
     * Converte o status para emoji
     */
    private static getStatusEmoji(status: string): string {
        const statusEmojis: { [key: string]: string } = {
            'pending': '⏳',
            'confirmed': '✅',
            'processing': '🔄',
            'shipped': '🚚',
            'delivered': '🎉',
            'cancelled': '❌'
        };
        return statusEmojis[status] || '❓';
    }
    
    /**
     * Converte o status para texto legível
     */
    private static getStatusText(status: string): string {
        const statusTexts: { [key: string]: string } = {
            'pending': 'Pendente',
            'confirmed': 'Confirmado',
            'processing': 'Processando',
            'shipped': 'Enviado',
            'delivered': 'Entregue',
            'cancelled': 'Cancelado'
        };
        return statusTexts[status] || 'Desconhecido';
    }
    
    /**
     * Gera um resumo simples do pedido para notificações
     */
    static generateOrderSummary(orderData: OrderData): string {
        const { orderNumber, customerName, total, items } = orderData;
        const totalItems = items.reduce((sum, item) => sum + item.quantity, 0);
        
        return `🛍️ Novo pedido ${orderNumber} de ${customerName} - ${totalItems} itens - R$ ${total.toFixed(2)}`;
    }
    
    /**
     * Formata um número de telefone para WhatsApp
     */
    static formatPhoneNumber(phone: string): string {
        // Remove todos os caracteres não numéricos
        const cleaned = phone.replace(/\D/g, '');
        
        // Se não começar com 55 (Brasil), adiciona
        if (!cleaned.startsWith('55')) {
            return `55${cleaned}`;
        }
        
        return cleaned;
    }
    
    /**
     * Gera link do WhatsApp para envio da mensagem
     */
    static generateWhatsAppLink(phone: string, message: string): string {
        const formattedPhone = this.formatPhoneNumber(phone);
        const encodedMessage = encodeURIComponent(message);
        return `https://wa.me/${formattedPhone}?text=${encodedMessage}`;
    }

    /**
     * Gera link do WhatsApp do admin para receber pedidos
     */
    static generateAdminWhatsAppLink(message: string): string {
        const adminPhone = process.env.WHATSAPP_ADM;
        if (!adminPhone) {
            throw new Error('WHATSAPP_ADM não configurado nas variáveis de ambiente');
        }
        const formattedPhone = this.formatPhoneNumber(adminPhone);
        const encodedMessage = encodeURIComponent(message);
        return `https://wa.me/${formattedPhone}?text=${encodedMessage}`;
    }
}

export default WhatsAppService;
