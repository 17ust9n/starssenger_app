/* ================= HELPERS ================= */
function tail(n){return "…"+n.slice(-4);}
function initials(name){const p=name.trim().split(/\s+/);return ((p[0]||'?')[0]+(p[1]?p[1][0]:'')).toUpperCase();}
function timeStr(ts){const d=new Date(ts);return d.getHours().toString().padStart(2,'0')+':'+d.getMinutes().toString().padStart(2,'0');}
function room(mem){let h=5381;for(const c of mem.slice().sort().join('|'))h=((h<<5)+h+c.charCodeAt(0))>>>0;return "starssenger/"+h.toString(36);}
function nameFor(num){const c=contacts.find(c=>c.number===num);return c?c.name:tail(num);}
function saveContacts(){try{localStorage.setItem('sp_contacts',JSON.stringify(contacts));}catch(e){}}  // los contactos SIEMPRE se guardan (aun en Blindado)
function saveGroups(){try{localStorage.setItem('sp_groups',JSON.stringify(groups));}catch(e){}}
function persistMsgs(conv){if(!SECURE)localStorage.setItem('sp_msgs_'+conv.topic,JSON.stringify(conv.messages.filter(m=>!m.audio)));}
