import { APIGatewayTokenAuthorizerEvent, APIGatewayAuthorizerResult } from './types';
import 'dotenv/config'

const generatePolicy = (principalId: string, effect: string, resource: string): APIGatewayAuthorizerResult => {
    return {
        principalId,
        policyDocument: {
            Version: '2012-10-17',
            Statement: [
                {
                    Action: 'execute-api:Invoke',
                    Effect: effect,
                    Resource: resource,
                },
            ],
        },
    };
};

export const handler = async (event: APIGatewayTokenAuthorizerEvent): Promise<APIGatewayAuthorizerResult> => {
    if (!event.authorizationToken) {
        throw new Error('Unauthorized');
    }

    const token = event.authorizationToken.match(/(?<=Basic )(.*)/)?.[0];
    if (!token) {
        throw new Error('Unauthorized')
    }

    const [username, password] = Buffer.from(token, 'base64').toString('utf-8').split(':');

    const envPassword = process.env[username];

    if (envPassword && envPassword === password) {
        return generatePolicy(username, 'Allow', event.methodArn);
    } else {
        throw new Error('Forbidden');
    }
};
