// Aggregation: merge Twitch + YouTube signals into a single ranked list with
// a composite trend score and earnings estimates.

const twitch = require('./twitch');
const youtube = require('./youtube');
const { getMockData } = require('./mockData');
const { estimateStreamerHourly, estimateYouTubeRevenue, METHODOLOGY } = require('./earnings');

// Weighted composite: live concurrent viewers dominate (that's "right now"),
// YouTube view velocity captures short-form/video momentum, channel count is
// a breadth-of-creators signal.
const WEIGHTS = { viewers: 0.6, velocity: 0.3, channels: 0.1 };

function normalize(values) {
  const max = Math.max(...values, 1);
  return values.map((v) => v / max);
}

function momentumLabel(velocityShare) {
  if (velocityShare >= 0.75) return 'surging';
  if (velocityShare >= 0.4) return 'hot';
  if (velocityShare >= 0.15) return 'rising';
  return 'steady';
}

async function getTrends() {
  const sources = { twitch: 'demo', youtube: 'demo' };
  let games;
  let youtubeByGame;

  if (twitch.isConfigured()) {
    games = await twitch.getTopGames();
    sources.twitch = 'live';
  }

  if (games && youtube.isConfigured()) {
    try {
      const videos = await youtube.getTrendingGamingVideos();
      youtubeByGame = youtube.matchVideosToGames(games, videos);
      sources.youtube = 'live';
    } catch (err) {
      console.error('YouTube fetch failed, continuing without it:', err.message);
      sources.youtube = 'error';
    }
  }

  if (!games) {
    const mock = getMockData();
    games = mock.games;
    youtubeByGame = mock.youtubeByGame;
  }

  const yt = (name) =>
    (youtubeByGame && youtubeByGame.get(name)) || {
      trendingViews: 0,
      viewVelocityPerHour: 0,
      videoCount: 0,
    };

  const viewersNorm = normalize(games.map((g) => g.concurrentViewers));
  const velocityNorm = normalize(games.map((g) => yt(g.name).viewVelocityPerHour));
  const channelsNorm = normalize(games.map((g) => g.channelCount));

  const ranked = games
    .map((g, i) => {
      const ytStats = yt(g.name);
      return {
        name: g.name,
        boxArtUrl: g.boxArtUrl,
        trendScore: Math.round(
          100 *
            (viewersNorm[i] * WEIGHTS.viewers +
              velocityNorm[i] * WEIGHTS.velocity +
              channelsNorm[i] * WEIGHTS.channels)
        ),
        shortFormMomentum: momentumLabel(velocityNorm[i]),
        twitch: {
          concurrentViewers: g.concurrentViewers,
          channelCount: g.channelCount,
        },
        youtube: ytStats,
        estimatedYouTubeRevenue: estimateYouTubeRevenue(ytStats.trendingViews),
        streamers: g.streamers.map((s) => ({
          ...s,
          estimatedEarningsPerHour: estimateStreamerHourly(s.viewers),
        })),
      };
    })
    .sort((a, b) => b.trendScore - a.trendScore)
    .map((g, i) => ({ rank: i + 1, ...g }));

  return {
    generatedAt: new Date().toISOString(),
    demoMode: sources.twitch === 'demo',
    sources,
    methodology: METHODOLOGY,
    games: ranked,
  };
}

module.exports = { getTrends };
