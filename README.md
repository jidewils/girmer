# Girmer

A Canadian Tax Calculator & Savings Planner built with Next.js.

## Features

### Tax Calculator
- Calculate federal and provincial taxes for all 13 Canadian provinces/territories
- Support for employees and self-employed individuals
- RRSP contribution calculator with tax savings display
- Detailed breakdown by tax bracket
- CPP and EI calculations
- Visual charts showing income distribution

### Savings Planner
- Input monthly expenses (customizable categories)
- Calculate savings rate
- Personalized tips based on income level and savings rate
- Emergency fund timeline calculator
- Investment growth projections

## Tech Stack

- **Framework:** Next.js 14 (App Router)
- **Styling:** Tailwind CSS
- **Charts:** Recharts
- **Deployment:** Vercel

## Getting Started

### Prerequisites

- Node.js 18+ 
- npm or yarn

### Installation

1. Clone the repository:
```bash
git clone https://github.com/yourusername/girmer.git
cd girmer
```

2. Install dependencies:
```bash
npm install
```

3. Run the development server:
```bash
npm run dev
```

4. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Deployment

This project is configured for easy deployment on Vercel:

1. Push your code to GitHub
2. Connect your repository to Vercel
3. Deploy!

Or use the Vercel CLI:
```bash
npm i -g vercel
vercel
```

## Project Structure

```
girmer/
├── app/
│   ├── globals.css      # Global styles + Tailwind
│   ├── layout.js        # Root layout with metadata
│   └── page.js          # Main page
├── components/
│   └── TaxCalculator.jsx # Main calculator component
├── lib/
│   ├── tax-calculations.js # Tax calculation logic
│   └── savings-tips.js     # Savings tips generator
├── public/              # Static assets
├── next.config.js
├── tailwind.config.js
├── postcss.config.js
└── package.json
```

## Tax Data

Tax brackets and rates are based on 2025 Canadian federal and provincial figures:

- Federal tax brackets
- Provincial tax brackets for all 13 provinces/territories
- CPP contribution rates and maximums
- EI premium rates and maximums
- RRSP contribution limits

**Disclaimer:** This calculator is for informational purposes only. Consult a tax professional for accurate tax advice.

## License

MIT License - feel free to use this project for personal or commercial purposes.
