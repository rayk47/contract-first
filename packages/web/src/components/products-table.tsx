import { Button, Empty, Flex, Table, Typography } from "antd";
import { useScreens } from "../hooks/useScreens";
import { useEffect, useState } from "react";
import { deleteProduct, getProducts, Product } from "@contract-first/api";
import { ColumnsType } from "antd/es/table";
import { DeleteOutlined } from "@ant-design/icons";
import { CreateProductDrawer } from "./create-product-drawer";

export const ProductsTable = () => {
    const screens = useScreens();
    const [isLoadingProducts, setIsLoadingProducts] = useState(false);
    const [products, setProducts] = useState<Product[]>([]);
    const [isCreateNewProductDrawerOpen, setIsCreateNewProductDrawerOpen] = useState(false);
    const [isDeletingProduct, setIsDeletingProduct] = useState(false);

    useEffect(() => {
        const effect = async () => {
            try {
                setIsLoadingProducts(true);
                const response = await getProducts();
                setProducts(response);
            } catch (error) {
                console.error(error);
            } finally {
                setIsLoadingProducts(false);
            }
        }
        effect();
    }, []);

    const columns: ColumnsType<Product> = [
        {
            title: 'Name',
            dataIndex: 'name',
            key: 'name',
        },
        {
            title: 'Start Date',
            key: 'startDate',
            render: (_, record) => record.startDate.split('T')[0]
        },
        {
            title: 'Description',
            dataIndex: 'description',
            key: 'description',
        },
        {
            title: '',
            key: 'actions',
            align: 'right',
            render: (_, record) => <DeleteOutlined title="Delete" onClick={() => onDeleteProduct(record.id)} />
        }
    ];

    const onDeleteProduct = async (recordId: string) => {
        try {
            setIsDeletingProduct(true);
            await deleteProduct(recordId);

            setProducts(current => {
                return current.filter(p => p.id !== recordId)
            })
        } catch (error) {
            console.error(error);
        } finally {
            setIsDeletingProduct(false)
        }
    }

    const onAddProduct = (newProduct: Product) => {
        setProducts(current => {
            return [...current, newProduct]
        })
    }

    return (
        <><Table
            loading={isLoadingProducts || isDeletingProduct}
            pagination={false}
            rowKey={'id'}
            locale={{
                emptyText: <Empty description="No products yet" image={Empty.PRESENTED_IMAGE_SIMPLE} />,
            }}
            title={() => <Flex justify="space-between" align="center" >
                <Typography.Title level={screens.xs ? 5 : 4} style={{ margin: 0 }}>Available Products</Typography.Title>
                <Button type="primary" onClick={() => setIsCreateNewProductDrawerOpen(true)}>Create Product</Button>
            </Flex >
            }
            dataSource={products}
            columns={columns} />
            {isCreateNewProductDrawerOpen && <CreateProductDrawer addProduct={(newProduct) => { onAddProduct(newProduct); setIsCreateNewProductDrawerOpen(false) }} onClose={() => setIsCreateNewProductDrawerOpen(false)} />}</>);
}