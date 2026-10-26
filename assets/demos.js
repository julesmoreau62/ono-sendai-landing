// ---------- espace Mémoire : contenu d'exemple (sujet, sources fictives, réponses préparées) ----------
(function () {
  var APA = window.APA;
  if (!APA) return;
  var reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var $ = function (id) { return document.getElementById(id); };
  var esc = function (s) { return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;'); };

  // bibliothèque de la démo : quatre sources fictives, au format CSL-JSON comme dans l'app
  var SOURCES = [
    { id: 'lemaire2022', type: 'article-journal', author: [{ family: 'Lemaire', given: 'Claire' }, { family: 'Dufour', given: 'Antoine' }, { family: 'Okafor', given: 'Tobi' }], issued: { 'date-parts': [[2022]] }, title: 'Les communautés de supporters en ligne : enquête auprès de trois clubs de Ligue 2', 'container-title': "Revue d'exemple en management du sport", volume: '14', issue: '2', page: '45-68' },
    { id: 'roussel2019', type: 'book', author: [{ family: 'Roussel', given: 'Marc' }], issued: { 'date-parts': [[2019]] }, title: 'Le supporter connecté : sociologie des tribunes numériques', publisher: 'Éditions Exemple' },
    { id: 'benali2021', type: 'article-journal', author: [{ family: 'Benali', given: 'Sofia' }, { family: 'Garnier', given: 'Paul' }], issued: { 'date-parts': [[2021]] }, title: 'Réseaux sociaux et fidélité au club : le rôle des contenus des joueurs', 'container-title': "Cahiers d'exemple du marketing sportif", volume: '7', issue: '1', page: '12-29' },
    { id: 'observatoire2023', type: 'report', author: [{ literal: 'Observatoire fictif des tribunes' }], issued: { 'date-parts': [[2023]] }, title: 'Baromètre des supporters 2023' }
  ];
  var LIB = new Map(SOURCES.map(function (x) { return [x.id, APA.normalize(x)]; }));

  // Markdown → texte affiché : chaque [@…] devient une citation APA
  function render(md) {
    var out = '', at = 0;
    APA.scan(md).forEach(function (f) {
      out += esc(md.slice(at, f.start));
      out += '<span class="cite">' + APA.cite(f.cluster, LIB, { narrative: f.narrative }) + '</span>';
      at = f.end;
    });
    return out + esc(md.slice(at));
  }
  function citeLabel(key) { return APA.cite([{ id: key }], LIB, {}).replace(/<\/?i>/g, ''); }

  // ----- démo du copilote -----
  var text = $('d-text'), tb = $('d-tb'), feed = $('d-feed'), body = tb && tb.parentNode;
  if (text && tb && feed && body) {
    var ORIGINAL = [
      'Depuis le milieu des années 2010, les réseaux sociaux ont profondément modifié la relation entre les clubs et leurs supporters [@roussel2019].',
      "Aujourd'hui, tous les supporters suivent leur club sur Instagram et le jugent d'abord sur ce qu'il publie.",
      "D'après le baromètre des supporters, 87 % des 18-25 ans ont déjà acheté un maillot après une vidéo d'un joueur.",
      "Pour un club, l'enjeu n'est donc plus seulement sportif : il devient aussi éditorial."
    ];
    var ASK = { v: 'info', t: "<p>Dans l'app, «&nbsp;Demander…&nbsp;» ouvre un champ pour poser ta propre question sur ce passage. Ici, c'est une démo&nbsp;: les réponses sont préparées à l'avance.</p>" };
    // v : ok (juste), weak (à nuancer), bad (à corriger), info (sans verdict)
    var R = [
      {
        verify: { v: 'ok', t: '<p>Affirmation générale, formulée avec prudence et appuyée par une source de ta bibliothèque&nbsp;: Roussel (2019) porte justement sur les tribunes numériques. Rien à changer.</p>' },
        review: { v: 'info', t: '<p>Phrase claire. «&nbsp;Profondément&nbsp;» reste vague&nbsp;: dis ce qui a changé (qui parle au supporter, à quelle fréquence, sur quel ton).</p>' },
        source: { v: 'info', t: '<p>Déjà sourcée. Benali et Garnier (2021) appuient aussi ce point, du côté des contenus publiés par les joueurs.</p>', cite: 'benali2021' },
        rewrite: { v: 'info', t: '<p>Une version plus précise, qui garde ta source&nbsp;:</p>', rep: "Depuis le milieu des années 2010, les réseaux sociaux ont transformé la façon dont les clubs s'adressent à leurs supporters [@roussel2019]." },
        jury: { v: 'info', t: "<ul><li>Qu'entendez-vous par «&nbsp;relation&nbsp;»&nbsp;: l'attachement, la communication, l'achat&nbsp;?</li><li>Pourquoi le milieu des années 2010 comme point de départ&nbsp;?</li><li>Ce constat vaut-il de la Ligue&nbsp;1 au club amateur&nbsp;?</li></ul>" }
      },
      {
        verify: { v: 'weak', t: "<p>«&nbsp;Tous&nbsp;» est trop catégorique, et aucune source ne l'appuie. Lemaire et al. (2022) observent bien ce lien, mais dans trois clubs de Ligue&nbsp;2 seulement&nbsp;: présente-le comme une tendance.</p>", rep: "Une part croissante des supporters suit son club sur les réseaux sociaux, et ce qu'il y publie pèse sur l'image qu'ils en ont [@lemaire2022].", cite: 'lemaire2022' },
        review: { v: 'weak', t: "<p>Deux généralisations dans la même phrase&nbsp;: «&nbsp;tous&nbsp;» et «&nbsp;d'abord&nbsp;». Et Instagram n'est qu'un réseau parmi d'autres&nbsp;: parle des réseaux sociaux, ou justifie ce choix.</p>" },
        source: { v: 'weak', t: "<p>Lemaire et al. (2022) est la source la plus proche dans ta bibliothèque. Elle appuie une version nuancée de la phrase, pas «&nbsp;tous&nbsp;».</p>", cite: 'lemaire2022' },
        rewrite: { v: 'info', t: '<p>Une version plus prudente&nbsp;:</p>', rep: "Beaucoup de supporters suivent aujourd'hui leur club sur les réseaux sociaux, et ce qu'il y publie compte dans le jugement qu'ils portent sur lui [@lemaire2022]." },
        jury: { v: 'info', t: "<ul><li>Sur quelles données reposent «&nbsp;tous&nbsp;» et «&nbsp;d'abord&nbsp;»&nbsp;?</li><li>Les supporters qui vont au stade sans être en ligne sont-ils pris en compte&nbsp;?</li><li>Pourquoi Instagram plutôt que TikTok, X ou les forums&nbsp;?</li></ul>" }
      },
      {
        verify: { v: 'bad', t: "<p>Ce chiffre ne figure dans aucune source de ta bibliothèque. Le baromètre (Observatoire fictif des tribunes, 2023) y est bien, mais rien ne permet de confirmer «&nbsp;87&nbsp;%&nbsp;». Retrouve le chiffre et sa page dans le rapport, ou retire-le.</p>" },
        review: { v: 'bad', t: "<p>Un chiffre précis sans source, c'est la première chose qu'un jury relève. Ajoute la référence et la page, ou retire le chiffre.</p>" },
        source: { v: 'bad', t: "<p>Je ne peux citer que les sources de ta bibliothèque, et aucune ne donne ce chiffre. Si tu l'as lu ailleurs, ajoute cette source dans Sources (par DOI ou à la main).</p>" },
        rewrite: { v: 'info', t: "<p>Je ne reformule pas un chiffre que je ne peux pas vérifier&nbsp;: la phrase changerait de forme, pas de problème. Vérifie d'abord la source.</p>" },
        jury: { v: 'info', t: "<ul><li>D'où vient ce chiffre&nbsp;: quelle année, quel échantillon, quelle question posée&nbsp;?</li><li>«&nbsp;Après une vidéo&nbsp;»&nbsp;: comment établir ce lien de cause&nbsp;?</li><li>Que pèse ce chiffre face à vos propres entretiens&nbsp;?</li></ul>" }
      },
      {
        verify: { v: 'ok', t: "<p>C'est ta conclusion, tirée de ce qui précède&nbsp;: pas besoin de source ici. Elle tient si les phrases d'avant sont solides.</p>" },
        review: { v: 'info', t: '<p>Bonne phrase de transition. Relie-la à ta problématique&nbsp;: en quoi cet enjeu éditorial change-t-il le lien club–supporter&nbsp;?</p>' },
        source: { v: 'info', t: "<p>Pas de source à ajouter&nbsp;: c'est ton interprétation. Garde-la comme telle.</p>" },
        rewrite: { v: 'info', t: '<p>Une variante, si tu veux varier le rythme&nbsp;:</p>', rep: "Pour un club, l'enjeu dépasse désormais le terrain : ce qu'il publie fait partie de sa relation avec les supporters." },
        jury: { v: 'info', t: "<ul><li>Que voulez-vous dire par «&nbsp;éditorial&nbsp;»&nbsp;? Donnez l'exemple d'un club.</li><li>Est-ce un enjeu nouveau, ou simplement plus visible&nbsp;?</li><li>Les petits clubs ont-ils les moyens de cet enjeu&nbsp;?</li></ul>" }
      }
    ];
    var ACTIONS = [
      ['verify', 'Vérifier', '<path d="M2.5 8.5 6 12l7.5-8"/>'],
      ['review', 'Relire', '<circle cx="7" cy="7" r="4.5"/><path d="M10.5 10.5 14 14"/>'],
      ['source', 'Sourcer', '<path d="M3 2.5h7l3 3v8H3z"/>'],
      ['rewrite', 'Reformuler', '<path d="M2 5h9l-2.5-2.5M14 11H5l2.5 2.5"/>'],
      ['jury', 'Jury', '<path d="M5.5 6a2.5 2.5 0 1 1 3.5 2.3c-.6.3-1 .8-1 1.4V11M8 13.5v.01"/>'],
      ['ask', 'Demander…', '<path d="M2.5 3.5h11v7h-6l-3 2.5v-2.5h-2z"/>']
    ];
    var LABEL = { verify: 'Vérifier', review: 'Relire', source: 'Sourcer', rewrite: 'Reformuler', jury: 'Questions du jury', ask: 'Question', pass: 'Passe de relecture', where: 'Où citer mes sources' };
    var VERDICT = { ok: ['ok', 'Juste'], weak: ['weak', 'À nuancer'], bad: ['bad', 'À corriger'] };
    var md, marks, sel = null, busy = false, timer = null;

    tb.innerHTML = ACTIONS.map(function (a) {
      return '<button type="button" data-act="' + a[0] + '"><svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.5" aria-hidden="true">' + a[2] + '</svg>' + a[1] + '</button>';
    }).join('');

    function paint() {
      text.innerHTML = md.map(function (m, i) {
        var cls = 's' + (marks[i] ? ' v-' + marks[i] : '') + (i === sel ? ' sel' : '');
        return '<span class="' + cls + '" data-i="' + i + '" tabindex="0" role="button" aria-pressed="' + (i === sel) + '">' + render(m) + '</span>';
      }).join(' ');
    }
    function reset() {
      clearTimeout(timer);
      md = ORIGINAL.slice();
      marks = [null, null, null, null];
      sel = null;
      busy = false;
      tb.hidden = true;
      feed.innerHTML = '<p class="cp-empty">Choisis une phrase à gauche, puis Vérifier, Relire, Sourcer, Reformuler, Jury ou Demander. La réponse s\'affiche ici.</p>';
      paint();
    }
    function placeBar() {
      var el = text.querySelector('[data-i="' + sel + '"]');
      if (!el) return;
      tb.hidden = false;
      tb.style.left = '8px';
      var b = body.getBoundingClientRect();
      var rects = el.getClientRects();
      var r = rects[0] || el.getBoundingClientRect();
      var top = r.top - b.top - tb.offsetHeight - 8;
      if (top < 0) top = rects[rects.length - 1].bottom - b.top + 8;
      var left = Math.max(8, Math.min(r.left - b.left, body.clientWidth - tb.offsetWidth - 8));
      tb.style.top = top + 'px';
      tb.style.left = left + 'px';
    }
    function select(i, focusBar) {
      if (busy) return;
      sel = i;
      paint();
      placeBar();
      if (focusBar) tb.querySelector('button').focus();
    }
    function deselect() {
      if (sel === null || busy) return;
      sel = null;
      tb.hidden = true;
      paint();
    }

    function bubble(label, quote) {
      var empty = feed.querySelector('.cp-empty');
      if (empty) empty.remove();
      var q = document.createElement('div');
      q.className = 'cp-q';
      q.innerHTML = '<b>' + esc(label) + '</b>' + (quote ? '<q>' + quote + '</q>' : '');
      feed.appendChild(q);
      var a = document.createElement('div');
      a.className = 'cp-a';
      a.innerHTML = '<div class="typing" aria-label="Le copilote répond"><i></i><i></i><i></i></div>';
      feed.appendChild(a);
      feed.scrollTop = feed.scrollHeight;
      return a;
    }
    function button(label, primary, fn) {
      var b = document.createElement('button');
      b.type = 'button';
      b.className = 'm-btn' + (primary ? ' pri' : '');
      b.textContent = label;
      b.addEventListener('click', function () {
        fn();
        b.closest('.cp-acts').querySelectorAll('button').forEach(function (x) { x.disabled = true; x.style.opacity = '.45'; });
      });
      return b;
    }
    function answer(el, r, i) {
      var html = '';
      if (VERDICT[r.v]) html += '<span class="verdict ' + VERDICT[r.v][0] + '">' + VERDICT[r.v][1] + '</span>';
      html += r.t;
      if (r.rep) html += '<div class="prop">' + render(r.rep) + '</div>';
      el.innerHTML = html;
      var acts = document.createElement('div');
      acts.className = 'cp-acts';
      if (r.rep) acts.appendChild(button('Remplacer', true, function () { md[i] = r.rep; marks[i] = null; paint(); }));
      if (r.cite) acts.appendChild(button('Citer ' + citeLabel(r.cite), !r.rep, function () {
        if (md[i].indexOf('@' + r.cite) < 0) md[i] = /\]\.$/.test(md[i]) ? md[i].replace(/\]\.$/, '; @' + r.cite + '].') : md[i].replace(/\s*\.$/, ' [@' + r.cite + '].');
        marks[i] = null;
        paint();
      }));
      if (acts.children.length) el.appendChild(acts);
      feed.scrollTop = feed.scrollHeight;
    }
    function later(fn) {
      busy = true;
      timer = setTimeout(function () { busy = false; fn(); }, reduced ? 50 : 900);
    }

    function act(kind) {
      if (sel === null || busy) return;
      var i = sel, r = kind === 'ask' ? ASK : R[i][kind];
      var quote = text.querySelector('[data-i="' + i + '"]').innerHTML;
      tb.hidden = true;
      sel = null;
      paint();
      text.querySelector('[data-i="' + i + '"]').classList.add('wait');
      var el = bubble(LABEL[kind], quote);
      later(function () {
        if (VERDICT[r.v]) marks[i] = r.v;
        paint();
        answer(el, r, i);
      });
    }

    function pass() {
      if (busy) return;
      tb.hidden = true;
      sel = null;
      paint();
      text.querySelectorAll('.s').forEach(function (s) { s.classList.add('wait'); });
      var el = bubble(LABEL.pass + ' · 1.2 Le supporter connecté');
      later(function () {
        marks = ['ok', 'weak', 'bad', 'ok'];
        paint();
        el.innerHTML = '<p>Deux phrases à reprendre&nbsp;: une généralisation sans appui et un chiffre sans source. Le reste tient.</p>' +
          '<ul><li><span class="verdict ok">Juste</span> <b>Phrase 1</b>&nbsp;: sourcée (Roussel, 2019).</li>' +
          '<li><span class="verdict weak">À nuancer</span> <b>Phrase 2</b>&nbsp;: «&nbsp;tous&nbsp;» et «&nbsp;d\'abord&nbsp;», sans source.</li>' +
          '<li><span class="verdict bad">À corriger</span> <b>Phrase 3</b>&nbsp;: 87&nbsp;% introuvable dans ta bibliothèque.</li>' +
          '<li><span class="verdict ok">Juste</span> <b>Phrase 4</b>&nbsp;: ta conclusion, rien à sourcer.</li></ul>';
        feed.scrollTop = feed.scrollHeight;
      });
    }
    function quick(kind) {
      if (kind === 'pass') return pass();
      if (busy) return;
      tb.hidden = true;
      sel = null;
      paint();
      var el = bubble(LABEL[kind]);
      later(function () {
        if (kind === 'jury') {
          el.innerHTML = "<ul><li>Quelle est votre définition du «&nbsp;supporter connecté&nbsp;»&nbsp;?</li><li>Comment passez-vous d'une enquête sur trois clubs à un constat général&nbsp;?</li><li>D'où vient le chiffre de 87&nbsp;%&nbsp;?</li></ul>";
        } else {
          if (md[1].indexOf('@benali2021') < 0) marks[1] = 'weak';
          paint();
          answer(el, { v: 'info', t: "<p>Benali et Garnier (2021) n'est pas encore citée dans cette section. Elle servirait la phrase 2, sur ce que publient les clubs.</p>", cite: 'benali2021' }, 1);
        }
        feed.scrollTop = feed.scrollHeight;
      });
    }

    // une phrase choisie au clic, au doigt, au clavier ou par une vraie sélection de texte
    text.addEventListener('pointerup', function (e) {
      setTimeout(function () {
        var s = window.getSelection();
        var target = null;
        if (s && !s.isCollapsed && text.contains(s.anchorNode)) {
          var n = s.anchorNode.nodeType === 1 ? s.anchorNode : s.anchorNode.parentNode;
          target = n.closest && n.closest('.s');
          s.removeAllRanges();
        } else {
          target = e.target.closest('.s');
        }
        if (target) select(+target.getAttribute('data-i'));
      }, 0);
    });
    text.addEventListener('keydown', function (e) {
      var s = e.target.closest('.s');
      if (s && (e.key === 'Enter' || e.key === ' ')) { e.preventDefault(); select(+s.getAttribute('data-i'), true); }
    });
    tb.addEventListener('click', function (e) {
      var b = e.target.closest('[data-act]');
      if (b) act(b.getAttribute('data-act'));
    });
    tb.addEventListener('keydown', function (e) {
      var list = Array.prototype.slice.call(tb.querySelectorAll('button'));
      var k = list.indexOf(document.activeElement);
      if (e.key === 'ArrowRight' || e.key === 'ArrowLeft') {
        e.preventDefault();
        list[(k + (e.key === 'ArrowRight' ? 1 : list.length - 1)) % list.length].focus();
      } else if (e.key === 'Escape') {
        var i = sel;
        deselect();
        var s = text.querySelector('[data-i="' + i + '"]');
        if (s) s.focus();
      }
    });
    document.addEventListener('pointerdown', function (e) {
      if (!e.target.closest('#d-text, #d-tb, #d-try')) deselect();
    });
    window.addEventListener('resize', function () { if (sel !== null) placeBar(); });
    $('d-try').addEventListener('click', function () { select(1, true); });
    $('d-reset').addEventListener('click', reset);
    $('d-pass').addEventListener('click', pass);
    document.querySelectorAll('.cp-quick [data-q]').forEach(function (b) {
      b.addEventListener('click', function () { quick(b.getAttribute('data-q')); });
    });
    reset();
  }

  // ----- citations APA : on écrit la syntaxe Pandoc, on voit le résultat -----
  var input = $('apa-in'), out = $('apa-out'), warn = $('apa-warn'), bib = $('apa-bib'), sugg = $('apa-sugg');
  if (input && out && bib) {
    var BIB = APA.bibliography(SOURCES, { lang: 'fr' });
    var items = [], pick = 0, from = 0;

    function update() {
      var v = input.value, used = {}, missing = [];
      APA.scan(v).forEach(function (f) {
        f.cluster.forEach(function (c) {
          if (LIB.has(c.id)) used[c.id] = 1;
          else if (missing.indexOf(c.id) < 0) missing.push(c.id);
        });
      });
      out.innerHTML = render(v) || '<span class="muted">…</span>';
      warn.hidden = !missing.length;
      warn.textContent = missing.map(function (k) { return 'La clé @' + k + " n'est pas dans ta bibliothèque."; }).join(' ');
      bib.innerHTML = BIB.map(function (b) { return '<li' + (used[b.id] ? '' : ' class="dim"') + '>' + b.html + '</li>'; }).join('');
      document.querySelectorAll('#apa-ex button').forEach(function (b) { b.classList.toggle('on', b.getAttribute('data-ex') === v); });
    }
    function suggest() {
      var pos = input.selectionStart, before = input.value.slice(0, pos);
      var m = before.match(/(?:\[|;\s*|\s)@([\w:.-]*)$/);
      if (!m || !/\[[^\]]*$/.test(before)) { sugg.hidden = true; items = []; return; }
      var q = m[1].toLowerCase();
      from = pos - m[1].length;
      items = SOURCES.filter(function (x) {
        return !q || x.id.indexOf(q) >= 0 || x.title.toLowerCase().indexOf(q) >= 0 || x.author.some(function (a) { return (a.family || a.literal || '').toLowerCase().indexOf(q) >= 0; });
      });
      pick = 0;
      if (!items.length) {
        sugg.innerHTML = '<button type="button" disabled>Aucune source ne correspond. Ajoute-la dans Sources.</button>';
      } else {
        sugg.innerHTML = items.map(function (x, i) {
          return '<button type="button" role="option" data-k="' + i + '"' + (i === pick ? ' class="on" aria-selected="true"' : '') + '><code>@' + x.id + '</code>' + citeLabel(x.id) + ' ' + esc(x.title) + '</button>';
        }).join('');
      }
      sugg.hidden = false;
    }
    function choose(i) {
      var x = items[i];
      if (!x) return;
      var v = input.value, pos = input.selectionStart, after = v.slice(pos);
      var close = /^[^\[]*\]/.test(after) ? '' : ']';
      input.value = v.slice(0, from) + x.id + close + after;
      var caret = from + x.id.length + close.length;
      input.setSelectionRange(caret, caret);
      sugg.hidden = true;
      items = [];
      input.focus();
      update();
    }
    input.addEventListener('input', function () { update(); suggest(); });
    input.addEventListener('click', suggest);
    input.addEventListener('keydown', function (e) {
      if (sugg.hidden || !items.length) return;
      if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
        e.preventDefault();
        pick = (pick + (e.key === 'ArrowDown' ? 1 : items.length - 1)) % items.length;
        sugg.querySelectorAll('button').forEach(function (b, i) { b.classList.toggle('on', i === pick); b.setAttribute('aria-selected', i === pick); });
      } else if (e.key === 'Enter' || e.key === 'Tab') {
        e.preventDefault();
        choose(pick);
      } else if (e.key === 'Escape') {
        sugg.hidden = true;
      }
    });
    input.addEventListener('blur', function () { setTimeout(function () { sugg.hidden = true; }, 150); });
    sugg.addEventListener('mousedown', function (e) { e.preventDefault(); });
    sugg.addEventListener('click', function (e) {
      var b = e.target.closest('[data-k]');
      if (b) choose(+b.getAttribute('data-k'));
    });
    document.querySelectorAll('#apa-ex button').forEach(function (b) {
      b.addEventListener('click', function () { input.value = b.getAttribute('data-ex'); sugg.hidden = true; update(); });
    });

    // « Copier la bibliographie » : italiques et retrait conservés quand on colle dans Word ou Google Docs
    $('apa-copy').addEventListener('click', function () {
      var btn = this;
      var html = BIB.map(function (b) { return '<p style="margin:0 0 0 .5in;text-indent:-.5in;line-height:2">' + b.html + '</p>'; }).join('');
      var plain = BIB.map(function (b) { return b.html.replace(/<\/?i>/g, ''); }).join('\n');
      var done = function () { btn.textContent = 'Copiée'; setTimeout(function () { btn.textContent = 'Copier la bibliographie'; }, 1600); };
      if (navigator.clipboard && window.ClipboardItem && window.isSecureContext) {
        navigator.clipboard.write([new ClipboardItem({ 'text/html': new Blob([html], { type: 'text/html' }), 'text/plain': new Blob([plain], { type: 'text/plain' }) })]).then(done, done);
      } else if (navigator.clipboard && window.isSecureContext) {
        navigator.clipboard.writeText(plain).then(done, done);
      } else {
        var area = document.createElement('textarea');
        area.value = plain;
        area.style.position = 'fixed';
        area.style.opacity = '0';
        document.body.appendChild(area);
        area.select();
        try { document.execCommand('copy'); } catch (err) {}
        area.remove();
        done();
      }
    });
    update();
  }

  // ----- plan et carte mentale : le même plan d'exemple -----
  var PLAN = {
    titre: "Le lien club–supporter à l'ère des réseaux sociaux",
    problematique: "En quoi les réseaux sociaux transforment-ils l'attachement des supporters à leur club ?",
    chapitres: [
      { titre: 'Introduction', sections: [{ titre: 'Introduction', statut: 'relu', mots: 1240, objectif: 1500, src: 3 }] },
      { n: '1', titre: 'Cadre théorique', sections: [
        { n: '1.1', titre: 'Le supporterisme', statut: 'final', mots: 2310, objectif: 2500, src: 6 },
        { n: '1.2', titre: 'Le supporter connecté', statut: 'brouillon', mots: 412, objectif: 1500, src: 1 },
        { n: '1.3', titre: 'Marketing sportif', statut: 'relu', mots: 1980, objectif: 2000, src: 5 }] },
      { n: '2', titre: 'Méthodologie', sections: [
        { n: '2.1', titre: 'Terrain et entretiens', statut: 'relu', mots: 2150, objectif: 2500, src: 2, idee: 'Interroger un community manager ?' },
        { n: '2.2', titre: 'Questionnaire', statut: 'brouillon', mots: 1640, objectif: 2000, src: 1 }] },
      { n: '3', titre: 'Résultats', sections: [
        { n: '3.1', titre: 'Ce que disent les supporters', statut: 'brouillon', mots: 1210, objectif: 3000, src: 2 },
        { n: '3.2', titre: 'Ce que publient les clubs', statut: 'brouillon', mots: 550, objectif: 2500, src: 1 },
        { n: '3.3', titre: 'Discussion', statut: 'idee', mots: 0, objectif: 1500, src: 0 }] },
      { titre: 'Conclusion', sections: [{ titre: 'Conclusion', statut: 'idee', mots: 0, objectif: 1000, src: 0 }] }
    ]
  };
  var STATUS = { idee: 'Idée', brouillon: 'Brouillon', relu: 'Relu', final: 'Final' };
  var STATUS_COL = { idee: '#4a4f56', brouillon: '#d9b46a', relu: '#9cc8e6', final: '#8fc79a' };
  var BRANCH = ['#9cc8e6', '#d9b46a', '#8fc79a', '#c9a0dc', '#e2917b'];
  var fmt = function (n) { return n.toLocaleString('fr-FR').replace(/ /g, ' '); };
  var sum = function (list, k) { return list.reduce(function (a, s) { return a + s[k]; }, 0); };

  var board = $('m-board');
  if (board) {
    board.innerHTML = PLAN.chapitres.map(function (c) {
      return '<div class="m-col"><div class="m-col-h"><b>' + (c.n ? c.n + '. ' : '') + esc(c.titre) + '</b><small>' + fmt(sum(c.sections, 'mots')) + ' / ' + fmt(sum(c.sections, 'objectif')) + ' mots</small></div>' +
        c.sections.map(function (s) {
          var col = s.statut === 'final' ? 'var(--green)' : s.statut === 'relu' ? 'var(--accent)' : s.statut === 'brouillon' ? 'var(--amber)' : '#4a4f56';
          return '<div class="m-card' + (s.n === '1.3' ? ' drag' : '') + '"><div class="t">' + (s.n ? '<em>' + s.n + '</em> ' : '') + esc(s.titre) + '</div>' +
            '<div class="m-bar"><i style="width:' + Math.min(100, s.mots / s.objectif * 100) + '%;background:' + col + '"></i></div>' +
            '<div class="m"><span><i class="dot st-' + s.statut + '"></i>' + STATUS[s.statut] + '</span><span>' + fmt(s.mots) + ' / ' + fmt(s.objectif) + '</span><span>' + s.src + ' src</span></div></div>';
        }).join('') + (c.n ? '<div class="m-add">+ Section</div>' : '') + '</div>';
    }).join('');
  }

  // calendrier d'activité : 12 semaines, régulier en semaine, plus calme le week-end
  var heat = $('m-heat');
  if (heat) {
    var cells = '', seed = 7;
    for (var d = 0; d < 84; d++) {
      seed = (seed * 9301 + 49297) % 233280;
      var r = seed / 233280, wk = d % 7 > 4, ramp = d / 84;
      var lv = r < (wk ? .55 : .25) - ramp * .15 ? 0 : r < .55 ? 1 : r < .85 ? 2 : 3;
      cells += '<i data-l="' + lv + '"></i>';
    }
    heat.innerHTML = cells;
  }

  // carte mentale : même principe que l'app (branches des deux côtés dans le sens des aiguilles d'une montre, ou arbre)
  var svg = $('mm-svg');
  if (svg) {
    var ctx = document.createElement('canvas').getContext('2d');
    var STYLE = {
      root: { font: '600 15px Newsreader, Georgia, serif', lh: 19, px: 14, py: 10, max: 250 },
      chapter: { font: '500 11px "Martian Mono", Menlo, monospace', lh: 15, px: 10, py: 8, max: 190 },
      section: { font: '13px "Instrument Sans", system-ui, sans-serif', lh: 17, px: 9, py: 7, max: 170 },
      idea: { font: 'italic 13px Newsreader, Georgia, serif', lh: 17, px: 9, py: 7, max: 170 }
    };
    var wrap = function (txt, st) {
      ctx.font = st.font;
      var words = txt.split(' '), lines = [], cur = '';
      words.forEach(function (w) {
        var t = cur ? cur + ' ' + w : w;
        if (ctx.measureText(t).width > st.max && cur) { lines.push(cur); cur = w; } else cur = t;
      });
      if (cur) lines.push(cur);
      return lines;
    };
    var node = function (kind, label, extra) {
      var st = STYLE[kind], n = extra || {};
      n.kind = kind;
      n.lines = wrap(label, st);
      ctx.font = st.font;
      var dot = kind === 'section' ? 12 : 0;
      var w = Math.max.apply(null, n.lines.map(function (l) { return ctx.measureText(l).width; }));
      n.sub = kind === 'root' ? wrap(PLAN.problematique, { font: 'italic 12px Newsreader, Georgia, serif', max: 250 }) : [];
      if (n.sub.length) { ctx.font = 'italic 12px Newsreader, Georgia, serif'; w = Math.max(w, Math.max.apply(null, n.sub.map(function (l) { return ctx.measureText(l).width; }))); }
      n.dot = dot;
      n.w = Math.ceil(w + st.px * 2 + dot);
      n.h = Math.ceil(n.lines.length * st.lh + st.py * 2 + (n.sub.length ? n.sub.length * 16 + 8 : 0) + (kind === 'section' ? 6 : 0));
      n.children = [];
      return n;
    };
    var build = function () {
      var root = node('root', PLAN.titre);
      PLAN.chapitres.forEach(function (c, i) {
        var color = BRANCH[i % BRANCH.length], parent;
        if (c.n) {
          parent = node('chapter', c.n + '. ' + c.titre, { color: color, words: sum(c.sections, 'mots'), target: sum(c.sections, 'objectif') });
          root.children.push(parent);
        } else parent = root;
        c.sections.forEach(function (s) {
          var sec = node('section', (s.n ? s.n + ' ' : '') + s.titre, { color: color, status: s.statut, words: s.mots, target: s.objectif, top: !c.n });
          parent.children.push(sec);
          if (s.idee) sec.children.push(node('idea', s.idee, { color: '#7e8590' }));
        });
      });
      return root;
    };
    var GAPX = { root: 64, chapter: 40, section: 30 };
    var gapY = function (n) { return n.kind === 'root' ? 22 : 10; };
    var extent = function (n) {
      n.children.forEach(extent);
      var kids = n.children.reduce(function (a, c) { return a + c.ext; }, 0) + Math.max(0, n.children.length - 1) * gapY(n);
      n.ext = Math.max(n.h, kids);
    };
    var place = function (n, side, kids) {
      kids = kids || n.children;
      var tot = kids.reduce(function (a, c) { return a + c.ext; }, 0) + Math.max(0, kids.length - 1) * gapY(n);
      var y = n.y - tot / 2;
      kids.forEach(function (c) {
        c.x = n.x + side * (n.w / 2 + GAPX[n.kind] + c.w / 2);
        c.y = y + c.ext / 2;
        c.parent = n;
        y += c.ext + gapY(n);
        place(c, side);
      });
    };
    var draw = function (layout) {
      var root = build();
      extent(root);
      root.x = 0; root.y = 0;
      if (layout === 'arbre') place(root, 1);
      else {
        var kids = root.children, tot = sum(kids, 'ext'), acc = 0, cut = kids.length;
        for (var i = 0; i < kids.length; i++) { acc += kids[i].ext; if (acc >= tot / 2) { cut = i + 1; break; } }
        if (kids.length > 1 && cut === kids.length) cut = kids.length - 1;
        place(root, 1, kids.slice(0, cut));
        place(root, -1, kids.slice(cut).reverse());
      }
      var all = [];
      (function walk(n) { all.push(n); n.children.forEach(walk); })(root);
      var x0 = Infinity, y0 = Infinity, x1 = -Infinity, y1 = -Infinity;
      all.forEach(function (n) { x0 = Math.min(x0, n.x - n.w / 2); y0 = Math.min(y0, n.y - n.h / 2 - 16); x1 = Math.max(x1, n.x + n.w / 2); y1 = Math.max(y1, n.y + n.h / 2); });
      var pad = 24, edges = '', nodes = '';
      all.forEach(function (n) {
        if (!n.parent) return;
        var p = n.parent, s = n.x >= p.x ? 1 : -1;
        var ax = p.x + s * p.w / 2, ay = p.y, bx = n.x - s * n.w / 2, by = n.y, mx = (ax + bx) / 2;
        var sw = p.kind === 'root' ? 3 : p.kind === 'chapter' ? 1.8 : 1.3;
        edges += '<path d="M' + ax.toFixed(1) + ' ' + ay.toFixed(1) + ' C' + mx.toFixed(1) + ' ' + ay.toFixed(1) + ' ' + mx.toFixed(1) + ' ' + by.toFixed(1) + ' ' + bx.toFixed(1) + ' ' + by.toFixed(1) + '" fill="none" stroke="' + n.color + '" stroke-opacity="' + (n.kind === 'idea' ? .55 : .85) + '" stroke-width="' + sw + '"' + (n.kind === 'idea' ? ' stroke-dasharray="4 3"' : '') + '/>';
      });
      all.forEach(function (n) {
        var st = STYLE[n.kind], x = n.x - n.w / 2, y = n.y - n.h / 2;
        var fill = '#0b0c0d', stroke = '#33373b', sw = 1, tc = '#d4d8de', dash = '';
        if (n.kind === 'root') { fill = '#9cc8e6'; stroke = '#9cc8e6'; tc = '#000'; }
        if (n.kind === 'chapter') { stroke = n.color; sw = 1.5; tc = '#f1f4f7'; }
        if (n.kind === 'idea') { fill = '#050505'; stroke = n.color; dash = ' stroke-dasharray="4 3"'; }
        if (n.kind === 'section' && n.top) { stroke = n.color; tc = '#f1f4f7'; }
        var g = '<rect x="' + x + '" y="' + y + '" width="' + n.w + '" height="' + n.h + '" fill="' + fill + '" stroke="' + stroke + '" stroke-width="' + sw + '"' + dash + '/>';
        if (n.kind === 'section') g += '<rect x="' + (x + st.px) + '" y="' + (y + st.py + st.lh / 2 - 3) + '" width="6" height="6" fill="' + STATUS_COL[n.status] + '"/>';
        var family = st.font.replace(/^(italic )?\d*\s*\d+px /, '').replace(/"/g, "'");
        var weight = (st.font.match(/^(\d{3}) /) || [0, 400])[1];
        var size = st.font.match(/(\d+)px/)[1];
        n.lines.forEach(function (l, i) {
          g += '<text x="' + (x + st.px + n.dot) + '" y="' + (y + st.py + st.lh * i + st.lh * .74).toFixed(1) + '" font-family="' + family + '" font-size="' + size + '" font-weight="' + weight + '"' + (n.kind === 'idea' ? ' font-style="italic"' : '') + ' fill="' + tc + '">' + esc(l) + '</text>';
        });
        if (n.sub.length) {
          var sy = y + st.py + n.lines.length * st.lh + 8;
          n.sub.forEach(function (l, i) { g += '<text x="' + (x + st.px) + '" y="' + (sy + 16 * i + 12) + '" font-family="Newsreader, Georgia, serif" font-size="12" font-style="italic" fill="#000" fill-opacity=".75">' + esc(l) + '</text>'; });
        }
        if (n.kind === 'section' && n.target) {
          var bw = n.w - st.px * 2, by2 = y + n.h - st.py - 2;
          g += '<rect x="' + (x + st.px) + '" y="' + by2 + '" width="' + bw + '" height="2" fill="#1a1c1f"/><rect x="' + (x + st.px) + '" y="' + by2 + '" width="' + (bw * Math.min(1, n.words / n.target)).toFixed(1) + '" height="2" fill="' + n.color + '"/>';
        }
        if (n.kind === 'chapter') g += '<text x="' + (x + n.w - 8) + '" y="' + (y - 6) + '" text-anchor="end" font-family="\'Instrument Sans\', system-ui, sans-serif" font-size="10" fill="#7e8590">' + fmt(n.words) + ' / ' + fmt(n.target) + ' mots</text>';
        nodes += '<g>' + g + '</g>';
      });
      svg.setAttribute('viewBox', [x0 - pad, y0 - pad, x1 - x0 + pad * 2, y1 - y0 + pad * 2].map(function (v) { return v.toFixed(0); }).join(' '));
      svg.innerHTML = edges + nodes;
    };
    var layout = 'carte';
    var redraw = function () { draw(layout); };
    document.querySelectorAll('.mm-seg [data-layout]').forEach(function (b) {
      b.addEventListener('click', function () {
        layout = b.getAttribute('data-layout');
        document.querySelectorAll('.mm-seg [data-layout]').forEach(function (x) { x.setAttribute('aria-pressed', x === b); });
        redraw();
      });
    });
    redraw();
    // les mesures de texte dépendent des polices : on redessine une fois qu'elles sont chargées
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(redraw);
  }
})();
