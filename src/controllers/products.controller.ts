import { prisma } from "../db/prisma";
import { authService } from "../utils/auth";
import { CloudinaryService } from "../utils/cloudnairy";

export class ProductsController {
    static async listProducts(query: any, set: any) {
        try {
            // Construir filtro MongoDB
            const filter: any = {};

            if (query?.category) {
                filter.category = query.category;
            }

            if (query?.search) {
                filter.$or = [
                    { name: { $regex: query.search, $options: "i" } },
                    { description: { $regex: query.search, $options: "i" } }
                ];
            }

            // Usar raw command para buscar produtos
            const result = await prisma.$runCommandRaw({
                find: "products",
                filter: filter
            });

            const products = (result as any).cursor?.firstBatch || [];
            
            // Converter ObjectIds para strings
            const formattedProducts = products.map((product: any) => ({
                id: product._id?.$oid || product._id?.toString() || String(product._id),
                name: product.name,
                price: product.price,
                description: product.description,
                imageUrl: product.imageUrl,
                images: product.images || [],
                category: product.category,
                sizes: product.sizes || [],
                stock: product.stock,
                isOutOfStock: product.isOutOfStock || false,
                createdAt: product.createdAt,
                updatedAt: product.updatedAt
            }));

            return { products: formattedProducts };
        } catch (error) {
            console.error('Erro ao listar produtos:', error);
            set.status = 500;
            return { message: "Failed to list products" };
        }
    }

