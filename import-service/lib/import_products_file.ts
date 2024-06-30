import { Stack } from 'aws-cdk-lib';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import { Construct } from 'constructs';
import path from 'path';

export class ImportProductsFile extends Construct {
    public importProductsFileFn: lambda.Function;
    constructor(stack: Stack, constructId: string) {
        super(stack, constructId);
        const lambdaFuncDir = path.join(__dirname, '../lambda_func');
        this.importProductsFileFn = new lambda.Function(this, 'ImportProductsFileFunction', {
            runtime: lambda.Runtime.NODEJS_20_X,
            code: lambda.Code.fromAsset(lambdaFuncDir),
            handler: 'import_products_file_lambda.handler'
        });
    }
}
