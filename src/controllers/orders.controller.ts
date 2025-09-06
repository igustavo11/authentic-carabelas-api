import { prisma } from "../db/prisma";
import { WhatsAppService, type OrderData } from "../utils/whatsapp";
import { InventoryService, type OrderItem } from "../utils/inventory";

export class OrdersController {
    /**
     * Criar um novo pedido
     */
    static async createOrder(body: any, set: any) {
        try {
            // Verificar estoque antes de criar o pedido
            const stockCheck = await InventoryService.checkStockAvailability(body.items);
            if (!stockCheck.available) {
                set.status = 400;
                return { 
                    message: "Estoque insuficiente para alguns produtos",
                    errors: stockCheck.errors
                };
            }

            // Gerar número do pedido único
            const orderNumber = `ORD-${Date.now()}-${Math.random().toString(36).substr(2, 4).toUpperCase()}`;
            
            // Preparar dados do pedido
            const orderData: OrderData = {
                orderNumber,
                customerName: body.customerName,
                customerPhone: body.customerPhone,
                items: body.items,
                total: body.total
            };
            
            // Gerar mensagem do WhatsApp
            const whatsappMessage = WhatsAppService.generateOrderMessage(orderData);
            
            // Criar pedido no banco de dados
            const order = await prisma.order.create({
                data: {
                    orderNumber,
                    customerName: body.customerName,
                    customerPhone: body.customerPhone,
                    items: JSON.stringify(body.items),
                    total: body.total,
                    status: 'pending',
                    whatsappMessage
                }
            });
            
            // Gerar link do WhatsApp do admin para receber o pedido
            const whatsappLink = WhatsAppService.generateAdminWhatsAppLink(order.whatsappMessage || '');
            
            set.status = 201;
            return {
                message: "Pedido criado com sucesso!",
                order: {
                    id: order.id,
                    orderNumber: order.orderNumber,
                    customerName: order.customerName,
                    customerPhone: order.customerPhone,
                    items: body.items,
                    total: order.total,
                    status: order.status,
                    whatsappMessage: order.whatsappMessage,
                    whatsappLink: whatsappLink,
                    createdAt: order.createdAt
                }
            };
        } catch (error) {
            console.error('Erro ao criar pedido:', error);
            set.status = 500;
            return { message: "Erro ao criar pedido" };
        }
    }
    
    /**
     * Buscar pedido por ID
     */
    static async getOrder(params: any, set: any) {
        try {
            const order = await prisma.order.findUnique({
                where: { id: params.id }
            });
            
            if (!order) {
                set.status = 404;
                return { message: "Pedido não encontrado" };
            }
            
            return { 
                order: {
                    ...order,
                    items: JSON.parse(order.items)
                }
            };
        } catch (error) {
            console.error('Erro ao buscar pedido:', error);
            set.status = 500;
            return { message: "Erro ao buscar pedido" };
        }
    }
    
    /**
     * Listar pedidos com paginação
     */
    static async listOrders(query: any, set: any) {
        try {
            const page = parseInt(query.page) || 1;
            const limit = parseInt(query.limit) || 10;
            const skip = (page - 1) * limit;
            
            const where: any = {};
            if (query.status) {
                where.status = query.status;
            }
            
            const [orders, total] = await Promise.all([
                prisma.order.findMany({
                    where,
                    skip,
                    take: limit,
                    orderBy: { createdAt: 'desc' },
                    select: {
                        id: true,
                        orderNumber: true,
                        customerName: true,
                        customerPhone: true,
                        total: true,
                        status: true,
                        createdAt: true
                    }
                }),
                prisma.order.count({ where })
            ]);
            
            const totalPages = Math.ceil(total / limit);
            
            set.status = 200;
            return {
                orders,
                pagination: {
                    page,
                    limit,
                    total,
                    totalPages
                }
            };
        } catch (error) {
            console.error('Erro ao listar pedidos:', error);
            set.status = 500;
            return { 
                orders: [],
                pagination: {
                    page: 1,
                    limit: 10,
                    total: 0,
                    totalPages: 0
                },
                message: "Erro ao listar pedidos" 
            };
        }
    }
    
