(function () {
  var buttons = document.querySelectorAll('.copy');

  function fallbackCopy(text) {
    var area = document.createElement('textarea');
    area.value = text;
    area.setAttribute('readonly', '');
    area.style.position = 'fixed';
    area.style.top = '-1000px';
    area.style.opacity = '0';
    document.body.appendChild(area);
    area.select();
    try { document.execCommand('copy'); } catch (error) {}
    document.body.removeChild(area);
  }

  Array.prototype.forEach.call(buttons, function (button) {
    button.addEventListener('click', function () {
      var text = button.getAttribute('data-copy') || '';

      if (navigator.clipboard && window.isSecureContext) {
        navigator.clipboard.writeText(text).catch(function () {
          fallbackCopy(text);
        });
      } else {
        fallbackCopy(text);
      }

      button.textContent = 'copié';
      button.setAttribute('aria-label', 'Commande copiée');
      window.setTimeout(function () {
        button.textContent = 'copier';
        button.setAttribute('aria-label', 'Copier la commande ' + text);
      }, 1600);
    });
  });
})();

(function () {
  var groups = document.querySelectorAll('[data-tabs]');

  Array.prototype.forEach.call(groups, function (group) {
    var tabs = group.querySelectorAll('[role="tab"]');
    var panels = group.querySelectorAll('[role="tabpanel"]');

    if (!tabs.length || !panels.length) return;

    function activate(index, moveFocus) {
      Array.prototype.forEach.call(tabs, function (tab, i) {
        var selected = i === index;
        tab.setAttribute('aria-selected', selected ? 'true' : 'false');
        tab.tabIndex = selected ? 0 : -1;
      });

      Array.prototype.forEach.call(panels, function (panel, i) {
        panel.hidden = i !== index;
      });

      if (moveFocus) {
        tabs[index].focus();
      }
    }

    Array.prototype.forEach.call(tabs, function (tab, i) {
      tab.addEventListener('click', function () {
        activate(i, false);
      });

      tab.addEventListener('keydown', function (event) {
        var next = null;

        if (event.key === 'ArrowRight') {
          next = (i + 1) % tabs.length;
        } else if (event.key === 'ArrowLeft') {
          next = (i - 1 + tabs.length) % tabs.length;
        } else if (event.key === 'Home') {
          next = 0;
        } else if (event.key === 'End') {
          next = tabs.length - 1;
        }

        if (next !== null) {
          event.preventDefault();
          activate(next, true);
        }
      });
    });

    // sans JavaScript, les deux panneaux restent visibles l'un sous l'autre
    activate(0, false);
  });
})();

