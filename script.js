/* =========================================================
   Still Patterns — I Ching / Book of Changes
   Complete portfolio build: coins + casting + scroll
   ========================================================= */

(() => {
  // -----------------------------
  // DOM helpers
  // -----------------------------
  const $ = (id) => document.getElementById(id);

  const btnCast = $("btnCast");
  const btnReset = $("btnReset");

  const badge = $("hexBadge");
  const titleEl = $("hexTitle");
  const meaningEl = $("hexMeaning");
  const bitsEl = $("hexBits");
  const changingEl = $("changingInfo");
  const relatingEl = $("relatingInfo");
  const coinInfo = $("coinInfo");

  const canvas = $("hexDraw");
  const ctx = canvas?.getContext?.("2d");

  // Optional coin visuals
  const coinRow = $("coinRow");

  // Closing scroll
  const closingSection = $("closingSection");
  const btnScroll = $("btnScroll");
  const btnScrollSkip = $("btnScrollSkip");
  const scrollArea = $("scrollArea");
  const scrollText = $("scrollText");

  // Guard: required elements
  if (!btnCast || !btnReset || !badge || !titleEl || !meaningEl || !bitsEl || !changingEl || !relatingEl || !coinInfo) {
    console.warn("[Still Patterns] Missing required DOM elements. Check iching.html IDs.");
    return;
  }

  // -----------------------------
  // State
  // -----------------------------
  // 0=yin(broken), 1=yang(solid), bottom->top
  let bits = [];
  let changing = new Set(); // 0..5 bottom->top
  let isAnimating = false;

  // Per-reading stable “line to carry”
  let currentScrollLine = null;

  // Last coin toss (for visuals)
  let lastCoins = ["—", "—", "—"];

  // -----------------------------
  // Copy: Scroll lines
  // -----------------------------
  const SCROLL_LINES = [
    "Let the next step be small — and true.",
    "Move without haste. Arrive on time.",
    "Clarity comes when you stop pushing.",
    "Keep the center. Let the edges settle.",
    "Strength is calm attention, repeated.",
    "Choose one clean action — then stop.",
    "Do less, but do it with full presence.",
    "Hold steady. Let the pattern speak.",
    "What you nourish grows.",
    "Refine the approach, not the person.",
    "Return to basics. Begin again quietly.",
    "A boundary can be an act of care.",
    "When uncertain, slow down — not away.",
    "Do not force the river. Shape the banks.",
    "Keep your integrity. Timing will follow.",
    "Release what clings. Keep what aligns.",
    "One honest question is enough for today.",
    "Let your response be smaller than your emotion.",
    "Make space. The answer enters on its own.",
    "Finish gently. Leave no rough edge."
  ];

  // -----------------------------
  // Meanings 1..64 (richer)
  // -----------------------------
  const MEANINGS = {
    1:"Creative force and initiative. Act with clarity, discipline, and confidence. Start strong, but stay consistent. Leadership works best when you’re steady, ethical, and focused. Don’t rush; build momentum through purposeful action and clear direction.",
    2:"Receptive strength through patience. Support what wants to grow. Listen, adapt, and nurture. Progress comes from consistency and care, not force. Be useful, grounded, and responsive; create a stable base so good outcomes can naturally emerge.",
    3:"Difficulty at the beginning. Early chaos is normal. Gather resources, ask for help, and simplify the plan. Take one small step at a time. Don’t quit because it’s messy—structure and support turn a fragile start into real progress.",
    4:"Youthful folly: learning by asking and practicing. Stay humble. Seek guidance, test ideas, and accept correction. Don’t pretend to know; build skill through repetition. Curiosity plus discipline turns confusion into competence over time.",
    5:"Waiting with preparation. Timing matters. Don’t force results; strengthen your position. Train, refine tools, and keep your integrity. When conditions align, act decisively. Patience here is strategic, not passive.",
    6:"Conflict: disagreement, tension, or competing agendas. Stay truthful and calm. Avoid escalating. Choose battles wisely; sometimes stepping back preserves strength. A clear principle and good communication prevent a small clash from becoming a costly war.",
    7:"The Army: organization and discipline. Success comes from structure, leadership, and clear roles. Commit to the mission and keep order. Don’t rely on emotion—use planning, routines, and accountability to move as one coordinated unit.",
    8:"Holding together: unity, trust, and shared purpose. Join with what is honest and stable. Relationships strengthen when values align. Don’t cling to weak bonds; choose cooperation that feels clean, mutual, and dependable.",
    9:"Small taming: gentle restraint and gradual progress. Make small improvements daily. Avoid big pushes; refine details. Patience and consistent habits build power quietly. Don’t underestimate small gains compounded over time.",
    10:"Treading: careful conduct in risky territory. Be polite, precise, and self-controlled. Confidence is good—recklessness isn’t. Step lightly, follow rules, and keep your dignity. Respect earns safety and smooth passage.",
    11:"Peace: harmony, flow, and cooperation. Good balance between giving and receiving. Build, connect, and expand. Don’t take it for granted—protect what’s working with good habits, clear communication, and gratitude.",
    12:"Standstill: blockage and stagnation. Stop pushing. Reset priorities, clean up, and strengthen your foundations. This is not failure; it’s a pause for recalibration. Focus on what you can control and prepare for movement later.",
    13:"Fellowship: teamwork and shared vision. Align around honest goals. Seek allies, communicate clearly, and build community. Don’t form groups for ego or drama; unity works when values and intentions are clean.",
    14:"Great possession: abundance with responsibility. Use resources wisely. Share, invest, and protect what you’ve built. Avoid arrogance. The best wealth is controlled, purposeful, and used to create long-term stability.",
    15:"Modesty: real strength without showing off. Keep improving quietly. People trust consistency and humility. Don’t shrink yourself—just stay grounded. Modesty helps you learn faster, lead better, and avoid unnecessary conflict.",
    16:"Enthusiasm: energy rising. Channel it into a plan. Momentum is available—use it for constructive goals. Don’t scatter attention or chase excitement. Prepare well, then move forward with rhythm and confidence.",
    17:"Following: adapt to what’s already moving. Learn the pattern and align with it. Follow good leadership and proven methods. Don’t lose yourself—choose what you follow carefully. Integrity is the guardrail.",
    18:"Work on what’s spoiled: repair and clean-up. Fix what’s decaying in habits, systems, or relationships. Take responsibility, correct errors, and restore order. Progress comes from honest maintenance, not pretending nothing’s wrong.",
    19:"Approach: opportunity comes closer. Be open, welcoming, and prepared. Lead with warmth and clarity. Don’t overreach—stay humble as success grows. The right approach builds trust and stable expansion.",
    20:"Contemplation: step back and observe. See the whole landscape. Reflect before acting. Your influence increases when you understand what’s really happening. Quiet insight now prevents loud mistakes later.",
    21:"Biting through: cut through confusion. Make a clear decision and act. Remove obstacles and enforce boundaries. Don’t be cruel—be firm and fair. This is about clarity, not anger.",
    22:"Grace: beauty, presentation, and refinement. Improve style and communication, but don’t fake substance. Small aesthetic upgrades help things flow. True grace supports what’s real; it cannot replace real effort.",
    23:"Splitting apart: breakdown of weak structures. Let what’s failing fall away. Don’t cling to what’s clearly unstable. Protect essentials, simplify, and rest. After collapse, you can rebuild on something stronger.",
    24:"Return: fresh start and renewal. Come back to basics. Small corrections restore the path. Don’t demand instant transformation—steady recovery is powerful. This is a cycle turning toward growth.",
    25:"Innocence: act with sincerity and clean intent. Don’t overcomplicate or manipulate. Be straightforward and ethical. When motives are pure, outcomes improve. Naivety is risky—innocence must include awareness.",
    26:"Great taming: store strength and train discipline. Build capability quietly. Learn, practice, and prepare. Don’t waste power on impulse. When you control yourself, you can control outcomes.",
    27:"Nourishment: what you consume shapes you. Feed mind and body with quality. Choose better inputs—information, habits, people. Good routines are fuel. Watch speech too; words can nourish or poison.",
    28:"Great excess: too much pressure on the structure. Reduce load, reinforce supports, and act before collapse. This is a tipping point. Don’t pretend it’s fine—rebalance now with courage and practicality.",
    29:"The Abysmal: repeated challenges. Keep going with discipline. Danger requires awareness, routine, and inner steadiness. Don’t panic or quit. Move carefully, learn the terrain, and build resilience through consistent practice.",
    30:"Fire/Clinging: clarity through focus. Illuminate what’s true. Strengthen your values and keep attention on what matters. Don’t get distracted by drama. When you stay aligned with truth, you naturally attract support.",
    31:"Influence: attraction and responsiveness. Soft power works here. Listen, connect, and guide without force. Genuine influence grows from respect. Don’t manipulate; create conditions where others want to participate.",
    32:"Duration: long-term consistency. Keep steady effort and sustainable habits. Avoid quitting too early or chasing novelty. Commitment is the advantage. Build something that can last—structure, routine, and patience.",
    33:"Retreat: strategic withdrawal. Step back to preserve strength. You’re not losing; you’re repositioning. Avoid unnecessary conflict. Retreat now so you can return later with better timing and stronger resources.",
    34:"Great power: strength is available. Use it with restraint. Power without control becomes damage. Act decisively, but stay ethical. The best strength is calm, stable, and directed toward clear goals.",
    35:"Progress: gradual advancement. Visibility increases. Keep your standards high and continue improving. Don’t rush or become careless. With steady effort and good attitude, recognition and opportunity naturally follow.",
    36:"Darkening of the light: protect your inner truth in a difficult environment. Stay low, stay safe, and don’t expose yourself to unnecessary harm. Preserve energy, keep integrity, and wait for better conditions.",
    37:"Family: roles, values, and healthy boundaries. Organize the home base—team, routines, culture. When relationships are well-structured, everything improves. Lead by example. Small daily respect keeps the system strong.",
    38:"Opposition: differences and friction. Accept that viewpoints vary. Seek common ground where possible, but don’t force agreement. Clarity about values reduces conflict. Cooperation is possible if expectations are realistic.",
    39:"Obstruction: obstacles ahead. Don’t push straight through. Look for alternate routes, allies, or better timing. Ask for help. Reduce complexity. Progress comes from clever adjustment, not stubborn force.",
    40:"Deliverance: relief and release. The pressure eases. Clean up leftover issues and move forward. Forgive what can be forgiven, but learn the lesson. Use the opening to restore order and confidence.",
    41:"Decrease: simplify and cut excess. Reduce distractions, costs, or commitments. Giving up something now strengthens the whole. Don’t fear loss—focus on what matters most and you regain power through clarity.",
    42:"Increase: growth and opportunity. Invest energy where it multiplies. Help others and the return comes back. Be generous but smart. This is a season to expand capacity and strengthen foundations.",
    43:"Breakthrough: a clear decision point. Speak truth and act firmly. Remove what blocks progress. Avoid harshness—be direct and clean. Momentum is possible if you choose courage and clarity over hesitation.",
    44:"Coming to meet: a powerful influence appears. Be cautious with temptations or unstable forces. Don’t invite what you can’t control. Engage carefully, keep boundaries, and protect your long-term direction.",
    45:"Gathering together: community and support. Organize people, resources, and attention. Clear leadership and shared purpose create strength. Don’t let chaos into the group. Unity grows through structure and honesty.",
    46:"Pushing upward: steady ascent. Small effort accumulates. Keep improving and ask for guidance. Don’t rush. Persistence and humility open doors. Growth happens through consistent steps, not sudden leaps.",
    47:"Oppression: constraint, fatigue, or pressure. Don’t despair. Simplify, conserve energy, and focus on essentials. True strength appears under strain. Endure with dignity, and use this period to refine priorities.",
    48:"The Well: a lasting source. Maintain what sustains you—skills, routines, community. Improve the system so everyone benefits. Don’t neglect maintenance. Reliable resources require care, clarity, and shared responsibility.",
    49:"Revolution: real change is due. Update the pattern. Prepare carefully, communicate clearly, then act decisively. Don’t change for ego. When timing and purpose align, transformation becomes clean and necessary.",
    50:"The Cauldron: transformation through better structure. Upgrade tools, habits, and environment. Nourish what’s valuable. This is about refining the system so better outcomes become natural. Patience plus craftsmanship creates lasting improvement.",
    51:"Thunder/Shock: sudden change wakes you up. Stay calm and respond, not react. Fear passes; clarity remains. Use the jolt as a reset. After surprise, return to basics and rebuild stability.",
    52:"Mountain/Stillness: stop and center. Quiet the mind. Don’t force movement. Stability returns when you pause and regain control. Stillness is not laziness—it’s disciplined composure and clear inner alignment.",
    53:"Development: slow, natural progress. Like a tree growing, steady improvement is the path. Don’t rush results. Choose good conditions, build relationships, and let stability form. Patience creates durability.",
    54:"Marrying maiden: unequal position or limited power. Be realistic. Don’t demand full control. Act with tact, learn the system, and build influence slowly. Humility and skill protect you in imperfect circumstances.",
    55:"Abundance: peak energy and visibility. Use the high tide wisely. Focus on priorities, communicate clearly, and act. Too much stimulation can scatter you. Enjoy the brightness, then consolidate and simplify.",
    56:"Wanderer: travel, change, or temporary conditions. Stay respectful and adaptable. Don’t get attached. Keep your values steady while circumstances shift. Light luggage—mentally and materially—helps you move safely.",
    57:"Wind/Gentle: gradual influence. Small repeated actions change outcomes. Persuasion beats force. Keep consistency and patience. Don’t push; seep in. Over time, gentle persistence becomes powerful.",
    58:"Lake/Joyous: communication and uplift. Share, connect, and keep morale strong. Honest joy builds trust. Avoid shallow distraction. Joy works best when it’s grounded in truth, discipline, and mutual respect.",
    59:"Dispersion: dissolve blocks and bring things back into flow. Break down rigidity. Reconnect people, calm emotions, and restore movement. Don’t cling to stuck patterns. A clear purpose reunites what scattered.",
    60:"Limitation: healthy boundaries. Choose rules that protect energy and time. Constraints create focus. Don’t make limits harsh or joyless—make them workable. Discipline now prevents chaos later.",
    61:"Inner truth: sincerity and alignment. Speak honestly and act consistently. Trust grows through integrity. Don’t try to control others—be clear, calm, and truthful. When inner and outer match, results stabilize.",
    62:"Small preponderance: focus on small steps and details. Avoid big risky moves. The correct action is modest, careful, and precise. Respect limits and proceed gently. Small wins now prevent large losses.",
    63:"After completion: things work, but stay alert. Success is fragile if you relax. Maintain routines, watch details, and correct small issues early. Don’t get complacent—stability requires ongoing attention.",
    64:"Before completion: almost there. Don’t rush the final step. Test, refine, and keep order. Timing and sequencing matter. Careful finishing prevents avoidable mistakes. Completion comes smoothly when you respect the process."
  };

  // -----------------------------
  // Trigrams + King Wen mapping
  // -----------------------------
  const TRIGRAMS = {
    "111": { name: "Heaven", symbol: "☰" },
    "110": { name: "Lake", symbol: "☱" },
    "101": { name: "Fire", symbol: "☲" },
    "100": { name: "Thunder", symbol: "☳" },
    "011": { name: "Wind", symbol: "☴" },
    "010": { name: "Water", symbol: "☵" },
    "001": { name: "Mountain", symbol: "☶" },
    "000": { name: "Earth", symbol: "☷" }
  };

  // Key format: `${lowerSymbol}|${upperSymbol}`  (lower = bottom trigram)
  const KING_WEN = {
    "☰|☰": [1,"The Creative"], "☱|☰":[10,"Treading"], "☲|☰":[13,"Fellowship"], "☳|☰":[25,"Innocence"], "☴|☰":[44,"Coming to Meet"], "☵|☰":[6,"Conflict"], "☶|☰":[33,"Retreat"], "☷|☰":[12,"Standstill"],
    "☰|☱":[43,"Breakthrough"], "☱|☱":[58,"Joyous"], "☲|☱":[49,"Revolution"], "☳|☱":[17,"Following"], "☴|☱":[28,"Great Preponderance"], "☵|☱":[47,"Oppression"], "☶|☱":[31,"Influence"], "☷|☱":[45,"Gathering Together"],
    "☰|☲":[14,"Great Possession"], "☱|☲":[38,"Opposition"], "☲|☲":[30,"Clinging (Fire)"], "☳|☲":[21,"Biting Through"], "☴|☲":[50,"The Cauldron"], "☵|☲":[64,"Before Completion"], "☶|☲":[56,"The Wanderer"], "☷|☲":[35,"Progress"],
    "☰|☳":[34,"Great Power"], "☱|☳":[54,"Marrying Maiden"], "☲|☳":[55,"Abundance"], "☳|☳":[51,"Arousing (Thunder)"], "☴|☳":[32,"Duration"], "☵|☳":[40,"Deliverance"], "☶|☳":[62,"Small Preponderance"], "☷|☳":[16,"Enthusiasm"],
    "☰|☴":[9,"Small Taming"], "☱|☴":[61,"Inner Truth"], "☲|☴":[37,"Family"], "☳|☴":[42,"Increase"], "☴|☴":[57,"Gentle (Wind)"], "☵|☴":[59,"Dispersion"], "☶|☴":[53,"Development"], "☷|☴":[20,"Contemplation"],
    "☰|☵":[5,"Waiting"], "☱|☵":[60,"Limitation"], "☲|☵":[63,"After Completion"], "☳|☵":[3,"Difficulty at the Beginning"], "☴|☵":[48,"The Well"], "☵|☵":[29,"The Abysmal (Water)"], "☶|☵":[39,"Obstruction"], "☷|☵":[8,"Holding Together"],
    "☰|☶":[26,"Great Taming"], "☱|☶":[41,"Decrease"], "☲|☶":[22,"Grace"], "☳|☶":[27,"Nourishment"], "☴|☶":[18,"Work on the Decayed"], "☵|☶":[4,"Youthful Folly"], "☶|☶":[52,"Keeping Still (Mountain)"], "☷|☶":[23,"Splitting Apart"],
    "☰|☷":[11,"Peace"], "☱|☷":[19,"Approach"], "☲|☷":[36,"Darkening of the Light"], "☳|☷":[24,"Return"], "☴|☷":[46,"Pushing Upward"], "☵|☷":[7,"The Army"], "☶|☷":[15,"Modesty"], "☷|☷":[2,"The Receptive"]
  };

  // -----------------------------
  // Utility
  // -----------------------------
  const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

  function vibrate(ms = 15) {
    try {
      if (navigator.vibrate) navigator.vibrate(ms);
    } catch (_) {}
  }

  function stablePick(seedStr, list) {
    // deterministic hash -> index
    let h = 0;
    for (let i = 0; i < seedStr.length; i++) {
      h = (h * 31 + seedStr.charCodeAt(i)) >>> 0;
    }
    return list[h % list.length];
  }

  function tossThreeCoins(){
    // Heads=3, Tails=2
    const coins = [];
    let total = 0;
    for (let i=0;i<3;i++){
      const heads = Math.random() < 0.5;
      coins.push(heads ? "H" : "T");
      total += heads ? 3 : 2;
    }
    return { coins, total };
  }

  function lineFromTotal(total){
    // 6 old yin (broken, changing)
    // 7 young yang (solid)
    // 8 young yin (broken)
    // 9 old yang (solid, changing)
    if (total === 6) return { bit:0, isChanging:true,  label:"6 — old yin (changing, broken)" };
    if (total === 7) return { bit:1, isChanging:false, label:"7 — young yang (solid)" };
    if (total === 8) return { bit:0, isChanging:false, label:"8 — young yin (broken)" };
    if (total === 9) return { bit:1, isChanging:true,  label:"9 — old yang (changing, solid)" };
    return { bit:0, isChanging:false, label:`${total} (unexpected)` };
  }

  function bitsToHexInfo(bitsArr){
    if (bitsArr.length !== 6) return null;

    const lowerBits = bitsArr.slice(0,3).join("");
    const upperBits = bitsArr.slice(3,6).join("");

    const lowerTri = TRIGRAMS[lowerBits];
    const upperTri = TRIGRAMS[upperBits];
    if (!lowerTri || !upperTri) return null;

    const key = `${lowerTri.symbol}|${upperTri.symbol}`;
    const entry = KING_WEN[key];
    if (!entry) return null;

    const [number, name] = entry;
    return {
      number,
      name,
      meaning: MEANINGS[number] || "Meaning not found yet.",
      lower: lowerTri,
      upper: upperTri,
      bitString: bitsArr.join("")
    };
  }

  function relatingBits(primaryBits){
    const rel = primaryBits.slice();
    for (const idx of changing){
      rel[idx] = rel[idx] === 1 ? 0 : 1;
    }
    return rel;
  }

  // -----------------------------
  // Coin visuals (wow factor)
  // -----------------------------
  function ensureCoinChildren(){
    if (!coinRow) return [];
    const kids = [...coinRow.children];
    // If your HTML has "coinGhost" divs, we re-use them.
    // If not, we create 3.
    while (coinRow.children.length < 3){
      const d = document.createElement("div");
      d.className = "coinGhost";
      coinRow.appendChild(d);
    }
    return [...coinRow.children].slice(0,3);
  }

  function setCoinFace(el, face){
    // face: "H" or "T"
    el.classList.remove("coinGhost", "coin", "coinHeads", "coinTails", "coinFlip");
    el.classList.add("coin", "coinFlip");
    if (face === "H") el.classList.add("coinHeads");
    else el.classList.add("coinTails");
    el.textContent = face;
    el.setAttribute("aria-hidden","true");
  }

  function resetCoins(){
    if (!coinRow) return;
    const kids = ensureCoinChildren();
    kids.forEach(el => {
      el.className = "coinGhost";
      el.textContent = "";
      el.setAttribute("aria-hidden","true");
    });
    lastCoins = ["—","—","—"];
  }

  async function animateCoins(coins){
    if (!coinRow) return;
    const kids = ensureCoinChildren();

    // brief staggered flips
    for (let i=0;i<3;i++){
      kids[i].classList.remove("coinGhost");
      kids[i].classList.add("coin", "coinFlip");
      kids[i].textContent = "";
    }

    // flip reveal with stagger
    for (let i=0;i<3;i++){
      await sleep(90);
      setCoinFace(kids[i], coins[i]);
      vibrate(10);
    }

    // remove flip class after animation settles
    await sleep(220);
    for (let i=0;i<3;i++){
      kids[i].classList.remove("coinFlip");
    }
  }

  // -----------------------------
  // Canvas drawing (smooth + clean)
  // -----------------------------
  function clearCanvas(){
    if (!ctx || !canvas) return;
    ctx.clearRect(0,0,canvas.width,canvas.height);
  }

  function drawHexagram(){
    if (!ctx || !canvas) return;

    clearCanvas();

    const w = canvas.width;
    const left = 70;
    const right = w - 70;
    const mid = (left + right) / 2;

    const lineThickness = 16;
    const lineGap = 44;
    const topY = 70;
    const brokenGap = 90;

    ctx.lineWidth = lineThickness;
    ctx.lineCap = "round";
    ctx.strokeStyle = "#3F312B";

    for (let i=0;i<bits.length;i++){
      const bit = bits[i];
      const y = topY + (5 - i) * lineGap;

      if (bit === 1){
        ctx.beginPath();
        ctx.moveTo(left,y);
        ctx.lineTo(right,y);
        ctx.stroke();
      } else {
        const leftEnd = mid - brokenGap/2;
        const rightStart = mid + brokenGap/2;

        ctx.beginPath();
        ctx.moveTo(left,y);
        ctx.lineTo(leftEnd,y);
        ctx.stroke();

        ctx.beginPath();
        ctx.moveTo(rightStart,y);
        ctx.lineTo(right,y);
        ctx.stroke();
      }

      if (changing.has(i)){
        ctx.fillStyle = "#B23A2B";
        ctx.beginPath();
        ctx.arc(right + 20, y, 6, 0, Math.PI*2);
        ctx.fill();
        ctx.fillStyle = "#3F312B";
      }
    }
  }

  async function completionFlourish(){
    // tiny, tasteful flourish: brief “ink pulse” on the canvas
    if (!ctx || !canvas) return;

    const cx = canvas.width / 2;
    const cy = canvas.height / 2;

    const start = performance.now();
    const duration = 420;

    function frame(t){
      const p = Math.min(1, (t - start) / duration);

      // draw over: soft rings
      clearCanvas();
      drawHexagram();

      ctx.save();
      ctx.globalAlpha = 0.12 * (1 - p);
      ctx.strokeStyle = "#3F312B";
      ctx.lineWidth = 2;

      const r1 = 22 + p * 36;
      const r2 = 42 + p * 60;

      ctx.beginPath();
      ctx.arc(cx, cy, r1, 0, Math.PI * 2);
      ctx.stroke();

      ctx.globalAlpha = 0.08 * (1 - p);
      ctx.beginPath();
      ctx.arc(cx, cy, r2, 0, Math.PI * 2);
      ctx.stroke();
      ctx.restore();

      if (p < 1) requestAnimationFrame(frame);
    }

    requestAnimationFrame(frame);
    await sleep(duration);
    drawHexagram();
  }

  // -----------------------------
  // Closing scroll
  // -----------------------------
  function resetScrollUI(){
    currentScrollLine = null;
    if (scrollArea) scrollArea.hidden = true;
    if (scrollText) scrollText.textContent = "—";
  }

  function prepareScroll(primaryInfo){
    if (!primaryInfo) return;
    if (currentScrollLine) return;

    // Stable line per reading so it feels meaningful
    const seed = `${primaryInfo.number}|${primaryInfo.name}|${primaryInfo.bitString}|${[...changing].sort((a,b)=>a-b).join(",")}`;
    currentScrollLine = stablePick(seed, SCROLL_LINES);
  }

  function showClosingIfReady(){
    if (!closingSection) return;
    closingSection.hidden = bits.length < 6;
  }

  // -----------------------------
  // UI update
  // -----------------------------
  function updateUI(){
    badge.textContent = `Lines: ${bits.length}/6`;
    bitsEl.textContent = bits.length ? `Bits: ${bits.join("")} (bottom→top)` : "Bits: —";

    const changingLines = [...changing].map(i=>i+1).sort((a,b)=>a-b);
    changingEl.textContent = changingLines.length
      ? `Changing lines: ${changingLines.join(", ")} (bottom=1)`
      : "Changing lines: —";

    relatingEl.textContent = "";

    // lock cast after 6 lines; also lock while animating
    btnCast.disabled = isAnimating || bits.length >= 6;

    showClosingIfReady();

    if (bits.length === 0){
      titleEl.textContent = "—";
      meaningEl.innerHTML = "Press <b>Cast a line</b> to begin revealing the hexagram.";
      resetScrollUI();
    } else if (bits.length < 6){
      titleEl.textContent = "(forming…)";
      meaningEl.textContent = "Each press tosses 3 coins and reveals the next line (bottom → top).";
      resetScrollUI();
    } else {
      const primary = bitsToHexInfo(bits);
      if (primary){
        const trigramLine = `${primary.upper.symbol} ${primary.upper.name} over ${primary.lower.symbol} ${primary.lower.name}`;
        titleEl.textContent = `#${primary.number} — ${primary.name}`;
        meaningEl.textContent = primary.meaning;

        // show relating if changing lines exist
        if (changing.size > 0){
          const relInfo = bitsToHexInfo(relatingBits(bits));
          if (relInfo){
            relatingEl.textContent = `Relating: #${relInfo.number} — ${relInfo.name}`;
          }
        } else {
          relatingEl.textContent = `Trigrams: ${trigramLine}`;
        }

        prepareScroll(primary);
      } else {
        titleEl.textContent = "Hexagram complete";
        meaningEl.textContent = "Could not identify this hexagram (mapping missing).";
        resetScrollUI();
      }
    }

    // coin info line
    const coinsText = lastCoins.join(" ");
    coinInfo.textContent = `Coins: ${coinsText} | Total: — | Line: —`;

    drawHexagram();
  }

  function setCoinInfo(coins, total, label){
    lastCoins = coins.slice();
    coinInfo.textContent = `Coins: ${coins.join(" ")} | Total: ${total} | Line: ${label}`;
  }

  // -----------------------------
  // Events
  // -----------------------------
  btnCast.addEventListener("click", async () => {
    if (isAnimating) return;
    if (bits.length >= 6) return;

    isAnimating = true;
    btnCast.disabled = true;

    const { coins, total } = tossThreeCoins();
    const { bit, isChanging, label } = lineFromTotal(total);

    // animate coins first (feels “ritualized”)
    await animateCoins(coins);

    // commit line
    const idx = bits.length; // 0 bottom
    bits.push(bit);
    if (isChanging) changing.add(idx);

    setCoinInfo(coins, total, label);

    // update + redraw
    updateUI();

    // when complete: flourish + reveal closing section smoothly
    if (bits.length === 6) {
      await completionFlourish();
      showClosingIfReady();

      // gentle scroll to closing section for “complete experience”
      if (closingSection && closingSection.hidden === false) {
        try {
          closingSection.scrollIntoView({ behavior: "smooth", block: "start" });
        } catch (_) {}
      }
      vibrate(18);
    }

    isAnimating = false;
    updateUI();
  });

  btnReset.addEventListener("click", () => {
    bits = [];
    changing = new Set();
    isAnimating = false;
    lastCoins = ["—","—","—"];

    setCoinInfo(["—","—","—"], "—", "—");
    resetCoins();
    resetScrollUI();

    if (closingSection) closingSection.hidden = true;

    updateUI();
  });

  // Closing scroll buttons
  if (btnScroll) {
    btnScroll.addEventListener("click", () => {
      if (!scrollArea || !scrollText) return;
      if (bits.length < 6) return;

      scrollText.textContent = currentScrollLine || "Move without haste. Arrive on time.";
      scrollArea.hidden = false;
      vibrate(12);
    });
  }

  if (btnScrollSkip) {
    btnScrollSkip.addEventListener("click", () => {
      if (!scrollArea) return;
      scrollArea.hidden = true;
      vibrate(8);
    });
  }

  // -----------------------------
  // Init
  // -----------------------------
  // ensure coin placeholders exist
  ensureCoinChildren();
  resetCoins();
  resetScrollUI();
  if (closingSection) closingSection.hidden = true;

  updateUI();

  // ---------------------------------------------------------
  // BONUS: if coinRow exists, make it accessible visually
  // (no break if CSS not updated; it will still function)
  // ---------------------------------------------------------
})();
