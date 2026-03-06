import { NextResponse } from "next/server";
import { auth } from "~/server/auth";
import { db } from "~/server/db";
import { z } from "zod";

const paymentSchema = z.object({
  rentalId: z.string(),
  amount:   z.number().positive(),
  method:   z.enum(["CASH", "CARD", "BANK_TRANSFER", "ONLINE"]),
});

export async function GET() {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const payments = await db.payment.findMany({
    orderBy: { createdAt: "desc" },
    include: { rental: { include: { customer: true, car: true } } },
  });

  return NextResponse.json({ payments });
}

export async function POST(request: Request) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await request.json() as unknown;
  const validated = paymentSchema.safeParse(body);

  if (!validated.success) {
    return NextResponse.json({ error: "Invalid data" }, { status: 422 });
  }

  const payment = await db.payment.create({
    data: {
      ...validated.data,
      status: "PENDING",
    },
  });

  return NextResponse.json({ payment }, { status: 201 });
}