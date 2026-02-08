import { NextResponse } from 'next/server';

// We'll use jsPDF which works in Node.js/Edge runtime
// For a production app, you might want to use a more robust solution

export async function POST(request) {
  try {
    const data = await request.json();
    
    // Generate HTML that will be converted to PDF
    const html = generatePDFHTML(data);
    
    // Return HTML with print-friendly styling
    // The client will use browser's print-to-PDF functionality
    return new NextResponse(html, {
      status: 200,
      headers: {
        'Content-Type': 'text/html',
      },
    });

  } catch (error) {
    console.error('PDF generation error:', error);
    return NextResponse.json({ error: 'Failed to generate PDF' }, { status: 500 });
  }
}

function generatePDFHTML(data) {
  const {
    name = 'User',
    income = 0,
    province = 'ON',
    provinceName = 'Ontario',
    employmentType = 'employee',
    rrspContribution = 0,
    calculations = {},
    familyMode = false,
    spouseIncome = 0,
    children = [],
    ccb = null,
    hasDebt = false,
    debtCalculations = null,
    savingsCalculations = null,
    expenses = [],
    etfData = [],
  } = data;

  const date = new Date().toLocaleDateString('en-CA', { 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric' 
  });

  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>Girmer Tax Report - ${name}</title>
  <style>
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }
    
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      color: #1f2937;
      line-height: 1.5;
      padding: 40px;
      max-width: 800px;
      margin: 0 auto;
      background: white;
    }
    
    @media print {
      body { padding: 20px; }
      .no-print { display: none; }
      .page-break { page-break-before: always; }
    }
    
    .header {
      text-align: center;
      margin-bottom: 30px;
      padding-bottom: 20px;
      border-bottom: 2px solid #10b981;
    }
    
    .header h1 {
      color: #10b981;
      font-size: 28px;
      margin-bottom: 5px;
    }
    
    .header p {
      color: #6b7280;
      font-size: 14px;
    }
    
    .section {
      margin-bottom: 30px;
    }
    
    .section-title {
      font-size: 18px;
      font-weight: 600;
      color: #1f2937;
      margin-bottom: 15px;
      padding-bottom: 8px;
      border-bottom: 1px solid #e5e7eb;
    }
    
    .summary-grid {
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      gap: 15px;
      margin-bottom: 20px;
    }
    
    .summary-box {
      background: #f9fafb;
      padding: 15px;
      border-radius: 8px;
      border: 1px solid #e5e7eb;
    }
    
    .summary-box.highlight {
      background: #ecfdf5;
      border-color: #10b981;
    }
    
    .summary-box .label {
      font-size: 12px;
      color: #6b7280;
      margin-bottom: 4px;
    }
    
    .summary-box .value {
      font-size: 20px;
      font-weight: 700;
      color: #1f2937;
    }
    
    .summary-box.highlight .value {
      color: #059669;
    }
    
    table {
      width: 100%;
      border-collapse: collapse;
      margin-bottom: 15px;
    }
    
    th, td {
      padding: 10px 12px;
      text-align: left;
      border-bottom: 1px solid #e5e7eb;
    }
    
    th {
      background: #f3f4f6;
      font-weight: 600;
      font-size: 12px;
      color: #6b7280;
      text-transform: uppercase;
    }
    
    td {
      font-size: 14px;
    }
    
    .text-right {
      text-align: right;
    }
    
    .text-green {
      color: #059669;
      font-weight: 600;
    }
    
    .text-red {
      color: #dc2626;
      font-weight: 600;
    }
    
    .callout {
      background: #ede9fe;
      border: 1px solid #c4b5fd;
      border-radius: 8px;
      padding: 15px;
      margin-bottom: 20px;
    }
    
    .callout.green {
      background: #ecfdf5;
      border-color: #6ee7b7;
    }
    
    .callout.blue {
      background: #eff6ff;
      border-color: #93c5fd;
    }
    
    .callout.red {
      background: #fef2f2;
      border-color: #fecaca;
    }
    
    .callout p {
      font-size: 14px;
      color: #374151;
    }
    
    .callout strong {
      color: #1f2937;
    }
    
    .steps {
      counter-reset: step;
    }
    
    .step {
      display: flex;
      gap: 15px;
      margin-bottom: 15px;
      padding-bottom: 15px;
      border-bottom: 1px solid #f3f4f6;
    }
    
    .step:last-child {
      border-bottom: none;
    }
    
    .step-number {
      width: 28px;
      height: 28px;
      background: #10b981;
      color: white;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      font-weight: 700;
      font-size: 14px;
      flex-shrink: 0;
    }
    
    .step-content h4 {
      font-size: 14px;
      font-weight: 600;
      margin-bottom: 4px;
    }
    
    .step-content p {
      font-size: 13px;
      color: #6b7280;
    }
    
    .footer {
      margin-top: 40px;
      padding-top: 20px;
      border-top: 1px solid #e5e7eb;
      text-align: center;
    }
    
    .footer p {
      font-size: 11px;
      color: #9ca3af;
      margin-bottom: 8px;
    }
    
    .print-btn {
      background: #10b981;
      color: white;
      border: none;
      padding: 12px 24px;
      font-size: 16px;
      font-weight: 600;
      border-radius: 8px;
      cursor: pointer;
      margin-bottom: 20px;
    }
    
    .print-btn:hover {
      background: #059669;
    }
  </style>
