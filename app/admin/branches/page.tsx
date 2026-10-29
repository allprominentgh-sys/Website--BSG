
"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { supabaseBrowser } from "@/supabase-browser";

type Branch = {
  id: string;
  company_id: string;
  branch_code: string;
  branch_name: string;
  location: string;
  manager_name: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
};

type BranchForm = {
  company_id: string;
  branch_code: string;
  branch_name: string;
  location: string;
  manager_name: string;
};

const EMPTY_FORM: BranchForm = {
  company_id: "BSGH-HQ-0001",
  branch_code: "",
  branch_name: "",
  location: "",
  manager_name: "",
};

export default function BranchManagementPage() {
  const [branches, setBranches] = useState<Branch[]>([]);
  const [form, setForm] = useState<BranchForm>(EMPTY_FORM);
  const [editingId, setEditingId] = useState("");
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  const loadBranches = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const supabase = supabaseBrowser();
      const {
        data: { session },
        error: sessionError,
      } = await supabase.auth.getSession();

      if (sessionError) throw sessionError;

      if (!session?.access_token) {
        throw new Error("Please sign in before managing branches.");
      }

      const response = await fetch("/api/admin/branches", {
        method: "GET",
        headers: {
          Authorization: `Bearer ${session.access_token}`,
        },
        cache: "no-store",
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Unable to load branches.");
      }

      setBranches(result.branches ?? []);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Unable to load branches."
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadBranches();
  }, [loadBranches]);

  function updateField(field: keyof BranchForm, value: string) {
    setForm((previous) => ({ ...previous, [field]: value }));
  }

  function resetForm() {
    setForm(EMPTY_FORM);
    setEditingId("");
  }

  function generateBranchCode() {
    const prefix = form.branch_name
      .trim()
      .split(/\s+/)
      .filter(Boolean)
      .slice(0, 3)
      .map((word) => word.replace(/[^a-zA-Z0-9]/g, "").slice(0, 3))
      .filter(Boolean)
      .join("")
      .toUpperCase();

    const suggested = `BSG-${prefix || "BRANCH"}-${String(
      branches.length + 1
    ).padStart(3, "0")}`;

    setForm((previous) => ({ ...previous, branch_code: suggested }));
  }

  function startEditing(branch: Branch) {
    setEditingId(branch.id);
    setForm({
      company_id: branch.company_id,
      branch_code: branch.branch_code,
      branch_name: branch.branch_name,
      location: branch.location,
      manager_name: branch.manager_name ?? "",
    });
    setError("");
    setNotice("");
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  async function saveBranch(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSaving(true);
    setError("");
    setNotice("");

    try {
      const supabase = supabaseBrowser();
      const {
        data: { session },
        error: sessionError,
      } = await supabase.auth.getSession();

      if (sessionError) throw sessionError;

      if (!session?.access_token) {
        throw new Error("Please sign in again.");
      }

      const response = await fetch("/api/admin/branches", {
        method: editingId ? "PATCH" : "POST",
        headers: {
          Authorization: `Bearer ${session.access_token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...(editingId ? { id: editingId } : {}),
          company_id: form.company_id.trim(),
          branch_code: form.branch_code.trim().toUpperCase(),
          branch_name: form.branch_name.trim(),
          location: form.location.trim(),
          manager_name: form.manager_name.trim(),
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Unable to save branch.");
      }

      setNotice(
        editingId
          ? "Branch updated successfully."
          : "Branch created successfully."
      );

      resetForm();
      await loadBranches();
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Unable to save branch."
      );
    } finally {
      setSaving(false);
    }
  }

  async function toggleBranch(branch: Branch) {
    const nextActive = !branch.is_active;

    if (
      !window.confirm(
        `${nextActive ? "Activate" : "Deactivate"} ${branch.branch_name}?`
      )
    ) {
      return;
    }

    setError("");
    setNotice("");

    try {
      const supabase = supabaseBrowser();
      const {
        data: { session },
        error: sessionError,
      } = await supabase.auth.getSession();

      if (sessionError) throw sessionError;

      if (!session?.access_token) {
        throw new Error("Please sign in again.");
      }

      const response = await fetch("/api/admin/branches", {
        method: "PATCH",
        headers: {
          Authorization: `Bearer ${session.access_token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          id: branch.id,
          is_active: nextActive,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Unable to update branch status.");
      }

      setNotice("Branch status updated successfully.");
      await loadBranches();
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Unable to update branch status."
      );
    }
  }

  const visibleBranches = branches.filter((branch) => {
    const term = search.trim().toLowerCase();

    const matchesSearch =
      !term ||
      [
        branch.company_id,
        branch.branch_code,
        branch.branch_name,
        branch.location,
        branch.manager_name ?? "",
      ]
        .join(" ")
        .toLowerCase()
        .includes(term);

    const matchesStatus =
      statusFilter === "all" ||
      (statusFilter === "active" && branch.is_active) ||
      (statusFilter === "inactive" && !branch.is_active);

    return matchesSearch && matchesStatus;
  });

  const activeCount = branches.filter((branch) => branch.is_active).length;

  return (
    <main className="min-h-screen bg-slate-50 p-4 text-slate-900 sm:p-6 lg:p-8">
      <div className="mx-auto max-w-7xl">
        <header className="mb-8">
          <p className="font-bold uppercase tracking-widest text-blue-700">
            BEST SALES GHANA
          </p>
          <h1 className="mt-2 text-3xl font-black sm:text-4xl">
            Branch Management
          </h1>
          <p className="mt-3 text-slate-600">
            Register company branches, assign managers and maintain branch
            records.
          </p>

          <div className="mt-5 flex flex-wrap gap-3">
            <Link
              href="/admin"
              className="rounded-xl border border-slate-300 bg-white px-4 py-3 font-bold"
            >
              Back to Admin Dashboard
            </Link>
            <Link
              href="/admin/staff"
              className="rounded-xl border border-slate-300 bg-white px-4 py-3 font-bold"
            >
              Staff Management
            </Link>
            <button
              type="button"
              onClick={() => void loadBranches()}
              disabled={loading}
              className="rounded-xl bg-blue-700 px-4 py-3 font-bold text-white disabled:opacity-50"
            >
              {loading ? "Refreshing..." : "Refresh Branches"}
            </button>
          </div>
        </header>

        {error && (
          <div
            role="alert"
            className="mb-5 break-words rounded-xl border border-red-200 bg-red-50 p-4 text-red-800"
          >
            <strong>Error:</strong> {error}
          </div>
        )}

        {notice && (
          <div
            role="status"
            className="mb-5 rounded-xl border border-green-200 bg-green-50 p-4 text-green-800"
          >
            {notice}
          </div>
        )}

        <section className="mb-8 grid grid-cols-2 gap-3 lg:grid-cols-3">
          <StatCard label="Total Branches" value={branches.length} />
          <StatCard label="Active Branches" value={activeCount} />
          <StatCard
            label="Inactive Branches"
            value={branches.length - activeCount}
          />
        </section>

        <section className="mb-8 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-7">
          <h2 className="text-2xl font-black">
            {editingId ? "Edit Branch" : "Register a Branch"}
          </h2>
          <p className="mt-2 text-sm text-slate-600">
            Branch records are submitted to the existing company_branches
            database table.
          </p>

          <form onSubmit={saveBranch} className="mt-6 space-y-5">
            <div className="grid gap-5 sm:grid-cols-2">
              <Field label="Company ID">
                <input
                  value={form.company_id}
                  onChange={(e) => updateField("company_id", e.target.value)}
                  maxLength={100}
                  required
                  className="field-input"
                />
              </Field>

              <Field label="Branch name">
                <input
                  value={form.branch_name}
                  onChange={(e) => updateField("branch_name", e.target.value)}
                  maxLength={150}
                  placeholder="e.g. Kumasi Branch"
                  required
                  className="field-input"
                />
              </Field>

              <Field label="Branch code">
                <div className="flex gap-2">
                  <input
                    value={form.branch_code}
                    onChange={(e) => updateField("branch_code", e.target.value)}
                    maxLength={50}
                    placeholder="e.g. BSG-KSI-001"
                    required
                    className="field-input min-w-0 flex-1"
                  />
                  <button
                    type="button"
                    onClick={generateBranchCode}
                    className="rounded-xl bg-blue-100 px-3 font-bold text-blue-800"
                  >
                    Generate
                  </button>
                </div>
              </Field>

              <Field label="Branch location">
                <input
                  value={form.location}
                  onChange={(e) => updateField("location", e.target.value)}
                  maxLength={250}
                  placeholder="Town or full address"
                  required
                  className="field-input"
                />
              </Field>

              <Field label="Branch manager">
                <input
                  value={form.manager_name}
                  onChange={(e) => updateField("manager_name", e.target.value)}
                  maxLength={150}
                  placeholder="Manager name (optional)"
                  className="field-input"
                />
              </Field>
            </div>

            <div className="flex flex-wrap gap-3">
              <button
                type="submit"
                disabled={saving}
                className="rounded-xl bg-blue-800 px-6 py-3 font-bold text-white disabled:opacity-50"
              >
                {saving
                  ? "Saving..."
                  : editingId
                    ? "Save Changes"
                    : "Create Branch"}
              </button>
              <button
                type="button"
                onClick={resetForm}
                className="rounded-xl border border-slate-300 px-6 py-3 font-bold"
              >
                Clear Form
              </button>
            </div>
          </form>
        </section>

        <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="border-b border-slate-200 p-5 sm:p-6">
            <h2 className="text-2xl font-black">Company Branches</h2>
            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search branch, code, manager or location"
                className="field-input"
              />
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="field-input bg-white"
              >
                <option value="all">All branches</option>
                <option value="active">Active only</option>
                <option value="inactive">Inactive only</option>
              </select>
            </div>
          </div>

          {loading && branches.length === 0 ? (
            <p className="p-8 text-slate-500">Loading branches...</p>
          ) : visibleBranches.length === 0 ? (
            <p className="p-8 text-center text-slate-500">
              No branches found. Register your first branch above.
            </p>
          ) : (
            <div className="divide-y divide-slate-200">
              {visibleBranches.map((branch) => (
                <article key={branch.id} className="p-5 sm:p-6">
                  <div className="flex flex-wrap items-start justify-between gap-4">
                    <div className="min-w-0">
                      <p className="font-bold text-blue-800">
                        {branch.branch_code}
                      </p>
                      <h3 className="mt-1 text-lg font-black">
                        {branch.branch_name}
                      </h3>
                      <p className="mt-1 text-sm text-slate-600">
                        Company: {branch.company_id}
                      </p>
                      <p className="mt-1 text-sm text-slate-600">
                        Location: {branch.location}
                      </p>
                      <p className="mt-1 text-sm text-slate-600">
                        Manager: {branch.manager_name || "Not assigned"}
                      </p>
                    </div>

                    <span
                      className={`rounded-full px-3 py-1 text-sm font-bold ${
                        branch.is_active
                          ? "bg-green-100 text-green-800"
                          : "bg-slate-200 text-slate-700"
                      }`}
                    >
                      {branch.is_active ? "Active" : "Inactive"}
                    </span>
                  </div>

                  <div className="mt-4 flex flex-wrap gap-2">
                    <button
                      type="button"
                      onClick={() => startEditing(branch)}
                      className="rounded-lg border border-slate-300 px-4 py-2 font-semibold"
                    >
                      Edit Branch
                    </button>
                    <button
                      type="button"
                      onClick={() => void toggleBranch(branch)}
                      className="rounded-lg border border-blue-200 px-4 py-2 font-semibold text-blue-800"
                    >
                      {branch.is_active ? "Deactivate" : "Activate"}
                    </button>
                  </div>
                </article>
              ))}
            </div>
          )}
        </section>

        <footer className="py-8 text-center text-sm text-slate-500">
          BEST SALES GHANA · Branch Management
        </footer>
      </div>

      <style jsx>{`
        .field-input {
          width: 100%;
          border: 1px solid #cbd5e1;
          border-radius: 0.75rem;
          padding: 0.75rem 1rem;
          background: white;
          color: #0f172a;
        }
        .field-input:focus {
          outline: 2px solid #2563eb;
          outline-offset: 1px;
        }
      `}</style>
    </main>
  );
}

function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <label className="block text-sm font-bold">
      {label}
      <div className="mt-2">{children}</div>
    </label>
  );
}

function StatCard({
  label,
  value,
}: {
  label: string;
  value: number;
}) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <p className="text-sm text-slate-500">{label}</p>
      <p className="mt-2 text-3xl font-black">{value}</p>
    </div>
  );
}
