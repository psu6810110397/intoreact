import { Form, Modal, Select, Input, InputNumber, Button, Space, message } from "antd" 
import { useEffect, useState } from "react" 
import { ThunderboltOutlined } from '@ant-design/icons'; 
import axios from 'axios'; 

export default function EditBook({ isOpen, book, categories, onCancel, onSave }) {
    const [form] = Form.useForm();
    const [loadingAI, setLoadingAI] = useState(false); 

    // เมื่อ Modal เปิดขึ้นมา ให้นำข้อมูล book ใส่เข้าไปใน Form
    useEffect(() => {
        if (isOpen && book) {
            form.setFieldsValue({
                ...book,
                categoryId: book.category?.id || book.categoryId 
            });
        }
    }, [isOpen, book, form]);

    const handleAIGenerate = async () => {
        const currentValues = form.getFieldsValue();
        if (!currentValues.title) return message.warning('กรุณากรอกชื่อหนังสือก่อน');
        
        try {
            setLoadingAI(true);
            const response = await axios.post("http://localhost:3000/api/gemini/summarize", {
                title: currentValues.title,
                author: currentValues.author,
                prompt: `Summary of ${currentValues.title} in 2 sentences.`, 
            });
            const desc = response.data.summary || response.data.description;
            if (desc) {
                form.setFieldsValue({ description: desc });
                message.success('AI สร้างคำอธิบายสำเร็จ');
            }
        } catch (error) {
            message.error('เรียก AI ไม่สำเร็จ');
        } finally {
            setLoadingAI(false);
        }
    };
    
    return(
        <Modal 
            title="แก้ไขข้อมูลหนังสือ" 
            open={isOpen} 
            onCancel={onCancel} 
            destroyOnClose
            onOk={() => {
                form.validateFields().then(values => onSave(values));
            }}
        >
            <Form form={form} layout="vertical"> 
                <Form.Item name="title" label="Title" rules={[{ required: true }]}><Input/></Form.Item>
                <Form.Item name="author" label="Author" rules={[{ required: true }]}><Input/></Form.Item>
                <Form.Item label="Description" name="description">
                    <Space direction="vertical" style={{ width: '100%' }}>
                        <Button icon={<ThunderboltOutlined />} onClick={handleAIGenerate} loading={loadingAI} block>
                            ใช้ AI ช่วยเขียนคำอธิบาย
                        </Button>
                        <Input.TextArea rows={4} />
                    </Space>
                </Form.Item>
                <Form.Item name="price" label="Price" rules={[{ required: true }]}><InputNumber style={{ width: '100%' }}/></Form.Item>
                <Form.Item name="stock" label="Stock" rules={[{ required: true }]}><InputNumber style={{ width: '100%' }}/></Form.Item>
                <Form.Item name="categoryId" label="Category" rules={[{ required: true }]}>
                    <Select allowClear options={categories}/>
                </Form.Item>
            </Form>
        </Modal>
    )
}