</head>
<body>
  <div class="no-print" style="text-align: center; margin-bottom: 30px;">
    <button class="print-btn" onclick="window.print()">📄 Save as PDF</button>
    <p style="font-size: 13px; color: #6b7280;">Click the button above, then select "Save as PDF" as your printer</p>
  </div>

  <div class="header">
    <h1>Girmer</h1>
    <p>Personal Tax & Financial Report • ${date}</p>
  </div>

  <!-- Quick Summary -->
  <div class="section">
    <h2 class="section-title">📊 Summary for ${name}</h2>
    <div class="summary-grid">
      <div class="summary-box">
        <div class="label">Gross Annual Income</div>
        <div class="value">$${income.toLocaleString()}</div>
      </div>
      <div class="summary-box">
        <div class="label">Province</div>
        <div class="value">${provinceName}</div>
      </div>
      <div class="summary-box">
        <div class="label">Total Tax & Deductions</div>
        <div class="value text-red">$${(calculations.totalDeductions || 0).toLocaleString()}</div>
      </div>
      <div class="summary-box highlight">
        <div class="label">Net Annual Income</div>
        <div class="value">$${(calculations.netAnnual || 0).toLocaleString()}</div>
      </div>
    </div>
    
    <div class="summary-grid">
      <div class="summary-box">
        <div class="label">Effective Tax Rate</div>
        <div class="value">${(calculations.effectiveRate || 0).toFixed(1)}%</div>
      </div>
      <div class="summary-box">
        <div class="label">Marginal Tax Rate</div>
        <div class="value">${(calculations.marginalRate || 0).toFixed(1)}%</div>
      </div>
      <div class="summary-box">
        <div class="label">Annual RRSP Contribution</div>
        <div class="value">$${rrspContribution.toLocaleString()}</div>
      </div>
      <div class="summary-box highlight">
        <div class="label">Net Monthly Income</div>
        <div class="value">$${(calculations.netMonthly || 0).toLocaleString()}</div>
      </div>
    </div>

    ${rrspContribution > 0 ? `
    <div class="callout">
      <p>💡 <strong>RRSP Tax Savings:</strong> Your $${rrspContribution.toLocaleString()} contribution saved you approximately <strong>$${(calculations.rrspTaxSavings || 0).toLocaleString()}</strong> in taxes!</p>
    </div>
    ` : ''}
  </div>

  <!-- Tax Breakdown -->
  <div class="section">
    <h2 class="section-title">💰 Tax Breakdown</h2>
    <table>
      <thead>
        <tr>
          <th>Category</th>
          <th class="text-right">Amount</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td>Federal Tax</td>
          <td class="text-right text-red">$${(calculations.federalTax?.total || 0).toLocaleString()}</td>
        </tr>
        <tr>
          <td>Provincial Tax (${provinceName})</td>
          <td class="text-right text-red">$${(calculations.provincialTax?.total || 0).toLocaleString()}</td>
        </tr>
        <tr>
          <td>CPP Contributions</td>
          <td class="text-right text-red">$${(calculations.cpp || 0).toLocaleString()}</td>
        </tr>
        <tr>
          <td>EI Premiums</td>
          <td class="text-right text-red">$${(calculations.ei || 0).toLocaleString()}</td>
        </tr>
        <tr style="background: #f9fafb; font-weight: 600;">
          <td>Total Deductions</td>
          <td class="text-right text-red">$${(calculations.totalDeductions || 0).toLocaleString()}</td>
        </tr>
      </tbody>
    </table>
  </div>

  ${familyMode && (spouseIncome > 0 || children.length > 0) ? `
  <div class="section">
    <h2 class="section-title">👨‍👩‍👧‍👦 Family Benefits</h2>
    
    ${spouseIncome > 0 ? `
    <div class="callout blue">
      <p><strong>Combined Family Income:</strong> $${(income + spouseIncome).toLocaleString()}</p>
      <p><strong>Spouse Income:</strong> $${spouseIncome.toLocaleString()}</p>
    </div>
    ` : ''}
    
    ${ccb && ccb.annual > 0 ? `
    <table>
      <thead>
        <tr>
          <th>Canada Child Benefit</th>
          <th class="text-right">Amount</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td>Monthly CCB</td>
          <td class="text-right text-green">$${ccb.monthly.toLocaleString()}</td>
        </tr>
        <tr>
          <td>Annual CCB</td>
          <td class="text-right text-green">$${ccb.annual.toLocaleString()}</td>
        </tr>
      </tbody>
    </table>
    <p style="font-size: 12px; color: #6b7280;">Based on ${children.length} ${children.length === 1 ? 'child' : 'children'}</p>
    ` : ''}
  </div>
  ` : ''}

  ${hasDebt && debtCalculations ? `
  <div class="section page-break">
    <h2 class="section-title">💳 Debt Payoff Strategy</h2>
    
    <div class="summary-grid">
      <div class="summary-box">
        <div class="label">Total Debt</div>
        <div class="value text-red">$${debtCalculations.totalDebt.toLocaleString()}</div>
      </div>
      <div class="summary-box">
        <div class="label">Monthly Interest</div>
        <div class="value text-red">$${debtCalculations.totalMonthlyInterest.toLocaleString()}</div>
      </div>
    </div>

    ${debtCalculations.strategies ? `
    <div class="callout ${debtCalculations.strategies.recommended === 'avalanche' ? 'green' : 'blue'}">
      <p>✨ <strong>Recommended:</strong> ${debtCalculations.strategies.recommended === 'avalanche' ? 'Avalanche Method' : 'Snowball Method'}</p>
      <p>Payoff time: <strong>${debtCalculations.strategies[debtCalculations.strategies.recommended].months} months</strong></p>
      <p>Total interest paid: <strong>$${debtCalculations.strategies[debtCalculations.strategies.recommended].totalInterest.toLocaleString()}</strong></p>
      ${debtCalculations.strategies.interestSaved > 0 ? `<p>You save <strong>$${debtCalculations.strategies.interestSaved.toLocaleString()}</strong> vs the other method!</p>` : ''}
    </div>
    ` : ''}
  </div>
  ` : ''}

  ${savingsCalculations ? `
  <div class="section">
    <h2 class="section-title">📈 Monthly Budget & Savings</h2>
    
    <div class="summary-grid">
      <div class="summary-box">
        <div class="label">Monthly Expenses</div>
        <div class="value">$${savingsCalculations.totalExpenses.toLocaleString()}</div>
      </div>
      <div class="summary-box highlight">
        <div class="label">Monthly Savings</div>
        <div class="value">$${savingsCalculations.monthlySavings.toLocaleString()}</div>
      </div>
      <div class="summary-box">
        <div class="label">Savings Rate</div>
        <div class="value ${savingsCalculations.savingsRate >= 20 ? 'text-green' : ''}">${savingsCalculations.savingsRate.toFixed(1)}%</div>
      </div>
      <div class="summary-box highlight">
        <div class="label">Annual Savings</div>
        <div class="value">$${(savingsCalculations.monthlySavings * 12).toLocaleString()}</div>
      </div>
    </div>

    ${expenses.length > 0 ? `
    <table>
      <thead>
        <tr>
          <th>Expense Category</th>
          <th class="text-right">Monthly</th>
        </tr>
      </thead>
      <tbody>
        ${expenses.filter(e => parseFloat(e.amount) > 0).map(e => `
        <tr>
          <td>${e.name}</td>
          <td class="text-right">$${parseFloat(e.amount).toLocaleString()}</td>
        </tr>
        `).join('')}
      </tbody>
    </table>
    ` : ''}
  </div>
  ` : ''}

  <div class="section page-break">
    <h2 class="section-title">🚀 Investment & Growth Plan</h2>
    
    <div class="callout green">
      <p>📈 <strong>Your $${(savingsCalculations?.monthlySavings || 0).toLocaleString()}/month invested at 7% average return:</strong></p>
      <p>• In 10 years: <strong>$${Math.round((savingsCalculations?.monthlySavings || 0) * 173).toLocaleString()}</strong></p>
      <p>• In 25 years: <strong>$${Math.round((savingsCalculations?.monthlySavings || 0) * 810).toLocaleString()}</strong></p>
    </div>

    <h3 style="font-size: 14px; font-weight: 600; margin: 20px 0 15px;">Recommended Investment Order</h3>
    <div class="steps">
      <div class="step">
        <div class="step-number">1</div>
        <div class="step-content">
          <h4>Build Emergency Fund (3-6 months)</h4>
          <p>Target: $${((calculations.netMonthly || 0) * 3).toLocaleString()} - $${((calculations.netMonthly || 0) * 6).toLocaleString()}</p>
        </div>
      </div>
      <div class="step">
        <div class="step-number">2</div>
        <div class="step-content">
          <h4>Max TFSA ($7,000/year)</h4>
          <p>Tax-free growth, flexible withdrawals anytime</p>
        </div>
      </div>
      <div class="step">
        <div class="step-number">3</div>
        <div class="step-content">
          <h4>Contribute to RRSP</h4>
          <p>Room: $${(income * 0.18 > 31560 ? 31560 : income * 0.18).toLocaleString()} • Get tax refund</p>
        </div>
      </div>
      <div class="step">
        <div class="step-number">4</div>
        <div class="step-content">
          <h4>Consider FHSA (First Home Savings)</h4>
          <p>$8,000/year if buying your first home</p>
        </div>
      </div>
    </div>

    ${etfData.length > 0 ? `
    <h3 style="font-size: 14px; font-weight: 600; margin: 20px 0 15px;">Popular Canadian ETFs</h3>
    <table>
      <thead>
        <tr>
          <th>ETF</th>
          <th>Name</th>
          <th class="text-right">1Y Return</th>
        </tr>
      </thead>
      <tbody>
        ${etfData.slice(0, 5).map(etf => `
        <tr>
          <td><strong>${etf.symbol}</strong></td>
          <td>${etf.name}</td>
          <td class="text-right ${etf.oneYearReturn && parseFloat(etf.oneYearReturn) >= 0 ? 'text-green' : 'text-red'}">${etf.oneYearReturn && etf.oneYearReturn !== 'N/A' ? (parseFloat(etf.oneYearReturn) >= 0 ? '+' : '') + etf.oneYearReturn + '%' : '-'}</td>
        </tr>
        `).join('')}
      </tbody>
    </table>
    <p style="font-size: 11px; color: #9ca3af;">Past performance does not guarantee future results.</p>
    ` : ''}

    <h3 style="font-size: 14px; font-weight: 600; margin: 20px 0 15px;">Recommended Platforms</h3>
    <table>
      <thead>
        <tr>
          <th>Platform</th>
          <th>Best For</th>
          <th>Fees</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td><strong>Wealthsimple</strong></td>
          <td>Beginners, hands-off</td>
          <td>0.4-0.5%</td>
        </tr>
        <tr>
          <td><strong>Questrade</strong></td>
          <td>DIY investors</td>
          <td>$0 ETF buys</td>
        </tr>
        <tr>
          <td><strong>EQ Bank</strong></td>
          <td>Emergency fund</td>
          <td>No fees, 4%+ interest</td>
        </tr>
      </tbody>
    </table>
  </div>

  <div class="footer">
    <p><strong>Disclaimer:</strong> This report is for informational purposes only and does not constitute financial, tax, or legal advice. Tax calculations are estimates based on 2025 rates. Consult a qualified professional for personalized advice. Investment returns are hypothetical and not guaranteed.</p>
    <p style="margin-top: 15px; font-weight: 500; color: #6b7280;">Generated by Girmer</p>
  </div>

  <script>
    // Auto-trigger print dialog after a short delay
    // window.onload = function() { setTimeout(function() { window.print(); }, 500); }
  </script>
</body>
</html>
  `;
}
