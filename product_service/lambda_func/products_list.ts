import { DynamoDB } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocument } from '@aws-sdk/lib-dynamodb';

export async function handler() {
    const productsTableName = process.env.PRODUCTS_TABLE_NAME || '';
    const stocksTableName = process.env.STOCKS_TABLE_NAME || '';
    try {
        console.log("Incoming request for Products_List Handler:", JSON.stringify(event));
        const db = DynamoDBDocument.from(new DynamoDB());
        const { Items: products } = await db.scan({
            TableName: productsTableName
        });
        const { Items: stocks } = await db.scan({
            TableName: stocksTableName
        });

        const results = products?.map(product => ({ ...product, count: stocks?.find(it => it.product_id === product.id)?.count || 0 }))
        return {
            statusCode: 200,
            headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*", "Access-Control-Allow-Methods": "GET" },
            body: JSON.stringify(results)
        };
    }
    catch (e) {
        return {
            statusCode: 500,
            headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*", "Access-Control-Allow-Methods": "GET" },
            body: JSON.stringify(e)
        }
    }
};
