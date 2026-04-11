import 'dotenv/config';
import { PrismaClient, Role, Frequency } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! });
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log('🌱 Seeding database...');

  // --- Users ---
  // upsert = "if a user with this email exists, update them; otherwise create them"
  // This means running the seed twice won't create duplicates.

  const alice = await prisma.user.upsert({
    where: { email: 'alice@test.com' },
    update: {}, // nothing to update if already exists
    create: {
      email: 'alice@test.com',
      name: 'Alice',
      password: 'hashed_password_placeholder', // TODO: real hashing once auth is built
    },
  });

  const bob = await prisma.user.upsert({
    where: { email: 'bob@test.com' },
    update: {},
    create: {
      email: 'bob@test.com',
      name: 'Bob',
      password: 'hashed_password_placeholder',
    },
  });

  const charlie = await prisma.user.upsert({
    where: { email: 'charlie@test.com' },
    update: {},
    create: {
      email: 'charlie@test.com',
      name: 'Charlie',
      password: 'hashed_password_placeholder',
    },
  });

  console.log('  ✓ Users created');

  // --- Group ---
  // inviteCode is unique, so we upsert on that.

  const group = await prisma.group.upsert({
    where: { inviteCode: 'apt42-invite' },
    update: {},
    create: {
      name: 'Apartment 42',
      inviteCode: 'apt42-invite',
    },
  });

  console.log('  ✓ Group created');

  // --- Group Members ---
  // @@unique([userId, groupId]) lets us upsert on the combo.
  // Alice is the OWNER, Bob and Charlie are MEMBERS.

  const aliceMember = await prisma.groupMember.upsert({
    where: { userId_groupId: { userId: alice.id, groupId: group.id } },
    update: {},
    create: {
      userId: alice.id,
      groupId: group.id,
      role: Role.OWNER,
    },
  });

  const bobMember = await prisma.groupMember.upsert({
    where: { userId_groupId: { userId: bob.id, groupId: group.id } },
    update: {},
    create: {
      userId: bob.id,
      groupId: group.id,
      role: Role.MEMBER,
    },
  });

  const charlieMember = await prisma.groupMember.upsert({
    where: { userId_groupId: { userId: charlie.id, groupId: group.id } },
    update: {},
    create: {
      userId: charlie.id,
      groupId: group.id,
      role: Role.MEMBER,
    },
  });

  console.log('  ✓ Group members created');

  // --- Chores ---
  // No natural unique field on Chore, so we deleteMany + create for a clean slate.
  // This is fine for seed data — we want a predictable state every run.

  await prisma.choreCompletion.deleteMany({
    where: { assignment: { chore: { groupId: group.id } } },
  });
  await prisma.choreAssignment.deleteMany({
    where: { chore: { groupId: group.id } },
  });
  await prisma.chore.deleteMany({ where: { groupId: group.id } });

  const chores = await Promise.all([
    prisma.chore.create({
      data: {
        name: 'Vacuuming',
        points: 3,
        frequency: Frequency.WEEKLY,
        groupId: group.id,
      },
    }),
    prisma.chore.create({
      data: {
        name: 'Clean bathroom',
        points: 5,
        frequency: Frequency.WEEKLY,
        groupId: group.id,
      },
    }),
    prisma.chore.create({
      data: {
        name: 'Take out trash',
        points: 1,
        frequency: Frequency.DAILY,
        groupId: group.id,
      },
    }),
    prisma.chore.create({
      data: {
        name: 'Grocery shopping',
        points: 7,
        frequency: Frequency.WEEKLY,
        groupId: group.id,
      },
    }),
    prisma.chore.create({
      data: {
        name: 'Deep clean kitchen',
        points: 8,
        frequency: Frequency.MONTHLY,
        groupId: group.id,
      },
    }),
  ]);

  const [vacuuming, bathroom, trash, groceries, kitchen] = chores;

  console.log('  ✓ Chores created');

  // --- Assignments ---
  // Link members to chores. Not everyone does everything — that's realistic.

  const assignments = await Promise.all([
    // Alice does vacuuming, groceries, kitchen
    prisma.choreAssignment.create({
      data: { choreId: vacuuming.id, memberId: aliceMember.id },
    }),
    prisma.choreAssignment.create({
      data: { choreId: groceries.id, memberId: aliceMember.id },
    }),
    prisma.choreAssignment.create({
      data: { choreId: kitchen.id, memberId: aliceMember.id },
    }),
    // Bob does bathroom, trash, vacuuming
    prisma.choreAssignment.create({
      data: { choreId: bathroom.id, memberId: bobMember.id },
    }),
    prisma.choreAssignment.create({
      data: { choreId: trash.id, memberId: bobMember.id },
    }),
    prisma.choreAssignment.create({
      data: { choreId: vacuuming.id, memberId: bobMember.id },
    }),
    // Charlie does trash, groceries, bathroom
    prisma.choreAssignment.create({
      data: { choreId: trash.id, memberId: charlieMember.id },
    }),
    prisma.choreAssignment.create({
      data: { choreId: groceries.id, memberId: charlieMember.id },
    }),
    prisma.choreAssignment.create({
      data: { choreId: bathroom.id, memberId: charlieMember.id },
    }),
  ]);

  console.log('  ✓ Assignments created');

  // --- Completions ---
  // Spread unevenly so balances are interesting:
  //   Alice: vacuuming(3) + groceries(7) + kitchen(8) = 18 points
  //   Bob:   bathroom(5) + trash(1) + trash(1) = 7 points
  //   Charlie: trash(1) + groceries(7) = 8 points
  // This gives a clear imbalance to test with.

  await Promise.all([
    prisma.choreCompletion.create({
      data: {
        assignmentId: assignments[0].id,
        userId: alice.id,
        completedAt: daysAgo(6),
      },
    }),
    prisma.choreCompletion.create({
      data: {
        assignmentId: assignments[1].id,
        userId: alice.id,
        completedAt: daysAgo(3),
      },
    }),
    prisma.choreCompletion.create({
      data: {
        assignmentId: assignments[2].id,
        userId: alice.id,
        completedAt: daysAgo(1),
      },
    }),
    prisma.choreCompletion.create({
      data: {
        assignmentId: assignments[3].id,
        userId: bob.id,
        completedAt: daysAgo(5),
      },
    }),
    prisma.choreCompletion.create({
      data: {
        assignmentId: assignments[4].id,
        userId: bob.id,
        completedAt: daysAgo(4),
      },
    }),
    prisma.choreCompletion.create({
      data: {
        assignmentId: assignments[4].id,
        userId: bob.id,
        completedAt: daysAgo(2),
      },
    }),
    prisma.choreCompletion.create({
      data: {
        assignmentId: assignments[6].id,
        userId: charlie.id,
        completedAt: daysAgo(5),
      },
    }),
    prisma.choreCompletion.create({
      data: {
        assignmentId: assignments[7].id,
        userId: charlie.id,
        completedAt: daysAgo(1),
      },
    }),
  ]);

  console.log('  ✓ Completions created');
  console.log('🌱 Seeding complete!');
}

// Helper: returns a Date N days in the past
function daysAgo(n: number): Date {
  const d = new Date();
  d.setDate(d.getDate() - n);
  return d;
}

// --- Run ---
main()
  .catch((e) => {
    console.error('Seed failed:', e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
