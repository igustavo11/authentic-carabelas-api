import { Elysia, t } from "elysia";
import { authPlugin, authService } from "../utils/auth";
import { CloudinaryService } from "../utils/cloudnairy";

export const uploadRoutes = (app: Elysia) =>
    app
    .use(authPlugin)
    // Upload de uma única imagem
    .post("/admin/upload/image", 
        async ({ body, jwt, headers, set }) => {
            const user = await authService.verifyToken(headers.authorization, jwt);
            if (!user) {
                set.status = 401;
                return { message: "Unauthorized" };
            }

            try {
                const { file, folder, publicId } = body as {
                    file: File;
                    folder?: string;
                    publicId?: string;
                };

                if (!file) {
                    set.status = 400;
                    return { message: "Arquivo é obrigatório" };
                }

                // Converter File para Buffer
                const arrayBuffer = await file.arrayBuffer();
                const fileBuffer = Buffer.from(arrayBuffer);
                
                const result = await CloudinaryService.uploadImage(fileBuffer, folder, publicId);
                
                return {
                    success: true,
                    image: {
                        url: result.url,
                        secure_url: result.secure_url,
                        public_id: result.public_id,
                        width: result.width,
                        height: result.height
                    }
                };
            } catch (error) {
                set.status = 500;
                return { message: "Erro no upload da imagem" };
            }
        },
        {
            body: t.Object({
                file: t.File(),
                folder: t.Optional(t.String()),
                publicId: t.Optional(t.String())
            }),
            detail: {
                tags: ["Admin", "Upload"],
                summary: "Upload de imagem única",
                description: "Faz upload de uma imagem para o Cloudinary"
            }
        }
    )
    // Upload de múltiplas imagens
    .post("/admin/upload/images", 
        async ({ body, jwt, headers, set }) => {
            const user = await authService.verifyToken(headers.authorization, jwt);
            if (!user) {
                set.status = 401;
                return { message: "Unauthorized" };
            }

            try {
                const { files, folder } = body as {
                    files: File[];
                    folder?: string;
                };

                if (!files || files.length === 0) {
                    set.status = 400;
                    return { message: "Pelo menos um arquivo é obrigatório" };
                }

                // Converter Files para Buffers
                const fileBuffers = await Promise.all(
                    files.map(async (file) => {
                        const arrayBuffer = await file.arrayBuffer();
                        return Buffer.from(arrayBuffer);
                    })
                );

                const results = await CloudinaryService.uploadMultipleImages(fileBuffers, folder);
                
                return {
                    success: true,
                    images: results.map(result => ({
                        url: result.url,
                        secure_url: result.secure_url,
                        public_id: result.public_id,
                        width: result.width,
                        height: result.height
                    }))
                };
            } catch (error) {
                set.status = 500;
                return { message: "Erro no upload das imagens" };
            }
        },
        {
            body: t.Object({
                files: t.Array(t.File()),
                folder: t.Optional(t.String())
            }),
            detail: {
                tags: ["Admin", "Upload"],
                summary: "Upload de múltiplas imagens",
                description: "Faz upload de múltiplas imagens para o Cloudinary"
            }
        }
    )
    // Deletar imagem
    .delete("/admin/upload/image/:publicId", 
        async ({ params, jwt, headers, set }) => {
            const user = await authService.verifyToken(headers.authorization, jwt);
            if (!user) {
                set.status = 401;
                return { message: "Unauthorized" };
            }

            try {
                const { publicId } = params;
                const success = await CloudinaryService.deleteImage(publicId);
                
                if (success) {
                    return { success: true, message: "Imagem deletada com sucesso" };
                } else {
                    set.status = 404;
                    return { message: "Imagem não encontrada ou erro na deleção" };
                }
            } catch (error) {
                set.status = 500;
                return { message: "Erro ao deletar imagem" };
            }
        },
        {
            params: t.Object({ publicId: t.String() }),
            detail: {
                tags: ["Admin", "Upload"],
                summary: "Deletar imagem",
                description: "Deleta uma imagem do Cloudinary"
            }
        }
    );

export type UploadRoutes = typeof uploadRoutes;
