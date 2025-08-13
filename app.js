/* ===== Utilities & State ===== */
const clamp = (v,a,b)=>Math.min(b,Math.max(a,v));
const PRACTICE_REPEAT = 5; // repeat words/rows for mistake practice

/* Lessons */
const lessons = {
  beginner:[
    "က ခ ဂ ဃ ၚ စ ဆ ဇ ၛ ည",
    "ဋ ဌ ဍ ဎ ဏ တ ထ ဒ ဓ န",
    "ပ ဖ ဗ ဘ မ ယ ရ လ ဝ",
    "သ ဟ ဠ ၜ အ ၝ",
    "က ကာ ကိ ကီ ကု ကူ ကေ ကဲ ကော ကဴ ကံ ကး",
    "ခ ခါ ခိ ခဳ ခု ခူ ခေ ခဲ ခေါ ခဴ ခံ ခး",
    "ဂ ဂါ ဂိ ဂဳ ဂု ဂူ ဂေ ဂဲ ဂော ဂဴ ဂံ ဂး",
    "စ စာ စိ စဳ စု စူ စေ စဲ စော စဴ စံ စး"
  ],
  intermediate:[
    "မ္ၚဵုရအဴ မသကလောကောဒေံတအ် ပ္ဍဲကဵုတ္ၚဲဏအ်",
    "ဂကောံမန်ပိုဲ ဂွံလုပ်သီု ရေင်သကအ် ပံင်ကောံ",
    "ပ္ဍဲကဵု လိက်ပတ်မန် နွံကဵု ဂလာန်ဇမၠိၚ်",
    "ပညာ ဒှ်အလုံ ညံင်ရဴ ဍာ်ဂၠိုင် သွက်ဂွံစသုင်",
    "မေတ္တာ ကေုာံ ကရုဏာ ဒှ်တမ် အဓိကပ္ဍဲကဵု ဘဝမၞိဟ်"
  ],
  advanced:[
    "ဘဝမၞိဟ်ဂှ် ဒှ်ဍာ်ဇမၠေအ် မွဲကရေက် တုဲ ပ္ဍဲကဵုလမျီုဂှ်",
    "နွံကဵု သဘင်ကမၠောန် ဗွဲမဂၠိုင် ယေန်သၞာင်မန်မဂွံဆက်ကၠောန်",
    "ကၠုင် နူကဵု အကြာဲဂမၠိုင်ဂှ် ဂလာန်ဇမၠိင် ကေုာံ ရုပ်ရဴ မဗဵုလဂူ",
    "နဲကဲ သိပ္ပံပရေင် မတိုန်ဗဂေတ် အာကၠုင်ဂှ် ကမၠောန်မွဲမွဲ ညံင်ရဴ",
    "ဂွံပြံင်လှာဲ ဗွဲမအရေဝ်ဂေါဝ် မဒက်ပ်တန် လဝ်လၟိုန်ကာလဂှ်"
  ],
  practice:[]
};

/* State */
let currentLesson='';
let currentTextIndex=0;
let currentText='';
let typedText='';
let startTime=null;
let timer=null;
let isTyping=false;
let currentPosition=0;
let totalTypedChars=0;
let totalCorrectChars=0;
let vkbShiftLatched=false;

let mistakeCharCounts=new Map();
let mistakeWordCounts=new Map();

/* Sounds */
const correctSound=new Audio('https://actions.google.com/sounds/v1/cartoon/wood_plank_flicks.ogg');
const errorSound=new Audio('https://actions.google.com/sounds/v1/cartoon/clang_and_wobble.ogg');
correctSound.volume=.25; errorSound.volume=.2;
let soundOn = JSON.parse(localStorage.getItem('soundOn') || 'true');
function toggleSound(){
  soundOn = !soundOn;
  localStorage.setItem('soundOn', soundOn);
  document.getElementById('soundBtn').innerHTML = soundOn ? '<i class="fas fa-volume-up"></i>' : '<i class="fas fa-volume-mute"></i>';
}

