import { t } from "elysia";

export const orderItemSchema = t.Object({
    productId: t.String({ description: "Product ID" }),
    productName: t.String({ description: "Product name" }),
    price: t.Number({ description: "Product price" }),
    quantity: t.Number({ description: "Quantity" }),
    size: t.Optional(t.String({ description: "Selected size" })),
    imageUrl: t.Optional(t.String({ description: "Product image URL" }))
});

export const createOrderSchema = {
    body: t.Object({
        customerName: t.String({ description: "Customer name" }),
        customerPhone: t.String({ description: "Customer phone number" }),
        items: t.Array(orderItemSchema, { description: "Order items" }),
        total: t.Number({ description: "Total amount" })
    }),
    response: {
        201: t.Object({
            message: t.String(),
            order: t.Object({
                id: t.String(),
                orderNumber: t.String(),
                customerName: t.String(),
                customerPhone: t.String(),
                items: t.Array(orderItemSchema),
                total: t.Number(),
                status: t.String(),
                whatsappMessage: t.String(),
                whatsappLink: t.String(),
                createdAt: t.Date()
            })
        }),
        400: t.Object({
            message: t.String(),
            errors: t.Optional(t.Array(t.String()))
        }),
        500: t.Object({
            message: t.String()
        })
    }
};

export const getOrderSchema = {
    params: t.Object({
        id: t.String({ description: "Order ID" })
    }),
    response: {
        200: t.Object({
            order: t.Object({
                id: t.String(),
                orderNumber: t.String(),
                customerName: t.String(),
                customerPhone: t.String(),
                items: t.Array(orderItemSchema),
                total: t.Number(),
                status: t.String(),
                whatsappMessage: t.Optional(t.String()),
                whatsappLink: t.Optional(t.String()),
                createdAt: t.Date(),
                updatedAt: t.Optional(t.Date())
            })
        }),
        404: t.Object({
            message: t.String()
        })
    }
};

export const listOrdersSchema = {
    query: t.Object({
        status: t.Optional(t.String({ description: "Filter by status" })),
        page: t.Optional(t.Number({ description: "Page number" })),
        limit: t.Optional(t.Number({ description: "Items per page" }))
    }),
    response: {
        200: t.Object({
            orders: t.Array(t.Object({
                id: t.String(),
                orderNumber: t.String(),
                customerName: t.String(),
                customerPhone: t.String(),
                total: t.Number(),
                status: t.String(),
                createdAt: t.Date()
            })),
            pagination: t.Object({
                page: t.Number(),
                limit: t.Number(),
                total: t.Number(),
                totalPages: t.Number()
            })
        })
    }
};

export const updateOrderStatusSchema = {
    params: t.Object({
        id: t.String({ description: "Order ID" })
    }),
    body: t.Object({
        status: t.Union([
            t.Literal("pending"),
            t.Literal("confirmed"),
            t.Literal("processing"),
            t.Literal("shipped"),
            t.Literal("delivered"),
            t.Literal("cancelled")
        ], { description: "New order status" })
    }),
    response: {
        200: t.Object({
            message: t.String(),
            order: t.Object({
                id: t.String(),
                orderNumber: t.String(),
                status: t.String()
            }),
            whatsappMessage: t.Optional(t.String()),
            whatsappLink: t.Optional(t.String()),
            stockWarnings: t.Optional(t.Array(t.String()))
        }),
        404: t.Object({
            message: t.String()
        })
    }
};
