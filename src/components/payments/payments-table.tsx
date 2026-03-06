"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

const statusColors: Record<string, string> = {
  PENDING:   "bg-yellow-100 text-yellow-800",
  COMPLETED: "bg-green-100 text-green-800",
  FAILED:    "bg-red-100 text-red-800",
  REFUNDED:  "bg-gray-100 text-gray-800",
};

export function PaymentsTable({ payments }: { payments: any[] }) {
  const [search, setSearch] = useState("");
  const router = useRouter();

  const filtered = payments.filter((p) =>
    `${p.rental.customer.firstName} ${p.rental.customer.lastName} ${p.rental.car.make} ${p.rental.car.model}`
      .toLowerCase()
      .includes(search.toLowerCase())
  );

  async function markAsPaid(id: string) {
    await fetch(`/api/payments/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: "COMPLETED", paidAt: new Date().toISOString() }),
    });
    router.refresh();
  }

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
            <th className="px-6 py-3 text-left">Amount</th>
            <th className="px-6 py-3 text-left">Method</th>
            <th className="px-6 py-3 text-left">Status</th>
            <th className="px-6 py-3 text-left">Date</th>
            <th className="px-6 py-3 text-left">Actions</th>
          </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
          {filtered.length === 0 && (
            <tr>
              <td colSpan={7} className="px-6 py-8 text-center text-gray-400">
                No payments found
              </td>
            </tr>
          )}
          {filtered.map((payment) => (
            <tr key={payment.id} className="hover:bg-gray-50">
              <td className="px-6 py-4 font-medium">
                {payment.rental.customer.firstName} {payment.rental.customer.lastName}
              </td>
              <td className="px-6 py-4 text-gray-600">
                {payment.rental.car.make} {payment.rental.car.model}
              </td>
              <td className="px-6 py-4 font-medium">
                ${Number(payment.amount).toFixed(2)}
              </td>
              <td className="px-6 py-4 text-gray-600">{payment.method}</td>
              <td className="px-6 py-4">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusColors[payment.status]}`}>
                    {payment.status}
                  </span>
              </td>
              <td className="px-6 py-4 text-gray-600">
                {payment.paidAt
                  ? new Date(payment.paidAt).toLocaleDateString()
                  : "—"}
              </td>
              <td className="px-6 py-4">
                {payment.status === "PENDING" && (
                  <button
                    onClick={() => markAsPaid(payment.id)}
                    className="text-green-600 hover:underline text-sm"
                  >
                    Mark Paid
                  </button>
                )}
              </td>
            </tr>
          ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}