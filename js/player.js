(() => {
  // ====== Helpers de selección ======
  const $ = sel => document.querySelector(sel);

  // ====== Elementos del DOM ======
  const audio = $('#audio');
  const title = $('#title');
  const artist = $('#artist');
  const bpm = $('#bpm');
  const cover = $('#cover');
  const currentTimeEl = $('#currentTime');
  const durationEl = $('#duration');
  const seek = $('#seek');
  const playBtn = $('#play');
  const muteBtn = $('#mute');
  const volume = $('#volume');
  const download = $('#download');
  const trackListEl = $('#trackList');

  // ====== Estado ======
  let playlist = [];
  let index = 0;

  // ====== Carga de playlist ======
  fetch('data/playlist.json', { cache: 'no-store' })
    .then(r => {
      if (!r.ok) throw new Error(`HTTP ${r.status} al cargar playlist.json`);
      return r.json();
    })
    .then(data => {
      if (!Array.isArray(data)) throw new Error('playlist.json debe ser un array');
      playlist = data;
      renderList();
      load(0);
    })
    .catch(e => {
      console.error('[Drip_Play] No se pudo cargar playlist.json:', e.message);
      // Fallback mínimo
      playlist = [{
        title: 'Sample',
        artist: 'DripSounds',
        src: 'assets/audio/sample.mp3',
        bpm: null
      }];
      renderList();
      load(0);
    });

  // ====== Render de lista ======
  function renderList() {
    trackListEl.innerHTML = '';
    playlist.forEach((t, i) => {
      const li = document.createElement('li');
      li.className = 'track';
      li.dataset.index = i;
      li.innerHTML = `
        <span class="num">${i + 1}</span>
        <div class="meta">
          <div class="title">${t.title || '—'}</div>
          <div class="sub">${t.artist || '—'} · ${t.bpm ? t.bpm + ' BPM' : '—'}</div>
        </div>
        <div>▶</div>
      `;
      // Reproducción única tipo “one shot”
      li.addEventListener('click', () => {
        load(i);
        audio.loop = false;         // no repetir
        audio.currentTime = 0;      // desde el inicio siempre
        audio.play().catch(() => {}); // evita warnings de autoplay
      });
      trackListEl.appendChild(li);
    });
    highlightActive();
  }

  // ====== Cargar pista ======
  function load(i) {
    index = i;
    const t = playlist[i];
    if (!t) return;

    // Sugerencia de saneo de ruta (evita espacios/paréntesis)
    if (/\s|\(|\)/.test(t.src)) {
      console.warn('[Drip_Play] src contiene espacios o paréntesis:', t.src);
    }

    audio.src = t.src;
    audio.loop = false; // siempre reproducción única
    title.textContent = t.title || '—';
    artist.textContent = t.artist || '—';
    bpm.textContent = (t.bpm ? t.bpm : '—') + ' BPM';
    download.href = t.src || '#';

    if (t.cover) {
      if (/\s|\(|\)/.test(t.cover)) {
        console.warn('[Drip_Play] cover contiene espacios o paréntesis:', t.cover);
      }
      cover.style.backgroundImage = `url("${t.cover}")`;
    } else {
      cover.style.backgroundImage = 'none';
    }

    playBtn.textContent = '▶';
    highlightActive();
  }

  // ====== UI estado activo ======
  function highlightActive() {
    document.querySelectorAll('.track').forEach(el => el.classList.remove('active'));
    const active = document.querySelector(`.track[data-index="${index}"]`);
    if (active) active.classList.add('active');
  }

  // ====== Controles ======
  playBtn.addEventListener('click', () => {
    if (audio.paused) {
      audio.play().then(() => playBtn.textContent = '⏸').catch(() => {});
    } else {
      audio.pause();
      playBtn.textContent = '▶';
    }
  });

  volume.addEventListener('input', () => {
    audio.volume = Number(volume.value);
  });

  muteBtn.addEventListener('click', () => {
    audio.muted = !audio.muted;
    muteBtn.textContent = audio.muted ? '🔇' : '🔈';
  });

  // ====== Progreso y tiempo ======
  audio.addEventListener('loadedmetadata', () => {
    durationEl.textContent = fmt(audio.duration);
  });

  audio.addEventListener('timeupdate', () => {
    if (isFinite(audio.duration)) {
      seek.value = (audio.currentTime / audio.duration) * 100 || 0;
      durationEl.textContent = fmt(audio.duration);
    }
    currentTimeEl.textContent = fmt(audio.currentTime);
  });

  seek.addEventListener('input', () => {
    if (isFinite(audio.duration)) {
      audio.currentTime = (seek.value / 100) * audio.duration;
    }
  });

  // ====== Al terminar: no continuar ======
  audio.addEventListener('ended', () => {
    audio.currentTime = 0;     // regresa al inicio
    playBtn.textContent = '▶'; // UI de pausa
    // no cambia index ni llama a next: se queda en la pista actual
  });

  // ====== Errores de audio ======
  audio.addEventListener('error', () => {
    console.error('[Drip_Play] Error de audio:', audio.currentSrc || audio.src);
  });

  // ====== Util ======
  function fmt(sec) {
    if (!isFinite(sec)) return '0:00';
    const m = Math.floor(sec / 60);
    const s = Math.floor(sec % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  }
})();
