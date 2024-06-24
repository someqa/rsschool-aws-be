import { APIGatewayProxyEvent } from "aws-lambda";
import { DynamoDB } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocument } from '@aws-sdk/lib-dynamodb';

function generateUUIDv4() {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
        var r = Math.random() * 16 | 0,
            v = c === 'x' ? r : (r & 0x3 | 0x8);
        return v.toString(16);
    });
}

function validateProductSimply(product: any): boolean {
    return typeof product === 'object' && product.title && product.description && product.price !== undefined && product.count !== undefined;
}

export async function handler(event: APIGatewayProxyEvent) {
    const headers = { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*", "Access-Control-Allow-Methods": "*" };
    try {
        console.log("Incoming request for AddProduct Handler:", JSON.stringify(event));
        if (!event.body) {
            return { statusCode: 400, headers, body: 'invalid request, you are missing the parameter body' };
        }
        if (!validateProductSimply(JSON.parse(event.body))) {
            return { statusCode: 400, headers, body: 'invalid request, you are missing the parameter body' };
        }

        const productsTableName = process.env.PRODUCTS_TABLE_NAME || '';
        const stocksTableName = process.env.STOCKS_TABLE_NAME || '';
        const newProduct = JSON.parse(event.body);
        newProduct.id = generateUUIDv4();
        const db = DynamoDBDocument.from(new DynamoDB());
        const params = {
            TransactItems: [
                {
                    Put: {
                        TableName: productsTableName,
                        Item: {
                            id: newProduct.id,
                            title: newProduct.title,
                            description: newProduct.description,
                            price: newProduct.price
                        },
                        ConditionExpression: "attribute_not_exists(id)"
                    }
                },
                {
                    Put: {
                        TableName: stocksTableName,
                        Item: {
                            product_id: newProduct.id,
                            count: newProduct.count
                        }
                    }
                }
            ]
        };
        await db.transactWrite(params)
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
