import { loadRepositoryModule } from './load-player-catalogue.mjs';
import assert from 'node:assert/strict';import fs from 'node:fs';import path from 'node:path';import http from 'node:http';
const {chromium}=await import(process.env.FC27_PLAYWRIGHT_MODULE||'playwright');
const root=path.resolve('dist');const output=process.env.FC27_QA_OUTPUT||'preview/sbc-20261026-qa';fs.mkdirSync(output,{recursive:true});
let server;let base=process.env.FC27_QA_URL;
if(!base){server=http.createServer((req,res)=>{let f=path.join(root,decodeURIComponent(req.url.split('?')[0]));if(!fs.existsSync(f)||fs.statSync(f).isDirectory())f=path.join(root,'index.html');res.setHeader('Content-Type',({'.js':'application/javascript','.html':'text/html','.json':'application/json','.png':'image/png','.webp':'image/webp','.ttf':'font/ttf','.css':'text/css'})[path.extname(f)]||'application/octet-stream');fs.createReadStream(f).pipe(res);});await new Promise(r=>server.listen(8103,'127.0.0.1',r));base='http://127.0.0.1:8103';}
const browser=await chromium.launch({headless:true,...(process.env.FC27_CHROMIUM_PATH?{executablePath:process.env.FC27_CHROMIUM_PATH}:{}),args:['--no-sandbox','--disable-dev-shm-usage']});const errors=[];
const audit=JSON.parse(fs.readFileSync('assets/data/sbc-refresh-20261026.json','utf8'));
const report=[];
try {
 for(const language of ['he','en']) for(const width of [360,390,1280]) {
  const context=await browser.newContext({viewport:{width,height:900},isMobile:width<600,hasTouch:width<600});
  const page=await context.newPage();page.on('pageerror',e=>errors.push(e.message));
await context.addInitScript(language=>{if(location.origin==='null')return;let uid='50000000-0000-4000-8000-000000000001',exp=Math.floor(Date.now()/1000)+3600;let token=btoa(JSON.stringify({alg:'HS256',typ:'JWT'}))+'.'+btoa(JSON.stringify({sub:uid,exp,role:'authenticated'}))+'.local-qa';localStorage.setItem('fc27-language',language);localStorage.setItem('futz-cookie-notice','essential-2026-09-27');localStorage.setItem('futz-terms-accepted-'+uid,'2026-09-28-v1');localStorage.setItem('sb-hxjgphhcspzjnkkzdmpk-auth-token',JSON.stringify({access_token:token,refresh_token:'local-qa',expires_at:exp,token_type:'bearer',user:{id:uid,email:'season2-qa@example.invalid',aud:'authenticated',role:'authenticated',user_metadata:{display_name:'Season 2 QA'},app_metadata:{provider:'email'},created_at:new Date().toISOString()}}));},language);
await context.route('https://hxjgphhcspzjnkkzdmpk.supabase.co/**',async route=>{let url=new URL(route.request().url());await route.fulfill({status:200,contentType:'application/json',body:JSON.stringify(url.pathname.endsWith('/rpc/browse_site')?{}:[])});});

    // Keep every request in the synthetic environment; never read or write real accounts.
    if(process.env.FC27_QA_LOCAL_ROUTES==='1')await context.route(base+'/**',async route=>{let file=path.join(root,decodeURIComponent(new URL(route.request().url()).pathname));if(!fs.existsSync(file)||fs.statSync(file).isDirectory())file=path.join(root,'index.html');await route.fulfill({status:200,contentType:({'.js':'application/javascript','.html':'text/html','.json':'application/json','.png':'image/png','.webp':'image/webp','.ttf':'font/ttf','.css':'text/css'})[path.extname(file)]||'application/octet-stream',body:fs.readFileSync(file)});});
    await context.route('**/api/**', route=>route.fulfill({status:200,contentType:'application/json',body:'{}'}));
    await context.route('https://**/*', route=>route.request().url().startsWith('https://hxjgphhcspzjnkkzdmpk.supabase.co/')?route.fallback():route.abort());

  async function checkReward(challenge) {
   const reward=page.getByTestId('sbc-reward-'+challenge.id);await reward.waitFor();
   if(challenge.id==='sbc-hero-20261026'){
    assert.match(await reward.innerText(),/HERO · 1 OF 4/);
    for(const id of ['hero-ruicosta','hero-luishernandez','hero-henriklarsson','hero-parkjisung']){
     const image=reward.getByTestId('sbc-hero-choice-'+id);await image.waitFor();assert((await image.innerHTML()).includes(id),'Wrong Hero picture '+id);
    }
    assert.doesNotMatch(await reward.innerHTML(),/pack-79|79\+/);
   }
   if(challenge.id==='sbc-candy-20261026'){
    await reward.getByTestId('sbc-mixed-players-pack').waitFor();assert.match(await reward.innerText(),/MIXED/);assert.doesNotMatch(await reward.innerHTML(),/pack-copper|pack-79/);
   }
   if(['sbc-laliga-20261026','sbc-premier-20261026'].includes(challenge.id))assert.match(await reward.innerText(),/2× MAX 85/);
   assert(await reward.evaluate(el=>el.scrollWidth<=el.clientWidth+2),'Reward art overflow '+challenge.id);
  }
  await page.goto(base+'/sbc');
  for(const challenge of audit.challenges){await checkReward(challenge);const reward=page.getByTestId('sbc-reward-'+challenge.id);await reward.scrollIntoViewIfNeeded();await page.screenshot({path:path.join(output,challenge.id+'-list-reward-'+language+'-'+width+'.png')});}
  for(const challenge of audit.challenges){
   await page.goto(base+'/sbc/'+challenge.id);
   await checkReward(challenge);await page.getByTestId('sbc-reward-'+challenge.id).scrollIntoViewIfNeeded();await page.screenshot({path:path.join(output,challenge.id+'-detail-reward-'+language+'-'+width+'.png')});
   let panel;
   if(challenge.kind==='streamlined'){
    await page.getByTestId('sbc-empty-selection').first().waitFor();
    assert.equal(await page.getByTestId('sbc-selected-card').count(),0);
    const segments=audit.points[challenge.id].segments;assert.equal(await page.getByTestId('sbc-manual-summary').count(),segments.length);
    for(let i=0;i<segments.length;i++){assert.match(await page.getByTestId('sbc-manual-summary').nth(i).innerText(),new RegExp(segments[i].target.toLocaleString('en-US')));}
    const options=page.getByRole('button',{name:language==='he'?'פתרונות מוכנים':'Ready-made options',exact:true});for(let i=0;i<segments.length;i++)await options.nth(i).click();
    assert.equal(await page.getByTestId('sbc-verified-points-plan').count(),segments.length);
    for(let i=0;i<segments.length;i++){const option=page.getByTestId('sbc-verified-points-plan').nth(i);await option.waitFor();assert(await option.getByTestId('sbc-option-card').count()>0);await option.scrollIntoViewIfNeeded();await page.screenshot({path:path.join(output,challenge.id+'-segment-'+i+'-'+language+'-'+width+'.png')});}
    panel=page.getByTestId('sbc-verified-points-plan').first();await panel.waitFor();
    assert(await panel.getByTestId('sbc-option-card').count()>0);
    assert.match(await panel.innerText(),language==='he'?/עומדים בדרישות/:/meet this segment/);
   }else{
    panel=page.getByTestId('sbc-checked-classic');await panel.waitFor();
    assert.match(await panel.innerText(),language==='he'?/עומד בדרישות האתגר/:/meets challenge requirements/);
    if(challenge.id==='sbc-candy-20261026')for(const slot of ['lcam','cam','rcam','lcdm','rcdm'])await panel.getByTestId('sbc-locked-'+slot).waitFor();
   }
   assert.doesNotMatch(await page.locator('body').innerText(),/FUT\.?GG|FUTBIN|מקור הפתרון|מקור הדרישות|נבדק לאחרונה|נבדק:|Requirements source|Solution source|Last checked|Checked:|Requirements and points checked/i);
   assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+2),challenge.id+' horizontal overflow');
   const bounds=await panel.boundingBox();assert(bounds&&bounds.x>=-2&&bounds.x+bounds.width<=width+2,challenge.id+' panel clipped');
   const visual=challenge.kind==='classic'?panel.getByTestId('squad-pitch'):panel.getByTestId('sbc-option-card').first();
   await visual.scrollIntoViewIfNeeded();
   await page.screenshot({path:path.join(output,challenge.id+'-'+language+'-'+width+'.png')});
   if(challenge.kind==='classic'){
    await panel.getByTestId('sbc-surface').scrollIntoViewIfNeeded();
    await page.screenshot({path:path.join(output,challenge.id+'-checks-'+language+'-'+width+'.png')});
   }
   if(['sbc-mor-20261025','sbc-woltemade-20261025'].includes(challenge.id)){
    const image=page.getByTestId('sbc-card-complete-'+challenge.id).locator('img').or(page.locator('img[data-testid="sbc-card-complete-'+challenge.id+'"]')).first();
    await image.waitFor();assert((await image.getAttribute('src')).includes(challenge.id.includes('mor')?'50562888':'67362886'));
   }
   report.push({id:challenge.id,language,width,passed:true});
  }
  await page.goto(base+'/sbc/build/sbc-candy-20261026');
  for(const slot of ['lcam','cam','rcam','lcdm','rcdm'])await page.getByTestId('sbc-locked-'+slot).waitFor({state:'visible'});
  await page.getByTestId('squad-pitch').scrollIntoViewIfNeeded();
  await page.screenshot({path:path.join(output,'candy-builder-'+language+'-'+width+'.png')});
  await context.close();console.log('PASS',language,width,'four new sets, all six segments and brick builder');
 }
 assert.deepEqual(errors,[]);
 fs.writeFileSync(path.join(output,'report.json'),JSON.stringify({report,errors,network:'synthetic account; all external requests blocked'},null,2));
} catch(error){const page=browser.contexts().at(-1)?.pages().at(-1);if(page)await page.screenshot({path:path.join(output,'failure.png'),fullPage:true}).catch(()=>{});fs.writeFileSync(path.join(output,'failure.json'),JSON.stringify({error:String(error),url:page?.url(),report,errors},null,2));throw error;}
finally{await browser.close();server?.close();}