/* Layout helpers from keymaps.js */
let currentLayoutId = localStorage.getItem('mnw_layout') || 'unicode';
const getLayoutMap = () => (currentLayoutId==='a1'? window.MON_A1_MAP : window.MON_UNICODE_MAP);

/* Build Virtual Keyboard */
function buildKeyboard(){
  const map=getLayoutMap();
  const container=document.getElementById('keyboardLayout');
  container.innerHTML='';
  container.classList.toggle('shift-latched', vkbShiftLatched);
  window.ROWS.forEach(rowCodes=>{
    const rowDiv=document.createElement('div'); rowDiv.className='keyboard-row';
    rowCodes.forEach(code=>{
      const [base='', shifted='']= (map[code] || ['', '']);
      const keyDiv=document.createElement('div');
      const finger = window.CODE_TO_FINGER[code] || 'TH';
      keyDiv.className='key ' + (code==='Space'?'space-key ':'') + 'f-' + finger;
      keyDiv.dataset.code=code; keyDiv.dataset.base=base; keyDiv.dataset.shift=shifted;

      const cap=document.createElement('div'); cap.className='cap';
      const s=document.createElement('div'); s.className='glyph-shift'; s.textContent=(code==='Space'||!shifted)?'':shifted;
      const b=document.createElement('div'); b.className='glyph-base'; b.textContent=(code==='Space')?'Space':(base||'');
      cap.appendChild(s); cap.appendChild(b); keyDiv.appendChild(cap);

      keyDiv.addEventListener('click',(e)=>{
        if(!isTyping) return;
        const useShift=(e.shiftKey || vkbShiftLatched) && shifted;
        const ch= useShift ? shifted : base;
        if(!ch && code!=='Space') return;
        const input=document.getElementById('typingInput');
        input.value += (code==='Space') ? ' ' : ch;
        input.dispatchEvent(new Event('input',{bubbles:true}));
      });

      rowDiv.appendChild(keyDiv);
    });
    container.appendChild(rowDiv);
  });
  updateVirtualKeyboard();
}

function setLayout(id){
  currentLayoutId = (id==='a1') ? 'a1' : 'unicode';
  localStorage.setItem('mnw_layout', currentLayoutId);
  document.getElementById('layoutSelect').value = currentLayoutId;
  buildKeyboard();
}
function setShiftLatched(on){
  vkbShiftLatched = !!on;
  const btn=document.getElementById('shiftToggleBtn');
  const kb=document.getElementById('keyboardLayout');
  btn.classList.toggle('active', vkbShiftLatched);
  btn.setAttribute('aria-pressed', String(vkbShiftLatched));
  btn.title = vkbShiftLatched ? 'Shift latched (click to release)' : 'Latch Shift for virtual keys';
  kb.classList.toggle('shift-latched', vkbShiftLatched);
}

/* Progress persistence */
function saveProgress(){
  localStorage.setItem('mnw_typing_progress', JSON.stringify({
    lesson: currentLesson, index: currentTextIndex, totalTypedChars, totalCorrectChars
  }));
}
function loadProgressFor(lesson){
  const raw = localStorage.getItem('mnw_typing_progress');
  if(!raw) return null;
  const p = JSON.parse(raw);
  return p.lesson===lesson ? p : null;
}

