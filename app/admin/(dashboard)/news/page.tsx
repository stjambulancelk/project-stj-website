import Link from "next/link";
import { HiPlus, HiPencil } from "react-icons/hi";
import prisma from "@/lib/db";
import { formatDate } from "@/lib/utils";
import NewsToggle from "./NewsToggle";

async function getPosts() {
  return prisma.newsPost.findMany({
    orderBy: { createdAt: "desc" },
    take: 30,
    select: { id: true, title: true, slug: true, isPublished: true, publishedAt: true, createdAt: true },
  });
}

export default async function AdminNewsPage() {
  const posts = await getPosts();

  return (
    <div className="p-6 space-y-5">
      <div className="flex items-center justify-between">
        <h1 className="text-headline-sm text-white font-bold">News Posts</h1>
        <Link
          href="/admin/news/new"
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-sm font-semibold transition-colors"
        >
          <HiPlus /> New Post
        </Link>
      </div>

      <div className="rounded-2xl bg-navy-900 border border-navy-800 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-navy-800">
                {["Title", "Status", "Published", "Created", ""].map(h => (
                  <th key={h} className="text-left px-5 py-3 text-xs text-slate-400 uppercase tracking-wide font-medium">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-navy-800">
              {posts.length === 0 && (
                <tr><td colSpan={5} className="px-5 py-10 text-center text-slate-500 text-sm">No posts yet — create your first one</td></tr>
              )}
              {posts.map(p => (
                <tr key={p.id} className="hover:bg-navy-800/50">
                  <td className="px-5 py-3.5 text-slate-200 text-sm font-medium max-w-xs truncate">{p.title}</td>
                  <td className="px-5 py-3.5">
                    <NewsToggle postId={p.id} isPublished={p.isPublished} />
                  </td>
                  <td className="px-5 py-3.5 text-slate-500 text-xs">
                    {p.publishedAt ? formatDate(p.publishedAt) : "—"}
                  </td>
                  <td className="px-5 py-3.5 text-slate-500 text-xs">{formatDate(p.createdAt)}</td>
                  <td className="px-5 py-3.5">
                    <Link href={`/admin/news/${p.id}/edit`} className="text-slate-400 hover:text-emerald-400 transition-colors">
                      <HiPencil />
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
