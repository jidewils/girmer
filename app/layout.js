import './globals.css'

export const metadata = {
  title: 'Girmer - Canadian Tax Calculator & Savings Planner',
  description: 'Calculate your Canadian income tax, see detailed breakdowns by province, and plan your savings with personalized tips.',
  keywords: 'Canadian tax calculator, income tax, RRSP, tax brackets, savings planner, Ontario tax, BC tax, Alberta tax',
  openGraph: {
    title: 'Girmer - Canadian Tax Calculator & Savings Planner',
    description: 'Calculate your Canadian income tax and plan your savings with personalized tips.',
    type: 'website',
  },
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className="bg-gray-950 text-gray-100 antialiased">
        {children}
      </body>
    </html>
  )
}
