import { auth } from "~/server/auth";
import { db } from "~/server/db";
import { redirect } from "next/navigation";

export default async function DashboardPage() {
  const session = await auth();
  if (!session) redirect("/login");

  const [totalCars, availableCars, activeRentals, totalCustomers] =
    await Promise.all([
      db.car.count(),
      db.car.count({ where: { status: "AVAILABLE" } }),
      db.rental.count({ where: { status: "ACTIVE" } }),
      db.customer.count(),
    ]);

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-500">Welcome back, {session.user?.name}!</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-xl shadow p-6">
          <p className="text-sm text-gray-500">Total Cars</p>
          <p className="text-4xl font-bold text-gray-900 mt-1">{totalCars}</p>
        </div>
        <div className="bg-white rounded-xl shadow p-6">
          <p className="text-sm text-gray-500">Available Cars</p>
          <p className="text-4xl font-bold text-green-600 mt-1">{availableCars}</p>
        </div>
        <div className="bg-white rounded-xl shadow p-6">
          <p className="text-sm text-gray-500">Active Rentals</p>
          <p className="text-4xl font-bold text-blue-600 mt-1">{activeRentals}</p>
        </div>
        <div className="bg-white rounded-xl shadow p-6">
          <p className="text-sm text-gray-500">Total Customers</p>
          <p className="text-4xl font-bold text-purple-600 mt-1">{totalCustomers}</p>
        </div>
      </div>
    </div>
  );
}