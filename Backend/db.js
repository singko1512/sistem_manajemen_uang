const mysql = require('mysql2/promise');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

const jsonFilePath = path.join(__dirname, 'db.json');

let pool = null;
let useMySQL = true;

// Try to create MySQL pool
try {
  if (process.env.DATABASE_URL) {
    pool = mysql.createPool(process.env.DATABASE_URL);
  } else {
    pool = mysql.createPool({
      host: process.env.DB_HOST || '127.0.0.1',
      port: process.env.DB_PORT || 3306,
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD !== undefined ? process.env.DB_PASSWORD : '',
      database: process.env.DB_NAME || 'db_manajemen_uang',
      waitForConnections: true,
      connectionLimit: 5,
      queueLimit: 0,
      connectTimeout: 2000 // 2 seconds
    });
  }
} catch (e) {
  console.warn("MySQL pool creation failed, using JSON fallback:", e.message);
  useMySQL = false;
}

const initialStudents = [
  "ALIZA NUR CAHYA", "CHRISTIAN RAMADHAN", "DANELA HERAWATI", "DEBI TALITA JASMIN",
  "FITRAH SAUMIL AKMAL", "KHAIRUNISA AULIA", "KHOERUL ANAM", "M. KHAIDAR MUHARAM",
  "M. ROSAN RIZQINA MUNAJAT", "M.RIZKY RAHMATULLAH", "MARSYA MAULIDINA", "MAULIDA MARVA KUSUMA",
  "MOETIA BALQIS", "MUHAMAD FARDAN NURKHOLIK", "MUHAMMAD FAIZ FACHRIZA", "MUTIARA KASIH",
  "NATASYA SEPTIANI MAULIDAH", "NURAULIA ZIKRA JALIL", "NURSITI NAFISA", "RATU BALQIS",
  "RARA DERINA", "REVA LIA PUTRI", "SELVI SELVIANI", "SITI ANISA BASRI",
  "SITI FATMAH", "SITI HARDIANTI FAZRIAH K", "SITI NAPISAH JULPAH", "SITI NURUL ALFIAH",
  "SITI ZAHRA HAERUNISA", "SUSI RAHMAWATI", "VERLITA KHANZA AFIFA DIANDRAP", "VIVI JULIANTI",
  "WINDI SAHARA", "YARID NURMANSYAH"
];

// Helper: Get transaction date based on period and week index
function getWeekDate(periodId, weekIndex) {
  try {
    const parts = periodId.split('-');
    if (parts.length < 2) return '2026-07-07';
    const monthName = parts[0];
    const yearStr = parts[1];
    const months = {
      januari: '01', februari: '02', maret: '03', april: '04', mei: '05', juni: '06',
      juli: '07', agustus: '08', september: '09', oktober: '10', november: '11', desember: '12'
    };
    const monthStr = months[monthName.toLowerCase()] || '07';
    const dayStr = String(weekIndex * 7).padStart(2, '0');
    return `${yearStr}-${monthStr}-${dayStr}`;
  } catch (err) {
    return '2026-07-07';
  }
}

// Helper: Sort list of periods chronologically
function sortPeriodsChronologically(list) {
  const monthOrder = {
    'januari': 1, 'februari': 2, 'maret': 3, 'april': 4,
    'mei': 5, 'juni': 6, 'juli': 7, 'agustus': 8,
    'september': 9, 'oktober': 10, 'november': 11, 'desember': 12
  };
  return list.sort((a, b) => {
    const idA = a.id || a.periodId || '';
    const idB = b.id || b.periodId || '';
    const aParts = idA.split('-');
    const bParts = idB.split('-');
    const aYear = parseInt(aParts[1]) || 0;
    const bYear = parseInt(bParts[1]) || 0;
    const aMonth = monthOrder[aParts[0]] || 0;
    const bMonth = monthOrder[bParts[0]] || 0;
    
    const aVal = aYear * 12 + aMonth;
    const bVal = bYear * 12 + bMonth;
    return aVal - bVal;
  });
}

