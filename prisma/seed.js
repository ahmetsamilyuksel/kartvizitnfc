const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

async function main() {
  await prisma.adminSetting.upsert({
    where: { id: 1 },
    update: {},
    create: { id: 1, currency: "RUB", basePriceRub: 1490 },
  });

  const methods = [
    {
      name: "Оплата переводом",
      type: "manual",
      active: true,
      sortOrder: 1,
      instructions: "Переведите на карту и отправьте чек менеджеру",
    },
    {
      name: "Наличные",
      type: "manual",
      active: true,
      sortOrder: 2,
      instructions: "Оплата наличными при получении",
    },
  ];

  for (const method of methods) {
    const existing = await prisma.paymentMethod.findFirst({
      where: { name: method.name },
    });
    if (!existing) {
      await prisma.paymentMethod.create({ data: method });
    }
  }

  console.log("Seed completed successfully!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
