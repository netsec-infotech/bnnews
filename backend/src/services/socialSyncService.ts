import axios from 'axios';
import { prisma } from '../config/prisma.js';
import { config } from '../config/index.js';
import { encryptToken, decryptToken, generateOAuthState, verifyOAuthState } from './encryptionService.js';

// Environment credentials with fallback placeholders
const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID || '';
const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET || '';
const YOUTUBE_API_KEY = process.env.YOUTUBE_API_KEY || '';

const META_APP_ID = process.env.META_APP_ID || process.env.FACEBOOK_APP_ID || '';
const META_APP_SECRET = process.env.META_APP_SECRET || process.env.FACEBOOK_APP_SECRET || '';

// ==========================================
// 1. OAUTH URL BUILDERS
// ==========================================

export function getYouTubeOAuthUrl(): string {
  const redirectUri = `${config.frontendUrl}/admin/social?callback=youtube`;
  const state = generateOAuthState('YOUTUBE', { redirectUri });
  const scopes = [
    'https://www.googleapis.com/auth/youtube.readonly',
    'https://www.googleapis.com/auth/userinfo.profile',
  ].join(' ');

  const params = new URLSearchParams({
    client_id: GOOGLE_CLIENT_ID,
    redirect_uri: redirectUri,
    response_type: 'code',
    scope: scopes,
    access_type: 'offline',
    prompt: 'consent',
    state,
  });

  return `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`;
}

export function getMetaOAuthUrl(): string {
  const redirectUri = `${config.frontendUrl}/admin/social?callback=meta`;
  const state = generateOAuthState('FACEBOOK', { redirectUri });
  const scopes = [
    'pages_show_list',
    'pages_read_engagement',
    'pages_manage_posts',
    'instagram_basic',
    'instagram_manage_insights',
    'public_profile',
  ].join(',');

  const params = new URLSearchParams({
    client_id: META_APP_ID,
    redirect_uri: redirectUri,
    response_type: 'code',
    scope: scopes,
    state,
  });

  return `https://www.facebook.com/v20.0/dialog/oauth?${params.toString()}`;
}

// ==========================================
// 2. YOUTUBE OAUTH & SYNC LOGIC
// ==========================================

export async function handleYouTubeOAuthCallback(code: string, state: string) {
  const verification = verifyOAuthState(state);
  if (!verification.valid) {
    throw new Error('OAuth State verification failed (Possible CSRF or Expired Request).');
  }

  const redirectUri = verification.data?.redirectUri || `${config.frontendUrl}/admin/social?callback=youtube`;

  // 1. Exchange code for access & refresh token
  const tokenRes = await axios.post(
    'https://oauth2.googleapis.com/token',
    new URLSearchParams({
      code,
      client_id: GOOGLE_CLIENT_ID,
      client_secret: GOOGLE_CLIENT_SECRET,
      redirect_uri: redirectUri,
      grant_type: 'authorization_code',
    }).toString(),
    { headers: { 'Content-Type': 'application/x-www-form-urlencoded' } }
  );

  const { access_token, refresh_token, expires_in } = tokenRes.data;

  // 2. Retrieve Channel Information
  const channelRes = await axios.get('https://www.googleapis.com/youtube/v3/channels', {
    params: {
      part: 'snippet,statistics,contentDetails',
      mine: true,
    },
    headers: { Authorization: `Bearer ${access_token}` },
  });

  const channel = channelRes.data.items?.[0];
  if (!channel) {
    throw new Error('No YouTube Channel found associated with this Google Account.');
  }

  const tokenExpiresAt = new Date(Date.now() + (expires_in || 3600) * 1000);

  // 3. Persist in SocialAccount
  const account = await prisma.socialAccount.upsert({
    where: {
      platform_pageId: {
        platform: 'YOUTUBE',
        pageId: channel.id,
      },
    },
    update: {
      accountName: channel.snippet.title,
      pageName: channel.snippet.title,
      accountId: channel.id,
      profilePicture: channel.snippet.thumbnails?.default?.url || channel.snippet.thumbnails?.high?.url,
      accessToken: encryptToken(access_token),
      ...(refresh_token ? { refreshToken: encryptToken(refresh_token) } : {}),
      tokenExpiresAt,
      isConnected: true,
      status: 'ACTIVE',
      lastSyncedAt: new Date(),
      lastError: null,
      metadata: {
        subscriberCount: channel.statistics?.subscriberCount || '0',
        videoCount: channel.statistics?.videoCount || '0',
        viewCount: channel.statistics?.viewCount || '0',
        customUrl: channel.snippet?.customUrl || '',
        uploadsPlaylistId: channel.contentDetails?.relatedPlaylists?.uploads || '',
      },
    },
    create: {
      platform: 'YOUTUBE',
      pageId: channel.id,
      accountId: channel.id,
      accountName: channel.snippet.title,
      pageName: channel.snippet.title,
      profilePicture: channel.snippet.thumbnails?.default?.url || channel.snippet.thumbnails?.high?.url,
      accessToken: encryptToken(access_token),
      refreshToken: refresh_token ? encryptToken(refresh_token) : null,
      tokenExpiresAt,
      isConnected: true,
      status: 'ACTIVE',
      lastSyncedAt: new Date(),
      metadata: {
        subscriberCount: channel.statistics?.subscriberCount || '0',
        videoCount: channel.statistics?.videoCount || '0',
        viewCount: channel.statistics?.viewCount || '0',
        customUrl: channel.snippet?.customUrl || '',
        uploadsPlaylistId: channel.contentDetails?.relatedPlaylists?.uploads || '',
      },
    },
  });

  // Automatically trigger first sync
  await syncYouTubeVideos(account.id);

  return account;
}

