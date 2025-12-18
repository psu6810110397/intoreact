import React, { useEffect, useState } from 'react';
import { Layout, Typography, Row, Col, Card, Spin } from 'antd';
// ต้องติดตั้ง: npm install chart.js react-chartjs-2
import { Bar } from 'react-chartjs-2'; 
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from 'chart.js'; 
import axios from 'axios';

const { Content } = Layout;
const { Title: AntTitle } = Typography;

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

const URL_BOOK = "/api/book";

export default function Dashboard({ onLogout }) {
    const [chartData, setChartData] = useState({ labels: [], datasets: [] });
    const [loading, setLoading] = useState(true);

    const fetchBookStatistics = async () => {
        setLoading(true);
        try {
            const response = await axios.get(URL_BOOK);
            const books = response.data;

            // ประมวลผลข้อมูล (นับจำนวนหนังสือต่อหมวดหมู่)
            const stats = books.reduce((acc, book) => {
                const categoryName = book.category?.name || 'Uncategorized';
                acc[categoryName] = (acc[categoryName] || 0) + 1;
                return acc;
            }, {});

            // จัดโครงสร้างข้อมูลสำหรับ Chart.js
            const labels = Object.keys(stats);
            const data = Object.values(stats);
            
            setChartData({
                labels: labels,
                datasets: [
                    {
                        label: 'จำนวนหนังสือ',
                        data: data,
                        backgroundColor: 'rgba(53, 162, 235, 0.5)',
                        borderColor: 'rgb(53, 162, 235)',
                        borderWidth: 1,
                    },
                ],
            });

        } catch (error) {
            console.error('Error fetching dashboard data:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchBookStatistics();
    }, []);

    const chartOptions = {
        responsive: true,
        plugins: {
            legend: { position: 'top' },
            title: { display: true, text: 'จำนวนหนังสือแยกตามหมวดหมู่' },
        },
    };

    return (
        <Content style={{ padding: '0 50px', marginTop: 24 }}>
            <div style={{ background: '#fff', padding: 24, minHeight: 600 }}>
                <AntTitle level={2}>📊 Dashboard - สถิติหนังสือ</AntTitle>
                <Row gutter={16}>
                    <Col span={12}>
                        <Card title="หนังสือตามหมวดหมู่" bordered={false}>
                            <Spin spinning={loading}>
                                {chartData.labels.length > 0 ? (
                                    <Bar options={chartOptions} data={chartData} />
                                ) : (
                                    <p>ไม่พบข้อมูลสถิติ</p>
                                )}
                            </Spin>
                        </Card>
                    </Col>
                    <Col span={12}>
                        <Card title="ข้อมูลสรุป" bordered={false}>
                            <p>สามารถเพิ่มกราฟอื่นๆ ได้ที่นี่</p>
                        </Card>
                    </Col>
                </Row>
            </div>
        </Content>
    );
}