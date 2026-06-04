const { PrismaClient } = require('@prisma/client');
(async function(){
  const prisma = new PrismaClient();
  try{
    const rows = await prisma.modelPricing.findMany();
    console.log('count', rows.length);
    console.log(JSON.stringify(rows, null, 2));
  } catch(e){
    console.error(e);
    process.exit(1);
  } finally{
    await prisma.$disconnect();
  }
})();
