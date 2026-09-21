const SUPABASE_URL="https://nzaazskskltxymloejft.supabase.co";
const SUPABASE_KEY="sb_publishable_p9a6zgEwrYnY99nsxdB7Mw_564Y4Rfj";
const sb=window.supabase?window.supabase.createClient(SUPABASE_URL,SUPABASE_KEY):null;

const pages=document.querySelectorAll(".page");const navButtons=document.querySelectorAll("nav button");
function go(pageId){pages.forEach(page=>page.classList.toggle("active",page.id===pageId));navButtons.forEach(button=>button.classList.toggle("on",button.dataset.page===pageId));window.scrollTo(0,0);if(pageId==="takip"&&sb){sb.auth.getUser().then(({data:{user}})=>loadApplication(user));}if(pageId==="admin"&&sb){loadAdminPanel();}if(pageId==="profil"&&sb){sb.auth.getUser().then(({data:{user}})=>{if(user){loadProfile();loadDocuments();}});}if(pageId==="basvuru"&&sb){loadProfileIntoApplication();}}
navButtons.forEach(button=>button.addEventListener("click",()=>go(button.dataset.page)));

const professions={
pflege:{title:"Pflegefachfrau / Pflegefachmann",desc:"Hastaneler, bakım merkezleri ve sağlık kuruluşlarında insanlara profesyonel bakım ve destek sunulan bir Ausbildung alanı.",duration:"Genellikle 3 yıl",language:"İşveren ve eyalete göre değişir",pay:"Kuruma ve toplu sözleşmeye göre değişir"},
kfz:{title:"Kfz-Mechatroniker/in",desc:"Araçların mekanik, elektronik ve dijital sistemlerinin bakım, arıza tespiti ve onarımı üzerine teknik bir Ausbildung.",duration:"Genellikle 3,5 yıl",language:"İşveren şartına göre değişir",pay:"İşveren ve eğitim yılına göre değişir"},
elektronik:{title:"Elektroniker/in",desc:"Elektrik sistemlerinin kurulumu, bakımı ve arıza giderme süreçlerinde çalışılan teknik bir meslek alanı.",duration:"Genellikle 3,5 yıl",language:"İşveren şartına göre değişir",pay:"Alan, işveren ve eğitim yılına göre değişir"},
hotel:{title:"Hotelfachfrau / Hotelfachmann",desc:"Otel işletmesinde misafir hizmetleri, rezervasyon, organizasyon ve farklı operasyon alanlarını kapsayan bir Ausbildung.",duration:"Genellikle 3 yıl",language:"Yoğun iletişim nedeniyle işveren şartı önemlidir",pay:"İşveren ve eğitim yılına göre değişir"},
lager:{title:"Fachkraft für Lagerlogistik",desc:"Ürün kabulü, depolama, sevkiyat hazırlığı ve lojistik süreçlerin düzenlenmesini kapsayan bir Ausbildung.",duration:"Genellikle 3 yıl",language:"İşveren şartına göre değişir",pay:"İşveren ve eğitim yılına göre değişir"},
anlagen:{title:"Anlagenmechaniker/in SHK",desc:"Isıtma, sıhhi tesisat ve iklimlendirme sistemlerinin kurulumu, bakımı ve onarımına odaklanan teknik Ausbildung.",duration:"Genellikle 3,5 yıl",language:"İşveren şartına göre değişir",pay:"İşveren ve eğitim yılına göre değişir"}};

function showProfession(key){const p=professions[key];const box=document.getElementById("profession-detail");if(!p||!box)return;box.hidden=false;box.innerHTML=`<div class="detail-top"><div><span class="eyebrow" style="color:var(--teal)">MESLEK DETAYI</span><h2>${p.title}</h2><p>${p.desc}</p></div><button class="detail-close" onclick="closeProfession()" aria-label="Kapat">×</button></div><div class="detail-facts"><div><small>Ausbildung süresi</small><b>${p.duration}</b></div><div><small>Almanca</small><b>${p.language}</b></div><div><small>Ausbildungsvergütung</small><b>${p.pay}</b></div></div><p class="detail-note">Kesin şartlar ve ücretler ilan, işveren, bölge ve eğitim yılına göre değişebilir.</p><button class="detail-apply" onclick="startApplication('${p.title.replace(/'/g,"\\'")}')">Bu meslek için başvur →</button>`;box.scrollIntoView({behavior:"smooth",block:"start"});}
function closeProfession(){const box=document.getElementById("profession-detail");if(box)box.hidden=true;}
function startApplication(title){go("basvuru");const heading=document.getElementById("application-title");const select=document.getElementById("profession-select");if(heading)heading.textContent=title+" için ön başvuru";if(select)select.value=title;}