    /**
     * Atualizar status do pedido
     */
    static async updateOrderStatus(params: any, body: any, set: any) {
        try {
            const order = await prisma.order.findUnique({
                where: { id: params.id }
            });
            
            if (!order) {
                set.status = 404;
                return { message: "Pedido não encontrado" };
            }
            
            const oldStatus = order.status;
            const newStatus = body.status;
            
            // Processar mudanças de estoque baseado no status
            let stockResult: { success: boolean; errors: string[] } = { success: true, errors: [] };
            
            if (oldStatus !== 'delivered' && newStatus === 'delivered') {
                // Pedido foi entregue - reduzir estoque
                const orderItems: OrderItem[] = JSON.parse(order.items);
                stockResult = await InventoryService.reduceStockFromOrder(orderItems);
                
                if (!stockResult.success) {
                    console.warn('Erro ao reduzir estoque:', stockResult.errors);
                    // Não falha o pedido, apenas registra o erro
                }
            } else if (oldStatus === 'delivered' && newStatus === 'cancelled') {
                // Pedido foi cancelado após entrega - restaurar estoque
                const orderItems: OrderItem[] = JSON.parse(order.items);
                stockResult = await InventoryService.restoreStockFromOrder(orderItems);
                
                if (!stockResult.success) {
                    console.warn('Erro ao restaurar estoque:', stockResult.errors);
                    // Não falha o pedido, apenas registra o erro
                }
            }
            
            const updatedOrder = await prisma.order.update({
                where: { id: params.id },
                data: { 
                    status: newStatus,
                    updatedAt: new Date()
                }
            });
            
            // Gerar mensagem de atualização de status
            const statusUpdateMessage = WhatsAppService.generateStatusUpdateMessage(
                order.orderNumber,
                oldStatus,
                newStatus
            );
            
            // Gerar link do WhatsApp para envio da atualização
            // Se for notificação para o cliente, usar o telefone do cliente
            // Se for notificação para o admin, usar o WhatsApp do admin
            const whatsappLink = WhatsAppService.generateWhatsAppLink(
                order.customerPhone,
                statusUpdateMessage
            );
            
            const response: any = {
                message: "Status do pedido atualizado com sucesso!",
                order: {
                    id: updatedOrder.id,
                    orderNumber: updatedOrder.orderNumber,
                    status: updatedOrder.status
                },
                whatsappMessage: statusUpdateMessage,
                whatsappLink: whatsappLink
            };

            // Adicionar informações de estoque se houver erros
            if (!stockResult.success) {
                response.stockWarnings = stockResult.errors;
            }

            return response;
        } catch (error) {
            console.error('Erro ao atualizar status do pedido:', error);
            set.status = 500;
            return { message: "Erro ao atualizar status do pedido" };
        }
    }
    
    /**
     * Gerar link do WhatsApp para um pedido
     */
    static async getWhatsAppLink(params: any, set: any) {
        try {
            const order = await prisma.order.findUnique({
                where: { id: params.id }
            });
            
            if (!order) {
                set.status = 404;
                return { message: "Pedido não encontrado" };
            }
            
            if (!order.whatsappMessage) {
                set.status = 400;
                return { message: "Mensagem do WhatsApp não disponível" };
            }
            
            // Para este caso básico, retornamos apenas a mensagem formatada
            // O frontend pode usar esta mensagem para abrir o WhatsApp
            return {
                whatsappMessage: order.whatsappMessage,
                message: "Mensagem do WhatsApp gerada com sucesso!"
            };
        } catch (error) {
            console.error('Erro ao gerar mensagem do WhatsApp:', error);
            set.status = 500;
            return { message: "Erro ao gerar mensagem do WhatsApp" };
        }
    }
    
    /**
     * Buscar pedido por número
     */
    static async getOrderByNumber(params: any, set: any) {
        try {
            const order = await prisma.order.findUnique({
                where: { orderNumber: params.orderNumber }
            });
            
            if (!order) {
                set.status = 404;
                return { message: "Pedido não encontrado" };
            }
            
            return { 
                order: {
                    ...order,
                    items: JSON.parse(order.items)
                }
            };
        } catch (error) {
            console.error('Erro ao buscar pedido por número:', error);
            set.status = 500;
            return { message: "Erro ao buscar pedido" };
        }
    }

    /**
     * Verificar estoque de um produto
     */
    static async checkProductStock(params: any, set: any) {
        try {
            const stock = await InventoryService.getProductStock(params.productId);
            
            if (stock === null) {
                set.status = 404;
                return { message: "Produto não encontrado" };
            }
            
            return {
                productId: params.productId,
                stock: stock,
                available: stock > 0
            };
        } catch (error) {
            console.error('Erro ao verificar estoque do produto:', error);
            set.status = 500;
            return { message: "Erro ao verificar estoque do produto" };
        }
    }
}
