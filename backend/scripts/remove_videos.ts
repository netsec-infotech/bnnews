import { prisma } from '../src/config/prisma.js';

async function main() {
  const allVideos = await prisma.video.findMany();
  console.log('Total videos in DB:', allVideos.length);
  for (const v of allVideos) {
    console.log(`ID: ${v.id} | Title: ${v.titleGu}`);
  }

  const deleteResult = await prisma.video.deleteMany({
    where: {
      titleGu: {
        contains: 'ગુજરાત વિધાનસભા શિયાળુ સત્ર',
      },
    },
  });

  console.log('Deleted videos count:', deleteResult.count);
  await prisma.$disconnect();
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
