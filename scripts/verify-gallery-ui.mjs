import assert from 'node:assert/strict';
import fs from 'node:fs';
import http from 'node:http';
import path from 'node:path';
const {chromium}=await import(process.env.FC27_PLAYWRIGHT_MODULE||'playwright');
const root=path.resolve('dist'),errors=[],requests=[];
const server=http.createServer((req,res)=>{let file=path.join(root,decodeURIComponent(req.url.split('?')[0]));if(!fs.existsSync(file)||fs.statSync(file).isDirectory())file=root+'/index.html';res.setHeader('Content-Type',({'.js':'application/javascript','.html':'text/html','.json':'application/json','.png':'image/png','.webp':'image/webp','.ico':'image/x-icon','.ttf':'font/ttf'})[path.extname(file)]||'application/octet-stream');fs.createReadStream(file).pipe(res);});
await new Promise(r=>server.listen(8098,'127.0.0.1',r));
const browser=await chromium.launch({headless:true,...(process.env.FC27_CHROMIUM_PATH?{executablePath:process.env.FC27_CHROMIUM_PATH}:{}),args:['--no-sandbox','--disable-dev-shm-usage']});
const output=process.env.FC27_QA_OUTPUT || 'preview/gallery-qa';
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
try{
 for(const language of ['he','en'])for(const width of [360,390,1536]){
  const context=await browser.newContext({viewport:{width,height:1000}});const page=await context.newPage();page.on('pageerror',error=>errors.push(error.message));page.on('request',r=>requests.push(r.url()));
  // A synthetic member exists only in this isolated localhost browser context.
  // All auth/community requests below are intercepted; no account is created.
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
  await page.goto('http://127.0.0.1:8098/gallery');
  await page.getByTestId('gallery-set-tile').first().waitFor();assert.equal(await page.getByTestId('gallery-set-tile').count(),18);
  await loadedCards(page,'gallery-set-tile');
  await noOverflow(page,'Index');
  await page.screenshot({path:path.join(output,`index-${language}-${width}.png`),fullPage:false});
  await page.getByRole('button',{name:'Como Gallery',exact:true}).click();
  await page.getByText(t('אפשרויות לאוסף','Lineup options'),{exact:true}).waitFor();
  await page.getByRole('button',{name:t('דרגות ופרסים','Grades & rewards'),exact:true}).click();
  for(const grade of ['D','C','B','A','S'])await page.getByTestId('gallery-reward-'+grade).waitFor();
  await noOverflow(page,'Rewards');
  await page.screenshot({path:path.join(output,`grades-${language}-${width}.png`),fullPage:false});
  await page.getByRole('button',{name:t('בנייה עצמית','Build your own'),exact:true}).click();
  assert.equal(await page.getByTestId('gallery-selected-card').count(),0);
  assert((await page.getByTestId('gallery-current-grade').innerText()).includes(t('האוסף עדיין לא מלא','Set not full yet')));
  for(const grade of ['D','C','B','A','S']){
   await page.getByRole('button',{name:'Grade '+grade,exact:true}).click();
   await page.getByTestId('gallery-target-label').filter({hasText:new RegExp(': '+grade+' ·')}).waitFor();
  }
  await page.getByRole('button',{name:'Grade D',exact:true}).click();
  await page.getByRole('textbox',{name:t('חיפוש שחקן, גרסה או דירוג','Search player, edition or rating')}).fill('Nico Paz');
  await page.getByTestId('gallery-search-card').first().waitFor();
  await page.getByTestId('gallery-search-card').first().getByRole('button',{name:t('הוספה לתכנון','Add to plan'),exact:true}).click();
  assert.equal(await page.getByTestId('gallery-selected-card').count(),1);
  const card=page.getByTestId('gallery-selected-card').first();await card.getByRole('checkbox').click();
  await card.getByRole('checkbox',{checked:true}).waitFor();
  await page.getByRole('button',{name:t('שמירת התכנון','Save plan'),exact:true}).click();
  await page.getByTestId('gallery-message').waitFor();
  await page.reload();await page.getByRole('button',{name:t('בנייה עצמית','Build your own'),exact:true}).click();
  await page.getByTestId('gallery-selected-card').first().waitFor();
  assert.equal(await page.getByTestId('gallery-selected-card').count(),1);
  await page.getByRole('button',{name:t('התחלה מאפס','Start from zero'),exact:true}).click();assert.equal(await page.getByTestId('gallery-selected-card').count(),0);
  await page.getByRole('button',{name:t('פתרונות','Solutions'),exact:true}).click();
  await page.getByRole('button',{name:t('צפייה ובחירת הפתרון','View and choose lineup'),exact:true}).first().click();
  assert.equal(await page.getByTestId('gallery-selected-card').count(),15);
  await page.getByRole('textbox',{name:t('חיפוש שחקן, גרסה או דירוג','Search player, edition or rating')}).fill('');
  await loadedCards(page,'gallery-selected-card');
  await noOverflow(page,'Builder');
  await page.getByRole('button',{name:'Grade B',exact:true}).click();
  await page.screenshot({path:path.join(output,`builder-${language}-${width}.png`),fullPage:false});
  await page.getByTestId('gallery-selected-card').first().scrollIntoViewIfNeeded();
  await page.screenshot({path:path.join(output,`cards-${language}-${width}.png`),fullPage:false});
  if(language==='en')assert(!/[\u0590-\u05FF]/.test((await page.locator('body').innerText()).replace('עב','')),'Hebrew leaked into English screen');
  console.log('Gallery UI passed',language,width);
  await context.close();
 }
 assert.deepEqual(errors,[]);
 console.log('Gallery UI passed: real index, D-S rewards, empty builder, searched full cards, First Owner, local save/reload, reset, full 15-item solution, no overflow, HE/EN. Auth/community API mocked.');
}finally{await browser.close();server.close();}
