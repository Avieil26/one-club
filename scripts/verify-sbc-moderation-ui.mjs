/* global localStorage, location, btoa */
import assert from 'node:assert/strict';
import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
const {chromium}=await import(process.env.FC27_PLAYWRIGHT_MODULE||'playwright');
const root=path.resolve('dist');
const server=http.createServer((req,res)=>{let file=path.join(root,decodeURIComponent(req.url.split('?')[0]));if(!fs.existsSync(file)||fs.statSync(file).isDirectory())file=root+'/index.html';res.setHeader('Content-Type',({'.js':'application/javascript','.html':'text/html','.png':'image/png','.webp':'image/webp','.ico':'image/x-icon'})[path.extname(file)]||'application/octet-stream');fs.createReadStream(file).pipe(res);});
await new Promise(r=>server.listen(8097,'127.0.0.1',r));
const browser=await chromium.launch({headless:true,...(process.env.FC27_CHROMIUM_PATH?{executablePath:process.env.FC27_CHROMIUM_PATH}:{}),...(process.env.FC27_CHROMIUM_ARGS?{args:JSON.parse(process.env.FC27_CHROMIUM_ARGS)}:{})});
const owner='50000000-0000-4000-8000-000000000001',admin='50000000-0000-4000-8000-000000000002',other='50000000-0000-4000-8000-000000000003',sid='60000000-0000-4000-8000-000000000001',cid='70000000-0000-4000-8000-000000000001';
const errors=[];let page;
try{
 for(const language of ['he','en'])for(const width of [390,1280])for(const role of ['owner','other','admin']){
  const uid=role==='admin'?admin:role==='owner'?owner:other;
  const solution={id:sid,challenge_id:cid,user_id:owner,explanation:'Review fixture proof',image_uris:['http://127.0.0.1:8097/favicon.ico'],status:'pending',created_at:new Date().toISOString(),reviewed_by:null,reviewed_at:null};
  const calls=[];
  const context=await browser.newContext({viewport:{width,height:900}});
  await context.addInitScript(({language,uid})=>{
   if(location.origin==='null')return;
   const token=btoa(JSON.stringify({alg:'HS256',typ:'JWT'}))+'.'+btoa(JSON.stringify({sub:uid,exp:Math.floor(Date.now()/1000)+3600,role:'authenticated'}))+'.test';
   localStorage.setItem('fc27-language',language);localStorage.setItem('futz-cookie-notice','essential-2026-09-27');localStorage.setItem('futz-terms-accepted-'+uid,'2026-09-28-v1');
   localStorage.setItem('sb-hxjgphhcspzjnkkzdmpk-auth-token',JSON.stringify({access_token:token,refresh_token:'mock',expires_at:Math.floor(Date.now()/1000)+3600,token_type:'bearer',user:{id:uid,email:'mock@example.invalid',aud:'authenticated',role:'authenticated',user_metadata:{display_name:'Review QA'},app_metadata:{provider:'email'},created_at:new Date().toISOString()}}));
  },{language,uid});
  await context.route('https://hxjgphhcspzjnkkzdmpk.supabase.co/**',async route=>{
   const request=route.request(),url=new URL(request.url());let body=[];
   if(url.pathname.endsWith('/profiles'))body=[{id:owner,display_name:'Review author',is_admin:false,approved_count:0,reputation:0,created_at:new Date().toISOString()},{id:admin,display_name:'Review administrator',is_admin:true,approved_count:0,reputation:0,created_at:new Date().toISOString()},{id:other,display_name:'Review outsider',is_admin:false,approved_count:0,reputation:0,created_at:new Date().toISOString()}];
   else if(url.pathname.endsWith('/sbc_challenges'))body=[{id:cid,catalog_key:'sbc-league-nation-advanced',title:'League and Nation Advanced',kind:'classic',requirements:'Fixture',created_by:admin,ends_at:null,target_score:null,created_at:new Date().toISOString()}];
   else if(url.pathname.endsWith('/sbc_solutions'))body=[solution];
   else if(url.pathname.endsWith('/rpc/moderate_sbc_solution')){
    assert.equal(role,'admin');const input=request.postDataJSON();assert.equal(input.p_id,sid);calls.push(input.p_status);
    solution.status=input.p_status;solution.reviewed_by=admin;solution.reviewed_at=new Date().toISOString();body=null;
   }
   await route.fulfill({status:200,contentType:'application/json',body:JSON.stringify(body)});
  });
  page=await context.newPage();page.on('pageerror',e=>errors.push(e.message));
  const t=(he,en)=>language==='he'?he:en;
  if(role==='admin'){
   await page.goto('http://127.0.0.1:8097/admin/queue');
   await page.getByText(t('פתרון SBC · ממתין לאישור','SBC solution · Awaiting review'),{exact:true}).waitFor();
   await page.getByRole('button',{name:t('צפייה בפתרון המלא','Review full solution'),exact:true}).click();
   await page.getByText(t('ממתין לאישור מנהל','Awaiting administrator review'),{exact:true}).waitFor();
   await page.getByRole('button',{name:t('אישור ופרסום הפתרון','Approve and publish solution'),exact:true}).click();
   await page.getByText(t('אושר על ידי מנהל','Approved by an administrator'),{exact:true}).waitFor();
   await page.getByRole('button',{name:t('ביטול האישור','Revoke approval'),exact:true}).click();
   await page.getByText(t('הפתרון לא אושר','Solution not approved'),{exact:true}).waitFor();
   assert.deepEqual(calls,['approved','rejected']);
  }else{
   await page.goto('http://127.0.0.1:8097/sbc/solution/'+sid);
   await page.getByText(role==='owner'?t('ממתין לאישור מנהל','Awaiting administrator review'):t('הפתרון לא נמצא','Solution not found'),{exact:true}).waitFor();
   assert.equal(await page.getByTestId('sbc-moderation-actions').count(),0);
   assert.equal(await page.getByText(t('האם הפתרון עבד?','Did this solution work?'),{exact:true}).count(),0);
  }
  assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+2),'Review layout overflow');
  if(role!=='other')console.log('SBC_REVIEW_SCREENSHOT='+JSON.stringify({name:'sbc-review-'+role+'-'+language+'-'+width,mimeType:'image/jpeg',data:(await page.screenshot({type:'jpeg',quality:70,fullPage:true})).toString('base64')}));
  await context.close();
 }
 assert.deepEqual(errors,[]);console.log('SBC review UI passed: owner sees pending status, other members cannot view pending solution, admin queue and review/approve/revoke flow, no pending votes, HE/EN and phone/desktop. API requests mocked.');
}finally{await browser.close();server.close();}
