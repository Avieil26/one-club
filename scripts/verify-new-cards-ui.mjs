import { loadRepositoryModule } from './load-player-catalogue.mjs';
import assert from 'node:assert/strict';import fs from 'node:fs';import path from 'node:path';import http from 'node:http';
const {chromium}=await import(process.env.FC27_PLAYWRIGHT_MODULE||'playwright');
const root=path.resolve('dist');const output=process.env.FC27_QA_OUTPUT||'preview/new-cards-qa';fs.mkdirSync(output,{recursive:true});
let server;let base=process.env.FC27_QA_URL;
if(!base){server=http.createServer((req,res)=>{let f=path.join(root,decodeURIComponent(req.url.split('?')[0]));if(!fs.existsSync(f)||fs.statSync(f).isDirectory())f=path.join(root,'index.html');res.setHeader('Content-Type',({'.js':'application/javascript','.html':'text/html','.json':'application/json','.png':'image/png','.webp':'image/webp','.ttf':'font/ttf','.css':'text/css'})[path.extname(f)]||'application/octet-stream');fs.createReadStream(f).pipe(res);});await new Promise(r=>server.listen(8102,'127.0.0.1',r));base='http://127.0.0.1:8102';}
const browser=await chromium.launch({headless:true,...(process.env.FC27_CHROMIUM_PATH?{executablePath:process.env.FC27_CHROMIUM_PATH}:{}),args:['--no-sandbox','--disable-dev-shm-usage']});const errors=[];
const cards=JSON.parse(fs.readFileSync('assets/data/recentCards20261024.json','utf8'));

