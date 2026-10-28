/* ================= ARRANQUE ================= */
function boot(){
  document.getElementById('lg1').src=LOGO;document.getElementById('lg2').src=LOGO;
  if(!ME){show('onboard');setSec(SECURE);return;}
  rebuildConvs();
  if(!client)startNet();else Object.keys(topicMap).forEach(t=>client.subscribe(t));
  renderList();show('home');processAddLink();
}
document.getElementById('lg1').src=LOGO;document.getElementById('lg2').src=LOGO;
boot();
