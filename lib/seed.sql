-- ═══════════════════════════════════════════
-- DROP EXISTING TABLES
-- ═══════════════════════════════════════════

DROP TABLE IF EXISTS financial_statements;
DROP TABLE IF EXISTS entity_master;

-- ═══════════════════════════════════════════
-- TABLE 1: entity_master
-- Fixed columns — UI shows only non-NULL ones
-- ═══════════════════════════════════════════

CREATE TABLE entity_master (
  entity_id            VARCHAR(20)  PRIMARY KEY,
  entity_name          VARCHAR(100) NOT NULL,
  entity_type          VARCHAR(50),
  industry             VARCHAR(50),
  country              VARCHAR(50),

  -- Credit metrics
  credit_rating        VARCHAR(10),
  risk_score           VARCHAR(20),
  debt_ratio           VARCHAR(20),
  revenue_growth       VARCHAR(20),
  ebitda_margin        VARCHAR(20),
  interest_coverage    VARCHAR(20),
  current_ratio        VARCHAR(20),
  quick_ratio          VARCHAR(20),
  net_margin           VARCHAR(20),
  asset_turnover       VARCHAR(20),

  -- Banking metrics
  npl_ratio            VARCHAR(20),
  capital_adequacy     VARCHAR(20),
  roe                  VARCHAR(20),
  loan_to_deposit      VARCHAR(20),

  -- Real estate metrics
  nav_growth           VARCHAR(20),
  occupancy_rate       VARCHAR(20),
  loan_to_value        VARCHAR(20),
  wale                 VARCHAR(20),
  distribution_yield   VARCHAR(20),

  -- Sovereign metrics
  gdp_growth           VARCHAR(20),
  fiscal_deficit       VARCHAR(20),
  debt_to_gdp          VARCHAR(20),
  foreign_reserves     VARCHAR(20),

  created_at           TIMESTAMP DEFAULT NOW()
);

-- ═══════════════════════════════════════════
-- TABLE 2: financial_statements
-- Fixed 15 real value columns
-- Only populated columns show in UI
-- Multiple spreads = dropdown appears
-- ═══════════════════════════════════════════

