import fs from 'node:fs';
import crypto from 'node:crypto';
const artwork=JSON.parse(fs.readFileSync('assets/data/sbc-reward-art-20261020.json','utf8'));
const sources=new Set(); const manifest=[]; const entries=[];
const repository='Avieil26/one-club'; const branch='preview/community-sbc-20261020';
const sourceSha=process.env.FC27_SOURCE_SHA;
if(!sourceSha || process.env.GITHUB_REPOSITORY!==repository) throw Error('Wrong source context');
async function api(path,method='GET',body){
 const res=await fetch('https://api.github.com/repos/'+repository+path,{method,headers:{Authorization:'Bearer '+process.env.GITHUB_TOKEN,Accept:'application/vnd.github+json','Content-Type':'application/json'},...(body?{body:JSON.stringify(body)}:{})});
 if(!res.ok) throw Error('GitHub '+res.status+' '+path);
 return res.json();
}
const ref=await api('/git/ref/heads/'+branch); if(ref.object.sha!==sourceSha)throw Error('Source branch moved');
const gitCommit=await api('/git/commits/'+sourceSha);

for(const art of Object.values(artwork)) for(const key of ['background','portrait','nation','league','club','image']) if(art[key]) sources.add(art[key]);
const normalize=url=>url.replace(/\/cdn-cgi\/image\/[^/]+\//,'/');
for(const [id,art] of Object.entries(artwork)) if(art.kind==='player'){
 const html=await (await fetch(art.sourceUrl,{signal:AbortSignal.timeout(25000)})).text();
 const item=art.sourceUrl.split('/').filter(Boolean).at(-1);
 const images=[...html.matchAll(/<img\b[^>]*>/g)].map(m=>m[0]).map(t=>({src:t.match(/src="([^"]+)"/)?.[1],alt:t.match(/alt="([^"]*)"/)?.[1]}));
 const full=images.find(i=>i.src?.includes('/2027/futgg-player-item-card/'+item+'.'));
 if(full){art.complete=full.src;sources.add(full.src);}
 console.log('COMPLETE_ART='+JSON.stringify({id,complete:art.complete??null}));
}
const urls=[...sources];
for(let offset=0;offset<urls.length;offset+=4)await Promise.all(urls.slice(offset,offset+4).map(async(url,j)=>{
 const index=offset+j;const raw=normalize(url);
 let response=await fetch(raw,{headers:{Accept:'image/png,image/webp,image/*'},signal:AbortSignal.timeout(25000)});
 if(!response.ok) response=await fetch(url,{signal:AbortSignal.timeout(25000)});
 if(!response.ok)throw Error(response.status+' '+url);
 const bytes=Buffer.from(await response.arrayBuffer());
 const png=bytes.subarray(0,8).toString('hex')==='89504e470d0a1a0a';
 const webp=bytes.subarray(0,4).toString()==='RIFF'&&bytes.subarray(8,12).toString()==='WEBP';
 if(!png&&!webp)throw Error('Unexpected image format '+response.headers.get('content-type')+' '+url);
 if(bytes.length<100)throw Error('Empty artwork '+url);
 const filepath='assets/images/sbc-rewards/art-'+String(index).padStart(3,'0')+(png?'.png':'.webp');
 const blob=await api('/git/blobs','POST',{content:bytes.toString('base64'),encoding:'base64'});
 manifest.push({index,url,path:filepath,bytes:bytes.length,sha256:crypto.createHash('sha256').update(bytes).digest('hex'),blobSha:blob.sha});
 entries.push({path:filepath,mode:'100644',type:'blob',sha:blob.sha});
 console.log('SAVED_ASSET='+filepath+' '+bytes.length);

}));
console.log('ASSET_TOTAL='+urls.length);

entries.push({path:'assets/data/sbc-local-art-manifest.json',mode:'100644',type:'blob',content:JSON.stringify({sourceCommit:sourceSha,assets:manifest.sort((a,b)=>a.index-b.index),complete:Object.fromEntries(Object.entries(artwork).filter(([,a])=>a.complete).map(([id,a])=>[id,a.complete]))},null,2)+'\n'});
const tree=await api('/git/trees','POST',{base_tree:gitCommit.tree.sha,tree:entries});
const commit=await api('/git/commits','POST',{message:'Bundle exact SBC reward artwork as local app assets',tree:tree.sha,parents:[sourceSha]});
const latest=await api('/git/ref/heads/'+branch);if(latest.object.sha!==sourceSha)throw Error('Source branch moved during artwork import');
await api('/git/refs/heads/'+branch,'PATCH',{sha:commit.sha,force:false});
console.log('BUNDLED_ASSET_COMMIT='+commit.sha);
