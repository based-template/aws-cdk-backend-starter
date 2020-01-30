#!/usr/bin/env node
import * as cdk from '@aws-cdk/core';
import { AwsCdkStarterStack } from '../lib/aws-cdk-starter-stack';

const app = new cdk.App();
new AwsCdkStarterStack(app, 'AwsCdkStarterStack');
