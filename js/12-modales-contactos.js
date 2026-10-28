/* ================= MODALES ================= */
function openModal(id){document.getElementById(id).classList.add('on');}
function closeModal(id){document.getElementById(id).classList.remove('on');}
let editingNum=null, infoConv=null;
function openAddContact(){editingNum=null;document.getElementById('cTitle').textContent='Nuevo contacto';document.getElementById('cName').value='';document.getElementById('cNum').value='';document.getElementById('cErr').textContent='';
  document.getElementById('cImport').style.display='block';document.getElementById('cDel').style.display='none';openModal('mContact');}
function openEditContact(c){editingNum=c.number;document.getElementById('cTitle').textContent='Editar contacto';document.getElementById('cName').value=c.name||'';document.getElementById('cNum').value=c.number||'';document.getElementById('cErr').textContent='';
  document.getElementById('cImport').style.display='none';document.getElementById('cDel').style.display='block';openModal('mContact');}
function deleteContact(){if(!editingNum)return;if(!confirm('¿Borrar este contacto?'))return;contacts=contacts.filter(c=>c.number!==editingNum);editingNum=null;saveContacts();closeModal('mContact');renderNewChat();renderList();}
function openInfoCur(){if(cur)openInfo(cur);}
function openInfo(conv){
  infoConv=conv;
  const av=document.getElementById('iAv');av.className='av'+(conv.type==='group'?' grp':'');av.textContent=conv.type==='group'?'👥':initials(conv.title);
  document.getElementById('iName').textContent=conv.title;
  const mem=document.getElementById('iMembers');
  if(conv.type==='group'){
    document.getElementById('iNum').textContent=conv.members.length+' miembros';
    mem.innerHTML='<div class="tag" style="margin:8px 0 2px">Miembros:</div>'+conv.members.map(n=>'<div class="memrow"><span>'+esc(n===ME?'Vos':nameFor(n))+'</span><span class="tag">'+tail(n)+'</span></div>').join('');
    document.getElementById('iEditRow').style.display='none';
    document.getElementById('iVoice').style.display='none';
  }else{
    const num=conv.members.find(n=>n!==ME)||'';
    document.getElementById('iNum').textContent='+'+num;
    const _s=peerSince[num];mem.innerHTML=_s?('<div class="tag" style="margin:10px 0 0">📲 En la app desde '+new Date(+_s).toLocaleDateString('es-AR',{day:'2-digit',month:'2-digit',year:'numeric'})+'</div>'):'';
    document.getElementById('iEditRow').style.display='flex';
    document.getElementById('iVoice').style.display='';
  }
  openModal('mInfo');
}
function infoVideo(){const c=infoConv;closeModal('mInfo');if(c){openChat(c);startCall(c,'video');}}
function infoVoice(){const c=infoConv;closeModal('mInfo');if(c){openChat(c);startCall(c,'audio');}}
function infoEdit(){if(!infoConv)return;const num=infoConv.members.find(n=>n!==ME);const c=contacts.find(x=>x.number===num)||{name:infoConv.title,number:num};closeModal('mInfo');openEditContact(c);}
function infoDelete(){if(!infoConv)return;const num=infoConv.members.find(n=>n!==ME);if(confirm('¿Borrar este contacto?')){contacts=contacts.filter(c=>c.number!==num);saveContacts();}closeModal('mInfo');goHome();}
/* ===== compartir mi número por link (agregame) — anda en iPhone y Android, aunque abran desde WhatsApp ===== */
const APP_VER='v24 · 17-oct';
function exportBackup(){
  const data={v:1,me:ME,contacts,groups};
  const code=btoa(unescape(encodeURIComponent(JSON.stringify(data))));
  try{navigator.clipboard&&navigator.clipboard.writeText(code);}catch(e){}
  prompt('Backup de tus contactos (ya copiado). Guardalo en un mail o nota:',code);
}
function importBackup(){
  const code=prompt('Pegá acá tu backup:');
  if(!code)return;
  try{
    const data=JSON.parse(decodeURIComponent(escape(atob(code.trim()))));
    let add=0;
    (data.contacts||[]).forEach(c=>{ if(c&&c.number&&!contacts.some(x=>x.number===c.number)){contacts.push({name:c.name||c.number,number:c.number});add++;} });
    (data.groups||[]).forEach(g=>{ if(g&&g.name&&!groups.some(x=>x.name===g.name)){groups.push(g);} });
    saveContacts();saveGroups();
    alert('✓ Restaurado: '+add+' contacto(s). Ya los podés usar.');
    goHome();
  }catch(e){ alert('Ese backup no se pudo leer. Copialo completo, sin cortar.'); }
}
function shareMyNumber(){
  if(!ME){alert('Primero poné tu número en Perfil.');return;}
  const url=location.origin+location.pathname+'?add='+encodeURIComponent(ME);
  const txt='Agregame en Starssenger (mensajería cifrada). Tocá este link y me agregás solo:\n'+url;
  if(navigator.share){navigator.share({title:'Starssenger',text:txt}).catch(()=>{});}
  else if(navigator.clipboard&&navigator.clipboard.writeText){navigator.clipboard.writeText(txt).then(()=>alert('Link copiado. Pegalo en WhatsApp y mandáselo.')).catch(()=>prompt('Copiá y mandá este link:',url));}
  else{prompt('Copiá y mandá este link:',url);}
}
function processAddLink(){
  try{
    const num=((new URLSearchParams(location.search)).get('add')||'').replace(/\D/g,'');
    if(num&&num.length>=6&&num!==ME&&!contacts.find(c=>c.number===num)){
      openAddContact();
      document.getElementById('cNum').value=num;
      document.getElementById('cImport').style.display='none';
      document.getElementById('cErr').textContent='Poné un nombre y tocá "Guardar" para agregar este contacto.';
      setTimeout(()=>document.getElementById('cName').focus(),150);
    }
    if(history.replaceState)history.replaceState(null,'',location.origin+location.pathname);
  }catch(e){}
}
function agendaOk(){return ('contacts' in navigator&&'ContactsManager' in window);}
async function importContact(){
  if(!agendaOk()){alert('Este navegador no puede abrir la agenda. En iPhone no se permite; en Android solo funciona en Chrome (no dentro de WhatsApp). Agregá el contacto a mano: Nombre + Número con código de país, y Guardar. Es una sola vez.');return;}
  try{const sel=await navigator.contacts.select(['name','tel'],{multiple:false});
    if(sel&&sel[0]){document.getElementById('cName').value=(sel[0].name&&sel[0].name[0])||'';document.getElementById('cNum').value=((sel[0].tel&&sel[0].tel[0])||'').replace(/\D/g,'');}
  }catch(e){}
}
async function importToNew(){
  if(!agendaOk()){alert('Este navegador no puede abrir la agenda. En iPhone no se permite; en Android solo en Chrome (no dentro de WhatsApp). Tocá "Agregar contacto nuevo" y cargá Nombre + Número con código de país. Una sola vez.');return;}
  try{
    const sel=await navigator.contacts.select(['name','tel'],{multiple:true}); // Android: elegir VARIOS de una
    if(!sel||!sel.length)return;
    let add=0;
    sel.forEach(s=>{
      const name=(s.name&&s.name[0])||'';
      const num=((s.tel&&s.tel[0])||'').replace(/\D/g,'');
      if(!name||num.length<6||num===ME)return;
      const ex=contacts.find(c=>c.number===num); if(ex){ex.name=name;} else {contacts.push({name,number:num});add++;}
    });
    saveContacts();renderNewChat();renderList();
    if(add)alert('Agregué '+add+' contacto'+(add>1?'s':'')+' de tu agenda.');
  }catch(e){}
}
function saveContact(){
  const name=document.getElementById('cName').value.trim();
  const num=document.getElementById('cNum').value.replace(/\D/g,'');
  if(!name||num.length<6){document.getElementById('cErr').textContent='Poné nombre y número completo.';return;}
  if(num===ME){document.getElementById('cErr').textContent='Ese es tu propio número.';return;}
  if(editingNum){
    const other=contacts.find(c=>c.number===num&&c.number!==editingNum);
    if(other){document.getElementById('cErr').textContent='Ya tenés otro contacto con ese número.';return;}
    const c=contacts.find(c=>c.number===editingNum);
    if(c){c.name=name;c.number=num;}else{contacts.push({name,number:num});}
    editingNum=null;
  }else{
    const ex=contacts.find(c=>c.number===num);if(ex)ex.name=name;else contacts.push({name,number:num});
  }
  saveContacts();closeModal('mContact');renderNewChat();renderList();
}
function openNewGroup(){
  if(contacts.length<1){alert('Primero agregá algún contacto.');return;}
  document.getElementById('gName').value='';document.getElementById('gErr').textContent='';
  const pk=document.getElementById('gPick');pk.innerHTML='';
  contacts.forEach((c,i)=>{const d=document.createElement('label');d.className='pick';d.innerHTML='<input type="checkbox" value="'+c.number+'"><div>'+esc(c.name)+' <span class="tag">'+tail(c.number)+'</span></div>';pk.appendChild(d);});
  openModal('mGroup');
}
function saveGroup(){
  let name=document.getElementById('gName').value.trim();
  const members=[...document.querySelectorAll('#gPick input:checked')].map(i=>i.value);
  if(members.length<2){document.getElementById('gErr').textContent='Elegí al menos 2 miembros.';return;}
  if(!name){ let n=1; const used=new Set(groups.map(g=>g.name)); while(used.has('N'+n)) n++; name='N'+n; } // sin nombre -> N1, N2, N3...
  const full=[...new Set([ME,...members])];
  if(!groups.some(g=>room([...new Set([ME,...g.members])])===room(full))){ groups.push({name,members}); saveGroups(); }
  announceGroup(full,name);
  closeModal('mGroup');
  const g=convForGroup({name,members}); renderList(); openChat(g);
}
function announceGroup(members,name){
  (members||[]).filter(n=>n!==ME).forEach(num=>{
    try{const c=getConv([...new Set([ME,num])],nameFor(num),'1'); if(client&&client.connected)client.publish(c.topic,JSON.stringify({from:ME,t:'grp',members:members,name:name}),{qos:1});}catch(e){}
  });
}
function addToChat(){
  if(!cur)return;
  openNewGroup();
  const others=cur.members.filter(n=>n!==ME);
  setTimeout(()=>{
    document.querySelectorAll('#gPick input').forEach(i=>{ if(others.indexOf(i.value)>=0) i.checked=true; });
    if(cur.type==='group'&&cur.title){const gn=document.getElementById('gName'); if(gn&&!gn.value) gn.value=cur.title;}
  },0);
}
