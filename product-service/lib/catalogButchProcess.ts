import * as lambda from 'aws-cdk-lib/aws-lambda';
import * as sqs from 'aws-cdk-lib/aws-sqs';
import { SqsEventSource } from 'aws-cdk-lib/aws-lambda-event-sources';
import { Table } from 'aws-cdk-lib/aws-dynamodb';
import { Construct } from 'constructs';
import path from 'path';
import { Duration, CfnOutput } from 'aws-cdk-lib';
import * as snsSubscriptions from 'aws-cdk-lib/aws-sns-subscriptions';
import * as sns from 'aws-cdk-lib/aws-sns';

export class CatalogButch extends Construct {
    public catalogBatchProcess: lambda.Function;
    constructor(stack: Construct, constructId: string) {
        super(stack, constructId);
        const lambdaFuncDir = path.join(__dirname, '../lambda_func');
        const productsTable = Table.fromTableName(this, 'ProductsTableButch', 'products');
        const stocksTable = Table.fromTableName(this, 'StockTableButch', 'stocks');
        const createProductTopic = new sns.Topic(this, 'createProductTopic', {
            displayName: 'Create Product Topic',
        });

        const emailSubscription = new snsSubscriptions.EmailSubscription('jataji2622@atebin.com');

        const filterPolicy = {
            category: sns.SubscriptionFilter.numericFilter({
                greaterThan: 100,
            }),
        };

        const filteredEmailSubscription = new snsSubscriptions.EmailSubscription('someqa@atebin.com', {
            filterPolicy,
        });

        this.catalogBatchProcess = new lambda.Function(this, 'CatalogBatchProcess', {
            runtime: lambda.Runtime.NODEJS_20_X,
            code: lambda.Code.fromAsset(lambdaFuncDir),
            handler: 'catalog_butch_process.handler',
            environment: {
                PRODUCTS_TABLE_NAME: productsTable.tableName,
                STOCKS_TABLE_NAME: stocksTable.tableName,
                PRODUCT_TOPIC_ARN: createProductTopic.topicArn
            },
        });


        productsTable.grantReadWriteData(this.catalogBatchProcess);
        stocksTable.grantReadWriteData(this.catalogBatchProcess);

        const catalogItemsQueue = new sqs.Queue(this, 'CatalogItemsQueue', {
            visibilityTimeout: Duration.seconds(29),
        });

        this.catalogBatchProcess.addEventSource(new SqsEventSource(catalogItemsQueue, {
            batchSize: 5,
        }));
        new CfnOutput(this, "CatalogQueueUrlOutput", { value: catalogItemsQueue.queueUrl, exportName: "CatalogQueueUrl" })
        new CfnOutput(this, "CatalogQueueArnOutput", { value: catalogItemsQueue.queueArn, exportName: "CatalogQueueArn" })


        createProductTopic.addSubscription(emailSubscription);
        createProductTopic.addSubscription(filteredEmailSubscription)
        createProductTopic.grantPublish(this.catalogBatchProcess);
    }
}
