const S={c:0,y:0,d:-1,p:-1,s:-1};const $=i=>document.getElementById(i);
const fm=n=>'S/ '+Math.round(n).toLocaleString('es-PE');
const sh=n=>n>=1e9?(n/1e9).toFixed(1).replace('.0','')+' mil M':n>=1e6?(n/1e6).toFixed(n>=1e7?0:1)+' M':n>=1e3?Math.round(n/1e3)+' mil':Math.round(n);
const tip=$('tip');
function tipOn(e,h){tip.innerHTML=h;tip.style.display='block';tip.style.left=Math.min(e.clientX+12,innerWidth-230)+'px';tip.style.top=(e.clientY+14)+'px'}
function tipOff(){tip.style.display='none'}
const val=r=>r[5+S.c];
function nice(x){if(!x)return 1;const p=10**Math.floor(Math.log10(x)),f=x/p;return(f<=1?1:f<=2?2:f<=5?5:10)*p}
function chart(el,yel,items,click,rot){
 const mx=nice(Math.max(...items.map(i=>i.r+i.l),1));let y='',g='';
 for(let k=0;k<=4;k++){const p=k*25;y+=`<span style="bottom:${p}%">${sh(mx*k/4)}</span>`;g+=`<div class="gl" style="bottom:${p}%"></div>`}
 yel.innerHTML=y;const w=Math.max(items.length*(rot?26:30),0);
 el.style.minWidth=w+'px';
 el.innerHTML=`<div class="plot">${g}<div class="bars">${items.map((it,i)=>`<div class="col${it.hl?' hl':''}" data-i="${i}"><div class="stack" style="height:${(it.r+it.l)/mx*100}%"><i class="l" style="flex:${it.l} 1 0"></i><i class="r" style="flex:${it.r} 1 0"></i></div></div>`).join('')}</div></div><div class="lbs${rot?' v':''}">${items.map(i=>`<span><i>${i.k}</i></span>`).join('')}</div>`;
 el.querySelectorAll('.col').forEach(c=>{const it=items[c.dataset.i];
  c.onclick=()=>click&&click(it);c.onmousemove=e=>tipOn(e,`<b>${it.k}</b><br>Regional: ${fm(it.r)}<br>Locales: ${fm(it.l)}<br>Total: ${fm(it.r+it.l)}`);c.onmouseleave=tipOff})}
function opts(sel,list,first,cur){sel.innerHTML=`<option value="-1">${first}</option>`+list.map(([i,n])=>`<option value="${i}"${i==cur?' selected':''}>${n}</option>`).join('')}
function sync(){
 opts($('sy'),[...Array(22)].map((_,i)=>[2025-i,2025-i]),'Todos',S.y);$('sy').value=S.y||-1;
 opts($('sd'),D.d.map((n,i)=>[i,n]).sort((a,b)=>a[1].localeCompare(b[1],'es')),'Todos',S.d);
 const ps=new Set(),ss=new Set();D.rows.forEach(r=>{if(r[1]==S.d){if(r[2]>=0)ps.add(r[2]);if(r[2]==S.p&&r[3]>=0)ss.add(r[3])}});
 opts($('sp'),[...ps].map(i=>[i,D.p[i]]).sort((a,b)=>a[1].localeCompare(b[1],'es')),'Todas',S.p);
 opts($('ss'),[...ss].map(i=>[i,D.s[i]]).sort((a,b)=>a[1].localeCompare(b[1],'es')),'Todos',S.s);
 $('sp').disabled=S.d<0;$('ss').disabled=S.p<0;
 document.querySelectorAll('#cat button').forEach(b=>b.classList.toggle('on',+b.dataset.c==S.c))}
