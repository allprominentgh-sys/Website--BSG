
"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { supabaseBrowser } from "@/supabase-browser";

type Staff = {
  id: string;
  staff_number: string;
  full_name: string;
  department: string;
  job_title: string;
  phone: string | null;
  email: string | null;
  start_date: string | null;
  status: "active" | "inactive" | "suspended";
  notes: string | null;
  created_at: string;
};

const departments = [
  "Customer Support Centre",
  "Marketing Team",
  "Advertisers",
  "Company Drivers",
  "Sales Team",
  "Delivery Team",
  "Operations",
  "Finance",
  "IT & Technical",
  "Management",
  "Other",
];

const emptyForm = {
  staff_number: "",
  full_name: "",
  department: "Customer Support Centre",
  job_title: "",
  phone: "",
  email: "",
  start_date: "",
  status: "active" as Staff["status"],
  notes: "",
};

export default function StaffManagementPage() {
  const [staff, setStaff] = useState<Staff[]>([]);
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState("");
  const [search, setSearch] = useState("");
  const [departmentFilter, setDepartmentFilter] = useState("All");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  const loadStaff = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const supabase = supabaseBrowser();
      const {
        data: { session },
        error: authError,
      } = await supabase.auth.getSession();

      if (authError) throw authError;

      if (!session?.access_token) {
        throw new Error(
          "Please sign in to BestSalesGH before managing staff."
        );
      }

      const response = await fetch("/api/admin/staff", {
        headers: {
          Authorization: `Bearer ${session.access_token}`,
        },
        cache: "no-store",
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Unable to load staff.");
      }

      setStaff(result.staff ?? []);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Unable to load staff."
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadStaff();
  }, [loadStaff]);

  function updateField(
    field: keyof typeof emptyForm,
    value: string
  ) {
    setForm((previous) => ({ ...previous, [field]: value }));
  }

  function generateStaffNumber() {
    const prefixes: Record<string, string> = {
      "Customer Support Centre": "SUP",
      "Marketing Team": "MKT",
      Advertisers: "ADV",
      "Company Drivers": "DRV",
      "Sales Team": "SAL",
      "Delivery Team": "DEL",
      Operations: "OPS",
      Finance: "FIN",
      "IT & Technical": "IT",
      Management: "MGT",
      Other: "OTH",
    };

    const prefix = prefixes[form.department] || "OTH";
    const matchingNumbers = staff
      .filter((person) => person.staff_number.startsWith(`BSG-${prefix}-`))
      .map((person) => {
        const match = person.staff_number.match(/-(\d+)$/);
        return match ? Number(match[1]) : 0;
      });

    const nextNumber =
      matchingNumbers.length > 0
        ? Math.max(...matchingNumbers) + 1
        : 1;

    setForm((previous) => ({
      ...previous,
      staff_number: `BSG-${prefix}-${String(nextNumber).padStart(3, "0")}`,
    }));
  }

  function startEditing(person: Staff) {
    setEditingId(person.id);
    setForm({
      staff_number: person.staff_number,
      full_name: person.full_name,
      department: person.department,
      job_title: person.job_title,
      phone: person.phone || "",
      email: person.email || "",
      start_date: person.start_date || "",
      status: person.status,
      notes: person.notes || "",
    });
    setNotice("");
    setError("");
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function resetForm() {
    setEditingId("");
    setForm(emptyForm);
  }

  async function saveStaff(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSaving(true);
    setError("");
    setNotice("");

    try {
      const supabase = supabaseBrowser();
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session?.access_token) {
        throw new Error("Please sign in again.");
      }

      const response = await fetch("/api/admin/staff", {
        method: editingId ? "PATCH" : "POST",
        headers: {
          Authorization: `Bearer ${session.access_token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...(editingId ? { id: editingId } : {}),
          ...form,
          staff_number: form.staff_number.trim().toUpperCase(),
          full_name: form.full_name.trim(),
          job_title: form.job_title.trim(),
          phone: form.phone.trim() || null,
          email: form.email.trim() || null,
          start_date: form.start_date || null,
          notes: form.notes.trim() || null,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Unable to save staff record.");
      }

      setNotice(
        editingId
          ? "Staff record updated successfully."
          : "Staff member registered successfully."
      );

      resetForm();
      await loadStaff();
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Unable to save staff."
      );
    } finally {
      setSaving(false);
    }
  }

  async function changeStatus(person: Staff) {
    const nextStatus: Staff["status"] =
      person.status === "active" ? "inactive" : "active";

    if (
      !window.confirm(
        `Change ${person.full_name}'s status to ${nextStatus}?`
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
      } = await supabase.auth.getSession();

      if (!session?.access_token) {
        throw new Error("Please sign in again.");
      }

      const response = await fetch("/api/admin/staff", {
        method: "PATCH",
        headers: {
          Authorization: `Bearer ${session.access_token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          id: person.id,
          status: nextStatus,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Unable to update status.");
      }

      setNotice("Staff status updated.");
      await loadStaff();
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Status update failed."
      );
    }
  }

  const visibleStaff = staff.filter((person) => {
    const term = search.trim().toLowerCase();

    const matchesSearch =
      !term ||
      [
        person.staff_number,
        person.full_name,
        person.department,
        person.job_title,
        person.phone,
        person.email,
      ]
        .filter(Boolean)
        .some((value) => String(value).toLowerCase().includes(term));

    const matchesDepartment =
      departmentFilter === "All" ||
      person.department === departmentFilter;

    return matchesSearch && matchesDepartment;
  });

  const activeCount = staff.filter((person) => person.status === "active").length;
  const inactiveCount = staff.filter((person) => person.status === "inactive").length;
  const suspendedCount = staff.filter((person) => person.status === "suspended").length;

  return (
    <main className="min-h-screen bg-slate-50 p-4 text-slate-900 md:p-8">
      <div className="mx-auto max-w-7xl">
        <header className="mb-7">
          <p className="font-semibold text-blue-700">BESTSALESGH ADMINISTRATION</p>
          <h1 className="mt-2 text-3xl font-bold md:text-4xl">
            Staff Management
          </h1>
          <p className="mt-2 text-slate-600">
            Register employees, create staff numbers and manage departments.
          </p>

          <div className="mt-5 flex flex-wrap gap-3">
            <Link
              href="/admin"
              className="rounded-lg border border-slate-300 bg-white px-4 py-3 font-semibold"
            >
              Back to Admin Dashboard
            </Link>
            <Link
              href="/admin/support"
              className="rounded-lg bg-blue-700 px-4 py-3 font-semibold text-white"
            >
              Customer Support Centre
            </Link>
            <button
              type="button"
              onClick={() => void loadStaff()}
              disabled={loading}
              className="rounded-lg border border-slate-300 bg-white px-4 py-3 font-semibold disabled:opacity-50"
            >
              {loading ? "Refreshing..." : "Refresh Staff"}
            </button>
          </div>
        </header>

        {error && (
          <div role="alert" className="mb-5 break-words rounded-xl border border-red-200 bg-red-50 p-4 text-red-800">
            <strong>Notice:</strong> {error}
          </div>
        )}

        {notice && (
          <div className="mb-5 rounded-xl border border-green-200 bg-green-50 p-4 text-green-800">
            {notice}
          </div>
        )}

        <section className="mb-7 grid grid-cols-2 gap-3 md:grid-cols-4">
          {[
            ["Total Staff", staff.length],
            ["Active", activeCount],
            ["Inactive", inactiveCount],
            ["Suspended", suspendedCount],
          ].map(([label, count]) => (
            <div key={String(label)} className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
              <p className="text-sm text-slate-500">{label}</p>
              <p className="mt-2 text-3xl font-bold">{count}</p>
            </div>
          ))}
        </section>

        <section className="mb-8 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm md:p-7">
          <h2 className="text-2xl font-bold">
            {editingId ? "Edit Staff Member" : "Register New Staff Member"}
          </h2>
          <p className="mt-2 text-sm text-slate-600">
            Generate a suggested number or enter your own unique staff number.
          </p>

          <form onSubmit={saveStaff} className="mt-6 space-y-5">
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <label className="mb-1 block text-sm font-semibold">Department</label>
                <select
                  value={form.department}
                  onChange={(e) => updateField("department", e.target.value)}
                  className="w-full rounded-lg border border-slate-300 bg-white px-3 py-3"
                  required
                >
                  {departments.map((department) => (
                    <option key={department} value={department}>{department}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="mb-1 block text-sm font-semibold">Staff ID / Number</label>
                <div className="flex gap-2">
                  <input
                    value={form.staff_number}
                    onChange={(e) => updateField("staff_number", e.target.value)}
                    placeholder="e.g. BSG-SUP-001"
                    className="min-w-0 flex-1 rounded-lg border border-slate-300 px-3 py-3 uppercase"
                    required
                  />
                  <button
                    type="button"
                    onClick={generateStaffNumber}
                    className="rounded-lg bg-blue-700 px-3 py-3 font-semibold text-white"
                  >
                    Generate
                  </button>
                </div>
              </div>

              <div>
                <label className="mb-1 block text-sm font-semibold">Full Name</label>
                <input
                  value={form.full_name}
                  onChange={(e) => updateField("full_name", e.target.value)}
                  placeholder="Worker's full name"
                  className="w-full rounded-lg border border-slate-300 px-3 py-3"
                  required
                />
              </div>

              <div>
                <label className="mb-1 block text-sm font-semibold">Job Title</label>
                <input
                  value={form.job_title}
                  onChange={(e) => updateField("job_title", e.target.value)}
                  placeholder="e.g. Support Officer"
                  className="w-full rounded-lg border border-slate-300 px-3 py-3"
                  required
                />
              </div>

              <div>
                <label className="mb-1 block text-sm font-semibold">Phone Number</label>
                <input
                  type="tel"
                  value={form.phone}
                  onChange={(e) => updateField("phone", e.target.value)}
                  placeholder="Worker's phone"
                  className="w-full rounded-lg border border-slate-300 px-3 py-3"
                />
              </div>

              <div>
                <label className="mb-1 block text-sm font-semibold">Email Address</label>
                <input
                  type="email"
                  value={form.email}
                  onChange={(e) => updateField("email", e.target.value)}
                  placeholder="Worker's email"
                  className="w-full rounded-lg border border-slate-300 px-3 py-3"
                />
              </div>

              <div>
                <label className="mb-1 block text-sm font-semibold">Start Date</label>
                <input
                  type="date"
                  value={form.start_date}
                  onChange={(e) => updateField("start_date", e.target.value)}
                  className="w-full rounded-lg border border-slate-300 px-3 py-3"
                />
              </div>

              <div>
                <label className="mb-1 block text-sm font-semibold">Status</label>
                <select
                  value={form.status}
                  onChange={(e) => updateField("status", e.target.value)}
                  className="w-full rounded-lg border border-slate-300 bg-white px-3 py-3"
                >
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                  <option value="suspended">Suspended</option>
                </select>
              </div>
            </div>

            <div>
              <label className="mb-1 block text-sm font-semibold">Notes</label>
              <textarea
                value={form.notes}
                onChange={(e) => updateField("notes", e.target.value)}
                rows={3}
                placeholder="Optional notes about this staff member"
                className="w-full rounded-lg border border-slate-300 px-3 py-3"
              />
            </div>

            <div className="flex flex-wrap gap-3">
              <button
                type="submit"
                disabled={saving}
                className="rounded-lg bg-blue-700 px-6 py-3 font-bold text-white disabled:opacity-50"
              >
                {saving ? "Saving..." : editingId ? "Save Changes" : "Register Staff"}
              </button>

              <button
                type="button"
                onClick={resetForm}
                className="rounded-lg border border-slate-300 px-6 py-3 font-semibold"
              >
                Clear Form
              </button>
            </div>
          </form>
        </section>

        <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="border-b border-slate-200 p-5">
            <h2 className="text-2xl font-bold">Registered Staff</h2>
            <div className="mt-4 grid gap-3 md:grid-cols-2">
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search staff ID, name, phone or email"
                className="w-full rounded-lg border border-slate-300 px-3 py-3"
              />
              <select
                value={departmentFilter}
                onChange={(e) => setDepartmentFilter(e.target.value)}
                className="w-full rounded-lg border border-slate-300 bg-white px-3 py-3"
              >
                <option value="All">All Departments</option>
                {departments.map((department) => (
                  <option key={department} value={department}>{department}</option>
                ))}
              </select>
            </div>
          </div>

          {loading && staff.length === 0 ? (
            <p className="p-6 text-slate-500">Loading staff records...</p>
          ) : visibleStaff.length === 0 ? (
            <p className="p-8 text-center text-slate-500">
              No staff records found. Register your first worker above.
            </p>
          ) : (
            <div className="divide-y divide-slate-200">
              {visibleStaff.map((person) => (
                <article key={person.id} className="p-5">
                  <div className="flex flex-wrap items-start justify-between gap-4">
                    <div className="min-w-0">
                      <p className="font-bold text-blue-800">{person.staff_number}</p>
                      <h3 className="mt-1 text-lg font-bold">{person.full_name}</h3>
                      <p className="text-slate-600">{person.job_title} · {person.department}</p>
                      {person.phone && <p className="mt-1 text-sm">Phone: {person.phone}</p>}
                      {person.email && <p className="break-all text-sm">Email: {person.email}</p>}
                      {person.start_date && <p className="mt-1 text-sm text-slate-500">Start date: {person.start_date}</p>}
                      {person.notes && <p className="mt-2 whitespace-pre-wrap text-sm text-slate-600">{person.notes}</p>}
                    </div>

                    <div className="flex flex-wrap items-center gap-2">
                      <span className={`rounded-full px-3 py-1 text-sm font-semibold ${
                        person.status === "active"
                          ? "bg-green-100 text-green-800"
                          : person.status === "suspended"
                            ? "bg-red-100 text-red-800"
                            : "bg-slate-100 text-slate-700"
                      }`}>
                        {person.status}
                      </span>
                      <button
                        type="button"
                        onClick={() => startEditing(person)}
                        className="rounded-lg border border-slate-300 px-3 py-2 font-semibold"
                      >
                        Edit
                      </button>
                      {person.status !== "suspended" && (
                        <button
                          type="button"
                          onClick={() => void changeStatus(person)}
                          className="rounded-lg border border-slate-300 px-3 py-2 font-semibold"
                        >
                          {person.status === "active" ? "Deactivate" : "Activate"}
                        </button>
                      )}
                    </div>
                  </div>
                </article>
              ))}
            </div>
          )}
        </section>
      </div>
    </main>
  );
}
