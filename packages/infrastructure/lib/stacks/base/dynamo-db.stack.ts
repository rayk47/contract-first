import { RemovalPolicy, Stack, StackProps } from 'aws-cdk-lib';
import { Construct } from 'constructs';
import { buildResourceIdentifier } from '../../utils/utils.js';
import { ConfigProps } from '../../env/env-config.js';
import { AttributeType, BillingMode, Table } from 'aws-cdk-lib/aws-dynamodb';

export interface DynamoDbStackProps extends StackProps {
    config: ConfigProps;
}

export class DynamoDbStack extends Stack {
    public readonly table: Table;

    constructor(scope: Construct, id: string, props: DynamoDbStackProps) {
        super(scope, id, props);

        this.table = new Table(this, buildResourceIdentifier('Table'), {
            partitionKey: { name: 'PK', type: AttributeType.STRING },
            sortKey: { name: 'SK', type: AttributeType.STRING },
            billingMode: BillingMode.PAY_PER_REQUEST,
            removalPolicy: RemovalPolicy.DESTROY,
            tableName: buildResourceIdentifier('DynamoDB'),
        });
    }
}
