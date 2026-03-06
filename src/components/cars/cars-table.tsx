"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { Car } from "@prisma/client";

const statusColors: Record<string, string> = {
  AVAILABLE:   "bg-green-100 text-green-800",
  RENTED:      "bg-blue-100 text-blue-800",
  MAINTENANCE: "bg-yellow-100 text-yellow-800",
  RETIRED:     "bg-gray-100 text-gray-800",
};

export function CarsTable({ cars }: { cars: Car[] }) {
  const [search, setSearch] = useState("");
  const router = useRouter();

  const filtered = cars.filter((car) =>
    `${car.make} ${car.model} ${car.licensePlate}`
      .toLowerCase()
      .includes(search.toLowerCase())
  );

  async function deleteCar(id: string) {
    if (!confirm("Are you sure you want to delete this car?")) return;
    await fetch(`/api/cars/${id}`, { method: "DELETE" });
    router.refresh();
  }

  return (
    <div className="bg-white rounded-xl shadow">
      {/* Search bar */}
      <div className="p-4 border-b">
        <input
          type="text"
          placeholder="Search by make, model or plate..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full max-w-sm border border-gray-300 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 text-gray-600 uppercase text-xs">
          <tr>
            <th className="px-6 py-3 text-left">Car</th>
            <th className="px-6 py-3 text-left">Plate</th>
            <th className="px-6 py-3 text-left">Category</th>
            <th className="px-6 py-3 text-left">Price/Day</th>
            <th className="px-6 py-3 text-left">Mileage</th>
            <th className="px-6 py-3 text-left">Status</th>
            <th className="px-6 py-3 text-left">Actions</th>
          </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
          {filtered.length === 0 && (
            <tr>
              <td colSpan={7} className="px-6 py-8 text-center text-gray-400">
                No cars found
              </td>
            </tr>
          )}
          {filtered.map((car) => (
            <tr key={car.id} className="hover:bg-gray-50">
              <td className="px-6 py-4 font-medium">
                {car.make} {car.model} ({car.year})
              </td>
              <td className="px-6 py-4 text-gray-600">{car.licensePlate}</td>
              <td className="px-6 py-4 text-gray-600">{car.category}</td>
              <td className="px-6 py-4 font-medium">
                ${Number(car.pricePerDay).toFixed(2)}
              </td>
              <td className="px-6 py-4 text-gray-600">
                {car.mileage.toLocaleString()} km
              </td>
              <td className="px-6 py-4">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusColors[car.status]}`}>
                    {car.status}
                  </span>
              </td>
              <td className="px-6 py-4 space-x-2">
                <button
                  onClick={() => router.push(`/cars/${car.id}`)}
                  className="text-blue-600 hover:underline text-sm"
                >
                  Edit
                </button>
                <button
                  onClick={() => deleteCar(car.id)}
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