import { db } from "~/server/db";
import { auth } from "~/server/auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import { CustomersTable } from "~/components/customers/customers-table";

export default async function CustomersPage() {
  const session = await auth();
  if (!session) redirect("/login");

  const customers = await db.customer.findMany({
    orderBy: { createdAt: "desc" },
    include: { _count: { select: { rentals: true } } },
  });

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Customers</h1>
          <p className="text-gray-500">Manage your customers</p>
        </div>
        <Link
          href="/customers/new"
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
        >
          + Add Customer
        </Link>
      </div>
      <CustomersTable customers={customers} />
    </div>
  );
}