import React, { useState, useEffect, useMemo, useRef } from 'react';

// --- CURRENCY CONFIGURATION ---
const CURRENCIES = [
  { code: 'USD', symbol: '$', name: 'US Dollar' },
  { code: 'EUR', symbol: '€', name: 'Euro' },
  { code: 'GBP', symbol: '£', name: 'British Pound' },
  { code: 'JPY', symbol: '¥', name: 'Japanese Yen' },
  { code: 'INR', symbol: '₹', name: 'Indian Rupee' },
];

const App = () => {
  // State for input variables
  const [principal, setPrincipal] = useState(15000);
  const [rate, setRate] = useState(6.5);
  const [years, setYears] = useState(15);
  const [contributions, setContributions] = useState(250);

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

  // Financial Calculation Logic
  const calculateFutureValue = useMemo(() => {
    const P = principal || 0;
    const r = (rate / 100) || 0;
    const t = years || 0;
    const n = 12; 
    const PMT = contributions || 0;
    const r_n = r / n;

    if (t === 0) return { totalValue: P, principalTotal: P, interestEarned: 0, contributionsTotal: 0 };

    const principalFV = P * Math.pow((1 + r_n), (n * t));
    let contributionsFV = 0;
    if (r_n > 0) {
      contributionsFV = PMT * (Math.pow((1 + r_n), (n * t)) - 1) / r_n;
    } else {
      contributionsFV = PMT * (n * t);
    }
    
    const totalValue = principalFV + contributionsFV;
    const principalTotal = P;
    const contributionsTotal = PMT * n * t;
    const interestEarned = totalValue - (principalTotal + contributionsTotal);

    return { totalValue, principalTotal, contributionsTotal, interestEarned };
  }, [principal, rate, years, contributions]);

  const { totalValue, principalTotal, contributionsTotal, interestEarned } = calculateFutureValue;
  const totalInvested = principalTotal + contributionsTotal;

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currencyCode,
      minimumFractionDigits: 0, 
      maximumFractionDigits: 0,
    }).format(amount);
  };

  useEffect(() => {
    function handleClickOutside(event) {
      if (currencyRef.current && !currencyRef.current.contains(event.target)) {
        setIsCurrencyMenuOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleInputChange = (setter) => (e) => {
    const value = parseFloat(e.target.value);
    setter(value >= 0 ? value : 0);
  };

  const handleCurrencyChange = (code) => {
    setCurrencyCode(code);
    setIsCurrencyMenuOpen(false);
  };

  // --- Sub-Components ---
  const InputField = ({ label, value, setter, unit, min = 0, max = 1000000, step = 1 }) => (
    <div className="input-group">
      <label className="input-label">{label}</label>
      <div className="input-container">
        {unit === '$' && <span className="input-decorator">{currentCurrency.symbol}</span>}
        <input
          type="number"
          value={value}
          onChange={handleInputChange(setter)}
          min={min}
          max={max}
          className="text-input"
        />
        {unit === '%' && <span className="input-decorator">%</span>}
        {unit === 'Yr' && <span className="input-decorator">Years</span>}
      </div>
      <input
        type="range"
        value={value}
        onChange={handleInputChange(setter)}
        min={min}
        max={max}
        step={step}
        className="range-slider"
      />
    </div>
  );

  const ResultCard = ({ label, value, colorClass }) => (
    <div className={`result-card ${colorClass}`}>
      <span className="result-label">{label}</span>
      <span className="result-value">{formatCurrency(value)}</span>
    </div>
  );

  const PieChart = ({ data }) => {
    let cumulativeAngle = 0;
    const total = data.reduce((sum, item) => sum + item.value, 0);
    return (
      <svg viewBox="0 0 100 100" className="chart-svg">
        {total > 0 ? (
          data.map((item, index) => {
            const startAngle = cumulativeAngle;
            const endAngle = cumulativeAngle + (item.value / total) * 360;
            const largeArcFlag = endAngle - startAngle > 180 ? 1 : 0;
            const startX = 50 + 45 * Math.cos((startAngle - 90) * Math.PI / 180);
            const startY = 50 + 45 * Math.sin((startAngle - 90) * Math.PI / 180);
            const endX = 50 + 45 * Math.cos((endAngle - 90) * Math.PI / 180);
            const endY = 50 + 45 * Math.sin((endAngle - 90) * Math.PI / 180);
            cumulativeAngle = endAngle;
            return (
              <path
                key={index}
                d={`M 50,50 L ${startX},${startY} A 45,45 0 ${largeArcFlag} 1 ${endX},${endY} Z`}
                fill={item.color}
                stroke={isDark ? '#1e293b' : '#ffffff'}
                strokeWidth="1"
              />
            );
          })
        ) : (
          <circle cx="50" cy="50" r="45" fill="#e2e8f0" />
        )}
      </svg>
    );
  };

  const pieChartData = [
    { label: "Principal", value: principalTotal, color: '#6366f1' },
    { label: "Contributions", value: contributionsTotal, color: '#10b981' },
    { label: "Interest", value: interestEarned, color: '#f43f5e' },
  ].filter(i => i.value > 0);

  return (
    <div className={`app-wrapper ${isDark ? 'dark-theme' : 'light-theme'}`}>
      <style>{`
        :root {
          --bg-primary: #f8fafc;
          --bg-card: #ffffff;
          --text-main: #1e293b;
          --text-muted: #64748b;
          --accent: #6366f1;
          --accent-hover: #4f46e5;
          --border: #e2e8f0;
          --shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.1);
          --input-bg: #f1f5f9;
        }

        .dark-theme {
          --bg-primary: #0f172a;
          --bg-card: #1e293b;
          --text-main: #f1f5f9;
          --text-muted: #94a3b8;
          --accent: #818cf8;
          --accent-hover: #6366f1;
          --border: #334155;
          --shadow: 0 20px 50px rgba(0, 0, 0, 0.3);
          --input-bg: #0f172a;
        }

        * { box-sizing: border-box; transition: background-color 0.3s, border-color 0.3s; }
        body { margin: 0; font-family: 'Inter', system-ui, sans-serif; }
        
        .app-wrapper {
          min-height: 100vh;
          background: var(--bg-primary);
          color: var(--text-main);
          padding: 2rem;
          display: flex;
          flex-direction: column;
          align-items: center;
        }

        .header {
          width: 100%;
          max-width: 1200px;
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 3rem;
        }

        .brand { font-size: 1.75rem; font-weight: 800; color: var(--accent); margin: 0; }

        .controls { display: flex; gap: 1rem; }

        .icon-btn {
          width: 44px; height: 44px;
          border-radius: 50%;
          border: 1px solid var(--border);
          background: var(--bg-card);
          color: var(--text-main);
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          box-shadow: var(--shadow);
        }

        .main-container {
          width: 100%;
          max-width: 1200px;
          display: grid;
          grid-template-columns: 1fr 2fr;
          gap: 2rem;
        }

        @media (max-width: 968px) { .main-container { grid-template-columns: 1fr; } }

        .card {
          background: var(--bg-card);
          border: 1px solid var(--border);
          border-radius: 1.5rem;
          padding: 2rem;
          box-shadow: var(--shadow);
        }

        .input-group { margin-bottom: 1.5rem; }
        .input-label { display: block; font-weight: 600; margin-bottom: 0.75rem; color: var(--text-muted); font-size: 0.9rem; }
        
        .input-container {
          display: flex;
          align-items: center;
          background: var(--input-bg);
          border: 1px solid var(--border);
          border-radius: 0.75rem;
          padding: 0.5rem 1rem;
          gap: 0.5rem;
        }

        .text-input {
          background: transparent;
          border: none;
          color: var(--text-main);
          font-size: 1.25rem;
          font-weight: 700;
          width: 100%;
          outline: none;
        }

        .input-decorator { font-weight: 700; color: var(--accent); }

        .range-slider {
          width: 100%;
          margin-top: 1rem;
          accent-color: var(--accent);
          cursor: pointer;
        }

        .results-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 1.5rem;
          margin-bottom: 2rem;
        }

        @media (max-width: 640px) { .results-grid { grid-template-columns: 1fr; } }

        .result-card {
          padding: 1.5rem;
          border-radius: 1rem;
          display: flex;
          flex-direction: column;
          align-items: center;
          border: 1px solid var(--border);
          background: var(--bg-card);
          border-bottom: 4px solid var(--accent);
        }

        .result-label { font-size: 0.85rem; font-weight: 600; color: var(--text-muted); margin-bottom: 0.5rem; }
        .result-value { font-size: 1.5rem; font-weight: 800; color: var(--accent); }

        .visual-card { display: flex; gap: 2rem; align-items: center; }
        @media (max-width: 768px) { .visual-card { flex-direction: column; } }

        .chart-container { flex: 1; max-width: 300px; position: relative; }
        .chart-svg { width: 100%; height: auto; filter: drop-shadow(0 10px 15px rgba(0,0,0,0.1)); }

        .legend { flex: 1.2; width: 100%; }
        .legend-item {
          display: flex;
          justify-content: space-between;
          padding: 1rem;
          background: var(--input-bg);
          border-radius: 0.75rem;
          margin-bottom: 0.75rem;
        }

        .legend-label { display: flex; align-items: center; gap: 0.75rem; font-weight: 600; }
        .dot { width: 12px; height: 12px; border-radius: 50%; }
        .legend-value { font-weight: 700; }

        .total-row {
          margin-top: 1.5rem;
          padding-top: 1.5rem;
          border-top: 2px dashed var(--border);
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .dropdown-menu {
          position: absolute;
          top: 55px; right: 0;
          background: var(--bg-card);
          border: 1px solid var(--border);
          border-radius: 0.75rem;
          box-shadow: var(--shadow);
          z-index: 100;
          width: 200px;
          overflow: hidden;
        }

        .dropdown-item {
          width: 100%; padding: 0.75rem 1rem;
          border: none; background: none;
          text-align: left; color: var(--text-main);
          cursor: pointer;
        }

        .dropdown-item:hover { background: var(--input-bg); }
      `}</style>

      <header className="header">
        <h1 className="brand">GrowthSim</h1>
        <div className="controls">
          <div ref={currencyRef} style={{ position: 'relative' }}>
            <button className="icon-btn" onClick={() => setIsCurrencyMenuOpen(!isCurrencyMenuOpen)}>
              {currentCurrency.symbol}
            </button>
            {isCurrencyMenuOpen && (
              <div className="dropdown-menu">
                {CURRENCIES.map(c => (
                  <button key={c.code} className="dropdown-item" onClick={() => handleCurrencyChange(c.code)}>
                    {c.symbol} - {c.name}
                  </button>
                ))}
              </div>
            )}
          </div>
          <button className="icon-btn" onClick={() => setIsDark(!isDark)}>
            {isDark ? '☀️' : '🌙'}
          </button>
        </div>
      </header>

      <main className="main-container">
        <section className="card">
          <h2 style={{ marginBottom: '2rem' }}>Parameters</h2>
          <InputField label="Initial Principal" value={principal} setter={setPrincipal} unit="$" max={500000} step={500} />
          <InputField label="Interest Rate" value={rate} setter={setRate} unit="%" max={25} step={0.1} />
          <InputField label="Investment Years" value={years} setter={setYears} unit="Yr" max={50} />
          <InputField label="Monthly Contribution" value={contributions} setter={setContributions} unit="$" max={5000} step={50} />
        </section>

        <section>
          <div className="results-grid">
            <ResultCard label="Final Balance" value={totalValue} colorClass="primary" />
            <ResultCard label="Invested Amount" value={totalInvested} colorClass="secondary" />
            <ResultCard label="Total Interest" value={interestEarned} colorClass="tertiary" />
          </div>

          <div className="card visual-card">
            <div className="chart-container">
              <PieChart data={pieChartData} />
            </div>
            <div className="legend">
              <h3>Investment Breakdown</h3>
              <div className="legend-item">
                <span className="legend-label"><div className="dot" style={{background: '#6366f1'}}></div> Principal</span>
                <span className="legend-value">{formatCurrency(principalTotal)}</span>
              </div>
              <div className="legend-item">
                <span className="legend-label"><div className="dot" style={{background: '#10b981'}}></div> Contributions</span>
                <span className="legend-value">{formatCurrency(contributionsTotal)}</span>
              </div>
              <div className="legend-item">
                <span className="legend-label"><div className="dot" style={{background: '#f43f5e'}}></div> Interest</span>
                <span className="legend-value">{formatCurrency(interestEarned)}</span>
              </div>
              <div className="total-row">
                <span style={{ fontWeight: 800, fontSize: '1.2rem' }}>Future Value</span>
                <span style={{ fontWeight: 800, fontSize: '1.8rem', color: 'var(--accent)' }}>{formatCurrency(totalValue)}</span>
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
};

export default App;
