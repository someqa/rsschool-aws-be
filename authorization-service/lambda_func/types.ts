export interface APIGatewayTokenAuthorizerEvent {
    type: string;
    authorizationToken: string;
    methodArn: string;
}

export interface Statement {
    Action: string;
    Effect: string;
    Resource: string;
}

export interface PolicyDocument {
    Version: string;
    Statement: Statement[];
}

export interface APIGatewayAuthorizerResult {
    principalId: string;
    policyDocument: PolicyDocument;
    context?: { [key: string]: any };
    usageIdentifierKey?: string;
}
