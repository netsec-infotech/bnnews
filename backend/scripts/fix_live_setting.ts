import { prisma } from '../src/config/prisma.js';

async function main() {
  const latestVid = await prisma.video.findFirst({
    where: {
      videoSource: 'YOUTUBE',
      videoUrl: { not: { contains: 'dQw4w9WgXcQ' } }
    },
    orderBy: { createdAt: 'desc' }
  });

  const realVideoId = latestVid?.videoUrl ? latestVid.videoUrl.split('v=')[1]?.split('&')[0] : null;

  await prisma.youTubeLiveSetting.updateMany({
    data: {
      liveVideoId: realVideoId,
      fallbackEmbedUrl: realVideoId ? `https://www.youtube.com/embed/${realVideoId}` : 'https://www.youtube.com/embed/live_stream?channel=UCrnCztiQ3BKxbRvFPGIfHcw',
      streamTitle: latestVid?.titleGu || 'BN NEWS ગુજરાતી - અવિરત સમાચાર પ્રસારણ',
      streamThumbnail: latestVid?.thumbnailUrl || null,
    }
  });

  console.log('Updated youTubeLiveSetting with real video:', realVideoId);
  await prisma.$disconnect();
}

main().catch(console.error);