/* Lesson flow */
function startLesson(level){
  currentLesson=level;
  mistakeCharCounts=new Map();
  mistakeWordCounts=new Map();
  const texts=[...(lessons[level]||[])];
  if(document.getElementById('shuffleToggle').checked){
    for(let i=texts.length-1;i>0;i--){ const j=Math.floor(Math.random()*(i+1)); [texts[i],texts[j]]=[texts[j],texts[i]]; }
    lessons[level]=texts;
  }
  const resume=loadProgressFor(level);
  if(resume && level!=='practice'){
    currentTextIndex = Math.min(resume.index, texts.length);
    totalTypedChars = resume.totalTypedChars || 0;
    totalCorrectChars = resume.totalCorrectChars || 0;
  }else{
    currentTextIndex=0; totalTypedChars=0; totalCorrectChars=0;
  }
  loadCurrentText();
  document.getElementById('lessonSelection').classList.add('hidden');
  document.getElementById('typingInterface').classList.remove('hidden');
  resetStats();
  document.getElementById('soundBtn').innerHTML = soundOn ? '<i class="fas fa-volume-up"></i>' : '<i class="fas fa-volume-mute"></i>';
}

function loadCurrentText(){
  const texts=lessons[currentLesson]||[];
  if(currentTextIndex < texts.length){
    currentText = texts[currentTextIndex];
    displayText();
    resetTyping();
  }else{
    showResults();
  }
}

function displayText(){
  const textDisplay=document.getElementById('textDisplay');
  textDisplay.innerHTML='';
  for(let i=0;i<currentText.length;i++){
    const span=document.createElement('span');
    span.textContent=currentText[i]; span.id=`char-${i}`;
    textDisplay.appendChild(span);
  }
  if(currentText.length>0){ document.getElementById('char-0').classList.add('current-char'); }
}

/* Typing */
function startTyping(){
  if(!isTyping){
    isTyping=true;
    startTime=new Date();
    const input=document.getElementById('typingInput');
    input.disabled=false; input.focus();
    document.getElementById('startBtn').classList.add('hidden');
    document.getElementById('pauseBtn').classList.remove('hidden');
    timer=setInterval(updateTimer,100);
    input.addEventListener('input', handleTyping);
    input.addEventListener('keydown', handleKeyDown);
  }
}
document.addEventListener('keydown',()=>{
  if(!isTyping && !document.getElementById('typingInterface').classList.contains('hidden')) startTyping();
});
function pauseTyping(){
  isTyping=false; clearInterval(timer);
  const input=document.getElementById('typingInput');
  input.disabled=true;
  document.getElementById('startBtn').classList.remove('hidden');
  document.getElementById('pauseBtn').classList.add('hidden');
}
function resetTyping(){
  isTyping=false; clearInterval(timer); startTime=null; currentPosition=0; typedText='';
  const input=document.getElementById('typingInput'); input.value=''; input.disabled=true;
  document.getElementById('startBtn').classList.remove('hidden');
  document.getElementById('pauseBtn').classList.add('hidden');
  updateStats();
}

function handleTyping(event){
  if(!isTyping) return;
  typedText = event.target.value;
  currentPosition = typedText.length;

  // Per-keystroke mistake detection
  const i=currentPosition-1;
  if(i>=0 && i<currentText.length){
    const want=currentText[i], got=typedText[i];
    if(got!==want){
      mistakeCharCounts.set(want,(mistakeCharCounts.get(want)||0)+1);
      const word=getWordAt(currentText,i);
      if(word.trim().length){ mistakeWordCounts.set(word,(mistakeWordCounts.get(word)||0)+1); }
    }
  }

  updateCharacterHighlighting();
  updateKeyboardHint();

  if(typedText===currentText){
    totalTypedChars += typedText.length;
    for(let k=0;k<typedText.length;k++){ if(typedText[k]===currentText[k]) totalCorrectChars++; }
    currentTextIndex++; saveProgress();
    setTimeout(()=>loadCurrentText(), 450);
  }
  updateStats();
}
function getWordAt(text,pos){
  let s=pos,e=pos; while(s>0 && text[s-1]!==' ') s--; while(e<text.length && text[e]!==' ') e++;
  return text.slice(s,e);
}
function handleKeyDown(event){ if(event.key==='Tab') event.preventDefault(); }

