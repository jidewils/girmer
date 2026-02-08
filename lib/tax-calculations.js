// Canadian Tax Data 2025
export const FEDERAL_BRACKETS = [
  { min: 0, max: 55867, rate: 0.15 },
  { min: 55867, max: 111733, rate: 0.205 },
  { min: 111733, max: 173205, rate: 0.26 },
  { min: 173205, max: 246752, rate: 0.29 },
  { min: 246752, max: Infinity, rate: 0.33 },
];

export const PROVINCIAL_BRACKETS = {
  ON: [
    { min: 0, max: 51446, rate: 0.0505 },
    { min: 51446, max: 102894, rate: 0.0915 },
    { min: 102894, max: 150000, rate: 0.1116 },
    { min: 150000, max: 220000, rate: 0.1216 },
    { min: 220000, max: Infinity, rate: 0.1316 },
  ],
  BC: [
    { min: 0, max: 47937, rate: 0.0506 },
    { min: 47937, max: 95875, rate: 0.077 },
    { min: 95875, max: 110076, rate: 0.105 },
    { min: 110076, max: 133664, rate: 0.1229 },
    { min: 133664, max: 181232, rate: 0.147 },
    { min: 181232, max: Infinity, rate: 0.168 },
  ],
  AB: [
    { min: 0, max: 148269, rate: 0.10 },
    { min: 148269, max: 177922, rate: 0.12 },
    { min: 177922, max: 237230, rate: 0.13 },
    { min: 237230, max: 355845, rate: 0.14 },
    { min: 355845, max: Infinity, rate: 0.15 },
  ],
  QC: [
    { min: 0, max: 51780, rate: 0.14 },
    { min: 51780, max: 103545, rate: 0.19 },
    { min: 103545, max: 126000, rate: 0.24 },
    { min: 126000, max: Infinity, rate: 0.2575 },
  ],
  MB: [
    { min: 0, max: 47000, rate: 0.108 },
    { min: 47000, max: 100000, rate: 0.1275 },
    { min: 100000, max: Infinity, rate: 0.174 },
  ],
  SK: [
    { min: 0, max: 52057, rate: 0.105 },
    { min: 52057, max: 148734, rate: 0.125 },
    { min: 148734, max: Infinity, rate: 0.145 },
  ],
  NS: [
    { min: 0, max: 29590, rate: 0.0879 },
    { min: 29590, max: 59180, rate: 0.1495 },
    { min: 59180, max: 93000, rate: 0.1667 },
    { min: 93000, max: 150000, rate: 0.175 },
    { min: 150000, max: Infinity, rate: 0.21 },
  ],
  NB: [
    { min: 0, max: 49958, rate: 0.094 },
    { min: 49958, max: 99916, rate: 0.14 },
    { min: 99916, max: 185064, rate: 0.16 },
    { min: 185064, max: Infinity, rate: 0.195 },
  ],
  NL: [
    { min: 0, max: 43198, rate: 0.087 },
    { min: 43198, max: 86395, rate: 0.145 },
    { min: 86395, max: 154244, rate: 0.158 },
    { min: 154244, max: 215943, rate: 0.178 },
    { min: 215943, max: 275870, rate: 0.198 },
    { min: 275870, max: 551739, rate: 0.208 },
    { min: 551739, max: 1103478, rate: 0.213 },
    { min: 1103478, max: Infinity, rate: 0.218 },
  ],
  PE: [
    { min: 0, max: 32656, rate: 0.0965 },
    { min: 32656, max: 64313, rate: 0.1363 },
    { min: 64313, max: 105000, rate: 0.1665 },
    { min: 105000, max: 140000, rate: 0.18 },
    { min: 140000, max: Infinity, rate: 0.1875 },
  ],
  NT: [
    { min: 0, max: 50597, rate: 0.059 },
    { min: 50597, max: 101198, rate: 0.086 },
    { min: 101198, max: 164525, rate: 0.122 },
    { min: 164525, max: Infinity, rate: 0.1405 },
  ],
  NU: [
    { min: 0, max: 53268, rate: 0.04 },
    { min: 53268, max: 106537, rate: 0.07 },
    { min: 106537, max: 173205, rate: 0.09 },
    { min: 173205, max: Infinity, rate: 0.115 },
  ],
  YT: [
    { min: 0, max: 55867, rate: 0.064 },
    { min: 55867, max: 111733, rate: 0.09 },
    { min: 111733, max: 173205, rate: 0.109 },
    { min: 173205, max: 500000, rate: 0.128 },
    { min: 500000, max: Infinity, rate: 0.15 },
  ],
};