async function noOverflow(page,label) {
  assert(await page.evaluate(()=>document.documentElement.scrollWidth <= innerWidth+2), label+' document overflow');
  const clipped = await page.locator('[data-testid="recent-card-info"], [data-testid="player-edition-links"], img[alt$="New release"]').evaluateAll(es=>es.filter(e=>{const r=e.getBoundingClientRect();if(!r.width)return false;if(r.left< -2||r.right>innerWidth+2)return true;for(let p=e.parentElement;p;p=p.parentElement){const pr=p.getBoundingClientRect();if(['hidden','clip'].includes(getComputedStyle(p).overflowX)&&(r.left<pr.left-2||r.right>pr.right+2))return true;}return false;}).length);
  assert.equal(clipped, 0, label+' clipped card/panel');
}
async function art(page,card) {
  const image = page.getByRole('img',{name:`${card.en} · ${card.rating} · New release`,exact:true}).first();
  await image.waitFor();
  await image.evaluate(i=>i.decode());
  assert(await image.evaluate(i=>i.complete&&i.naturalWidth>0));
  assert((await image.getAttribute('src')).includes(`${card.itemId}.`),'Wrong exact edition artwork: '+card.id);
  return image;
}
const {playerEditionsFor}=loadRepositoryModule('lib/playerEditions.ts');
const savedPrices=JSON.parse(fs.readFileSync('assets/data/marketPrices.json','utf8'));
const report = [];
try {
  for (const language of ['he','en']) for (const width of [360,390,1280]) {
    const context = await browser.newContext({viewport:{width,height:900},isMobile:width<600,hasTouch:width<600});
    const page = await context.newPage();
    page.on('pageerror',e=>errors.push(e.message));
// Synthetic session isolated to this test context. All account/community requests are mocked; no real account or DB writes.
await context.addInitScript(language=>{if(location.origin==='null')return;let uid='50000000-0000-4000-8000-000000000001',exp=Math.floor(Date.now()/1000)+3600;let token=btoa(JSON.stringify({alg:'HS256',typ:'JWT'}))+'.'+btoa(JSON.stringify({sub:uid,exp,role:'authenticated'}))+'.local-qa';localStorage.setItem('fc27-language',language);localStorage.setItem('futz-cookie-notice','essential-2026-09-27');localStorage.setItem('futz-terms-accepted-'+uid,'2026-09-28-v1');localStorage.setItem('sb-hxjgphhcspzjnkkzdmpk-auth-token',JSON.stringify({access_token:token,refresh_token:'local-qa',expires_at:exp,token_type:'bearer',user:{id:uid,email:'season2-qa@example.invalid',aud:'authenticated',role:'authenticated',user_metadata:{display_name:'Season 2 QA'},app_metadata:{provider:'email'},created_at:new Date().toISOString()}}));},language);
await context.route('https://hxjgphhcspzjnkkzdmpk.supabase.co/**',async route=>{let url=new URL(route.request().url());await route.fulfill({status:200,contentType:'application/json',body:JSON.stringify(url.pathname.endsWith('/rpc/browse_site')?{}:[])});});

    // Keep every request in the synthetic environment; never read or write real accounts.
    await context.route('**/api/**', route=>route.fulfill({status:200,contentType:'application/json',body:'{}'}));
    await context.route('https://**/*', route=>route.request().url().startsWith('https://hxjgphhcspzjnkkzdmpk.supabase.co/')?route.fallback():route.abort());
    await page.goto(base+'/market');
    const filter = page.getByRole('button',{name:language==='he'?'הקלפים החדשים · 23–24 באוקטובר':'New releases · 23–24 October',exact:true});
    await filter.click();
    await page.getByRole('img',{name:/New release$/}).first().waitFor();
    await page.getByText(language==='he'?/מתוך 51$/:/of 51$/).waitFor();
    await noOverflow(page,'catalogue');
    await page.screenshot({path:path.join(output,`catalogue-${language}-${width}.png`)});
    // Search within recent filter, then navigate to that exact edition by touching its artwork.
    const chosen = cards.find(c=>c.en==='Emre Mor');
    await page.getByRole('textbox').first().fill('Emre Mor');
    await page.waitForFunction(()=>document.querySelectorAll('img[alt$="New release"]').length===1);
    const searched = await art(page,chosen);
    assert.equal(await page.getByRole('img',{name:/New release$/}).count(),1);
    await page.getByRole('button').filter({has:searched}).click();
    await page.waitForURL(new RegExp(chosen.id));
    const seen = new Set();
    for (const card of cards) {
      await page.goto(base+'/market/'+card.id);
      await art(page,card);
      const panel = page.getByTestId('recent-card-info');
      await panel.waitFor();
      const text = await panel.innerText();
      assert(text.includes(card.family),card.id+' family');
      if(card.holographicType) assert(text.includes(card.holographicType==='pristine'?'Pristine':'Holographic'));
      if(card.price.kind==='sbc') {
        assert.match(text,language==='he'?/עלות השלמת SBC משוערת/:/Estimated SBC completion cost/);
        for(const p of [card.price.console,card.price.pc].filter(Boolean)) assert(text.includes(p.toLocaleString('en-US')));
        assert.equal(await page.getByRole('button',{name:language==='he'?'קונסולות':'Consoles',exact:true}).count(),0);
      } else if(card.price.kind==='unavailable'||(!card.price.console&&!card.price.pc)) {
        assert.match(text,language==='he'?/אין מחיר שוק זמין/:/No market price is currently available/);
      } else if(card.price.console) {
        await page.getByText(card.price.console.toLocaleString('en-US'),{exact:true}).first().waitFor();
      }
      const siblings = playerEditionsFor(card).filter(c=>c.id!==card.id);
      const strip = page.getByTestId('player-edition-links');
      await strip.waitFor();
      assert.equal(await strip.getByRole('button').count(),siblings.length);
      assert.equal(await strip.getByTestId(`edition-link-${card.id}`).count(),0);
      for(const sibling of siblings) assert.equal(await strip.getByTestId(`edition-link-${sibling.id}`).count(),1);
      assert.equal(await page.getByText(/Full-potential projection|תחזית נתונים במלוא הפוטנציאל/).count(),0);
      await noOverflow(page,card.id);
      const key=[card.family,card.holographicType,card.price.kind,card.position==='GK'].join('-');
      if(!seen.has(key)) {
        seen.add(key);
        await page.screenshot({path:path.join(output,`${card.itemId}-${language}-${width}.png`)});
        await panel.screenshot({path:path.join(output,`${card.itemId}-info-${language}-${width}.png`)});
      }
    }
    // Exercise real one-click navigation to every available version and back, including originals.
    for (const itemId of [100896715,67346556,100664497,67378268]) {
      const anchor=cards.find(c=>c.itemId===itemId);
      await page.goto(base+'/market/'+anchor.id);
      await art(page,anchor);
      for(const sibling of playerEditionsFor(anchor).filter(c=>c.id!==anchor.id)) {
        await page.getByTestId(`edition-link-${sibling.id}`).click();
        await page.waitForURL(base+'/market/'+sibling.id);
        await page.waitForFunction(id=>!document.querySelector(`[data-testid="edition-link-${id}"]`),sibling.id);
        if(sibling.edition==='recent') await art(page,sibling);
        await page.getByTestId(`edition-link-${anchor.id}`).waitFor();
        await noOverflow(page,sibling.id+' edition navigation');
        if(sibling.id==='raphinha--totw') {
          const quote=page.getByText(savedPrices[sibling.id][0].toLocaleString('en-US'),{exact:true});
          await quote.waitFor();
          assert(await quote.evaluate(e=>e.scrollWidth<=e.clientWidth+1),'TOTW price text clipped on phone');
        }
        if(itemId===100896715) await page.screenshot({path:path.join(output,`raphinha-${sibling.id}-${language}-${width}.png`)});
        await page.getByTestId(`edition-link-${anchor.id}`).click();
        await page.waitForURL(base+'/market/'+anchor.id);
        await page.waitForFunction(id=>!document.querySelector(`[data-testid="edition-link-${id}"]`),anchor.id);
        await art(page,anchor);
      }
    }
    report.push({language,width,routes:cards.length,editionNavigation:'Raphinha, Foden, Zola, Salma: all variants and originals, both directions',designs:[...seen]});
    await context.close();
    console.log('PASS',language,width,'all 51 exact routes, artwork, prices, variants and overflow');
  }
  assert.deepEqual(errors,[]);
  fs.writeFileSync(path.join(output,'report.json'),JSON.stringify({report,errors,accountRequests:'mocked; all external requests blocked'},null,2));
  console.log('PASS: recent filter/search/navigation; 306 bilingual detail checks at 360/390/1280.');
} catch(error) {
  const failedPage = browser.contexts().at(-1)?.pages().at(-1);
  if(failedPage) await failedPage.screenshot({path:path.join(output,'failure.png'),fullPage:true}).catch(()=>{});
  fs.writeFileSync(path.join(output,'failure.json'),JSON.stringify({error:String(error),url:failedPage?.url(),report,errors},null,2));
  throw error;
} finally { await browser.close(); server?.close(); }
