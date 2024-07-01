import { Stack } from 'aws-cdk-lib';
import { Table } from 'aws-cdk-lib/aws-dynamodb';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import { Construct } from 'constructs';
import path from 'path';

export class GetProductsById extends Construct {
    public getProductListFunction: lambda.Function;
    constructor(stack: Stack, constructId: string) {
        super(stack, constructId);
        const lambdaFuncDir = path.join(__dirname, '../lambda_func');
        const productsTable = Table.fromTableName(this, 'ProductsTableById', 'products');
        const stocksTable = Table.fromTableName(this, 'StockTableById', 'stocks');
        this.getProductListFunction = new lambda.Function(this, 'GetProductsByIdFunction', {
            runtime: lambda.Runtime.NODEJS_20_X,
            code: lambda.Code.fromAsset(lambdaFuncDir),
            handler: 'products_by_id.handler',
            environment: {
                PRODUCTS_TABLE_NAME: productsTable.tableName,
                STOCKS_TABLE_NAME: stocksTable.tableName,
                PRODUCTS_PRIMARY_KEY: 'id',
                STOCKS_PRIMARY_KEY: 'product_id'
            },
        });
        productsTable.grantReadData(this.getProductListFunction);
        stocksTable.grantReadData(this.getProductListFunction)

    }
}
