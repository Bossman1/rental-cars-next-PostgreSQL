import { db } from "~/server/db";
import { auth } from "~/server/auth";
import { redirect } from "next/navigation";
import { PaymentsTable } from "~/components/payments/payments-table";

export default async function PaymentsPage() {
  const session = await auth();
  if (!session) redirect("/login");

  const payments = await db.payment.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      rental: {
        include: {
          customer: true,
          car: true,
        },
      },
    },
  });

  const totalRevenue = await db.payment.aggregate({
    _sum: { amount: true },
    where: { status: "COMPLETED" },
  });

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Payments</h1>
          <p className="text-gray-500">Track all payments</p>
        </div>
        <div className="bg-green-50 border border-green-200 rounded-xl px-6 py-3 text-right">
          <p className="text-xs text-green-600 font-medium uppercase">Total Revenue</p>
          <p className="text-2xl font-bold text-green-700">
            ${Number(totalRevenue._sum.amount ?? 0).toFixed(2)}
          </p>
        </div>
      </div>
      <PaymentsTable payments={payments} />
    </div>
  );
}