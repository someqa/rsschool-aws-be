import { DynamoDB } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocument } from '@aws-sdk/lib-dynamodb';

type Product = {
    id: string,
    title: string,
    description: string,
    count: number,
    price: number
}

function generateUUIDv4() {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
        var r = Math.random() * 16 | 0,
            v = c === 'x' ? r : (r & 0x3 | 0x8);
        return v.toString(16);
    });
}


export async function createProduct(productData: Partial<Product>, productsTableName: string, stocksTableName: string) {
    const newProduct = { ...productData, id: generateUUIDv4() }
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
    await db.transactWrite(params);

    return newProduct
}
