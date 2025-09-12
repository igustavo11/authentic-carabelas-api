import { Elysia, t } from "elysia";
import { OrdersController } from "../controllers/orders.controller";
import { 
    createOrderSchema, 
    getOrderSchema, 
    listOrdersSchema, 
    updateOrderStatusSchema 
} from "../schemas/orders.schemas";

export const ordersRoutes = (app: Elysia) =>
    app
    // Criar pedido (público)
    .post("/orders", 
        ({ body, set }) => OrdersController.createOrder(body, set), 
        {
            ...createOrderSchema,
            detail: {
                tags: ["Orders"],
                summary: "Create order",
                description: "Create a new order with cart items"
            }
        }
    )
    // Buscar pedido por ID
    .get("/orders/:id", 
        ({ params, set }) => OrdersController.getOrder(params, set), 
        {
            ...getOrderSchema,
            detail: {
                tags: ["Orders"],
                summary: "Get order by ID",
                description: "Get order details by ID"
            }
        }
    )
    // Buscar pedido por número
    .get("/orders/number/:orderNumber", 
        ({ params, set }) => OrdersController.getOrderByNumber(params, set), 
        {
            params: t.Object({ orderNumber: t.String() }),
            detail: {
                tags: ["Orders"],
                summary: "Get order by number",
                description: "Get order details by order number"
            }
        }
    )
    // Listar pedidos (admin)
    .get("/admin/orders", 
        ({ query, set }) => OrdersController.listOrders(query, set), 
        {
            ...listOrdersSchema,
            detail: {
                tags: ["Admin", "Orders"],
                summary: "List orders",
                description: "List all orders with pagination and filters"
            }
        }
    )
    // Atualizar status do pedido (admin)
    .put("/admin/orders/:id/status", 
        ({ params, body, set }) => OrdersController.updateOrderStatus(params, body, set), 
        {
            ...updateOrderStatusSchema,
            detail: {
                tags: ["Admin", "Orders"],
                summary: "Update order status",
                description: "Update order status (admin only)"
            }
        }
    )
    // Gerar link do WhatsApp
    .get("/orders/:id/whatsapp", 
        ({ params, set }) => OrdersController.getWhatsAppLink(params, set), 
        {
            params: t.Object({ id: t.String() }),
            detail: {
                tags: ["Orders"],
                summary: "Get WhatsApp link",
                description: "Generate WhatsApp link for order"
            }
        }
    )
    // Verificar estoque de produto
    .get("/inventory/products/:productId/stock", 
        ({ params, set }) => OrdersController.checkProductStock(params, set), 
        {
            params: t.Object({ productId: t.String() }),
            detail: {
                tags: ["Inventory", "Products"],
                summary: "Check product stock",
                description: "Check current stock level of a product"
            }
        }
    );

export type OrdersRoutes = typeof ordersRoutes;
