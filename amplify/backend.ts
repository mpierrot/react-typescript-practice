import { defineBackend } from '@aws-amplify/backend';
import { auth } from './auth/resource';
import { data } from './data/resource';
import { helloWorld } from './function/hello-world/resource';

const backend = defineBackend({
    auth,
    data,
    helloWorld
});

const authenticatedUserIamRole = backend.auth.resources.authenticatedUserIamRole;
backend.helloWorld.resources.lambda.grantInvoke(authenticatedUserIamRole);

backend.addOutput({
  custom: {
    helloWorldFunctionName: backend.helloWorld.resources.lambda.functionName
  },
});