// ----------------------------------------------------
// JSON FILE DATABASE BACKUP API
// ----------------------------------------------------
function readJSON() {
  try {
    if (!fs.existsSync(jsonFilePath)) {
      const data = getSeedJSONData();
      fs.writeFileSync(jsonFilePath, JSON.stringify(data, null, 2), 'utf8');
      return data;
    }
    const fileContent = fs.readFileSync(jsonFilePath, 'utf8');
    return JSON.parse(fileContent);
  } catch (e) {
    console.error("Error reading JSON file db:", e);
    return getSeedJSONData();
  }
}

function writeJSON(data) {
  try {
    fs.writeFileSync(jsonFilePath, JSON.stringify(data, null, 2), 'utf8');
  } catch (e) {
    console.error("Error writing JSON file db:", e);
  }
}

function getSeedJSONData() {
  const students = initialStudents.map((name, index) => {
    const id = `S${String(index + 1).padStart(2, '0')}`;
    return { id, name };
  });

  const periods = [
    { id: 'agustus-2026', name: 'Agustus 2026', active: true, initialBalance: 0, cashAmount: 0, eWalletAmount: 0 },
    { id: 'september-2026', name: 'September 2026', active: false, initialBalance: 0, cashAmount: 0, eWalletAmount: 0 },
    { id: 'oktober-2026', name: 'Oktober 2026', active: false, initialBalance: 0, cashAmount: 0, eWalletAmount: 0 },
    { id: 'november-2026', name: 'November 2026', active: false, initialBalance: 0, cashAmount: 0, eWalletAmount: 0 },
    { id: 'desember-2026', name: 'Desember 2026', active: false, initialBalance: 0, cashAmount: 0, eWalletAmount: 0 },
    { id: 'januari-2027', name: 'Januari 2027', active: false, initialBalance: 0, cashAmount: 0, eWalletAmount: 0 },
    { id: 'februari-2027', name: 'Februari 2027', active: false, initialBalance: 0, cashAmount: 0, eWalletAmount: 0 },
    { id: 'maret-2027', name: 'Maret 2027', active: false, initialBalance: 0, cashAmount: 0, eWalletAmount: 0 },
    { id: 'april-2027', name: 'April 2027', active: false, initialBalance: 0, cashAmount: 0, eWalletAmount: 0 },
    { id: 'mei-2027', name: 'Mei 2027', active: false, initialBalance: 0, cashAmount: 0, eWalletAmount: 0 },
    { id: 'juni-2027', name: 'Juni 2027', active: false, initialBalance: 0, cashAmount: 0, eWalletAmount: 0 },
    { id: 'juli-2027', name: 'Juli 2027', active: false, initialBalance: 0, cashAmount: 0, eWalletAmount: 0 }
  ];

  const payments = [];
  periods.forEach(p => {
    students.forEach(s => {
      payments.push({
        id: `${p.id}-${s.id}`,
        studentId: s.id,
        periodId: p.id,
        week1: false,
        week2: false,
        week3: false,
        week4: false
      });
    });
  });

  const transactions = [];

  return { students, periods, payments, transactions };
}

function syncWeeklyFeeTransactionsJSON(data, periodId) {
  const period = data.periods.find(p => p.id === periodId) || { weeklyFee: 2000 };
  const weeklyFee = period.weeklyFee !== undefined ? period.weeklyFee : 2000;
  for (let w = 1; w <= 4; w++) {
    const weekKey = `week${w}`;
    const paidCount = data.payments.filter(p => p.periodId === periodId && p[weekKey] === true).length;
    const txId = `tx-auto-${periodId}-w${w}`;
    const txIdx = data.transactions.findIndex(t => t.id === txId);

    if (paidCount > 0) {
      const amount = paidCount * weeklyFee;
      const description = `Total Iuran Minggu ${w} (${paidCount} Siswa)`;
      const date = getWeekDate(periodId, w);
      const autoTx = {
        id: txId,
        periodId,
        date,
        description,
        type: 'pemasukan',
        amount,
        isAuto: true,
        weekIndex: w
      };

      if (txIdx > -1) {
        data.transactions[txIdx] = autoTx;
      } else {
        data.transactions.push(autoTx);
      }
    } else {
      if (txIdx > -1) {
        data.transactions.splice(txIdx, 1);
      }
    }
  }
}

