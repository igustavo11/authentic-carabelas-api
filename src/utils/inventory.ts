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
                    // Buscar o produto atual
                    const product = await prisma.product.findUnique({
                        where: { id: item.productId }
                    });

                    if (!product) {
                        errors.push(`Produto ${item.productName} (ID: ${item.productId}) não encontrado`);
                        continue;
                    }

                    // Verificar se há estoque suficiente
                    if (product.stock < item.quantity) {
                        errors.push(`Estoque insuficiente para ${item.productName}. Disponível: ${product.stock}, Solicitado: ${item.quantity}`);
                        continue;
                    }

                    // Reduzir o estoque
                    await prisma.product.update({
                        where: { id: item.productId },
                        data: {
                            stock: {
                                decrement: item.quantity
                            }
                        }
                    });

                    console.log(`Estoque reduzido para ${item.productName}: ${product.stock} -> ${product.stock - item.quantity}`);
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
                    // Buscar o produto atual
                    const product = await prisma.product.findUnique({
                        where: { id: item.productId }
                    });

                    if (!product) {
                        errors.push(`Produto ${item.productName} (ID: ${item.productId}) não encontrado`);
                        continue;
                    }

                    // Restaurar o estoque
                    await prisma.product.update({
                        where: { id: item.productId },
                        data: {
                            stock: {
                                increment: item.quantity
                            }
                        }
                    });

                    console.log(`Estoque restaurado para ${item.productName}: ${product.stock} -> ${product.stock + item.quantity}`);
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
                const product = await prisma.product.findUnique({
                    where: { id: item.productId }
                });

                if (!product) {
                    errors.push(`Produto ${item.productName} (ID: ${item.productId}) não encontrado`);
                    continue;
                }

                if (product.stock < item.quantity) {
                    errors.push(`Estoque insuficiente para ${item.productName}. Disponível: ${product.stock}, Solicitado: ${item.quantity}`);
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
            const product = await prisma.product.findUnique({
                where: { id: productId },
                select: { stock: true }
            });

            return product?.stock ?? null;
        } catch (error) {
            console.error('Erro ao obter estoque do produto:', error);
            return null;
        }
    }
}

export default InventoryService;