if("serviceWorker"in navigator){window.addEventListener("load",()=>navigator.serviceWorker.register("./sw.js"));}
let deferredPrompt;const installButton=document.getElementById("install");window.addEventListener("beforeinstallprompt",event=>{event.preventDefault();deferredPrompt=event;if(installButton)installButton.hidden=false;});if(installButton)installButton.addEventListener("click",async()=>{if(!deferredPrompt)return;deferredPrompt.prompt();await deferredPrompt.userChoice;deferredPrompt=null;installButton.hidden=true;});window.addEventListener("appinstalled",()=>{deferredPrompt=null;if(installButton)installButton.hidden=true;});
const applicationForm=document.getElementById("application-form");
if(applicationForm){applicationForm.addEventListener("submit",async event=>{event.preventDefault();const message=document.getElementById("form-message");if(!sb){if(message){message.hidden=false;message.textContent="Bağlantı hazırlanamadı. Lütfen sayfayı yenile.";}return;}const {data:{user}}=await sb.auth.getUser();if(!user){if(message){message.hidden=false;message.textContent="Başvuruyu göndermek için önce Profil bölümünden kayıt ol veya giriş yap.";}go("profil");return;}const f=new FormData(applicationForm);const payload={user_id:user.id,full_name:f.get("fullName"),birth_year:Number(f.get("birthYear"))||null,city:f.get("city"),email:f.get("email"),phone:f.get("phone"),german_level:f.get("german"),education:f.get("education"),profession:f.get("profession"),cv_status:f.get("cv"),status:"pending",updated_at:new Date().toISOString()};const {error}=await sb.from("applications").insert(payload);if(message){message.hidden=false;message.textContent=error?"Başvuru gönderilemedi: "+error.message:"Başvurun başarıyla alındı. Sürecim bölümünden durumunu takip edebilirsin.";message.scrollIntoView({behavior:"smooth",block:"nearest"});}});}

