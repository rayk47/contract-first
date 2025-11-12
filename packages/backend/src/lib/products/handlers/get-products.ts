import { APIGatewayProxyEvent, APIGatewayProxyHandler } from 'aws-lambda';
import { getProducts } from '../product-service.js';

export const handler: APIGatewayProxyHandler = async (event: APIGatewayProxyEvent) => {
    try {

        const products = await getProducts();
        return {
            statusCode: 200,
            headers: {
                'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
                'Pragma': 'no-cache',
                'Expires': '0',
                'Surrogate-Control': 'no-store',
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'GET,OPTIONS',
                'Access-Control-Allow-Headers': 'Content-Type',
                "Access-Control-Allow-Credentials": true,
            },
            body: JSON.stringify(products)
        };
    } catch (error: any) {
        console.error("GET products error:", error);
        return {
            statusCode: error?.statusCode || 500,
            body: JSON.stringify({ message: error?.message || "Internal server error" }),
        };
    }
}