import './App.css'
import { useState, useEffect } from 'react';
import { Divider, Spin, Button, Row, Col, Layout, Menu, Modal, message } from 'antd';
import { LogoutOutlined, BookOutlined, DashboardOutlined, SettingOutlined, PlusOutlined } from '@ant-design/icons';
import { Link, useLocation } from 'react-router-dom';
import axios from 'axios'
import BookList from './components/BookList'
import AddBook from './components/AddBook';
import EditBook from './components/EditBook';
import CategoryManagement from './components/CategoryManagement'; 

const URL_BOOK = "/api/book"
const URL_CATEGORY = "/api/book-category"
const { Header, Content } = Layout;

function BookScreen({ onLogout }) { 
  const [bookData, setBookData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [categories, setCategories] = useState([]);
  const [isAddModalVisible, setIsAddModalVisible] = useState(false);
  const [isEditModalVisible, setIsEditModalVisible] = useState(false);
  const [isCategoryModalVisible, setIsCategoryModalVisible] = useState(false); 
  const [editBook, setEditBook] = useState(null); 
  const location = useLocation();

  const fetchData = async () => {
    setLoading(true);
    try {
      const [bookRes, catRes] = await Promise.all([
        axios.get(URL_BOOK),
        axios.get(URL_CATEGORY)
      ]);
      setBookData(bookRes.data);
      setCategories(catRes.data.map(c => ({ label: c.name, value: c.id })));
    } catch (error) {
      message.error("โหลดข้อมูลล้มเหลว");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { fetchData(); }, []);

  // --- 1. แก้ไขการ Like ---
  const handleLikeBook = async (record) => {
    try {
      await axios.patch(`${URL_BOOK}/${record.id}`, {
        likeCount: (record.likeCount || 0) + 1
      });
      fetchData(); // รีโหลดข้อมูลใหม่
    } catch (err) {
      message.error("Like ไม่สำเร็จ");
    }
  };

  // --- 2. แก้ไขการ Delete ---
  const handleDeleteBook = async (id) => {
    try {
      await axios.delete(`${URL_BOOK}/${id}`);
      message.success("ลบหนังสือเรียบร้อยแล้ว");
      fetchData(); // รีโหลดข้อมูลหลังลบ
    } catch (err) {
      message.error("ลบไม่สำเร็จ");
    }
  };

  // --- 3. แก้ไขการ Add New Book ---
  const handleAddBook = async (values) => {
    try {
      await axios.post(URL_BOOK, values);
      message.success("เพิ่มหนังสือสำเร็จ");
      setIsAddModalVisible(false);
      fetchData(); // รีโหลดตาราง
    } catch (err) {
      message.error("เพิ่มหนังสือล้มเหลว ตรวจสอบข้อมูลให้ครบถ้วน");
    }
  };

  const handleUpdateBook = async (formData) => {
    try {
      const id = editBook.id;
      const cleanData = { ...formData };
      delete cleanData.id;
      delete cleanData.category;
      delete cleanData.createdAt;
      delete cleanData.updatedAt;

      await axios.patch(`${URL_BOOK}/${id}`, cleanData);
      message.success("แก้ไขสำเร็จ");
      setIsEditModalVisible(false);
      setEditBook(null);
      fetchData();
    } catch (err) {
      message.error("แก้ไขล้มเหลว");
    }
  };

  const menuItems = [
    { key: '/', icon: <BookOutlined />, label: <Link to="/">Books</Link> },
    { key: '/dashboard', icon: <DashboardOutlined />, label: <Link to="/dashboard">Dashboard</Link> },
    { key: 'cat', icon: <SettingOutlined />, label: 'Category', onClick: () => setIsCategoryModalVisible(true) },
  ];

  return (
    <Layout className="main-layout">
      <Header className="app-header">
        <div className="header-left">
          <div className="logo-text">BOOKSTORE</div>
          <Menu theme="dark" mode="horizontal" selectedKeys={[location.pathname]} items={menuItems} className="header-menu" />
        </div>
        <Button type="primary" icon={<LogoutOutlined />} onClick={onLogout}>Logout</Button>
      </Header>

      <Content className="app-content">
        <div className="content-card">
          <Row justify="space-between" align="middle" style={{ marginBottom: 20 }}>
            <Col><h2>Book Inventory</h2></Col>
            <Col>
              <Button type="primary" icon={<PlusOutlined />} onClick={() => setIsAddModalVisible(true)}>
                Add New Book
              </Button>
            </Col>
          </Row>

          <Spin spinning={loading}>
            <BookList 
              data={bookData} 
              onEdit={(record) => { setEditBook(record); setIsEditModalVisible(true); }} 
              onDeleted={handleDeleteBook}
              onLiked={handleLikeBook}
            />
          </Spin>
        </div>
      </Content>

      {/* Modals */}
      <Modal title="Add New Book" open={isAddModalVisible} onCancel={() => setIsAddModalVisible(false)} footer={null} destroyOnClose>
        <AddBook categories={categories} onBookAdded={handleAddBook} />
      </Modal>

      <Modal title="Edit Book" open={isEditModalVisible} onCancel={() => setIsEditModalVisible(false)} footer={null} destroyOnClose>
        {editBook && <EditBook isOpen={isEditModalVisible} book={editBook} categories={categories} onSave={handleUpdateBook} onCancel={() => setIsEditModalVisible(false)} />}
      </Modal>

      <Modal title="Manage Category" open={isCategoryModalVisible} onCancel={() => setIsCategoryModalVisible(false)} footer={null} width={700}>
        <CategoryManagement 
          categories={categories} 
          onCancel={() => setIsCategoryModalVisible(false)} 
          onAdd={async (name) => { await axios.post(URL_CATEGORY, {name}); fetchData(); }}
          onEdit={async (id, name) => { await axios.patch(`${URL_CATEGORY}/${id}`, {name}); fetchData(); }}
          onDelete={async (id) => { await axios.delete(`${URL_CATEGORY}/${id}`); fetchData(); }}
        />
      </Modal>
    </Layout>
  );
}
export default BookScreen;