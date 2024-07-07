import * as lambda from 'aws-cdk-lib/aws-lambda';
import * as sqs from 'aws-cdk-lib/aws-sqs';
import { SqsEventSource } from 'aws-cdk-lib/aws-lambda-event-sources';
import { Table } from 'aws-cdk-lib/aws-dynamodb';
import { Construct } from 'constructs';
import path from 'path';
import { Duration, CfnOutput } from 'aws-cdk-lib';

export class CatalogButch extends Construct {
    public catalogBatchProcess: lambda.Function;
    constructor(stack: Construct, constructId: string) {
        super(stack, constructId);
        const lambdaFuncDir = path.join(__dirname, '../lambda_func');
        const productsTable = Table.fromTableName(this, 'ProductsTableButch', 'products');
        const stocksTable = Table.fromTableName(this, 'StockTableButch', 'stocks');
        this.catalogBatchProcess = new lambda.Function(this, 'CatalogBatchProcess', {
            runtime: lambda.Runtime.NODEJS_20_X,
            code: lambda.Code.fromAsset(lambdaFuncDir),
            handler: 'catalog_butch_process.handler',
            environment: {
                PRODUCTS_TABLE_NAME: productsTable.tableName,
                STOCKS_TABLE_NAME: stocksTable.tableName
            },
        });


        productsTable.grantReadWriteData(this.catalogBatchProcess);


        const catalogItemsQueue = new sqs.Queue(this, 'CatalogItemsQueue', {
            visibilityTimeout: Duration.seconds(29),
        });

        this.catalogBatchProcess.addEventSource(new SqsEventSource(catalogItemsQueue, {
            batchSize: 5,
        }));
        new CfnOutput(this, "CatalogQueueArn", { value: catalogItemsQueue.queueArn })

    }
}
