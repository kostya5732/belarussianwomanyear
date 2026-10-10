(() => {
  const { saint, timeline, chapters, cathedrals, bond } = window.SITE;
  const img = (file, w) => `/.netlify/images?url=/img/${file}&w=${w}&fm=webp&q=82`;
  const facts = (list, cls = 'fact') => list.map(([k, v]) => `<div class="${cls}"><dt>${k}</dt><dd>${v}</dd></div>`).join('');
  const initials = (name) => {
    const w = name.replace(/\(.*\)/, '').trim().split(/\s+/);
    return (w[0][0] + (w.length > 1 ? w[w.length - 1][0] : '')).toUpperCase();
  };

  const exhibit = (item, i) => `
    <article class="exhibit${i % 2 ? ' alt' : ''}" id="${item.id}">
      <figure class="painting reveal" data-tilt>
        <div class="frame">
          <div class="canvas">
            <img src="${img(item.img, 900)}"
                 srcset="${img(item.img, 520)} 520w, ${img(item.img, 900)} 900w, ${img(item.img, 1300)} 1300w"
                 sizes="(max-width: 900px) 92vw, 44vw"
                 alt="${item.title} — живописное изображение" loading="lazy" width="896" height="1200" />
            <span class="shine" aria-hidden="true"></span>
          </div>
        </div>
        <figcaption>${item.kicker} · ${item.title}</figcaption>
      </figure>
      <div class="info">
        <p class="kicker reveal">${item.kicker}</p>
        <h3 class="reveal">${item.title}</h3>
        <p class="subtitle reveal">${item.subtitle}</p>
        <dl class="facts">${facts(item.facts, 'fact reveal')}</dl>
        <div class="story">
          ${item.text.map((t) => `<p class="reveal">${t}</p>`).join('')}
        </div>
      </div>
    </article>`;

  // A line of years; clicking one launches the time machine
  const chrono = (set, items) => `
    <div class="chrono">
      <p class="chrono-hint reveal">Нажмите на год — и отправьтесь в прошлое</p>
      <ol class="chrono-track">
        ${items.map((it, i) => `<li class="reveal"><button type="button" class="chrono-year" data-set="${set}" data-i="${i}"
            aria-label="${it.year}: ${it.name}"><span class="dot" aria-hidden="true"></span><b>${it.year}</b><small>${it.name}</small></button></li>`).join('')}
      </ol>
    </div>`;

  // Portrait from Wikipedia when there is one, otherwise stylised initials
  const face = (p, w, cls = '') => p.photo
    ? `<img class="${cls}" src="${img(p.photo, w)}" alt="" loading="lazy" style="object-position:${p.pos || '50% 30%'}" />`
    : '';

  const card = (set, p, i) => `
    <li class="reveal"><button type="button" class="person" data-set="${set}" data-i="${i}">
      <span class="mono${p.photo ? ' photo' : ''}" aria-hidden="true">${p.photo ? face(p, 200) : initials(p.name)}</span>
      <span class="p-year">${p.year}</span>
      <span class="p-name">${p.name}</span>
      <span class="p-life">${p.life}</span>
      <span class="p-deed">${p.deed}</span>
    </button></li>`;

  document.getElementById('saint-chrono').innerHTML = chrono('saint', timeline);
  document.getElementById('saint-exhibits').innerHTML = saint.map(exhibit).join('');
  document.getElementById('chapters').innerHTML = chapters.map((c) => `
    <section id="${c.id}" class="chapter theme-${c.theme}">
      <div class="deco" aria-hidden="true"><i></i><i></i></div>
      <header class="chapter-head reveal">
        <span class="chapter-num">${c.num}</span>
        <h2>${c.title}</h2>
        <div class="ornament" aria-hidden="true"></div>
        <p class="chapter-intro">${c.intro}</p>
      </header>
      ${chrono(c.id, c.people)}
      <ol class="roster">${c.people.map((p, i) => card(c.id, p, i)).join('')}</ol>
    </section>`).join('');

  // ---------- Epilogue board: every woman pinned and tied to the centre ----------
  document.getElementById('bond-title').textContent = bond.title;
  document.getElementById('bond-intro').textContent = bond.intro;
  const women = [
    { name: 'Ефросинья Полоцкая', year: '≈ 1104', y: 1104, photo: 'euphrosyne.png', pos: '50% 22%', deed: 'Первая просветительница белорусской земли.' },
    ...chapters.flatMap((c) => c.people.map((p, i) => ({ ...p, set: c.id, i }))),
  ].sort((a, b) => a.y - b.y);
  const KNOT = [50, 44];
  const tallBoard = matchMedia('(max-width: 760px)');
  // Photos sit on a rounded rectangle (superellipse) around the knot, evenly spaced by real
  // on-screen distance, chronological and clockwise from the top-left corner of the board.
  const layout = () => {
    const aspect = tallBoard.matches ? 5 / 3 : 10.4 / 16; // board height / width, as in CSS
    const at = (t) => {
      const c = Math.cos(t), s = Math.sin(t);
      return [50 + 43 * Math.sign(c) * Math.abs(c) ** 0.6, KNOT[1] + 36 * Math.sign(s) * Math.abs(s) ** 0.6];
    };
    const N = 720, pts = [], len = [0];
    for (let j = 0; j <= N; j++) {
      pts.push(at(Math.PI + 0.62 + (j / N) * Math.PI * 2));
      if (j) len.push(len[j - 1] + Math.hypot(pts[j][0] - pts[j - 1][0], (pts[j][1] - pts[j - 1][1]) * aspect));
    }
    const step = len[N] / women.length;
    let j = 0;
    return women.map((_, k) => {
      while (len[j] < k * step) j++;
      return pts[j];
    });
  };
  const place = () => {
    const spots = layout();
    document.getElementById('threads').innerHTML = spots.map(([x, y], k) => {
      const sag = 3 + Math.abs(x - KNOT[0]) / 10;
      return `<path class="thread" data-k="${k}" d="M${x.toFixed(2)} ${y.toFixed(2)}Q${((x + KNOT[0]) / 2).toFixed(2)} ${((y + KNOT[1]) / 2 + sag).toFixed(2)} ${KNOT.join(' ')}" />`;
    }).join('');
    document.querySelectorAll('#snaps li').forEach((li, k) => {
      li.style.left = `${spots[k][0].toFixed(2)}%`;
      li.style.top = `${spots[k][1].toFixed(2)}%`;
    });
  };
  document.getElementById('snaps').innerHTML = women.map((w, k) => {
    const nm = w.name.replace(/\(.*\)/, '').trim().split(/\s+/);
    const tag = w.set ? 'button' : 'a';
    const attrs = w.set ? `type="button" data-set="${w.set}" data-i="${w.i}"` : 'href="#euphrosyne"';
    const tilt = ((k * 37) % 11) - 5;
    return `<li style="--r:${tilt}deg;--i:${k}">
      <${tag} class="snap" ${attrs} data-k="${k}" aria-label="${w.name}, ${w.year}: ${w.deed}">
        <span class="tack" aria-hidden="true"></span>
        <span class="snap-photo" aria-hidden="true">${w.photo ? face(w, 220) : `<i>${initials(w.name)}</i>`}</span>
        <span class="snap-cap" aria-hidden="true"><small>${nm.length > 1 ? nm[0] : w.year}</small>${nm[nm.length - 1]}</span>
      </${tag}></li>`;
  }).join('');
  place();
  tallBoard.addEventListener('change', place);
  const board = document.getElementById('board');
  board.querySelectorAll('.snap').forEach((el) => {
    const thread = () => board.querySelector(`.thread[data-k="${el.dataset.k}"]`);
    const on = () => { board.classList.add('focus'); thread().classList.add('hot'); };
    const off = () => { board.classList.remove('focus'); thread().classList.remove('hot'); };
    el.addEventListener('pointerenter', on); el.addEventListener('focus', on);
    el.addEventListener('pointerleave', off); el.addEventListener('blur', off);
  });

  // ---------- Map of Belarus ----------
  // Equirectangular projection squeezed by cos(53.7°) so the country keeps its real proportions.
  const MAP_W = 600, MAP_H = 520;
  const project = ([lat, lon]) => [(lon - 23) * 59.2 + 10, (56.3 - lat) * 100 + 5];
  const line = (pts) => pts.map((p, i) => `${i ? 'L' : 'M'}${project(p).map((n) => n.toFixed(1)).join(' ')}`).join('');
  const BORDER = [
    [52.1, 23.6], [52.3, 23.2], [52.7, 23.9], [53.0, 23.6], [53.5, 23.9], [53.9, 23.5], [53.95, 24.4], [54.0, 24.8],
    [54.2, 25.5], [54.6, 25.8], [54.9, 25.6], [55.15, 26.4], [55.7, 26.6], [56.1, 27.6], [56.15, 28.2], [55.95, 28.7],
    [55.85, 30.0], [55.6, 30.8], [55.1, 30.95], [54.7, 31.0], [54.2, 31.3], [53.8, 31.8], [53.3, 32.7], [52.95, 32.5],
    [52.8, 31.5], [52.1, 31.8], [51.6, 31.0], [51.3, 30.6], [51.5, 30.0], [51.4, 29.3], [51.55, 28.6], [51.6, 27.8],
    [51.8, 27.0], [51.9, 26.0], [51.9, 25.0], [51.75, 24.3], [51.55, 23.6],
  ];
  const RIVERS = [
    [[55.45, 31.0], [55.4, 30.7], [55.19, 30.2], [55.4, 29.4], [55.48, 28.78], [55.78, 27.95], [56.0, 27.4]],
    [[53.6, 27.0], [53.48, 26.73], [53.6, 25.7], [53.41, 24.54], [53.55, 24.1], [53.68, 23.83], [54.0, 23.95]],
    [[54.7, 31.0], [54.51, 30.42], [54.21, 30.29], [53.9, 30.33], [53.52, 30.25], [53.09, 30.05], [52.36, 30.39], [51.94, 30.8], [51.4, 30.6]],
    [[51.95, 24.8], [52.11, 26.1], [52.07, 27.73], [52.05, 29.25], [51.6, 29.9]],
  ];
  const CITIES = [
    ['Минск', [53.9, 27.56], 18, 22, true], ['Брест', [52.1, 23.69], 10, 4], ['Гродно', [53.68, 23.83], 4, 40],
    ['Витебск', [55.19, 30.2], 10, 4], ['Полоцк', [55.48, 28.78], -92, 8], ['Могилёв', [53.9, 30.33], 10, 4],
    ['Гомель', [52.44, 30.98], 10, 4],
  ];
  const grat = [];
  for (let lon = 24; lon <= 32; lon++) grat.push(line([[56.3, lon], [51.1, lon]]));
  for (let lat = 52; lat <= 56; lat++) grat.push(line([[lat, 23], [lat, 32.9]]));
  const landPath = line(BORDER) + 'Z';
  const [cx, cy] = project([53.25, 28.2]);
  document.getElementById('map-svg').innerHTML = `
    <defs>
      <radialGradient id="landFill" cx="55%" cy="40%" r="70%">
        <stop offset="0" stop-color="#5a1b1f" /><stop offset="1" stop-color="#2a1012" />
      </radialGradient>
      <clipPath id="landClip"><path d="${landPath}" /></clipPath>
    </defs>
    <path class="grat" d="${grat.join('')}" />
    <path class="land" d="${landPath}" />
    <g clip-path="url(#landClip)">
      <path class="land-edge" d="${landPath}" />
      ${RIVERS.map((r) => `<path class="river" d="${line(r)}" />`).join('')}
    </g>
    <text class="country" x="${cx}" y="${cy}">БЕЛАРУСЬ</text>
    ${CITIES.map(([name, p, dx, dy, capital]) => {
      const [x, y] = project(p);
      return `<g class="city${capital ? ' capital' : ''}"><circle cx="${x}" cy="${y}" r="${capital ? 4 : 2.6}" />
        <text x="${x + dx}" y="${y + dy}">${name}</text></g>`;
    }).join('')}
    <g class="compass" transform="translate(78 78)">
      <circle r="34" /><circle r="26" />
      <path d="M0-44L6 0 0 44-6 0Z M-44 0L0-6 44 0 0 6Z" />
      <text y="-50">С</text>
    </g>`;

  const glyph = `<svg class="glyph" viewBox="0 0 40 40" aria-hidden="true">
    <path d="M19 1h2v4h3v2h-3v3h-2V7h-3V5h3z" />
    <path d="M20 10c-5 4-8 7-8 11h16c0-4-3-7-8-11z" />
    <path d="M13 22h14v13H22v-5a2 2 0 0 0-4 0v5h-5z" />
    <path d="M10 35h20v2H10z" />
  </svg>`;
  document.getElementById('pins').innerHTML = cathedrals.map((c, i) => {
    const [x, y] = project(c.geo);
    const [dx, dy] = c.nudge || [0, 0];
    return `<button type="button" class="pin" data-i="${i}"
        style="left:calc(${(x / MAP_W) * 100}% + ${dx}px);top:calc(${(y / MAP_H) * 100}% + ${dy}px);--i:${i}"
        aria-label="${c.title}, ${c.kicker}">
      <span class="ring" aria-hidden="true"></span>${glyph}<span class="tip" aria-hidden="true">${c.title}</span>
    </button>`;
  }).join('');
  document.getElementById('legend').innerHTML = cathedrals.map((c, i) => `
    <li class="reveal"><button type="button" class="legend-item" data-i="${i}">
      <img src="${img(c.img, 160)}" alt="" width="64" height="64" loading="lazy" />
      <span><small>${c.kicker}</small>${c.title}</span>
    </button></li>`).join('');

  // Scroll reveals with stagger inside each block
  const io = new IntersectionObserver(
    (entries) => {
      entries.forEach((e) => {
        if (!e.isIntersecting) return;
        e.target.classList.add('in');
        io.unobserve(e.target);
      });
    },
    { threshold: 0.15, rootMargin: '0px 0px -8% 0px' }
  );
  document.querySelectorAll('.info, .story, .facts, .chrono, .chrono-track, .roster, .chapter-head, .legend').forEach((group) => {
    [...group.children].filter((c) => c.classList.contains('reveal')).forEach((c, i) => c.style.setProperty('--i', i));
  });
  document.querySelectorAll('.reveal').forEach((el) => io.observe(el));

  // Painting tilt + light following the cursor
  const fine = matchMedia('(pointer: fine)').matches;
  const still = matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (fine && !still) {
    document.querySelectorAll('[data-tilt]').forEach((el) => {
      const frame = el.querySelector('.frame');
      el.addEventListener('pointermove', (e) => {
        const r = el.getBoundingClientRect();
        const x = (e.clientX - r.left) / r.width - 0.5;
        const y = (e.clientY - r.top) / r.height - 0.5;
        frame.style.transform = `rotateY(${x * 8}deg) rotateX(${-y * 8}deg)`;
        frame.style.setProperty('--mx', `${(x + 0.5) * 100}%`);
        frame.style.setProperty('--my', `${(y + 0.5) * 100}%`);
      });
      el.addEventListener('pointerleave', () => (frame.style.transform = ''));
    });
  }

  // Progress bar, header state, active nav link
  const bar = document.querySelector('.progress span');
  const topbar = document.querySelector('.topbar');
  const links = [...document.querySelectorAll('.menu a')];
  const sections = links.map((a) => document.querySelector(a.getAttribute('href')));
  const onScroll = () => {
    const h = document.documentElement;
    bar.style.transform = `scaleX(${h.scrollTop / (h.scrollHeight - h.clientHeight || 1)})`;
    topbar.classList.toggle('solid', h.scrollTop > 40);
    const mid = innerHeight * 0.4;
    sections.forEach((s, i) => {
      const r = s.getBoundingClientRect();
      links[i].classList.toggle('active', r.top < mid && r.bottom > mid);
    });
  };
  addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  // ---------- Descent through the clouds ----------
  const map = document.getElementById('map');
  const descent = document.getElementById('descent');
  const panel = descent.querySelector('.panel');
  const vision = descent.querySelector('.apparition img');
  const closeBtn = descent.querySelector('.descent-close');
  const root = document.documentElement;
  let current = -1;
  let returnFocus = null;

  descent.querySelector('.clouds').innerHTML = Array.from({ length: 18 }, (_, i) => {
    const a = Math.random() * Math.PI * 2;
    const r = Math.random() * 18;
    return `<span class="cloud" style="--x:${50 + Math.cos(a) * r}%;--y:${50 + Math.sin(a) * r}%;` +
      `--dx:${Math.cos(a) * 70}vw;--dy:${Math.sin(a) * 60}vh;--s:${2.6 + Math.random() * 2};` +
      `--d:${(i / 18) * 1.7}s;--t:${1 + Math.random() * 0.5}s;--o:${0.7 + Math.random() * 0.3}"></span>`;
  }).join('');

  const preload = (i) => { new Image().src = img(cathedrals[i].img, 1300); };

  const fill = (c) => {
    panel.querySelector('.kicker').textContent = c.kicker;
    panel.querySelector('h3').textContent = c.title;
    panel.querySelector('.subtitle').textContent = c.subtitle;
    panel.querySelector('.facts').innerHTML = c.facts.map(([k, v]) => `<div class="fact"><dt>${k}</dt><dd>${v}</dd></div>`).join('');
    panel.querySelector('.story').innerHTML = c.text.map((t) => `<p>${t}</p>`).join('');
    [...panel.children].forEach((el, i) => el.style.setProperty('--i', i));
    vision.src = img(c.img, 1300);
    vision.srcset = `${img(c.img, 900)} 900w, ${img(c.img, 1300)} 1300w`;
    vision.sizes = '(max-width: 900px) 80vw, 52vw';
    vision.alt = `${c.title} — живописное изображение`;
    panel.scrollTop = 0;
  };

  const land = (i) => {
    current = i;
    fill(cathedrals[i]);
    descent.hidden = false;
    descent.classList.remove('open', 'leaving');
    void descent.offsetWidth; // restart the CSS sequence
    descent.classList.add('open');
    root.classList.add('locked');
    closeBtn.focus({ preventScroll: true });
  };

  const open = (i, from) => {
    if (descent.classList.contains('open')) return land(i);
    returnFocus = from;
    preload(i);
    const pin = map.querySelector(`.pin[data-i="${i}"]`);
    if (still) return land(i);
    // dive into the map towards the chosen pin, then the clouds take over
    const m = map.getBoundingClientRect();
    const p = pin.getBoundingClientRect();
    map.style.setProperty('--ox', `${p.left + p.width / 2 - m.left}px`);
    map.style.setProperty('--oy', `${p.top + p.height / 2 - m.top}px`);
    map.classList.add('diving');
    setTimeout(() => land(i), 550);
  };

  const close = () => {
    if (!descent.classList.contains('open')) return;
    descent.classList.add('leaving');
    map.classList.remove('diving');
    root.classList.remove('locked');
    setTimeout(() => {
      descent.hidden = true;
      descent.classList.remove('open', 'leaving');
    }, still ? 0 : 600);
    returnFocus?.focus({ preventScroll: true });
  };

  document.querySelectorAll('.pin, .legend-item').forEach((b) => {
    const i = +b.dataset.i;
    b.addEventListener('click', () => open(i, b));
    b.addEventListener('pointerenter', () => {
      preload(i);
      map.querySelector(`.pin[data-i="${i}"]`).classList.add('hot');
    });
    b.addEventListener('pointerleave', () => map.querySelector(`.pin[data-i="${i}"]`).classList.remove('hot'));
  });
  descent.querySelectorAll('[data-step]').forEach((b) =>
    b.addEventListener('click', () => land((current + +b.dataset.step + cathedrals.length) % cathedrals.length))
  );
  closeBtn.addEventListener('click', close);
  // ---------- Time machine: travel from 2026 to the chosen year ----------
  const SETS = { saint: { theme: 'church', items: timeline } };
  chapters.forEach((c) => (SETS[c.id] = { theme: c.theme, items: c.people }));
  const voyage = document.getElementById('voyage');
  const vCard = voyage.querySelector('.v-card');
  const vNum = voyage.querySelector('.v-num');
  const vClose = voyage.querySelector('.v-close');
  const vSteps = [...voyage.querySelectorAll('[data-step]')];
  const NOW = 2026;
  const CROSS = `<svg class="v-glyph" viewBox="0 0 120 200"><path d="M52 4h16v30h26v12H68v22h36v12H68v116H52V80H16V68h36V46H26V34h26z" /></svg>`;
  let vSet = null, vIdx = 0, vYear = NOW, vFocus = null, raf = 0, wait = 0;

  voyage.querySelector('.v-tunnel').innerHTML = Array.from({ length: 10 }, (_, i) =>
    `<span style="--d:${(-i * 0.13).toFixed(2)}s"></span>`).join('');

  const fillCard = (item, items) => {
    const b = vCard.querySelector('.v-body');
    b.querySelector('.kicker').textContent = item.life;
    b.querySelector('h3').textContent = item.name;
    b.querySelector('.subtitle').textContent = item.role;
    b.querySelector('.facts').innerHTML = facts(item.facts);
    b.querySelector('.story').innerHTML = item.text.map((t) => `<p>${t}</p>`).join('');
    [...b.children].forEach((el, i) => el.style.setProperty('--i', i));
    const vis = vCard.querySelector('.v-visual');
    vis.classList.toggle('has-photo', !!item.photo);
    vis.innerHTML = (item.photo
      ? `<img class="v-photo${item.fit ? ' contain' : ''}" src="${img(item.photo, 900)}" alt="${item.name} — портрет" style="object-position:${item.pos || '50% 30%'}" />` +
        (item.fit ? `<img class="v-backdrop" src="${img(item.photo, 200)}" alt="" />` : '') +
        `<small class="v-credit">${item.credit} · Wikimedia Commons</small>`
      : item.img
      ? `<img src="${img(item.img, 900)}" alt="" width="896" height="1200" />`
      : vSet === 'saint' ? CROSS : `<span class="v-mono">${initials(item.name)}</span>`) + `<span class="v-year">${item.year}</span>`;
    const n = items.length;
    vSteps[0].textContent = `← ${items[(vIdx - 1 + n) % n].year}`;
    vSteps[1].textContent = `${items[(vIdx + 1) % n].year} →`;
    b.scrollTop = 0;
    vCard.scrollTop = 0;
  };

  const markVisited = () => document.querySelectorAll(`.chrono-year[data-set="${vSet}"]`)
    .forEach((y) => y.classList.toggle('current', +y.dataset.i === vIdx));

  const arrive = (item) => {
    vNum.textContent = item.year;
    vYear = item.y;
    voyage.classList.remove('traveling');
    voyage.classList.add('arrived');
  };

  const travel = (set, i, from) => {
    const first = voyage.hidden;
    const { theme, items } = SETS[set];
    const item = items[i];
    vSet = set; vIdx = i;
    if (first) {
      vFocus = from;
      voyage.hidden = false;
      voyage.classList.remove('leaving');
      root.classList.add('locked');
    }
    voyage.dataset.theme = theme;
    fillCard(item, items);
    markVisited();
    cancelAnimationFrame(raf);
    clearTimeout(wait);
    vClose.focus({ preventScroll: true });
    if (still) return arrive(item);

    voyage.classList.remove('arrived', 'traveling');
    voyage.classList.toggle('future', item.y > vYear);
    void voyage.offsetWidth; // restart the CSS sequence
    voyage.classList.add('traveling');
    const start = vYear, dist = item.y - start;
    const dur = first ? 2300 : 1400;
    const t0 = performance.now();
    const tick = (t) => {
      const k = Math.min(1, (t - t0) / dur);
      const e = k < 0.5 ? 4 * k * k * k : 1 - Math.pow(-2 * k + 2, 3) / 2;
      vNum.textContent = Math.round(start + dist * e);
      if (k < 1) raf = requestAnimationFrame(tick);
      else wait = setTimeout(() => arrive(item), 120);
    };
    raf = requestAnimationFrame(tick);
  };

  const leave = () => {
    if (voyage.hidden) return;
    cancelAnimationFrame(raf);
    clearTimeout(wait);
    voyage.classList.add('leaving');
    root.classList.remove('locked');
    setTimeout(() => {
      voyage.hidden = true;
      voyage.classList.remove('leaving', 'arrived', 'traveling', 'future');
      vNum.textContent = NOW;
      vYear = NOW;
    }, still ? 0 : 500);
    vFocus?.focus({ preventScroll: true });
  };

  document.querySelectorAll('.chrono-year, .person, .snap[data-set]').forEach((b) =>
    b.addEventListener('click', () => travel(b.dataset.set, +b.dataset.i, b))
  );
  vSteps.forEach((b) => b.addEventListener('click', () => {
    const n = SETS[vSet].items.length;
    travel(vSet, (vIdx + +b.dataset.step + n) % n);
  }));
  vClose.addEventListener('click', leave);

  // ---------- The book of generations ----------
  const tome = document.getElementById('tome');
  const bookBtn = document.getElementById('book');
  const [pageL, pageR] = tome.querySelectorAll('.leaf > .page');
  const turn = tome.querySelector('.turn');
  const [turnF, turnB] = turn.querySelectorAll('.page');
  const folio = tome.querySelector('.tome-folio');
  const [tPrev, tNext] = tome.querySelectorAll('[data-turn]');
  const tClose = tome.querySelector('.tome-close');
  const pages = bond.pages;
  const narrow = matchMedia('(max-width: 760px)');
  const per = () => (narrow.matches ? 1 : 2);
  let at = 0, busy = false, flipEnd = 0;

  const page = (k) => {
    const p = pages[k];
    if (!p) return '';
    return `<p class="pg-kicker">${p.kicker}</p><h4>${p.h}</h4>` +
      (p.who ? `<p class="pg-who">${p.who}</p>` : '') +
      p.p.map((t, j) => `<p${j ? '' : ' class="pg-first"'}>${t}</p>`).join('') +
      (p.epigraph ? `<p class="pg-epi">${p.epigraph}</p>` : '') +
      (p.end ? '<span class="pg-end" aria-hidden="true">✦ ✦ ✦</span>' : '') +
      `<span class="pg-num" aria-hidden="true">${k + 1}</span>`;
  };

  const show = () => {
    const n = per();
    at -= at % n;
    pageL.innerHTML = n === 2 ? page(at) : '';
    pageR.innerHTML = page(n === 2 ? at + 1 : at);
    folio.textContent = n === 2 && pages[at + 1] ? `${at + 1}–${at + 2} из ${pages.length}` : `${at + 1} из ${pages.length}`;
    tPrev.disabled = at === 0;
    tNext.disabled = at + n >= pages.length;
    if (document.activeElement?.disabled) (tNext.disabled ? tPrev : tNext).focus({ preventScroll: true });
  };

  const flip = (dir) => {
    const n = per(), next = at + dir * n;
    if (busy || next < 0 || next >= pages.length) return;
    if (still) { at = next; return show(); }
    busy = true;
    if (dir > 0) {
      turnF.innerHTML = page(n === 2 ? at + 1 : at);
      turnB.innerHTML = n === 2 ? page(next) : '';
      pageR.innerHTML = page(n === 2 ? next + 1 : next);
    } else {
      turnF.innerHTML = page(n === 2 ? next + 1 : next);
      turnB.innerHTML = n === 2 ? page(at) : '';
      if (n === 2) pageL.innerHTML = page(next);
    }
    turn.className = `turn ${dir > 0 ? 'go-fwd' : 'go-back'}`;
    const done = () => {
      turn.onanimationend = null;
      clearTimeout(flipEnd);
      at = next; turn.className = 'turn'; busy = false; show();
    };
    turn.onanimationend = (e) => e.target === turn && done();
    flipEnd = setTimeout(done, 1200); // safety net if the animation never fires
  };

  const openBook = () => {
    at = 0;
    show();
    // the cover swings open first; pages can be turned once it has landed
    busy = true;
    clearTimeout(flipEnd);
    flipEnd = setTimeout(() => { busy = false; tome.classList.add('opened'); }, still ? 0 : 1700);
    tome.hidden = false;
    tome.classList.remove('closing');
    void tome.offsetWidth; // restart the CSS sequence
    tome.classList.add('open');
    root.classList.add('locked');
    tNext.focus({ preventScroll: true });
  };

  const closeBook = () => {
    if (tome.hidden || tome.classList.contains('closing')) return;
    clearTimeout(flipEnd);
    busy = false;
    turn.onanimationend = null;
    turn.className = 'turn';
    tome.classList.remove('open', 'opened');
    tome.classList.add('closing');
    root.classList.remove('locked');
    setTimeout(() => {
      tome.hidden = true;
      tome.classList.remove('closing');
    }, still ? 0 : 1100);
    bookBtn.focus({ preventScroll: true });
  };

  bookBtn.addEventListener('click', openBook);
  tPrev.addEventListener('click', () => flip(-1));
  tNext.addEventListener('click', () => flip(1));
  tClose.addEventListener('click', closeBook);
  tome.addEventListener('click', (e) => { if (e.target === tome) closeBook(); });
  narrow.addEventListener('change', () => !tome.hidden && show());

  // Esc closes and Tab stays inside whichever overlay is open
  addEventListener('keydown', (e) => {
    const dlg = [descent, voyage, tome].find((d) => !d.hidden);
    if (!dlg) return;
    if (dlg === tome && (e.key === 'ArrowRight' || e.key === 'ArrowLeft')) flip(e.key === 'ArrowRight' ? 1 : -1);
    if (e.key === 'Escape') (dlg === descent ? close : dlg === voyage ? leave : closeBook)();
    if (e.key === 'Tab') {
      const f = [...dlg.querySelectorAll('button:not(:disabled)')];
      const first = f[0], last = f[f.length - 1];
      if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
      else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
    }
  });

  // Rising candle embers
  const cv = document.getElementById('embers');
  if (still) return cv.remove();
  const ctx = cv.getContext('2d');
  let W, H;
  const size = () => {
    W = cv.width = innerWidth * devicePixelRatio;
    H = cv.height = innerHeight * devicePixelRatio;
  };
  size();
  addEventListener('resize', size);
  const spawn = (p = {}) => Object.assign(p, {
    x: Math.random() * W,
    y: H + Math.random() * H,
    r: (Math.random() * 1.6 + 0.4) * devicePixelRatio,
    v: (Math.random() * 0.35 + 0.15) * devicePixelRatio,
    a: Math.random() * Math.PI * 2,
    o: Math.random() * 0.5 + 0.2,
  });
  const motes = Array.from({ length: 46 }, () => spawn());
  motes.forEach((m) => (m.y = Math.random() * H));
  (function tick() {
    ctx.clearRect(0, 0, W, H);
    for (const m of motes) {
      m.y -= m.v;
      m.a += 0.01;
      m.x += Math.sin(m.a) * 0.3;
      if (m.y < -10) spawn(m);
      const flicker = m.o * (0.75 + Math.sin(m.a * 3) * 0.25);
      ctx.beginPath();
      ctx.fillStyle = `rgba(226, 182, 96, ${flicker})`;
      ctx.shadowColor = 'rgba(226,170,80,.8)';
      ctx.shadowBlur = 8 * devicePixelRatio;
      ctx.arc(m.x, m.y, m.r, 0, Math.PI * 2);
      ctx.fill();
    }
    requestAnimationFrame(tick);
  })();
})();
