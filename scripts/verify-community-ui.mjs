/* global btoa, localStorage, location */
import assert from 'node:assert/strict';
import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
// Optional browser smoke check against an exported web bundle. Install Playwright
// separately; all Supabase requests are intercepted and no real accounts are used.
const { chromium: playwright } = await import(process.env.FC27_PLAYWRIGHT_MODULE || 'playwright');
const launchOptions = {
 ...(process.env.FC27_CHROMIUM_PATH ? { executablePath: process.env.FC27_CHROMIUM_PATH } : {}),
 ...(process.env.FC27_CHROMIUM_ARGS ? { args: JSON.parse(process.env.FC27_CHROMIUM_ARGS) } : {}),
 headless: true,
};
const root=path.resolve(process.env.FC27_WEB_DIR || 'dist');
const server=http.createServer((req,res)=>{let file=path.join(root,decodeURIComponent(req.url.split('?')[0]));if(!fs.existsSync(file)||fs.statSync(file).isDirectory())file=root+'/index.html';res.setHeader('Content-Type',file.endsWith('.js')?'application/javascript':file.endsWith('.html')?'text/html':file.endsWith('.png')?'image/png':'application/octet-stream');fs.createReadStream(file).pipe(res);});
await new Promise(resolve=>server.listen(8094,'127.0.0.1',resolve));
let browser=await playwright.launch(launchOptions);
const uid='10000000-0000-4000-8000-000000000001',other='10000000-0000-4000-8000-000000000002';
const sid='20000000-0000-4000-8000-000000000001',jid='30000000-0000-4000-8000-000000000001';
const errors=[]; const calls=[];
try {
 for(const language of ['en','he']) {
  if(language==='he')browser=await playwright.launch(launchOptions);
  console.log('Checking',language);
  let session={id:sid,host_user_id:other,title:'Rush objectives squad',mode:'Rush',platforms:['PS5','PC'],region:'Europe',language,play_style:'casual',notes:'Complete objectives together',starts_at:new Date(Date.now()+86400000).toISOString(),timezone:'Europe/London',capacity:2,weekly:true,status:'open',parent_id:null,partner_session_members:[{session_id:sid,user_id:other,platform:'PC',status:'joined'}]};
  let journey={id:jid,owner_user_id:other,title:'Road to Europe',club:'Schalke',rules:'Academy first; follow the shared budget.',milestones:['Finish transfer window','Win promotion'],language,status:'active',created_at:new Date().toISOString(),career_journey_members:[{journey_id:jid,user_id:other,club:'Schalke',difficulty:'World Class',season:'1',active:true}]};
  let updates=[];let createdSession=null;let createdJourney=null;
  const context=await browser.newContext({viewport:{width:390,height:844}});
  await context.addInitScript(({language,uid})=>{
   if(location.origin==='null')return;
   const token=btoa(JSON.stringify({alg:'HS256',typ:'JWT'}))+'.'+btoa(JSON.stringify({sub:uid,exp:Math.floor(Date.now()/1000)+3600,role:'authenticated'}))+'.test';
   localStorage.setItem('fc27-language',language);localStorage.setItem('futz-cookie-notice','essential-2026-09-27');localStorage.setItem('futz-terms-accepted-'+uid,'2026-09-28-v1');
   if(localStorage.getItem('fc27-browser-signed-out')!=='1')localStorage.setItem('sb-hxjgphhcspzjnkkzdmpk-auth-token',JSON.stringify({access_token:token,refresh_token:'mock-only',expires_at:Math.floor(Date.now()/1000)+3600,token_type:'bearer',user:{id:uid,email:'mock@example.invalid',aud:'authenticated',role:'authenticated',user_metadata:{display_name:'Preview player'},app_metadata:{provider:'email'},created_at:new Date().toISOString()}}));
  },{language,uid});
  await context.route('https://hxjgphhcspzjnkkzdmpk.supabase.co/**',async route=>{
   const request=route.request(),url=new URL(request.url());let body=[];
   if(url.pathname.endsWith('/rpc/community_activity')){
    const {action,payload}=request.postDataJSON();calls.push({language,action,payload});
    if(action==='join_session')session.partner_session_members.push({session_id:sid,user_id:uid,platform:payload.platform,status:'joined'});
    if(action==='leave_session')session.partner_session_members=session.partner_session_members.filter(m=>m.user_id!==uid);
    if(action==='join_journey')journey.career_journey_members.push({journey_id:jid,user_id:uid,club:payload.club,difficulty:payload.difficulty,season:payload.season,active:true});
    if(action==='update_journey')updates.unshift({id:'update-'+updates.length,journey_id:jid,user_id:uid,milestone:payload.milestone,note:payload.note,created_at:new Date().toISOString()});
    if(action==='create_session'){createdSession={...payload,id:'new-session',host_user_id:uid,status:'open',parent_id:null,partner_session_members:[{user_id:uid,platform:payload.platform,status:'joined'}]};body='new-session';}
    else if(action==='create_journey'){createdJourney={...payload,id:'new-journey',owner_user_id:uid,status:'active',created_at:new Date().toISOString(),career_journey_members:[{user_id:uid,club:payload.club,difficulty:payload.difficulty,season:payload.season,active:true}]};body='new-journey';}
    else body=payload.id;
   } else if(url.pathname.endsWith('/profiles')) body=[{id:uid,display_name:'Preview player',approved_count:0,reputation:0,is_admin:false,created_at:new Date().toISOString()},{id:other,display_name:'Preview host',approved_count:0,reputation:0,is_admin:false,created_at:new Date().toISOString()}];
   else if(url.pathname.endsWith('/partner_sessions')) body=url.searchParams.has('id')?(url.searchParams.get('id').includes('new-session')?createdSession:session):[session];
   else if(url.pathname.endsWith('/career_journeys')) body=url.searchParams.has('id')?(url.searchParams.get('id').includes('new-journey')?createdJourney:journey):[journey];
   else if(url.pathname.endsWith('/career_journey_updates'))body=url.searchParams.has('milestone')?updates.filter(u=>u.milestone>=0):updates;
   await route.fulfill({status:200,contentType:'application/json',body:JSON.stringify(body)});
  });
  const page=await context.newPage();page.on('pageerror',e=>errors.push(e.message));
  const t=(en,he)=>language==='en'?en:he;
  const button=(name)=>page.getByRole('button',{name,exact:true});
  await page.goto('http://127.0.0.1:8094/grounds/sessions');
  await button(t('Details & join','פרטים והצטרפות')).waitFor();
  await button(t('Details & join','פרטים והצטרפות')).click();
  await button(t('Join session','הצטרפות למפגש')).click();
  await page.getByText(t('I cannot make it','לא אוכל להגיע'),{exact:true}).waitFor();
  assert(session.partner_session_members.some(m=>m.user_id===uid));
  await page.screenshot({path:path.join(process.env.FC27_UI_ARTIFACTS || '/tmp',`community-session-${language}.png`)});
  await button(t('I cannot make it','לא אוכל להגיע')).click();
  await button(t('Join session','הצטרפות למפגש')).waitFor();
  await page.goto('http://127.0.0.1:8094/grounds/sessions/new');
  await page.getByRole('textbox',{name:t('Session title','שם המפגש'),exact:true}).fill('Friday objectives');
  await button(t('Publish session','פרסום המפגש')).click();
  await page.getByText('Friday objectives',{exact:true}).waitFor();
  assert.equal(createdSession.weekly,true);assert.equal(createdSession.capacity,4);assert(createdSession.starts_at.endsWith('Z'));
  await page.goto('http://127.0.0.1:8094/career/journeys/'+jid);
  await button(t('Join journey','הצטרפות למסע')).click();
  const notes=page.getByRole('textbox',{name:t('What happened in your save?','מה קרה בשמירה?'),exact:true});
  await notes.fill('A new academy player joined the squad.');
  await button(t('Save update','שמירת העדכון')).click();
  await page.getByText('A new academy player joined the squad.',{exact:true}).waitFor();
  assert.equal(updates[0].milestone,-1,'A general note must not complete a milestone');
  await button('1. Finish transfer window').click();await notes.fill('Window complete within our shared budget.');await button(t('Save update','שמירת העדכון')).click();
  await page.getByText('Window complete within our shared budget.',{exact:true}).waitFor();assert.equal(updates[0].milestone,0);
  await page.screenshot({path:path.join(process.env.FC27_UI_ARTIFACTS || '/tmp',`community-journey-${language}.png`)});
  // Content panels must fit a 390px viewport; the existing navigation bar scrolls independently.
  const overflow=await page.locator('input,textarea,[role="button"]').evaluateAll(nodes=>nodes.filter(n=>!n.closest('header')&&n.getBoundingClientRect().width>390).map(n=>n.textContent));
  assert.equal(overflow.length,0,'Form controls overflow phone width');
  await page.goto('http://127.0.0.1:8094/career/journeys/new');
  await page.getByRole('textbox',{name:t('Journey title','שם המסע'),exact:true}).fill('Youth academy story');
  await page.getByRole('textbox',{name:t('Suggested club & my club','המועדון והקבוצה שלי'),exact:true}).fill('Schalke');
  await page.getByRole('textbox',{name:t('Shared rules','חוקים משותפים'),exact:true}).fill('Academy first and no free agent signings.');
  await page.getByRole('textbox',{name:t('Milestones — one per line, up to 6','אבני דרך — אחת בכל שורה, עד 6'),exact:true}).fill('First window\nFirst youth debut');
  await button(t('Publish journey','פתיחת המסע')).click();await page.getByText('Youth academy story',{exact:true}).waitFor();
  assert.deepEqual(createdJourney.milestones,['First window','First youth debut']);
  // Invitation links survive the register/login boundary, including a page reload.
  const savedAuth = await page.evaluate(() => localStorage.getItem('sb-hxjgphhcspzjnkkzdmpk-auth-token'));
  await page.evaluate(() => {localStorage.setItem('fc27-browser-signed-out','1');localStorage.removeItem('sb-hxjgphhcspzjnkkzdmpk-auth-token');});
  await page.goto('http://127.0.0.1:8094/career/journeys/'+jid);
  await page.waitForURL('**/register');
  assert.equal(await page.evaluate(() => JSON.parse(localStorage.getItem('fc27-community-return-v1')).path), '/career/journeys/'+jid);
  await page.evaluate((auth) => {localStorage.removeItem('fc27-browser-signed-out');localStorage.setItem('sb-hxjgphhcspzjnkkzdmpk-auth-token',auth);},savedAuth);
  await page.goto('http://127.0.0.1:8094/login');
  await page.waitForURL('**/career/journeys/'+jid);
  await page.getByText('Road to Europe',{exact:true}).waitFor();
  await page.waitForFunction(() => localStorage.getItem('fc27-community-return-v1')===null);
  // Google OAuth returns to the website root, rather than the login route.
  await page.evaluate((route) => localStorage.setItem('fc27-community-return-v1',JSON.stringify({path:route,at:Date.now()})), '/career/journeys/'+jid);
  await page.goto('http://127.0.0.1:8094/');
  await page.waitForURL('**/career/journeys/'+jid);
  await page.getByText('Road to Europe',{exact:true}).waitFor();
  await page.setViewportSize({width:1280,height:900});
  assert.equal(await page.locator('body').evaluate(n=>n.scrollWidth>1280),false);
  await context.close();
 }
 assert.deepEqual(errors,[]);
 fs.writeFileSync(path.join(process.env.FC27_UI_ARTIFACTS || '/tmp','community-ui-results.json'),JSON.stringify({success:true,viewports:[390,1280],languages:['he','en'],calls:calls.map(c=>({language:c.language,action:c.action})),errors},null,2));
 console.log('Browser checks passed in Hebrew & English at 390px: create/join/leave sessions; create/join career journeys; general notes and milestone updates. No page errors or oversized controls. Invitation return through login and OAuth landing and 1280px layout also passed. All API traffic mocked; real permission checks run separately in rollback SQL.');
} finally {await browser.close();server.close();}
