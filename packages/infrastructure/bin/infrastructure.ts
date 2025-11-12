import { App } from 'aws-cdk-lib';
import { getConfig } from '../lib/env/env-config.js';
import { DNSStack } from '../lib/stacks/base/dns-stack.js';
import { buildResourceIdentifier } from '../lib/utils/utils.js';
import { CloudfrontStack } from '../lib/stacks/base/cloudfront.stack.js';
import { ApiGatewayStack } from '../lib/stacks/base/api-gateway.stack.js';
import { WebStack } from '../lib/stacks/web/web-stack.js';
import { ProductsApiStack } from '../lib/stacks/api/products-api-stack.js';
import { DynamoDbStack } from '../lib/stacks/base/dynamo-db.stack.js';

const app = new App();

const config = getConfig();
const env = { region: config.REGION, account: config.ACCOUNT };

const dnsStack = new DNSStack(app, buildResourceIdentifier('DNSStack'), {
  env,
  config,
  stackName: buildResourceIdentifier('DNSStack')
});

const apiGatewayStack = new ApiGatewayStack(app, buildResourceIdentifier('ApiGatewayStack'), {
  env,
  config,
  stackName: buildResourceIdentifier('ApiGatewayStack')
});

const cloudfrontStack = new CloudfrontStack(app, buildResourceIdentifier('CloudfrontStack'), {
  env,
  config,
  certificate: dnsStack.certificateForDomain,
  hostedZone: dnsStack.hostedZone,
  stackName: buildResourceIdentifier('CloudfrontStack'),
  restApiOrigin: apiGatewayStack.restApiOrigin,
});
cloudfrontStack.addDependency(apiGatewayStack);

const webAppStack = new WebStack(app, buildResourceIdentifier('WebStack'), {
  env
});
webAppStack.addDependency(cloudfrontStack);

const dynamoDBStack = new DynamoDbStack(app, buildResourceIdentifier('DynamoDBStack'), {
  env,
  config,
  stackName: buildResourceIdentifier('DynamoDBStack'),
});

const productsApiStack = new ProductsApiStack(app, buildResourceIdentifier('ProductsApiStack'), {
  env,
  config,
  stackName: buildResourceIdentifier('ProductsApiStack'),
  dynamoTable: dynamoDBStack.table
});
productsApiStack.addDependency(apiGatewayStack);
