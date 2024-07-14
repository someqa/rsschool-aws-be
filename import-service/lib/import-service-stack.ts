import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import * as apigateway from 'aws-cdk-lib/aws-apigateway';
import { ImportProductsFile } from './import_products_file_stack';
import { ImportFileParser } from './import_file_parser';
import * as lambda from 'aws-cdk-lib/aws-lambda';

export class ImportServiceStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);
    const importProductsFile = new ImportProductsFile(this, 'ImportProductsFileFn').importProductsFileFn;

    const api = new apigateway.RestApi(this, 'ImportProductsFileApi', {
      restApiName: 'Import Products Service',
    });

    const basicAuthorizerArn = cdk.Fn.importValue('BasicAuthorizerArn');
    const authorizer = new apigateway.TokenAuthorizer(this, 'BasicAuthorizer', {
      handler: lambda.Function.fromFunctionArn(this, 'BasicAuthorizerFunction', basicAuthorizerArn),
    });




    const productsResource = api.root.addResource('import');
    productsResource.addMethod('OPTIONS', new apigateway.MockIntegration({
      integrationResponses: [
        {
          statusCode: '200',
          responseParameters: {
            'method.response.header.Access-Control-Allow-Headers': "'Content-Type,X-Amz-Date,Authorization,X-Api-Key,X-Amz-Security-Token'",
            'method.response.header.Access-Control-Allow-Origin': "'*'",
            'method.response.header.Access-Control-Allow-Methods': "'GET,POST,OPTIONS'",
            'method.response.header.Access-Control-Max-Age': "'1728000'",
          },
          responseTemplates: {
            'application/json': '{"statusCode": 200}'
          },
        },
      ],
      passthroughBehavior: apigateway.PassthroughBehavior.NEVER,
      requestTemplates: {
        'application/json': '{"statusCode": 200}'
      },
    }), {
      methodResponses: [
        {
          statusCode: '200',
          responseParameters: {
            'method.response.header.Access-Control-Allow-Headers': true,
            'method.response.header.Access-Control-Allow-Methods': true,
            'method.response.header.Access-Control-Allow-Origin': true,
            'method.response.header.Access-Control-Max-Age': true,
          },
        },
      ],
    });
    productsResource.addMethod('GET', new apigateway.LambdaIntegration(importProductsFile), {
      authorizer,
      authorizationType: apigateway.AuthorizationType.CUSTOM
    });

    new ImportFileParser(this, 'ImportFileParser');
  }
}