    static async getProduct(params: any, set: any) {
        try {
            // Usar raw command para buscar produto por ID
            const result = await prisma.$runCommandRaw({
                find: "products",
                filter: { 
                    _id: { $oid: params.id }
                },
                limit: 1
            });

            const products = (result as any).cursor?.firstBatch || [];
            
            if (products.length === 0) {
                set.status = 404;
                return { message: "Product not found" };
            }

            const product = products[0];
            
            // Formatar produto
            const formattedProduct = {
                id: product._id?.$oid || product._id?.toString() || String(product._id),
                name: product.name,
                price: product.price,
                description: product.description,
                imageUrl: product.imageUrl,
                images: product.images || [],
                category: product.category,
                sizes: product.sizes || [],
                stock: product.stock,
                isOutOfStock: product.isOutOfStock || false,
                createdAt: product.createdAt,
                updatedAt: product.updatedAt
            };

            return { product: formattedProduct };
        } catch (error) {
            console.error('Erro ao buscar produto:', error);
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
            // Usar raw command para buscar todos os produtos
            const result = await prisma.$runCommandRaw({
                find: "products",
                filter: {}
            });

            const products = (result as any).cursor?.firstBatch || [];
            
            // Converter ObjectIds para strings
            const formattedProducts = products.map((product: any) => ({
                id: product._id?.$oid || product._id?.toString() || String(product._id),
                name: product.name,
                price: product.price,
                description: product.description,
                imageUrl: product.imageUrl,
                images: product.images || [],
                category: product.category,
                sizes: product.sizes || [],
                stock: product.stock,
                isOutOfStock: product.isOutOfStock || false,
                createdAt: product.createdAt,
                updatedAt: product.updatedAt
            }));

            return { products: formattedProducts };
        } catch (error) {
            console.error('Erro ao listar produtos (admin):', error);
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
            // Converter tipos do form-data
            const price = typeof body.price === 'string' ? parseFloat(body.price) : body.price;
            const stock = typeof body.stock === 'string' ? parseInt(body.stock) : body.stock;
            const sizes = typeof body.sizes === 'string' ? body.sizes.split(',').map((s: string) => s.trim()) : body.sizes;
            
            let imageUrls: string[] = [];
            
            // Se houver imagens para upload
            if (body.images) {
                try {
                    // Se for um único arquivo, converter para array
                    const files = Array.isArray(body.images) ? body.images : [body.images];
                    
                    // Converter Files para Buffers
                    const fileBuffers = await Promise.all(
                        files.map(async (file: File) => {
                            const arrayBuffer = await file.arrayBuffer();
                            return Buffer.from(arrayBuffer);
                        })
                    );
                    
                    const uploadResults = await CloudinaryService.uploadMultipleImages(
                        fileBuffers,
                        'products'
                    );
                    imageUrls = uploadResults.map(result => result.secure_url);
                } catch (uploadError) {
                    console.error('Erro no upload das imagens:', uploadError);
                    set.status = 500;
                    return { message: "Erro no upload das imagens" };
                }
            }

            // Criar produto usando operação raw do MongoDB (sem transações)
            // Usando "products" (plural) que é o nome correto da collection
            const insertResult = await prisma.$runCommandRaw({
                insert: "products",  // ← CORRIGIDO: era "Product", agora é "products"
                documents: [{
                    name: body.name,
                    price: price,
                    description: body.description,
                    imageUrl: body.imageUrl || "",
                    images: imageUrls,
                    category: body.category,
                    sizes: sizes || [],
                    stock: stock,
                    isOutOfStock: body.isOutOfStock || false,
                    createdAt: new Date(),
                    updatedAt: new Date()
                }]
            });

            if (!insertResult.ok || insertResult.n === 0) {
                set.status = 500;
                return { message: "Failed to create product" };
            }

            // Buscar o produto criado usando operação raw
            // Usando "products" (plural) que é o nome correto da collection
            const productResult = await prisma.$runCommandRaw({
                find: "products",  // ← CORRIGIDO: era "Product", agora é "products"
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
                    images: product.images || [],
                    category: product.category,
                    sizes: product.sizes,
                    stock: product.stock,
                    isOutOfStock: product.isOutOfStock || false,
                    createdAt: product.createdAt,
                    updatedAt: product.updatedAt
                }
            };
        } catch (error) {
            console.error('Erro ao criar produto:', error);
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
            // Converter tipos do form-data
            const price = body.price !== undefined ? (typeof body.price === 'string' ? parseFloat(body.price) : body.price) : undefined;
            const stock = body.stock !== undefined ? (typeof body.stock === 'string' ? parseInt(body.stock) : body.stock) : undefined;
            const sizes = body.sizes !== undefined ? (typeof body.sizes === 'string' ? body.sizes.split(',').map((s: string) => s.trim()) : body.sizes) : undefined;
            
            let imageUrls: string[] = [];
            
            // Se houver novas imagens para upload
            if (body.images) {
                try {
                    // Se for um único arquivo, converter para array
                    const files = Array.isArray(body.images) ? body.images : [body.images];
                    
                    // Converter Files para Buffers
                    const fileBuffers = await Promise.all(
                        files.map(async (file: File) => {
                            const arrayBuffer = await file.arrayBuffer();
                            return Buffer.from(arrayBuffer);
                        })
                    );
                    
                    const uploadResults = await CloudinaryService.uploadMultipleImages(
                        fileBuffers,
                        'products'
                    );
                    imageUrls = uploadResults.map(result => result.secure_url);
                } catch (uploadError) {
                    console.error('Erro no upload das imagens:', uploadError);
                    set.status = 500;
                    return { message: "Erro no upload das imagens" };
                }
            }

            // Se houver imagens antigas para deletar
            if (body.imagesToDelete && body.imagesToDelete.length > 0) {
                try {
                    await Promise.all(
                        body.imagesToDelete.map((publicId: string) => 
                            CloudinaryService.deleteImage(publicId)
                        )
                    );
                } catch (deleteError) {
                    console.error('Erro ao deletar imagens antigas:', deleteError);
                    // Não falha a operação se não conseguir deletar as imagens antigas
                }
            }

            const updateData: any = {
                ...(body.name !== undefined ? { name: body.name } : {}),
                ...(price !== undefined ? { price: price } : {}),
                ...(body.description !== undefined ? { description: body.description } : {}),
                ...(body.imageUrl !== undefined ? { imageUrl: body.imageUrl } : {}),
                ...(body.category !== undefined ? { category: body.category } : {}),
                ...(sizes !== undefined ? { sizes: sizes } : {}),
                ...(stock !== undefined ? { stock: stock } : {}),
                ...(body.isOutOfStock !== undefined ? { isOutOfStock: body.isOutOfStock } : {}),
                ...(imageUrls.length > 0 ? { images: imageUrls } : {}),
                updatedAt: new Date()
            };

            // Atualizar produto usando raw command do MongoDB
            const updateResult = await prisma.$runCommandRaw({
                update: "products",
                updates: [{
                    q: { _id: { $oid: params.id } },
                    u: { $set: updateData }
                }]
            });

            if (!updateResult.ok || updateResult.n === 0) {
                set.status = 404;
                return { message: "Product not found" };
            }

            // Buscar o produto atualizado
            const productResult = await prisma.$runCommandRaw({
                find: "products",
                filter: { _id: { $oid: params.id } },
                limit: 1
            });

            const products = (productResult as any).cursor?.firstBatch || [];
            
            if (products.length === 0) {
                set.status = 404;
                return { message: "Product not found" };
            }

            const product = products[0];
            
            // Formatar produto
            const formattedProduct = {
                id: product._id?.$oid || product._id?.toString() || String(product._id),
                name: product.name,
                price: product.price,
                description: product.description,
                imageUrl: product.imageUrl,
                images: product.images || [],
                category: product.category,
                sizes: product.sizes || [],
                stock: product.stock,
                isOutOfStock: product.isOutOfStock || false,
                createdAt: product.createdAt,
                updatedAt: product.updatedAt
            };

            return { product: formattedProduct };
        } catch (error) {
            console.error('Erro ao atualizar produto:', error);
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
            // Buscar o produto primeiro para obter as imagens usando raw command
            const productResult = await prisma.$runCommandRaw({
                find: "products",
                filter: { _id: { $oid: params.id } },
                limit: 1
            });

            const products = (productResult as any).cursor?.firstBatch || [];
            
            if (products.length === 0) {
                set.status = 404;
                return { message: "Product not found" };
            }

            const product = products[0];

            // Deletar imagens do Cloudinary se existirem
            if (product.images && product.images.length > 0) {
                try {
                    await Promise.all(
                        product.images.map((imageUrl: string) => {
                            const publicId = CloudinaryService.extractPublicId(imageUrl);
                            if (publicId) {
                                return CloudinaryService.deleteImage(publicId);
                            }
                            return Promise.resolve(false);
                        })
                    );
                } catch (deleteError) {
                    console.error('Erro ao deletar imagens do Cloudinary:', deleteError);
                    // Continua com a deleção do produto mesmo se não conseguir deletar as imagens
                }
            }

            // Deletar o produto do banco de dados usando raw command
            const deleteResult = await prisma.$runCommandRaw({
                delete: "products",
                deletes: [{
                    q: { _id: { $oid: params.id } },
                    limit: 1
                }]
            });

            if (!deleteResult.ok || deleteResult.n === 0) {
                set.status = 404;
                return { message: "Product not found" };
            }

            return { success: true };
        } catch (error) {
            console.error('Erro ao deletar produto:', error);
            set.status = 404;
            return { message: "Product not found or delete failed" };
        }
    }