/* Physical mapping: event.code + evt.shiftKey */
document.addEventListener('keydown',(evt)=>{
  if(!isTyping) return;
  if(evt.metaKey || evt.ctrlKey || evt.altKey) return;
  const map = getLayoutMap();
  const pair = map[evt.code];
  if(!pair) return;
  const ch = evt.shiftKey ? (pair[1] || pair[0]) : pair[0];
  if(!ch && evt.code!=='Space') return;
  evt.preventDefault();
  const input=document.getElementById('typingInput');
  input.value += (evt.code==='Space') ? ' ' : ch;
  input.dispatchEvent(new Event('input',{bubbles:true}));
});

/* Visuals & Hints */
function updateCharacterHighlighting(){
  for(let i=0;i<currentText.length;i++){ const el=document.getElementById(`char-${i}`); el.className=''; }
  for(let i=0;i<Math.min(typedText.length,currentText.length);i++){
    const el=document.getElementById(`char-${i}`);
    if(typedText[i]===currentText[i]){
      el.classList.add('correct-char'); if(soundOn){ try{ correctSound.currentTime=0; correctSound.play(); }catch(e){} }
    }else{
      el.classList.add('incorrect-char'); if(soundOn){ try{ errorSound.currentTime=0; errorSound.play(); }catch(e){} }
    }
  }
  if(currentPosition<currentText.length){
    const cur=document.getElementById(`char-${currentPosition}`);
    if(cur && !cur.classList.contains('correct-char') && !cur.classList.contains('incorrect-char')) cur.classList.add('current-char');
  }
}
function updateKeyboardHint(){
  const hint=document.getElementById('keyboardHint');
  const nextCharEl=document.getElementById('nextChar');
  if(currentPosition<currentText.length){
    const ch=currentText[currentPosition];
    nextCharEl.textContent=ch; hint.classList.remove('hidden');
  }else{ hint.classList.add('hidden'); }
  updateVirtualKeyboard();
  updateFingerGuide();
}
function updateVirtualKeyboard(){
  const layout=document.getElementById('keyboardLayout');
  layout.querySelectorAll('.key').forEach(k=>k.classList.remove('active','next-key'));
  if(currentPosition<currentText.length){
    const target=currentText[currentPosition];
    const keys=[...layout.querySelectorAll('.key')].filter(k=>k.dataset.base===target || k.dataset.shift===target);
    keys.forEach(k=>k.classList.add('next-key'));
  }
}
function updateFingerGuide(){
  ['dot-LP','dot-LR','dot-LM','dot-LI','dot-LTH','dot-RTH','dot-RI','dot-RM','dot-RR','dot-RP']
    .forEach(id=>document.getElementById(id).classList.remove('finger-active'));
  if(currentPosition>=currentText.length) return;
  const ch=currentText[currentPosition], map=getLayoutMap();
  let code=null; for(const [c,[b,s]] of Object.entries(map)){ if(b===ch || s===ch){ code=c; break; } }
  const finger = window.CODE_TO_FINGER[code||'Space'] || 'TH';
  const dotId = finger==='LP'?'dot-LP': finger==='LR'?'dot-LR': finger==='LM'?'dot-LM': finger==='LI'?'dot-LI':
                finger==='RI'?'dot-RI': finger==='RM'?'dot-RM': finger==='RR'?'dot-RR':
                finger==='RP'?'dot-RP': (ch===' ' ? 'dot-LTH' : 'dot-RTH');
  const el=document.getElementById(dotId); if(el) el.classList.add('finger-active');
}

