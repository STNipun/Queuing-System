import { prisma } from '../lib/prisma';

async function main() {
  // Create test users
  const users = await prisma.user.createMany({
    data: [
      {
        username: 'admin',
        password: '$2b$12$owDJ3krZZJwdPEytWBuGkeoxa9oD4y1SSnmD0zpYLZuP74HNbGk2u',
        first_name: 'Admin',
        last_name: 'User',
        role: 'admin',
      },
      {
        username: 'doctor1',
        password: '$2b$12$kQlM7hgqA4KZURBzcXjCG.yBA.22IDSBRDbK3BcqTx8EuOq4nJk4a',
        first_name: 'John',
        last_name: 'Smith',
        role: 'doctor',
      },
      {
        username: 'doctor2',
        password: '$2b$12$kQlM7hgqA4KZURBzcXjCG.yBA.22IDSBRDbK3BcqTx8EuOq4nJk4a',
        first_name: 'Sarah',
        last_name: 'Johnson',
        role: 'doctor',
      },
      {
        username: 'frontdesk',
        password: '$2b$12$MyUl4T46Hn0Z9rk3kcxJKOAzYYMpB4rJeIYDjLOP9tjGmx8CE0EH6',
        first_name: 'Front',
        last_name: 'Desk',
        role: 'front_desk',
      },
    ],
    skipDuplicates: true,
  });

  console.log(`Created ${users.count} users`);

  // List all users
  const allUsers = await prisma.user.findMany({
    select: {
      id: true,
      username: true,
      first_name: true,
      last_name: true,
      role: true,
    },
  });

  console.log('\nTest Users Created:');
  console.log('==================');
  allUsers.forEach((user) => {
    console.log(`${user.role.toUpperCase()}: username="${user.username}", password="${user.username}123"`);
  });
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
