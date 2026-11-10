
// Highlight-only diffusion: bloom and a restrained amber-red halation fringe.
document.body.insertAdjacentHTML('afterbegin', `<svg width="0" height="0" aria-hidden="true" focusable="false" style="position:absolute;pointer-events:none"><defs><filter id="film-emulsion" x="-8%" y="-8%" width="116%" height="116%" color-interpolation-filters="sRGB"><feColorMatrix in="SourceGraphic" type="matrix" values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  1.063 3.576 .361 0 -3.5" result="highlights"/><feGaussianBlur in="highlights" stdDeviation="2.2" result="diffusion"/><feComponentTransfer in="diffusion" result="bloom"><feFuncA type="linear" slope=".24"/></feComponentTransfer><feGaussianBlur in="highlights" stdDeviation="3.5" result="halationMask"/><feFlood flood-color="#ff7847" flood-opacity=".16" result="warm"/><feComposite in="warm" in2="halationMask" operator="in" result="halation"/><feBlend in="SourceGraphic" in2="halation" mode="screen" result="warmImage"/><feBlend in="warmImage" in2="bloom" mode="screen"/></filter></defs></svg>`);

const current=location.pathname.split('/').pop()||'index.html';
document.querySelectorAll('nav a').forEach(a=>{if(a.getAttribute('href')===current)a.setAttribute('aria-current','page')});
const next=document.getElementById('next-url');if(next)next.value=new URL('thanks.html',location.href).href;
const formUrl=document.getElementById('form-url');if(formUrl)formUrl.value=location.href;
const title=document.getElementById('project-title');if(title){const id=Number(new URLSearchParams(location.search).get('id'));title.textContent=Number.isInteger(id)&&id>=1&&id<=6?'Placeholder '+id:'Project preview';}
const orbit=document.querySelector('.orbit');
if(orbit){
 const cards=[...orbit.querySelectorAll('.project-card')],button=orbit.querySelector('button'),media=matchMedia('(prefers-reduced-motion: reduce)');
 let paused=media.matches,hovered=false,focused=false,time=0,previous=0,scrollBoost=0;
 let radiusX=0,radiusY=0;
 function measure(){radiusX=orbit.clientWidth*(innerWidth<=700?.34:.47);radiusY=orbit.clientHeight*.49;}
 const orbitSize=new ResizeObserver(()=>{measure();render()});orbitSize.observe(orbit);measure();
 function render(){cards.forEach((card,i)=>{const angle=-Math.PI*5/6+i*Math.PI/3+time/90000*Math.PI*2;
  card.style.transform='translate3d('+(radiusX*Math.cos(angle)).toFixed(2)+'px,'+(radiusY*Math.sin(angle)).toFixed(2)+'px,0) translate(-50%,-50%)';
 });}
 function syncButton(){button.textContent=paused?'Play orbit':'Pause orbit';button.setAttribute('aria-pressed',String(paused));}
 function frame(now){
  const dt=previous?Math.min(now-previous,100):0;
  if(!paused&&!hovered&&!focused&&!document.hidden)time+=dt*(1+scrollBoost);
  scrollBoost*=Math.exp(-dt/380);
  if(Math.abs(scrollBoost)<.01)scrollBoost=0;
  previous=now;if(dt&&!paused&&!hovered&&!focused&&!document.hidden)render();requestAnimationFrame(frame);
 }
 // Wheel intensity adds momentum, which decays back to the original orbit speed.
 window.addEventListener('wheel',event=>{
  if(media.matches||paused||event.ctrlKey)return;
  const pixels=Math.abs(event.deltaY)*(event.deltaMode===1?16:event.deltaMode===2?innerHeight:1);
  if(pixels)scrollBoost=-Math.sign(event.deltaY)*Math.min(12,Math.max(1.2,Math.abs(scrollBoost))+pixels/35);
 },{passive:true});
 let lastTouchY=null;
 window.addEventListener('touchstart',event=>{lastTouchY=event.touches[0]?.clientY??null},{passive:true});
 window.addEventListener('touchmove',event=>{
  const y=event.touches[0]?.clientY;
  if(y!=null&&lastTouchY!=null&&!media.matches&&!paused)scrollBoost=Math.max(-12,Math.min(12,scrollBoost+(y-lastTouchY)/16));
  lastTouchY=y??null;
 },{passive:true});
 button.addEventListener('click',()=>{paused=!paused;syncButton()});
 cards.forEach(card=>{
  const image=card.querySelector('.artwork');
  image.addEventListener('pointerenter',()=>hovered=true);
  image.addEventListener('pointerleave',()=>hovered=false);
 });
 orbit.addEventListener('focusin',()=>focused=true);orbit.addEventListener('focusout',e=>{focused=orbit.contains(e.relatedTarget)});
 media.addEventListener('change',e=>{paused=e.matches;syncButton()});
 syncButton();render();requestAnimationFrame(frame);
}

