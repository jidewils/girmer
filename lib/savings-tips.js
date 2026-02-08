import { RRSP_RATE, RRSP_LIMIT_2025 } from './tax-calculations';

export function generateSavingsTips(grossIncome, netMonthly, savingsRate, totalExpenses, monthlySavings, rrspContribution) {
  const tips = [];
  
  // Income tier detection
  const isLowIncome = grossIncome < 50000;
  const isMidIncome = grossIncome >= 50000 && grossIncome < 100000;
  const isHighIncome = grossIncome >= 100000 && grossIncome < 200000;
  const isVeryHighIncome = grossIncome >= 200000;
  
  // Calculate suggested savings amounts
  const suggested10Percent = netMonthly * 0.10;
  const suggested15Percent = netMonthly * 0.15;
  const suggested20Percent = netMonthly * 0.20;
  
  // Emergency fund calculations
  const emergencyFund3Months = totalExpenses * 3;
  const emergencyFund6Months = totalExpenses * 6;
  
  // RRSP calculations
  const maxRRSP = Math.min(grossIncome * RRSP_RATE, RRSP_LIMIT_2025);
  const remainingRRSPRoom = Math.max(0, maxRRSP - rrspContribution);
  
  // TFSA
  const tfsaAnnualLimit = 7000;
  const tfsaMonthly = Math.round(tfsaAnnualLimit / 12);
  
  // ===== SAVINGS RATE BASED TIPS =====
  if (savingsRate < 0) {
    tips.push({
      icon: '🚨',
      title: 'Spending Exceeds Income',
      description: `You're spending $${Math.abs(monthlySavings).toLocaleString()} more than you earn. Review your expenses urgently — look for subscriptions to cancel, negotiate bills, or find ways to increase income.`,
      priority: 'critical'
    });
  } else if (savingsRate < 5) {
    tips.push({
      icon: '⚠️',
      title: 'Build Your Safety Net First',
      description: `At ${savingsRate.toFixed(1)}% savings rate, focus on building a $1,000 emergency starter fund before anything else. Try the "no-spend challenge" for one category each month.`,
      priority: 'high'
    });
  } else if (savingsRate < 10) {
    tips.push({
      icon: '📈',
      title: 'Push Toward 10%',
      description: `You're saving $${monthlySavings.toLocaleString(undefined, {maximumFractionDigits: 0})}/month (${savingsRate.toFixed(1)}%). Adding just $${(suggested10Percent - monthlySavings).toLocaleString(undefined, {maximumFractionDigits: 0})} more would hit the 10% benchmark — that's $${((suggested10Percent - monthlySavings) / 30).toFixed(0)} less per day.`,
      priority: 'medium'
    });
  } else if (savingsRate < 15) {
    tips.push({
      icon: '✅',
      title: 'Solid Foundation — Now Optimize',
      description: `${savingsRate.toFixed(1)}% is good! To reach 15% ($${suggested15Percent.toLocaleString(undefined, {maximumFractionDigits: 0})}/month), consider automating an extra $${(suggested15Percent - monthlySavings).toLocaleString(undefined, {maximumFractionDigits: 0})} transfer on payday.`,
      priority: 'low'
    });
  } else if (savingsRate < 20) {
    tips.push({
      icon: '🎯',
      title: 'Above Average — Keep Pushing',
      description: `At ${savingsRate.toFixed(1)}%, you're ahead of most Canadians. The 20% mark ($${suggested20Percent.toLocaleString(undefined, {maximumFractionDigits: 0})}/month) is where wealth building accelerates.`,
      priority: 'low'
    });
  } else if (savingsRate < 30) {
    tips.push({
      icon: '🏆',
      title: 'Excellent Saver',
      description: `${savingsRate.toFixed(1)}% savings rate puts you in the top tier. At $${monthlySavings.toLocaleString(undefined, {maximumFractionDigits: 0})}/month, you'll save $${(monthlySavings * 12).toLocaleString(undefined, {maximumFractionDigits: 0})}/year. Consider if you can push to 30% for early financial independence.`,
      priority: 'info'
    });
  } else {
    tips.push({
      icon: '🔥',
      title: 'Financial Independence Track',
      description: `${savingsRate.toFixed(1)}% is exceptional! At this rate, you could potentially reach financial independence in 15-20 years. Make sure you're not sacrificing quality of life — balance is key.`,
      priority: 'info'
    });
  }
  
  // ===== INCOME-BASED TIPS =====
  if (isLowIncome) {
    tips.push({
      icon: '💡',
      title: 'Maximize Government Benefits',
      description: `At your income level, ensure you're claiming: GST/HST credit (up to $519/year), Canada Workers Benefit (up to $1,518), and provincial benefits. File taxes even with low income to access these.`,
      priority: 'high'
    });
    
    tips.push({
      icon: '🏦',
      title: 'TFSA Over RRSP',
      description: `With income under $50K, prioritize TFSA first. RRSP deductions are more valuable at higher tax brackets — save that room for when your income grows.`,
      priority: 'medium'
    });
  }
  
  if (isMidIncome) {
    tips.push({
      icon: '⚖️',
      title: 'Balance TFSA and RRSP',
      description: `At $${grossIncome.toLocaleString()} income, split contributions: TFSA for flexible savings, RRSP for tax deduction. Your RRSP contribution could save ~$${(Math.min(5000, remainingRRSPRoom) * 0.30).toLocaleString(undefined, {maximumFractionDigits: 0})} in taxes.`,
      priority: 'medium'
    });
    
    if (monthlySavings > 500) {
      tips.push({
        icon: '📊',
        title: 'Start Investing',
        description: `With $${monthlySavings.toLocaleString(undefined, {maximumFractionDigits: 0})}/month to save, consider low-cost index ETFs. A simple 3-fund portfolio (Canadian, US, International) can be set up with $${Math.min(monthlySavings, 500).toLocaleString()}/month auto-investments.`,
        priority: 'medium'
      });
    }
  }
  
  if (isHighIncome) {
    tips.push({
      icon: '🎯',
      title: 'Max Out Registered Accounts',
      description: `Your income supports maxing RRSP ($${maxRRSP.toLocaleString(undefined, {maximumFractionDigits: 0})}/year) and TFSA ($${tfsaAnnualLimit.toLocaleString()}/year). That's $${((maxRRSP + tfsaAnnualLimit) / 12).toLocaleString(undefined, {maximumFractionDigits: 0})}/month in tax-advantaged savings.`,
      priority: 'high'
    });
    
    tips.push({
      icon: '💼',
      title: 'Consider Income Splitting',
      description: `If you have a spouse with lower income, spousal RRSP contributions can reduce family tax burden. Also explore pension income splitting if applicable.`,
      priority: 'medium'
    });
    
    tips.push({
      icon: '🏠',
      title: 'First Home Savings Account (FHSA)',
      description: `If you're a first-time home buyer, the FHSA offers $8,000/year contribution room with tax deduction AND tax-free growth. It's like RRSP + TFSA combined.`,
      priority: 'medium'
    });
  }
  
  if (isVeryHighIncome) {
    tips.push({
      icon: '🏛️',
      title: 'Beyond Registered Accounts',
      description: `After maxing RRSP and TFSA, consider: non-registered investments (tax-efficient ETFs), corporate class funds, or if self-employed, incorporating for tax deferral.`,
      priority: 'high'
    });
    
    tips.push({
      icon: '📋',
      title: 'Tax Planning Strategies',
      description: `At $${grossIncome.toLocaleString()} income, professional tax planning pays for itself. Consider: charitable donation strategies, capital gains timing, prescribed rate loans for income splitting.`,
      priority: 'high'
    });
    
    tips.push({
      icon: '🛡️',
      title: 'Protect Your Income',
      description: `Your high income is your biggest asset. Ensure adequate disability insurance (aim for 60-70% income replacement) and consider umbrella liability coverage.`,
      priority: 'medium'
    });
  }
  
  // ===== RRSP SPECIFIC TIPS =====
  if (rrspContribution > 0) {
    tips.push({
      icon: '💰',
      title: 'RRSP Tax Refund Strategy',
      description: `Your $${rrspContribution.toLocaleString()} RRSP contribution will generate a tax refund. Pro tip: Reinvest that refund into your TFSA or next year's RRSP to compound the benefit.`,
      priority: 'medium'
    });
  }
  
  if (remainingRRSPRoom > 5000 && grossIncome > 60000) {
    tips.push({
      icon: '📅',
      title: 'RRSP Room Available',
      description: `You have ~$${remainingRRSPRoom.toLocaleString(undefined, {maximumFractionDigits: 0})} RRSP room remaining. Contributing $${Math.min(remainingRRSPRoom, monthlySavings * 3).toLocaleString(undefined, {maximumFractionDigits: 0})} more could save ~$${(Math.min(remainingRRSPRoom, monthlySavings * 3) * 0.30).toLocaleString(undefined, {maximumFractionDigits: 0})} in taxes.`,
      priority: 'medium'
    });
  }
  
  // ===== EMERGENCY FUND TIPS =====
  if (totalExpenses > 0) {
    if (monthlySavings > 0 && monthlySavings < emergencyFund3Months / 6) {
      const monthsToGoal = Math.ceil(emergencyFund3Months / monthlySavings);
      tips.push({
        icon: '🏦',
        title: 'Emergency Fund Timeline',
        description: `At $${monthlySavings.toLocaleString(undefined, {maximumFractionDigits: 0})}/month savings, you'll reach a 3-month emergency fund ($${emergencyFund3Months.toLocaleString(undefined, {maximumFractionDigits: 0})}) in ${monthsToGoal} months. Keep it in a high-interest savings account (2-4% available).`,
        priority: 'medium'
      });
    } else if (monthlySavings >= emergencyFund3Months / 6) {
      tips.push({
        icon: '✨',
        title: 'Fast-Track Emergency Fund',
        description: `Great news! You can build a 3-month emergency fund ($${emergencyFund3Months.toLocaleString(undefined, {maximumFractionDigits: 0})}) in under 6 months. Consider a 6-month fund ($${emergencyFund6Months.toLocaleString(undefined, {maximumFractionDigits: 0})}) for extra security.`,
        priority: 'low'
      });
    }
  }
  
  // ===== EXPENSE-BASED TIPS =====
  if (totalExpenses > netMonthly * 0.7) {
    tips.push({
      icon: '🔍',
      title: 'High Expense Ratio',
      description: `Your expenses consume ${((totalExpenses / netMonthly) * 100).toFixed(0)}% of income. The 50/30/20 rule suggests max 50% on needs. Review your largest expense categories for potential cuts.`,
      priority: 'high'
    });
  }
  
  // ===== AUTOMATION TIP =====
  tips.push({
    icon: '🤖',
    title: 'Automate Your Savings',
    description: `Set up automatic transfers on payday: $${suggested15Percent.toLocaleString(undefined, {maximumFractionDigits: 0})} to savings (15%), $${tfsaMonthly} to TFSA, and $${Math.round(maxRRSP / 12).toLocaleString()} to RRSP. What you don't see, you won't spend.`,
    priority: 'low'
  });
  
  // ===== INVESTMENT GROWTH TIP =====
  if (monthlySavings > 200) {
    const futureValue10Years = monthlySavings * 12 * 10 * 1.4;
    const futureValue20Years = monthlySavings * 12 * 20 * 2.0;
    tips.push({
      icon: '📈',
      title: 'Power of Compound Growth',
      description: `Investing $${monthlySavings.toLocaleString(undefined, {maximumFractionDigits: 0})}/month at 7% average return: ~$${(futureValue10Years / 1000).toFixed(0)}K in 10 years, ~$${(futureValue20Years / 1000).toFixed(0)}K in 20 years. Time in the market beats timing the market.`,
      priority: 'info'
    });
  }
  
  // ===== LIFESTYLE TIPS =====
  if (savingsRate >= 20 && grossIncome > 80000) {
    tips.push({
      icon: '🎉',
      title: "Don't Forget to Live",
      description: `You're saving well! Consider allocating 5-10% ($${(netMonthly * 0.05).toLocaleString(undefined, {maximumFractionDigits: 0})}-$${(netMonthly * 0.10).toLocaleString(undefined, {maximumFractionDigits: 0})}/month) as "fun money" — guilt-free spending on experiences and things you enjoy.`,
      priority: 'info'
    });
  }
  
  // Sort by priority
  const priorityOrder = { critical: 0, high: 1, medium: 2, low: 3, info: 4 };
  tips.sort((a, b) => priorityOrder[a.priority] - priorityOrder[b.priority]);
  
  return tips;
}
