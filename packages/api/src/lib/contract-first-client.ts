import { performGet, performPost, performDelete } from "../utils/fetch-utils.js"
import { CreateProduct, Product } from "./contract-first-api-types.js";

export const getProducts = async () => {
    const response = await performGet<Product[]>(`/api/products`);
    return response;
}

export const createProduct = async (body: CreateProduct) => {
    const response = await performPost<Product, CreateProduct>(`/api/products`, body);
    return response;
}

export const deleteProduct = async (productId: string) => {
    const response = await performDelete(`/api/products/${productId}`);
    return response;
}