const geo=r=>(S.d<0||r[1]==S.d)&&(S.p<0||r[2]==S.p)&&(S.s<0||r[3]==S.s);
function render(){
 sync();const nm=S.c?'Regalías Mineras':'Canon Minero';
 const g=new Map();let tr=0,tl=0;
 D.rows.forEach(r=>{if(S.y&&r[0]!=S.y||!geo(r))return;
  const k=S.d<0?r[1]:S.p<0?r[2]:r[3];if(!g.has(k))g.set(k,{r:0,l:0});const o=g.get(k);
  if(r[4])o.l+=val(r);else o.r+=val(r);if(r[4])tl+=val(r);else tr+=val(r)});
 const lab=k=>S.d<0?D.d[k]:S.p<0?(k<0?'Gobierno Regional':D.p[k]):(k<0?'Municipalidad provincial':D.s[k]);
 let it=[...g].map(([k,o])=>({key:k,k:lab(k),r:o.r,l:o.l})).sort((a,b)=>b.r+b.l-a.r-a.l);const all=it.length,all_=it;it=it.slice(0,30);
 const lvl=S.d<0?'departamento':S.p<0?'provincia':'distrito';
 $('t1').textContent=`${nm} por ${lvl}, ${S.y||'2004–2025'}`+(all>30?` (30 mayores de ${all})`:'');
 curAll=all_;chart($('in'),$('yax'),it,drill,true);
 const place=S.s>=0?D.s[S.s]:S.p>=0?D.p[S.p]:S.d>=0?D.d[S.d]:'Todas las regiones';
 $('sum').innerHTML=`<div>${place}</div><div><span>Gobierno Regional</span><span>${Math.round(tr).toLocaleString('es-PE')}</span></div><div><span>Gobiernos Locales</span><span>${Math.round(tl).toLocaleString('es-PE')}</span></div><div><span>Total</span><span>${Math.round(tr+tl).toLocaleString('es-PE')}</span></div>`;
 $('big').textContent=fm(tr+tl);$('cn').textContent=nm;
 // tendencia
 const ys=new Map();D.rows.forEach(r=>{if(!geo(r))return;if(!ys.has(r[0]))ys.set(r[0],{r:0,l:0});const o=ys.get(r[0]);r[4]?o.l+=val(r):o.r+=val(r)});
 const yi=[...ys].sort((a,b)=>a[0]-b[0]).map(([y,o])=>({key:y,k:y,r:o.r,l:o.l,hl:y==S.y}));
 $('t2').textContent=`Evolución anual de ${nm} en ${place}. Selecciona un año para filtrar.`;
 chart($('in2'),$('yax2'),yi,x=>{S.y=S.y==x.key?0:x.key;render()},false);
 $('ft').textContent=S.c?'Regalías Mineras: datos MEF (monto acreditado) 2005–2013; 2014–2025 son valores estimados, aún sin datos oficiales cargados. Gobierno Regional / Locales 2004–2013: el MEF no separa el nivel de gobierno en esta descarga, por lo que se calcula con la parte que fija la ley (20 % regional en regalías).':'Canon Minero: monto acreditado según el MEF, 2004–2025. En 2005–2013 el reparto Gobierno Regional / Locales usa la parte que fija la ley (25 % regional).';
 drawMap();const kk=S.d+'|'+S.p+'|'+S.s;if(kk!==lastD){lastD=kk;fit()}}
let curAll=[],lastD='-1|-1|-1';
function drill(x){if(x.key==null)return;if(S.d<0)S.d=x.key;else if(S.p<0&&x.key>=0)S.p=x.key;else if(S.s<0&&x.key>=0&&S.p>=0)S.s=x.key;render()}

