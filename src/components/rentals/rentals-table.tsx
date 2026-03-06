"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

const statusColors: Record<string, string> = {
  RESERVED:  "bg-yellow-100 text-yellow-800",
  ACTIVE:    "bg-green-100 text-green-800",
  COMPLETED: "bg-blue-100 text-blue-800",
  CANCELLED: "bg-gray-100 text-gray-800",
  OVERDUE:   "bg-red-100 text-red-800",
};

export function RentalsTable({ rentals }: { rentals: any[] }) {
  const [search, setSearch] = useState("");
  const router = useRouter();

  const filtered = rentals.filter((r) =>
    `${r.customer.firstName} ${r.customer.lastName} ${r.car.make} ${r.car.model} ${r.car.licensePlate}`
      .toLowerCase()
      .includes(search.toLowerCase())
  );

  return (
    <div className="bg-white rounded-xl shadow">
      <div className="p-4 border-b">
        <input
          type="text"
          placeholder="Search by customer or car..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full max-w-sm border border-gray-300 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 text-gray-600 uppercase text-xs">
          <tr>
            <th className="px-6 py-3 text-left">Customer</th>
            <th className="px-6 py-3 text-left">Car</th>
            <th className="px-6 py-3 text-left">Start Date</th>
            <th className="px-6 py-3 text-left">End Date</th>
            <th className="px-6 py-3 text-left">Days</th>
            <th className="px-6 py-3 text-left">Total</th>
            <th className="px-6 py-3 text-left">Status</th>
            <th className="px-6 py-3 text-left">Actions</th>
          </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
          {filtered.length === 0 && (
            <tr>
              <td colSpan={8} className="px-6 py-8 text-center text-gray-400">
                No rentals found
              </td>
            </tr>
          )}
          {filtered.map((rental) => (
            <tr key={rental.id} className="hover:bg-gray-50">
              <td className="px-6 py-4 font-medium">
                {rental.customer.firstName} {rental.customer.lastName}
              </td>
              <td className="px-6 py-4 text-gray-600">
                {rental.car.make} {rental.car.model}
                <span className="text-xs text-gray-400 ml-1">({rental.car.licensePlate})</span>
              </td>
              <td className="px-6 py-4 text-gray-600">
                {new Date(rental.startDate).toLocaleDateString()}
              </td>
              <td className="px-6 py-4 text-gray-600">
                {new Date(rental.endDate).toLocaleDateString()}
              </td>
              <td className="px-6 py-4 text-gray-600">{rental.totalDays}d</td>
              <td className="px-6 py-4 font-medium">
                ${Number(rental.totalAmount).toFixed(2)}
              </td>
              <td className="px-6 py-4">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusColors[rental.status]}`}>
                    {rental.status}
                  </span>
              </td>
              <td className="px-6 py-4">
                <button
                  onClick={() => router.push(`/rentals/${rental.id}`)}
                  className="text-blue-600 hover:underline text-sm"
                >
                  View
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