'use client';

import { useState, useMemo, useEffect } from 'react';
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import {
  FEDERAL_BRACKETS,
  PROVINCIAL_BRACKETS,
  PROVINCE_NAMES,
  RRSP_LIMIT_2025,
  RRSP_RATE,
  DEFAULT_INTEREST_RATES,
  calculateTax,
  calculateCPP,
  calculateEI,
  calculateCCB,
  calculateFamilyTax,
  calculateAnnualFromHourly,
  calculateCorporateTax,
  compareSalaryVsDividend,
  calculateDebtPayoff,
} from '@/lib/tax-calculations';
import { generateSavingsTips } from '@/lib/savings-tips';
import { AFFILIATE_LINKS, AFFILIATE_DISCLOSURE } from '@/lib/affiliate-links';

const COLORS = {
  federal: '#ef4444',
  provincial: '#f97316',
  cpp: '#eab308',
  ei: '#84cc16',
  net: '#22c55e',
  rrsp: '#8b5cf6',
  expenses: '#6366f1',
  savings: '#10b981',
  ccb: '#3b82f6',
  debt: '#dc2626',
};

export default function TaxCalculator() {
  // Navigation
  const [step, setStep] = useState(1);
  
  // Income Input Mode
  const [incomeInputMode, setIncomeInputMode] = useState('annual');
  const [hourlyRate, setHourlyRate] = useState('');
  const [hoursPerWeek, setHoursPerWeek] = useState('40');
  const [weeksPerYear, setWeeksPerYear] = useState('52');
  
  // Basic Info
  const [grossIncome, setGrossIncome] = useState('');
  const [province, setProvince] = useState('ON');
  const [employmentType, setEmploymentType] = useState('employee');
  const [rrspContribution, setRrspContribution] = useState('');
  
  // Family Mode
  const [familyMode, setFamilyMode] = useState(false);
  const [spouseIncome, setSpouseIncome] = useState('');
  const [spouseRRSP, setSpouseRRSP] = useState('');
  const [children, setChildren] = useState([]);
  const [newChildAge, setNewChildAge] = useState('');
  
  // Incorporated Mode
  const [corporateIncome, setCorporateIncome] = useState('');
  const [personalNeeds, setPersonalNeeds] = useState('');
  
  // Debt Mode
  const [hasDebt, setHasDebt] = useState(false);
  const [debts, setDebts] = useState([
    { id: 1, name: 'Credit Card', balance: '', rate: DEFAULT_INTEREST_RATES.creditCard, minPayment: '' },
  ]);
  const [extraDebtPayment, setExtraDebtPayment] = useState('');
  
  // Expenses
  const [expenses, setExpenses] = useState([
    { id: 1, name: 'Rent / Mortgage', amount: '' },
    { id: 2, name: 'Utilities', amount: '' },
    { id: 3, name: 'Groceries', amount: '' },
    { id: 4, name: 'Transportation', amount: '' },
    { id: 5, name: 'Insurance', amount: '' },
    { id: 6, name: 'Subscriptions', amount: '' },
  ]);
  const [newExpenseName, setNewExpenseName] = useState('');
  
  // ETF Data
  const [etfData, setEtfData] = useState([]);
  const [etfLoading, setEtfLoading] = useState(false);
  const [etfLastUpdated, setEtfLastUpdated] = useState(null);
  
  // Email capture modal
  const [showEmailModal, setShowEmailModal] = useState(false);
  const [emailForm, setEmailForm] = useState({ name: '', email: '' });
  const [emailErrors, setEmailErrors] = useState({});
  const [isSubmittingEmail, setIsSubmittingEmail] = useState(false);
  const [emailSuccess, setEmailSuccess] = useState(false);
  
  // Fetch ETF data when Step 3 is loaded
  useEffect(() => {
    if (step === 3 && etfData.length === 0 && !etfLoading) {
      fetchETFData();
    }
  }, [step]);

  const fetchETFData = async () => {
    setEtfLoading(true);
    try {
      const res = await fetch('/api/etf-data');
      const data = await res.json();
      if (data.etfs) {
        setEtfData(data.etfs);
        setEtfLastUpdated(data.lastUpdated);
      }
    } catch (error) {
      console.error('Failed to fetch ETF data:', error);
    } finally {
      setEtfLoading(false);
    }
  };
  
  // Scroll to top when step changes
  useEffect(() => {
    // Immediate scroll for reliability, especially on mobile
    window.scrollTo(0, 0);
    // Also try smooth scroll as backup
    setTimeout(() => {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }, 50);
  }, [step]);
  
  // Lock body scroll when modal is open
  useEffect(() => {
    if (showEmailModal) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'auto';
    }
    return () => { document.body.style.overflow = 'auto'; };
  }, [showEmailModal]);

  // Calculate income based on input mode
  const income = useMemo(() => {
    if (incomeInputMode === 'hourly') {
      const rate = parseFloat(hourlyRate) || 0;
      const hours = parseFloat(hoursPerWeek) || 40;
      const weeks = parseFloat(weeksPerYear) || 50;
      return calculateAnnualFromHourly(rate, hours, weeks);
    }
    return parseFloat(grossIncome) || 0;
  }, [incomeInputMode, hourlyRate, hoursPerWeek, weeksPerYear, grossIncome]);

  const isSelfEmployed = employmentType === 'self-employed';
  const isIncorporated = employmentType === 'incorporated';
  const rrsp = parseFloat(rrspContribution) || 0;
  const maxRRSPRoom = Math.min(income * RRSP_RATE, RRSP_LIMIT_2025);
  const validRRSP = Math.min(rrsp, maxRRSPRoom);
  
  const spouseIncomeValue = parseFloat(spouseIncome) || 0;
  const spouseRRSPValue = parseFloat(spouseRRSP) || 0;
  const familyGrossIncome = income + spouseIncomeValue;

  function getMarginalRate(taxableIncome, prov) {
    const lastFederalBracket = FEDERAL_BRACKETS.find(b => taxableIncome <= b.max) || FEDERAL_BRACKETS[FEDERAL_BRACKETS.length - 1];
    const lastProvincialBracket = PROVINCIAL_BRACKETS[prov].find(b => taxableIncome <= b.max) || PROVINCIAL_BRACKETS[prov][PROVINCIAL_BRACKETS[prov].length - 1];
    return (lastFederalBracket.rate + lastProvincialBracket.rate) * 100;
  }

  // Main tax calculations
  const calculations = useMemo(() => {
    if (income === 0) return null;

    if (isIncorporated) {
      const corpIncome = parseFloat(corporateIncome) || income;
      const needs = parseFloat(personalNeeds) || income * 0.7;
      const comparison = compareSalaryVsDividend(corpIncome, province, needs);
      const corpTax = calculateCorporateTax(corpIncome, province);
      
      return {
        isIncorporated: true,
        corporateTax: corpTax,
        comparison,
        netAnnual: comparison[comparison.recommended]?.netPersonal || 0,
        netMonthly: (comparison[comparison.recommended]?.netPersonal || 0) / 12,
      };
    }

    if (familyMode && spouseIncomeValue > 0) {
      const familyTax = calculateFamilyTax(
        income, spouseIncomeValue, province, 
        isSelfEmployed, false,
        validRRSP, spouseRRSPValue
      );
      const ccb = calculateCCB(familyGrossIncome, children);
      
      return {
        ...familyTax.primary,
        spouse: familyTax.spouse,
        family: familyTax.family,
        ccb,
        taxableIncome: familyTax.primary.taxableIncome,
        effectiveRate: (familyTax.primary.totalDeductions / income) * 100,
        marginalRate: getMarginalRate(familyTax.primary.taxableIncome, province),
      };
    }

    const taxableIncome = Math.max(0, income - validRRSP);
    const federalTax = calculateTax(taxableIncome, FEDERAL_BRACKETS);
    const provincialTax = calculateTax(taxableIncome, PROVINCIAL_BRACKETS[province]);
    const cpp = calculateCPP(income, isSelfEmployed);
    const ei = calculateEI(income, isSelfEmployed);
    
    const federalTaxNoRRSP = calculateTax(income, FEDERAL_BRACKETS);
    const provincialTaxNoRRSP = calculateTax(income, PROVINCIAL_BRACKETS[province]);
    const rrspTaxSavings = (federalTaxNoRRSP.total + provincialTaxNoRRSP.total) - (federalTax.total + provincialTax.total);
    
    const totalDeductions = federalTax.total + provincialTax.total + cpp + ei;
    const netAnnual = income - totalDeductions - validRRSP;
    const netMonthly = netAnnual / 12;
    
    const effectiveRate = (totalDeductions / income) * 100;
    const marginalRate = getMarginalRate(taxableIncome, province);
    const ccb = children.length > 0 ? calculateCCB(income, children) : null;

    return {
      taxableIncome, federalTax, provincialTax, cpp, ei, totalDeductions,
      netAnnual, netMonthly, effectiveRate, marginalRate, rrspTaxSavings,
      validRRSP, maxRRSPRoom, ccb,
    };
  }, [income, province, isSelfEmployed, isIncorporated, validRRSP, familyMode, spouseIncomeValue, spouseRRSPValue, children, corporateIncome, personalNeeds, familyGrossIncome]);

  const debtCalculations = useMemo(() => {
    if (!hasDebt) return null;
    const validDebts = debts.filter(d => parseFloat(d.balance) > 0).map(d => ({
      ...d, balance: parseFloat(d.balance) || 0, rate: parseFloat(d.rate) || 0, minPayment: parseFloat(d.minPayment) || 0,
    }));
    if (validDebts.length === 0) return null;
    return calculateDebtPayoff(validDebts, parseFloat(extraDebtPayment) || 0);
  }, [hasDebt, debts, extraDebtPayment]);

  const netMonthlyForSavings = useMemo(() => {
    if (!calculations) return 0;
    let base = calculations.netMonthly || 0;
    if (calculations.ccb) base += calculations.ccb.monthly;
    if (familyMode && calculations.spouse) base += calculations.spouse.netMonthly;
    return base;
  }, [calculations, familyMode]);

  const savingsCalculations = useMemo(() => {
    if (!calculations) return null;
    const totalExpenses = expenses.reduce((sum, exp) => sum + (parseFloat(exp.amount) || 0), 0);
    const totalDebtPayments = hasDebt ? debts.reduce((sum, d) => sum + (parseFloat(d.minPayment) || 0), 0) : 0;
    const monthlySavings = netMonthlyForSavings - totalExpenses - totalDebtPayments;
    const savingsRate = netMonthlyForSavings > 0 ? (monthlySavings / netMonthlyForSavings) * 100 : 0;
    return { totalExpenses, totalDebtPayments, monthlySavings, savingsRate };
  }, [calculations, expenses, hasDebt, debts, netMonthlyForSavings]);

  const savingsTips = useMemo(() => {
    if (!calculations || !savingsCalculations) return [];
    return generateSavingsTips(income, netMonthlyForSavings, savingsCalculations.savingsRate, savingsCalculations.totalExpenses, savingsCalculations.monthlySavings, validRRSP);
  }, [income, netMonthlyForSavings, calculations, savingsCalculations, validRRSP]);

  const addChild = () => {
    const age = parseInt(newChildAge);
    if (!isNaN(age) && age >= 0 && age < 18) {
      setChildren([...children, { id: Date.now(), age }]);
      setNewChildAge('');
    }
  };

  const removeChild = (id) => setChildren(children.filter(c => c.id !== id));

  const addDebt = (type = 'other') => {
    const names = { creditCard: 'Credit Card', lineOfCredit: 'Line of Credit', carLoan: 'Car Loan', studentLoan: 'Student Loan' };
    setDebts([...debts, { id: Date.now(), name: names[type] || 'Other Debt', balance: '', rate: DEFAULT_INTEREST_RATES[type] || 10, minPayment: '' }]);
  };

  const updateDebt = (id, field, value) => setDebts(debts.map(d => d.id === id ? { ...d, [field]: value } : d));
  const removeDebt = (id) => setDebts(debts.filter(d => d.id !== id));

  const addExpense = () => {
    if (newExpenseName.trim()) {
      setExpenses([...expenses, { id: Date.now(), name: newExpenseName.trim(), amount: '' }]);
      setNewExpenseName('');
    }
  };

  const updateExpense = (id, amount) => setExpenses(expenses.map(exp => exp.id === id ? { ...exp, amount } : exp));
  const removeExpense = (id) => setExpenses(expenses.filter(exp => exp.id !== id));

  const validateEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

  const handleEmailSubmit = async (e) => {
    e.preventDefault();
    const errors = {};
    if (!emailForm.name.trim()) errors.name = 'Name is required';
    if (!emailForm.email.trim()) errors.email = 'Email is required';
    else if (!validateEmail(emailForm.email)) errors.email = 'Invalid email format';
    if (Object.keys(errors).length > 0) { setEmailErrors(errors); return; }
    setEmailErrors({});
    setIsSubmittingEmail(true);
    
    try {
      // Save to Upstash via API
      const subscribeRes = await fetch('/api/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: emailForm.name,
          email: emailForm.email,
          income: income || null,
          province: province || null,
        }),
      });

      if (!subscribeRes.ok) {
        throw new Error('Failed to save subscription');
      }
      
      // Generate PDF
      const pdfRes = await fetch('/api/generate-pdf', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: emailForm.name,
          income,
          province,
          provinceName: PROVINCE_NAMES[province],
          employmentType,
          rrspContribution: validRRSP,
          calculations,
          familyMode,
          spouseIncome: spouseIncomeValue,
          children,
          ccb: calculations?.ccb || null,
          hasDebt,
          debtCalculations,
          savingsCalculations,
          expenses,
          etfData,
        }),
      });
      
      if (pdfRes.ok) {
        const html = await pdfRes.text();
        
        // Create a Blob and download link (works better on mobile)
        const blob = new Blob([html], { type: 'text/html' });
        const url = URL.createObjectURL(blob);
        
        // Try opening in new tab first
        const pdfWindow = window.open(url, '_blank');
        
        // If popup was blocked (common on mobile), use download fallback
        if (!pdfWindow || pdfWindow.closed || typeof pdfWindow.closed === 'undefined') {
          const link = document.createElement('a');
          link.href = url;
          link.download = `Girmer_Tax_Report_${emailForm.name.replace(/\s+/g, '_')}.html`;
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
        }
        
        // Clean up
        setTimeout(() => URL.revokeObjectURL(url), 1000);
      } else {
        throw new Error('Failed to generate PDF');
      }
      
      setIsSubmittingEmail(false);
      setEmailSuccess(true);
      
      setTimeout(() => {
        setShowEmailModal(false);
        setEmailSuccess(false);
        setEmailForm({ name: '', email: '' });
      }, 2000);
      
    } catch (error) {
      console.error('Submit error:', error);
      setIsSubmittingEmail(false);
      setEmailErrors({ email: 'Something went wrong. Please try again.' });
    }
  };

  const pieData = calculations && !calculations.isIncorporated ? [
    { name: 'Federal Tax', value: calculations.federalTax?.total || 0, color: COLORS.federal },
    { name: 'Provincial Tax', value: calculations.provincialTax?.total || 0, color: COLORS.provincial },
    { name: 'CPP', value: calculations.cpp || 0, color: COLORS.cpp },
    { name: 'EI', value: calculations.ei || 0, color: COLORS.ei },
    { name: 'RRSP', value: calculations.validRRSP || 0, color: COLORS.rrsp },
    { name: 'Net Income', value: calculations.netAnnual || 0, color: COLORS.net },
  ].filter(d => d.value > 0) : [];

  const barData = calculations && !calculations.isIncorporated ? [
    { name: 'Gross', amount: income },
    { name: 'Federal', amount: -(calculations.federalTax?.total || 0) },
    { name: 'Provincial', amount: -(calculations.provincialTax?.total || 0) },
    { name: 'CPP', amount: -(calculations.cpp || 0) },
    { name: 'EI', amount: -(calculations.ei || 0) },
    { name: 'RRSP', amount: -(calculations.validRRSP || 0) },
    { name: 'Net', amount: calculations.netAnnual || 0 },
  ].filter(d => d.name === 'Gross' || d.name === 'Net' || d.amount !== 0) : [];

  return (
    <div className="min-h-screen bg-gray-950 text-gray-100">
      {/* Header */}
      <header className="border-b border-gray-800 bg-gray-900/50 backdrop-blur-sm sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-4 py-4 flex flex-col sm:flex-row items-center justify-between gap-4">
          <h1 className="text-2xl font-bold text-emerald-400">Girmer</h1>
          <div className="flex gap-2">
            <button onClick={() => setStep(1)} className={`px-3 sm:px-4 py-2 rounded-lg text-xs sm:text-sm font-medium transition-colors ${step === 1 ? 'bg-emerald-600 text-white' : 'bg-gray-800 text-gray-400 hover:bg-gray-700'}`}>Tax Calculator</button>
            <button onClick={() => calculations && setStep(2)} className={`px-3 sm:px-4 py-2 rounded-lg text-xs sm:text-sm font-medium transition-colors ${step === 2 ? 'bg-emerald-600 text-white' : 'bg-gray-800 text-gray-400'} ${!calculations ? 'opacity-50 cursor-not-allowed' : 'hover:bg-gray-700'}`}>Savings Planner</button>
            <button onClick={() => calculations && setStep(3)} className={`px-3 sm:px-4 py-2 rounded-lg text-xs sm:text-sm font-medium transition-colors ${step === 3 ? 'bg-emerald-600 text-white' : 'bg-gray-800 text-gray-400'} ${!calculations ? 'opacity-50 cursor-not-allowed' : 'hover:bg-gray-700'}`}>Invest & Grow</button>
          </div>
        </div>
        
        {/* Progress Indicator - shows until calculations are done */}
        {!calculations && (
          <div className="bg-amber-900/30 border-t border-amber-800/50 px-4 py-3">
            <div className="max-w-6xl mx-auto flex items-center gap-2 text-sm">
              <span className="text-amber-400">📍</span>
              <span className="text-amber-200">Step 1 of 3</span>
              <span className="text-amber-400/70">—</span>
              <span className="text-amber-100/80">Enter your income to unlock Savings Planner & Invest</span>
            </div>
          </div>
        )}
        
        {/* Success message - briefly shows when unlocked */}
        {calculations && step === 1 && (
          <div className="bg-emerald-900/30 border-t border-emerald-800/50 px-4 py-3">
            <div className="max-w-6xl mx-auto flex items-center gap-2 text-sm">
              <span className="text-emerald-400">✓</span>
              <span className="text-emerald-200">All steps unlocked!</span>
              <span className="text-emerald-400/70">—</span>
              <span className="text-emerald-100/80">Scroll down to see your results, or continue to Savings Planner</span>
            </div>
          </div>
        )}
      </header>

      <main className="max-w-6xl mx-auto px-4 py-8">
        {step === 1 && (
          <>
            {/* Income Input Mode */}
            <div className="bg-gray-900 rounded-2xl p-4 sm:p-6 mb-6 border border-gray-800">
              <h2 className="text-lg font-semibold text-gray-100 mb-4">How do you earn?</h2>
              <div className="flex gap-2 mb-6">
                <button onClick={() => setIncomeInputMode('annual')} className={`flex-1 py-3 px-4 rounded-xl font-medium transition-colors ${incomeInputMode === 'annual' ? 'bg-emerald-600 text-white' : 'bg-gray-800 text-gray-400 hover:bg-gray-700'}`}>Annual Salary</button>
                <button onClick={() => setIncomeInputMode('hourly')} className={`flex-1 py-3 px-4 rounded-xl font-medium transition-colors ${incomeInputMode === 'hourly' ? 'bg-emerald-600 text-white' : 'bg-gray-800 text-gray-400 hover:bg-gray-700'}`}>Hourly Rate</button>
              </div>

              {incomeInputMode === 'annual' ? (
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-2">Gross Annual Income</label>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500">$</span>
                    <input type="number" value={grossIncome} onChange={(e) => setGrossIncome(e.target.value)} placeholder="85,000" className="w-full bg-gray-800 border border-gray-700 rounded-xl py-3 pl-8 pr-4 text-lg font-medium text-gray-100 placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-emerald-500" />
                  </div>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-400 mb-2">Hourly Rate</label>
                    <div className="relative">
                      <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500">$</span>
                      <input type="number" value={hourlyRate} onChange={(e) => setHourlyRate(e.target.value)} placeholder="50" className="w-full bg-gray-800 border border-gray-700 rounded-xl py-3 pl-8 pr-4 text-lg font-medium text-gray-100 placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-emerald-500" />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-400 mb-2">Hours/Week</label>
                    <input type="number" value={hoursPerWeek} onChange={(e) => setHoursPerWeek(e.target.value)} className="w-full bg-gray-800 border border-gray-700 rounded-xl py-3 px-4 text-lg font-medium text-gray-100 focus:outline-none focus:ring-2 focus:ring-emerald-500" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-400 mb-2">Weeks/Year</label>
                    <input type="number" value={weeksPerYear} onChange={(e) => setWeeksPerYear(e.target.value)} className="w-full bg-gray-800 border border-gray-700 rounded-xl py-3 px-4 text-lg font-medium text-gray-100 focus:outline-none focus:ring-2 focus:ring-emerald-500" />
                  </div>
                </div>
              )}

              {incomeInputMode === 'hourly' && income > 0 && (
                <div className="mt-4 p-4 bg-emerald-900/20 border border-emerald-800 rounded-xl">
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
                    <span className="text-emerald-400">Calculated Annual Income</span>
                    <span className="text-xl sm:text-2xl font-bold text-emerald-400">${income.toLocaleString()}</span>
                  </div>
                </div>
              )}
            </div>

            {/* Province & Employment */}
            <div className="grid sm:grid-cols-2 gap-6 mb-6">
              <div className="bg-gray-900 rounded-2xl p-4 sm:p-6 border border-gray-800">
                <label className="block text-sm font-medium text-gray-400 mb-2">Province</label>
                <select value={province} onChange={(e) => setProvince(e.target.value)} className="w-full bg-gray-800 border border-gray-700 rounded-xl py-3 px-4 text-gray-100 focus:outline-none focus:ring-2 focus:ring-emerald-500">
                  {Object.entries(PROVINCE_NAMES).map(([code, name]) => (<option key={code} value={code}>{name}</option>))}
                </select>
              </div>
              <div className="bg-gray-900 rounded-2xl p-4 sm:p-6 border border-gray-800">
                <label className="block text-sm font-medium text-gray-400 mb-2">Employment Type</label>
                <select value={employmentType} onChange={(e) => setEmploymentType(e.target.value)} className="w-full bg-gray-800 border border-gray-700 rounded-xl py-3 px-4 text-gray-100 focus:outline-none focus:ring-2 focus:ring-emerald-500">
                  <option value="employee">Employee (T4)</option>
                  <option value="self-employed">Self-Employed (T4A)</option>
                  <option value="incorporated">Incorporated (Corp)</option>
                </select>
              </div>
            </div>

            {/* Incorporated Mode */}
            {isIncorporated && (
              <div className="bg-gradient-to-r from-purple-900/30 to-indigo-900/30 rounded-2xl p-4 sm:p-6 mb-6 border border-purple-800">
                <h3 className="text-lg font-semibold text-purple-300 mb-4">💼 Corporate Details</h3>
                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-400 mb-2">Corporate Revenue</label>
                    <div className="relative">
                      <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500">$</span>
                      <input type="number" value={corporateIncome} onChange={(e) => setCorporateIncome(e.target.value)} placeholder={income.toString() || "150000"} className="w-full bg-gray-800 border border-gray-700 rounded-xl py-3 pl-8 pr-4 text-gray-100 placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-purple-500" />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-400 mb-2">Personal Income Needs</label>
                    <div className="relative">
                      <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500">$</span>
                      <input type="number" value={personalNeeds} onChange={(e) => setPersonalNeeds(e.target.value)} placeholder="100000" className="w-full bg-gray-800 border border-gray-700 rounded-xl py-3 pl-8 pr-4 text-gray-100 placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-purple-500" />
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* RRSP */}
            {!isIncorporated && (
              <div className="bg-gray-900 rounded-2xl p-4 sm:p-6 mb-6 border border-gray-800">
                <label className="block text-sm font-medium text-gray-400 mb-2">
                  Annual RRSP Contribution {income > 0 && <span className="text-gray-500 ml-2">(Max: ${maxRRSPRoom.toLocaleString(undefined, { maximumFractionDigits: 0 })})</span>}
                </label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500">$</span>
                  <input type="number" value={rrspContribution} onChange={(e) => setRrspContribution(e.target.value)} placeholder="0" className="w-full bg-gray-800 border border-gray-700 rounded-xl py-3 pl-8 pr-4 text-gray-100 placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-emerald-500" />
                </div>
              </div>
            )}

            {/* Family Mode */}
            <div className="bg-gray-900 rounded-2xl p-4 sm:p-6 mb-6 border border-gray-800">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-lg font-semibold text-gray-100">Family Mode</h3>
                  <p className="text-sm text-gray-500">Calculate taxes for your household</p>
                </div>
                <button onClick={() => setFamilyMode(!familyMode)} className={`relative w-14 h-8 rounded-full transition-colors ${familyMode ? 'bg-emerald-600' : 'bg-gray-700'}`}>
                  <div className={`absolute top-1 w-6 h-6 bg-white rounded-full transition-transform ${familyMode ? 'translate-x-7' : 'translate-x-1'}`} />
                </button>
              </div>

              {familyMode && (
                <div className="space-y-4 pt-4 border-t border-gray-800">
                  <div className="grid sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-400 mb-2">Spouse Annual Income</label>
                      <div className="relative">
                        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500">$</span>
                        <input type="number" value={spouseIncome} onChange={(e) => setSpouseIncome(e.target.value)} placeholder="0" className="w-full bg-gray-800 border border-gray-700 rounded-xl py-3 pl-8 pr-4 text-gray-100 placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-emerald-500" />
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-400 mb-2">Spouse RRSP</label>
                      <div className="relative">
                        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500">$</span>
                        <input type="number" value={spouseRRSP} onChange={(e) => setSpouseRRSP(e.target.value)} placeholder="0" className="w-full bg-gray-800 border border-gray-700 rounded-xl py-3 pl-8 pr-4 text-gray-100 placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-emerald-500" />
                      </div>
                    </div>
                  </div>

                  {spouseIncomeValue > 0 && (
                    <div className="bg-gray-800/50 rounded-xl p-4">
                      <div className="flex justify-between items-center">
                        <span className="text-gray-400">Combined Family Income</span>
                        <span className="text-xl font-bold text-emerald-400">${familyGrossIncome.toLocaleString()}</span>
                      </div>
                    </div>
                  )}

                  <div className="pt-4 border-t border-gray-800">
                    <h4 className="text-md font-semibold text-gray-100 mb-4">Children (under 18) — for CCB</h4>
                    {children.length > 0 && (
                      <div className="flex flex-wrap gap-2 mb-4">
                        {children.map((child) => (
                          <div key={child.id} className="flex items-center gap-2 bg-gray-800 rounded-lg px-3 py-2">
                            <span>👶</span>
                            <span className="text-gray-300">{child.age} yrs {child.age < 6 ? '(under 6)' : ''}</span>
                            <button onClick={() => removeChild(child.id)} className="text-gray-500 hover:text-red-400 ml-1">×</button>
                          </div>
                        ))}
                      </div>
                    )}
                    <div className="flex gap-2">
                      <input type="number" value={newChildAge} onChange={(e) => setNewChildAge(e.target.value)} placeholder="Age" min="0" max="17" className="w-24 bg-gray-800 border border-gray-700 rounded-lg py-2 px-3 text-gray-100 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-emerald-500" onKeyPress={(e) => e.key === 'Enter' && addChild()} />
                      <button onClick={addChild} className="bg-gray-700 hover:bg-gray-600 text-gray-200 px-4 py-2 rounded-lg transition-colors">+ Add Child</button>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Debt Mode */}
            <div className="bg-gray-900 rounded-2xl p-4 sm:p-6 mb-6 border border-gray-800">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-lg font-semibold text-gray-100">Do you have debt?</h3>
                  <p className="text-sm text-gray-500">Get a personalized payoff strategy</p>
                </div>
                <button onClick={() => setHasDebt(!hasDebt)} className={`relative w-14 h-8 rounded-full transition-colors ${hasDebt ? 'bg-red-600' : 'bg-gray-700'}`}>
                  <div className={`absolute top-1 w-6 h-6 bg-white rounded-full transition-transform ${hasDebt ? 'translate-x-7' : 'translate-x-1'}`} />
                </button>
              </div>

              {hasDebt && (
                <div className="space-y-4 pt-4 border-t border-gray-800">
                  {debts.map((debt) => (
                    <div key={debt.id} className="grid grid-cols-12 gap-3 items-end">
                      <div className="col-span-12 sm:col-span-3">
                        <label className="block text-xs text-gray-400 mb-1">Type</label>
                        <input type="text" value={debt.name} onChange={(e) => updateDebt(debt.id, 'name', e.target.value)} className="w-full bg-gray-800 border border-gray-700 rounded-lg py-2 px-3 text-gray-100 text-sm focus:outline-none focus:ring-2 focus:ring-red-500" />
                      </div>
                      <div className="col-span-4 sm:col-span-3">
                        <label className="block text-xs text-gray-400 mb-1">Balance</label>
                        <div className="relative">
                          <span className="absolute left-2 top-1/2 -translate-y-1/2 text-gray-500 text-sm">$</span>
                          <input type="number" value={debt.balance} onChange={(e) => updateDebt(debt.id, 'balance', e.target.value)} placeholder="0" className="w-full bg-gray-800 border border-gray-700 rounded-lg py-2 pl-6 pr-2 text-gray-100 text-sm focus:outline-none focus:ring-2 focus:ring-red-500" />
                        </div>
                      </div>
                      <div className="col-span-3 sm:col-span-2">
                        <label className="block text-xs text-gray-400 mb-1">Rate %</label>
                        <input type="number" value={debt.rate} onChange={(e) => updateDebt(debt.id, 'rate', e.target.value)} step="0.1" className="w-full bg-gray-800 border border-gray-700 rounded-lg py-2 px-2 text-gray-100 text-sm focus:outline-none focus:ring-2 focus:ring-red-500" />
                      </div>
                      <div className="col-span-4 sm:col-span-3">
                        <label className="block text-xs text-gray-400 mb-1">Min Payment</label>
                        <div className="relative">
                          <span className="absolute left-2 top-1/2 -translate-y-1/2 text-gray-500 text-sm">$</span>
                          <input type="number" value={debt.minPayment} onChange={(e) => updateDebt(debt.id, 'minPayment', e.target.value)} placeholder="0" className="w-full bg-gray-800 border border-gray-700 rounded-lg py-2 pl-6 pr-2 text-gray-100 text-sm focus:outline-none focus:ring-2 focus:ring-red-500" />
                        </div>
                      </div>
                      <div className="col-span-1">
                        <button onClick={() => removeDebt(debt.id)} className="text-gray-600 hover:text-red-400 transition-colors p-2">✕</button>
                      </div>
                    </div>
                  ))}
                  <div className="flex flex-wrap gap-2">
                    <button onClick={() => addDebt('creditCard')} className="bg-gray-800 hover:bg-gray-700 text-gray-300 px-3 py-2 rounded-lg text-sm">+ Credit Card</button>
                    <button onClick={() => addDebt('lineOfCredit')} className="bg-gray-800 hover:bg-gray-700 text-gray-300 px-3 py-2 rounded-lg text-sm">+ Line of Credit</button>
                    <button onClick={() => addDebt('carLoan')} className="bg-gray-800 hover:bg-gray-700 text-gray-300 px-3 py-2 rounded-lg text-sm">+ Car Loan</button>
                    <button onClick={() => addDebt('studentLoan')} className="bg-gray-800 hover:bg-gray-700 text-gray-300 px-3 py-2 rounded-lg text-sm">+ Student Loan</button>
                  </div>
                  <div className="pt-4 border-t border-gray-800">
                    <label className="block text-sm font-medium text-gray-400 mb-2">Extra Monthly Payment</label>
                    <div className="relative w-48">
                      <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500">$</span>
                      <input type="number" value={extraDebtPayment} onChange={(e) => setExtraDebtPayment(e.target.value)} placeholder="0" className="w-full bg-gray-800 border border-gray-700 rounded-lg py-2 pl-8 pr-4 text-gray-100 focus:outline-none focus:ring-2 focus:ring-red-500" />
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Tax Results - Non-incorporated */}
            {calculations && !calculations.isIncorporated && (
              <>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 mb-8">
                  <div className="bg-gray-900 rounded-2xl p-4 sm:p-5 border border-gray-800">
                    <p className="text-xs sm:text-sm text-gray-400 mb-1">Gross Income</p>
                    <p className="text-lg sm:text-2xl font-bold">${income.toLocaleString()}</p>
                  </div>
                  <div className="bg-gray-900 rounded-2xl p-4 sm:p-5 border border-gray-800">
                    <p className="text-xs sm:text-sm text-gray-400 mb-1">Total Tax</p>
                    <p className="text-lg sm:text-2xl font-bold text-red-400">${calculations.totalDeductions?.toLocaleString(undefined, { maximumFractionDigits: 0 })}</p>
                  </div>
                  <div className="bg-emerald-900/30 rounded-2xl p-4 sm:p-5 border border-emerald-800">
                    <p className="text-xs sm:text-sm text-emerald-400 mb-1">Net Annual</p>
                    <p className="text-lg sm:text-2xl font-bold text-emerald-400">${calculations.netAnnual?.toLocaleString(undefined, { maximumFractionDigits: 0 })}</p>
                  </div>
                  <div className="bg-emerald-900/30 rounded-2xl p-4 sm:p-5 border border-emerald-800">
                    <p className="text-xs sm:text-sm text-emerald-400 mb-1">Net Monthly</p>
                    <p className="text-lg sm:text-2xl font-bold text-emerald-400">${calculations.netMonthly?.toLocaleString(undefined, { maximumFractionDigits: 0 })}</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 mb-8">
                  <div className="bg-gray-900 rounded-2xl p-5 border border-gray-800">
                    <p className="text-sm text-gray-400 mb-1">Effective Tax Rate</p>
                    <p className="text-3xl font-bold">{calculations.effectiveRate?.toFixed(1)}%</p>
                  </div>
                  <div className="bg-gray-900 rounded-2xl p-5 border border-gray-800">
                    <p className="text-sm text-gray-400 mb-1">Marginal Tax Rate</p>
                    <p className="text-3xl font-bold">{calculations.marginalRate?.toFixed(1)}%</p>
                  </div>
                </div>

                {calculations.rrspTaxSavings > 0 && (
                  <div className="bg-gradient-to-r from-purple-900/30 to-violet-900/30 rounded-2xl p-5 border border-purple-800 mb-8">
                    <p className="text-purple-300 font-semibold">💡 RRSP Tax Savings: <span className="text-purple-400">${calculations.rrspTaxSavings?.toLocaleString(undefined, { maximumFractionDigits: 0 })}</span></p>
                  </div>
                )}

                {calculations.ccb && calculations.ccb.annual > 0 && (
                  <div className="bg-gradient-to-r from-blue-900/30 to-cyan-900/30 rounded-2xl p-5 border border-blue-800 mb-8">
                    <h3 className="text-lg font-semibold text-blue-300 mb-4">👨‍👩‍👧‍👦 Canada Child Benefit</h3>
                    <div className="grid grid-cols-2 gap-3 sm:gap-4">
                      <div className="bg-gray-900/50 rounded-xl p-4">
                        <p className="text-xs text-gray-400">Monthly</p>
                        <p className="text-xl sm:text-2xl font-bold text-blue-400">${calculations.ccb.monthly.toLocaleString()}</p>
                      </div>
                      <div className="bg-gray-900/50 rounded-xl p-4">
                        <p className="text-xs text-gray-400">Annual</p>
                        <p className="text-xl sm:text-2xl font-bold text-blue-400">${calculations.ccb.annual.toLocaleString()}</p>
                      </div>
                    </div>
                  </div>
                )}

                {hasDebt && debtCalculations && debtCalculations.strategies && (
                  <div className="bg-gradient-to-r from-red-900/30 to-orange-900/30 rounded-2xl p-5 border border-red-800 mb-8">
                    <h3 className="text-lg font-semibold text-red-300 mb-4">💳 Debt Payoff Strategy</h3>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4 mb-4">
                      <div className="bg-gray-900/50 rounded-xl p-4">
                        <p className="text-xs text-gray-400">Total Debt</p>
                        <p className="text-lg sm:text-xl font-bold text-red-400">${debtCalculations.totalDebt.toLocaleString()}</p>
                      </div>
                      <div className="bg-gray-900/50 rounded-xl p-4">
                        <p className="text-xs text-gray-400">Monthly Interest</p>
                        <p className="text-lg sm:text-xl font-bold text-orange-400">${debtCalculations.totalMonthlyInterest.toLocaleString()}</p>
                      </div>
                      <div className="bg-gray-900/50 rounded-xl p-4">
                        <p className="text-xs text-gray-400">Payoff Time</p>
                        <p className="text-lg sm:text-xl font-bold text-yellow-400">{debtCalculations.strategies.avalanche.months} mo</p>
                      </div>
                    </div>
                    <p className="text-sm text-gray-400">Recommended: <span className="text-emerald-400 font-medium">{debtCalculations.strategies.recommended === 'avalanche' ? 'Avalanche (highest interest first)' : 'Snowball (lowest balance first)'}</span></p>
                  </div>
                )}

                {/* Charts */}
                <div className="grid lg:grid-cols-2 gap-6 mb-8">
                  {pieData.length > 0 && (
                    <div className="bg-gray-900 rounded-2xl p-5 border border-gray-800">
                      <h3 className="text-lg font-semibold mb-4">Income Distribution</h3>
                      <ResponsiveContainer width="100%" height={280}>
                        <PieChart>
                          <Pie data={pieData} cx="50%" cy="50%" innerRadius={60} outerRadius={100} paddingAngle={2} dataKey="value">
                            {pieData.map((entry, index) => (<Cell key={index} fill={entry.color} />))}
                          </Pie>
                          <Tooltip formatter={(value) => `$${value.toLocaleString(undefined, { maximumFractionDigits: 0 })}`} contentStyle={{ backgroundColor: '#1f2937', border: 'none', borderRadius: '8px' }} />
                        </PieChart>
                      </ResponsiveContainer>
                      <div className="flex flex-wrap justify-center gap-3 mt-4">
                        {pieData.map((entry, i) => (<div key={i} className="flex items-center gap-2"><div className="w-3 h-3 rounded-full" style={{ backgroundColor: entry.color }} /><span className="text-xs text-gray-400">{entry.name}</span></div>))}
                      </div>
                    </div>
                  )}
                  {barData.length > 0 && (
                    <div className="bg-gray-900 rounded-2xl p-5 border border-gray-800">
                      <h3 className="text-lg font-semibold mb-4">Income Waterfall</h3>
                      <ResponsiveContainer width="100%" height={280}>
                        <BarChart data={barData} layout="vertical">
                          <XAxis type="number" tickFormatter={(v) => `$${Math.abs(v / 1000)}k`} stroke="#6b7280" />
                          <YAxis type="category" dataKey="name" stroke="#6b7280" width={70} />
                          <Tooltip formatter={(value) => `$${Math.abs(value).toLocaleString(undefined, { maximumFractionDigits: 0 })}`} contentStyle={{ backgroundColor: '#1f2937', border: 'none', borderRadius: '8px' }} />
                          <Bar dataKey="amount" radius={[0, 4, 4, 0]}>
                            {barData.map((entry, i) => (<Cell key={i} fill={entry.amount >= 0 ? '#10b981' : '#ef4444'} />))}
                          </Bar>
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  )}
                </div>
              </>
            )}

            {/* Incorporated Results */}
            {calculations && calculations.isIncorporated && (
              <div className="bg-gradient-to-r from-purple-900/30 to-indigo-900/30 rounded-2xl p-6 border border-purple-800">
                <h3 className="text-xl font-semibold text-purple-300 mb-6">💼 Salary vs Dividend Analysis</h3>
                <div className="grid sm:grid-cols-3 gap-4">
                  {['salary', 'dividend', 'mix'].map((type) => {
                    const opt = calculations.comparison[type];
                    const isRec = calculations.comparison.recommended === type;
                    return (
                      <div key={type} className={`rounded-xl p-4 border ${isRec ? 'bg-emerald-900/20 border-emerald-700' : 'bg-gray-800/50 border-gray-700'}`}>
                        {isRec && <span className="text-xs bg-emerald-600 text-white px-2 py-0.5 rounded-full">Best</span>}
                        <p className="font-medium capitalize mt-2">{type === 'mix' ? 'Salary + Dividend' : `All ${type}`}</p>
                        <p className="text-sm text-gray-400 mt-2">Total Tax: <span className="text-red-400 font-bold">${opt.totalTax?.toLocaleString(undefined, { maximumFractionDigits: 0 })}</span></p>
                        <p className="text-sm text-gray-400">Net: <span className="text-emerald-400 font-bold">${opt.netPersonal?.toLocaleString(undefined, { maximumFractionDigits: 0 })}</span></p>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Next Step Button */}
            {calculations && (
              <div className="mt-8 pt-6 border-t border-gray-800">
                <button 
                  onClick={() => setStep(2)} 
                  className="w-full sm:w-auto bg-emerald-600 hover:bg-emerald-500 text-white font-semibold py-4 px-8 rounded-xl flex items-center justify-center gap-2 transition-colors"
                >
                  Continue to Savings Planner
                  <span>→</span>
                </button>
                <p className="text-sm text-gray-500 mt-3">See how much you can save and invest each month</p>
              </div>
            )}
          </>
        )}

        {/* Step 2: Savings Planner */}
        {step === 2 && calculations && (
          <>
            <h2 className="text-2xl font-bold mb-6">Savings Planner</h2>
            <p className="text-gray-400 mb-8">Based on your net monthly income of <span className="text-emerald-400 font-bold">${netMonthlyForSavings.toLocaleString(undefined, { maximumFractionDigits: 0 })}</span></p>

            <div className="bg-gray-900 rounded-2xl p-6 border border-gray-800 mb-6">
              <h3 className="text-lg font-semibold mb-4">Monthly Expenses</h3>
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
                {expenses.map((expense) => (
                  <div key={expense.id} className="flex items-center gap-3">
                    <div className="flex-1">
                      <label className="block text-sm text-gray-400 mb-1">{expense.name}</label>
                      <div className="relative">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">$</span>
                        <input type="number" value={expense.amount} onChange={(e) => updateExpense(expense.id, e.target.value)} placeholder="0" className="w-full bg-gray-800 border border-gray-700 rounded-lg py-2 pl-8 pr-3 text-gray-100 focus:outline-none focus:ring-2 focus:ring-emerald-500" />
                      </div>
                    </div>
                    <button onClick={() => removeExpense(expense.id)} className="mt-6 text-gray-600 hover:text-red-400">✕</button>
                  </div>
                ))}
              </div>
              <div className="flex gap-3">
                <input type="text" value={newExpenseName} onChange={(e) => setNewExpenseName(e.target.value)} placeholder="Add expense..." className="flex-1 bg-gray-800 border border-gray-700 rounded-lg py-2 px-4 text-gray-100 placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-emerald-500" onKeyPress={(e) => e.key === 'Enter' && addExpense()} />
                <button onClick={addExpense} className="bg-gray-700 hover:bg-gray-600 text-gray-200 px-4 py-2 rounded-lg">+ Add</button>
              </div>
            </div>

            {savingsCalculations && (
              <>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4 mb-8">
                  <div className="bg-gray-900 rounded-2xl p-4 sm:p-5 border border-gray-800">
                    <p className="text-sm text-gray-400 mb-1">Expenses</p>
                    <p className="text-xl sm:text-2xl font-bold text-indigo-400">${savingsCalculations.totalExpenses.toLocaleString()}</p>
                    <p className="text-xs text-gray-500">/month</p>
                  </div>
                  <div className={`rounded-2xl p-4 sm:p-5 border ${savingsCalculations.monthlySavings >= 0 ? 'bg-emerald-900/30 border-emerald-800' : 'bg-red-900/30 border-red-800'}`}>
                    <p className={`text-sm mb-1 ${savingsCalculations.monthlySavings >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>Monthly Savings</p>
                    <p className={`text-xl sm:text-2xl font-bold ${savingsCalculations.monthlySavings >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>${savingsCalculations.monthlySavings.toLocaleString(undefined, { maximumFractionDigits: 0 })}</p>
                  </div>
                  <div className="bg-gray-900 rounded-2xl p-4 sm:p-5 border border-gray-800">
                    <p className="text-sm text-gray-400 mb-1">Savings Rate</p>
                    <p className={`text-xl sm:text-2xl font-bold ${savingsCalculations.savingsRate >= 20 ? 'text-emerald-400' : savingsCalculations.savingsRate >= 10 ? 'text-yellow-400' : 'text-red-400'}`}>{savingsCalculations.savingsRate.toFixed(1)}%</p>
                  </div>
                </div>

                {savingsTips.length > 0 && (
                  <div className="bg-gray-900 rounded-2xl p-6 border border-gray-800">
                    <h3 className="text-lg font-semibold mb-6">💡 Personalized Tips</h3>
                    <div className="space-y-4">
                      {savingsTips.slice(0, 5).map((tip, i) => (
                        <div key={i} className={`p-4 rounded-xl border ${tip.priority === 'critical' ? 'bg-red-900/20 border-red-800' : tip.priority === 'high' ? 'bg-orange-900/20 border-orange-800' : 'bg-emerald-900/20 border-emerald-800'}`}>
                          <div className="flex items-start gap-3">
                            <span className="text-2xl">{tip.icon}</span>
                            <div>
                              <h4 className="font-semibold">{tip.title}</h4>
                              <p className="text-sm text-gray-400">{tip.description}</p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Next Step Button */}
                <div className="mt-8 pt-6 border-t border-gray-800">
                  <button 
                    onClick={() => setStep(3)} 
                    className="w-full sm:w-auto bg-emerald-600 hover:bg-emerald-500 text-white font-semibold py-4 px-8 rounded-xl flex items-center justify-center gap-2 transition-colors"
                  >
                    Continue to Invest & Grow
                    <span>→</span>
                  </button>
                  <p className="text-sm text-gray-500 mt-3">See how your savings can grow over time</p>
                </div>
              </>
            )}
          </>
        )}

        {/* Step 3: Invest & Grow */}
        {step === 3 && calculations && (
          <>
            <h2 className="text-2xl font-bold mb-6">Invest & Grow</h2>
            
            {/* Investment Growth Calculator - Only show if savings is positive */}
            {(savingsCalculations?.monthlySavings || 0) > 0 ? (
              <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-2xl border border-gray-700 p-4 sm:p-6 mb-8">
                <h3 className="font-semibold mb-4">📈 See Your Money Grow</h3>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4 mb-6">
                  <div className="bg-gray-800/50 rounded-xl p-4 text-center">
                    <p className="text-xs text-gray-400 mb-1">Monthly Investment</p>
                    <p className="text-xl sm:text-2xl font-bold text-emerald-400">${(savingsCalculations?.monthlySavings || 0).toLocaleString(undefined, { maximumFractionDigits: 0 })}</p>
                  </div>
                  <div className="bg-gray-800/50 rounded-xl p-4 text-center">
                    <p className="text-xs text-gray-400 mb-1">In 10 Years (7%)</p>
                    <p className="text-xl sm:text-2xl font-bold text-emerald-400">${Math.round((savingsCalculations?.monthlySavings || 0) * 173).toLocaleString()}</p>
                  </div>
                  <div className="bg-gray-800/50 rounded-xl p-4 text-center">
                    <p className="text-xs text-gray-400 mb-1">In 25 Years (7%)</p>
                    <p className="text-xl sm:text-2xl font-bold text-emerald-400">${Math.round((savingsCalculations?.monthlySavings || 0) * 810).toLocaleString()}</p>
                  </div>
                </div>
              </div>
            ) : (
              <div className="bg-gradient-to-br from-red-900/30 to-orange-900/30 rounded-2xl border border-red-800 p-4 sm:p-6 mb-8">
                <h3 className="font-semibold mb-3 text-red-400">⚠️ Your Expenses Exceed Your Income</h3>
                <p className="text-gray-300 mb-4">You're spending <span className="font-bold text-red-400">${Math.abs(savingsCalculations?.monthlySavings || 0).toLocaleString(undefined, { maximumFractionDigits: 0 })}</span> more than you earn each month.</p>
                <div className="bg-gray-900/50 rounded-xl p-4">
                  <h4 className="font-medium text-yellow-400 mb-2">💡 Suggestions to get back on track:</h4>
                  <ul className="text-sm text-gray-300 space-y-2">
                    <li>• Review your expenses in Step 2 - are there areas to cut back?</li>
                    <li>• Consider negotiating bills (phone, insurance, subscriptions)</li>
                    <li>• Look for ways to increase income (side gig, ask for a raise)</li>
                    <li>• Prioritize paying off high-interest debt first</li>
                  </ul>
                </div>
              </div>
            )}

            {/* Recommended Platforms */}
            <div className="bg-gray-900 rounded-2xl border border-gray-800 overflow-hidden mb-8">
              <div className="p-4 border-b border-gray-800">
                <h3 className="font-semibold">Where to Invest</h3>
              </div>
              <div className="divide-y divide-gray-800">
                <a href={AFFILIATE_LINKS.wealthsimple.url} target="_blank" rel="noopener noreferrer" className="flex items-center justify-between p-4 hover:bg-gray-800/50 transition-colors">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-xl flex items-center justify-center text-white font-bold">W</div>
                    <div>
                      <p className="font-medium">Wealthsimple</p>
                      <p className="text-sm text-gray-400">Best for beginners • 0.4% fee</p>
                    </div>
                  </div>
                  <span className="text-emerald-400 text-sm font-medium">Get Cash Bonus →</span>
                </a>
                <a href={AFFILIATE_LINKS.eqBank.url} target="_blank" rel="noopener noreferrer" className="flex items-center justify-between p-4 hover:bg-gray-800/50 transition-colors">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-700 rounded-xl flex items-center justify-center text-white font-bold">EQ</div>
                    <div>
                      <p className="font-medium">EQ Bank</p>
                      <p className="text-sm text-gray-400">High-interest savings • 4%+ interest</p>
                    </div>
                  </div>
                  <span className="text-emerald-400 text-sm font-medium">Get $20 Bonus →</span>
                </a>
                <a href={AFFILIATE_LINKS.questrade.url} target="_blank" rel="noopener noreferrer" className="flex items-center justify-between p-4 hover:bg-gray-800/50 transition-colors">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-green-700 rounded-xl flex items-center justify-center text-white font-bold">Q</div>
                    <div>
                      <p className="font-medium">Questrade</p>
                      <p className="text-sm text-gray-400">DIY investing • $0 ETF purchases</p>
                    </div>
                  </div>
                  <span className="text-emerald-400 text-sm font-medium">Open Account →</span>
                </a>
              </div>
              <div className="p-3 bg-gray-800/30 border-t border-gray-800">
                <p className="text-xs text-gray-500 text-center">{AFFILIATE_DISCLOSURE.short}</p>
              </div>
            </div>

            {/* Next Steps */}
            <div className="bg-gray-900 rounded-2xl border border-gray-800 p-6">
              <h3 className="font-semibold mb-6">🎯 Recommended Next Steps</h3>
              <div className="space-y-4">
                <div className="flex gap-4">
                  <div className="w-8 h-8 bg-emerald-600 rounded-full flex items-center justify-center text-white font-bold text-sm flex-shrink-0">1</div>
                  <div>
                    <h4 className="font-medium">Build Emergency Fund (3-6 months)</h4>
                    <p className="text-sm text-gray-400">Target: ${(netMonthlyForSavings * 3).toLocaleString(undefined, { maximumFractionDigits: 0 })} - ${(netMonthlyForSavings * 6).toLocaleString(undefined, { maximumFractionDigits: 0 })}</p>
                    <a href={AFFILIATE_LINKS.eqBank.url} target="_blank" className="text-emerald-400 text-sm">Open EQ Bank HISA →</a>
                  </div>
                </div>
                <div className="flex gap-4">
                  <div className="w-8 h-8 bg-gray-700 rounded-full flex items-center justify-center text-white font-bold text-sm flex-shrink-0">2</div>
                  <div>
                    <h4 className="font-medium">Max TFSA ($7,000/year)</h4>
                    <p className="text-sm text-gray-400">Tax-free growth, withdraw anytime</p>
                    <a href={AFFILIATE_LINKS.wealthsimple.url} target="_blank" className="text-emerald-400 text-sm">Open TFSA with Wealthsimple →</a>
                  </div>
                </div>
                <div className="flex gap-4">
                  <div className="w-8 h-8 bg-gray-700 rounded-full flex items-center justify-center text-white font-bold text-sm flex-shrink-0">3</div>
                  <div>
                    <h4 className="font-medium">Contribute to RRSP</h4>
                    <p className="text-sm text-gray-400">Room: ${maxRRSPRoom.toLocaleString(undefined, { maximumFractionDigits: 0 })} • Tax refund potential</p>
                    <a href={AFFILIATE_LINKS.questrade.url} target="_blank" className="text-emerald-400 text-sm">Open RRSP with Questrade →</a>
                  </div>
                </div>
              </div>
            </div>

            {/* ETF Performance Table */}
            <div className="bg-gray-900 rounded-2xl border border-gray-800 overflow-hidden mb-8 mt-8">
              <div className="p-4 border-b border-gray-800 flex items-center justify-between">
                <div>
                  <h3 className="font-semibold">📊 Popular Canadian ETFs</h3>
                  {etfLastUpdated && (
                    <p className="text-xs text-gray-500">Last updated: {new Date(etfLastUpdated).toLocaleDateString()}</p>
                  )}
                </div>
                <button 
                  onClick={fetchETFData} 
                  disabled={etfLoading}
                  className="text-xs text-gray-400 hover:text-gray-300 disabled:opacity-50"
                >
                  {etfLoading ? 'Loading...' : 'Refresh'}
                </button>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-800/50">
                    <tr>
                      <th className="text-left py-3 px-4 text-sm text-gray-400 font-medium">ETF</th>
                      <th className="text-left py-3 px-4 text-sm text-gray-400 font-medium">Name</th>
                      <th className="text-right py-3 px-4 text-sm text-gray-400 font-medium">Price</th>
                      <th className="text-right py-3 px-4 text-sm text-gray-400 font-medium">YTD</th>
                      <th className="text-right py-3 px-4 text-sm text-gray-400 font-medium">1Y Return</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-800">
                    {etfLoading ? (
                      <tr>
                        <td colSpan={5} className="py-8 text-center text-gray-500">
                          Loading ETF data...
                        </td>
                      </tr>
                    ) : etfData.length > 0 ? (
                      etfData.map((etf, i) => (
                        <tr key={etf.symbol || i} className="hover:bg-gray-800/30">
                          <td className="py-3 px-4">
                            <span className="font-mono font-medium text-emerald-400">{etf.symbol}</span>
                          </td>
                          <td className="py-3 px-4 text-gray-300 text-sm">{etf.name}</td>
                          <td className="py-3 px-4 text-right text-gray-300">
                            {etf.price ? `$${etf.price.toFixed(2)}` : '-'}
                          </td>
                          <td className={`py-3 px-4 text-right font-medium ${etf.ytdReturn && etf.ytdReturn !== 'N/A' && parseFloat(etf.ytdReturn) >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                            {etf.ytdReturn && etf.ytdReturn !== 'N/A' ? `${parseFloat(etf.ytdReturn) >= 0 ? '+' : ''}${etf.ytdReturn}%` : '-'}
                          </td>
                          <td className={`py-3 px-4 text-right font-medium ${etf.oneYearReturn && etf.oneYearReturn !== 'N/A' && parseFloat(etf.oneYearReturn) >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                            {etf.oneYearReturn && etf.oneYearReturn !== 'N/A' ? `${parseFloat(etf.oneYearReturn) >= 0 ? '+' : ''}${etf.oneYearReturn}%` : '-'}
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={5} className="py-8 text-center text-gray-500">
                          Unable to load ETF data
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
              <div className="p-3 bg-gray-800/30 border-t border-gray-800">
                <p className="text-xs text-gray-500 text-center">Data provided by Twelve Data. Past performance does not guarantee future results.</p>
              </div>
            </div>

            {/* Download PDF Report Button */}
            <div className="bg-gradient-to-r from-emerald-900/30 to-teal-900/30 rounded-2xl p-6 border border-emerald-800 text-center">
              <h3 className="text-lg font-semibold text-emerald-300 mb-2">📄 Get Your Complete Financial Report</h3>
              <p className="text-sm text-gray-400 mb-4">Download a PDF with your tax breakdown, savings plan, debt strategy, and investment recommendations.</p>
              <button onClick={() => setShowEmailModal(true)} className="bg-emerald-600 hover:bg-emerald-500 text-white font-semibold py-4 px-8 rounded-xl transition-colors">
                Download PDF Report
              </button>
            </div>
          </>
        )}
      </main>

      {/* Email Capture Modal */}
      {showEmailModal && (
        <div className="fixed inset-0 z-50">
          <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={() => setShowEmailModal(false)} />
          <div className="absolute inset-x-0 bottom-0 sm:inset-0 sm:flex sm:items-center sm:justify-center sm:p-4">
            <div className="relative w-full sm:max-w-md bg-gray-900 rounded-t-3xl sm:rounded-2xl border-t sm:border border-gray-800 max-h-[90vh] overflow-y-auto">
              <div className="sm:hidden flex justify-center pt-3 pb-1"><div className="w-10 h-1 bg-gray-700 rounded-full" /></div>
              <div className="bg-gradient-to-r from-emerald-600 to-teal-600 p-5 sm:rounded-t-2xl">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-bold text-white">Download Your Report</h3>
                    <p className="text-emerald-100 text-sm">Get your personalized tax breakdown</p>
                  </div>
                  <button onClick={() => setShowEmailModal(false)} className="w-11 h-11 flex items-center justify-center text-white/70 hover:text-white">✕</button>
                </div>
              </div>
              <div className="p-5 pb-8">
                {emailSuccess ? (
                  <div className="text-center py-8">
                    <div className="w-16 h-16 bg-emerald-500/20 rounded-full flex items-center justify-center mx-auto mb-4"><span className="text-3xl">✓</span></div>
                    <h4 className="text-xl font-semibold mb-2">Downloading...</h4>
                    <p className="text-gray-400">Check your email to confirm</p>
                  </div>
                ) : (
                  <form onSubmit={handleEmailSubmit} className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">Name</label>
                      <input type="text" value={emailForm.name} onChange={(e) => setEmailForm({ ...emailForm, name: e.target.value })} placeholder="John Doe" className={`w-full bg-gray-800 border ${emailErrors.name ? 'border-red-500' : 'border-gray-700'} rounded-xl py-3.5 px-4 text-gray-100 focus:outline-none focus:ring-2 focus:ring-emerald-500`} />
                      {emailErrors.name && <p className="text-red-400 text-sm mt-1">{emailErrors.name}</p>}
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">Email</label>
                      <input type="email" value={emailForm.email} onChange={(e) => setEmailForm({ ...emailForm, email: e.target.value })} placeholder="john@example.com" inputMode="email" className={`w-full bg-gray-800 border ${emailErrors.email ? 'border-red-500' : 'border-gray-700'} rounded-xl py-3.5 px-4 text-gray-100 focus:outline-none focus:ring-2 focus:ring-emerald-500`} />
                      {emailErrors.email && <p className="text-red-400 text-sm mt-1">{emailErrors.email}</p>}
                    </div>
                    <button type="submit" disabled={isSubmittingEmail} className="w-full bg-emerald-600 hover:bg-emerald-500 disabled:bg-emerald-800 text-white font-semibold py-4 px-6 rounded-xl flex items-center justify-center gap-2">
                      {isSubmittingEmail ? 'Processing...' : '📄 Download PDF Report'}
                    </button>
                    <p className="text-xs text-gray-500 text-center">We respect your privacy. Unsubscribe anytime.</p>
                  </form>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Footer */}
      <footer className="border-t border-gray-800 mt-16 py-8">
        <div className="max-w-6xl mx-auto px-4">
          <div className="text-center text-sm text-gray-600 mb-6">
            <p>Generated by Girmer</p>
          </div>
          <div className="border-t border-gray-800 pt-6">
            <p className="text-xs text-gray-500 text-center max-w-2xl mx-auto">
              <strong>Disclaimer:</strong> This report is for informational purposes only and does not constitute financial, tax, or legal advice. 
              Tax calculations are estimates based on 2025 rates. Consult a qualified professional for personalized advice. 
              Investment returns are hypothetical and not guaranteed. {AFFILIATE_DISCLOSURE.short}
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