export async function connectYouTubeWithApiKey(channelId: string, apiKey: string) {
  const keyToUse = apiKey || YOUTUBE_API_KEY;
  if (!keyToUse) throw new Error('YouTube API Key is required');

  const channelRes = await axios.get('https://www.googleapis.com/youtube/v3/channels', {
    params: {
      part: 'snippet,statistics,contentDetails',
      id: channelId,
      key: keyToUse,
    },
  });

  const channel = channelRes.data.items?.[0];
  if (!channel) throw new Error(`YouTube channel with ID ${channelId} not found.`);

  const account = await prisma.socialAccount.upsert({
    where: {
      platform_pageId: {
        platform: 'YOUTUBE',
        pageId: channel.id,
      },
    },
    update: {
      accountName: channel.snippet.title,
      pageName: channel.snippet.title,
      accountId: channel.id,
      profilePicture: channel.snippet.thumbnails?.default?.url,
      accessToken: encryptToken(keyToUse),
      isConnected: true,
      status: 'ACTIVE',
      lastSyncedAt: new Date(),
      lastError: null,
      metadata: {
        subscriberCount: channel.statistics?.subscriberCount || '0',
        videoCount: channel.statistics?.videoCount || '0',
        customUrl: channel.snippet?.customUrl || '',
        uploadsPlaylistId: channel.contentDetails?.relatedPlaylists?.uploads || '',
        authMethod: 'API_KEY',
      },
    },
    create: {
      platform: 'YOUTUBE',
      pageId: channel.id,
      accountId: channel.id,
      accountName: channel.snippet.title,
      pageName: channel.snippet.title,
      profilePicture: channel.snippet.thumbnails?.default?.url,
      accessToken: encryptToken(keyToUse),
      isConnected: true,
      status: 'ACTIVE',
      lastSyncedAt: new Date(),
      metadata: {
        subscriberCount: channel.statistics?.subscriberCount || '0',
        videoCount: channel.statistics?.videoCount || '0',
        customUrl: channel.snippet?.customUrl || '',
        uploadsPlaylistId: channel.contentDetails?.relatedPlaylists?.uploads || '',
        authMethod: 'API_KEY',
      },
    },
  });

  await syncYouTubeVideos(account.id);
  return account;
}

/**
 * Sync public videos, shorts & detect live broadcast from YouTube
 */
