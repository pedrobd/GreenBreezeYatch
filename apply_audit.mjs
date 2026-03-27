import pkg from 'pg';
const { Client } = pkg;
import fs from 'fs';
import path from 'path';

const connectionString = "postgresql://postgres:syVlKqYBVWACjk4R@db.gtaytqkzonbiyfmjwtbd.supabase.co:5432/postgres";

async function applySql() {
  const client = new Client({ connectionString });
  
  try {
    await client.connect();
    console.log("Connected to database.");
    
    // Read the SQL file
    const sqlPath = "c:\\Users\\Pedro\\Documents\\Meu\\Greenbreeze-Admin\\database\\00_security_audit.sql";
    const sql = fs.readFileSync(sqlPath, 'utf8');
    
    console.log("Executing SQL script...");
    await client.query(sql);
    console.log("SQL script executed successfully!");
    
  } catch (err) {
    console.error("Error executing SQL:", err);
  } finally {
    await client.end();
  }
}

applySql();