async function refreshAuth(){if(!sb)return;if(document.body.dataset.passwordRecovery==="1"){showResetPassword();return;}const {data:{user}}=await sb.auth.getUser();const guest=document.getElementById("auth-guest"),logged=document.getElementById("auth-user"),email=document.getElementById("user-email"),account=document.getElementById("account-button");if(guest)guest.hidden=!!user;if(logged)logged.hidden=!user;if(email&&user)email.textContent=user.email;if(account)account.textContent=user?"Hesabım":"Giriş Yap";await checkAdmin(user);await loadApplication(user);}
async function loadApplication(user){const box=document.getElementById("application-status");if(!box)return;if(!user){box.innerHTML="<div class=\"panel-icon\">✓</div><div><h3>Başvuru bilgisi</h3><p>Durumunu görmek için hesabına giriş yap.</p></div>";return;}const {data,error}=await sb.from("applications").select("*").eq("user_id",user.id).order("created_at",{ascending:false}).limit(1);if(error||!data||!data.length){box.innerHTML="<div class=\"panel-icon\">✓</div><div><h3>Henüz başvuru yok</h3><p>Başvuru formunu doldurduğunda durumun burada görünecek.</p></div>";return;}const x=data[0];const labels={pending:"Başvurun alındı",reviewing:"İnceleniyor",contacted:"İletişime geçildi",interview:"Görüşme aşamasında",contract:"Sözleşme aşamasında",completed:"Tamamlandı",rejected:"Sonuçlandı"};const status=labels[x.status]||"Başvurun işleniyor";const date=x.created_at?new Date(x.created_at).toLocaleDateString("tr-TR"):"—";const progressMap={pending:1,reviewing:2,contacted:2,interview:3,contract:4,completed:4,rejected:1};const progress=progressMap[x.status]||1;box.innerHTML=`<div class="status-card">${x.candidate_notification?`<div class="candidate-update ${x.candidate_notification_read_at?"is-read":""}"><small>${x.candidate_notification_read_at?"SON GÜNCELLEME":"YENİ GÜNCELLEME"}</small><b>${safeText(x.candidate_notification)}</b>${x.candidate_notification_at?`<span>${new Date(x.candidate_notification_at).toLocaleString("tr-TR",{dateStyle:"medium",timeStyle:"short"})}</span>`:""}${!x.candidate_notification_read_at?`<button type="button" onclick="markCandidateNotificationRead(${x.id},this)">Okundu olarak işaretle</button>`:""}</div>`:""}<div class="status-head"><div class="panel-icon">✓</div><div><small>GÜNCEL DURUM</small><h3>${status}</h3></div><span class="status-badge">${status}</span></div><div class="status-details"><div><small>Ausbildung</small><b>${x.profession||"Belirtilmedi"}</b></div><div><small>Başvuru tarihi</small><b>${date}</b></div><div><small>Almanca seviyesi</small><b>${x.german_level||"Belirtilmedi"}</b></div><div><small>Şehir</small><b>${x.city||"Belirtilmedi"}</b></div></div>${x.interview_at?`<div class="candidate-interview"><small>GÖRÜŞME TARİHİN</small><b>${new Date(x.interview_at).toLocaleString("tr-TR",{dateStyle:"long",timeStyle:"short"})}</b><span>Görüşme planında değişiklik olursa bu alan güncellenecektir.</span></div>`:""}<div class="status-progress"><div class="status-line">${[1,2,3,4].map(n=>`<span class="${n<=progress?"done":""}"></span>`).join("")}</div><div class="status-labels">${["Başvuru alındı","İnceleme","Görüşme","Sözleşme"].map((t,i)=>i+1<=progress?`<b>${t}</b>`:`<span>${t}</span>`).join("")}</div></div><p class="status-note">Başvurun Azubind sisteminde güvenli şekilde kayıtlı. Durum değiştiğinde bu ekran güncellenecek.</p></div>`;}
async function markCandidateNotificationRead(id,button){button.disabled=true;button.textContent="Kaydediliyor...";const {error}=await sb.from("applications").update({candidate_notification_read_at:new Date().toISOString()}).eq("id",id);if(error){button.disabled=false;button.textContent="Tekrar dene";return;}const box=button.closest(".candidate-update");box.classList.add("is-read");const label=box.querySelector("small");if(label)label.textContent="SON GÜNCELLEME";button.remove();}
function authErrorTR(error){const m=String(error&&error.message||error||"").toLowerCase();if(m.includes("email rate limit"))return "Çok fazla e-posta isteği gönderildi. Lütfen bir süre sonra tekrar deneyin.";if(m.includes("invalid login credentials"))return "E-posta adresi veya şifre hatalı.";if(m.includes("email not confirmed"))return "E-posta adresin henüz doğrulanmamış. Lütfen doğrulama e-postanı kontrol et.";if(m.includes("user already registered"))return "Bu e-posta adresiyle zaten bir hesap bulunuyor.";if(m.includes("password should be at least"))return "Şifre en az 6 karakter olmalı.";if(m.includes("rate limit"))return "Çok fazla deneme yapıldı. Lütfen bir süre sonra tekrar deneyin.";if(m.includes("network")||m.includes("fetch"))return "Bağlantı kurulamadı. İnternet bağlantını kontrol edip tekrar dene.";return "İşlem tamamlanamadı. Lütfen tekrar deneyin.";}
const authMessage=document.getElementById("auth-message");function showAuthMessage(t){if(authMessage){authMessage.hidden=false;authMessage.textContent=t;}}
document.querySelectorAll("[data-auth-tab]").forEach(b=>b.addEventListener("click",()=>{document.querySelectorAll("[data-auth-tab]").forEach(x=>x.classList.toggle("on",x===b));document.getElementById("login-form").hidden=b.dataset.authTab!=="login";document.getElementById("signup-form").hidden=b.dataset.authTab!=="signup";if(authMessage)authMessage.hidden=true;}));
const loginForm=document.getElementById("login-form");if(loginForm)loginForm.addEventListener("submit",async e=>{e.preventDefault();const f=new FormData(loginForm);const {error}=await sb.auth.signInWithPassword({email:f.get("email"),password:f.get("password")});if(error)showAuthMessage("Giriş yapılamadı: "+authErrorTR(error));else{showAuthMessage("Giriş başarılı.");await refreshAuth();}});
const forgotPassword=document.getElementById("forgot-password");if(forgotPassword)forgotPassword.addEventListener("click",async()=>{const email=loginForm&&loginForm.elements.email?loginForm.elements.email.value.trim():"";if(!email){showAuthMessage("Önce e-posta adresini yaz.");return;}forgotPassword.disabled=true;showAuthMessage("Şifre sıfırlama bağlantısı gönderiliyor...");const {error}=await sb.auth.resetPasswordForEmail(email,{redirectTo:"https://app.azubind.com"});forgotPassword.disabled=false;showAuthMessage(error?"Bağlantı gönderilemedi: "+authErrorTR(error):"Şifre sıfırlama bağlantısı e-posta adresine gönderildi.");});
const signupForm=document.getElementById("signup-form");if(signupForm)signupForm.addEventListener("submit",async e=>{e.preventDefault();const f=new FormData(signupForm);const {error}=await sb.auth.signUp({email:f.get("email"),password:f.get("password"),options:{emailRedirectTo:"https://app.azubind.com"}});showAuthMessage(error?"Kayıt oluşturulamadı: "+authErrorTR(error):"Kayıt oluşturuldu. E-postana gelen doğrulama bağlantısına tıkla.");});
const resetPasswordForm=document.getElementById("reset-password-form");
function showResetPassword(){document.body.dataset.passwordRecovery="1";const guest=document.getElementById("auth-guest"),login=document.getElementById("login-form"),signup=document.getElementById("signup-form"),tabs=document.querySelector(".auth-tabs");if(guest)guest.hidden=false;if(login)login.hidden=true;if(signup)signup.hidden=true;if(tabs)tabs.hidden=true;if(resetPasswordForm)resetPasswordForm.hidden=false;go("profil");}
if(resetPasswordForm)resetPasswordForm.addEventListener("submit",async e=>{e.preventDefault();const msg=document.getElementById("reset-password-message"),f=new FormData(resetPasswordForm),password=String(f.get("password")||""),confirmPassword=String(f.get("passwordConfirm")||"");msg.hidden=false;if(password.length<6){msg.textContent="Şifre en az 6 karakter olmalı.";return;}if(password!==confirmPassword){msg.textContent="Şifreler eşleşmiyor.";return;}const button=resetPasswordForm.querySelector('button[type="submit"]');button.disabled=true;msg.textContent="Şifre güncelleniyor...";const {error}=await sb.auth.updateUser({password});button.disabled=false;if(error){msg.textContent="Şifre güncellenemedi: "+authErrorTR(error);return;}msg.textContent="Şifren başarıyla güncellendi ✓";setTimeout(()=>{document.body.dataset.passwordRecovery="0";window.history.replaceState({},document.title,window.location.pathname);refreshAuth();},800);});
if(sb){
 const recoveryInUrl=()=>window.location.hash.includes("type=recovery")||new URLSearchParams(window.location.search).get("type")==="recovery";
 sb.auth.onAuthStateChange((event)=>{if(event==="PASSWORD_RECOVERY"||recoveryInUrl())setTimeout(showResetPassword,0);});
 if(recoveryInUrl())setTimeout(showResetPassword,0);
}
const logoutButton=document.getElementById("logout-button");if(logoutButton)logoutButton.addEventListener("click",async()=>{await sb.auth.signOut();await refreshAuth();});
if(sb){sb.auth.onAuthStateChange(()=>refreshAuth());refreshAuth();}