const RAMP=['#1b5e3a','#1f8a4c','#2fb463','#55d68a','#9be8b5','#d9f7e4'],SELF='#2fb463';
function ramp(t){const n=RAMP.length-1,s=Math.min(.999,t)*n,i=Math.floor(s),f=s-i,x=c=>[1,3,5].map(k=>parseInt(c.substr(k,2),16));const A=x(RAMP[i]),B=x(RAMP[i+1]);return'rgb('+A.map((v,k)=>Math.round(v+(B[k]-v)*f)).join(',')+')'}
const V={k:1,x:0,y:0},svg=$('m');
svg.innerHTML=`<rect width="430" height="555" fill="#000"/><g id="vp"><g id="bb"></g></g>`;
const vp=$('vp');function tf(){vp.setAttribute('transform',`translate(${V.x} ${V.y}) scale(${V.k})`)}
let raf;function go(k,x,y){cancelAnimationFrame(raf);const a={k:V.k,x:V.x,y:V.y},t0=performance.now();const st=t=>{const u=Math.min(1,(t-t0)/450),e=1-Math.pow(1-u,3);V.k=a.k+(k-a.k)*e;V.x=a.x+(x-a.x)*e;V.y=a.y+(y-a.y)*e;tf();if(u<1)raf=requestAnimationFrame(st)};raf=requestAnimationFrame(st)}
const BB={};function bbox(nm,o){if(BB[nm])return BB[nm];let x0=1e9,y0=1e9,x1=-1e9,y1=-1e9;o.p.split(' ').forEach(q=>{const [x,y]=q.split(',').map(Number);if(x<x0)x0=x;if(x>x1)x1=x;if(y<y0)y0=y;if(y>y1)y1=y});return BB[nm]=[x0,y0,x1,y1]}
function unionGP(d){let u=null;Object.keys(GP).forEach(k=>{if(k.split('|')[0]!=d)return;const q=GP[k].b;u=u?[Math.min(u[0],q[0]),Math.min(u[1],q[1]),Math.max(u[2],q[2]),Math.max(u[3],q[3])]:q.slice()});return u}
function target(){let b=null;
 if(S.s>=0){const o=GS[S.d+'|'+S.p+'|'+S.s];if(o)b=o.b}
 if(!b&&S.p>=0){const o=GP[S.d+'|'+S.p];if(o)b=o.b}
 if(!b){const nm=D.d[S.d],o=G.d[nm];if(o)b=bbox(nm,o);else b=unionGP(S.d)||(()=>{const [x,y]=G.call;return[x-8,y-8,x+8,y+8]})()}
 return b}
