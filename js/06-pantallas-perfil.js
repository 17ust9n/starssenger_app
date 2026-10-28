/* ================= PANTALLAS ================= */
function show(id){try{stopMicSafe();}catch(e){}document.querySelectorAll('.screen').forEach(s=>s.classList.remove('on'));document.getElementById(id).classList.add('on');}
function goHome(){
  try{['mContact','mGroup','mInvite','mInfo'].forEach(id=>{const el=document.getElementById(id);if(el)el.classList.remove('on');});}catch(e){}
  try{if(mediaRec&&mediaRec.state==='recording')mediaRec.stop();}catch(e){}
  cur=null;show('home');renderList();
}
function backToList(){goHome();}
function openNewChat(){show('newchat');document.getElementById('ncSearch').value='';renderNewChat();}
function openProfile(){
  document.getElementById('pName').textContent=MYNAME||tail(ME);
  document.getElementById('pNum').textContent=ME?('+'+ME):'';
  document.getElementById('profAv').textContent=MYNAME?initials(MYNAME):'🙂';
  document.getElementById('pBadge').textContent=SECURE?'🛡️ Modo Blindado':'🔓 Modo Normal';
  ensureIdentity().then(()=>{const k=MY_PUB_B64||'';const e=document.getElementById('pKey');if(e)e.textContent=k?(k.slice(0,12)+'…'):'(generando…)';});
  show('profile');
}
function openPEdit(){
  document.getElementById('meName2').value=MYNAME;
  document.getElementById('setNum').value=ME;
  document.getElementById('editAv').textContent=MYNAME?initials(MYNAME):'🙂';
  setSec(SECURE);
  ensureIdentity().then(()=>{const e=document.getElementById('editKey');if(e)e.textContent=MY_PUB_B64||'(generando…)';});
  show('pEdit');
}
function openPSettings(){
  const vt=document.getElementById('verTag');if(vt)vt.textContent='Versión '+APP_VER;
  const bw=LS('sp_tickbw')==='1';const a=document.getElementById('tkCol'),b=document.getElementById('tkBw');if(a)a.classList.toggle('act',!bw);if(b)b.classList.toggle('act',bw);
  show('pSettings');
}
function openPCalls(){renderCalls();show('pCalls');}
function openPAbout(){const s=document.getElementById('aboutSrv');if(s)s.textContent=(client&&client.connected)?'Conectado':'Desconectado';const v=document.getElementById('aboutVer');if(v)v.textContent='Versión '+APP_VER;show('pAbout');}
function openPTerms(){show('pTerms');}
function copyMyKey(){ensureIdentity().then(()=>{const k=MY_PUB_B64||'';if(!k)return;try{navigator.clipboard.writeText(k);}catch(e){}alert('Clave pública copiada.');});}
function renderCalls(){
  const el=document.getElementById('callsBox');el.innerHTML='';
  let log=[];try{log=JSON.parse(LS('sp_calls')||'[]');}catch(e){}
  if(!log.length){el.innerHTML='<div class="tag" style="padding:30px 10px;text-align:center">Todavía no hay llamadas.</div>';return;}
  log.slice().reverse().forEach(c=>{
    const d=new Date(c.ts);const hhmm=(''+d.getHours()).padStart(2,'0')+':'+(''+d.getMinutes()).padStart(2,'0');
    const fecha=d.toLocaleDateString('es-AR')+' · '+hhmm;
    const row=document.createElement('div');row.className='callrow';
    row.innerHTML='<div class="cav">'+(c.mode==='audio'?'📞':'🎥')+'</div><div class="cmid"><b>'+esc(c.name)+'</b><div class="cn">'+esc(c.number)+'</div><div class="cd">'+fecha+' · '+(c.mode==='audio'?'Llamada':'Videollamada')+' '+esc(c.type)+'</div></div>';
    el.appendChild(row);
  });
}
function logCall(conv,type,mode){
  try{let log=[];try{log=JSON.parse(LS('sp_calls')||'[]');}catch(e){}
    const num=conv.type==='group'?'grupo':(conv.members.find(x=>x!==ME)||'');
    log.push({name:conv.title,number:num,ts:Date.now(),type,mode:mode||'video'});
    while(log.length>100)log.shift();
    localStorage.setItem('sp_calls',JSON.stringify(log));
  }catch(e){}
}
function setTickColor(bw){try{localStorage.setItem('sp_tickbw',bw?'1':'0');}catch(e){}const a=document.getElementById('tkCol'),b=document.getElementById('tkBw');if(a)a.classList.toggle('act',!bw);if(b)b.classList.toggle('act',bw);try{if(cur)renderChat();}catch(e){}}
async function resetApp(){
  // limpia lo tecnico (service worker + cache) y recarga la ultima version. NO borra numero ni contactos.
  if(!confirm('Restablecer y actualizar?\nMantiene tu numero y contactos. Solo limpia y baja la ultima version.'))return;
  try{ if('serviceWorker' in navigator){ const rs=await navigator.serviceWorker.getRegistrations(); for(const r of rs){ try{await r.unregister();}catch(e){} } } }catch(e){}
  try{ if(window.caches){ const ks=await caches.keys(); for(const k of ks){ try{await caches.delete(k);}catch(e){} } } }catch(e){}
  try{ location.reload(true); }catch(e){ location.reload(); }
}
async function wipeApp(){
  // BORRA TODO de este telefono: numero, contactos, mensajes, claves. Boton de seguridad.
  if(!confirm('BORRAR TODO?\nSe elimina tu numero, contactos y mensajes de ESTE telefono.\nNo se puede deshacer.'))return;
  if(!confirm('Seguro? La app queda vacia, como nueva.'))return;
  try{ localStorage.clear(); }catch(e){}
  try{ if(window.caches){ const ks=await caches.keys(); for(const k of ks){ try{await caches.delete(k);}catch(e){} } } }catch(e){}
  try{ if('serviceWorker' in navigator){ const rs=await navigator.serviceWorker.getRegistrations(); for(const r of rs){ try{await r.unregister();}catch(e){} } } }catch(e){}
  try{ location.reload(true); }catch(e){ location.reload(); }
}
function filterHit(name,q){return !q||(name||'').toLowerCase().indexOf(q)>=0;}
function renderList(){
  const q=(document.getElementById('homeSearch').value||'').trim().toLowerCase();
  const items=[];
  contacts.forEach(c=>{const cv=convForContact(c);items.push({cv,type:'1'});});
  groups.forEach(g=>{const cv=convForGroup(g);items.push({cv,type:'group'});});
  items.sort((a,b)=>b.cv.lastTs-a.cv.lastTs);
  const el=document.getElementById('list');el.innerHTML='';
  if(!items.length){el.innerHTML='<div class="empty">Todavía no tenés chats.<br>Tocá el lápiz ✏️ de abajo para empezar uno.</div>';return;}
  const vis=items.filter(it=>filterHit(it.cv.title,q));
  if(!vis.length){el.innerHTML='<div class="empty">Nadie con ese nombre.</div>';return;}
  for(const {cv,type} of vis){
    const last=cv.messages[cv.messages.length-1];
    const body=last?(last.audio?'🎤 Mensaje de voz':last.text):'';
    const prev=last?((last.mine?'Vos: ':(type==='group'?nameFor(last.from)+': ':''))+body):'Tocá para chatear o llamar';
    const row=document.createElement('div');row.className='row';row.onclick=()=>openChat(cv);
    row.innerHTML='<div class="av'+(type==='group'?' grp':'')+'">'+(type==='group'?'👥':initials(cv.title))+'</div>'+
      '<div class="rmid"><div class="rname">'+esc(cv.title)+'</div><div class="rprev">'+esc(prev)+'</div></div>'+
      '<div class="rright">'+(last?'<div class="rtime">'+timeStr(last.ts)+'</div>':'')+(cv.unread?'<div class="badge">'+cv.unread+'</div>':'')+'</div>';
    el.appendChild(row);
  }
}
function renderNewChat(){
  const q=(document.getElementById('ncSearch').value||'').trim().toLowerCase();
  const el=document.getElementById('ncList');el.innerHTML='';
  if(!contacts.length){el.innerHTML='<div class="empty">Todavía no cargaste contactos.<br>Tocá "Agregar contacto nuevo".</div>';return;}
  const vis=contacts.filter(c=>filterHit(c.name,q));
  if(!vis.length){el.innerHTML='<div class="empty">Nadie con ese nombre.</div>';return;}
  vis.forEach(c=>{
    const cv=convForContact(c);
    const row=document.createElement('div');row.className='row';row.onclick=()=>openChat(cv);
    row.innerHTML='<div class="av">'+initials(c.name)+'</div>'+
      '<div class="rmid"><div class="rname">'+esc(c.name)+'</div><div class="rprev">'+esc(tail(c.number))+'</div></div>';
    el.appendChild(row);
  });
}
function esc(s){return (s+'').replace(/[&<>]/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;'}[m]));}
