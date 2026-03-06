import { NextResponse } from "next/server";
import { auth } from "~/server/auth";
import { db } from "~/server/db";
import { z } from "zod";

const customerSchema = z.object({
  firstName:     z.string().min(1),
  lastName:      z.string().min(1),
  email:         z.string().email(),
  phone:         z.string().min(1),
  driverLicense: z.string().min(1),
  licenseExpiry: z.string(),
  address:       z.string().optional(),
  city:          z.string().optional(),
  country:       z.string().default("GE"),
  dateOfBirth:   z.string().optional(),
});

export async function GET() {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const customers = await db.customer.findMany({
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json({ customers });
}

export async function POST(request: Request) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await request.json() as unknown;
  const validated = customerSchema.safeParse(body);

  if (!validated.success) {
    return NextResponse.json({ error: "Invalid data", details: validated.error.flatten() }, { status: 422 });
  }

  const customer = await db.customer.create({
    data: {
      ...validated.data,
      licenseExpiry: new Date(validated.data.licenseExpiry),
      dateOfBirth:   validated.data.dateOfBirth ? new Date(validated.data.dateOfBirth) : undefined,
    },
  });

  return NextResponse.json({ customer }, { status: 201 });
}