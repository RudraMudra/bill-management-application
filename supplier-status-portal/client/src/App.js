import React, { useState } from 'react';
import { Layout, Typography, message } from 'antd';
import SearchForm from './Components/SearchForm';
import SupplierTable from './Components/SupplierTable';
import { fetchSuppliers } from './services/SupplierService';

const { Header, Content, Footer } = Layout;
const { Title } = Typography;

const App = () => {

  const [suppliers, setSuppliers] = useState([]);

  const handleSearch = async (queryParams) => {
    try {
      const data = await fetchSuppliers(queryParams);
      setSuppliers(data);
    } catch (error) {
      message.error('Error fetching supplier data');
      console.error(error);
    }
  };

  return (
    <Layout>
      <Header style={{ color: '#fff', textAlign: 'center' }}>
        <Title level={3} style={{ color: '#fff', margin: 0 }}>
          Invoice Management Application
        </Title>
      </Header>
      <Content style={{ padding: '24px', minHeight: '80vh' }}>
        <SearchForm onSearch={handleSearch} />
        <SupplierTable suppliers={suppliers} />
      </Content>
      <Footer style={{ textAlign: 'center' }}>
        Invoice Management Application ©2025 Created with Ant Design
      </Footer>
    </Layout>
  );
};

export default App;
