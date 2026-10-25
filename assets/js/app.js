/* =========================================================================
   Not For Sale — site engine (no framework, no network)
   Renders shared chrome + page content, generates self-contained artwork.
   ========================================================================= */
(function(){
"use strict";
var FLAME = '<svg viewBox="0 0 24 24"><path d="M12 2c1.2 4.2-3 5.2-3 9.2a3 3 0 0 0 6 0c0-1.6-.8-2.7-1-3.8 2 .9 3.2 3 3.2 5.1a6.4 6.4 0 1 1-12.4 0C4.8 7 9.8 6 12 2z" fill="#fff"/></svg>';

/* ---- site config (managed in wp-admin: NFS Settings) ---- */
var CFG = window.NFS_CONFIG || {};
var LOGO_URL = CFG.logo || "/wp-content/uploads/2025/11/logo-1-e1781208606205.png";
var MAILCHIMP_ACTION = CFG.mailchimp || "";
var FAVICON = CFG.favicon || "/wp-content/uploads/2025/12/NFS_favicon.png";
var DONATE = "/donate/";
var NL_MARK = FAVICON ? '<img class="nl-ico" src="'+FAVICON+'" alt="Not For Sale" width="44" height="44" decoding="async" loading="lazy">' : '<span class="flame" style="display:inline-grid;width:44px;height:44px">'+FLAME+'</span>';
var F_MARK = FAVICON ? '<img class="f-ico" src="'+FAVICON+'" alt="Not For Sale" width="40" height="40" decoding="async" loading="lazy">' : '<span class="flame">'+FLAME+'</span>';
var BRAND = LOGO_URL
  /* width/height reserve space before the image decodes; the inline CSS height still wins.
     Logo is 579x100 intrinsic, rendered 30px tall = 174x30. */
  ? '<img class="brandlogo" src="'+LOGO_URL+'" alt="Not For Sale" width="174" height="30" decoding="async" style="height:30px;width:auto;display:block">'
  : '<span class="flame">'+FLAME+'</span><span class="name">Not For Sale</span>';


/* ---------- category system ---------- */
var CAT = {
 "Human Trafficking":{c:"#c46f49",pal:[0,6]},
 "Social Innovation":{c:"#4f8e92",pal:[3]},
 "Social Enterprise":{c:"#4f8e92",pal:[3]},
 "Ecocide":{c:"#5b7747",pal:[2]},
 "Cyber Scams":{c:"#62808d",pal:[1,7]}
};
function catColor(c){return CAT[c]?CAT[c].c:"#F5821F";}

/* ---------- scene generator ---------- */
var PAL=[
 {s1:"#f4d9b8",s2:"#e7ad77",sun:"#f0915a",h:["#d98a52","#bf6f3e","#8f4f2c"]},
 {s1:"#dde8ee",s2:"#a9c3cf",sun:"#f4efe4",h:["#8aa2ad","#62808d","#3f5b66"]},
 {s1:"#dde7cf",s2:"#a9c191",sun:"#eef0d6",h:["#7e9a64","#5b7747","#3a5430"]},
 {s1:"#cfe6e8",s2:"#9cc6cc",sun:"#f6e7c8",h:["#79b0b0","#4f8e92","#356c70"]},
 {s1:"#f3e6c4",s2:"#e6c98a",sun:"#f4a259",h:["#cba85e","#a98742","#7a5d2c"]},
 {s1:"#e9dfe9",s2:"#c8b6c9",sun:"#f3e3ea",h:["#a591a8","#7e6781","#574258"]},
 {s1:"#fbe3d0",s2:"#f6b98e",sun:"#f58a4b",h:["#e3936a","#c46f49","#8f4d31"]},
 {s1:"#e7ecef",s2:"#cdd6db",sun:"#eef2f3",h:["#9fb0b8","#76898f","#516167"]}
];
function hash(s){var h=2166136261;for(var i=0;i<s.length;i++){h^=s.charCodeAt(i);h=Math.imul(h,16777619);}return h>>>0;}
function rng(seed){return function(){seed|=0;seed=seed+0x6D2B79F5|0;var t=Math.imul(seed^seed>>>15,1|seed);t=t+Math.imul(t^t>>>7,61|t)^t;return((t^t>>>14)>>>0)/4294967296;};}
function hill(baseY,amp,r){var n=5,p=[],i;for(i=0;i<=n;i++)p.push([i/n*100,baseY+(r()*2-1)*amp]);
 var d="M0 100 L0 "+p[0][1].toFixed(1);
 for(i=1;i<=n;i++)d+=" Q "+p[i-1][0].toFixed(1)+" "+p[i-1][1].toFixed(1)+" "+((p[i-1][0]+p[i][0])/2).toFixed(1)+" "+((p[i-1][1]+p[i][1])/2).toFixed(1);
 d+=" L100 "+p[n][1].toFixed(1)+" L100 100 Z";return d;}
function scene(seed,cat){
 var h=hash(seed),r=rng(h),pal;
 if(cat&&CAT[cat])pal=PAL[CAT[cat].pal[h%CAT[cat].pal.length]];else pal=PAL[h%PAL.length];
 var sx=(18+r()*64).toFixed(0),sy=(22+r()*22).toFixed(0),sr=(11+r()*7).toFixed(1),id="g"+h;
 var a=hill(58,7,rng(hash(seed+"a"))),b=hill(70,9,rng(hash(seed+"b"))),c=hill(83,8,rng(hash(seed+"c")));
 return '<svg class="scene" viewBox="0 0 100 100" preserveAspectRatio="xMidYMid slice" xmlns="http://www.w3.org/2000/svg">'+
  '<defs><linearGradient id="'+id+'" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="'+pal.s1+'"/><stop offset="1" stop-color="'+pal.s2+'"/></linearGradient>'+
  '<radialGradient id="'+id+'s"><stop offset="0" stop-color="'+pal.sun+'" stop-opacity=".95"/><stop offset="1" stop-color="'+pal.sun+'" stop-opacity="0"/></radialGradient></defs>'+
  '<rect width="100" height="100" fill="url(#'+id+')"/><circle cx="'+sx+'" cy="'+sy+'" r="'+sr+'" fill="'+pal.sun+'"/>'+
  '<circle cx="'+sx+'" cy="'+sy+'" r="'+(sr*2.4).toFixed(1)+'" fill="url(#'+id+'s)"/>'+
  '<path d="'+a+'" fill="'+pal.h[0]+'" opacity=".92"/><path d="'+b+'" fill="'+pal.h[1]+'" opacity=".95"/><path d="'+c+'" fill="'+pal.h[2]+'"/></svg>';
}
/* duotone portrait avatar with initials */
function avatar(name){
 var h=hash(name),id="a"+h;
 var tone=[["#3a3632","#1d1b18"],["#3c3a40","#1c1b20"],["#39403c","#1b201d"],["#403a36","#1d1a17"]][h%4];
 var ini=name.split(/\s+/).map(function(w){return w[0];}).slice(0,2).join('').toUpperCase();
 return '<svg viewBox="0 0 100 120" preserveAspectRatio="xMidYMid slice" xmlns="http://www.w3.org/2000/svg">'+
  '<defs><linearGradient id="'+id+'" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="'+tone[0]+'"/><stop offset="1" stop-color="'+tone[1]+'"/></linearGradient></defs>'+
  '<rect width="100" height="120" fill="url(#'+id+')"/><circle cx="50" cy="46" r="20" fill="rgba(255,255,255,.07)"/>'+
  '<path d="M22 120 q28 -34 56 0 Z" fill="rgba(255,255,255,.06)"/></svg>'+
  '<span class="ini">'+ini+'</span>';
}
function rel(h){if(h<1)return"Just now";if(h<24)return h+"h ago";var d=Math.round(h/24);return d===1?"Yesterday":d+" days ago";}
function tagHTML(cat){var c=catColor(cat);return '<span class="tag"><span class="dot" style="background:'+c+'"></span>'+cat+'</span>';}

/* =========================================================================
   CONTENT  (representative placeholder — wire to CMS / articlos for real data)
   ========================================================================= */
var FEAT={cat:"Cyber Scams",title:"Inside a Seized Scam Compound in Cambodia, the Machinery of Exploitation Comes Into View",dek:"A rare look behind the walls of the trafficking-fuelled fraud industry sweeping Southeast Asia.",read:9,when:"Today"};
var LATEST=[
 {cat:"Cyber Scams",title:"The Human Cost of Cyber Scam Operations in Southeast Asia",read:7,h:3},
 {cat:"Cyber Scams",title:"Cambodia's Crackdown on Scam Compounds: Progress and Pressure",read:6,h:9},
 {cat:"Social Innovation",title:"Kru Nam's Legacy: From Bamboo Huts to Generations of Change",read:5,h:26},
 {cat:"Ecocide",title:"Where Ecocide Is Happening Today, and Who It Harms",read:4,h:50}
];
var ARTS=[
 {cat:"Human Trafficking",title:"Understanding the Hidden Systems of Exploitation",dek:"How modern slavery operates in plain sight, and the signals that reveal it.",read:6,h:5,big:true},
 {cat:"Social Innovation",title:"Building Businesses That Empower Rather Than Exploit",dek:"Sustainable enterprise as a frontline tool against trafficking.",read:5,h:12},
 {cat:"Ecocide",title:"Confronting the Destruction of Our Shared Environment",dek:"Why environmental collapse and human exploitation are deeply linked.",read:7,h:20},
 {cat:"Cyber Scams",title:"The Human Cost of Cyber Scam Operations in Southeast Asia",dek:"Inside the trafficking pipeline feeding industrial-scale online fraud.",read:7,h:28},
 {cat:"Human Trafficking",title:"What Modern-Day Slavery Looks Like in 2026",dek:"The forms, the numbers, and the people behind them.",read:4,h:36},
 {cat:"Social Innovation",title:"Survivor-Led Enterprise: Dignity Through Work",dek:"Stories from the programs rebuilding lives and livelihoods.",read:5,h:44},
 {cat:"Ecocide",title:"How Ecocide Affects People as Well as Nature",dek:"The communities paying the price for large-scale destruction.",read:6,h:60}
];
var FAQ=[
 {q:"What is Ecocide?",a:"Ecocide is the large-scale destruction of ecosystems that severely harms the environment and threatens the lives and livelihoods of people who depend on it. <a href='/learn/what-is-ecocide/'>Learn more</a>"},
 {q:"What is Human Trafficking?",a:"Human trafficking is the use of force, fraud, or coercion to exploit people for labour or commercial gain. It is one of the fastest-growing criminal industries in the world. <a href='/learn/what-is-human-trafficking/'>Learn more</a>"},
 {q:"What is Social Innovation?",a:"Social innovation means building sustainable businesses and models that empower communities rather than exploit them, creating alternatives that prevent trafficking before it starts. <a href='/learn/what-is-social-innovation/'>Learn more</a>"}
];
function faqSocial(){var s=(typeof CFG!=='undefined'&&CFG.social)||{};
 var L=[['ig','Instagram'],['fb','Facebook'],['yt','YouTube'],['li','LinkedIn'],['tt','TikTok']];
 var items=L.filter(function(o){return s[o[0]];}).map(function(o){return "<a href='"+s[o[0]]+"' target='_blank' rel='noopener'>"+o[1]+"</a>";});
 return items.length?items.join(', '):"Instagram, Facebook, LinkedIn, and TikTok";}
var FAQLIST=[
 {cat:"About & Mission",q:"What is Not For Sale's mission?",a:"End modern-day slavery and ecocide at their source.<br><br>Environmental destruction deepens vulnerability. Trafficking victims are coerced into deepening the destruction. It is one crisis, one downward spiral. Not For Sale reverses it through our Impact Stack: direct survivor support, root cause research, social innovation, and the creation of enterprises and economies that make trafficking harder to sustain and communities harder to exploit.<br><br>We never stop supporting survivors, with care, training, and pathways back to dignity and independence. And we never stop building upstream, because the most powerful form of prevention is a community with ownership of its own future. <a href='/about/'>Learn more about our work</a>."},
 {cat:"About & Mission",q:"What is Not For Sale's vision?",a:"A world where no one is for sale.<br><br>Not For Sale has spent nearly two decades documenting that ecocide and modern-day slavery are one system. Our vision is a world where that system has been replaced: where what we consume no longer destroys the communities that produce it, where survivors lead rather than depend, and where the same forces that once drove destruction drive recovery instead."},
 {cat:"About & Mission",q:"How can I contact someone at Not For Sale?",a:"You can <a href='/contact/'>reach us here</a>. Not For Sale is a small team doing work across six continents, so responses may take time. We read everything and will get back to you as soon as we can."},
 {cat:"Report Human Trafficking",q:"Can I report suspected human trafficking to Not For Sale?",a:"<strong>If you or someone you know is in immediate danger, contact your local emergency services immediately. In the United States, call <a href='tel:911'>911</a>.</strong> Suspected cases of human trafficking should first be reported to local law enforcement authorities.<br><br>Not For Sale has compiled verified hotline numbers and reporting contacts for every country where we work. Visit our <a href='/report-human-trafficking/'>Report Human Trafficking</a> page for the full directory, including the United States National Human Trafficking Hotline at <a href='tel:+18883737888'>1-888-373-7888</a>.<br><br>In some cases, Not For Sale works directly with local authorities to help address reported situations. While we cannot respond to every individual report, we take every report seriously and will direct it to the appropriate channels wherever we can."},
 {cat:"Get Involved",q:"How can I collaborate with Not For Sale?",a:"<a href='/contact/'>Reach out through our contact page</a> with details about what you have in mind. You can also explore how our <a href='/partners/'>current and past partners</a> work with us. We are always open to partnerships that align with our mission and will follow up where there is a fit."},
 {cat:"Donations",q:"How can I donate to Not For Sale?",a:"Visit our <a href='/donate/'>donate page</a> to give a one-time gift or become a monthly supporter. Monthly giving is the single most powerful way to sustain Not For Sale's work, it funds long-term programs, not just short-term responses. Multiple payment methods are accepted, and all donations are tax-deductible in the United States (501c3)."},
 {cat:"Donations",q:"Can my employer match my donation?",a:"Many employers will match your donation to Not For Sale, doubling or even tripling your impact at no extra cost to you. Use our <a href='/employer-matching/'>employer matching search tool</a> to check whether your company participates, and access the forms and instructions you need to submit your match. You can also <a href='/donate/'>donate here</a> and check for a match afterward. Billions of dollars in matching gift funds go unclaimed every year, a few minutes of your time could double your contribution."},
 {cat:"Donations",q:"How can I update my donation and card details?",a:"<a href='"+(CFG.donorLogin||"https://pro.gofundme.com/sso")+"'>Log in to your donor account</a>, go to the recurring donations section, and select the donation you want to update. From there you can change your card details or adjust your recurring amount. If it is your first time logging in, use the forgot password option to set one up via email. Need help? <a href='/contact/'>Contact us</a> and we will walk you through it."},
 {cat:"Donations",q:"Do you accept mail donations?",a:"Yes. Make checks payable to Not For Sale Fund and mail to:<br><br>Not For Sale, 1930 Village Center Circle #3-19535, Las Vegas, NV 89134, USA.<br><br>All mailed donations are tax-deductible in the United States (501c3). You can also <a href='/donate/'>give online anytime</a>."},
 {cat:"Donations",q:"Can I donate my stocks to Not For Sale?",a:"Yes. Donating appreciated stock is one of the most tax-efficient ways to support Not For Sale, you avoid capital gains tax and can deduct the full market value of the gift. To start a stock transfer, <a href='/contact/'>contact us</a> and we will provide transfer instructions for your broker."},
 {cat:"Fundraising",q:"How can I get involved with Not For Sale's fundraising?",a:"The most direct way is to <a href='/donate/'>donate</a>. You can also start your own fundraiser, share our work with your community, or follow Not For Sale on social media to help spread awareness. Every action that brings new supporters into the mission extends its reach."},
 {cat:"Fundraising",q:"How do I become a fundraiser for Not For Sale?",a:"Start by visiting our <a href='/donate/'>donate page</a>, you can set up your own fundraiser there, whether solo or as a team. Pick a goal, share it with your community, and every dollar raised goes directly toward ending modern-day slavery and ecocide across six continents. If you need support getting started, <a href='/contact/'>reach out to us</a> and we will help."},
 {cat:"Fundraising",q:"Do you provide any tools to help with fundraising?",a:"Yes. Through our <a href='/donate/'>donate page</a> you can create your own fundraising page, set a goal, and invite others to join as a team. We also provide a digital toolkit with images, social media templates, and messaging to help you tell the Not For Sale story in your own community. Need something specific? <a href='/contact/'>Contact us</a> and we will get you what you need."},
 {cat:"Updates",q:"How can I keep up-to-date with Not For Sale?",a:"Sign up for our <a href='#newsletter'>newsletter</a> and follow us on "+faqSocial()+". You can also <a href='/donate/'>donate</a> to receive regular updates on how your support is making an impact across six continents."}
];

/* =========================================================================
   SHARED CHROME
   ========================================================================= */
var NAV=[
 {label:"Home",href:"/",page:"home",mobileOnly:true},
 {label:"About",group:"about",children:[
   {label:"About Us",href:"/about/",sub:"Our story & mission"},
   {label:"Our Team",href:"/team/",sub:"Founders & directors"},
   {label:"Financial Transparency",href:"/financial-transparency/",sub:"Where the money goes"},
   {label:"Careers",href:"/jobs/",sub:"Join the movement"},
   {label:"Contact",href:"/contact/",sub:"Get in touch"},
   {divider:true},
   {label:"Not For Sale Book",href:"/not-for-sale-book/",sub:"The story behind Not For Sale"}
 ]},
 {label:"Our Causes",group:"causes",children:[
   {label:"Modern-Day Slavery",href:"/learn/what-is-human-trafficking/",sub:"What it is & how we respond"},
   {label:"Social Innovation",href:"/learn/what-is-social-innovation/",sub:"Prevention through enterprise"},
   {label:"Ecocide",href:"/learn/what-is-ecocide/",sub:"Protecting people & planet"},
   {divider:true},
   {label:"All Learn Topics",href:"/learn/",sub:"Explore the Learn hub"}
 ]},
 {label:"Our Work",group:"work",children:[
   {label:"Our Projects",href:"/projects/",sub:"Where we work on the ground"},
   {label:"Our Impact",href:"/impact/",sub:"Results & accountability"},
   {label:"The Impact Stack",href:"/impact-stack/",sub:"How change compounds"},
   {label:"The Montara Circle",href:"/montara-circle/",sub:"Where ideas ignite"},
   {divider:true},
   {label:"Our Partners",href:"/partners/",sub:"Companies fighting with us"}
 ]},
 {label:"News",href:"/news/",page:"news"},
 {label:"Engage",group:"engage",children:[
   {label:"Give",href:"/donate/",sub:"Fund the frontlines"},
   {label:"Book a Speaker",href:"/speak/",sub:"Mark Wexler & Dr. David Batstone"},
   {label:"Press & Media",href:"/press/",sub:"For journalists & producers"},
   {divider:true},
   {label:"Convene",href:"/montara-circle/",sub:"The Montara Circle"}
 ]}
];
var GROUP_PAGES={causes:["explainer"],about:["about","team"],work:["projects","impact","partners"],engage:["speak","press"]};
/* Is this href the page we're on? Matches the exact path or a section parent (e.g. /learn/ on /learn/x/). */
function nfsActive(href){
 if(!href||href==='#')return false;
 try{var a=document.createElement('a');a.href=href;
   var p=(a.pathname||'/').replace(/\/+$/,'')||'/';
   var c=(location.pathname||'/').replace(/\/+$/,'')||'/';
   if(p==='/')return c==='/';
   return p===c||c.indexOf(p+'/')===0;
 }catch(e){return false;}
}
/* Header search ("The Desk"). The button sits before Donate (icon only on phones); the
   palette lives in search.js, loaded the first time search is opened, or when the pointer
   heads for the button, so it costs nothing on page load. Opens with the button, "/" (when
   not typing) and Cmd/Ctrl+K. Without the plugin's search config there is no button. */
function searchOn(){return !!(window.NFS_SEARCH_JS&&CFG.search&&CFG.search.url);}
function searchButton(){
 if(!searchOn())return '';
 var mac=/Mac|iPhone|iPad/.test(navigator.platform||navigator.userAgent||'');
 return '<button class="srch-btn" id="srchBtn" type="button" aria-label="Search the site" aria-haspopup="dialog" aria-keyshortcuts="/ '+(mac?'Meta+K':'Control+K')+'">'
  +'<svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true"><circle cx="11" cy="11" r="6.5" stroke="currentColor" stroke-width="1.9"/><path d="m16 16 4 4" stroke="currentColor" stroke-width="1.9" stroke-linecap="round"/></svg>'
  +'<span>Search</span><kbd>'+(mac?'⌘K':'Ctrl K')+'</kbd></button>';
}
function searchBoot(){
 if(!searchOn())return;
 var loading=null;
 function load(){
  if(window.nfsSearchOpen)return Promise.resolve();
  if(loading)return loading;
  loading=new Promise(function(res,rej){var s=document.createElement('script');s.src=window.NFS_SEARCH_JS;s.async=true;s.onload=res;s.onerror=function(){loading=null;rej();};document.head.appendChild(s);});
  return loading;
 }
 function open(){load().then(function(){if(window.nfsSearchOpen)window.nfsSearchOpen();}).catch(function(){location.href=(CFG.search.all||'/')+'?s=';});}
 document.addEventListener('click',function(e){var b=e.target.closest&&e.target.closest('#srchBtn');if(b){e.preventDefault();open();}});
 document.addEventListener('pointerover',function(e){if(e.target.closest&&e.target.closest('#srchBtn'))load().catch(function(){});},{passive:true});
 document.addEventListener('keydown',function(e){
  var t=document.activeElement,typing=!!(t&&(/^(INPUT|TEXTAREA|SELECT)$/.test(t.tagName)||t.isContentEditable));
  var cmdK=(e.metaKey||e.ctrlKey)&&!e.altKey&&!e.shiftKey&&(e.key==='k'||e.key==='K');
  var slash=e.key==='/'&&!typing&&!e.metaKey&&!e.ctrlKey&&!e.altKey;
  if(cmdK||slash){e.preventDefault();open();}
 });
}
function injectHeader(page){
 var SRC=(window.NFS_MENUS&&NFS_MENUS.primary&&NFS_MENUS.primary.length)?NFS_MENUS.primary:NAV;
 var center=SRC.map(function(n){
   if(n.mobileOnly)return '';
   if(n.children){
     // Only the specific matching dropdown item gets .active — not the parent
     // trigger too, so hovering/landing on a sub-page highlights one thing, not both.
     var dd=n.children.map(function(c){return c.divider?'<div class="divider"></div>':'<a href="'+c.href+'"'+(nfsActive(c.href)?' class="active"':'')+'><span class="lk">'+c.label+'</span>'+(c.sub?'<small>'+c.sub+'</small>':'')+'</a>';}).join('');
     return '<div class="nav-item"><button class="nav-trigger" aria-haspopup="true">'+n.label+'<span class="car"></span></button><div class="dropdown">'+dd+'</div></div>';
   }
   return '<div class="nav-item"><a class="nav-link'+(n.util?' util':'')+((n.page===page||nfsActive(n.href))?' active':'')+'" href="'+n.href+'">'+n.label+'</a></div>';
 }).join('');
 var mob=SRC.map(function(n){
   if(n.children){
     var act=(GROUP_PAGES[n.group]||[]).indexOf(page)>=0||n.children.some(function(c){return nfsActive(c.href);});
     var subs=n.children.filter(function(c){return !c.divider;}).map(function(c){return '<a class="mm-sub'+(nfsActive(c.href)?' active':'')+'" href="'+c.href+'">'+c.label+'</a>';}).join('');
     return '<div class="mm-acc"><button type="button" class="mm-acc-t'+(act?' active':'')+'" aria-expanded="false">'+n.label+'<span class="mm-acc-ic" aria-hidden="true"></span></button><div class="mm-panel"><div class="mm-panel-in">'+subs+'</div></div></div>';
   }
   return '<a class="mm-link'+((n.page===page||nfsActive(n.href))?' active':'')+'" href="'+n.href+'">'+n.label+'</a>';
 }).join('');
 var barHtml='<div class="wrap nav">'+
   '<div class="left"><a class="brand" href="/"><span class="brand-full">'+BRAND+'</span><span class="brand-ico">'+F_MARK+'</span></a></div>'+
   '<div class="center"><nav class="nav-links">'+center+'</nav></div>'+
   '<div class="right">'+searchButton()+'<a class="btn btn-ink" href="'+DONATE+'">Donate</a>'+
   '<button class="burger" id="burger" aria-label="Open menu" aria-expanded="false"><span></span><span></span><span></span></button></div>'+
   '</div>';
 // The scrim + slide-in menu must live OUTSIDE <header> (which has its own
 // z-index/stacking context); inside it, the menu can never paint above page
 // content. We append them to <body> so their z-index actually wins.
 var ovHtml='<div class="mm-scrim" id="mmScrim"></div>'+
   '<aside class="mobile-menu" id="mobileMenu" aria-label="Menu">'+
     '<div class="mm-top">'+
       '<button class="mm-close" id="mmClose" aria-label="Close menu"><span></span><span></span></button></div>'+
     '<nav class="mm-nav">'+mob+'</nav>'+
     '<div class="mm-foot"><a class="btn btn-orange mm-donate" href="'+DONATE+'">Donate</a>'+socialIcons()+'</div>'+
   '</aside>';
 var h=document.getElementById('site-header');
 if(h){
   var el=document.createElement('header');el.id='hdr';el.innerHTML=barHtml;h.replaceWith(el);
   // remove any previously-injected overlay, then mount the fresh one on <body>
   ['mmScrim','mobileMenu'].forEach(function(id){var o=document.getElementById(id);if(o&&o.parentNode)o.parentNode.removeChild(o);});
   var ov=document.createElement('div');ov.innerHTML=ovHtml;
   while(ov.firstChild)document.body.appendChild(ov.firstChild);
 }
}
function injectNewsletter(){
 var n=document.getElementById('site-newsletter'); if(!n)return;
 n.outerHTML='<div class="nl" id="newsletter"><div class="wrap in">'+
  NL_MARK+
  '<h2>Sign Up to Our Newsletter</h2>'+
  '<p>Join our movement and get the latest updates, stories, and ways to take action, straight to your inbox.</p>'+
  '<div class="row"><form id="nlForm" style="display:flex;gap:8px;width:100%"'+(MAILCHIMP_ACTION?(' action="'+MAILCHIMP_ACTION+'" method="post" target="_blank"'):'')+'>'+
   '<input type="text" name="nfs_hp" tabindex="-1" autocomplete="off" style="position:absolute;left:-9999px" aria-hidden="true">'+
   '<input name="EMAIL" type="email" required placeholder="Email Address *" aria-label="Email"><button type="submit">Sign Up</button></form></div></div></div>';
 var form=document.getElementById('nlForm');
 if(form)form.addEventListener('submit',function(e){
   var inp=form.querySelector('input[name=EMAIL]'),email=inp?inp.value.trim():'',hp=form.querySelector('[name=nfs_hp]');
   if(!email)return;
   if(MAILCHIMP_ACTION){nfsSubscribe({source:'newsletter',email:email},null,function(){},function(){});return;} // native submit opens Mailchimp
   e.preventDefault();
   var wrap=form.parentNode;
   nfsSubscribe({source:'newsletter',email:email,nfs_hp:hp?hp.value:''},form.querySelector('button[type=submit]'),
     function(){if(wrap)wrap.innerHTML='<p class="nl-done">Thank you. You are on the list.</p>';},
     function(){nfsSubscribeError(wrap,'nl-err');});
 });
}
/* POST a sign-up to nfs_subscribe and report the server's answer. The form used to say
   "Thank you" before (or without) the request finishing, so failed sign-ups looked fine.
   nfs_hp is the honeypot: the server accepts it silently. The nfs-protected class is not used
   here: that global listener would re-submit the form natively once a reCAPTCHA token arrived;
   nfsRcAppend already adds the token to this request. */
function nfsSubscribe(fields,btn,ok,fail){
 var fd=new FormData(),k,label=btn?btn.textContent:'';
 fd.append('action','nfs_subscribe');fd.append('_nonce',CFG.leadNonce||'');
 for(k in fields){if(Object.prototype.hasOwnProperty.call(fields,k))fd.append(k,fields[k]);}
 if(btn){btn.disabled=true;btn.textContent='Please wait...';}
 function bad(){if(btn){btn.disabled=false;btn.textContent=label;}fail();}
 var rc=(typeof window.nfsRcAppend==='function')?window.nfsRcAppend(fd,'lead'):Promise.resolve();
 rc.then(function(){return fetch(CFG.ajaxUrl||'/wp-admin/admin-ajax.php',{method:'POST',body:fd,credentials:'same-origin',keepalive:true});})
   .then(function(r){return r.json();})
   .then(function(d){if(d&&d.success){ok();}else{bad();}})
   .catch(bad);
}
function nfsSubscribeError(wrap,cls){
 if(!wrap)return;
 var p=wrap.querySelector('.'+cls);
 if(!p){p=document.createElement('p');p.className=cls;p.setAttribute('role','alert');wrap.appendChild(p);}
 p.textContent='Something went wrong and you are not signed up yet. Please try again.';
}
// Plain text into HTML (settings values such as the address).
function escT(s){return String(s==null?'':s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');}
function injectFooter(){
 var f=document.getElementById('site-footer'); if(!f)return;
 var rc=CFG.recaptcha||{};
 var rcNote=rc.enabled?'<div class="fdisclaimer">This site is protected by reCAPTCHA and the Google <a href="https://policies.google.com/privacy" target="_blank" rel="noopener">Privacy Policy</a> and <a href="https://policies.google.com/terms" target="_blank" rel="noopener">Terms of Service</a> apply.</div>':'';
 var brandCol='<div><div class="fbrand">'+F_MARK+'<span class="name">Not For Sale</span></div>'+
  '<p class="fmute">A global movement fighting modern-day slavery and ecocide in <a href="/projects/">'+escT(CFG.countries||'33')+' countries</a>. Building on the <a href="/impact-stack/">frontlines</a> since 2007.</p>'+
  (CFG.address?('<p class="faddr">'+escT(CFG.address)+'</p>'):'')+
  socialIcons()+'</div>';
 var FM=(window.NFS_MENUS&&NFS_MENUS.footer&&NFS_MENUS.footer.length)?NFS_MENUS.footer:null;
 var legalLinks='', linkCols;
 if(FM){
   var cols=[];
   FM.forEach(function(col){
     if((col.label||'').toLowerCase()==='legal'){legalLinks=(col.children||[]).map(function(c){return '<a href="'+c.href+'"'+(nfsActive(c.href)?' class="active"':'')+'>'+c.label+'</a>';}).join('');}
     else{cols.push(col);}
   });
   linkCols=cols.map(function(col){
     var links=(col.children||[]).map(function(c){return '<a href="'+c.href+'"'+(nfsActive(c.href)?' class="active"':'')+'>'+c.label+'</a>';}).join('');
     return '<div><h2>'+col.label+'</h2>'+links+'</div>';
   }).join('');
 } else {
   linkCols=
    '<div><h2>About</h2><a href="/about/">About Us</a><a href="/team/">Our Team</a><a href="/partners/">Our Partners</a><a href="/financial-transparency/">Financial Transparency</a><a href="/jobs/">Jobs</a><a href="/contact/">Contact</a></div>'+
    '<div><h2>Our Causes</h2><a href="/learn/what-is-human-trafficking/">Modern-Day Slavery</a><a href="/learn/what-is-social-innovation/">Social Innovation</a><a href="/learn/what-is-ecocide/">Ecocide</a><a href="/learn/">All Learn Topics</a></div>'+
    '<div><h2>Our Work</h2><a href="/projects/">Our Projects</a><a href="/impact/">Our Impact</a><a href="/impact-stack/">The Impact Stack</a><a href="/montara-circle/">The Montara Circle</a></div>'+
    '<div><h2>Newsroom</h2><a href="/news/">News</a><a href="/human-trafficking-briefing/">The Briefing</a><a href="/press/">Press &amp; Media</a><a href="/not-for-sale-book/">The Book</a></div>'+
    '<div><h2>Get Involved</h2><a href="'+DONATE+'">Donate</a><a href="/speak/">Speak</a><a href="/events/">Events</a><a href="/resources/">Tools &amp; Resources</a><a href="/employer-matching/">Employer Matching</a></div>'+
    '<div><h2>Resources</h2><a href="/report-human-trafficking/">Get Help</a><a href="/faq/">FAQ</a><a href="/llms.txt">llms.txt</a><a href="/sitemap_index.xml">Sitemap</a></div>';
 }
 if(!legalLinks){legalLinks='<a href="/privacy-policy/">Privacy Policy</a><a href="/terms-conditions/">Terms &amp; Conditions</a><a href="/donor-privacy-policy/">Donor Privacy Policy</a>';}
 f.outerHTML='<footer class="site"><div class="wrap">'+
  '<div class="fcols">'+brandCol+linkCols+'</div>'+
  '<div class="fbot"><div class="fbot-legal"><span class="fcopy">© Not For Sale 2026 · 501(c)(3) · EIN 20-5659783</span><span class="flinks">'+legalLinks+'<a href="#" class="fcookie" data-cookie-settings>Cookie Settings</a></span></div>'+
  '<div class="fmark">WE ARE NOT FOR SALE</div></div>'+rcNote+'</div></footer>';
}

/* social icon set (currentColor SVGs) */
var SOCICON={
 ig:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><rect x="3" y="3" width="18" height="18" rx="5"/><circle cx="12" cy="12" r="4"/><circle cx="17.2" cy="6.8" r="1.1" fill="currentColor" stroke="none"/></svg>',
 li:'<svg viewBox="0 0 24 24" fill="currentColor"><path d="M6.94 5a2 2 0 1 1-4 0 2 2 0 0 1 4 0zM3.5 8.5h3.5V21H3.5zM10 8.5h3.35v1.7h.05c.47-.85 1.6-1.75 3.3-1.75 3.53 0 4.18 2.2 4.18 5.05V21h-3.5v-5.6c0-1.33-.02-3.05-1.86-3.05-1.86 0-2.14 1.45-2.14 2.95V21H10z"/></svg>',
 tt:'<svg viewBox="0 0 24 24" fill="currentColor"><path d="M16.5 3c.3 2.1 1.5 3.4 3.5 3.6v2.4c-1.2.1-2.4-.2-3.5-.8v5.7c0 3.3-2.3 5.6-5.4 5.6-2.9 0-5.1-2-5.1-4.9 0-2.9 2.3-4.9 5.2-4.7v2.5c-.4-.1-.8-.2-1.2-.1-1.2.1-2 .9-1.9 2.1.1 1.1 1 1.9 2.1 1.8 1.2-.1 1.9-1 1.9-2.4V3z"/></svg>',
 fb:'<svg viewBox="0 0 24 24" fill="currentColor"><path d="M14 8.5V7c0-.8.5-1 1-1h2V3h-2.5C12 3 10.5 4.7 10.5 7v1.5H8.5V12h2v9H14v-9h2.3l.4-3.5z"/></svg>',
 yt:'<svg viewBox="0 0 24 24" fill="currentColor"><path d="M22.5 6.2s-.3-1.9-1.1-2.7c-1-1.1-2.2-1.1-2.7-1.1C16 2.2 12 2.2 12 2.2s-4 0-6.7.2c-.5 0-1.7.1-2.7 1.1C1.8 4.3 1.5 6.2 1.5 6.2S1.2 8.3 1.2 10.5v2c0 2.2.3 4.3.3 4.3s.3 1.9 1.1 2.7c1 1.1 2.4 1 3 1.1 2.2.2 9.4.3 9.4.3s4 0 6.7-.3c.5 0 1.7-.1 2.7-1.1.8-.8 1.1-2.7 1.1-2.7s.3-2.1.3-4.3v-2C22.8 8.3 22.5 6.2 22.5 6.2zM9.7 14.8V9.2l5.8 2.8-5.8 2.8z"/></svg>'
};
function socialIcons(){
 var s=CFG.social||{};
 var order=[['yt','YouTube'],['ig','Instagram'],['li','LinkedIn'],['tt','TikTok'],['fb','Facebook']];
 var items=order.filter(function(o){return s[o[0]];}).map(function(o){
   return '<a class="fsoc-ico" href="'+s[o[0]]+'" target="_blank" rel="noopener" aria-label="'+o[1]+'">'+SOCICON[o[0]]+'</a>';
 }).join('');
 return items?'<div class="fsoc-icons">'+items+'</div>':'';
}

/* =========================================================================
   COOKIE CONSENT  (region-aware — Google Consent Mode v2 defaults set in wp_head)
   Strict opt-in banner in EU/EEA/UK; a lighter opt-out notice everywhere else.
   Consent is a 3-state value: 'all' | 'analytics' | 'none'  (legacy 'necessary' = none).
   ========================================================================= */
function gtagConsent(){(window.dataLayer=window.dataLayer||[]).push(arguments);}
/* true = strict opt-in region. Prefer the server signal (real IP geo), else timezone, else strict. */
function nfsStrictRegion(){
 try{ if(window.nfsRegionStrict) return window.nfsRegionStrict();
   var tz=(Intl.DateTimeFormat().resolvedOptions().timeZone||'');
   if(/^Europe\/|^Atlantic\/(Canary|Madeira|Azores|Reykjavik|Faroe)$|^Arctic\/Longyearbyen$|^Asia\/(Nicosia|Famagusta)$/.test(tz))return true; if(tz)return false;
 }catch(e){} return true;
}
function nfsConsentGet(){try{var v=localStorage.getItem('nfs_consent');return v==='necessary'?'none':(v||'');}catch(e){return '';}}
function nfsConsentSet(v){try{localStorage.setItem('nfs_consent',v);}catch(e){}}
function applyConsent(state){ /* 'all' | 'analytics' | 'none' */
 var an=(state==='all'||state==='analytics')?'granted':'denied';
 var ad=(state==='all')?'granted':'denied';
 gtagConsent('consent','update',{ad_storage:ad,ad_user_data:ad,ad_personalization:ad,analytics_storage:an});
 if(an==='granted'&&window.nfsLoadClarity)window.nfsLoadClarity();
}
function showCookiebar(){var b=el('cookiebar');if(b)b.classList.add('show');}
function hideCookiebar(){var b=el('cookiebar');if(b)b.classList.remove('show');}
/* Wait for the visitor's live region (nfs-core resolves it from an uncached request; the cached
   page itself carries none) before choosing the strict or slim bar. Settles within ~3s. */
function injectConsent(){
 var ready=window.nfsRegionReady;
 if(ready&&ready.then){ready.then(buildConsent,buildConsent);}else{buildConsent();}
}
function buildConsent(){
 if(el('cookiebar'))return;
 var strict=nfsStrictRegion(), stored=nfsConsentGet();
 var bar=document.createElement('div');bar.className='cookiebar'+(strict?'':' slim');bar.id='cookiebar';
 bar.setAttribute('role','dialog');bar.setAttribute('aria-label','Cookie consent');bar.setAttribute('aria-live','polite');
 if(strict){
   bar.innerHTML='<div class="cookiebar-in">'+
     '<div class="cookiebar-txt"><strong>We value your privacy</strong>'+
     '<p>We use cookies to understand how the site is used and to improve your experience. You can accept all cookies, or continue with only those needed to run the site. See our <a href="/privacy-policy/">Privacy Policy</a>.</p></div>'+
     '<div class="cookiebar-act">'+
       '<button class="btn btn-light" type="button" data-consent="none">Decline</button>'+
       '<button class="btn btn-orange" type="button" data-consent="all">Accept all</button>'+
     '</div></div>';
 }else{
   bar.innerHTML='<div class="cookiebar-in">'+
     '<div class="cookiebar-txt"><p>We use cookies to measure and improve this site. <a href="/privacy-policy/">Privacy Policy</a>.</p></div>'+
     '<div class="cookiebar-act">'+
       '<button class="clink" type="button" data-cookie-settings>Manage cookies</button>'+
       '<button class="cookiebar-x" type="button" data-consent="dismiss" aria-label="Dismiss">×</button>'+
     '</div></div>';
 }
 document.body.appendChild(bar);
 bar.addEventListener('click',function(e){var t=e.target.closest&&e.target.closest('[data-consent]');if(!t)return;
   var c=t.getAttribute('data-consent'); if(c==='dismiss')c='analytics'; /* open region: analytics already on, just remember */
   nfsConsentSet(c);applyConsent(c);hideCookiebar();});
 if(!stored)setTimeout(showCookiebar,700);
}

/* ---- Cookie preferences panel (opened by "Manage cookies" + footer "Cookie Settings") ---- */
function buildPrefs(){
 if(el('cprefs'))return;
 var scrim=document.createElement('div');scrim.className='cprefs-scrim';scrim.id='cprefs-scrim';
 var p=document.createElement('div');p.className='cprefs';p.id='cprefs';
 p.setAttribute('role','dialog');p.setAttribute('aria-modal','true');p.setAttribute('aria-label','Cookie preferences');
 p.innerHTML='<div class="cprefs-hd"><h2>Cookie preferences</h2><button class="x" type="button" data-cprefs-close aria-label="Close">×</button></div>'+
   '<p class="cprefs-intro">Choose what we may measure. You can change this anytime from <b>Cookie Settings</b> in the footer. See our <a href="/privacy-policy/">Privacy Policy</a>.</p>'+
   '<div class="cprefs-row"><div><h3>Essential</h3><p>Needed for the site to load, remember your choices, and keep forms secure. Always on.</p></div><span class="cprefs-always">Always on</span></div>'+
   '<div class="cprefs-row"><div><h3>Analytics &amp; performance</h3><p>Helps us see which stories are useful and fix what’s broken: Google Analytics and Microsoft Clarity. No ads.</p></div>'+
     '<label class="ctg"><input type="checkbox" id="cprefs-analytics"><span class="track"></span><span class="knob"></span></label></div>'+
   '<div class="cprefs-foot"><button class="btn btn-light" type="button" data-cprefs="none">Reject all</button><button class="btn btn-orange" type="button" data-cprefs="save">Save preferences</button></div>';
 document.body.appendChild(scrim);document.body.appendChild(p);
 scrim.addEventListener('click',closePrefs);
 p.addEventListener('click',function(e){
   var t=e.target.closest&&e.target.closest('[data-cprefs],[data-cprefs-close]');if(!t)return;
   if(t.hasAttribute('data-cprefs-close')){closePrefs();return;}
   var a=t.getAttribute('data-cprefs');
   var state=(a==='none')?'none':(el('cprefs-analytics').checked?'analytics':'none');
   nfsConsentSet(state);applyConsent(state);closePrefs();hideCookiebar();
 });
 document.addEventListener('keydown',function(e){if(e.key==='Escape')closePrefs();});
}
function openPrefs(){
 buildPrefs();
 var stored=nfsConsentGet();
 var on=stored?(stored==='all'||stored==='analytics'):!nfsStrictRegion(); /* default: open region on, strict off */
 var cb=el('cprefs-analytics');if(cb)cb.checked=on;
 el('cprefs-scrim').classList.add('open');el('cprefs').classList.add('open');
}
function closePrefs(){var s=el('cprefs-scrim'),p=el('cprefs');if(s)s.classList.remove('open');if(p)p.classList.remove('open');}

/* =========================================================================
   PAGE RENDERERS
   ========================================================================= */
function el(id){return document.getElementById(id);}
function bindAccordion(host){
 host.querySelectorAll('.qa').forEach(function(qa){var a=qa.querySelector('.a');
   if(qa.classList.contains('open'))a.style.maxHeight=a.scrollHeight+'px';
   qa.querySelector('.q').onclick=function(){var open=qa.classList.contains('open');
     host.querySelectorAll('.qa').forEach(function(o){o.classList.remove('open');o.querySelector('.a').style.maxHeight=null;});
     if(!open){qa.classList.add('open');a.style.maxHeight=a.scrollHeight+'px';}};});
}
function renderFaq(){
 var cats=["All"]; FAQLIST.forEach(function(f){if(cats.indexOf(f.cat)<0)cats.push(f.cat);});
 var state={cat:"All",q:""};
 function cnt(c){return c==="All"?FAQLIST.length:FAQLIST.filter(function(f){return f.cat===c;}).length;}
 var nav=el('catNav');
 if(nav){nav.innerHTML=cats.map(function(c){return '<button data-c="'+c+'" class="'+(c==="All"?'on':'')+'">'+c+'<span class="ct">'+cnt(c)+'</span></button>';}).join('');
   nav.querySelectorAll('button').forEach(function(b){b.onclick=function(){state.cat=b.dataset.c;nav.querySelectorAll('button').forEach(function(x){x.classList.toggle('on',x===b);});draw();};});}
 var search=el('faqSearch'); if(search)search.addEventListener('input',function(){state.q=this.value.toLowerCase().trim();draw();});
 function item(f){return '<div class="qa"><div class="q">'+f.q+'<span class="ic">+</span></div><div class="a"><p>'+f.a+'</p></div></div>';}
 function draw(){
   var list=FAQLIST.filter(function(f){return (state.cat==="All"||f.cat===state.cat)&&(!state.q||(f.q+' '+f.a).toLowerCase().indexOf(state.q)>=0);});
   var host=el('faqList'); if(!host)return;
   if(!list.length){host.innerHTML='<div class="help-empty">No questions match “'+state.q+'”. Try a different search.</div>';return;}
   var html='';
   if(state.cat==="All"&&!state.q){
     cats.slice(1).forEach(function(c){var items=list.filter(function(f){return f.cat===c;});if(items.length)html+='<div class="grouplabel">'+c+'</div>'+items.map(item).join('');});
   } else { html=list.map(item).join(''); }
   host.innerHTML=html; bindAccordion(host);
 }
 draw();
}
function renderNews(){
 var NEWS=[FEAT].concat(LATEST).concat(ARTS);
 var active="All";
 var fbox=el('newsFilters');
 if(fbox){["All"].concat(Object.keys(CAT).filter(function(c){return c!=="Social Enterprise";})).forEach(function(c){
   var b=document.createElement('button');b.className='chip'+(c==="All"?' on':'');b.textContent=c;
   b.onclick=function(){active=c;[].forEach.call(fbox.children,function(x){x.classList.toggle('on',x.textContent===c);});draw();};fbox.appendChild(b);});}
 function draw(){var list=active==="All"?NEWS:NEWS.filter(function(a){return a.cat===active;});
   var g=el('newsGrid');if(!g)return;g.innerHTML='';var cnt=el('newsCount');if(cnt)cnt.textContent=list.length+' stories';
   list.forEach(function(a){var g2=document.createElement('a');g2.className='art';g2.href='/news/';
     g2.innerHTML='<div class="ph">'+scene(a.title,a.cat)+(a.h<8?'<span class="new">New</span>':'')+'</div>'+
      '<div class="b">'+tagHTML(a.cat)+'<div class="t">'+a.title+'</div>'+(a.dek?'<div class="dek">'+a.dek+'</div>':'')+
      '<div class="am"><span>'+(a.when||rel(a.h))+'</span><span>'+a.read+' min read →</span></div></div>';g.appendChild(g2);});}
 draw();
}
function renderBlog(){
 var bav=el('blogAuthorAv'); if(bav)bav.insertAdjacentHTML('afterbegin',avatar("Field Report"));
 var cov=el('postCover'); if(cov)cov.insertAdjacentHTML('afterbegin',scene(FEAT.title,FEAT.cat));
 document.querySelectorAll('.inlinefig').forEach(function(fig,i){fig.insertAdjacentHTML('afterbegin',scene("inline-"+i,"Cyber Scams"));});
 var ab=el('authorAv'); if(ab)ab.insertAdjacentHTML('afterbegin',avatar("Field Report"));
 var rel2=el('related'); if(rel2)rel2.innerHTML=ARTS.slice(0,3).map(function(a){return '<a class="art" href="/news/"><div class="ph">'+scene(a.title,a.cat)+'</div><div class="b">'+tagHTML(a.cat)+'<div class="t">'+a.title+'</div><div class="am"><span>'+a.read+' min read</span><span>→</span></div></div></a>';}).join('');
}


/* =========================================================================
   UNIVERSAL BEHAVIOURS
   ========================================================================= */
function countUp(elm,dur){var to=+elm.dataset.to,pre=elm.dataset.prefix||'',suf=elm.dataset.suffix||'',cm=elm.dataset.comma,dec=+(elm.dataset.decimals||0);
 var fmt=function(v){var x=dec?(+v).toFixed(dec):Math.round(v);if(cm){x=(+x).toLocaleString('en-US',{minimumFractionDigits:dec,maximumFractionDigits:dec});}return x;};var st=performance.now();
 (function s(n){var t=Math.min(1,(n-st)/dur),e=1-Math.pow(1-t,3);elm.textContent=pre+fmt(to*e)+(t>.5?suf:'');if(t<1)requestAnimationFrame(s);else elm.textContent=pre+fmt(to)+suf;})(st);}

/* field-update like + share (delegated) */
function markLikedUpdates(){
 var done={};try{done=JSON.parse(localStorage.getItem('nfs_liked')||'{}');}catch(_){}
 document.querySelectorAll('.ulike').forEach(function(lk){var id=lk.getAttribute('data-id');if(id&&done[id])lk.classList.add('on');});
}

function bindUpdateActions(){
 markLikedUpdates();
 document.addEventListener('click',function(e){
  var lk=e.target.closest&&e.target.closest('.ulike');
  if(lk){var id=lk.getAttribute('data-id');if(!id)return;
    var done={};try{done=JSON.parse(localStorage.getItem('nfs_liked')||'{}');}catch(_){}
    var liked=!!done[id];var c=lk.querySelector('.c');var n=c?parseInt(c.textContent||'0',10):0;
    if(liked){delete done[id];lk.classList.remove('on');if(c)c.textContent=Math.max(0,n-1);}
    else{done[id]=1;lk.classList.add('on');if(c)c.textContent=n+1;}
    try{localStorage.setItem('nfs_liked',JSON.stringify(done));}catch(_){}
    try{var fd=new FormData();fd.append('action','nfs_update_like');fd.append('id',id);fd.append('act',liked?'unlike':'like');fd.append('_nonce',CFG.leadNonce||'');
      fetch(CFG.ajaxUrl,{method:'POST',body:fd}).then(function(r){return r.json();}).then(function(d){if(d&&d.success&&d.data&&typeof d.data.likes==='number'&&c)c.textContent=d.data.likes;}).catch(function(){});}catch(_){}
    return;}
  var mo=e.target.closest&&e.target.closest('.umore');
  if(mo){var card=mo.closest('.ucard');if(card){var clip=card.querySelector('.uclip'),full=card.querySelector('.ufull');if(clip)clip.hidden=true;if(full)full.hidden=false;}mo.parentNode&&mo.parentNode.removeChild(mo);return;}
  var sh=e.target.closest&&e.target.closest('.ushare');
  if(sh){e.preventDefault();var an=sh.getAttribute('data-anchor');var url=sh.getAttribute('data-share')||(an?location.origin+location.pathname+'#'+an:location.href),title=sh.getAttribute('data-title')||document.title;
    if(navigator.share){navigator.share({title:title,url:url}).catch(function(){});}
    else{try{navigator.clipboard.writeText(url);var o=sh.innerHTML;sh.classList.add('copied');sh.innerHTML='Copied';setTimeout(function(){sh.classList.remove('copied');sh.innerHTML=o;},1400);}catch(_){}}
    return;}
 });
}


// The GoFundMe/Classy donate modal can reset the page scroll to the top when it closes
// (and may reload the page with ?campaign=). Preserve and restore the reader's position.
function preserveDonateScroll(){
 var KEY='nfs_donate_scroll',savedY=null,watching=false;
 // Restore after a reload the donate link may have triggered.
 try{var stored=sessionStorage.getItem(KEY);
  if(stored!==null){sessionStorage.removeItem(KEY);var y0=parseInt(stored,10)||0;
   if(y0>0&&/[?&]campaign=/.test(location.search)){window.addEventListener('load',function(){setTimeout(function(){window.scrollTo(0,y0);},0);});}}
 }catch(_){}
 function bodyLocked(){var s;try{s=getComputedStyle(document.body);}catch(_){return false;}
  return s.position==='fixed'||s.overflow==='hidden'||document.documentElement.style.overflow==='hidden';}
 function watchModal(){var wasLocked=false,t0=Date.now();
  var iv=setInterval(function(){
   if(bodyLocked()){wasLocked=true;return;}
   if(wasLocked){clearInterval(iv);watching=false;try{sessionStorage.removeItem(KEY);}catch(_){}
    if(savedY!=null){var y=savedY;savedY=null;window.scrollTo(0,y);setTimeout(function(){window.scrollTo(0,y);},60);}}
   if(Date.now()-t0>180000){clearInterval(iv);watching=false;}
  },150);}
 document.addEventListener('click',function(e){
  var a=e.target.closest&&e.target.closest('a[href*="campaign="]');if(!a)return;
  savedY=window.scrollY||window.pageYOffset||0;
  try{sessionStorage.setItem(KEY,String(savedY));}catch(_){}
  if(!watching){watching=true;watchModal();}
 },true);
}

// Article reading experience: auto table-of-contents (scroll-spy + smooth jump) and copy-link.
function enhanceArticle(){
 var art=document.getElementById('nfsArticle'); if(!art)return;
 var heads=[].slice.call(art.querySelectorAll('h2, h3'));
 var toc=document.querySelector('.post-toc'),nav=document.querySelector('.post-toc-nav');
 if(toc&&nav&&heads.length>=3){
   var items=[];
   heads.forEach(function(h,i){
     if(!h.id){var base=(h.textContent||'').toLowerCase().replace(/[^a-z0-9]+/g,'-').replace(/^-+|-+$/g,'').slice(0,40);h.id=(base||'section')+'-'+i;}
     var a=document.createElement('a');a.href='#'+h.id;a.textContent=h.textContent;a.className='toc-'+h.tagName.toLowerCase();a.setAttribute('data-t',h.id);
     nav.appendChild(a);items.push({a:a,h:h});
   });
   toc.hidden=false;
   nav.addEventListener('click',function(e){var a=e.target.closest('a');if(!a)return;e.preventDefault();var t=document.getElementById(a.getAttribute('data-t'));if(t)window.scrollTo({top:t.getBoundingClientRect().top+window.scrollY-90,behavior:'smooth'});});
   var spy=function(){var y=window.scrollY+130,cur=items[0];items.forEach(function(it){if(it.h.getBoundingClientRect().top+window.scrollY<=y)cur=it;});items.forEach(function(it){it.a.classList.toggle('on',it===cur);});};
   window.addEventListener('scroll',perFrame(spy),{passive:true});spy();
 }
 var copy=document.querySelector('.pshcopy');
 if(copy){copy.addEventListener('click',function(){var u=copy.getAttribute('data-copy')||location.href;try{navigator.clipboard.writeText(u);copy.classList.add('copied');var lab=copy.getAttribute('aria-label');copy.setAttribute('aria-label','Copied');setTimeout(function(){copy.classList.remove('copied');copy.setAttribute('aria-label',lab);},1400);}catch(_){}});}
}


// Count a story view once per browser session (powers the news "Most popular" sort).
function countStoryView(){
 var art=document.querySelector('article[data-story-id]'); if(!art)return;
 var id=art.getAttribute('data-story-id'); if(!id)return;
 var key='nfs_viewed_'+id;
 try{if(sessionStorage.getItem(key))return;sessionStorage.setItem(key,'1');}catch(_){}
 try{var fd=new FormData();fd.append('action','nfs_story_view');fd.append('id',id);
   fetch(CFG.ajaxUrl,{method:'POST',body:fd,keepalive:true}).catch(function(){});}catch(_){}
}

// Runs fn at most once per frame however fast scroll events fire (the handlers read layout).
function perFrame(fn){var queued=false;return function(){if(queued)return;queued=true;requestAnimationFrame(function(){queued=false;fn();});};}

// Keeps Tab and Shift+Tab inside an open dialog or menu.
function trapTab(e,box){var fs=[].filter.call(box.querySelectorAll('a[href],button,input:not([type=hidden]),select,textarea,[tabindex="0"]'),function(x){return !x.disabled&&x.getAttribute('tabindex')!=='-1'&&x.offsetParent!==null;});
 if(!fs.length)return;var first=fs[0],last=fs[fs.length-1],a=document.activeElement;
 if(!box.contains(a)){e.preventDefault();first.focus();}else if(e.shiftKey&&a===first){e.preventDefault();last.focus();}else if(!e.shiftKey&&a===last){e.preventDefault();first.focus();}}

// Keyboard and screen-reader support for the parts the markup leaves out.
function a11y(){
 // FAQ questions are <div>s with click handlers: make them focusable buttons that report their state.
 var faqState=function(){document.querySelectorAll('.qa > .q').forEach(function(q){if(q.tagName!=='BUTTON'){q.setAttribute('role','button');q.setAttribute('tabindex','0');}q.setAttribute('aria-expanded',q.parentNode.classList.contains('open')?'true':'false');});};
 faqState();
 document.addEventListener('keydown',function(e){var q=e.target.closest&&e.target.closest('.qa > .q');if(q&&(e.key==='Enter'||e.key===' ')){e.preventDefault();q.click();}});
 document.addEventListener('click',function(e){if(e.target.closest&&e.target.closest('.qa > .q'))setTimeout(faqState,0);});
 // Header dropdowns open on hover/focus (CSS): say so, and let Escape close one.
 document.querySelectorAll('.nav-item').forEach(function(it){var t=it.querySelector('.nav-trigger');if(!t)return;
   var set=function(){setTimeout(function(){t.setAttribute('aria-expanded',(!it.classList.contains('nav-closed')&&it.matches(':hover,:focus-within'))?'true':'false');},0);};
   it.addEventListener('mouseenter',function(){it.classList.remove('nav-closed');set();});it.addEventListener('mouseleave',set);
   it.addEventListener('focusin',set);it.addEventListener('focusout',function(e){if(!it.contains(e.relatedTarget))it.classList.remove('nav-closed');set();});
   t.addEventListener('click',function(){it.classList.remove('nav-closed');set();});set();});
 document.addEventListener('keydown',function(e){if(e.key!=='Escape')return;var it=document.activeElement&&document.activeElement.closest&&document.activeElement.closest('.nav-item');
   if(it){var t=it.querySelector('.nav-trigger');it.classList.add('nav-closed');if(t){t.focus();t.setAttribute('aria-expanded','false');}}});
 // The site's form modals (partner, speaker, events): focus moves in when one opens and
 // back when it closes, Tab stays inside, Escape closes. The press form does its own.
 document.querySelectorAll('.nfs-modal-scrim:not(#prDesk)').forEach(function(sc){var opener=null;
   new MutationObserver(function(){if(sc.classList.contains('open')){if(!sc.contains(document.activeElement)){opener=document.activeElement;var f=sc.querySelector('input:not([type=hidden]):not([tabindex="-1"]),select,textarea,button');
       // retried: while the modal is still fading in it cannot take focus yet
       var go=function(n){if(!f)return;f.focus();if(document.activeElement!==f&&n<6)setTimeout(function(){go(n+1);},100);};setTimeout(function(){go(0);},60);}}
     else if(opener){if(opener.focus)opener.focus();opener=null;}}).observe(sc,{attributes:true,attributeFilter:['class']});});
 document.addEventListener('keydown',function(e){var sc=document.querySelector('.nfs-modal-scrim.open:not(#prDesk)');if(!sc)return;
   if(e.key==='Escape'){var x=sc.querySelector('.x,[data-close]');if(x)x.click();return;}
   if(e.key==='Tab')trapTab(e,sc);});
}

// Runs one setup step. A step that throws is logged and skipped, so the steps after it
// (above all the reveals, which make .fade content visible) still run.
function safe(fn){try{fn();}catch(err){if(window.console&&console.error)console.error('[papingu]',err);}}

function init(){
 var page=document.body.getAttribute('data-page');
 safe(function(){injectHeader(page);}); [searchBoot,injectNewsletter,injectFooter,injectConsent,bindUpdateActions,preserveDonateScroll,countStoryView,enhanceArticle].forEach(safe);
 // open the cookie preferences panel from any [data-cookie-settings] trigger (footer link, notice, privacy page)
 document.addEventListener('click',function(e){var t=e.target.closest&&e.target.closest('[data-cookie-settings]');if(t){e.preventDefault();openPrefs();}});
 // Desktop nav: the dropdown opens on :hover or :focus-within. A mouse click on a
 // trigger used to leave it focused, so it stayed open while hovering a second menu
 // showed two panels at once. Suppressing focus on mousedown keeps hover in charge for
 // mouse users; Tab still focuses the trigger normally, so keyboard access is unchanged.
 document.addEventListener('mousedown',function(e){
   var t=e.target.closest&&e.target.closest('.nav-trigger');
   if(t){e.preventDefault();if(document.activeElement&&document.activeElement.blur)document.activeElement.blur();}
 });
 safe(function(){document.querySelectorAll('.flame').forEach(function(fl){if(!fl.innerHTML.trim())fl.innerHTML=FLAME;});});
 // mobile menu
 safe(function(){
 var burger=el('burger'),menu=el('mobileMenu'),scrim=el('mmScrim'),closeb=el('mmClose');
 function setMenu(o){if(menu)menu.classList.toggle('open',o);if(scrim)scrim.classList.toggle('open',o);if(burger){burger.classList.toggle('x',o);burger.setAttribute('aria-expanded',o);}document.body.classList.toggle('lock',o);
   // Keyboard: focus moves into the menu when it opens and back to the burger when it closes.
   if(o){if(closeb)setTimeout(function(){closeb.focus();},60);}else if(menu&&burger&&menu.contains(document.activeElement)){burger.focus();}}
 if(burger&&menu){
   burger.addEventListener('click',function(){setMenu(!menu.classList.contains('open'));});
   if(closeb)closeb.addEventListener('click',function(){setMenu(false);});
   if(scrim)scrim.addEventListener('click',function(){setMenu(false);});
   // Escape closes the open menu, and Tab stays inside it while it is open.
   document.addEventListener('keydown',function(e){if(!menu.classList.contains('open'))return;
     if(e.key==='Escape'){setMenu(false);return;}
     if(e.key==='Tab')trapTab(e,menu);});
   menu.querySelectorAll('a').forEach(function(a){a.addEventListener('click',function(){setMenu(false);});});
   // collapsible submenus (Causes, About): click parent to expand; only one open at a time
   menu.querySelectorAll('.mm-acc-t').forEach(function(btn){
     btn.addEventListener('click',function(){
       var acc=btn.parentNode,panel=acc.querySelector('.mm-panel'),open=acc.classList.contains('open');
       menu.querySelectorAll('.mm-acc.open').forEach(function(o){if(o!==acc){o.classList.remove('open');o.querySelector('.mm-acc-t').setAttribute('aria-expanded','false');o.querySelector('.mm-panel').style.maxHeight=null;}});
       if(open){acc.classList.remove('open');btn.setAttribute('aria-expanded','false');panel.style.maxHeight=null;}
       else{acc.classList.add('open');btn.setAttribute('aria-expanded','true');panel.style.maxHeight=panel.scrollHeight+'px';}
     });
   });
 }
 });
 // Only these page types still render in the browser; the rest are server-rendered by the plugin.
 var RENDER={news:renderNews,faq:renderFaq,blog:renderBlog};
 if(page&&Object.prototype.hasOwnProperty.call(RENDER,page))safe(RENDER[page]);
 safe(a11y);

 // reveals
 safe(function(){
   window.nfsFadeOn=1; // tells the <head> switch this script started
   var de=document.documentElement;
   if(!de.classList.contains('js-fade')){
     // Started late: the page has been showing everything. Keep what is on screen as it is,
     // and let only what is further down fade in.
     var vh=window.innerHeight||de.clientHeight;
     document.querySelectorAll('.fade').forEach(function(f){var r=f.getBoundingClientRect();if(r.top<vh&&r.bottom>0)f.classList.add('in','fade-now');});
     de.classList.add('js-fade');
   }
   var rIO=new IntersectionObserver(function(es){es.forEach(function(e){if(e.isIntersecting){e.target.classList.add('in');rIO.unobserve(e.target);}});},{threshold:.12});
   document.querySelectorAll('.fade:not(.in)').forEach(function(e){rIO.observe(e);});
 });
 // count-up strips
 // The numbers are printed in full in the HTML (they must read right before this runs). A strip
 // already on screen keeps them; one further down starts from zero and counts up into view.
 safe(function(){var vh=window.innerHeight||document.documentElement.clientHeight;document.querySelectorAll('[data-countgroup]').forEach(function(grp){
   var gr=grp.getBoundingClientRect(),zero=[].some.call(grp.querySelectorAll('.n'),function(n){return n.dataset.to&&/^\D*0\D*$/.test(n.textContent.trim());});
   if(gr.top<vh&&gr.bottom>0&&!zero)return; // (a strip still printed as "0" by older markup counts up as before)
   [].forEach.call(grp.querySelectorAll('.n'),function(n){if(n.dataset.to)n.textContent=(n.dataset.prefix||'')+'0';});
   var sIO=new IntersectionObserver(function(es){es.forEach(function(e){if(e.isIntersecting){[].forEach.call(e.target.querySelectorAll('.n'),function(n,i){if(n.dataset.to)setTimeout(function(){countUp(n,1400);},i*120);});sIO.disconnect();}});},{threshold:.4});
   sIO.observe(grp);});});
 // back-to-top button
 var toTop=document.createElement('button');toTop.id='toTop';toTop.type='button';toTop.setAttribute('aria-label','Back to top');
 toTop.innerHTML='<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 19V5M6 11l6-6 6 6"/></svg>';
 toTop.addEventListener('click',function(){window.scrollTo({top:0,behavior:'smooth'});});
 document.body.appendChild(toTop);
 // nav stick + progress bar + to-top
 var bar=el('bar');
 function onScroll(){var hdr=el('hdr');if(hdr)hdr.classList.toggle('stuck',window.scrollY>24);
   if(bar){var h=document.documentElement.scrollHeight-window.innerHeight;bar.style.width=(h>0?window.scrollY/h*100:0)+'%';}
   toTop.classList.toggle('show',window.scrollY>400);}
 window.addEventListener('scroll',perFrame(onScroll),{passive:true});onScroll();
}
if(document.readyState!=='loading')init();else document.addEventListener('DOMContentLoaded',init);
})();
