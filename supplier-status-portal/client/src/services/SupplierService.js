import axios from 'axios';
import { format } from 'date-fns';

const API_BASE_URL = 'http://localhost:5000/api/suppliers';

export const fetchSuppliers = async (queryParams = {}) => {
  const params = {};

  if (queryParams.billId) params.Bill_Id = queryParams.billId;
  if (queryParams.billDate) params.Bill_Date = queryParams.billDate;
  if (queryParams.billAmount) params.Bill_Amount = queryParams.billAmount;

  const response = await axios.get(API_BASE_URL, { params });

  return response.data.map((supplier) => ({
    ...supplier,
    Bill_Date: supplier.Bill_Date
      ? format(new Date(supplier.Bill_Date), 'yyyy-MM-dd')
      : supplier.Bill_Date,
  }));
};