export const PROVINCE_NAMES = {
  ON: 'Ontario',
  BC: 'British Columbia',
  AB: 'Alberta',
  QC: 'Quebec',
  MB: 'Manitoba',
  SK: 'Saskatchewan',
  NS: 'Nova Scotia',
  NB: 'New Brunswick',
  NL: 'Newfoundland & Labrador',
  PE: 'Prince Edward Island',
  NT: 'Northwest Territories',
  NU: 'Nunavut',
  YT: 'Yukon',
};

// CPP/EI Constants 2025
export const CPP_MAX_EARNINGS = 71300;
export const CPP_BASIC_EXEMPTION = 3500;
export const CPP_RATE = 0.0595;
export const CPP2_MAX_EARNINGS = 81200;
export const CPP2_RATE = 0.04;
export const EI_MAX_EARNINGS = 65700;
export const EI_RATE = 0.0164;

// RRSP Constants 2025
export const RRSP_LIMIT_2025 = 32490;
export const RRSP_RATE = 0.18;

// Corporate Tax Rates 2025
export const CORPORATE_TAX = {
  SMALL_BUSINESS_LIMIT: 500000,
  SMALL_BUSINESS_FEDERAL_RATE: 0.09,
  GENERAL_FEDERAL_RATE: 0.15,
  PROVINCIAL_SMALL_BUSINESS: {
    ON: 0.032, BC: 0.02, AB: 0.02, QC: 0.035, MB: 0.00, SK: 0.01,
    NS: 0.025, NB: 0.025, NL: 0.03, PE: 0.01, NT: 0.02, NU: 0.03, YT: 0.00,
  },
  PROVINCIAL_GENERAL: {
    ON: 0.115, BC: 0.12, AB: 0.08, QC: 0.117, MB: 0.12, SK: 0.12,
    NS: 0.14, NB: 0.14, NL: 0.15, PE: 0.16, NT: 0.115, NU: 0.12, YT: 0.12,
  },
};

// Canada Child Benefit 2024-2025
export const CCB = {
  MAX_UNDER_6: 7787,
  MAX_6_TO_17: 6570,
  PHASE_OUT_THRESHOLD_1: 36502,
  PHASE_OUT_THRESHOLD_2: 79087,
  PHASE_OUT_RATE_1_ONE_CHILD: 0.07,
  PHASE_OUT_RATE_1_MULTI_CHILD: 0.135,
  PHASE_OUT_RATE_2_ONE_CHILD: 0.032,
  PHASE_OUT_RATE_2_MULTI_CHILD: 0.057,
};

// Default interest rates for debt
export const DEFAULT_INTEREST_RATES = {
  creditCard: 20.0,
  lineOfCredit: 9.0,
  carLoan: 7.0,
  studentLoan: 6.0,
  mortgage: 5.5,
  other: 10.0,
};

// ==================== CORE TAX FUNCTIONS ====================

