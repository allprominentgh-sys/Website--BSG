"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";

type CMSPageData = {
  id?: number;
  title: string;
  slug: string;
  content: string;
  published: boolean;
  updated_at?: string;
};

const defaultPages: CMSPageData[] = [
  {
    title: "About Us",
    slug: "about",
    published: false,
    content:
      "BEST SALES GHANA is a marketplace operated by All Prominent Ghana Limited. Our platform connects buyers, sellers and businesses across Ghana.",
  },
  {
    title: "Contact Us",
    slug: "contact",
    published: false,
    content:
      "Contact BEST SALES GHANA for enquiries, account assistance, marketplace support and business partnerships.\n\nEmail: info@bestsalesgh.com\n\nAdd your official business phone number and address before publishing.",
  },
  {
    title: "Privacy Policy",
    slug: "privacy-policy",
    published: false,
    content:
      "Add your complete privacy policy here. Explain the personal information collected, how it is used and protected, how long it is retained, and how users can exercise their rights. Review before publishing.",
  },
  {
    title: "Terms & Conditions",
    slug: "terms",
    published: false,
    content:
      "Add your complete terms and conditions here, including rules for buyers and sellers, listings, advertising, payments, disputes, account termination and liability. Review before publishing.",
  },
  {
    title: "Homepage",
    slug: "home",
    published: false,
    content:
      "Welcome to BEST SALES GHANA — Buy, Sell, Advertise and Connect. Ghana's marketplace for products, vehicles, property, services, machinery, equipment and business opportunities.",
  },
];

