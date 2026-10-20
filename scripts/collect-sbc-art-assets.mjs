import fs from 'node:fs';
import crypto from 'node:crypto';
const artwork=JSON.parse(fs.readFileSync('assets/data/sbc-reward-art-20261020.json','utf8'));
const sources=new Set();
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
 console.log('BUNDLED_ART='+JSON.stringify({index,url,path:'assets/images/sbc-rewards/art-'+String(index).padStart(3,'0')+(png?'.png':'.webp'),bytes:bytes.length,sha256:crypto.createHash('sha256').update(bytes).digest('hex'),data:bytes.toString('base64')}));
}));
console.log('ASSET_TOTAL='+urls.length);
