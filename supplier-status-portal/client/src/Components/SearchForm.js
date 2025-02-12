import React, { useState, useEffect } from 'react';
import { Form, Input, Button, Row, Col, Switch, Select, Card, Spin } from 'antd';
import axios from 'axios';
import SupplierTable from './SupplierTable';
import { notification } from 'antd';
import { useCallback } from 'react';
import * as XLSX from 'xlsx';
import { Pie } from 'react-chartjs-2';
import 'chart.js/auto';

const { Option } = Select;

const SearchForm = ({ onSearch }) => {
  const [form] = Form.useForm();
  const [supplierData, setSupplierData] = useState([]);
  const [vendorData, setVendorData] = useState([]);
  const [vendorId, setVendorId] = useState(null);
  const [isSwitchOn, setIsSwitchOn] = useState(false);
  const [filteredData, setFilteredData] = useState([]);
  const [billStatusOptions, setBillStatusOptions] = useState([]);
  const [selectedStatus, setSelectedStatus] = useState('');
  const [loading, setLoading] = useState(false);
  const [showChart, setShowChart] = useState(false); // State to manage view

  useEffect(() => {
    const dataToAnalyze = isSwitchOn ? vendorData : supplierData;
    const uniqueStatuses = [...new Set(dataToAnalyze.map(item => item.Bill_Status))];
    setBillStatusOptions(uniqueStatuses);
  }, [supplierData, vendorData, isSwitchOn]);

  const handleSearch = useCallback(async () => {
    try {
      setLoading(true);
      const values = await form.validateFields();
      onSearch(values);

      const response = await axios.get(`http://localhost:5000/api/suppliers`, {
        params: {
          Bill_Id: values.billId,
          Bill_Date: values.billDate,
          Bill_Amount: values.billAmount,
        },
      });

      if (response.data.length === 0) {
        notification.error({
          message: 'No data found',
          description: 'No supplier data found for the given search parameters',
        });
      }

      setSupplierData(response.data);
      setFilteredData(response.data);

      if (response.data.length > 0) {
        setVendorId(response.data[0].Vendor_Id);
        notification.success({
          message: 'Data Found',
          description: `Found ${response.data.length} records`,
        });
      } else {
        setVendorId(null);
      }
    } catch (error) {
      console.error('Error fetching supplier details', error);
      notification.error({
        message: 'Error fetching supplier details',
        description: 'Please enter the correct search parameters and try again',
      });
    } finally {
      setLoading(false);
    }
  }, [form, onSearch]);

  const handleReset = useCallback(() => {
    form.resetFields();
    setSupplierData([]);
    setVendorData([]);
    setFilteredData([]);
    setIsSwitchOn(false);
    setVendorId(null);
    setSelectedStatus('');
    setBillStatusOptions([]);
  }, [form]);

  const handleToggle = async (checked) => {
    setIsSwitchOn(checked);
    if (checked && vendorId) {
      try {
        setLoading(true);
        const response = await axios.get(`http://localhost:5000/api/suppliers/${vendorId}`);
        setVendorData(response.data);
        setFilteredData(response.data);
      } catch (error) {
        console.error('Error fetching vendor-related bills:', error);
      } finally {
        setLoading(false);
      }
    } else {
      setFilteredData(supplierData);
    }
  };

  const handleStatusChange = useCallback((value) => {
    setSelectedStatus(value);
    if (value) {
      const dataToFilter = isSwitchOn ? vendorData : supplierData;
      const filtered = dataToFilter.filter(item => item.Bill_Status === value);
      setFilteredData(filtered);
    } else {
      setFilteredData(isSwitchOn ? vendorData : supplierData);
    }
  }, [supplierData, vendorData, isSwitchOn]);

  const handleDownload = async () => {
    const dataToExport = isSwitchOn ? vendorData : supplierData;
    const worksheet = XLSX.utils.json_to_sheet(dataToExport);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Invoices');
    XLSX.writeFile(workbook, 'invoices.xlsx');
  };

  const toggleChartView = () => {
    setShowChart(!showChart);
  };

  const processChartData = (data) => {
    const statusMap = data.reduce((acc, item) => {
      acc[item.Bill_Status] = (acc[item.Bill_Status] || 0) + 1;
      return acc;
    }, {});

    return {
      labels: Object.keys(statusMap),
      datasets: [
        {
          data: Object.values(statusMap),
          backgroundColor: ['#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0', '#9966FF', '#FF9F40'],
        },
      ],
    };
  };

  const chartData = processChartData(filteredData);

  return (
    <div>
      <Form form={form} layout="inline" style={{ marginBottom: 16 }}>
        <Row gutter={[16, 16]} justify="center">
          <Col xs={24} sm={12} md={6}>
            <Form.Item label="Bill ID" name="billId" rules={[{ required: true, message: 'Please enter Bill ID' }]}>
              <Input placeholder="Enter Bill ID" />
            </Form.Item>
          </Col>
          <Col>
            <Form.Item label="Bill Date" name="billDate" rules={[{ required: true, message: 'Please enter Bill Date' }]}>
              <Input type="date" />
            </Form.Item>
          </Col>
          <Col>
            <Form.Item label="Bill Amount" name="billAmount" rules={[{ required: true, message: 'Please enter Bill Amount' }]}>
              <Input type="number" placeholder="Enter Bill Amount" />
            </Form.Item>
          </Col>
          <Col>
            <Button type="primary" onClick={handleSearch} disabled={loading} aria-label='search'>Search</Button>
          </Col>
          <Col style={{ marginLeft: 10 }}>
            <Button onClick={handleReset} disabled={loading} aria-label='reset'>Reset</Button>
          </Col>
        </Row>
      </Form>

      <Card style={{ marginBottom: 16 }}>
        <Row align="middle" justify="space-between" gutter={16} style={{ display: 'flex', alignItems: 'center' }}>
          <Col>
            <Select
              title='Bill Status'
              placeholder="Filter by Bill Status"
              style={{ width: 200 }}
              value={selectedStatus || undefined}
              onChange={handleStatusChange}
            >
              <Option value="">All</Option>
              {billStatusOptions.map(status => (
                <Option key={status} value={status}>{status}</Option>
              ))}
            </Select>
          </Col>

          <Col>
            <Input
              placeholder="Search by keyword"
              onChange={event => {
                const value = event.target.value;
                const dataToFilter = isSwitchOn ? vendorData : supplierData;
                const filtered = dataToFilter.filter(item =>
                  Object.values(item).some(val =>
                    String(val).toLowerCase().includes(value.toLowerCase())
                  )
                );
                setFilteredData(filtered);
              }}
              style={{ width: 400, marginRight: 20 }}
            />
          </Col>

          <Col style={{ display: 'flex', alignItems: 'center' }}>
            <Button type="primary" onClick={toggleChartView} style={{ marginRight: 10 }} disabled={!isSwitchOn} aria-label="Toggle Chart View">
              {showChart ? 'Show Table' : 'Show Chart'}
            </Button>
            <Switch checked={isSwitchOn} onChange={handleToggle} style={{ marginRight: 10 }} />
            <h3 style={{ marginLeft: 8, marginRight: 10 }}>Show All Invoices</h3>
            <Button type="primary" onClick={handleDownload} style={{ marginLeft: 10 }} disabled={!isSwitchOn} aria-label="Download">Download</Button>
          </Col>
        </Row>
      </Card>

      <Spin spinning={loading}>
        {showChart ? (
          <div style={{ display: 'flex', justifyContent: 'center' }}>
            <div style={{ width: '30%', height: '30%' }}>
              <Pie data={chartData} />
            </div>
          </div>
        ) : (
          <SupplierTable suppliers={filteredData} isVisible={filteredData.length > 0} />
        )}
      </Spin>
    </div>
  );
};

export default SearchForm;