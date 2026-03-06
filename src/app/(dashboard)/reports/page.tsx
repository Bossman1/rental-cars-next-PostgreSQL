import { db } from "~/server/db";
import { auth } from "~/server/auth";
import { redirect } from "next/navigation";

export default async function ReportsPage() {
    const session = await auth();
    if (!session) redirect("/login");

    const now = new Date();
    const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    const [
        totalCars,
        availableCars,
        rentedCars,
        maintenanceCars,
        totalCustomers,
        totalRentals,
        activeRentals,
        completedRentals,
        cancelledRentals,
        overdueRentals,
        totalRevenue,
        monthlyRevenue,
        recentRentals,
        topCars,
    ] = await Promise.all([
        db.car.count(),
        db.car.count({ where: { status: "AVAILABLE" } }),
        db.car.count({ where: { status: "RENTED" } }),
        db.car.count({ where: { status: "MAINTENANCE" } }),
        db.customer.count(),
        db.rental.count(),
        db.rental.count({ where: { status: "ACTIVE" } }),
        db.rental.count({ where: { status: "COMPLETED" } }),
        db.rental.count({ where: { status: "CANCELLED" } }),
        db.rental.count({ where: { status: "OVERDUE" } }),
        db.payment.aggregate({
            _sum: { amount: true },
            where: { status: "COMPLETED" },
        }),
        db.payment.aggregate({
            _sum: { amount: true },
            where: {
                status: "COMPLETED",
                paidAt: { gte: firstDayOfMonth },
            },
        }),
        db.rental.findMany({
            take: 5,
            orderBy: { createdAt: "desc" },
            include: { customer: true, car: true },
        }),
        db.rental.groupBy({
            by: ["carId"],
            _count: { id: true },
            orderBy: { _count: { id: "desc" } },
            take: 5,
        }),
    ]);

    const topCarIds = topCars.map((t) => t.carId);
    const topCarDetails = await db.car.findMany({
        where: { id: { in: topCarIds } },
    });

    return (
        <div className="p-8">
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-gray-900">Reports</h1>
                <p className="text-gray-500">Business overview and statistics</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                <div className="bg-gradient-to-r from-green-500 to-green-600 rounded-xl p-6 text-white">
                    <p className="text-green-100 text-sm font-medium uppercase">Total Revenue</p>
                    <p className="text-4xl font-bold mt-1">
                        ${Number(totalRevenue._sum.amount ?? 0).toFixed(2)}
                    </p>
                    <p className="text-green-100 text-sm mt-2">All time completed payments</p>
                </div>
                <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-xl p-6 text-white">
                    <p className="text-blue-100 text-sm font-medium uppercase">This Month</p>
                    <p className="text-4xl font-bold mt-1">
                        ${Number(monthlyRevenue._sum.amount ?? 0).toFixed(2)}
                    </p>
                    <p className="text-blue-100 text-sm mt-2">
                        {now.toLocaleString("default", { month: "long", year: "numeric" })}
                    </p>
                </div>
            </div>

            <h2 className="text-xl font-bold text-gray-800 mb-4">Fleet Status</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                {[
                    { label: "Total Cars",  value: totalCars,       color: "text-gray-800" },
                    { label: "Available",   value: availableCars,   color: "text-green-600" },
                    { label: "Rented",      value: rentedCars,      color: "text-blue-600" },
                    { label: "Maintenance", value: maintenanceCars, color: "text-yellow-600" },
                ].map((stat) => (
                    <div key={stat.label} className="bg-white rounded-xl shadow p-5">
                        <p className="text-sm text-gray-500">{stat.label}</p>
                        <p className={`text-3xl font-bold mt-1 ${stat.color}`}>{stat.value}</p>
                    </div>
                ))}
            </div>

            <h2 className="text-xl font-bold text-gray-800 mb-4">Rental Statistics</h2>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-8">
                {[
                    { label: "Total Rentals",   value: totalRentals,     color: "text-gray-800" },
                    { label: "Active",          value: activeRentals,    color: "text-green-600" },
                    { label: "Completed",       value: completedRentals, color: "text-blue-600" },
                    { label: "Cancelled",       value: cancelledRentals, color: "text-gray-500" },
                    { label: "Overdue",         value: overdueRentals,   color: "text-red-600" },
                    { label: "Total Customers", value: totalCustomers,   color: "text-purple-600" },
                ].map((stat) => (
                    <div key={stat.label} className="bg-white rounded-xl shadow p-5">
                        <p className="text-sm text-gray-500">{stat.label}</p>
                        <p className={`text-3xl font-bold mt-1 ${stat.color}`}>{stat.value}</p>
                    </div>
                ))}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-white rounded-xl shadow p-6">
                    <h2 className="text-lg font-bold text-gray-800 mb-4">Recent Rentals</h2>
                    <div className="space-y-3">
                        {recentRentals.length === 0 && (
                            <p className="text-gray-400 text-sm">No rentals yet</p>
                        )}
                        {recentRentals.map((rental) => (
                            <div key={rental.id} className="flex justify-between items-center py-2 border-b last:border-0">
                                <div>
                                    <p className="font-medium text-sm">
                                        {rental.customer.firstName} {rental.customer.lastName}
                                    </p>
                                    <p className="text-xs text-gray-500">
                                        {rental.car.make} {rental.car.model}
                                    </p>
                                </div>
                                <div className="text-right">
                                    <p className="font-medium text-sm">
                                        ${Number(rental.totalAmount).toFixed(2)}
                                    </p>
                                    <p className="text-xs text-gray-500">
                                        {new Date(rental.createdAt).toLocaleDateString()}
                                    </p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="bg-white rounded-xl shadow p-6">
                    <h2 className="text-lg font-bold text-gray-800 mb-4">Most Rented Cars</h2>
                    <div className="space-y-3">
                        {topCars.length === 0 && (
                            <p className="text-gray-400 text-sm">No data yet</p>
                        )}
                        {topCars.map((item, index) => {
                            const car = topCarDetails.find((c) => c.id === item.carId);
                            if (!car) return null;
                            return (
                                <div key={item.carId} className="flex justify-between items-center py-2 border-b last:border-0">
                                    <div className="flex items-center gap-3">
                    <span className="text-lg font-bold text-gray-300">
                      #{index + 1}
                    </span>
                                        <div>
                                            <p className="font-medium text-sm">
                                                {car.make} {car.model} ({car.year})
                                            </p>
                                            <p className="text-xs text-gray-500">{car.licensePlate}</p>
                                        </div>
                                    </div>
                                    <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-xs font-medium">
                    {item._count.id} rentals
                  </span>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>
        </div>
    );
}