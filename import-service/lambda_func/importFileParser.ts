import { S3Event } from 'aws-lambda';
import { S3Client, GetObjectCommand, CopyObjectCommand, DeleteObjectCommand } from '@aws-sdk/client-s3';
import csvParser from 'csv-parser';
import { Readable } from 'stream';
import { NodeJsClient } from '@smithy/types';

const s3 = new S3Client({}) as NodeJsClient<S3Client>;

export const handler = async (event: S3Event) => {
    const record = event.Records[0];
    const bucketName = record.s3.bucket.name;
    const objectKey = decodeURIComponent(record.s3.object.key.replace(/\+/g, ' '));

    if (!objectKey.startsWith('uploaded/')) {
        console.log(`Skipping object ${objectKey} since it's not in the 'uploaded' folder.`);
        return;
    }

    const command = new GetObjectCommand({
        Bucket: bucketName,
        Key: objectKey,
    });

    try {
        const { Body } = await s3.send(command);
        if (!Body) {
            throw new Error(`Empty response body for object ${objectKey}`);
        }

        Body.pipe(csvParser())
            .on('data', (row) => {
                console.log('Parsed CSV row:', row);
            })
            .on('end', async () => {
                console.log(`Finished parsing CSV file: ${objectKey}`);
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

                console.log(`Moved file from ${objectKey} to ${parsedKey}`);
            })
            .on('error', (err) => {
                console.error(`Error parsing CSV file ${objectKey}:`, err);
            });

    } catch (error) {
        console.error(`Error fetching object ${objectKey} from S3:`, error);
    }
};