export async function syncYouTubeVideos(accountId?: string) {
  const account = accountId
    ? await prisma.socialAccount.findUnique({ where: { id: accountId } })
    : await prisma.socialAccount.findFirst({ where: { platform: 'YOUTUBE', isConnected: true } });

  if (!account || !account.pageId) {
    throw new Error('No connected YouTube account found.');
  }

  let accessToken = account.accessToken ? decryptToken(account.accessToken) : '';
  const channelId = account.pageId;
  const isApiKeyAuth = (account.metadata as any)?.authMethod === 'API_KEY';

  try {
    // If OAuth token is expired and refresh token is present, refresh it
    if (!isApiKeyAuth && account.tokenExpiresAt && account.tokenExpiresAt.getTime() < Date.now() + 60000 && account.refreshToken) {
      const refreshed = await axios.post(
        'https://oauth2.googleapis.com/token',
        new URLSearchParams({
          client_id: GOOGLE_CLIENT_ID,
          client_secret: GOOGLE_CLIENT_SECRET,
          refresh_token: decryptToken(account.refreshToken),
          grant_type: 'refresh_token',
        }).toString(),
        { headers: { 'Content-Type': 'application/x-www-form-urlencoded' } }
      );
      accessToken = refreshed.data.access_token;
      await prisma.socialAccount.update({
        where: { id: account.id },
        data: {
          accessToken: encryptToken(accessToken),
          tokenExpiresAt: new Date(Date.now() + (refreshed.data.expires_in || 3600) * 1000),
          status: 'ACTIVE',
        },
      });
    }

    // 1. Fetch channel stats for latest subscriber count
    const authHeaders = isApiKeyAuth ? {} : { Authorization: `Bearer ${accessToken}` };
    const authParams = isApiKeyAuth ? { key: accessToken } : {};

    const statsRes = await axios.get('https://www.googleapis.com/youtube/v3/channels', {
      params: { part: 'snippet,statistics', id: channelId, ...authParams },
      headers: authHeaders,
    });
    const channelStats = statsRes.data.items?.[0]?.statistics;
    if (channelStats) {
      await prisma.socialAccount.update({
        where: { id: account.id },
        data: {
          metadata: {
            ...(account.metadata as any),
            subscriberCount: channelStats.subscriberCount || '0',
            videoCount: channelStats.videoCount || '0',
            viewCount: channelStats.viewCount || '0',
          },
        },
      });
    }

    // 2. Fetch Latest 10 Videos
    const searchRes = await axios.get('https://www.googleapis.com/youtube/v3/search', {
      params: {
        part: 'snippet',
        channelId,
        maxResults: 10,
        order: 'date',
        type: 'video',
        ...authParams,
      },
      headers: authHeaders,
    });

    const items = searchRes.data.items || [];
    let syncedCount = 0;

    for (const item of items) {
      const videoId = item.id.videoId;
      const snippet = item.snippet;

      await prisma.socialPost.upsert({
        where: { id: `yt-${videoId}` },
        update: {
          caption: snippet.title,
          postUrl: `https://www.youtube.com/watch?v=${videoId}`,
          thumbnailUrl: snippet.thumbnails?.high?.url || snippet.thumbnails?.default?.url,
          mediaUrl: `https://www.youtube.com/embed/${videoId}`,
          mediaType: 'VIDEO',
          authorName: snippet.channelTitle || 'BN NEWS ગુજરાતી',
          publishedAt: new Date(snippet.publishedAt),
          isActive: true,
        },
        create: {
          id: `yt-${videoId}`,
          platform: 'YOUTUBE',
          postId: videoId,
          caption: snippet.title,
          postUrl: `https://www.youtube.com/watch?v=${videoId}`,
          thumbnailUrl: snippet.thumbnails?.high?.url || snippet.thumbnails?.default?.url,
          mediaUrl: `https://www.youtube.com/embed/${videoId}`,
          mediaType: 'VIDEO',
          authorName: snippet.channelTitle || 'BN NEWS ગુજરાતી',
          publishedAt: new Date(snippet.publishedAt),
          isActive: true,
        },
      });
      syncedCount++;

      // Also upsert into Video model so videos immediately appear in /videos page and Homepage Video Section
      const defaultVideoCategory = await prisma.videoCategory.findFirst();
      await prisma.video.upsert({
        where: { slug: `yt-${videoId}` },
        update: {
          title: snippet.title,
          titleGu: snippet.title,
          videoUrl: `https://www.youtube.com/watch?v=${videoId}`,
          thumbnailUrl: snippet.thumbnails?.high?.url || snippet.thumbnails?.default?.url,
          publishedAt: new Date(snippet.publishedAt),
          showOnHome: true,
          showOnVideos: true,
          status: 'PUBLISHED',
        },
        create: {
          title: snippet.title,
          titleGu: snippet.title,
          slug: `yt-${videoId}`,
          videoSource: 'YOUTUBE',
          videoUrl: `https://www.youtube.com/watch?v=${videoId}`,
          thumbnailUrl: snippet.thumbnails?.high?.url || snippet.thumbnails?.default?.url,
          categoryId: defaultVideoCategory?.id || null,
          duration: '05:00',
          showOnHome: true,
          showOnVideos: true,
          status: 'PUBLISHED',
          publishedAt: new Date(snippet.publishedAt),
        },
      }).catch((e) => console.warn('Video upsert warning:', e.message));
    }

    // 3. Detect Live Broadcast
    try {
      const liveRes = await axios.get('https://www.googleapis.com/youtube/v3/search', {
        params: {
          part: 'snippet',
          channelId,
          eventType: 'live',
          type: 'video',
          ...authParams,
        },
        headers: authHeaders,
      });

      const liveItem = liveRes.data.items?.[0];
      const liveSetting = await prisma.youTubeLiveSetting.findFirst();

      if (liveItem) {
        const liveVideoId = liveItem.id.videoId;
        if (liveSetting) {
          await prisma.youTubeLiveSetting.update({
            where: { id: liveSetting.id },
            data: {
              liveVideoId,
              isLive: true,
              streamTitle: liveItem.snippet.title,
              streamThumbnail: liveItem.snippet.thumbnails?.high?.url,
              channelId,
              fallbackEmbedUrl: `https://www.youtube.com/embed/live_stream?channel=${channelId}`,
            },
          });
        } else {
          await prisma.youTubeLiveSetting.create({
            data: {
              liveVideoId,
              isLive: true,
              streamTitle: liveItem.snippet.title,
              streamThumbnail: liveItem.snippet.thumbnails?.high?.url,
              channelId,
              fallbackEmbedUrl: `https://www.youtube.com/embed/live_stream?channel=${channelId}`,
            },
          });
        }
      } else if (liveSetting) {
        // If not actively streaming live, keep channel live stream embed URL
        await prisma.youTubeLiveSetting.update({
          where: { id: liveSetting.id },
          data: {
            channelId,
            fallbackEmbedUrl: `https://www.youtube.com/embed/live_stream?channel=${channelId}`,
          },
        });
      }
    } catch (liveErr: any) {
      console.warn('Live broadcast check warning:', liveErr.message);
    }

    await prisma.socialAccount.update({
      where: { id: account.id },
      data: {
        lastSyncedAt: new Date(),
        status: 'ACTIVE',
        lastError: null,
      },
    });

    await prisma.socialSyncLog.create({
      data: {
        platform: 'YOUTUBE',
        status: 'SUCCESS',
        message: `Successfully synchronized ${syncedCount} YouTube videos and updated Live broadcast status.`,
        itemsFetched: syncedCount,
      },
    });

    return { success: true, count: syncedCount };
  } catch (err: any) {
    const errMsg = err.response?.data?.error?.message || err.message;
    await prisma.socialAccount.update({
      where: { id: account.id },
      data: { status: 'ERROR', lastError: errMsg },
    });
    await prisma.socialSyncLog.create({
      data: {
        platform: 'YOUTUBE',
        status: 'FAILED',
        message: `YouTube sync error: ${errMsg}`,
        itemsFetched: 0,
      },
    });
    throw new Error(errMsg);
  }
}