async function checkAdmin(user){const btn=document.getElementById("admin-button"),page=document.getElementById("admin");if(!user){if(btn)btn.hidden=true;if(page)page.hidden=true;return false;}const {data}=await sb.from("admins").select("user_id").eq("user_id",user.id).maybeSingle();const ok=!!data;if(btn)btn.hidden=!ok;if(page)page.hidden=!ok;return ok;}
const adminButton=document.getElementById("admin-button");if(adminButton)adminButton.addEventListener("click",()=>go("admin"));

async function loadAdminPanel(){
 const box=document.getElementById("admin-list");if(!box)return;
 const {data:{user}}=await sb.auth.getUser();if(!await checkAdmin(user)){go("profil");return;}
 box.innerHTML='<div class="panel"><div><h3>Başvurular yükleniyor...</h3></div></div>';
 const {data,error}=await sb.from("applications").select("*").order("created_at",{ascending:false});
 if(error){box.innerHTML='<div class="panel"><div><h3>Başvurular yüklenemedi</h3><p>'+safeText(error.message)+'</p></div></div>';return;}
 if(!data.length){const count=document.getElementById("admin-count");if(count)count.textContent="0 başvuru";box.innerHTML='<div class="panel"><div><h3>Henüz başvuru yok</h3></div></div>';return;}
 const count=document.getElementById("admin-count");if(count)count.textContent=data.length+" başvuru";
 box.innerHTML=data.map(x=>'<article class="admin-card" data-status="'+safeText(x.status||"pending")+'"><div><small>ADAY #'+x.id+'</small><h3>'+safeText(x.full_name||"İsimsiz aday")+'</h3><p>'+safeText(x.email||"E-posta yok")+' · '+safeText(x.phone||"Telefon yok")+'</p></div><div class="admin-facts"><span><small>Ausbildung</small><b>'+safeText(x.profession||"—")+'</b></span><span><small>Şehir</small><b>'+safeText(x.city||"—")+'</b></span><span><small>Almanca</small><b>'+safeText(x.german_level||"—")+'</b></span></div><div class="admin-actions"><button type="button" onclick="loadAdminCandidate(\''+x.user_id+'\',this)">Aday Detayı</button><button type="button" onclick="loadAdminDocuments(\''+x.user_id+'\',this)">Belgeleri Gör</button><button type="button" onclick="loadCompanyApplications(\''+x.user_id+'\',this)">Firma Takibi</button></div><div class="admin-candidate-detail" hidden></div><div class="admin-documents" hidden></div><div class="admin-company-applications" hidden></div><div class="admin-process"><label><span>Görüşme Tarihi</span><input type="datetime-local" class="admin-interview" data-id="'+x.id+'" value="'+formatAdminDateTime(x.interview_at)+'"></label><label><span>İç Not</span><textarea class="admin-note" data-id="'+x.id+'" rows="3" placeholder="Sadece yöneticiler görür...">'+safeText(x.admin_note||"")+'</textarea></label><button type="button" onclick="saveAdminProcess('+x.id+',this)">Not ve Tarihi Kaydet</button><small class="admin-process-message"></small></div><label class="admin-status">Durum <select data-id="'+x.id+'"><option value="pending">Başvuru alındı</option><option value="reviewing">İnceleniyor</option><option value="contacted">İletişime geçildi</option><option value="interview">Görüşme aşamasında</option><option value="contract">Sözleşme aşamasında</option><option value="completed">Tamamlandı</option><option value="rejected">Sonuçlandı</option></select><em></em></label></article>').join("");
 data.forEach((x,i)=>{const s=box.querySelectorAll("select")[i];s.value=x.status||"pending";s.addEventListener("change",()=>saveAdminStatus(x.id,s));});
}
function filterAdminSearch(){const input=document.getElementById("admin-search"),filter=document.getElementById("admin-status-filter");if(!input)return;const q=input.value.trim().toLocaleLowerCase("tr-TR"),status=filter?filter.value:"";document.querySelectorAll("#admin-list .admin-card").forEach(card=>{const haystack=card.textContent.toLocaleLowerCase("tr-TR"),matchesText=!q||haystack.includes(q),matchesStatus=!status||card.dataset.status===status;card.hidden=!(matchesText&&matchesStatus);});}
function formatAdminDateTime(v){if(!v)return"";const d=new Date(v);if(Number.isNaN(d.getTime()))return"";const p=n=>String(n).padStart(2,"0");return d.getFullYear()+"-"+p(d.getMonth()+1)+"-"+p(d.getDate())+"T"+p(d.getHours())+":"+p(d.getMinutes());}
async function saveAdminProcess(id,button){const card=button.closest(".admin-card"),note=card.querySelector(".admin-note"),interview=card.querySelector(".admin-interview"),msg=card.querySelector(".admin-process-message");button.disabled=true;msg.textContent="Kaydediliyor...";const now=new Date().toISOString(),payload={admin_note:note.value.trim()||null,interview_at:interview.value?new Date(interview.value).toISOString():null,candidate_notification:interview.value?"Görüşme tarihin güncellendi.":"Başvuru sürecinde yeni bir güncelleme var.",candidate_notification_at:now,candidate_notification_read_at:null,updated_at:now};const {error}=await sb.from("applications").update(payload).eq("id",id);button.disabled=false;msg.textContent=error?"Kaydedilemedi: "+error.message:"Kaydedildi ✓";}
function safeText(v){const d=document.createElement("div");d.textContent=String(v);return d.innerHTML;}
async function saveAdminStatus(id,select){const note=select.parentElement.querySelector("em");select.disabled=true;note.textContent="Kaydediliyor...";const now=new Date().toISOString(),labels={pending:"Başvurun alındı.",reviewing:"Başvurun inceleniyor.",contacted:"Azubind seninle iletişime geçme aşamasında.",interview:"Başvurun görüşme aşamasına geçti.",contract:"Başvurun sözleşme aşamasına geçti.",completed:"Başvuru sürecin tamamlandı.",rejected:"Başvuru sürecin sonuçlandı."};const {error}=await sb.from("applications").update({status:select.value,candidate_notification:labels[select.value]||"Başvuru durumun güncellendi.",candidate_notification_at:now,candidate_notification_read_at:null,updated_at:now}).eq("id",id);select.disabled=false;note.textContent=error?"Kaydedilemedi":"Kaydedildi ✓";}

