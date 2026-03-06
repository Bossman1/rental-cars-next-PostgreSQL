import { db } from "~/server/db";
import { auth } from "~/server/auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import { RentalsTable } from "~/components/rentals/rentals-table";

export default async function RentalsPage() {
  const session = await auth();
  if (!session) redirect("/login");

  const rentals = await db.rental.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      customer: true,
      car:      true,
      staff:    { select: { name: true } },
    },
  });

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Rentals</h1>
          <p className="text-gray-500">Manage car rentals</p>
        </div>
        <Link
          href="/rentals/new"
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
        >
          + New Rental
        </Link>
      </div>
      <RentalsTable rentals={rentals} />
    </div>
  );
}