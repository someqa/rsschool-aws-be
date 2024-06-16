import products from "./products.json";
import { APIGatewayProxyEvent } from "aws-lambda";

export async function handler(event: APIGatewayProxyEvent) {

    const productId = event.pathParameters?.productId;

    const product = products.find(p => p.id === productId);

    if (!product) {
        return {
            statusCode: 404,
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ message: "Product not found" })
        };
    }

    return {
        statusCode: 200,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(product)
    };
};
