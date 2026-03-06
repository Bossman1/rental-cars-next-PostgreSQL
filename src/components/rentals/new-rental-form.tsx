"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { Car, Customer } from "@prisma/client";

export function NewRentalForm({
                                customers,
                                cars,
                              }: {
  customers: Customer[];
  cars: Car[];
}) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [selectedCar, setSelectedCar] = useState<Car | null>(null);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  // Calculate total days and amount automatically
  const totalDays =
    startDate && endDate
      ? Math.ceil(
        (new Date(endDate).getTime() - new Date(startDate).getTime()) /
        (1000 * 60 * 60 * 24)
      )
      : 0;

  const totalAmount = selectedCar
    ? Number(selectedCar.pricePerDay) * totalDays
    : 0;

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError("");

    const form = new FormData(e.currentTarget);

    const data = {
      customerId: form.get("customerId") as string,
      carId:      form.get("carId") as string,
      startDate:  new Date(form.get("startDate") as string).toISOString(),
      endDate:    new Date(form.get("endDate") as string).toISOString(),
      deposit:    Number(form.get("deposit")),
      notes:      form.get("notes") as string,
    };

    const res = await fetch("/api/rentals", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });

    if (res.ok) {
      router.push("/rentals");
      router.refresh();
    } else {
      const json = await res.json() as { error?: string };
      setError(json.error ?? "Something went wrong");
    }

    setLoading(false);
  }

  return (
    <div className="bg-white rounded-xl shadow p-6">
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="bg-red-50 text-red-600 text-sm p-3 rounded-lg">
            {error}
          </div>
        )}

        {/* Customer */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Customer
          </label>
          <select
            name="customerId"
            required
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Select customer</option>
            {customers.map((c) => (
              <option key={c.id} value={c.id}>
                {c.firstName} {c.lastName} — {c.email}
              </option>
            ))}
          </select>
        </div>

        {/* Car */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Car (Available only)
          </label>
          <select
            name="carId"
            required
            onChange={(e) => {
              const car = cars.find((c) => c.id === e.target.value) ?? null;
              setSelectedCar(car);
            }}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Select car</option>
            {cars.map((c) => (
              <option key={c.id} value={c.id}>
                {c.make} {c.model} ({c.year}) — {c.licensePlate} —
                ${Number(c.pricePerDay).toFixed(2)}/day
              </option>
            ))}
          </select>
        </div>

        {/* Dates */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Start Date
            </label>
            <input
              name="startDate"
              type="date"
              required
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              End Date
            </label>
            <input
              name="endDate"
              type="date"
              required
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        {/* Auto-calculated summary */}
        {selectedCar && totalDays > 0 && (
          <div className="bg-blue-50 rounded-lg p-4 text-sm space-y-1">
            <div className="flex justify-between">
              <span className="text-gray-600">Price per day:</span>
              <span className="font-medium">${Number(selectedCar.pricePerDay).toFixed(2)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Total days:</span>
              <span className="font-medium">{totalDays} days</span>
            </div>
            <div className="flex justify-between text-base font-bold text-blue-700 border-t pt-1 mt-1">
              <span>Total Amount:</span>
              <span>${totalAmount.toFixed(2)}</span>
            </div>
          </div>
        )}

        {/* Deposit */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Deposit ($)
          </label>
          <input
            name="deposit"
            type="number"
            required
            min="0"
            step="0.01"
            placeholder="200"
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* Notes */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Notes
          </label>
          <textarea
            name="notes"
            rows={3}
            placeholder="Optional notes..."
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div className="flex gap-3 pt-2">
          <button
            type="submit"
            disabled={loading || totalDays <= 0}
            className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
          >
            {loading ? "Creating..." : "Create Rental"}
          </button>
          <button
            type="button"
            onClick={() => router.back()}
            className="border border-gray-300 text-gray-700 px-6 py-2 rounded-lg hover:bg-gray-50 transition-colors"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}