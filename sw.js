self.addEventListener('install', e => self.skipWaiting());
self.addEventListener('activate', e => e.waitUntil(self.clients.claim()));
self.addEventListener('push', function(e){
  let d={title:'Starssenger',body:'Nuevo mensaje',tag:'sp-msg'};
  try{ if(e.data) d=Object.assign(d, e.data.json()); }catch(err){}
  e.waitUntil(
    self.clients.matchAll({type:'window',includeUncontrolled:true}).then(function(cl){
      for(const c of cl){ if(c.visibilityState==='visible') return; }   // app abierta y adelante: no tapar con banner
      return self.registration.showNotification(d.title, {body:d.body, tag:d.tag, renotify:true, icon:'icon-192.png', badge:'icon-192.png', vibrate:[200,100,200], data:{url:'./'}});
    })
  );
});
self.addEventListener('notificationclick', function(e){
  e.notification.close();
  e.waitUntil(clients.matchAll({type:'window',includeUncontrolled:true}).then(function(cl){ for(const c of cl){ if('focus' in c) return c.focus(); } if(clients.openWindow) return clients.openWindow('./'); }));
});
