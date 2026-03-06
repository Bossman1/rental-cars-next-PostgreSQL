"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export function CustomersTable({ customers }: { customers: any[] }) {
  const [search, setSearch] = useState("");
  const router = useRouter();

  const filtered = customers.filter((c) =>
    `${c.firstName} ${c.lastName} ${c.email} ${c.phone}`
      .toLowerCase()
      .includes(search.toLowerCase())
  );

  async function deleteCustomer(id: string) {
    if (!confirm("Are you sure you want to delete this customer?")) return;
    await fetch(`/api/customers/${id}`, { method: "DELETE" });
    router.refresh();
  }

  return (
    <div className="bg-white rounded-xl shadow">
      <div className="p-4 border-b">
        <input
          type="text"
          placeholder="Search by name, email or phone..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full max-w-sm border border-gray-300 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 text-gray-600 uppercase text-xs">
          <tr>
            <th className="px-6 py-3 text-left">Name</th>
            <th className="px-6 py-3 text-left">Email</th>
            <th className="px-6 py-3 text-left">Phone</th>
            <th className="px-6 py-3 text-left">License</th>
            <th className="px-6 py-3 text-left">City</th>
            <th className="px-6 py-3 text-left">Rentals</th>
            <th className="px-6 py-3 text-left">Actions</th>
          </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
          {filtered.length === 0 && (
            <tr>
              <td colSpan={7} className="px-6 py-8 text-center text-gray-400">
                No customers found
              </td>
            </tr>
          )}
          {filtered.map((customer) => (
            <tr key={customer.id} className="hover:bg-gray-50">
              <td className="px-6 py-4 font-medium">
                {customer.firstName} {customer.lastName}
              </td>
              <td className="px-6 py-4 text-gray-600">{customer.email}</td>
              <td className="px-6 py-4 text-gray-600">{customer.phone}</td>
              <td className="px-6 py-4 text-gray-600">{customer.driverLicense}</td>
              <td className="px-6 py-4 text-gray-600">{customer.city ?? "—"}</td>
              <td className="px-6 py-4">
                  <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-xs font-medium">
                    {customer._count.rentals} rentals
                  </span>
              </td>
              <td className="px-6 py-4 space-x-2">
                <button
                  onClick={() => router.push(`/customers/${customer.id}`)}
                  className="text-blue-600 hover:underline text-sm"
                >
                  Edit
                </button>
                <button
                  onClick={() => deleteCustomer(customer.id)}
                  className="text-red-600 hover:underline text-sm"
                >
                  Delete
                </button>
              </td>
            </tr>
          ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}