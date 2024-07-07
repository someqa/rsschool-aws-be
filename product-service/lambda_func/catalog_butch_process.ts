import { createProduct } from "./utils/createProduct";

exports.handler = async (event: any) => {
    const productsTableName = process.env.PRODUCTS_TABLE_NAME || '';
    const stocksTableName = process.env.STOCKS_TABLE_NAME || '';
    for (const record of event.Records) {
        const productInfo = JSON.parse(record.body);
        await createProduct(productInfo, productsTableName, stocksTableName)
    }
};
