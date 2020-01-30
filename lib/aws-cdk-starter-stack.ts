import * as cdk from '@aws-cdk/core';
import {Tag} from '@aws-cdk/core';
import {Bucket, BucketEncryption, BlockPublicAccess, HttpMethods} from '@aws-cdk/aws-s3';
import dynamodb = require("@aws-cdk/aws-dynamodb");
import cognito = require("@aws-cdk/aws-cognito");

export class AwsCdkStarterStack extends cdk.Stack {
    constructor(scope: cdk.App, id: string, props?: cdk.StackProps) {
        super(scope, id, props);

        const pool = new cognito.CfnUserPool(this, 'userPool', {
            emailVerificationMessage: "Your verification code is {####}",
            emailVerificationSubject: "Your verification code",
            mfaConfiguration: "OPTIONAL",
            autoVerifiedAttributes: ["email"],
            usernameAttributes: ["email"]
        });
        pool.node.applyAspect(new Tag('role', 'auth'));

        const cognitoGroups = ["admin", "user"];
        cognitoGroups.forEach(groupName => {
            const group = new cognito.CfnUserPoolGroup(this, `userGroup-${groupName}`, {
                groupName: groupName,
                userPoolId: pool.ref
            });
            group.node.applyAspect(new Tag('role', 'auth'));
        });

        const table = new dynamodb.Table(this, 'table', {
                partitionKey: {name: "id", type: dynamodb.AttributeType.STRING},
                billingMode: dynamodb.BillingMode.PAY_PER_REQUEST,
                pointInTimeRecovery: true,
                sortKey: {name: "updateDate", type: dynamodb.AttributeType.STRING}
            }
        );
        table.node.applyAspect(new Tag('role', 'storage'));

        const bucket = new Bucket(this, 'bucket', {
            encryption: BucketEncryption.S3_MANAGED,
            bucketName: 'storage-bucket',
            blockPublicAccess: BlockPublicAccess.BLOCK_ALL,
            cors: [{
                allowedHeaders: ['*'],
                allowedMethods: [HttpMethods.GET, HttpMethods.POST, HttpMethods.PUT],
                allowedOrigins: ["http://localhost:3000"]
            }]
        });
        bucket.node.applyAspect(new Tag('role', 'storage'));
    }
}
