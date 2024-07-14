import * as path from 'path';
import { Construct } from 'constructs';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import 'dotenv/config';

export class AuthorizationServiceStack extends Construct {
    public basicAuthorizer: lambda.Function;
    constructor(scope: Construct, id: string) {
        super(scope, id);
        const lambdaFuncDir = path.join(__dirname, '../lambda_func');
        const envVars =
            Object.fromEntries(
                Object.entries(process.env).filter(([key, value]) => value !== undefined)
            ) as { [key: string]: string };

        this.basicAuthorizer = new lambda.Function(this, 'BasicAuthorizer', {
            code: lambda.Code.fromAsset(lambdaFuncDir),
            handler: 'basic-authorizer.handler',
            runtime: lambda.Runtime.NODEJS_20_X,
            environment: envVars
        });
    }
}