/* Timer & Stats */
function updateTimer(){
  if(startTime){
    const elapsed=(new Date()-startTime)/1000;
    const m=Math.floor(elapsed/60), s=Math.floor(elapsed%60);
    document.getElementById('timeDisplay').textContent = `${m}:${String(s).padStart(2,'0')}`;
  }
}
function updateStats(){
  const elapsedMin = startTime ? (new Date()-startTime)/1000/60 : 0;
  const wpm = elapsedMin>0 ? Math.round(((totalCorrectChars + (typedText.length?typedText.length:0))/5)/elapsedMin) : 0;
  const accuracy = (totalTypedChars + typedText.length) > 0 ? Math.round(((totalCorrectChars + countCorrectSoFar())/(totalTypedChars + typedText.length))*100) : 100;
  document.getElementById('wpmDisplay').textContent = wpm;
  document.getElementById('accuracyDisplay').textContent = `${accuracy}%`;

  const totalTexts=(lessons[currentLesson]||[]).length || 1;
  const denom = currentText.length || 1;
  const progress = ((currentTextIndex + (currentPosition/denom)) / totalTexts) * 100;
  document.getElementById('progressText').textContent = `${Math.round(progress)}%`;
  const circumference=175.929;
  document.getElementById('progressCircle').style.strokeDashoffset = circumference - (progress/100)*circumference;
}
function countCorrectSoFar(){ let c=0; for(let i=0;i<Math.min(typedText.length,currentText.length);i++){ if(typedText[i]===currentText[i]) c++; } return c; }

/* Results, History, Badges */
const HISTORY_KEY='mnw_history'; const BADGES_KEY='mnw_badges';
function loadHistory(){ try{ return JSON.parse(localStorage.getItem(HISTORY_KEY)||'[]'); }catch{ return []; } }
function saveHistory(arr){ localStorage.setItem(HISTORY_KEY, JSON.stringify(arr)); }
function loadBadges(){ try{ return JSON.parse(localStorage.getItem(BADGES_KEY)||'{}'); }catch{ return {}; } }
function saveBadges(obj){ localStorage.setItem(BADGES_KEY, JSON.stringify(obj)); }

function showResults(){
  isTyping=false; clearInterval(timer);
  const elapsedMin = startTime ? (new Date()-startTime)/1000/60 : 0;
  const wpm = elapsedMin>0 ? Math.round((totalCorrectChars/5)/elapsedMin) : 0;
  const accuracy = totalTypedChars>0 ? Math.round((totalCorrectChars/totalTypedChars)*100) : 100;
  const minutes=Math.floor((new Date()-startTime)/1000/60);
  const seconds=Math.floor(((new Date()-startTime)/1000)%60);

  document.getElementById('finalWPM').textContent=wpm;
  document.getElementById('finalAccuracy').textContent=`${accuracy}%`;
  document.getElementById('finalTime').textContent=`${minutes}:${String(seconds).padStart(2,'0')}`;
  document.getElementById('finalErrors').textContent= totalTypedChars - totalCorrectChars;

  const emoji=document.getElementById('resultEmoji');
  if(accuracy>=95 && wpm>=40) emoji.textContent='🏆';
  else if(accuracy>=90 && wpm>=30) emoji.textContent='🎉';
  else if(accuracy>=80) emoji.textContent='👏';
  else emoji.textContent='💪';

  document.getElementById('practiceBtn').classList.toggle('hidden', mistakeWordCounts.size===0 && mistakeCharCounts.size===0);

  const history=loadHistory();
  history.push({ dt:new Date().toISOString(), lesson: currentLesson, wpm, acc: accuracy });
  saveHistory(history.slice(-200));

  const badges=loadBadges();
  if(!badges.first_complete) badges.first_complete=true;
  if(wpm>=30) badges.wpm_30=true;
  if(accuracy===100) badges.acc_100=true;
  if(history.length>=5) badges.five_done=true;
  saveBadges(badges);

  document.getElementById('resultsModal').classList.remove('hidden');
}
function tryAgain(){
  document.getElementById('resultsModal').classList.add('hidden');
  currentTextIndex=0; totalTypedChars=0; totalCorrectChars=0;
  mistakeCharCounts=new Map(); mistakeWordCounts=new Map();
  saveProgress(); loadCurrentText();
}
function backToLessons(){
  document.getElementById('resultsModal').classList.add('hidden');
  document.getElementById('typingInterface').classList.add('hidden');
  document.getElementById('lessonSelection').classList.remove('hidden');
  resetStats(); clearInterval(timer); startTime=null;
}

