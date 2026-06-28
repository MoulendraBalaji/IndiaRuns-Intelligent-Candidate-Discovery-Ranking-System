import React, { useState } from 'react';
import Layout from '../../components/Layout';
import { Cpu, Gauge, AlertTriangle, Coins } from 'lucide-react';

export default function AgentPerformancePage() {
  const [range, setRange] = useState('30days');

  // Agent cards
  const agents = [
    { name: 'Recruiter Parser Agent', latency: '1.2s', error: '0.04%', cost: '$0.005', icon: Cpu },
    { name: 'Hiring Manager Evaluator', latency: '4.5s', error: '0.12%', cost: '$0.012', icon: Gauge },
    { name: 'Behavioral Auditor Agent', latency: '2.1s', error: '0.00%', cost: '$0.008', icon: Coins }
  ];

  // Table rows
  const rows = [
    { name: 'Recruiter Parser Agent', avgScore: '76.2', latency: '1.2s', error: '0.04%', cost: '$0.50', lastRun: '10m ago' },
    { name: 'Hiring Manager Evaluator', avgScore: '82.4', latency: '4.5s', error: '0.12%', cost: '$1.20', lastRun: '10m ago' },
    { name: 'Behavioral Auditor Agent', avgScore: '74.8', latency: '2.1s', error: '0.00%', cost: '$0.80', lastRun: '1h ago' }
  ];

  return (
    <Layout pageTitle="Agent Performance">
      {/* Header and range selector */}
      <div className="flex-between mb-4">
        <h3 style={{ margin: 0 }}>Model Diagnostics</h3>
        <select 
          className="input-field" 
          style={{ width: '150px', padding: '6px 12px', fontSize: '13px' }}
          value={range}
          onChange={(e) => setRange(e.target.value)}
        >
          <option value="7days">Last 7 Days</option>
          <option value="30days">Last 30 Days</option>
          <option value="90days">Last Quarter</option>
        </select>
      </div>

      {/* Row 1: KPI Cards */}
      <div className="grid-3 mb-4">
        {agents.map((agent, idx) => {
          const IconComp = agent.icon;
          return (
            <div 
              key={idx} 
              className="card" 
              style={{ 
                marginBottom: 0, 
                borderLeft: '3px solid var(--color-brand)',
                display: 'flex',
                flexDirection: 'column',
                gap: '12px'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <IconComp size={16} color="var(--color-brand)" />
                <h4 style={{ fontSize: '14px', margin: 0 }}>{agent.name}</h4>
              </div>
              
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '8px', fontSize: '12px', marginTop: '4px' }}>
                <div>
                  <span className="text-muted text-small" style={{ display: 'block' }}>Avg Latency</span>
                  <span style={{ fontWeight: 600 }}>{agent.latency}</span>
                </div>
                <div>
                  <span className="text-muted text-small" style={{ display: 'block' }}>Error Rate</span>
                  <span style={{ fontWeight: 600 }}>{agent.error}</span>
                </div>
                <div>
                  <span className="text-muted text-small" style={{ display: 'block' }}>Avg Cost</span>
                  <span style={{ fontWeight: 600 }}>{agent.cost}</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Row 2: Performance Diagnostics Table */}
      <div className="card">
        <h3 className="card-title">Accuracy and Costs Grid</h3>
        <div className="table-container">
          <table className="nexus-table">
            <thead>
              <tr style={{ backgroundColor: 'var(--color-table-header)' }}>
                <th>Agent Identifier</th>
                <th>Avg Match Score</th>
                <th>Evaluation Latency</th>
                <th>Failure Rate</th>
                <th>Cost per 100 Runs</th>
                <th>Last Triggered</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row, idx) => (
                <tr key={idx}>
                  <td style={{ fontWeight: 600 }}>{row.name}</td>
                  <td>{row.avgScore} / 100</td>
                  <td>{row.latency}</td>
                  <td>{row.error}</td>
                  <td>{row.cost}</td>
                  <td className="text-muted">{row.lastRun}</td>
                </tr>
              ))}
              <tr style={{ fontWeight: 700, backgroundColor: 'var(--color-table-header)' }}>
                <td>System Aggregates</td>
                <td>77.8 / 100</td>
                <td>2.6s</td>
                <td>0.05%</td>
                <td>$2.50</td>
                <td>10m ago</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* Row 3: Score Distribution Bars */}
      <h3 style={{ fontSize: '16px', fontWeight: 600, margin: '24px 0 16px 0' }}>Agent Scoring Distribution</h3>
      <div className="grid-3">
        {agents.map((agent, idx) => (
          <div key={idx} className="card" style={{ marginBottom: 0 }}>
            <h4 style={{ fontSize: '14px', marginBottom: '16px' }}>{agent.name}</h4>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div>
                <div className="flex-between text-small" style={{ marginBottom: '4px' }}>
                  <span>Low Fit (0 - 40)</span>
                  <strong>12%</strong>
                </div>
                <div className="score-bar-bg" style={{ width: '100%' }}>
                  <div className="score-bar-fill" style={{ width: '12%' }}></div>
                </div>
              </div>

              <div>
                <div className="flex-between text-small" style={{ marginBottom: '4px' }}>
                  <span>Moderate (40 - 70)</span>
                  <strong>38%</strong>
                </div>
                <div className="score-bar-bg" style={{ width: '100%' }}>
                  <div className="score-bar-fill" style={{ width: '38%' }}></div>
                </div>
              </div>

              <div>
                <div className="flex-between text-small" style={{ marginBottom: '4px' }}>
                  <span>High Fit (70 - 100)</span>
                  <strong>50%</strong>
                </div>
                <div className="score-bar-bg" style={{ width: '100%' }}>
                  <div className="score-bar-fill" style={{ width: '50%' }}></div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </Layout>
  );
}
