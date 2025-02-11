import React from 'react';
import { Table } from 'antd';
import { MailOutlined } from '@ant-design/icons';

const SupplierTable = ({ suppliers, isVisible }) => {
  const handleGmailClick = (record) => {
    const { Email, Name, Country, State, Bill_Id, Vendor_Id, Bill_Date, Bill_Amount, Bill_Status } = record;
    const subject = `Details for vendor ID: ${Vendor_Id}`;
    const body = `
          Name: ${Name}
          Country: ${Country}
          State: ${State}
          Bill ID: ${Bill_Id}
          Vendor ID: ${Vendor_Id}
          Bill Date: ${new Date(Bill_Date).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    })}
          Bill Amount: ${Bill_Amount}
          Bill Status: ${Bill_Status}

        Comments:`;

    const mailtoLink = `mailto:${Email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    window.location.href = mailtoLink;
  };

  const columns = [
    { title: 'ID', dataIndex: '_Id', key: '_Id' },
    { title: 'Name', dataIndex: 'Name', key: 'Name',
      sorter: (a, b) => a.Name.localeCompare(b.Name), // Sorting function for Name
     },
    { title: 'Email', dataIndex: 'Email', key: 'Email' },
    { title: 'State', dataIndex: 'State', key: 'State' },
    { title: 'Country', dataIndex: 'Country', key: 'Country' },
    { title: 'Bill ID', dataIndex: 'Bill_Id', key: 'Bill_Id' },
    { title: 'Vendor ID', dataIndex: 'Vendor_Id', key: 'Vendor_Id' },
    {
      title: 'Bill Date', dataIndex: 'Bill_Date', key: 'Bill_Date',
      render: (date) => new Date(date).toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
      }),
      sorter : (a, b) => new Date(a.Bill_Date) - new Date(b.Bill_Date), // Sorting function for Bill Date
    },
    {
      title: 'Bill Amount', dataIndex: 'Bill_Amount', key: 'Bill_Amount',
      sorter: (a, b) => a.Bill_Amount - b.Bill_Amount, // Sorting function for Bill Amount
    },
    { title: 'Bill Status', dataIndex: 'Bill_Status', key: 'Bill_Status' },
    {
      title: 'Actions', key: 'actions', render: (_, record) => (
        <button onClick={() => handleGmailClick(record)}>
          <MailOutlined alt="Gmail" style={{ fontSize: '24px' }} />
        </button>
      )
    },
  ];

  if (!isVisible) {
    return null;
  }

  return (
    <Table
      dataSource={suppliers}
      columns={columns}
      rowKey="_Id"
      pagination={{
        pageSize: 10,
        showTotal: (total, range) => `${range[0]}-${range[1]} of ${total} items`,
      }}
    />
  );
};

export default React.memo(SupplierTable);