// ==========================================
// 3. META (FACEBOOK & INSTAGRAM) OAUTH & SYNC
// ==========================================

export async function handleMetaOAuthCallback(code: string, state: string) {
  const verification = verifyOAuthState(state);
  if (!verification.valid) {
    throw new Error('OAuth State verification failed (Possible CSRF or Expired Request).');
  }

  const redirectUri = verification.data?.redirectUri || `${config.frontendUrl}/admin/social?callback=meta`;

  // 1. Exchange code for short-lived user token
  const tokenRes = await axios.get('https://graph.facebook.com/v20.0/oauth/access_token', {
    params: {
      client_id: META_APP_ID,
      client_secret: META_APP_SECRET,
      redirect_uri: redirectUri,
      code,
    },
  });
  const shortLivedToken = tokenRes.data.access_token;

  // 2. Exchange for 60-day Long-Lived Token
  const longLivedRes = await axios.get('https://graph.facebook.com/v20.0/oauth/access_token', {
    params: {
      grant_type: 'fb_exchange_token',
      client_id: META_APP_ID,
      client_secret: META_APP_SECRET,
      fb_exchange_token: shortLivedToken,
    },
  });
  const longLivedUserToken = longLivedRes.data.access_token;

  // 3. Retrieve Managed Facebook Pages & Connected Instagram Accounts
  const pagesRes = await axios.get('https://graph.facebook.com/v20.0/me/accounts', {
    params: {
      fields: 'id,name,access_token,category,picture{url},fan_count,instagram_business_account{id,username,name,profile_picture_url,followers_count}',
      access_token: longLivedUserToken,
    },
  });

  const pages = pagesRes.data.data || [];
  if (pages.length === 0) {
    throw new Error('No Facebook Pages found for this account. Ensure you are an Admin of a Page.');
  }

  // Auto-connect the first page or return list for admin selection
  const primaryPage = pages[0];
  const pageAccessToken = primaryPage.access_token; // Permanent page access token

  // Persist Facebook Page
  const fbAccount = await prisma.socialAccount.upsert({
    where: {
      platform_pageId: {
        platform: 'FACEBOOK',
        pageId: primaryPage.id,
      },
    },
    update: {
      accountId: primaryPage.id,
      accountName: primaryPage.name,
      pageName: primaryPage.name,
      profilePicture: primaryPage.picture?.data?.url,
      accessToken: encryptToken(pageAccessToken),
      isConnected: true,
      status: 'ACTIVE',
      lastSyncedAt: new Date(),
      lastError: null,
      metadata: {
        fanCount: primaryPage.fan_count || 0,
        category: primaryPage.category || '',
      },
    },
    create: {
      platform: 'FACEBOOK',
      pageId: primaryPage.id,
      accountId: primaryPage.id,
      accountName: primaryPage.name,
      pageName: primaryPage.name,
      profilePicture: primaryPage.picture?.data?.url,
      accessToken: encryptToken(pageAccessToken),
      isConnected: true,
      status: 'ACTIVE',
      lastSyncedAt: new Date(),
      metadata: {
        fanCount: primaryPage.fan_count || 0,
        category: primaryPage.category || '',
      },
    },
  });

  // If Instagram Professional is linked to this Facebook Page, connect it too!
  let igAccount = null;
  if (primaryPage.instagram_business_account) {
    const ig = primaryPage.instagram_business_account;
    igAccount = await prisma.socialAccount.upsert({
      where: {
        platform_pageId: {
          platform: 'INSTAGRAM',
          pageId: ig.id,
        },
      },
      update: {
        accountId: ig.id,
        accountName: `@${ig.username}`,
        pageName: ig.name || ig.username,
        profilePicture: ig.profile_picture_url,
        accessToken: encryptToken(pageAccessToken), // Page token has permission to access linked IG
        isConnected: true,
        status: 'ACTIVE',
        lastSyncedAt: new Date(),
        lastError: null,
        metadata: {
          username: ig.username,
          followersCount: ig.followers_count || 0,
          parentFacebookPageId: primaryPage.id,
        },
      },
      create: {
        platform: 'INSTAGRAM',
        pageId: ig.id,
        accountId: ig.id,
        accountName: `@${ig.username}`,
        pageName: ig.name || ig.username,
        profilePicture: ig.profile_picture_url,
        accessToken: encryptToken(pageAccessToken),
        isConnected: true,
        status: 'ACTIVE',
        lastSyncedAt: new Date(),
        metadata: {
          username: ig.username,
          followersCount: ig.followers_count || 0,
          parentFacebookPageId: primaryPage.id,
        },
      },
    });
  }

  // Trigger initial synchronization
  await syncFacebookFeed(fbAccount.id).catch(() => {});
  if (igAccount) {
    await syncInstagramMedia(igAccount.id).catch(() => {});
  }

  return { fbAccount, igAccount, pagesCount: pages.length };
}

