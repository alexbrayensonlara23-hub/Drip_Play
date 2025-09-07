/* =========================
   Drip Play — Lógica JS
   ========================= */

async function loadPlaylist() {
  try {
    const res = await fetch('assets/playlist.json');
    const playlist = await res.json();
    initDripPlay(playlist);
  } catch (err) {
    console.error('Error cargando playlist:', err);
  }
}

function initDripPlay(PLAYLIST) {
  let index = 0;
  let isShuffle = false;
  const order = [...PLAYLIST.keys()];
  
   function loadTrack(track) {
  audio.src = track.src;
  document.getElementById('downloadBtn').href = track.src;
}


  // Crear estructura HTML dentro del contenedor
  const container = document.getElementById('dripPlay');
  container.innerHTML = `
    <div class="dp-header">
      <div class="dp-title" id="dpNowTitle">—</div>
      <div class="dp-controls">
        <button class="dp-btn" id="dpPrev" title="Anterior">⟨⟨</button>
        <button class="dp-btn" id="dpPlayPause" title="Reproducir/Pausar">▶</button>
        <button class="dp-btn" id="dpNext" title="Siguiente">⟩⟩</button>
        <button class="dp-btn" id="dpLoop" aria-pressed="false" title="Repetir pista">↻</button>
        <button class="dp-btn" id="dpShuffle" aria-pressed="false" title="Aleatorio">🔀</button>
      </div>
    </div>

    <audio id="dpAudio" class="dp-audio" preload="metadata"></audio>

    <div class="dp-meta">
      <span id="dpStatus">00:00 / 00:00</span>
      <span id="dpCount">0 pistas</span>
    </div>

    <div class="dp-progress" style="height:4px;background:var(--card-border);cursor:pointer;">
      <div id="dpProgressBar" style="height:100%;width:0;background:var(--accent);"></div>
    </div>

    <ul class="dp-list" id="dpList" role="listbox" aria-label="Lista de reproducción"></ul>
  `;

  // Elementos
  const audio = container.querySelector('#dpAudio');
  const listEl = container.querySelector('#dpList');
  const titleEl = container.querySelector('#dpNowTitle');
  const statusEl = container.querySelector('#dpStatus');
  const countEl = container.querySelector('#dpCount');
  const btnPrev = container.querySelector('#dpPrev');
  const btnNext = container.querySelector('#dpNext');
  const btnPlayPause = container.querySelector('#dpPlayPause');
  const btnLoop = container.querySelector('#dpLoop');
  const btnShuffle = container.querySelector('#dpShuffle');
  const progressBar = container.querySelector('#dpProgressBar');
  const progressContainer = progressBar.parentElement;

  // Utils
  const fmt = (s) => {
    if (!Number.isFinite(s)) return "00:00";
    const m = Math.floor(s / 60);
    const r = Math.floor(s % 60);
    return String(m).padStart(2,'0') + ':' + String(r).padStart(2,'0');
  };

  const drawList = () => {
    listEl.innerHTML = '';
    order.forEach((i, n) => {
      const li = document.createElement('li');
      li.className = 'dp-item';
      li.role = 'option';
      li.dataset.idx = i;
      li.innerHTML = `
        <div class="dp-index">${n+1}</div>
        <div class="dp-name">${PLAYLIST[i].title}</div>
        <div class="dp-duration">${PLAYLIST[i].duration ?? ''}</div>
      `;
      li.addEventListener('click', () => {
        index = n;
        loadCurrent(true);
      });
      listEl.appendChild(li);
    });
    updateAriaCurrent();
    countEl.textContent = `${PLAYLIST.length} pistas`;
  };

  const updateAriaCurrent = () => {
    [...listEl.children].forEach((el, n) => {
      el.setAttribute('aria-current', n === index ? 'true' : 'false');
    });
  };

  const loadCurrent = (autoplay=false) => {
    const i = order[index];
    const item = PLAYLIST[i];
    titleEl.textContent = item.title || '—';
    audio.src = item.src;
    if (autoplay) audio.play().catch(()=>{});
    updateAriaCurrent();
  };

  const next = () => {
    index = (index + 1) % order.length;
    loadCurrent(true);
  };

  const prev = () => {
    index = (index - 1 + order.length) % order.length;
    loadCurrent(true);
  };

  // Eventos
  audio.addEventListener('timeupdate', () => {
    statusEl.textContent = `${fmt(audio.currentTime)} / ${fmt(audio.duration)}`;
    progressBar.style.width = `${(audio.currentTime / audio.duration) * 100 || 0}%`;
  });

  audio.addEventListener('ended', () => {
    if (audio.loop) {
      audio.play().catch(()=>{});
    } else {
      next();
    }
  });

  btnPlayPause.addEventListener('click', () => {
    if (audio.paused) {
      audio.play().then(()=> btnPlayPause.textContent = '⏸').catch(()=>{});
    } else {
      audio.pause();
      btnPlayPause.textContent = '▶';
    }
  });

  btnPrev.addEventListener('click', prev);
  btnNext.addEventListener('click', next);

  btnLoop.addEventListener('click', () => {
    audio.loop = !audio.loop;
    btnLoop.setAttribute('aria-pressed', audio.loop ? 'true' : 'false');
  });

  btnShuffle.addEventListener('click', () => {
    isShuffle = !isShuffle;
    btnShuffle.setAttribute('aria-pressed', isShuffle ? 'true' : 'false');
    if (isShuffle) {
      for (let i = order.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [order[i], order[j]] = [order[j], order[i]];
      }
      index = 0;
    } else {
      order.splice(0, order.length, ...PLAYLIST.keys());
      index = 0;
    }
    drawList();
    loadCurrent(false);
  });

  // Barra de progreso clicable
  progressContainer.addEventListener('click', (e) => {
    const rect = progressContainer.getBoundingClientRect();
    const percent = (e.clientX - rect.left) / rect.width;
    audio.currentTime = percent * audio.duration;
  });

  // Atajos de teclado
  document.addEventListener('keydown', (e) => {
    if (e.target && ['INPUT','TEXTAREA'].includes(e.target.tagName)) return;
    if (e.code === 'Space') { e.preventDefault(); btnPlayPause.click(); }
    if (e.code === 'ArrowRight') next();
    if (e.code === 'ArrowLeft') prev();
    if (e.code === 'KeyL') btnLoop.click();
    if (e.code === 'KeyS') btnShuffle.click();
  });
const audio = document.querySelector('audio');
const volumeControl = document.getElementById('volumeControl');

volumeControl.addEventListener('input', () => {
  audio.volume = volumeControl.value;
});

  // Init
  drawList();
  loadCurrent(false);
}

loadPlaylist();
