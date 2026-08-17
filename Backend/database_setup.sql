-- =========================================================================
-- DATABASE SETUP & TEST SCRIPT FOR SISTEM UANG KAS KELAS 12-9 (FULL DATA)
-- =========================================================================
-- Platform: MySQL (Railway / Aiven / Local)
-- This script contains:
--   1. DDL Full Script (CREATE TABLE with Constraints & Foreign Keys)
--   2. DML Insert Script (Seeders for ALL 34 Students & 12 Periods)
--   3. Dashboard Query Scripts (SELECT & JOIN examples)
-- =========================================================================

-- -------------------------------------------------------------------------
-- 1. DDL FULL SCRIPT (DROP & CREATE TABLES)
-- -------------------------------------------------------------------------

-- Nonaktifkan pengecekan foreign key sementara untuk memudahkan proses drop tabel
SET FOREIGN_KEY_CHECKS = 0;

DROP TABLE IF EXISTS transactions;
DROP TABLE IF EXISTS payments;
DROP TABLE IF EXISTS periods;
DROP TABLE IF EXISTS students;

-- Aktifkan kembali pengecekan foreign key
SET FOREIGN_KEY_CHECKS = 1;

-- Tabel 1: Students (Siswa)
CREATE TABLE students (
    id VARCHAR(10) PRIMARY KEY,
    name VARCHAR(100) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Tabel 2: Periods (Periode / Bulan Uang Kas)
CREATE TABLE periods (
    id VARCHAR(50) PRIMARY KEY,
    name VARCHAR(50) NOT NULL,
    active TINYINT(1) DEFAULT 0,
    initial_balance INT DEFAULT 0,
    cash_amount INT DEFAULT 0,
    e_wallet_amount INT DEFAULT 0,
    weekly_fee INT DEFAULT 2000
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Tabel 3: Payments (Pembayaran Kas per Minggu per Siswa)
CREATE TABLE payments (
    id VARCHAR(60) PRIMARY KEY,
    student_id VARCHAR(10) NOT NULL,
    period_id VARCHAR(50) NOT NULL,
    week1 TINYINT(1) DEFAULT 0,
    week2 TINYINT(1) DEFAULT 0,
    week3 TINYINT(1) DEFAULT 0,
    week4 TINYINT(1) DEFAULT 0,
    FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE,
    FOREIGN KEY (period_id) REFERENCES periods(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Tabel 4: Transactions (Riwayat Keuangan / Pemasukan & Pengeluaran)
CREATE TABLE transactions (
    id VARCHAR(50) PRIMARY KEY,
    period_id VARCHAR(50) NOT NULL,
    date DATE NOT NULL,
    description VARCHAR(255) NOT NULL,
    type ENUM('pemasukan', 'pengeluaran') NOT NULL,
    amount INT NOT NULL,
    is_auto TINYINT(1) DEFAULT 0,
    week_index INT DEFAULT NULL,
    FOREIGN KEY (period_id) REFERENCES periods(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;


-- -------------------------------------------------------------------------
-- 2. DML INSERT SCRIPT (SEEDERS - DATA LENGKAP)
-- -------------------------------------------------------------------------

-- A. Seeding Tabel Students (Seluruh 34 Siswa Kelas 12-9)
INSERT INTO students (id, name) VALUES
('S01', 'ALIZA NUR CAHYA'),
('S02', 'CHRISTIAN RAMADHAN'),
('S03', 'DANELA HERAWATI'),
('S04', 'DEBI TALITA JASMIN'),
('S05', 'FITRAH SAUMIL AKMAL'),
('S06', 'KHAIRUNISA AULIA'),
('S07', 'KHOERUL ANAM'),
('S08', 'M. KHAIDAR MUHARAM'),
('S09', 'M. ROSAN RIZQINA MUNAJAT'),
('S10', 'M.RIZKY RAHMATULLAH'),
('S11', 'MARSYA MAULIDINA'),
('S12', 'MAULIDA MARVA KUSUMA'),
('S13', 'MOETIA BALQIS'),
('S14', 'MUHAMAD FARDAN NURKHOLIK'),
('S15', 'MUHAMMAD FAIZ FACHRIZA'),
('S16', 'MUTIARA KASIH'),
('S17', 'NATASYA SEPTIANI MAULIDAH'),
('S18', 'NURAULIA ZIKRA JALIL'),
('S19', 'NURSITI NAFISA'),
('S20', 'RATU BALQIS'),
('S21', 'RARA DERINA'),
('S22', 'REVA LIA PUTRI'),
('S23', 'SELVI SELVIANI'),
('S24', 'SITI ANISA BASRI'),
('S25', 'SITI FATMAH'),
('S26', 'SITI HARDIANTI FAZRIAH K'),
('S27', 'SITI NAPISAH JULPAH'),
('S28', 'SITI NURUL ALFIAH'),
('S29', 'SITI ZAHRA HAERUNISA'),
('S30', 'SUSI RAHMAWATI'),
('S31', 'VERLITA KHANZA AFIFA DIANDRAP'),
('S32', 'VIVI JULIANTI'),
('S33', 'WINDI SAHARA'),
('S34', 'YARID NURMANSYAH');

-- B. Seeding Tabel Periods (Seluruh 12 Periode)
INSERT INTO periods (id, name, active, initial_balance, cash_amount, e_wallet_amount, weekly_fee) VALUES
('agustus-2026', 'Agustus 2026', 1, 0, 180000, 50000, 2000),
('september-2026', 'September 2026', 0, 0, 0, 0, 2000),
('oktober-2026', 'Oktober 2026', 0, 0, 0, 0, 2000),
('november-2026', 'November 2026', 0, 0, 0, 0, 2000),
('desember-2026', 'Desember 2026', 0, 0, 0, 0, 2000),
('januari-2027', 'Januari 2027', 0, 0, 0, 0, 2000),
('februari-2027', 'Februari 2027', 0, 0, 0, 0, 2000),
('maret-2027', 'Maret 2027', 0, 0, 0, 0, 2000),
('april-2027', 'April 2027', 0, 0, 0, 0, 2000),
('mei-2027', 'Mei 2027', 0, 0, 0, 0, 2000),
('juni-2027', 'Juni 2027', 0, 0, 0, 0, 2000),
('juli-2027', 'Juli 2027', 0, 0, 0, 0, 2000);

-- C. Seeding Tabel Payments (Lengkap 408 Baris: 34 Siswa x 12 Periode)
-- Memastikan integritas referensial terjaga dengan status pembayaran awal
INSERT INTO payments (id, student_id, period_id, week1, week2, week3, week4) VALUES
-- === PERIODE: agustus-2026 (Periode Aktif dengan data bervariasi) ===
('agustus-2026-S01', 'S01', 'agustus-2026', 1, 1, 1, 1),
('agustus-2026-S02', 'S02', 'agustus-2026', 1, 1, 1, 0),
('agustus-2026-S03', 'S03', 'agustus-2026', 1, 1, 0, 0),
('agustus-2026-S04', 'S04', 'agustus-2026', 1, 0, 0, 0),
('agustus-2026-S05', 'S05', 'agustus-2026', 0, 0, 0, 0),
('agustus-2026-S06', 'S06', 'agustus-2026', 1, 1, 1, 1),
('agustus-2026-S07', 'S07', 'agustus-2026', 1, 1, 1, 1),
('agustus-2026-S08', 'S08', 'agustus-2026', 1, 1, 0, 0),
('agustus-2026-S09', 'S09', 'agustus-2026', 1, 1, 1, 1),
('agustus-2026-S10', 'S10', 'agustus-2026', 1, 1, 1, 0),
('agustus-2026-S11', 'S11', 'agustus-2026', 1, 1, 1, 1),
('agustus-2026-S12', 'S12', 'agustus-2026', 1, 0, 0, 0),
('agustus-2026-S13', 'S13', 'agustus-2026', 1, 1, 1, 1),
('agustus-2026-S14', 'S14', 'agustus-2026', 1, 1, 1, 1),
('agustus-2026-S15', 'S15', 'agustus-2026', 1, 1, 1, 1),
('agustus-2026-S16', 'S16', 'agustus-2026', 1, 1, 1, 0),
('agustus-2026-S17', 'S17', 'agustus-2026', 1, 1, 1, 1),
('agustus-2026-S18', 'S18', 'agustus-2026', 1, 1, 0, 0),
('agustus-2026-S19', 'S19', 'agustus-2026', 1, 1, 1, 1),
('agustus-2026-S20', 'S20', 'agustus-2026', 1, 1, 1, 1),
('agustus-2026-S21', 'S21', 'agustus-2026', 1, 1, 0, 0),
('agustus-2026-S22', 'S22', 'agustus-2026', 1, 1, 1, 1),
('agustus-2026-S23', 'S23', 'agustus-2026', 1, 1, 1, 1),
('agustus-2026-S24', 'S24', 'agustus-2026', 1, 1, 0, 0),
('agustus-2026-S25', 'S25', 'agustus-2026', 1, 1, 1, 1),
('agustus-2026-S26', 'S26', 'agustus-2026', 1, 1, 1, 1),
('agustus-2026-S27', 'S27', 'agustus-2026', 1, 1, 0, 0),
('agustus-2026-S28', 'S28', 'agustus-2026', 1, 1, 1, 1),
('agustus-2026-S29', 'S29', 'agustus-2026', 1, 1, 1, 1),
('agustus-2026-S30', 'S30', 'agustus-2026', 1, 1, 0, 0),
('agustus-2026-S31', 'S31', 'agustus-2026', 1, 1, 1, 1),
('agustus-2026-S32', 'S32', 'agustus-2026', 1, 1, 1, 1),
('agustus-2026-S33', 'S33', 'agustus-2026', 1, 1, 0, 0),
('agustus-2026-S34', 'S34', 'agustus-2026', 1, 1, 1, 1),

-- === PERIODE: september-2026 ===
('september-2026-S01', 'S01', 'september-2026', 0, 0, 0, 0),
('september-2026-S02', 'S02', 'september-2026', 0, 0, 0, 0),
('september-2026-S03', 'S03', 'september-2026', 0, 0, 0, 0),
('september-2026-S04', 'S04', 'september-2026', 0, 0, 0, 0),
('september-2026-S05', 'S05', 'september-2026', 0, 0, 0, 0),
('september-2026-S06', 'S06', 'september-2026', 0, 0, 0, 0),
('september-2026-S07', 'S07', 'september-2026', 0, 0, 0, 0),
('september-2026-S08', 'S08', 'september-2026', 0, 0, 0, 0),
('september-2026-S09', 'S09', 'september-2026', 0, 0, 0, 0),
('september-2026-S10', 'S10', 'september-2026', 0, 0, 0, 0),
('september-2026-S11', 'S11', 'september-2026', 0, 0, 0, 0),
('september-2026-S12', 'S12', 'september-2026', 0, 0, 0, 0),
('september-2026-S13', 'S13', 'september-2026', 0, 0, 0, 0),
('september-2026-S14', 'S14', 'september-2026', 0, 0, 0, 0),
('september-2026-S15', 'S15', 'september-2026', 0, 0, 0, 0),
('september-2026-S16', 'S16', 'september-2026', 0, 0, 0, 0),
('september-2026-S17', 'S17', 'september-2026', 0, 0, 0, 0),
('september-2026-S18', 'S18', 'september-2026', 0, 0, 0, 0),
('september-2026-S19', 'S19', 'september-2026', 0, 0, 0, 0),
('september-2026-S20', 'S20', 'september-2026', 0, 0, 0, 0),
('september-2026-S21', 'S21', 'september-2026', 0, 0, 0, 0),
('september-2026-S22', 'S22', 'september-2026', 0, 0, 0, 0),
('september-2026-S23', 'S23', 'september-2026', 0, 0, 0, 0),
('september-2026-S24', 'S24', 'september-2026', 0, 0, 0, 0),
('september-2026-S25', 'S25', 'september-2026', 0, 0, 0, 0),
('september-2026-S26', 'S26', 'september-2026', 0, 0, 0, 0),
('september-2026-S27', 'S27', 'september-2026', 0, 0, 0, 0),
('september-2026-S28', 'S28', 'september-2026', 0, 0, 0, 0),
('september-2026-S29', 'S29', 'september-2026', 0, 0, 0, 0),
('september-2026-S30', 'S30', 'september-2026', 0, 0, 0, 0),
('september-2026-S31', 'S31', 'september-2026', 0, 0, 0, 0),
('september-2026-S32', 'S32', 'september-2026', 0, 0, 0, 0),
('september-2026-S33', 'S33', 'september-2026', 0, 0, 0, 0),
('september-2026-S34', 'S34', 'september-2026', 0, 0, 0, 0),

-- === PERIODE: oktober-2026 ===
('oktober-2026-S01', 'S01', 'oktober-2026', 0, 0, 0, 0),
('oktober-2026-S02', 'S02', 'oktober-2026', 0, 0, 0, 0),
('oktober-2026-S03', 'S03', 'oktober-2026', 0, 0, 0, 0),
('oktober-2026-S04', 'S04', 'oktober-2026', 0, 0, 0, 0),
('oktober-2026-S05', 'S05', 'oktober-2026', 0, 0, 0, 0),
('oktober-2026-S06', 'S06', 'oktober-2026', 0, 0, 0, 0),
('oktober-2026-S07', 'S07', 'oktober-2026', 0, 0, 0, 0),
('oktober-2026-S08', 'S08', 'oktober-2026', 0, 0, 0, 0),
('oktober-2026-S09', 'S09', 'oktober-2026', 0, 0, 0, 0),
('oktober-2026-S10', 'S10', 'oktober-2026', 0, 0, 0, 0),
('oktober-2026-S11', 'S11', 'oktober-2026', 0, 0, 0, 0),
('oktober-2026-S12', 'S12', 'oktober-2026', 0, 0, 0, 0),
('oktober-2026-S13', 'S13', 'oktober-2026', 0, 0, 0, 0),
('oktober-2026-S14', 'S14', 'oktober-2026', 0, 0, 0, 0),
('oktober-2026-S15', 'S15', 'oktober-2026', 0, 0, 0, 0),
('oktober-2026-S16', 'S16', 'oktober-2026', 0, 0, 0, 0),
('oktober-2026-S17', 'S17', 'oktober-2026', 0, 0, 0, 0),
('oktober-2026-S18', 'S18', 'oktober-2026', 0, 0, 0, 0),
('oktober-2026-S19', 'S19', 'oktober-2026', 0, 0, 0, 0),
('oktober-2026-S20', 'S20', 'oktober-2026', 0, 0, 0, 0),
('oktober-2026-S21', 'S21', 'oktober-2026', 0, 0, 0, 0),
('oktober-2026-S22', 'S22', 'oktober-2026', 0, 0, 0, 0),
('oktober-2026-S23', 'S23', 'oktober-2026', 0, 0, 0, 0),
('oktober-2026-S24', 'S24', 'oktober-2026', 0, 0, 0, 0),
('oktober-2026-S25', 'S25', 'oktober-2026', 0, 0, 0, 0),
('oktober-2026-S26', 'S26', 'oktober-2026', 0, 0, 0, 0),
('oktober-2026-S27', 'S27', 'oktober-2026', 0, 0, 0, 0),
('oktober-2026-S28', 'S28', 'oktober-2026', 0, 0, 0, 0),
('oktober-2026-S29', 'S29', 'oktober-2026', 0, 0, 0, 0),
('oktober-2026-S30', 'S30', 'oktober-2026', 0, 0, 0, 0),
('oktober-2026-S31', 'S31', 'oktober-2026', 0, 0, 0, 0),
('oktober-2026-S32', 'S32', 'oktober-2026', 0, 0, 0, 0),
('oktober-2026-S33', 'S33', 'oktober-2026', 0, 0, 0, 0),
('oktober-2026-S34', 'S34', 'oktober-2026', 0, 0, 0, 0),

-- === PERIODE: november-2026 ===
('november-2026-S01', 'S01', 'november-2026', 0, 0, 0, 0),
('november-2026-S02', 'S02', 'november-2026', 0, 0, 0, 0),
('november-2026-S03', 'S03', 'november-2026', 0, 0, 0, 0),
('november-2026-S04', 'S04', 'november-2026', 0, 0, 0, 0),
('november-2026-S05', 'S05', 'november-2026', 0, 0, 0, 0),
('november-2026-S06', 'S06', 'november-2026', 0, 0, 0, 0),
('november-2026-S07', 'S07', 'november-2026', 0, 0, 0, 0),
('november-2026-S08', 'S08', 'november-2026', 0, 0, 0, 0),
('november-2026-S09', 'S09', 'november-2026', 0, 0, 0, 0),
('november-2026-S10', 'S10', 'november-2026', 0, 0, 0, 0),
('november-2026-S11', 'S11', 'november-2026', 0, 0, 0, 0),
('november-2026-S12', 'S12', 'november-2026', 0, 0, 0, 0),
('november-2026-S13', 'S13', 'november-2026', 0, 0, 0, 0),
('november-2026-S14', 'S14', 'november-2026', 0, 0, 0, 0),
('november-2026-S15', 'S15', 'november-2026', 0, 0, 0, 0),
('november-2026-S16', 'S16', 'november-2026', 0, 0, 0, 0),
('november-2026-S17', 'S17', 'november-2026', 0, 0, 0, 0),
('november-2026-S18', 'S18', 'november-2026', 0, 0, 0, 0),
('november-2026-S19', 'S19', 'november-2026', 0, 0, 0, 0),
('november-2026-S20', 'S20', 'november-2026', 0, 0, 0, 0),
('november-2026-S21', 'S21', 'november-2026', 0, 0, 0, 0),
('november-2026-S22', 'S22', 'november-2026', 0, 0, 0, 0),
('november-2026-S23', 'S23', 'november-2026', 0, 0, 0, 0),
('november-2026-S24', 'S24', 'november-2026', 0, 0, 0, 0),
('november-2026-S25', 'S25', 'november-2026', 0, 0, 0, 0),
('november-2026-S26', 'S26', 'november-2026', 0, 0, 0, 0),
('november-2026-S27', 'S27', 'november-2026', 0, 0, 0, 0),
('november-2026-S28', 'S28', 'november-2026', 0, 0, 0, 0),
('november-2026-S29', 'S29', 'november-2026', 0, 0, 0, 0),
('november-2026-S30', 'S30', 'november-2026', 0, 0, 0, 0),
('november-2026-S31', 'S31', 'november-2026', 0, 0, 0, 0),
('november-2026-S32', 'S32', 'november-2026', 0, 0, 0, 0),
('november-2026-S33', 'S33', 'november-2026', 0, 0, 0, 0),
('november-2026-S34', 'S34', 'november-2026', 0, 0, 0, 0),

-- === PERIODE: desember-2026 ===
('desember-2026-S01', 'S01', 'desember-2026', 0, 0, 0, 0),
('desember-2026-S02', 'S02', 'desember-2026', 0, 0, 0, 0),
('desember-2026-S03', 'S03', 'desember-2026', 0, 0, 0, 0),
('desember-2026-S04', 'S04', 'desember-2026', 0, 0, 0, 0),
('desember-2026-S05', 'S05', 'desember-2026', 0, 0, 0, 0),
('desember-2026-S06', 'S06', 'desember-2026', 0, 0, 0, 0),
('desember-2026-S07', 'S07', 'desember-2026', 0, 0, 0, 0),
('desember-2026-S08', 'S08', 'desember-2026', 0, 0, 0, 0),
('desember-2026-S09', 'S09', 'desember-2026', 0, 0, 0, 0),
('desember-2026-S10', 'S10', 'desember-2026', 0, 0, 0, 0),
('desember-2026-S11', 'S11', 'desember-2026', 0, 0, 0, 0),
('desember-2026-S12', 'S12', 'desember-2026', 0, 0, 0, 0),
('desember-2026-S13', 'S13', 'desember-2026', 0, 0, 0, 0),
('desember-2026-S14', 'S14', 'desember-2026', 0, 0, 0, 0),
('desember-2026-S15', 'S15', 'desember-2026', 0, 0, 0, 0),
('desember-2026-S16', 'S16', 'desember-2026', 0, 0, 0, 0),
('desember-2026-S17', 'S17', 'desember-2026', 0, 0, 0, 0),
('desember-2026-S18', 'S18', 'desember-2026', 0, 0, 0, 0),
('desember-2026-S19', 'S19', 'desember-2026', 0, 0, 0, 0),
('desember-2026-S20', 'S20', 'desember-2026', 0, 0, 0, 0),
('desember-2026-S21', 'S21', 'desember-2026', 0, 0, 0, 0),
('desember-2026-S22', 'S22', 'desember-2026', 0, 0, 0, 0),
('desember-2026-S23', 'S23', 'desember-2026', 0, 0, 0, 0),
('desember-2026-S24', 'S24', 'desember-2026', 0, 0, 0, 0),
('desember-2026-S25', 'S25', 'desember-2026', 0, 0, 0, 0),
('desember-2026-S26', 'S26', 'desember-2026', 0, 0, 0, 0),
('desember-2026-S27', 'S27', 'desember-2026', 0, 0, 0, 0),
('desember-2026-S28', 'S28', 'desember-2026', 0, 0, 0, 0),
('desember-2026-S29', 'S29', 'desember-2026', 0, 0, 0, 0),
('desember-2026-S30', 'S30', 'desember-2026', 0, 0, 0, 0),
('desember-2026-S31', 'S31', 'desember-2026', 0, 0, 0, 0),
('desember-2026-S32', 'S32', 'desember-2026', 0, 0, 0, 0),
('desember-2026-S33', 'S33', 'desember-2026', 0, 0, 0, 0),
('desember-2026-S34', 'S34', 'desember-2026', 0, 0, 0, 0),

-- === PERIODE: januari-2027 ===
('januari-2027-S01', 'S01', 'januari-2027', 0, 0, 0, 0),
('januari-2027-S02', 'S02', 'januari-2027', 0, 0, 0, 0),
('januari-2027-S03', 'S03', 'januari-2027', 0, 0, 0, 0),
('januari-2027-S04', 'S04', 'januari-2027', 0, 0, 0, 0),
('januari-2027-S05', 'S05', 'januari-2027', 0, 0, 0, 0),
('januari-2027-S06', 'S06', 'januari-2027', 0, 0, 0, 0),
('januari-2027-S07', 'S07', 'januari-2027', 0, 0, 0, 0),
('januari-2027-S08', 'S08', 'januari-2027', 0, 0, 0, 0),
('januari-2027-S09', 'S09', 'januari-2027', 0, 0, 0, 0),
('januari-2027-S10', 'S10', 'januari-2027', 0, 0, 0, 0),
('januari-2027-S11', 'S11', 'januari-2027', 0, 0, 0, 0),
('januari-2027-S12', 'S12', 'januari-2027', 0, 0, 0, 0),
('januari-2027-S13', 'S13', 'januari-2027', 0, 0, 0, 0),
('januari-2027-S14', 'S14', 'januari-2027', 0, 0, 0, 0),
('januari-2027-S15', 'S15', 'januari-2027', 0, 0, 0, 0),
('januari-2027-S16', 'S16', 'januari-2027', 0, 0, 0, 0),
('januari-2027-S17', 'S17', 'januari-2027', 0, 0, 0, 0),
('januari-2027-S18', 'S18', 'januari-2027', 0, 0, 0, 0),
('januari-2027-S19', 'S19', 'januari-2027', 0, 0, 0, 0),
('januari-2027-S20', 'S20', 'januari-2027', 0, 0, 0, 0),
('januari-2027-S21', 'S21', 'januari-2027', 0, 0, 0, 0),
('januari-2027-S22', 'S22', 'januari-2027', 0, 0, 0, 0),
('januari-2027-S23', 'S23', 'januari-2027', 0, 0, 0, 0),
('januari-2027-S24', 'S24', 'januari-2027', 0, 0, 0, 0),
('januari-2027-S25', 'S25', 'januari-2027', 0, 0, 0, 0),
('januari-2027-S26', 'S26', 'januari-2027', 0, 0, 0, 0),
('januari-2027-S27', 'S27', 'januari-2027', 0, 0, 0, 0),
('januari-2027-S28', 'S28', 'januari-2027', 0, 0, 0, 0),
('januari-2027-S29', 'S29', 'januari-2027', 0, 0, 0, 0),
('januari-2027-S30', 'S30', 'januari-2027', 0, 0, 0, 0),
('januari-2027-S31', 'S31', 'januari-2027', 0, 0, 0, 0),
('januari-2027-S32', 'S32', 'januari-2027', 0, 0, 0, 0),
('januari-2027-S33', 'S33', 'januari-2027', 0, 0, 0, 0),
('januari-2027-S34', 'S34', 'januari-2027', 0, 0, 0, 0),

-- === PERIODE: februari-2027 ===
('februari-2027-S01', 'S01', 'februari-2027', 0, 0, 0, 0),
('februari-2027-S02', 'S02', 'februari-2027', 0, 0, 0, 0),
('februari-2027-S03', 'S03', 'februari-2027', 0, 0, 0, 0),
('februari-2027-S04', 'S04', 'februari-2027', 0, 0, 0, 0),
('februari-2027-S05', 'S05', 'februari-2027', 0, 0, 0, 0),
('februari-2027-S06', 'S06', 'februari-2027', 0, 0, 0, 0),
('februari-2027-S07', 'S07', 'februari-2027', 0, 0, 0, 0),
('februari-2027-S08', 'S08', 'februari-2027', 0, 0, 0, 0),
('februari-2027-S09', 'S09', 'februari-2027', 0, 0, 0, 0),
('februari-2027-S10', 'S10', 'februari-2027', 0, 0, 0, 0),
('februari-2027-S11', 'S11', 'februari-2027', 0, 0, 0, 0),
('februari-2027-S12', 'S12', 'februari-2027', 0, 0, 0, 0),
('februari-2027-S13', 'S13', 'februari-2027', 0, 0, 0, 0),
('februari-2027-S14', 'S14', 'februari-2027', 0, 0, 0, 0),
('februari-2027-S15', 'S15', 'februari-2027', 0, 0, 0, 0),
('februari-2027-S16', 'S16', 'februari-2027', 0, 0, 0, 0),
('februari-2027-S17', 'S17', 'februari-2027', 0, 0, 0, 0),
('februari-2027-S18', 'S18', 'februari-2027', 0, 0, 0, 0),
('februari-2027-S19', 'S19', 'februari-2027', 0, 0, 0, 0),
('februari-2027-S20', 'S20', 'februari-2027', 0, 0, 0, 0),
('februari-2027-S21', 'S21', 'februari-2027', 0, 0, 0, 0),
('februari-2027-S22', 'S22', 'februari-2027', 0, 0, 0, 0),
('februari-2027-S23', 'S23', 'februari-2027', 0, 0, 0, 0),
('februari-2027-S24', 'S24', 'februari-2027', 0, 0, 0, 0),
('februari-2027-S25', 'S25', 'februari-2027', 0, 0, 0, 0),
('februari-2027-S26', 'S26', 'februari-2027', 0, 0, 0, 0),
('februari-2027-S27', 'S27', 'februari-2027', 0, 0, 0, 0),
('februari-2027-S28', 'S28', 'februari-2027', 0, 0, 0, 0),
('februari-2027-S29', 'S29', 'februari-2027', 0, 0, 0, 0),
('februari-2027-S30', 'S30', 'februari-2027', 0, 0, 0, 0),
('februari-2027-S31', 'S31', 'februari-2027', 0, 0, 0, 0),
('februari-2027-S32', 'S32', 'februari-2027', 0, 0, 0, 0),
('februari-2027-S33', 'S33', 'februari-2027', 0, 0, 0, 0),
('februari-2027-S34', 'S34', 'februari-2027', 0, 0, 0, 0),

-- === PERIODE: maret-2027 ===
('maret-2027-S01', 'S01', 'maret-2027', 0, 0, 0, 0),
('maret-2027-S02', 'S02', 'maret-2027', 0, 0, 0, 0),
('maret-2027-S03', 'S03', 'maret-2027', 0, 0, 0, 0),
('maret-2027-S04', 'S04', 'maret-2027', 0, 0, 0, 0),
('maret-2027-S05', 'S05', 'maret-2027', 0, 0, 0, 0),
('maret-2027-S06', 'S06', 'maret-2027', 0, 0, 0, 0),
('maret-2027-S07', 'S07', 'maret-2027', 0, 0, 0, 0),
('maret-2027-S08', 'S08', 'maret-2027', 0, 0, 0, 0),
('maret-2027-S09', 'S09', 'maret-2027', 0, 0, 0, 0),
('maret-2027-S10', 'S10', 'maret-2027', 0, 0, 0, 0),
('maret-2027-S11', 'S11', 'maret-2027', 0, 0, 0, 0),
('maret-2027-S12', 'S12', 'maret-2027', 0, 0, 0, 0),
('maret-2027-S13', 'S13', 'maret-2027', 0, 0, 0, 0),
('maret-2027-S14', 'S14', 'maret-2027', 0, 0, 0, 0),
('maret-2027-S15', 'S15', 'maret-2027', 0, 0, 0, 0),
('maret-2027-S16', 'S16', 'maret-2027', 0, 0, 0, 0),
('maret-2027-S17', 'S17', 'maret-2027', 0, 0, 0, 0),
('maret-2027-S18', 'S18', 'maret-2027', 0, 0, 0, 0),
('maret-2027-S19', 'S19', 'maret-2027', 0, 0, 0, 0),
('maret-2027-S20', 'S20', 'maret-2027', 0, 0, 0, 0),
('maret-2027-S21', 'S21', 'maret-2027', 0, 0, 0, 0),
('maret-2027-S22', 'S22', 'maret-2027', 0, 0, 0, 0),
('maret-2027-S23', 'S23', 'maret-2027', 0, 0, 0, 0),
('maret-2027-S24', 'S24', 'maret-2027', 0, 0, 0, 0),
('maret-2027-S25', 'S25', 'maret-2027', 0, 0, 0, 0),
('maret-2027-S26', 'S26', 'maret-2027', 0, 0, 0, 0),
('maret-2027-S27', 'S27', 'maret-2027', 0, 0, 0, 0),
('maret-2027-S28', 'S28', 'maret-2027', 0, 0, 0, 0),
('maret-2027-S29', 'S29', 'maret-2027', 0, 0, 0, 0),
('maret-2027-S30', 'S30', 'maret-2027', 0, 0, 0, 0),
('maret-2027-S31', 'S31', 'maret-2027', 0, 0, 0, 0),
('maret-2027-S32', 'S32', 'maret-2027', 0, 0, 0, 0),
('maret-2027-S33', 'S33', 'maret-2027', 0, 0, 0, 0),
('maret-2027-S34', 'S34', 'maret-2027', 0, 0, 0, 0),

-- === PERIODE: april-2027 ===
('april-2027-S01', 'S01', 'april-2027', 0, 0, 0, 0),
('april-2027-S02', 'S02', 'april-2027', 0, 0, 0, 0),
('april-2027-S03', 'S03', 'april-2027', 0, 0, 0, 0),
('april-2027-S04', 'S04', 'april-2027', 0, 0, 0, 0),
('april-2027-S05', 'S05', 'april-2027', 0, 0, 0, 0),
('april-2027-S06', 'S06', 'april-2027', 0, 0, 0, 0),
('april-2027-S07', 'S07', 'april-2027', 0, 0, 0, 0),
('april-2027-S08', 'S08', 'april-2027', 0, 0, 0, 0),
('april-2027-S09', 'S09', 'april-2027', 0, 0, 0, 0),
('april-2027-S10', 'S10', 'april-2027', 0, 0, 0, 0),
('april-2027-S11', 'S11', 'april-2027', 0, 0, 0, 0),
('april-2027-S12', 'S12', 'april-2027', 0, 0, 0, 0),
('april-2027-S13', 'S13', 'april-2027', 0, 0, 0, 0),
('april-2027-S14', 'S14', 'april-2027', 0, 0, 0, 0),
('april-2027-S15', 'S15', 'april-2027', 0, 0, 0, 0),
('april-2027-S16', 'S16', 'april-2027', 0, 0, 0, 0),
('april-2027-S17', 'S17', 'april-2027', 0, 0, 0, 0),
('april-2027-S18', 'S18', 'april-2027', 0, 0, 0, 0),
('april-2027-S19', 'S19', 'april-2027', 0, 0, 0, 0),
('april-2027-S20', 'S20', 'april-2027', 0, 0, 0, 0),
('april-2027-S21', 'S21', 'april-2027', 0, 0, 0, 0),
('april-2027-S22', 'S22', 'april-2027', 0, 0, 0, 0),
('april-2027-S23', 'S23', 'april-2027', 0, 0, 0, 0),
('april-2027-S24', 'S24', 'april-2027', 0, 0, 0, 0),
('april-2027-S25', 'S25', 'april-2027', 0, 0, 0, 0),
('april-2027-S26', 'S26', 'april-2027', 0, 0, 0, 0),
('april-2027-S27', 'S27', 'april-2027', 0, 0, 0, 0),
('april-2027-S28', 'S28', 'april-2027', 0, 0, 0, 0),
('april-2027-S29', 'S29', 'april-2027', 0, 0, 0, 0),
('april-2027-S30', 'S30', 'april-2027', 0, 0, 0, 0),
('april-2027-S31', 'S31', 'april-2027', 0, 0, 0, 0),
('april-2027-S32', 'S32', 'april-2027', 0, 0, 0, 0),
('april-2027-S33', 'S33', 'april-2027', 0, 0, 0, 0),
('april-2027-S34', 'S34', 'april-2027', 0, 0, 0, 0),

-- === PERIODE: mei-2027 ===
('mei-2027-S01', 'S01', 'mei-2027', 0, 0, 0, 0),
('mei-2027-S02', 'S02', 'mei-2027', 0, 0, 0, 0),
('mei-2027-S03', 'S03', 'mei-2027', 0, 0, 0, 0),
('mei-2027-S04', 'S04', 'mei-2027', 0, 0, 0, 0),
('mei-2027-S05', 'S05', 'mei-2027', 0, 0, 0, 0),
('mei-2027-S06', 'S06', 'mei-2027', 0, 0, 0, 0),
('mei-2027-S07', 'S07', 'mei-2027', 0, 0, 0, 0),
('mei-2027-S08', 'S08', 'mei-2027', 0, 0, 0, 0),
('mei-2027-S09', 'S09', 'mei-2027', 0, 0, 0, 0),
('mei-2027-S10', 'S10', 'mei-2027', 0, 0, 0, 0),
('mei-2027-S11', 'S11', 'mei-2027', 0, 0, 0, 0),
('mei-2027-S12', 'S12', 'mei-2027', 0, 0, 0, 0),
('mei-2027-S13', 'S13', 'mei-2027', 0, 0, 0, 0),
('mei-2027-S14', 'S14', 'mei-2027', 0, 0, 0, 0),
('mei-2027-S15', 'S15', 'mei-2027', 0, 0, 0, 0),
('mei-2027-S16', 'S16', 'mei-2027', 0, 0, 0, 0),
('mei-2027-S17', 'S17', 'mei-2027', 0, 0, 0, 0),
('mei-2027-S18', 'S18', 'mei-2027', 0, 0, 0, 0),
('mei-2027-S19', 'S19', 'mei-2027', 0, 0, 0, 0),
('mei-2027-S20', 'S20', 'mei-2027', 0, 0, 0, 0),
('mei-2027-S21', 'S21', 'mei-2027', 0, 0, 0, 0),
('mei-2027-S22', 'S22', 'mei-2027', 0, 0, 0, 0),
('mei-2027-S23', 'S23', 'mei-2027', 0, 0, 0, 0),
('mei-2027-S24', 'S24', 'mei-2027', 0, 0, 0, 0),
('mei-2027-S25', 'S25', 'mei-2027', 0, 0, 0, 0),
('mei-2027-S26', 'S26', 'mei-2027', 0, 0, 0, 0),
('mei-2027-S27', 'S27', 'mei-2027', 0, 0, 0, 0),
('mei-2027-S28', 'S28', 'mei-2027', 0, 0, 0, 0),
('mei-2027-S29', 'S29', 'mei-2027', 0, 0, 0, 0),
('mei-2027-S30', 'S30', 'mei-2027', 0, 0, 0, 0),
('mei-2027-S31', 'S31', 'mei-2027', 0, 0, 0, 0),
('mei-2027-S32', 'S32', 'mei-2027', 0, 0, 0, 0),
('mei-2027-S33', 'S33', 'mei-2027', 0, 0, 0, 0),
('mei-2027-S34', 'S34', 'mei-2027', 0, 0, 0, 0),

-- === PERIODE: juni-2027 ===
('juni-2027-S01', 'S01', 'juni-2027', 0, 0, 0, 0),
('juni-2027-S02', 'S02', 'juni-2027', 0, 0, 0, 0),
('juni-2027-S03', 'S03', 'juni-2027', 0, 0, 0, 0),
('juni-2027-S04', 'S04', 'juni-2027', 0, 0, 0, 0),
('juni-2027-S05', 'S05', 'juni-2027', 0, 0, 0, 0),
('juni-2027-S06', 'S06', 'juni-2027', 0, 0, 0, 0),
('juni-2027-S07', 'S07', 'juni-2027', 0, 0, 0, 0),
('juni-2027-S08', 'S08', 'juni-2027', 0, 0, 0, 0),
('juni-2027-S09', 'S09', 'juni-2027', 0, 0, 0, 0),
('juni-2027-S10', 'S10', 'juni-2027', 0, 0, 0, 0),
('juni-2027-S11', 'S11', 'juni-2027', 0, 0, 0, 0),
('juni-2027-S12', 'S12', 'juni-2027', 0, 0, 0, 0),
('juni-2027-S13', 'S13', 'juni-2027', 0, 0, 0, 0),
('juni-2027-S14', 'S14', 'juni-2027', 0, 0, 0, 0),
('juni-2027-S15', 'S15', 'juni-2027', 0, 0, 0, 0),
('juni-2027-S16', 'S16', 'juni-2027', 0, 0, 0, 0),
('juni-2027-S17', 'S17', 'juni-2027', 0, 0, 0, 0),
('juni-2027-S18', 'S18', 'juni-2027', 0, 0, 0, 0),
('juni-2027-S19', 'S19', 'juni-2027', 0, 0, 0, 0),
('juni-2027-S20', 'S20', 'juni-2027', 0, 0, 0, 0),
('juni-2027-S21', 'S21', 'juni-2027', 0, 0, 0, 0),
('juni-2027-S22', 'S22', 'juni-2027', 0, 0, 0, 0),
('juni-2027-S23', 'S23', 'juni-2027', 0, 0, 0, 0),
('juni-2027-S24', 'S24', 'juni-2027', 0, 0, 0, 0),
('juni-2027-S25', 'S25', 'juni-2027', 0, 0, 0, 0),
('juni-2027-S26', 'S26', 'juni-2027', 0, 0, 0, 0),
('juni-2027-S27', 'S27', 'juni-2027', 0, 0, 0, 0),
('juni-2027-S28', 'S28', 'juni-2027', 0, 0, 0, 0),
('juni-2027-S29', 'S29', 'juni-2027', 0, 0, 0, 0),
('juni-2027-S30', 'S30', 'juni-2027', 0, 0, 0, 0),
('juni-2027-S31', 'S31', 'juni-2027', 0, 0, 0, 0),
('juni-2027-S32', 'S32', 'juni-2027', 0, 0, 0, 0),
('juni-2027-S33', 'S33', 'juni-2027', 0, 0, 0, 0),
('juni-2027-S34', 'S34', 'juni-2027', 0, 0, 0, 0),

-- === PERIODE: juli-2027 ===
('juli-2027-S01', 'S01', 'juli-2027', 0, 0, 0, 0),
('juli-2027-S02', 'S02', 'juli-2027', 0, 0, 0, 0),
('juli-2027-S03', 'S03', 'juli-2027', 0, 0, 0, 0),
('juli-2027-S04', 'S04', 'juli-2027', 0, 0, 0, 0),
('juli-2027-S05', 'S05', 'juli-2027', 0, 0, 0, 0),
('juli-2027-S06', 'S06', 'juli-2027', 0, 0, 0, 0),
('juli-2027-S07', 'S07', 'juli-2027', 0, 0, 0, 0),
('juli-2027-S08', 'S08', 'juli-2027', 0, 0, 0, 0),
('juli-2027-S09', 'S09', 'juli-2027', 0, 0, 0, 0),
('juli-2027-S10', 'S10', 'juli-2027', 0, 0, 0, 0),
('juli-2027-S11', 'S11', 'juli-2027', 0, 0, 0, 0),
('juli-2027-S12', 'S12', 'juli-2027', 0, 0, 0, 0),
('juli-2027-S13', 'S13', 'juli-2027', 0, 0, 0, 0),
('juli-2027-S14', 'S14', 'juli-2027', 0, 0, 0, 0),
('juli-2027-S15', 'S15', 'juli-2027', 0, 0, 0, 0),
('juli-2027-S16', 'S16', 'juli-2027', 0, 0, 0, 0),
('juli-2027-S17', 'S17', 'juli-2027', 0, 0, 0, 0),
('juli-2027-S18', 'S18', 'juli-2027', 0, 0, 0, 0),
('juli-2027-S19', 'S19', 'juli-2027', 0, 0, 0, 0),
('juli-2027-S20', 'S20', 'juli-2027', 0, 0, 0, 0),
('juli-2027-S21', 'S21', 'juli-2027', 0, 0, 0, 0),
('juli-2027-S22', 'S22', 'juli-2027', 0, 0, 0, 0),
('juli-2027-S23', 'S23', 'juli-2027', 0, 0, 0, 0),
('juli-2027-S24', 'S24', 'juli-2027', 0, 0, 0, 0),
('juli-2027-S25', 'S25', 'juli-2027', 0, 0, 0, 0),
('juli-2027-S26', 'S26', 'juli-2027', 0, 0, 0, 0),
('juli-2027-S27', 'S27', 'juli-2027', 0, 0, 0, 0),
('juli-2027-S28', 'S28', 'juli-2027', 0, 0, 0, 0),
('juli-2027-S29', 'S29', 'juli-2027', 0, 0, 0, 0),
('juli-2027-S30', 'S30', 'juli-2027', 0, 0, 0, 0),
('juli-2027-S31', 'S31', 'juli-2027', 0, 0, 0, 0),
('juli-2027-S32', 'S32', 'juli-2027', 0, 0, 0, 0),
('juli-2027-S33', 'S33', 'juli-2027', 0, 0, 0, 0),
('juli-2027-S34', 'S34', 'juli-2027', 0, 0, 0, 0);

-- D. Seeding Tabel Transactions
-- Mengisi data kas riil berdasarkan jumlah siswa yang membayar di Periode Agustus 2026.
-- Perhitungan total bayar dari ceklis:
-- Week 1: 33 siswa bayar = Rp 66.000
-- Week 2: 29 siswa bayar = Rp 58.000
-- Week 3: 20 siswa bayar = Rp 40.000
-- Week 4: 18 siswa bayar = Rp 36.000
INSERT INTO transactions (id, period_id, date, description, type, amount, is_auto, week_index) VALUES
-- Pemasukan Iuran Mingguan Otomatis
('tx-auto-agustus-2026-w1', 'agustus-2026', '2026-08-07', 'Total Iuran Minggu 1 (33 Siswa)', 'pemasukan', 66000, 1, 1),
('tx-auto-agustus-2026-w2', 'agustus-2026', '2026-08-14', 'Total Iuran Minggu 2 (29 Siswa)', 'pemasukan', 58000, 1, 2),
('tx-auto-agustus-2026-w3', 'agustus-2026', '2026-08-21', 'Total Iuran Minggu 3 (20 Siswa)', 'pemasukan', 40000, 1, 3),
('tx-auto-agustus-2026-w4', 'agustus-2026', '2026-08-28', 'Total Iuran Minggu 4 (18 Siswa)', 'pemasukan', 36000, 1, 4),

-- Pemasukan Manual
('tx-manual-101', 'agustus-2026', '2026-08-10', 'Sumbangan Wali Kelas untuk Kas', 'pemasukan', 100000, 0, NULL),
('tx-manual-102', 'agustus-2026', '2026-08-17', 'Hadiah Juara 1 Lomba Kebersihan Kelas', 'pemasukan', 150000, 0, NULL),

-- Pengeluaran Kelas
('tx-manual-201', 'agustus-2026', '2026-08-05', 'Pembelian Sapu dan Pengki Baru', 'pengeluaran', 35000, 0, NULL),
('tx-manual-202', 'agustus-2026', '2026-08-12', 'Pembelian Spidol Whiteboard (3 pcs)', 'pengeluaran', 27000, 0, NULL),
('tx-manual-203', 'agustus-2026', '2026-08-20', 'Pembelian Hiasan Dinding 17 Agustus', 'pengeluaran', 60000, 0, NULL),
('tx-manual-204', 'agustus-2026', '2026-08-25', 'Pembelian Penghapus Papan Tulis', 'pengeluaran', 10000, 0, NULL);


-- -------------------------------------------------------------------------
-- 3. QUERY SELECT & JOIN UTAMA (DASHBOARD KAS KELAS)
-- -------------------------------------------------------------------------

-- A. Rekap Total Bayar, Tunggakan, dan Status per Siswa (Periode Agustus 2026)
--    Menampilkan jumlah minggu dibayar, total rupiah terkumpul, sisa tunggakan, dan status lunas/belum.
SELECT 
    s.id AS student_id,
    s.name AS nama_siswa,
    (p.week1 + p.week2 + p.week3 + p.week4) AS jumlah_minggu_bayar,
    (p.week1 + p.week2 + p.week3 + p.week4) * pr.weekly_fee AS total_bayar_rp,
    (4 - (p.week1 + p.week2 + p.week3 + p.week4)) * pr.weekly_fee AS total_tunggakan_rp,
    CASE 
        WHEN (p.week1 + p.week2 + p.week3 + p.week4) = 4 THEN 'LUNAS'
        ELSE CONCAT('TUNGGAKAN Rp ', FORMAT((4 - (p.week1 + p.week2 + p.week3 + p.week4)) * pr.weekly_fee, 0, 'id_ID'))
    END AS status_pembayaran
FROM students s
JOIN payments p ON s.id = p.student_id
JOIN periods pr ON p.period_id = pr.id
WHERE pr.id = 'agustus-2026'
ORDER BY s.id;

-- B. Ringkasan Total Pemasukan, Pengeluaran, dan Saldo Akhir Kelas per Periode
--    Menghitung agregasi transaksi dan membandingkannya dengan saldo awal.
SELECT 
    p.id AS period_id,
    p.name AS nama_periode,
    p.initial_balance AS saldo_awal,
    COALESCE(SUM(CASE WHEN t.type = 'pemasukan' THEN t.amount ELSE 0 END), 0) AS total_pemasukan,
    COALESCE(SUM(CASE WHEN t.type = 'pengeluaran' THEN t.amount ELSE 0 END), 0) AS total_pengeluaran,
    (p.initial_balance 
     + COALESCE(SUM(CASE WHEN t.type = 'pemasukan' THEN t.amount ELSE 0 END), 0) 
     - COALESCE(SUM(CASE WHEN t.type = 'pengeluaran' THEN t.amount ELSE 0 END), 0)
    ) AS saldo_akhir_riil,
    (p.cash_amount + p.e_wallet_amount) AS saldo_laporan_fisik,
    ((p.initial_balance 
      + COALESCE(SUM(CASE WHEN t.type = 'pemasukan' THEN t.amount ELSE 0 END), 0) 
      - COALESCE(SUM(CASE WHEN t.type = 'pengeluaran' THEN t.amount ELSE 0 END), 0)
     ) - (p.cash_amount + p.e_wallet_amount)
    ) AS selisih_pembukuan
FROM periods p
LEFT JOIN transactions t ON p.id = t.period_id
WHERE p.id = 'agustus-2026'
GROUP BY p.id, p.name, p.initial_balance, p.cash_amount, p.e_wallet_amount;

-- C. Laporan Riwayat Transaksi Berurutan Lengkap dengan Saldo Berjalan (Running Balance)
--    Sangat berguna untuk tabel mutasi kas di frontend.
SELECT 
    t.id AS transaction_id,
    t.date AS tanggal_transaksi,
    t.description AS keterangan,
    t.type AS jenis,
    t.amount AS nominal,
    SUM(CASE WHEN t.type = 'pemasukan' THEN t.amount ELSE -t.amount END) 
        OVER (PARTITION BY t.period_id ORDER BY t.date, t.id) + p.initial_balance AS saldo_berjalan
FROM transactions t
JOIN periods p ON t.period_id = p.id
WHERE p.id = 'agustus-2026'
ORDER BY t.date ASC, t.id ASC;
