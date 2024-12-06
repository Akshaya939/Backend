const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const sql = require("mssql");
require("dotenv").config();

const app = express();

app.use(cors());
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

// API Endpoint
app.post("/api/contact", async (req, res) => {
  const { name, email, message } = req.body;

  if (!name || !email || !message) {
    return res.status(400).json({ message: "All fields are required." });
  }

  try {
    // Insert Contact Form Data into Azure SQL
    const pool = await sql.connect(sqlConfig);
    await pool.request()
      .input("name", sql.VarChar, name)
      .input("email", sql.VarChar, email)
      .input("message", sql.Text, message)
      .query(
        "INSERT INTO ContactForm (name, email, message) VALUES (@name, @email, @message)"
      );

    res.status(201).json({ message: "Contact form submitted successfully!" });
  } catch (err) {
    console.error("Database Error:", err);
    res.status(500).json({ message: "Server error. Please try again later." });
  }
});

// Start Server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
