import { APIGatewayProxyEvent } from "aws-lambda";
import { handler } from "../product_service/lambda_func/products_by_id";

describe('Get Products By Id - valid result', () => {
    const params = { pathParameters: { productId: '1234' } } as unknown as APIGatewayProxyEvent

    it('returns status code 200', async () => {
        const validResult = await handler(params);
        expect(validResult.statusCode).toBe(200);
    });

    it('returns headers with Content-Type: application/json', async () => {
        const validResult = await handler(params);
        expect(validResult.headers['Content-Type']).toBe('application/json');
    });

    it('returns a product', async () => {
        const validResult = await handler(params);
        expect(JSON.parse(validResult.body)).not.toBeNull();
    });
})

describe('Get Products By Id - invalid result', () => {
    const params = { pathParameters: { productId: '999564654545' } } as unknown as APIGatewayProxyEvent


    it('returns status code 404', async () => {
        const validResult = await handler(params);
        expect(validResult.statusCode).toBe(404);
    })

    it('returns headers with Content-Type: application/json', async () => {
        const validResult = await handler(params);
        expect(validResult.headers['Content-Type']).toBe('application/json');
    });

    it('returns a product not found message', async () => {
        const validResult = await handler(params);
        expect(JSON.parse(validResult.body).message).toBe('Product not found');
    });
})
