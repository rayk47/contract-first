import { Product, CreateProduct } from "@contract-first/api";
import { ProductDao, CreateProductDao } from "./product-dao.js";

export const fromDatabaseToApi = (product: ProductDao): Product => {
    return {
        name: product.name,
        id: product.id,
        startDate: product.startDate,
        description: product.description,
    }
}

export const createFromApiToDatabase = (product: CreateProduct): CreateProductDao => {
    return {
        name: product.name,
        startDate: product.startDate,
        description: product.description,
    }
}