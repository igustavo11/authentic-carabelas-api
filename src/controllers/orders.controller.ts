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
            
            // Criar pedido no banco de dados usando raw command
            const insertResult = await prisma.$runCommandRaw({
                insert: "orders",
                documents: [{
                    orderNumber,
                    customerName: body.customerName,
                    customerPhone: body.customerPhone,
                    items: JSON.stringify(body.items),
                    total: body.total,
                    status: 'pending',
                    whatsappMessage,
                    createdAt: new Date(),
                    updatedAt: new Date()
                }]
            });

            if (!insertResult.ok || insertResult.n === 0) {
                set.status = 500;
                return { message: "Erro ao criar pedido" };
            }

            // Buscar o pedido criado
            const orderResult = await prisma.$runCommandRaw({
                find: "orders",
                filter: { 
                    orderNumber: orderNumber
                },
                limit: 1,
                sort: { _id: -1 }
            });

            if (!(orderResult as any).cursor?.firstBatch?.length) {
                set.status = 500;
                return { message: "Erro ao recuperar pedido criado" };
            }

            const order = (orderResult as any).cursor.firstBatch[0];
            
            // Converter ObjectId para string
            const orderId = order._id?.$oid || order._id?.toString() || String(order._id);
            
            // Gerar link do WhatsApp do admin para receber o pedido
            const whatsappLink = WhatsAppService.generateAdminWhatsAppLink(order.whatsappMessage || '');
            
            set.status = 201;
            return {
                message: "Pedido criado com sucesso!",
                order: {
                    id: orderId,
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
            // Usar raw command para buscar pedido por ID
            const result = await prisma.$runCommandRaw({
                find: "orders",
                filter: { 
                    _id: { $oid: params.id }
                },
                limit: 1
            });

            const orders = (result as any).cursor?.firstBatch || [];
            
            if (orders.length === 0) {
                set.status = 404;
                return { message: "Pedido não encontrado" };
            }

            const order = orders[0];
            
            return { 
                order: {
                    id: order._id?.$oid || order._id?.toString() || String(order._id),
                    orderNumber: order.orderNumber,
                    customerName: order.customerName,
                    customerPhone: order.customerPhone,
                    items: JSON.parse(order.items),
                    total: order.total,
                    status: order.status,
                    whatsappMessage: order.whatsappMessage,
                    whatsappLink: order.whatsappLink,
                    createdAt: order.createdAt,
                    updatedAt: order.updatedAt
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
            
            // Construir filtro MongoDB
            const filter: any = {};
            if (query.status) {
                filter.status = query.status;
            }
            
            // Buscar pedidos com paginação usando raw command
            const ordersResult = await prisma.$runCommandRaw({
                find: "orders",
                filter: filter,
                projection: {
                    orderNumber: 1,
                    customerName: 1,
                    customerPhone: 1,
                    total: 1,
                    status: 1,
                    createdAt: 1
                },
                sort: { createdAt: -1 },
                skip: skip,
                limit: limit
            });

            // Contar total de pedidos
            const countResult = await prisma.$runCommandRaw({
                count: "orders",
                query: filter
            });
            
            const orders = (ordersResult as any).cursor?.firstBatch || [];
            const total = (countResult as any).n || 0;
            const totalPages = Math.ceil(total / limit);
            
            // Formatar pedidos
            const formattedOrders = orders.map((order: any) => ({
                id: order._id?.$oid || order._id?.toString() || String(order._id),
                orderNumber: order.orderNumber,
                customerName: order.customerName,
                customerPhone: order.customerPhone,
                total: order.total,
                status: order.status,
                createdAt: order.createdAt
            }));
            
            set.status = 200;
            return {
                orders: formattedOrders,
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
            // Buscar pedido usando raw command
            const result = await prisma.$runCommandRaw({
                find: "orders",
                filter: { 
                    _id: { $oid: params.id }
                },
                limit: 1
            });

            const orders = (result as any).cursor?.firstBatch || [];
            
            if (orders.length === 0) {
                set.status = 404;
                return { message: "Pedido não encontrado" };
            }

            const order = orders[0];
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
            
            // Atualizar status usando raw command
            await prisma.$runCommandRaw({
                update: "orders",
                updates: [{
                    q: { _id: { $oid: params.id } },
                    u: { 
                        $set: { 
                            status: newStatus,
                            updatedAt: new Date()
                        }
                    }
                }]
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
                    id: order._id?.$oid || order._id?.toString() || String(order._id),
                    orderNumber: order.orderNumber,
                    status: newStatus
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
            // Usar raw command para buscar pedido por ID
            const result = await prisma.$runCommandRaw({
                find: "orders",
                filter: { 
                    _id: { $oid: params.id }
                },
                limit: 1
            });

            const orders = (result as any).cursor?.firstBatch || [];
            
            if (orders.length === 0) {
                set.status = 404;
                return { message: "Pedido não encontrado" };
            }

            const order = orders[0];
            
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
            // Usar raw command para buscar pedido por número
            const result = await prisma.$runCommandRaw({
                find: "orders",
                filter: { 
                    orderNumber: params.orderNumber
                },
                limit: 1
            });

            const orders = (result as any).cursor?.firstBatch || [];
            
            if (orders.length === 0) {
                set.status = 404;
                return { message: "Pedido não encontrado" };
            }

            const order = orders[0];
            
            return { 
                order: {
                    id: order._id?.$oid || order._id?.toString() || String(order._id),
                    orderNumber: order.orderNumber,
                    customerName: order.customerName,
                    customerPhone: order.customerPhone,
                    items: JSON.parse(order.items),
                    total: order.total,
                    status: order.status,
                    whatsappMessage: order.whatsappMessage,
                    whatsappLink: order.whatsappLink,
                    createdAt: order.createdAt,
                    updatedAt: order.updatedAt
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
