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
 let it=[...g].map(([k,o])=>({key:k,k:lab(k),r:o.r,l:o.l})).sort((a,b)=>b.r+b.l-a.r-a.l);const all=it.length;it=it.slice(0,30);
 const lvl=S.d<0?'departamento':S.p<0?'provincia':'distrito';
 $('t1').textContent=`${nm} por ${lvl}, ${S.y||'2004–2025'}`+(all>30?` (30 mayores de ${all})`:'');
 chart($('in'),$('yax'),it,x=>{if(S.d<0)S.d=x.key;else if(S.p<0&&x.key>=0)S.p=x.key;else if(S.s<0&&x.key>=0&&S.p>=0)S.s=x.key;render()},true);
 const place=S.s>=0?D.s[S.s]:S.p>=0?D.p[S.p]:S.d>=0?D.d[S.d]:'Todas las regiones';
 $('sum').innerHTML=`<div>${place}</div><div><span>Gobierno Regional</span><span>${Math.round(tr).toLocaleString('es-PE')}</span></div><div><span>Gobiernos Locales</span><span>${Math.round(tl).toLocaleString('es-PE')}</span></div><div><span>Total</span><span>${Math.round(tr+tl).toLocaleString('es-PE')}</span></div>`;
 $('big').textContent=fm(tr+tl);$('cn').textContent=nm;
 // tendencia
 const ys=new Map();D.rows.forEach(r=>{if(!geo(r))return;if(!ys.has(r[0]))ys.set(r[0],{r:0,l:0});const o=ys.get(r[0]);r[4]?o.l+=val(r):o.r+=val(r)});
 const yi=[...ys].sort((a,b)=>a[0]-b[0]).map(([y,o])=>({key:y,k:y,r:o.r,l:o.l,hl:y==S.y}));
 $('t2').textContent=`Evolución anual de ${nm} en ${place}. Selecciona un año para filtrar.`;
 chart($('in2'),$('yax2'),yi,x=>{S.y=S.y==x.key?0:x.key;render()},false);
 $('ft').textContent=S.c?'Regalías Mineras: valores estimados para completar la serie, aún sin datos oficiales cargados. Canon Minero: datos MEF 2004–2025, monto acreditado.':'Canon Minero: monto acreditado según el MEF, 2004–2025. Regalías Mineras: valores estimados.';
 drawMap()}

