“use client”;

import Link from “next/link”;
import { useState } from “react”;

type StaffMember = {
id: string;
name: string;
department: string;
phone: string;
active: boolean;
};

const departments = [
“Support Team”,
“Marketing Team”,
“Advertisers”,
“Company Drivers”,
“Delivery Team”,
“Sales Team”,
“Other”,
];

function createStaffId() {
const randomPart = Math.random().toString(36).slice(2, 8).toUpperCase();
return BSG-${new Date().getFullYear()}-${randomPart};
}

export default function StaffManagementPage() {
const [staff, setStaff] = useState<StaffMember[]>([]);
const [name, setName] = useState(””);
const [department, setDepartment] = useState(“Support Team”);
const [phone, setPhone] = useState(””);
const [notice, setNotice] = useState(””);

function generateStaff() {
if (!name.trim()) {
setNotice(“Enter the worker’s full name first.”);
return;
}

const newStaff: StaffMember = {
  id: createStaffId(),
  name: name.trim(),
  department,
  phone: phone.trim(),
  active: true,
};
setStaff((current) => [newStaff, ...current]);
setNotice(`Staff ID generated: ${newStaff.id}`);
setName("");
setPhone("");

}

function changeStatus(id: string) {
setStaff((current) =>
current.map((person) =>
person.id === id
? { …person, active: !person.active }
: person
)
);
}

function printStaff() {
window.print();
}

return (
BEST SALES GHANA
Staff ID Management
Generate staff identification numbers and organise workers
by department.
      <Link
        href="/admin"
        className="mt-5 inline-block rounded-xl border border-slate-300 bg-white px-5 py-3 font-bold"
      >
        Back to Admin Dashboard
      </Link>
    </header>
    <section className="mb-8 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-7">
      <h2 className="text-xl font-black">Register a Staff Member</h2>
      <p className="mt-2 text-sm text-slate-500">
        Complete these fields to generate an identification number.
      </p>
      <div className="mt-5 grid gap-4 md:grid-cols-2">
        <label className="text-sm font-semibold">
          Full name
          <input
            value={name}
            onChange={(event) => setName(event.target.value)}
            placeholder="Enter worker's full name"
            maxLength={120}
            className="mt-2 w-full rounded-xl border border-slate-300 p-3"
          />
        </label>
        <label className="text-sm font-semibold">
          Department
          <select
            value={department}
            onChange={(event) => setDepartment(event.target.value)}
            className="mt-2 w-full rounded-xl border border-slate-300 bg-white p-3"
          >
            {departments.map((item) => (
              <option key={item} value={item}>
                {item}
              </option>
            ))}
          </select>
        </label>
        <label className="text-sm font-semibold md:col-span-2">
          Phone number (optional)
          <input
            value={phone}
            onChange={(event) => setPhone(event.target.value)}
            placeholder="Enter staff phone number"
            maxLength={30}
            className="mt-2 w-full rounded-xl border border-slate-300 p-3"
          />
        </label>
      </div>
      <button
        type="button"
        onClick={generateStaff}
        className="mt-5 rounded-xl bg-blue-700 px-6 py-3 font-bold text-white"
      >
        Generate Staff ID
      </button>
      {notice && (
        <p role="status" className="mt-4 rounded-xl bg-blue-50 p-4 text-blue-900">
          {notice}
        </p>
      )}
    </section>
    <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-7">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-black">Staff Register</h2>
          <p className="mt-1 text-sm text-slate-500">
            Staff created during this page session: {staff.length}
          </p>
        </div>
        <button
          type="button"
          onClick={printStaff}
          className="rounded-xl border border-slate-300 px-4 py-3 font-bold"
        >
          Print Register
        </button>
      </div>
      {staff.length === 0 ? (
        <p className="mt-6 rounded-xl bg-slate-50 p-6 text-center text-slate-500">
          No staff registered in this session yet.
        </p>
      ) : (
        <div className="mt-5 overflow-x-auto">
          <table className="w-full min-w-[650px] border-collapse text-left text-sm">
            <thead>
              <tr className="border-b bg-slate-50">
                <th className="p-3">Staff ID</th>
                <th className="p-3">Name</th>
                <th className="p-3">Department</th>
                <th className="p-3">Phone</th>
                <th className="p-3">Status</th>
                <th className="p-3">Action</th>
              </tr>
            </thead>
            <tbody>
              {staff.map((person) => (
                <tr key={person.id} className="border-b">
                  <td className="p-3 font-bold">{person.id}</td>
                  <td className="p-3">{person.name}</td>
                  <td className="p-3">{person.department}</td>
                  <td className="p-3">{person.phone || "—"}</td>
                  <td className="p-3">
                    {person.active ? "Active" : "Inactive"}
                  </td>
                  <td className="p-3">
                    <button
                      type="button"
                      onClick={() => changeStatus(person.id)}
                      className="font-bold text-blue-700"
                    >
                      {person.active ? "Deactivate" : "Activate"}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      <p className="mt-5 text-sm text-amber-800">
        Important: this first version keeps staff records in page
        memory only. Refreshing the page clears them. Staff IDs are
        not yet saved to Supabase and must not be treated as permanent
        or verified employee IDs.
      </p>
    </section>
  </div>
</main>

);
}
