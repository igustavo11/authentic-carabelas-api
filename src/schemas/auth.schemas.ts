import { t } from "elysia";

export const registerSchema = {
    body: t.Object({
        email: t.String({ description: "User email" }),
        password: t.String({ description: "User password" }),
        role: t.Optional(t.String({ description: "User role (default: admin)" }))
    }),
    response: {
        201: t.Object({
            message: t.String(),
            user: t.Object({
                id: t.String(),
                email: t.String(),
                role: t.String()
            })
        }),
        400: t.Object({
            message: t.String()
        }),
        500: t.Object({
            message: t.String(),
            error: t.Optional(t.String())
        })
    }
};

export const loginSchema = {
    body: t.Object({
        email: t.String({ description: "Admin email" }),
        password: t.String({ description: "Admin password" }),
    }),
    response: {
        200: t.Object({
            message: t.String(),
            token: t.String(),
            user: t.Object({
                id: t.String(),
                email: t.String(),
                role: t.String()
            })
        }),
        401: t.Object({
            message: t.String()
        }),
        404: t.Object({
            message: t.String()
        })
    }
};

export const profileSchema = {
    headers: t.Object({
        authorization: t.String({ description: "Bearer token" })
    }),
    response: {
        200: t.Object({
            message: t.String(),
            user: t.Object({
                id: t.String(),
                email: t.String(),
                role: t.String()
            })
        }),
        401: t.Object({
            message: t.String()
        })
    }
};
