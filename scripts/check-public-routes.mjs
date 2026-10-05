import process from 'node:process';
const base=(process.argv.find(x=>x.startsWith('--base-url='))||'').split('=')[1]||process.env.BASE_URL||'http://127.0.0.1:4173';
const routes=['/','/work','/services','/about','/contact','/privacy-policy','/terms-of-service','/admin/login'];
let failed=0;
for(const route of routes){try{const response=await fetch(new URL(route,base));const html=await response.text();const ok=response.status===200&&html.includes('<div id="root">');console.log(`${ok?'PASS':'FAIL'} ${response.status} ${route}`);if(!ok)failed++;}catch(error){console.error(`FAIL ${route}: ${error.message}`);failed++;}}
if(failed){console.error(`${failed} route check(s) failed`);process.exit(1)}
console.log(`All ${routes.length} public route checks passed against ${base}`);