// fond du hero : vidéo NASA, sinon trou noir rendu en WebGL, sinon dégradé CSS
(function () {
  var hero = document.querySelector('.hero');
  var video = hero && hero.querySelector('.hero-video');
  var canvas = hero && hero.querySelector('.hero-bh');
  if (!hero || !video || !canvas) return;

  var reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var fallbackStarted = false;
  var visible = true;

  function showVideo() {
    if (fallbackStarted) return;
    video.classList.add('on');
    if (reduced) video.pause();
  }

  function fallback() {
    if (fallbackStarted || video.classList.contains('on')) return;
    fallbackStarted = true;
    video.remove();
    startWebGL();
  }

  var autoplayBlocked = false;
  video.addEventListener('playing', showVideo);
  // lecture auto refusée (mode économie d'énergie…) : on garde l'image fixe de la vidéo
  video.addEventListener('loadeddata', function () { if (reduced || autoplayBlocked) showVideo(); });
  var sources = video.querySelectorAll('source');
  if (sources.length) sources[sources.length - 1].addEventListener('error', fallback);
  var playAttempt = video.play && video.play();
  if (playAttempt && playAttempt.catch) playAttempt.catch(function () {
    autoplayBlocked = true;
    if (video.readyState >= 2) showVideo();
  });
  window.setTimeout(function () { if (video.readyState < 2) fallback(); }, 4000);

  if ('IntersectionObserver' in window) {
    new IntersectionObserver(function (entries) {
      visible = entries[0].isIntersecting;
      if (!video.isConnected || reduced) return;
      if (visible) video.play().catch(function () {}); else video.pause();
    }).observe(hero);
  }

  function startWebGL() {
    var gl = canvas.getContext('webgl', { antialias: false, alpha: false, powerPreference: 'high-performance' });
    if (!gl) return;

    var vert = 'attribute vec2 p;void main(){gl_Position=vec4(p,0.,1.);}';
    var frag = [
      'precision highp float;',
      'uniform vec2 uRes;uniform float uTime;uniform vec2 uMouse;',
      'float hash(vec3 p){p=fract(p*.3183099+.1);p*=17.;return fract(p.x*p.y*p.z*(p.x+p.y+p.z));}',
      'float noise(vec3 x){vec3 i=floor(x),f=fract(x);f=f*f*(3.-2.*f);',
      ' return mix(mix(mix(hash(i),hash(i+vec3(1,0,0)),f.x),mix(hash(i+vec3(0,1,0)),hash(i+vec3(1,1,0)),f.x),f.y),',
      '  mix(mix(hash(i+vec3(0,0,1)),hash(i+vec3(1,0,1)),f.x),mix(hash(i+vec3(0,1,1)),hash(i+vec3(1,1,1)),f.x),f.y),f.z);}',
      'float fbm(vec3 p){float v=0.,a=.5;for(int i=0;i<4;i++){v+=a*noise(p);p*=2.03;a*=.5;}return v;}',
      'vec3 sky(vec3 d){',
      ' vec3 c=d*220.;vec3 id=floor(c);float h=hash(id);',
      ' float s=smoothstep(.5,0.,length(fract(c)-.5))*step(.992,h)*(.5+.5*h);',
      ' float n=fbm(d*3.+7.);',
      ' return vec3(s)*vec3(.85,.93,1.)+vec3(.05,.09,.14)*pow(n,3.)*1.6;}',
      'vec3 disk(vec3 p,vec3 d,out float a){',
      ' float r=length(p.xz);',
      ' float ang=atan(p.z,p.x)+uTime*1.6/pow(r,1.5);',
      ' float n=fbm(vec3(cos(ang)*1.6,sin(ang)*1.6,r*1.7));',
      ' float edge=smoothstep(2.6,3.4,r)*smoothstep(11.,6.5,r);',
      ' float dens=edge*(.35+.9*n);',
      ' vec3 v=normalize(vec3(-p.z,0.,p.x))*sqrt(.5/r);',
      ' float dop=clamp(1./(1.-dot(v,-normalize(d))),.4,2.2);',
      ' float t=clamp((r-2.6)/7.,0.,1.);',
      ' vec3 hot=mix(vec3(1.,.9,.72),vec3(1.,.45,.12),t);',
      ' hot=mix(hot,vec3(.4,.06,.02),t*t);',
      ' a=clamp(dens*1.4,0.,1.);',
      ' return hot*dens*pow(dop,3.)*2.2;}',
      'void main(){',
      ' vec2 uv=(gl_FragCoord.xy-.5*uRes)/uRes.y;',
      ' uv.y-=.06;',
      ' float az=uTime*.04+uMouse.x*.25;float el=.11+uMouse.y*.06;',
      ' vec3 ro=vec3(sin(az)*cos(el),sin(el),-cos(az)*cos(el))*15.;',
      ' vec3 fw=normalize(-ro),rt=normalize(cross(vec3(0,1,0),fw)),up=cross(fw,rt);',
      ' vec3 dir=normalize(fw*1.55+uv.x*rt+uv.y*up);',
      ' vec3 pos=ro;vec3 h=cross(pos,dir);float h2=dot(h,h);',
      ' vec3 col=vec3(0.);float trans=1.;float minR=99.;',
      ' for(int i=0;i<160;i++){',
      '  float r2=dot(pos,pos);float r=sqrt(r2);minR=min(minR,r);',
      '  if(r<1.){trans=0.;break;}',
      '  if(r>40.)break;',
      '  float dt=clamp(.07*r,.025,.9);',
      '  vec3 prev=pos;',
      '  dir+=-1.5*h2*pos/(r2*r2*r)*dt;pos+=dir*dt;',
      '  if(prev.y*pos.y<0.){vec3 q=mix(prev,pos,prev.y/(prev.y-pos.y));float a;vec3 dc=disk(q,dir,a);col+=trans*dc;trans*=1.-a;}',
      '  if(trans<.01)break;',
      ' }',
      ' col+=trans*sky(normalize(dir));',
      ' col+=vec3(1.,.6,.3)*.02/(abs(minR-1.5)+.05)*trans;',
      ' col=1.-exp(-col*1.3);',
      ' col=pow(col,vec3(.9));',
      ' gl_FragColor=vec4(col,1.);}'
    ].join('\n');

    function shader(type, src) {
      var s = gl.createShader(type);
      gl.shaderSource(s, src);
      gl.compileShader(s);
      return gl.getShaderParameter(s, gl.COMPILE_STATUS) ? s : null;
    }
    var vs = shader(gl.VERTEX_SHADER, vert);
    var fs = shader(gl.FRAGMENT_SHADER, frag);
    if (!vs || !fs) return;
    var prog = gl.createProgram();
    gl.attachShader(prog, vs);
    gl.attachShader(prog, fs);
    gl.linkProgram(prog);
    if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) return;
    gl.useProgram(prog);

    gl.bindBuffer(gl.ARRAY_BUFFER, gl.createBuffer());
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
    var loc = gl.getAttribLocation(prog, 'p');
    gl.enableVertexAttribArray(loc);
    gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0);

    var uRes = gl.getUniformLocation(prog, 'uRes');
    var uTime = gl.getUniformLocation(prog, 'uTime');
    var uMouse = gl.getUniformLocation(prog, 'uMouse');

    // rendu en basse résolution puis agrandi : le flou du disque le permet
    var scale = Math.min(window.devicePixelRatio || 1, 2) * 0.6;
    var mouse = [0, 0], target = [0, 0];
    var start = performance.now(), last = start, slow = 0;

    function resize() {
      canvas.width = Math.max(1, Math.round(canvas.clientWidth * scale));
      canvas.height = Math.max(1, Math.round(canvas.clientHeight * scale));
      gl.viewport(0, 0, canvas.width, canvas.height);
    }
    window.addEventListener('resize', resize);
    hero.addEventListener('pointermove', function (e) {
      var rect = hero.getBoundingClientRect();
      target[0] = (e.clientX - rect.left) / rect.width * 2 - 1;
      target[1] = (e.clientY - rect.top) / rect.height * 2 - 1;
    });
    resize();

    function frame(now) {
      if (now - last > 34 && ++slow > 30 && scale > 0.35) {
        scale *= 0.8;
        slow = 0;
        resize();
      }
      last = now;
      mouse[0] += (target[0] - mouse[0]) * 0.04;
      mouse[1] += (target[1] - mouse[1]) * 0.04;
      gl.uniform2f(uRes, canvas.width, canvas.height);
      gl.uniform1f(uTime, reduced ? 20 : (now - start) / 1000 + 20);
      gl.uniform2f(uMouse, mouse[0], mouse[1]);
      gl.drawArrays(gl.TRIANGLES, 0, 3);
      canvas.classList.add('on');
      if (!reduced) requestAnimationFrame(loop);
    }
    function loop(now) {
      if (!visible) { last = now; requestAnimationFrame(loop); return; }
      frame(now);
    }
    requestAnimationFrame(frame);
  }

  // ?webgl dans l'URL force le rendu temps réel (pratique pour le tester)
  if (/[?&]webgl\b/.test(location.search)) fallback();
})();

