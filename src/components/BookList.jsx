import { Table, Button, Space, Popconfirm, Tag, Image } from 'antd';

export default function BookList(props) {
  const columns = [
    { title: 'Title', dataIndex: 'title', key: 'title' },
    { title: 'Author', dataIndex: 'author', key: 'author' },
    { title: 'Description', dataIndex: 'description', key: 'description' },
    { title: 'Price', dataIndex: 'price', key: 'price' },
    { title: 'Stock', dataIndex: 'stock', key: 'stock' },
    {
      title: "Cover",
      dataIndex: 'coverUrl',
      render: (text) => <Image src={`http://localhost:3080/${text}`} height={80} fallback="https://via.placeholder.com/80" />,
    },
    {
      title: 'Category',
      dataIndex: 'category',
      key: 'category',
      render: (value) => <Tag color="blue">{value?.name || 'ทั่วไป'}</Tag>,
    },
    { title: 'Liked', dataIndex: 'likeCount', key: 'likeCount' },
    {
      title: 'Action',
      key: 'action',
      render: (text, record) => (
        <Space>
          <Button type="primary" size="small" onClick={() => props.onLiked(record)}>Like</Button>
          {/* ส่ง record ทั้งก้อนไปเพื่อใช้ Edit */}
          <Button variant="outlined" color="primary" size="small" onClick={() => props.onEdit(record)}>Edit</Button>
          <Popconfirm title="ยืนยันการลบ?" onConfirm={() => props.onDeleted(record.id)}>
            <Button danger type="dashed" size="small">Delete</Button>
          </Popconfirm>
        </Space>
      ),
    }
  ];

  return (
    <Table 
      rowKey="id" 
      dataSource={props.data} 
      columns={columns} 
      rowClassName={(record) => (record.stock < 10 ? "red-row" : "")} 
    />
  );
}