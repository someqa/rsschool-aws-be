import products from "./products.json";

export async function handler() {
    return {
        statusCode: 200,
        headers: { "Content-Type": "application/json" },
        body: products
    };
};
