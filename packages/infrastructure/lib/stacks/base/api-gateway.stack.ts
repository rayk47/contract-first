import { CfnOutput, Fn, RemovalPolicy, Stack, StackProps } from 'aws-cdk-lib';
import { Cors, ResponseType } from 'aws-cdk-lib/aws-apigateway';
import { Resource, RestApi } from 'aws-cdk-lib/aws-apigateway';
import { Construct } from 'constructs';
import { buildResourceIdentifier } from '../../utils/utils.js';
import { ConfigProps } from '../../env/env-config.js';
import { RestApiOrigin } from 'aws-cdk-lib/aws-cloudfront-origins';

interface ApiGatewayStackProps extends StackProps {
    config: ConfigProps;
}

export class ApiGatewayStack extends Stack {
    rootApi: RestApi;
    restApiId: string;
    baseApiResource: Resource;
    restApiOrigin: RestApiOrigin;

    constructor(scope: Construct, id: string, props: ApiGatewayStackProps) {
        super(scope, id, props);

        this.rootApi = new RestApi(this, buildResourceIdentifier('APIGateway'), {
            restApiName: buildResourceIdentifier('APIGateway'),
            description: 'API Gateway for the Contract First Demo',
            defaultCorsPreflightOptions: {
                allowOrigins: Cors.ALL_ORIGINS,
                allowHeaders: Cors.DEFAULT_HEADERS,
                allowMethods: Cors.ALL_METHODS
            }
        });
        this.rootApi.applyRemovalPolicy(RemovalPolicy.DESTROY);
        this.restApiId = this.rootApi.restApiId;
        this.baseApiResource = this.rootApi.root.addResource('api');
        this.restApiOrigin = new RestApiOrigin(this.rootApi);
        this.addHandlingOfAccessDenied();
        this.createCfnOutput();
    }

    addHandlingOfAccessDenied = () => {
        const response400 = this.rootApi.addGatewayResponse(buildResourceIdentifier('400GatewayResponse'), {
            type: ResponseType.BAD_REQUEST_BODY,
            statusCode: '400',
            responseHeaders: {
                'Access-Control-Allow-Origin': "'*'"
            },
            templates: {
                'application/json': JSON.stringify({
                    error: {
                        detail: '$context.error.validationErrorString',
                        title: 'Invalid Request',
                        statusCode: 400,
                        type: 'API-Gateway',
                        timestamp: '$context.requestTime',
                        requestId: '$context.requestId',
                        instance: '$context.httpMethod $context.path'
                    }
                })
            }
        });
        response400.applyRemovalPolicy(RemovalPolicy.DESTROY);

        const response401 = this.rootApi.addGatewayResponse(buildResourceIdentifier('401GatewayResponse'), {
            type: ResponseType.UNAUTHORIZED,
            statusCode: '401',
            responseHeaders: {
                'Access-Control-Allow-Origin': "'*'"
            },
            templates: {
                'application/json': `{ "message": $context.error.messageString, "statusCode": "401", "type": "$context.error.responseType" }`
            }
        });
        response401.applyRemovalPolicy(RemovalPolicy.DESTROY);

        const response403 = this.rootApi.addGatewayResponse(buildResourceIdentifier('403GatewayResponse'), {
            type: ResponseType.ACCESS_DENIED,
            statusCode: '403',
            responseHeaders: {
                'Access-Control-Allow-Origin': "'*'"
            },
            templates: {
                'application/json': `{ "message": $context.error.messageString, "statusCode": "403", "type": "$context.error.responseType" }`
            }
        });
        response403.applyRemovalPolicy(RemovalPolicy.DESTROY);
    }

    createCfnOutput = () => {
        new CfnOutput(this, buildResourceIdentifier('ApiGatewayId'), {
            value: this.restApiId,
            exportName: buildResourceIdentifier('SharedApiGatewayId')
        });

        new CfnOutput(this, buildResourceIdentifier('ApiRootResourceId'), {
            value: this.rootApi.root.resourceId,
            exportName: buildResourceIdentifier('SharedApiRootResourceId')
        });
        new CfnOutput(this, buildResourceIdentifier('ApiBaseResourceId'), {
            value: this.baseApiResource.resourceId,
            exportName: buildResourceIdentifier('SharedApiBaseResourceId')
        });
    }

    static getCfnOutput = (stack: Stack) => {
        const apiId = Fn.importValue(buildResourceIdentifier('SharedApiGatewayId'));
        const baseResId = Fn.importValue(buildResourceIdentifier('SharedApiBaseResourceId'));
        const rootResId = Fn.importValue(buildResourceIdentifier('SharedApiRootResourceId')); // Import the root resource ID

        // Import the existing RestApi by ID (returns IRestApi reference)
        const importedApi = RestApi.fromRestApiAttributes(stack, buildResourceIdentifier('ImportedApi' + stack.stackName), {
            restApiId: apiId,
            rootResourceId: rootResId,
        });

        // Import the existing "/api" resource as an IResource
        const baseResource = Resource.fromResourceAttributes(stack, buildResourceIdentifier('ImportedBaseApiResource' + stack.stackName), {
            restApi: importedApi,
            resourceId: baseResId,
            path: '/api'  // path of the imported resource (for metadata)
        })

        return {
            baseApiResource: baseResource,
            apiGateway: importedApi
        }
    }
}