    static async toggleOutOfStock(params: any, jwt: any, headers: any, set: any) {
        const user = await authService.verifyToken(headers.authorization, jwt);
        if (!user) {
            set.status = 401;
            return { message: "Unauthorized" };
        }
        try {
            // Buscar o produto atual para obter o status atual
            const productResult = await prisma.$runCommandRaw({
                find: "products",
                filter: { _id: { $oid: params.id } },
                limit: 1
            });

            const products = (productResult as any).cursor?.firstBatch || [];
            
            if (products.length === 0) {
                set.status = 404;
                return { message: "Product not found" };
            }

            const product = products[0];
            const currentOutOfStock = product.isOutOfStock || false;
            const newOutOfStock = !currentOutOfStock;

            // Atualizar o status de esgotado
            const updateResult = await prisma.$runCommandRaw({
                update: "products",
                updates: [{
                    q: { _id: { $oid: params.id } },
                    u: { 
                        $set: { 
                            isOutOfStock: newOutOfStock,
                            updatedAt: new Date()
                        }
                    }
                }]
            });

            if (!updateResult.ok || updateResult.n === 0) {
                set.status = 404;
                return { message: "Product not found" };
            }

            // Buscar o produto atualizado
            const updatedProductResult = await prisma.$runCommandRaw({
                find: "products",
                filter: { _id: { $oid: params.id } },
                limit: 1
            });

            const updatedProducts = (updatedProductResult as any).cursor?.firstBatch || [];
            const updatedProduct = updatedProducts[0];
            
            // Formatar produto
            const formattedProduct = {
                id: updatedProduct._id?.$oid || updatedProduct._id?.toString() || String(updatedProduct._id),
                name: updatedProduct.name,
                price: updatedProduct.price,
                description: updatedProduct.description,
                imageUrl: updatedProduct.imageUrl,
                images: updatedProduct.images || [],
                category: updatedProduct.category,
                sizes: updatedProduct.sizes || [],
                stock: updatedProduct.stock,
                isOutOfStock: updatedProduct.isOutOfStock || false,
                createdAt: updatedProduct.createdAt,
                updatedAt: updatedProduct.updatedAt
            };

            const message = newOutOfStock ? 
                "Produto marcado como esgotado" : 
                "Produto marcado como disponível";

            return { 
                product: formattedProduct,
                message: message
            };
        } catch (error) {
            console.error('Erro ao alterar status de esgotado do produto:', error);
            set.status = 500;
            return { message: "Failed to toggle out of stock status" };
        }
    }
}
