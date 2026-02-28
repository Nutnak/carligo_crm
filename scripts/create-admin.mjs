/**
 * Script de création du premier utilisateur admin CRM
 * Usage: node scripts/create-admin.mjs
 *
 * Nécessite que SUPABASE_URL et SUPABASE_SERVICE_ROLE_KEY soient dans .env.local
 */

import { createClient } from '@supabase/supabase-js'
import bcrypt from 'bcryptjs'
import { readFileSync } from 'fs'
import { resolve } from 'path'

// Lire .env.local manuellement
const envPath = resolve(process.cwd(), '.env.local')
const envContent = readFileSync(envPath, 'utf-8')
const env = Object.fromEntries(
  envContent
    .split('\n')
    .filter((l) => l && !l.startsWith('#'))
    .map((l) => l.split('=').map((s) => s.trim().replace(/^'|'$/g, '')))
)

const supabase = createClient(env.SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY)

const name = process.argv[2] || 'Admin'
const email = process.argv[3] || env.ADMIN_EMAIL || 'admin@carligo.fr'
const password = process.argv[4] || env.ADMIN_PASSWORD

if (!password) {
  console.error('❌ Mot de passe requis. Usage: node scripts/create-admin.mjs "Nom" "email" "motdepasse"')
  process.exit(1)
}

console.log(`\n📧 Création de l'utilisateur : ${email}`)

const password_hash = await bcrypt.hash(password, 12)

const { data, error } = await supabase
  .from('crm_users')
  .insert({ name, email, password_hash })
  .select('id, name, email')
  .single()

if (error) {
  if (error.code === '23505') {
    console.error('⚠️  Cet email existe déjà dans crm_users')
  } else if (error.code === '42P01') {
    console.error('❌ La table crm_users n\'existe pas encore.')
    console.error('   Exécutez d\'abord le SQL suivant dans Supabase SQL Editor :')
    console.error(`
CREATE TABLE crm_users (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  email text UNIQUE NOT NULL,
  password_hash text NOT NULL,
  created_at timestamptz DEFAULT now()
);
    `)
  } else {
    console.error('❌ Erreur :', error.message)
  }
  process.exit(1)
}

console.log(`✅ Utilisateur créé :`)
console.log(`   Nom    : ${data.name}`)
console.log(`   Email  : ${data.email}`)
console.log(`   ID     : ${data.id}\n`)