const DOCUMENT_BUCKET="candidate-documents";
const documentLabels={cv:"CV",diploma:"Diploma","language-certificate":"Dil Sertifikası"};
function showDocumentMessage(text,isError=false){const box=document.getElementById("document-message");if(!box)return;box.hidden=false;box.textContent=text;box.classList.toggle("error",isError);}
function cleanFileName(name){return name.normalize("NFD").replace(/[\u0300-\u036f]/g,"").replace(/[^a-zA-Z0-9._-]/g,"-").replace(/-+/g,"-");}
async function uploadDocument(input,type){
 if(!sb||!input.files||!input.files[0])return;
 const file=input.files[0];if(file.size>10*1024*1024){showDocumentMessage("Dosya en fazla 10 MB olabilir.",true);input.value="";return;}
 const {data:{user}}=await sb.auth.getUser();if(!user){showDocumentMessage("Belge yüklemek için giriş yapmalısın.",true);return;}
 showDocumentMessage("Belge yükleniyor...");
 const path=user.id+"/"+type+"-"+Date.now()+"-"+cleanFileName(file.name);
 const {error}=await sb.storage.from(DOCUMENT_BUCKET).upload(path,file,{upsert:false,contentType:file.type||undefined});
 input.value="";
 if(error){showDocumentMessage("Belge yüklenemedi: "+error.message,true);return;}
 showDocumentMessage(documentLabels[type]+" başarıyla yüklendi.");await loadDocuments();
}
async function loadDocuments(){
 const box=document.getElementById("document-list");if(!box||!sb)return;
 const {data:{user}}=await sb.auth.getUser();if(!user){box.innerHTML="";return;}
 box.innerHTML='<p class="document-empty">Belgeler yükleniyor...</p>';
 const {data,error}=await sb.storage.from(DOCUMENT_BUCKET).list(user.id,{limit:100,sortBy:{column:"created_at",order:"desc"}});
 if(error){box.innerHTML='<p class="document-empty">Belgeler yüklenemedi: '+safeText(error.message)+'</p>';return;}
 if(!data||!data.length){box.innerHTML='<p class="document-empty">Henüz belge yüklemedin.</p>';return;}
 box.innerHTML=data.filter(x=>x.name!==".emptyFolderPlaceholder").map(x=>{
   const type=x.name.startsWith("cv-")?"cv":x.name.startsWith("diploma-")?"diploma":x.name.startsWith("language-certificate-")?"language-certificate":"document";
   const label=documentLabels[type]||"Belge";const size=x.metadata&&x.metadata.size?formatBytes(x.metadata.size):"";
   return '<article class="document-item"><div><b>'+safeText(label)+'</b><small>'+safeText(size)+'</small></div><div><button type="button" onclick="openDocument(\''+safeText(x.name)+'\')">Görüntüle</button><button type="button" class="danger" onclick="deleteDocument(\''+safeText(x.name)+'\')">Sil</button></div></article>';
 }).join("");
}
function formatBytes(bytes){if(!bytes)return"";if(bytes<1024*1024)return Math.ceil(bytes/1024)+" KB";return (bytes/1024/1024).toFixed(1)+" MB";}
async function openDocument(name){const {data:{user}}=await sb.auth.getUser();if(!user)return;const {data,error}=await sb.storage.from(DOCUMENT_BUCKET).createSignedUrl(user.id+"/"+name,60);if(error){showDocumentMessage("Belge açılamadı: "+error.message,true);return;}window.open(data.signedUrl,"_blank","noopener");}
async function deleteDocument(name){if(!confirm("Bu belgeyi silmek istediğine emin misin?"))return;const {data:{user}}=await sb.auth.getUser();if(!user)return;const {error}=await sb.storage.from(DOCUMENT_BUCKET).remove([user.id+"/"+name]);if(error){showDocumentMessage("Belge silinemedi: "+error.message,true);return;}showDocumentMessage("Belge silindi.");await loadDocuments();}

