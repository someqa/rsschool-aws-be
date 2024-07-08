import { createProduct } from "./utils/createProduct";
import { SNSClient, PublishCommand } from "@aws-sdk/client-sns";


export async function handler(event: any) {
    const productsTableName = process.env.PRODUCTS_TABLE_NAME || '';
    const stocksTableName = process.env.STOCKS_TABLE_NAME || '';
    const productTopicArn = process.env.PRODUCT_TOPIC_ARN || '';
    const snsClient = new SNSClient();
    for (const record of event.Records) {
        const productInfo = JSON.parse(record.body);
        const product = await createProduct(productInfo, productsTableName, stocksTableName);
        const message = JSON.stringify({ action: 'product_created', product });
        const params = {
            Message: message,
            TopicArn: productTopicArn
        };

        const data = await snsClient.send(new PublishCommand(params))
    }
};
