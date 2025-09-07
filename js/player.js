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
          <div style="font-size:12px; color:#777">${t.artist || '—'} · ${t.bpm ? t.bpm + ' BPM' : '—'}</div>
        </div>
        <div>▶</div>
      `;
      li.addEventListener('click', () => {
        load(i);
        audio.loop = false;
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
    audio.loop = false;
    title.textContent = t.title || '—';
    artist.textContent = t.artist || '—';
    bpm.textContent = (t.bpm ? t.bpm : '—') + ' BPM';
    download.href =
