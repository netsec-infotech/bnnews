import { prisma } from '../src/config/prisma.js';

async function main() {
  const vids = await prisma.video.findMany({
    where: {
      OR: [
        { titleGu: { contains: 'વિધાનસભા' } },
        { titleGu: { contains: 'શિયાળુ સત્ર' } },
        { title: { contains: 'Assembly' } },
        { title: { contains: 'Winter Session' } },
      ],
    },
  });
  console.log('Matching videos:', vids.length);
  for (const v of vids) {
    console.log(`Video: ${v.id} | ${v.titleGu}`);
  }

  const news = await prisma.news.findMany({
    where: {
      OR: [
        { titleGu: { contains: 'વિધાનસભા' } },
        { titleGu: { contains: 'શિયાળુ સત્ર' } },
      ],
    },
  });
  console.log('Matching news articles:', news.length);
  for (const n of news) {
    console.log(`News: ${n.id} | ${n.titleGu}`);
  }

  if (vids.length > 0) {
    const d = await prisma.video.deleteMany({
      where: {
        id: { in: vids.map(v => v.id) }
      }
    });
    console.log('Deleted videos:', d.count);
  }

  await prisma.$disconnect();
}

main().catch(console.error);
