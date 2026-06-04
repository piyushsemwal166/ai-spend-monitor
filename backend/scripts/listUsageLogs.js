const { PrismaClient } = require('@prisma/client');
(async function(){
  const prisma = new PrismaClient();
  try{
    const rows = await prisma.usageLog.findMany({ take: 20, orderBy: { createdAt: 'desc' } });
    console.log(JSON.stringify(rows,null,2));
  } catch(e){
    console.error(e);
    process.exit(1);
  } finally{
    await prisma.$disconnect();
  }
})();
