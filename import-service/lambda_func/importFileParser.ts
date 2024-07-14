import { S3Event } from 'aws-lambda';
import { S3Client, GetObjectCommand, CopyObjectCommand, DeleteObjectCommand } from '@aws-sdk/client-s3';
import csvParser from 'csv-parser';
import { NodeJsClient } from '@smithy/types';
import { pipeline } from 'stream/promises';
import { SQS } from '@aws-sdk/client-sqs';

const s3 = new S3Client({}) as NodeJsClient<S3Client>;
const sqs = new SQS();

export const handler = async (event: S3Event) => {
    const record = event.Records[0];
    const bucketName = record.s3.bucket.name;
    const objectKey = decodeURIComponent(record.s3.object.key.replace(/\+/g, ' '));
    const catalogItemsQueueUrl = process.env.SQS_URL;


    if (!objectKey.startsWith('uploaded/')) {
        console.log(`Skipping object ${objectKey} since it's not in the 'uploaded' folder.`);
        return;
    }

    const command = new GetObjectCommand({
        Bucket: bucketName,
        Key: objectKey,
    });

    try {
        console.log('QueueUrl:', catalogItemsQueueUrl)
        if (catalogItemsQueueUrl === undefined) { throw new Error("No SQL Url provided") };
        const { Body } = await s3.send(command);
        if (!Body) {
            throw new Error(`Empty response body for object ${objectKey}`);
        }

        await pipeline(Body, csvParser()
            .on('data', async (row) => {
                const messageParams = {
                    QueueUrl: catalogItemsQueueUrl,
                    MessageBody: JSON.stringify(row),
                };

                const res = await sqs.sendMessage(messageParams);
            }));

        const parsedKey = objectKey.replace('uploaded/', 'parsed/');

        const copyObjectCommand = new CopyObjectCommand({
            Bucket: bucketName,
            CopySource: `${bucketName}/${objectKey}`,
            Key: parsedKey,
        });

        await s3.send(copyObjectCommand);
        const deleteObjectCommand = new DeleteObjectCommand({
            Bucket: bucketName,
            Key: objectKey,
        });

        await s3.send(deleteObjectCommand);
    }
    catch (error) {
        console.error(`Error fetching object ${objectKey} from S3:`, error);
    }
};
