import { NextResponse } from "next/server";
import { auth } from "~/server/auth";
import { db } from "~/server/db";
import { z } from "zod";

const carSchema = z.object({
  make:         z.string().min(1),
  model:        z.string().min(1),
  year:         z.number().int().min(2000).max(2030),
  licensePlate: z.string().min(1),
  color:        z.string().min(1),
  category:     z.enum(["ECONOMY","COMPACT","SEDAN","SUV","LUXURY","VAN","TRUCK"]),
  pricePerDay:  z.number().positive(),
  mileage:      z.number().int().min(0).default(0),
  fuelType:     z.enum(["PETROL","DIESEL","ELECTRIC","HYBRID"]).default("PETROL"),
  seats:        z.number().int().min(1).max(20).default(5),
  transmission: z.string().default("Automatic"),
  description:  z.string().optional(),
});

export async function GET(request: Request) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(request.url);
  const search = searchParams.get("search");
  const status = searchParams.get("status");

  const cars = await db.car.findMany({
    where: {
      ...(status && { status: status as any }),
      ...(search && {
        OR: [
          { make:  { contains: search, mode: "insensitive" } },
          { model: { contains: search, mode: "insensitive" } },
          { licensePlate: { contains: search, mode: "insensitive" } },
        ],
      }),
    },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json({ cars });
}

export async function POST(request: Request) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await request.json() as unknown;
  const validated = carSchema.safeParse(body);

  if (!validated.success) {
    return NextResponse.json({ error: "Invalid data", details: validated.error.flatten() }, { status: 422 });
  }

  const car = await db.car.create({ data: validated.data });
  return NextResponse.json({ car }, { status: 201 });
}