/* Error-focused practice */
function startPracticeMistakes(){
  const topWords = [...mistakeWordCounts.entries()].sort((a,b)=>b[1]-a[1]).map(x=>x[0]).slice(0,20);
  const topChars = [...mistakeCharCounts.entries()].sort((a,b)=>b[1]-a[1]).map(x=>x[0]).slice(0,20);
  const lines=[];
  if(topWords.length){
    for(const w of topWords){ lines.push((w+' ').repeat(PRACTICE_REPEAT).trim()); }
  }else if(topChars.length){
    const row=topChars.join(' ');
    lines.push((row+' ').repeat(PRACTICE_REPEAT).trim());
    lines.push(topChars.join(''));
  }else{
    alert("No mistakes recorded — great job!"); return;
  }
  lessons.practice=lines;
  document.getElementById('resultsModal').classList.add('hidden');
  startLesson('practice');
}

/* History/Profile UI */
function openHistory(){ renderHistoryTable(); renderBadges(); renderHistoryChart();
  const m=document.getElementById('historyModal'); m.classList.remove('hidden'); m.classList.add('flex'); }
function closeHistory(){ const m=document.getElementById('historyModal'); m.classList.add('hidden'); m.classList.remove('flex'); }
function renderHistoryTable(){
  const tbody=document.getElementById('historyTable');
  const history=loadHistory().slice().reverse().slice(0,50);
  tbody.innerHTML = history.map(h=>{
    const d=new Date(h.dt);
    const ds = d.toLocaleDateString() + ' ' + d.toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'});
    const lesson=h.lesson.charAt(0).toUpperCase()+h.lesson.slice(1);
    return `<tr class="border-b last:border-0"><td class="py-1 pr-2 whitespace-nowrap">${ds}</td><td class="py-1 pr-2">${lesson}</td><td class="py-1 pr-2">${h.wpm}</td><td class="py-1">${h.acc}%</td></tr>`;
  }).join('');
}
function renderBadges(){
  const el=document.getElementById('badgesWrap'); el.innerHTML='';
  const b=loadBadges();
  const all=[
    { key:'first_complete', label:'First Lesson Complete', icon:'fa-flag-checkered' },
    { key:'wpm_30', label:'30 WPM', icon:'fa-tachometer-alt' },
    { key:'acc_100', label:'100% Accuracy', icon:'fa-bullseye' },
    { key:'five_done', label:'5 Sessions', icon:'fa-medal' }
  ];
  all.forEach(x=>{
    const owned=!!b[x.key];
    const div=document.createElement('span');
    div.className='badge '+(owned?'':'opacity-50');
    div.innerHTML=`<i class="fa ${x.icon}"></i> ${x.label}`;
    el.appendChild(div);
  });
}
function renderHistoryChart(){
  const canvas=document.getElementById('historyChart');
  const ctx=canvas.getContext('2d');
  const history=loadHistory().slice(-50);
  ctx.clearRect(0,0,canvas.width,canvas.height);
  const PADL=36,PADR=10,PADT=14,PADB=24;
  const W=canvas.width-PADL-PADR, H=canvas.height-PADT-PADB;
  ctx.strokeStyle='#e5e7eb'; ctx.lineWidth=1;
  for(let i=0;i<=5;i++){ const y=PADT+H*i/5; ctx.beginPath(); ctx.moveTo(PADL,y); ctx.lineTo(PADL+W,y); ctx.stroke(); }
  const xs=i=>PADL + (history.length<=1?0:(W*i/(history.length-1)));
  const maxWPM=Math.max(60, ...history.map(h=>h.wpm||0));
  const ysW=v=> PADT + H*(1-(v/maxWPM));
  const ysA=v=> PADT + H*(1-(v/100));
  // WPM line
  ctx.lineWidth=2; ctx.strokeStyle='#3b82f6'; ctx.beginPath();
  history.forEach((h,i)=>{ const x=xs(i), y=ysW(h.wpm||0); if(i===0) ctx.moveTo(x,y); else ctx.lineTo(x,y); }); ctx.stroke();
  // Accuracy line
  ctx.strokeStyle='#10b981'; ctx.beginPath();
  history.forEach((h,i)=>{ const x=xs(i), y=ysA(h.acc||0); if(i===0) ctx.moveTo(x,y); else ctx.lineTo(x,y); }); ctx.stroke();
  // Legend + labels
  ctx.fillStyle='#111827'; ctx.font='12px system-ui, -apple-system, Segoe UI, Roboto, sans-serif';
  ctx.fillText('WPM', PADL, PADT-2); ctx.fillStyle='#3b82f6'; ctx.fillRect(PADL-24, PADT-10, 12, 3);
  ctx.fillStyle='#111827'; ctx.fillText('Accuracy', PADL+60, PADT-2); ctx.fillStyle='#10b981'; ctx.fillRect(PADL+28, PADT-10, 12, 3);
  ctx.fillStyle='#6b7280'; ctx.textAlign='right'; ctx.fillText(String(maxWPM), PADL-6, ysW(maxWPM)+4); ctx.fillText('0', PADL-6, ysW(0)+4);
  ctx.textAlign='left'; ctx.fillText('100%', PADL+W+6, ysA(100)+4); ctx.fillText('0%', PADL+W+6, ysA(0)+4);
}

