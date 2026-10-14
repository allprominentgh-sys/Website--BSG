
"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

type StaffMember = {
  id: string;
  staffNumber: string;
  fullName: string;
  department: string;
  role: string;
  phone: string;
  email: string;
  status: "Active" | "Inactive";
  createdAt: string;
};

const STORAGE_KEY = "bestsalesgh-staff-records-v1";

const DEPARTMENTS = [
  "Support Team",
  "Marketing Team",
  "Advertisers",
  "Company Drivers",
  "Delivery Team",
  "Sales Team",
  "Administration",
  "Finance",
  "Other",
];

function getDepartmentPrefix(department: string) {
  switch (department) {
    case "Support Team":
      return "SUP";
    case "Marketing Team":
      return "MKT";
    case "Advertisers":
      return "ADV";
    case "Company Drivers":
      return "DRV";
    case "Delivery Team":
      return "DEL";
    case "Sales Team":
      return "SAL";
    case "Administration":
      return "ADM";
    case "Finance":
      return "FIN";
    default:
      return "OTH";
  }
}

export default function SupportStaffPage() {
  const [staff, setStaff] = useState<StaffMember[]>([]);
  const [loaded, setLoaded] = useState(false);
  const [notice, setNotice] = useState("");
  const [search, setSearch] = useState("");
  const [departmentFilter, setDepartmentFilter] = useState("All");

  const [fullName, setFullName] = useState("");
  const [department, setDepartment] = useState("Support Team");
  const [role, setRole] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [manualStaffNumber, setManualStaffNumber] = useState("");

  useEffect(() => {
    try {
      const saved = window.localStorage.getItem(STORAGE_KEY);

      if (saved) {
        const parsed: unknown = JSON.parse(saved);

        if (Array.isArray(parsed)) {
          setStaff(parsed as StaffMember[]);
        }
      }
    } catch {
      setNotice("Could not load saved staff records from this browser.");
    } finally {
      setLoaded(true);
    }
  }, []);

  function persistStaff(nextStaff: StaffMember[]) {
    setStaff(nextStaff);

    try {
      window.localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify(nextStaff)
      );
      setNotice("Staff records saved in this browser.");
    } catch {
      setNotice("Unable to save. Check your browser storage.");
    }
  }

  function registerWorker() {
    if (!fullName.trim()) {
      setNotice("Enter the worker's full name.");
      return;
    }

    if (!role.trim()) {
      setNotice("Enter the worker's job title.");
      return;
    }

    const now = new Date();
    const dateCode =
      String(now.getFullYear()).slice(-2) +
      String(now.getMonth() + 1).padStart(2, "0");

    const prefix = getDepartmentPrefix(department);
    const nextNumber =
      staff.filter((item) => item.department === department).length + 1;

    const generatedStaffNumber =
      "BGS-" +
      prefix +
      "-" +
      dateCode +
      "-" +
      String(nextNumber).padStart(4, "0");

    const staffNumber =
      manualStaffNumber.trim() || generatedStaffNumber;

    const duplicate = staff.some(
      (item) =>
        item.staffNumber.toLowerCase() === staffNumber.toLowerCase()
    );

    if (duplicate) {
      setNotice("That staff number already exists. Choose another number.");
      return;
    }

    const workerId =
      "BGS-" +
      now.getTime().toString(36).toUpperCase() +
      "-" +
      Math.random().toString(36).slice(2, 7).toUpperCase();

    const newMember: StaffMember = {
      id: workerId,
      staffNumber,
      fullName: fullName.trim(),
      department,
      role: role.trim(),
      phone: phone.trim(),
      email: email.trim(),
      status: "Active",
      createdAt: now.toISOString(),
    };

    persistStaff([newMember, ...staff]);

    setFullName("");
    setRole("");
    setPhone("");
    setEmail("");
    setManualStaffNumber("");

    setNotice(
      "Worker registered. Worker ID: " +
        workerId +
        " | Staff number: " +
        staffNumber
    );
  }

  function toggleStatus(id: string) {
    const updated = staff.map((member) => {
      if (member.id !== id) return member;

      return {
        ...member,
        status: member.status === "Active" ? "Inactive" : "Active",
      } as StaffMember;
    });

    persistStaff(updated);
  }

  function deleteWorker(id: string) {
    const member = staff.find((item) => item.id === id);
    if (!member) return;

    const confirmed = window.confirm(
      "Delete the record for " + member.fullName + "?"
    );

    if (!confirmed) return;

    persistStaff(staff.filter((item) => item.id !== id));
    setNotice("Staff record deleted.");
  }

  async function copyText(value: string) {
    try {
      await navigator.clipboard.writeText(value);
      setNotice("Copied to clipboard.");
    } catch {
      setNotice("Copy is unavailable. Please select and copy the text manually.");
    }
  }

  function exportCsv() {
    const headings = [
      "Worker ID",
      "Staff Number",
      "Full Name",
      "Department",
      "Job Title",
      "Phone",
      "Email",
      "Status",
      "Created At",
    ];

    const rows = staff.map((member) => [
      member.id,
      member.staffNumber,
      member.fullName,
      member.department,
      member.role,
      member.phone,
      member.email,
      member.status,
      member.createdAt,
    ]);

    const csv = [headings, ...rows]
      .map((row) =>
        row
          .map(
            (value) =>
              '"' + String(value).replace(/"/g, '""') + '"'
          )
          .join(",")
      )
      .join("\r\n");

    const blob = new Blob(["\uFEFF" + csv], {
      type: "text/csv;charset=utf-8;",
    });

    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = "bestsalesgh-staff-records.csv";
    anchor.click();
    URL.revokeObjectURL(url);
  }

  const visibleStaff = staff.filter((member) => {
    const matchesDepartment =
      departmentFilter === "All" ||
      member.department === departmentFilter;

    const term = search.trim().toLowerCase();

    const matchesSearch =
      !term ||
      [
        member.id,
        member.staffNumber,
        member.fullName,
        member.department,
        member.role,
        member.phone,
        member.email,
      ]
        .join(" ")
        .toLowerCase()
        .includes(term);

    return matchesDepartment && matchesSearch;
  });

  const activeCount = staff.filter(
    (member) => member.status === "Active"
  ).length;

  if (!loaded) {
    return (
      <main className="min-h-screen bg-slate-50 p-6 text-slate-900">
        Loading staff management...
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-slate-50 p-4 text-slate-900 sm:p-6 lg:p-8">
      <div className="mx-auto max-w-7xl">
        <header className="mb-8">
          <p className="font-bold uppercase tracking-widest text-blue-700">
            BEST SALES GHANA
          </p>

          <h1 className="mt-2 text-3xl font-black sm:text-4xl">
            Staff Management Centre
          </h1>

          <p className="mt-3 text-slate-600">
            Register workers, generate worker IDs, assign staff numbers
            and organise company departments.
          </p>

          <div className="mt-5 flex flex-wrap gap-3">
            <Link
              href="/admin"
              className="rounded-xl border border-slate-300 bg-white px-4 py-3 font-bold"
            >
              Back to Admin Dashboard
            </Link>

            <Link
              href="/admin/support"
              className="rounded-xl border border-slate-300 bg-white px-4 py-3 font-bold"
            >
              Customer Support Centre
            </Link>

            <button
              type="button"
              onClick={exportCsv}
              disabled={staff.length === 0}
              className="rounded-xl bg-blue-700 px-4 py-3 font-bold text-white disabled:opacity-50"
            >
              Export Staff CSV
            </button>
          </div>
        </header>

        {notice && (
          <div
            role="status"
            className="mb-5 break-words rounded-xl border border-blue-200 bg-blue-50 p-4 text-blue-900"
          >
            {notice}
          </div>
        )}

        <section className="mb-8 grid grid-cols-2 gap-3 lg:grid-cols-4">
          <StatCard label="Total Staff" value={staff.length} />
          <StatCard label="Active Staff" value={activeCount} />
          <StatCard
            label="Inactive Staff"
            value={staff.length - activeCount}
          />
          <StatCard
            label="Departments"
            value={new Set(staff.map((item) => item.department)).size}
          />
        </section>

        <section className="mb-8 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-7">
          <h2 className="text-2xl font-black">Register a Worker</h2>

          <p className="mt-2 text-sm text-slate-600">
            Enter a staff number manually or leave it blank to generate one.
          </p>

          <div className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            <label className="text-sm font-bold">
              Full name *
              <input
                value={fullName}
                onChange={(event) => setFullName(event.target.value)}
                maxLength={120}
                placeholder="Worker's full name"
                className="mt-2 w-full rounded-xl border border-slate-300 px-4 py-3 font-normal"
              />
            </label>

            <label className="text-sm font-bold">
              Department *
              <select
                value={department}
                onChange={(event) => setDepartment(event.target.value)}
                className="mt-2 w-full rounded-xl border border-slate-300 bg-white px-4 py-3 font-normal"
              >
                {DEPARTMENTS.map((item) => (
                  <option key={item} value={item}>
                    {item}
                  </option>
                ))}
              </select>
            </label>

            <label className="text-sm font-bold">
              Job title *
              <input
                value={role}
                onChange={(event) => setRole(event.target.value)}
                maxLength={100}
                placeholder="e.g. Support Officer"
                className="mt-2 w-full rounded-xl border border-slate-300 px-4 py-3 font-normal"
              />
            </label>

            <label className="text-sm font-bold">
              Staff number
              <input
                value={manualStaffNumber}
                onChange={(event) =>
                  setManualStaffNumber(event.target.value)
                }
                maxLength={50}
                placeholder="Optional: enter your own"
                className="mt-2 w-full rounded-xl border border-slate-300 px-4 py-3 font-normal"
              />
            </label>

            <label className="text-sm font-bold">
              Phone number
              <input
                value={phone}
                onChange={(event) => setPhone(event.target.value)}
                maxLength={40}
                inputMode="tel"
                placeholder="Contact number"
                className="mt-2 w-full rounded-xl border border-slate-300 px-4 py-3 font-normal"
              />
            </label>

            <label className="text-sm font-bold">
              Email address
              <input
                type="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                maxLength={150}
                placeholder="worker@example.com"
                className="mt-2 w-full rounded-xl border border-slate-300 px-4 py-3 font-normal"
              />
            </label>
          </div>

          <button
            type="button"
            onClick={registerWorker}
            className="mt-6 w-full rounded-xl bg-blue-700 px-6 py-4 font-bold text-white hover:bg-blue-800 sm:w-auto"
          >
            Generate ID and Register Worker
          </button>
        </section>

        <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="border-b border-slate-200 p-5 sm:p-6">
            <h2 className="text-2xl font-black">Registered Staff</h2>

            <div className="mt-4 grid gap-3 md:grid-cols-2">
              <input
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Search worker name, ID or staff number"
                className="w-full rounded-xl border border-slate-300 px-4 py-3"
              />

              <select
                value={departmentFilter}
                onChange={(event) =>
                  setDepartmentFilter(event.target.value)
                }
                className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3"
              >
                <option value="All">All departments</option>
                {DEPARTMENTS.map((item) => (
                  <option key={item} value={item}>
                    {item}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {visibleStaff.length === 0 ? (
            <p className="p-8 text-center text-slate-500">
              No staff records found. Register your first worker above.
            </p>
          ) : (
            <div className="divide-y divide-slate-200">
              {visibleStaff.map((member) => (
                <article key={member.id} className="p-5 sm:p-6">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <h3 className="text-lg font-black">
                        {member.fullName}
                      </h3>
                      <p className="mt-1 text-sm text-slate-600">
                        {member.department} · {member.role}
                      </p>
                    </div>

                    <span
                      className={
                        member.status === "Active"
                          ? "rounded-full bg-green-100 px-3 py-1 text-xs font-bold text-green-800"
                          : "rounded-full bg-slate-200 px-3 py-1 text-xs font-bold text-slate-700"
                      }
                    >
                      {member.status}
                    </span>
                  </div>

                  <div className="mt-4 grid gap-3 text-sm sm:grid-cols-2">
                    <p className="break-all">
                      <strong>Worker ID:</strong> {member.id}
                    </p>
                    <p className="break-all">
                      <strong>Staff number:</strong> {member.staffNumber}
                    </p>
                    <p>
                      <strong>Phone:</strong> {member.phone || "Not provided"}
                    </p>
                    <p className="break-all">
                      <strong>Email:</strong> {member.email || "Not provided"}
                    </p>
                    <p>
                      <strong>Registered:</strong>{" "}
                      {new Date(member.createdAt).toLocaleDateString()}
                    </p>
                  </div>

                  <div className="mt-4 flex flex-wrap gap-2">
                    <button
                      type="button"
                      onClick={() =>
                        void copyText(
                          "Worker ID: " +
                            member.id +
                            "\nStaff Number: " +
                            member.staffNumber +
                            "\nName: " +
                            member.fullName +
                            "\nDepartment: " +
                            member.department +
                            "\nJob Title: " +
                            member.role
                        )
                      }
                      className="rounded-lg border border-slate-300 px-4 py-2 font-semibold"
                    >
                      Copy Staff Details
                    </button>

                    <button
                      type="button"
                      onClick={() => toggleStatus(member.id)}
                      className="rounded-lg border border-blue-200 px-4 py-2 font-semibold text-blue-800"
                    >
                      {member.status === "Active"
                        ? "Deactivate Worker"
                        : "Activate Worker"}
                    </button>

                    <button
                      type="button"
                      onClick={() => deleteWorker(member.id)}
                      className="rounded-lg border border-red-200 px-4 py-2 font-semibold text-red-700"
                    >
                      Delete Record
                    </button>
                  </div>
                </article>
              ))}
            </div>
          )}
        </section>

        <footer className="py-8 text-center text-sm text-slate-500">
          BEST SALES GHANA · Staff Management Centre
        </footer>
      </div>
    </main>
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
