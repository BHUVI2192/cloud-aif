-- ============================================================
-- Cloud AIF — PostgreSQL Query Performance & pg_stat_statements Setup
-- ============================================================
--
-- Instructions for Supabase / PostgreSQL Database Administrator:
-- Run these SQL statements directly in Supabase SQL Editor or psql console.

-- 1. Enable pg_stat_statements extension (pre-installed on Supabase)
CREATE EXTENSION IF NOT EXISTS pg_stat_statements;

-- 2. View Top 10 Slowest SQL Queries by Average Execution Time
SELECT
    calls,
    round(total_exec_time::numeric, 2) AS total_time_ms,
    round(mean_exec_time::numeric, 2) AS mean_time_ms,
    round(min_exec_time::numeric, 2) AS min_time_ms,
    round(max_exec_time::numeric, 2) AS max_time_ms,
    rows,
    substring(query, 1, 150) AS query_truncated
FROM pg_stat_statements
ORDER BY mean_exec_time DESC
LIMIT 10;

-- 3. View Top 10 Queries by Total CPU / Execution Time Impact
SELECT
    calls,
    round(total_exec_time::numeric, 2) AS total_time_ms,
    round(mean_exec_time::numeric, 2) AS mean_time_ms,
    rows,
    substring(query, 1, 150) AS query_truncated
FROM pg_stat_statements
ORDER BY total_exec_time DESC
LIMIT 10;

-- 4. View Most Frequently Executed Queries
SELECT
    calls,
    round(total_exec_time::numeric, 2) AS total_time_ms,
    round(mean_exec_time::numeric, 2) AS mean_time_ms,
    substring(query, 1, 150) AS query_truncated
FROM pg_stat_statements
ORDER BY calls DESC
LIMIT 10;

-- 5. Reset Query Statistics (Run before starting a benchmark test)
-- SELECT pg_stat_statements_reset();
