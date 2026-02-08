// Affiliate Links Configuration
// Your affiliate links + destination URLs for other platforms

export const AFFILIATE_LINKS = {
  // Investment Platforms
  wealthsimple: {
    name: 'Wealthsimple',
    url: 'https://www.wealthsimple.com/invite/HQXJSS',
    isAffiliate: true,
    description: 'Robo-advisor & self-directed investing',
    bonus: 'Get a cash bonus when you sign up',
  },
  questrade: {
    name: 'Questrade',
    url: 'https://www.questrade.com/self-directed-investing',
    isAffiliate: false,
    description: 'Self-directed investing with $0 ETF purchases',
  },
  
  // High-Interest Savings
  eqBank: {
    name: 'EQ Bank',
    url: 'https://join.eqbank.ca/?code=BABAJIDE7371',
    isAffiliate: true,
    description: 'High-interest savings account (4%+)',
    bonus: 'Get $20 when you register',
  },
  tangerine: {
    name: 'Tangerine',
    url: 'https://www.tangerine.ca/en/products/saving/savings-accounts',
    isAffiliate: false,
    description: 'No-fee banking with promotional rates',
  },
  
  // Tax Software
  wealthsimpleTax: {
    name: 'Wealthsimple Tax',
    url: 'https://www.wealthsimple.com/en-ca/tax',
    isAffiliate: false,
    description: 'Free tax filing for Canadians',
  },
  turbotax: {
    name: 'TurboTax',
    url: 'https://turbotax.intuit.ca',
    isAffiliate: false,
    description: 'Popular tax software with CRA integration',
  },
  
  // Credit & Debt
  ratehubCreditCards: {
    name: 'Ratehub Credit Cards',
    url: 'https://www.ratehub.ca/credit-cards/balance-transfer',
    isAffiliate: false,
    description: 'Compare balance transfer credit cards',
  },
  borrowell: {
    name: 'Borrowell',
    url: 'https://borrowell.com/free-credit-score',
    isAffiliate: false,
    description: 'Free credit score monitoring',
  },
  loansCanada: {
    name: 'Loans Canada',
    url: 'https://loanscanada.ca/debt-consolidation',
    isAffiliate: false,
    description: 'Debt consolidation options',
  },
  
  // Mortgage & Home
  ratehubMortgage: {
    name: 'Ratehub Mortgages',
    url: 'https://www.ratehub.ca/best-mortgage-rates',
    isAffiliate: false,
    description: 'Compare mortgage rates',
  },
  wealthsimpleFHSA: {
    name: 'Wealthsimple FHSA',
    url: 'https://www.wealthsimple.com/en-ca/accounts/fhsa',
    isAffiliate: false,
    description: 'First Home Savings Account',
  },
};

// Get affiliate link by key
export function getAffiliateLink(key) {
  return AFFILIATE_LINKS[key] || null;
}

// Get all links in a category
export function getLinksByCategory(category) {
  const categories = {
    investment: ['wealthsimple', 'questrade'],
    savings: ['eqBank', 'tangerine'],
    tax: ['wealthsimpleTax', 'turbotax'],
    debt: ['ratehubCreditCards', 'borrowell', 'loansCanada'],
    mortgage: ['ratehubMortgage', 'wealthsimpleFHSA'],
  };
  
  return (categories[category] || []).map(key => ({
    key,
    ...AFFILIATE_LINKS[key]
  }));
}

// Disclosure text for affiliate links
export const AFFILIATE_DISCLOSURE = {
  short: 'Partner link — we may earn a commission at no cost to you.',
  full: 'Some links on this page are affiliate links. This means we may earn a commission if you sign up through our link, at no extra cost to you. We only recommend products we believe in.',
};