const RAMP=['#10244a','#14407a','#1590b0','#2dd4bf','#fbbf24'];
function ramp(t){const n=RAMP.length-1,s=Math.min(.999,t)*n,i=Math.floor(s),f=s-i,x=c=>[1,3,5].map(k=>parseInt(c.substr(k,2),16));const A=x(RAMP[i]),B=x(RAMP[i+1]);return'rgb('+A.map((v,k)=>Math.round(v+(B[k]-v)*f)).join(',')+')'}
const V={k:1,x:0,y:0},svg=$('m');
svg.innerHTML=`<defs><filter id="gl" x="-10%" y="-10%" width="120%" height="120%"><feGaussianBlur stdDeviation="5"/></filter><pattern id="gr" width="20" height="20" patternUnits="userSpaceOnUse"><path d="M20 0H0V20" fill="none" stroke="#22d3ee" stroke-width=".4" opacity=".12"/></pattern><radialGradient id="rg" cx=".5" cy=".45" r=".7"><stop offset="0" stop-color="#12244a"/><stop offset="1" stop-color="#070d1c"/></radialGradient></defs>
<rect width="430" height="555" fill="url(#rg)"/><rect width="430" height="555" fill="url(#gr)"/>
<g id="vp"><g id="ha" filter="url(#gl)" opacity=".55"></g><g id="bb"></g></g>
<g fill="none" stroke="#22d3ee" stroke-width="1.5" opacity=".8"><path d="M8 28V8h20M422 28V8h-20M8 527v20h20M422 527v20h-20"/></g>
<text x="415" y="540" text-anchor="end" font-size="7" fill="#22d3ee" opacity=".7" letter-spacing="2">PERÚ 2004–2025</text>`;
const vp=$('vp');function tf(){vp.setAttribute('transform',`translate(${V.x} ${V.y}) scale(${V.k})`)}
function zoom(f,cx,cy){const k=Math.min(8,Math.max(1,V.k*f)),r=k/V.k;V.x=cx-(cx-V.x)*r;V.y=cy-(cy-V.y)*r;V.k=k;if(k==1){V.x=V.y=0}tf()}
const pt=e=>{const p=svg.createSVGPoint();p.x=e.clientX;p.y=e.clientY;return p.matrixTransform(svg.getScreenCTM().inverse())};
svg.addEventListener('wheel',e=>{e.preventDefault();const p=pt(e);zoom(e.deltaY<0?1.2:1/1.2,p.x,p.y)},{passive:false});
let dr=null;svg.onpointerdown=e=>{dr={p:pt(e),x:V.x,y:V.y,m:0}};
addEventListener('pointermove',e=>{if(!dr)return;const p=pt(e);if(Math.abs(p.x-dr.p.x)+Math.abs(p.y-dr.p.y)>4)dr.m=1;if(dr.m){V.x=dr.x+p.x-dr.p.x;V.y=dr.y+p.y-dr.p.y;tf()}});
addEventListener('pointerup',()=>setTimeout(()=>dr=null));
$('zi').onclick=()=>zoom(1.5,215,277);$('zo').onclick=()=>zoom(1/1.5,215,277);$('zh').onclick=()=>{V.k=1;V.x=V.y=0;tf()};
$('bl').onclick=()=>{$('lay').hidden=!$('lay').hidden;$('bl').classList.toggle('on',!$('lay').hidden)};
$('bg').onclick=()=>{$('leg').hidden=!$('leg').hidden;$('bg').classList.toggle('on',!$('leg').hidden)};
$('lx').onclick=()=>$('bg').click();$('l1').onchange=$('l2').onchange=()=>drawMap();
let tot=[];
function pick(i){if(dr&&dr.m)return;S.d=S.d==i?-1:i;S.p=S.s=-1;render()}
function drawMap(){
 const t={};D.rows.forEach(r=>{if(S.y&&r[0]!=S.y)return;t[r[1]]=(t[r[1]]||0)+val(r)});
 tot=D.d.map((n,i)=>[i,n,t[i]||0]).sort((a,b)=>b[2]-a[2]);drawLeg();
 const mx=Math.max(...tot.map(q=>q[2]),1),col=$('l1').checked;let b='',s='',lb='',ha='';
 tot.forEach(([i,nm,v])=>{const sel=S.d==i,o=G.d[nm];
  if(nm=='Callao'){const [x,y]=G.call;b+=`<g class="hx${sel?' sel':''}" data-i="${i}" tabindex="0" role="button" aria-label="Callao"><circle cx="${x}" cy="${y}" r="3.4" fill="${sel?'#6d28d9':col?ramp(Math.sqrt(v/mx)):'#10244a'}"/></g>`;
   if($('l2').checked)lb+=`<text x="${x-6}" y="${y+3}" text-anchor="end" font-size="7.5" font-weight="600" fill="#e6f1ff" stroke="#050a19" stroke-width="2" paint-order="stroke" pointer-events="none" transform="rotate(-30 ${x-6} ${y+3})">Callao</text>`;return}
  if(!o)return;ha+=`<polygon points="${o.p}" fill="none" stroke="#22d3ee" stroke-width="3"/>`;
  const el=`<g class="hx${sel?' sel':''}" data-i="${i}" tabindex="0" role="button" aria-label="${nm}"><polygon points="${o.p}" fill="${sel?'#5b21b6':col?ramp(Math.sqrt(v/mx)):'#10244a'}"/></g>`;
  if(sel)s=el;else b+=el;
  if($('l2').checked){const [x,y]=o.c,fs=o.a>9000?11:o.a>3000?9:o.a>1500?7.5:6.5;
   lb+=`<g transform="rotate(-30 ${x} ${y})" pointer-events="none" text-anchor="middle" font-size="${fs}" fill="#e6f1ff" stroke="#050a19" stroke-width="2.2" paint-order="stroke"><text x="${x}" y="${y}" font-weight="600">${nm}</text>${o.a>1800?`<text x="${x}" y="${y+fs+.5}" font-size="${fs-1.5}" fill="#a5f3fc">${sh(v)}</text>`:''}</g>`}});
 $('ha').innerHTML=ha;$('bb').innerHTML=b+s+lb;
 $('bb').querySelectorAll('.hx').forEach(c=>{const i=+c.dataset.i,q=tot.find(z=>z[0]==i);
  c.onclick=()=>pick(i);c.onkeydown=e=>{if(e.key=='Enter'||e.key==' '){e.preventDefault();pick(i)}};
  c.onmousemove=e=>tipOn(e,`<b>${q[1]}</b><br>${fm(q[2])}`);c.onmouseleave=tipOff})}
function drawLeg(){const mx=Math.max(...tot.map(t=>t[2]),1);
 $('lb').innerHTML=`<h4>${S.c?'Regalías Mineras':'Canon Minero'} ${S.y||'2004–2025'}</h4><div style="height:10px;border-radius:5px;background:linear-gradient(90deg,#10244a,#14407a,#1590b0,#2dd4bf,#fbbf24)"></div><div class="rk" style="cursor:default;border:0"><span>S/ 0</span><span>${sh(mx)}</span></div><label class="sw"><b style="width:14px;height:14px;border-radius:3px;background:#5b21b6;border-color:#d8b4fe;opacity:1"></b>Región seleccionada</label><p style="margin:4px 0;color:var(--mu)">Cada hexágono es un departamento. Haz clic para filtrar y de nuevo para quitar el filtro.</p><h4>Ranking por región</h4>`+tot.map(([i,n,v])=>`<div class="rk" data-i="${i}"><span>${n}</span><b>${sh(v)}</b></div>`).join('');
 $('lb').querySelectorAll('.rk[data-i]').forEach(r=>r.onclick=()=>pick(+r.dataset.i))}
$('sy').onchange=e=>{S.y=+e.target.value<0?0:+e.target.value;render()};
$('sd').onchange=e=>{S.d=+e.target.value;S.p=S.s=-1;render()};
$('sp').onchange=e=>{S.p=+e.target.value;S.s=-1;render()};
$('ss').onchange=e=>{S.s=+e.target.value;render()};
document.querySelectorAll('#cat button').forEach(b=>b.onclick=()=>{S.c=+b.dataset.c;render()});
render();