function fit(){if(S.d<0){go(1,0,0);return}const b=target();if(!b)return;const w=Math.max(b[2]-b[0],1),h=Math.max(b[3]-b[1],1),k=Math.min(60,Math.max(1,Math.min(430*.78/w,555*.78/h))),cx=(b[0]+b[2])/2,cy=(b[1]+b[3])/2;go(k,215-cx*k,277-cy*k)}
function zoom(f,cx,cy){cancelAnimationFrame(raf);const k=Math.min(60,Math.max(1,V.k*f)),r=k/V.k;V.x=cx-(cx-V.x)*r;V.y=cy-(cy-V.y)*r;V.k=k;if(k==1){V.x=V.y=0}tf()}
const pt=e=>{const p=svg.createSVGPoint();p.x=e.clientX;p.y=e.clientY;return p.matrixTransform(svg.getScreenCTM().inverse())};
svg.addEventListener('wheel',e=>{e.preventDefault();const p=pt(e);zoom(e.deltaY<0?1.2:1/1.2,p.x,p.y)},{passive:false});
let dr=null;svg.onpointerdown=e=>{cancelAnimationFrame(raf);dr={p:pt(e),x:V.x,y:V.y,m:0}};
addEventListener('pointermove',e=>{if(!dr)return;const p=pt(e);if(Math.abs(p.x-dr.p.x)+Math.abs(p.y-dr.p.y)>4)dr.m=1;if(dr.m){V.x=dr.x+p.x-dr.p.x;V.y=dr.y+p.y-dr.p.y;tf()}});
addEventListener('pointerup',()=>setTimeout(()=>dr=null));
function zstep(f){const k=Math.min(60,Math.max(1,V.k*f));if(k==1){go(1,0,0);return}const r=k/V.k;go(k,215-(215-V.x)*r,277-(277-V.y)*r)}
$('zi').onclick=()=>zstep(1.5);$('zo').onclick=()=>zstep(1/1.5);$('zh').onclick=()=>{S.d=S.p=S.s=-1;render();go(1,0,0)};
$('bl').onclick=()=>{$('lay').hidden=!$('lay').hidden;$('bl').classList.toggle('on',!$('lay').hidden)};
$('bg').onclick=()=>{$('leg').hidden=!$('leg').hidden;$('bg').classList.toggle('on',!$('leg').hidden)};
$('lx').onclick=()=>$('bg').click();$('l1').onchange=$('l2').onchange=()=>drawMap();
let tot=[];
function pick(i){if(dr&&dr.m)return;S.d=S.d==i?-1:i;S.p=S.s=-1;render()}
function drawMap(){
 const t={};D.rows.forEach(r=>{if(S.y&&r[0]!=S.y)return;t[r[1]]=(t[r[1]]||0)+val(r)});
 tot=D.d.map((n,i)=>[i,n,t[i]||0]).sort((a,b)=>b[2]-a[2]);drawLeg();
 const mx=Math.max(...tot.map(q=>q[2]),1),col=$('l1').checked;let b='',s='',lb='';
 const SUB=buildSub();
 tot.forEach(([i,nm,v])=>{const sel=S.d==i,o=G.d[nm];if(sel&&SUB.on)return;
  if(nm=='Callao'){const [x,y]=G.call;b+=`<g class="hx dp${sel?' sel':''}" data-i="${i}" tabindex="0" role="button" aria-label="Callao"><circle cx="${x}" cy="${y}" r="3.4" fill="${col?ramp(Math.sqrt(v/mx)):SELF}"/></g>`;
   if($('l2').checked&&S.d<0)lb+=`<text x="${x-6}" y="${y+3}" text-anchor="end" font-size="7.5" font-weight="600" fill="#fff" stroke="#0b0b0b" stroke-width="2.2" paint-order="stroke" pointer-events="none" transform="rotate(-30 ${x-6} ${y+3})">Callao</text>`;return}
  if(!o)return;
  const el=`<g class="hx dp${sel?' sel':''}" data-i="${i}" tabindex="0" role="button" aria-label="${nm}"><polygon points="${o.p}" fill="${col?ramp(Math.sqrt(v/mx)):SELF}"/></g>`;
  if(sel)s=el;else b+=el;
  if($('l2').checked&&S.d<0){const [x,y]=o.c,fs=o.a>9000?11:o.a>3000?9:o.a>1500?7.5:6.5;
   lb+=`<g transform="rotate(-30 ${x} ${y})" pointer-events="none" text-anchor="middle" font-size="${fs}" fill="#fff" stroke="#0b0b0b" stroke-width="2.4" paint-order="stroke"><text x="${x}" y="${y}" font-weight="600">${nm}</text>${o.a>1800?`<text x="${x}" y="${y+fs+.5}" font-size="${fs-1.5}" fill="#bfe0ff">${sh(v)}</text>`:''}</g>`}});
 svg.classList.toggle('has',S.d>=0);$('bb').innerHTML=b+s+SUB.h+lb+SUB.l;crumb();
 $('bb').querySelectorAll('.hx.dp').forEach(c=>{const i=+c.dataset.i,q=tot.find(z=>z[0]==i);
  c.onclick=()=>pick(i);c.onkeydown=e=>{if(e.key=='Enter'||e.key==' '){e.preventDefault();pick(i)}};
  c.onmousemove=e=>tipOn(e,`<b>${q[1]}</b><br>${fm(q[2])}`);c.onmouseleave=tipOff});bindSub()}