// Fallback for browsers without native cross-document View Transitions.
if(!('ViewTransition' in window)&&!matchMedia('(prefers-reduced-motion: reduce)').matches){
 let navigating=false;
 document.addEventListener('click',event=>{
  const link=event.target.closest('a[href]');
  if(!link||event.defaultPrevented||event.button!==0||event.metaKey||event.ctrlKey||event.shiftKey||event.altKey||link.hasAttribute('download')||(link.target&&link.target!=='_self'))return;
  const target=new URL(link.href,location.href);
  if(target.origin!==location.origin||target.pathname===location.pathname||!target.pathname.endsWith('.html'))return;
  event.preventDefault();if(navigating)return;navigating=true;
  document.body.classList.add('page-leaving');
  setTimeout(()=>location.assign(target.href),180);
 });
 addEventListener('pageshow',()=>{navigating=false;document.body.classList.remove('page-leaving')});
}


// A small pooled canvas keeps the landing-page pixel trail off the DOM.
if(document.body.classList.contains('home-page')&&matchMedia('(pointer: fine)').matches&&!matchMedia('(prefers-reduced-motion: reduce)').matches){
 const canvas=document.createElement('canvas');canvas.className='pixel-trail';canvas.setAttribute('aria-hidden','true');document.body.append(canvas);
 const ctx=canvas.getContext('2d');
 if(ctx){
  let width=0,height=0,dpr=1,raf=0,lastX=null,lastY=null,lastTime=0;
  const pixels=[],colors=['#161bc6','#2928ec','#88d4e8','#ffffff'];
  function size(){dpr=Math.min(devicePixelRatio||1,2);width=innerWidth;height=innerHeight;canvas.width=Math.round(width*dpr);canvas.height=Math.round(height*dpr);ctx.setTransform(dpr,0,0,dpr,0,0);}
  function draw(now){const dt=Math.min((now-lastTime)||16,40);lastTime=now;ctx.clearRect(0,0,width,height);
   for(let i=pixels.length-1;i>=0;i--){const p=pixels[i];p.age+=dt;if(p.age>=p.life){pixels.splice(i,1);continue;}const fade=1-p.age/p.life;ctx.globalAlpha=fade*fade*.7;ctx.fillStyle=p.color;ctx.fillRect(Math.round(p.x+p.dx*p.age/1000),Math.round(p.y+p.dy*p.age/1000),p.size,p.size);}
   ctx.globalAlpha=1;raf=pixels.length?requestAnimationFrame(draw):0;
  }
  size();addEventListener('resize',size,{passive:true});
  addEventListener('pointermove',event=>{
   if(event.pointerType==='touch'||document.hidden)return;
   const x=event.clientX,y=event.clientY;if(lastX===null){lastX=x;lastY=y;return;}
   const distance=Math.hypot(x-lastX,y-lastY);if(distance<4)return;
   const count=Math.min(8,Math.ceil(distance/8));
   for(let i=0;i<count;i++){const t=(i+1)/count;pixels.push({x:lastX+(x-lastX)*t+(Math.random()-.5)*12,y:lastY+(y-lastY)*t+(Math.random()-.5)*12,size:Math.random()<.8?2:3,age:0,life:350+Math.random()*350,dx:(Math.random()-.5)*14,dy:(Math.random()-.5)*14,color:colors[Math.floor(Math.random()*colors.length)]});}
   if(pixels.length>140)pixels.splice(0,pixels.length-140);lastX=x;lastY=y;if(!raf){lastTime=performance.now();raf=requestAnimationFrame(draw);}
  },{passive:true});
  document.addEventListener('pointerleave',()=>{lastX=null;lastY=null});
  document.addEventListener('visibilitychange',()=>{if(document.hidden){cancelAnimationFrame(raf);raf=0;pixels.length=0;ctx.clearRect(0,0,width,height);lastX=null;lastY=null;}});
 }
}
