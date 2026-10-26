// ---------- espace Cours : démo (diapos + enregistrement → cours rédigé, fiche, cartes) ----------
// Tout est préparé à l'avance : rien n'est enregistré, transcrit ni envoyé.
(function () {
  var root = document.getElementById('cours-demo');
  if (!root) return;
  var reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var $ = function (id) { return document.getElementById(id); };
  var $$ = function (sel) { return Array.prototype.slice.call(root.querySelectorAll(sel)); };

  // le CM dure 1 h 32 ; les diapos 11 à 14 sont celles de la démo
  var DURATION = 92 * 60;
  var SLIDES = {
    11: { k: "Partie 2 · L'élasticité", t: 'Élasticité-prix de la demande', li: ['Sensibilité de la quantité demandée au prix', 'Rapport de deux variations en pourcentage'], f: 'e = (ΔQ / Q) / (ΔP / P)', at: 38 * 60 },
    12: { k: "Partie 2 · L'élasticité", t: 'Lire le résultat', li: ['|e| > 1 : demande élastique', '|e| < 1 : demande inélastique', '|e| = 1 : élasticité unitaire'], at: 40 * 60 + 20 },
    13: { k: "Partie 2 · L'élasticité", t: 'Élasticité et recette totale', li: ['Demande élastique : P ↓ ⇒ RT ↑', 'Demande inélastique : P ↓ ⇒ RT ↓'], at: 42 * 60 + 40 },
    14: { k: "Partie 2 · L'élasticité", t: "Déterminants de l'élasticité", li: ['Substituts disponibles', 'Part du budget', 'Horizon de temps'], at: 45 * 60 + 30 }
  };
  var LINES = [
    { s: 11, at: 38 * 60 + 2, t: "Donc l'élasticité, c'est un rapport de deux variations en pourcentage, pas en valeur." },
    { s: 11, at: 39 * 60 + 15, t: "Elle est négative quasiment tout le temps, puisque la demande baisse quand le prix monte. On raisonne donc en valeur absolue." },
    { s: 12, at: 41 * 60 + 30, t: "Retenez bien ça, ça tombe à chaque partiel : au-dessus de un en valeur absolue, la demande est élastique.", ins: true },
    { s: 13, at: 43 * 60 + 5, t: "Prenez l'essence : même si le prix monte, à court terme on en achète à peu près autant." },
    { s: 13, at: 44 * 60 + 50, t: "Le piège classique, c'est de croire qu'une baisse de prix augmente toujours la recette. Non : seulement si la demande est élastique.", ins: true },
    { s: 14, at: 46 * 60 + 10, t: "Plus il y a de substituts, plus la demande réagit au prix." }
  ];
  var FLAGS = [41 * 60 + 32, 44 * 60 + 52];

  var hms = function (s) { var h = Math.floor(s / 3600), m = Math.floor(s % 3600 / 60), x = s % 60; return (h ? h + ':' : '') + String(m).padStart(2, '0') + ':' + String(x).padStart(2, '0'); };
  var pct = function (s) { return (s / DURATION * 100).toFixed(2) + '%'; };

  // ----- diapo affichée + frise de l'enregistrement -----
  var slideEl = $('c-slide'), slideNo = 12, tl = $('c-tl'), head;
  function drawSlide() {
    var d = SLIDES[slideNo];
    slideEl.innerHTML = '<p class="slide-k">' + d.k + '</p><p class="slide-t">' + d.t + '</p><ul>' + d.li.map(function (l) { return '<li>' + l + '</li>'; }).join('') + '</ul>' + (d.f ? '<span class="f">' + d.f + '</span>' : '') + '<span class="slide-no">' + slideNo + ' / 34</span>';
    slideEl.setAttribute('aria-label', 'Diapo ' + slideNo + ' sur 34 : ' + d.t);
    $('c-slide-n').textContent = 'Diapo ' + slideNo + ' / 34';
    var seg = tl.querySelector('.seg'), next = SLIDES[slideNo + 1] ? SLIDES[slideNo + 1].at : 47 * 60 + 40;
    seg.style.left = pct(d.at);
    seg.style.width = 'calc(' + pct(next - d.at) + ' + 1px)';
    $$('.trans li').forEach(function (li) { li.classList.toggle('dim', +li.dataset.s !== slideNo && !li.classList.contains('on')); });
  }
  function showSlide(n) {
    if (!SLIDES[n] || n === slideNo) return;
    slideNo = n;
    if (reduced) { drawSlide(); return; }
    slideEl.classList.add('fade');
    setTimeout(function () { drawSlide(); slideEl.classList.remove('fade'); }, 160);
  }

  // repères des changements de diapo (34 diapos sur 1 h 32) et des moments ⚑ Important
  var ticks = '';
  for (var i = 1; i <= 34; i++) {
    var at = SLIDES[i] ? SLIDES[i].at : i < 11 ? (i - 1) * 3.8 * 60 : 47 * 60 + 40 + (i - 15) * 2.2 * 60;
    ticks += '<i style="left:' + pct(at) + '"></i>';
  }
  tl.innerHTML = '<span class="seg"></span>' + ticks + FLAGS.map(function (f) { return '<span class="flag" style="left:' + pct(f) + '" title="⚑ Important à ' + hms(f) + '">⚑</span>'; }).join('') + '<span class="head"></span>';
  head = tl.querySelector('.head');
  head.style.left = pct(SLIDES[12].at);

  // ----- transcription : chaque phrase est rattachée à la diapo affichée à ce moment -----
  var trans = $('c-trans'), playTimer = null;
  trans.innerHTML = LINES.map(function (l, i) {
    return '<li tabindex="0" data-i="' + i + '" data-s="' + l.s + '"><time><b>diapo ' + l.s + '</b>' + hms(l.at) + '</time><p>' + l.t + (l.ins ? '<span class="ins">insiste</span>' : '') + '</p></li>';
  }).join('');
  function play(i) {
    var l = LINES[i], li = trans.children[i];
    clearInterval(playTimer);
    $$('.trans li').forEach(function (x) { x.classList.remove('on', 'playing'); x.style.removeProperty('--p'); });
    li.classList.add('on', 'playing');
    showSlide(l.s);
    head.style.left = pct(l.at);
    $('c-play').textContent = '▶ Réécoute ' + hms(l.at);
    if (reduced) { li.style.setProperty('--p', '100%'); return; }
    var p = 0;
    playTimer = setInterval(function () {
      p += 4;
      li.style.setProperty('--p', p + '%');
      if (p >= 100) { clearInterval(playTimer); li.classList.remove('playing'); $('c-play').textContent = '▶ Réécouter cette diapo'; }
    }, 90);
  }
  trans.addEventListener('click', function (e) { var li = e.target.closest('li'); if (li) play(+li.dataset.i); });
  trans.addEventListener('keydown', function (e) {
    var li = e.target.closest('li');
    if (li && (e.key === 'Enter' || e.key === ' ')) { e.preventDefault(); play(+li.dataset.i); }
  });
  $('c-prev').addEventListener('click', function () { showSlide(slideNo - 1); });
  $('c-next').addEventListener('click', function () { showSlide(slideNo + 1); });
  // ▶ à côté de la diapo : réécouter ce qui s'est dit pendant qu'elle était affichée
  $('c-play').addEventListener('click', function () {
    for (var i = 0; i < LINES.length; i++) if (LINES[i].s === slideNo) { play(i); return; }
  });
  tl.addEventListener('click', function (e) {
    var r = tl.getBoundingClientRect(), s = (e.clientX - r.left) / r.width * DURATION, best = 0;
    LINES.forEach(function (l, i) { if (Math.abs(l.at - s) < Math.abs(LINES[best].at - s)) best = i; });
    play(best);
  });
  drawSlide();

  // ----- onglets Note / Fiche / Cartes -----
  var tabs = $$('.c-tabs [role="tab"]');
  function selectTab(name, focus) {
    tabs.forEach(function (t) {
      var on = t.dataset.tab === name;
      t.setAttribute('aria-selected', on);
      t.tabIndex = on ? 0 : -1;
      $('c-p-' + t.dataset.tab).hidden = !on;
      if (on && focus) t.focus();
    });
  }
  tabs.forEach(function (t, i) {
    t.addEventListener('click', function () { selectTab(t.dataset.tab); });
    t.addEventListener('keydown', function (e) {
      var d = e.key === 'ArrowRight' ? 1 : e.key === 'ArrowLeft' ? -1 : 0;
      if (d) { e.preventDefault(); selectTab(tabs[(i + d + tabs.length) % tabs.length].dataset.tab, true); }
    });
  });

  // ----- « Rédiger le cours » : diapos + oral + tes notes → cours rédigé -----
  var S = function (n) { return ' <button type="button" class="tag ref" data-slide="' + n + '" aria-label="Ouvrir la diapo ' + n + '">diapo ' + n + '</button>'; };
  var ORAL = ' <span class="tag oral">oral</span>', EXTRA = ' <span class="tag extra">hors diapos</span>';
  var COURSE = [
    '<h4>1. Définition</h4>',
    "<p>L'élasticité-prix de la demande mesure la sensibilité de la quantité demandée à une variation du prix. Elle se calcule comme le rapport de deux variations en pourcentage&nbsp;: <span class=\"eq\">e = (ΔQ / Q) / (ΔP / P)</span>." + S(11) + '</p>',
    "<p>Elle est négative dans presque tous les cas, puisque la quantité demandée baisse quand le prix augmente&nbsp;; on raisonne donc en valeur absolue." + ORAL + '</p>',
    '<h4>2. Interpréter le résultat</h4>',
    "<ul><li>|e|&nbsp;&gt;&nbsp;1&nbsp;: la demande est élastique, la quantité varie proportionnellement plus que le prix.</li><li>|e|&nbsp;&lt;&nbsp;1&nbsp;: la demande est inélastique.</li><li>|e|&nbsp;=&nbsp;1&nbsp;: l'élasticité est unitaire.</li></ul><p>" + S(12).trim() + '</p>',
    '<div class="keep"><b>Dit en cours, à retenir · 41:30</b><p>Au-dessus de 1 en valeur absolue, la demande est élastique. Le professeur précise que ce point revient à chaque partiel.' + ORAL + '</p></div>',
    '<h4>3. Élasticité et recette totale</h4>',
    "<p>La recette totale est le produit du prix par la quantité vendue&nbsp;: <span class=\"eq\">RT = P × Q</span>." + EXTRA + '</p>',
    "<p>Si la demande est élastique, une baisse du prix augmente la recette totale&nbsp;; si elle est inélastique, elle la diminue." + S(13) + " Exemple donné en cours&nbsp;: l'essence, dont la consommation varie peu à court terme quand son prix monte." + ORAL + '</p>',
    '<div class="keep"><b>Dit en cours, à retenir · 44:50</b><p>Une baisse de prix n\'augmente la recette que si la demande est élastique&nbsp;: c\'est le piège classique.' + ORAL + '</p></div>'
  ];
  var RAW = "élast. = %ΔQ / %ΔP\n>1 → élastique / <1 → inélastique\nex essence = inélastique\n!! tombe au partiel\nRT ?? (revoir)";
  var doc = $('c-doc'), write = $('c-write'), genTimer = [];
  function rawNotes() {
    doc.innerHTML = '<p class="raw-h">Tes notes, prises pendant le CM</p><p class="raw">' + RAW + '</p>';
    write.disabled = false;
    write.textContent = 'Rédiger le cours';
  }
  write.addEventListener('click', function () {
    genTimer.forEach(clearTimeout);
    write.disabled = true;
    write.textContent = 'Rédaction…';
    doc.innerHTML = COURSE.map(function (h) { return '<div class="gen-line">' + h + '</div>'; }).join('');
    var parts = Array.prototype.slice.call(doc.children);
    parts.forEach(function (p, i) {
      genTimer.push(setTimeout(function () {
        p.classList.add('in');
        if (i === parts.length - 1) { write.textContent = 'Cours rédigé ✓'; $('c-reset').hidden = false; }
      }, reduced ? 0 : 260 + i * 330));
    });
  });
  $('c-reset').addEventListener('click', function () { genTimer.forEach(clearTimeout); this.hidden = true; rawNotes(); });
  // un renvoi [diapo 12] ouvre la diapo dans la visionneuse
  doc.addEventListener('click', function (e) {
    var b = e.target.closest('[data-slide]');
    if (!b) return;
    showSlide(+b.dataset.slide);
    if (window.matchMedia('(max-width:980px)').matches) slideEl.scrollIntoView({ block: 'center', behavior: reduced ? 'auto' : 'smooth' });
  });
  rawNotes();

  // ----- Cartes : répétition espacée par boîtes -----
  var DAYS = [1, 3, 7, 14, 30, 60, 120];
  var CARDS = [
    { q: "Formule de l'élasticité-prix de la demande&nbsp;?", a: 'e = (ΔQ / Q) / (ΔP / P)&nbsp;: la variation en % de la quantité sur la variation en % du prix.', s: 11, b: 0 },
    { q: '|e| = 1,6&nbsp;: la demande est-elle élastique&nbsp;?', a: 'Oui&nbsp;: |e| &gt; 1, la quantité réagit proportionnellement plus que le prix.', s: 12, b: 1 },
    { q: 'Demande inélastique&nbsp;: effet d\'une baisse de prix sur la recette totale&nbsp;?', a: 'La recette totale baisse.', s: 13, b: 0 },
    { q: 'Le prix passe de 10&nbsp;€ à 11&nbsp;€, la quantité de 200 à 180. Élasticité&nbsp;?', a: '−10&nbsp;% / +10&nbsp;% = −1&nbsp;: élasticité unitaire.', s: 12, b: 2 },
    { q: 'Pourquoi raisonne-t-on en valeur absolue&nbsp;?', a: 'Parce que e est presque toujours négative&nbsp;: la demande baisse quand le prix monte.', s: 11, b: 0 }
  ];
  var GRADES = { 1: 'Raté', 2: 'Difficile', 3: 'Bien', 4: 'Facile' };
  var deck, pos, shown, results;
  var card = $('c-card'), boxes = $('c-boxes'), msg = $('c-msg'), grades = $$('.grades button'), due = $('c-due-n');
  boxes.innerHTML = DAYS.map(function (d, i) { return '<span class="box" data-b="' + i + '"><b>' + (i + 1) + '</b>' + d + '&nbsp;j</span>'; }).join('');

  function startDeck() { deck = CARDS.map(function (c) { return Object.assign({}, c); }); pos = 0; results = []; drawCard(); }
  function setBoxes(on, was) {
    Array.prototype.forEach.call(boxes.children, function (b, i) { b.classList.toggle('on', i === on); b.classList.toggle('was', i === was && was !== on); });
  }
  function drawCard() {
    due.textContent = deck.length - pos;
    if (pos >= deck.length) {
      var tomorrow = results.filter(function (b) { return b === 0; }).length;
      card.outerHTML = '<div class="done" id="c-card" tabindex="-1"><p>Révision terminée pour aujourd\'hui.</p><p class="srs-msg">' + (tomorrow ? '<b>' + tomorrow + ' carte' + (tomorrow > 1 ? 's' : '') + '</b> à revoir demain, les autres plus tard.' : 'Prochaine révision dans 3 jours ou plus.') + '</p><button type="button" class="m-btn" id="c-again">Recommencer la démo</button></div>';
      card = $('c-card');
      $('c-again').addEventListener('click', function () { card.outerHTML = cardHTML; card = $('c-card'); bindCard(); startDeck(); card.focus(); });
      grades.forEach(function (g) { g.disabled = true; });
      setBoxes(-1);
      msg.innerHTML = '';
      return;
    }
    var c = deck[pos];
    shown = false;
    card.querySelector('.card-k').textContent = 'Carte ' + (pos + 1) + ' / ' + deck.length + ' · boîte ' + (c.b + 1);
    card.querySelector('.card-src').innerHTML = S(c.s).trim();
    card.querySelector('.card-q').innerHTML = c.q;
    var a = card.querySelector('.card-a');
    a.innerHTML = c.a;
    a.hidden = true;
    card.querySelector('.card-hint').hidden = false;
    grades.forEach(function (g) { g.disabled = true; });
    setBoxes(c.b);
  }
  function reveal() {
    if (shown || pos >= deck.length) return;
    shown = true;
    card.querySelector('.card-a').hidden = false;
    card.querySelector('.card-hint').hidden = true;
    grades.forEach(function (g) { g.disabled = false; });
  }
  // 1 : retour à la première boîte · 2 : même boîte · 3 : boîte suivante · 4 : on en saute une
  function grade(n) {
    if (!shown) return;
    var c = deck[pos], from = c.b;
    c.b = n === 1 ? 0 : n === 2 ? from : Math.min(6, from + (n === 3 ? 1 : 2));
    results.push(c.b);
    setBoxes(c.b, from);
    msg.innerHTML = GRADES[n] + ' → boîte ' + (c.b + 1) + ' · à revoir dans <b>' + DAYS[c.b] + ' jour' + (DAYS[c.b] > 1 ? 's' : '') + '</b>';
    pos++;
    grades.forEach(function (g) { g.disabled = true; });
    setTimeout(drawCard, reduced ? 0 : 650);
  }
  var cardHTML = card.outerHTML;
  function bindCard() { card.addEventListener('click', function (e) { if (!e.target.closest('[data-slide]')) reveal(); }); }
  bindCard();
  grades.forEach(function (g) { g.addEventListener('click', function () { grade(+g.dataset.g); }); });
  // au clavier, comme dans l'app : Espace pour voir la réponse, 1 à 4 pour noter
  $('c-p-cartes').addEventListener('keydown', function (e) {
    if (e.target.closest('button') && e.key === ' ') return;
    if (e.key === ' ') { e.preventDefault(); reveal(); }
    else if (/^[1-4]$/.test(e.key)) { e.preventDefault(); grade(+e.key); }
  });
  $('c-p-cartes').addEventListener('click', function (e) {
    var b = e.target.closest('[data-slide]');
    if (b) showSlide(+b.dataset.slide);
  });
  startDeck();
})();
