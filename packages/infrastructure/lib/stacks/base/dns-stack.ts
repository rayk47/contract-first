import { RemovalPolicy, Stack, StackProps } from 'aws-cdk-lib';
import { Construct } from 'constructs';
import { IHostedZone, HostedZone, ARecord, RecordTarget } from 'aws-cdk-lib/aws-route53';
import { Certificate, CertificateValidation } from 'aws-cdk-lib/aws-certificatemanager';
import { buildResourceIdentifier } from '../../utils/utils.js';
import { ConfigProps } from '../../env/env-config.js';

export interface DNSStackProps extends StackProps {
    config: ConfigProps;
}

export class DNSStack extends Stack {
    certificateForDomain: Certificate;
    hostedZone: IHostedZone;

    constructor(scope: Construct, id: string, props: DNSStackProps) {
        super(scope, id, props);

        this.hostedZone = HostedZone.fromLookup(this, buildResourceIdentifier('HostedZone'), {
            domainName: props.config.DOMAIN_NAME
        });

        // TLS certificate
        this.certificateForDomain = new Certificate(this, buildResourceIdentifier('WildcardCertificate'), {
            domainName: '*.' + props.config.DOMAIN_NAME,
            validation: CertificateValidation.fromDns(this.hostedZone),
        });
        this.certificateForDomain.applyRemovalPolicy(RemovalPolicy.DESTROY);

        // Add an A record for the root domain
        new ARecord(this, buildResourceIdentifier('RootARecord'), {
            zone: this.hostedZone,
            recordName: '', // Leave blank for the root domain
            target: RecordTarget.fromIpAddresses('192.0.2.1'), // Placeholder IP address
        }).applyRemovalPolicy(RemovalPolicy.DESTROY);
    }
}
