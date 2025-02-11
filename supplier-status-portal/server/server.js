const express = require('express');
const cors = require('cors');
const { configDotenv } = require('dotenv');
const newRoutes = require('./routes/newRoutes');
const filterRoutes = require('./routes/filterRoutes')

configDotenv();

const app = express();
app.use(cors());
app.use(express.json());

// Use the supplier routes
// app.use(supplierRoutes);
app.use(filterRoutes);
app.use(newRoutes);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
