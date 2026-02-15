interface VCardData {
  fullName: string;
  company?: string | null;
  title?: string | null;
  phone?: string | null;
  email?: string | null;
  website?: string | null;
  whatsapp?: string | null;
  telegram?: string | null;
}

export function generateVCard(data: VCardData): string {
  const lines: string[] = [
    "BEGIN:VCARD",
    "VERSION:3.0",
    `FN:${data.fullName}`,
  ];

  if (data.company) lines.push(`ORG:${data.company}`);
  if (data.title) lines.push(`TITLE:${data.title}`);
  if (data.phone) lines.push(`TEL;TYPE=CELL:${data.phone}`);
  if (data.email) lines.push(`EMAIL:${data.email}`);
  if (data.website) lines.push(`URL:${data.website}`);

  const notes: string[] = [];
  if (data.whatsapp) notes.push(`WhatsApp: ${data.whatsapp}`);
  if (data.telegram) notes.push(`Telegram: ${data.telegram}`);
  if (notes.length > 0) lines.push(`NOTE:${notes.join("\\n")}`);

  lines.push("END:VCARD");
  return lines.join("\r\n");
}
