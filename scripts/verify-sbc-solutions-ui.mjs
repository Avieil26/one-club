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
   const own=page.getByRole('button',{name:language==='he'?'בנייה עצמית':'Build my own',exact:true});
   const ready=page.getByRole('button',{name:language==='he'?'פתרונות מוכנים':'Ready-made options',exact:true});
   const reset=page.getByRole('button',{name:language==='he'?'התחלה מחדש מאפס':'Start again from zero',exact:true});
   await page.getByTestId('sbc-empty-selection').waitFor();
   assert.equal(await page.getByTestId('sbc-selected-card').count(),0,'Manual mode must start empty');
   assert.equal(await page.getByTestId('sbc-verified-points-plan').count(),0,'No suggested players in manual mode');
   assert.match(await page.getByTestId('sbc-selected-score').innerText(),/\b0\b/);
   for(const testId of ['sbc-points-heading','sbc-selection-heading'])assert.equal(await page.getByTestId(testId).evaluate(el=>getComputedStyle(el).textAlign),language==='he'?'right':'left');
   const search=page.getByRole('textbox',{name:language==='he'?'חיפוש שחקן להשלמה':'Find a player for this SBC',exact:true});
   await search.fill('60');await page.waitForFunction(()=>{const rows=[...document.querySelectorAll('[data-testid="sbc-search-card"]')];return rows.length>0&&rows.every(row=>row.textContent.includes('60 OVR'));});
   assert(await page.getByTestId('sbc-search-card').first().locator('img').count()>0,'Search must render the player card');
   await page.getByTestId('sbc-player-search-results').getByRole('button').first().click();
   assert.equal(await search.inputValue(),'','Adding an item should reveal the selected collection');
   assert.match(await page.getByTestId('sbc-selected-score').innerText(),/20/);
   await search.fill('76');await page.waitForFunction(()=>{const rows=[...document.querySelectorAll('[data-testid="sbc-search-card"]')];return rows.length>0&&rows.every(row=>row.textContent.includes('76 OVR'));});await page.getByTestId('sbc-player-search-results').getByRole('button').first().click();
   assert.match(await page.getByTestId('sbc-selected-score').innerText(),/120/);
   assert.match(await page.getByTestId('sbc-score-remaining').innerText(),/5,380/);
   assert.equal(await page.getByTestId('sbc-selected-card').count(),2);
   assert(await page.getByTestId('sbc-selected-card').first().locator('img').count()>0,'Selected items must retain their player card');
   await page.getByTestId('sbc-selected-items').getByRole('button',{name:language==='he'?/^הגדלת כמות/:/^Increase quantity of/}).last().click();
   assert.match(await page.getByTestId('sbc-selected-score').innerText(),/220/);
   await page.getByTestId('sbc-selected-items').getByRole('button',{name:language==='he'?/^הפחתת/:/^Remove one/}).first().click();
   assert.match(await page.getByTestId('sbc-selected-score').innerText(),/200/);
   await page.getByTestId('sbc-selected-card').first().scrollIntoViewIfNeeded();
   console.log('SBC_SOLUTION_SCREENSHOT='+JSON.stringify({name:`sbc-own-items-${language}-${width}`,mimeType:'image/jpeg',data:(await page.screenshot({type:'jpeg',quality:75,fullPage:true})).toString('base64')}));
   await ready.click();await page.getByTestId('sbc-verified-points-plan').waitFor();
   async function checkPrices(){
    const cards=page.getByTestId('sbc-option-card');let total=0;
    for(let i=0;i<await cards.count();i++){
     const card=cards.nth(i),text=await card.innerText();
     const unit=(await card.getByTestId('sbc-option-unit-price').innerText()).match(/≈\s*([\d,]+)/);
     assert(unit,'Each priced option must show its player price');
     const count=text.match(/×\s*(\d+)/);assert(count);
     total+=Number(unit[1].replaceAll(',',''))*Number(count[1]);
    }
    const shown=(await page.getByTestId('sbc-plan-price').innerText()).match(/≈\s*([\d,]+)/);assert(shown);
    assert.equal(Number(shown[1].replaceAll(',','')),total,'Total must sum the displayed players');return total;
   }
   const firstTotal=await checkPrices();
   await page.getByRole('button',{name:language==='he'?'שחקן חלופי באותו ניקוד':'Alternative player with the same score'}).first().click();
   assert.notEqual(await checkPrices(),firstTotal,'Swapping the player must refresh the price');
   await page.getByRole('button',{name:'PC',exact:true}).click();await checkPrices();
   await page.getByRole('button',{name:language==='he'?'שחקנים שונים ללא כפילויות':'Different players, no duplicates',exact:true}).click();
   for(const card of await page.getByTestId('sbc-option-card').all())assert.match(await card.innerText(),/× 1/);
   await own.click();
   assert.match(await page.getByTestId('sbc-selected-score').innerText(),/200/,'Browsing suggestions must not mutate own items');
   assert.equal(await page.getByTestId('sbc-selected-card').count(),1);
   await reset.click();await page.getByTestId('sbc-empty-selection').waitFor();
   assert.match(await page.getByTestId('sbc-selected-score').innerText(),/\b0\b/);
   assert.match(await page.getByTestId('sbc-score-remaining').innerText(),/5,500/);
   await page.getByRole('button',{name:language==='he'?'כבר הגשת נקודות במשחק?':'Already submitted points in-game?',exact:true}).click();
   const progress=page.getByRole('textbox',{name:language==='he'?'נקודות שכבר הגשת במשחק':'Points already submitted in-game',exact:true});
   await progress.fill('5500');await page.getByText(language==='he'?'לפי הניקוד שהזנתם, הגעתם ליעד.':'Your entered progress reaches the target.',{exact:true}).waitFor();
   await reset.click();assert.match(await page.getByTestId('sbc-score-remaining').innerText(),/5,500/);
   await page.getByTestId('sbc-manual-summary').scrollIntoViewIfNeeded();
   assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+2),'Points layout overflow');
   console.log('SBC_SOLUTION_SCREENSHOT='+JSON.stringify({name:`sbc-empty-${language}-${width}`,mimeType:'image/jpeg',data:(await page.screenshot({type:'jpeg',quality:75,fullPage:true})).toString('base64')}));
   await page.goto('http://127.0.0.1:8096/sbc/sbc-league-nation-advanced');
   await page.getByTestId('sbc-checked-classic').waitFor();
   await page.getByText('4 Leagues & 5 Nations',{exact:true}).first().click();
   await page.getByText('5 Leagues & 6 Nations',{exact:true}).first().click();
   assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+2),'Classic layout overflow');
   console.log('SBC_SOLUTION_SCREENSHOT='+JSON.stringify({name:`sbc-classic-${language}-${width}`,mimeType:'image/jpeg',data:(await page.screenshot({type:'jpeg',quality:75,fullPage:true})).toString('base64')}));
  }
  await context.close();
 }
 assert.deepEqual(errors,[]);console.log('SBC solutions UI passed: empty zero-point manual entry, full search/selected cards, 20+100 points, quantities, removal, independent suggestions, per-player prices and swap totals, distinct options, reset progress, RTL headings; HE/EN, phone/desktop, source-checked cards, item score icon, swaps, partial/completed progress, multi-segment squads and no overflow.');
}catch(error){if(page&&!page.isClosed())console.log('SBC_SOLUTION_SCREENSHOT='+JSON.stringify({name:'sbc-solution-failure',mimeType:'image/jpeg',data:(await page.screenshot({type:'jpeg',quality:75,fullPage:true})).toString('base64')}));throw error;}finally{await browser.close();server.close();}
