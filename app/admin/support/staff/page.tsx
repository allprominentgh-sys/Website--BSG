“use client”;

import Link from “next/link”;
import { useState } from “react”;

type SupportStaff = {
id: string;
name: string;
email: string;
role: string;
active: boolean;
};

export default function SupportStaffPage() {
const [name, setName] = useState(””);
const [email, setEmail] = useState(””);
const [role, setRole] = useState(“Support Agent”);
const [staff, setStaff] = useState<SupportStaff[]>([]);
const [notice, setNotice] = useState(””);

function createStaff(event: React.FormEvent) {
event.preventDefault();
setNotice(””);

const cleanName = name.trim();
const cleanEmail = email.trim().toLowerCase();
if (!cleanName || !cleanEmail) {
  setNotice("Enter the worker's full name and email address.");
  return;
}
if (
  staff.some(
    (person) => person.email.toLowerCase() === cleanEmail
  )
) {
  setNotice("A worker with this email is already on this page.");
  return;
}
const newStaff: SupportStaff = {
  id: `BSG-CS-${Date.now().toString().slice(-8)}`,
  name: cleanName,
  email: cleanEmail,
  role,
  active: true,
};
setStaff((current) => [...current, newStaff]);
setName("");
setEmail("");
setRole("Support Agent");
setNotice(
  `Staff ID ${newStaff.id} created for this page session. It has not been saved permanently.`
);

}

return (
BEST SALES GHANA
Support Centre Staff
Register support workers and prepare their staff IDs.
      <div className="mt-5 flex flex-wrap gap-3">
        <Link
          href="/admin/support"
          className="rounded-xl border border-slate-300 bg-white px-4 py-3 font-semibold"
        >
          Back to Customer Service
        </Link>
        <Link
          href="/admin"
          className="rounded-xl border border-slate-300 bg-white px-4 py-3 font-semibold"
        >
          Admin Dashboard
        </Link>
      </div>
    </header>
    <div className="mb-6 rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm leading-6 text-amber-900">
      Temporary setup: workers created here exist only until this page
      is refreshed. Do not use these temporary IDs for staff login or
      grant workers access yet. Permanent database storage and secure
      staff authentication are the next step.
    </div>
    {notice && (
      <div
        role="status"
        className="mb-5 rounded-xl border border-blue-200 bg-blue-50 p-4 text-blue-900"
      >
        {notice}
      </div>
    )}
    <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm md:p-7">
      <h2 className="text-xl font-bold">Register a Worker</h2>
      <form onSubmit={createStaff} className="mt-5 space-y-4">
        <div>
          <label
            htmlFor="staff-name"
            className="mb-2 block text-sm font-semibold"
          >
            Full name
          </label>
          <input
            id="staff-name"
            value={name}
            onChange={(event) => setName(event.target.value)}
            required
            maxLength={120}
            autoComplete="name"
            placeholder="Enter the worker's full name"
            className="w-full rounded-xl border border-slate-300 p-3"
          />
        </div>
        <div>
          <label
            htmlFor="staff-email"
            className="mb-2 block text-sm font-semibold"
          >
            Work email
          </label>
          <input
            id="staff-email"
            type="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            required
            maxLength={254}
            autoComplete="email"
            placeholder="worker@example.com"
            className="w-full rounded-xl border border-slate-300 p-3"
          />
        </div>
        <div>
          <label
            htmlFor="staff-role"
            className="mb-2 block text-sm font-semibold"
          >
            Staff role
          </label>
          <select
            id="staff-role"
            value={role}
            onChange={(event) => setRole(event.target.value)}
            className="w-full rounded-xl border border-slate-300 bg-white p-3"
          >
            <option>Support Agent</option>
            <option>Senior Support Agent</option>
            <option>Support Supervisor</option>
          </select>
        </div>
        <button
          type="submit"
          className="w-full rounded-xl bg-blue-700 px-5 py-3 font-bold text-white hover:bg-blue-800 sm:w-auto"
        >
          Create Staff ID
        </button>
      </form>
    </section>
    <section className="mt-6 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm md:p-7">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-xl font-bold">Registered on This Page</h2>
        <span className="rounded-full bg-blue-100 px-3 py-1 text-sm font-bold text-blue-800">
          {staff.length} workers
        </span>
      </div>
      {staff.length === 0 ? (
        <p className="mt-5 text-slate-500">
          No workers have been added during this session.
        </p>
      ) : (
        <div className="mt-5 space-y-3">
          {staff.map((person) => (
            <article
              key={person.id}
              className="rounded-xl border border-slate-200 p-4"
            >
              <p className="font-bold">{person.name}</p>
              <p className="mt-1 break-all text-sm text-slate-600">
                {person.email}
              </p>
              <p className="mt-2 text-sm">{person.role}</p>
              <div className="mt-3 flex flex-wrap items-center justify-between gap-2">
                <span className="rounded-lg bg-slate-100 px-3 py-2 font-mono text-sm">
                  {person.id}
                </span>
                <button
                  type="button"
                  onClick={() =>
                    navigator.clipboard
                      .writeText(person.id)
                      .then(() =>
                        setNotice(`Copied staff ID ${person.id}.`)
                      )
                      .catch(() =>
                        setNotice("Copy failed. Please copy the ID manually.")
                      )
                  }
                  className="rounded-lg border border-slate-300 px-3 py-2 text-sm font-semibold"
                >
                  Copy ID
                </button>
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
