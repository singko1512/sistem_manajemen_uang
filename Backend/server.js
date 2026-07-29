const express = require('express');
const cors = require('cors');
const crypto = require('crypto');
const db = require('./db');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;
const SECRET = process.env.JWT_SECRET || 'tangled-treasury-super-secret-key-12345';

app.use(cors());
app.use(express.json());

// ----------------------------------------------------
// NATIVE JWT UTILITIES (HMAC SHA-256)
// ----------------------------------------------------
function base64url(str) {
  return Buffer.from(str).toString('base64')
    .replace(/=/g, '')
    .replace(/\+/g, '-')
    .replace(/\//g, '_');
}

function base64urlDecode(str) {
  let base64 = str.replace(/-/g, '+').replace(/_/g, '/');
  while (base64.length % 4) {
    base64 += '=';
  }
  return Buffer.from(base64, 'base64').toString('utf8');
}

function generateToken(payload) {
  const header = JSON.stringify({ alg: 'HS256', typ: 'JWT' });
  const encodedHeader = base64url(header);
  const encodedPayload = base64url(JSON.stringify(payload));
  const signature = crypto.createHmac('sha256', SECRET)
    .update(encodedHeader + '.' + encodedPayload)
    .digest('base64')
    .replace(/=/g, '')
    .replace(/\+/g, '-')
    .replace(/\//g, '_');
  return `${encodedHeader}.${encodedPayload}.${signature}`;
}

function verifyToken(token) {
  try {
    const parts = token.split('.');
    if (parts.length !== 3) return null;
    const [header, payload, signature] = parts;
    const expectedSignature = crypto.createHmac('sha256', SECRET)
      .update(header + '.' + payload)
      .digest('base64')
      .replace(/=/g, '')
      .replace(/\+/g, '-')
      .replace(/\//g, '_');
    if (signature !== expectedSignature) return null;
    
    const decodedPayload = JSON.parse(base64urlDecode(payload));
    if (decodedPayload.exp && Date.now() > decodedPayload.exp) {
      return null; // Expired
    }
    return decodedPayload;
  } catch (err) {
    return null;
  }
}

// ----------------------------------------------------
// AUTHENTICATION MIDDLEWARE
// ----------------------------------------------------
function authenticateAdmin(req, res, next) {
  const authHeader = req.headers['authorization'];
  if (!authHeader) {
    return res.status(401).json({ error: "Akses ditolak. Token tidak disediakan." });
  }
  
  const token = authHeader.split(' ')[1];
  if (!token) {
    return res.status(401).json({ error: "Format token tidak valid." });
  }
  
  const decoded = verifyToken(token);
  if (!decoded || decoded.role !== 'admin') {
    return res.status(403).json({ error: "Sesi admin tidak valid atau kedaluwarsa." });
  }
  
  req.user = decoded;
  next();
}

// ----------------------------------------------------
// AUTHENTICATION ROUTE
// ----------------------------------------------------
app.post('/api/auth/login', (req, res) => {
  const { username, password } = req.body;
  const adminUser = process.env.ADMIN_USERNAME || 'admin';
  const adminPass = process.env.ADMIN_PASSWORD || 'bendahara123';
  
  if (username === adminUser && password === adminPass) {
    // Session token expires in 2 hours
    const token = generateToken({ 
      username, 
      role: 'admin', 
      exp: Date.now() + 2 * 60 * 60 * 1000 
    });
    res.json({ token, message: "Login berhasil! Sesi admin aktif selama 2 jam. ✨" });
  } else {
    res.status(401).json({ error: "Username atau password salah." });
  }
});

// ----------------------------------------------------
// PUBLIC ROUTES (READ ONLY)
// ----------------------------------------------------

// 1. GET ALL STUDENTS
app.get('/api/students', async (req, res) => {
  try {
    const students = await db.getStudents();
    res.json(students);
  } catch (err) {
    console.error("Error fetching students:", err);
    res.status(500).json({ error: err.message });
  }
});

// 2. GET ALL PERIODS
app.get('/api/periods', async (req, res) => {
  try {
    const periods = await db.getPeriods();
    res.json(periods);
  } catch (err) {
    console.error("Error fetching periods:", err);
    res.status(500).json({ error: err.message });
  }
});

// 3. GET PAYMENTS FOR PERIOD
app.get('/api/payments/:periodId', async (req, res) => {
  const { periodId } = req.params;
  try {
    const payments = await db.getStudentPayments(periodId);
    res.json(payments);
  } catch (err) {
    console.error("Error fetching payments:", err);
    res.status(500).json({ error: err.message });
  }
});

// 4. GET TRANSACTIONS FOR PERIOD (with running balance)
app.get('/api/transactions/:periodId', async (req, res) => {
  const { periodId } = req.params;
  try {
    const txs = await db.getTransactions(periodId);
    res.json(txs);
  } catch (err) {
    console.error("Error fetching transactions:", err);
    res.status(500).json({ error: err.message });
  }
});

// 5. GET SUMMARY FOR PERIOD
app.get('/api/summary/:periodId', async (req, res) => {
  const { periodId } = req.params;
  try {
    const summary = await db.getSummary(periodId);
    res.json(summary);
  } catch (err) {
    console.error("Error fetching summary:", err);
    res.status(500).json({ error: err.message });
  }
});

// 6. GET FULL REPORT (Yearly / 2 Semesters)
app.get('/api/reports/all', async (req, res) => {
  try {
    const reports = await db.getFullReport();
    res.json(reports);
  } catch (err) {
    console.error("Error fetching full report:", err);
    res.status(500).json({ error: err.message });
  }
});

// ----------------------------------------------------
// PROTECTED ROUTES (WRITE / MODIFY)
// ----------------------------------------------------

// 7. SET ACTIVE PERIOD
app.post('/api/periods/active', authenticateAdmin, async (req, res) => {
  const { periodId } = req.body;
  try {
    await db.setActivePeriod(periodId);
    const periods = await db.getPeriods();
    res.json({ message: "Active period updated", periods });
  } catch (err) {
    console.error("Error setting active period:", err);
    res.status(500).json({ error: err.message });
  }
});

// 8. UPDATE PERIOD DATA (Initial Balance / Cash Breakdown)
app.put('/api/periods/:id', authenticateAdmin, async (req, res) => {
  const { id } = req.params;
  const { initialBalance, cashAmount, eWalletAmount } = req.body;
  try {
    await db.updatePeriod(id, initialBalance, cashAmount, eWalletAmount);
    res.json({ message: "Period updated successfully" });
  } catch (err) {
    console.error("Error updating period:", err);
    res.status(500).json({ error: err.message });
  }
});

// 9. TOGGLE PAYMENT CHECKBOX
app.post('/api/payments/toggle', authenticateAdmin, async (req, res) => {
  const { studentId, periodId, weekIndex } = req.body; // weekIndex: 1, 2, 3, 4
  if (!studentId || !periodId || !weekIndex) {
    return res.status(400).json({ error: "Missing required fields" });
  }
  
  try {
    await db.togglePayment(studentId, periodId, weekIndex);
    
    // Return the updated student payment record
    const studentPayments = await db.getStudentPayments(periodId);
    const updatedStudent = studentPayments.find(s => s.studentId === studentId);
    
    res.json({ message: "Payment toggled successfully", student: updatedStudent });
  } catch (err) {
    console.error("Error toggling payment:", err);
    res.status(500).json({ error: err.message });
  }
});

// 10. ADD TRANSACTION (Manual)
app.post('/api/transactions', authenticateAdmin, async (req, res) => {
  const { periodId, date, description, type, amount } = req.body;
  if (!periodId || !date || !description || !type || amount === undefined) {
    return res.status(400).json({ error: "Missing required fields" });
  }
  
  try {
    await db.addTransaction(periodId, date, description, type, amount);
    res.json({ message: "Transaction added successfully" });
  } catch (err) {
    console.error("Error adding transaction:", err);
    res.status(500).json({ error: err.message });
  }
});

// 11. DELETE TRANSACTION (Manual only)
app.delete('/api/transactions/:id', authenticateAdmin, async (req, res) => {
  const { id } = req.params;
  try {
    await db.deleteTransaction(id);
    res.json({ message: "Transaction deleted successfully" });
  } catch (err) {
    console.error("Error deleting transaction:", err);
    res.status(500).json({ error: err.message });
  }
});

// 12. UPDATE CASH BREAKDOWN FOR PERIOD
app.put('/api/summary/:periodId/cash-breakdown', authenticateAdmin, async (req, res) => {
  const { periodId } = req.params;
  const { cashAmount, eWalletAmount } = req.body;
  try {
    await db.updatePeriod(periodId, undefined, cashAmount, eWalletAmount);
    res.json({
      message: "Cash breakdown updated successfully",
      cashAmount,
      eWalletAmount
    });
  } catch (err) {
    console.error("Error updating cash breakdown:", err);
    res.status(500).json({ error: err.message });
  }
});

// 13. RESET TO SEED STATE
app.post('/api/reset', authenticateAdmin, async (req, res) => {
  try {
    await db.seedDB();
    const periods = await db.getPeriods();
    res.json({ message: "Database has been reset to seed data successfully", db: { periods } });
  } catch (err) {
    console.error("Error resetting database:", err);
    res.status(500).json({ error: err.message });
  }
});

// Bootstrapping and Initializing Database
async function startServer() {
  try {
    // Initialize MySQL schemas or JSON fallback db
    await db.initDB();
    
    app.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
    });
  } catch (err) {
    console.error("Database connection failed. Express server could not start:", err);
    process.exit(1);
  }
}

startServer();
