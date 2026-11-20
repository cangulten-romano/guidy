/* Guidy otel kataloğu: ana sayfa ve destinasyon sayfaları ortak kodu.
   SHOW_PERKS: Fora/Virtuoso üyeliği aktif olunca true yapılır; o zamana kadar ayrıcalıklar genel ifadeyle gösterilir. */
const GK=(function(){
  const SHOW_PERKS=false;
  const IMG=(id,w=900)=>`https://images.unsplash.com/${id}?auto=format&fit=crop&w=${w}&q=70`;
  const esc=s=>String(s==null?'':s).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
  const low=s=>String(s||'').toLocaleLowerCase('tr-TR');
  let H=null,B=null;
  const V='4';const load=async()=>{if(!H){[H,B]=await Promise.all([fetch('data/oteller.json?v='+V).then(r=>r.json()),fetch('data/bolgeler.json?v='+V).then(r=>r.json())])}return {H,B}};
  const tags=h=>{const t=low(h.tip+' '+h.semt+' '+h.ad),o=[];
    if(/mağara|cave/.test(t))o.push('Mağara');if(/resort|beach|koy|bay/.test(t))o.push('Deniz');if(/butik|boutique|house|suites|ev/.test(t))o.push('Butik');
    if(/spa|termal|wellness|six senses/.test(t))o.push('Spa');if(/saray|palace|palas/.test(t))o.push('Tarihi');if(/her şey dahil/.test(t))o.push('Her şey dahil');
    if(h.sehir==='İstanbul'&&!o.length)o.push('Şehir');if(/aile/.test(t))o.push('Aile');return o.slice(0,3)};
  const regionOf=h=>B.find(b=>b.sehir.includes(h.sehir));
  const pic=(h,r,i)=>{const g=(r.galeri&&r.galeri.length)?r.galeri:[r.img];if(typeof i==='number')return g[i%g.length];let n=0;for(const c of h.id)n=(n*31+c.charCodeAt(0))>>>0;return g[n%g.length]};
  function card(h,i){const pk=h.fora||h.virtuoso||(h.vlist?'1':''),r=regionOf(h);
    return `<article class="hcard">${r?`<a class="hcard-img" href="destinasyon.html?b=${r.id}" style="background-image:url('${IMG(pic(h,r,i),700)}')" aria-label="${esc(r.ad)}"></a>`:''}
    <div class="hcard-body"><p class="hcard-loc">${esc(h.sehir)}${h.semt?' · '+esc(h.semt):''}</p><h3>${esc(h.ad)}</h3>
    <div class="chips">${tags(h).map(t=>`<span class="chip sm">${t}</span>`).join('')}${pk?'<span class="chip sm perk">Ayrıcalıklı</span>':''}</div>
    ${pk?`<p class="hcard-perk">${SHOW_PERKS?esc(pk):'Seyahat tasarımcınızla rezervasyonda otele özel ayrıcalıklar: oda yükseltme, kahvaltı ya da otel kredisi gibi.'}</p>`:''}
    <a class="hcard-go" href="seyahat-talebi.html?otel=${encodeURIComponent(h.ad)}${r?`&bolge=${encodeURIComponent(r.ad)}${r.tas&&r.tas.length===1?`&elci=${encodeURIComponent(r.tas[0])}`:''}`:''}">Bu otelle seyahatimi tasarla →</a></div></article>`}
  function regionTile(b){return `<a class="dtile" href="destinasyon.html?b=${b.id}" style="background-image:linear-gradient(180deg,rgba(10,22,52,0) 40%,rgba(10,22,52,.75)),url('${IMG(b.img,800)}')"><span class="dt-name">${esc(b.ad)}</span><span class="dt-sub">${esc(b.kisa)}</span></a>`}
  function search(q){const s=low(q);return {regions:B.filter(b=>low(b.ad+' '+b.sehir.join(' ')+' '+b.kisa).includes(s)),hotels:H.filter(h=>low(h.ad+' '+h.sehir+' '+h.semt+' '+h.tip).includes(s))}}
  function wireSearch(form){const inp=form.querySelector('input'),dl=document.createElement('datalist');dl.id='gk-dl';
    load().then(()=>{dl.innerHTML=B.map(b=>`<option value="${esc(b.ad)}">`).join('')+H.map(h=>`<option value="${esc(h.ad)}">`).join('');document.body.appendChild(dl);inp.setAttribute('list','gk-dl')});
    form.addEventListener('submit',e=>{e.preventDefault();const v=inp.value.trim();if(!v)return;const b=B&&B.find(x=>low(x.ad)===low(v));location.href=b?`destinasyon.html?b=${b.id}`:`destinasyon.html?q=${encodeURIComponent(v)}`})}
  function gallery(b){const g=b.galeri||[];if(!g.length)return '';return `<div class="dgal n${Math.min(g.length,5)}">${g.slice(0,5).map((id,i)=>`<a href="${IMG(id,1800)}" target="_blank" rel="noopener" style="background-image:url('${IMG(id,i?700:1300)}')" aria-label="${esc(b.ad)} fotoğraf ${i+1}"></a>`).join('')}</div><p class="dgal-cr">Fotoğraflar: Unsplash</p>`}
  const TAS={'Gülten Can Romano':['elci-gulten-can-romano.html','gulten-can-romano.jpg','Kurucu seyahat tasarımcısı · İstanbul, kültür rotaları, butik ve lüks seyahat'],
   'Ali Mataracı':['elci-ali-mataraci.html','photo-1612698093158-e07ac200d44e','Kültür ve şehir, İtalya, gastronomi'],
   'Cansu Keskin':['elci-cansu-keskin.html','photo-1641128324972-af3212f0f6bd','Kapadokya, aile tatilleri, balayı'],
   'Melisa Tamses':['elci-melisa-tamses.html','photo-1665470298557-e05d996d0022','Ege ve Akdeniz kıyıları, mavi yolculuk, butik oteller']};
  function designers(b){const L=b.tas||[];if(!L.length)return '';return `<div class="dtas"><p class="kicker">${L.length>1?'Bu bölgenin seyahat tasarımcıları':'Bu bölgenin seyahat tasarımcısı'}</p><div class="dtas-list">${L.map(n=>{const t=TAS[n]||['#','',''];const img=t[1].startsWith('photo-')?IMG(t[1],200):t[1];return `<div class="dtas-c"><img src="${img}" alt="${esc(n)}" loading="lazy"><div><b>${esc(n)}</b><p>${esc(t[2])}</p><a class="btn" href="seyahat-talebi.html?bolge=${encodeURIComponent(b.ad)}&elci=${encodeURIComponent(n)}">${esc(n.split(' ')[0])} ile planla</a> <a href="${t[0]}" class="dtas-p">Profil →</a></div></div>`}).join('')}</div></div>`}
  return {load,card,gallery,designers,regionTile,search,wireSearch,IMG,esc,regionOf};
})();
