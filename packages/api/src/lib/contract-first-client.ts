import { Api, CreateProduct, Product } from "./contract-first-api-types.js";

const api = new Api({ baseUrl: '/api' });

export const getProducts = async () => {
    const res = await api.products.getProducts();
    return res.data;
}

export const createProduct = async (payload: CreateProduct): Promise<Product> => {
    const res = await api.products.postProduct(payload);
    return res.data;
};

export const deleteProduct = async (productId: string) => {
    await api.products.deleteProduct(productId);
}