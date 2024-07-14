import { APIGatewayProxyEvent } from "aws-lambda";
import { createProduct } from "./utils/createProduct";

function validateProductSimply(product: any): boolean {
    return typeof product === 'object' && product.title && product.description && product.price !== undefined && product.count !== undefined;
}

export async function handler(event: APIGatewayProxyEvent) {
    const headers = { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*", "Access-Control-Allow-Methods": "*" };
    try {
        console.log("Incoming request for AddProduct Handler:", JSON.stringify(event, null, 2));
        if (!event.body) {
            return { statusCode: 400, headers, body: 'invalid request, you are missing the parameter body' };
        }
        const productData = JSON.parse(event.body);
        if (!validateProductSimply(productData)) {
            return { statusCode: 400, headers, body: 'invalid request, you are missing the parameter body' };
        }
        const productsTableName = process.env.PRODUCTS_TABLE_NAME || '';
        const stocksTableName = process.env.STOCKS_TABLE_NAME || '';

        const newProduct = await createProduct(productData, productsTableName, stocksTableName);
        return {
            statusCode: 201, headers,
            body: JSON.stringify({ id: newProduct.id })
        };
    } catch (error) {
        return {
            statusCode: 500,
            headers,
            body: JSON.stringify(error)
        };
    }
};
