import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import prisma from "@/lib/db";
import { verifyToken, SESSION_COOKIE } from "@/lib/auth";
import { slugify } from "@/lib/utils";

async function getSession() {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE)?.value;
  return token ? verifyToken(token) : null;
}

export async function POST(request: NextRequest) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await request.json();
  const { title, excerpt, body: postBody, imageUrl, imageAlt, isPublished } = body;

  if (!title?.trim() || !postBody?.trim()) {
    return NextResponse.json({ error: "Title and body are required" }, { status: 400 });
  }

  let slug = slugify(title);
  const conflict = await prisma.newsPost.findUnique({ where: { slug } });
  if (conflict) slug = `${slug}-${Date.now().toString(36)}`;

  const post = await prisma.newsPost.create({
    data: {
      slug,
      title: title.trim(),
      excerpt: excerpt?.trim() || null,
      body: postBody.trim(),
      imageUrl: imageUrl?.trim() || null,
      imageAlt: imageAlt?.trim() || null,
      isPublished: !!isPublished,
      publishedAt: isPublished ? new Date() : null,
      createdBy: session.userId,
    },
  });

  return NextResponse.json(post, { status: 201 });
}
