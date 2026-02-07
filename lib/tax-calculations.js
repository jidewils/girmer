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
