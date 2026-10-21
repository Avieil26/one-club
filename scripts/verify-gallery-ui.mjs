/* global localStorage, location */
import assert from 'node:assert/strict';
import fs from 'node:fs';
import http from 'node:http';
import path from 'node:path';
const {chromium}=await import(process.env.FC27_PLAYWRIGHT_MODULE||'playwright');
const root=path.resolve('dist'),errors=[],requests=[];
const server=http.createServer((req,res)=>{let file=path.join(root,decodeURIComponent(req.url.split('?')[0]));if(!fs.existsSync(file)||fs.statSync(file).isDirectory())file=root+'/index.html';res.setHeader('Content-Type',({'.js':'application/javascript','.html':'text/html','.json':'application/json','.png':'image/png','.webp':'image/webp','.ico':'image/x-icon','.ttf':'font/ttf'})[path.extname(file)]||'application/octet-stream');fs.createReadStream(file).pipe(res);});
await new Promise(r=>server.listen(8098,'127.0.0.1',r));
const browser=await chromium.launch({headless:true,...(process.env.FC27_CHROMIUM_PATH?{executablePath:process.env.FC27_CHROMIUM_PATH}:{}),args:['--no-sandbox','--disable-dev-shm-usage']});
fs.mkdirSync('preview/gallery-qa',{recursive:true});
try{
 for(const language of ['he','en'])for(const width of [390,1280]){
  const context=await browser.newContext({viewport:{width,height:1000}});const page=await context.newPage();page.on('pageerror',error=>errors.push(error.message));page.on('request',r=>requests.push(r.url()));
  await context.addInitScript(language=>{if(location.origin==='null')return;localStorage.setItem('fc27-language',language);localStorage.setItem('futz-cookie-notice','essential-2026-09-27');},language);
  await context.route('https://hxjgphhcspzjnkkzdmpk.supabase.co/**',async route=>{const url=new URL(route.request().url());let body=[];if(url.pathname.endsWith('/rpc/browse_site'))body={};await route.fulfill({status:200,contentType:'application/json',body:JSON.stringify(body)});});
  const t=(he,en)=>language==='he'?he:en;
  await page.goto('http://127.0.0.1:8098/gallery');
  await page.getByTestId('gallery-set-tile').first().waitFor();assert.equal(await page.getByTestId('gallery-set-tile').count(),18);
  assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+2),'Index overflow');
  await page.screenshot({path:`preview/gallery-qa/index-${language}-${width}.png`,fullPage:false});
  await page.getByRole('button',{name:'Como Gallery',exact:true}).click();
  await page.getByText(t('אפשרויות לאוסף','Lineup options'),{exact:true}).waitFor();
  await page.getByRole('button',{name:t('דרגות ופרסים','Grades & rewards'),exact:true}).click();
  for(const grade of ['D','C','B','A','S'])await page.getByTestId('gallery-reward-'+grade).waitFor();
  await page.screenshot({path:`preview/gallery-qa/grades-${language}-${width}.png`,fullPage:false});
  await page.getByRole('button',{name:t('בנייה עצמית','Build your own'),exact:true}).click();
  assert.equal(await page.getByTestId('gallery-selected-card').count(),0);
  assert((await page.getByTestId('gallery-current-grade').innerText()).includes(t('האוסף עדיין לא מלא','Set not full yet')));
  await page.getByRole('textbox',{name:t('חיפוש שחקן, גרסה או דירוג','Search player, edition or rating')}).fill('Nico Paz');
  await page.getByTestId('gallery-search-card').first().waitFor();
  await page.getByTestId('gallery-search-card').first().getByRole('button',{name:t('הוספה לתכנון','Add to plan'),exact:true}).click();
  assert.equal(await page.getByTestId('gallery-selected-card').count(),1);
  const card=page.getByTestId('gallery-selected-card').first();await card.getByRole('checkbox').click();assert.equal(await card.getByRole('checkbox').getAttribute('aria-checked'),'true');
  await page.getByRole('button',{name:t('שמירת התכנון','Save plan'),exact:true}).click();
  await page.getByTestId('gallery-message').waitFor();
  await page.reload();await page.getByRole('button',{name:t('בנייה עצמית','Build your own'),exact:true}).click();
  await page.getByTestId('gallery-selected-card').first().waitFor();
  assert.equal(await page.getByTestId('gallery-selected-card').count(),1);
  await page.getByRole('button',{name:t('התחלה מאפס','Start from zero'),exact:true}).click();assert.equal(await page.getByTestId('gallery-selected-card').count(),0);
  await page.getByRole('button',{name:t('פתרונות','Solutions'),exact:true}).click();
  await page.getByRole('button',{name:t('צפייה ובחירת הפתרון','View and choose lineup'),exact:true}).first().click();
  assert.equal(await page.getByTestId('gallery-selected-card').count(),15);
  await page.getByRole('textbox',{name:t('חיפוש שחקן, גרסה או דירוג','Search player, edition or rating')}).fill('Nico Paz');
  assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+2),'Builder overflow');
  await page.screenshot({path:`preview/gallery-qa/builder-${language}-${width}.png`,fullPage:false});
  if(language==='en')assert(!/[\u0590-\u05FF]/.test((await page.locator('body').innerText()).replace('עב','')),'Hebrew leaked into English screen');
  console.log('Gallery UI passed',language,width);
  await context.close();
 }
 assert.deepEqual(errors,[]);
 console.log('Gallery UI passed: real index, D-S rewards, empty builder, searched full cards, First Owner, local save/reload, reset, full 15-item solution, no overflow, HE/EN. Auth/community API mocked.');
}finally{await browser.close();server.close();}
