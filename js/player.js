(() => {
  const $ = sel => document.querySelector(sel);
  const $$ = sel => document.querySelectorAll(sel);

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
  let isShuffle = false;

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
        <span class="n">${i + 1}</span>
        <div class="info">
          <div class="t">${t.title}</div>
          <div class="s">${t.artist || '—'} <span class="dot">·</span> <span class="badge">${t.bpm ? `${t.bpm} BPM` : 'BPM —'}</span></div>
        </div>
        <div class="act">▶</div>
      `;
      li.addEventListener('click', () => {
        load(i);
        play();
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
    title.textContent = t.title || '—';
    artist.textContent = t.artist || '—';
    bpm.textContent = (t.bpm ? t.bpm : '—') + ' BPM';
    download.href = t.src || '#';

    if (t.cover) {
      cover.style.backgroundImage = `url("${t.cover}")`;
      cover.style.backgroundSize = 'cover';
      cover.style.backgroundPosition = 'center';
    } else {
      cover.style.backgroundImage = 'none';
    }

    playBtn.textContent = '▶';
    highlightActive();
  }

  function highlightActive() {
    $$('.track').forEach(el => el.classList.remove('active'));
    const active = trackListEl.querySelector(`.track[data-index="${index}"]`);
    if (active) active.classList.add('active');
  }

  function play() {
    audio.play();
    playBtn.textContent = '⏸';
  }
  function pause() {
    audio.pause();
    playBtn.textContent = '▶';
  }

  playBtn.addEventListener('click', () => (audio.paused ? play() : pause()));
  prevBtn.addEventListener('click', prev);
  nextBtn.addEventListener('click', next);

  function prev() {
    index = (index - 1 + playlist.length) % playlist.length;
    load(index);
    play();
  }
  function next(auto = false) {
    if (isShuffle && auto) {
      let r;
      do { r = Math.floor(Math.random() * playlist.length); } while (r === index && playlist.length > 1);
      index = r;
    } else {
      index = (index + 1) % playlist.length;
    }
    load(index);
    play();
  }

  loopBtn.addEventListener('click', () => {
    audio.loop = !audio.loop;
    loopBtn.classList.toggle('primary', audio.loop);
  });

  shuffleBtn.addEventListener('click', () => {
    isShuffle = !isShuffle;
    shuffleBtn.classList.toggle('primary', isShuffle);
  });

  muteBtn.addEventListener('click', () => {
    audio.muted = !audio.muted;
    muteBtn.textContent = audio.muted ? '🔇' : '🔈';
  });

  volume.addEventListener('input', () => {
    audio.volume = parseFloat(volume.value);
  });

  // Time + seek
  audio.addEventListener('loadedmetadata', () => {
    durationEl.textContent = fmt(audio.duration);
  });
  audio.addEventListener('timeupdate', () => {
    currentTimeEl.textContent = fmt(audio.currentTime);
    if (!seek.dragging && audio.duration) {
      seek.value = ((audio.currentTime / audio.duration) * 100) || 0;
    }
  });
  seek.addEventListener('input', () => {
    seek.dragging = true;
  });
  seek.addEventListener('change', () => {
    if (audio.duration) {
      audio.currentTime = (parseFloat(seek.value) / 100) * audio.duration;
    }
    seek.dragging = false;
  });

  // Autoplay siguiente
  audio.addEventListener('ended', () => {
    if (!audio.loop) next(true);
  });

  // Atajos
  document.addEventListener('keydown', (e) => {
    const tag = (e.target.tagName || '').toLowerCase();
    if (tag === 'input' || tag === 'textarea') return;
    if (e.code === 'Space') { e.preventDefault(); audio.paused ? play() : pause(); }
    if (e.code === 'ArrowRight') audio.currentTime = Math.min((audio.currentTime + 5), audio.duration || Infinity);
    if (e.code === 'ArrowLeft')  audio.currentTime = Math.max((audio.currentTime - 5), 0);
    if (e.key.toLowerCase() === 'm') muteBtn.click();
    if (e.key.toLowerCase() === 'l') loopBtn.click();
    if (e.key.toLowerCase() === 's') shuffleBtn.click();
  });

  function fmt(sec){
    if (!isFinite(sec)) return '0:00';
    const m = Math.floor(sec/60);
    const s = Math.floor(sec%60).toString().padStart(2,'0');
    return `${m}:${s}`;
  }
})();
