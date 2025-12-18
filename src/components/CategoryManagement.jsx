import React, { useState } from 'react';
import { Button, Table, Space, Typography, Form, Input, Popconfirm, message } from 'antd';
const { Title } = Typography;

export default function CategoryManagement({ categories, onCancel, onAdd, onEdit, onDelete }) {
    const [form] = Form.useForm();
    const [editingKey, setEditingKey] = useState('');
    const [adding, setAdding] = useState(false);
    
    
    const categoryData = categories.map(cat => ({
        key: cat.value, 
        name: cat.label, 
        id: cat.value,
    }));

    const handleAdd = async (values) => {
        try {
            await onAdd(values.name);
            message.success(`เพิ่มหมวดหมู่ "${values.name}" สำเร็จ`);
            form.resetFields(); 
            setAdding(false);
        } catch (error) {
           
        }
    };
    
    const handleSave = async (record) => {
        try {
            const row = await form.validateFields();
            await onEdit(record.id, row.name);
            message.success(`แก้ไขหมวดหมู่ "${row.name}" สำเร็จ`);
            setEditingKey('');
        } catch (error) {
            message.error('แก้ไขหมวดหมู่ไม่สำเร็จ');
        }
    };

    const handleDelete = async (id) => {
        try {
            await onDelete(id);
            message.success('ลบหมวดหมู่สำเร็จ');
        } catch (error) {
           
        }
    };

    const columns = [
        { title: 'ID', dataIndex: 'id', key: 'id', width: '10%' },
        {
            title: 'ชื่อหมวดหมู่',
            dataIndex: 'name',
            key: 'name',
            width: '60%',
            render: (text, record) => {
                const editable = record.key === editingKey;
                return editable ? (
                    <Form.Item
                        name="name"
                        style={{ margin: 0 }}
                        rules={[{ required: true, message: 'กรุณากรอกชื่อหมวดหมู่!' }]}
                        initialValue={text}
                    >
                        <Input />
                    </Form.Item>
                ) : (
                    text
                );
            },
        },
        {
            title: 'Action',
            key: 'action',
            render: (_, record) => {
                const editable = record.key === editingKey;
                return editable ? (
                    <Space size="middle">
                        <Button type="link" onClick={() => handleSave(record)} loading={false}>บันทึก</Button>
                        <Button type="link" onClick={() => setEditingKey('')}>ยกเลิก</Button>
                    </Space>
                ) : (
                    <Space size="middle">
                        <Button type="link" onClick={() => setEditingKey(record.key)}>แก้ไข</Button>
                        <Popconfirm 
                            title="คุณต้องการลบหมวดหมู่นี้หรือไม่?" 
                            onConfirm={() => handleDelete(record.id)}
                            okText="ใช่"
                            cancelText="ไม่"
                        >
                            <Button type="link" danger>ลบ</Button>
                        </Popconfirm>
                    </Space>
                );
            },
        },
    ];

    return (
        <div>
            <Title level={4}>จัดการหมวดหมู่หนังสือ</Title>

            <Button onClick={() => setAdding(true)} type="primary" style={{ marginBottom: 16 }}>
                เพิ่มหมวดหมู่ใหม่
            </Button>
            
            {adding && (
                <Form
                    form={form}
                    layout="inline"
                    onFinish={handleAdd}
                    style={{ marginBottom: 16, border: '1px solid #ccc', padding: 10 }}
                >
                    <Form.Item
                        name="name"
                        rules={[{ required: true, message: 'กรุณากรอกชื่อหมวดหมู่!' }]}
                    >
                        <Input placeholder="ชื่อหมวดหมู่ใหม่" />
                    </Form.Item>
                    <Form.Item>
                        <Button type="primary" htmlType="submit">
                            เพิ่ม
                        </Button>
                    </Form.Item>
                    <Form.Item>
                        <Button onClick={() => setAdding(false)}>
                            ยกเลิก
                        </Button>
                    </Form.Item>
                </Form>
            )}

            <Form form={form} component={false}>
                <Table
                    dataSource={categoryData}
                    columns={columns}
                    pagination={false}
                    bordered
                    size="small"
                />
            </Form>

            <Space style={{ marginTop: 20 }}>
                <Button onClick={onCancel}>
                    ปิด
                </Button>
            </Space>
        </div>
    );
}