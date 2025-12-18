import { Form, Modal, Select, Input, InputNumber, Image, Button, Space, message } from "antd" // เพิ่ม Button, Space, message
import { useEffect, useRef, useState } from "react" // เพิ่ม useState
import { ThunderboltOutlined } from '@ant-design/icons'; // ไอคอนสำหรับ AI
import axios from 'axios'; // นำเข้า axios

// URL สำหรับเรียก Gemini/AI (สมมติว่า backend มี API endpoint)
// *** ถ้าคุณไม่ได้ตั้งค่า axios.defaults.baseURL ในไฟล์นี้ ให้ใส่ URL เต็ม ***
const URL_GEMINI = "http://localhost:3000/api/gemini/summarize"; // ต้องปรับตาม Backend จริงของคุณ

export default function EditBook(props) {
    const formRef = useRef(null)
    const [loadingAI, setLoadingAI] = useState(false); // สถานะโหลด AI

    useEffect(() => {
        if(props.book && formRef.current) {
            // ตั้งค่าฟอร์มเมื่อ props.book มีการเปลี่ยนแปลง
            formRef.current.setFieldsValue({
                ...props.book,
                // ต้องเปลี่ยน category เป็น categoryId หาก backend ใช้ categoryId ในฟอร์ม
                // หรือเปลี่ยน categoryId เป็น category ถ้า props.book ใช้ category
                categoryId: props.book.category?.id || props.book.categoryId 
            })
        }
    }, [props.book])

    const handleAIGenerate = async () => {
        try {
            setLoadingAI(true);
            const currentValues = formRef.current.getFieldsValue();
            
            // 1. ตรวจสอบว่ามีข้อมูลเบื้องต้น
            if (!currentValues.title && !currentValues.author) {
                message.warning('กรุณากรอก Title และ Author ก่อนดึงข้อมูล AI');
                return;
            }

            // 2. ส่งข้อมูลหนังสือไปให้ Backend 
            const promptText = `Please provide a short, engaging description (max 3 sentences) for the book titled "${currentValues.title || 'Unknown Title'}" by "${currentValues.author || 'Unknown Author'}". Focus on its core plot and genre.`;
            
            const response = await axios.post(URL_GEMINI, {
                title: currentValues.title,
                author: currentValues.author,
                prompt: promptText, // ส่ง prompt ที่สร้างขึ้น
            });
            
            const aiDescription = response.data.summary || response.data.description;
            
            // 3. อัพเดทฟิลด์ description ในฟอร์มด้วยคำตอบจาก AI
            if (aiDescription) {
                formRef.current.setFieldsValue({ description: aiDescription });
                message.success('ดึงคำอธิบายจาก AI สำเร็จ!');
            } else {
                 message.warning('AI ตอบกลับมา แต่ไม่มีคำอธิบายที่ชัดเจน');
            }

        } catch (error) {
            console.error('Error calling Gemini API:', error);
            message.error('เรียก API Gemini ไม่สำเร็จ');
        } finally {
            setLoadingAI(false);
        }
    };
    
    return(
        // เปลี่ยนมาใช้ Form component ภายนอก Modal เพื่อควบคุมปุ่ม Ok/Cancel
        <Form ref={formRef} layout="vertical"> 
            <Modal 
                title="Edit Book" 
                okText="Save" 
                cancelText="Cancel"
                open={props.open} 
                onCancel={props.onCancel} 
                onOk={() => {
                    formRef.current.validateFields().then(values => {
                        props.onSave({...props.book, ...values})
                    }).catch(info => {
                        console.log('Validate Failed:', info);
                    });
                }}
            >
                <Form.Item>
                    <Image src={`http://localhost:3080/${props.book?.coverUrl}`} height={100} />
                </Form.Item>
                <Form.Item name="title" label="Title" rules={[{ required: true }]}>
                    <Input/>
                </Form.Item>
                <Form.Item name="author" label="Author" rules={[{ required: true }]}>
                    <Input/>
                </Form.Item>
                
                {/* 💥 ส่วนที่เพิ่ม: Description พร้อมปุ่ม AI */}
                <Form.Item label="Description" name="description">
                    <Space direction="vertical" style={{ width: '100%' }}>
                        <Button 
                            icon={<ThunderboltOutlined />} 
                            onClick={handleAIGenerate} 
                            loading={loadingAI}
                            style={{ width: '100%' }}
                        >
                            {loadingAI ? 'กำลังดึงข้อมูลจาก AI...' : 'ดึงคำอธิบายโดย AI (Gemini)'}
                        </Button>
                        <Input.TextArea rows={4} />
                    </Space>
                </Form.Item>
                
                <Form.Item name="price" label="Price" rules={[{ required: true }]}>
                    <InputNumber min={0} style={{ width: '100%' }}/>
                </Form.Item>
                <Form.Item name="stock" label="Stock" rules={[{ required: true }]}>
                    <InputNumber min={0} style={{ width: '100%' }}/>
                </Form.Item>
                <Form.Item name="categoryId" label="Category" rules={[{ required: true }]}>
                    {/* ใช้ props.categories ที่ถูกส่งมา */}
                    <Select allowClear style={{width:"150px"}} options={props.categories}/>
                </Form.Item>
            </Modal>
        </Form>
    )
}