import React, { useState, useEffect } from 'react';
import { Form, Input, Button, Row, Col, Switch, Select, Card, Spin } from 'antd';
import axios from 'axios';
import SupplierTable from './SupplierTable';
import { notification } from 'antd';
import { useCallback } from 'react';
import * as XLSX from 'xlsx';
import { Pie } from 'react-chartjs-2';
import 'chart.js/auto';
import ChartDataLabels from 'chartjs-plugin-datalabels';

const { Option } = Select;

const SearchForm = ({ onSearch }) => {
  const [form] = Form.useForm(); // Form instance for handling form data and validation
  const [supplierData, setSupplierData] = useState([]); // State to store supplier data
  const [vendorData, setVendorData] = useState([]);  // State to store vendor-specific data
  const [vendorId, setVendorId] = useState(null); // State to store the selected vendor's ID
  const [isSwitchOn, setIsSwitchOn] = useState(false); // State for switch toggle (showing vendor invoices)
  const [filteredData, setFilteredData] = useState([]); // State for storing filtered data based on status
  const [billStatusOptions, setBillStatusOptions] = useState([]); // State for available bill status options
  const [selectedStatus, setSelectedStatus] = useState(''); // State for the selected bill status filter
  const [loading, setLoading] = useState(false); // State for loading state of the component
  const [showChart, setShowChart] = useState(false); // State to manage view

  // Extract unique bill statuses for the dropdown whenever supplierData,
  // vendorData, or isSwitchOn changes

  useEffect(() => {
    const dataToAnalyze = isSwitchOn ? vendorData : supplierData;
    const uniqueStatuses = [...new Set(dataToAnalyze.map(item => item.Bill_Status))];
    setBillStatusOptions(uniqueStatuses);
  }, [supplierData, vendorData, isSwitchOn]);

  // Handle the search action when the user clicks the Search button

  const handleSearch = useCallback(async () => {
    try {
      setLoading(true); // Set loading state to true
      const values = await form.validateFields(); // Validate the form fields
      onSearch(values); // Trigger parent-provided search handler

      // Fetch supplier data based on search parameters
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

      setSupplierData(response.data);  // Set supplier data from the response
      setFilteredData(response.data); // Initialize filtered data

      // Set vendor ID if data is available
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
      console.error('Error fetching supplier details', error); // Handle errors gracefully
      notification.error({
        message: 'Error fetching supplier details',
        description: 'Please enter the correct search parameters and try again',
      });
    } finally {
      setLoading(false); // Set loading state to false
    }
  }, [form, onSearch]);

  // Handle the reset action when the user clicks the Reset button
  const handleReset = useCallback(() => {
    form.resetFields(); // Reset form fields
    setSupplierData([]); // Clear supplier data
    setVendorData([]); // Clear vendor data
    setFilteredData([]); // Clear filtered data
    setIsSwitchOn(false); // Reset switch state
    setVendorId(null); // Reset vendor ID
    setSelectedStatus(''); // Reset selected status
    setBillStatusOptions([]); // Reset bill status options
  }, [form]);

  // Handle the toggle switch action to show vendor invoices
  const handleToggle = async (checked) => {
    setIsSwitchOn(checked); // Update switch state
    if (checked && vendorId) { // Fetch vendor-related bills if switch is on and vendor ID is available
      try {
        setLoading(true); // Set loading state to true
        const response = await axios.get(`http://localhost:5000/api/suppliers/${vendorId}`);
        setVendorData(response.data); // Set vendor-specific data
        setFilteredData(response.data);  // Update filtered data
      } catch (error) {
        console.error('Error fetching vendor-related bills:', error); // Handle errors gracefully
      } finally {
        setLoading(false);
      }
    } else {
      setFilteredData(supplierData); // Reset to supplier data when switch is off
    }
  };

  // Handle the bill status change action to filter data based on status

  const handleStatusChange = useCallback((value) => {
    setSelectedStatus(value); // Update selected bill status
    if (value) {
      const dataToFilter = isSwitchOn ? vendorData : supplierData;
      const filtered = dataToFilter.filter(item => item.Bill_Status === value); // Filter data based on status
      setFilteredData(filtered);
    } else {
      setFilteredData(isSwitchOn ? vendorData : supplierData); // Reset to unfiltered data
    }
  }, [supplierData, vendorData, isSwitchOn]);

  // handle the download action when the user clicks the Download button
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

  const chartOptions = {
    plugins: {
      datalabels: {
        formatter: (value, context) => {
          const total = context.chart.data.datasets[0].data.reduce((acc, val) => acc + val, 0);
          const percentage = ((value / total) * 100).toFixed(2) + '%';
          return percentage;
        },
        color : '#fff',
        font: {
          weight: 'bold',
        },
      },
    },
  };

  return (
    <div>
      {/* Search Form */}
      <Form form={form} layout="inline" style={{ marginBottom: 16 }}>
        <Row gutter={[16, 16]} justify="center">
          <Col xs={24} sm={12} md={6}>
             {/* Bill ID input field */}
            <Form.Item label="Bill ID" name="billId" rules={[{ required: true, message: 'Please enter Bill ID' }]}>
              <Input placeholder="Enter Bill ID" />
            </Form.Item>
          </Col>
          <Col>
            {/* Bill Date input field */}
            <Form.Item label="Bill Date" name="billDate" rules={[{ required: true, message: 'Please enter Bill Date' }]}>
              <Input type="date" />
            </Form.Item>
          </Col>
          <Col>
            {/* Bill Amount input field */}
            <Form.Item label="Bill Amount" name="billAmount" rules={[{ required: true, message: 'Please enter Bill Amount' }]}>
              <Input type="number" placeholder="Enter Bill Amount" />
            </Form.Item>
          </Col>
          <Col>
            {/* Search button */}
            <Button type="primary" onClick={handleSearch} disabled={loading} aria-label='search'>Search</Button>
          </Col>
          <Col style={{ marginLeft: 10 }}>
            {/* Reset button */}
            <Button onClick={handleReset} disabled={loading} aria-label='reset'>Reset</Button>
          </Col>
        </Row>
      </Form>

      {/* Dynamic Filter Box */}
      <Card style={{ marginBottom: 16 }}>
        <Row align="middle" justify="space-between" gutter={16} style={{ display: 'flex', alignItems: 'center' }}>
          <Col>
            {/* Bill Status Dropdown */}
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
              <Pie data={chartData} options={chartOptions} plugins={[ChartDataLabels]} />
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