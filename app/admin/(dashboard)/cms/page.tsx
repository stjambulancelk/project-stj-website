import prisma from "@/lib/db";
import { formatDateTime } from "@/lib/utils";
import CmsEditor from "./CmsEditor";

const CMS_SECTIONS = [
  { id: "home_hero", label: "Home — Hero Headline" },
  { id: "home_tagline", label: "Home — Sub-tagline" },
  { id: "about_story", label: "About — Our Story" },
  { id: "services_intro", label: "Services — Intro paragraph" },
  { id: "contact_note", label: "Contact — Extra note" },
];

async function getSections() {
  const rows = await prisma.cmsContent.findMany({ where: { id: { in: CMS_SECTIONS.map(s => s.id) } } });
  return Object.fromEntries(rows.map(r => [r.id, r]));
}

export default async function CmsPage() {
  const saved = await getSections();

  return (
    <div className="p-6 space-y-6 max-w-2xl">
      <div>
        <h1 className="text-headline-sm text-white font-bold">Content Management</h1>
        <p className="text-slate-400 text-xs mt-1">Edit public-facing text sections. Changes go live immediately.</p>
      </div>

      <div className="space-y-4">
        {CMS_SECTIONS.map(section => (
          <div key={section.id} className="rounded-2xl bg-navy-900 border border-navy-800 p-5">
            <div className="flex items-center justify-between mb-3">
              <p className="text-sm font-semibold text-slate-200">{section.label}</p>
              {saved[section.id]?.updatedAt && (
                <p className="text-xs text-slate-500">Saved {formatDateTime(saved[section.id].updatedAt)}</p>
              )}
            </div>
            <CmsEditor
              sectionId={section.id}
              initialTitle={saved[section.id]?.title ?? ""}
              initialBody={saved[section.id]?.body ?? ""}
            />
          </div>
        ))}
      </div>
    </div>
  );
}
