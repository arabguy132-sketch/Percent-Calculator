const $ = id => document.getElementById(id);
const ROW = 48, COUNT = 100;
let index = 19, previous = null, frame;
const wheel = $('wheel');
const fragment = document.createDocumentFragment();
for(let i=0;i<COUNT;i++) { const row=document.createElement('div'); row.className='wheelRow'; row.textContent=String((i+1)*5)+'%'; row.setAttribute('aria-hidden','true'); row.addEventListener('click',()=>select(i,true)); fragment.appendChild(row); }
wheel.appendChild(fragment);
function calculateSeconds(minutes, seconds, percent) { return (minutes*60+seconds)*100/percent; }
function formatTime(seconds) { const total=Math.round(seconds); return `${Math.floor(total/60)}:${String(total%60).padStart(2,'0')}`; }
function update() {
 const m=Number($('minutes').value), s=Number($('seconds').value), p=(index+1)*5;
 const valid=$('minutes').value!=='' && $('seconds').value!=='' && Number.isInteger(m) && Number.isInteger(s) && m>=0 && s>=0 && s<60 && m*60+s>=300 && m*60+s<=4200;
 $('error').textContent=valid?'':'Enter a scheduled trip from 5:00 to 70:00, with seconds from 0 to 59.';
 $('minutes').setAttribute('aria-invalid',String(!valid)); $('seconds').setAttribute('aria-invalid',String(!valid));
 $('resultLabel').textContent=`TRIP TIME AT ${p}%`;
 if(!valid){$('result').textContent='—';$('detail').textContent='Enter a valid scheduled trip time.';$('rounding').textContent='';return;}
 const exact=calculateSeconds(m,s,p), rounded=Math.round(exact);
 $('result').textContent=formatTime(exact);
 $('detail').textContent=`${Math.floor(rounded/60)} minutes, ${rounded%60} seconds`;
 $('rounding').textContent='Time rounded to the nearest second.';
}
function highlight(){
 if(previous!==null) wheel.children[previous].classList.remove('active');
 wheel.children[index].classList.add('active');previous=index;
 $('percent').value=String((index+1)*5);
 $('percentError').textContent=''; $('percent').setAttribute('aria-invalid','false');
 wheel.setAttribute('aria-valuenow',String((index+1)*5));
 wheel.setAttribute('aria-valuetext',String((index+1)*5)+' percent');update();
}
function select(next,animate=false){ index=Math.max(0,Math.min(COUNT-1,next)); highlight();wheel.scrollTo({top:index*ROW,behavior:animate&&!matchMedia('(prefers-reduced-motion: reduce)').matches?'smooth':'instant'}); }
wheel.addEventListener('scroll',()=>{cancelAnimationFrame(frame);frame=requestAnimationFrame(()=>{const next=Math.max(0,Math.min(COUNT-1,Math.round(wheel.scrollTop/ROW)));if(next!==index){index=next;highlight();}});});
wheel.addEventListener('wheel',e=>{e.preventDefault();select(index+(e.deltaY>0?1:e.deltaY<0?-1:0));},{passive:false});
wheel.addEventListener('keydown',e=>{let next=index;if(e.key==='ArrowUp')next--;else if(e.key==='ArrowDown')next++;else if(e.key==='PageUp')next-=10;else if(e.key==='PageDown')next+=10;else if(e.key==='Home')next=0;else if(e.key==='End')next=COUNT-1;else return;e.preventDefault();select(next);});
$('percent').addEventListener('change',()=>{const p=Number($('percent').value);if(!Number.isFinite(p)||p<5||p>500||p%5!==0){$('percentError').textContent='Enter 5% to 500% in steps of 5.';$('percent').setAttribute('aria-invalid','true');return;}select(p/5-1);});
$('minutes').addEventListener('input',update);$('seconds').addEventListener('input',update);
$('reset').addEventListener('click',()=>select(19,true));
document.querySelectorAll('[data-min]').forEach(b=>b.addEventListener('click',()=>{$('minutes').value=b.dataset.min;$('seconds').value='0';update();}));
select(19);
if('serviceWorker' in navigator && location.protocol!=='file:')navigator.serviceWorker.register('./sw.js').catch(()=>{});



['minutes','seconds'].forEach(id => {
 const input = $(id);
 input.addEventListener('focus', () => input.select());
 input.addEventListener('click', () => input.select());
});
$('seconds').addEventListener('blur', () => {
 if ($('seconds').value.trim() === '') { $('seconds').value = '0'; update(); }
});

// Preserve the centered scroll position when the phone viewport changes.
const wheelFrame = document.querySelector('.wheelFrame');
function resizeWheel() {
 wheel.style.setProperty('--wheel-height', `${wheelFrame.clientHeight}px`);
 wheel.scrollTo({top:index*ROW,behavior:'instant'});
}
new ResizeObserver(resizeWheel).observe(wheelFrame);
resizeWheel();
