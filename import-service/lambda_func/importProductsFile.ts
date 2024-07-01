import { APIGatewayProxyHandler } from 'aws-lambda';
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';

const s3 = new S3Client({});
const bucketName = process.env.BUCKET_NAME || '';

export const handler: APIGatewayProxyHandler = async (event) => {
    const fileName = event.queryStringParameters?.name;

    if (!fileName) {
        return {
            statusCode: 400,
            headers: {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': '*',
                'Access-Control-Allow-Credentials': true,
            },
            body: JSON.stringify('File name query parameter is required'),
        };
    }

    const objectKey = `uploaded/${fileName}`;
    const command = new PutObjectCommand({
        Bucket: bucketName,
        Key: objectKey,
    });

    const signedUrl = await getSignedUrl(s3, command, { expiresIn: 3600 });

    return {
        statusCode: 200,
        headers: {
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': '*',
            'Access-Control-Allow-Credentials': true,
        },
        body: JSON.stringify({ signedUrl }),
    };
};
