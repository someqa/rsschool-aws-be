import { Stack } from 'aws-cdk-lib';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import { Construct } from 'constructs';
import path from 'path';
import { Table } from 'aws-cdk-lib/aws-dynamodb';

export class CreateProduct extends Construct {
    public createProductFunction: lambda.Function;
    constructor(stack: Stack, constructId: string) {
        super(stack, constructId);
        const lambdaFuncDir = path.join(__dirname, '../product_service/lambda_func');
        const productsTable = Table.fromTableName(this, 'ProductsTableCreate', 'products');
        const stocksTable = Table.fromTableName(this, 'StockTableCreate', 'stocks');
        this.createProductFunction = new lambda.Function(this, 'CreateProductFunction', {
            runtime: lambda.Runtime.NODEJS_20_X,
            code: lambda.Code.fromAsset(lambdaFuncDir),
            handler: 'add_product.handler',
            environment: {
                PRODUCTS_TABLE_NAME: productsTable.tableName,
                STOCKS_TABLE_NAME: stocksTable.tableName
            },
        });
        productsTable.grantFullAccess(this.createProductFunction);
        stocksTable.grantFullAccess(this.createProductFunction)
    }
}
