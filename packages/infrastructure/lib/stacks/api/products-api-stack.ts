import { Duration, RemovalPolicy, Stack, StackProps } from 'aws-cdk-lib';
import { Construct } from 'constructs';
import { AuthorizationType, IRestApi, LambdaIntegration, Model, RequestValidator, Resource } from 'aws-cdk-lib/aws-apigateway';
import { NodejsFunction } from 'aws-cdk-lib/aws-lambda-nodejs';
import { buildResourceIdentifier } from '../../utils/utils.js';
import { Runtime } from 'aws-cdk-lib/aws-lambda';
import { ConfigProps } from '../../env/env-config.js';
import { ApiGatewayStack } from '../base/api-gateway.stack.js';
import { ProductSchema, CreateProductSchema, ProductsSchema } from '@contract-first/api/schema';
import { BACKEND_LIB, PACKAGE_LOCK_FILE, PROJECT_ROOT } from 'lib/utils/paths.js';
import { join } from 'path';
import { Table } from 'aws-cdk-lib/aws-dynamodb';
import { PolicyStatement } from 'aws-cdk-lib/aws-iam';

export interface ProductsApiStackProps extends StackProps {
    config: ConfigProps,
    dynamoTable: Table
}
export class ProductsApiStack extends Stack {
    productsResource: Resource;
    productsByIdResource: Resource;
    apiGateway: IRestApi;
    productSchemaModel: Model;
    productsListSchemaModel: Model;
    requestValidator: RequestValidator;
    dynamoTable: Table;

    constructor(scope: Construct, id: string, props: ProductsApiStackProps) {
        super(scope, id, props);

        this.dynamoTable = props.dynamoTable;

        const apiGatewayImports = ApiGatewayStack.getCfnOutput(this);
        this.productsResource = new Resource(this, buildResourceIdentifier('ProductsResource'), {
            parent: apiGatewayImports.baseApiResource,
            pathPart: 'products',
        });
        this.productsResource.applyRemovalPolicy(RemovalPolicy.DESTROY);

        this.productsByIdResource = new Resource(this, buildResourceIdentifier('ProductByIdResource'), {
            parent: this.productsResource,
            pathPart: '{productId}',
        });
        this.productsByIdResource.applyRemovalPolicy(RemovalPolicy.DESTROY);

        this.apiGateway = apiGatewayImports.apiGateway;
        this.productSchemaModel = new Model(this, buildResourceIdentifier('ProductSchemaModel'), {
            restApi: this.apiGateway,
            contentType: 'application/json',
            modelName: 'ProductSchemaModel',
            schema: ProductSchema
        });
        this.productSchemaModel.applyRemovalPolicy(RemovalPolicy.DESTROY);

        this.productsListSchemaModel = new Model(this, buildResourceIdentifier('ProductsListModel'), {
            restApi: this.apiGateway,
            contentType: 'application/json',
            modelName: 'productsListSchemaModel',
            schema: ProductsSchema
        });
        this.productsListSchemaModel.applyRemovalPolicy(RemovalPolicy.DESTROY);

        this.requestValidator = new RequestValidator(this, buildResourceIdentifier('ProductsRequestValidator'), {
            restApi: this.apiGateway,
            validateRequestBody: true,
            validateRequestParameters: false,
        });
        this.requestValidator.applyRemovalPolicy(RemovalPolicy.DESTROY);

        this.getProductsLambda();
        this.postProductLambda();
        this.deleteProductsLambda();
    }

