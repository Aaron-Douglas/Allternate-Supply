/**
 * Create an admin user in local Supabase: creates Auth user (if needed) and inserts into staff_profiles.
 *
 * Usage (from project root):
 *   node scripts/create-admin.mjs <email> <password>
 *
 * Loads SUPABASE_SERVICE_ROLE_KEY and NEXT_PUBLIC_SUPABASE_URL from .env.local.
 * Example:
 *   node scripts/create-admin.mjs terrell@aarondouglas.us 'Maximus1!'
 */

import { createClient } from '@supabase/supabase-js';
import { readFileSync, existsSync } from 'fs';
import { resolve } from 'path';

function loadEnvLocal() {
  const path = resolve(process.cwd(), '.env.local');
  if (!existsSync(path)) {
    console.error('Missing .env.local. Run from project root.');
    process.exit(1);
  }
  const content = readFileSync(path, 'utf8');
  for (const line of content.split('\n')) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    const eq = trimmed.indexOf('=');
    if (eq === -1) continue;
    const key = trimmed.slice(0, eq).trim();
    const raw = trimmed.slice(eq + 1).trim();
    const value = raw.startsWith('"') && raw.endsWith('"')
      ? raw.slice(1, -1).replace(/\\"/g, '"')
      : raw.startsWith("'") && raw.endsWith("'")
        ? raw.slice(1, -1).replace(/\\'/g, "'")
        : raw;
    if (key && value !== undefined) process.env[key] = value;
  }
}

loadEnvLocal();

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!url || !serviceRoleKey) {
  console.error('Set NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in .env.local');
  process.exit(1);
}

const email = process.argv[2];
const password = process.argv[3];

if (!email || !password) {
  console.error('Usage: node scripts/create-admin.mjs <email> <password>');
  process.exit(1);
}

const supabase = createClient(url, serviceRoleKey, { auth: { autoRefreshToken: false, persistSession: false } });

async function main() {
  let userId;

  const { data: existing } = await supabase.auth.admin.listUsers();
  const existingUser = existing?.users?.find((u) => u.email?.toLowerCase() === email.toLowerCase());

  if (existingUser) {
    userId = existingUser.id;
    console.log('Auth user already exists for', email);
  } else {
    const { data: created, error: createError } = await supabase.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
    });
    if (createError) {
      console.error('Failed to create Auth user:', createError.message);
      process.exit(1);
    }
    userId = created.user.id;
    console.log('Created Auth user for', email);
  }

  const { error: insertError } = await supabase.from('staff_profiles').upsert(
    {
      id: userId,
      full_name: email.split('@')[0].replace(/[._]/g, ' ') || 'Admin',
      role: 'admin',
    },
    { onConflict: 'id' }
  );

  if (insertError) {
    console.error('Failed to add admin profile:', insertError.message);
    process.exit(1);
  }

  console.log('Admin user ready. Sign in at your app with', email);
}

main();