/**
 * Manual Page Connect with Page ID & Permanent Access Token
 */
export async function connectMetaManually(platform: 'FACEBOOK' | 'INSTAGRAM', pageId: string, pageName: string, accessToken: string) {
  let fetchedPageName = pageName;
  let profilePicture: string | undefined = undefined;
  let linkedIg: any = null;

  try {
    if (platform === 'FACEBOOK') {
      const pageInfo = await axios.get(
        `https://graph.facebook.com/v20.0/${pageId}?fields=name,picture,instagram_business_account{id,username,name,profile_picture_url,followers_count}&access_token=${accessToken}`
      );
      if (pageInfo.data?.name) fetchedPageName = pageInfo.data.name;
      if (pageInfo.data?.picture?.data?.url) profilePicture = pageInfo.data.picture.data.url;
      if (pageInfo.data?.instagram_business_account) {
        linkedIg = pageInfo.data.instagram_business_account;
      }
    } else if (platform === 'INSTAGRAM') {
      const igInfo = await axios.get(
        `https://graph.facebook.com/v20.0/${pageId}?fields=id,username,name,profile_picture_url,followers_count&access_token=${accessToken}`
      );
      if (igInfo.data?.username) fetchedPageName = `@${igInfo.data.username}`;
      if (igInfo.data?.profile_picture_url) profilePicture = igInfo.data.profile_picture_url;
    }
  } catch (err: any) {
    console.warn('[Meta Direct] Graph API info fetch warning:', err.message);
  }

  const account = await prisma.socialAccount.upsert({
    where: {
      platform_pageId: {
        platform,
        pageId,
      },
    },
    update: {
      accountName: fetchedPageName,
      pageName: fetchedPageName,
      profilePicture,
      accessToken: encryptToken(accessToken),
      isConnected: true,
      status: 'ACTIVE',
      lastSyncedAt: new Date(),
      lastError: null,
    },
    create: {
      platform,
      pageId,
      accountId: pageId,
      accountName: fetchedPageName,
      pageName: fetchedPageName,
      profilePicture,
      accessToken: encryptToken(accessToken),
      isConnected: true,
      status: 'ACTIVE',
      lastSyncedAt: new Date(),
    },
  });

  // If a linked Instagram account exists on this Facebook Page, connect it automatically!
  if (linkedIg) {
    try {
      await prisma.socialAccount.upsert({
        where: {
          platform_pageId: {
            platform: 'INSTAGRAM',
            pageId: linkedIg.id,
          },
        },
        update: {
          accountId: linkedIg.id,
          accountName: `@${linkedIg.username}`,
          pageName: linkedIg.name || linkedIg.username,
          profilePicture: linkedIg.profile_picture_url,
          accessToken: encryptToken(accessToken),
          isConnected: true,
          status: 'ACTIVE',
          lastSyncedAt: new Date(),
          lastError: null,
          metadata: {
            username: linkedIg.username,
            followersCount: linkedIg.followers_count || 0,
            parentFacebookPageId: pageId,
          },
        },
        create: {
          platform: 'INSTAGRAM',
          pageId: linkedIg.id,
          accountId: linkedIg.id,
          accountName: `@${linkedIg.username}`,
          pageName: linkedIg.name || linkedIg.username,
          profilePicture: linkedIg.profile_picture_url,
          accessToken: encryptToken(accessToken),
          isConnected: true,
          status: 'ACTIVE',
          lastSyncedAt: new Date(),
          metadata: {
            username: linkedIg.username,
            followersCount: linkedIg.followers_count || 0,
            parentFacebookPageId: pageId,
          },
        },
      });
      await syncInstagramMedia().catch(() => {});
    } catch (igErr: any) {
      console.warn('[Meta Direct] Auto-sync linked Instagram warning:', igErr.message);
    }
  }

  if (platform === 'FACEBOOK') {
    await syncFacebookFeed(account.id).catch(() => {});
  } else {
    await syncInstagramMedia(account.id).catch(() => {});
  }

  return account;
}

