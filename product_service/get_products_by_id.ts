import { Stack } from 'aws-cdk-lib';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import { Construct } from 'constructs';
import path from 'path';

export class GetProductsById extends Construct {
    public getProductListFunction: lambda.Function;
    constructor(stack: Stack, constructId: string) {
        super(stack, constructId);
        const lambdaFuncDir = path.join(__dirname, '../product_service/lambda_func');
        this.getProductListFunction = new lambda.Function(this, 'GetProductsByIdFunction', {
            runtime: lambda.Runtime.NODEJS_20_X,
            code: lambda.Code.fromAsset(lambdaFuncDir),
            handler: 'products_by_id.handler',
        });

    }
}
