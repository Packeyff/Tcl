const REFRESH_MS = 60_000;
let previousRanks = new Map(); // game name -> rank from last refresh

const fmt = (n) => {
  if (n >= 1_000_000) return (n / 1_000_000).toFixed(1) + 'M';
  if (n >= 1_000) return (n / 1_000).toFixed(1) + 'K';
  return String(n);
};

const money = (r) => `$${fmt(r.low)}–$${fmt(r.high)}`;

const esc = (s) =>
  String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

function deltaHtml(name, rank) {
  const prev = previousRanks.get(name);
  if (prev === undefined || prev === rank) return '<span class="delta same">–</span>';
  return prev > rank
    ? `<span class="delta up">▲${prev - rank}</span>`
    : `<span class="delta down">▼${rank - prev}</span>`;
}

function momentumBadge(m) {
  return `<span class="momentum ${m}">${m}</span>`;
}

function renderSpotlight(g) {
  const el = document.getElementById('spotlight');
  el.classList.remove('hidden');
  el.innerHTML = `
    <img class="boxart" src="${esc(g.boxArtUrl)}" alt="${esc(g.name)}" onerror="this.style.visibility='hidden'">
    <div class="spot-info">
      <h2>${esc(g.name)} ${momentumBadge(g.shortFormMomentum)}</h2>
      <div class="spot-stats">
        <div class="stat"><div class="value accent">${fmt(g.twitch.concurrentViewers)}</div><div class="label">Watching live now</div></div>
        <div class="stat"><div class="value score">${g.trendScore}</div><div class="label">Trend score</div></div>
        <div class="stat"><div class="value">${fmt(g.youtube.trendingViews)}</div><div class="label">Trending video views</div></div>
        <div class="stat"><div class="value">${fmt(g.youtube.viewVelocityPerHour)}/hr</div><div class="label">View velocity</div></div>
        <div class="stat"><div class="value" style="color:var(--gold)">${money(g.estimatedYouTubeRevenue)}</div><div class="label">Est. YT revenue*</div></div>
      </div>
      <div class="streamers">
        ${g.streamers.map(streamerChip).join('')}
      </div>
    </div>`;
}

function streamerChip(s) {
  return `<a class="streamer-chip" href="${esc(s.url)}" target="_blank" rel="noopener">
    <b>${esc(s.name)}</b>
    <span class="viewers">${fmt(s.viewers)} 👁</span>
    <span class="earn">${money(s.estimatedEarningsPerHour)}/hr est.</span>
  </a>`;
}

function renderCard(g, maxScore) {
  return `
    <article class="game-card">
      <div class="rank">#${g.rank} ${deltaHtml(g.name, g.rank)}</div>
      <img class="boxart" src="${esc(g.boxArtUrl)}" alt="${esc(g.name)}" onerror="this.style.visibility='hidden'">
      <div class="card-body">
        <div class="card-head">
          <h3>${esc(g.name)}</h3>
          ${momentumBadge(g.shortFormMomentum)}
        </div>
        <div class="card-metrics">
          <span><b>${fmt(g.twitch.concurrentViewers)}</b> live viewers</span>
          <span><b>${fmt(g.twitch.channelCount)}</b> channels</span>
          <span><b>${fmt(g.youtube.trendingViews)}</b> trending views</span>
          <span><b>${fmt(g.youtube.viewVelocityPerHour)}/hr</b> velocity</span>
          <span class="est"><b>${money(g.estimatedYouTubeRevenue)}</b> est. YT revenue*</span>
        </div>
        <div class="streamers">${g.streamers.map(streamerChip).join('')}</div>
        <div class="trend-bar"><div class="fill" style="width:${(g.trendScore / maxScore) * 100}%"></div></div>
      </div>
    </article>`;
}

async function refresh() {
  try {
    const res = await fetch('/api/trends');
    if (!res.ok) throw new Error(`API ${res.status}`);
    const data = await res.json();

    document.getElementById('demo-badge').classList.toggle('hidden', !data.demoMode);
    document.getElementById('last-updated').textContent =
      'Updated ' + new Date(data.generatedAt).toLocaleTimeString();
    document.getElementById('methodology').textContent = data.methodology;

    const [top, ...rest] = data.games;
    if (top) renderSpotlight(top);

    const maxScore = Math.max(...data.games.map((g) => g.trendScore), 1);
    document.getElementById('game-list').innerHTML = rest.map((g) => renderCard(g, maxScore)).join('');

    previousRanks = new Map(data.games.map((g) => [g.name, g.rank]));
  } catch (err) {
    document.getElementById('game-list').innerHTML =
      `<div class="loading">Couldn't load trend data (${esc(err.message)}). Retrying…</div>`;
  }
}

refresh();
setInterval(refresh, REFRESH_MS);
