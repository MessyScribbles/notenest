import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs'; // Add this to hash the password

const prisma = new PrismaClient();

async function main() {
  const hashedPassword = bcrypt.hashSync('123', 10); // Securely hash the test password

  await prisma.user.upsert({
    where: { email: 'a@a.com' },
    update: {},
    create: { email: 'a@a.com', displayName: 'User A', passwordHash: hashedPassword },
  });
  await prisma.user.upsert({
    where: { email: 'b@b.com' },
    update: {},
    create: { email: 'b@b.com', displayName: 'User B', passwordHash: hashedPassword },
  });
  console.log('Database seeded with test users.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });