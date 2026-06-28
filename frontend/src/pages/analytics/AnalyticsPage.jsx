import React, { useState } from 'react';
import Layout from '../../components/Layout';
import { Calendar, BarChart3, LineChart, Award, Clock, Users, ArrowUpRight } from 'lucide-react';

export default function AnalyticsPage() {
  const [dateRange, setDateRange] = useState('30days');

  const handleExport = () => {
    alert('Full analytics executive report downloaded.');
  };

  // Mock statistics
  const stats = [
    { name: 'Avg Time to Shortlist', value: '7.8s', change: '-12%', icon: Clock, color: 'var(--color-brand)' },
    { name: 'Total Candidates Processed', value: '1,420', change: '+24%', icon: Users, color: 'var(--color-text-secondary)' },
    { name: 'Avg Score Across Jobs', value: '78.6', change: '+3.2%', icon: Award, color: 'var(--color-brand)' },
    { name: 'Shortlist Acceptance Rate', value: '92.4%', change: '+5.4%', icon: ArrowUpRight, color: 'var(--color-accent)' },
  ];

  return (
    <Layout pageTitle="Analytics">
      {/* Header filter actions */}
      <div className="flex-between mb-4">
        <h3 style={{ margin: 0 }}>Hiring Performance Metrics</h3>
        <div style={{ display: 'flex', gap: '12px' }}>
          <select 
            className="input-field" 
            style={{ width: '150px', padding: '6px 12px', fontSize: '13px' }}
            value={dateRange}
            onChange={(e) => setDateRange(e.target.value)}
          >
            <option value="7days">Last 7 Days</option>
            <option value="30days">Last 30 Days</option>
            <option value="90days">Last Quarter</option>
          </select>
          
          <button className="btn btn-secondary btn-small" onClick={handleExport}>
            Export Report
          </button>
        </div>
      </div>

      {/* Row 1: KPI Stats */}
      <div className="grid-4 mb-4">
        {stats.map((stat, idx) => {
          const IconComponent = stat.icon;
          return (
            <div key={idx} className="card" style={{ marginBottom: 0, display: 'flex', alignItems: 'center', gap: '16px' }}>
              <div style={{ backgroundColor: 'var(--color-tag-bg)', padding: '12px', borderRadius: '8px', color: stat.color }}>
                <IconComponent size={22} />
              </div>
              <div>
                <span className="text-muted text-small">{stat.name}</span>
                <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px', marginTop: '4px' }}>
                  <h2 style={{ fontSize: '24px', margin: 0 }}>{stat.value}</h2>
                  <span style={{ fontSize: '11px', color: stat.change.startsWith('+') ? '#28A745' : 'var(--color-brand)', fontWeight: 600 }}>
                    {stat.change}
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Row 2: Charts Side-by-side */}
      <div className="grid-2 mb-4">
        {/* Chart 1: Line Chart */}
        <div className="card" style={{ marginBottom: 0 }}>
          <h3 className="card-title" style={{ fontSize: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <LineChart size={16} color="var(--color-brand)" />
            <span>Candidates Processed Over Time</span>
          </h3>
          
          {/* SVG Line Chart */}
          <div style={{ display: 'flex', justifyContent: 'center', marginTop: '24px' }}>
            <svg width="100%" height="160" viewBox="0 0 300 120">
              {/* Y axis Gridlines */}
              <line x1="20" y1="20" x2="280" y2="20" stroke="var(--color-border)" strokeWidth="0.5" />
              <line x1="20" y1="50" x2="280" y2="50" stroke="var(--color-border)" strokeWidth="0.5" />
              <line x1="20" y1="80" x2="280" y2="80" stroke="var(--color-border)" strokeWidth="0.5" />
              <line x1="20" y1="110" x2="280" y2="110" stroke="var(--color-border)" strokeWidth="0.5" />
              
              {/* Graph Plot Path */}
              <path 
                d="M 20 100 Q 60 70 100 80 T 180 30 T 240 40 T 280 15" 
                fill="none" 
                stroke="var(--color-brand)" 
                strokeWidth="2" 
              />
              
              {/* Graph Area Fill */}
              <path 
                d="M 20 100 Q 60 70 100 80 T 180 30 T 240 40 T 280 15 L 280 110 L 20 110 Z" 
                fill="rgba(192, 24, 42, 0.05)" 
              />
              
              {/* Plot Data Dots */}
              <circle cx="20" cy="100" r="3" fill="var(--color-brand)" />
              <circle cx="100" cy="80" r="3" fill="var(--color-brand)" />
              <circle cx="180" cy="30" r="3" fill="var(--color-brand)" />
              <circle cx="280" cy="15" r="3" fill="var(--color-brand)" />

              {/* Labels */}
              <text x="20" y="118" fontSize="6" fill="var(--color-text-secondary)" textAnchor="middle">Wk 1</text>
              <text x="100" y="118" fontSize="6" fill="var(--color-text-secondary)" textAnchor="middle">Wk 2</text>
              <text x="180" y="118" fontSize="6" fill="var(--color-text-secondary)" textAnchor="middle">Wk 3</text>
              <text x="280" y="118" fontSize="6" fill="var(--color-text-secondary)" textAnchor="middle">Wk 4</text>
            </svg>
          </div>
        </div>

        {/* Chart 2: Bar Chart */}
        <div className="card" style={{ marginBottom: 0 }}>
          <h3 className="card-title" style={{ fontSize: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <BarChart3 size={16} color="var(--color-brand)" />
            <span>Candidate Score Distribution</span>
          </h3>

          {/* SVG Bar Chart */}
          <div style={{ display: 'flex', justifyContent: 'center', marginTop: '24px' }}>
            <svg width="100%" height="160" viewBox="0 0 300 120">
              {/* Gridlines */}
              <line x1="20" y1="20" x2="280" y2="20" stroke="var(--color-border)" strokeWidth="0.5" />
              <line x1="20" y1="60" x2="280" y2="60" stroke="var(--color-border)" strokeWidth="0.5" />
              <line x1="20" y1="100" x2="280" y2="100" stroke="var(--color-border)" strokeWidth="0.5" />

              {/* Bars */}
              <rect x="35" y="80" width="20" height="20" fill="var(--color-brand)" rx="2" />
              <rect x="85" y="50" width="20" height="50" fill="var(--color-brand)" rx="2" />
              <rect x="135" y="30" width="20" height="70" fill="var(--color-brand)" rx="2" />
              <rect x="185" y="15" width="20" height="85" fill="var(--color-brand)" rx="2" />
              <rect x="235" y="45" width="20" height="55" fill="var(--color-brand)" rx="2" />

              {/* Labels */}
              <text x="45" y="108" fontSize="6" fill="var(--color-text-secondary)" textAnchor="middle">&lt; 50</text>
              <text x="95" y="108" fontSize="6" fill="var(--color-text-secondary)" textAnchor="middle">50-70</text>
              <text x="145" y="108" fontSize="6" fill="var(--color-text-secondary)" textAnchor="middle">70-80</text>
              <text x="195" y="108" fontSize="6" fill="var(--color-text-secondary)" textAnchor="middle">80-90</text>
              <text x="245" y="108" fontSize="6" fill="var(--color-text-secondary)" textAnchor="middle">90+</text>
            </svg>
          </div>
        </div>
      </div>

      {/* Row 3: Skills + Job status */}
      <div 
        style={{
          display: 'grid',
          gridTemplateColumns: '60fr 40fr',
          gap: '24px'
        }}
        className="grid-2"
      >
        {/* Left: Top Skills horizontal bar */}
        <div className="card">
          <h3 className="card-title" style={{ fontSize: '16px' }}>Top Skills in Demand</h3>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginTop: '16px' }}>
            <div>
              <div className="flex-between text-small" style={{ marginBottom: '6px' }}>
                <span style={{ fontWeight: 600 }}>React.js</span>
                <strong>42 Jobs</strong>
              </div>
              <div className="score-bar-bg" style={{ width: '100%' }}>
                <div className="score-bar-fill" style={{ width: '85%' }}></div>
              </div>
            </div>

            <div>
              <div className="flex-between text-small" style={{ marginBottom: '6px' }}>
                <span style={{ fontWeight: 600 }}>Python (ML frameworks)</span>
                <strong>30 Jobs</strong>
              </div>
              <div className="score-bar-bg" style={{ width: '100%' }}>
                <div className="score-bar-fill" style={{ width: '65%' }}></div>
              </div>
            </div>

            <div>
              <div className="flex-between text-small" style={{ marginBottom: '6px' }}>
                <span style={{ fontWeight: 600 }}>TypeScript</span>
                <strong>28 Jobs</strong>
              </div>
              <div className="score-bar-bg" style={{ width: '100%' }}>
                <div className="score-bar-fill" style={{ width: '60%' }}></div>
              </div>
            </div>

            <div>
              <div className="flex-between text-small" style={{ marginBottom: '6px' }}>
                <span style={{ fontWeight: 600 }}>Vector DBs (Qdrant/Milvus)</span>
                <strong>15 Jobs</strong>
              </div>
              <div className="score-bar-bg" style={{ width: '100%' }}>
                <div className="score-bar-fill" style={{ width: '35%' }}></div>
              </div>
            </div>
          </div>
        </div>

        {/* Right: Jobs by Status */}
        <div className="card">
          <h3 className="card-title" style={{ fontSize: '16px' }}>Jobs by Status</h3>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginTop: '16px' }}>
            <div className="flex-between" style={{ paddingBottom: '10px', borderBottom: '1px solid var(--color-border)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span className="chip chip-success" style={{ padding: '2px 8px' }}>Shortlist Ready</span>
                <span style={{ fontWeight: 500 }}>Active profiles</span>
              </div>
              <strong style={{ fontSize: '15px' }}>12</strong>
            </div>

            <div className="flex-between" style={{ paddingBottom: '10px', borderBottom: '1px solid var(--color-border)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span className="chip chip-warning" style={{ padding: '2px 8px' }}>Processing</span>
                <span style={{ fontWeight: 500 }}>Running analysis</span>
              </div>
              <strong style={{ fontSize: '15px' }}>3</strong>
            </div>

            <div className="flex-between">
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span className="chip" style={{ padding: '2px 8px' }}>Draft</span>
                <span style={{ fontWeight: 500 }}>Created draft configurations</span>
              </div>
              <strong style={{ fontSize: '15px' }}>4</strong>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
