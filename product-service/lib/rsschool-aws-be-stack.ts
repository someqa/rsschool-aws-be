import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import * as apigateway from 'aws-cdk-lib/aws-apigateway';
import { GetProducts } from './getProducts';
import { GetProductsById } from './getProductsById';
import { CreateProduct } from './createProduct';
import { CatalogButch } from './catalogButchProcess';


export class RsschoolAwsBeStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    const getProducts = new GetProducts(this, 'GetProducts').getProductListFunction;
    const getProductsById = new GetProductsById(this, 'GetProductsById').getProductListFunction;
    const createProduct = new CreateProduct(this, 'CreateProduct').createProductFunction;
    // Create the API Gateway
    const api = new apigateway.RestApi(this, 'ProductServiceApi', {
      restApiName: 'Product Service'
    });

    const productsResource = api.root.addResource('products');
    productsResource.addMethod('GET', new apigateway.LambdaIntegration(getProducts));
    productsResource.addMethod('POST', new apigateway.LambdaIntegration(createProduct));
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
    const productsByIdResource = productsResource.addResource('{productId}');
    productsByIdResource.addMethod('GET', new apigateway.LambdaIntegration(getProductsById));

    new CatalogButch(this, 'CatalogButch');

  }
}