// ----------------------------------------------------
// DATABASE INITIALIZATION API
// ----------------------------------------------------
async function initDB() {
  if (!useMySQL) {
    console.log("MySQL is offline. Running with JSON File DB fallback.");
    readJSON();
    return;
  }

  try {
    const connection = await pool.getConnection();
    connection.release();
    console.log("Connected to MySQL successfully!");
  } catch (err) {
    console.warn("Could not connect to MySQL server. Falling back to local JSON database.");
    useMySQL = false;
    readJSON();
    return;
  }

  // Initialize MySQL Schema
  await pool.query(`
    CREATE TABLE IF NOT EXISTS students (
      id VARCHAR(10) PRIMARY KEY,
      name VARCHAR(100) NOT NULL
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
  `);

  await pool.query(`
    CREATE TABLE IF NOT EXISTS periods (
      id VARCHAR(50) PRIMARY KEY,
      name VARCHAR(50) NOT NULL,
      active TINYINT(1) DEFAULT 0,
      initial_balance INT DEFAULT 0,
      cash_amount INT DEFAULT 0,
      e_wallet_amount INT DEFAULT 0,
      weekly_fee INT DEFAULT 2000
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
  `);

  try {
    await pool.query('ALTER TABLE periods ADD COLUMN weekly_fee INT DEFAULT 2000');
  } catch (err) {
    // Column already exists, ignore
  }

  await pool.query(`
    CREATE TABLE IF NOT EXISTS payments (
      id VARCHAR(60) PRIMARY KEY,
      student_id VARCHAR(10) NOT NULL,
      period_id VARCHAR(50) NOT NULL,
      week1 TINYINT(1) DEFAULT 0,
      week2 TINYINT(1) DEFAULT 0,
      week3 TINYINT(1) DEFAULT 0,
      week4 TINYINT(1) DEFAULT 0,
      FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE,
      FOREIGN KEY (period_id) REFERENCES periods(id) ON DELETE CASCADE
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
  `);

  await pool.query(`
    CREATE TABLE IF NOT EXISTS transactions (
      id VARCHAR(50) PRIMARY KEY,
      period_id VARCHAR(50) NOT NULL,
      date DATE NOT NULL,
      description VARCHAR(255) NOT NULL,
      type ENUM('pemasukan', 'pengeluaran') NOT NULL,
      amount INT NOT NULL,
      is_auto TINYINT(1) DEFAULT 0,
      week_index INT DEFAULT NULL,
      FOREIGN KEY (period_id) REFERENCES periods(id) ON DELETE CASCADE
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
  `);

  // Check seed
  const [rows] = await pool.query('SELECT COUNT(*) AS cnt FROM students');
  if (rows[0].cnt === 0) {
    console.log("Seeding MySQL database with default values...");
    await seedDB();
  } else {
    console.log("Database tables verified. No seeding required.");
  }
}

async function seedDB() {
  if (!useMySQL) {
    const data = getSeedJSONData();
    writeJSON(data);
    console.log("JSON Database reset to seed data!");
    return;
  }

  await pool.query('SET FOREIGN_KEY_CHECKS = 0');
  await pool.query('TRUNCATE TABLE payments');
  await pool.query('TRUNCATE TABLE transactions');
  await pool.query('TRUNCATE TABLE periods');
  await pool.query('TRUNCATE TABLE students');
  await pool.query('SET FOREIGN_KEY_CHECKS = 1');

  // Insert students
  const students = initialStudents.map((name, index) => {
    const id = `S${String(index + 1).padStart(2, '0')}`;
    return [id, name];
  });
  await pool.query('INSERT INTO students (id, name) VALUES ?', [students]);

  // Insert periods
  const periods = [
    ['agustus-2026', 'Agustus 2026', 1, 0, 0, 0],
    ['september-2026', 'September 2026', 0, 0, 0, 0],
    ['oktober-2026', 'Oktober 2026', 0, 0, 0, 0],
    ['november-2026', 'November 2026', 0, 0, 0, 0],
    ['desember-2026', 'Desember 2026', 0, 0, 0, 0],
    ['januari-2027', 'Januari 2027', 0, 0, 0, 0],
    ['februari-2027', 'Februari 2027', 0, 0, 0, 0],
    ['maret-2027', 'Maret 2027', 0, 0, 0, 0],
    ['april-2027', 'April 2027', 0, 0, 0, 0],
    ['mei-2027', 'Mei 2027', 0, 0, 0, 0],
    ['juni-2027', 'Juni 2027', 0, 0, 0, 0],
    ['juli-2027', 'Juli 2027', 0, 0, 0, 0]
  ];
  await pool.query('INSERT INTO periods (id, name, active, initial_balance, cash_amount, e_wallet_amount) VALUES ?', [periods]);

  // Seed payments (all false)
  const paymentValues = [];
  periods.forEach(p => {
    const pId = p[0];
    students.forEach(s => {
      const sId = s[0];
      paymentValues.push([
        `${pId}-${sId}`,
        sId,
        pId,
        0,
        0,
        0,
        0
      ]);
    });
  });
  await pool.query('INSERT INTO payments (id, student_id, period_id, week1, week2, week3, week4) VALUES ?', [paymentValues]);
  console.log("MySQL Seeding complete!");
}

