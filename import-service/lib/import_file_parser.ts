import { aws_sqs, Fn, Stack } from 'aws-cdk-lib';
import { Construct } from 'constructs';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import * as s3 from 'aws-cdk-lib/aws-s3';
import * as s3Notifications from 'aws-cdk-lib/aws-s3-notifications';
import path from 'path';
//import productServiceData from '../../product-service/product-service-data.json';

export class ImportFileParser extends Construct {
    constructor(stack: Stack, constructId: string) {
        super(stack, constructId);

        const bucket = s3.Bucket.fromBucketName(this, "Import-service-bucket", process.env.BUCKET_NAME || 'someqa-import-service-bucket');
        const lambdaFuncDir = path.join(__dirname, '../lambda_func');
        const catalogQueueUrl = Fn.importValue("CatalogQueueUrl");
        const catalogQueueArn = Fn.importValue("CatalogQueueArn");
        const queue = aws_sqs.Queue.fromQueueArn(this, "CatalogQueueImport", catalogQueueArn)

        const importFileParserFn = new lambda.Function(this, 'ImportFileParserFunction', {
            runtime: lambda.Runtime.NODEJS_20_X,
            handler: 'importFileParser.handler',
            code: lambda.Code.fromAsset(lambdaFuncDir),
            environment: {
                BUCKET_NAME: bucket.bucketName,
                SQS_URL: catalogQueueUrl
            },
        });

        bucket.grantReadWrite(importFileParserFn);

        bucket.addObjectCreatedNotification(new s3Notifications.LambdaDestination(importFileParserFn), {
            prefix: 'uploaded/',
        });

        queue.grantSendMessages(importFileParserFn)
    }
}
