const TZ="Asia/Shanghai", DATA_URL=new URL("events.json",location.href).toString();
    const SUPPORT_KEY="codex-reset-support-v2", BASE_PCT=42, STEP=.4;
    const SEEDED=[
      ["2102463847714247142","2026-09-22T18:23:00Z","banked","GPT-6 Sol and Luna are out. We are loading a banked reset into all accounts of our Plus, Pro and Business users."],
      ["2102254445082116335","2026-09-22T04:31:00Z","global","Ladies and gentlemen... start... your... ENGINES. We are almost Tuesday and I promised a reset for Tuesday."],
      ["2098685367058612394","2026-09-12T08:09:17Z","global","Reset all propagated. Sweet dreams."],
      ["2098612714704891959","2026-09-12T03:20:36Z","global","Hi Astra users. A reset is also landing by midnight today."],
      ["2097752790177370535","2026-09-09T18:23:34Z","banked","Banked resets not fully applying. Getting another one."],
      ["2097174560412246215","2026-09-08T04:05:53Z","global","All reset for everyone. Enjoy the week with Astra."],
      ["2097043464538264003","2026-09-07T19:24:57Z","global","Global reset for all paid subscriptions. Lands around 6pm PST today."],
      ["2096035437299237298","2026-09-05T00:39:25Z","banked","Full banked reset today for Plus, Pro and Business."],
      ["2095979536043401428","2026-09-04T20:57:17Z","banked","Covered with a banked reset. Lands by end of day."],
      ["2095651088502591861","2026-09-03T23:12:09Z","banked","One banked reset for every day without Astra."],
      ["2094252447271366730","2026-08-31T02:34:27Z","global","25M active users. Reset usage for all paid subscriptions."],
      ["2093801758665715784","2026-08-29T20:43:34Z","global","Reseting usage for all paid users of Codex and ChatGPT Work."],
      ["2091688655828246890","2026-08-24T00:46:51Z","global","Reset has been propagated to accounts."],
      ["2090964822422949999","2026-08-22T00:50:36Z","banked","The banked reset has landed."],
      ["2090947196107764189","2026-08-21T23:40:34Z","banked","The banked reset will be there by 8pm PST."],
      ["2082317452755751098","2026-07-29T04:09:02Z","global","Reset usage limits for all ChatGPT Work and Codex users."],
      ["2081940052154933696","2026-07-28T03:09:23Z","global","Usage limits have been reset for all paid users."],
      ["2081096447718723984","2026-07-25T19:17:12Z","global","Reset usage limits for all Codex and ChatGPT Work users."],
      ["2079609157934886975","2026-07-21T16:47:15Z","global","10M! New usage reset for paid users."],
      ["2078320950488297917","2026-07-18T03:28:22Z","global","Oops... I did it again. Reset usage limits for all paid users."],
      ["2076735790567338203","2026-07-13T18:29:31Z","banked","Added a banked reset to everyone's account to celebrate 7M."],
      ["2076418567143408112","2026-07-12T21:28:59Z","banked","Added a banked reset to users in the failed window."],
      ["2075820987833274448","2026-07-11T05:54:25Z","global","Another usage limit reset for all ChatGPT Work and Codex users."],
      ["2075641131002700120","2026-07-10T17:59:43Z","global","Reset usage limits across Codex and ChatGPT Work."],
      ["2075452680760443190","2026-07-10T05:30:53Z","global","Reset the rate limits again (twice) over the next 24 hours."],
      ["2075330198887940337","2026-07-09T21:24:11Z","global","Full reset of usage limits. Propagating in the next hour."],
      ["2071740419030053227","2026-06-29T23:39:41Z","global","Fully reset again and credit one additional reset into your bank."],
      ["2071381664853319742","2026-06-28T23:54:07Z","global","Reset everyone's Codex usage limits. Hard reset."],
      ["2070653282440405046","2026-06-26T23:39:48Z","global","Usage reset on the house for all Codex users."],
      ["2062329981548802523","2026-06-04T00:25:58Z","global","Reset usage limits for Codex across all paid plans."],
      ["2061106703446450392","2026-05-31T15:25:06Z","global","Usage limits reset for all paid ChatGPT subscriptions."],
      ["2058280452851638313","2026-05-23T20:14:35Z","global","Reset usage limits for all accounts."],
      ["2055707616605835333","2026-05-16T17:51:03Z","global","Usage limits reset across all paid plans."],
      ["2049009422794408285","2026-04-28T06:14:49Z","global","Enjoy the Codex usage limit reset."],
      ["2048997818673537399","2026-04-28T05:28:43Z","global","Reset Codex rate limits for ALL paid plans."],
      ["2046602907077038501","2026-04-21T14:52:11Z","global","4M users. Reset the rate limits again in a few hours."],
      ["2044943514832871564","2026-04-17T00:58:21Z","global","1-year anniversary. Codex reset its own rate limits."],
      ["2042067902392942790","2026-04-09T02:31:42Z","global","To celebrate 3M I'll reset again tomorrow."],
      ["2041655710346572085","2026-04-07T23:13:48Z","global","3M users. Resetting rate limits."],
      ["2039248564967424483","2026-04-01T07:48:39Z","global","Resetting usage limits for all plans."],
      ["2037346989244096581","2026-03-27T01:52:28Z","global","Reset Codex usage limits across all plans."],
      ["2004100061933064395","2025-12-25T08:01:03Z","global","Reset rate limits and lift usage to 2X until Jan 1."],
      ["2002137269134819610","2025-12-19T22:01:37Z","global","Rewrote usage tracking and reset usage limits."],
      ["2001114683047317723","2025-12-17T02:18:14Z","global","Reset everyone's usage limits."],
      ["1995988609896513743","2025-12-02T22:49:02Z","global","Reset the usage limits for everyone in Codex."]
    ].map(([id,at,type,text])=>({id,at,type,text,url:`https://x.com/thsottiaux/status/${id}`}));

    let events=SEEDED.slice(), view=new Date(), target=null, anchorTime=null, predStart=null, predEnd=null, windowPassed=false, originalH1="";
    const $=id=>document.getElementById(id);
    const fmt=iso=>new Date(iso).toLocaleString("zh-CN",{timeZone:TZ,hour12:false});
    const dateOnly=d=>d.toLocaleDateString("zh-CN",{timeZone:TZ,month:"long",day:"numeric"});
    const ymd=iso=>new Intl.DateTimeFormat("en-CA",{timeZone:TZ,year:"numeric",month:"2-digit",day:"2-digit"}).format(new Date(iso));
    const keyOf=d=>new Intl.DateTimeFormat("en-CA",{timeZone:TZ}).format(d);
    const addDays=(d,n)=>new Date(d.getTime()+n*864e5);
    const esc=s=>String(s).replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;","\"":"&quot;","'":"&#39;"}[c]));

    function renderSupport(){
      const used=localStorage.getItem(SUPPORT_KEY)==="1";
      const pct=Math.min(99.9,BASE_PCT+Number(localStorage.getItem(SUPPORT_KEY+"-extra")||0));
      $("supportPct").textContent=pct.toFixed(1).replace(/\.0$/,"")+"%";
      $("supportBtn").textContent=used?"已支持":"支持预测"; $("supportBtn").disabled=used;
    }
    function tick(){
      if(!target){
        $("hours").textContent="--"; $("minutes").textContent="--";
        ["d","h","m","s"].forEach(id=>$(id).textContent="--");
        $("progressLabel").textContent="剩余 --%"; $("progressFill").style.width="0%";
        return;
      }
      const now=Date.now(), passed=now>target;
      if(passed!==windowPassed){
        windowPassed=passed;
        const h1=document.querySelector(".countdown h1");
        if(h1){ if(!originalH1)originalH1=h1.textContent; h1.textContent=passed?"预测窗口已结束":originalH1; }
        const clock=document.querySelector(".clock");
        if(clock)clock.classList.toggle("waiting",passed);
        const panel=document.querySelector(".countdown");
        let msg=panel?panel.querySelector(".waiting-msg"):null;
        if(passed&&!msg){ msg=document.createElement("p"); msg.className="waiting-msg"; msg.textContent="等待官方重置公告…"; if(clock)clock.parentNode.insertBefore(msg,clock.nextSibling); }
        else if(!passed&&msg){ msg.remove(); }
      }
      if(passed){
        const daysPast=Math.floor((now-target)/864e5);
        $("hours").textContent=daysPast; $("minutes").textContent="0";
        $("d").textContent=daysPast;
        $("progressFill").style.width="100%"; $("progressLabel").textContent="已过 "+daysPast+" 天";
        return;
      }
      const diff=target-now;
      const totalHours=Math.floor(diff/36e5);
      const minutes=Math.floor((diff%36e5)/6e4);
      $("hours").textContent=totalHours;
      $("minutes").textContent=String(minutes).padStart(2,"0");
      const vals=[Math.floor(diff/864e5),Math.floor(diff%864e5/36e5),Math.floor(diff%36e5/6e4),Math.floor(diff%6e4/1000)];
      ["d","h","m","s"].forEach((id,i)=>$(id).textContent=String(vals[i]).padStart(2,"0"));
      const totalCycle=24*3600*1000;
      const elapsed=totalCycle-diff;
      const usedPct=Math.min(100,Math.max(0,elapsed/totalCycle*100));
      $("progressFill").style.width=usedPct+"%";
      $("progressLabel").textContent="剩余 "+Math.round(100-usedPct)+"%";
    }
    function renderCalendar(){
      const year=view.getFullYear(),month=view.getMonth(); $("monthTitle").textContent=`${year}年 ${month+1}月`;
      const start=(new Date(year,month,1).getDay()+6)%7, total=new Date(year,month+1,0).getDate(), today=keyOf(new Date());
      $("days").innerHTML="";
      for(let i=0;i<start;i++) $("days").insertAdjacentHTML("beforeend",'<div class="day empty"></div>');
      for(let n=1;n<=total;n++){
        const key=`${year}-${String(month+1).padStart(2,"0")}-${String(n).padStart(2,"0")}`, hits=events.filter(e=>ymd(e.at)===key);
        const cell=document.createElement("div"); cell.className="day"+(key===today?" today":"");
        cell.innerHTML=`<span class="num">${n}</span>`;
        if(hits.length){ const item=hits.find(e=>e.type==="global")||hits[0]; cell.classList.add("has-event"); cell.innerHTML+=`<span class="event-tag">${item.type==="global"?"全员重置":"重置卡"}</span>`; cell.tabIndex=0; cell.role="link"; cell.onclick=()=>window.open(item.url,"_blank","noopener"); cell.onkeydown=e=>{if(e.key==="Enter")cell.click()}; }
        else if(predStart&&key>=keyOf(predStart)&&key<=keyOf(predEnd)){
          const missed=windowPassed&&key<=today;
          cell.classList.add(missed?"pred-missed":"predicted");
          cell.innerHTML+=`<i class="pred-dot" title="${missed?"预测窗口（已过未重置）":"预测窗口"}"></i>`;
        }
        $("days").appendChild(cell);
      }
    }
    function render(){
      events.sort((a,b)=>new Date(b.at)-new Date(a.at)); const last=events.find(e=>e.type==="global");
      $("eventCount").textContent=events.length; $("globalCount").textContent=events.filter(e=>e.type==="global").length;
      if(last){
        const anchor=new Date(last.at); anchorTime=anchor.getTime(); predStart=addDays(anchor,4); predEnd=addDays(anchor,7); target=Date.now()+24*3600*1000;
        const daysSinceAnchor=Math.floor((Date.now()-anchor)/864e5);
        $("daysAgo").textContent=Math.max(0,daysSinceAnchor)+" 天前"; $("lastAt").textContent=fmt(last.at); $("lastLink").href=last.url;
        windowPassed=Date.now()>target;
      }
      $("feedCount").textContent=events.length+" 条";
      $("feed").innerHTML=events.map(e=>{
        const cat=classifyTweet(e.text,e.type);
        return `<a class="feed-item" href="${esc(e.url)}" target="_blank" rel="noreferrer"><div class="feed-meta"><span class="kind ${cat.cls}">${cat.label}</span><span>${fmt(e.at)}</span></div><div class="feed-title">${esc(e.text)}</div><span class="feed-open">查看原文 ↗</span></a>`;
      }).join("");
      renderProbability();
      renderCalendar(); tick();
    }
    async function load(){
      try{
        const r=await fetch(DATA_URL,{cache:"no-store"});
        if(!r.ok) throw Error(r.status);
        const data=await r.json();
        const list=(data.events||data).filter(e=>e&&e.at);
        if(list.length) events=list;
        $("src").textContent=data.source||"events.json";
        $("updatedAt").textContent=data.updated_at?fmt(data.updated_at):"—";
      }catch(err){
        $("src").textContent="内置数据";
        $("updatedAt").textContent="—";
        console.warn("events.json 加载失败，使用内置记录", err);
      }
      render();
    }
    $("prev").onclick=()=>{view.setMonth(view.getMonth()-1);render();};
    $("next").onclick=()=>{view.setMonth(view.getMonth()+1);render();};
    $("supportBtn").onclick=()=>{if(localStorage.getItem(SUPPORT_KEY)==="1")return;localStorage.setItem(SUPPORT_KEY,"1");localStorage.setItem(SUPPORT_KEY+"-extra",String(Number(localStorage.getItem(SUPPORT_KEY+"-extra")||0)+STEP));renderSupport()};
    const savedTheme=localStorage.getItem("reset-theme"); if(savedTheme)document.documentElement.dataset.theme=savedTheme;
    $("themeBtn").onclick=()=>{const next=document.documentElement.dataset.theme==="dark"?"light":"dark";document.documentElement.dataset.theme=next;localStorage.setItem("reset-theme",next)};
    renderSupport(); load(); setInterval(tick,1000);

    // ========== 重置概率预测模型 ==========
    function renderProbability(){
      const globals=events.filter(e=>e.type==="global").map(e=>new Date(e.at).getTime()).sort((a,b)=>a-b);
      if(globals.length<2){ $("probSample").textContent="0"; return; }
      const intervals=[];
      for(let i=1;i<globals.length;i++) intervals.push((globals[i]-globals[i-1])/864e5);
      const n=intervals.length;
      const avg=intervals.reduce((s,v)=>s+v,0)/n;
      const sorted=[...intervals].sort((a,b)=>a-b);
      const median=sorted[Math.floor(n/2)];
      const min=Math.min(...intervals), max=Math.max(...intervals);
      const last=globals[globals.length-1];
      const daysSince=(Date.now()-last)/864e5;
      $("probSample").textContent=n;
      $("probDaysAgo").textContent=`距上次 ${daysSince.toFixed(1)} 天`;
      $("probAvg").textContent=avg.toFixed(1)+"天";
      $("probMedian").textContent=`中位数 ${median.toFixed(1)} 天`;
      $("probMax").textContent=max.toFixed(1)+" 天";
      $("probMin").textContent=min.toFixed(1)+" 天";
      const mean=avg, std=Math.sqrt(intervals.reduce((s,v)=>s+(v-mean)**2,0)/n);
      function normCdf(x){ const t=1/(1+0.2316419*Math.abs((x-mean)/std)); const d=0.3989423*Math.exp(-((x-mean)**2)/(2*std*std)); const p=d*t*(0.3193815+t*(-0.3565638+t*(1.781478+t*(-1.821256+t*1.330274)))); return (x-mean)>=0?1-p:p; }
      const p24=Math.max(0,Math.min(1,normCdf(daysSince+1)-normCdf(daysSince)))*100;
      const p48=Math.max(0,Math.min(1,normCdf(daysSince+2)-normCdf(daysSince)))*100;
      function setProb(id,val,bar){
        const v=Math.round(val);
        $(id).textContent=v+"%";
        const barEl=$(bar); barEl.style.width=v+"%";
        barEl.style.background=v<15?"var(--muted)":v<35?"var(--yellow)":"var(--green-bright)";
        $(id).className="prob-val "+(v<15?"low":v<35?"mid":"high");
      }
      setProb("prob24",p24,"prob24Bar");
      setProb("prob48",p48,"prob48Bar");
      $("prob24Sub").textContent=p24<5?"较低概率":p24<20?"中等概率":"较高概率";
      $("probAvgBar").style.width=Math.min(100,daysSince/avg*100)+"%";
      const hours=globals.map(t=>new Date(t).getUTCHours());
      const hourCount={}; hours.forEach(h=>hourCount[h]=(hourCount[h]||0)+1);
      const peakHour=Object.entries(hourCount).sort((a,b)=>b[1]-a[1])[0];
      const peakLocal=new Date(); peakLocal.setUTCHours(Number(peakHour[0]),0,0,0);
      $("probPeak").textContent=peakLocal.toLocaleTimeString("zh-CN",{timeZone:TZ,hour:"2-digit",minute:"2-digit"})+" 左右";
    }

    // ========== 推文分类 ==========
    function classifyTweet(text,type){
      const t=text.toLowerCase();
      if(type==="global"||/reset all|all reset|global reset|reset.*everyone|reset.*all|usage.*reset|rate.*limit.*reset/i.test(t))
        return {cls:"reset",label:"RESET 全员重置"};
      if(type==="banked"||/banked reset|bank reset/i.test(t))
        return {cls:"banked",label:"BANKED 重置卡"};
      if(/usage limit|rate limit|message limit|cap|usage cap/i.test(t))
        return {cls:"limits",label:"LIMITS 额度调整"};
      if(/codex|astra|gpt-6|luna/i.test(t))
        return {cls:"codex",label:"CODEX 模型动态"};
      return {cls:"note",label:"NOTE 其他动态"};
    }

    // ========== 额度限制百科 ==========
    const LIMIT_DATA={
      codex:{
        title:"Codex 5小时窗口额度",
        headers:["模型","Plus","Pro","Business"],
        rows:[
          ["GPT-6 Astra","—","<strong>无限</strong>","<strong>无限</strong>"],
          ["GPT-6 Sol","—","500 条/5小时","500 条/5小时"],
          ["GPT-6 Terra","—","200 条/5小时","200 条/5小时"],
          ["GPT-6 Luna","—","100 条/5小时","100 条/5小时"],
          ["GPT-5.4","200 条/5小时","<strong>无限</strong>","<strong>无限</strong>"],
          ["o3","150 条/5小时","400 条/5小时","400 条/5小时"],
          ["GPT-4o","400 条/5小时","<strong>无限</strong>","<strong>无限</strong>"]
        ],
        note:"<b>5小时窗口：</b>每 5 小时滚动重置一次，而非每日固定重置。超过额度会暂时限流，等待窗口滑动后恢复。"
      },
      models:{
        title:"各模型能力与限制",
        headers:["模型","上下文","Thinking","联网","适用场景"],
        rows:[
          ["GPT-6 Astra","2M 字符","✅ 支持","✅ 支持","复杂编程、深度推理"],
          ["GPT-6 Sol","1M 字符","✅ 支持","✅ 支持","日常编程、多模态"],
          ["GPT-6 Terra","1M 字符","✅ 支持","❌ 无","快速任务、轻量推理"],
          ["GPT-6 Luna","128K","❌ 无","❌ 无","简单问答、快速响应"],
          ["o3","200K","✅ 强推理","✅ 支持","数学、逻辑、代码"],
          ["GPT-4o","128K","❌ 无","✅ 支持","多模态、视觉理解"]
        ],
        note:"<b>Thinking 模式：</b>深度思考模式会消耗更多额度，但推理质量更高。Pro 及以上套餐可用。"
      },
      plans:{
        title:"套餐对比",
        headers:["特性","Plus","Pro","Business"],
        rows:[
          ["月费","$20","$200","$300/席"],
          ["Codex Astra","❌","✅","✅"],
          ["Codex Sol","❌","500/5h","500/5h"],
          ["重置卡","✅ 被动发放","✅ 被动发放","✅ 被动发放"],
          ["5小时窗口","200 条","500 条起","500 条起"],
          ["团队协作","❌","❌","✅"],
          ["API 额度","5M tokens","10M tokens","无限"]
        ],
        note:"<b>重置卡（Banked Reset）：</b>官方在全员重置时会额外发放一张重置卡，可在 5 小时窗口额度用完时手动使用，立即恢复额度。"
      }
    };
    function renderLimit(tab){
      const d=LIMIT_DATA[tab];
      const html=`<table class="limit-table"><thead><tr>${d.headers.map(h=>`<th>${h}</th>`).join("")}</tr></thead><tbody>${d.rows.map(r=>`<tr>${r.map(c=>`<td>${c}</td>`).join("")}</tr>`).join("")}</tbody></table><div class="limit-note">${d.note}</div>`;
      $("limitContent").innerHTML=html;
    }
    document.querySelectorAll(".limit-tab").forEach(t=>t.onclick=()=>{
      document.querySelectorAll(".limit-tab").forEach(x=>x.classList.remove("active"));
      t.classList.add("active"); renderLimit(t.dataset.tab);
    });
    renderLimit("codex");

    // ========== 搜索框模糊匹配 ==========
    const SEARCH_INDEX = [
      { cat:"error", catName:"报错", url:"#",
        title:"out of messages 消息额度用完",
        keywords:"out of messages message limit 用完 额度 消息 重置 今天 claude chatgpt 报错",
        desc:"You've reached the message limit — 消息额度用完怎么办？" },
      { cat:"error", catName:"报错", url:"#",
        title:"message limit reached 消息限额已达上限",
        keywords:"message limit reached 限额 上限 达 触 频率 重置周期 每日",
        desc:"Message limit reached — 消息限额已达上限" },
      { cat:"error", catName:"报错", url:"#",
        title:"usage cap reached 用量上限",
        keywords:"usage cap reached 用量 上限 api 高级功能 token 恢复 提升",
        desc:"Usage cap reached — 用量上限已达，如何恢复访问" },
      { cat:"rule", catName:"规则", url:"#",
        title:"Thinking 模式算不算额度",
        keywords:"thinking 算不算 额度 深度思考 推理 token 计费 消息次数 消耗",
        desc:"Thinking 模式算不算额度？深度解析用量计算规则" },
      { cat:"rule", catName:"规则", url:"#",
        title:"Subagent 子代理算不算额度",
        keywords:"subagent 子代理 算不算 额度 分摊 调用 主账号 用量",
        desc:"Subagent（子代理）调用算不算额度？用量分摊规则" },
      { cat:"rule", catName:"规则", url:"#",
        title:"Cache 缓存命中算不算额度",
        keywords:"cache 缓存 算不算 额度 prompt caching 命中 折扣 token 计费",
        desc:"Cache（缓存）命中算不算额度？Prompt Caching 计费规则" },
      { cat:"limit", catName:"额度", url:"#",
        title:"Pro 每日额度多少",
        keywords:"pro 每日 额度 多少 消息 限制 50条 重置 订阅 用量",
        desc:"Pro 每日额度多少？消息限制与用量数据一览" },
      { cat:"limit", catName:"额度", url:"#",
        title:"Max 等级额度多少",
        keywords:"max 等级 额度 多少 消息 限制 最高订阅 升级 pro 区别",
        desc:"Max 等级额度多少？最高订阅消息限制详解" },
      { cat:"limit", catName:"额度", url:"#",
        title:"Plus 等级额度多少",
        keywords:"plus 等级 额度 多少 消息 限制 入门订阅 免费 pro 区别",
        desc:"Plus 等级额度多少？入门订阅消息限制说明" },
      { cat:"guide", catName:"教程", url:"#",
        title:"怎么看剩余额度 /usage 命令",
        keywords:"怎么看 剩余 额度 用量 usage 命令 查询 查看 /usage /limit 统计",
        desc:"怎么看剩余额度？各 AI 助手用量查询方法汇总" },
      { cat:"guide", catName:"教程", url:"#",
        title:"被限后怎么切换账号",
        keywords:"怎么 切换 账号 被限 用完 多账号 管理 登出 登录 风控",
        desc:"被限后怎么切换账号？多账号管理与切换教程" }
    ];

    const searchInput = $("searchInput");
    const searchBtn = $("searchBtn");
    const searchResults = $("searchResults");
    const entryGrid = $("searchEntryGrid");

    function fuzzySearch(query) {
      const q = query.trim().toLowerCase();
      if (!q) { searchResults.classList.remove("show"); entryGrid.style.display=""; return; }
      const terms = q.split(/\s+/).filter(Boolean);
      const scored = SEARCH_INDEX.map(item => {
        const hay = (item.title + " " + item.keywords + " " + item.desc).toLowerCase();
        let score = 0;
        terms.forEach(t => {
          if (hay.includes(t)) score += 1;
          if (item.title.toLowerCase().includes(t)) score += 2;
        });
        return { ...item, score };
      }).filter(r => r.score > 0).sort((a,b) => b.score - a.score).slice(0, 6);

      if (scored.length === 0) {
        searchResults.innerHTML = `<div class="search-result-empty">没有找到匹配的问题，试试其他关键词，或 <a href="#">浏览全部解答</a></div>`;
        entryGrid.style.display = "none";
      } else {
        searchResults.innerHTML = scored.map(r =>
          `<a class="search-result-item ${r.cat}" href="${r.url}">` +
          `<span class="cat-tag">${r.catName}</span>` +
          `<div><div class="result-title">${r.title}</div><div class="result-desc">${r.desc}</div></div></a>`
        ).join("");
        entryGrid.style.display = "none";
      }
      searchResults.classList.add("show");
    }

    searchInput.addEventListener("input", () => fuzzySearch(searchInput.value));
    searchInput.addEventListener("keydown", e => { if (e.key === "Enter") fuzzySearch(searchInput.value); });
    searchBtn.addEventListener("click", () => fuzzySearch(searchInput.value));

    // ========== 我的额度（从 Chrome 插件采集的数据读取）==========
    const IS_EXT = typeof chrome !== "undefined" && chrome.runtime && typeof chrome.runtime.getURL === "function";
    const USAGE_KEY = "codex-usage-snapshot";

    function storageGet(key, def) {
      if (IS_EXT) {
        return new Promise(resolve => {
          try { chrome.storage.local.get(key, (result) => resolve(result[key] !== undefined ? result[key] : def)); }
          catch (e) { resolve(def); }
        });
      } else {
        try {
          const v = localStorage.getItem(key);
          return Promise.resolve(v !== null ? JSON.parse(v) : def);
        } catch (e) { return Promise.resolve(def); }
      }
    }

    function fmtTime(ts) {
      if (!ts) return "—";
      const diff = Math.floor((Date.now() - ts) / 60000);
      if (diff < 1) return "刚刚";
      if (diff < 60) return diff + " 分钟前";
      const hrs = Math.floor(diff / 60);
      if (hrs < 24) return hrs + " 小时前";
      return Math.floor(hrs / 24) + " 天前";
    }

    function renderUsage(snap) {
      const body = $("usageBody");
      const empty = $("usageEmpty");
      const card = $("usageCard");
      if (!snap || snap.percent === null) {
        body.style.display = "none";
        empty.style.display = "block";
        card.classList.add("empty");
        return;
      }
      body.style.display = "";
      empty.style.display = "none";
      card.classList.remove("empty");
      $("usagePct").textContent = snap.percent;
      $("usageBar").style.width = snap.percent + "%";
      $("usageReset").textContent = snap.resetLabel || snap.resetText || "—";
      $("usageTime").textContent = "更新于 " + fmtTime(snap.capturedAt);
      $("usageBadge").textContent = snap.percent > 20 ? "正常" : (snap.percent > 0 ? "偏低" : "已耗尽");
    }

    async function loadUsage() {
      try {
        const snap = await storageGet(USAGE_KEY, null);
        renderUsage(snap);
      } catch (e) {
        renderUsage(null);
      }
    }

    if (IS_EXT && chrome.storage && chrome.storage.onChanged) {
      chrome.storage.onChanged.addListener((changes, area) => {
        if (area === "local" && changes[USAGE_KEY]) {
          renderUsage(changes[USAGE_KEY].newValue);
        }
      });
    }

    function setSyncBtnState(isSyncing) {
      const btn = $("usageResetBtn");
      if (!btn) return;
      if (isSyncing) { btn.classList.add("syncing"); btn.textContent = "同步中…"; }
      else { btn.classList.remove("syncing"); btn.textContent = "↻ 同步"; }
    }

    async function syncUsage() {
      if (!IS_EXT) {
        alert("请安装 Chrome 扩展后使用同步功能，或在 chatgpt.com 的「使用情况」页面查看额度");
        return;
      }
      setSyncBtnState(true);
      try {
        const tabs = await chrome.tabs.query({ url: ["*://chatgpt.com/*", "*://chat.openai.com/*"] });
        if (tabs.length > 0) {
          const tab = tabs[0];
          chrome.tabs.update(tab.id, { active: true });
          try {
            chrome.tabs.sendMessage(tab.id, { action: "rescan" }, () => {
              setTimeout(() => { loadUsage(); setSyncBtnState(false); }, 1500);
            });
          } catch (e) {
            setTimeout(() => { loadUsage(); setSyncBtnState(false); }, 1500);
          }
        } else {
          chrome.tabs.create({ url: "https://chatgpt.com" });
          setSyncBtnState(false);
          alert("已打开 ChatGPT，请点击左下角头像 → 设置 → 使用情况 查看额度，插件会自动同步");
        }
      } catch (e) {
        setSyncBtnState(false);
      }
    }

    if ($("usageResetBtn")) $("usageResetBtn").onclick = syncUsage;
    loadUsage();
    setInterval(loadUsage, 30000);
