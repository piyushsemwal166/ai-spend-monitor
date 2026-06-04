const { calculateCost } = require('../dist/src/utils/cost-calculator');
const { PrismaClient } = require('@prisma/client');
(async function(){
  try{
    const pricingFlash = { inputPricePerMillion: '0.35', outputPricePerMillion: '1.05' };
    const pricingPro = { inputPricePerMillion: '1.25', outputPricePerMillion: '10' };
    const cost1 = calculateCost(1000, 2000, pricingFlash);
    const cost2 = calculateCost(1000, 2000, pricingPro);
    console.log('flash cost', cost1.toString());
    console.log('pro cost', cost2.toString());
  } catch(e){
    console.error(e);
    process.exit(1);
  }
})();
