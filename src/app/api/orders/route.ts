import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { orderSchema } from "@/lib/validation";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const parsed = orderSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Validation failed", details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const { card: cardData, paymentMethodId, ...customerData } = parsed.data;

    const settings = await prisma.adminSetting.findFirst({ where: { id: 1 } });
    const totalAmountRub = settings?.basePriceRub ?? 1490;

    const paymentMethod = await prisma.paymentMethod.findUnique({
      where: { id: paymentMethodId },
    });
    if (!paymentMethod) {
      return NextResponse.json(
        { error: "Invalid payment method" },
        { status: 400 }
      );
    }

    // Clean optional empty strings
    const cleanCard = {
      ...cardData,
      company: cardData.company || null,
      title: cardData.title || null,
      email: cardData.email || null,
      website: cardData.website || null,
      whatsapp: cardData.whatsapp || null,
      telegram: cardData.telegram || null,
      photoDataUrl: cardData.photoDataUrl || null,
    };

    const card = await prisma.card.create({ data: cleanCard });

    const order = await prisma.order.create({
      data: {
        totalAmountRub,
        paymentMethodId,
        cardId: card.id,
        customerFullName: customerData.customerFullName,
        customerPhone: customerData.customerPhone,
        customerEmail: customerData.customerEmail || null,
        shippingCountry: customerData.shippingCountry,
        shippingCity: customerData.shippingCity,
        shippingAddress1: customerData.shippingAddress1,
        shippingAddress2: customerData.shippingAddress2 || null,
        shippingPostalCode: customerData.shippingPostalCode || null,
        notes: customerData.notes || null,
        status: "PAID",
      },
    });

    return NextResponse.json({ orderId: order.id, cardId: card.id });
  } catch (error) {
    console.error("Order creation error:", error);
    return NextResponse.json(
      { error: "Failed to create order" },
      { status: 500 }
    );
  }
}
