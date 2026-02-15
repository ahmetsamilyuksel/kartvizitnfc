import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET() {
  const settings = await prisma.adminSetting.findFirst({ where: { id: 1 } });
  const paymentMethods = await prisma.paymentMethod.findMany({
    where: { active: true },
    orderBy: { sortOrder: "asc" },
    select: { id: true, name: true, type: true, instructions: true },
  });

  return NextResponse.json({
    basePriceRub: settings?.basePriceRub ?? 1490,
    currency: settings?.currency ?? "RUB",
    paymentMethods,
  });
}
