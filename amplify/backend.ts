import { defineBackend } from '@aws-amplify/backend';
import { auth } from './auth/resource';
import { data } from './data/resource';
import { helloWorld } from './function/hello-world/resource';
import { invokeBedrock } from './function/invoke-bedrock/resource';
import * as iam from 'aws-cdk-lib/aws-iam';

const backend = defineBackend({
    auth,
    data,
    helloWorld,
    invokeBedrock,
});

const authenticatedUserIamRole = backend.auth.resources.authenticatedUserIamRole;
backend.helloWorld.resources.lambda.grantInvoke(authenticatedUserIamRole);
backend.invokeBedrock.resources.lambda.grantInvoke(authenticatedUserIamRole);

const bedrockStatement = new iam.PolicyStatement({
  actions: ["bedrock:InvokeModel", "bedrock:InvokeModelWithResponseStream"],
  resources: ["arn:aws:bedrock:us-east-1::foundation-model/*"]
});

backend.invokeBedrock.resources.lambda.addToRolePolicy(bedrockStatement);

backend.addOutput({
  custom: {
    helloWorldFunctionName: backend.helloWorld.resources.lambda.functionName,
    invokeBedrockFunctionName: backend.invokeBedrock.resources.lambda.functionName
  },
});
