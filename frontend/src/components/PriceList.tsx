import React, { useState, useEffect } from 'react';
import { Card, List, Typography, Button, Modal, Form, Input, InputNumber, Select } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';

const { Title } = Typography;
const { Option } = Select;

interface Service {
  id: number;
  name: string;
  price: number;
  category: string;
  description: string;
  duration: number;
}

const PriceList: React.FC = () => {
  const [services, setServices] = useState<Service[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editingService, setEditingService] = useState<Service | null>(null);
  const [form] = Form.useForm();

  useEffect(() => {
    fetchPriceList();
    checkAdminStatus();
  }, []);

  const fetchPriceList = async () => {
    try {
      const response = await fetch('http://localhost:3000/web/price');
      const data = await response.json();
      setServices(data.services);
      setCategories(data.categories);
    } catch (error) {
      console.error('Ошибка при загрузке прайса:', error);
    }
  };

  const checkAdminStatus = async () => {
    try {
      const userId = localStorage.getItem('telegram_user_id');
      if (userId) {
        const response = await fetch(`http://localhost:3000/web/check-admin/${userId}`);
        const data = await response.json();
        setIsAdmin(data.isAdmin);
      }
    } catch (error) {
      console.error('Ошибка при проверке прав администратора:', error);
    }
  };

  const handleAddService = () => {
    setEditingService(null);
    form.resetFields();
    setIsModalVisible(true);
  };

  const handleEditService = (service: Service) => {
    setEditingService(service);
    form.setFieldsValue(service);
    setIsModalVisible(true);
  };

  const handleDeleteService = async (id: number) => {
    try {
      await fetch(`http://localhost:3000/web/admin/service/${id}/delete`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-telegram-user-id': localStorage.getItem('telegram_user_id') || '',
        },
      });
      fetchPriceList();
    } catch (error) {
      console.error('Ошибка при удалении услуги:', error);
    }
  };

  const handleModalOk = async () => {
    try {
      const values = await form.validateFields();
      const url = editingService
        ? `http://localhost:3000/web/admin/service/${editingService.id}`
        : 'http://localhost:3000/web/admin/service';
      
      await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-telegram-user-id': localStorage.getItem('telegram_user_id') || '',
        },
        body: JSON.stringify(values),
      });
      
      setIsModalVisible(false);
      fetchPriceList();
    } catch (error) {
      console.error('Ошибка при сохранении услуги:', error);
    }
  };

  return (
    <div style={{ padding: '24px' }}>
      <Title level={2}>Прайс-лист</Title>
      
      {isAdmin && (
        <Button
          type="primary"
          icon={<PlusOutlined />}
          onClick={handleAddService}
          style={{ marginBottom: '16px' }}
        >
          Добавить услугу
        </Button>
      )}

      {categories.map(category => (
        <Card
          key={category}
          title={category}
          style={{ marginBottom: '16px' }}
        >
          <List
            dataSource={services.filter(service => service.category === category)}
            renderItem={service => (
              <List.Item
                actions={isAdmin ? [
                  <Button
                    type="text"
                    icon={<EditOutlined />}
                    onClick={() => handleEditService(service)}
                  />,
                  <Button
                    type="text"
                    danger
                    icon={<DeleteOutlined />}
                    onClick={() => handleDeleteService(service.id)}
                  />
                ] : undefined}
              >
                <List.Item.Meta
                  title={service.name}
                  description={
                    <>
                      <div>{service.description}</div>
                      <div>Длительность: {service.duration} мин.</div>
                      <div>Цена: {service.price} ₽</div>
                    </>
                  }
                />
              </List.Item>
            )}
          />
        </Card>
      ))}

      <Modal
        title={editingService ? 'Редактировать услугу' : 'Добавить услугу'}
        visible={isModalVisible}
        onOk={handleModalOk}
        onCancel={() => setIsModalVisible(false)}
      >
        <Form form={form} layout="vertical">
          <Form.Item
            name="name"
            label="Название"
            rules={[{ required: true, message: 'Введите название услуги' }]}
          >
            <Input />
          </Form.Item>
          <Form.Item
            name="category"
            label="Категория"
            rules={[{ required: true, message: 'Выберите категорию' }]}
          >
            <Select>
              {categories.map(category => (
                <Option key={category} value={category}>{category}</Option>
              ))}
            </Select>
          </Form.Item>
          <Form.Item
            name="price"
            label="Цена"
            rules={[{ required: true, message: 'Введите цену' }]}
          >
            <InputNumber min={0} style={{ width: '100%' }} />
          </Form.Item>
          <Form.Item
            name="duration"
            label="Длительность (минуты)"
            rules={[{ required: true, message: 'Введите длительность' }]}
          >
            <InputNumber min={0} style={{ width: '100%' }} />
          </Form.Item>
          <Form.Item
            name="description"
            label="Описание"
          >
            <Input.TextArea />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default PriceList; 