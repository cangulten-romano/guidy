/* Guidy rezervasyon ortak kodu.
   Kaynaklar (SOURCES) tek yerde: API bağlanınca sadece buraya yeni kaynak eklenir,
   sayfalar değişmez. Her kaynak search({tip,q,sehir,giris,cikis,kisi}) -> sonuç listesi döner. */
const GR=(function(){
  const FORM='https://formspree.io/f/mrpqpazq', KEY='guidy_rez';
  const PORTAL={'RateHawk':'https://www.ratehawk.com/','Bedsonline / Hotelbeds':'https://www.bedsonline.com/','Expedia TAAP':'https://www.expediataap.com/','Fora (Virtuoso ayrıcalıkları)':'https://www.foratravel.com/','TBO Holidays':'https://www.tboholidays.com/','Sunhotels (WebBeds)':'https://www.sunhotels.com/','Booking.com (affiliate)':'https://www.booking.com/','Gazelle B2B':'','Otel doğrudan':'','Diğer':''};
  const STATUS=['Talep alındı','Opsiyonlu','Kesinleşti','Ödendi','Tamamlandı','İptal'];
  const cache={};
  const j=async u=>cache[u]||(cache[u]=await (await fetch(u,{cache:'no-cache'})).json());
  const low=s=>String(s||'').toLocaleLowerCase('tr-TR');
  const sure=s=>{const m=/(\d+)G\/(\d+)G/.exec(s||'');return m?`${m[1]} gün, ${m[2]} gece`:(s||'')};
  const SOURCES={
    katalog:{ad:'Guidy katalog',canli:false,async search(p){
      if(p.tip==='tur'){const L=await j('data/turlar.json');return L.filter(t=>(!p.q||low(t[1]+' '+t[2]).includes(low(p.q)))).slice(0,40)
        .map(t=>({tip:'tur',kaynak:'Gazelle B2B',ref:t[0],ad:t[1],yer:t[2],alt:t[3]+' · '+sure(t[4]),satis:t[5]||''}))}
      const L=await j('data/oteller.json');return L.filter(h=>(!p.sehir||h.sehir===p.sehir)&&(!p.q||low(h.ad+' '+h.semt+' '+h.sehir).includes(low(p.q))))
        .map(h=>({tip:'otel',kaynak:'RateHawk',ref:h.id,ad:h.ad,yer:h.sehir+' · '+h.semt,alt:h.tip,satis:''}))}}
    /* ratehawk:{ad:'RateHawk',canli:true,async search(p){ return (await fetch('/api/ratehawk/search',{method:'POST',body:JSON.stringify(p)})).json() }} */
  };
  const load=()=>{try{return JSON.parse(localStorage.getItem(KEY)||'[]')}catch(e){return []}};
  const save=l=>{try{localStorage.setItem(KEY,JSON.stringify(l));return true}catch(e){return false}};
  const upsert=r=>{const l=load(),i=l.findIndex(x=>x.no===r.no);if(i>=0)l[i]=r;else l.unshift(r);return save(l)};
  const tl=n=>Math.round(+n||0).toLocaleString('tr-TR')+' TL';
  const totals=r=>{const it=r.items||[];const sat=it.reduce((s,i)=>s+(+i.sat||0),0),net=it.reduce((s,i)=>s+(+i.net||0),0);return {sat,net,kar:sat-net}};
  async function log(r,olay){const t=totals(r),fd=new FormData();
    fd.append('_subject',`Rezervasyon ${r.no} · ${olay} · ${r.musteri} (${r.tasarimci})`);fd.append('tip','Rezervasyon: '+olay);
    [['rezervasyon_no',r.no],['durum',r.durum],['tasarimci',r.tasarimci],['musteri',r.musteri],['tel',r.tel],['email',r.email],['tarihler',(r.giris||'')+' → '+(r.cikis||'')],['kisi',r.kisi],['teklif_no',r.teklif||''],['misafirler',r.misafirler||''],['istekler',r.istek||''],['satis_TL',Math.round(t.sat)],['net_TL',Math.round(t.net)],['kar_TL',Math.round(t.kar)],
     ['kalemler',(r.items||[]).map(i=>`${i.tip} | ${i.ad} | ${i.det||''} | ${i.giris||''}→${i.cikis||''} | ${i.kaynak} #${i.konf||'-'} | opsiyon ${i.ops||'-'} | net ${i.net||0} | satış ${i.sat||0}`).join('\n')]].forEach(([k,v])=>fd.append(k,v));
    try{const x=await fetch(FORM,{method:'POST',body:fd,headers:{Accept:'application/json'}});return x.ok}catch(e){return false}}
  async function unpackTeklif(url){const h=(url.split('#')[1]||'');const z=h[0];let b=h.slice(1).replace(/-/g,'+').replace(/_/g,'/');while(b.length%4)b+='=';
    const raw=Uint8Array.from(atob(b),c=>c.charCodeAt(0));let out=raw;if(z==='z'){out=new Uint8Array(await new Response(new Blob([raw]).stream().pipeThrough(new DecompressionStream('deflate-raw'))).arrayBuffer())}
    return JSON.parse(new TextDecoder().decode(out))}
  const newNo=()=>'R'+new Date().toISOString().slice(2,10).replace(/-/g,'')+'-'+Math.random().toString(36).slice(2,6).toUpperCase();
  const esc=s=>String(s==null?'':s).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
  return {SOURCES,PORTAL,STATUS,load,save,upsert,totals,tl,log,unpackTeklif,newNo,esc};
})();
/* Kimlik: Cloudflare Access açıldığında giriş yapan e-postayı okur ve tasarımcıyı otomatik atar.
   Yönetici (gulten@) herkesi görür; diğer tasarımcılar sadece kendini. */
GR.TEAM={'gulten@guidy.tr':'Gülten Can Romano','melisa@guidy.tr':'Melisa Tamses','ali@guidy.tr':'Ali Mataracı','cansu@guidy.tr':'Cansu Keskin'};
GR.ADMIN=['gulten@guidy.tr'];
GR.who=async function(){try{const r=await fetch('/cdn-cgi/access/get-identity',{credentials:'include'});if(!r.ok)return null;const j=await r.json();const e=String(j.email||'').toLowerCase();if(!e)return null;return {email:e,name:GR.TEAM[e]||'',admin:GR.ADMIN.includes(e)}}catch(e){return null}};
GR.lock=async function(selId){const w=await GR.who();if(!w)return null;const s=document.getElementById(selId);if(s&&w.name){s.value=w.name;if(!w.admin){s.disabled=true;[...s.options].forEach(o=>{if(o.value!==w.name)o.remove()})}try{localStorage.setItem('guidy_me',w.name)}catch(e){}s.dispatchEvent(new Event('change'))}return w};