async function syncWeeklyFeeTransactions(periodId) {
  const [periodRows] = await pool.query('SELECT weekly_fee FROM periods WHERE id = ?', [periodId]);
  const weeklyFee = periodRows.length > 0 ? (periodRows[0].weekly_fee !== null ? periodRows[0].weekly_fee : 2000) : 2000;
  for (let w = 1; w <= 4; w++) {
    const weekKey = `week${w}`;
    const [countRows] = await pool.query(
      `SELECT COUNT(*) AS paidCount FROM payments WHERE period_id = ? AND ${weekKey} = 1`,
      [periodId]
    );
    const paidCount = countRows[0].paidCount;
    const txId = `tx-auto-${periodId}-w${w}`;
    
    if (paidCount > 0) {
      const amount = paidCount * weeklyFee;
      const description = `Total Iuran Minggu ${w} (${paidCount} Siswa)`;
      const date = getWeekDate(periodId, w);
      const [txExists] = await pool.query('SELECT id FROM transactions WHERE id = ?', [txId]);
      
      if (txExists.length > 0) {
        await pool.query(
          'UPDATE transactions SET amount = ?, description = ?, date = ? WHERE id = ?',
          [amount, description, date, txId]
        );
      } else {
        await pool.query(
          'INSERT INTO transactions (id, period_id, date, description, type, amount, is_auto, week_index) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
          [txId, periodId, date, description, 'pemasukan', amount, 1, w]
        );
      }
    } else {
      await pool.query('DELETE FROM transactions WHERE id = ? AND is_auto = 1', [txId]);
    }
  }
}

