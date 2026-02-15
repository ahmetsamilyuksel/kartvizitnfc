import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getSession } from "@/lib/auth";
import { paymentMethodSchema } from "@/lib/validation";

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getSession();
  if (!session.isLoggedIn) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const body = await request.json();
  const parsed = paymentMethodSchema.partial().safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid data", details: parsed.error.flatten() },
      { status: 400 }
    );
  }

  const method = await prisma.paymentMethod.update({
    where: { id },
    data: parsed.data,
  });

  return NextResponse.json(method);
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getSession();
  if (!session.isLoggedIn) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;

  const orderCount = await prisma.order.count({
    where: { paymentMethodId: id },
  });

  if (orderCount > 0) {
    return NextResponse.json(
      { error: "Cannot delete payment method with existing orders" },
      { status: 400 }
    );
  }

  await prisma.paymentMethod.delete({ where: { id } });
  return NextResponse.json({ success: true });
}
