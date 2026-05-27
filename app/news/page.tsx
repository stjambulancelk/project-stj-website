import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { HiArrowRight, HiCalendar } from "react-icons/hi";
import { SITE } from "@/lib/constants";
import prisma from "@/lib/db";
import { formatDate } from "@/lib/utils";

export const metadata: Metadata = {
  title: "News & Updates | STJ Southern Ambulance",
  description: "Latest news, community updates, and announcements from STJ Southern Ambulance — Galle, Sri Lanka.",
};

export const revalidate = 60;

async function getPosts() {
  try {
    return await prisma.newsPost.findMany({
      where: { isPublished: true },
      orderBy: { publishedAt: "desc" },
      take: 20,
      select: {
        id: true,
        slug: true,
        title: true,
        excerpt: true,
        imageUrl: true,
        publishedAt: true,
      },
    });
  } catch {
    return [];
  }
}

export default async function NewsPage() {
  const posts = await getPosts();

  return (
    <div className="bg-surface dark:bg-navy-950 min-h-screen">

      {/* Hero */}
      <section className="py-20 bg-navy-gradient text-white">
        <div className="container-main text-center">
          <p className="text-label-sm uppercase text-emerald-400 mb-3">Stay Informed</p>
          <h1 className="text-display-md font-bold mb-3">News &amp; Updates</h1>
          <p className="text-slate-300 text-body-md max-w-xl mx-auto">
            Community events, training announcements, and updates from the STJ Southern Ambulance team.
          </p>
        </div>
      </section>

      <section className="py-16">
        <div className="container-main">
          {posts.length === 0 ? (
            /* Empty state */
            <div className="text-center py-24">
              <div className="w-16 h-16 rounded-2xl bg-emerald-500/10 flex items-center justify-center mx-auto mb-5">
                <HiCalendar className="text-2xl text-emerald-600 dark:text-emerald-400" />
              </div>
              <h2 className="text-headline-sm text-navy-950 dark:text-white mb-3">No posts yet</h2>
              <p className="text-slate-500 dark:text-slate-400 text-sm max-w-sm mx-auto mb-8">
                Check back soon — we&apos;ll be posting community news, training dates, and service updates here.
              </p>
              <div className="flex flex-wrap justify-center gap-3">
                <Link href="/services" className="btn-primary">
                  <HiArrowRight /> Our Services
                </Link>
                <Link href="/contact" className="btn-ghost">Contact Us</Link>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-7">
              {posts.map((post) => (
                <Link
                  key={post.id}
                  href={`/news/${post.slug}`}
                  className="glass-card rounded-2xl overflow-hidden group hover:shadow-glass-lg transition-all"
                >
                  {post.imageUrl ? (
                    <div className="relative h-48 overflow-hidden">
                      <Image
                        src={post.imageUrl}
                        alt={post.title}
                        fill
                        className="object-cover group-hover:scale-105 transition-transform duration-500"
                        sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
                      />
                    </div>
                  ) : (
                    <div className="h-48 bg-navy-gradient flex items-center justify-center">
                      <span className="text-4xl font-bold text-white/10">{SITE.name[0]}</span>
                    </div>
                  )}
                  <div className="p-5">
                    <h3 className="text-body-md font-semibold text-navy-950 dark:text-white mb-2 line-clamp-2 group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
                      {post.title}
                    </h3>
                    {post.excerpt && (
                      <p className="text-slate-500 dark:text-slate-400 text-xs leading-relaxed line-clamp-2 mb-3">{post.excerpt}</p>
                    )}
                    {post.publishedAt && (
                      <p className="text-slate-400 dark:text-slate-500 text-xs flex items-center gap-1.5">
                        <HiCalendar className="text-sm" />
                        {formatDate(post.publishedAt)}
                      </p>
                    )}
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