async function loadAdminDocuments(userId,button){
 const card=button.closest(".admin-card"),box=card.querySelector(".admin-documents");box.hidden=false;box.innerHTML="<small>Belgeler yükleniyor...</small>";
 const {data,error}=await sb.storage.from(DOCUMENT_BUCKET).list(userId,{limit:100,sortBy:{column:"created_at",order:"desc"}});
 if(error){box.innerHTML="<small>Belgeler yüklenemedi: "+safeText(error.message)+"</small>";return;}
 const files=(data||[]).filter(x=>x.name!==".emptyFolderPlaceholder");
 if(!files.length){box.innerHTML="<small>Bu aday henüz belge yüklememiş.</small>";return;}
 box.innerHTML=files.map(x=>{const type=x.name.startsWith("cv-")?"cv":x.name.startsWith("diploma-")?"diploma":x.name.startsWith("language-certificate-")?"language-certificate":"document";return '<button type="button" onclick="openAdminDocument(\''+userId+'\',\''+safeText(x.name)+'\')">'+safeText(documentLabels[type]||"Belge")+' ↗</button>';}).join("");
}
async function openAdminDocument(userId,name){
 const {data,error}=await sb.storage.from(DOCUMENT_BUCKET).createSignedUrl(userId+"/"+name,60);
 if(error){alert("Belge açılamadı: "+error.message);return;}
 window.open(data.signedUrl,"_blank","noopener");
}

const profileForm=document.getElementById("profile-form");
async function loadProfile(){
 if(!sb||!profileForm)return;const {data:{user}}=await sb.auth.getUser();if(!user)return;
 const {data,error}=await sb.from("profiles").select("*").eq("user_id",user.id).maybeSingle();if(error)return;
 if(data){["full_name","birth_date","city","address","phone","education","german_level"].forEach(k=>{if(profileForm.elements[k])profileForm.elements[k].value=data[k]||"";});}
 updateProfilePercent();
}
function updateProfilePercent(){if(!profileForm)return;const keys=["full_name","birth_date","city","address","phone","education","german_level"];const done=keys.filter(k=>String(profileForm.elements[k].value||"").trim()).length;const el=document.getElementById("profile-percent");if(el)el.textContent=Math.round(done/keys.length*100)+"%";}
if(profileForm){
 profileForm.addEventListener("input",updateProfilePercent);
 profileForm.addEventListener("submit",async e=>{e.preventDefault();const msg=document.getElementById("profile-message");const {data:{user}}=await sb.auth.getUser();if(!user)return;const f=new FormData(profileForm);const payload={user_id:user.id,full_name:f.get("full_name"),birth_date:f.get("birth_date")||null,city:f.get("city"),address:f.get("address"),phone:f.get("phone"),education:f.get("education"),german_level:f.get("german_level"),updated_at:new Date().toISOString()};if(msg)msg.textContent="Kaydediliyor...";const {error}=await sb.from("profiles").upsert(payload,{onConflict:"user_id"});if(msg)msg.textContent=error?"Kaydedilemedi: "+error.message:"Kaydedildi ✓";if(!error){updateProfilePercent();prefillApplication(payload,user);}});
}
function prefillApplication(p,user){if(!applicationForm)return;const set=(name,value)=>{const el=applicationForm.elements[name];if(el&&!el.value&&value)el.value=value;};set("fullName",p.full_name);set("city",p.city);set("phone",p.phone);set("german",p.german_level);set("education",p.education);set("email",user&&user.email);if(p.birth_date){set("birthYear",new Date(p.birth_date+"T00:00:00").getFullYear());}}

