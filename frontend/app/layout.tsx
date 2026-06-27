import './globals.css';
import React from 'react';
import Link from 'next/link';

export const metadata = {
  title: 'NEXUS — AI Talent Intelligence Platform',
  description: 'Production-grade AI Hiring Engine with multi-agent ranking and explainability.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <div style={{ display: 'flex', minHeight: '100vh', position: 'relative' }}>
          {/* Background Aurora */}
          <div className="aurora-blur" style={{ top: '-100px', left: '-100px' }} />
          <div className="aurora-blur" style={{ bottom: '-100px', right: '-100px', background: 'radial-gradient(circle, rgba(124, 77, 255, 0.12) 0%, rgba(0, 201, 224, 0.05) 50%, transparent 100%)' }} />

          {/* Sidebar */}
          <aside style={{
            width: '260px',
            backgroundColor: 'rgba(15, 26, 58, 0.95)',
            borderRight: '1px solid rgba(255, 255, 255, 0.08)',
            display: 'flex',
            flexDirection: 'column',
            position: 'fixed',
            height: '100vh',
            zIndex: 10,
            padding: '2rem 1.5rem'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', marginBottom: '3rem', gap: '0.75rem' }}>
              <div style={{
                width: '32px',
                height: '32px',
                borderRadius: '8px',
                background: 'linear-gradient(135deg, var(--color-accent-cyan), var(--color-accent-purple))',
                boxShadow: 'var(--shadow-glow-cyan)'
              }} />
              <span className="text-glow-cyan" style={{
                fontSize: '1.5rem',
                fontWeight: 800,
                letterSpacing: '1px',
                color: 'var(--color-accent-cyan)'
              }}>NEXUS</span>
            </div>

            <nav style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', flex: 1 }}>
              <Link href="/jobs" className="btn btn-outline" style={{ justifyContent: 'flex-start', border: 'none', padding: '0.75rem 1rem' }}>
                <span style={{ marginRight: '0.75rem' }}>💼</span> Positions & Jobs
              </Link>
              <Link href="/candidates" className="btn btn-outline" style={{ justifyContent: 'flex-start', border: 'none', padding: '0.75rem 1rem' }}>
                <span style={{ marginRight: '0.75rem' }}>📄</span> Resumes / Upload
              </Link>
              <Link href="/copilot" className="btn btn-outline" style={{ justifyContent: 'flex-start', border: 'none', padding: '0.75rem 1rem' }}>
                <span style={{ marginRight: '0.75rem' }}>🤖</span> Recruiter Copilot
              </Link>
              <Link href="/system" className="btn btn-outline" style={{ justifyContent: 'flex-start', border: 'none', padding: '0.75rem 1rem' }}>
                <span style={{ marginRight: '0.75rem' }}>📊</span> Observability
              </Link>
            </nav>

            <div style={{ borderTop: '1px solid rgba(255, 255, 255, 0.08)', paddingTop: '1.5rem' }}>
              <div style={{ fontSize: '0.75rem', color: 'var(--color-text-secondary)' }}>
                NEXUS Engine v1.0
              </div>
              <div style={{ fontSize: '0.65rem', color: 'var(--color-accent-cyan)', marginTop: '0.25rem' }}>
                ● Backends Online
              </div>
            </div>
          </aside>

          {/* Main Content Area */}
          <main style={{
            marginLeft: '260px',
            flex: 1,
            padding: '2rem 3rem',
            position: 'relative',
            zIndex: 1
          }}>
            {children}
          </main>
        </div>
      </body>
    </html>
  );
}
