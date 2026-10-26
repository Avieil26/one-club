import assert from 'node:assert/strict';
import fs from 'node:fs';
import http from 'node:http';
import path from 'node:path';
const {chromium}=await import(process.env.FC27_PLAYWRIGHT_MODULE||'playwright');
const root=path.resolve('dist'),errors=[],requests=[];
const server=http.createServer((req,res)=>{let file=path.join(root,decodeURIComponent(req.url.split('?')[0]));if(!fs.existsSync(file)||fs.statSync(file).isDirectory())file=root+'/index.html';res.setHeader('Content-Type',({'.js':'application/javascript','.html':'text/html','.json':'application/json','.png':'image/png','.webp':'image/webp','.ico':'image/x-icon','.ttf':'font/ttf'})[path.extname(file)]||'application/octet-stream');fs.createReadStream(file).pipe(res);});
await new Promise(r=>server.listen(8101,'127.0.0.1',r));
const browser=await chromium.launch({headless:true,...(process.env.FC27_CHROMIUM_PATH?{executablePath:process.env.FC27_CHROMIUM_PATH}:{}),args:['--no-sandbox','--disable-dev-shm-usage']});
const output=process.env.FC27_QA_OUTPUT || 'preview/home-formations-qa';
fs.mkdirSync(output,{recursive:true});
async function loadedCards(page, scope) {
 const cards=page.getByTestId(scope).locator('img[src*="futgg-player-item-card"]');
 assert(await cards.count()>0,'Real player card images must be rendered');
 await cards.evaluateAll(images=>Promise.all(images.map(image=>image.decode())));
 assert(await cards.evaluateAll(images=>images.every(image=>image.complete&&image.naturalWidth>0)),'Player art did not load');
}
async function noOverflow(page, label) {
 assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+2),label+' page overflow');
 const escaped=await page.locator('[data-testid="gallery-selected-card"], [data-testid="gallery-set-tile"], [data-testid="gallery-grade-selector"]').evaluateAll(elements=>elements.filter(el=>{const r=el.getBoundingClientRect();return r.width>0&&(r.left< -2||r.right>innerWidth+2);}).length);
 assert.equal(escaped,0,label+' clipped cards or grade controls');
}
const imageCache=new Map();
async function routeOriginalImages(context){
 if(!process.env.FC27_PROXY_IMAGE_CURL)return;
 const {promisify}=await import('node:util');const {execFile}=await import('node:child_process');const run=promisify(execFile);
 await context.route('https://game-assets.fut.gg/**',async route=>{const url=route.request().url();if(!imageCache.has(url))imageCache.set(url,run('curl',['--fail','--max-time','35','-sS',url],{encoding:'buffer',maxBuffer:5*1024*1024}).then(r=>r.stdout));try{const body=await imageCache.get(url);await route.fulfill({status:200,contentType:body[0]===137?'image/png':'image/webp',body});}catch{await route.abort();}});
}
try{for(const language of ['he','en'])for(const width of [360,390,1280]){const context=await browser.newContext({viewport:{width,height:1000}});await routeOriginalImages(context);const page=await context.newPage();
  await context.addInitScript(language=>{
   if(location.origin==='null')return;
   const uid='50000000-0000-4000-8000-000000000001',exp=Math.floor(Date.now()/1000)+3600;
   const token=btoa(JSON.stringify({alg:'HS256',typ:'JWT'}))+'.'+btoa(JSON.stringify({sub:uid,exp,role:'authenticated'}))+'.local-qa';
   localStorage.setItem('fc27-language',language);localStorage.setItem('futz-cookie-notice','essential-2026-09-27');
   localStorage.setItem('futz-terms-accepted-'+uid,'2026-09-28-v1');
   localStorage.setItem('sb-hxjgphhcspzjnkkzdmpk-auth-token',JSON.stringify({access_token:token,refresh_token:'local-qa',expires_at:exp,token_type:'bearer',user:{id:uid,email:'gallery-qa@example.invalid',aud:'authenticated',role:'authenticated',user_metadata:{display_name:'Gallery QA'},app_metadata:{provider:'email'},created_at:new Date().toISOString()}}));
  },language);
  await context.route('https://hxjgphhcspzjnkkzdmpk.supabase.co/**',async route=>{const url=new URL(route.request().url());let body=[];if(url.pathname.endsWith('/rpc/browse_site'))body={};await route.fulfill({status:200,contentType:'application/json',body:JSON.stringify(body)});});


const t=(he,en)=>language==='he'?he:en;
await page.goto('http://127.0.0.1:8101/');await page.getByText('Season 2 · FC Heritage',{exact:true}).waitFor({state:'hidden'});await page.getByText(t('מתחילים לשחק','Start playing'),{exact:true}).count();
await page.goto('http://127.0.0.1:8101/squad');await page.getByText('4-3-3 (3)',{exact:true}).click();const choose=t('בחר שחקן','Choose player');const dms=page.getByRole('button',{name:'CDM: '+choose,exact:true});await dms.first().waitFor();assert.equal(await dms.count(),2);assert.equal(await page.getByRole('button',{name:'CAM: '+choose,exact:true}).count(),0);await page.getByRole('button',{name:'CM: '+choose,exact:true}).scrollIntoViewIfNeeded();await noOverflow(page,'433 Defend');await page.screenshot({path:path.join(output,`defend-${language}-${width}.png`),fullPage:false});
await page.getByText('4-3-3 (4)',{exact:true}).click();const cam=page.getByRole('button',{name:'CAM: '+choose,exact:true});await cam.waitFor();assert.equal(await page.getByRole('button',{name:'CM: '+choose,exact:true}).count(),2);assert.equal(await page.getByRole('button',{name:'CDM: '+choose,exact:true}).count(),0);await cam.scrollIntoViewIfNeeded();await noOverflow(page,'433 Attack');await page.screenshot({path:path.join(output,`attack-${language}-${width}.png`),fullPage:false});console.log('Home/formations UI passed',language,width);await context.close();}}finally{await browser.close();server.close();}
