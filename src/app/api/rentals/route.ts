import { NextResponse } from "next/server";
import { auth } from "~/server/auth";
import { db } from "~/server/db";
import { z } from "zod";

const rentalSchema = z.object({
  customerId: z.string(),
  carId:      z.string(),
  startDate:  z.string(),
  endDate:    z.string(),
  deposit:    z.number().positive(),
  notes:      z.string().optional(),
});

export async function GET() {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const rentals = await db.rental.findMany({
    orderBy: { createdAt: "desc" },
    include: { customer: true, car: true },
  });

  return NextResponse.json({ rentals });
}

export async function POST(request: Request) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await request.json() as unknown;
  const validated = rentalSchema.safeParse(body);

  if (!validated.success) {
    return NextResponse.json({ error: "Invalid data" }, { status: 422 });
  }

  const { customerId, carId, startDate, endDate, deposit, notes } = validated.data;

  // Check car is available
  const car = await db.car.findUnique({ where: { id: carId } });
  if (!car || car.status !== "AVAILABLE") {
    return NextResponse.json({ error: "Car is not available" }, { status: 409 });
  }

  // Calculate totals
  const start      = new Date(startDate);
  const end        = new Date(endDate);
  const totalDays  = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
  const totalAmount = Number(car.pricePerDay) * totalDays;

  // Use transaction — both operations must succeed or both fail
  const rental = await db.$transaction(async (tx) => {
    const newRental = await tx.rental.create({
      data: {
        customerId,
        carId,
        staffId:     session.user!.id,
        startDate:   new Date(startDate),
        endDate:     new Date(endDate),
        totalDays,
        pricePerDay: car.pricePerDay,
        totalAmount,
        deposit,
        notes,
        status: "RESERVED",
      },
    });

    await tx.car.update({
      where: { id: carId },
      data:  { status: "RENTED" },
    });

    return newRental;
  });

  return NextResponse.json({ rental }, { status: 201 });
}