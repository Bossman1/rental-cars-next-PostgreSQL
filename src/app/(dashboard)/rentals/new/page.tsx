import { db } from "~/server/db";
import { auth } from "~/server/auth";
import { redirect } from "next/navigation";
import { NewRentalForm } from "~/components/rentals/new-rental-form";

export default async function NewRentalPage() {
  const session = await auth();
  if (!session) redirect("/login");

  const [customers, cars] = await Promise.all([
    db.customer.findMany({
      orderBy: { firstName: "asc" },
    }),
    db.car.findMany({
      where: { status: "AVAILABLE" },
      orderBy: { make: "asc" },
    }),
  ]);

  return (
    <div className="p-8 max-w-2xl">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">New Rental</h1>
        <p className="text-gray-500">Create a new car rental</p>
      </div>
      <NewRentalForm customers={customers} cars={cars} />
    </div>
  );
}