export function calculateTax(income, brackets) {
  let tax = 0;
  let details = [];
  
  for (const bracket of brackets) {
    if (income > bracket.min) {
      const taxableInBracket = Math.min(income, bracket.max) - bracket.min;
      const taxInBracket = taxableInBracket * bracket.rate;
      tax += taxInBracket;
      if (taxableInBracket > 0) {
        details.push({
          range: `$${bracket.min.toLocaleString()} - $${bracket.max === Infinity ? '+' : bracket.max.toLocaleString()}`,
          rate: (bracket.rate * 100).toFixed(2) + '%',
          taxable: taxableInBracket,
          tax: taxInBracket,
        });
      }
    }
  }
  
  return { total: tax, details };
}

export function calculateCPP(income, isSelfEmployed) {
  const pensionableEarnings = Math.min(income, CPP_MAX_EARNINGS) - CPP_BASIC_EXEMPTION;
  const baseCPP = Math.max(0, pensionableEarnings) * CPP_RATE;
  
  const cpp2Earnings = Math.min(income, CPP2_MAX_EARNINGS) - CPP_MAX_EARNINGS;
  const cpp2 = Math.max(0, cpp2Earnings) * CPP2_RATE;
  
  const total = baseCPP + cpp2;
  return isSelfEmployed ? total * 2 : total;
}

export function calculateEI(income, isSelfEmployed) {
  if (isSelfEmployed) return 0;
  return Math.min(income, EI_MAX_EARNINGS) * EI_RATE;
}

// ==================== FAMILY MODE FUNCTIONS ====================

export function calculateCCB(familyIncome, children) {
  if (!children || children.length === 0) {
    return { annual: 0, monthly: 0, breakdown: [] };
  }

  const childrenUnder6 = children.filter(c => c.age < 6);
  const children6to17 = children.filter(c => c.age >= 6 && c.age < 18);
  
  let baseCCB = (childrenUnder6.length * CCB.MAX_UNDER_6) + (children6to17.length * CCB.MAX_6_TO_17);
  
  const breakdown = [];
  childrenUnder6.forEach((child, i) => {
    breakdown.push({ 
      label: `Child ${i + 1} (under 6)`, 
      age: child.age,
      baseAmount: CCB.MAX_UNDER_6 
    });
  });
  children6to17.forEach((child, i) => {
    breakdown.push({ 
      label: `Child ${childrenUnder6.length + i + 1} (6-17)`, 
      age: child.age,
      baseAmount: CCB.MAX_6_TO_17 
    });
  });

  let reduction = 0;
  const numChildren = children.length;

  if (familyIncome > CCB.PHASE_OUT_THRESHOLD_1) {
    const excessIncome1 = Math.min(familyIncome, CCB.PHASE_OUT_THRESHOLD_2) - CCB.PHASE_OUT_THRESHOLD_1;
    const rate1 = numChildren === 1 ? CCB.PHASE_OUT_RATE_1_ONE_CHILD : CCB.PHASE_OUT_RATE_1_MULTI_CHILD;
    reduction += excessIncome1 * rate1;
  }

  if (familyIncome > CCB.PHASE_OUT_THRESHOLD_2) {
    const excessIncome2 = familyIncome - CCB.PHASE_OUT_THRESHOLD_2;
    const rate2 = numChildren === 1 ? CCB.PHASE_OUT_RATE_2_ONE_CHILD : CCB.PHASE_OUT_RATE_2_MULTI_CHILD;
    reduction += excessIncome2 * rate2;
  }

  const finalCCB = Math.max(0, baseCCB - reduction);

  return {
    annual: Math.round(finalCCB),
    monthly: Math.round(finalCCB / 12),
    baseBenefit: Math.round(baseCCB),
    reduction: Math.round(reduction),
    breakdown,
  };
}

