import { prisma } from "@/lib/db";
import { notFound } from "next/navigation";
import { getMessages } from "@/lib/i18n";
import DigitalCardClient from "./DigitalCardClient";

export const dynamic = "force-dynamic";

export default async function DigitalCardPage({
  params,
}: {
  params: Promise<{ lang: string; cardId: string }>;
}) {
  const { lang, cardId } = await params;
  const t = getMessages(lang);

  const card = await prisma.card.findUnique({ where: { id: cardId } });
  if (!card) notFound();

  return <DigitalCardClient card={card} t={t} />;
}
