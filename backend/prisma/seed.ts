import { PrismaClient, Role, SourceStatus, AdType, AdCampaignStatus, VideoSource, InvoiceStatus } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting BN News Gujarati Complete Database Seeding...');

  // 1. Seed Roles & Users
  const hashedPassword = await bcrypt.hash('Admin@BN2026!', 10);
  const editorPassword = await bcrypt.hash('Editor@BN2026!', 10);

  const superAdmin = await prisma.user.upsert({
    where: { email: 'admin@bnnews.in' },
    update: {
      password: hashedPassword,
      isActive: true,
    },
    create: {
      email: 'admin@bnnews.in',
      name: 'મુખ્ય વ્યવસ્થાપક (Super Admin)',
      password: hashedPassword,
      role: Role.SUPER_ADMIN,
      isActive: true,
    },
  });

  const editor = await prisma.user.upsert({
    where: { email: 'editor@bnnews.in' },
    update: {
      password: editorPassword,
      isActive: true,
    },
    create: {
      email: 'editor@bnnews.in',
      name: 'મુખ્ય સંપાદક (Chief Editor)',
      password: editorPassword,
      role: Role.EDITOR,
      isActive: true,
    },
  });

  const adManager = await prisma.user.upsert({
    where: { email: 'ads@bnnews.in' },
    update: {
      password: hashedPassword,
      isActive: true,
    },
    create: {
      email: 'ads@bnnews.in',
      name: 'જાહેરાત મેનેજર (Ad Manager)',
      password: hashedPassword,
      role: Role.AD_MANAGER,
      isActive: true,
    },
  });

  console.log(`✅ Core Users seeded: Super Admin, Editor, Ad Manager`);

  // 2. Default Gujarati Categories
  const categories = [
    { name: 'Gujarat', nameGu: 'ગુજરાત', slug: 'gujarat', order: 1, icon: 'MapPin', description: 'ગુજરાતના તમામ તાજા સમાચાર અને સ્થાનિક અપડેટ્સ' },
    { name: 'India', nameGu: 'ભારત', slug: 'india', order: 2, icon: 'Flag', description: 'રાષ્ટ્રીય સ્તરના મહત્વના સમાચાર' },
    { name: 'World', nameGu: 'વિશ્વ', slug: 'world', order: 3, icon: 'Globe', description: 'આંતરરાષ્ટ્રીય મહત્વના સમાચાર' },
    { name: 'Politics', nameGu: 'રાજકારણ', slug: 'politics', order: 4, icon: 'Vote', description: 'રાજકીય વિશ્લેષણ અને ઘટનાઓ' },
    { name: 'Business', nameGu: 'વ્યાપાર', slug: 'business', order: 5, icon: 'TrendingUp', description: 'શેરબજાર, અર્થતંત્ર અને વ્યાપાર જગત' },
    { name: 'Technology', nameGu: 'ટેકનોલોજી', slug: 'technology', order: 6, icon: 'Cpu', description: 'ટેક સમાચાર, ગેજેટ્સ અને ડિજિટલ અપડેટ્સ' },
    { name: 'Sports', nameGu: 'રમતગમત', slug: 'sports', order: 7, icon: 'Trophy', description: 'ક્રિકેટ, ઓલિમ્પિક્સ અને ખેલ જગત' },
    { name: 'Entertainment', nameGu: 'મનોરંજન', slug: 'entertainment', order: 8, icon: 'Film', description: 'બોલિવૂડ, ઢોલીવૂડ અને સિનેમા' },
    { name: 'Lifestyle', nameGu: 'લાઇફસ્ટાઇલ', slug: 'lifestyle', order: 9, icon: 'Sparkles', description: 'જીવનશૈલી, ફેશન અને ટ્રેન્ડ્સ' },
    { name: 'Health', nameGu: 'સ્વાસ્થ્ય', slug: 'health', order: 10, icon: 'HeartPulse', description: 'તંદુરસ્તી, યોગ અને આરોગ્ય' },
    { name: 'Education', nameGu: 'શિક્ષણ', slug: 'education', order: 11, icon: 'GraduationCap', description: 'શિક્ષણ, કારકિર્દી અને પરીક્ષા પરિણામ' },
  ];

  const categoryMap = new Map<string, string>();
  for (const cat of categories) {
    const record = await prisma.category.upsert({
      where: { slug: cat.slug },
      update: { nameGu: cat.nameGu, order: cat.order, icon: cat.icon, description: cat.description },
      create: {
        name: cat.name,
        nameGu: cat.nameGu,
        slug: cat.slug,
        order: cat.order,
        icon: cat.icon,
        description: cat.description,
        isActive: true,
      },
    });
    categoryMap.set(cat.slug, record.id);
  }
  console.log(`✅ ${categories.length} Categories seeded.`);

  // 3. 17 Verified Gujarati RSS Feeds
  const rssSources = [
    { name: 'BBC News Gujarati', feedUrl: 'https://feeds.bbci.co.uk/gujarati/rss.xml', websiteUrl: 'https://www.bbc.com/gujarati', categorySlug: 'gujarat', attributionName: 'BBC Gujarati' },
    { name: 'TV9 Gujarati - તાજા સમાચાર', feedUrl: 'https://tv9gujarati.com/feed', websiteUrl: 'https://tv9gujarati.com', categorySlug: 'gujarat', attributionName: 'TV9 Gujarati' },
    { name: 'TV9 Gujarati - ગુજરાત', feedUrl: 'https://tv9gujarati.com/gujarat/feed', websiteUrl: 'https://tv9gujarati.com/gujarat', categorySlug: 'gujarat', attributionName: 'TV9 Gujarati' },
    { name: 'TV9 Gujarati - ભારત (National)', feedUrl: 'https://tv9gujarati.com/national/feed', websiteUrl: 'https://tv9gujarati.com/national', categorySlug: 'india', attributionName: 'TV9 Gujarati' },
    { name: 'TV9 Gujarati - વ્યાપાર (Business)', feedUrl: 'https://tv9gujarati.com/business/feed', websiteUrl: 'https://tv9gujarati.com/business', categorySlug: 'business', attributionName: 'TV9 Business' },
    { name: 'TV9 Gujarati - રમતગમત (Sports)', feedUrl: 'https://tv9gujarati.com/sports/feed', websiteUrl: 'https://tv9gujarati.com/sports', categorySlug: 'sports', attributionName: 'TV9 Sports' },
    { name: 'TV9 Gujarati - મનોરંજન (Entertainment)', feedUrl: 'https://tv9gujarati.com/entertainment/feed', websiteUrl: 'https://tv9gujarati.com/entertainment', categorySlug: 'entertainment', attributionName: 'TV9 Entertainment' },
    { name: 'TV9 Gujarati - ટેકનોલોજી (Technology)', feedUrl: 'https://tv9gujarati.com/technology/feed', websiteUrl: 'https://tv9gujarati.com/technology', categorySlug: 'technology', attributionName: 'TV9 Tech' },
    { name: 'TV9 Gujarati - લાઈફસ્ટાઇલ (Lifestyle)', feedUrl: 'https://tv9gujarati.com/lifestyle/feed', websiteUrl: 'https://tv9gujarati.com/lifestyle', categorySlug: 'lifestyle', attributionName: 'TV9 Lifestyle' },
    { name: 'The Indian Express Gujarati', feedUrl: 'https://gujarati.indianexpress.com/feed/', websiteUrl: 'https://gujarati.indianexpress.com', categorySlug: 'india', attributionName: 'The Indian Express' },
    { name: 'ABP Asmita - મુખ્ય સમાચાર', feedUrl: 'https://gujarati.abplive.com/home/feed', websiteUrl: 'https://gujarati.abplive.com', categorySlug: 'gujarat', attributionName: 'ABP Asmita' },
    { name: 'ABP Asmita - ગુજરાત સમાચાર', feedUrl: 'https://gujarati.abplive.com/news/gujarat/feed', websiteUrl: 'https://gujarati.abplive.com/news/gujarat', categorySlug: 'gujarat', attributionName: 'ABP Asmita' },
    { name: 'ABP Asmita - ભારત', feedUrl: 'https://gujarati.abplive.com/news/india/feed', websiteUrl: 'https://gujarati.abplive.com/news/india', categorySlug: 'india', attributionName: 'ABP Asmita' },
    { name: 'ABP Asmita - વ્યાપાર (Business)', feedUrl: 'https://gujarati.abplive.com/business/feed', websiteUrl: 'https://gujarati.abplive.com/business', categorySlug: 'business', attributionName: 'ABP Asmita' },
    { name: 'ABP Asmita - મનોરંજન (Entertainment)', feedUrl: 'https://gujarati.abplive.com/entertainment/feed', websiteUrl: 'https://gujarati.abplive.com/entertainment', categorySlug: 'entertainment', attributionName: 'ABP Asmita' },
    { name: 'ABP Asmita - રમતગમત (Sports)', feedUrl: 'https://gujarati.abplive.com/sports/feed', websiteUrl: 'https://gujarati.abplive.com/sports', categorySlug: 'sports', attributionName: 'ABP Asmita' },
    { name: 'OneIndia Gujarati News', feedUrl: 'https://gujarati.oneindia.com/rss/gujarati-news-fb.xml', websiteUrl: 'https://gujarati.oneindia.com', categorySlug: 'entertainment', attributionName: 'OneIndia Gujarati' },
  ];

  for (const src of rssSources) {
    const catId = categoryMap.get(src.categorySlug) || categoryMap.get('gujarat');
    await prisma.rssSource.upsert({
      where: { feedUrl: src.feedUrl },
      update: { name: src.name, websiteUrl: src.websiteUrl, attributionName: src.attributionName, defaultCategoryId: catId },
      create: {
        name: src.name,
        feedUrl: src.feedUrl,
        websiteUrl: src.websiteUrl,
        defaultCategoryId: catId,
        attributionName: src.attributionName,
        collectionInterval: 30,
        status: SourceStatus.ACTIVE,
        language: 'gu',
      },
    });
  }
  console.log(`✅ ${rssSources.length} Verified Gujarati RSS Sources seeded.`);

  // 4. Seed All 30+ Ad Placements
  const placements = [
    // Homepage
    { identifier: 'homepage_above_navigation', name: 'Homepage - નેવિગેશન ઉપર (ટોપ બેનર)', pageGroup: 'HOMEPAGE', desktopDimensions: '970x90', mobileDimensions: '320x50' },
    { identifier: 'homepage_below_navigation', name: 'Homepage - નેવિગેશન નીચે', pageGroup: 'HOMEPAGE', desktopDimensions: '728x90', mobileDimensions: '320x50' },
    { identifier: 'homepage_below_breaking', name: 'Homepage - બ્રેકિંગ ન્યૂઝ નીચે', pageGroup: 'HOMEPAGE', desktopDimensions: '728x90', mobileDimensions: '300x100' },
    { identifier: 'homepage_above_hero', name: 'Homepage - મુખ્ય હેડલાઇન ઉપર', pageGroup: 'HOMEPAGE', desktopDimensions: '970x120', mobileDimensions: '320x100' },
    { identifier: 'homepage_right_hero', name: 'Homepage - હીરો સેક્શન જમણી બાજુ', pageGroup: 'HOMEPAGE', desktopDimensions: '300x250', mobileDimensions: '300x250' },
    { identifier: 'homepage_between_latest', name: 'Homepage - તાજા સમાચાર વચ્ચે', pageGroup: 'HOMEPAGE', desktopDimensions: '728x90', mobileDimensions: '300x150' },
    { identifier: 'homepage_between_categories', name: 'Homepage - કેટેગરી સેક્શન વચ્ચે', pageGroup: 'HOMEPAGE', desktopDimensions: '970x90', mobileDimensions: '320x100' },
    { identifier: 'homepage_bottom', name: 'Homepage - ફૂટર ઉપર (બોટમ)', pageGroup: 'HOMEPAGE', desktopDimensions: '970x90', mobileDimensions: '320x50' },

    // News Detail Page
    { identifier: 'news_above_article', name: 'News Detail - લેખની શરૂઆતમાં', pageGroup: 'NEWS_DETAIL', desktopDimensions: '728x90', mobileDimensions: '320x50' },
    { identifier: 'news_below_headline', name: 'News Detail - હેડલાઇન નીચે', pageGroup: 'NEWS_DETAIL', desktopDimensions: '728x90', mobileDimensions: '300x100' },
    { identifier: 'news_below_featured_image', name: 'News Detail - મુખ્ય તસવીર નીચે', pageGroup: 'NEWS_DETAIL', desktopDimensions: '728x90', mobileDimensions: '300x150' },
    { identifier: 'news_between_paragraphs', name: 'News Detail - પેરાગ્રાફ વચ્ચે (ઇન-આર્ટિકલ)', pageGroup: 'NEWS_DETAIL', desktopDimensions: '300x250', mobileDimensions: '300x250' },
    { identifier: 'news_after_article', name: 'News Detail - આર્ટિકલ પૂર્ણ થયા પછી', pageGroup: 'NEWS_DETAIL', desktopDimensions: '728x90', mobileDimensions: '320x100' },
    { identifier: 'news_related_section', name: 'News Detail - સંબંધિત સમાચાર સેક્શન', pageGroup: 'NEWS_DETAIL', desktopDimensions: '300x250', mobileDimensions: '300x250' },
    { identifier: 'news_right_sidebar', name: 'News Detail - જમણી સાઇડબાર', pageGroup: 'NEWS_DETAIL', desktopDimensions: '300x600', mobileDimensions: '300x250' },

    // Category Pages
    { identifier: 'category_top_banner', name: 'Category Page - ટોપ બેનર', pageGroup: 'CATEGORY', desktopDimensions: '728x90', mobileDimensions: '320x50' },
    { identifier: 'category_between_news_cards', name: 'Category Page - સમાચાર કાર્ડ્સ વચ્ચે', pageGroup: 'CATEGORY', desktopDimensions: '728x90', mobileDimensions: '300x150' },
    { identifier: 'category_sidebar', name: 'Category Page - સાઇડબાર', pageGroup: 'CATEGORY', desktopDimensions: '300x250', mobileDimensions: '300x250' },
    { identifier: 'category_bottom_banner', name: 'Category Page - બોટમ બેનર', pageGroup: 'CATEGORY', desktopDimensions: '728x90', mobileDimensions: '320x50' },

    // Videos and Reels
    { identifier: 'videos_before_video', name: 'Videos - વીડિયો પહેલાં', pageGroup: 'VIDEOS_REELS', desktopDimensions: '640x360', mobileDimensions: '320x180' },
    { identifier: 'videos_between_videos', name: 'Videos - વીડિયો ગ્રીડ વચ્ચે', pageGroup: 'VIDEOS_REELS', desktopDimensions: '728x90', mobileDimensions: '300x150' },
    { identifier: 'videos_after_video', name: 'Videos - વીડિયો પછી', pageGroup: 'VIDEOS_REELS', desktopDimensions: '640x360', mobileDimensions: '320x180' },
    { identifier: 'videos_sidebar', name: 'Videos - વીડિયો સાઇડબાર', pageGroup: 'VIDEOS_REELS', desktopDimensions: '300x250', mobileDimensions: '300x250' },

    // Live TV
    { identifier: 'live_tv_above_player', name: 'Live TV - પ્લેયર ઉપર', pageGroup: 'LIVE_TV', desktopDimensions: '728x90', mobileDimensions: '320x50' },
    { identifier: 'live_tv_below_player', name: 'Live TV - પ્લેયર નીચે', pageGroup: 'LIVE_TV', desktopDimensions: '728x90', mobileDimensions: '320x100' },
    { identifier: 'live_tv_sidebar', name: 'Live TV - ચેટ/વિગતો સાઇડબાર', pageGroup: 'LIVE_TV', desktopDimensions: '300x250', mobileDimensions: '300x250' },

    // Popups and Sticky Banners
    { identifier: 'popup_website_entry', name: 'Popup - વેબસાઇટ એન્ટ્રી પોપઅપ', pageGroup: 'POPUP_STICKY', desktopDimensions: '600x400', mobileDimensions: '320x400' },
    { identifier: 'popup_delayed', name: 'Popup - ૫ સેકન્ડ ડીલે પોપઅપ', pageGroup: 'POPUP_STICKY', desktopDimensions: '500x350', mobileDimensions: '300x300' },
    { identifier: 'sticky_bottom_banner', name: 'Sticky - બોટમ ફિક્સડ બેનર (સ્ટીકી)', pageGroup: 'POPUP_STICKY', desktopDimensions: '728x90', mobileDimensions: '320x50' },
    { identifier: 'popup_mobile', name: 'Popup - માત્ર મોબાઇલ પોપઅપ', pageGroup: 'POPUP_STICKY', desktopDimensions: '320x450', mobileDimensions: '320x450' },
  ];

  const placementMap = new Map<string, string>();
  for (const pl of placements) {
    const record = await prisma.adPlacement.upsert({
      where: { identifier: pl.identifier },
      update: { name: pl.name, pageGroup: pl.pageGroup, desktopDimensions: pl.desktopDimensions, mobileDimensions: pl.mobileDimensions },
      create: {
        identifier: pl.identifier,
        name: pl.name,
        pageGroup: pl.pageGroup,
        desktopDimensions: pl.desktopDimensions,
        mobileDimensions: pl.mobileDimensions,
        isActive: true,
      },
    });
    placementMap.set(pl.identifier, record.id);
  }
  console.log(`✅ ${placements.length} Ad Placements seeded across all website sections.`);

  // 5. Seed Real Advertisers & Active Campaigns
  let advertiser1 = await prisma.advertiser.findFirst({ where: { email: 'ads@reliancedigital.in' } });
  if (!advertiser1) {
    advertiser1 = await prisma.advertiser.create({
      data: {
        companyName: 'રિલાયન્સ ડિજિટલ ગુજરાત (Reliance Digital Gujarat)',
        contactPerson: 'ભાવિન શાહ (Marketing Head)',
        phone: '+91 98250 12345',
        email: 'ads@reliancedigital.in',
        gstNumber: '24AAACR1234F1Z8',
        address: 'એસ.જી. હાઇવે, અમદાવાદ',
      },
    });
  }

  let advertiser2 = await prisma.advertiser.findFirst({ where: { email: 'campaigns@adaniwilmar.in' } });
  if (!advertiser2) {
    advertiser2 = await prisma.advertiser.create({
      data: {
        companyName: 'અદાણી વિલ્મર ફોર્ચ્યુન (Adani Wilmar Fortune)',
        contactPerson: 'પ્રિયા દેસાઈ',
        phone: '+91 98251 67890',
        email: 'campaigns@adaniwilmar.in',
        gstNumber: '24AAACA5678B1Z2',
        address: 'અદાણી શાંતિગ્રામ, અમદાવાદ',
      },
    });
  }

  let campaign1 = await prisma.adCampaign.findFirst({ where: { name: 'દિવાળી મેગા ટેક ઓફર્સ ૨૦૨૬ (Diwali Tech Offers)' } });
  if (!campaign1) {
    campaign1 = await prisma.adCampaign.create({
      data: {
        advertiserId: advertiser1.id,
        name: 'દિવાળી મેગા ટેક ઓફર્સ ૨૦૨૬ (Diwali Tech Offers)',
        budget: 50000,
        agreedPrice: 45000,
        startDate: new Date(Date.now() - 5 * 86400000),
        endDate: new Date(Date.now() + 25 * 86400000),
        status: AdCampaignStatus.ACTIVE,
        creatives: {
          create: [
            {
              name: 'દિવાળી ટેક ફેસ્ટિવલ લીડરબોર્ડ',
              adType: AdType.BANNER,
              desktopCreative: 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=970&auto=format&fit=crop&q=80',
              mobileCreative: 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=320&auto=format&fit=crop&q=80',
              landingPageUrl: 'https://www.reliancedigital.in',
              altText: 'રિલાયન્સ ડિજિટલ ઉત્સવ ઓફર્સ',
            },
            {
              name: 'મોબાઇલ સ્પેશિયલ સાઇડબાર',
              adType: AdType.SIDEBAR,
              desktopCreative: 'https://images.unsplash.com/photo-1512499617640-c74ae3a79d37?w=300&auto=format&fit=crop&q=80',
              landingPageUrl: 'https://www.reliancedigital.in',
              altText: 'સ્માર્ટફોન ધમાકા ઓફર્સ',
            },
          ],
        },
        popups: {
          create: [
            {
              heading: 'રિલાયન્સ ડિજિટલ મહા ઑફર!',
              headingGu: 'તમામ ઇલેક્ટ્રોનિક્સ પર ફ્લેટ ૫૦% સુધીની છૂટ',
              description: 'ગુજરાતના તમામ સ્ટોર્સ પર મર્યાદિત સમય માટે ઓફર ઉપલબ્ધ.',
              descriptionGu: 'આજે જ મુલાકાત લો અને આકર્ષક કેશબેક મેળવો.',
              mediaUrl: 'https://images.unsplash.com/photo-1498049794561-7780e7231661?w=600&auto=format&fit=crop&q=80',
              ctaButton: 'ઑફર જુઓ',
              destinationUrl: 'https://www.reliancedigital.in',
              delaySeconds: 4,
              frequencyCap: 'ONCE_PER_SESSION',
            },
          ],
        },
      },
    });

    // Link Campaign to multiple placements
    const targetPlacements = [
      'homepage_below_breaking',
      'homepage_between_latest',
      'news_right_sidebar',
      'sticky_bottom_banner',
    ];

    for (const plKey of targetPlacements) {
      const plId = placementMap.get(plKey);
      if (plId) {
        await prisma.adCampaignPlacement.create({
          data: {
            campaignId: campaign1.id,
            placementId: plId,
            priority: 1,
          },
        });
      }
    }
  }

  // Create Invoice for Advertiser 1 if not exists
  const existingInvoice = await prisma.adInvoice.findUnique({ where: { invoiceNumber: 'INV-BN-2026-001' } });
  if (!existingInvoice) {
    await prisma.adInvoice.create({
      data: {
        invoiceNumber: 'INV-BN-2026-001',
        advertiserId: advertiser1.id,
        campaignId: campaign1.id,
        amount: 45000,
        gstRate: 18.0,
        gstAmount: 8100,
        totalAmount: 53100,
        status: InvoiceStatus.PAID,
        dueDate: new Date(Date.now() + 15 * 86400000),
        paidAt: new Date(),
      },
    });
  }
  console.log(`✅ Advertisers, Multi-Placement Campaigns & Invoices seeded.`);

  // 6. Seed Team Departments & Real Editorial Team Members
  const departments = [
    { name: 'Management', nameGu: 'સંચાલન મંડળ (Management)', slug: 'management', order: 1 },
    { name: 'Editorial Board', nameGu: 'સંપાદકીય બોર્ડ (Editorial Board)', slug: 'editorial', order: 2 },
    { name: 'News Anchors', nameGu: 'સમાચાર એન્કર્સ (News Anchors)', slug: 'anchors', order: 3 },
    { name: 'Reporting Team', nameGu: 'રિપોર્ટિંગ ટીમ (Field Reporters)', slug: 'reporters', order: 4 },
    { name: 'District Correspondents', nameGu: 'જિલ્લા બ્યુરો ચીફ (District Correspondents)', slug: 'district-bureau', order: 5 },
    { name: 'Video Journalists', nameGu: 'વીડિયો પત્રકારો (Video Journalists)', slug: 'video-journalists', order: 6 },
    { name: 'Digital Media', nameGu: 'ડિજિટલ મીડિયા અને સોશિયલ ટીમ', slug: 'digital-media', order: 7 },
  ];

  const deptMap = new Map<string, string>();
  for (const d of departments) {
    const record = await prisma.teamDepartment.upsert({
      where: { slug: d.slug },
      update: { nameGu: d.nameGu, order: d.order },
      create: { name: d.name, nameGu: d.nameGu, slug: d.slug, order: d.order, isActive: true },
    });
    deptMap.set(d.slug, record.id);
  }

  const teamMembers = [
    {
      name: 'Nilesh Patel',
      nameGu: 'નિલેશ પટેલ',
      slug: 'nilesh-patel',
      photoUrl: '/images/team/Team-1.jpeg',
      designation: 'Managing Director & Editor-in-Chief',
      designationGu: 'મેનેજિંગ ડિરેક્ટર અને મુખ્ય સંપાદક',
      departmentSlug: 'management',
      bio: '20+ years of investigative journalism across Gujarat.',
      bioGu: 'ગુજરાતના અગ્રણી પત્રકાર અને મીડિયા સંચાલક તરીકે ૨૦ થી વધુ વર્ષોનો પત્રકારત્વનો અનુભવ.',
      experienceYears: 22,
      district: 'વડોદરા',
      isFeatured: true,
      displayOrder: 1,
    },
    {
      name: 'Rupal Joshi',
      nameGu: 'રૂપલ જોશી',
      slug: 'rupal-joshi',
      photoUrl: '/images/team/Team-2.jpeg',
      designation: 'Senior News Anchor & Political Analyst',
      designationGu: 'સીનિયર ન્યૂઝ એન્કર અને રાજકીય વિશ્લેષક',
      departmentSlug: 'anchors',
      bio: 'Prime-time news anchor hosting daily political debates on BN News.',
      bioGu: 'પ્રાઈમ ટાઈમ ન્યૂઝ એન્કર અને ગુજરાતના રાજકીય વિશ્લેષણમાં વિશેષ નિપુણતા ધરાવતા પત્રકાર.',
      experienceYears: 12,
      district: 'અમદાવાદ',
      isFeatured: true,
      displayOrder: 2,
    },
    {
      name: 'Ketan Trivedi',
      nameGu: 'કેતન ત્રિવેદી',
      slug: 'ketan-trivedi',
      photoUrl: '/images/team/Team-3.jpeg',
      designation: 'District Bureau Chief (Saurashtra)',
      designationGu: 'સૌરાષ્ટ્ર ઝોન બ્યુરો ચીફ',
      departmentSlug: 'district-bureau',
      bio: 'Heading news coverage and grassroot reporting across 8 districts.',
      bioGu: 'સૌરાષ્ટ્રના ૮ જિલ્લાઓમાં ગ્રાઉન્ડ રિપોર્ટિંગ અને સ્થાનિક સમસ્યાઓની ધારદાર રજૂઆત.',
      experienceYears: 15,
      district: 'રાજકોટ',
      isFeatured: true,
      displayOrder: 3,
    },
    {
      name: 'Sneha Dave',
      nameGu: 'સ્નેહા દવે',
      slug: 'sneha-dave',
      photoUrl: '/images/team/Team-4.jpeg',
      designation: 'Digital Media Head & Special Correspondent',
      designationGu: 'ડિજિટલ મીડિયા હેડ અને વિશેષ સંવાદદાતા',
      departmentSlug: 'digital-media',
      bio: 'Leading video reels, viral news content and social broadcasting.',
      bioGu: 'વીડિયો રીલ્સ, સોશિયલ મીડિયા બ્રોડકાસ્ટિંગ અને ડિજિટલ સમાચાર નિર્માણના વડા.',
      experienceYears: 8,
      district: 'સુરત',
      isFeatured: true,
      displayOrder: 4,
    },
    {
      name: 'Pragnesh Shah',
      nameGu: 'પ્રજ્ઞેશ શાહ',
      slug: 'pragnesh-shah',
      photoUrl: '/images/team/Team-5.jpeg',
      designation: 'Senior Field Reporter (North Gujarat)',
      designationGu: 'સીનિયર ગ્રાઉન્ડ રિપોર્ટર (ઉત્તર ગુજરાત)',
      departmentSlug: 'reporters',
      bio: 'Exclusive field reporting, interviews and ground reality coverage.',
      bioGu: 'ઉત્તર ગુજરાતના છેવાડાના વિસ્તારો સુધીની સાચી વાસ્તવિકતા અને સ્પેશિયલ કવરેજ.',
      experienceYears: 10,
      district: 'મહેસાણા',
      isFeatured: true,
      displayOrder: 5,
    },
  ];

  for (const m of teamMembers) {
    const deptId = deptMap.get(m.departmentSlug) || deptMap.get('editorial');
    await prisma.teamMember.upsert({
      where: { slug: m.slug },
      update: {
        nameGu: m.nameGu,
        photoUrl: m.photoUrl,
        designationGu: m.designationGu,
        departmentId: deptId!,
        bioGu: m.bioGu,
        district: m.district,
        isFeatured: m.isFeatured,
      },
      create: {
        name: m.name,
        nameGu: m.nameGu,
        slug: m.slug,
        photoUrl: m.photoUrl,
        designation: m.designation,
        designationGu: m.designationGu,
        departmentId: deptId!,
        bio: m.bio,
        bioGu: m.bioGu,
        experienceYears: m.experienceYears,
        district: m.district,
        isFeatured: m.isFeatured,
        displayOrder: m.displayOrder,
      },
    });
  }
  console.log(`✅ ${teamMembers.length} Editorial Team Members seeded.`);

  // 7. Seed Video Categories, Videos & Reels
  const vCats = [
    { name: 'Top News Bulletins', nameGu: 'મુખ્ય સમાચાર બુલેટિન', slug: 'bulletins', order: 1 },
    { name: 'Ground Reports', nameGu: 'ગ્રાઉન્ડ રિપોર્ટ', slug: 'ground-reports', order: 2 },
    { name: 'Special Debates', nameGu: 'મહામંથન ચર્ચા', slug: 'debates', order: 3 },
    { name: 'Shorts & Reels', nameGu: 'વાયરલ રીલ્સ', slug: 'reels', order: 4 },
  ];

  const vCatMap = new Map<string, string>();
  for (const vc of vCats) {
    const r = await prisma.videoCategory.upsert({
      where: { slug: vc.slug },
      update: { nameGu: vc.nameGu },
      create: { name: vc.name, nameGu: vc.nameGu, slug: vc.slug, order: vc.order, isActive: true },
    });
    vCatMap.set(vc.slug, r.id);
  }

  const sampleVideos = [
    {
      title: 'Vaghodia Canal Breach Water in Fields',
      titleGu: 'વાઘોડિયામાં દેવ સિંચાઈની નવીન કેનાલમાં મોટું ગાબડું પાડતા ખેડૂતોના ખેતરોમાં ફરી વળ્યાં પાણી.',
      slug: 'vaghodia-canal-breach-water-in-fields',
      videoSource: VideoSource.YOUTUBE,
      videoUrl: 'https://www.youtube.com/watch?v=zcCafCwevuA',
      thumbnailUrl: 'https://images.unsplash.com/photo-1541872703-74c5e44368f9?w=600&auto=format&fit=crop&q=80',
      duration: '05:20',
      categorySlug: 'bulletins',
      isFeatured: true,
      isReel: false,
      showOnHome: true,
      showOnVideos: true,
      showOnReels: false,
    },
    {
      title: 'Padra APMC Director Alpesh Patel Greetings',
      titleGu: 'પાદરા એ.પી.એમ.સી ડિરેક્ટર અલ્પેશ પટેલ દ્વારા વિશેષ શુભેચ્છાઓ',
      slug: 'padra-apmc-director-alpesh-patel-greetings',
      videoSource: VideoSource.YOUTUBE,
      videoUrl: 'https://www.youtube.com/watch?v=PPK2IanqN4g',
      thumbnailUrl: 'https://images.unsplash.com/photo-1598890777032-bde835ba27c2?w=600&auto=format&fit=crop&q=80',
      duration: '03:15',
      categorySlug: 'ground-reports',
      isFeatured: false,
      isReel: false,
      showOnHome: true,
      showOnVideos: true,
      showOnReels: false,
    },
    // Reels (Vertical 9:16)
    {
      title: 'Derol Railway Bridge Accident Youth Dies',
      titleGu: 'ડેરોલ રેલવે ઓવરબ્રિજ પર અંધારું: અકસ્માતમાં યુવાનનું મોત, સ્ટ્રીટ લાઇટની માંગ તેજ',
      slug: 'derol-railway-bridge-accident-update',
      videoSource: VideoSource.YOUTUBE,
      videoUrl: 'https://www.youtube.com/watch?v=W8I-GmizjjU',
      thumbnailUrl: 'https://images.unsplash.com/photo-1517649763962-0c623266ddc0?w=400&auto=format&fit=crop&q=80',
      duration: '0:45',
      categorySlug: 'reels',
      isFeatured: true,
      isReel: true,
      showOnHome: true,
      showOnVideos: true,
      showOnReels: true,
    },
    {
      title: 'Women Workers Receive Bonus Thanks Expressed',
      titleGu: 'મહિલા કર્મચારીઓને મળ્યું હકનું બોનસ: ભાવિન ભાઈ પાટણવાડિયાનો માન્યો આભાર',
      slug: 'women-workers-receive-bonus-thanks',
      videoSource: VideoSource.YOUTUBE,
      videoUrl: 'https://www.youtube.com/watch?v=1A96Uqq6F7g',
      thumbnailUrl: 'https://images.unsplash.com/photo-1534188753412-3e26d0d618d6?w=400&auto=format&fit=crop&q=80',
      duration: '0:50',
      categorySlug: 'reels',
      isFeatured: false,
      isReel: true,
      showOnHome: true,
      showOnVideos: true,
      showOnReels: true,
    },
  ];

  for (const v of sampleVideos) {
    const cId = vCatMap.get(v.categorySlug);
    await prisma.video.upsert({
      where: { slug: v.slug },
      update: { titleGu: v.titleGu, videoUrl: v.videoUrl, thumbnailUrl: v.thumbnailUrl, duration: v.duration },
      create: {
        title: v.title,
        titleGu: v.titleGu,
        slug: v.slug,
        videoSource: v.videoSource,
        videoUrl: v.videoUrl,
        thumbnailUrl: v.thumbnailUrl,
        duration: v.duration,
        categoryId: cId,
        authorId: superAdmin.id,
        isFeatured: v.isFeatured,
        isReel: v.isReel,
        showOnHome: v.showOnHome,
        showOnVideos: v.showOnVideos,
        showOnReels: v.showOnReels,
      },
    });
  }
  console.log(`✅ ${sampleVideos.length} Videos & Vertical Reels seeded.`);

  // 8. YouTube Live Settings
  const ytDelegate = (prisma as any).youTubeLiveSetting || (prisma as any).youtubeLiveSetting;
  if (ytDelegate) {
    await ytDelegate.deleteMany({});
    await ytDelegate.create({
      data: {
        channelId: 'UCrnCztiQ3BKxbRvFPGIfHcw',
        liveVideoId: null,
        isLive: false,
        streamTitle: 'BN NEWS ગુજરાતી - LIVE 24x7 સમાચાર પ્રસારણ',
        streamThumbnail: 'https://images.unsplash.com/photo-1585829365295-ab7cd400c167?w=1280&auto=format&fit=crop&q=80',
        fallbackEmbedUrl: 'https://www.youtube.com/embed/live_stream?channel=UCrnCztiQ3BKxbRvFPGIfHcw',
      },
    });
    console.log(`✅ YouTube Live Settings configured.`);
  }

  // 9. Website Settings
  const settings = [
    { key: 'site_title', value: 'BN NEWS ગુજરાતી', group: 'general', description: 'મુખ્ય વેબસાઇટ શીર્ષક' },
    { key: 'site_tagline', value: 'તમારા વિસ્તારની, તમારા ભાષામાં...', group: 'general', description: 'બ્રાન્ડ ટેગલાઇન' },
    { key: 'site_description', value: 'ગુજરાત, ભારત અને વિશ્વના સૌથી ઝડપી અને વિશ્વસનીય ગુજરાતી ડિજિટલ સમાચાર પોર્ટલ.', group: 'seo', description: 'SEO વર્ણન' },
    { key: 'contact_email', value: 'editor@bnnews.in', group: 'contact', description: 'સંપર્ક ઈમેલ' },
    { key: 'contact_phone', value: '+91 90996 76267', group: 'contact', description: 'સંપર્ક ફોન' },
    { key: 'contact_address', value: '2nd Floor, Office No 207/1 ,Akshar Plaza Complex Padra, Padra, Gujarat 391440', group: 'contact', description: 'સરનામું' },
    { key: 'live_tv_enabled', value: 'true', group: 'live_tv', description: 'Live TV સુવિધા સક્રિય/નિષ્ક્રિય' },
    { key: 'facebook_url', value: 'https://www.facebook.com/share/1DvY4dAr2u/', group: 'social', description: 'ફેસબુક લિંક' },
    { key: 'instagram_url', value: 'https://www.instagram.com/bnnewsgujarati?rpxt=bWIycTZlb3lkbmYw', group: 'social', description: 'ઇન્સ્ટાગ્રામ લિંક' },
    { key: 'youtube_url', value: 'https://youtube.com/@bnnewsgujarati2323?si=9nlsu3gkoakzvzIG', group: 'social', description: 'યુટ્યુબ ચેનલ' },
  ];

  for (const s of settings) {
    await prisma.websiteSetting.upsert({
      where: { key: s.key },
      update: { value: s.value },
      create: s,
    });
  }

  // 10. Seed Initial Social Feed Posts
  const socialPosts = [
    {
      platform: 'INSTAGRAM',
      postUrl: 'https://instagram.com/p/bnnews_reel1',
      caption: 'ગુજરાતના મહત્વના સમાચાર જુઓ માત્ર ૬૦ સેકન્ડમાં! #BNNewsGujarati #GujaratNews #Live24x7',
      mediaUrl: 'https://images.unsplash.com/photo-1611162617213-7d7a39e9b1d7?w=600&auto=format&fit=crop&q=80',
      thumbnailUrl: 'https://images.unsplash.com/photo-1611162617213-7d7a39e9b1d7?w=600&auto=format&fit=crop&q=80',
      authorName: 'BN NEWS ગુજરાતી (@bnnewsgujarati)',
    },
    {
      platform: 'FACEBOOK',
      postUrl: 'https://facebook.com/bnnewsgujarati/posts/101',
      caption: 'મુખ્યમંત્રીશ્રી દ્વારા નવી ઉદ્યોગ નીતિ જાહેર. સંપૂર્ણ વિગતવાર અહેવાલ અમારી વેબસાઇટ પર.',
      mediaUrl: 'https://images.unsplash.com/photo-1585829365295-ab7cd400c167?w=600&auto=format&fit=crop&q=80',
      thumbnailUrl: 'https://images.unsplash.com/photo-1585829365295-ab7cd400c167?w=600&auto=format&fit=crop&q=80',
      authorName: 'BN NEWS ગુજરાતી',
    },
  ];

  for (const sp of socialPosts) {
    await prisma.socialPost.create({ data: sp });
  }

  console.log('🎉 Database seeding finished successfully!');
}

main()
  .catch((e) => {
    console.error('Error during seeding:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
