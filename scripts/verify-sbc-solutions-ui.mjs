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
   await page.getByRole('button',{name:language==='he'?'בחירת שחקנים שיש לי':'Choose players I own',exact:true}).click();
   const search=page.getByRole('textbox',{name:language==='he'?'חיפוש שחקן להשלמה':'Find a player for this SBC',exact:true});
   await search.fill('60');await page.waitForFunction(()=>{const rows=[...document.querySelectorAll('[data-testid="sbc-player-search-results"] [role="button"]')];return rows.length>0&&rows.every(row=>row.textContent.includes('60 OVR'));});await page.getByTestId('sbc-player-search-results').getByRole('button').first().click();
   assert.match(await page.getByTestId('sbc-selected-score').innerText(),/20/);
   await search.fill('76');await page.waitForFunction(()=>{const rows=[...document.querySelectorAll('[data-testid="sbc-player-search-results"] [role="button"]')];return rows.length>0&&rows.every(row=>row.textContent.includes('76 OVR'));});await page.getByTestId('sbc-player-search-results').getByRole('button').first().click();
   assert.match(await page.getByTestId('sbc-selected-score').innerText(),/120/);
   assert.match(await page.getByTestId('sbc-score-remaining').innerText(),/5,380/);
   await page.getByTestId('sbc-selected-items').getByRole('button',{name:language==='he'?/^הגדלת כמות/:/^Increase quantity of/}).last().click();
   assert.match(await page.getByTestId('sbc-selected-score').innerText(),/220/);
   await page.getByTestId('sbc-selected-items').getByRole('button',{name:language==='he'?/^הפחתת/:/^Remove one/}).first().click();
   assert.match(await page.getByTestId('sbc-selected-score').innerText(),/200/);
   await page.getByRole('button',{name:language==='he'?'פתרונות להשלמה':'Completion options',exact:true}).click();
   await page.getByRole('button',{name:language==='he'?'שחקנים שונים ללא כפילויות':'Different players, no duplicates',exact:true}).click();
   await page.getByRole('button',{name:language==='he'?'בחירת הפתרון ועריכת הקלפים':'Use this option and edit items',exact:true}).click();
   assert.match(await page.getByTestId('sbc-score-remaining').innerText(),/\b0\b/);
   await page.getByRole('button',{name:language==='he'?'ניקוי הבחירה':'Clear selected items',exact:true}).click();
   assert.match(await page.getByTestId('sbc-selected-score').innerText(),/\b0\b/);
   await page.getByRole('button',{name:language==='he'?'פתרונות להשלמה':'Completion options',exact:true}).click();
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
 assert.deepEqual(errors,[]);console.log('SBC solutions UI passed: owned-player search, 20+100 points, quantities, removal, distinct options, preset editing, clear basket; HE/EN, phone/desktop, source-checked cards, item score icon, swaps, partial/completed progress, multi-segment squads and no overflow.');
}catch(error){if(page&&!page.isClosed())console.log('SBC_SOLUTION_SCREENSHOT='+JSON.stringify({name:'sbc-solution-failure',mimeType:'image/jpeg',data:(await page.screenshot({type:'jpeg',quality:75,fullPage:true})).toString('base64')}));throw error;}finally{await browser.close();server.close();}