function buildSub(){
 const R={on:false,h:'',l:''};if(S.d<0)return R;
 const pk=Object.keys(GP).filter(k=>k.split('|')[0]==S.d);if(!pk.length)return R;
 R.on=true;const col=$('l1').checked,lab=$('l2').checked,pv={},dv={};
 D.rows.forEach(r=>{if(r[1]!=S.d||r[2]<0||(S.y&&r[0]!=S.y))return;pv[r[2]]=(pv[r[2]]||0)+val(r);if(r[2]==S.p&&r[3]>=0)dv[r[3]]=(dv[r[3]]||0)+val(r)});
 const dk=S.p>=0?Object.keys(GS).filter(k=>k.startsWith(S.d+'|'+S.p+'|')):[];
 const distLevel=dk.length>0,fc=(v,mx)=>col?ramp(Math.sqrt(Math.max(v,0)/mx)):SELF;
 const fsz=(o,t)=>Math.max(.7,Math.min(9,(o.b[2]-o.b[0])/Math.max(4,t.length*.62)));
 const txt=(o,t,v)=>{const f=fsz(o,t);return `<g pointer-events="none" text-anchor="middle" fill="#fff" stroke="#000" stroke-width="${(f*.28).toFixed(2)}" paint-order="stroke" font-weight="600"><text x="${o.c[0]}" y="${o.c[1]}" font-size="${f.toFixed(2)}">${t}</text>${f>=1.6?`<text x="${o.c[0]}" y="${(o.c[1]+f*1.05).toFixed(2)}" font-size="${(f*.78).toFixed(2)}" fill="#bfe9cf" font-weight="500">${sh(v||0)}</text>`:''}</g>`};
 const pm=Math.max(...pk.map(k=>pv[k.split('|')[1]]||0),1);
 let sel='';
 pk.forEach(k=>{const p=+k.split('|')[1],o=GP[k],v=pv[p]||0,isSel=S.p==p;
  if(distLevel&&isSel)return;
  const g=`<g class="hx pv${distLevel?' ctx':''}${isSel?' sel':''}" data-p="${p}" tabindex="0" role="button" aria-label="${D.p[p]}"><path d="${o.p}" fill-rule="evenodd" fill="${distLevel?'#16331f':fc(v,pm)}"/></g>`;
  if(isSel)sel+=g;else R.h+=g;
  if(lab&&!distLevel)R.l+=txt(o,D.p[p],v)});
 R.h+=sel;
 if(distLevel){
  const m=Math.max(...dk.map(k=>dv[k.split('|')[2]]||0),1);let ds='';
  dk.forEach(k=>{const sx=k.split('|')[2],o=GS[k],inert=sx[0]=='x',v=inert?0:(dv[sx]||0),isSel=!inert&&S.s==+sx,nm=inert?o.n:D.s[+sx];
   const g=`<g class="hx dv${inert?' inert':''}${isSel?' sel':''}" ${inert?'':`data-s="${sx}" tabindex="0" role="button"`} data-n="${nm.replace(/"/g,'')}" aria-label="${nm.replace(/"/g,'')}"><path d="${o.p}" fill-rule="evenodd" fill="${inert?'#0f1a13':fc(v,m)}"/></g>`;
   if(isSel)ds+=g;else R.h+=g;
   if(lab)R.l+=txt(o,nm,v)});
  R.h+=ds}
 return R}
function crumb(){
 const c=[['Perú',()=>{S.d=S.p=S.s=-1}]];
 if(S.d>=0)c.push([D.d[S.d],()=>{S.p=S.s=-1}]);
 if(S.p>=0)c.push([D.p[S.p],()=>{S.s=-1}]);
 if(S.s>=0)c.push([D.s[S.s],null]);
 const el=$('crumb');el.innerHTML=c.map(([n],i)=>`<button data-i="${i}"${i==c.length-1?' class="cur"':''}>${n}</button>`).join('<i>›</i>');
 el.querySelectorAll('button').forEach(b=>b.onclick=()=>{const f=c[+b.dataset.i][1];if(f){f();render()}})}