export function calculateFamilyTax(primaryIncome, spouseIncome, province, primarySelfEmployed = false, spouseSelfEmployed = false, primaryRRSP = 0, spouseRRSP = 0) {
  // Primary earner calculations
  const primaryTaxableIncome = Math.max(0, primaryIncome - primaryRRSP);
  const primaryFederalTax = calculateTax(primaryTaxableIncome, FEDERAL_BRACKETS);
  const primaryProvincialTax = calculateTax(primaryTaxableIncome, PROVINCIAL_BRACKETS[province]);
  const primaryCPP = calculateCPP(primaryIncome, primarySelfEmployed);
  const primaryEI = calculateEI(primaryIncome, primarySelfEmployed);
  const primaryTotalDeductions = primaryFederalTax.total + primaryProvincialTax.total + primaryCPP + primaryEI;
  const primaryNetAnnual = primaryIncome - primaryTotalDeductions - primaryRRSP;

  let spouseCalc = null;
  if (spouseIncome > 0) {
    const spouseTaxableIncome = Math.max(0, spouseIncome - spouseRRSP);
    const spouseFederalTax = calculateTax(spouseTaxableIncome, FEDERAL_BRACKETS);
    const spouseProvincialTax = calculateTax(spouseTaxableIncome, PROVINCIAL_BRACKETS[province]);
    const spouseCPP = calculateCPP(spouseIncome, spouseSelfEmployed);
    const spouseEI = calculateEI(spouseIncome, spouseSelfEmployed);
    const spouseTotalDeductions = spouseFederalTax.total + spouseProvincialTax.total + spouseCPP + spouseEI;
    const spouseNetAnnual = spouseIncome - spouseTotalDeductions - spouseRRSP;

    spouseCalc = {
      grossIncome: spouseIncome,
      taxableIncome: spouseTaxableIncome,
      federalTax: spouseFederalTax,
      provincialTax: spouseProvincialTax,
      cpp: spouseCPP,
      ei: spouseEI,
      totalDeductions: spouseTotalDeductions,
      netAnnual: spouseNetAnnual,
      netMonthly: spouseNetAnnual / 12,
      rrspContribution: spouseRRSP,
    };
  }

  const familyGrossIncome = primaryIncome + (spouseIncome || 0);
  const familyNetAnnual = primaryNetAnnual + (spouseCalc?.netAnnual || 0);

  return {
    primary: {
      grossIncome: primaryIncome,
      taxableIncome: primaryTaxableIncome,
      federalTax: primaryFederalTax,
      provincialTax: primaryProvincialTax,
      cpp: primaryCPP,
      ei: primaryEI,
      totalDeductions: primaryTotalDeductions,
      netAnnual: primaryNetAnnual,
      netMonthly: primaryNetAnnual / 12,
      rrspContribution: primaryRRSP,
    },
    spouse: spouseCalc,
    family: {
      grossIncome: familyGrossIncome,
      netAnnual: familyNetAnnual,
      netMonthly: familyNetAnnual / 12,
    },
  };
}

// ==================== HOURLY RATE CALCULATOR ====================

export function calculateAnnualFromHourly(hourlyRate, hoursPerWeek, weeksPerYear) {
  return hourlyRate * hoursPerWeek * weeksPerYear;
}

// ==================== INCORPORATED (CORP) TAX FUNCTIONS ====================

export function calculateCorporateTax(corporateIncome, province) {
  const smallBusinessLimit = CORPORATE_TAX.SMALL_BUSINESS_LIMIT;
  
  let federalTax = 0;
  let provincialTax = 0;
  
  const smallBusinessIncome = Math.min(corporateIncome, smallBusinessLimit);
  const generalIncome = Math.max(0, corporateIncome - smallBusinessLimit);
  
  federalTax += smallBusinessIncome * CORPORATE_TAX.SMALL_BUSINESS_FEDERAL_RATE;
  federalTax += generalIncome * CORPORATE_TAX.GENERAL_FEDERAL_RATE;
  
  provincialTax += smallBusinessIncome * (CORPORATE_TAX.PROVINCIAL_SMALL_BUSINESS[province] || 0.03);
  provincialTax += generalIncome * (CORPORATE_TAX.PROVINCIAL_GENERAL[province] || 0.12);
  
  const totalTax = federalTax + provincialTax;
  const afterTaxIncome = corporateIncome - totalTax;
  const effectiveRate = corporateIncome > 0 ? (totalTax / corporateIncome) * 100 : 0;
  
  return {
    corporateIncome,
    smallBusinessIncome,
    generalIncome,
    federalTax,
    provincialTax,
    totalTax,
    afterTaxIncome,
    effectiveRate,
  };
}

