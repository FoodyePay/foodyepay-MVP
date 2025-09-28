#!/usr/bin/env node
/**
 * Environment self-check script.
 * Fails with non-zero exit code if critical vars are missing.
 * Does NOT print secret values.
 */

const REQUIRED = [
  'CDP_API_KEY_ID',
  'CDP_API_PRIVATE_KEY',
  'CDP_PROJECT_ID',
  'NEXT_PUBLIC_SUPABASE_URL',
  'NEXT_PUBLIC_SUPABASE_ANON_KEY',
];

const OPTIONAL = [
  'SUPABASE_SERVICE_ROLE_KEY',
  'GOOGLE_MAPS_API_KEY',
  'TWILIO_ACCOUNT_SID',
  'TWILIO_AUTH_TOKEN',
];

function has(name){
  const v = process.env[name];
  return typeof v === 'string' && v.trim().length > 0;
}

let missing = [];
for(const k of REQUIRED){
  if(!has(k)) missing.push(k);
}

console.log('FoodyePay Environment Check');
console.log('============================');
for(const k of REQUIRED){
  console.log(`${k}: ${has(k) ? 'OK' : 'MISSING'}`);
}
for(const k of OPTIONAL){
  console.log(`${k}: ${has(k) ? 'OK (optional)' : 'NOT SET (optional)'}`);
}

if(missing.length){
  console.error('\nMissing required environment variables:', missing.join(', '));
  process.exit(1);
} else {
  console.log('\nAll required environment variables are present.');
}
