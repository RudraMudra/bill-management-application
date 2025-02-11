import axios from 'axios';
import { format } from 'date-fns';

export const fetchSuppliers = async (queryParams) => {
  let url = 'http://localhost:5000/api/suppliers?';
  if (queryParams.billId) url += `Bill_Id=${queryParams.billId}&`;
  if (queryParams.billDate) url += `Bill_Date=${queryParams.billDate}&`;
  if (queryParams.billAmount) url += `Bill_Amount=${queryParams.billAmount}&`;
  url = url.slice(0, -1);

  const response = await axios.get(url);
  
  // Format the date if it exists
  const formattedData = response.data.map((supplier) => {
    if (supplier.Bill_Date) {
      supplier.Bill_Date = format(new Date(supplier.Bill_Date), 'yyyy-MM-dd'); // Format the date
    }
    return supplier;
  });

  return formattedData;
};