export function compareSalaryVsDividend(corporateIncome, province, personalNeeds) {
  // Option 1: All salary
  const salaryCorpTaxableIncome = Math.max(0, corporateIncome - personalNeeds);
  const salaryCorpTax = calculateCorporateTax(salaryCorpTaxableIncome, province);
  const salaryPersonalTax = calculateTax(personalNeeds, FEDERAL_BRACKETS).total + 
                           calculateTax(personalNeeds, PROVINCIAL_BRACKETS[province]).total;
  const salaryCPP = calculateCPP(personalNeeds, true);
  
  const salaryOption = {
    type: 'salary',
    grossPay: personalNeeds,
    corporateTax: salaryCorpTax.totalTax,
    personalTax: salaryPersonalTax,
    cpp: salaryCPP,
    totalTax: salaryCorpTax.totalTax + salaryPersonalTax + salaryCPP,
    netPersonal: personalNeeds - salaryPersonalTax - salaryCPP,
    retainedInCorp: salaryCorpTax.afterTaxIncome,
  };

  // Option 2: All dividend
  const dividendCorpTax = calculateCorporateTax(corporateIncome, province);
  const grossedUpDividend = personalNeeds * 1.38;
  const dividendFederalTax = calculateTax(grossedUpDividend, FEDERAL_BRACKETS).total;
  const dividendProvincialTax = calculateTax(grossedUpDividend, PROVINCIAL_BRACKETS[province]).total;
  const federalCredit = grossedUpDividend * 0.150198;
  const provincialCredit = grossedUpDividend * 0.10;
  
  const dividendOption = {
    type: 'dividend',
    grossPay: personalNeeds,
    corporateTax: dividendCorpTax.totalTax,
    personalTax: Math.max(0, dividendFederalTax + dividendProvincialTax - federalCredit - provincialCredit),
    cpp: 0,
    totalTax: 0,
    netPersonal: 0,
    retainedInCorp: 0,
  };
  dividendOption.totalTax = dividendCorpTax.totalTax + dividendOption.personalTax;
  dividendOption.netPersonal = personalNeeds - dividendOption.personalTax;
  dividendOption.retainedInCorp = dividendCorpTax.afterTaxIncome - personalNeeds;

  // Option 3: Mix
  const optimalSalary = Math.min(personalNeeds, CPP_MAX_EARNINGS);
  const remainingNeed = Math.max(0, personalNeeds - optimalSalary);
  
  const mixCorpTaxableIncome = Math.max(0, corporateIncome - optimalSalary);
  const mixCorpTax = calculateCorporateTax(mixCorpTaxableIncome, province);
  const mixSalaryTax = calculateTax(optimalSalary, FEDERAL_BRACKETS).total + 
                       calculateTax(optimalSalary, PROVINCIAL_BRACKETS[province]).total;
  const mixCPP = calculateCPP(optimalSalary, true);
  
  const mixGrossedUpDividend = remainingNeed * 1.38;
  const mixDividendTax = Math.max(0, 
    calculateTax(mixGrossedUpDividend, FEDERAL_BRACKETS).total +
    calculateTax(mixGrossedUpDividend, PROVINCIAL_BRACKETS[province]).total -
    (mixGrossedUpDividend * 0.150198) -
    (mixGrossedUpDividend * 0.10)
  );
  
  const mixOption = {
    type: 'mix',
    salary: optimalSalary,
    dividend: remainingNeed,
    grossPay: personalNeeds,
    corporateTax: mixCorpTax.totalTax,
    personalTax: mixSalaryTax + mixDividendTax,
    cpp: mixCPP,
    totalTax: mixCorpTax.totalTax + mixSalaryTax + mixDividendTax + mixCPP,
    netPersonal: personalNeeds - mixSalaryTax - mixDividendTax - mixCPP,
    retainedInCorp: mixCorpTax.afterTaxIncome - remainingNeed,
  };

  const options = [salaryOption, dividendOption, mixOption];
  const bestOption = options.reduce((best, current) => 
    current.totalTax < best.totalTax ? current : best
  );

  return {
    salary: salaryOption,
    dividend: dividendOption,
    mix: mixOption,
    recommended: bestOption.type,
    taxSavings: Math.max(salaryOption.totalTax, dividendOption.totalTax) - bestOption.totalTax,
  };
}

