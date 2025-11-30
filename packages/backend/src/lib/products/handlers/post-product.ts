import { CreateProduct } from '@contract-first/api';
import { APIGatewayProxyEvent, APIGatewayProxyHandler } from 'aws-lambda';
import { createProduct } from '../product-service.js';

export const handler: APIGatewayProxyHandler = async (event: APIGatewayProxyEvent) => {
    try {

        if (!event.body) {
            return {
                statusCode: 400,
                body: JSON.stringify({ message: "Missing request body" }),
            };
        }

        const data = JSON.parse(event.body) as CreateProduct;

        const product = await createProduct(data);
        return {
            statusCode: 201,
            headers: {
                'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
                'Pragma': 'no-cache',
                'Expires': '0',
                'Surrogate-Control': 'no-store',
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'POST,OPTIONS',
                'Access-Control-Allow-Headers': 'Content-Type',
                "Access-Control-Allow-Credentials": true,
            },
            body: JSON.stringify(product)
        };
    } catch (error: any) {
        console.error("POST product error:", error);
        return {
            statusCode: error?.statusCode || 500,
            body: JSON.stringify({ message: error?.message || "Internal server error" }),
        };
    }
}