“use client”;

import Link from “next/link”;
import { useEffect, useState } from “react”;

type StaffMember = {
id: string;
staffNumber: string;
fullName: string;
department: string;
role: string;
phone: string;
email: string;
status: “Active” | “Inactive”;
createdAt: string;
};

const DEPARTMENTS = [
“Support Team”,
“Marketing Team”,
“Advertisers”,
“Company Drivers”,
“Delivery Team”,
“Sales Team”,
“Administration”,
“Finance”,
“Other”,
];

const STORAGE_KEY = “bestsalesgh-staff-records-v1”;

export default function SupportStaffPage() {
const [staff, setStaff] = useState<StaffMember[]>([]);
const [loaded, setLoaded] = useState(false);
const [notice, setNotice] = useState(””);
const [search, setSearch] = useState(””);
const [departmentFilter, setDepartmentFilter] = useState(“All”);

const [fullName, setFullName] = useState(””);
const [department, setDepartment] = useState(“Support Team”);
const [role, setRole] = useState(””);
const [phone, setPhone] = useState(””);
const [email, setEmail] = useState(””);
const [manualStaffNumber, setManualStaffNumber] = useState(””);
const [generatedId, setGeneratedId] = useState(””);

useEffect(() => {
try {
const saved = localStorage.getItem(STORAGE_KEY);

  if (saved) {
    const parsed: unknown = JSON.parse(saved);
    if (Array.isArray(parsed)) {
      setStaff(parsed as StaffMember[]);
    }
  }
} catch {
  setNotice("Saved staff records could not be loaded.");
} finally {
  setLoaded(true);
}

}, []);

function saveStaff(nextStaff: StaffMember[]) {
setStaff(nextStaff);

try {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(nextStaff));
  setNotice("Staff records saved on this device.");
} catch {
  setNotice("Unable to save records in this browser.");
}

}