/* Init */
document.addEventListener('DOMContentLoaded',()=>{
  const layoutSelect=document.getElementById('layoutSelect');
  layoutSelect.value=currentLayoutId;
  layoutSelect.addEventListener('change',(e)=>setLayout(e.target.value)); setLayout(currentLayoutId);

  const shiftBtn=document.getElementById('shiftToggleBtn');
  shiftBtn.addEventListener('click',()=>{ setShiftLatched(!vkbShiftLatched); buildKeyboard(); });
  setShiftLatched(false);

  const sb=document.getElementById('soundBtn');
  if(sb) sb.innerHTML = soundOn ? '<i class="fas fa-volume-up"></i>' : '<i class="fas fa-volume-mute"></i>';

  runSelfTests();
});

/* Export UI functions for inline handlers */
Object.assign(window, { startLesson, startTyping, pauseTyping, resetTyping, backToLessons, tryAgain, toggleSound, openHistory, closeHistory, startPracticeMistakes });

/* ===== Self-tests ===== */
function runSelfTests(){
  const out=[]; const ok=(name,cond)=>{ out.push(`${cond?'✅':'❌'} ${name}`); if(!cond) console.error('[TEST FAIL]',name); };
  ok('window.startLesson exists', typeof window.startLesson==='function');
  ok('Unicode Digit1 base/shift', window.MON_UNICODE_MAP.Digit1?.[0]===u('1041') && window.MON_UNICODE_MAP.Digit1?.[1]===u('100D'));
  ok('Unicode Minus shift is "x"', window.MON_UNICODE_MAP.Minus?.[1]==='x');
  ok('A1 Slash shift', window.MON_A1_MAP.Slash?.[1]===u('104B'));
  ok('Digit3 → LM', window.CODE_TO_FINGER.Digit3==='LM');
  ok('KeyJ → RI', window.CODE_TO_FINGER.KeyJ==='RI');
  ok('Space → TH', window.CODE_TO_FINGER.Space==='TH');
  setLayout('unicode');
  buildKeyboard();
  const minusKey=document.querySelector('.key[data-code="Minus"]');
  ok('Minus shows base', minusKey?.dataset.base==='-');
  ok('Minus shows shift', minusKey?.dataset.shift==='x');
  const chip=document.getElementById('testChip'); chip.style.display='block'; chip.textContent=out.join(' • ');
}
