
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
 function render(){cards.forEach((card,i)=>{const angle=-Math.PI*5/6+i*Math.PI/3+time/90000*Math.PI*2;card.style.left=(50+(innerWidth<=700?34:47)*Math.cos(angle))+'%';card.style.top=(50+49*Math.sin(angle))+'%';});}
 function syncButton(){button.textContent=paused?'Play orbit':'Pause orbit';button.setAttribute('aria-pressed',String(paused));}
 function frame(now){
  const dt=previous?Math.min(now-previous,100):0;
  if(!paused&&!hovered&&!focused&&!document.hidden)time+=dt*(1+scrollBoost);
  scrollBoost*=Math.exp(-dt/380);
  if(Math.abs(scrollBoost)<.01)scrollBoost=0;
  previous=now;render();requestAnimationFrame(frame);
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

