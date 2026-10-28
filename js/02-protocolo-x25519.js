/* ===== X25519: intercambio de clave real (secreto NO derivable de los numeros) — agregado a pedido de Marito ===== */
let MY_PRIV=null, MY_PUB_B64=null; const peerSS={};
async function ensureIdentity(){
  if(MY_PRIV)return;
  try{
    const st=localStorage.getItem('sp_x25519');
    if(st){const o=JSON.parse(st);MY_PRIV=await crypto.subtle.importKey('jwk',o.priv,{name:'X25519'},true,['deriveBits']);MY_PUB_B64=o.pub;}
    else{const kp=await crypto.subtle.generateKey({name:'X25519'},true,['deriveBits']);
      const jwk=await crypto.subtle.exportKey('jwk',kp.privateKey);
      const raw=new Uint8Array(await crypto.subtle.exportKey('raw',kp.publicKey));
      MY_PRIV=kp.privateKey;MY_PUB_B64=btoa(String.fromCharCode.apply(null,raw));
      try{localStorage.setItem('sp_x25519',JSON.stringify({priv:jwk,pub:MY_PUB_B64}));}catch(e){}}
  }catch(e){}
}
async function onPeerPub(from,pubB64){
  try{ if(!MY_PRIV){await ensureIdentity();} if(!MY_PRIV||!pubB64)return;
    const raw=Uint8Array.from(atob(pubB64),c=>c.charCodeAt(0));
    const pk=await crypto.subtle.importKey('raw',raw,{name:'X25519'},true,[]);
    peerSS[from]=new Uint8Array(await crypto.subtle.deriveBits({name:'X25519',public:pk},MY_PRIV,256));
    for(const k in seedCache)delete seedCache[k];
    try{updateKeyStat&&updateKeyStat();}catch(e){}
  }catch(e){}
}
function pairSecret(mem){ if(mem.length!==2)return null; const other=mem.find(x=>x!==ME); return peerSS[other]||null; }
function bitsOfBytes(u8){const b=[];for(const x of u8)b.push(...d2b(x));return b;}
function seedFromShared(ss,who){return b2dMSB(mf(bitsOfBytes(ss).concat(eybStr(who)),8));}
const USE_X25519=false; // capa extra de clave pública: apagada para que el texto SIEMPRE abra (no se rompe al cambiar de navegador). La clave sale de los números.
function keyOut(mem){const ss=USE_X25519?pairSecret(mem):null;return ss?{seed:seedFromShared(ss,ME),k:1}:{seed:senderSeed(mem,ME),k:0};}
function keyIn(mem,who,flag){const ss=(flag&&USE_X25519)?pairSecret(mem):null;return ss?seedFromShared(ss,who):senderSeed(mem,who);}
function announcePK(topic){ if(client&&MY_PUB_B64)client.publish(topic,JSON.stringify({from:ME,t:'pk',pub:MY_PUB_B64}),{retain:true}); }
function rowsK(seed,off,L){return fibo1(seed,off+L).slice(off);}
function enc(msg,seed,off){const V=utf8bytes(msg);const K=keystream(seed,off,V.length);return V.map((v,i)=>v^K[i]);}
function dec(ct,seed,off){const K=keystream(seed,off,ct.length);try{return bytesToStr(ct.map((v,i)=>v^K[i]));}catch(e){return "(?)";}}
/* cifrado de bytes (para la voz) — mismo keystream */
function encBytes(bytes,seed,off){const K=keystream(seed,off,bytes.length);const out=new Uint8Array(bytes.length);for(let i=0;i<bytes.length;i++)out[i]=bytes[i]^K[i];return out;}
function decBytes(ct,seed,off){return encBytes(ct,seed,off);}
function bytesToB64(b){let s='';const CH=0x8000;for(let i=0;i<b.length;i+=CH)s+=String.fromCharCode.apply(null,b.subarray(i,i+CH));return btoa(s);}
function b64ToBytes(s){const bin=atob(s);const b=new Uint8Array(bin.length);for(let i=0;i<bin.length;i++)b[i]=bin.charCodeAt(i);return b;}
