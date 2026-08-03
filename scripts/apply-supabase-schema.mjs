import 'dotenv/config';
import { readFileSync } from 'fs';
import { Client } from 'pg';

async function main() {
  const connectionString = process.env.DIRECT_URL || process.env.DATABASE_URL;
  if (!connectionString) {
    console.error('DIRECT_URL ou DATABASE_URL não definidos no .env');
    process.exit(1);
  }

  const sql = readFileSync(new URL('../src/db/supabase-multi-tenant-schema.sql', import.meta.url), 'utf-8');

  const client = new Client({ connectionString });
  await client.connect();
  console.log('Conectado ao banco. Aplicando schema (idempotente)...');

  try {
    await client.query(sql);
    console.log('Schema aplicado com sucesso.');
  } catch (err) {
    console.error('Erro ao aplicar schema:', err instanceof Error ? err.message : err);
    process.exit(1);
  } finally {
    await client.end();
  }
}

main();
