const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

async function main() {
  const teams = await prisma.team.findMany({
    select: {
      id: true,
      members: {
        select: {
          userId: true,
          role: true,
          createdAt: true,
        },
        orderBy: { createdAt: "asc" },
      },
    },
  });

  let updatedTeams = 0;
  let promotedMembers = 0;

  for (const team of teams) {
    const owner = team.members.find((member) => member.role === "OWNER");

    if (owner) {
      continue;
    }

    const primaryMember = team.members[0];
    if (!primaryMember) {
      continue;
    }

    await prisma.teamMember.update({
      where: { userId: primaryMember.userId },
      data: { role: "OWNER" },
    });

    updatedTeams += 1;
    promotedMembers += 1;
  }

  console.log(JSON.stringify({ teamsChecked: teams.length, updatedTeams, promotedMembers }));
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });