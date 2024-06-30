import { APIGatewayProxyEvent } from "aws-lambda";
import { handler } from "../product_service/lambda_func/products_list";

describe('Get Products List', () => {
    const mockEvent = {} as APIGatewayProxyEvent;

    it('returns status code 200', async () => {
        const result = await handler(mockEvent);
        expect(result.statusCode).toBe(200);
    })

    it('returns headers with Content-Type: application/json', async () => {
        const result = await handler(mockEvent);
        expect(result.headers['Content-Type']).toBe('application/json');
    });

    it('returns headers with Access-Control-Allow-Origin: *', async () => {
        const result = await handler(mockEvent);
        expect(result.headers['Access-Control-Allow-Origin']).toBe('*');
    });

    it('returns headers with Access-Control-Allow-Methods: GET', async () => {
        const result = await handler(mockEvent);
        expect(result.headers['Access-Control-Allow-Methods']).toBe('GET');
    });

    it('returns an array of products', async () => {
        const result = await handler(mockEvent);
        expect(JSON.parse(result.body)).toBeInstanceOf(Array);
    })
})
