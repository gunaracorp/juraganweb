import { NextRequest } from "next/server";
import { db } from "@/lib/db";
import { json, unauthorized, requireAuth } from "@/lib/api-utils";

export async function GET(req: NextRequest) {
  const auth = requireAuth(req);
  if (!auth.ok) return unauthorized();

  const [posts, pages, portfolio, services, testimonials, messages, newMessages, subscribers, comments, pendingComments, media, users, activities] = await Promise.all([
    db.post.count(),
    db.page.count(),
    db.portfolio.count(),
    db.service.count(),
    db.testimonial.count(),
    db.message.count(),
    db.message.count({ where: { status: "new" } }),
    db.subscriber.count(),
    db.comment.count(),
    db.comment.count({ where: { status: "pending" } }),
    db.media.count(),
    db.admin.count(),
    db.activity.findMany({ orderBy: { createdAt: "desc" }, take: 10 }),
  ]);

  // Top posts by views
  const topPosts = await db.post.findMany({
    orderBy: { views: "desc" },
    take: 5,
    select: { id: true, titleId: true, titleEn: true, slug: true, views: true, category: true, published: true, createdAt: true },
  });

  // Recent posts
  const recentPosts = await db.post.findMany({
    orderBy: { createdAt: "desc" },
    take: 5,
    select: { id: true, titleId: true, titleEn: true, slug: true, status: true, published: true, createdAt: true },
  });

  // Recent pages
  const recentPages = await db.page.findMany({
    orderBy: { createdAt: "desc" },
    take: 5,
    select: { id: true, titleId: true, titleEn: true, slug: true, status: true, createdAt: true },
  });

  // Recent messages
  const recentMessages = await db.message.findMany({
    orderBy: { createdAt: "desc" },
    take: 5,
  });

  // Recent comments
  const recentComments = await db.comment.findMany({
    orderBy: { createdAt: "desc" },
    take: 5,
    include: { post: { select: { titleId: true, titleEn: true, slug: true } } },
  }).catch(async () => db.comment.findMany({
    orderBy: { createdAt: "desc" },
    take: 5,
  }));

  // Views over last 30 days (aggregate from post views)
  const totalViews = await db.post.aggregate({ _sum: { views: true } });

  return json({
    ok: true,
    stats: {
      posts, pages, portfolio, services, testimonials,
      messages, newMessages, subscribers,
      comments, pendingComments, media, users,
      totalViews: totalViews._sum.views || 0,
    },
    topPosts,
    recentPosts,
    recentPages,
    recentMessages,
    recentComments,
    activities,
  });
}
