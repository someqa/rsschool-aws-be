import { handler } from '../lambda_func/catalog_butch_process';
import { PublishCommand } from '@aws-sdk/client-sns';

// Mock for SNSClient
class SNSClient {
    send = jest.fn().mockImplementation((command) => {
        return {
            MessageId: 'mockMessageId', // Example mock response
        };
    });
}

let snsClientMock: SNSClient;

const mockProductsTableName = 'mockProductsTable';
const mockStocksTableName = 'mockStocksTable';
const mockProductTopicArn = 'arn:aws:sns:mock-region:mock-account-id:mock-topic';

process.env.PRODUCTS_TABLE_NAME = mockProductsTableName;
process.env.STOCKS_TABLE_NAME = mockStocksTableName;
process.env.PRODUCT_TOPIC_ARN = mockProductTopicArn;
// Mock for createProduct function
const mockCreateProduct = jest.fn().mockImplementation((productInfo, productsTableName, stocksTableName) => {
    return Promise.resolve({ id: 'mockProductId', name: productInfo.name }); // Example mock response
});

jest.mock('../lambda_func/utils/createProduct', () => ({
    createProduct: (...args: any) => mockCreateProduct(...args)
}));

jest.mock('@aws-sdk/client-sns', () => ({
    SNSClient: jest.fn(() => snsClientMock),
    PublishCommand: jest.fn(() => ({
        execute: async () => ({
            MessageId: 'mockMessageId',
        }),
    })),
}));

describe('handler', () => {
    beforeEach(() => {
        snsClientMock = new SNSClient() as any;
    });

    afterEach(() => {
        jest.clearAllMocks();
    });


    it('should process records of 2 correctly', async () => {
        const mockEvent = {
            Records: [
                { body: JSON.stringify({ name: 'Product A' }) },
                { body: JSON.stringify({ name: 'Product B' }) },
            ],
        };
        await handler(mockEvent);

        // Assert createProduct function calls
        expect(mockCreateProduct).toHaveBeenCalledTimes(2); // Two records in event
        expect(mockCreateProduct).toHaveBeenCalledWith(
            { name: 'Product A' },
            mockProductsTableName,
            mockStocksTableName
        );
        expect(mockCreateProduct).toHaveBeenCalledWith(
            { name: 'Product B' },
            mockProductsTableName,
            mockStocksTableName
        );

        // Assert SNSClient.send calls
        expect(snsClientMock.send).toHaveBeenCalledTimes(2); // Two messages published
    });

    it('should process records of 1 correctly', async () => {
        const mockEvent = {
            Records: [
                { body: JSON.stringify({ name: 'Product A' }) },
            ],
        };
        await handler(mockEvent);

        // Assert createProduct function calls
        expect(mockCreateProduct).toHaveBeenCalledTimes(1);
        expect(mockCreateProduct).toHaveBeenCalledWith(
            { name: 'Product A' },
            mockProductsTableName,
            mockStocksTableName
        );

        // Assert SNSClient.send calls
        expect(snsClientMock.send).toHaveBeenCalledTimes(1);
    });
});