/**
 * Sync Facebook Page Feed, Photos and Videos
 */
export async function syncFacebookFeed(accountId?: string) {
  const account = accountId
    ? await prisma.socialAccount.findUnique({ where: { id: accountId } })
    : await prisma.socialAccount.findFirst({ where: { platform: 'FACEBOOK', isConnected: true } });

  if (!account || !account.pageId || !account.accessToken) {
    throw new Error('No connected Facebook Page found.');
  }

  const pageId = account.pageId;
  const accessToken = decryptToken(account.accessToken);

  try {
    const feedRes = await axios.get(`https://graph.facebook.com/v20.0/${pageId}/published_posts`, {
      params: {
        fields: 'id,message,created_time,permalink_url,full_picture,attachments{media_type,url,subattachments}',
        limit: 12,
        access_token: accessToken,
      },
    });

    const posts = feedRes.data.data || [];
    let synced = 0;

    for (const p of posts) {
      const postId = p.id;
      const mediaType = p.attachments?.data?.[0]?.media_type === 'video' ? 'VIDEO' : 'POST';

      await prisma.socialPost.upsert({
        where: { id: `fb-${postId}` },
        update: {
          caption: p.message || '',
          postUrl: p.permalink_url || `https://facebook.com/${postId}`,
          thumbnailUrl: p.full_picture || null,
          mediaUrl: p.full_picture || null,
          mediaType,
          authorName: account.pageName || 'BN NEWS ગુજરાતી',
          publishedAt: p.created_time ? new Date(p.created_time) : new Date(),
          isActive: true,
        },
        create: {
          id: `fb-${postId}`,
          platform: 'FACEBOOK',
          postId,
          caption: p.message || '',
          postUrl: p.permalink_url || `https://facebook.com/${postId}`,
          thumbnailUrl: p.full_picture || null,
          mediaUrl: p.full_picture || null,
          mediaType,
          authorName: account.pageName || 'BN NEWS ગુજરાતી',
          publishedAt: p.created_time ? new Date(p.created_time) : new Date(),
          isActive: true,
        },
      });
      synced++;
    }

    await prisma.socialAccount.update({
      where: { id: account.id },
      data: { lastSyncedAt: new Date(), status: 'ACTIVE', lastError: null },
    });

    await prisma.socialSyncLog.create({
      data: {
        platform: 'FACEBOOK',
        status: 'SUCCESS',
        message: `Successfully synchronized ${synced} Facebook posts.`,
        itemsFetched: synced,
      },
    });

    return { success: true, count: synced };
  } catch (err: any) {
    const errMsg = err.response?.data?.error?.message || err.message;
    await prisma.socialAccount.update({
      where: { id: account.id },
      data: { status: 'ERROR', lastError: errMsg },
    });
    await prisma.socialSyncLog.create({
      data: {
        platform: 'FACEBOOK',
        status: 'FAILED',
        message: `Facebook sync error: ${errMsg}`,
        itemsFetched: 0,
      },
    });
    throw new Error(errMsg);
  }
}

