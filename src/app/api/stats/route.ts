import { NextRequest } from "next/server";
import { db } from "@/lib/db";
import { json, unauthorized, requireAuth } from "@/lib/api-utils";

export async function GET(req: NextRequest) {
  const auth = requireAuth(req);
  if (!auth.ok) return unauthorized();
  const [posts, pages, portfolio, newMessages, subscribers, pendingComments, media, users] = await Promise.all([
    db.post.count(),
    db.page.count(),
    db.portfolio.count(),
    db.message.count({ where: { status: "new" } }),
    db.subscriber.count(),
    db.comment.count({ where: { status: "pending" } }),
    db.media.count(),
    db.admin.count(),
  ]);
  return json({ ok: true, stats: { posts, pages, portfolio, newMessages, subscribers, pendingComments, media, users } });
}
