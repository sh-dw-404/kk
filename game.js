'use strict';
(function(){
  const canvas=document.getElementById('space'),ctx=canvas.getContext('2d',{alpha:false});
  const start=document.getElementById('start'),startBtn=document.getElementById('startBtn'),installBtn=document.getElementById('installBtn');
  const loading=document.getElementById('loading'),objective=document.getElementById('objective'),locationEl=document.getElementById('location'),progressEl=document.getElementById('progress'),message=document.getElementById('message');
  const joystick=document.getElementById('joystick'),stick=document.getElementById('stick'),giftBtn=document.getElementById('gift'),interactBtn=document.getElementById('interact');
  let W=0,H=0,DPR=1,running=false,last=0,time=0,installPrompt=null,finalShown=false;
  const player={x:0,y:0,speed:2.7,angle:0};
  const world={w:3600,h:3600};
  const keys={x:0,y:0};
  const stars=[]; const trees=[]; const petals=[]; const collectibles=[{x:680,y:540,type:'flower',got:false},{x:2820,y:720,type:'chocolate',got:false},{x:2490,y:2860,type:'letter',got:false}];
  const rand=(a,b)=>a+Math.random()*(b-a), clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
  function resize(){W=innerWidth;H=innerHeight;DPR=Math.min(devicePixelRatio||1,2);canvas.width=Math.floor(W*DPR);canvas.height=Math.floor(H*DPR);canvas.style.width=W+'px';canvas.style.height=H+'px';ctx.setTransform(DPR,0,0,DPR,0,0);}
  addEventListener('resize',resize,{passive:true}); resize();
  for(let i=0;i<420;i++)stars.push({x:rand(0,world.w),y:rand(0,world.h),r:rand(.4,2.2),a:rand(.25,1)});
  for(let i=0;i<80;i++)trees.push({x:rand(100,world.w-100),y:rand(100,world.h-100),s:rand(.7,1.4)});
  for(let i=0;i<70;i++)petals.push({a:rand(0,Math.PI*2),r:rand(0,130),v:rand(.2,.7)});
  function say(text,ms=2300){message.textContent=text;message.classList.add('show');clearTimeout(say.t);say.t=setTimeout(()=>message.classList.remove('show'),ms)}
  function zone(){const x=player.x,y=player.y;if(Math.hypot(x-1800,y-1800)<430)return ['PATNA','Find the glowing garden and collect the letter.'];if(x<1200&&y<1200)return ['INDORE','The first gift is somewhere among the flowers.'];if(x>2300&&y<1300)return ['CAFÉ DISTRICT','A sweet surprise is waiting nearby.'];return ['INDIA','Explore the paths. The universe is bigger than it looks.']}
  function reset(){player.x=1800;player.y=2500;keys.x=keys.y=0;collectibles.forEach(c=>c.got=false);progressEl.textContent='0 / 3';objective.textContent='Move with the joystick. Explore until you find the glowing garden.';finalShown=false}
  function begin(){loading.classList.add('show');startBtn.disabled=true;setTimeout(()=>{reset();running=true;start.classList.add('hidden');loading.classList.remove('show');last=performance.now();requestAnimationFrame(loop)},450)}
  startBtn.addEventListener('click',begin);
  giftBtn.addEventListener('click',()=>say('You are carrying a little birthday gift. Keep exploring.'));
  interactBtn.addEventListener('click',()=>interact());
  function interact(){let nearest=null,dist=1e9;for(const c of collectibles){const d=Math.hypot(player.x-c.x,player.y-c.y);if(!c.got&&d<dist){dist=d;nearest=c}}if(nearest&&dist<170){nearest.got=true;const n=collectibles.filter(c=>c.got).length;progressEl.textContent=n+' / 3';if(n===3){objective.textContent='All three memories collected. Take them to the glowing garden.';say('You found all three surprises. Go to the garden.',3200)}else{say(nearest.type==='flower'?'A flower for her.':nearest.type==='chocolate'?'A little chocolate.':'A letter with a secret.');}}else{say('Nothing to collect here yet.');}}
  let touchId=null;
  joystick.addEventListener('pointerdown',e=>{touchId=e.pointerId;joystick.setPointerCapture(touchId);moveStick(e);});
  joystick.addEventListener('pointermove',e=>{if(e.pointerId===touchId)moveStick(e)});
  joystick.addEventListener('pointerup',releaseStick);joystick.addEventListener('pointercancel',releaseStick);
  function moveStick(e){const r=joystick.getBoundingClientRect(),cx=r.left+r.width/2,cy=r.top+r.height/2;let dx=e.clientX-cx,dy=e.clientY-cy;const max=34,d=Math.hypot(dx,dy);if(d>max){dx*=max/d;dy*=max/d}stick.style.transform=`translate(${dx}px,${dy}px)`;keys.x=dx/max;keys.y=dy/max}
  function releaseStick(){touchId=null;keys.x=keys.y=0;stick.style.transform='translate(0,0)'}
  addEventListener('keydown',e=>{if(e.key==='ArrowLeft'||e.key==='a')keys.x=-1;if(e.key==='ArrowRight'||e.key==='d')keys.x=1;if(e.key==='ArrowUp'||e.key==='w')keys.y=-1;if(e.key==='ArrowDown'||e.key==='s')keys.y=1;if(e.key===' '){e.preventDefault();interact()}});
  addEventListener('keyup',e=>{if(['ArrowLeft','a','ArrowRight','d'].includes(e.key))keys.x=0;if(['ArrowUp','w','ArrowDown','s'].includes(e.key))keys.y=0});
  function draw(){ctx.fillStyle='#050612';ctx.fillRect(0,0,W,H);const scale=Math.min(W/850,H/850);const camX=clamp(player.x-W/(2*scale),0,world.w-W/scale),camY=clamp(player.y-H/(2*scale),0,world.h-H/scale);ctx.save();ctx.scale(scale,scale);ctx.translate(-camX,-camY);
    const g=ctx.createRadialGradient(1800,1800,80,1800,1800,1600);g.addColorStop(0,'#1b2052');g.addColorStop(.45,'#0c1030');g.addColorStop(1,'#050612');ctx.fillStyle=g;ctx.fillRect(0,0,world.w,world.h);
    for(const s of stars){ctx.globalAlpha=s.a*(.55+.45*Math.sin(time*.001+s.x));ctx.fillStyle='#fff';ctx.beginPath();ctx.arc(s.x,s.y,s.r,0,Math.PI*2);ctx.fill()}ctx.globalAlpha=1;
    // roads
    ctx.strokeStyle='rgba(255,255,255,.06)';ctx.lineWidth=75;ctx.beginPath();ctx.moveTo(0,1800);ctx.lineTo(world.w,1800);ctx.moveTo(1800,0);ctx.lineTo(1800,world.h);ctx.stroke();
    // trees
    for(const t of trees){ctx.fillStyle='#102d30';ctx.beginPath();ctx.arc(t.x,t.y,25*t.s,0,Math.PI*2);ctx.fill();ctx.fillStyle='#194d47';ctx.beginPath();ctx.arc(t.x-8*t.s,t.y-10*t.s,17*t.s,0,Math.PI*2);ctx.fill()}
    // landmarks
    landmark(550,600,'INDORE GARDEN','#ff8fb8');landmark(2800,700,'CAFÉ','#f5c36a');landmark(1800,1800,'PATNA GARDEN','#9fdcff');landmark(2500,2850,'LETTER','#c58cff');
    // collectibles
    for(const c of collectibles)if(!c.got){ctx.shadowBlur=25;ctx.shadowColor='#ff9abb';ctx.fillStyle='#ff9abb';ctx.beginPath();ctx.arc(c.x,c.y,10+3*Math.sin(time*.006+c.x),0,Math.PI*2);ctx.fill();ctx.shadowBlur=0}
    // garden center
    ctx.fillStyle='rgba(255,150,190,.1)';ctx.beginPath();ctx.arc(1800,1800,280,0,Math.PI*2);ctx.fill();for(const p of petals){const a=p.a+time*.0003*p.v;const x=1800+Math.cos(a)*p.r,y=1800+Math.sin(a)*p.r;ctx.fillStyle='rgba(255,180,215,.55)';ctx.beginPath();ctx.arc(x,y,4,0,Math.PI*2);ctx.fill()}
    // player
    drawPerson(player.x,player.y,player.angle,'#73d8ff');
    const handX=player.x+Math.cos(player.angle-Math.PI/2)*24, handY=player.y+Math.sin(player.angle-Math.PI/2)*24;
    const partnerX=player.x+Math.cos(player.angle-Math.PI/2)*62, partnerY=player.y+Math.sin(player.angle-Math.PI/2)*62;
    ctx.strokeStyle='rgba(255,190,215,.85)';ctx.lineWidth=5;ctx.beginPath();ctx.moveTo(handX,handY);ctx.lineTo(partnerX-Math.cos(player.angle-Math.PI/2)*10,partnerY-Math.sin(player.angle-Math.PI/2)*10);ctx.stroke();
    drawPerson(partnerX,partnerY,player.angle,'#ff9bc2');
    ctx.restore();
    const z=zone();locationEl.textContent=z[0];if(progressEl.textContent==='3 / 3'&&Math.hypot(player.x-1800,player.y-1800)<300){objective.textContent='You made it. The final birthday message is waiting.';if(!finalShown){finalShown=true;say('Happy Birthday. This little universe is yours.',5000)}}else if(running&&objective.textContent.includes('Move'))objective.textContent=z[1];
  }
  function landmark(x,y,label,accent){ctx.fillStyle='rgba(8,10,25,.8)';ctx.fillRect(x-115,y-45,230,90);ctx.strokeStyle=accent;ctx.lineWidth=3;ctx.strokeRect(x-115,y-45,230,90);ctx.fillStyle='#fff';ctx.font='bold 26px system-ui';ctx.textAlign='center';ctx.fillText(label,x,y+8);ctx.font='14px system-ui';ctx.fillStyle='#aaa';ctx.fillText('EXPLORE',x,y+30)}
  function drawPerson(x,y,a,accent){ctx.save();ctx.translate(x,y);ctx.rotate(a);ctx.shadowBlur=18;ctx.shadowColor=accent;ctx.fillStyle=accent;ctx.beginPath();ctx.arc(0,-18,11,0,Math.PI*2);ctx.fill();ctx.shadowBlur=0;ctx.fillStyle='#f2d0b0';ctx.beginPath();ctx.arc(0,-28,7,0,Math.PI*2);ctx.fill();ctx.strokeStyle='#fff';ctx.lineWidth=4;ctx.beginPath();ctx.moveTo(0,-6);ctx.lineTo(0,20);ctx.moveTo(0,0);ctx.lineTo(25,8);ctx.stroke();ctx.restore()}
  function update(dt){const len=Math.hypot(keys.x,keys.y);if(len>.05){const x=keys.x/Math.max(1,len),y=keys.y/Math.max(1,len);player.x=clamp(player.x+x*player.speed*dt,40,world.w-40);player.y=clamp(player.y+y*player.speed*dt,40,world.h-40);player.angle=Math.atan2(y,x)+Math.PI/2}}
  function loop(now){if(!running)return;const dt=Math.min((now-last)/16.67,2);last=now;time=now;update(dt);draw();requestAnimationFrame(loop)}
  addEventListener('beforeinstallprompt',e=>{e.preventDefault();installPrompt=e;installBtn.style.display='block'});
  installBtn.addEventListener('click',async()=>{if(!installPrompt)return;installPrompt.prompt();await installPrompt.userChoice;installPrompt=null;installBtn.style.display='none'});
  if('serviceWorker' in navigator && location.protocol!=='file:'){navigator.serviceWorker.register('./sw.js').catch(()=>{})}
  window.addEventListener('error',e=>{if(!running){loading.classList.remove('show');startBtn.disabled=false;} console.error(e.error||e.message)});
})();
