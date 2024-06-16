import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import * as apigateway from 'aws-cdk-lib/aws-apigateway';
import { GetProducts } from '../product_service/get_products';

export class RsschoolAwsBeStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    const getProducts = new GetProducts(this, 'GetProducts').getProductListFunction;
    const getProductsById = new GetProducts(this, 'GetProductsById').getProductListFunction;
    // Create the API Gateway
    const api = new apigateway.RestApi(this, 'ProductServiceApi', {
      restApiName: 'Product Service',
    });

    const productsResource = api.root.addResource('products');
    productsResource.addMethod('GET', new apigateway.LambdaIntegration(getProducts));
    const productsByIdResource = productsResource.addResource('{product_id}');
    productsByIdResource.addMethod('GET', new apigateway.LambdaIntegration(getProductsById));
  }
}
