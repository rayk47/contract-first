import { Stack, StackProps } from 'aws-cdk-lib';
import { Construct } from 'constructs';
import { BucketDeployment, Source } from 'aws-cdk-lib/aws-s3-deployment';
import { buildResourceIdentifier } from '../../utils/utils.js';
import { CloudfrontStack } from '../base/cloudfront.stack.js';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { RetentionDays } from 'aws-cdk-lib/aws-logs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

export class WebStack extends Stack {

  constructor(scope: Construct, id: string, props: StackProps) {
    super(scope, id, props);

    const cloudfrontConfig = CloudfrontStack.getCfnOutput(this);
    new BucketDeployment(this, buildResourceIdentifier('WebBucketDeployment'), {
      destinationBucket: cloudfrontConfig.s3Bucket,
      sources: [Source.asset(join(__dirname, '../../../../../dist/packages/web'))],
      distribution: cloudfrontConfig.cloudfrontDistribution,
      distributionPaths: ['/*'],
      retainOnDelete: false,
      memoryLimit: 1024,
      logRetention: RetentionDays.ONE_WEEK,
    });

  }
}
