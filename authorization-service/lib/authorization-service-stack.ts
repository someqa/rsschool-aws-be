import * as path from 'path';
import { Construct } from 'constructs';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import * as cdk from "aws-cdk-lib";
import { config } from 'dotenv';

export class AuthorizationServiceStack extends cdk.Stack {
    public basicAuthorizer: lambda.Function;
    constructor(scope: Construct, id: string) {
        super(scope, id);
        const lambdaFuncDir = path.join(__dirname, '../lambda_func');
        this.basicAuthorizer = new lambda.Function(this, 'BasicAuthorizer', {
            code: lambda.Code.fromAsset(lambdaFuncDir),
            handler: 'basic-authorizer.handler',
            runtime: lambda.Runtime.NODEJS_20_X,
            //reading from .env file, if needed - can be read from anywhere - e.g. a separate service, db etc.
            environment:
                { ...config().parsed }
        });

        this.basicAuthorizer.addPermission('ApiGatewayInvokePermission', {
            principal: new cdk.aws_iam.ServicePrincipal('apigateway.amazonaws.com'),
            action: 'lambda:InvokeFunction',
            sourceArn: `arn:aws:execute-api:${this.region}:${this.account}:*/*/*`,
        });

        new cdk.CfnOutput(this, 'BasicAuthorizerArn', {
            value: this.basicAuthorizer.functionArn,
            exportName: 'BasicAuthorizerArn',
        });
    }
}