    postProductLambda = () => {
        const postProductLambdaFn = new NodejsFunction(this, buildResourceIdentifier('PostProduct'), {
            runtime: Runtime.NODEJS_20_X,
            projectRoot: PROJECT_ROOT,
            depsLockFilePath: PACKAGE_LOCK_FILE,
            handler: "handler",
            functionName: "postProductHandler",
            entry: join(BACKEND_LIB, '/products/handlers/post-product.ts'),
            timeout: Duration.seconds(10)
        });
        postProductLambdaFn.applyRemovalPolicy(RemovalPolicy.DESTROY);
        const postProductLambdaIntegration = new LambdaIntegration(postProductLambdaFn);

        const postProductSchemaModel = new Model(this, buildResourceIdentifier('PostProductSchemaModel'), {
            restApi: this.apiGateway,
            contentType: 'application/json',
            modelName: 'PostProductSchemaModel',
            schema: CreateProductSchema
        });
        postProductSchemaModel.applyRemovalPolicy(RemovalPolicy.DESTROY);
        const postProductMethod = this.productsResource.addMethod('POST', postProductLambdaIntegration, {
            authorizationType: AuthorizationType.NONE,
            requestValidator: this.requestValidator,
            requestModels: {
                'application/json': postProductSchemaModel,
            },
            methodResponses: [
                {
                    statusCode: '201',
                    responseModels: {
                        'application/json': this.productSchemaModel,
                    },
                },
            ],
        });
        postProductMethod.applyRemovalPolicy(RemovalPolicy.DESTROY);

        this.dynamoTable.grantReadWriteData(postProductLambdaFn);
        postProductLambdaFn.addToRolePolicy(new PolicyStatement({
            actions: [
                "dynamodb:TransactWriteItems",
                "dynamodb:TransactGetItems"
            ],
            resources: [this.dynamoTable.tableArn],
        }));
    }

    getProductsLambda = () => {
        const getProductsLambdaFn = new NodejsFunction(this, buildResourceIdentifier('GetProducts'), {
            runtime: Runtime.NODEJS_20_X,
            projectRoot: PROJECT_ROOT,
            depsLockFilePath: PACKAGE_LOCK_FILE,
            handler: "handler",
            functionName: "getProductsHandler",
            entry: join(BACKEND_LIB, '/products/handlers/get-products.ts'),
            timeout: Duration.seconds(10)
        });
        getProductsLambdaFn.applyRemovalPolicy(RemovalPolicy.DESTROY);
        const getProductsLambdaIntegration = new LambdaIntegration(getProductsLambdaFn);

        const getProductsMethod = this.productsResource.addMethod('GET', getProductsLambdaIntegration, {
            authorizationType: AuthorizationType.NONE,
            requestValidator: this.requestValidator,
            methodResponses: [
                {
                    statusCode: '200',
                    responseModels: {
                        'application/json': this.productsListSchemaModel,
                    },
                },
            ],
        });
        getProductsMethod.applyRemovalPolicy(RemovalPolicy.DESTROY);
        this.dynamoTable.grantReadData(getProductsLambdaFn);
        getProductsLambdaFn.addToRolePolicy(new PolicyStatement({
            actions: [
                "dynamodb:TransactGetItems"
            ],
            resources: [this.dynamoTable.tableArn],
        }));
    }

    deleteProductsLambda = () => {
        const deleteProductLambdaFn = new NodejsFunction(this, buildResourceIdentifier('DeleteProduct'), {
            runtime: Runtime.NODEJS_20_X,
            projectRoot: PROJECT_ROOT,
            depsLockFilePath: PACKAGE_LOCK_FILE,
            handler: "handler",
            functionName: "deleteProductsHandler",
            entry: join(BACKEND_LIB, '/products/handlers/delete-product.ts'),
            timeout: Duration.seconds(10)
        });
        deleteProductLambdaFn.applyRemovalPolicy(RemovalPolicy.DESTROY);
        const deleteProductLambdaIntegration = new LambdaIntegration(deleteProductLambdaFn);

        const deleteProductMethod = this.productsByIdResource.addMethod('DELETE', deleteProductLambdaIntegration, {
            authorizationType: AuthorizationType.NONE,
            methodResponses: [
                {
                    statusCode: '204',
                },
            ],
        });
        deleteProductMethod.applyRemovalPolicy(RemovalPolicy.DESTROY);
        this.dynamoTable.grantReadWriteData(deleteProductLambdaFn);
        deleteProductLambdaFn.addToRolePolicy(new PolicyStatement({
            actions: [
                "dynamodb:TransactWriteItems",
                "dynamodb:TransactGetItems"
            ],
            resources: [this.dynamoTable.tableArn],
        }));
    }
}
