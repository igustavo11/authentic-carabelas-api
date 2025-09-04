import { t } from "elysia";

export const productResponseSchema = t.Object({
    id: t.String(),
    name: t.String(),
    price: t.Number(),
    description: t.String(),
    imageUrl: t.Union([t.String(), t.Null()]),
    images: t.Array(t.String()),
    category: t.String(),
    sizes: t.Array(t.String()),
    stock: t.Number(),
    createdAt: t.Optional(t.Date()),
    updatedAt: t.Optional(t.Date())
});

export const listProductsSchema = {
    query: t.Object({
        category: t.Optional(t.String({ description: "Filter by product category" })),
        search: t.Optional(t.String({ description: "Search in product name and description" }))
    }),
    response: {
        200: t.Object({
            products: t.Array(productResponseSchema)
        }),
        500: t.Object({
            message: t.String()
        })
    }
};

export const createProductSchema = {
    body: t.Object({
        name: t.String({ description: "Product name" }),
        price: t.Union([t.Number(), t.String()], { description: "Product price" }),
        description: t.String({ description: "Product description" }),
        imageUrl: t.Optional(t.String({ description: "Product image URL" })),
        images: t.Optional(t.Union([t.Array(t.File()), t.File()], { description: "Product images to upload" })),
        category: t.String({ description: "Product category" }),
        sizes: t.Optional(t.Union([t.Array(t.String()), t.String()], { description: "Available sizes (P, M, G, GG)" })),
        stock: t.Union([t.Number(), t.String()], { description: "Stock quantity" })
    }),
    response: {
        201: t.Object({
            product: productResponseSchema
        }),
        401: t.Object({
            message: t.String()
        }),
        500: t.Object({
            message: t.String()
        })
    }
};

export const updateProductSchema = {
    params: t.Object({ id: t.String() }),
    body: t.Object({
        name: t.Optional(t.String()),
        price: t.Optional(t.Union([t.Number(), t.String()])),
        description: t.Optional(t.String()),
        imageUrl: t.Optional(t.String()),
        images: t.Optional(t.Union([t.Array(t.File()), t.File()], { description: "New images to upload" })),
        imagesToDelete: t.Optional(t.Array(t.String(), { description: "Public IDs of images to delete" })),
        category: t.Optional(t.String()),
        sizes: t.Optional(t.Union([t.Array(t.String()), t.String()])),
        stock: t.Optional(t.Union([t.Number(), t.String()]))
    })
};
