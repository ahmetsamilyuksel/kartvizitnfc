import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { generateVCard } from "@/lib/vcard";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ cardId: string }> }
) {
  const { cardId } = await params;
  const card = await prisma.card.findUnique({ where: { id: cardId } });

  if (!card) {
    return NextResponse.json({ error: "Card not found" }, { status: 404 });
  }

  const vcardContent = generateVCard(card);

  return new NextResponse(vcardContent, {
    headers: {
      "Content-Type": "text/vcard; charset=utf-8",
      "Content-Disposition": `attachment; filename="${card.fullName.replace(/[^a-zA-Z0-9]/g, "_")}.vcf"`,
    },
  });
}