function createStaffId() {
if (!fullName.trim()) {
setNotice(“Enter the worker’s full name first.”);
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
const prefix =
  department === "Support Team"
    ? "SUP"
    : department === "Marketing Team"
      ? "MKT"
      : department === "Advertisers"
        ? "ADV"
        : department === "Company Drivers"
          ? "DRV"
          : department === "Delivery Team"
            ? "DEL"
            : department === "Sales Team"
              ? "SAL"
              : department === "Administration"
                ? "ADM"
                : department === "Finance"
                  ? "FIN"
                  : "OTH";
const nextNumber =
  staff.filter((member) => member.department === department).length + 1;
const suggestedNumber =
  `BGS-${prefix}-${dateCode}-${String(nextNumber).padStart(4, "0")}`;
const staffNumber = manualStaffNumber.trim() || suggestedNumber;
if (
  staff.some(
    (member) =>
      member.staffNumber.toLowerCase() === staffNumber.toLowerCase()
  )
) {
  setNotice("That staff number already exists. Enter a different number.");
  return;
}
const workerId =
  `BGS-${now.getTime().toString(36).toUpperCase()}-${Math.random()
    .toString(36)
    .slice(2, 6)
    .toUpperCase()}`;
const newStaff: StaffMember = {
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
saveStaff([newStaff, ...staff]);
setGeneratedId(workerId);
setFullName("");
setRole("");
setPhone("");
setEmail("");
setManualStaffNumber("");

}

function changeStatus(id: string) {
const updated = staff.map((member) =>
member.id === id
? {
…member,
status: member.status === “Active” ? “Inactive” : “Active”,
}
: member
) as StaffMember[];

saveStaff(updated);

}

function deleteStaff(id: string) {
const member = staff.find((item) => item.id === id);

if (!member) return;
const confirmed = window.confirm(
  `Delete the staff record for ${member.fullName}? This cannot be undone.`
);
if (!confirmed) return;
saveStaff(staff.filter((item) => item.id !== id));
setNotice("Staff record deleted.");

}

function exportStaff() {
const headings = [
“Worker ID”,
“Staff Number”,
“Full Name”,
“Department”,
“Job Title”,
“Phone”,
“Email”,
“Status”,
“Created At”,
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
      .map((value) => `"${String(value).replace(/"/g, '""')}"`)
      .join(",")
  )
  .join("\r\n");
const blob = new Blob(["\uFEFF" + csv], {
  type: "text/csv;charset=utf-8;",
});
const url = URL.createObjectURL(blob);
const link = document.createElement("a");
link.href = url;
link.download = "bestsalesgh-staff-records.csv";
link.click();
URL.revokeObjectURL(url);

}

const visibleStaff = staff.filter((member) => {
const matchesDepartment =
departmentFilter === “All” ||
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
(member) => member.status === “Active”
).length;

if (!loaded) {
return (
Loading staff management…
);
}

return (
BEST SALES GHANA
      <h1 className="mt-2 text-3xl font-black sm:text-4xl">
        Staff Management Centre
      </h1>
      <p className="mt-3 max-w-3xl text-slate-600">
        Register workers, generate unique worker IDs, assign staff
        numbers, organise departments and manage staff status.
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
          onClick={exportStaff}
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
        className="mb-5 rounded-xl border border-blue-200 bg-blue-50 p-4 text-blue-900"
      >
        {notice}
      </div>
    )}
    {generatedId && (
      <section className="mb-6 rounded-2xl border border-green-200 bg-green-50 p-5">
        <h2 className="text-lg font-black text-green-900">
          Worker ID generated
        </h2>
        <p className="mt-2 break-all font-mono text-xl font-bold text-green-800">
          {generatedId}
        </p>
        <p className="mt-2 text-sm text-green-800">
          Keep this ID with the worker's staff number for your records.
        </p>
        <button
          type="button"
          onClick={() => {
            void navigator.clipboard
              .writeText(generatedId)
              .then(() => setNotice("Worker ID copied."))
              .catch(() => setNotice("Please copy the Worker ID manually."));
          }}
          className="mt-4 rounded-lg bg-green-800 px-4 py-2 font-bold text-white"
        >
          Copy Worker ID
        </button>
      </section>
    )}
    <section className="mb-8 grid grid-cols-2 gap-3 lg:grid-cols-4">
      {[
        { label: "Total Staff", value: staff.length },
        { label: "Active Staff", value: activeCount },
        { label: "Inactive Staff", value: staff.length - activeCount },
        {
          label: "Departments",
          value: new Set(staff.map((member) => member.department)).size,
        },
      ].map((item) => (
        <div
          key={item.label}
          className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"
        >
          <p className="text-sm text-slate-500">{item.label}</p>
          <p className="mt-2 text-3xl font-black">{item.value}</p>
        </div>
      ))}
    </section>
    <section className="mb-8 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-7">
      <h2 className="text-2xl font-black">Register a Worker</h2>
      <p className="mt-2 text-sm leading-6 text-slate-600">
        Enter the worker's details. Leave the staff number blank to
        generate one automatically, or enter your own staff number.
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
            placeholder="e.g. Customer Support Officer"
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
            placeholder="Leave blank to generate automatically"
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
            placeholder="Worker's contact number"
            className="mt-2 w-full rounded-xl border border-slate-300 px-4 py-3 font-normal"
          />
        </label>
        <label className="text-sm font-bold">
          Email address
          <input
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            maxLength={150}
            type="email"
            placeholder="worker@example.com"
            className="mt-2 w-full rounded-xl border border-slate-300 px-4 py-3 font-normal"
          />
        </label>
      </div>
      <button
        type="button"
        onClick={createStaffId}
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
            placeholder="Search name, worker ID or staff number"
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
                  className={`rounded-full px-3 py-1 text-xs font-bold ${
                    member.status === "Active"
                      ? "bg-green-100 text-green-800"
                      : "bg-slate-200 text-slate-700"
                  }`}
                >
                  {member.status}
                </span>
              </div>
              <div className="mt-4 grid gap-3 text-sm sm:grid-cols-2">
                <p className="break-all">
                  <span className="font-bold">Worker ID:</span>{" "}
                  <span className="font-mono">{member.id}</span>
                </p>
                <p className="break-all">
                  <span className="font-bold">Staff number:</span>{" "}
                  {member.staffNumber}
                </p>
                <p>
                  <span className="font-bold">Phone:</span>{" "}
                  {member.phone || "Not provided"}
                </p>
                <p className="break-all">
                  <span className="font-bold">Email:</span>{" "}
                  {member.email || "Not provided"}
                </p>
                <p>
                  <span className="font-bold">Registered:</span>{" "}
                  {new Date(member.createdAt).toLocaleDateString()}
                </p>
              </div>
              <div className="mt-4 flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() => {
                    void navigator.clipboard
                      .writeText(
                        `Worker ID: ${member.id}\nStaff Number: ${member.staffNumber}\nName: ${member.fullName}\nDepartment: ${member.department}\nJob Title: ${member.role}`
                      )
                      .then(() => setNotice("Staff details copied."))
                      .catch(() =>
                        setNotice("Unable to copy. Please copy manually.")
                      );
                  }}
                  className="rounded-lg border border-slate-300 px-4 py-2 font-semibold"
                >
                  Copy Staff Details
                </button>
                <button
                  type="button"
                  onClick={() => changeStatus(member.id)}
                  className="rounded-lg border border-blue-200 px-4 py-2 font-semibold text-blue-800"
                >
                  {member.status === "Active"
                    ? "Deactivate Worker"
                    : "Activate Worker"}
                </button>
                <button
                  type="button"
                  onClick={() => deleteStaff(member.id)}
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
