/* global localStorage */
import assert from 'node:assert/strict';
import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
const { chromium } = await import(process.env.FC27_PLAYWRIGHT_MODULE || 'playwright');
const root=path.resolve('dist');
const server=http.createServer((req,res)=>{let file=path.join(root,decodeURIComponent(req.url.split('?')[0]));if(!fs.existsSync(file)||fs.statSync(file).isDirectory())file=root+'/index.html';res.setHeader('Content-Type',({'.js':'application/javascript','.html':'text/html','.png':'image/png','.webp':'image/webp'})[path.extname(file)]||'application/octet-stream');fs.createReadStream(file).pipe(res);});
await new Promise(r=>server.listen(8096,'127.0.0.1',r));
const browser=await chromium.launch({headless:true,...(process.env.FC27_CHROMIUM_PATH?{executablePath:process.env.FC27_CHROMIUM_PATH}:{}),...(process.env.FC27_CHROMIUM_ARGS?{args:JSON.parse(process.env.FC27_CHROMIUM_ARGS)}:{})});
const errors=[];let page;
try{
 for(const language of ['he','en']){
  const context=await browser.newContext({viewport:{width:390,height:844}});
  await context.addInitScript(language=>{localStorage.setItem('fc27-language',language);localStorage.setItem('futz-cookie-notice','daily-choice-2026-10-21');},language);
  await context.route('https://hxjgphhcspzjnkkzdmpk.supabase.co/**',r=>r.fulfill({status:200,contentType:'application/json',body:JSON.stringify({profiles:[],careerChallenges:[],futPosts:[],groundsPosts:[],sbcChallenges:[],sbcSolutions:[]})}));
  page=await context.newPage();page.on('pageerror',e=>errors.push(e.message));
  for(const width of [390,1280]){
   await page.setViewportSize({width,height:900});
   await page.goto('http://127.0.0.1:8096/sbc/sbc-upgrade-83x2-20261020');
   await page.getByTestId('sbc-verified-points-plan').waitFor();
   assert(await page.getByRole('img',{name:'Item Score',exact:true}).count()>0);
   const swap=page.getByRole('button',{name:language==='he'?'שחקן חלופי באותו ניקוד':'Alternative player with the same score'}).first();await swap.click();
   const progress=page.getByRole('textbox',{name:language==='he'?'נקודות שכבר הגשת במשחק':'Points already submitted in-game',exact:true});
   await progress.fill('5499');await page.getByTestId('sbc-verified-points-plan').waitFor();
   await progress.fill('5500');await page.getByText(language==='he'?'לפי הניקוד שהזנתם, הגעתם ליעד.':'Your entered progress reaches the target.',{exact:true}).waitFor();
   await progress.fill('0');await page.getByTestId('sbc-verified-points-plan').waitFor();
   assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+2),'Points layout overflow');
   console.log('SBC_SOLUTION_SCREENSHOT='+JSON.stringify({name:`sbc-points-${language}-${width}`,mimeType:'image/jpeg',data:(await page.screenshot({type:'jpeg',quality:75,fullPage:true})).toString('base64')}));
   await page.goto('http://127.0.0.1:8096/sbc/sbc-league-nation-advanced');
   await page.getByTestId('sbc-checked-classic').waitFor();
   await page.getByText('4 Leagues & 5 Nations',{exact:true}).first().click();
   await page.getByText('5 Leagues & 6 Nations',{exact:true}).first().click();
   assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+2),'Classic layout overflow');
   console.log('SBC_SOLUTION_SCREENSHOT='+JSON.stringify({name:`sbc-classic-${language}-${width}`,mimeType:'image/jpeg',data:(await page.screenshot({type:'jpeg',quality:75,fullPage:true})).toString('base64')}));
  }
  await context.close();
 }
 assert.deepEqual(errors,[]);console.log('SBC solutions UI passed: HE/EN, phone/desktop, source-checked cards, item score icon, swaps, partial/completed progress, multi-segment squads and no overflow.');
}catch(error){if(page&&!page.isClosed())console.log('SBC_SOLUTION_SCREENSHOT='+JSON.stringify({name:'sbc-solution-failure',mimeType:'image/jpeg',data:(await page.screenshot({type:'jpeg',quality:75,fullPage:true})).toString('base64')}));throw error;}finally{await browser.close();server.close();}
