import { prisma } from '../src/config/prisma.js';

async function main() {
  const posts = await prisma.socialPost.findMany({
    where: {
      caption: {
        contains: 'ગુજરાત વિધાનસભા શિયાળુ સત્ર',
      },
    },
  });
  console.log('Matching social posts:', posts.length);
  if (posts.length > 0) {
    const res = await prisma.socialPost.deleteMany({
      where: {
        caption: {
          contains: 'ગુજરાત વિધાનસભા શિયાળુ સત્ર',
        },
      },
    });
    console.log('Deleted social posts count:', res.count);
  }

  const articles = await prisma.newsArticle.findMany({
    where: {
      titleGu: {
        contains: 'ગુજરાત વિધાનસભા શિયાળુ સત્ર',
      },
    },
  });
  console.log('Matching news articles:', articles.length);
  for (const a of articles) {
    console.log(`Article: ${a.id} | ${a.titleGu}`);
  }

  // Also check if any seed or hardcoded file has this string
  await prisma.$disconnect();
}

main().catch(console.error);