// ----------------------------------------------------
// EXPORTED CORE DATABASE METHODS
// ----------------------------------------------------
module.exports = {
  pool,
  initDB,
  seedDB,
  
  getStudents: async () => {
    if (!useMySQL) {
      const data = readJSON();
      return data.students;
    }
    const [rows] = await pool.query('SELECT * FROM students ORDER BY id');
    return rows;
  },

  getPeriods: async () => {
    if (!useMySQL) {
      const data = readJSON();
      const list = data.periods.map(r => ({
        id: r.id,
        name: r.name,
        active: !!r.active,
        initialBalance: r.initialBalance,
        cashAmount: r.cashAmount,
        eWalletAmount: r.eWalletAmount,
        weeklyFee: r.weeklyFee !== undefined ? r.weeklyFee : 2000
      }));
      return sortPeriodsChronologically(list);
    }
    const [rows] = await pool.query('SELECT * FROM periods');
    const list = rows.map(r => ({
      id: r.id,
      name: r.name,
      active: !!r.active,
      initialBalance: r.initial_balance,
      cashAmount: r.cash_amount,
      eWalletAmount: r.e_wallet_amount,
      weeklyFee: r.weekly_fee !== null ? r.weekly_fee : 2000
    }));
    return sortPeriodsChronologically(list);
  },

  setActivePeriod: async (periodId) => {
    if (!useMySQL) {
      const data = readJSON();
      data.periods.forEach(p => {
        p.active = (p.id === periodId);
      });
      writeJSON(data);
      return;
    }
    await pool.query('UPDATE periods SET active = 0');
    await pool.query('UPDATE periods SET active = 1 WHERE id = ?', [periodId]);
  },

  updatePeriod: async (id, initialBalance, cashAmount, eWalletAmount, weeklyFee) => {
    if (!useMySQL) {
      const data = readJSON();
      const pIdx = data.periods.findIndex(p => p.id === id);
      if (pIdx > -1) {
        if (initialBalance !== undefined) data.periods[pIdx].initialBalance = Number(initialBalance);
        if (cashAmount !== undefined) data.periods[pIdx].cashAmount = Number(cashAmount);
        if (eWalletAmount !== undefined) data.periods[pIdx].eWalletAmount = Number(eWalletAmount);
        if (weeklyFee !== undefined) data.periods[pIdx].weeklyFee = Number(weeklyFee);
      }
      writeJSON(data);
      return;
    }

    const updates = [];
    const params = [];
    if (initialBalance !== undefined) {
      updates.push('initial_balance = ?');
      params.push(Number(initialBalance));
    }
    if (cashAmount !== undefined) {
      updates.push('cash_amount = ?');
      params.push(Number(cashAmount));
    }
    if (eWalletAmount !== undefined) {
      updates.push('e_wallet_amount = ?');
      params.push(Number(eWalletAmount));
    }
    if (weeklyFee !== undefined) {
      updates.push('weekly_fee = ?');
      params.push(Number(weeklyFee));
    }
    
    if (updates.length === 0) return;
    params.push(id);
    await pool.query(`UPDATE periods SET ${updates.join(', ')} WHERE id = ?`, params);
  },

  getStudentPayments: async (periodId) => {
    if (!useMySQL) {
      const data = readJSON();
      const period = data.periods.find(p => p.id === periodId) || { weeklyFee: 2000 };
      const weeklyFee = period.weeklyFee !== undefined ? period.weeklyFee : 2000;
      const periodPayments = data.payments.filter(p => p.periodId === periodId);
      
      return data.students.map(s => {
        const pay = periodPayments.find(p => p.studentId === s.id) || {
          week1: false, week2: false, week3: false, week4: false
        };
        const w1 = pay.week1 ? 1 : 0;
        const w2 = pay.week2 ? 1 : 0;
        const w3 = pay.week3 ? 1 : 0;
        const w4 = pay.week4 ? 1 : 0;
        
        const totalPaid = (w1 + w2 + w3 + w4) * weeklyFee;
        const debt = (weeklyFee * 4) - totalPaid;
        
        return {
          studentId: s.id,
          name: s.name,
          week1: !!pay.week1,
          week2: !!pay.week2,
          week3: !!pay.week3,
          week4: !!pay.week4,
          totalPaid,
          status: debt === 0 ? "Lunas" : `Tunggakan Rp ${debt.toLocaleString('id-ID')}`
        };
      });
    }

    const [periodRows] = await pool.query('SELECT weekly_fee FROM periods WHERE id = ?', [periodId]);
    const weeklyFee = periodRows.length > 0 ? (periodRows[0].weekly_fee !== null ? periodRows[0].weekly_fee : 2000) : 2000;

    const [rows] = await pool.query(`
      SELECT 
        s.id AS studentId,
        s.name,
        p.week1,
        p.week2,
        p.week3,
        p.week4
      FROM students s
      LEFT JOIN payments p ON s.id = p.student_id AND p.period_id = ?
      ORDER BY s.id
    `, [periodId]);
    
    return rows.map(r => {
      const w1 = r.week1 ? 1 : 0;
      const w2 = r.week2 ? 1 : 0;
      const w3 = r.week3 ? 1 : 0;
      const w4 = r.week4 ? 1 : 0;
      const totalPaid = (w1 + w2 + w3 + w4) * weeklyFee;
      const debt = (weeklyFee * 4) - totalPaid;
      
      return {
        studentId: r.studentId,
        name: r.name,
        week1: !!r.week1,
        week2: !!r.week2,
        week3: !!r.week3,
        week4: !!r.week4,
        totalPaid,
        status: debt === 0 ? "Lunas" : `Tunggakan Rp ${debt.toLocaleString('id-ID')}`
      };
    });
  },

  togglePayment: async (studentId, periodId, weekIndex) => {
    if (!useMySQL) {
      const data = readJSON();
      const pIdx = data.payments.findIndex(p => p.studentId === studentId && p.periodId === periodId);
      const weekKey = `week${weekIndex}`;
      
      if (pIdx > -1) {
        data.payments[pIdx][weekKey] = !data.payments[pIdx][weekKey];
      } else {
        const newPay = {
          id: `${periodId}-${studentId}`,
          studentId,
          periodId,
          week1: weekIndex === 1,
          week2: weekIndex === 2,
          week3: weekIndex === 3,
          week4: weekIndex === 4
        };
        data.payments.push(newPay);
      }
      
      syncWeeklyFeeTransactionsJSON(data, periodId);
      writeJSON(data);
      return;
    }

    const [exists] = await pool.query(
      'SELECT id, week1, week2, week3, week4 FROM payments WHERE student_id = ? AND period_id = ?',
      [studentId, periodId]
    );
    const weekKey = `week${weekIndex}`;
    
    if (exists.length > 0) {
      const newVal = exists[0][weekKey] ? 0 : 1;
      await pool.query(
        `UPDATE payments SET ${weekKey} = ? WHERE student_id = ? AND period_id = ?`,
        [newVal, studentId, periodId]
      );
    } else {
      const weekVals = { week1: 0, week2: 0, week3: 0, week4: 0 };
      weekVals[weekKey] = 1;
      await pool.query(
        'INSERT INTO payments (id, student_id, period_id, week1, week2, week3, week4) VALUES (?, ?, ?, ?, ?, ?, ?)',
        [`${periodId}-${studentId}`, studentId, periodId, weekVals.week1, weekVals.week2, weekVals.week3, weekVals.week4]
      );
    }
    
    await syncWeeklyFeeTransactions(periodId);
  },

  getTransactions: async (periodId) => {
    if (!useMySQL) {
      const data = readJSON();
      const periodObj = data.periods.find(p => p.id === periodId) || { initialBalance: 0 };
      const txs = data.transactions.filter(t => t.periodId === periodId);
      
      // Sort by date, then id
      txs.sort((a, b) => a.date.localeCompare(b.date) || a.id.localeCompare(b.id));
      
      let balance = periodObj.initialBalance;
      return txs.map(tx => {
        if (tx.type === 'pemasukan') balance += tx.amount;
        else balance -= tx.amount;
        return {
          id: tx.id,
          periodId: tx.periodId,
          date: tx.date,
          description: tx.description,
          type: tx.type,
          amount: tx.amount,
          isAuto: !!tx.isAuto,
          weekIndex: tx.weekIndex,
          balance
        };
      });
    }

    const [periodRows] = await pool.query('SELECT initial_balance FROM periods WHERE id = ?', [periodId]);
    if (periodRows.length === 0) return [];
    const initialBalance = periodRows[0].initial_balance;
    
    const [txRows] = await pool.query(
      'SELECT * FROM transactions WHERE period_id = ? ORDER BY date, id',
      [periodId]
    );
    
    let currentBalance = initialBalance;
    return txRows.map(tx => {
      const amt = tx.amount;
      if (tx.type === 'pemasukan') {
        currentBalance += amt;
      } else {
        currentBalance -= amt;
      }
      return {
        id: tx.id,
        periodId: tx.period_id,
        date: tx.date.toISOString().split('T')[0],
        description: tx.description,
        type: tx.type,
        amount: amt,
        isAuto: !!tx.is_auto,
        weekIndex: tx.week_index,
        balance: currentBalance
      };
    });
  },

  addTransaction: async (periodId, date, description, type, amount) => {
    if (!useMySQL) {
      const data = readJSON();
      data.transactions.push({
        id: `tx-manual-${Date.now()}`,
        periodId,
        date,
        description,
        type,
        amount: Number(amount),
        isAuto: false,
        weekIndex: null
      });
      writeJSON(data);
      return;
    }

    const id = `tx-manual-${Date.now()}`;
    await pool.query(
      'INSERT INTO transactions (id, period_id, date, description, type, amount, is_auto, week_index) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
      [id, periodId, date, description, type, Number(amount), 0, null]
    );
  },

  deleteTransaction: async (id) => {
    if (!useMySQL) {
      const data = readJSON();
      const idx = data.transactions.findIndex(t => t.id === id && !t.isAuto);
      if (idx > -1) {
        data.transactions.splice(idx, 1);
        writeJSON(data);
      }
      return;
    }
    await pool.query('DELETE FROM transactions WHERE id = ? AND is_auto = 0', [id]);
  },

  getSummary: async (periodId) => {
    if (!useMySQL) {
      const data = readJSON();
      const period = data.periods.find(p => p.id === periodId);
      if (!period) throw new Error("Period not found");

      const txs = data.transactions.filter(t => t.periodId === periodId);
      let totalPemasukan = 0;
      let totalPengeluaran = 0;
      txs.forEach(t => {
        if (t.type === 'pemasukan') totalPemasukan += t.amount;
        else totalPengeluaran += t.amount;
      });

      const endingBalance = period.initialBalance + totalPemasukan - totalPengeluaran;
      return {
        periodId: period.id,
        periodName: period.name,
        initialBalance: period.initialBalance,
        totalPemasukan,
        totalPengeluaran,
        endingBalance,
        cashAmount: period.cashAmount,
        eWalletAmount: period.eWalletAmount
      };
    }

    const [pRows] = await pool.query('SELECT * FROM periods WHERE id = ?', [periodId]);
    if (pRows.length === 0) throw new Error("Period not found");
    const period = pRows[0];
    const [txs] = await pool.query('SELECT type, amount FROM transactions WHERE period_id = ?', [periodId]);
    
    let totalPemasukan = 0;
    let totalPengeluaran = 0;
    txs.forEach(t => {
      if (t.type === 'pemasukan') totalPemasukan += t.amount;
      else totalPengeluaran += t.amount;
    });
    
    const endingBalance = period.initial_balance + totalPemasukan - totalPengeluaran;
    return {
      periodId: period.id,
      periodName: period.name,
      initialBalance: period.initial_balance,
      totalPemasukan,
      totalPengeluaran,
      endingBalance,
      cashAmount: period.cash_amount,
      eWalletAmount: period.e_wallet_amount
    };
  },

  getFullReport: async () => {
    if (!useMySQL) {
      const data = readJSON();
      const sortedPeriods = sortPeriodsChronologically(data.periods);
      const reports = [];
      for (let p of sortedPeriods) {
        const txs = data.transactions.filter(t => t.periodId === p.id);
        let totalPemasukan = 0;
        let totalPengeluaran = 0;
        txs.forEach(t => {
          if (t.type === 'pemasukan') totalPemasukan += t.amount;
          else totalPengeluaran += t.amount;
        });
        const endingBalance = p.initialBalance + totalPemasukan - totalPengeluaran;
        reports.push({
          periodId: p.id,
          name: p.name,
          initialBalance: p.initialBalance,
          totalPemasukan,
          totalPengeluaran,
          endingBalance,
          cashAmount: p.cashAmount,
          eWalletAmount: p.eWalletAmount,
          active: !!p.active
        });
      }
      return reports;
    }

    const [periods] = await pool.query('SELECT * FROM periods');
    const sortedPeriods = sortPeriodsChronologically(periods);
    const reports = [];
    for (let p of sortedPeriods) {
      const [txs] = await pool.query('SELECT type, amount FROM transactions WHERE period_id = ?', [p.id]);
      let totalPemasukan = 0;
      let totalPengeluaran = 0;
      txs.forEach(t => {
        if (t.type === 'pemasukan') totalPemasukan += t.amount;
        else totalPengeluaran += t.amount;
      });
      const endingBalance = p.initial_balance + totalPemasukan - totalPengeluaran;
      reports.push({
        periodId: p.id,
        name: p.name,
        initialBalance: p.initial_balance,
        totalPemasukan,
        totalPengeluaran,
        endingBalance,
        cashAmount: p.cash_amount,
        eWalletAmount: p.e_wallet_amount,
        active: !!p.active
      });
    }
    return reports;
  }
};
