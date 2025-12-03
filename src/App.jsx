import React, { useState, useEffect, useMemo, useRef } from 'react';

// --- CURRENCY CONFIGURATION ---
const CURRENCIES = [
  { code: 'USD', symbol: '$', name: 'US Dollar' },
  { code: 'EUR', symbol: '€', name: 'Euro' },
  { code: 'GBP', symbol: '£', name: 'British Pound' },
  { code: 'JPY', symbol: '¥', name: 'Japanese Yen' },
  { code: 'INR', symbol: '₹', name: 'Indian Rupee' },
];


// --- MAIN APP COMPONENT ---
const App = () => {
  // State for input variables
  const [principal, setPrincipal] = useState(15000); // Initial Investment
  const [rate, setRate] = useState(6.5);             // Annual Interest Rate (%)
  const [years, setYears] = useState(15);            // Time Horizon (Years)
  const [contributions, setContributions] = useState(250); // Monthly Contributions

  // State for UI
  const [isDark, setIsDark] = useState(true);
  const [currencyCode, setCurrencyCode] = useState('USD');
  const [isCurrencyMenuOpen, setIsCurrencyMenuOpen] = useState(false);
  const currencyRef = useRef(null);

  // Find the currently selected currency details
  const currentCurrency = useMemo(() => 
    CURRENCIES.find(c => c.code === currencyCode) || CURRENCIES[0], 
    [currencyCode]
  );

  // Function to calculate Future Value (FV) using compounding and regular contributions
  const calculateFutureValue = useMemo(() => {
    // A = P(1 + r/n)^(nt) + PMT * [((1 + r/n)^(nt) - 1) / (r/n)]
    // Where:
    // P = Principal (Initial investment)
    // r = Annual interest rate (decimal)
    // t = Time (years)
    // n = number of times interest is compounded per year (monthly = 12)
    // PMT = Periodic Monthly Contribution

    const P = principal || 0;
    const r = (rate / 100) || 0;
    const t = years || 0;
    const n = 12; // Monthly compounding
    const PMT = contributions || 0;
    
    // Monthly interest rate
    const r_n = r / n;

    if (t === 0) return { totalValue: P, principalTotal: P, interestEarned: 0, contributionsTotal: 0 };

    // 1. Future Value of a single sum (Principal + Compounding)
    const principalFV = P * Math.pow((1 + r_n), (n * t));

    // 2. Future Value of an annuity (Contributions)
    let contributionsFV = 0;
    if (r_n > 0) {
      contributionsFV = PMT * (Math.pow((1 + r_n), (n * t)) - 1) / r_n;
    } else {
      // Simple accumulation if rate is 0
      contributionsFV = PMT * (n * t);
    }
    
    const totalValue = principalFV + contributionsFV;

    // Total money contributed by the user (Principal + PMT * n * t)
    const principalTotal = P;
    const contributionsTotal = PMT * n * t;
    const totalInvested = principalTotal + contributionsTotal;

    // Interest earned is the total value minus the total invested
    const interestEarned = totalValue - totalInvested;

    return {
      totalValue,
      principalTotal,
      contributionsTotal,
      interestEarned
    };
  }, [principal, rate, years, contributions]);

  const { totalValue, principalTotal, contributionsTotal, interestEarned } = calculateFutureValue;
  const totalInvested = principalTotal + contributionsTotal;

  // Formatting currency helper
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currencyCode, // Dynamically use the selected currency code
      minimumFractionDigits: 0, 
      maximumFractionDigits: 0,
    }).format(amount);
  };

  // --- Theme Toggle Logic ---
  useEffect(() => {
    if (isDark) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }

    // Close menu when clicking outside
    function handleClickOutside(event) {
      if (currencyRef.current && !currencyRef.current.contains(event.target)) {
        setIsCurrencyMenuOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isDark]);

  const handleInputChange = (setter) => (e) => {
    const value = parseFloat(e.target.value);
    setter(value >= 0 ? value : 0);
  };

  const handleCurrencyChange = (code) => {
    setCurrencyCode(code);
    setIsCurrencyMenuOpen(false);
  };

  // Tailwind classes based on theme
  const backgroundClass = 'bg-gradient-to-br from-slate-950 to-slate-800 dark:from-slate-950 dark:to-slate-800 text-gray-800 dark:text-gray-100 transition-colors duration-500';
  const cardClass = 'bg-white dark:bg-slate-800 shadow-2xl rounded-2xl p-6 lg:p-8 border border-slate-200 dark:border-slate-700 transition-all duration-300 hover:shadow-violet-500/30';
  const inputClass = 'w-full px-4 py-2 border dark:border-slate-600 rounded-lg text-lg bg-gray-50 dark:bg-slate-700 focus:ring-violet-500 focus:border-violet-500 transition duration-200';
  const rangeSliderClass = 'w-full h-2 mt-3 rounded-lg appearance-none cursor-pointer bg-slate-200 dark:bg-slate-700 [&::-webkit-slider-thumb]:bg-violet-500 [&::-moz-range-thumb]:bg-violet-500 [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:shadow-lg';


  // --- Input Field Component ---
  const InputField = ({ label, value, setter, unit, min = 0, max = 1000000, step = 1 }) => (
    <div className="mb-6">
      <label className="block text-lg font-medium text-slate-700 dark:text-slate-300 mb-2">{label}</label>
      <div className="flex items-center space-x-3">
        {/* Dynamic currency symbol for money fields */}
        {unit === '$' && <span className="text-xl font-bold dark:text-slate-400">{currentCurrency.symbol}</span>}
        <input
          type="number"
          value={value}
          onChange={handleInputChange(setter)}
          min={min}
          max={max}
          step={step}
          className={inputClass}
          aria-label={label}
        />
        {unit === '%' && <span className="text-xl font-bold dark:text-slate-400">%</span>}
        {unit === 'Yr' && <span className="text-lg font-bold dark:text-slate-400">Years</span>}
      </div>
      <input
        type="range"
        value={value}
        onChange={handleInputChange(setter)}
        min={min}
        max={max}
        step={step}
        className={rangeSliderClass}
      />
    </div>
  );

  // --- Result Box Component ---
  const ResultBox = ({ label, value, borderColorClass }) => (
    <div className={`${cardClass} flex flex-col items-center justify-center text-center p-4 h-full transition duration-300 hover:scale-[1.02] border-t-4 ${borderColorClass}`}>
      <p className="text-lg font-semibold text-slate-700 dark:text-slate-300 mb-1">{label}</p>
      <p className="text-3xl lg:text-4xl font-extrabold text-violet-500">
        {formatCurrency(value)}
      </p>
    </div>
  );

  // --- Chart Data for Pie Chart ---
  const pieChartData = [
    { label: "Initial Principal", value: principalTotal, color: '#6366F1' }, // Indigo-500
    { label: "Total Contributions", value: contributionsTotal, color: '#22C55E' }, // Green-500
    { label: "Interest Earned", value: interestEarned, color: '#EF4444' }, // Red-500
  ].filter(item => item.value > 0);

  // --- Pie Chart SVG Component (Simple and responsive) ---
  const PieChart = ({ data }) => {
    let cumulativeAngle = 0;
    const total = data.reduce((sum, item) => sum + item.value, 0);

    return (
      <svg viewBox="0 0 100 100" className="w-full h-full max-h-96" aria-labelledby="chartTitle">
        <title id="chartTitle">Investment Breakdown</title>
        {total > 0 ? (
          data.map((item, index) => {
            const startAngle = cumulativeAngle;
            const endAngle = cumulativeAngle + (item.value / total) * 360;
            const largeArcFlag = endAngle - startAngle > 180 ? 1 : 0;

            const startX = 50 + 50 * Math.cos(startAngle * Math.PI / 180);
            const startY = 50 + 50 * Math.sin(startAngle * Math.PI / 180);
            const endX = 50 + 50 * Math.cos(endAngle * Math.PI / 180);
            const endY = 50 + 50 * Math.sin(endAngle * Math.PI / 180);

            cumulativeAngle = endAngle;

            return (
              <path
                key={index}
                d={`M 50,50 L ${startX},${startY} A 50,50 0 ${largeArcFlag} 1 ${endX},${endY} Z`}
                fill={item.color}
                stroke={isDark ? '#1E293B' : '#FFFFFF'} // Card background color
                strokeWidth="0.5"
                title={`${item.label}: ${formatCurrency(item.value)}`}
              />
            );
          })
        ) : (
          <text x="50" y="50" textAnchor="middle" fill={isDark ? '#475569' : '#94A3B8'} fontSize="8">
            Enter values to calculate
          </text>
        )}
      </svg>
    );
  };


  return (
    <div className={`min-h-screen font-sans ${backgroundClass} p-4 sm:p-8 antialiased`}>
      
      {/* Header and Theme Toggle */}
      <header className="flex justify-between items-center max-w-7xl mx-auto py-4 mb-8">
        <h1 className="text-3xl font-extrabold text-violet-500 tracking-tight">
          Financial Growth Simulator
        </h1>
        <div className='flex space-x-4 items-center'>

          {/* Currency Selector */}
          <div ref={currencyRef} className="relative inline-block text-left">
            <button
              onClick={() => setIsCurrencyMenuOpen(!isCurrencyMenuOpen)}
              className="p-3 rounded-full bg-violet-600 text-white dark:bg-violet-600 hover:bg-violet-500 dark:hover:bg-violet-500 transition-all duration-200 shadow-md flex items-center justify-center text-sm font-semibold w-12 h-12"
              aria-expanded={isCurrencyMenuOpen}
              aria-haspopup="true"
              aria-label={`Current Currency: ${currentCurrency.name}`}
            >
              {currentCurrency.symbol}
            </button>
            
            {/* Currency Dropdown Menu */}
            {isCurrencyMenuOpen && (
              <div className="absolute right-0 mt-2 w-48 rounded-md shadow-lg bg-white dark:bg-slate-700 ring-1 ring-black ring-opacity-5 z-10 transition transform origin-top-right">
                <div className="py-1" role="menu" aria-orientation="vertical" aria-labelledby="options-menu">
                  {CURRENCIES.map((c) => (
                    <button
                      key={c.code}
                      onClick={() => handleCurrencyChange(c.code)}
                      className={`block w-full text-left px-4 py-2 text-sm transition-colors duration-150 ${
                        c.code === currencyCode
                          ? 'bg-violet-100 dark:bg-violet-900 text-violet-600 dark:text-violet-300 font-bold'
                          : 'text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-slate-600'
                      }`}
                      role="menuitem"
                    >
                      {`${c.symbol} ${c.name} (${c.code})`}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Theme Toggle */}
          <button
            onClick={() => setIsDark(!isDark)}
            className="p-3 rounded-full bg-slate-700 text-white dark:bg-slate-700 hover:bg-slate-600 dark:hover:bg-slate-600 transition-all duration-200 shadow-md w-12 h-12 flex items-center justify-center"
            aria-label="Toggle dark mode"
          >
            {isDark ? (
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-sun"><circle cx="12" cy="12" r="4"/><path d="M12 2v2"/><path d="M12 20v2"/><path d="M4.93 4.93l1.41 1.41"/><path d="M17.66 17.66l1.41 1.41"/><path d="M2 12h2"/><path d="M20 12h2"/><path d="M6.34 17.66l-1.41 1.41"/><path d="M17.66 6.34l1.41-1.41"/></svg>
            ) : (
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-moon"><path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z"/></svg>
            )}
          </button>
        </div>
      </header>

      {/* Main Content Grid */}
      <div className="grid lg:grid-cols-3 gap-8 max-w-7xl mx-auto">
        
        {/* Left Column: Input Panel */}
        <div className={`lg:col-span-1 ${cardClass} border-violet-500`}>
          <h2 className="text-2xl font-bold mb-6 text-slate-800 dark:text-white">Investment Parameters</h2>
          <InputField
            label="Initial Investment (Principal)"
            value={principal}
            setter={setPrincipal}
            unit="$"
            min={0}
            max={500000}
            step={100}
          />
          <InputField
            label="Annual Interest Rate"
            value={rate}
            setter={setRate}
            unit="%"
            min={0}
            max={20}
            step={0.1}
          />
          <InputField
            label="Time Horizon"
            value={years}
            setter={setYears}
            unit="Yr"
            min={1}
            max={60}
            step={1}
          />
          <InputField
            label="Monthly Contribution"
            value={contributions}
            setter={setContributions}
            unit="$"
            min={0}
            max={10000}
            step={50}
          />
        </div>

        {/* Right Column: Results & Visualization */}
        <div className="lg:col-span-2 space-y-8">
          
          {/* Top Row: Key Results */}
          <div className="grid sm:grid-cols-3 gap-6">
            <ResultBox label="Total Future Value" value={totalValue} borderColorClass="border-violet-500" />
            <ResultBox label="Total Invested" value={totalInvested} borderColorClass="border-emerald-500" />
            <ResultBox label="Interest Earned" value={interestEarned} borderColorClass="border-rose-500" />
          </div>

          {/* Bottom Row: Visualization and Legend */}
          <div className={`${cardClass} flex flex-col md:flex-row gap-8`}>
            
            {/* Pie Chart Area */}
            <div className="w-full md:w-1/2 h-64 md:h-auto max-h-[400px]">
              <PieChart data={pieChartData} />
            </div>
            
            {/* Legend & Breakdown */}
            <div className="w-full md:w-1/2 flex flex-col justify-center">
              <h3 className="text-2xl font-bold mb-4 text-slate-800 dark:text-white">Investment Breakdown</h3>
              <div className="space-y-4">
                
                {/* Initial Principal */}
                <div className="flex justify-between items-center p-3 rounded-lg bg-gray-50 dark:bg-slate-700 shadow-sm">
                  <span className="flex items-center text-slate-800 dark:text-slate-300 text-lg">
                    <div className="w-4 h-4 rounded-full mr-3 bg-indigo-500"></div>
                    Initial Principal
                  </span>
                  <span className="font-extrabold text-xl text-indigo-500">{formatCurrency(principalTotal)}</span>
                </div>

                {/* Total Contributions */}
                <div className="flex justify-between items-center p-3 rounded-lg bg-gray-50 dark:bg-slate-700 shadow-sm">
                  <span className="flex items-center text-slate-800 dark:text-slate-300 text-lg">
                    <div className="w-4 h-4 rounded-full mr-3 bg-emerald-500"></div>
                    Total Contributions
                  </span>
                  <span className="font-extrabold text-xl text-emerald-500">{formatCurrency(contributionsTotal)}</span>
                </div>

                {/* Interest Earned */}
                <div className="flex justify-between items-center p-3 rounded-lg bg-gray-50 dark:bg-slate-700 shadow-sm">
                  <span className="flex items-center text-slate-800 dark:text-slate-300 text-lg">
                    <div className="w-4 h-4 rounded-full mr-3 bg-rose-500"></div>
                    Interest Earned
                  </span>
                  <span className="font-extrabold text-xl text-rose-500">{formatCurrency(interestEarned)}</span>
                </div>
                
                {/* Total Value Summary */}
                <div className="flex justify-between items-center pt-6 border-t border-slate-300 dark:border-slate-600 mt-6">
                    <span className="text-2xl font-bold text-slate-800 dark:text-white">TOTAL FUTURE VALUE</span>
                    <span className="text-3xl font-extrabold text-violet-600 dark:text-violet-400">{formatCurrency(totalValue)}</span>
                </div>

              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default App;
