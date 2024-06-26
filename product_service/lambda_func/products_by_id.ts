import { APIGatewayProxyEvent } from "aws-lambda";
import { DynamoDB } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocument } from '@aws-sdk/lib-dynamodb';

export async function handler(event: APIGatewayProxyEvent) {
    try {
        console.log("Incoming request for ProductById Handler:", JSON.stringify(event, null, 2));
        const productId = event.pathParameters?.productId;
        const productsTableName = process.env.PRODUCTS_TABLE_NAME || '';
        const stocksTableName = process.env.STOCKS_TABLE_NAME || '';
        const productsPrimaryKey = process.env.PRODUCTS_PRIMARY_KEY || '';
        const stocksPrimaryKey = process.env.STOCKS_PRIMARY_KEY || '';
        const db = DynamoDBDocument.from(new DynamoDB());
        const productParams = {
            TableName: productsTableName,
            Key: {
                [productsPrimaryKey]: productId
            }
        };
        const { Item: product } = await db.get(productParams);

        const stocksParams = {
            TableName: stocksTableName,
            Key: {
                [stocksPrimaryKey]: productId
            }
        };
        const { Item: stock } = await db.get(stocksParams);
        const count = stock?.count || 0;

        if (!product) {
            return {
                statusCode: 404,
                headers: {
                    "Content-Type": "application/json", "Access-Control-Allow-Origin": "*", "Access-Control-Allow-Methods": "GET"
                },
                body: JSON.stringify({ message: "Product not found" })
            };
        }

        return {
            statusCode: 200,
            headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*", "Access-Control-Allow-Methods": "GET" },
            body: JSON.stringify({ ...product, count })
        };
    }
    catch (e) {
        return {
            statusCode: 500,
            headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*", "Access-Control-Allow-Methods": "GET" },
            body: JSON.stringify(e)
        };
    }
}
