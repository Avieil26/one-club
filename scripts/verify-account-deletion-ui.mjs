/* global localStorage */
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import http from 'node:http';
const {chromium}=await import('playwright');
const root=path.resolve('dist'),output='preview/account-deletion-qa';fs.mkdirSync(output,{recursive:true});
const server=http.createServer((req,res)=>{let file=path.join(root,decodeURIComponent(req.url.split('?')[0]));if(!fs.existsSync(file)||fs.statSync(file).isDirectory())file=path.join(root,'index.html');res.setHeader('Content-Type',({'.js':'application/javascript','.html':'text/html','.css':'text/css','.png':'image/png','.webp':'image/webp','.ttf':'font/ttf'})[path.extname(file)]||'application/octet-stream');fs.createReadStream(file).pipe(res);});
await new Promise(r=>server.listen(8104,'127.0.0.1',r));
const base='http://127.0.0.1:8104';
const browser=await chromium.launch({headless:true,executablePath:process.env.FC27_CHROMIUM_PATH,args:['--no-sandbox','--disable-dev-shm-usage']});
const errors=[],report=[];
try{
 for(const language of ['he','en'])for(const width of [360,390,1280]){
  const context=await browser.newContext({viewport:{width,height:900}});
  await context.addInitScript(language=>{localStorage.setItem('fc27-language',language);localStorage.setItem('futz-cookie-notice','essential-2026-09-27');},language);
  await context.route('https://**/*',route=>route.request().url().startsWith('https://hxjgphhcspzjnkkzdmpk.supabase.co/')?route.fulfill({status:200,contentType:'application/json',body:route.request().url().includes('/rpc/browse_site')?'{}':'[]'}):route.abort());
  await context.route('**/api/**',route=>route.fulfill({status:200,contentType:'application/json',body:'{}'}));
  const page=await context.newPage();page.on('pageerror',e=>errors.push(e.message));
  await page.goto(base+'/legal/delete-account');
  await page.getByTestId('account-deletion-page').waitFor();
  assert.equal(new URL(page.url()).pathname,'/legal/delete-account');
  assert.equal(await page.evaluate(()=>Object.keys(localStorage).some(k=>k.endsWith('-auth-token'))),false,'Public deletion must not need an account session');
  const request=page.getByTestId('request-account-deletion');
  const href=await request.getAttribute('href');
  assert(href?.startsWith('mailto:avielindapurkar717@gmail.com?'));
  assert(decodeURIComponent(href).includes('Account and data deletion request'));
  assert.match(await page.getByTestId('deletion-contact').innerText(),/avielindapurkar717@gmail.com/);
  assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+2),'Public request page overflows');
  await request.scrollIntoViewIfNeeded();await page.screenshot({path:path.join(output,`request-${language}-${width}.png`)});
  const label=language==='he'?'בקשת מחיקת חשבון ונתונים':'Request account and data deletion';
  await page.goto(base+'/settings');
  const settingsLink=page.getByRole('link',{name:label,exact:true});await settingsLink.waitFor();await settingsLink.scrollIntoViewIfNeeded();await page.screenshot({path:path.join(output,`settings-${language}-${width}.png`)});await settingsLink.click();
  await page.waitForURL(base+'/legal/delete-account');await page.getByTestId('account-deletion-page').waitFor();
  await page.goto(base+'/legal/privacy');await page.getByRole('link',{name:label,exact:true}).click();await page.waitForURL(base+'/legal/delete-account');
  report.push({language,width,publicWithoutSession:true,emailRequest:true,settingsLink:true,privacyLink:true});
  await context.close();console.log('PASS account deletion',language,width);
 }
 // A visitor who has never chosen a language must also reach the page directly.
 const cold=await browser.newContext({viewport:{width:360,height:900}});
 await cold.route('https://**/*',r=>r.fulfill({status:200,contentType:'application/json',body:'[]'}));
 const page=await cold.newPage();await page.goto(base+'/legal/delete-account');await page.getByTestId('account-deletion-page').waitFor();assert.equal(new URL(page.url()).pathname,'/legal/delete-account');await cold.close();
 assert.deepEqual(errors,[]);fs.writeFileSync(path.join(output,'report.json'),JSON.stringify({report,coldStartPublic:true,errors,network:'Mocked account services; no email sent or account deleted'},null,2));
}catch(error){const page=browser.contexts().at(-1)?.pages().at(-1);if(page)await page.screenshot({path:path.join(output,'failure.png')}).catch(()=>{});fs.writeFileSync(path.join(output,'failure.json'),JSON.stringify({error:String(error),url:page?.url(),errors,report},null,2));throw error;}
finally{await browser.close();server.close();}
