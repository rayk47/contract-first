import { createProduct, CreateProduct, Product } from "@contract-first/api";
import { Button, DatePicker, Drawer, Form, Input, Space } from "antd";
import { useEffect, useState } from "react";
import { useScreens } from "../hooks/useScreens";

interface CreateProductDrawerProps {
    onClose: () => void
    addProduct: (newProduct: Product) => void
}

export const CreateProductDrawer = (props: CreateProductDrawerProps) => {
    const [isFormValid, setIsFormValid] = useState(false);
    const [isCreatingProduct, setIsCreatingProduct] = useState(false);
    const [form] = Form.useForm<CreateProduct>();
    const screens = useScreens();

    const values = Form.useWatch([], form);

    useEffect(() => {
        form
            .validateFields({ validateOnly: true })
            .then(() => setIsFormValid(true))
            .catch(() => setIsFormValid(false));
    }, [form, values]);

    const onCreateProduct = async () => {
        setIsCreatingProduct(true);
        const newProduct = await createProduct(values);
        setIsCreatingProduct(false);
        props.addProduct(newProduct);
    };

    return (
        <Drawer
            loading={isCreatingProduct}
            width={screens.xs ? 350 : 600}
            title={
                <span style={{
                    fontSize: screens.xs ? 16 : 20,
                    fontWeight: 600,
                    display: 'flex',
                    alignItems: 'center',
                    gap: 8,
                }}>
                    New Product
                </span>
            } onClose={props.onClose}
            open={true}
            styles={{
                header: {
                    padding: screens.xs ? '12px 16px' : '20px 24px',
                },
                body: {
                    paddingBottom: 80,
                },
            }}
            extra={
                < Space >
                    <Button onClick={props.onClose}>Cancel</Button>
                    <Button htmlType="submit" disabled={!isFormValid} onClick={() => onCreateProduct()} type="primary">
                        Create
                    </Button>
                </Space >
            }
        >
            <Form form={form} variant="filled" layout="vertical" requiredMark>
                <Form.Item
                    name="name"
                    label="Name"
                    rules={[{ required: true, message: 'Please enter the product name' }]}
                >
                    <Input placeholder="Please enter the product name" />
                </Form.Item>
                <Form.Item
                    name="startDate"
                    label="Start Date"
                    rules={[{ required: true, message: 'Please enter a start date for the product.' }]}
                >
                    <DatePicker style={{ width: '100%' }} placeholder="Please enter a start date for the product." />
                </Form.Item>
                <Form.Item
                    name="description"
                    label="Description"
                    rules={[{ required: true, message: 'Please enter the product description' }]}
                >
                    <Input.TextArea placeholder="Please enter the product description" />
                </Form.Item>
            </Form>
        </Drawer >)
}