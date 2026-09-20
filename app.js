const $=id=>document.getElementById(id);
const categories=['All finds','Groceries','Food & drinks','Shopping','Home & living','Online shopping','Events','Attractions','Services'];
const areas=['Central','East','West','North','North-East','South / Sentosa','Islandwide','Online'];
let deals=[],selectedCategories=new Set(),selectedAreas=new Set(),limit=12,results=[];
const escapeHTML=v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const safeURL=v=>{try{const u=new URL(v);return u.protocol==='https:'?u.href:''}catch{return ''}};
const fmt=(v,options={day:'numeric',month:'short'})=>new Intl.DateTimeFormat('en-SG',{timeZone:'Asia/Singapore',...options}).format(new Date(v));
const shortTitle=d=>d.title.replace(/^Upcoming:\s*|^Upcoming FREE event:\s*/i,'');
function isActive(d,now=Date.now()){return !d.endsAt||new Date(d.endsAt).getTime()>=now}
function status(d){if(d.startsAt&&Date.parse(d.startsAt+'T00:00:00+08:00')>Date.now())return {text:'From '+fmt(d.startsAt+'T00:00:00+08:00'),soon:false};if(!d.endsAt)return {text:'End date not stated',soon:false};const days=(Date.parse(d.endsAt)-Date.now())/86400000;return {text:days<1?'Ends today':'Until '+fmt(d.endsAt),soon:days<3}}
function drawCategories(){ $('categories').innerHTML=categories.map(c=>{const active=c==='All finds'?selectedCategories.size===0:selectedCategories.has(c);return `<button class="category" aria-pressed="${active}" data-category="${escapeHTML(c)}">${escapeHTML(c)}</button>`}).join('') }
function drawAreas(){ $('areas').innerHTML=`<button class="area" aria-pressed="${selectedAreas.size===0}" data-area="">All Singapore</button>`+areas.map(a=>`<button class="area" aria-pressed="${selectedAreas.has(a)}" data-area="${escapeHTML(a)}">${escapeHTML(a)}</button>`).join('') }
function filterDeals(){const q=$('search').value.toLocaleLowerCase().trim();return deals.filter(d=>isActive(d)&&(selectedCategories.size===0||selectedCategories.has(d.category))&&(selectedAreas.size===0||selectedAreas.has(d.area))&&(!q||[d.title,d.caption,d.location,d.category,d.area].join(' ').toLocaleLowerCase().includes(q))).sort((a,b)=>$('sort').value==='ending'?(Date.parse(a.endsAt)||Infinity)-(Date.parse(b.endsAt)||Infinity):$('sort').value==='az'?a.title.localeCompare(b.title):(Date.parse(b.checked)||0)-(Date.parse(a.checked)||0))}
function fallback(d){return `<div class="image-fallback"><strong>SG Everyday Deals</strong><span>${escapeHTML(d.category)}</span></div>`}
function render(){results=filterDeals();const names=[...selectedCategories];$('results-title').textContent=names.length===0?'The latest finds':names.length===1?names[0]:`${names.length} categories`;$('result-count').textContent=`${results.length} ${results.length===1?'find':'finds'}${selectedAreas.size?` · ${selectedAreas.size} ${selectedAreas.size===1?'location':'locations'}`:' across Singapore'}`;const active=$('search').value||selectedAreas.size||selectedCategories.size;$('active-filters').innerHTML=active?'<button class="clear-inline" id="clear-inline">Clear all filters ×</button>':'';$('clear-inline')?.addEventListener('click',reset);$('empty').hidden=results.length>0;$('more').hidden=results.length<=limit;$('grid').innerHTML=results.slice(0,limit).map(d=>{const s=status(d);return `<article class="card"><div class="card-image">${safeURL(d.image)?`<img src="${escapeHTML(safeURL(d.image))}" alt="Official artwork for ${escapeHTML(shortTitle(d))}" loading="lazy" referrerpolicy="no-referrer">`:fallback(d)}<span class="category-tag">${escapeHTML(d.category)}</span></div><div class="card-body"><div class="card-topline"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M19 10c0 5-7 11-7 11S5 15 5 10a7 7 0 1 1 14 0Z"/><circle cx="12" cy="10" r="2.5"/></svg>${escapeHTML(d.area)}</div><h3><button data-deal="${escapeHTML(d.id)}">${escapeHTML(shortTitle(d))}</button></h3><p class="summary">${escapeHTML(d.summary)}</p><div class="card-bottom"><span class="expiry${s.soon?' soon':''}">${escapeHTML(s.text)}</span><button class="view" data-deal="${escapeHTML(d.id)}" aria-label="View details: ${escapeHTML(shortTitle(d))}">View deal <span aria-hidden="true">↗</span></button></div></div></article>`}).join('');$('grid').querySelectorAll('img').forEach(img=>img.addEventListener('error',()=>{const d=deals.find(d=>safeURL(d.image)===img.src);img.outerHTML=fallback(d||{category:'Deal details below'});},{once:true}))}
function reset(){selectedCategories.clear();selectedAreas.clear();$('search').value='';limit=12;drawCategories();drawAreas();render()}
function openDeal(id){const d=deals.find(x=>x.id===id);if(!d||!isActive(d))return;$('detail-content').innerHTML=`${safeURL(d.image)?`<img class="detail-image" src="${escapeHTML(safeURL(d.image))}" alt="Official offer artwork" referrerpolicy="no-referrer">`:''}<div class="detail-body"><p class="eyebrow">${escapeHTML(d.category)} · ${escapeHTML(d.area)}</p><h2 id="detail-title">${escapeHTML(shortTitle(d))}</h2><div class="detail-caption">${escapeHTML(d.caption)}</div><div class="detail-links">${safeURL(d.source)?`<a href="${escapeHTML(safeURL(d.source))}" target="_blank" rel="noopener noreferrer">Official details ↗</a>`:''}${safeURL(d.telegram)?`<a class="secondary" href="${escapeHTML(safeURL(d.telegram))}" target="_blank" rel="noopener noreferrer">View Telegram post ↗</a>`:''}</div></div>`;$('detail-content').querySelector('img')?.addEventListener('error',e=>e.target.remove(),{once:true});$('detail').showModal()}
$('categories').addEventListener('click',e=>{const b=e.target.closest('[data-category]');if(!b)return;const c=b.dataset.category;if(c==='All finds')selectedCategories.clear();else if(selectedCategories.has(c))selectedCategories.delete(c);else selectedCategories.add(c);limit=12;drawCategories();render()});$('areas').addEventListener('click',e=>{const b=e.target.closest('[data-area]');if(!b)return;const a=b.dataset.area;if(!a)selectedAreas.clear();else if(selectedAreas.has(a))selectedAreas.delete(a);else selectedAreas.add(a);limit=12;drawAreas();render()});$('grid').addEventListener('click',e=>{const b=e.target.closest('[data-deal]');if(b)openDeal(b.dataset.deal)});['search','sort'].forEach(id=>$(id).addEventListener(id==='search'?'input':'change',()=>{limit=12;render()}));$('reset').addEventListener('click',reset);$('more').addEventListener('click',()=>{limit+=12;render()});$('close').addEventListener('click',()=>$('detail').close());$('detail').addEventListener('click',e=>{if(e.target===$('detail')){const r=$('detail').getBoundingClientRect();if(e.clientX<r.left||e.clientX>r.right||e.clientY<r.top||e.clientY>r.bottom)$('detail').close()}});document.addEventListener('keydown',e=>{if(e.key==='/'&&!/INPUT|TEXTAREA|SELECT/.test(document.activeElement.tagName)&&!$('detail').open){e.preventDefault();$('search').focus()}});const backToTop=$('back-to-top');window.addEventListener('scroll',()=>backToTop.classList.toggle('visible',window.scrollY>500),{passive:true});backToTop.addEventListener('click',()=>window.scrollTo({top:0,behavior:'smooth'}));
$('today').textContent=fmt(new Date(),{day:'numeric',month:'short',year:'numeric'});drawCategories();drawAreas();
const feedURLs=[
 'https://pynwgripqadlcxtrfhmd.supabase.co/functions/v1/website-deals',
 'https://sg-everyday-deals-bot.external-bot.workers.dev/deals.json'
];
let loading=false,lastUpdated=null;
async function fetchLiveFeed(){
 let lastError;
 for(const url of feedURLs){
  try{
   const response=await fetch(url,{cache:'no-store',signal:AbortSignal.timeout(15000)});
   if(!response.ok)throw new Error('Load failed: '+response.status);
   const data=await response.json();
   if(!Array.isArray(data.deals))throw new Error('Invalid feed');
   return data;
  }catch(error){lastError=error}
 }
 throw lastError||new Error('No live feed available');
}
async function loadDeals(){
 if(loading)return;loading=true;
 try{
  const data=await fetchLiveFeed();
  deals=data.deals;lastUpdated=data.updatedAt;
  $('updated').textContent=(lastUpdated?'Last live sync: '+fmt(lastUpdated,{day:'numeric',month:'short',year:'numeric',hour:'numeric',minute:'2-digit'})+' SGT · ':'')+'Checks for new deals every minute.';
  render();
 }catch{
  if(!deals.length){try{const r=await fetch('./deals.json',{cache:'no-cache'});const data=await r.json();deals=data.deals||[];lastUpdated=data.updatedAt;}catch{}}
  $('updated').textContent='Live sync temporarily unavailable. Showing saved deals'+(lastUpdated?' from '+fmt(lastUpdated,{day:'numeric',month:'short',hour:'numeric',minute:'2-digit'})+' SGT':'')+'. Retrying automatically.';
  render();
 }finally{loading=false;}
}
loadDeals();setInterval(()=>{if(!document.hidden)loadDeals();else if(deals.length)render()},60000);
document.addEventListener('visibilitychange',()=>{if(!document.hidden)loadDeals()});
const context=document.modelContext;if(context?.registerTool){const lifecycle=new AbortController();window.addEventListener('pagehide',()=>lifecycle.abort(),{once:true});try{Promise.resolve(context.registerTool({name:'filter_deals',title:'Filter Singapore deals',description:'Set search, location and category filters and return matching unexpired listings.',inputSchema:{type:'object',properties:{query:{type:'string'},areas:{type:'array',items:{type:'string',enum:areas},uniqueItems:true},categories:{type:'array',items:{type:'string',enum:categories.slice(1)},uniqueItems:true}},additionalProperties:false},annotations:{readOnlyHint:false,untrustedContentHint:true},execute(input){if(!input||typeof input!=='object'||Object.keys(input).some(k=>!['query','areas','categories'].includes(k)))throw new Error('Invalid filters');if(input.query!==undefined&&typeof input.query!=='string')throw new Error('Invalid query');if(input.areas!==undefined&&(!Array.isArray(input.areas)||input.areas.some(a=>!areas.includes(a))))throw new Error('Unknown area');if(input.categories!==undefined&&(!Array.isArray(input.categories)||input.categories.some(c=>!categories.slice(1).includes(c))))throw new Error('Unknown category');if(!deals.length)throw new Error('Deals have not loaded yet');$('search').value=input.query||'';selectedAreas=new Set(input.areas||[]);selectedCategories=new Set(input.categories||[]);limit=12;drawCategories();drawAreas();render();return {count:results.length,results:results.slice(0,12).map(({id,title,area,category,source,endsAt})=>({id,title,area,category,source,endsAt}))}}},{signal:lifecycle.signal})).catch(()=>{})}catch{}}
