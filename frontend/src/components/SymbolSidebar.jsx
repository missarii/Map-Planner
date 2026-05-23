import React from 'react';
import { Play, Square, GitFork, Database, Cloud, Rocket } from 'lucide-react';

const SYMBOL_TEMPLATES = [
  {
    type: 'start',
    label: 'Start / End',
    description: 'Terminator or milestone',
    icon: Play,
    color: 'var(--accent-cyan)',
  },
  {
    type: 'process',
    label: 'Process Block',
    description: 'Standard step or action',
    icon: Square,
    color: 'var(--accent-purple)',
  },
  {
    type: 'decision',
    label: 'Decision Point',
    description: 'Condition or branch (◇)',
    icon: GitFork,
    color: 'var(--accent-amber)',
  },
  {
    type: 'database',
    label: 'DB / Storage',
    description: 'Databases and data stores',
    icon: Database,
    color: 'var(--accent-blue)',
  },
  {
    type: 'cloud',
    label: 'Cloud / Server',
    description: 'APIs, AWS, Git repos',
    icon: Cloud,
    color: 'var(--accent-emerald)',
  },
  {
    type: 'hosting',
    label: 'Hosting / Web',
    description: 'Live app or deployment',
    icon: Rocket,
    color: 'var(--accent-rose)',
  },
];

function SymbolSidebar() {
  const handleDragStart = (e, template) => {
    e.dataTransfer.setData('application/reactflow-type', template.type);
    e.dataTransfer.effectAllowed = 'copy';
  };

  return (
    <aside
      className="glass-panel"
      style={{
        width: '260px',
        minWidth: '220px',
        display: 'flex',
        flexDirection: 'column',
        overflowY: 'auto',
        flexShrink: 0,
        height: '100%',
      }}
    >
      {/* Header */}
      <div style={{ padding: '20px 20px 12px', borderBottom: '1px solid var(--border-color)' }}>
        <h3 style={{ fontSize: '1.05rem', marginBottom: '4px' }}>Symbol Palette</h3>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.78rem', lineHeight: 1.4 }}>
          Drag a symbol onto the canvas to place it.
        </p>
      </div>

      {/* Symbol tiles */}
      <div style={{ padding: '14px 14px', display: 'flex', flexDirection: 'column', gap: '8px', flexGrow: 1 }}>
        {SYMBOL_TEMPLATES.map((tpl) => {
          const Icon = tpl.icon;
          return (
            <div
              key={tpl.type}
              className="sidebar-symbol"
              draggable
              onDragStart={(e) => handleDragStart(e, tpl)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                padding: '10px 14px',
                borderRadius: '10px',
                borderLeft: `3px solid ${tpl.color}`,
              }}
            >
              <div
                style={{
                  width: '34px',
                  height: '34px',
                  borderRadius: '8px',
                  background: `${tpl.color}14`,
                  border: `1px solid ${tpl.color}30`,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: tpl.color,
                  flexShrink: 0,
                }}
              >
                <Icon size={17} />
              </div>
              <div>
                <div style={{ fontSize: '0.87rem', fontWeight: 600, lineHeight: 1.2 }}>{tpl.label}</div>
                <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: '2px' }}>{tpl.description}</div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Quick-tip footer */}
      <div
        style={{
          padding: '12px 16px',
          borderTop: '1px solid var(--border-color)',
          fontSize: '0.73rem',
          color: 'var(--text-muted)',
          lineHeight: 1.5,
        }}
      >
        <strong style={{ color: 'var(--text-secondary)', display: 'block', marginBottom: '4px' }}>Tips</strong>
        🔗 Hover a node to see ports<br />
        ✏️ Double-click to rename<br />
        ⌫ Select + Delete to remove<br />
        🖱️ Click a link to delete it
      </div>
    </aside>
  );
}

export default SymbolSidebar;
