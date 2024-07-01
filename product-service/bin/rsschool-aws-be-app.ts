#!/usr/bin/env node
import 'source-map-support/register';
import * as cdk from 'aws-cdk-lib';
import { RsschoolAwsBeStack } from '../lib/rsschool-aws-be-stack';

const app = new cdk.App();
new RsschoolAwsBeStack(app, 'RsschoolAwsBeStack', {
  env: {
    account: process.env.CDK_DEFAULT_ACCOUNT,
    region: process.env.CDK_DEFAULT_REGION,
  },
});
app.synth();