// ==================== DEBT PAYOFF FUNCTIONS ====================

export function calculateDebtPayoff(debts, extraMonthlyPayment = 0) {
  if (!debts || debts.length === 0) {
    return { totalDebt: 0, totalMonthlyInterest: 0, strategies: null };
  }

  const totalDebt = debts.reduce((sum, d) => sum + (d.balance || 0), 0);
  const totalMonthlyInterest = debts.reduce((sum, d) => {
    const monthlyRate = (d.rate || 0) / 100 / 12;
    return sum + ((d.balance || 0) * monthlyRate);
  }, 0);
  const totalMinPayment = debts.reduce((sum, d) => sum + (d.minPayment || 0), 0);

  const avalancheOrder = [...debts].filter(d => d.balance > 0).sort((a, b) => (b.rate || 0) - (a.rate || 0));
  const snowballOrder = [...debts].filter(d => d.balance > 0).sort((a, b) => (a.balance || 0) - (b.balance || 0));

  const simulatePayoff = (orderedDebts, monthlyExtra) => {
    let remainingDebts = orderedDebts.map(d => ({ ...d, remaining: d.balance }));
    let totalInterestPaid = 0;
    let months = 0;
    const maxMonths = 360;

    while (remainingDebts.some(d => d.remaining > 0) && months < maxMonths) {
      months++;
      let extraAvailable = monthlyExtra;

      for (const debt of remainingDebts) {
        if (debt.remaining <= 0) continue;

        const monthlyRate = (debt.rate || 0) / 100 / 12;
        const interest = debt.remaining * monthlyRate;
        totalInterestPaid += interest;

        let payment = (debt.minPayment || 0) + extraAvailable;
        extraAvailable = 0;

        const totalOwed = debt.remaining + interest;
        if (payment >= totalOwed) {
          extraAvailable = payment - totalOwed;
          debt.remaining = 0;
        } else {
          debt.remaining = totalOwed - payment;
        }
      }
    }

    return { months, totalInterestPaid: Math.round(totalInterestPaid) };
  };

  const avalancheResult = simulatePayoff(avalancheOrder, extraMonthlyPayment);
  const snowballResult = simulatePayoff(snowballOrder, extraMonthlyPayment);

  return {
    totalDebt,
    totalMonthlyInterest: Math.round(totalMonthlyInterest),
    totalMinPayment,
    strategies: {
      avalanche: {
        name: 'Avalanche (Highest Interest First)',
        order: avalancheOrder.map(d => d.name),
        months: avalancheResult.months,
        totalInterest: avalancheResult.totalInterestPaid,
        description: 'Pay minimum on all debts, put extra toward highest interest rate first.',
      },
      snowball: {
        name: 'Snowball (Lowest Balance First)',
        order: snowballOrder.map(d => d.name),
        months: snowballResult.months,
        totalInterest: snowballResult.totalInterestPaid,
        description: 'Pay minimum on all debts, put extra toward smallest balance first.',
      },
      recommended: avalancheResult.totalInterestPaid <= snowballResult.totalInterestPaid ? 'avalanche' : 'snowball',
      interestSaved: Math.abs(avalancheResult.totalInterestPaid - snowballResult.totalInterestPaid),
    },
  };
}
