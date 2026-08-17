import React, { useState, useEffect, useRef } from 'react';
import { 
  Coins, Plus, Trash2, Calendar, 
  Search, ArrowUpCircle, ArrowDownCircle, 
  RefreshCw, Wallet, FileText, Check, AlertCircle, 
  Lock, LogOut, X
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

// Seed data definition for frontend offline fallback
const INITIAL_STUDENTS = [
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

const OFFLINE_PERIODS = [
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

const getOfflineInitialData = () => {
  const students = INITIAL_STUDENTS.map((name, idx) => ({
    id: `S${String(idx + 1).padStart(2, '0')}`,
    name
  }));

  const payments = [];
  OFFLINE_PERIODS.forEach(p => {
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

  return { students, periods: OFFLINE_PERIODS, payments, transactions, weeklyFee: 2000 };
};

const API_BASE = 'http://localhost:5000/api';

export default function App() {
  const [activeTab, setActiveTab] = useState('tagihan'); // 'tagihan' (public), 'cashflow' (public/admin), 'recap' (admin), 'reports' (admin), 'settings' (admin)
  const [isOffline, setIsOffline] = useState(false);
  const [loading, setLoading] = useState(true);

  // Toast Notification State
  const [toast, setToast] = useState({ show: false, message: '', type: 'success' });
  const toastTimeoutRef = useRef(null);

  const showToast = (message, type = 'success') => {
    if (toastTimeoutRef.current) {
      clearTimeout(toastTimeoutRef.current);
    }
    setToast({ show: true, message, type });
    toastTimeoutRef.current = setTimeout(() => {
      setToast(prev => ({ ...prev, show: false }));
    }, 3000);
  };

  // Authentication State
  const [isAdmin, setIsAdmin] = useState(false);
  const [authToken, setAuthToken] = useState(null);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [loginUsername, setLoginUsername] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [loginError, setLoginError] = useState('');

  // Application Data States
  const [periods, setPeriods] = useState([]);
  const [activePeriod, setActivePeriod] = useState(null);
  const [payments, setPayments] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [summary, setSummary] = useState({
    initialBalance: 0,
    totalPemasukan: 0,
    totalPengeluaran: 0,
    endingBalance: 0,
    cashAmount: 0,
    eWalletAmount: 0
  });

  // UI Search and Filter States
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all'); // 'all', 'lunas', 'debt'
  const [studentSearchQuery, setStudentSearchQuery] = useState('');
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [showAutocompleteDropdown, setShowAutocompleteDropdown] = useState(false);
  const dropdownRef = useRef(null);

  // Transaction Input Form
  const [newTx, setNewTx] = useState({
    date: new Date().toISOString().split('T')[0],
    description: '',
    type: 'pengeluaran',
    amount: '',
    wallet: 'cash'
  });

  // Settings Edit States
  const [editInitialBalance, setEditInitialBalance] = useState('');
  const [editCash, setEditCash] = useState('');
  const [editEWallet, setEditEWallet] = useState('');
  const [editWeeklyFee, setEditWeeklyFee] = useState('');

  // Offline Fallback Local DB Store
  const [offlineDB, setOfflineDB] = useState(null);

  // Helper inside client-side fallback
  function getWeekDate(periodId, weekIndex) {
    try {
      const parts = periodId.split('-');
      if (parts.length < 2) return '2026-08-07';
      const monthName = parts[0];
      const yearStr = parts[1];
      const months = {
        januari: '01', februari: '02', maret: '03', april: '04', mei: '05', juni: '06',
        juli: '07', agustus: '08', september: '09', oktober: '10', november: '11', desember: '12'
      };
      const monthStr = months[monthName.toLowerCase()] || '08';
      const dayStr = String(weekIndex * 7).padStart(2, '0');
      return `${yearStr}-${monthStr}-${dayStr}`;
    } catch {
      return '2026-08-07';
    }
  }

  // Get Auth Headers for backend calls
  const getHeaders = () => {
    const headers = { 'Content-Type': 'application/json' };
    const savedToken = authToken || sessionStorage.getItem('adminToken');
    if (savedToken) {
      headers['Authorization'] = `Bearer ${savedToken}`;
    }
    return headers;
  };

  // Click outside listener for dropdown and check saved token
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowAutocompleteDropdown(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);

    const savedToken = sessionStorage.getItem('adminToken');
    if (savedToken) {
      setAuthToken(savedToken);
      setIsAdmin(true);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // Fetch or setup database on mount
  useEffect(() => {
    checkConnectionAndLoad();
  }, []);

  // Whenever active period changes, reload data
  useEffect(() => {
    if (activePeriod) {
      loadPeriodData(activePeriod.id);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activePeriod, isOffline, authToken]);

  // Sync selected student data on payment updates
  useEffect(() => {
    if (selectedStudent && payments.length > 0) {
      const updated = payments.find(p => p.studentId === selectedStudent.studentId);
      if (updated) {
        setSelectedStudent(updated);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [payments]);

  // Adjust active tab based on role
  useEffect(() => {
    if (isAdmin) {
      if (activeTab === 'tagihan') {
        setActiveTab('recap');
      }
    } else {
      if (activeTab === 'recap' || activeTab === 'reports' || activeTab === 'settings') {
        setActiveTab('tagihan');
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAdmin]);

  const checkConnectionAndLoad = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/periods`);
      if (!res.ok) throw new Error("Server error");
      const periodsData = await res.json();
      
      setPeriods(periodsData);
      const active = periodsData.find(p => p.active) || periodsData[0];
      setActivePeriod(active);
      setIsOffline(false);
    } catch (err) {
      console.warn("Backend unavailable, loading offline mode:", err);
      setIsOffline(true);
      const offline = getOfflineInitialData();
      setOfflineDB(offline);
      setPeriods(offline.periods);
      const active = offline.periods.find(p => p.active) || offline.periods[0];
      setActivePeriod(active);
    }
  };

  const loadPeriodData = async (periodId) => {
    if (!periodId) return;
    setLoading(true);
    
    // Set edit inputs
    const currentPeriodObj = periods.find(p => p.id === periodId);
    if (currentPeriodObj) {
      setEditInitialBalance(currentPeriodObj.initialBalance);
      setEditCash(currentPeriodObj.cashAmount);
      setEditEWallet(currentPeriodObj.eWalletAmount);
      setEditWeeklyFee(currentPeriodObj.weeklyFee || 2000);
    }

    if (!isOffline) {
      try {
        const [payRes, txRes, sumRes] = await Promise.all([
          fetch(`${API_BASE}/payments/${periodId}`),
          fetch(`${API_BASE}/transactions/${periodId}`),
          fetch(`${API_BASE}/summary/${periodId}`)
        ]);

        const payData = await payRes.json();
        const txData = await txRes.json();
        const sumData = await sumRes.json();

        setPayments(payData);
        setTransactions(txData);
        setSummary(sumData);
      } catch (err) {
        console.error("Error loading period data from backend:", err);
        setIsOffline(true);
      } finally {
        setLoading(false);
      }
    } else {
      // Read from Offline Memory DB
      if (offlineDB) {
        const weeklyFee = offlineDB.weeklyFee;
        const periodPayments = offlineDB.payments.filter(p => p.periodId === periodId);
        
        const calculatedPayments = offlineDB.students.map(student => {
          const pay = periodPayments.find(p => p.studentId === student.id) || {
            week1: false, week2: false, week3: false, week4: false
          };
          const count = (pay.week1 ? 1 : 0) + (pay.week2 ? 1 : 0) + (pay.week3 ? 1 : 0) + (pay.week4 ? 1 : 0);
          const totalPaid = count * weeklyFee;
          const debt = 8000 - totalPaid;
          
          return {
            studentId: student.id,
            name: student.name,
            week1: pay.week1,
            week2: pay.week2,
            week3: pay.week3,
            week4: pay.week4,
            totalPaid,
            status: debt === 0 ? "Lunas" : `Tunggakan Rp ${debt.toLocaleString('id-ID')}`
          };
        });

        const period = offlineDB.periods.find(p => p.id === periodId) || { initialBalance: 0, cashAmount: 0, eWalletAmount: 0 };
        const periodTxs = offlineDB.transactions.filter(t => t.periodId === periodId);
        periodTxs.sort((a, b) => a.date.localeCompare(b.date) || a.id.localeCompare(b.id));

        let currentBalance = period.initialBalance;
        const txsWithBalance = periodTxs.map(tx => {
          if (tx.type === 'pemasukan') currentBalance += tx.amount;
          else currentBalance -= tx.amount;
          return { ...tx, balance: currentBalance };
        });

        const totalPemasukan = periodTxs.filter(t => t.type === 'pemasukan').reduce((sum, t) => sum + t.amount, 0);
        const totalPengeluaran = periodTxs.filter(t => t.type === 'pengeluaran').reduce((sum, t) => sum + t.amount, 0);
        const endingBalance = period.initialBalance + totalPemasukan - totalPengeluaran;

        setPayments(calculatedPayments);
        setTransactions(txsWithBalance);
        setSummary({
          periodId,
          periodName: period.name,
          initialBalance: period.initialBalance,
          totalPemasukan,
          totalPengeluaran,
          endingBalance,
          cashAmount: period.cashAmount,
          eWalletAmount: period.eWalletAmount
        });
      }
      setLoading(false);
    }
  };

  // Toggle Checkbox Action (Only active in Admin Mode)
  const handleTogglePayment = async (studentId, weekIndex) => {
    if (!isAdmin) {
      showToast("Akses ditolak. Silakan login sebagai Bendahara terlebih dahulu! 🔒", "error");
      return;
    }

    if (!isOffline) {
      try {
        const res = await fetch(`${API_BASE}/payments/toggle`, {
          method: 'POST',
          headers: getHeaders(),
          body: JSON.stringify({ studentId, periodId: activePeriod.id, weekIndex })
        });
        if (res.ok) {
          loadPeriodData(activePeriod.id);
        } else {
          const err = await res.json();
          showToast(`Gagal: ${err.error || "Gagal mengubah status iuran"}`, "error");
        }
      } catch (err) {
        console.error("Backend error during toggle, switching to offline:", err);
        setIsOffline(true);
      }
    } else {
      // Offline local update
      const updatedDB = { ...offlineDB };
      const paymentIndex = updatedDB.payments.findIndex(
        p => p.studentId === studentId && p.periodId === activePeriod.id
      );

      if (paymentIndex > -1) {
        const key = `week${weekIndex}`;
        updatedDB.payments[paymentIndex][key] = !updatedDB.payments[paymentIndex][key];
      } else {
        const newPayment = {
          id: `${activePeriod.id}-${studentId}`,
          studentId,
          periodId: activePeriod.id,
          week1: weekIndex === 1,
          week2: weekIndex === 2,
          week3: weekIndex === 3,
          week4: weekIndex === 4
        };
        updatedDB.payments.push(newPayment);
      }

      // Sync auto transaction
      const weeklyFee = updatedDB.weeklyFee;
      const periodPayments = updatedDB.payments.filter(p => p.periodId === activePeriod.id);
      
      for (let w = 1; w <= 4; w++) {
        const weekKey = `week${w}`;
        const paidCount = periodPayments.filter(p => p[weekKey] === true).length;
        const txId = `tx-auto-${activePeriod.id}-w${w}`;
        const txIdx = updatedDB.transactions.findIndex(t => t.id === txId);

        if (paidCount > 0) {
          const amount = paidCount * weeklyFee;
          const description = `Total Iuran Minggu ${w} (${paidCount} Siswa)`;
          const date = getWeekDate(activePeriod.id, w);
          const autoTx = {
            id: txId,
            periodId: activePeriod.id,
            date,
            description,
            type: 'pemasukan',
            amount,
            isAuto: true,
            weekIndex: w
          };

          if (txIdx > -1) updatedDB.transactions[txIdx] = autoTx;
          else updatedDB.transactions.push(autoTx);
        } else {
          if (txIdx > -1) updatedDB.transactions.splice(txIdx, 1);
        }
      }

      setOfflineDB(updatedDB);
      setTimeout(() => loadPeriodData(activePeriod.id), 0);
    }
  };

  // Add Custom Transaction
  const handleAddTransaction = async (e) => {
    e.preventDefault();
    if (!newTx.description || !newTx.amount) return;
    if (!isAdmin) {
      showToast("Akses ditolak. Silakan login sebagai bendahara!", "error");
      return;
    }

    if (!isOffline) {
      try {
        const res = await fetch(`${API_BASE}/transactions`, {
          method: 'POST',
          headers: getHeaders(),
          body: JSON.stringify({
            periodId: activePeriod.id,
            date: newTx.date,
            description: newTx.description,
            type: newTx.type,
            amount: Number(newTx.amount)
          })
        });
        if (res.ok) {
          setNewTx({
            date: new Date().toISOString().split('T')[0],
            description: '',
            type: 'pengeluaran',
            amount: '',
            wallet: 'cash'
          });
          loadPeriodData(activePeriod.id);
        } else {
          const err = await res.json();
          showToast(`Gagal: ${err.error}`, "error");
        }
      } catch (err) {
        console.error("Backend error, switching offline:", err);
        setIsOffline(true);
      }
    } else {
      // Offline local add
      const updatedDB = { ...offlineDB };
      updatedDB.transactions.push({
        id: `tx-manual-${Date.now()}`,
        periodId: activePeriod.id,
        date: newTx.date,
        description: newTx.description,
        type: newTx.type,
        amount: Number(newTx.amount),
        isAuto: false
      });
      setOfflineDB(updatedDB);
      setNewTx({
        date: new Date().toISOString().split('T')[0],
        description: '',
        type: 'pengeluaran',
        amount: '',
        wallet: 'cash'
      });
      setTimeout(() => loadPeriodData(activePeriod.id), 0);
    }
  };

  // Delete Transaction
  const handleDeleteTransaction = async (txId) => {
    if (!isAdmin) {
      showToast("Akses ditolak. Anda tidak memiliki otoritas.", "error");
      return;
    }

    if (!isOffline) {
      try {
        const res = await fetch(`${API_BASE}/transactions/${txId}`, {
          method: 'DELETE',
          headers: getHeaders()
        });
        if (res.ok) {
          loadPeriodData(activePeriod.id);
        } else {
          const err = await res.json();
          showToast(`Gagal: ${err.error}`, "error");
        }
      } catch (err) {
        console.error("Backend error, switching offline:", err);
        setIsOffline(true);
      }
    } else {
      // Offline local delete
      const updatedDB = { ...offlineDB };
      const txIndex = updatedDB.transactions.findIndex(t => t.id === txId);
      if (txIndex > -1) {
        updatedDB.transactions.splice(txIndex, 1);
      }
      setOfflineDB(updatedDB);
      setTimeout(() => loadPeriodData(activePeriod.id), 0);
    }
  };

  // Helper to split active period ID into month and year
  const getPeriodParts = (periodId) => {
    if (!periodId) return { month: '', year: '' };
    const parts = periodId.split('-');
    if (parts.length < 2) return { month: '', year: '' };
    return { month: parts[0], year: parts[1] };
  };

  const { month: activeMonth, year: activeYear } = getPeriodParts(activePeriod?.id);
  const availableYears = Array.from(new Set(periods.map(p => p.id.split('-')[1]).filter(Boolean)));

  const handleMonthYearChange = (newMonth, newYear) => {
    const targetId = `${newMonth}-${newYear}`;
    const found = periods.find(p => p.id === targetId);
    if (found) {
      handlePeriodChange(found.id);
    } else {
      const fallback = periods.find(p => p.id.endsWith(`-${newYear}`)) || periods.find(p => p.id.startsWith(`${newMonth}-`));
      if (fallback) {
        handlePeriodChange(fallback.id);
      }
    }
  };

  // Change Active Period
  const handlePeriodChange = async (pId) => {
    const nextPeriod = periods.find(p => p.id === pId);
    if (!nextPeriod) return;

    if (isAdmin && !isOffline) {
      try {
        const res = await fetch(`${API_BASE}/periods/active`, {
          method: 'POST',
          headers: getHeaders(),
          body: JSON.stringify({ periodId: pId })
        });
        if (res.ok) {
          const updatedPeriods = periods.map(p => ({ ...p, active: p.id === pId }));
          setPeriods(updatedPeriods);
          setActivePeriod(nextPeriod);
        } else {
          const err = await res.json();
          showToast(`Gagal: ${err.error}`, "error");
        }
      } catch (err) {
        console.error("Backend error, switching offline:", err);
        setIsOffline(true);
      }
    } else {
      // Offline update or non-admin view local change
      const updatedPeriods = periods.map(p => ({ ...p, active: p.id === pId }));
      setPeriods(updatedPeriods);
      setActivePeriod(nextPeriod);
      if (isOffline && offlineDB) {
        const updatedDB = { ...offlineDB };
        updatedDB.periods = updatedDB.periods.map(p => ({ ...p, active: p.id === pId }));
        setOfflineDB(updatedDB);
      }
    }
  };

  // Update Starting Balance / Cash Breakdown
  const handleUpdateBalances = async (e) => {
    e.preventDefault();
    if (!activePeriod) return;
    if (!isAdmin) {
      showToast("Akses ditolak. Hanya bendahara yang dapat mengubah saldo!", "error");
      return;
    }

    if (!isOffline) {
      try {
        const res = await fetch(`${API_BASE}/periods/${activePeriod.id}`, {
          method: 'PUT',
          headers: getHeaders(),
          body: JSON.stringify({
            initialBalance: Number(editInitialBalance),
            cashAmount: Number(editCash),
            eWalletAmount: Number(editEWallet),
            weeklyFee: Number(editWeeklyFee)
          })
        });
        if (res.ok) {
          const updatedPeriods = periods.map(p => {
            if (p.id === activePeriod.id) {
              return {
                ...p,
                initialBalance: Number(editInitialBalance),
                cashAmount: Number(editCash),
                eWalletAmount: Number(editEWallet),
                weeklyFee: Number(editWeeklyFee)
              };
            }
            return p;
          });
          setPeriods(updatedPeriods);
          loadPeriodData(activePeriod.id);
          showToast("Konfigurasi keuangan berhasil disimpan! ✨", "success");
        } else {
          const err = await res.json();
          showToast(`Gagal: ${err.error}`, "error");
        }
      } catch (err) {
        console.error("Backend error, switching offline:", err);
        setIsOffline(true);
      }
    } else {
      // Offline local update
      const updatedDB = { ...offlineDB };
      const periodIdx = updatedDB.periods.findIndex(p => p.id === activePeriod.id);
      if (periodIdx > -1) {
        updatedDB.periods[periodIdx].initialBalance = Number(editInitialBalance);
        updatedDB.periods[periodIdx].cashAmount = Number(editCash);
        updatedDB.periods[periodIdx].eWalletAmount = Number(editEWallet);
        updatedDB.periods[periodIdx].weeklyFee = Number(editWeeklyFee);
      }
      setOfflineDB(updatedDB);
      setPeriods(updatedDB.periods);
      setTimeout(() => {
        loadPeriodData(activePeriod.id);
        showToast("Konfigurasi keuangan offline berhasil disimpan! ✨", "success");
      }, 0);
    }
  };

  // Reset to Seed
  const handleResetData = async () => {
    if (!window.confirm("Apakah Anda yakin ingin menyetel ulang data ke data awal? Semua modifikasi akan terhapus. 🌸")) return;
    
    if (!isOffline) {
      try {
        const res = await fetch(`${API_BASE}/reset`, { 
          method: 'POST',
          headers: getHeaders()
        });
        if (res.ok) {
          const resData = await res.json();
          setPeriods(resData.db.periods);
          const active = resData.db.periods.find(p => p.active) || resData.db.periods[0];
          setActivePeriod(active);
          showToast("Data berhasil disetel ulang! 💫", "success");
        } else {
          const err = await res.json();
          showToast(`Gagal: ${err.error}`, "error");
        }
      } catch (err) {
        console.error("Backend error during reset:", err);
        showToast("Gagal menghubungi server backend. Setel ulang offline diaktifkan.", "error");
        setIsOffline(true);
      }
    } else {
      // Offline local reset
      const offline = getOfflineInitialData();
      setOfflineDB(offline);
      setPeriods(offline.periods);
      const active = offline.periods.find(p => p.active) || offline.periods[0];
      setActivePeriod(active);
      showToast("Data offline berhasil disetel ulang! 💫", "success");
    }
  };

  // Login handler
  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    setLoginError('');

    if (isOffline) {
      if (loginUsername === 'admin' && loginPassword === 'bendahara180909') {
        setIsAdmin(true);
        setAuthToken('mock-offline-token');
        sessionStorage.setItem('adminToken', 'mock-offline-token');
        setShowLoginModal(false);
        setLoginUsername('');
        setLoginPassword('');
        showToast("Login berhasil (Mode Offline)! Selamat bekerja, Bendahara 🌸", "success");
      } else {
        setLoginError('Username atau password salah.');
      }
      return;
    }

    try {
      const res = await fetch(`${API_BASE}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: loginUsername, password: loginPassword })
      });
      const data = await res.json();

      if (res.ok) {
        setIsAdmin(true);
        setAuthToken(data.token);
        sessionStorage.setItem('adminToken', data.token);
        setShowLoginModal(false);
        setLoginUsername('');
        setLoginPassword('');
        showToast("Login Berhasil! Sesi bendahara aktif. 🌸", "success");
      } else {
        setLoginError(data.error || "Gagal melakukan autentikasi");
      }
    } catch (err) {
      console.error("Login request failed:", err);
      setLoginError("Koneksi server terputus. Silakan coba lagi.");
    }
  };

  // Logout handler
  const handleLogout = () => {
    setIsAdmin(false);
    setAuthToken(null);
    sessionStorage.removeItem('adminToken');
    setActiveTab('tagihan');
    showToast("Berhasil keluar dari sesi bendahara. Kembali ke mode siswa (read-only). 🌸", "success");
  };

  // Export functions
  const exportMonthlyTransactionsXlsx = () => {
    let html = `
      <html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:x="urn:schemas-microsoft-com:office:excel" xmlns="http://www.w3.org/TR/REC-html40">
      <head><meta charset="utf-8"/><style>body { font-family: sans-serif; } table { border-collapse: collapse; } th, td { border: 1px solid #E2E8F0; padding: 8px; text-align: left; } th { background-color: #F8FAFC; font-weight: bold; }</style></head>
      <body>
        <h2>Laporan Transaksi Kas Kelas - Periode ${activePeriod?.name}</h2>
        <p>Saldo Awal Bulan: Rp ${summary.initialBalance.toLocaleString('id-ID')}</p>
        <table>
          <thead>
            <tr>
              <th>Tanggal</th>
              <th>Keterangan</th>
              <th>Pemasukan (Rp)</th>
              <th>Pengeluaran (Rp)</th>
              <th>Saldo Akhir (Rp)</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>-</td>
              <td>Saldo Awal Bulan</td>
              <td>-</td>
              <td>-</td>
              <td>${summary.initialBalance}</td>
            </tr>
            ${transactions.map(tx => `
              <tr>
                <td>${tx.date.split('-').reverse().join('/')}</td>
                <td>${tx.description}</td>
                <td>${tx.type === 'pemasukan' ? tx.amount : '-'}</td>
                <td>${tx.type === 'pengeluaran' ? tx.amount : '-'}</td>
                <td>${tx.balance}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </body>
      </html>
    `;
    const blob = new Blob([html], { type: 'application/vnd.ms-excel' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Transaksi_Kas_${activePeriod?.id}.xls`;
    a.click();
    URL.revokeObjectURL(url);
    showToast("Berhasil mengekspor transaksi bulanan ke Excel! 📊", "success");
  };

  const exportMonthlyTransactionsPdf = () => {
    const printWindow = window.open('', '_blank', 'width=800,height=600');
    let html = `
      <html>
      <head>
        <title>Transaksi Kas Kelas - ${activePeriod?.name}</title>
        <style>
          body { font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; color: #1F2937; padding: 40px; }
          h2 { color: #1F2937; font-size: 20px; font-weight: bold; margin-bottom: 5px; }
          .subtitle { color: #6B7280; font-size: 12px; margin-bottom: 25px; }
          .summary { background-color: #F9FAFB; border: 1px solid #E5E7EB; border-radius: 12px; padding: 15px; margin-bottom: 25px; display: flex; justify-content: space-between; }
          .summary-item { font-size: 12px; font-weight: bold; }
          table { width: 100%; border-collapse: collapse; margin-top: 15px; font-size: 11px; }
          th, td { border-bottom: 1px solid #E5E7EB; padding: 10px 8px; text-align: left; }
          th { background-color: #F3F4F6; color: #4B5563; font-weight: bold; }
          .amount-in { color: #059669; font-weight: bold; }
          .amount-out { color: #DC2626; font-weight: bold; }
          .footer { margin-top: 50px; font-size: 10px; color: #9CA3AF; text-align: center; }
        </style>
      </head>
      <body>
        <h2>KasTwelvenine - Transaksi Kas Kelas</h2>
        <div class="subtitle">Laporan Transaksi Periode: ${activePeriod?.name}</div>
        
        <div class="summary">
          <div class="summary-item">Saldo Awal: Rp ${summary.initialBalance.toLocaleString('id-ID')}</div>
          <div class="summary-item" style="color: #059669;">Pemasukan: +Rp ${summary.totalPemasukan.toLocaleString('id-ID')}</div>
          <div class="summary-item" style="color: #DC2626;">Pengeluaran: -Rp ${summary.totalPengeluaran.toLocaleString('id-ID')}</div>
          <div class="summary-item">Saldo Akhir: Rp ${summary.endingBalance.toLocaleString('id-ID')}</div>
        </div>

        <table>
          <thead>
            <tr>
              <th>Tanggal</th>
              <th>Keterangan</th>
              <th style="text-align: right;">Pemasukan</th>
              <th style="text-align: right;">Pengeluaran</th>
              <th style="text-align: right;">Saldo</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>-</td>
              <td>Saldo Awal Bulan</td>
              <td style="text-align: right;">-</td>
              <td style="text-align: right;">-</td>
              <td style="text-align: right; font-weight: bold;">Rp ${summary.initialBalance.toLocaleString('id-ID')}</td>
            </tr>
            ${transactions.map(tx => `
              <tr>
                <td>${tx.date.split('-').reverse().join('/')}</td>
                <td>${tx.description}</td>
                <td style="text-align: right;" class="${tx.type === 'pemasukan' ? 'amount-in' : ''}">
                  ${tx.type === 'pemasukan' ? `Rp ${tx.amount.toLocaleString('id-ID')}` : '-'}
                </td>
                <td style="text-align: right;" class="${tx.type === 'pengeluaran' ? 'amount-out' : ''}">
                  ${tx.type === 'pengeluaran' ? `Rp ${tx.amount.toLocaleString('id-ID')}` : '-'}
                </td>
                <td style="text-align: right; font-weight: bold;">Rp ${tx.balance.toLocaleString('id-ID')}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>

        <div class="footer">Dicetak pada ${new Date().toLocaleDateString('id-ID')} • KasTwelvenine Official</div>
        
        <script>
          window.onload = function() {
            window.print();
            setTimeout(function() { window.close(); }, 500);
          };
        </script>
      </body>
      </html>
    `;
    printWindow.document.write(html);
    printWindow.document.close();
    showToast("Membuka dialog cetak PDF... 📄", "success");
  };

  const exportAnnualReportXlsx = () => {
    let html = `
      <html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:x="urn:schemas-microsoft-com:office:excel" xmlns="http://www.w3.org/TR/REC-html40">
      <head><meta charset="utf-8"/><style>body { font-family: sans-serif; } table { border-collapse: collapse; } th, td { border: 1px solid #E2E8F0; padding: 8px; text-align: left; } th { background-color: #F8FAFC; font-weight: bold; }</style></head>
      <body>
        <h2>Laporan Kas Kelas Tahunan (Tahun Ajaran)</h2>
        <table>
          <thead>
            <tr>
              <th>Periode</th>
              <th>Saldo Awal (Rp)</th>
              <th>Pemasukan (Rp)</th>
              <th>Pengeluaran (Rp)</th>
              <th>Saldo Akhir (Rp)</th>
            </tr>
          </thead>
          <tbody>
            ${periods.map(p => {
              const isActive = p.id === activePeriod?.id;
              const saldoAwal = p.id === activePeriod?.id ? summary.initialBalance : p.initialBalance;
              const pemasukan = p.id === activePeriod?.id ? summary.totalPemasukan : 0;
              const pengeluaran = p.id === activePeriod?.id ? summary.totalPengeluaran : 0;
              const saldoAkhir = p.id === activePeriod?.id ? summary.endingBalance : p.initialBalance;
              return `
                <tr>
                  <td>${p.name} ${isActive ? '(Aktif)' : ''}</td>
                  <td>${saldoAwal}</td>
                  <td>${pemasukan}</td>
                  <td>${pengeluaran}</td>
                  <td>${saldoAkhir}</td>
                </tr>
              `;
            }).join('')}
          </tbody>
        </table>
      </body>
      </html>
    `;
    const blob = new Blob([html], { type: 'application/vnd.ms-excel' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Laporan_Kas_Tahunan.xls`;
    a.click();
    URL.revokeObjectURL(url);
    showToast("Berhasil mengekspor rekap laporan tahunan ke Excel! 📊", "success");
  };

  const exportAnnualReportPdf = () => {
    const printWindow = window.open('', '_blank', 'width=800,height=600');
    let html = `
      <html>
      <head>
        <title>Laporan Kas Kelas Tahunan</title>
        <style>
          body { font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; color: #1F2937; padding: 40px; }
          h2 { color: #1F2937; font-size: 20px; font-weight: bold; margin-bottom: 5px; }
          .subtitle { color: #6B7280; font-size: 12px; margin-bottom: 25px; }
          table { width: 100%; border-collapse: collapse; margin-top: 15px; font-size: 11px; }
          th, td { border-bottom: 1px solid #E5E7EB; padding: 10px 8px; text-align: left; }
          th { background-color: #F3F4F6; color: #4B5563; font-weight: bold; }
          .amount-in { color: #059669; font-weight: bold; }
          .amount-out { color: #DC2626; font-weight: bold; }
          .footer { margin-top: 50px; font-size: 10px; color: #9CA3AF; text-align: center; }
        </style>
      </head>
      <body>
        <h2>KasTwelvenine - Laporan Kas Kelas Tahunan</h2>
        <div class="subtitle">Tahun Ajaran 2026/2027</div>

        <table>
          <thead>
            <tr>
              <th>Periode</th>
              <th style="text-align: right;">Saldo Awal</th>
              <th style="text-align: right;">Pemasukan</th>
              <th style="text-align: right;">Pengeluaran</th>
              <th style="text-align: right;">Saldo Akhir</th>
            </tr>
          </thead>
          <tbody>
            ${periods.map(p => {
              const isActive = p.id === activePeriod?.id;
              const saldoAwal = p.id === activePeriod?.id ? summary.initialBalance : p.initialBalance;
              const pemasukan = p.id === activePeriod?.id ? summary.totalPemasukan : 0;
              const pengeluaran = p.id === activePeriod?.id ? summary.totalPengeluaran : 0;
              const saldoAkhir = p.id === activePeriod?.id ? summary.endingBalance : p.initialBalance;
              return `
                <tr>
                  <td style="font-weight: bold;">${p.name} ${isActive ? '(Aktif)' : ''}</td>
                  <td style="text-align: right;">Rp ${saldoAwal.toLocaleString('id-ID')}</td>
                  <td style="text-align: right;" class="amount-in">Rp ${pemasukan.toLocaleString('id-ID')}</td>
                  <td style="text-align: right;" class="amount-out">Rp ${pengeluaran.toLocaleString('id-ID')}</td>
                  <td style="text-align: right; font-weight: bold;">Rp ${saldoAkhir.toLocaleString('id-ID')}</td>
                </tr>
              `;
            }).join('')}
          </tbody>
        </table>

        <div class="footer">Dicetak pada ${new Date().toLocaleDateString('id-ID')} • KasTwelvenine Official</div>
        
        <script>
          window.onload = function() {
            window.print();
            setTimeout(function() { window.close(); }, 500);
          };
        </script>
      </body>
      </html>
    `;
    printWindow.document.write(html);
    printWindow.document.close();
    showToast("Membuka dialog cetak PDF... 📄", "success");
  };

  // Filter students based on search query in the admin grid
  const filteredStudents = payments.filter(student => {
    const matchesSearch = student.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = 
      statusFilter === 'all' ? true :
      statusFilter === 'lunas' ? student.status === 'Lunas' :
      student.status !== 'Lunas';
    return matchesSearch && matchesStatus;
  });

  // Filter students for the public searchable dropdown
  const autocompleteFilteredStudents = payments.filter(s => 
    s.name.toLowerCase().includes(studentSearchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen relative w-full bg-[#FAFAFC] text-[#1F2937] font-sans antialiased flex flex-col justify-between">
      
      {/* Top Navigation Block */}
      <div className="border-b border-slate-100 bg-white">
        <div className="max-w-5xl mx-auto px-4">
          <header className="flex justify-between items-center py-3 sm:py-4 gap-3">
            {/* Sakura Brand Logo */}
            <div 
              className="flex items-center gap-2 cursor-pointer select-none" 
              onClick={() => setActiveTab(isAdmin ? 'recap' : 'tagihan')}
            >
              {/* Sakura blossom circular icon (matches screenshot) */}
              <div className="w-8 h-8 rounded-full bg-pink-100/50 flex items-center justify-center border border-pink-200/30 text-base animate-pulse">
                🌸
              </div>
              <span className="text-sm font-bold text-slate-800 tracking-tight">KasTwelvenine</span>
            </div>

            {/* Navigation and Actions */}
            <div className="flex items-center gap-2.5 sm:gap-3">
              {/* View Switcher Bubble Tabs (moved to header) */}
              <div className="flex gap-0.5 bg-slate-50 border border-slate-200/50 p-1 rounded-full">
                {!isAdmin ? (
                  <>
                    <button
                      onClick={() => setActiveTab('tagihan')}
                      className={`px-3 py-1 rounded-full text-[10px] sm:text-xs font-bold transition-all ${
                        activeTab === 'tagihan'
                          ? 'bg-white text-pink-500 shadow-sm border border-slate-100'
                          : 'text-slate-450 hover:text-slate-650'
                      }`}
                    >
                      Cek Tagihan
                    </button>
                    <button
                      onClick={() => setActiveTab('cashflow')}
                      className={`px-3 py-1 rounded-full text-[10px] sm:text-xs font-bold transition-all ${
                        activeTab === 'cashflow'
                          ? 'bg-white text-pink-500 shadow-sm border border-slate-100'
                          : 'text-slate-450 hover:text-slate-650'
                      }`}
                    >
                      Transparansi Kas
                    </button>
                  </>
                ) : (
                  <>
                    <button
                      onClick={() => setActiveTab('recap')}
                      className={`px-2.5 py-1 rounded-full text-[10px] sm:text-xs font-bold transition-all ${
                        activeTab === 'recap'
                          ? 'bg-white text-slate-800 shadow-sm border border-slate-100'
                          : 'text-slate-450 hover:text-slate-650'
                      }`}
                    >
                      Rekap
                    </button>
                    <button
                      onClick={() => setActiveTab('cashflow')}
                      className={`px-2.5 py-1 rounded-full text-[10px] sm:text-xs font-bold transition-all ${
                        activeTab === 'cashflow'
                          ? 'bg-white text-slate-800 shadow-sm border border-slate-100'
                          : 'text-slate-450 hover:text-slate-650'
                      }`}
                    >
                      Transaksi
                    </button>
                    <button
                      onClick={() => setActiveTab('reports')}
                      className={`px-2.5 py-1 rounded-full text-[10px] sm:text-xs font-bold transition-all ${
                        activeTab === 'reports'
                          ? 'bg-white text-slate-800 shadow-sm border border-slate-100'
                          : 'text-slate-450 hover:text-slate-650'
                      }`}
                    >
                      Laporan
                    </button>
                    <button
                      onClick={() => setActiveTab('settings')}
                      className={`px-2.5 py-1 rounded-full text-[10px] sm:text-xs font-bold transition-all ${
                        activeTab === 'settings'
                          ? 'bg-white text-slate-800 shadow-sm border border-slate-100'
                          : 'text-slate-450 hover:text-slate-650'
                      }`}
                    >
                      Pengaturan
                    </button>
                  </>
                )}
              </div>

              {/* Login / Logout / Month Selector Actions */}
              {!isAdmin ? (
                <button
                  onClick={() => {
                    setLoginError('');
                    setShowLoginModal(true);
                  }}
                  className="w-8 h-8 rounded-full bg-pink-50 hover:bg-pink-100/70 border border-pink-200/50 hover:border-pink-300 text-pink-500 hover:text-pink-600 flex items-center justify-center transition-all shadow-sm hover:shadow-md"
                  title="Login Bendahara"
                >
                  <Lock className="w-3.5 h-3.5" />
                </button>
              ) : (
                <div className="flex items-center gap-1.5 sm:gap-2">
                  {/* Month Selector */}
                  <div className="flex items-center gap-1 bg-slate-50 border border-slate-100 rounded-xl px-2 py-1.5">
                    <Calendar className="w-3.5 h-3.5 text-slate-400 hidden sm:inline" />
                    <select
                      value={activeMonth}
                      onChange={(e) => handleMonthYearChange(e.target.value, activeYear)}
                      className="text-[10px] sm:text-xs font-bold bg-transparent border-none text-slate-700 focus:outline-none cursor-pointer"
                    >
                      {['januari', 'februari', 'maret', 'april', 'mei', 'juni', 'juli', 'agustus', 'september', 'oktober', 'november', 'desember'].map(m => {
                        const displayMonth = m.charAt(0).toUpperCase() + m.slice(1);
                        const exists = periods.some(p => p.id.startsWith(`${m}-`));
                        if (!exists) return null;
                        return <option key={m} value={m}>{displayMonth}</option>;
                      })}
                    </select>
                  </div>

                  {/* Year Selector */}
                  <div className="flex items-center gap-1 bg-slate-50 border border-slate-100 rounded-xl px-2 py-1.5">
                    <select
                      value={activeYear}
                      onChange={(e) => handleMonthYearChange(activeMonth, e.target.value)}
                      className="text-[10px] sm:text-xs font-bold bg-transparent border-none text-slate-700 focus:outline-none cursor-pointer"
                    >
                      {availableYears.map(y => (
                        <option key={y} value={y}>{y}</option>
                      ))}
                    </select>
                  </div>

                  <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest bg-slate-100 px-2 py-0.5 rounded hidden md:inline">
                    Admin 👑
                  </span>
                  <button
                    onClick={handleLogout}
                    className="px-3 sm:px-4 py-1.5 rounded-full border border-rose-300 text-rose-500 hover:bg-rose-50 text-[11px] font-bold transition-all flex items-center gap-1"
                  >
                    <span className="hidden sm:inline">Logout 🚪</span>
                    <span className="sm:hidden flex items-center justify-center"><LogOut className="w-3.5 h-3.5" /></span>
                  </button>
                </div>
              )}
            </div>
          </header>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="max-w-5xl mx-auto px-4 w-full flex-grow flex flex-col justify-between py-8">
        
        {/* Core Tab Switches */}
        <div className="w-full flex-grow flex flex-col justify-center">
          <AnimatePresence mode="wait">
            {loading ? (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="flex flex-col justify-center items-center py-20 bg-white border border-slate-100 rounded-2xl w-full"
              >
                <RefreshCw className="w-8 h-8 text-slate-200 animate-spin mb-4" />
                <p className="text-slate-400 text-xs font-semibold">Memuat kas kelas...</p>
              </motion.div>
            ) : (
              <motion.div
                key={activeTab}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.15 }}
                className="w-full"
              >
                
                {/* ---------------------------------------------------- */}
                {/* PUBLIC TAB: CEK TAGIHAN SAYA */}
                {/* ---------------------------------------------------- */}
                {activeTab === 'tagihan' && !isAdmin && (
                  <div className="flex flex-col items-center justify-center max-w-xl mx-auto w-full py-6">
                    
                    {/* Centered Hero Section (Matches screenshot) */}
                    <div className="text-center mb-8">
                      <h2 className="text-3xl font-extrabold text-[#1F2937] tracking-tight">
                        Cek Tagihan Saya
                      </h2>
                      <p className="text-[11px] text-slate-400 mt-2 font-medium">
                        Iuran kas Rp5.000 per minggu selama 4 minggu.
                      </p>
                    </div>

                    {/* Centered Rounded-Full Search Bar */}
                    <div className="w-full relative mb-6" ref={dropdownRef}>
                      <div className="relative">
                        <input
                          type="text"
                          placeholder="Cari nama kamu di sini..."
                          value={studentSearchQuery}
                          onFocus={() => setShowAutocompleteDropdown(true)}
                          onChange={(e) => {
                            setStudentSearchQuery(e.target.value);
                            setShowAutocompleteDropdown(true);
                          }}
                          className="w-full text-xs px-6 py-3 rounded-full border border-slate-200 focus:outline-none focus:ring-1 focus:ring-pink-300 bg-white text-slate-800 placeholder-slate-400/80 font-semibold shadow-sm shadow-slate-100"
                        />
                        {studentSearchQuery && (
                          <button 
                            onClick={() => {
                              setStudentSearchQuery('');
                              setSelectedStudent(null);
                            }}
                            className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-450 hover:text-slate-700"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        )}
                      </div>

                      {/* Autocomplete Dropdown List */}
                      <AnimatePresence>
                        {showAutocompleteDropdown && (
                          <motion.div
                            initial={{ opacity: 0, y: 3 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: 3 }}
                            className="absolute z-30 left-0 right-0 mt-1 bg-white border border-slate-200 rounded-2xl shadow-lg max-h-48 overflow-y-auto custom-scrollbar"
                          >
                            {autocompleteFilteredStudents.length > 0 ? (
                              autocompleteFilteredStudents.map(student => (
                                <button
                                  key={student.studentId}
                                  onClick={() => {
                                    setSelectedStudent(student);
                                    setStudentSearchQuery(student.name);
                                    setShowAutocompleteDropdown(false);
                                  }}
                                  className="w-full text-left px-4 py-2.5 text-xs font-semibold text-slate-700 hover:bg-pink-50/30 hover:text-pink-600 border-b border-pink-50 last:border-0 flex justify-between items-center transition-colors"
                                >
                                  <span>{student.name}</span>
                                  <span className="text-[9px] text-slate-400 font-bold">Absen {parseInt(student.studentId.substring(1))}</span>
                                </button>
                              ))
                            ) : (
                              <div className="px-4 py-3 text-center text-xs text-slate-400">
                                Nama tidak terdaftar 🌸
                              </div>
                            )}
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>

                    {/* Personal Billing Card */}
                    <AnimatePresence mode="wait">
                      {selectedStudent && (
                        <motion.div
                          key={selectedStudent.studentId}
                          initial={{ opacity: 0, y: 8 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: 8 }}
                          className="w-full bg-white border border-slate-100 rounded-2xl p-5 shadow-sm mb-6"
                        >
                          <div className="flex justify-between items-start mb-4">
                            <div>
                              <div className="flex items-center gap-1.5 flex-wrap">
                                <span className="text-[8px] font-extrabold uppercase px-2 py-0.5 bg-slate-100 text-slate-500 rounded">
                                  Absen {parseInt(selectedStudent.studentId.substring(1))}
                                </span>
                                <span className="text-[8px] font-extrabold uppercase px-2 py-0.5 bg-pink-50 text-pink-650 rounded border border-pink-100/30">
                                  {activePeriod?.name}
                                </span>
                              </div>
                              <h3 className="text-sm font-extrabold text-slate-800 mt-1.5">{selectedStudent.name}</h3>
                            </div>
                            <div>
                              {selectedStudent.status === 'Lunas' ? (
                                <span className="inline-flex px-2 py-0.5 rounded-full text-[9px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-100">
                                  Lunas
                                </span>
                              ) : (
                                <span className="inline-flex px-2 py-0.5 rounded-full text-[9px] font-bold bg-rose-50 text-rose-700 border border-rose-100">
                                  {selectedStudent.status}
                                </span>
                              )}
                            </div>
                          </div>

                          <div className="bg-slate-50 rounded-xl p-3 border border-slate-100 mb-4">
                            <div className="grid grid-cols-4 gap-2">
                              {[1, 2, 3, 4].map(w => {
                                const key = `week${w}`;
                                const isPaid = selectedStudent[key];
                                return (
                                  <div key={w} className="flex flex-col items-center">
                                    <div className={`w-7 h-7 rounded-lg flex items-center justify-center border transition-all ${
                                      isPaid 
                                        ? 'bg-emerald-50 border-emerald-200 text-emerald-700'
                                        : 'bg-white border-slate-200 text-slate-300'
                                    }`}>
                                      {isPaid ? <Check className="w-3.5 h-3.5 stroke-[2.5px]" /> : <span className="text-xs">-</span>}
                                    </div>
                                    <span className="text-[8px] font-bold text-slate-500 mt-1">Minggu {w}</span>
                                  </div>
                                );
                              })}
                            </div>
                          </div>

                          <div className="flex justify-between items-center text-xs font-bold pt-2 text-slate-500">
                            <span>Sudah Dibayar:</span>
                            <span className="text-slate-800 bg-slate-50 px-2.5 py-1 rounded-lg border border-slate-100">
                              Rp {selectedStudent.totalPaid.toLocaleString('id-ID')}
                            </span>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>


                  </div>
                )}

                {/* ---------------------------------------------------- */}
                {/* PUBLIC TAB: TRANSPARANSI KAS */}
                {/* ---------------------------------------------------- */}
                {activeTab === 'cashflow' && !isAdmin && (
                  <div className="space-y-6">
                    {/* Read-Only metric cards */}
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                      {/* Saldo Awal */}
                      <div className="bg-white border border-slate-100 rounded-2xl p-4 shadow-sm">
                        <div className="flex justify-between items-center mb-2">
                          <span className="text-[9px] font-bold uppercase tracking-wider text-slate-400">Total Saldo Awal</span>
                          <Wallet className="w-3.5 h-3.5 text-slate-400" />
                        </div>
                        <p className="text-base font-extrabold text-slate-800">
                          Rp {summary.initialBalance.toLocaleString('id-ID')}
                        </p>
                      </div>

                      {/* Total Pemasukan */}
                      <div className="bg-white border border-slate-100 rounded-2xl p-4 shadow-sm">
                        <div className="flex justify-between items-center mb-2">
                          <span className="text-[9px] font-bold uppercase tracking-wider text-slate-400">Pemasukan</span>
                          <ArrowUpCircle className="w-3.5 h-3.5 text-emerald-500" />
                        </div>
                        <p className="text-base font-extrabold text-emerald-600">
                          Rp {summary.totalPemasukan.toLocaleString('id-ID')}
                        </p>
                      </div>

                      {/* Total Pengeluaran */}
                      <div className="bg-white border border-slate-100 rounded-2xl p-4 shadow-sm">
                        <div className="flex justify-between items-center mb-2">
                          <span className="text-[9px] font-bold uppercase tracking-wider text-slate-400">Pengeluaran</span>
                          <ArrowDownCircle className="w-3.5 h-3.5 text-rose-500" />
                        </div>
                        <p className="text-base font-extrabold text-rose-600">
                          Rp {summary.totalPengeluaran.toLocaleString('id-ID')}
                        </p>
                      </div>

                      {/* Sisa Saldo Kas */}
                      <div className="bg-white border border-slate-100 rounded-2xl p-4 shadow-sm border-b-2 border-b-slate-850">
                        <div className="flex justify-between items-center mb-2">
                          <span className="text-[9px] font-bold uppercase tracking-wider text-slate-400">Sisa Saldo Kas</span>
                          <Coins className="w-3.5 h-3.5 text-slate-600" />
                        </div>
                        <p className="text-base font-extrabold text-slate-800">
                          Rp {summary.endingBalance.toLocaleString('id-ID')}
                        </p>
                      </div>
                    </div>

                    {/* Read-Only Transaction Table */}
                    <div className="bg-white border border-slate-100 rounded-2xl p-5 shadow-sm">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
                        <h3 className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                          <FileText className="w-4 h-4 text-slate-400" />
                          Laporan Pemasukan & Pengeluaran ({activePeriod?.name})
                        </h3>
                        <div className="flex gap-2">
                          <button
                            onClick={exportMonthlyTransactionsXlsx}
                            className="bg-emerald-600 hover:bg-emerald-700 text-white text-[10px] font-bold px-3 py-1.5 rounded-lg transition-all flex items-center gap-1"
                          >
                            <span>Excel 📊</span>
                          </button>
                          <button
                            onClick={exportMonthlyTransactionsPdf}
                            className="bg-slate-800 hover:bg-slate-900 text-white text-[10px] font-bold px-3 py-1.5 rounded-lg transition-all flex items-center gap-1"
                          >
                            <span>PDF 📄</span>
                          </button>
                        </div>
                      </div>

                      <div className="overflow-x-auto border border-slate-100 rounded-xl custom-scrollbar">
                        <table className="w-full text-left border-collapse text-xs min-w-[600px]">
                          <thead>
                            <tr className="bg-slate-50 text-slate-500 font-semibold border-b border-slate-100">
                              <th className="py-2.5 px-3 w-28">Tanggal</th>
                              <th className="py-2.5 px-3">Keterangan</th>
                              <th className="py-2.5 px-3 text-right">Pemasukan (Rp)</th>
                              <th className="py-2.5 px-3 text-right">Pengeluaran (Rp)</th>
                              <th className="py-2.5 px-3 text-right">Saldo (Rp)</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-100 text-slate-700 font-medium">
                            <tr className="bg-slate-50/20 italic text-slate-500">
                              <td className="py-2 px-3">
                                {getWeekDate(activePeriod?.id || 'agustus-2026', 0).split('-').reverse().join('/')}
                              </td>
                              <td className="py-2 px-3">Saldo Awal Bulan</td>
                              <td className="py-2 px-3 text-right">-</td>
                              <td className="py-2 px-3 text-right">-</td>
                              <td className="py-2 px-3 text-right text-slate-700 font-bold">
                                Rp {summary.initialBalance.toLocaleString('id-ID')}
                              </td>
                            </tr>

                            {transactions.length > 0 ? (
                              transactions.map(tx => (
                                <tr key={tx.id} className="hover:bg-slate-50/50">
                                  <td className="py-2.5 px-3 text-slate-400">
                                    {tx.date.split('-').reverse().join('/')}
                                  </td>
                                  <td className="py-2.5 px-3 text-slate-800">
                                    {tx.description}
                                    {tx.isAuto && (
                                      <span className="text-[7.5px] bg-pink-50 text-pink-600 px-1.5 py-0.5 rounded ml-1 font-bold">
                                        Iuran
                                      </span>
                                    )}
                                  </td>
                                  <td className="py-2.5 px-3 text-right text-emerald-600 font-bold">
                                    {tx.type === 'pemasukan' ? `Rp ${tx.amount.toLocaleString('id-ID')}` : '-'}
                                  </td>
                                  <td className="py-2.5 px-3 text-right text-rose-600 font-bold">
                                    {tx.type === 'pengeluaran' ? `Rp ${tx.amount.toLocaleString('id-ID')}` : '-'}
                                  </td>
                                  <td className="py-2.5 px-3 text-right text-slate-800 font-bold">
                                    Rp {tx.balance.toLocaleString('id-ID')}
                                  </td>
                                </tr>
                              ))
                            ) : (
                              <tr>
                                <td colSpan="5" className="py-6 px-3 text-center text-slate-400 italic">
                                  Belum ada catatan kas 🍃
                                </td>
                              </tr>
                            )}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  </div>
                )}

                {/* ---------------------------------------------------- */}
                {/* ADMIN TABS: REKAP GRID */}
                {/* ---------------------------------------------------- */}
                {activeTab === 'recap' && isAdmin && (
                  <div className="bg-white border border-slate-100 rounded-2xl p-5 shadow-sm space-y-4">
                    <div className="flex flex-col sm:flex-row gap-3 justify-between items-center">
                      <div className="relative w-full sm:max-w-xs">
                        <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                        <input
                          type="text"
                          placeholder="Cari nama siswa..."
                          value={searchQuery}
                          onChange={(e) => setSearchQuery(e.target.value)}
                          className="w-full text-xs pl-9 pr-3 py-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-1 focus:ring-slate-400 bg-slate-50 font-semibold"
                        />
                      </div>

                      <div className="flex gap-1.5 overflow-x-auto pb-0.5 w-full sm:w-auto">
                        <button
                          onClick={() => setStatusFilter('all')}
                          className={`px-3 py-1 rounded-lg text-[9px] font-bold border transition-all ${
                            statusFilter === 'all'
                              ? 'bg-slate-800 text-white border-transparent'
                              : 'text-slate-500 border-slate-100 bg-slate-50 hover:bg-slate-100'
                          }`}
                        >
                          Semua ({payments.length})
                        </button>
                        <button
                          onClick={() => setStatusFilter('lunas')}
                          className={`px-3 py-1 rounded-lg text-[9px] font-bold border transition-all ${
                            statusFilter === 'lunas'
                              ? 'bg-emerald-600 text-white border-transparent'
                              : 'text-emerald-700 border-emerald-100 bg-emerald-50 hover:bg-emerald-100/50'
                          }`}
                        >
                          Lunas ({payments.filter(p => p.status === 'Lunas').length})
                        </button>
                        <button
                          onClick={() => setStatusFilter('debt')}
                          className={`px-3 py-1 rounded-lg text-[9px] font-bold border transition-all ${
                            statusFilter === 'debt'
                              ? 'bg-rose-500 text-white border-transparent'
                              : 'text-rose-700 border-rose-100 bg-rose-50 hover:bg-rose-100/50'
                          }`}
                        >
                          Tunggakan ({payments.filter(p => p.status !== 'Lunas').length})
                        </button>
                      </div>
                    </div>

                    <div className="overflow-x-auto border border-slate-150 rounded-xl custom-scrollbar">
                      <table className="w-full text-left border-collapse text-xs min-w-[650px]">
                        <thead>
                          <tr className="bg-slate-50 text-slate-500 font-bold border-b border-slate-200">
                            <th className="py-2 px-3 text-center w-12">No</th>
                            <th className="py-2 px-3">Nama Siswa</th>
                            <th className="py-2 px-3 text-center">Minggu 1</th>
                            <th className="py-2 px-3 text-center">Minggu 2</th>
                            <th className="py-2 px-3 text-center">Minggu 3</th>
                            <th className="py-2 px-3 text-center">Minggu 4</th>
                            <th className="py-2 px-3 text-right">Total Bayar</th>
                            <th className="py-2 px-3 text-center w-28">Status</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 text-slate-700 font-semibold">
                          {filteredStudents.length > 0 ? (
                            filteredStudents.map((s, index) => {
                              const isLunas = s.status === 'Lunas';
                              return (
                                <tr key={s.studentId} className="hover:bg-slate-50/50">
                                  <td className="py-2.5 px-3 text-center text-slate-400 font-normal">
                                    {index + 1}
                                  </td>
                                  <td className="py-2.5 px-3 text-slate-800">
                                    {s.name}
                                  </td>
                                  
                                  {[1, 2, 3, 4].map(wIndex => {
                                    const key = `week${wIndex}`;
                                    const isChecked = s[key];
                                    return (
                                      <td key={wIndex} className="py-2.5 px-3 text-center">
                                        <button
                                          onClick={() => handleTogglePayment(s.studentId, wIndex)}
                                          className={`inline-flex items-center justify-center w-4.5 h-4.5 rounded border transition-all ${
                                            isChecked
                                              ? 'bg-slate-800 border-transparent text-white'
                                              : 'border-slate-300 hover:border-slate-650 bg-white text-transparent'
                                          }`}
                                        >
                                          <Check className="w-3 h-3 stroke-[2.5px]" />
                                        </button>
                                      </td>
                                    );
                                  })}

                                  <td className="py-2.5 px-3 text-right text-slate-800 font-bold">
                                    Rp {s.totalPaid.toLocaleString('id-ID')}
                                  </td>
                                  <td className="py-2.5 px-3 text-center">
                                    {isLunas ? (
                                      <span className="inline-flex px-1.5 py-0.5 rounded text-[8.5px] font-bold bg-emerald-50 text-emerald-700">
                                        Lunas
                                      </span>
                                    ) : (
                                      <span className="inline-flex px-1.5 py-0.5 rounded text-[8.5px] font-bold bg-rose-50 text-rose-700">
                                        {s.status.replace('Tunggakan Rp ', '-Rp ')}
                                      </span>
                                    )}
                                  </td>
                                </tr>
                              );
                            })
                          ) : (
                            <tr>
                              <td colSpan="8" className="py-8 text-center text-slate-400">
                                Tidak ada data yang sesuai 🌸
                              </td>
                            </tr>
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}

                {/* ---------------------------------------------------- */}
                {/* ADMIN TABS: KELOLA TRANSAKSI */}
                {/* ---------------------------------------------------- */}
                {activeTab === 'cashflow' && isAdmin && (
                  <div className="space-y-6">
                    <div className="bg-white border border-slate-100 rounded-2xl p-5 shadow-sm">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
                        <h3 className="text-xs font-bold text-slate-850 flex items-center gap-1.5">
                          <FileText className="w-4 h-4 text-slate-400" />
                          Kelola Arus Kas ({activePeriod?.name})
                        </h3>
                        <div className="flex gap-2">
                          <button
                            onClick={exportMonthlyTransactionsXlsx}
                            className="bg-emerald-600 hover:bg-emerald-700 text-white text-[10px] font-bold px-3 py-1.5 rounded-lg transition-all flex items-center gap-1"
                          >
                            <span>Excel 📊</span>
                          </button>
                          <button
                            onClick={exportMonthlyTransactionsPdf}
                            className="bg-slate-800 hover:bg-slate-900 text-white text-[10px] font-bold px-3 py-1.5 rounded-lg transition-all flex items-center gap-1"
                          >
                            <span>PDF 📄</span>
                          </button>
                        </div>
                      </div>

                      <div className="overflow-x-auto border border-slate-100 rounded-xl custom-scrollbar">
                        <table className="w-full text-left border-collapse text-xs min-w-[600px]">
                          <thead>
                            <tr className="bg-slate-50 text-slate-500 font-bold border-b border-slate-200">
                              <th className="py-2.5 px-3 w-28">Tanggal</th>
                              <th className="py-2.5 px-3">Keterangan</th>
                              <th className="py-2.5 px-3 text-right">Pemasukan</th>
                              <th className="py-2.5 px-3 text-right">Pengeluaran</th>
                              <th className="py-2.5 px-3 text-right">Saldo</th>
                              <th className="py-2.5 px-3 text-center w-16">Aksi</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-100 text-slate-700 font-medium">
                            <tr className="bg-slate-50/20 italic text-slate-500">
                              <td className="py-2 px-3 text-slate-400">
                                {getWeekDate(activePeriod?.id || 'agustus-2026', 0).split('-').reverse().join('/')}
                              </td>
                              <td className="py-2 px-3">Saldo Awal Bulan</td>
                              <td className="py-2 px-3 text-right">-</td>
                              <td className="py-2 px-3 text-right">-</td>
                              <td className="py-2 px-3 text-right text-slate-800 font-bold">
                                Rp {summary.initialBalance.toLocaleString('id-ID')}
                              </td>
                              <td className="py-2 px-3 text-center text-slate-400">-</td>
                            </tr>

                            {transactions.length > 0 ? (
                              transactions.map(tx => (
                                <tr key={tx.id} className="hover:bg-slate-50/50">
                                  <td className="py-2.5 px-3 text-slate-400">
                                    {tx.date.split('-').reverse().join('/')}
                                  </td>
                                  <td className="py-2.5 px-3 text-slate-800">
                                    {tx.description}
                                    {tx.isAuto && (
                                      <span className="text-[7px] bg-pink-50 text-pink-500 px-1 py-0.2 rounded ml-1 font-bold">
                                        Iuran
                                      </span>
                                    )}
                                  </td>
                                  <td className="py-2.5 px-3 text-right text-emerald-600 font-bold">
                                    {tx.type === 'pemasukan' ? `Rp ${tx.amount.toLocaleString('id-ID')}` : '-'}
                                  </td>
                                  <td className="py-2.5 px-3 text-right text-rose-600 font-bold">
                                    {tx.type === 'pengeluaran' ? `Rp ${tx.amount.toLocaleString('id-ID')}` : '-'}
                                  </td>
                                  <td className="py-2.5 px-3 text-right text-slate-800 font-bold">
                                    Rp {tx.balance.toLocaleString('id-ID')}
                                  </td>
                                  <td className="py-2.5 px-3 text-center">
                                    {tx.isAuto ? (
                                      <span className="text-slate-300">-</span>
                                    ) : (
                                      <button
                                        onClick={() => handleDeleteTransaction(tx.id)}
                                        className="p-1 text-slate-400 hover:text-rose-600 hover:bg-slate-50 rounded transition-all"
                                        title="Hapus Transaksi"
                                      >
                                        <Trash2 className="w-3.5 h-3.5" />
                                      </button>
                                    )}
                                  </td>
                                </tr>
                              ))
                            ) : (
                              <tr>
                                <td colSpan="6" className="py-6 px-3 text-center text-slate-400 italic">
                                  Belum ada transaksi tercatat 🍃
                                </td>
                              </tr>
                            )}
                          </tbody>
                        </table>
                      </div>
                    </div>

                    <div className="bg-white border border-slate-100 rounded-2xl p-5 shadow-sm">
                      <h3 className="text-xs font-bold text-slate-800 mb-3 flex items-center gap-1.5">
                        <Plus className="w-4 h-4 text-slate-400" />
                        Tambah Transaksi Baru
                      </h3>
                      
                      <form onSubmit={handleAddTransaction} className="grid grid-cols-1 sm:grid-cols-4 gap-3 items-end">
                        <div>
                          <label className="block text-[9px] font-bold text-slate-400 mb-1 uppercase">Tanggal</label>
                          <input
                            type="date"
                            required
                            value={newTx.date}
                            onChange={(e) => setNewTx({ ...newTx, date: e.target.value })}
                            className="w-full text-xs px-2.5 py-1.5 rounded-lg border border-slate-200 focus:outline-none focus:ring-1 focus:ring-slate-400 font-semibold"
                          />
                        </div>

                        <div className="sm:col-span-2">
                          <label className="block text-[9px] font-bold text-slate-400 mb-1 uppercase">Keterangan</label>
                          <input
                            type="text"
                            required
                            placeholder="Contoh: Beli kertas manila..."
                            value={newTx.description}
                            onChange={(e) => setNewTx({ ...newTx, description: e.target.value })}
                            className="w-full text-xs px-2.5 py-1.5 rounded-lg border border-slate-200 focus:outline-none focus:ring-1 focus:ring-slate-400 font-semibold"
                          />
                        </div>

                        <div>
                          <label className="block text-[9px] font-bold text-slate-400 mb-1 uppercase">Jenis</label>
                          <select
                            value={newTx.type}
                            onChange={(e) => setNewTx({ ...newTx, type: e.target.value })}
                            className="w-full text-xs px-2.5 py-1.5 rounded-lg border border-slate-200 focus:outline-none focus:ring-1 focus:ring-slate-400 font-semibold bg-white"
                          >
                            <option value="pengeluaran">Pengeluaran (-)</option>
                            <option value="pemasukan">Pemasukan (+)</option>
                          </select>
                        </div>

                        <div>
                          <label className="block text-[9px] font-bold text-slate-400 mb-1 uppercase">Nominal</label>
                          <input
                            type="number"
                            required
                            placeholder="Contoh: 10000"
                            value={newTx.amount}
                            onChange={(e) => setNewTx({ ...newTx, amount: e.target.value })}
                            className="w-full text-xs px-2.5 py-1.5 rounded-lg border border-slate-200 focus:outline-none focus:ring-1 focus:ring-slate-400 font-semibold"
                          />
                        </div>

                        <div className="sm:col-span-4 mt-2">
                          <button
                            type="submit"
                            className="bg-slate-800 hover:bg-slate-900 text-white text-xs font-bold px-4 py-2 rounded-lg transition-all flex items-center justify-center gap-1 w-full"
                          >
                            <Plus className="w-3.5 h-3.5" /> Simpan Transaksi
                          </button>
                        </div>
                      </form>
                    </div>
                  </div>
                )}

                {/* ---------------------------------------------------- */}
                {/* ADMIN TABS: LAPORAN TAHUNAN */}
                {/* ---------------------------------------------------- */}
                {activeTab === 'reports' && isAdmin && (
                  <div className="bg-white border border-slate-100 rounded-2xl p-5 shadow-sm space-y-5">
                    <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-slate-50 text-slate-700 rounded-xl">
                          <FileText className="w-5 h-5" />
                        </div>
                        <div>
                          <h3 className="text-xs font-bold text-slate-800">Laporan Kas Tahunan (2 Semester)</h3>
                          <p className="text-[9px] text-slate-400 font-medium">Rekapitulasi kas bulanan per tahun ajaran</p>
                        </div>
                      </div>
                    </div>

                    {/* Export Actions Panel (Excel & PDF Buttons) */}
                    <div className="border border-slate-100 bg-slate-50/20 rounded-xl p-4 shadow-sm flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                      <div>
                        <h4 className="font-bold text-xs text-slate-800 mb-1">
                          Export Rekap Laporan
                        </h4>
                        <p className="text-[9.5px] text-slate-450 font-medium">
                          Unduh ringkasan saldo awal, pemasukan, pengeluaran & akhir semua periode bulan.
                        </p>
                      </div>
                      <div className="flex gap-2 w-full sm:w-auto">
                        <button
                          onClick={exportAnnualReportXlsx}
                          className="bg-emerald-600 hover:bg-emerald-700 text-white text-[10px] font-bold px-4 py-1.5 rounded-lg transition-all flex items-center gap-1 justify-center flex-1 sm:flex-initial"
                        >
                          <span>Excel 📊</span>
                        </button>
                        <button
                          onClick={exportAnnualReportPdf}
                          className="bg-slate-800 hover:bg-slate-900 text-white text-[10px] font-bold px-4 py-1.5 rounded-lg transition-all flex items-center gap-1 justify-center flex-1 sm:flex-initial"
                        >
                          <span>PDF 📄</span>
                        </button>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="p-4 border border-slate-100 rounded-xl bg-slate-50/50">
                        <h4 className="font-bold text-xs text-slate-800 mb-1">
                          Semester Ganjil (Agustus - Desember)
                        </h4>
                        <div className="space-y-1 text-xs text-slate-600 font-semibold mt-2.5">
                          <div className="flex justify-between">
                            <span className="text-slate-400">Pemasukan:</span>
                            <span>
                              Rp {periods.slice(0,6).reduce((sum, p) => sum + (p.id === 'agustus-2026' ? summary.totalPemasukan : 0), 0).toLocaleString('id-ID')}
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-slate-400">Pengeluaran:</span>
                            <span>
                              Rp {periods.slice(0,6).reduce((sum, p) => sum + (p.id === 'agustus-2026' ? summary.totalPengeluaran : 0), 0).toLocaleString('id-ID')}
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="p-4 border border-slate-100 rounded-xl bg-slate-50/50">
                        <h4 className="font-bold text-xs text-slate-800 mb-1">
                          Semester Genap (Januari - Juli)
                        </h4>
                        <div className="space-y-1 text-xs text-slate-600 font-semibold mt-2.5">
                          <div className="flex justify-between">
                            <span className="text-slate-400">Pemasukan:</span>
                            <span className="text-slate-400">Rp 0</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-slate-400">Pengeluaran:</span>
                            <span className="text-slate-450">Rp 0</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="overflow-x-auto border border-slate-100 rounded-xl custom-scrollbar">
                      <table className="w-full text-left border-collapse text-xs min-w-[600px]">
                        <thead>
                          <tr className="bg-slate-50 text-slate-500 font-bold border-b border-slate-150">
                            <th className="py-2.5 px-3">Periode</th>
                            <th className="py-2.5 px-3 text-right">Saldo Awal</th>
                            <th className="py-2.5 px-3 text-right">Pemasukan</th>
                            <th className="py-2.5 px-3 text-right">Pengeluaran</th>
                            <th className="py-2.5 px-3 text-right">Saldo Akhir</th>
                            <th className="py-2.5 px-3 text-center">Status</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 text-slate-700 font-medium">
                          {periods.map(p => {
                            const isActive = p.id === activePeriod?.id;
                            const isAugust = p.id === 'agustus-2026';
                            const saldoAwal = isAugust ? summary.initialBalance : p.initialBalance;
                            const pemasukan = isAugust ? summary.totalPemasukan : 0;
                            const pengeluaran = isAugust ? summary.totalPengeluaran : 0;
                            const saldoAkhir = isAugust ? summary.endingBalance : p.initialBalance;

                            return (
                              <tr key={p.id} className="hover:bg-slate-50/50">
                                <td className="py-2.5 px-3 text-slate-800 font-semibold">
                                  {p.name}
                                </td>
                                <td className="py-2.5 px-3 text-right text-slate-450">
                                  Rp {saldoAwal.toLocaleString('id-ID')}
                                </td>
                                <td className="py-2.5 px-3 text-right text-emerald-600 font-bold">
                                  Rp {pemasukan.toLocaleString('id-ID')}
                                </td>
                                <td className="py-2.5 px-3 text-right text-rose-600 font-bold">
                                  Rp {pengeluaran.toLocaleString('id-ID')}
                                </td>
                                <td className="py-2.5 px-3 text-right text-slate-800 font-bold">
                                  Rp {saldoAkhir.toLocaleString('id-ID')}
                                </td>
                                <td className="py-2.5 px-3 text-center">
                                  {isActive ? (
                                    <span className="inline-flex px-1.5 py-0.5 rounded text-[8px] font-bold bg-emerald-50 text-emerald-700">
                                      Aktif
                                    </span>
                                  ) : (
                                    <span className="inline-flex px-1.5 py-0.5 rounded text-[8px] font-bold bg-slate-100 text-slate-400">
                                      -
                                    </span>
                                  )}
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}

                {/* ---------------------------------------------------- */}
                {/* ADMIN TABS: PENGATURAN */}
                {/* ---------------------------------------------------- */}
                {activeTab === 'settings' && isAdmin && (
                  <div className="space-y-6">
                    <div className="bg-white border border-slate-100 rounded-2xl p-5 shadow-sm">
                      <h3 className="text-xs font-bold text-slate-850 mb-3 flex items-center gap-1.5">
                        <Wallet className="w-4 h-4 text-slate-400" />
                        Konfigurasi Keuangan ({activePeriod?.name})
                      </h3>

                      <form onSubmit={handleUpdateBalances} className="space-y-4 max-w-sm">
                        <div>
                          <label className="block text-[9px] font-bold text-slate-400 mb-1 uppercase">Saldo Awal Bulan (Rp)</label>
                          <input
                            type="number"
                            required
                            value={editInitialBalance}
                            onChange={(e) => setEditInitialBalance(e.target.value)}
                            className="w-full text-xs px-2.5 py-1.5 rounded-lg border border-slate-200 focus:outline-none focus:ring-1 focus:ring-slate-450 font-semibold"
                          />
                        </div>

                        <div className="border-t border-slate-100 my-3 pt-3">
                          <h4 className="text-[9px] font-bold text-slate-400 uppercase mb-2">Penyimpanan</h4>
                          <div className="grid grid-cols-2 gap-3">
                            <div>
                              <label className="block text-[8px] font-bold text-slate-450 mb-1 uppercase">Tunai (Cash)</label>
                              <input
                                type="number"
                                required
                                value={editCash}
                                onChange={(e) => setEditCash(e.target.value)}
                                className="w-full text-xs px-2.5 py-1.5 rounded-lg border border-slate-200 focus:outline-none focus:ring-1 focus:ring-slate-450 font-semibold"
                              />
                            </div>
                            <div>
                              <label className="block text-[8px] font-bold text-slate-450 mb-1 uppercase">E-Wallet</label>
                              <input
                                type="number"
                                required
                                value={editEWallet}
                                onChange={(e) => setEditEWallet(e.target.value)}
                                className="w-full text-xs px-2.5 py-1.5 rounded-lg border border-slate-200 focus:outline-none focus:ring-1 focus:ring-slate-450 font-semibold"
                              />
                            </div>
                          </div>
                        </div>

                        <div className="border-t border-slate-100 my-3 pt-3">
                          <h4 className="text-[9px] font-bold text-slate-400 uppercase mb-2">Iuran Kas per Minggu</h4>
                          <div>
                            <label className="block text-[8px] font-bold text-slate-450 mb-1 uppercase">Nominal Iuran (Rp)</label>
                            <input
                              type="number"
                              required
                              value={editWeeklyFee}
                              onChange={(e) => setEditWeeklyFee(e.target.value)}
                              className="w-full text-xs px-2.5 py-1.5 rounded-lg border border-slate-200 focus:outline-none focus:ring-1 focus:ring-slate-450 font-semibold"
                            />
                          </div>
                        </div>

                        <button
                          type="submit"
                          className="bg-slate-800 hover:bg-slate-900 text-white text-xs font-bold px-4 py-2 rounded-lg transition-all"
                        >
                          Simpan Konfigurasi
                        </button>
                      </form>
                    </div>

                    <div className="bg-rose-50/50 border border-rose-100 rounded-2xl p-5">
                      <h3 className="text-xs font-bold text-rose-700 mb-1 flex items-center gap-1.5">
                        <RefreshCw className="w-4 h-4" />
                        Setel Ulang Aplikasi
                      </h3>
                      <p className="text-[9px] text-slate-450 mb-3">
                        Mengembalikan data kas kelas ke data bawaan awal.
                      </p>
                      <button
                        onClick={handleResetData}
                        className="bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold px-4 py-2 rounded-lg transition-all"
                      >
                        Reset Data Sekarang
                      </button>
                    </div>
                  </div>
                )}
                
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* ---------------------------------------------------- */}
        {/* BOTTOM METRICS RINGKASAN & FOOTER SIGNATURE */}
        {/* ---------------------------------------------------- */}
        <section className="mt-8 bg-white border border-slate-150 rounded-2xl p-5 shadow-sm">
          <div className="flex flex-col md:flex-row justify-between gap-6">
            
            {/* Left Column: Metrics list */}
            <div className="flex-grow space-y-3 md:max-w-xl">
              <h3 className="font-bold text-xs text-slate-800 flex items-center gap-1.5">
                {/* Pink/Red Sparkle SVG icon (matches screenshot) */}
                <span className="text-rose-500">
                  <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                    <path d="M12 2L14.5 9.5L22 12L14.5 14.5L12 22L9.5 14.5L2 12L9.5 9.5L12 2Z" />
                  </svg>
                </span>
                Ringkasan Laporan Kas Periode {activePeriod?.name}
              </h3>
              
              <div className="space-y-2 text-xs font-semibold text-slate-500">
                <div className="flex justify-between items-center pb-0.5">
                  <span>Saldo Awal Bulan:</span>
                  <span className="text-slate-800 font-bold">
                    Rp {summary.initialBalance.toLocaleString('id-ID')}
                  </span>
                </div>
                
                <div className="flex justify-between items-center pb-0.5">
                  <span>Total Pemasukan:</span>
                  <span className="text-emerald-600 font-bold">
                    + Rp {summary.totalPemasukan.toLocaleString('id-ID')}
                  </span>
                </div>
                
                <div className="flex justify-between items-center pb-0.5">
                  <span>Total Pengeluaran:</span>
                  <span className="text-rose-600 font-bold">
                    - Rp {summary.totalPengeluaran.toLocaleString('id-ID')}
                  </span>
                </div>
                
                <div className="flex justify-between items-center pt-2 text-slate-800 font-bold border-t border-slate-100">
                  <span>Sisa Saldo Kas Akhir:</span>
                  <span className="text-slate-800 bg-slate-50 border border-slate-200 px-3 py-1 rounded-lg">
                    Rp {summary.endingBalance.toLocaleString('id-ID')}
                  </span>
                </div>
              </div>

              {/* Minimal Storage Distribution info (Cash / E-Wallet) */}
              <div className="flex gap-4 pt-1.5 text-[9px] text-slate-400 font-semibold border-t border-slate-50">
                <span>Uang Tunai: Rp {summary.cashAmount.toLocaleString('id-ID')}</span>
                <span>•</span>
                <span>E-Wallet: Rp {summary.eWalletAmount.toLocaleString('id-ID')}</span>
              </div>
            </div>

            {/* Right Column: Signature Block (matches screenshot) */}
            <div className="flex flex-col items-center md:items-end justify-center md:border-l md:border-slate-100 md:pl-6 min-w-[200px]">
              <div className="text-center md:text-right space-y-4">
                <div>
                  <p className="text-[8.5px] font-extrabold text-slate-400 uppercase tracking-widest">MENGETAHUI,</p>
                  <p className="font-bold text-[11px] text-slate-700 mt-0.5">Bendahara Kelas</p>
                </div>
                
                <div className="border-t border-dotted border-slate-200 pt-2 w-44">
                  <p className="font-bold text-xs text-slate-850 flex items-center justify-center md:justify-end gap-1">
                    {activePeriod?.id === 'agustus-2026' ? 'Siti Hardianti F. K.' : 'Bendahara Iuran'}
                    {/* Circle check verified icon next to name */}
                    <span className="text-emerald-500 bg-emerald-50 rounded-full p-0.5">
                      <svg className="w-3 h-3" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                    </span>
                  </p>
                  <p className="text-[8.5px] text-slate-400 font-semibold mt-0.5">KasTwelvenine Official</p>
                </div>
              </div>
            </div>

          </div>
        </section>
      </div>

      {/* ---------------------------------------------------- */}
      {/* LOGIN MODAL */}
      {/* ---------------------------------------------------- */}
      <AnimatePresence>
        {showLoginModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/20 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.98 }}
              className="bg-white border border-slate-100 rounded-2xl p-5 max-w-xs w-full mx-4 shadow-md relative animate-fade"
            >
              <button
                onClick={() => setShowLoginModal(false)}
                className="absolute right-3.5 top-3.5 p-1 rounded hover:bg-slate-50 text-slate-400 hover:text-slate-750 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>

              <div className="text-center mb-5 select-none">
                <div className="inline-flex p-2.5 bg-slate-50 text-slate-700 rounded-xl mb-1.5 border border-slate-100">
                  <Lock className="w-5 h-5" />
                </div>
                <h3 className="text-xs font-bold text-slate-800">Login Bendahara Kelas</h3>
                <p className="text-[9px] text-slate-405 font-medium mt-0.5">Autentikasi admin untuk edit data kas.</p>
              </div>

              <form onSubmit={handleLoginSubmit} className="space-y-3">
                <div>
                  <label className="block text-[9px] font-bold text-slate-400 mb-1 uppercase">Username</label>
                  <input
                    type="text"
                    required
                    placeholder="Masukkan username..."
                    value={loginUsername}
                    onChange={(e) => setLoginUsername(e.target.value)}
                    className="w-full text-xs px-2.5 py-1.5 rounded-lg border border-slate-200 focus:outline-none focus:ring-1 focus:ring-slate-400 font-semibold"
                  />
                </div>

                <div>
                  <label className="block text-[9px] font-bold text-slate-400 mb-1 uppercase">Password</label>
                  <input
                    type="password"
                    required
                    placeholder="Masukkan password..."
                    value={loginPassword}
                    onChange={(e) => setLoginPassword(e.target.value)}
                    className="w-full text-xs px-2.5 py-1.5 rounded-lg border border-slate-200 focus:outline-none focus:ring-1 focus:ring-slate-400 font-semibold"
                  />
                </div>

                {loginError && (
                  <div className="p-2 rounded-lg bg-rose-50 border border-rose-100 text-[8.5px] font-bold text-rose-600 flex items-center gap-1">
                    <AlertCircle className="w-3.5 h-3.5 flex-shrink-0" />
                    <span>{loginError}</span>
                  </div>
                )}

                <button
                  type="submit"
                  className="w-full bg-slate-800 hover:bg-slate-900 text-white text-xs font-bold py-2 rounded-lg transition-all"
                >
                  Masuk Sesi Bendahara
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Toast Notification Center Modal */}
      <AnimatePresence>
        {toast.show && (
          <div className="fixed inset-0 z-50 flex items-center justify-center px-4 bg-slate-900/10 backdrop-blur-[2px]">
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 10 }}
              transition={{ type: 'spring', damping: 25, stiffness: 350 }}
              className="bg-white border border-slate-100 rounded-3xl p-6 shadow-xl max-w-xs w-full text-center flex flex-col items-center gap-4"
            >
              {toast.type === 'success' ? (
                <motion.div 
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.1, type: 'spring', damping: 10 }}
                  className="w-14 h-14 rounded-full bg-emerald-50 text-emerald-500 flex items-center justify-center shadow-inner"
                >
                  <svg className="w-7 h-7 stroke-[3]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <motion.path 
                      initial={{ pathLength: 0 }}
                      animate={{ pathLength: 1 }}
                      transition={{ duration: 0.3, delay: 0.2 }}
                      strokeLinecap="round" 
                      strokeLinejoin="round" 
                      d="M5 13l4 4L19 7" 
                    />
                  </svg>
                </motion.div>
              ) : (
                <motion.div 
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.1, type: 'spring', damping: 10 }}
                  className="w-14 h-14 rounded-full bg-rose-50 text-rose-500 flex items-center justify-center shadow-inner"
                >
                  <svg className="w-7 h-7 stroke-[3]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <motion.path 
                      initial={{ pathLength: 0 }}
                      animate={{ pathLength: 1 }}
                      transition={{ duration: 0.3, delay: 0.2 }}
                      strokeLinecap="round" 
                      strokeLinejoin="round" 
                      d="M6 18L18 6M6 6l12 12" 
                    />
                  </svg>
                </motion.div>
              )}
              
              <div className="space-y-1">
                <h4 className="text-xs font-extrabold text-slate-800">
                  {toast.type === 'success' ? 'Berhasil! ✨' : 'Perhatian ⚠️'}
                </h4>
                <p className="text-[10px] font-semibold text-slate-400 leading-relaxed">
                  {toast.message}
                </p>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Footer */}
      <footer className="border-t border-slate-100 bg-white py-4 mt-8">
        <div className="max-w-5xl mx-auto px-4 text-center text-[10px] font-semibold text-slate-400">
          © {new Date().getFullYear()} KasTwelvenine · Transparansi Kas Kelas yang Terbuka & Rapi.
        </div>
      </footer>

    </div>
  );
}
