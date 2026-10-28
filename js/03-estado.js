/* ================= ESTADO ================= */
// (el LOGO base64 está en 00-logo.js)
const LS=k=>localStorage.getItem(k);
let ME=LS('sp_me')||"";
let SECURE=(LS('sp_secure')==='1')?1:0;
let contacts=JSON.parse(LS('sp_contacts')||'[]');   // {name,number}
let groups=JSON.parse(LS('sp_groups')||'[]');       // {name,members:[...]}
const convs={};      // topic -> conv
const topicMap={};   // topic -> conv (para enrutar mensajes entrantes)
let cur=null;        // conversación abierta
let client=null;
let MYNAME=LS('sp_myname')||'';
let MYSINCE=LS('sp_since');if(!MYSINCE){MYSINCE=String(Date.now());try{localStorage.setItem('sp_since',MYSINCE);}catch(e){}}
const callNames={};const peerSince={};
function dispName(num){return callNames[num]||nameFor(num);}
