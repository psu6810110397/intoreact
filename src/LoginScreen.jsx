import { useState } from 'react';
import { Button, Form, Input, Alert, Checkbox } from 'antd'; // เพิ่ม Checkbox
import axios from 'axios'

const URL_AUTH = "/api/auth/login"

export default function LoginScreen(props) {
  const [isLoading, setIsLoading] = useState(false)
  const [errMsg, setErrMsg] = useState(null)

  const handleLogin = async (formData) => { 
    try{
      setIsLoading(true)
      setErrMsg(null)
      
      const { username, password, remember } = formData;
      
      const response = await axios.post(URL_AUTH, { username, password });
      const token = response.data.access_token;

      // ส่ง Token และสถานะ remember กลับไปให้ App.js
      props.onLoginSuccess(token, remember); 
      
    } catch(err) { 
      console.error(err);
      const message = err.response?.data?.message || 'Login failed due to network or server error.';
      setErrMsg(message);
      
    } finally { 
      setIsLoading(false); 
    }
  }

  return(
    <Form
      onFinish={handleLogin}
      initialValues={{ remember: true }} 
      autoComplete="off">
      
      {errMsg &&
        <Form.Item>
          <Alert message={errMsg} type="error" />
        </Form.Item>
      }

      <Form.Item
        label="Username"
        name="username"
        rules={[{required: true,}]}>
        <Input />
      </Form.Item>
      
      <Form.Item
        label="Password"
        name="password"
        rules={[{required: true},]}>
        <Input.Password />
      </Form.Item>
      
      {/* ส่วนที่เพิ่ม: Checkbox "Remember Me" */}
      <Form.Item name="remember" valuePropName="checked">
        <Checkbox>Remember Me</Checkbox>
      </Form.Item>

      <Form.Item>
        <Button 
           type="primary" 
           htmlType="submit" loading={isLoading}>
          Submit
        </Button>
      </Form.Item>
    </Form>
  )
}