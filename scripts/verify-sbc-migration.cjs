const fs = require('fs');
const { createClient } = require('@supabase/supabase-js');

for (const path of ['.env', '.env.local']) {
  if (!fs.existsSync(path)) continue;
  for (const line of fs.readFileSync(path, 'utf8').split(/\r?\n/)) {
    const m = line.match(/^([^#=]+)=(.*)$/);
    if (!m) continue;
    process.env[m[1].trim()] = m[2].trim().replace(/^['"]|['"]$/g, '');
  }
}

const url = process.env.EXPO_PUBLIC_SUPABASE_URL;
const key = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;
console.log('has_url', Boolean(url), 'has_key', Boolean(key));
if (!url || !key) {
  console.log('MISSING_KEYS');
  process.exit(1);
}

const sb = createClient(url, key);

(async () => {
  const col = await sb.from('sbc_challenges').select('id,catalog_key,title').limit(5);
  if (col.error) {
    console.log('catalog_key_column: FAIL');
    console.log('detail:', col.error.message);
  } else {
    console.log('catalog_key_column: OK');
    console.log('challenge_rows:', col.data.length);
  }

  const rpc = await sb.rpc('add_sbc_solution', {
    p_challenge: 'sbc-mm-celtic',
    p_explanation: '',
    p_images: [],
    p_title: 't',
    p_requirements: 'r',
    p_kind: 'classic',
    p_ends: null,
    p_target: null,
  });

  const msg = rpc.error?.message || '';
  if (!rpc.error) {
    console.log('rpc_new_signature: UNEXPECTED_SUCCESS_WITHOUT_AUTH');
  } else if (/Could not find the function|PGRST202|404/.test(msg)) {
    console.log('rpc_new_signature: MISSING');
    console.log('detail:', msg);
  } else if (/צריך להתחבר|not authenticated|JWT|auth/i.test(msg)) {
    console.log('rpc_new_signature: OK (asks for login — expected)');
  } else if (/חסר הסבר|צריך לפחות צילום/.test(msg)) {
    console.log('rpc_new_signature: OK (validates input — expected)');
  } else {
    console.log('rpc_new_signature: RESPONDED');
    console.log('detail:', msg);
  }

  const sols = await sb.from('sbc_solutions').select('id,challenge_id,status').limit(5);
  if (sols.error) {
    const anonBlocked = /JWT|permission|RLS|policy|authenticated/i.test(sols.error.message) || sols.error.code === 'PGRST301';
    console.log('solutions_read:', anonBlocked ? 'needs_auth (normal for anon)' : 'FAIL: ' + sols.error.message);
  } else {
    console.log('solutions_read: OK rows=', sols.data.length);
  }
})().catch((e) => {
  console.error('ERR', e.message);
  process.exit(1);
});
