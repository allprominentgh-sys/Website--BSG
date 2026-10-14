"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

type StaffMember = {
  id: string;
  staffNumber: string;
  fullName: string;
  department: string;
  phone: string;
  role: string;
  createdAt: string;
  active: boolean;
};

const STORAGE_KEY = "bestsalesgh-staff-records-v1";

const departments = [
  "Support Team",
  "Marketing Team",
  "Advertisers",
  "Company Drivers",
  "Administration",
  "Other",
];

export default function AdminStaffPage() {
  const [staff, setStaff] = useState<StaffMember[]>([]);
  const [fullName, setFullName] = useState("");
  const [department, setDepartment] = useState("Support Team");
  const [phone, setPhone] = useState("");
  const [role, setRole] = useState("");
  const [customId, setCustomId] = useState("");
  const [search, setSearch] = useState("");
  const [notice, setNotice] = useState("");

  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        setStaff(JSON.parse(saved) as StaffMember[]);
      }
    } catch {
      setNotice("Could not load saved staff records.");
    }
  }, []);

  function saveStaff(records: StaffMember[]) {
    setStaff(records);

    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(records));
    } catch {
      setNotice(
        "Records could not be saved in this browser. Export or copy them before leaving."
      );
    }
  }

  function generateId() {
    const prefix: Record<string, string> = {
      "Support Team": "SUP",
      "Marketing Team": "MKT",
      Advertisers: "ADV",
      "Company Drivers": "DRV",
      Administration: "ADM",
      Other: "STF",
    };

    const nextNumber =
      staff.filter((member) => member.department === department).length + 1;

    setCustomId(
      `BSG-${prefix[department] || "STF"}-${String(nextNumber).padStart(4, "0")}`
    );
    setNotice("Staff ID generated. Complete the form and register the worker.");
  }

  function registerStaff() {
    if (!fullName.trim() || !role.trim() || !customId.trim()) {
      setNotice("Enter the worker's name and role, then generate or enter a staff ID.");
      return;
    }

    if (staff.some((member) => member.staffNumber === customId.trim())) {
      setNotice("That staff ID already exists. Generate a different ID.");
      return;
    }

    const record: StaffMember = {
      id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      staffNumber: customId.trim(),
      fullName: fullName.trim(),
      department,
      phone: phone.trim(),
      role: role.trim(),
      createdAt: new Date().toISOString(),
      active: true,
    };

    saveStaff([record, ...staff]);
    setFullName("");
    setPhone("");
    setRole("");
    setCustomId("");
    setNotice(`Staff record created: ${record.staffNumber}`);
  }

  function toggleActive(id: string) {
    saveStaff(
      staff.map((member) =>
        member.id === id ? { ...member, active: !member.active } : member
      )
    );
    setNotice("Staff status updated.");
  }

  function exportStaff() {
    const csv = [
      ["Staff ID", "Name", "Department", "Role", "Phone", "Status"],
      ...staff.map((member) => [
        member.staffNumber,
        member.fullName,
        member.department,
        member.role,
        member.phone,
        member.active ? "Active" : "Inactive",
      ]),
    ]
      .map((row) =>
        row
          .map((value) => `"${String(value).replace(/"/g, '""')}"`)
          .join(",")
      )
      .join("\n");

    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "bestsalesgh-staff.csv";
    link.click();
    URL.revokeObjectURL(url);
  }

  const query = search.trim().toLowerCase();
  const filteredStaff = staff.filter((member) =>
    [
      member.staffNumber,
      member.fullName,
      member.department,
      member.role,
      member.phone,
    ]
      .join(" ")
      .toLowerCase()
      .includes(query)
  );

  return (
    <main className="min-h-screen bg-slate-50 p-4 text-slate-900 md:p-8">
      <div className="mx-auto max-w-6xl">
        <header className="mb-8">
          <h1 className="text-3xl font-bold">BestSalesGH Staff Management</h1>
          <p className="mt-2 text-slate-600">
            Create staff IDs and manage team assignments for your company.
          </p>

          <Link
            href="/admin"
            className="mt-4 inline-block rounded-lg border border-slate-300 bg-white px-4 py-3 font-semibold"
          >
            Back to Admin Dashboard
          </Link>
        </header>

        <section className="mb-8 grid grid-cols-2 gap-3 md:grid-cols-4">
          {[
            ["Total Staff", staff.length],
            ["Active Staff", staff.filter((member) => member.active).length],
            [
              "Support Team",
              staff.filter((member) => member.department === "Support Team").length,
            ],
            [
              "Other Departments",
              staff.filter((member) => member.department !== "Support Team").length,
            ],
          ].map(([label, count]) => (
            <div
              key={String(label)}
              className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm"
            >
              <p className="text-sm text-slate-500">{label}</p>
              <p className="mt-2 text-3xl font-bold">{count}</p>
            </div>
          ))}
        </section>

        <section className="mb-8 rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <h2 className="text-xl font-bold">Register a Worker</h2>
          <p className="mt-1 text-sm text-slate-500">
            You can generate an ID automatically or enter your own staff ID.
          </p>

          <div className="mt-5 grid gap-4 md:grid-cols-2">
            <label className="text-sm font-semibold">
              Worker full name *
              <input
                value={fullName}
                onChange={(event) => setFullName(event.target.value)}
                placeholder="Enter full name"
                className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-3 font-normal"
              />
            </label>

            <label className="text-sm font-semibold">
              Department *
              <select
                value={department}
                onChange={(event) => {
                  setDepartment(event.target.value);
                  setCustomId("");
                }}
                className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-3 font-normal"
              >
                {departments.map((item) => (
                  <option key={item} value={item}>
                    {item}
                  </option>
                ))}
              </select>
            </label>

            <label className="text-sm font-semibold">
              Job title / position *
              <input
                value={role}
                onChange={(event) => setRole(event.target.value)}
                placeholder="e.g. Customer Support Officer"
                className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-3 font-normal"
              />
            </label>

            <label className="text-sm font-semibold">
              Phone number
              <input
                value={phone}
                onChange={(event) => setPhone(event.target.value)}
                placeholder="Worker's phone number"
                className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-3 font-normal"
              />
            </label>

            <label className="text-sm font-semibold md:col-span-2">
              Staff ID *
              <input
                value={customId}
                onChange={(event) => setCustomId(event.target.value.toUpperCase())}
                placeholder="Generate an ID or enter one manually"
                className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-3 font-normal"
              />
            </label>
          </div>

          <div className="mt-4 flex flex-wrap gap-3">
            <button
              type="button"
              onClick={generateId}
              className="rounded-lg border border-blue-700 px-5 py-3 font-semibold text-blue-700"
            >
              Generate Staff ID
            </button>

            <button
              type="button"
              onClick={registerStaff}
              className="rounded-lg bg-blue-700 px-5 py-3 font-semibold text-white"
            >
              Register Worker
            </button>
          </div>

          {notice && (
            <p className="mt-4 rounded-lg bg-blue-50 p-3 text-sm text-blue-900">
              {notice}
            </p>
          )}
        </section>

        <section className="rounded-xl border border-slate-200 bg-white shadow-sm">
          <div className="flex flex-col gap-3 border-b border-slate-200 p-5 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-xl font-bold">Staff Register</h2>
              <p className="mt-1 text-sm text-slate-500">
                Search workers, view IDs and activate or deactivate records.
              </p>
            </div>

            <button
              type="button"
              onClick={exportStaff}
              className="rounded-lg bg-slate-900 px-4 py-3 font-semibold text-white"
            >
              Export Staff CSV
            </button>
          </div>

          <div className="p-5">
            <input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search staff ID, name, department or phone"
              className="w-full rounded-lg border border-slate-300 px-4 py-3"
            />
          </div>

          {filteredStaff.length === 0 ? (
            <p className="px-5 pb-6 text-center text-slate-500">
              No staff records found. Register your first worker above.
            </p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[760px] text-left text-sm">
                <thead className="bg-slate-100">
                  <tr>
                    <th className="p-3">Staff ID</th>
                    <th className="p-3">Worker</th>
                    <th className="p-3">Department</th>
                    <th className="p-3">Position</th>
                    <th className="p-3">Phone</th>
                    <th className="p-3">Status</th>
                    <th className="p-3">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredStaff.map((member) => (
                    <tr key={member.id} className="border-t border-slate-200">
                      <td className="p-3 font-bold">{member.staffNumber}</td>
                      <td className="p-3">{member.fullName}</td>
                      <td className="p-3">{member.department}</td>
                      <td className="p-3">{member.role}</td>
                      <td className="p-3">{member.phone || "—"}</td>
                      <td className="p-3">
                        {member.active ? "Active" : "Inactive"}
                      </td>
                      <td className="p-3">
                        <button
                          type="button"
                          onClick={() => toggleActive(member.id)}
                          className="rounded-md border border-slate-300 px-3 py-2 font-semibold"
                        >
                          {member.active ? "Deactivate" : "Activate"}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>

        <p className="mt-6 text-sm text-slate-500">
          Important: these records are currently stored in this browser only.
          This page does not create login accounts or grant system access.
        </p>
      </div>
    </main>
  );
}
