import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const users = await prisma.user.findMany();
  for (const u of users) {
    const limit = u.creditLimit ?? 250;
    if (u.credits > limit) {
      await prisma.user.update({
        where: { id: u.id },
        data: { creditLimit: u.credits },
      });
      console.log(`Updated ${u.email}: creditLimit → ${u.credits}`);
    }
  }
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
