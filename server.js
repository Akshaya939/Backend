const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const sql = require("mssql");
require("dotenv").config();

const app = express();

// app.use(cors({
//   origin: 'https://akshayaaccount.z8.web.core.windows.net/',
// }));
app.use(bodyParser.json());

// Azure SQL Database Configuration
const sqlConfig = {
  user: process.env.DB_USER || "sqladmin", // Replace with your Azure SQL username
  password: process.env.DB_PASSWORD || "Root@123", // Replace with your Azure SQL password
  database: process.env.DB_NAME || "vishdb", // Replace with your Azure SQL database name
  server: process.env.DB_SERVER || "vishdatabaseserver.database.windows.net", // Replace with your Azure SQL server name
  options: {
    encrypt: true, // Enable if using Azure
    trustServerCertificate: false, // Recommended for production
  },
};

// Test SQL Connection
sql.connect(sqlConfig)
  .then(() => console.log("Connected to Azure SQL Database"))
  .catch((err) => console.error("Database Connection Error:", err));

// Health check route
app.get("/", (req, res) => {
  res.send("Server is working!");
});



  // API Endpoint
app.post("/api/contact", async (req, res) => {
  const { name, emailPhone, message } = req.body;

  if (!name || !emailPhone || !message) {
    return res.status(400).json({ message: "All fields are required." });
  }

  try {
    // Insert Contact Form Data into Azure SQL
    const pool = await sql.connect(sqlConfig);
    await pool.request()
      .input("name", sql.VarChar, name)
      .input("emailPhone", sql.VarChar, emailPhone)
      .input("message", sql.Text, message)
      .query(
        "INSERT INTO ContactForm (name, emailphone, message) VALUES (@name, @emailphone, @message)"
      );

    res.status(201).json({ message: "Contact form submitted successfully!" });
  } catch (err) {
    console.error("Database Error:", err);
    res.status(500).json({ message: "Server error. Please try again later." });
  }
});

// Start Server
const PORT = process.env.PORT || 3001;
app.listen(PORT, "0.0.0.0", () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
