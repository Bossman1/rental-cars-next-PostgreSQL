import { db } from "~/server/db";
import { auth } from "~/server/auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import { CarsTable } from "~/components/cars/cars-table";

export default async function CarsPage() {
  const session = await auth();
  if (!session) redirect("/login");

  const cars = await db.car.findMany({
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Cars</h1>
          <p className="text-gray-500">Manage your fleet</p>
        </div>
        <Link
          href="/cars/new"
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
        >
          + Add Car
        </Link>
      </div>

      <CarsTable cars={cars} />
    </div>
  );
}