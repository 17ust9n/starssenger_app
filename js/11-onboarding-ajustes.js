/* ================= ONBOARDING / AJUSTES ================= */
function setSec(x){SECURE=x;
  document.getElementById('sOff').classList.toggle('act',x===0);document.getElementById('sOn').classList.toggle('act',x===1);
  document.getElementById('sOff2').classList.toggle('act',x===0);document.getElementById('sOn2').classList.toggle('act',x===1);
}
function saveMe(){
  const n=document.getElementById('me').value.replace(/\D/g,'');
  if(n.length<6){document.getElementById('oerr').textContent='Poné tu número completo con código de país.';return;}
  ME=n;localStorage.setItem('sp_me',ME);localStorage.setItem('sp_secure',SECURE?'1':'0');
  const _nm=(document.getElementById('meName')?document.getElementById('meName').value:'').trim();if(_nm){MYNAME=_nm;try{localStorage.setItem('sp_myname',_nm);}catch(e){}}
  askNotif();
  boot();
}
function saveProfile(){
  const n=document.getElementById('setNum').value.replace(/\D/g,'');
  if(n.length<6){alert('Poné tu número completo con código de país.');return;}
  const wasSecure=LS('sp_secure')==='1';
  ME=n;localStorage.setItem('sp_me',ME);localStorage.setItem('sp_secure',SECURE?'1':'0');
  {const _nm=(document.getElementById('meName2')?document.getElementById('meName2').value:'').trim();MYNAME=_nm;try{localStorage.setItem('sp_myname',_nm);}catch(e){}}
  if(SECURE&&!wasSecure){ // limpiar rastro guardado
    Object.keys(localStorage).filter(k=>k.startsWith('sp_msgs_')||k.startsWith('sp_off_')).forEach(k=>localStorage.removeItem(k));
  }
  location.reload();
}
