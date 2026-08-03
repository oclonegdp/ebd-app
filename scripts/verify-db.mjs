import 'dotenv/config';
import { Client } from 'pg';

const c = new Client({ connectionString: process.env.DIRECT_URL });
await c.connect();
const t = await c.query("SELECT table_name FROM information_schema.tables WHERE table_schema = 'public' ORDER BY table_name");
console.log('Tabelas:', t.rows.map(r => r.table_name).join(', '));
const p = await c.query("SELECT policyname, tablename FROM pg_policies WHERE schemaname = 'public' ORDER BY tablename");
console.log('Políticas RLS:', p.rows.length);
const cols = await c.query("SELECT column_name FROM information_schema.columns WHERE table_name = 'businesses' ORDER BY ordinal_position");
console.log('Colunas businesses:', cols.rows.map(r => r.column_name).join(', '));
await c.end();