export default function CMSPage() {
  const [pages, setPages] = useState<CMSPageData[]>([]);
  const [selectedSlug, setSelectedSlug] = useState("about");
  const [notice, setNotice] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const loadPages = useCallback(async () => {
    setLoading(true);
    setNotice("");

    try {
      const response = await fetch("/api/admin/cms", {
        method: "GET",
        cache: "no-store",
        credentials: "same-origin",
      });

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(
          result.message || "Could not load CMS pages. Check your admin session."
        );
      }

      const savedPages = Array.isArray(result.pages)
        ? (result.pages as CMSPageData[])
        : [];

      const mergedPages = defaultPages.map((defaultPage) => {
        const savedPage = savedPages.find(
          (page) => page.slug === defaultPage.slug
        );

        return savedPage
          ? { ...defaultPage, ...savedPage }
          : defaultPage;
      });

      setPages(mergedPages);
    } catch (error) {
      setNotice(
        error instanceof Error
          ? error.message
          : "Unable to connect to the CMS."
      );
      setPages(defaultPages);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadPages();
  }, [loadPages]);

  const selectedPage =
    pages.find((page) => page.slug === selectedSlug) ?? pages[0];

  function updateSelected(
    field: "title" | "content",
    value: string
  ) {
    setPages((current) =>
      current.map((page) =>
        page.slug === selectedSlug
          ? { ...page, [field]: value }
          : page
      )
    );

    setNotice("");
  }

  async function saveSelected(publish: boolean) {
    if (!selectedPage) return;

    if (!selectedPage.title.trim()) {
      setNotice("Enter a page title before saving.");
      return;
    }

    setSaving(true);
    setNotice("");

    try {
      const response = await fetch("/api/admin/cms", {
        method: "POST",
        credentials: "same-origin",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          slug: selectedPage.slug,
          title: selectedPage.title.trim(),
          content: selectedPage.content,
          published: publish,
        }),
      });

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.message || "Unable to save this page.");
      }

      if (result.page) {
        setPages((current) =>
          current.map((page) =>
            page.slug === selectedSlug
              ? { ...page, ...result.page }
              : page
          )
        );
      }

      setNotice(
        publish
          ? "Page published in Supabase. Public pages will show it once connected to the CMS."
          : "Draft saved successfully in Supabase."
      );
    } catch (error) {
      setNotice(
        error instanceof Error
          ? error.message
          : "An unexpected error occurred."
      );
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <main className="min-h-screen bg-slate-100 p-6 text-slate-900">
        Loading Content Management System...
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-slate-100 text-slate-900">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-4 px-4 py-5 sm:px-6 lg:px-8">
          <div>
            <p className="text-sm font-bold text-blue-700">
              BEST SALES GHANA
            </p>
            <h1 className="mt-1 text-2xl font-black">
              Content Management System
            </h1>
            <p className="mt-1 text-sm text-slate-500">
              Manage and publish website content.
            </p>
          </div>

          <Link
            href="/admin"
            className="rounded-xl border border-slate-300 bg-white px-4 py-3 font-bold hover:bg-slate-50"
          >
            ← Back to Admin
          </Link>
        </div>
      </header>

      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <section className="mb-6 rounded-2xl border border-blue-200 bg-blue-50 p-4 text-sm leading-6 text-blue-900">
          Drafts and publishing status are stored in Supabase.
          Publishing a page here does not automatically connect it to
          its public website route; that is the next step.
        </section>

        {notice && (
          <div
            role="status"
            className="mb-6 rounded-xl border border-slate-200 bg-white p-4 text-sm"
          >
            {notice}
          </div>
        )}

        <div className="grid gap-6 lg:grid-cols-[280px_minmax(0,1fr)]">
          <aside className="h-fit rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
            <h2 className="mb-4 text-lg font-black">Website Pages</h2>

            <div className="space-y-2">
              {pages.map((page) => (
                <button
                  key={page.slug}
                  type="button"
                  onClick={() => {
                    setSelectedSlug(page.slug);
                    setNotice("");
                  }}
                  className={`w-full rounded-xl border p-3 text-left ${
                    selectedSlug === page.slug
                      ? "border-blue-700 bg-blue-50 text-blue-900"
                      : "border-slate-200 hover:bg-slate-50"
                  }`}
                >
                  <span className="block font-bold">{page.title}</span>
                  <span className="mt-1 block text-xs text-slate-500">
                    {page.slug === "home" ? "/" : `/${page.slug}`}
                  </span>
                  <span className="mt-2 block text-xs font-semibold">
                    {page.published ? "Published" : "Draft / unpublished"}
                  </span>
                </button>
              ))}
            </div>
          </aside>

          <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-7">
            {selectedPage && (
              <>
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <p className="text-sm font-bold uppercase tracking-wider text-blue-700">
                      Page editor
                    </p>
                    <h2 className="mt-1 text-2xl font-black">
                      {selectedPage.title}
                    </h2>
                  </div>

                  <span
                    className={`rounded-full px-3 py-1 text-xs font-bold ${
                      selectedPage.published
                        ? "bg-green-100 text-green-800"
                        : "bg-slate-100 text-slate-600"
                    }`}
                  >
                    {selectedPage.published ? "Published" : "Unpublished"}
                  </span>
                </div>

                <div className="mt-6 space-y-5">
                  <div>
                    <label
                      htmlFor="page-title"
                      className="mb-2 block text-sm font-bold"
                    >
                      Page title
                    </label>
                    <input
                      id="page-title"
                      value={selectedPage.title}
                      onChange={(event) =>
                        updateSelected("title", event.target.value)
                      }
                      maxLength={150}
                      className="w-full rounded-xl border border-slate-300 p-3 outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-100"
                    />
                  </div>

                  <div>
                    <label
                      htmlFor="page-slug"
                      className="mb-2 block text-sm font-bold"
                    >
                      Page address
                    </label>
                    <input
                      id="page-slug"
                      value={
                        selectedPage.slug === "home"
                          ? "/"
                          : `/${selectedPage.slug}`
                      }
                      readOnly
                      className="w-full rounded-xl border border-slate-200 bg-slate-50 p-3 text-slate-500"
                    />
                  </div>

                  <div>
                    <label
                      htmlFor="page-content"
                      className="mb-2 block text-sm font-bold"
                    >
                      Page content
                    </label>
                    <textarea
                      id="page-content"
                      value={selectedPage.content}
                      onChange={(event) =>
                        updateSelected("content", event.target.value)
                      }
                      rows={14}
                      maxLength={30000}
                      placeholder="Enter the content for this page..."
                      className="w-full rounded-xl border border-slate-300 p-3 leading-7 outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-100"
                    />
                    <p className="mt-1 text-xs text-slate-500">
                      {selectedPage.content.length} / 30,000 characters
                    </p>
                  </div>
                </div>

                <div className="mt-6 flex flex-wrap gap-3">
                  <button
                    type="button"
                    disabled={saving}
                    onClick={() => void saveSelected(false)}
                    className="rounded-xl border border-blue-700 px-5 py-3 font-bold text-blue-700 hover:bg-blue-50 disabled:opacity-50"
                  >
                    {saving ? "Saving..." : "Save Draft"}
                  </button>

                  <button
                    type="button"
                    disabled={saving}
                    onClick={() => void saveSelected(true)}
                    className="rounded-xl bg-blue-700 px-5 py-3 font-bold text-white hover:bg-blue-800 disabled:opacity-50"
                  >
                    {saving ? "Saving..." : "Publish Page"}
                  </button>

                  <button
                    type="button"
                    disabled={saving || !selectedPage.published}
                    onClick={() => void saveSelected(false)}
                    className="rounded-xl border border-red-200 px-5 py-3 font-bold text-red-700 hover:bg-red-50 disabled:opacity-50"
                  >
                    Unpublish
                  </button>

                  <button
                    type="button"
                    onClick={() => window.print()}
                    className="rounded-xl border border-slate-300 px-5 py-3 font-bold hover:bg-slate-50"
                  >
                    Print / Preview
                  </button>

                  <button
                    type="button"
                    disabled={saving}
                    onClick={() => void loadPages()}
                    className="rounded-xl border border-slate-300 px-5 py-3 font-bold hover:bg-slate-50 disabled:opacity-50"
                  >
                    Reload from Database
                  </button>
                </div>

                <div className="mt-8 border-t border-slate-200 pt-6">
                  <h3 className="text-lg font-black">Content Preview</h3>
                  <article className="mt-4 rounded-xl border border-slate-200 bg-slate-50 p-5">
                    <h4 className="text-2xl font-black">
                      {selectedPage.title}
                    </h4>
                    <div className="mt-4 whitespace-pre-wrap break-words leading-7 text-slate-700">
                      {selectedPage.content}
                    </div>
                  </article>
                </div>
              </>
            )}
          </section>
        </div>

        <footer className="mt-10 border-t border-slate-200 py-6 text-center text-sm text-slate-500">
          BEST SALES GHANA — CONTENT MANAGEMENT
          <p className="mt-2">
            © {new Date().getFullYear()} All Prominent Ghana Limited.
          </p>
        </footer>
      </div>
    </main>
  );
}

