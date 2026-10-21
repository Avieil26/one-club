/* global localStorage, location, btoa */
import assert from 'node:assert/strict';
import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
const {chromium}=await import(process.env.FC27_PLAYWRIGHT_MODULE||'playwright');
const root=path.resolve('dist'),shots=process.env.FC27_UI_ARTIFACTS||'/tmp';
const server=http.createServer((req,res)=>{let file=path.join(root,decodeURIComponent(req.url.split('?')[0]));if(!fs.existsSync(file)||fs.statSync(file).isDirectory())file=root+'/index.html';const ext=path.extname(file);res.setHeader('Content-Type',({'.js':'application/javascript','.html':'text/html','.png':'image/png','.webp':'image/webp'})[ext]||'application/octet-stream');fs.createReadStream(file).pipe(res);});
await new Promise(r=>server.listen(8095,'127.0.0.1',r));
const browser=await chromium.launch({headless:true,...(process.env.FC27_CHROMIUM_PATH?{executablePath:process.env.FC27_CHROMIUM_PATH}:{}),...(process.env.FC27_CHROMIUM_ARGS?{args:JSON.parse(process.env.FC27_CHROMIUM_ARGS)}:{})});
let lastPage;
const errors=[],uid='10000000-0000-4000-8000-000000000001';
async function setup(language,signedIn=false,admin=false){
 const context=await browser.newContext({viewport:{width:1280,height:1000}});let recorded=0;
 await context.addInitScript(({language,signedIn,uid,admin})=>{
  if(location.origin==='null')return;
  if(admin)localStorage.setItem('fc27-daily-measurement-v1','yes');
  if(signedIn){localStorage.setItem('fc27-language',language);localStorage.setItem('futz-cookie-notice','daily-choice-2026-10-21');localStorage.setItem('futz-terms-accepted-'+uid,'2026-09-28-v1');const token=btoa(JSON.stringify({alg:'HS256',typ:'JWT'}))+'.'+btoa(JSON.stringify({sub:uid,exp:Math.floor(Date.now()/1000)+3600,role:'authenticated'}))+'.test';localStorage.setItem('sb-hxjgphhcspzjnkkzdmpk-auth-token',JSON.stringify({access_token:token,refresh_token:'mock-only',expires_at:Math.floor(Date.now()/1000)+3600,token_type:'bearer',user:{id:uid,email:'preview@example.invalid',aud:'authenticated',role:'authenticated',user_metadata:{display_name:'Preview player'},app_metadata:{provider:'email'},created_at:new Date().toISOString()}}));}
 },{language,signedIn,uid,admin});
 await context.route('https://hxjgphhcspzjnkkzdmpk.supabase.co/**',async route=>{let body=[];const url=new URL(route.request().url());if(url.pathname.endsWith('/rpc/browse_site'))body={profiles:[],careerChallenges:[],futPosts:[],groundsPosts:[],sbcChallenges:[],sbcSolutions:[]};else if(url.pathname.endsWith('/profiles'))body=[{id:uid,display_name:'Preview player',is_admin:admin,approved_count:0,reputation:0,created_at:new Date().toISOString()}];else if(url.pathname.endsWith('/rpc/record_daily_activity')){recorded++;body='2026-10-21';}else if(url.pathname.endsWith('/rpc/retention_summary'))body={cohorts:[],daily:[],started_day:null};await route.fulfill({status:200,contentType:'application/json',body:JSON.stringify(body)});});
 const page=await context.newPage();lastPage=page;page.on('pageerror',e=>errors.push(e.message));return {context,page,recorded:()=>recorded};
}
try{
 for(const language of ['he','en']){
  const {context,page,recorded}=await setup(language);const t=(he,en)=>language==='he'?he:en;
  await page.goto('http://127.0.0.1:8095/');
  await page.getByRole('button',{name:language==='he'?'🇮🇱 עברית המשך בעברית ←':'🇬🇧 English Continue in English →',exact:true}).click();
  await page.getByText(t('מה משחקים היום?','What are we playing today?'),{exact:true}).waitFor();
  await page.getByRole('button',{name:t('רק אחסון חיוני','Essential only'),exact:true}).click();
  assert(!new URL(page.url()).pathname.includes('register'),'Guest was forced to register');
  assert.equal(await page.getByRole('button',{name:'FUT Champions',exact:true}).count(),1,'Home mislabels Champions');
  const nav=await page.getByTestId('site-navigation').innerText();
  for(const width of [390,768,1280,1920]){
   await page.setViewportSize({width,height:1000});
   await page.getByText(t('חדש ב־SBC','New in SBCs'),{exact:true}).waitFor();
   assert.equal(await page.locator('body').evaluate(n=>n.scrollWidth>innerWidth),false,'Home overflows at '+width);
   if(width===390)await page.screenshot({type:'jpeg',quality:85,path:path.join(shots,`polish-home-${language}.jpg`)});
  }
  await page.setViewportSize({width:1280,height:1000});await page.goto('http://127.0.0.1:8095/grounds');
  assert.equal(await page.getByTestId('site-navigation').innerText(),nav,'Grounds changes global navigation');
  const grounds=await page.locator('body').innerText();
  assert(!/Rankings are not available|Community challenges are coming|live data source|הדירוג עדיין לא זמין|אתגרי הקהילה בדרך|מקור נתונים פעיל/.test(grounds));
  await page.screenshot({type:'jpeg',quality:85,path:path.join(shots,`polish-grounds-${language}.jpg`)});
  await page.goto('http://127.0.0.1:8095/sbc');
  const search=page.getByRole('textbox',{name:t('חיפוש SBC','Search SBCs'),exact:true});await search.fill('Ferran');
  await page.getByRole('button',{name:'Ferran Torres',exact:true}).waitFor();
  assert.equal(await page.locator('[data-testid^="sbc-reward-"]').count(),1);
  await page.getByRole('tab',{name:t('חבילות','Packs'),exact:true}).click();
  assert.equal(await page.locator('[data-testid^="sbc-reward-"]').count(),0);
  await page.getByRole('button',{name:t('איפוס חיפוש וסינון','Reset search & filters'),exact:true}).click();
  await page.getByRole('tab',{name:t('שדרוגים','Upgrades'),exact:true}).click();
  assert(await page.locator('[data-testid^="sbc-reward-"]').count()>0);
  assert.equal(await page.getByRole('button',{name:'Ferran Torres',exact:true}).count(),0);
  await page.screenshot({type:'jpeg',quality:85,path:path.join(shots,`polish-sbc-${language}.jpg`)});
  await page.goto('http://127.0.0.1:8095/sbc/sbc-potm-ferran');
  await page.getByRole('img',{name:'Ferran Torres 85 ST',exact:true}).waitFor();
  await page.goto('http://127.0.0.1:8095/grounds/new');await page.waitForURL('**/register');
  assert.equal(await page.evaluate(()=>JSON.parse(localStorage.getItem('fc27-community-return-v1')).path),'/grounds/new');
  assert.equal(recorded(),0,'Guests must not be measured');
  for(const name of [`polish-home-${language}`,`polish-grounds-${language}`,`polish-sbc-${language}`])console.log('POLISH_SCREENSHOT='+JSON.stringify({name,mimeType:'image/jpeg',data:fs.readFileSync(path.join(shots,name+'.jpg')).toString('base64')}));
  await context.close();
 }
 const invitation=await setup('en');await invitation.page.goto('http://127.0.0.1:8095/grounds/new');await invitation.page.getByRole('button',{name:'🇬🇧 English Continue in English →',exact:true}).click();await invitation.page.waitForURL('**/register');assert.equal(await invitation.page.evaluate(()=>JSON.parse(localStorage.getItem('fc27-community-return-v1')).path),'/grounds/new');await invitation.context.close();
 const signed=await setup('en',true);await signed.page.goto('http://127.0.0.1:8095/settings');
 const consent=signed.page.getByRole('switch',{name:'Daily usage measurement',exact:true});await consent.waitFor();assert.equal(await consent.getAttribute('aria-checked'),'false');assert.equal(signed.recorded(),0,'Measurement ran without consent');
 const measurement=signed.page.waitForResponse(response=>response.url().endsWith('/rpc/record_daily_activity'));
 await consent.click();await measurement;await signed.page.waitForFunction(()=>localStorage.getItem('fc27-daily-measurement-v1')==='yes');
 assert.equal(signed.recorded(),1,'Opt-in did not record an active day');
 await consent.click();await signed.page.waitForFunction(()=>localStorage.getItem('fc27-daily-measurement-v1')==='no');
 await signed.page.goto('http://127.0.0.1:8095/sbc');await signed.page.getByRole('textbox',{name:'Search SBCs',exact:true}).waitFor();assert.equal(signed.recorded(),1,'Opt-out did not stop recording');await signed.context.close();
 const admin=await setup('en',true,true);await admin.page.goto('http://127.0.0.1:8095/admin/retention');await admin.page.getByText('Measurement is ready',{exact:true}).waitFor();assert.equal(admin.recorded(),0,'Admin activity is counted');await admin.context.close();
 assert.deepEqual(errors,[]);
 console.log('Site polish browser checks passed: bilingual guest entry, stable global nav, private action return, Home responsive widths, SBC search/filters, explicit daily measurement opt-in/out and admin report. All API requests mocked.');
}catch(error){if(lastPage&&!lastPage.isClosed())console.log('POLISH_SCREENSHOT='+JSON.stringify({name:'polish-failure',mimeType:'image/jpeg',data:(await lastPage.screenshot({type:'jpeg',quality:85})).toString('base64')}));throw error;}finally{await browser.close();server.close();}
