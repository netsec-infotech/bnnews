import { prisma } from '../src/config/prisma.js';

async function main() {
  const s = await prisma.youTubeLiveSetting.findFirst();
  console.log('LiveSetting:', s);
  const vids = await prisma.video.findMany({
    orderBy: { createdAt: 'desc' },
    take: 5
  });
  console.log('Latest 5 videos:');
  vids.forEach(v => console.log(v.id, v.titleGu, v.videoUrl));
  await prisma.$disconnect();
}

main().catch(console.error);
