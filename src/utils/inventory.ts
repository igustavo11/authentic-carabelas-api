import { prisma } from "../db/prisma";

export interface OrderItem {
    productId: string;
    productName: string;
    price: number;
    quantity: number;
    size?: string;
    imageUrl?: string;
}

export class InventoryService {
    /**
     * Reduz o estoque dos produtos quando um pedido é entregue
     */
    static async reduceStockFromOrder(orderItems: OrderItem[]): Promise<{ success: boolean; errors: string[] }> {
        const errors: string[] = [];
        
        try {
            for (const item of orderItems) {
                try {
                    // Buscar o produto atual usando raw command
                    const result = await prisma.$runCommandRaw({
                        find: "products",
                        filter: { 
                            _id: { $oid: item.productId }
                        },
                        limit: 1
                    });

                    const products = (result as any).cursor?.firstBatch || [];
                    
                    if (products.length === 0) {
                        errors.push(`Produto ${item.productName} (ID: ${item.productId}) não encontrado`);
                        continue;
                    }

                    const product = products[0];

                    // Verificar se há estoque suficiente
                    if (product.stock < item.quantity) {
                        errors.push(`Estoque insuficiente para ${item.productName}. Disponível: ${product.stock}, Solicitado: ${item.quantity}`);
                        continue;
                    }

                    // Reduzir o estoque usando raw command
                    const newStock = product.stock - item.quantity;
                    await prisma.$runCommandRaw({
                        update: "products",
                        updates: [{
                            q: { _id: { $oid: item.productId } },
                            u: { 
                                $set: { 
                                    stock: newStock,
                                    updatedAt: new Date()
                                }
                            }
                        }]
                    });

                    console.log(`Estoque reduzido para ${item.productName}: ${product.stock} -> ${newStock}`);
                } catch (error) {
                    console.error(`Erro ao reduzir estoque do produto ${item.productName}:`, error);
                    errors.push(`Erro ao reduzir estoque de ${item.productName}: ${error instanceof Error ? error.message : 'Erro desconhecido'}`);
                }
            }

            return {
                success: errors.length === 0,
                errors
            };
        } catch (error) {
            console.error('Erro geral ao reduzir estoque:', error);
            return {
                success: false,
                errors: [`Erro geral ao reduzir estoque: ${error instanceof Error ? error.message : 'Erro desconhecido'}`]
            };
        }
    }

    /**
     * Restaura o estoque dos produtos quando um pedido é cancelado
     */
    static async restoreStockFromOrder(orderItems: OrderItem[]): Promise<{ success: boolean; errors: string[] }> {
        const errors: string[] = [];
        
        try {
            for (const item of orderItems) {
                try {
                    // Buscar o produto atual usando raw command
                    const result = await prisma.$runCommandRaw({
                        find: "products",
                        filter: { 
                            _id: { $oid: item.productId }
                        },
                        limit: 1
                    });

                    const products = (result as any).cursor?.firstBatch || [];
                    
                    if (products.length === 0) {
                        errors.push(`Produto ${item.productName} (ID: ${item.productId}) não encontrado`);
                        continue;
                    }

                    const product = products[0];

                    // Restaurar o estoque usando raw command
                    const newStock = product.stock + item.quantity;
                    await prisma.$runCommandRaw({
                        update: "products",
                        updates: [{
                            q: { _id: { $oid: item.productId } },
                            u: { 
                                $set: { 
                                    stock: newStock,
                                    updatedAt: new Date()
                                }
                            }
                        }]
                    });

                    console.log(`Estoque restaurado para ${item.productName}: ${product.stock} -> ${newStock}`);
                } catch (error) {
                    console.error(`Erro ao restaurar estoque do produto ${item.productName}:`, error);
                    errors.push(`Erro ao restaurar estoque de ${item.productName}: ${error instanceof Error ? error.message : 'Erro desconhecido'}`);
                }
            }

            return {
                success: errors.length === 0,
                errors
            };
        } catch (error) {
            console.error('Erro geral ao restaurar estoque:', error);
            return {
                success: false,
                errors: [`Erro geral ao restaurar estoque: ${error instanceof Error ? error.message : 'Erro desconhecido'}`]
            };
        }
    }

    /**
     * Verifica se há estoque suficiente para todos os itens do pedido
     */
    static async checkStockAvailability(orderItems: OrderItem[]): Promise<{ available: boolean; errors: string[] }> {
        const errors: string[] = [];
        
        try {
            for (const item of orderItems) {
                try {
                    // Usar raw command para buscar produto por ID
                    const result = await prisma.$runCommandRaw({
                        find: "products",
                        filter: { 
                            _id: { $oid: item.productId }
                        },
                        limit: 1
                    });

                    const products = (result as any).cursor?.firstBatch || [];
                    
                    if (products.length === 0) {
                        errors.push(`Produto ${item.productName} (ID: ${item.productId}) não encontrado`);
                        continue;
                    }

                    const product = products[0];

                    if (product.stock < item.quantity) {
                        errors.push(`Estoque insuficiente para ${item.productName}. Disponível: ${product.stock}, Solicitado: ${item.quantity}`);
                    }
                } catch (itemError) {
                    console.error(`Erro ao verificar produto ${item.productId}:`, itemError);
                    errors.push(`Erro ao verificar produto ${item.productName}: ${itemError instanceof Error ? itemError.message : 'Erro desconhecido'}`);
                }
            }

            return {
                available: errors.length === 0,
                errors
            };
        } catch (error) {
            console.error('Erro ao verificar estoque:', error);
            return {
                available: false,
                errors: [`Erro ao verificar estoque: ${error instanceof Error ? error.message : 'Erro desconhecido'}`]
            };
        }
    }

    /**
     * Obtém o estoque atual de um produto
     */
    static async getProductStock(productId: string): Promise<number | null> {
        try {
            // Usar raw command para buscar estoque do produto
            const result = await prisma.$runCommandRaw({
                find: "products",
                filter: { 
                    _id: { $oid: productId }
                },
                projection: { stock: 1 },
                limit: 1
            });

            const products = (result as any).cursor?.firstBatch || [];
            
            if (products.length === 0) {
                return null;
            }

            return products[0].stock ?? null;
        } catch (error) {
            console.error('Erro ao obter estoque do produto:', error);
            return null;
        }
    }
}

export default InventoryService;
