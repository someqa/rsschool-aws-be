import { Stack } from 'aws-cdk-lib';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import { Construct } from 'constructs';
import path from 'path';
import { Table } from 'aws-cdk-lib/aws-dynamodb';

export class GetProducts extends Construct {
    public getProductListFunction: lambda.Function;
    constructor(stack: Stack, constructId: string) {
        super(stack, constructId);
        const lambdaFuncDir = path.join(__dirname, '../lambda_func');
        const productsTable = Table.fromTableName(this, 'ProductsTable', 'products');
        const stocksTable = Table.fromTableName(this, 'StockTable', 'stocks');
        this.getProductListFunction = new lambda.Function(this, 'GetProductsListFunction', {
            runtime: lambda.Runtime.NODEJS_20_X,
            code: lambda.Code.fromAsset(lambdaFuncDir),
            handler: 'products_list.handler',
            environment: {
                PRODUCTS_TABLE_NAME: productsTable.tableName,
                STOCKS_TABLE_NAME: stocksTable.tableName
            },
        });
        productsTable.grantReadData(this.getProductListFunction);
        stocksTable.grantReadData(this.getProductListFunction)
    }
}
