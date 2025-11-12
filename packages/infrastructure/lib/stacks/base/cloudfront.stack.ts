import { CfnOutput, Duration, Fn, RemovalPolicy, Stack, StackProps } from 'aws-cdk-lib';
import { Construct } from 'constructs';
import { BlockPublicAccess, Bucket } from 'aws-cdk-lib/aws-s3';
import { AccessLevel, AllowedMethods, CacheCookieBehavior, CacheHeaderBehavior, CachePolicy, CacheQueryStringBehavior, Distribution, OriginAccessIdentity, SecurityPolicyProtocol, ViewerProtocolPolicy } from 'aws-cdk-lib/aws-cloudfront';
import { ARecord, RecordTarget, IHostedZone } from 'aws-cdk-lib/aws-route53';
import { Certificate } from 'aws-cdk-lib/aws-certificatemanager';
import { CanonicalUserPrincipal, PolicyStatement } from 'aws-cdk-lib/aws-iam';
import { CloudFrontTarget } from 'aws-cdk-lib/aws-route53-targets';
import { buildResourceIdentifier } from '../../utils/utils.js';
import { RestApiOrigin, S3BucketOrigin } from 'aws-cdk-lib/aws-cloudfront-origins';
import { ConfigProps } from '../../env/env-config.js';

export interface CloudfrontStackProps extends StackProps {
    config: ConfigProps;
    certificate: Certificate;
    hostedZone: IHostedZone;
    restApiOrigin: RestApiOrigin;
}

export class CloudfrontStack extends Stack {
    cloudfrontDistribution: Distribution;
    s3Bucket: Bucket;

    constructor(scope: Construct, id: string, props: CloudfrontStackProps) {
        super(scope, id, props);

        const cloudFrontOAI = new OriginAccessIdentity(this, buildResourceIdentifier('OriginAccessIdentity'));
        cloudFrontOAI.applyRemovalPolicy(RemovalPolicy.DESTROY);

        // Web bucket
        this.s3Bucket = new Bucket(this, buildResourceIdentifier('WebsiteBucket'), {
            bucketName: props.config.FQDN + '-web',
            publicReadAccess: false,
            blockPublicAccess: BlockPublicAccess.BLOCK_ALL,
            removalPolicy: RemovalPolicy.DESTROY,
            autoDeleteObjects: true
        });

        // Grant cloudfront, access to web bucket
        this.s3Bucket.addToResourcePolicy(new PolicyStatement({
            actions: ['s3:GetObject'],
            resources: [this.s3Bucket.arnForObjects('*')],
            principals: [new CanonicalUserPrincipal(cloudFrontOAI.cloudFrontOriginAccessIdentityS3CanonicalUserId)]
        }));

        // CloudFront distribution
        this.cloudfrontDistribution = new Distribution(this, buildResourceIdentifier('SiteDistribution'), {
            certificate: props.certificate,
            defaultRootObject: "index.html",
            domainNames: [props.config.FQDN],
            minimumProtocolVersion: SecurityPolicyProtocol.TLS_V1_2_2021,
            errorResponses: [
                {
                    httpStatus: 403,
                    responseHttpStatus: 200,
                    responsePagePath: '/index.html',
                    ttl: Duration.minutes(1),
                },
                {
                    httpStatus: 404,
                    responseHttpStatus: 200,
                    responsePagePath: '/index.html',
                    ttl: Duration.minutes(1),
                }
            ],
            defaultBehavior: {
                origin: S3BucketOrigin.withOriginAccessControl(this.s3Bucket, { originAccessLevels: [AccessLevel.READ, AccessLevel.LIST] }),
                compress: true,
                allowedMethods: AllowedMethods.ALLOW_GET_HEAD_OPTIONS,
                viewerProtocolPolicy: ViewerProtocolPolicy.REDIRECT_TO_HTTPS,
            }
        });
        this.cloudfrontDistribution.applyRemovalPolicy(RemovalPolicy.DESTROY);

        // Route53 alias record for the CloudFront distribution
        const route53Record = new ARecord(this, buildResourceIdentifier('SiteAliasRecord'), {
            recordName: props.config.FQDN,
            target: RecordTarget.fromAlias(new CloudFrontTarget(this.cloudfrontDistribution)),
            zone: props.hostedZone
        });
        route53Record.applyRemovalPolicy(RemovalPolicy.DESTROY);

        this.attachAPIGateway(props.restApiOrigin);
        this.createCfnOutput();
    }

    attachAPIGateway = (origin: RestApiOrigin) => {
        // Create a Cache Policy to forward specific headers
        const cachePolicy = new CachePolicy(this, buildResourceIdentifier('CachePolicy'), {
            headerBehavior: CacheHeaderBehavior.allowList('Authorization'),
            queryStringBehavior: CacheQueryStringBehavior.all(),
            cookieBehavior: CacheCookieBehavior.all(),
        });
        cachePolicy.applyRemovalPolicy(RemovalPolicy.DESTROY);

        this.cloudfrontDistribution.addBehavior('/api/*', origin, {
            viewerProtocolPolicy: ViewerProtocolPolicy.REDIRECT_TO_HTTPS,
            allowedMethods: AllowedMethods.ALLOW_ALL,
            cachePolicy: cachePolicy
        });
    }

    createCfnOutput = () => {
        new CfnOutput(this, buildResourceIdentifier('WebsiteBucketName'), {
            value: this.s3Bucket.bucketName,
            exportName: buildResourceIdentifier('WebsiteBucketName')
        });

        new CfnOutput(this, buildResourceIdentifier('CloudfrontDistributionId'), {
            value: this.cloudfrontDistribution.distributionId,
            exportName: buildResourceIdentifier('CloudfrontDistributionId')
        });
    }

    static getCfnOutput = (stack: Stack) => {
        // Import the S3 bucket by name
        const bucketName = Fn.importValue(buildResourceIdentifier('WebsiteBucketName'));
        const s3Bucket = Bucket.fromBucketName(stack, buildResourceIdentifier('ImportedBucket'), bucketName);

        // Import the CloudFront distribution by ID
        const distributionId = Fn.importValue(buildResourceIdentifier('CloudfrontDistributionId'));
        const cloudfrontDistribution = Distribution.fromDistributionAttributes(stack, buildResourceIdentifier('ImportedDistribution'), {
            distributionId: distributionId,
            domainName: `${distributionId}.cloudfront.net`
        });

        return {
            s3Bucket,
            cloudfrontDistribution
        };
    }
}
