import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import * as apigateway from 'aws-cdk-lib/aws-apigateway';
import { ImportProductsFile } from './import_products_file';

export class ImportServiceStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    const importProductsFile = new ImportProductsFile(this, 'ImportProductsFile').importProductsFileFn;

    // Create the API Gateway
    const api = new apigateway.RestApi(this, 'ImportProductsFile', {
      restApiName: 'Product Service',
      defaultCorsPreflightOptions: {
        allowOrigins: apigateway.Cors.ALL_ORIGINS,
        allowMethods: apigateway.Cors.ALL_METHODS
      }
    });

    const productsResource = api.root.addResource('import');
    productsResource.addMethod('GET', new apigateway.LambdaIntegration(importProductsFile));
  }
}
