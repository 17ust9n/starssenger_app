/* ================= TRANSPORTE ================= */
function startNet(){
  let CID=localStorage.getItem('sp_cid'); if(!CID){CID='sp_'+Math.random().toString(16).slice(2)+Math.random().toString(16).slice(2);try{localStorage.setItem('sp_cid',CID);}catch(e){}}
  client=mqtt.connect('wss://broker.emqx.io:8084/mqtt',{clientId:CID,clean:false,keepalive:30,reconnectPeriod:2000});
  client.on('connect',()=>{document.getElementById('dot').classList.add('on');Object.keys(topicMap).forEach(t=>client.subscribe(t,{qos:1}));ensureIdentity().then(()=>Object.keys(topicMap).forEach(t=>announcePK(t)));announcePushAll();initPush();});
  client.on('message',(t,p)=>{
    let m;try{m=JSON.parse(p.toString());}catch(e){return;}
    if(m.from===ME)return;
    if(callRoom&&t===callRoom){vsig(m);return;}       // señalización de la llamada activa
    const conv=topicMap[t];if(!conv)return;
    if(m.t==='msg'){
      const text=dec(m.ct,keyIn(conv.members,m.from,m.k),m.off);
      pushMsg(conv,{id:m.id,from:m.from,text,mine:false,ts:Date.now(),bytes:m.ct.length});
      try{if(client)client.publish(conv.topic,JSON.stringify({from:ME,t:'ack',id:m.id,st:(conv===cur&&!document.hidden)?'read':'delivered'}));}catch(e){}
      addKeys(conv,m.ct.length);
      if(conv!==cur){conv.unread++;}
      renderList(); avisarMensaje(nameFor(m.from),text);
    }else if(m.t==='audio'){
      const raw=decBytes(b64ToBytes(m.b64),keyIn(conv.members,m.from,m.k),m.off);
      const url=URL.createObjectURL(new Blob([raw],{type:m.mime||'audio/webm'}));
      pushMsg(conv,{id:m.id,from:m.from,audio:url,dur:m.dur,rate:m.rate,mine:false,ts:Date.now(),bytes:raw.length});
      try{if(client)client.publish(conv.topic,JSON.stringify({from:ME,t:'ack',id:m.id,st:(conv===cur&&!document.hidden)?'read':'delivered'}));}catch(e){}
      addKeys(conv,raw.length,m.rate);
      if(conv!==cur){conv.unread++;}
      renderList(); avisarMensaje(nameFor(m.from),'🎤 Mensaje de voz');
    }else if(m.t==='img'){
      const raw=decBytes(b64ToBytes(m.b64),keyIn(conv.members,m.from,m.k),m.off);
      const url=URL.createObjectURL(new Blob([raw],{type:m.mime||'image/jpeg'}));
      pushMsg(conv,{id:m.id,from:m.from,img:url,mine:false,ts:Date.now(),bytes:raw.length});
      try{if(client)client.publish(conv.topic,JSON.stringify({from:ME,t:'ack',id:m.id,st:(conv===cur&&!document.hidden)?'read':'delivered'}));}catch(e){}
      addKeys(conv,raw.length);
      if(conv!==cur){conv.unread++;}
      renderList(); avisarMensaje(nameFor(m.from),'📷 Foto');
    }else if(m.t==='push'){if(m.sub)peerPush[m.from]=m.sub;if(m.since)peerSince[m.from]=m.since;if(m.nm)callNames[m.from]=m.nm;
    }else if(m.t==='del'){removeMsgById(conv,m.id);
    }else if(m.t==='edit'){try{applyEdit(conv,m.id,dec(m.ct,keyIn(conv.members,m.from,m.k),m.off));}catch(e){}
    }else if(m.t==='ack'){ackState(conv,m.id,m.st,m.all);
    }else if(m.t==='pk'){const had=!!peerSS[m.from];onPeerPub(m.from,m.pub);if(!had&&client)client.publish(t,JSON.stringify({from:ME,t:'pk',pub:MY_PUB_B64}),{retain:true});}else if(m.t==='invite'){incomingInvite(conv,m);}else if(m.t==='grp'){if(m.members&&m.name){const others=m.members.filter(x=>x!==ME);if(others.length>=2&&!groups.some(g=>room([...new Set([ME,...g.members])])===room(m.members))){groups.push({name:m.name,members:others});saveGroups();convForGroup({name:m.name,members:others});renderList();}}}
    else if(m.t==='invite-cancel'){if(m.room)handledRooms.add(m.room);stopRing();if(pendingCall&&pendingCall.room===m.room){pendingCall=null;document.getElementById('incall').style.display='none';}}
  });
  client.on('error',()=>{document.getElementById('dot').classList.remove('on');});
}
