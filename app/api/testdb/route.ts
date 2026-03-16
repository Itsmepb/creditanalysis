import { NextResponse } from "next/server";
import pkg from "pg";
const { Pool } = pkg;

export async function GET() {
  try {
    // Check if env variable exists
    const dbUrl = process.env.DATABASE_URL;

    if (!dbUrl) {
      return NextResponse.json({
        success: false,
        step:    "env_check",
        error:   "DATABASE_URL is not set in .env.local",
        fix:     "Add DATABASE_URL=your-connection-string to .env.local",
      });
    }

    // Show safe version of URL (hide password)
    const safeUrl = dbUrl.replace(/:([^@]+)@/, ":***@");

    // Try to connect
    const pool = new Pool({
      connectionString: dbUrl,
      ssl:                     { rejectUnauthorized: false },
      connectionTimeoutMillis: 10000,
    });

    const client = await pool.connect();

    // Run test queries
    const dbName  = await client.query("SELECT current_database() AS db");
    const tables  = await client.query(`
      SELECT table_name
      FROM information_schema.tables
      WHERE table_schema = 'public'
      ORDER BY table_name
    `);
    const entityCount = await client.query(
      "SELECT COUNT(*) AS count FROM entity_master"
    );
    const statementCount = await client.query(
      "SELECT COUNT(*) AS count FROM financial_statements"
    );

    client.release();
    await pool.end();

    return NextResponse.json({
      success:        true,
      database:       dbName.rows[0].db,
      url:            safeUrl,
      tables:         tables.rows.map((r: { table_name: string }) => r.table_name),
      entityCount:    parseInt(entityCount.rows[0].count),
      statementCount: parseInt(statementCount.rows[0].count),
      message:        "Supabase connected successfully",
    });

  } catch (error) {
    const dbUrl    = process.env.DATABASE_URL || "";
    const safeUrl  = dbUrl.replace(/:([^@]+)@/, ":***@");

    return NextResponse.json({
      success: false,
      step:    "connection",
      error:   String(error),
      url:     safeUrl || "not set",
      fixes: [
        "Make sure DATABASE_URL is correct in .env.local",
        "Try adding ?sslmode=require at the end of connection string",
        "Try port 6543 instead of 5432 (Supabase pooler)",
        "Check if your network allows outbound port 5432",
      ],
    });
  }
}