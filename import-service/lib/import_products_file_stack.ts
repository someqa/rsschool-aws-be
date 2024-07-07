import { Stack } from 'aws-cdk-lib';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import { Construct } from 'constructs';
import path from 'path';
import * as s3 from 'aws-cdk-lib/aws-s3';
import * as iam from 'aws-cdk-lib/aws-iam';

export class ImportProductsFile extends Construct {
    public importProductsFileFn: lambda.Function;
    constructor(stack: Stack, constructId: string) {
        super(stack, constructId);
        const bucket = s3.Bucket.fromBucketName(this, "Import-service-bucket", process.env.BUCKET_NAME || 'someqa-import-service-bucket');
        const lambdaFuncDir = path.join(__dirname, '../lambda_func');
        this.importProductsFileFn = new lambda.Function(this, 'ImportProductsFileFunction', {
            runtime: lambda.Runtime.NODEJS_20_X,
            code: lambda.Code.fromAsset(lambdaFuncDir),
            handler: 'importProductsFile.handler',
            environment: {
                BUCKET_NAME: bucket.bucketName,
            },
        });
        bucket.grantReadWrite(this.importProductsFileFn);

        this.importProductsFileFn.addToRolePolicy(new iam.PolicyStatement({
            actions: ['s3:GetObject', 's3:PutObject', 's3:ListBucket'],
            resources: [
                bucket.bucketArn,
                `${bucket.bucketArn}/*`
            ],
        }));
    }
}
