import { AppModel } from "../database/app-schema.js";
import { v4 as uuidv4 } from "uuid";

export interface CreateProductDao {
    name: string;
    startDate: string;
    description: string
}

export interface ProductDao {
    PK: string;
    SK: string;
    id: string;
    name: string;
    startDate: string;
    description: string;
    createdAt: string;
    updatedAt: string;
}

export async function createProductDao(product: CreateProductDao): Promise<ProductDao> {
    const productId = uuidv4();

    try {
        await AppModel.create({
            PK: `PRODUCTS`,
            SK: `PRODUCT#${productId}`,
            id: productId,
            name: product.name,
            startDate: product.startDate,
            description: product.description
        })

        const createdProduct = await AppModel.get({ PK: `PRODUCTS`, SK: `PRODUCT#${productId}` });
        return createdProduct as unknown as ProductDao;
    } catch (error) {
        console.error("Error creating product:", error);
        throw error;
    }

}

export async function getProductsDao(): Promise<ProductDao[]> {
    try {

        const products = await AppModel.query('PK').eq('PRODUCTS').exec();
        return products as unknown as ProductDao[];
    } catch (error) {
        console.error("Error fetching products:", error);
        throw error;
    }

}

export async function deleteProductDao(productId: string): Promise<void> {
    try {
        await AppModel.delete({
            PK: `PRODUCTS`,
            SK: `PRODUCT#${productId}`
        });
    } catch (error) {
        console.error(`Error deleting product ${productId}: `, error);
        throw error;
    }

}