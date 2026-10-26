// Moteur APA 7 de l'app (public/apa.js), repris tel quel : la démo des citations utilise le vrai code.
// Citations aux normes APA 7 (avec l'adaptation française : « et », « s. d. », « dir. », « Dans »).
// Les sources sont au format CSL-JSON (celui de Zotero) ; les citations dans le texte suivent la
// syntaxe Pandoc : [@cle], [@cle, p. 12], [voir @a; @b], [-@cle] (sans l'auteur), @cle (narratif).
// Marche dans la page (window.APA) et dans Node (require) pour les tests.
(function (root) {
  const L = {
    fr: { and: "et", andNarr: "et", etal: "et al.", nd: "s. d.", p: "p.", pp: "p.", ed: "dir.", eds: "dir.", in: "Dans", edition: (n) => `${n}${n == 1 ? "re" : "e"} éd.`, perso: "communication personnelle", thesis: "Thèse de doctorat", master: "Mémoire de maîtrise", report: "Rapport", no: "no", retrieved: (d, u) => `Consulté le ${d}, à ${u}`, months: ["janvier", "février", "mars", "avril", "mai", "juin", "juillet", "août", "septembre", "octobre", "novembre", "décembre"], dateOrder: "dm", conf: "Communication", inPress: "sous presse" },
    en: { and: "&", andNarr: "and", etal: "et al.", nd: "n.d.", p: "p.", pp: "pp.", ed: "Ed.", eds: "Eds.", in: "In", edition: (n) => `${n}${ord(n)} ed.`, perso: "personal communication", thesis: "Doctoral dissertation", master: "Master's thesis", report: "Report", no: "No.", retrieved: (d, u) => `Retrieved ${d}, from ${u}`, months: ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"], dateOrder: "md", conf: "Paper presentation", inPress: "in press" },
  };
  function ord(n) { n = Number(n); return n % 10 === 1 && n % 100 !== 11 ? "st" : n % 10 === 2 && n % 100 !== 12 ? "nd" : n % 10 === 3 && n % 100 !== 13 ? "rd" : "th"; }

  const esc = (s) => String(s ?? "").replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
  const it = (s) => `<i>${s}</i>`;
  // termine par un point sauf si la phrase finit déjà par une ponctuation forte
  const dot = (s) => (/[.?!…]$/.test(s.replace(/<\/i>$/, "")) ? s : s + ".");
  const dash = (pages) => String(pages || "").replace(/\s*[-–—]+\s*/g, "–");

  // Types Crossref (renvoyés par doi.org) et BibTeX ramenés aux types CSL.
  const TYPE = {
    "journal-article": "article-journal", "book-chapter": "chapter", "proceedings-article": "paper-conference",
    "edited-book": "book", monograph: "book", "reference-book": "book", dissertation: "thesis", "posted-content": "article",
    "report-component": "report", "journal": "periodical", "web": "webpage", "post": "post-weblog",
    article: "article-journal", inbook: "chapter", incollection: "chapter", inproceedings: "paper-conference", conference: "paper-conference",
    phdthesis: "thesis", mastersthesis: "thesis", techreport: "report", misc: "document", online: "webpage", electronic: "webpage",
  };
  function normalize(item) {
    const x = { ...item };
    if (TYPE[x.type]) x.type = TYPE[x.type];
    if (!x.type) x.type = "document";
    for (const k of ["title", "container-title", "publisher", "collection-title"]) if (Array.isArray(x[k])) x[k] = x[k][0];
    if (!x.issued && x["published-print"]) x.issued = x["published-print"];
    if (!x.issued && x["published-online"]) x.issued = x["published-online"];
    if (x.DOI) x.DOI = String(x.DOI).replace(/^https?:\/\/(dx\.)?doi\.org\//i, "");
    if (x.title) x.title = String(x.title).replace(/<[^>]+>/g, "").replace(/\s+/g, " ").trim();
    return x;
  }

  // ---------------- Noms ----------------
  const names = (x) => (x.author && x.author.length ? x.author : null);
  const family = (n) => n.literal || [n["non-dropping-particle"], n.family].filter(Boolean).join(" ") || n.given || "";
  // « Jean-Pierre Marie » → « J.-P. M. »
  const initials = (given) => String(given || "").trim().split(/\s+/).filter(Boolean)
    .map((w) => w.split("-").map((p) => (/^[\p{Lu}\p{Ll}]/u.test(p) ? p[0].toUpperCase() + "." : p)).join("-")).join(" ");
  const invName = (n) => (n.literal ? esc(n.literal) : esc(family(n)) + (n.given ? ", " + initials(n.given) : "") + (n.suffix ? ", " + esc(n.suffix) : ""));
  const fwdName = (n) => (n.literal ? esc(n.literal) : (n.given ? initials(n.given) + " " : "") + esc(family(n)));

  function joinList(parts, lang, serial) {
    const l = L[lang];
    if (parts.length <= 1) return parts.join("");
    if (lang === "fr") return parts.slice(0, -1).join(", ") + ` ${l.and} ` + parts[parts.length - 1];
    return parts.slice(0, -1).join(", ") + (serial ? `, ${l.and} ` : ` ${l.and} `) + parts[parts.length - 1];
  }
  // liste d'auteurs de la bibliographie : jusqu'à 20 ; au-delà, les 19 premiers, « … » et le dernier
  function refAuthors(list, lang) {
    const inv = list.map(invName);
    if (inv.length > 20) return inv.slice(0, 19).join(", ") + ", . . . " + inv[inv.length - 1];
    return joinList(inv, lang, true);
  }
  function editorsFwd(list, lang) {
    const l = L[lang];
    return joinList(list.map(fwdName), lang, false) + ` (${list.length > 1 ? l.eds : l.ed})`;
  }

  // ---------------- Dates ----------------
  function parts(x, key = "issued") {
    const d = x[key];
    if (!d) return null;
    if (d.literal) return { literal: d.literal };
    const p = d["date-parts"]?.[0];
    if (!p || !p[0]) return d.raw ? { literal: d.raw } : null;
    return { y: p[0], m: p[1], d: p[2] };
  }
  const year = (x, lang) => { const p = parts(x); return p ? (p.literal || String(p.y)) : L[lang].nd; };
  // en citation, « s. d.-a » prend un tiret, une année « 2022a » non
  const yearSuf = (x, lang, suf) => { const y = year(x, lang); return suf ? (/^\d+$/.test(y) ? y + suf : y + "-" + suf) : y; };
  function longDate(p, lang) {
    if (!p || p.literal) return p?.literal || "";
    const l = L[lang], m = p.m ? l.months[p.m - 1] : "";
    if (!m) return String(p.y);
    if (lang === "fr") return `${p.d ? (p.d === 1 ? "1er" : p.d) + " " : ""}${m} ${p.y}`;
    return `${m}${p.d ? " " + p.d : ""}, ${p.y}`;
  }
  // (2024, 12 mars) pour les articles de presse, pages web, communications
  function refDate(x, lang, withDay, suf = "") {
    const p = parts(x), l = L[lang];
    if (!p) return `(${l.nd}${suf ? "-" + suf : ""})`;
    if (p.literal) return `(${esc(p.literal)}${suf ? "-" + suf : ""})`;
    if (withDay && p.m) {
      const m = l.months[p.m - 1];
      return lang === "fr" ? `(${p.y}${suf}, ${p.d ? (p.d === 1 ? "1er" : p.d) + " " : ""}${m})` : `(${p.y}${suf}, ${m}${p.d ? " " + p.d : ""})`;
    }
    return `(${p.y}${suf})`;
  }

  // ---------------- Lettres a, b… pour un même auteur la même année ----------------
  const authorKey = (x) => (names(x) || x.editor || []).map(family).join("|").toLowerCase() || (x.title || "").toLowerCase();
  function suffixes(items, lang) {
    const groups = new Map();
    for (const x of items) {
      if (x.type === "personal_communication") continue;
      const k = authorKey(x) + "#" + year(x, lang);
      if (!groups.has(k)) groups.set(k, []);
      groups.get(k).push(x);
    }
    const out = new Map();
    for (const g of groups.values()) if (g.length > 1) {
      g.sort((a, b) => String(a.title || "").localeCompare(String(b.title || ""), lang));
      g.forEach((x, i) => out.set(x.id, String.fromCharCode(97 + i)));
    }
    return out;
  }

  // ---------------- Bibliographie ----------------
  const ITALIC_TITLE = new Set(["book", "thesis", "report", "webpage", "post-weblog", "dataset", "software", "motion_picture", "document", "paper-conference", "speech", "periodical", "map", "graphic", "song", "broadcast", "patent", "legislation", "standard"]);
  function link(x) {
    if (x.DOI) return `https://doi.org/${esc(x.DOI)}`;
    if (x.URL) return esc(x.URL);
    return "";
  }
  function reference(raw, ctx = {}) {
    const lang = ctx.lang || "fr", l = L[lang], x = normalize(raw), suf = ctx.suffix || "";
    const title = esc(x.title || "");
    const cont = esc(x["container-title"] || "");
    const pub = esc(x.publisher || "");
    const au = names(x);
    let who;
    const withDay = ["article-newspaper", "article-magazine", "webpage", "post-weblog", "post", "paper-conference", "speech", "broadcast"].includes(x.type);
    const dateStr = refDate(x, lang, withDay, suf);
    let titleStart = false;
    if (au) who = refAuthors(au, lang);
    else if (x.editor && x.editor.length && x.type === "book") who = refAuthors(x.editor, lang) + ` (${x.editor.length > 1 ? l.eds : l.ed})`;
    else titleStart = true;

    // titre : en italique pour les œuvres autonomes, en romain pour les parties d'un tout
    const italicTitle = ITALIC_TITLE.has(x.type);
    let t = italicTitle ? it(title) : title;
    const extra = [];
    const partOf = ["chapter", "entry-encyclopedia", "entry-dictionary", "paper-conference"].includes(x.type);
    if (partOf) { /* édition et volume vont avec l'ouvrage, plus loin */ }
    else if (x.edition && Number(x.edition) > 1) extra.push(l.edition(x.edition));
    else if (x.edition && isNaN(Number(x.edition))) extra.push(esc(x.edition));
    if (x.type === "report" && x.number) extra.push(`${esc(x.genre || l.report)} ${l.no} ${esc(x.number)}`);
    if (x.volume && italicTitle && !partOf && x.type !== "periodical") extra.push(`Vol. ${esc(x.volume)}`);
    if (extra.length) t += ` (${extra.join(", ")})`;
    if (x.type === "thesis") t += ` [${esc(x.genre || l.thesis)}${pub ? ", " + pub : ""}]`;
    if (x.type === "paper-conference" && !cont) t += ` [${esc(x.genre || l.conf)}]`;

    let out = titleStart ? `${dot(t)} ${dateStr}.` : `${dot(who)} ${dateStr}. ${dot(t)}`;
    const tail = [];

    switch (x.type) {
      case "article-journal":
      case "article": {
        if (cont) {
          let s = it(cont);
          if (x.volume) s += `, ${it(esc(x.volume))}`;
          if (x.issue) s += `(${esc(x.issue)})`;
          if (x.page) s += `, ${esc(dash(x.page))}`;
          else if (x.number) s += `, ${lang === "fr" ? "article" : "Article"} ${esc(x.number)}`;
          tail.push(dot(s));
        }
        break;
      }
      case "article-newspaper":
      case "article-magazine": {
        if (cont) {
          let s = it(cont);
          if (x.volume) s += `, ${it(esc(x.volume))}`;
          if (x.issue) s += `(${esc(x.issue)})`;
          if (x.page) s += `, ${esc(dash(x.page))}`;
          tail.push(dot(s));
        }
        break;
      }
      case "chapter":
      case "entry-encyclopedia":
      case "entry-dictionary":
      case "paper-conference": {
        if (cont && (x.type !== "paper-conference" || x.editor)) {
          let s = `${l.in} ` + (x.editor && x.editor.length ? editorsFwd(x.editor, lang) + ", " : "") + it(cont);
          const det = [];
          if (x.edition && Number(x.edition) > 1) det.push(l.edition(x.edition));
          if (x.volume) det.push(`Vol. ${esc(x.volume)}`);
          if (x.page) det.push(`${/[-–]/.test(x.page) ? l.pp : l.p} ${esc(dash(x.page))}`);
          if (det.length) s += ` (${det.join(", ")})`;
          tail.push(dot(s));
          if (pub) tail.push(dot(pub));
        } else if (x.type === "paper-conference") {
          const ev = [esc(x["event-title"] || x.event || cont), esc(x["event-place"] || x["publisher-place"] || "")].filter(Boolean).join(", ");
          if (ev) tail.push(dot(ev));
        }
        break;
      }
      case "thesis":
        if (x.archive) tail.push(dot(esc(x.archive)));
        break;
      case "webpage":
      case "post-weblog":
      case "post": {
        const site = cont || pub;
        if (site && site !== (au ? au.map(family).join(", ") : "")) tail.push(dot(site));
        break;
      }
      default: {
        // livre, rapport, document… : l'éditeur, sauf s'il est aussi l'auteur
        const authorName = au && au.length === 1 ? esc(family(au[0])) : "";
        if (pub && pub !== authorName) tail.push(dot(pub));
        else if (cont && !pub) tail.push(dot(it(cont)));
      }
    }
    if (tail.length) out += " " + tail.join(" ");
    const u = link(x);
    if (u) {
      const acc = parts(x, "accessed");
      if (!x.DOI && acc && (x.type === "webpage") && ctx.retrieved !== false) out += " " + l.retrieved(longDate(acc, lang), u);
      else out += " " + u;
    }
    return out.replace(/\s+/g, " ").replace(/\.\./g, ".").trim();
  }

  function sortKey(x, lang) {
    const au = names(x) || x.editor;
    const lead = au ? au.map((n) => family(n) + " " + (n.given || "")).join(" ") : String(x.title || "");
    const p = parts(x);
    return [lead.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase(), p && !p.literal ? String(p.y).padStart(4, "0") : "0000", String(x.title || "").toLowerCase()];
  }
  // liste des références, triée, sans les communications personnelles (APA ne les y met pas)
  function bibliography(items, opts = {}) {
    const lang = opts.lang || "fr";
    const list = items.map(normalize).filter((x) => x.type !== "personal_communication");
    const suf = suffixes(list, lang);
    list.sort((a, b) => {
      const ka = sortKey(a, lang), kb = sortKey(b, lang);
      for (let i = 0; i < 3; i++) { const c = ka[i].localeCompare(kb[i], lang); if (c) return c; }
      return (suf.get(a.id) || "").localeCompare(suf.get(b.id) || "");
    });
    return list.map((x) => ({ id: x.id, html: reference(x, { lang, suffix: suf.get(x.id) || "" }) }));
  }

  // ---------------- Citations dans le texte ----------------
  function shortAuthor(x, lang, narrative) {
    const l = L[lang];
    const au = names(x) || (x.type === "book" ? x.editor : null);
    if (!au || !au.length) {
      // sans auteur : le titre (italique pour une œuvre autonome, guillemets sinon)
      const t = esc(String(x.title || "?").split(/[:.?!]/)[0].trim());
      return ITALIC_TITLE.has(x.type) ? it(t) : lang === "fr" ? `« ${t} »` : `“${t}”`;
    }
    if (au.length === 1) return esc(family(au[0]));
    if (au.length === 2) return `${esc(family(au[0]))} ${narrative ? l.andNarr : l.and} ${esc(family(au[1]))}`;
    return `${esc(family(au[0]))} ${l.etal}`;
  }
  function locator(c, lang) {
    if (!c.locator) return "";
    const loc = String(c.locator).trim();
    // « p. 12 », « chap. 3 », « para. 4 »… gardés tels quels ; un nombre seul devient une page
    if (/^[\d\s–-]+$/.test(loc)) return `${/[-–]/.test(loc) ? L[lang].pp : L[lang].p} ${dash(loc)}`;
    return esc(loc.replace(/^pp?\.\s*/, (m) => (/[-–]/.test(loc) ? L[lang].pp + " " : L[lang].p + " ")).replace(/\s*[-–]\s*/g, "–"));
  }
  function persoDate(x, lang) { const p = parts(x); return p ? longDate(p, lang) : L[lang].nd; }

  // Une grappe Pandoc [@a, p. 4; voir @b] → (Auteur, 2020, p. 4 ; voir Autre, 2021) selon APA.
  function cite(cluster, lib, opts = {}) {
    const lang = opts.lang || "fr", l = L[lang];
    const all = [...lib.values()];
    const suf = opts.suffixes || suffixes(all, lang);
    const missing = [];
    const pieces = cluster.map((c) => {
      const x = lib.get(c.id);
      if (!x) { missing.push(c.id); return { key: "~" + c.id, html: `@${esc(c.id)} ?`, missing: true }; }
      const y = yearSuf(x, lang, suf.get(x.id));
      if (x.type === "personal_communication") {
        const au = names(x)?.[0];
        const who = au ? fwdName(au) : esc(x.title || "");
        return { key: family(au || {}) + y, html: `${who}, ${l.perso}, ${persoDate(x, lang)}`, x };
      }
      return { key: sortKey(x, lang).join(" "), author: c.suppressAuthor ? "" : shortAuthor(x, lang, opts.narrative), year: y, loc: locator(c, lang), prefix: c.prefix ? esc(c.prefix) : "", suffix: c.suffix ? esc(c.suffix) : "", x };
    });
    if (opts.narrative) {
      // narratif : Auteur (2020, p. 4)
      return pieces.map((p) => p.missing ? p.html : p.x?.type === "personal_communication" ? p.html : `${p.author} (${[p.year, p.loc].filter(Boolean).join(", ")}${p.suffix ? " " + p.suffix : ""})`).join(lang === "fr" ? " ; " : "; ");
    }
    // plusieurs œuvres : ordre alphabétique (sauf si un préfixe impose l'ordre) ; même auteur → années à la suite
    const ordered = pieces.some((p) => p.prefix) ? pieces : [...pieces].sort((a, b) => a.key.localeCompare(b.key, lang));
    const out = [];
    for (const p of ordered) {
      const prev = out[out.length - 1];
      if (prev && !p.missing && !prev.missing && p.author && p.author === prev.author && !p.prefix && !prev.loc && !p.x?.type?.startsWith("personal")) {
        prev.years.push([p.year, p.loc].filter(Boolean).join(", "));
        prev.loc = p.loc;
        continue;
      }
      out.push({ ...p, years: p.missing ? [] : [[p.year, p.loc].filter(Boolean).join(", ")] });
    }
    const body = out.map((p) => {
      if (p.missing || p.x?.type === "personal_communication") return p.html;
      const core = [p.author, p.years.join(", ")].filter(Boolean).join(", ");
      return [p.prefix, core, p.suffix].filter(Boolean).join(" ");
    }).join(lang === "fr" ? " ; " : "; ");
    return `(${body})`;
  }

  // ---------------- Lecture de la syntaxe Pandoc ----------------
  const KEY = "[\\w][\\w:.#$%&+?<>~/-]*[\\w]|[\\w]";
  // une citation dans une grappe : « voir @cle, p. 12 » ou « -@cle »
  function parseCluster(inner) {
    const out = [];
    for (const raw of inner.split(";")) {
      const m = raw.match(new RegExp(`^\\s*(.*?)\\s*(-?)@(${KEY})\\s*(?:,\\s*(.*?))?\\s*$`));
      if (!m) return null;
      let loc = m[4] || "", suffix = "";
      // « p. 12, nous soulignons » : le localisateur puis un suffixe libre
      const lm = loc.match(/^((?:p{1,2}\.|chap\.|para\.|section|sect\.|vol\.|fig\.|n[o°]\.?|art\.)?\s*[\d\w–-]+)(?:,\s*(.*))?$/i);
      if (lm) { loc = lm[1]; suffix = lm[2] || ""; } else if (loc) { suffix = loc; loc = ""; }
      out.push({ id: m[3], prefix: m[1] || "", suppressAuthor: m[2] === "-", locator: loc, suffix });
    }
    return out.length ? out : null;
  }
  // Repère toutes les citations d'un texte : [{ start, end, cluster, narrative }]
  function scan(text) {
    const found = [];
    const bracket = /\[([^\[\]]*@[^\[\]]*)\]/g;
    let m;
    while ((m = bracket.exec(text))) {
      const cluster = parseCluster(m[1]);
      if (cluster) found.push({ start: m.index, end: m.index + m[0].length, cluster, narrative: false });
    }
    // narratif : @cle hors crochets, éventuellement suivi de [p. 12]
    const bare = new RegExp(`(^|[\\s(«“])@(${KEY})(?:\\s*\\[([^\\]]*)\\])?`, "g");
    while ((m = bare.exec(text))) {
      const start = m.index + m[1].length;
      if (found.some((f) => start >= f.start && start < f.end)) continue;
      found.push({ start, end: m.index + m[0].length, cluster: [{ id: m[2], locator: (m[3] || "").trim(), prefix: "", suffix: "" }], narrative: true });
    }
    return found.sort((a, b) => a.start - b.start);
  }

  // ---------------- Import BibTeX (le plus courant) ----------------
  function parseBibTeX(src) {
    const items = [];
    const entry = /@(\w+)\s*\{\s*([^,\s]+)\s*,/g;
    let m;
    while ((m = entry.exec(src))) {
      const type = m[1].toLowerCase(), id = m[2];
      if (["comment", "string", "preamble"].includes(type)) continue;
      // lit les champs jusqu'à l'accolade fermante correspondante
      let i = entry.lastIndex, depth = 1, body = "";
      while (i < src.length && depth > 0) { const ch = src[i]; if (ch === "{") depth++; else if (ch === "}") depth--; if (depth > 0) body += ch; i++; }
      entry.lastIndex = i;
      const f = {};
      const field = /(\w+)\s*=\s*/g;
      let fm;
      while ((fm = field.exec(body))) {
        let j = field.lastIndex, val = "";
        if (body[j] === "{") { let d = 0; do { if (body[j] === "{") d++; else if (body[j] === "}") d--; if (d > 0 && !(d === 1 && body[j] === "{")) val += body[j]; j++; } while (j < body.length && d > 0); }
        else if (body[j] === '"') { j++; while (j < body.length && body[j] !== '"') val += body[j++]; j++; }
        else { while (j < body.length && /[\w]/.test(body[j])) val += body[j++]; }
        field.lastIndex = j;
        f[fm[1].toLowerCase()] = latex(val.replace(/[{}]/g, "").replace(/\s+/g, " ").trim());
      }
      const people = (s) => (s ? s.split(/\s+and\s+/i).map((n) => {
        n = n.trim();
        if (/^\{.*\}$/.test(n)) return { literal: n.slice(1, -1) };
        if (n.includes(",")) { const [fam, giv] = n.split(",").map((t) => t.trim()); return { family: fam, given: giv }; }
        const w = n.split(/\s+/); return w.length > 1 ? { family: w.pop(), given: w.join(" ") } : { literal: n };
      }) : undefined);
      const x = { id, type: TYPE[type] || (type === "book" ? "book" : type === "report" ? "report" : "document") };
      if (f.author) x.author = people(f.author);
      if (f.editor) x.editor = people(f.editor);
      if (f.title) x.title = f.title;
      const cont = f.journal || f.journaltitle || f.booktitle;
      if (cont) x["container-title"] = cont;
      const y = parseInt(f.year || f.date, 10);
      if (y) { const mo = f.month ? (isNaN(f.month) ? ["jan", "feb", "mar", "apr", "may", "jun", "jul", "aug", "sep", "oct", "nov", "dec"].indexOf(f.month.slice(0, 3).toLowerCase()) + 1 : Number(f.month)) : 0; x.issued = { "date-parts": [mo > 0 ? [y, mo] : [y]] }; }
      for (const [b, c] of [["volume", "volume"], ["number", type === "article" ? "issue" : "number"], ["pages", "page"], ["publisher", "publisher"], ["address", "publisher-place"], ["doi", "DOI"], ["url", "URL"], ["edition", "edition"], ["isbn", "ISBN"]]) if (f[b]) x[c] = f[b];
      if (type === "phdthesis") { x.genre = "Thèse de doctorat"; x.publisher = f.school; }
      if (type === "mastersthesis") { x.genre = "Mémoire de maîtrise"; x.publisher = f.school; }
      if (type === "techreport" && f.institution) x.publisher = f.institution;
      if (f.urldate) { const d = f.urldate.split("-").map(Number); x.accessed = { "date-parts": [d] }; }
      items.push(x);
    }
    return items;
  }
  function latex(s) {
    return s.replace(/\\'\{?e\}?/g, "é").replace(/\\`\{?e\}?/g, "è").replace(/\\\^\{?e\}?/g, "ê").replace(/\\'\{?a\}?/g, "á").replace(/\\`\{?a\}?/g, "à").replace(/\\\^\{?a\}?/g, "â")
      .replace(/\\c\{?c\}?/g, "ç").replace(/\\"\{?o\}?/g, "ö").replace(/\\"\{?u\}?/g, "ü").replace(/\\"\{?i\}?/g, "ï").replace(/\\\^\{?o\}?/g, "ô").replace(/\\\^\{?i\}?/g, "î").replace(/\\\^\{?u\}?/g, "û")
      .replace(/\\&/g, "&").replace(/--/g, "–").replace(/\\[a-zA-Z]+\s*/g, "");
  }

  // Clé de citation proposée pour une nouvelle source : nom du premier auteur + année (lemaire2022)
  function makeKey(x, taken = new Set()) {
    const au = names(x) || x.editor;
    const base = ((au && au[0] ? family(au[0]) : String(x.title || "source").split(/\s+/)[0]) || "source")
      .normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase().replace(/[^a-z0-9]+/g, "").slice(0, 20) || "source";
    const p = parts(x);
    let k = base + (p && p.y ? p.y : "sd"), i = 0;
    while (taken.has(k + (i ? String.fromCharCode(96 + i) : ""))) i++;
    return k + (i ? String.fromCharCode(96 + i) : "");
  }

  const api = { normalize, reference, bibliography, cite, scan, parseCluster, parseBibTeX, makeKey, suffixes, year, shortAuthor: (x, lang = "fr") => shortAuthor(normalize(x), lang, false) };
  if (typeof module === "object" && module.exports) module.exports = api;
  else root.APA = api;
})(typeof window !== "undefined" ? window : globalThis);
