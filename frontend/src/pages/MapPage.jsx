import React, { useState, useEffect } from 'react';
import { ArrowLeft, Save, Trash2, Loader2, Wand2, Share2, Info } from 'lucide-react';
import SymbolSidebar from '../components/SymbolSidebar.jsx';
import FlowchartCanvas from '../components/FlowchartCanvas.jsx';
import confetti from 'canvas-confetti';

function MapPage({ projectId, onBack }) {
  const [project, setProject]     = useState(null);
  const [nodes, setNodes]         = useState([]);
  const [links, setLinks]         = useState([]);
  const [loading, setLoading]     = useState(true);
  const [saving, setSaving]       = useState(false);
  const [saveStatus, setSaveStatus] = useState('');
  const [showHelp, setShowHelp]   = useState(false);

  // ── Load map from API ──────────────────────────────────────────────────────
  useEffect(() => {
    if (!projectId) return;

    const loadMapData = async () => {
      try {
        setLoading(true);
        const res = await fetch(`/api/projects/${projectId}/map`);
        if (!res.ok) throw new Error('Failed to load project');
        const data = await res.json();
        setProject(data.project);
        setNodes(data.nodes  || []);
        setLinks(data.links  || []);
      } catch (err) {
        console.error(err);
        alert('Failed to load flowchart workspace data.');
      } finally {
        setLoading(false);
      }
    };

    loadMapData();
  }, [projectId]);

  // ── Save map to SQLite ─────────────────────────────────────────────────────
  const handleSaveMap = async () => {
    try {
      setSaving(true);
      setSaveStatus('Saving...');

      const res = await fetch(`/api/projects/${projectId}/map`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nodes, links }),
      });

      if (!res.ok) throw new Error('Save failed');

      setSaveStatus('Saved to SQLite ✓');
      confetti({
        particleCount: 140,
        spread: 80,
        origin: { y: 0.6 },
        colors: ['#00f2fe', '#4ea8de', '#9d4edd', '#06d6a0', '#f72585'],
      });
      setTimeout(() => setSaveStatus(''), 3000);
    } catch (err) {
      console.error(err);
      setSaveStatus('Save failed ✗');
      setTimeout(() => setSaveStatus(''), 4000);
    } finally {
      setSaving(false);
    }
  };

  // ── Pre-populate demo pipeline ─────────────────────────────────────────────
  const handlePrepopulate = () => {
    if (nodes.length > 0 && !confirm('Pre-populating will clear the current canvas. Continue?')) return;

    const [id1, id2, id3, id4, id5] = Array.from({ length: 5 }, () => crypto.randomUUID());

    const sampleNodes = [
      { id: id1, type: 'start',    label: 'Code Encryption',        x: 40,  y: 220, width: 190, height: 56 },
      { id: id2, type: 'process',  label: 'Push to GitHub',         x: 290, y: 220, width: 190, height: 56 },
      { id: id3, type: 'cloud',    label: 'Pull in AWS',            x: 540, y: 220, width: 190, height: 68 },
      { id: id4, type: 'database', label: 'Instance Installation',  x: 790, y: 220, width: 190, height: 68 },
      { id: id5, type: 'hosting',  label: 'Hosting Web App 🚀',     x: 1040,y: 220, width: 190, height: 56 },
    ];

    const sampleLinks = [
      { id: crypto.randomUUID(), fromId: id1, fromPort: 'right', toId: id2, toPort: 'left' },
      { id: crypto.randomUUID(), fromId: id2, fromPort: 'right', toId: id3, toPort: 'left' },
      { id: crypto.randomUUID(), fromId: id3, fromPort: 'right', toId: id4, toPort: 'left' },
      { id: crypto.randomUUID(), fromId: id4, fromPort: 'right', toId: id5, toPort: 'left' },
    ];

    setNodes(sampleNodes);
    setLinks(sampleLinks);

    confetti({ particleCount: 60, angle: 60,  spread: 55, origin: { x: 0 } });
    confetti({ particleCount: 60, angle: 120, spread: 55, origin: { x: 1 } });
  };

  // ── Clear canvas ───────────────────────────────────────────────────────────
  const handleClear = () => {
    if (confirm('Delete all symbols and connections?')) {
      setNodes([]);
      setLinks([]);
    }
  };

  // ── Loading splash ─────────────────────────────────────────────────────────
  if (loading) {
    return (
      <div style={{ flexGrow: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', flexDirection: 'column', gap: '16px' }}>
        <Loader2 size={48} color="var(--accent-cyan)" style={{ animation: 'spin 1s linear infinite' }} />
        <p style={{ color: 'var(--text-secondary)' }}>Loading planning workspace…</p>
      </div>
    );
  }

  const isSavedOk = saveStatus.includes('✓');
  const isSavedErr = saveStatus.includes('✗');

  return (
    <div style={{ flexGrow: 1, display: 'flex', flexDirection: 'column', height: '100vh', overflow: 'hidden' }}>

      {/* ── Toolbar ── */}
      <header
        className="glass-panel"
        style={{ margin: '16px 16px 10px', padding: '14px 22px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderRadius: '16px', zIndex: 10, flexWrap: 'wrap', gap: '10px' }}
      >
        {/* Left: back + project info */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <button className="outline-button" onClick={onBack} style={{ padding: '8px 14px', fontSize: '0.88rem' }}>
            <ArrowLeft size={15} />
            Dashboard
          </button>

          <div style={{ borderLeft: '1px solid var(--border-color)', paddingLeft: '16px' }}>
            <h2 style={{ fontSize: '1.25rem', margin: 0 }}>{project?.title}</h2>
            {project?.description && (
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.78rem', marginTop: '2px', maxWidth: '300px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }} title={project.description}>
                {project.description}
              </p>
            )}
          </div>

          {/* Live counters */}
          <div style={{ display: 'flex', gap: '8px' }}>
            <span style={badgeStyle('var(--accent-cyan)')}>{nodes.length} node{nodes.length !== 1 ? 's' : ''}</span>
            <span style={badgeStyle('var(--accent-purple)')}>{links.length} link{links.length !== 1 ? 's' : ''}</span>
          </div>
        </div>

        {/* Right: actions */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>

          {/* Save status badge */}
          {saveStatus && (
            <span style={{
              fontSize: '0.82rem',
              fontWeight: 600,
              color: isSavedErr ? '#fca5a5' : isSavedOk ? 'var(--accent-emerald)' : 'var(--accent-cyan)',
              padding: '6px 12px',
              borderRadius: '8px',
              border: `1px solid ${isSavedErr ? 'rgba(239,68,68,0.3)' : isSavedOk ? 'rgba(6,214,160,0.3)' : 'var(--border-color)'}`,
              animation: 'pulse 1.5s infinite',
            }}>
              {saveStatus}
            </span>
          )}

          {/* Help tooltip toggle */}
          <button
            className="outline-button"
            onClick={() => setShowHelp(!showHelp)}
            style={{ padding: '8px', borderRadius: '10px', color: showHelp ? 'var(--accent-cyan)' : 'var(--text-muted)' }}
            title="Keyboard shortcuts & tips"
          >
            <Info size={16} />
          </button>

          <button
            className="outline-button"
            onClick={handlePrepopulate}
            style={{ borderColor: 'rgba(6,214,160,0.3)', color: 'var(--accent-emerald)', fontSize: '0.88rem' }}
            title="Load 5-step DevOps pipeline example"
          >
            <Wand2 size={15} />
            Example Map
          </button>

          <button
            className="outline-button"
            onClick={handleClear}
            style={{ borderColor: 'rgba(239,68,68,0.3)', color: '#fca5a5', fontSize: '0.88rem' }}
          >
            <Trash2 size={15} />
            Clear
          </button>

          <button
            className="glow-button glow-button-purple"
            onClick={handleSaveMap}
            disabled={saving}
            style={{ fontSize: '0.88rem' }}
          >
            {saving
              ? <Loader2 size={15} style={{ animation: 'spin 1s linear infinite' }} />
              : <Save size={15} />}
            Save Map
          </button>
        </div>
      </header>

      {/* ── Help bar ── */}
      {showHelp && (
        <div className="glass-panel" style={{ margin: '0 16px 8px', padding: '12px 20px', borderRadius: '12px', display: 'flex', gap: '24px', flexWrap: 'wrap', fontSize: '0.8rem', color: 'var(--text-secondary)', animation: 'fadeIn 0.2s ease' }}>
          {[
            ['Drag', 'Drag symbols from sidebar onto canvas'],
            ['Connect', 'Hover node → drag from ● port to another'],
            ['Edit label', 'Double-click any node'],
            ['Delete node', 'Select node → press Delete or click ✕'],
            ['Delete link', 'Click a connection line'],
            ['Deselect', 'Click empty canvas'],
          ].map(([key, desc]) => (
            <span key={key}>
              <strong style={{ color: 'var(--text-primary)' }}>{key}:</strong> {desc}
            </span>
          ))}
        </div>
      )}

      {/* ── Workspace: sidebar + canvas ── */}
      <div style={{ flexGrow: 1, display: 'flex', gap: '16px', padding: '0 16px 16px', overflow: 'hidden', minHeight: 0 }}>
        <SymbolSidebar />
        <FlowchartCanvas nodes={nodes} setNodes={setNodes} links={links} setLinks={setLinks} />
      </div>
    </div>
  );
}

// ── Small stat badge helper ────────────────────────────────────────────────
function badgeStyle(color) {
  return {
    fontSize: '0.75rem',
    fontWeight: 600,
    color,
    background: `${color}18`,
    border: `1px solid ${color}40`,
    padding: '3px 10px',
    borderRadius: '20px',
    whiteSpace: 'nowrap',
  };
}

export default MapPage;