function bindSub(){
 $('bb').querySelectorAll('.pv').forEach(c=>{const p=+c.dataset.p,k=S.d+'|'+p;
  const v=()=>{let t=0;D.rows.forEach(r=>{if(r[1]==S.d&&r[2]==p&&(!S.y||r[0]==S.y))t+=val(r)});return t};
  c.onclick=()=>{if(dr&&dr.m)return;S.p=S.p==p?-1:p;S.s=-1;render()};
  c.onkeydown=e=>{if(e.key=='Enter'||e.key==' '){e.preventDefault();c.onclick()}};
  c.onmousemove=e=>tipOn(e,`<b>${D.p[p]}</b><br>Provincia<br>${fm(v())}`);c.onmouseleave=tipOff});
 $('bb').querySelectorAll('.dv').forEach(c=>{const sx=c.dataset.s,nm=c.dataset.n;
  if(sx==null){c.onmousemove=e=>tipOn(e,`<b>${nm}</b><br>Sin transferencias registradas`);c.onmouseleave=tipOff;return}
  const v=()=>{let t=0;D.rows.forEach(r=>{if(r[1]==S.d&&r[2]==S.p&&r[3]==+sx&&(!S.y||r[0]==S.y))t+=val(r)});return t};
  c.onclick=()=>{if(dr&&dr.m)return;S.s=S.s==+sx?-1:+sx;render()};
  c.onkeydown=e=>{if(e.key=='Enter'||e.key==' '){e.preventDefault();c.onclick()}};
  c.onmousemove=e=>tipOn(e,`<b>${nm}</b><br>Distrito<br>${fm(v())}`);c.onmouseleave=tipOff})}
function drawLeg(){const mx=Math.max(...tot.map(t=>t[2]),1);
 const lvl=S.d<0?'región':S.p<0?'provincia':'distrito';
 const rows=S.d<0?tot.map(([i,n,v])=>`<div class="rk" data-i="${i}"><span>${n}</span><b>${sh(v)}</b></div>`):curAll.map(o=>`<div class="rk${o.key<0?' nc':''}" data-k="${o.key}"><span>${o.k}</span><b>${sh(o.r+o.l)}</b></div>`);
 $('lb').innerHTML=`<h4>${S.c?'Regalías Mineras':'Canon Minero'} ${S.y||'2004–2025'}</h4><div style="height:10px;border-radius:5px;border:1px solid #000;background:linear-gradient(90deg,${RAMP.join(',')})"></div><div class="rk" style="cursor:default;border:0"><span>S/ 0</span><span>${sh(mx)}</span></div><label class="sw"><b style="width:14px;height:14px;border-radius:3px;background:transparent;border:2px solid #bbf7d0;opacity:1"></b>Región seleccionada</label><p style="margin:4px 0;color:var(--mu)">Más oscuro = menos monto, más brillante = más monto. Haz clic en una región para acercar el mapa y de nuevo para quitar el filtro.</p><h4>Ranking por ${lvl}</h4>`+rows.join('');
 $('lb').querySelectorAll('.rk[data-i]').forEach(r=>r.onclick=()=>pick(+r.dataset.i));
 $('lb').querySelectorAll('.rk[data-k]:not(.nc)').forEach(r=>r.onclick=()=>drill({key:+r.dataset.k}))}
$('sy').onchange=e=>{S.y=+e.target.value<0?0:+e.target.value;render()};
$('sd').onchange=e=>{S.d=+e.target.value;S.p=S.s=-1;render()};
$('sp').onchange=e=>{S.p=+e.target.value;S.s=-1;render()};
$('ss').onchange=e=>{S.s=+e.target.value;render()};
document.querySelectorAll('#cat button').forEach(b=>b.onclick=()=>{S.c=+b.dataset.c;render()});
render();
if(innerWidth<760){$('leg').hidden=true;$('bg').classList.remove('on')}
