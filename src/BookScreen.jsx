import './App.css'
import { useState, useEffect } from 'react';
import { Divider, Spin, Button, Row, Col, Layout, Menu, Modal, message } from 'antd';
import { LogoutOutlined, BookOutlined, DashboardOutlined, SettingOutlined } from '@ant-design/icons';
import { Link } from 'react-router-dom';
import axios from 'axios'
import BookList from './components/BookList'
import AddBook from './components/AddBook';
import EditBook from './components/EditBook';
// แก้ไข Import Path ให้ถูกตามโครงสร้าง: ./components/CategoryManagement
import CategoryManagement from './components/CategoryManagement'; 

const URL_BOOK = "/api/book"
const URL_CATEGORY = "/api/book-category"
const { Header, Content } = Layout;

// รับ prop onLogout ที่ส่งมาจาก App.js
function BookScreen({ onLogout }) { 
  const [bookData, setBookData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [categories, setCategories] = useState([]);
  const [isAddModalVisible, setIsAddModalVisible] = useState(false);
  const [isEditModalVisible, setIsEditModalVisible] = useState(false);
  const [isCategoryModalVisible, setIsCategoryModalVisible] = useState(false); 
  const [editBook, setEditBook] = useState(null); 
  
  const fetchCategories = async () => {
    try {
      const response = await axios.get(URL_CATEGORY);
      setCategories(response.data.map(cat => ({
        label: cat.name,
        value: cat.id
      })));
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  }

  const fetchBooks = async () => {
    setLoading(true);
    try {
      const response = await axios.get(URL_BOOK);
      setBookData(response.data);
    } catch (error) {
      console.error('Error fetching books:', error);
    } finally {
      setLoading(false);
    }
  }

  // ฟังก์ชัน CRUD Category (สำหรับส่งไปยัง CategoryManagement)
  const handleAddCategory = async (name) => {
    try {
        await axios.post(URL_CATEGORY, { name });
        fetchCategories();
        message.success(`เพิ่มหมวดหมู่ "${name}" สำเร็จ`);
        return true;
    } catch (error) {
        message.error('เพิ่มหมวดหมู่ไม่สำเร็จ');
        throw error;
    }
  }

  const handleEditCategory = async (id, name) => {
      try {
          await axios.patch(URL_CATEGORY + `/${id}`, { name });
          fetchCategories();
          message.success(`แก้ไขหมวดหมู่ ID:${id} สำเร็จ`);
          return true;
      } catch (error) {
          message.error('แก้ไขหมวดหมู่ไม่สำเร็จ');
          throw error;
      }
  }

  const handleDeleteCategory = async (id) => {
      try {
          await axios.delete(URL_CATEGORY + `/${id}`);
          fetchCategories();
          message.success('ลบหมวดหมู่สำเร็จ');
          return true;
      } catch (error) {
          message.error('ลบหมวดหมู่ไม่สำเร็จ หรือมีหนังสืออยู่ในหมวดหมู่นี้');
          throw error;
      }
  }

  const handleAddBook = async (book) => {
    setLoading(true)
    try {
      const response = await axios.post(URL_BOOK, book);
      fetchBooks();
      setIsAddModalVisible(false);
      message.success(`เพิ่มหนังสือ "${book.title}" สำเร็จ`);
    } catch (error) {
      console.error('Error adding book:', error);
      message.error('เพิ่มหนังสือไม่สำเร็จ');
    } finally {
      setLoading(false);
    }
  }

  const handleLikeBook = async (book) => {
    setLoading(true)
    try {
      const response = await axios.patch(URL_BOOK + `/${book.id}`, { likeCount: book.likeCount + 1 });
      fetchBooks();
    } catch (error) {
      console.error('Error liking book:', error);
    } finally {
      setLoading(false);
    }
  }

  const handleDeleteBook = async (bookId) => {
    setLoading(true)
    try {
      const response = await axios.delete(URL_BOOK + `/${bookId}`);
      fetchBooks();
      message.success('ลบหนังสือสำเร็จ');
    } catch (error) {
      console.error('Error deleting book:', error);
      message.error('ลบหนังสือไม่สำเร็จ');
    } finally {
      setLoading(false);
    }
  }

  const handleEditBook = async (book) => {
    setLoading(true)
    try {
      const editedData = {...book, 'price': Number(book.price), 'stock': Number(book.stock)}
      const {id, category, createdAt, updatedAt, ...data} = editedData
      const response = await axios.patch(URL_BOOK + `/${id}`, data);
      fetchBooks();
      message.success(`แก้ไขหนังสือ "${book.title}" สำเร็จ`);
    } catch (error) {
      console.error('Error editing book:', error);
      message.error('แก้ไขหนังสือไม่สำเร็จ');
    } finally {
      setLoading(false);
      setEditBook(null);
      setIsEditModalVisible(false);
    }
  }

  const handleOpenEdit = (book) => {
    setEditBook(book);
    setIsEditModalVisible(true);
  }

  const handleCancelEdit = () => {
    setEditBook(null);
    setIsEditModalVisible(false);
  }

  useEffect(() => {
    fetchCategories();
    fetchBooks();
  }, []);

  const menuItems = [
    { key: '1', icon: <BookOutlined />, label: <Link to="/">หนังสือทั้งหมด</Link> },
    { key: '2', icon: <DashboardOutlined />, label: <Link to="/dashboard">แดชบอร์ด</Link> },
    { key: '3', icon: <SettingOutlined />, label: 'จัดการหมวดหมู่', onClick: () => setIsCategoryModalVisible(true) },
  ];
  
  return (
    <Layout style={{ minHeight: '100vh' }}>
      {/* Header/Menu พร้อมปุ่ม Logout */}
      <Header style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 24px' }}>
        <div style={{ color: 'white', fontSize: '1.5em', fontWeight: 'bold' }}>
          Book Store
        </div>
        <Menu 
          theme="dark" 
          mode="horizontal" 
          defaultSelectedKeys={['1']}
          items={menuItems}
          style={{ flex: 1, minWidth: 0, borderBottom: 'none', marginLeft: 30 }}
        />
        <Button 
          type="primary" 
          icon={<LogoutOutlined />} 
          onClick={onLogout} 
          style={{ marginLeft: 'auto' }}
        >
          ออกจากระบบ
        </Button>
      </Header>

      {/* Content หลัก */}
      <Content style={{ padding: '0 50px', marginTop: 24 }}>
        <div style={{ background: '#fff', padding: 24, minHeight: 600 }}>
          
          {/* ปุ่ม Add Book */}
          <Row justify="end" style={{ marginBottom: "1em" }}>
            <Col>
              <Button type="primary" onClick={() => setIsAddModalVisible(true)}>
                เพิ่มหนังสือใหม่
              </Button>
            </Col>
          </Row>

          <Divider>My Books List</Divider>

          <Spin spinning={loading}>
            <BookList 
              data={bookData} 
              onLiked={handleLikeBook}
              onDeleted={handleDeleteBook}
              onEdit={handleOpenEdit} 
            />
          </Spin>

          {/* Modal สำหรับ AddBook */}
          <Modal
            title="เพิ่มหนังสือใหม่"
            open={isAddModalVisible}
            onCancel={() => setIsAddModalVisible(false)}
            footer={null} 
            destroyOnClose={true}
          >
            <AddBook categories={categories} onBookAdded={handleAddBook} onCancel={() => setIsAddModalVisible(false)} />
          </Modal>

          {/* Modal สำหรับ EditBook */}
          <Modal
            title="แก้ไขหนังสือ"
            open={isEditModalVisible && editBook !== null}
            onCancel={handleCancelEdit}
            footer={null}
            destroyOnClose={true}
          >
            {editBook && (
              <EditBook 
                book={editBook} 
                categories={categories} 
                onCancel={handleCancelEdit} 
                onSave={handleEditBook} />
            )}
          </Modal>

          {/* Modal สำหรับ Category Management */}
          <Modal
            title="จัดการหมวดหมู่"
            open={isCategoryModalVisible}
            onCancel={() => setIsCategoryModalVisible(false)}
            footer={null}
            width={800}
            destroyOnClose={true}
          >
            <CategoryManagement 
                categories={categories} 
                onCancel={() => setIsCategoryModalVisible(false)} 
                onAdd={handleAddCategory}      
                onEdit={handleEditCategory}    
                onDelete={handleDeleteCategory} 
            />
          </Modal>

        </div>
      </Content>
    </Layout>
  )
}

export default BookScreen