async function loadProfileIntoApplication(){
 if(!sb||!applicationForm)return;const {data:{user}}=await sb.auth.getUser();if(!user)return;
 const {data,error}=await sb.from("profiles").select("*").eq("user_id",user.id).maybeSingle();
 if(!error&&data)prefillApplication(data,user);else prefillApplication({},user);
}

async function loadAdminCandidate(userId,button){
 const card=button.closest(".admin-card"),box=card.querySelector(".admin-candidate-detail");
 if(!userId||userId==="null"){box.hidden=false;box.innerHTML="<small>Bu başvuru bir kullanıcı profiline bağlı değil.</small>";return;}
 if(!box.hidden&&box.dataset.loaded==="1"){box.hidden=true;button.textContent="Aday Detayı";return;}
 box.hidden=false;box.innerHTML="<small>Profil yükleniyor...</small>";button.disabled=true;
 const {data:{user}}=await sb.auth.getUser();if(!await checkAdmin(user)){button.disabled=false;return;}
 const {data,error}=await sb.from("profiles").select("*").eq("user_id",userId).maybeSingle();button.disabled=false;
 if(error){box.innerHTML="<small>Profil yüklenemedi: "+safeText(error.message)+"</small>";return;}
 if(!data){box.innerHTML="<small>Bu aday henüz profil bilgilerini kaydetmemiş.</small>";box.dataset.loaded="1";button.textContent="Detayı Gizle";return;}
 const date=data.birth_date?new Date(data.birth_date+"T00:00:00").toLocaleDateString("tr-TR"):"—";
 const fields=[["Ad Soyad",data.full_name],["Doğum Tarihi",date],["Şehir",data.city],["Telefon",data.phone],["Eğitim",data.education],["Almanca",data.german_level],["Adres",data.address]];
 box.innerHTML='<div class="admin-profile-grid">'+fields.map(v=>'<span><small>'+safeText(v[0])+'</small><b>'+safeText(v[1]||"—")+'</b></span>').join("")+'</div>';
 box.dataset.loaded="1";button.textContent="Detayı Gizle";
}

async function loadAdminManagement(){
 const shell=document.getElementById("admin-management"),list=document.getElementById("admin-management-list");if(!shell||!list||!sb)return;
 const {data:{user}}=await sb.auth.getUser();if(!user){shell.hidden=true;return;}
 const {data:isMain,error:mainError}=await sb.rpc("is_main_admin");if(mainError||!isMain){shell.hidden=true;return;}
 shell.hidden=false;list.innerHTML="<small>Yöneticiler yükleniyor...</small>";
 const {data,error}=await sb.from("admins").select("user_id,role,created_at").order("created_at",{ascending:true});
 if(error){list.innerHTML="<small>Yöneticiler yüklenemedi.</small>";return;}
 list.innerHTML=(data||[]).map(a=>'<div class="admin-manager-row"><div><b>'+safeText(a.role==="main_admin"?"Main Admin":"Yönetici")+'</b><small>'+safeText(a.user_id)+'</small></div><div><select onchange="changeAdminRole(\''+a.user_id+'\',this)"><option value="admin"'+(a.role==="admin"?" selected":"")+'>Yönetici</option><option value="main_admin"'+(a.role==="main_admin"?" selected":"")+'>Main Admin</option></select><button type="button" class="danger" onclick="removeAdmin(\''+a.user_id+'\')">Yetkiyi Kaldır</button></div></div>').join("")||"<small>Yönetici bulunamadı.</small>";
}
async function changeAdminRole(userId,select){const {error}=await sb.from("admins").update({role:select.value}).eq("user_id",userId);const msg=document.getElementById("admin-management-message");if(msg)msg.textContent=error?"Değişiklik kaydedilemedi.":"Yetki güncellendi ✓";if(!error)loadAdminManagement();}
async function removeAdmin(userId){if(!confirm("Bu kullanıcının yönetici yetkisini kaldırmak istiyor musun?"))return;const {error}=await sb.from("admins").delete().eq("user_id",userId);const msg=document.getElementById("admin-management-message");if(msg)msg.textContent=error?"Yetki kaldırılamadı.":"Yönetici yetkisi kaldırıldı ✓";if(!error)loadAdminManagement();}
const adminAddForm=document.getElementById("admin-add-form");if(adminAddForm)adminAddForm.addEventListener("submit",async e=>{e.preventDefault();const f=new FormData(adminAddForm),userId=String(f.get("user_id")||"").trim(),role=String(f.get("role")||"admin"),msg=document.getElementById("admin-management-message");if(msg)msg.textContent="Kaydediliyor...";const {error}=await sb.from("admins").upsert({user_id:userId,role},{onConflict:"user_id"});if(msg)msg.textContent=error?"Yetki verilemedi. UID'yi kontrol et.":"Yönetici yetkisi verildi ✓";if(!error){adminAddForm.reset();loadAdminManagement();}});
if(sb)sb.auth.getUser().then(()=>loadAdminManagement());