// apparition légère des blocs au défilement
(function () {
  var els = document.querySelectorAll('.reveal');
  if (!('IntersectionObserver' in window)) {
    Array.prototype.forEach.call(els, function (el) { el.classList.add('in'); });
    return;
  }
  var io = new IntersectionObserver(function (entries) {
    entries.forEach(function (e) {
      if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); }
    });
  }, { rootMargin: '0px 0px -8% 0px' });
  Array.prototype.forEach.call(els, function (el) { io.observe(el); });
})();

// titre du hero : « ONO-SENDAI » se déchiffre lettre par lettre, comme au lancement de l'app
(function () {
  var letters = document.querySelectorAll('.hero-title .l');
  if (!letters.length || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  var GLYPHS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789#%&*+<>/\\λ';
  var finals = Array.prototype.map.call(letters, function (l) { return l.textContent; });
  var start = performance.now();
  var rand = function () { return GLYPHS[Math.floor(Math.random() * GLYPHS.length)]; };
  Array.prototype.forEach.call(letters, function (l) { l.classList.add('scr'); l.textContent = rand(); });
  var last = 0;
  function tick(now) {
    var t = now - start, pending = false;
    // un caractère aléatoire toutes les 45 ms, puis chaque lettre se fixe à son tour
    var swap = now - last > 45;
    if (swap) last = now;
    Array.prototype.forEach.call(letters, function (l, i) {
      if (!l.classList.contains('scr')) return;
      if (t > 350 + i * 95) { l.textContent = finals[i]; l.classList.remove('scr'); return; }
      pending = true;
      if (swap) l.textContent = finals[i] === '-' ? (Math.random() < .5 ? '-' : rand()) : rand();
    });
    if (pending) requestAnimationFrame(tick);
  }
  requestAnimationFrame(tick);
})();
