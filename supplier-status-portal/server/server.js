const express = require('express');
const cors = require('cors');
const { configDotenv } = require('dotenv');
const session = require('express-session');

const newRoutes = require('./routes/newRoutes');
const filterRoutes = require('./routes/filterRoutes')
// const supplierRoutes = require('./routes/supplierRoutes');
// const authRoutes = require('./routes/authRoutes');

configDotenv();

const app = express();
app.use(cors({origin: 'http://localhost:3000', credentials: true}));
app.use(express.json());

app.use(
  session({
      secret: "your-secret-key",
      resave: false,
      saveUninitialized: true,
  })
);

// Use the supplier routes
// app.use("/api/auth", authRoutes);
// app.use("/api", supplierRoutes);
app.use(filterRoutes);
app.use(newRoutes);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