async function loadCompanyApplications(userId,button){
 const card=button.closest(".admin-card"),box=card.querySelector(".admin-company-applications");
 if(!box)return;
 if(!box.hidden){box.hidden=true;button.textContent="Firma Takibi";return;}
 box.hidden=false;button.textContent="Firma Takibini Gizle";
 await renderCompanyApplications(userId,box);
}
async function renderCompanyApplications(userId,box){
 box.innerHTML="<small>Firma başvuruları yükleniyor...</small>";
 const {data,error}=await sb.from("company_applications").select("id,company_name,city,application_date,status").eq("candidate_id",userId).order("application_date",{ascending:false});
 if(error){box.innerHTML="<small>Firma başvuruları yüklenemedi: "+safeText(error.message)+"</small>";return;}
 const labels={applied:"Başvuruldu",waiting:"Cevap bekleniyor",interview:"Görüşme",accepted:"Kabul",rejected:"Olumsuz"};
 const rows=data&&data.length?data.map(x=>"<div><b>"+safeText(x.company_name)+"</b><small> · "+safeText(x.city||"—")+" · "+safeText(x.application_date||"—")+"</small><select onchange=\"updateCompanyApplicationStatus("+x.id+",this,\\\'"+userId+"\\\')\"><option value=\"applied\""+(x.status==="applied"?" selected":"")+">Başvuruldu</option><option value=\"waiting\""+(x.status==="waiting"?" selected":"")+">Cevap bekleniyor</option><option value=\"interview\""+(x.status==="interview"?" selected":"")+">Görüşme</option><option value=\"accepted\""+(x.status==="accepted"?" selected":"")+">Kabul</option><option value=\"rejected\""+(x.status==="rejected"?" selected":"")+">Olumsuz</option></select><button type=\"button\" onclick=\"deleteCompanyApplication("+x.id+",this,\\\'"+userId+"\\\')\">Sil</button></div>").join(""):"<small>Bu aday için henüz firma başvurusu eklenmedi.</small>";
 box.innerHTML=rows+'<form class="company-application-form"><input name="company_name" placeholder="Firma adı" required><input name="city" placeholder="Şehir"><input name="application_date" type="date" required><select name="status"><option value="applied">Başvuruldu</option><option value="waiting">Cevap bekleniyor</option><option value="interview">Görüşme</option><option value="accepted">Kabul</option><option value="rejected">Olumsuz</option></select><button type="submit">Firma Başvurusu Ekle</button><small class="company-application-message"></small></form>';
 const form=box.querySelector(".company-application-form");
 form.elements.application_date.value=new Date().toISOString().slice(0,10);
 form.addEventListener("submit",async e=>{
   e.preventDefault();
   const msg=form.querySelector(".company-application-message"),fd=new FormData(form),submit=form.querySelector('button[type="submit"]');
   submit.disabled=true;msg.textContent="Kaydediliyor...";
   const {error}=await sb.from("company_applications").insert({candidate_id:userId,company_name:String(fd.get("company_name")||"").trim(),city:String(fd.get("city")||"").trim()||null,application_date:fd.get("application_date"),status:fd.get("status")});
   submit.disabled=false;
   if(error){msg.textContent="Kaydedilemedi: "+error.message;return;}
   await renderCompanyApplications(userId,box);
 });
}

async function updateCompanyApplicationStatus(id,select,userId){select.disabled=true;const {error}=await sb.from("company_applications").update({status:select.value}).eq("id",id);select.disabled=false;if(error){alert("Durum güncellenemedi: "+error.message);const box=select.closest(".admin-company-applications");if(box)await renderCompanyApplications(userId,box);}}

async function deleteCompanyApplication(id,button,userId){if(!confirm("Bu firma başvurusunu silmek istiyor musun?"))return;button.disabled=true;const {error}=await sb.from("company_applications").delete().eq("id",id);if(error){button.disabled=false;alert("Kayıt silinemedi: "+error.message);return;}const box=button.closest(".admin-company-applications");if(box)await renderCompanyApplications(userId,box);}
