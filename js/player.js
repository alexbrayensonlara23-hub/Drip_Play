(() => {
  const $ = sel => document.querySelector(sel);
  const audio = $('#audio');
  const title = $('#title');
  const artist = $('#artist');
  const bpm = $('#bpm');
  const cover = $('#cover');
  const currentTimeEl = $('#currentTime');
  const durationEl = $('#duration');
  const seek = $('#seek');
  const playBtn = $('#play');
  const prevBtn = $('#prev');
  const nextBtn = $('#next');
  const loopBtn = $('#loop');
  const shuffleBtn = $('#shuffle');
  const muteBtn = $('#mute');
  const volume = $('#volume');
  const download = $('#download');
  const trackListEl = $('#trackList');

  let playlist = [];
  let index = 0;

  fetch('data/playlist.json')
    .then(r => r.json())
    .then(data => {
      playlist = data || [];
      renderList();
      load(0);
    });

  function renderList() {
    trackListEl.innerHTML = '';
    playlist.forEach((t, i) => {
      const li = document.createElement('li');
      li.className = 'track';
      li.dataset.index = i;
      li.innerHTML = `
        <span>${i + 1}</span>
        <div>
          <div>${t.title}</div>
          <div style="font-size:12px; color:#555">${t.artist || '—'} · ${t.bpm ? t.bpm + ' BPM' : '—'}</div>
        </div>
        <div>▶</div>
      `;

      li.addEventListener('click', () => {
        load(i);
        audio.loop = false; // siempre una sola vez
        audio.currentTime = 0;
        audio.play();
      });

      trackListEl.appendChild(li);
    });
    highlightActive();
  }

  function load(i) {
    index = i;
    const t = playlist[i];
    if (!t) return;

    audio.src = t.src;
    audio.loop = false; // nunca repetir automáticamente
    title.textContent = t.title || '—';
    artist.textContent = t.artist || '—';
    bpm.textContent = (t.bpm ? t.bpm : '—') + ' BPM';
    download.href = t.src || '#';
    cover.style.backgroundImage = t.cover ? `url("${t.cover}")` : 'none';
    playBtn.textContent = '▶';
    highlightActive();
  }

  function highlightActive() {
    document.querySelectorAll('.track').forEach(el => el.classList.remove('active'));
    const active = document.querySelector(`.track[data-index="${index}"]`);
    if (active) active.classList.add('active');
  }

  // Play / Pause
  playBtn.addEventListener('click', () => {
    if (audio.paused) {
      audio.play();
      playBtn.textContent = '⏸';
    } else {
      audio.pause();
      playBtn.textContent = '▶';
    }
  });

  // Volumen
  volume.addEventListener('input', () => {
    audio.volume = volume.value;
  });

  muteBtn.addEventListener('click', () => {
    audio.muted = !audio.muted;
    muteBtn.textContent = audio.muted ? '🔇' : '🔈';
  });

  // Barra de progreso
  audio.addEventListener('timeupdate', () => {
    seek.value = (audio.currentTime / audio.duration) * 100 || 0;
    currentTimeEl.textContent = formatTime(audio.currentTime);
    durationEl.textContent = formatTime(audio.duration);
  });

  seek.addEventListener('input', () => {
    audio.currentTime = (seek.value / 100) * audio.duration;
  });

  // Al terminar, no pasar a otra
  audio.addEventListener('ended', () => {
    audio.currentTime = 0;
    playBtn.textContent = '▶';
  });

  function formatTime(sec) {
    if (isNaN(sec)) return '0:00';
    const m = Math.floor(sec / 60);
    const s = Math.floor(sec % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  }
})();
