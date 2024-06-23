import { APIGatewayProxyEvent } from "aws-lambda";
import { DynamoDB } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocument } from '@aws-sdk/lib-dynamodb';
import { v4 as uuidv4 } from 'uuid';

function validateProductSimply(product: any): boolean {
    return typeof product === 'object' && product.title && product.description && product.price !== undefined && product.count !== undefined;
}

export async function handler(event: APIGatewayProxyEvent) {
    const headers = { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*", "Access-Control-Allow-Methods": "*" };
    try {
        if (!event.body) {
            return { statusCode: 400, headers, body: 'invalid request, you are missing the parameter body' };
        }
        if (!validateProductSimply(JSON.parse(event.body))) {
            return { statusCode: 400, headers, body: 'invalid request, you are missing the parameter body' };
        }

        const productsTableName = process.env.PRODUCTS_TABLE_NAME || '';
        const stocksTableName = process.env.STOCKS_TABLE_NAME || '';
        const newProduct = JSON.parse(event.body);
        newProduct.id = uuidv4();
        const db = DynamoDBDocument.from(new DynamoDB());
        const params = {
            TransactItems: [
                {
                    Put: {
                        TableName: productsTableName,
                        Item: {
                            id: { S: newProduct.id },
                            title: { S: newProduct.title },
                            description: { S: newProduct.description },
                            price: { N: newProduct.price.toString() }
                        },
                        ConditionExpression: "attribute_not_exists(id)"
                    }
                },
                {
                    Put: {
                        TableName: stocksTableName,
                        Item: {
                            product_id: { S: newProduct.productId },
                            count: { N: newProduct.count.toString() }
                        }
                    }
                }
            ]
        };
        await db.transactWrite(params);
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
