'use client';

import { useState, useMemo, useEffect } from 'react';
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import {
  FEDERAL_BRACKETS,
  PROVINCIAL_BRACKETS,
  PROVINCE_NAMES,
  RRSP_LIMIT_2025,
  RRSP_RATE,
  calculateTax,
  calculateCPP,
  calculateEI,
} from '@/lib/tax-calculations';
import { generateSavingsTips } from '@/lib/savings-tips';

const COLORS = {
  federal: '#ef4444',
  provincial: '#f97316',
  cpp: '#eab308',
  ei: '#84cc16',
  net: '#22c55e',
  rrsp: '#8b5cf6',
  expenses: '#6366f1',
  savings: '#10b981',
};

export default function TaxCalculator() {
  const [step, setStep] = useState(1);
  const [grossIncome, setGrossIncome] = useState('');
  const [province, setProvince] = useState('ON');
  const [employmentType, setEmploymentType] = useState('employee');
  const [rrspContribution, setRrspContribution] = useState('');
  const [expenses, setExpenses] = useState([
    { id: 1, name: 'Rent / Mortgage', amount: '' },
    { id: 2, name: 'Utilities', amount: '' },
    { id: 3, name: 'Groceries', amount: '' },
    { id: 4, name: 'Transportation', amount: '' },
    { id: 5, name: 'Insurance', amount: '' },
    { id: 6, name: 'Subscriptions', amount: '' },
  ]);
  const [newExpenseName, setNewExpenseName] = useState('');

  // Scroll to top when switching between steps
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [step]);

  const isSelfEmployed = employmentType === 'self-employed';
  const income = parseFloat(grossIncome) || 0;
  const rrsp = parseFloat(rrspContribution) || 0;
  
  const maxRRSPRoom = Math.min(income * RRSP_RATE, RRSP_LIMIT_2025);
  const validRRSP = Math.min(rrsp, maxRRSPRoom);

  const calculations = useMemo(() => {
    if (income === 0) return null;

    const taxableIncome = Math.max(0, income - validRRSP);
    
    const federalTax = calculateTax(taxableIncome, FEDERAL_BRACKETS);
    const provincialTax = calculateTax(taxableIncome, PROVINCIAL_BRACKETS[province]);
    
    const cpp = calculateCPP(income, isSelfEmployed);
    const ei = calculateEI(income, isSelfEmployed);
    
    const federalTaxNoRRSP = calculateTax(income, FEDERAL_BRACKETS);
    const provincialTaxNoRRSP = calculateTax(income, PROVINCIAL_BRACKETS[province]);
    const taxWithoutRRSP = federalTaxNoRRSP.total + provincialTaxNoRRSP.total;
    const taxWithRRSP = federalTax.total + provincialTax.total;
    const rrspTaxSavings = taxWithoutRRSP - taxWithRRSP;
    
    const totalDeductions = federalTax.total + provincialTax.total + cpp + ei;
    const netAnnual = income - totalDeductions - validRRSP;
    const netMonthly = netAnnual / 12;
    
    const effectiveRate = (totalDeductions / income) * 100;
    const lastFederalBracket = FEDERAL_BRACKETS.find(b => taxableIncome <= b.max) || FEDERAL_BRACKETS[FEDERAL_BRACKETS.length - 1];
    const lastProvincialBracket = PROVINCIAL_BRACKETS[province].find(b => taxableIncome <= b.max) || PROVINCIAL_BRACKETS[province][PROVINCIAL_BRACKETS[province].length - 1];
    const marginalRate = (lastFederalBracket.rate + lastProvincialBracket.rate) * 100;

    return {
      taxableIncome,
      federalTax,
      provincialTax,
      cpp,
      ei,
      totalDeductions,
      netAnnual,
      netMonthly,
      effectiveRate,
      marginalRate,
      rrspTaxSavings,
      validRRSP,
      maxRRSPRoom,
    };
  }, [income, province, isSelfEmployed, validRRSP]);

  const savingsCalculations = useMemo(() => {
    if (!calculations) return null;
    
    const totalExpenses = expenses.reduce((sum, exp) => sum + (parseFloat(exp.amount) || 0), 0);
    const monthlySavings = calculations.netMonthly - totalExpenses;
    const savingsRate = calculations.netMonthly > 0 ? (monthlySavings / calculations.netMonthly) * 100 : 0;
    
    return {
      totalExpenses,
      monthlySavings,
      savingsRate,
    };
  }, [calculations, expenses]);

  const savingsTips = useMemo(() => {
    if (!calculations || !savingsCalculations) return [];
    return generateSavingsTips(
      income,
      calculations.netMonthly,
      savingsCalculations.savingsRate,
      savingsCalculations.totalExpenses,
      savingsCalculations.monthlySavings,
      validRRSP
    );
  }, [income, calculations, savingsCalculations, validRRSP]);

  const addExpense = () => {
    if (newExpenseName.trim()) {
      setExpenses([...expenses, { id: Date.now(), name: newExpenseName.trim(), amount: '' }]);
      setNewExpenseName('');
    }
  };

  const updateExpense = (id, amount) => {
    setExpenses(expenses.map(exp => exp.id === id ? { ...exp, amount } : exp));
  };

  const removeExpense = (id) => {
    setExpenses(expenses.filter(exp => exp.id !== id));
  };

  const pieData = calculations ? [
    { name: 'Federal Tax', value: calculations.federalTax.total, color: COLORS.federal },
    { name: 'Provincial Tax', value: calculations.provincialTax.total, color: COLORS.provincial },
    { name: 'CPP', value: calculations.cpp, color: COLORS.cpp },
    { name: 'EI', value: calculations.ei, color: COLORS.ei },
    { name: 'RRSP', value: calculations.validRRSP, color: COLORS.rrsp },
    { name: 'Net Income', value: calculations.netAnnual, color: COLORS.net },
  ].filter(d => d.value > 0) : [];

  const barData = calculations ? [
    { name: 'Gross', amount: income },
    { name: 'Federal', amount: -calculations.federalTax.total },
    { name: 'Provincial', amount: -calculations.provincialTax.total },
    { name: 'CPP', amount: -calculations.cpp },
    { name: 'EI', amount: -calculations.ei },
    { name: 'RRSP', amount: -calculations.validRRSP },
    { name: 'Net', amount: calculations.netAnnual },
  ].filter(d => d.name === 'Gross' || d.name === 'Net' || d.amount !== 0) : [];

  return (
    <div className="min-h-screen bg-gray-950 text-gray-100">
      {/* Header */}
      <header className="border-b border-gray-800 bg-gray-900/50 backdrop-blur-sm sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-4 py-4 flex flex-col sm:flex-row items-center justify-between gap-4">
          <h1 className="text-2xl font-bold text-emerald-400">Girmer</h1>
          <div className="flex gap-2">
            <button
              onClick={() => setStep(1)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                step === 1 ? 'bg-emerald-600 text-white' : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
              }`}
            >
              Tax Calculator
            </button>
            <button
              onClick={() => setStep(2)}
              disabled={!calculations}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                step === 2 ? 'bg-emerald-600 text-white' : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
              } ${!calculations ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              Savings Planner
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-8">
        {step === 1 ? (
          <>
            {/* Input Section */}
            <div className="bg-gray-900 rounded-2xl p-4 sm:p-6 mb-8 border border-gray-800">
              <h2 className="text-xl font-semibold mb-6 text-gray-100">Enter Your Income Details</h2>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-2">
                    Gross Annual Income
                  </label>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500">$</span>
                    <input
                      type="number"
                      value={grossIncome}
                      onChange={(e) => setGrossIncome(e.target.value)}
                      placeholder="150,000"
                      className="w-full bg-gray-800 border border-gray-700 rounded-xl py-3 pl-8 pr-4 text-lg font-medium text-gray-100 placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                    />
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-2">
                    Province / Territory
                  </label>
                  <select
                    value={province}
                    onChange={(e) => setProvince(e.target.value)}
                    className="w-full bg-gray-800 border border-gray-700 rounded-xl py-3 px-4 text-lg font-medium text-gray-100 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent appearance-none cursor-pointer"
                  >
                    {Object.entries(PROVINCE_NAMES).map(([code, name]) => (
                      <option key={code} value={code}>{name}</option>
                    ))}
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-2">
                    Employment Type
                  </label>
                  <select
                    value={employmentType}
                    onChange={(e) => setEmploymentType(e.target.value)}
                    className="w-full bg-gray-800 border border-gray-700 rounded-xl py-3 px-4 text-lg font-medium text-gray-100 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent appearance-none cursor-pointer"
                  >
                    <option value="employee">Employee</option>
                    <option value="self-employed">Self-Employed / Freelancer</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-2">
                    RRSP Contribution
                    {income > 0 && (
                      <span className="text-gray-600 ml-1 block sm:inline">(max: ${maxRRSPRoom.toLocaleString(undefined, {maximumFractionDigits: 0})})</span>
                    )}
                  </label>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500">$</span>
                    <input
                      type="number"
                      value={rrspContribution}
                      onChange={(e) => setRrspContribution(e.target.value)}
                      placeholder="0"
                      max={maxRRSPRoom}
                      className="w-full bg-gray-800 border border-gray-700 rounded-xl py-3 pl-8 pr-4 text-lg font-medium text-gray-100 placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    />
                  </div>
                </div>
              </div>
              
              {/* RRSP Info Box */}
              {income > 0 && (
                <div className="mt-4 p-4 bg-purple-900/20 border border-purple-800/50 rounded-xl">
                  <div className="flex items-start gap-3">
                    <span className="text-purple-400 text-lg">💡</span>
                    <div className="text-sm">
                      <p className="text-purple-300 font-medium">RRSP Tax Benefit</p>
                      <p className="text-gray-400 mt-1">
                        RRSP contributions reduce your taxable income. Your 2025 limit is 18% of income up to ${RRSP_LIMIT_2025.toLocaleString()}.
                        {validRRSP > 0 && calculations && (
                          <span className="text-purple-400 font-medium">
                            {' '}Your ${validRRSP.toLocaleString()} contribution saves ~${calculations.rrspTaxSavings.toLocaleString(undefined, {maximumFractionDigits: 0})} in taxes!
                          </span>
                        )}
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {calculations && (
              <>
                {/* Scroll indicator for mobile */}
                <div className="md:hidden flex flex-col items-center mb-6 animate-bounce">
                  <p className="text-sm text-gray-400 mb-2">Scroll down for your results</p>
                  <svg className="w-6 h-6 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
                  </svg>
                </div>

                {/* Summary Cards */}
                <div className="grid grid-cols-2 lg:grid-cols-5 gap-3 sm:gap-4 mb-8">
                  <div className="bg-gray-900 rounded-2xl p-4 sm:p-5 border border-gray-800">
                    <p className="text-xs sm:text-sm text-gray-400 mb-1">Gross Income</p>
                    <p className="text-xl sm:text-2xl font-bold text-gray-100">${income.toLocaleString()}</p>
                    <p className="text-xs sm:text-sm text-gray-500">${(income / 12).toLocaleString(undefined, { maximumFractionDigits: 0 })}/mo</p>
                  </div>
                  
                  {validRRSP > 0 && (
                    <div className="bg-purple-900/30 rounded-2xl p-4 sm:p-5 border border-purple-800">
                      <p className="text-xs sm:text-sm text-purple-400 mb-1">RRSP</p>
                      <p className="text-xl sm:text-2xl font-bold text-purple-400">-${validRRSP.toLocaleString()}</p>
                      <p className="text-xs sm:text-sm text-purple-600">Saves ${calculations.rrspTaxSavings.toLocaleString(undefined, {maximumFractionDigits: 0})}</p>
                    </div>
                  )}
                  
                  <div className="bg-gray-900 rounded-2xl p-4 sm:p-5 border border-gray-800">
                    <p className="text-xs sm:text-sm text-gray-400 mb-1">Total Deductions</p>
                    <p className="text-xl sm:text-2xl font-bold text-red-400">-${calculations.totalDeductions.toLocaleString(undefined, { maximumFractionDigits: 0 })}</p>
                    <p className="text-xs sm:text-sm text-gray-500">-${(calculations.totalDeductions / 12).toLocaleString(undefined, { maximumFractionDigits: 0 })}/mo</p>
                  </div>
                  
                  <div className="bg-emerald-900/30 rounded-2xl p-4 sm:p-5 border border-emerald-800">
                    <p className="text-xs sm:text-sm text-emerald-400 mb-1">Net Income</p>
                    <p className="text-xl sm:text-2xl font-bold text-emerald-400">${calculations.netAnnual.toLocaleString(undefined, { maximumFractionDigits: 0 })}</p>
                    <p className="text-xs sm:text-sm text-emerald-600">${calculations.netMonthly.toLocaleString(undefined, { maximumFractionDigits: 0 })}/mo</p>
                  </div>
                  
                  <div className="bg-gray-900 rounded-2xl p-4 sm:p-5 border border-gray-800 col-span-2 lg:col-span-1">
                    <p className="text-xs sm:text-sm text-gray-400 mb-1">Tax Rates</p>
                    <p className="text-base sm:text-lg font-bold text-gray-100">{calculations.effectiveRate.toFixed(1)}% <span className="text-xs sm:text-sm font-normal text-gray-500">effective</span></p>
                    <p className="text-base sm:text-lg font-bold text-gray-100">{calculations.marginalRate.toFixed(1)}% <span className="text-xs sm:text-sm font-normal text-gray-500">marginal</span></p>
                  </div>
                </div>

                {/* Charts */}
                <div className="grid md:grid-cols-2 gap-6 mb-8">
                  <div className="bg-gray-900 rounded-2xl p-4 sm:p-6 border border-gray-800">
                    <h3 className="text-lg font-semibold mb-4 text-gray-100">Income Distribution</h3>
                    <ResponsiveContainer width="100%" height={280}>
                      <PieChart>
                        <Pie
                          data={pieData}
                          cx="50%"
                          cy="50%"
                          innerRadius={60}
                          outerRadius={100}
                          paddingAngle={2}
                          dataKey="value"
                        >
                          {pieData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Pie>
                        <Tooltip
                          formatter={(value) => `$${value.toLocaleString(undefined, { maximumFractionDigits: 0 })}`}
                          contentStyle={{ backgroundColor: '#1f2937', border: 'none', borderRadius: '8px', color: '#ffffff' }}
                          labelStyle={{ color: '#ffffff' }}
                          itemStyle={{ color: '#ffffff' }}
                        />
                      </PieChart>
                    </ResponsiveContainer>
                    <div className="flex flex-wrap justify-center gap-3 sm:gap-4 mt-4">
                      {pieData.map((entry) => (
                        <div key={entry.name} className="flex items-center gap-2">
                          <div className="w-3 h-3 rounded-full" style={{ backgroundColor: entry.color }} />
                          <span className="text-xs text-gray-400">{entry.name}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="bg-gray-900 rounded-2xl p-4 sm:p-6 border border-gray-800">
                    <h3 className="text-lg font-semibold mb-4 text-gray-100">Deduction Breakdown</h3>
                    <ResponsiveContainer width="100%" height={280}>
                      <BarChart data={barData} layout="vertical">
                        <XAxis type="number" tickFormatter={(v) => `$${(v / 1000).toFixed(0)}k`} stroke="#6b7280" />
                        <YAxis type="category" dataKey="name" stroke="#6b7280" width={70} />
                        <Tooltip
                          formatter={(value) => `$${Math.abs(value).toLocaleString(undefined, { maximumFractionDigits: 0 })}`}
                          contentStyle={{ backgroundColor: '#1f2937', border: 'none', borderRadius: '8px', color: '#ffffff' }}
                          labelStyle={{ color: '#ffffff' }}
                          itemStyle={{ color: '#ffffff' }}
                        />
                        <Bar dataKey="amount" radius={[0, 4, 4, 0]}>
                          {barData.map((entry, index) => (
                            <Cell
                              key={`cell-${index}`}
                              fill={
                                entry.name === 'RRSP' ? COLORS.rrsp :
                                entry.amount >= 0 ? COLORS.net : COLORS.federal
                              }
                            />
                          ))}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                {/* Detailed Breakdown */}
                <div className="grid md:grid-cols-2 gap-6 mb-8">
                  {/* Federal Tax */}
                  <div className="bg-gray-900 rounded-2xl p-4 sm:p-6 border border-gray-800">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-lg font-semibold text-gray-100">Federal Tax</h3>
                      <span className="text-xl font-bold text-red-400">
                        -${calculations.federalTax.total.toLocaleString(undefined, { maximumFractionDigits: 0 })}
                      </span>
                    </div>
                    {validRRSP > 0 && (
                      <p className="text-xs text-purple-400 mb-3">Taxable income: ${calculations.taxableIncome.toLocaleString()} (after RRSP)</p>
                    )}
                    <div className="space-y-3">
                      {calculations.federalTax.details.map((bracket, i) => (
                        <div key={i} className="flex items-center justify-between text-sm">
                          <div>
                            <span className="text-gray-400 text-xs sm:text-sm">{bracket.range}</span>
                            <span className="text-gray-600 ml-2 text-xs sm:text-sm">@ {bracket.rate}</span>
                          </div>
                          <span className="text-gray-300">${bracket.tax.toLocaleString(undefined, { maximumFractionDigits: 0 })}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Provincial Tax */}
                  <div className="bg-gray-900 rounded-2xl p-4 sm:p-6 border border-gray-800">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-lg font-semibold text-gray-100">{PROVINCE_NAMES[province]} Tax</h3>
                      <span className="text-xl font-bold text-orange-400">
                        -${calculations.provincialTax.total.toLocaleString(undefined, { maximumFractionDigits: 0 })}
                      </span>
                    </div>
                    {validRRSP > 0 && (
                      <p className="text-xs text-purple-400 mb-3">Taxable income: ${calculations.taxableIncome.toLocaleString()} (after RRSP)</p>
                    )}
                    <div className="space-y-3">
                      {calculations.provincialTax.details.map((bracket, i) => (
                        <div key={i} className="flex items-center justify-between text-sm">
                          <div>
                            <span className="text-gray-400 text-xs sm:text-sm">{bracket.range}</span>
                            <span className="text-gray-600 ml-2 text-xs sm:text-sm">@ {bracket.rate}</span>
                          </div>
                          <span className="text-gray-300">${bracket.tax.toLocaleString(undefined, { maximumFractionDigits: 0 })}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* CPP & EI */}
                <div className="grid md:grid-cols-2 gap-6 mb-8">
                  <div className="bg-gray-900 rounded-2xl p-4 sm:p-6 border border-gray-800">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="text-lg font-semibold text-gray-100">CPP Contributions</h3>
                      <span className="text-xl font-bold text-yellow-400">
                        -${calculations.cpp.toLocaleString(undefined, { maximumFractionDigits: 0 })}
                      </span>
                    </div>
                    <p className="text-sm text-gray-500">
                      {isSelfEmployed 
                        ? 'As self-employed, you pay both employee and employer portions (2x)'
                        : 'Employee contribution (employer pays matching amount)'}
                    </p>
                  </div>

                  <div className="bg-gray-900 rounded-2xl p-4 sm:p-6 border border-gray-800">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="text-lg font-semibold text-gray-100">EI Premiums</h3>
                      <span className="text-xl font-bold text-lime-400">
                        {isSelfEmployed ? '$0' : `-$${calculations.ei.toLocaleString(undefined, { maximumFractionDigits: 0 })}`}
                      </span>
                    </div>
                    <p className="text-sm text-gray-500">
                      {isSelfEmployed 
                        ? 'Self-employed individuals are exempt from EI (optional enrollment available)'
                        : 'Employment Insurance premiums'}
                    </p>
                  </div>
                </div>

                {/* CTA to Savings */}
                <div className="bg-gradient-to-r from-emerald-900/50 to-teal-900/50 rounded-2xl p-6 sm:p-8 border border-emerald-800 text-center">
                  <h3 className="text-xl sm:text-2xl font-bold text-emerald-400 mb-2">
                    You'll take home ${calculations.netMonthly.toLocaleString(undefined, { maximumFractionDigits: 0 })} per month
                  </h3>
                  <p className="text-gray-400 mb-6">Now let's plan how to make the most of it</p>
                  <button
                    onClick={() => setStep(2)}
                    className="bg-emerald-600 hover:bg-emerald-500 text-white font-semibold px-8 py-3 rounded-xl transition-colors"
                  >
                    Plan Your Savings →
                  </button>
                </div>
              </>
            )}
          </>
        ) : (
          <>
            {/* Savings Planner */}
            <div className="mb-8">
              <button
                onClick={() => setStep(1)}
                className="text-gray-400 hover:text-gray-200 text-sm mb-4 flex items-center gap-2"
              >
                ← Back to Tax Calculator
              </button>
              
              <div className="bg-emerald-900/30 rounded-2xl p-6 border border-emerald-800 mb-8">
                <p className="text-sm text-emerald-400 mb-1">Your Monthly Net Income</p>
                <p className="text-3xl sm:text-4xl font-bold text-emerald-400">
                  ${calculations?.netMonthly.toLocaleString(undefined, { maximumFractionDigits: 0 })}
                </p>
              </div>
            </div>

            {/* Expenses Input */}
            <div className="bg-gray-900 rounded-2xl p-4 sm:p-6 border border-gray-800 mb-8">
              <h2 className="text-xl font-semibold mb-6 text-gray-100">Monthly Expenses</h2>
              <p className="text-sm text-gray-500 mb-6">All fields are optional. Add your expenses to see how much you can save.</p>
              
              <div className="grid sm:grid-cols-2 gap-4 mb-6">
                {expenses.map((expense) => (
                  <div key={expense.id} className="flex items-center gap-3">
                    <div className="flex-1">
                      <label className="block text-sm text-gray-400 mb-1">{expense.name}</label>
                      <div className="relative">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">$</span>
                        <input
                          type="number"
                          value={expense.amount}
                          onChange={(e) => updateExpense(expense.id, e.target.value)}
                          placeholder="0"
                          className="w-full bg-gray-800 border border-gray-700 rounded-lg py-2 pl-8 pr-3 text-gray-100 placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                        />
                      </div>
                    </div>
                    <button
                      onClick={() => removeExpense(expense.id)}
                      className="mt-6 text-gray-600 hover:text-red-400 transition-colors"
                    >
                      ✕
                    </button>
                  </div>
                ))}
              </div>

              {/* Add Custom Expense */}
              <div className="flex gap-3">
                <input
                  type="text"
                  value={newExpenseName}
                  onChange={(e) => setNewExpenseName(e.target.value)}
                  placeholder="Add custom expense..."
                  className="flex-1 bg-gray-800 border border-gray-700 rounded-lg py-2 px-4 text-gray-100 placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                  onKeyPress={(e) => e.key === 'Enter' && addExpense()}
                />
                <button
                  onClick={addExpense}
                  className="bg-gray-700 hover:bg-gray-600 text-gray-200 px-4 py-2 rounded-lg transition-colors"
                >
                  + Add
                </button>
              </div>
            </div>

            {/* Savings Summary */}
            {savingsCalculations && (
              <div className="grid grid-cols-3 gap-3 sm:gap-4 mb-8">
                <div className="bg-gray-900 rounded-2xl p-4 sm:p-5 border border-gray-800">
                  <p className="text-xs sm:text-sm text-gray-400 mb-1">Total Expenses</p>
                  <p className="text-lg sm:text-2xl font-bold text-indigo-400">
                    ${savingsCalculations.totalExpenses.toLocaleString(undefined, { maximumFractionDigits: 0 })}
                  </p>
                  <p className="text-xs sm:text-sm text-gray-500">/month</p>
                </div>
                
                <div className={`rounded-2xl p-4 sm:p-5 border ${
                  savingsCalculations.monthlySavings >= 0 
                    ? 'bg-emerald-900/30 border-emerald-800' 
                    : 'bg-red-900/30 border-red-800'
                }`}>
                  <p className={`text-xs sm:text-sm mb-1 ${savingsCalculations.monthlySavings >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                    Monthly Savings
                  </p>
                  <p className={`text-lg sm:text-2xl font-bold ${savingsCalculations.monthlySavings >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                    ${savingsCalculations.monthlySavings.toLocaleString(undefined, { maximumFractionDigits: 0 })}
                  </p>
                  <p className={`text-xs sm:text-sm ${savingsCalculations.monthlySavings >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>
                    ${(savingsCalculations.monthlySavings * 12).toLocaleString(undefined, { maximumFractionDigits: 0 })}/yr
                  </p>
                </div>
                
                <div className="bg-gray-900 rounded-2xl p-4 sm:p-5 border border-gray-800">
                  <p className="text-xs sm:text-sm text-gray-400 mb-1">Savings Rate</p>
                  <p className={`text-lg sm:text-2xl font-bold ${
                    savingsCalculations.savingsRate >= 20 ? 'text-emerald-400' :
                    savingsCalculations.savingsRate >= 10 ? 'text-yellow-400' : 'text-red-400'
                  }`}>
                    {savingsCalculations.savingsRate.toFixed(1)}%
                  </p>
                  <p className="text-xs sm:text-sm text-gray-500">
                    {savingsCalculations.savingsRate >= 20 ? 'Excellent!' :
                     savingsCalculations.savingsRate >= 10 ? 'Good' : 'Needs work'}
                  </p>
                </div>
              </div>
            )}

            {/* Visual Breakdown */}
            {savingsCalculations && savingsCalculations.totalExpenses > 0 && (
              <div className="bg-gray-900 rounded-2xl p-4 sm:p-6 border border-gray-800 mb-8">
                <h3 className="text-lg font-semibold mb-4 text-gray-100">Where Your Money Goes</h3>
                <div className="space-y-3">
                  {expenses.filter(e => parseFloat(e.amount) > 0).map((expense) => {
                    const amount = parseFloat(expense.amount) || 0;
                    const percentage = (amount / calculations.netMonthly) * 100;
                    return (
                      <div key={expense.id}>
                        <div className="flex justify-between text-sm mb-1">
                          <span className="text-gray-400">{expense.name}</span>
                          <span className="text-gray-300">${amount.toLocaleString()} ({percentage.toFixed(1)}%)</span>
                        </div>
                        <div className="h-2 bg-gray-800 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-indigo-500 rounded-full"
                            style={{ width: `${Math.min(percentage, 100)}%` }}
                          />
                        </div>
                      </div>
                    );
                  })}
                  
                  {savingsCalculations.monthlySavings > 0 && (
                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span className="text-emerald-400 font-medium">Savings</span>
                        <span className="text-emerald-400">
                          ${savingsCalculations.monthlySavings.toLocaleString(undefined, { maximumFractionDigits: 0 })} ({savingsCalculations.savingsRate.toFixed(1)}%)
                        </span>
                      </div>
                      <div className="h-2 bg-gray-800 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-emerald-500 rounded-full"
                          style={{ width: `${Math.min(savingsCalculations.savingsRate, 100)}%` }}
                        />
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Personalized Tips */}
            {savingsTips.length > 0 && (
              <div className="bg-gray-900 rounded-2xl p-4 sm:p-6 border border-gray-800">
                <h3 className="text-lg font-semibold mb-6 text-gray-100">💡 Personalized Savings Tips</h3>
                <div className="space-y-4">
                  {savingsTips.map((tip, index) => (
                    <div 
                      key={index} 
                      className={`p-4 rounded-xl border ${
                        tip.priority === 'critical' ? 'bg-red-900/20 border-red-800' :
                        tip.priority === 'high' ? 'bg-orange-900/20 border-orange-800' :
                        tip.priority === 'medium' ? 'bg-blue-900/20 border-blue-800' :
                        tip.priority === 'low' ? 'bg-gray-800/50 border-gray-700' :
                        'bg-emerald-900/20 border-emerald-800'
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        <span className="text-2xl">{tip.icon}</span>
                        <div>
                          <h4 className={`font-semibold mb-1 ${
                            tip.priority === 'critical' ? 'text-red-400' :
                            tip.priority === 'high' ? 'text-orange-400' :
                            tip.priority === 'medium' ? 'text-blue-400' :
                            tip.priority === 'low' ? 'text-gray-300' :
                            'text-emerald-400'
                          }`}>
                            {tip.title}
                          </h4>
                          <p className="text-sm text-gray-400">{tip.description}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-gray-800 mt-16 py-8 text-center text-sm text-gray-600">
        <p>Girmer — Canadian Tax Calculator & Savings Planner</p>
        <p className="mt-1">Tax rates based on 2025 figures. For informational purposes only.</p>
      </footer>
    </div>
  );
}
