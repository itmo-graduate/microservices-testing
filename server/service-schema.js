module.exports = {
    serviceSchema: {
        type: "object",
        properties: {
            host: { type: "string" },
            routes: {
                type: "array",
                items: {
                    type: "object",
                    properties: {
                        path: { type: "string" },
                        method: { type: "string" },
                        bodyFields: { type: "string", nullable: true }
                    },
                    required: ["path", "method"],
                    additionalProperties: false
                }
            },
            usersStart: { type: "number" },
            usersEnd: { type: "number" },
            duration: { type: "number" }
        },
        required: ["host", "routes", "usersStart", "usersEnd", "duration"],
        additionalProperties: false
    }
}