CREATE TABLE financial_statements (
  id                 SERIAL       PRIMARY KEY,
  entity_id          VARCHAR(20)  NOT NULL REFERENCES entity_master(entity_id),
  spread_name        VARCHAR(100) NOT NULL,
  statement_year     VARCHAR(20)  NOT NULL,
  metric             VARCHAR(100) NOT NULL,

  revenue            VARCHAR(50),
  ebitda             VARCHAR(50),
  net_income         VARCHAR(50),
  total_assets       VARCHAR(50),
  total_liabilities  VARCHAR(50),
  total_equity       VARCHAR(50),
  interest_expense   VARCHAR(50),
  operating_cashflow VARCHAR(50),
  gross_margin       VARCHAR(50),
  net_margin         VARCHAR(50),
  debt_ratio         VARCHAR(50),
  interest_coverage  VARCHAR(50),
  benchmark          VARCHAR(50),
  variance           VARCHAR(50),
  status             VARCHAR(50),

  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_fs_entity ON financial_statements(entity_id);
CREATE INDEX idx_fs_spread ON financial_statements(entity_id, spread_name, statement_year);

-- ═══════════════════════════════════════════
-- SEED: entity_master
-- ═══════════════════════════════════════════

-- ENT-001: Corporate · 2 overview lines
INSERT INTO entity_master (
  entity_id, entity_name, entity_type, industry, country,
  credit_rating, risk_score
) VALUES (
  'ENT-001','Apex Global Corporation','Corporate','Technology','United States',
  'AA+','22/100'
);

-- ENT-002: Bank · 6 overview lines
INSERT INTO entity_master (
  entity_id, entity_name, entity_type, industry, country,
  credit_rating, risk_score, npl_ratio, capital_adequacy, roe, loan_to_deposit
) VALUES (
  'ENT-002','Meridian Capital Bank','Financial Institution','Banking','United Kingdom',
  'BBB+','45/100','5.0%','18.2%','7.4%','84.1%'
);

-- ENT-003: SME · 10 overview lines
INSERT INTO entity_master (
  entity_id, entity_name, entity_type, industry, country,
  credit_rating, risk_score, debt_ratio, revenue_growth,
  ebitda_margin, interest_coverage, current_ratio,
  quick_ratio, net_margin, asset_turnover
) VALUES (
  'ENT-003','Redstone SME Ventures','SME','Manufacturing','India',
  'BB-','74/100','0.76','-3.2%','9.8%','1.8x','0.91','0.62','1.5%','1.37x'
);

-- ENT-004: Sovereign · 4 overview lines
INSERT INTO entity_master (
  entity_id, entity_name, entity_type, industry, country,
  credit_rating, risk_score, gdp_growth, fiscal_deficit
) VALUES (
  'ENT-004','Sovereign State of Aldoria','Sovereign','Government','Aldoria',
  'A-','38/100','+3.8%','-2.1%'
);

-- ENT-005: Real Estate · 8 overview lines
INSERT INTO entity_master (
  entity_id, entity_name, entity_type, industry, country,
  credit_rating, risk_score, debt_ratio, nav_growth,
  occupancy_rate, loan_to_value, wale, distribution_yield
) VALUES (
  'ENT-005','Orion Real Estate Fund','Corporate','Real Estate','Singapore',
  'BBB','55/100','0.62','+8.4%','91.2%','58.3%','4.2 yrs','5.8%'
);

-- ENT-990: Healthcare · 4 overview lines
INSERT INTO entity_master (
  entity_id, entity_name, entity_type, industry, country,
  credit_rating, risk_score, debt_ratio, revenue_growth
) VALUES (
  'ENT-990','Nordic Health Sciences Ltd','Corporate','Healthcare','Denmark',
  'A-','35/100','0.42','+11.8%'
);

-- ═══════════════════════════════════════════
-- SEED: financial_statements
-- ═══════════════════════════════════════════

-- ───────────────────────────────────────────
-- ENT-001: 1 spread → NO dropdown
-- Columns: metric, revenue, ebitda, net_income,
--          total_assets, variance, status
-- ───────────────────────────────────────────

INSERT INTO financial_statements
  (entity_id, spread_name, statement_year, metric,
   revenue, ebitda, net_income, total_assets, variance, status)
VALUES
  ('ENT-001','Annual Report','FY 2024','Revenue',
   '$5.2M',NULL,NULL,NULL,'+14.2%','Above Benchmark'),

  ('ENT-001','Annual Report','FY 2024','EBITDA',
   NULL,'$1.7M',NULL,NULL,'+19.4%','Above Benchmark'),

  ('ENT-001','Annual Report','FY 2024','Net Income',
   NULL,NULL,'$1.0M',NULL,'+20.3%','Above Benchmark'),

  ('ENT-001','Annual Report','FY 2024','Total Assets',
   NULL,NULL,NULL,'$8.9M','+16.3%','Above Benchmark'),

  ('ENT-001','Annual Report','FY 2024','Total Equity',
   NULL,NULL,NULL,NULL,'+19.8%','Stable'),

  ('ENT-001','Annual Report','FY 2024','Total Liabilities',
   NULL,NULL,NULL,NULL,'+9.3%','Stable');

-- ───────────────────────────────────────────
-- ENT-002: 3 spreads → dropdown appears
-- Spread 1: Audited Accounts 2024
-- Spread 2: Audited Accounts 2023
-- Spread 3: Management Accounts 2024
-- ───────────────────────────────────────────

INSERT INTO financial_statements
  (entity_id, spread_name, statement_year, metric,
   revenue, total_assets, total_liabilities, interest_expense, variance, status)
VALUES
  ('ENT-002','Audited Accounts','2024','Net Interest Income',
   '£3.1M',NULL,NULL,NULL,'+6.2%','Strong'),

  ('ENT-002','Audited Accounts','2024','Total Loans',
   NULL,'£18.5M',NULL,NULL,'+7.6%','Stable'),

  ('ENT-002','Audited Accounts','2024','Non-Performing Loans',
   NULL,NULL,'£0.9M',NULL,'+19.5%','Watch'),

  ('ENT-002','Audited Accounts','2024','Total Deposits',
   '£22.0M',NULL,NULL,NULL,'+7.3%','Strong'),

  ('ENT-002','Audited Accounts','2024','Tier 1 Capital',
   NULL,'£4.2M',NULL,NULL,'+7.7%','Strong'),

  ('ENT-002','Audited Accounts','2024','Operating Expenses',
   NULL,NULL,NULL,'£1.8M','+6.3%','Stable');

INSERT INTO financial_statements
  (entity_id, spread_name, statement_year, metric,
   revenue, total_assets, total_liabilities, interest_expense, variance, status)
VALUES
  ('ENT-002','Audited Accounts','2023','Net Interest Income',
   '£2.9M',NULL,NULL,NULL,'+5.1%','Stable'),

  ('ENT-002','Audited Accounts','2023','Total Loans',
   NULL,'£17.2M',NULL,NULL,'+4.9%','Stable'),

  ('ENT-002','Audited Accounts','2023','Non-Performing Loans',
   NULL,NULL,'£0.8M',NULL,'+8.2%','Watch'),

  ('ENT-002','Audited Accounts','2023','Total Deposits',
   '£20.5M',NULL,NULL,NULL,'+5.1%','Stable'),

  ('ENT-002','Audited Accounts','2023','Tier 1 Capital',
   NULL,'£3.9M',NULL,NULL,'+5.4%','Strong'),

  ('ENT-002','Audited Accounts','2023','Operating Expenses',
   NULL,NULL,NULL,'£1.7M','+4.8%','Stable');

INSERT INTO financial_statements
  (entity_id, spread_name, statement_year, metric,
   revenue, ebitda, variance, status)
VALUES
  ('ENT-002','Management Accounts','2024','Net Interest Income',
   '£3.0M',NULL,'+3.4%','Unaudited'),

  ('ENT-002','Management Accounts','2024','Total Loans',
   NULL,'£18.1M','+5.2%','Unaudited'),

  ('ENT-002','Management Accounts','2024','Operating Expenses',
   NULL,NULL,'+2.1%','Unaudited');

-- ───────────────────────────────────────────
-- ENT-003: 2 spreads → dropdown appears
-- Management Accounts: 6 columns
-- Unaudited: 3 columns only
-- ───────────────────────────────────────────

INSERT INTO financial_statements
  (entity_id, spread_name, statement_year, metric,
   revenue, ebitda, net_income, benchmark, variance, status)
VALUES
  ('ENT-003','Management Accounts','2024','Revenue',
   '₹850K',NULL,NULL,'₹1.2M','-29.2%','Below Benchmark'),

  ('ENT-003','Management Accounts','2024','EBITDA',
   NULL,'₹83K',NULL,'₹180K','-53.9%','Below Benchmark'),

  ('ENT-003','Management Accounts','2024','Net Income',
   NULL,NULL,'₹12K','₹96K','-87.5%','Critical'),

  ('ENT-003','Management Accounts','2024','Total Assets',
   NULL,NULL,NULL,'₹900K','-31.1%','Below Benchmark'),

  ('ENT-003','Management Accounts','2024','Interest Expense',
   NULL,NULL,NULL,'₹54K','+74.1%','Above Benchmark');

INSERT INTO financial_statements
  (entity_id, spread_name, statement_year, metric,
   revenue, ebitda, status)
VALUES
  ('ENT-003','Unaudited','2024','Revenue',
   '₹790K',NULL,'Critical'),

  ('ENT-003','Unaudited','2024','EBITDA',
   NULL,'₹71K','Critical'),

  ('ENT-003','Unaudited','2024','Net Income',
   NULL,NULL,'Critical');

-- ───────────────────────────────────────────
-- ENT-004: 3 spreads → dropdown appears
-- 2024: 5 columns
-- 2023: 4 columns
-- 2022: 3 columns
-- ───────────────────────────────────────────

INSERT INTO financial_statements
  (entity_id, spread_name, statement_year, metric,
   revenue, benchmark, variance, debt_ratio, status)
VALUES
  ('ENT-004','IMF Assessment','2024','GDP (USD Bn)',
   '$285B','$275B','+3.6%',NULL,'Positive'),

  ('ENT-004','IMF Assessment','2024','Government Revenue',
   '$68.4M','$65.0M','+5.2%',NULL,'Stable'),

  ('ENT-004','IMF Assessment','2024','Government Expenditure',
   '$74.4M','$70.0M','+6.3%',NULL,'Watch'),

  ('ENT-004','IMF Assessment','2024','Public Debt',
   '$149M','$140M','+6.7%','52.4%','Watch'),

  ('ENT-004','IMF Assessment','2024','Foreign Reserves',
   '$42.5M','$38.0M','+11.8%',NULL,'Positive');

INSERT INTO financial_statements
  (entity_id, spread_name, statement_year, metric,
   revenue, benchmark, variance, status)
VALUES
  ('ENT-004','IMF Assessment','2023','GDP (USD Bn)',
   '$274B','$265B','+3.4%','Stable'),

  ('ENT-004','IMF Assessment','2023','Government Revenue',
   '$63.1M','$61.0M','+3.4%','Stable'),

  ('ENT-004','IMF Assessment','2023','Public Debt',
   '$140M','$135M','+4.1%','Watch'),

  ('ENT-004','IMF Assessment','2023','Foreign Reserves',
   '$39.8M','$36.0M','+10.6%','Positive');

INSERT INTO financial_statements
  (entity_id, spread_name, statement_year, metric,
   revenue, benchmark, variance)
VALUES
  ('ENT-004','IMF Assessment','2022','GDP (USD Bn)',
   '$261B','$255B','+2.4%'),

  ('ENT-004','IMF Assessment','2022','Government Revenue',
   '$58.7M','$57.0M','+3.0%'),

  ('ENT-004','IMF Assessment','2022','Public Debt',
   '$132M','$130M','+1.8%');

-- ───────────────────────────────────────────
-- ENT-005: 3 spreads → dropdown appears
-- Each spread = different loan structure
-- ───────────────────────────────────────────

INSERT INTO financial_statements
  (entity_id, spread_name, statement_year, metric,
   revenue, total_assets, net_income, operating_cashflow, status)
VALUES
  ('ENT-005','SIBOR+150bps','2024','Portfolio Value',
   NULL,'S$920M',NULL,NULL,'Active'),

  ('ENT-005','SIBOR+150bps','2024','Rental Income',
   'S$52.4M',NULL,NULL,NULL,'Active'),

  ('ENT-005','SIBOR+150bps','2024','Net Asset Value',
   NULL,'S$383M',NULL,NULL,'Active'),

  ('ENT-005','SIBOR+150bps','2024','Operating Cash Flow',
   NULL,NULL,NULL,'S$41.9M','Active');

INSERT INTO financial_statements
  (entity_id, spread_name, statement_year, metric,
   total_liabilities, interest_expense, variance, status)
VALUES
  ('ENT-005','SIBOR+175bps','2024','Total Debt',
   'S$536M',NULL,'-10.3%','Refinance Due'),

  ('ENT-005','SIBOR+175bps','2024','Interest Expense',
   NULL,'S$26.8M','+3.2%','Refinance Due'),

  ('ENT-005','SIBOR+175bps','2024','Loan Repayment',
   'S$45.0M',NULL,NULL,'Refinance Due'),

  ('ENT-005','SIBOR+175bps','2024','Hedging Cost',
   NULL,'S$3.2M',NULL,'Watch');

INSERT INTO financial_statements
  (entity_id, spread_name, statement_year, metric,
   total_liabilities, interest_expense, status)
VALUES
  ('ENT-005','Fixed 5.2%','2024','Fixed Rate Debt',
   'S$180M',NULL,'Stable'),

  ('ENT-005','Fixed 5.2%','2024','Annual Interest',
   NULL,'S$9.4M','Stable'),

  ('ENT-005','Fixed 5.2%','2024','Amortization',
   'S$12.0M',NULL,'Stable');

-- ───────────────────────────────────────────
-- ENT-990: 3 spreads → dropdown appears
-- ───────────────────────────────────────────

INSERT INTO financial_statements
  (entity_id, spread_name, statement_year, metric,
   revenue, ebitda, net_income, gross_margin, net_margin, status)
VALUES
  ('ENT-990','Annual Report','FY 2024','Revenue',
   '$12.4M',NULL,NULL,NULL,NULL,'Above Benchmark'),

  ('ENT-990','Annual Report','FY 2024','EBITDA',
   NULL,'$3.1M',NULL,'25.0%',NULL,'Above Benchmark'),

  ('ENT-990','Annual Report','FY 2024','Net Income',
   NULL,NULL,'$1.8M',NULL,'14.5%','Above Benchmark'),

  ('ENT-990','Annual Report','FY 2024','Total Debt',
   NULL,NULL,NULL,NULL,NULL,'Stable');

INSERT INTO financial_statements
  (entity_id, spread_name, statement_year, metric,
   revenue, ebitda, net_income, status)
VALUES
  ('ENT-990','Annual Report','FY 2023','Revenue',
   '$11.2M',NULL,NULL,'Stable'),

  ('ENT-990','Annual Report','FY 2023','EBITDA',
   NULL,'$2.7M',NULL,'Stable'),

  ('ENT-990','Annual Report','FY 2023','Net Income',
   NULL,NULL,'$1.5M','Stable');

INSERT INTO financial_statements
  (entity_id, spread_name, statement_year, metric,
   revenue, ebitda, variance, status)
VALUES
  ('ENT-990','Quarterly Report','Q1 2024','Revenue',
   '$3.2M',NULL,'+2.4%','On Track'),

  ('ENT-990','Quarterly Report','Q1 2024','EBITDA',
   NULL,'$0.8M','+1.8%','On Track'),

  ('ENT-990','Quarterly Report','Q1 2024','Operating Cost',
   '$2.1M',NULL,'+5.2%','Watch');-- ═══════════════════════════════════════════
-- DROP EXISTING TABLES
-- ═══════════════════════════════════════════

DROP TABLE IF EXISTS financial_statements;
DROP TABLE IF EXISTS entity_master;

-- ═══════════════════════════════════════════
-- TABLE 1: entity_master
-- Fixed columns — UI shows only non-NULL ones
-- ═══════════════════════════════════════════

CREATE TABLE entity_master (
  entity_id            VARCHAR(20)  PRIMARY KEY,
  entity_name          VARCHAR(100) NOT NULL,
  entity_type          VARCHAR(50),
  industry             VARCHAR(50),
  country              VARCHAR(50),

  -- Credit metrics
  credit_rating        VARCHAR(10),
  risk_score           VARCHAR(20),
  debt_ratio           VARCHAR(20),
  revenue_growth       VARCHAR(20),
  ebitda_margin        VARCHAR(20),
  interest_coverage    VARCHAR(20),
  current_ratio        VARCHAR(20),
  quick_ratio          VARCHAR(20),
  net_margin           VARCHAR(20),
  asset_turnover       VARCHAR(20),

  -- Banking metrics
  npl_ratio            VARCHAR(20),
  capital_adequacy     VARCHAR(20),
  roe                  VARCHAR(20),
  loan_to_deposit      VARCHAR(20),

  -- Real estate metrics
  nav_growth           VARCHAR(20),
  occupancy_rate       VARCHAR(20),
  loan_to_value        VARCHAR(20),
  wale                 VARCHAR(20),
  distribution_yield   VARCHAR(20),

  -- Sovereign metrics
  gdp_growth           VARCHAR(20),
  fiscal_deficit       VARCHAR(20),
  debt_to_gdp          VARCHAR(20),
  foreign_reserves     VARCHAR(20),

  created_at           TIMESTAMP DEFAULT NOW()
);

-- ═══════════════════════════════════════════
-- TABLE 2: financial_statements
-- Fixed 15 real value columns
-- Only populated columns show in UI
-- Multiple spreads = dropdown appears
-- ═══════════════════════════════════════════

CREATE TABLE financial_statements (
  id                 SERIAL       PRIMARY KEY,
  entity_id          VARCHAR(20)  NOT NULL REFERENCES entity_master(entity_id),
  spread_name        VARCHAR(100) NOT NULL,
  statement_year     VARCHAR(20)  NOT NULL,
  metric             VARCHAR(100) NOT NULL,

  revenue            VARCHAR(50),
  ebitda             VARCHAR(50),
  net_income         VARCHAR(50),
  total_assets       VARCHAR(50),
  total_liabilities  VARCHAR(50),
  total_equity       VARCHAR(50),
  interest_expense   VARCHAR(50),
  operating_cashflow VARCHAR(50),
  gross_margin       VARCHAR(50),
  net_margin         VARCHAR(50),
  debt_ratio         VARCHAR(50),
  interest_coverage  VARCHAR(50),
  benchmark          VARCHAR(50),
  variance           VARCHAR(50),
  status             VARCHAR(50),

  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_fs_entity ON financial_statements(entity_id);
CREATE INDEX idx_fs_spread ON financial_statements(entity_id, spread_name, statement_year);

-- ═══════════════════════════════════════════
-- SEED: entity_master
-- ═══════════════════════════════════════════

-- ENT-001: Corporate · 2 overview lines
INSERT INTO entity_master (
  entity_id, entity_name, entity_type, industry, country,
  credit_rating, risk_score
) VALUES (
  'ENT-001','Apex Global Corporation','Corporate','Technology','United States',
  'AA+','22/100'
);

-- ENT-002: Bank · 6 overview lines
INSERT INTO entity_master (
  entity_id, entity_name, entity_type, industry, country,
  credit_rating, risk_score, npl_ratio, capital_adequacy, roe, loan_to_deposit
) VALUES (
  'ENT-002','Meridian Capital Bank','Financial Institution','Banking','United Kingdom',
  'BBB+','45/100','5.0%','18.2%','7.4%','84.1%'
);

-- ENT-003: SME · 10 overview lines
INSERT INTO entity_master (
  entity_id, entity_name, entity_type, industry, country,
  credit_rating, risk_score, debt_ratio, revenue_growth,
  ebitda_margin, interest_coverage, current_ratio,
  quick_ratio, net_margin, asset_turnover
) VALUES (
  'ENT-003','Redstone SME Ventures','SME','Manufacturing','India',
  'BB-','74/100','0.76','-3.2%','9.8%','1.8x','0.91','0.62','1.5%','1.37x'
);

-- ENT-004: Sovereign · 4 overview lines
INSERT INTO entity_master (
  entity_id, entity_name, entity_type, industry, country,
  credit_rating, risk_score, gdp_growth, fiscal_deficit
) VALUES (
  'ENT-004','Sovereign State of Aldoria','Sovereign','Government','Aldoria',
  'A-','38/100','+3.8%','-2.1%'
);

-- ENT-005: Real Estate · 8 overview lines
INSERT INTO entity_master (
  entity_id, entity_name, entity_type, industry, country,
  credit_rating, risk_score, debt_ratio, nav_growth,
  occupancy_rate, loan_to_value, wale, distribution_yield
) VALUES (
  'ENT-005','Orion Real Estate Fund','Corporate','Real Estate','Singapore',
  'BBB','55/100','0.62','+8.4%','91.2%','58.3%','4.2 yrs','5.8%'
);

-- ENT-990: Healthcare · 4 overview lines
INSERT INTO entity_master (
  entity_id, entity_name, entity_type, industry, country,
  credit_rating, risk_score, debt_ratio, revenue_growth
) VALUES (
  'ENT-990','Nordic Health Sciences Ltd','Corporate','Healthcare','Denmark',
  'A-','35/100','0.42','+11.8%'
);

-- ═══════════════════════════════════════════
-- SEED: financial_statements
-- ═══════════════════════════════════════════

-- ───────────────────────────────────────────
-- ENT-001: 1 spread → NO dropdown
-- Columns: metric, revenue, ebitda, net_income,
--          total_assets, variance, status
-- ───────────────────────────────────────────

INSERT INTO financial_statements
  (entity_id, spread_name, statement_year, metric,
   revenue, ebitda, net_income, total_assets, variance, status)
VALUES
  ('ENT-001','Annual Report','FY 2024','Revenue',
   '$5.2M',NULL,NULL,NULL,'+14.2%','Above Benchmark'),

  ('ENT-001','Annual Report','FY 2024','EBITDA',
   NULL,'$1.7M',NULL,NULL,'+19.4%','Above Benchmark'),

  ('ENT-001','Annual Report','FY 2024','Net Income',
   NULL,NULL,'$1.0M',NULL,'+20.3%','Above Benchmark'),

  ('ENT-001','Annual Report','FY 2024','Total Assets',
   NULL,NULL,NULL,'$8.9M','+16.3%','Above Benchmark'),

  ('ENT-001','Annual Report','FY 2024','Total Equity',
   NULL,NULL,NULL,NULL,'+19.8%','Stable'),

  ('ENT-001','Annual Report','FY 2024','Total Liabilities',
   NULL,NULL,NULL,NULL,'+9.3%','Stable');

-- ───────────────────────────────────────────
-- ENT-002: 3 spreads → dropdown appears
-- Spread 1: Audited Accounts 2024
-- Spread 2: Audited Accounts 2023
-- Spread 3: Management Accounts 2024
-- ───────────────────────────────────────────

INSERT INTO financial_statements
  (entity_id, spread_name, statement_year, metric,
   revenue, total_assets, total_liabilities, interest_expense, variance, status)
VALUES
  ('ENT-002','Audited Accounts','2024','Net Interest Income',
   '£3.1M',NULL,NULL,NULL,'+6.2%','Strong'),

  ('ENT-002','Audited Accounts','2024','Total Loans',
   NULL,'£18.5M',NULL,NULL,'+7.6%','Stable'),

  ('ENT-002','Audited Accounts','2024','Non-Performing Loans',
   NULL,NULL,'£0.9M',NULL,'+19.5%','Watch'),

  ('ENT-002','Audited Accounts','2024','Total Deposits',
   '£22.0M',NULL,NULL,NULL,'+7.3%','Strong'),

  ('ENT-002','Audited Accounts','2024','Tier 1 Capital',
   NULL,'£4.2M',NULL,NULL,'+7.7%','Strong'),

  ('ENT-002','Audited Accounts','2024','Operating Expenses',
   NULL,NULL,NULL,'£1.8M','+6.3%','Stable');

INSERT INTO financial_statements
  (entity_id, spread_name, statement_year, metric,
   revenue, total_assets, total_liabilities, interest_expense, variance, status)
VALUES
  ('ENT-002','Audited Accounts','2023','Net Interest Income',
   '£2.9M',NULL,NULL,NULL,'+5.1%','Stable'),

  ('ENT-002','Audited Accounts','2023','Total Loans',
   NULL,'£17.2M',NULL,NULL,'+4.9%','Stable'),

  ('ENT-002','Audited Accounts','2023','Non-Performing Loans',
   NULL,NULL,'£0.8M',NULL,'+8.2%','Watch'),

  ('ENT-002','Audited Accounts','2023','Total Deposits',
   '£20.5M',NULL,NULL,NULL,'+5.1%','Stable'),

  ('ENT-002','Audited Accounts','2023','Tier 1 Capital',
   NULL,'£3.9M',NULL,NULL,'+5.4%','Strong'),

  ('ENT-002','Audited Accounts','2023','Operating Expenses',
   NULL,NULL,NULL,'£1.7M','+4.8%','Stable');

INSERT INTO financial_statements
  (entity_id, spread_name, statement_year, metric,
   revenue, ebitda, variance, status)
VALUES
  ('ENT-002','Management Accounts','2024','Net Interest Income',
   '£3.0M',NULL,'+3.4%','Unaudited'),

  ('ENT-002','Management Accounts','2024','Total Loans',
   NULL,'£18.1M','+5.2%','Unaudited'),

  ('ENT-002','Management Accounts','2024','Operating Expenses',
   NULL,NULL,'+2.1%','Unaudited');

-- ───────────────────────────────────────────
-- ENT-003: 2 spreads → dropdown appears
-- Management Accounts: 6 columns
-- Unaudited: 3 columns only
-- ───────────────────────────────────────────

INSERT INTO financial_statements
  (entity_id, spread_name, statement_year, metric,
   revenue, ebitda, net_income, benchmark, variance, status)
VALUES
  ('ENT-003','Management Accounts','2024','Revenue',
   '₹850K',NULL,NULL,'₹1.2M','-29.2%','Below Benchmark'),

  ('ENT-003','Management Accounts','2024','EBITDA',
   NULL,'₹83K',NULL,'₹180K','-53.9%','Below Benchmark'),

  ('ENT-003','Management Accounts','2024','Net Income',
   NULL,NULL,'₹12K','₹96K','-87.5%','Critical'),

  ('ENT-003','Management Accounts','2024','Total Assets',
   NULL,NULL,NULL,'₹900K','-31.1%','Below Benchmark'),

  ('ENT-003','Management Accounts','2024','Interest Expense',
   NULL,NULL,NULL,'₹54K','+74.1%','Above Benchmark');

INSERT INTO financial_statements
  (entity_id, spread_name, statement_year, metric,
   revenue, ebitda, status)
VALUES
  ('ENT-003','Unaudited','2024','Revenue',
   '₹790K',NULL,'Critical'),

  ('ENT-003','Unaudited','2024','EBITDA',
   NULL,'₹71K','Critical'),

  ('ENT-003','Unaudited','2024','Net Income',
   NULL,NULL,'Critical');

-- ───────────────────────────────────────────
-- ENT-004: 3 spreads → dropdown appears
-- 2024: 5 columns
-- 2023: 4 columns
-- 2022: 3 columns
-- ───────────────────────────────────────────

INSERT INTO financial_statements
  (entity_id, spread_name, statement_year, metric,
   revenue, benchmark, variance, debt_ratio, status)
VALUES
  ('ENT-004','IMF Assessment','2024','GDP (USD Bn)',
   '$285B','$275B','+3.6%',NULL,'Positive'),

  ('ENT-004','IMF Assessment','2024','Government Revenue',
   '$68.4M','$65.0M','+5.2%',NULL,'Stable'),

  ('ENT-004','IMF Assessment','2024','Government Expenditure',
   '$74.4M','$70.0M','+6.3%',NULL,'Watch'),

  ('ENT-004','IMF Assessment','2024','Public Debt',
   '$149M','$140M','+6.7%','52.4%','Watch'),

  ('ENT-004','IMF Assessment','2024','Foreign Reserves',
   '$42.5M','$38.0M','+11.8%',NULL,'Positive');

INSERT INTO financial_statements
  (entity_id, spread_name, statement_year, metric,
   revenue, benchmark, variance, status)
VALUES
  ('ENT-004','IMF Assessment','2023','GDP (USD Bn)',
   '$274B','$265B','+3.4%','Stable'),

  ('ENT-004','IMF Assessment','2023','Government Revenue',
   '$63.1M','$61.0M','+3.4%','Stable'),

  ('ENT-004','IMF Assessment','2023','Public Debt',
   '$140M','$135M','+4.1%','Watch'),

  ('ENT-004','IMF Assessment','2023','Foreign Reserves',
   '$39.8M','$36.0M','+10.6%','Positive');

INSERT INTO financial_statements
  (entity_id, spread_name, statement_year, metric,
   revenue, benchmark, variance)
VALUES
  ('ENT-004','IMF Assessment','2022','GDP (USD Bn)',
   '$261B','$255B','+2.4%'),

  ('ENT-004','IMF Assessment','2022','Government Revenue',
   '$58.7M','$57.0M','+3.0%'),

  ('ENT-004','IMF Assessment','2022','Public Debt',
   '$132M','$130M','+1.8%');

-- ───────────────────────────────────────────
-- ENT-005: 3 spreads → dropdown appears
-- Each spread = different loan structure
-- ───────────────────────────────────────────

INSERT INTO financial_statements
  (entity_id, spread_name, statement_year, metric,
   revenue, total_assets, net_income, operating_cashflow, status)
VALUES
  ('ENT-005','SIBOR+150bps','2024','Portfolio Value',
   NULL,'S$920M',NULL,NULL,'Active'),

  ('ENT-005','SIBOR+150bps','2024','Rental Income',
   'S$52.4M',NULL,NULL,NULL,'Active'),

  ('ENT-005','SIBOR+150bps','2024','Net Asset Value',
   NULL,'S$383M',NULL,NULL,'Active'),

  ('ENT-005','SIBOR+150bps','2024','Operating Cash Flow',
   NULL,NULL,NULL,'S$41.9M','Active');

INSERT INTO financial_statements
  (entity_id, spread_name, statement_year, metric,
   total_liabilities, interest_expense, variance, status)
VALUES
  ('ENT-005','SIBOR+175bps','2024','Total Debt',
   'S$536M',NULL,'-10.3%','Refinance Due'),

  ('ENT-005','SIBOR+175bps','2024','Interest Expense',
   NULL,'S$26.8M','+3.2%','Refinance Due'),

  ('ENT-005','SIBOR+175bps','2024','Loan Repayment',
   'S$45.0M',NULL,NULL,'Refinance Due'),

  ('ENT-005','SIBOR+175bps','2024','Hedging Cost',
   NULL,'S$3.2M',NULL,'Watch');

INSERT INTO financial_statements
  (entity_id, spread_name, statement_year, metric,
   total_liabilities, interest_expense, status)
VALUES
  ('ENT-005','Fixed 5.2%','2024','Fixed Rate Debt',
   'S$180M',NULL,'Stable'),

  ('ENT-005','Fixed 5.2%','2024','Annual Interest',
   NULL,'S$9.4M','Stable'),

  ('ENT-005','Fixed 5.2%','2024','Amortization',
   'S$12.0M',NULL,'Stable');

-- ───────────────────────────────────────────
-- ENT-990: 3 spreads → dropdown appears
-- ───────────────────────────────────────────

INSERT INTO financial_statements
  (entity_id, spread_name, statement_year, metric,
   revenue, ebitda, net_income, gross_margin, net_margin, status)
VALUES
  ('ENT-990','Annual Report','FY 2024','Revenue',
   '$12.4M',NULL,NULL,NULL,NULL,'Above Benchmark'),

  ('ENT-990','Annual Report','FY 2024','EBITDA',
   NULL,'$3.1M',NULL,'25.0%',NULL,'Above Benchmark'),

  ('ENT-990','Annual Report','FY 2024','Net Income',
   NULL,NULL,'$1.8M',NULL,'14.5%','Above Benchmark'),

  ('ENT-990','Annual Report','FY 2024','Total Debt',
   NULL,NULL,NULL,NULL,NULL,'Stable');

INSERT INTO financial_statements
  (entity_id, spread_name, statement_year, metric,
   revenue, ebitda, net_income, status)
VALUES
  ('ENT-990','Annual Report','FY 2023','Revenue',
   '$11.2M',NULL,NULL,'Stable'),

  ('ENT-990','Annual Report','FY 2023','EBITDA',
   NULL,'$2.7M',NULL,'Stable'),

  ('ENT-990','Annual Report','FY 2023','Net Income',
   NULL,NULL,'$1.5M','Stable');

INSERT INTO financial_statements
  (entity_id, spread_name, statement_year, metric,
   revenue, ebitda, variance, status)
VALUES
  ('ENT-990','Quarterly Report','Q1 2024','Revenue',
   '$3.2M',NULL,'+2.4%','On Track'),

  ('ENT-990','Quarterly Report','Q1 2024','EBITDA',
   NULL,'$0.8M','+1.8%','On Track'),

  ('ENT-990','Quarterly Report','Q1 2024','Operating Cost',
   '$2.1M',NULL,'+5.2%','Watch');