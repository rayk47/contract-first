import { APIGatewayProxyEvent, APIGatewayProxyHandler } from 'aws-lambda';
import { deleteProduct } from '../product-service.js';

export const handler: APIGatewayProxyHandler = async (event: APIGatewayProxyEvent) => {
    try {

        const productId = event.pathParameters?.productId;
        if (!productId) {
            return {
                statusCode: 400,
                body: JSON.stringify({ message: "Missing productId in path" }),
            };
        }

        await deleteProduct(productId);
        return {
            statusCode: 204,
            headers: {
                'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
                'Pragma': 'no-cache',
                'Expires': '0',
                'Surrogate-Control': 'no-store',
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'DELETE,OPTIONS',
                'Access-Control-Allow-Headers': 'Content-Type',
                "Access-Control-Allow-Credentials": true,
            },
            body: JSON.stringify({})
        };
    } catch (error: any) {
        console.error("DELETE product error:", error);
        return {
            statusCode: error?.statusCode || 500,
            body: JSON.stringify({ message: error?.message || "Internal server error" }),
        };
    }
}