import { prisma } from "../db/prisma";
import { authService } from "../utils/auth";

export class ProductsController {
    static async listProducts(query: any, set: any) {
        try {
            const where: any = {};

            if (query?.category) {
                where.category = query.category;
            }

            if (query?.search) {
                where.OR = [
                    { name: { contains: query.search, mode: "insensitive" } },
                    { description: { contains: query.search, mode: "insensitive" } }
                ];
            }

            const products = await prisma.product.findMany({ where });
            return { products };
        } catch (error) {
            set.status = 500;
            return { message: "Failed to list products" };
        }
    }

    static async getProduct(params: any, set: any) {
        try {
            const product = await prisma.product.findUnique({ where: { id: params.id } });
            if (!product) {
                set.status = 404;
                return { message: "Product not found" };
            }
            return { product };
        } catch (error) {
            set.status = 500;
            return { message: "Failed to fetch product" };
        }
    }

    static async listAdminProducts(jwt: any, headers: any, set: any) {
        const user = await authService.verifyToken(headers.authorization, jwt);
        if (!user) {
            set.status = 401;
            return { message: "Unauthorized" };
        }
        try {
            const products = await prisma.product.findMany();
            return { products };
        } catch (error) {
            set.status = 500;
            return { message: "Failed to list products" };
        }
    }

    static async createProduct(body: any, jwt: any, headers: any, set: any) {
        const user = await authService.verifyToken(headers.authorization, jwt);
        if (!user) {
            set.status = 401;
            return { message: "Unauthorized" };
        }
        try {
            // Criar produto usando operação raw do MongoDB (sem transações)
            const insertResult = await prisma.$runCommandRaw({
                insert: "Product",
                documents: [{
                    name: body.name,
                    price: body.price,
                    description: body.description,
                    imageUrl: body.imageUrl || "",
                    category: body.category,
                    sizes: body.sizes || [],
                    stock: body.stock
                }]
            });

            if (!insertResult.ok || insertResult.n === 0) {
                set.status = 500;
                return { message: "Failed to create product" };
            }

            // Buscar o produto criado usando operação raw
            const productResult = await prisma.$runCommandRaw({
                find: "Product",
                filter: { 
                    name: body.name,
                    category: body.category 
                },
                limit: 1,
                sort: { _id: -1 }
            });

            if (!(productResult as any).cursor?.firstBatch?.length) {
                set.status = 500;
                return { message: "Failed to retrieve created product" };
            }

            const product = (productResult as any).cursor.firstBatch[0];
            
            // Converter ObjectId para string de forma mais robusta
            let productId: string;
            if (typeof product._id === 'string') {
                productId = product._id;
            } else if (product._id && product._id.$oid) {
                productId = product._id.$oid;
            } else if (product._id && typeof product._id.toString === 'function') {
                productId = product._id.toString();
            } else {
                productId = String(product._id);
            }
            
            set.status = 201;
            return { 
                product: {
                    id: productId,
                    name: product.name,
                    price: product.price,
                    description: product.description,
                    imageUrl: product.imageUrl,
                    category: product.category,
                    sizes: product.sizes,
                    stock: product.stock
                }
            };
        } catch (error) {
            set.status = 500;
            return { message: "Failed to create product" };
        }
    }

    static async updateProduct(params: any, body: any, jwt: any, headers: any, set: any) {
        const user = await authService.verifyToken(headers.authorization, jwt);
        if (!user) {
            set.status = 401;
            return { message: "Unauthorized" };
        }
        try {
            const product = await prisma.product.update({
                where: { id: params.id },
                data: {
                    ...(body.name !== undefined ? { name: body.name } : {}),
                    ...(body.price !== undefined ? { price: body.price } : {}),
                    ...(body.description !== undefined ? { description: body.description } : {}),
                    ...(body.imageUrl !== undefined ? { imageUrl: body.imageUrl } : {}),
                    ...(body.category !== undefined ? { category: body.category } : {}),
                    ...(body.sizes !== undefined ? { sizes: body.sizes } : {}),
                    ...(body.stock !== undefined ? { stock: body.stock } : {})
                }
            });
            return { product };
        } catch (error) {
            set.status = 404;
            return { message: "Product not found or update failed" };
        }
    }

    static async deleteProduct(params: any, jwt: any, headers: any, set: any) {
        const user = await authService.verifyToken(headers.authorization, jwt);
        if (!user) {
            set.status = 401;
            return { message: "Unauthorized" };
        }
        try {
            await prisma.product.delete({ where: { id: params.id } });
            return { success: true };
        } catch (error) {
            set.status = 404;
            return { message: "Product not found or delete failed" };
        }
    }
}