/**
 * Sync Instagram Professional Media & Reels
 */
export async function syncInstagramMedia(accountId?: string) {
  const account = accountId
    ? await prisma.socialAccount.findUnique({ where: { id: accountId } })
    : await prisma.socialAccount.findFirst({ where: { platform: 'INSTAGRAM', isConnected: true } });

  if (!account || !account.pageId || !account.accessToken) {
    throw new Error('No connected Instagram account found.');
  }

  const igUserId = account.pageId;
  const accessToken = decryptToken(account.accessToken);

  try {
    const mediaRes = await axios.get(`https://graph.facebook.com/v20.0/${igUserId}/media`, {
      params: {
        fields: 'id,caption,media_type,media_url,thumbnail_url,permalink,timestamp,like_count,comments_count',
        limit: 12,
        access_token: accessToken,
      },
    });

    const mediaItems = mediaRes.data.data || [];
    let synced = 0;

    for (const m of mediaItems) {
      const isReel = m.media_type === 'VIDEO';
      const thumbnail = m.thumbnail_url || m.media_url;

      await prisma.socialPost.upsert({
        where: { id: `ig-${m.id}` },
        update: {
          caption: m.caption || '',
          postUrl: m.permalink || `https://instagram.com/p/${m.id}`,
          thumbnailUrl: thumbnail,
          mediaUrl: m.media_url,
          mediaType: isReel ? 'REEL' : 'POST',
          authorName: account.accountName || 'BN NEWS ગુજરાતી',
          publishedAt: m.timestamp ? new Date(m.timestamp) : new Date(),
          isActive: true,
          metadata: {
            likeCount: m.like_count || 0,
            commentsCount: m.comments_count || 0,
          },
        },
        create: {
          id: `ig-${m.id}`,
          platform: 'INSTAGRAM',
          postId: m.id,
          caption: m.caption || '',
          postUrl: m.permalink || `https://instagram.com/p/${m.id}`,
          thumbnailUrl: thumbnail,
          mediaUrl: m.media_url,
          mediaType: isReel ? 'REEL' : 'POST',
          authorName: account.accountName || 'BN NEWS ગુજરાતી',
          publishedAt: m.timestamp ? new Date(m.timestamp) : new Date(),
          isActive: true,
          metadata: {
            likeCount: m.like_count || 0,
            commentsCount: m.comments_count || 0,
          },
        },
      });
      synced++;
    }

    await prisma.socialAccount.update({
      where: { id: account.id },
      data: { lastSyncedAt: new Date(), status: 'ACTIVE', lastError: null },
    });

    await prisma.socialSyncLog.create({
      data: {
        platform: 'INSTAGRAM',
        status: 'SUCCESS',
        message: `Successfully synchronized ${synced} Instagram posts and Reels.`,
        itemsFetched: synced,
      },
    });

    return { success: true, count: synced };
  } catch (err: any) {
    const errMsg = err.response?.data?.error?.message || err.message;
    await prisma.socialAccount.update({
      where: { id: account.id },
      data: { status: 'ERROR', lastError: errMsg },
    });
    await prisma.socialSyncLog.create({
      data: {
        platform: 'INSTAGRAM',
        status: 'FAILED',
        message: `Instagram sync error: ${errMsg}`,
        itemsFetched: 0,
      },
    });
    throw new Error(errMsg);
  }
}

/**
 * Sync all connected social accounts
 */
export async function syncAllSocialAccounts() {
  const accounts = await prisma.socialAccount.findMany({ where: { isConnected: true } });
  const results: Record<string, any> = {};

  for (const acc of accounts) {
    try {
      if (acc.platform === 'YOUTUBE') {
        results.YOUTUBE = await syncYouTubeVideos(acc.id);
      } else if (acc.platform === 'FACEBOOK') {
        results.FACEBOOK = await syncFacebookFeed(acc.id);
      } else if (acc.platform === 'INSTAGRAM') {
        results.INSTAGRAM = await syncInstagramMedia(acc.id);
      }
    } catch (err: any) {
      results[acc.platform] = { error: err.message };
    }
  }

  return results;
}
