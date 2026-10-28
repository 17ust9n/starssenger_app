/* ================= CONVERSACIONES ================= */
function getConv(members,title,type){
  const topic=room(members);
  if(!convs[topic]){
    const offKey='sp_off_'+members.slice().sort().join('_')+'_'+ME;
    const off=SECURE?(Math.floor(Math.random()*1e9)+1e6):parseInt(LS(offKey)||'0',10);
    const msgs=SECURE?[]:JSON.parse(LS('sp_msgs_'+topic)||'[]');
    let kb=0;msgs.forEach(m=>kb+=8*(m.bytes||(m.text?utf8bytes(m.text).length:0)));
    convs[topic]={topic,title,members,type,messages:msgs,offOut:off,offKey,unread:0,lastTs:msgs.length?msgs[msgs.length-1].ts:0,keybits:kb,rate:0};
    topicMap[topic]=convs[topic];
    if(client&&client.connected)client.subscribe(topic);
  }else{convs[topic].title=title;convs[topic].members=members;}
  return convs[topic];
}
function convForContact(c){return getConv([...new Set([ME,c.number])],c.name,'1');}
function convForGroup(g){return getConv([...new Set([ME,...g.members])],g.name,'group');}
function rebuildConvs(){contacts.forEach(convForContact);groups.forEach(convForGroup);}
