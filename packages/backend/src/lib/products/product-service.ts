import { CreateProduct, Product } from "@contract-first/api"
import { createProductDao, deleteProductDao, getProductsDao, } from "./product-dao.js"
import { fromDatabaseToApi, createFromApiToDatabase } from "./product-dto.js";

export const createProduct = async (productToCreate: CreateProduct): Promise<Product> => {
    const newProduct = await createProductDao(createFromApiToDatabase(productToCreate));
    return fromDatabaseToApi(newProduct);
}

export const getProducts = async (): Promise<Product[]> => {
    const products = await getProductsDao();
    return products.map(prod => fromDatabaseToApi(prod))
}

export const deleteProduct = async (productId: string): Promise<void> => {
    await deleteProductDao(productId);
}