import React, { useState, useRef, useEffect, useCallback } from 'react';
import { X, Play, Square, GitFork, Database, Cloud, Rocket } from 'lucide-react';

// ── Node Dimensions ──────────────────────────────────────────────────────────
const NODE_DIMENSIONS = {
  start:    { w: 190, h: 56 },
  process:  { w: 190, h: 56 },
  decision: { w: 130, h: 130 },
  database: { w: 170, h: 68 },
  cloud:    { w: 190, h: 68 },
  hosting:  { w: 190, h: 56 },
};

// ── Node type → icon + accent color ─────────────────────────────────────────
const NODE_META = {
  start:    { Icon: Play,     color: 'var(--accent-cyan)',    label: 'Start/End' },
  process:  { Icon: Square,   color: 'var(--accent-purple)',  label: 'Process' },
  decision: { Icon: GitFork,  color: 'var(--accent-amber)',   label: 'Decision' },
  database: { Icon: Database, color: 'var(--accent-blue)',    label: 'Database' },
  cloud:    { Icon: Cloud,    color: 'var(--accent-emerald)', label: 'Cloud' },
  hosting:  { Icon: Rocket,   color: 'var(--accent-rose)',    label: 'Hosting' },
};

function FlowchartCanvas({ nodes, setNodes, links, setLinks }) {
  const canvasRef = useRef(null);

  const [draggingNodeId, setDraggingNodeId]   = useState(null);
  const [dragOffset, setDragOffset]           = useState({ x: 0, y: 0 });
  const [connectingPort, setConnectingPort]   = useState(null);
  const [mousePos, setMousePos]               = useState({ x: 0, y: 0 });
  const [selectedNodeId, setSelectedNodeId]   = useState(null);
  const [editingNodeId, setEditingNodeId]     = useState(null);
  const [editText, setEditText]               = useState('');
  const [hoveredLinkId, setHoveredLinkId]     = useState(null);

  // ── Port coordinate helper ─────────────────────────────────────────────────
  const getPortCoords = useCallback((node, portType) => {
    const dims = NODE_DIMENSIONS[node.type] || { w: 190, h: 56 };
    const { w, h } = dims;
    switch (portType) {
      case 'top':    return { x: node.x + w / 2, y: node.y };
      case 'bottom': return { x: node.x + w / 2, y: node.y + h };
      case 'left':   return { x: node.x,         y: node.y + h / 2 };
      case 'right':  return { x: node.x + w,     y: node.y + h / 2 };
      default:       return { x: node.x + w / 2, y: node.y + h / 2 };
    }
  }, []);

  // ── Drag-over + Drop from sidebar ─────────────────────────────────────────
  const handleDragOver = (e) => e.preventDefault();

  const handleDrop = (e) => {
    e.preventDefault();
    const type = e.dataTransfer.getData('application/reactflow-type');
    if (!type) return;

    const rect = canvasRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left + canvasRef.current.scrollLeft - 95;
    const y = e.clientY - rect.top  + canvasRef.current.scrollTop  - 28;
    const dims = NODE_DIMENSIONS[type] || { w: 190, h: 56 };

    const newNode = {
      id: crypto.randomUUID(),
      type,
      label: NODE_META[type]?.label || 'New Node',
      x: Math.max(0, x),
      y: Math.max(0, y),
      width:  dims.w,
      height: dims.h,
    };

    setNodes((prev) => [...prev, newNode]);
    setSelectedNodeId(newNode.id);
  };

  // ── Node dragging ──────────────────────────────────────────────────────────
  const handleNodeMouseDown = (e, node) => {
    if (editingNodeId) return;
    if (e.target.classList.contains('node-port') || e.target.closest('.delete-node-btn')) return;

    e.preventDefault();
    setSelectedNodeId(node.id);
    setDraggingNodeId(node.id);

    const rect   = canvasRef.current.getBoundingClientRect();
    const clientX = e.clientX - rect.left + canvasRef.current.scrollLeft;
    const clientY = e.clientY - rect.top  + canvasRef.current.scrollTop;
    setDragOffset({ x: clientX - node.x, y: clientY - node.y });
  };

  // ── Canvas mouse move ──────────────────────────────────────────────────────
  const handleCanvasMouseMove = (e) => {
    const rect = canvasRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left + canvasRef.current.scrollLeft;
    const y = e.clientY - rect.top  + canvasRef.current.scrollTop;
    setMousePos({ x, y });

    if (draggingNodeId) {
      setNodes((prev) =>
        prev.map((n) =>
          n.id === draggingNodeId
            ? { ...n, x: Math.max(0, x - dragOffset.x), y: Math.max(0, y - dragOffset.y) }
            : n
        )
      );
    }
  };

  const handleCanvasMouseUp = () => {
    setDraggingNodeId(null);
    setConnectingPort(null);
  };

  // Clicking the empty canvas de-selects the active node
  const handleCanvasClick = (e) => {
    if (e.target === canvasRef.current || e.target.classList.contains('canvas-inner')) {
      setSelectedNodeId(null);
    }
  };

  // ── Port connection drawing ────────────────────────────────────────────────
  const handlePortMouseDown = (e, node, portType) => {
    e.stopPropagation();
    e.preventDefault();
    const coords = getPortCoords(node, portType);
    setConnectingPort({ nodeId: node.id, portType, x: coords.x, y: coords.y });
  };

  const handlePortMouseUp = (e, targetNode, targetPortType) => {
    e.stopPropagation();
    if (connectingPort && connectingPort.nodeId !== targetNode.id) {
      const newLink = {
        id: crypto.randomUUID(),
        fromId:   connectingPort.nodeId,
        fromPort: connectingPort.portType,
        toId:     targetNode.id,
        toPort:   targetPortType,
      };
      const dup = links.find(
        (l) =>
          l.fromId   === newLink.fromId   &&
          l.fromPort === newLink.fromPort &&
          l.toId     === newLink.toId     &&
          l.toPort   === newLink.toPort
      );
      if (!dup) setLinks((prev) => [...prev, newLink]);
    }
    setConnectingPort(null);
  };

  // ── Node label editing ────────────────────────────────────────────────────
  const handleNodeDoubleClick = (node) => {
    setEditingNodeId(node.id);
    setEditText(node.label);
  };

  const saveNodeText = () => {
    if (editingNodeId) {
      setNodes((prev) =>
        prev.map((n) => (n.id === editingNodeId ? { ...n, label: editText } : n))
      );
      setEditingNodeId(null);
    }
  };

  // ── Node / Link deletion ──────────────────────────────────────────────────
  const deleteNode = (nodeId) => {
    setNodes((prev) => prev.filter((n) => n.id !== nodeId));
    setLinks((prev) => prev.filter((l) => l.fromId !== nodeId && l.toId !== nodeId));
    if (selectedNodeId === nodeId) setSelectedNodeId(null);
  };

  const deleteLink = (linkId) => {
    setLinks((prev) => prev.filter((l) => l.id !== linkId));
  };

  // ── Bezier path calculation ────────────────────────────────────────────────
  const getBezierPath = (p1, p2, fromPort) => {
    const dx = Math.abs(p2.x - p1.x) * 0.55;
    const dy = Math.abs(p2.y - p1.y) * 0.55;
    let cp1 = { x: p1.x, y: p1.y };
    let cp2 = { x: p2.x, y: p2.y };

    if (fromPort === 'right')  { cp1.x += dx; cp2.x -= dx; }
    else if (fromPort === 'left')   { cp1.x -= dx; cp2.x += dx; }
    else if (fromPort === 'bottom') { cp1.y += dy; cp2.y -= dy; }
    else if (fromPort === 'top')    { cp1.y -= dy; cp2.y += dy; }
    else { cp1.x += dx; cp2.x -= dx; } // default: treat as right

    return `M ${p1.x} ${p1.y} C ${cp1.x} ${cp1.y}, ${cp2.x} ${cp2.y}, ${p2.x} ${p2.y}`;
  };

  // ── Keyboard shortcuts ────────────────────────────────────────────────────
  useEffect(() => {
    const onKeyDown = (e) => {
      if (e.key === 'Escape') {
        setConnectingPort(null);
        setEditingNodeId(null);
      }
      // Delete / Backspace deletes selected node (not while editing)
      if ((e.key === 'Delete' || e.key === 'Backspace') && selectedNodeId && !editingNodeId) {
        // Prevent accidental delete if focus is in an input elsewhere
        if (document.activeElement.tagName === 'INPUT' || document.activeElement.tagName === 'TEXTAREA') return;
        deleteNode(selectedNodeId);
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [selectedNodeId, editingNodeId]); // eslint-disable-line react-hooks/exhaustive-deps

  // ── Render ─────────────────────────────────────────────────────────────────
  return (
    <div
      ref={canvasRef}
      className="canvas-container"
      onDragOver={handleDragOver}
      onDrop={handleDrop}
      onMouseMove={handleCanvasMouseMove}
      onMouseUp={handleCanvasMouseUp}
      onClick={handleCanvasClick}
      style={{
        width: '100%',
        height: 'calc(100vh - 180px)',
        minHeight: '600px',
        cursor: connectingPort ? 'crosshair' : 'default',
      }}
    >
      {/* ── SVG overlay for connection lines ── */}
      <svg
        style={{
          position: 'absolute',
          top: 0, left: 0,
          width: '3000px', height: '3000px',
          pointerEvents: 'none',
          zIndex: 1,
        }}
      >
        <defs>
          {/* Re-usable arrowhead marker */}
          <marker id="arrowhead" markerWidth="8" markerHeight="6" refX="6" refY="3" orient="auto">
            <polygon points="0 0, 8 3, 0 6" fill="rgba(255,255,255,0.55)" />
          </marker>
          <marker id="arrowhead-active" markerWidth="8" markerHeight="6" refX="6" refY="3" orient="auto">
            <polygon points="0 0, 8 3, 0 6" fill="var(--accent-cyan)" />
          </marker>
        </defs>

        {/* Existing connection lines */}
        {links.map((link) => {
          const fromNode = nodes.find((n) => n.id === link.fromId);
          const toNode   = nodes.find((n) => n.id === link.toId);
          if (!fromNode || !toNode) return null;

          const p1   = getPortCoords(fromNode, link.fromPort);
          const p2   = getPortCoords(toNode,   link.toPort);
          const path = getBezierPath(p1, p2, link.fromPort);
          const isHovered = hoveredLinkId === link.id;

          return (
            <g key={link.id} style={{ pointerEvents: 'visibleStroke' }}>
              {/* Wide transparent hit area */}
              <path
                d={path}
                fill="none"
                stroke="transparent"
                strokeWidth="18"
                style={{ cursor: 'pointer', pointerEvents: 'stroke' }}
                onMouseEnter={() => setHoveredLinkId(link.id)}
                onMouseLeave={() => setHoveredLinkId(null)}
                onClick={() => {
                  if (confirm('Delete this connection?')) deleteLink(link.id);
                }}
              />
              {/* Visible glow line */}
              <path
                d={path}
                fill="none"
                stroke={isHovered ? 'var(--accent-rose)' : 'rgba(255,255,255,0.45)'}
                strokeWidth={isHovered ? 3 : 2.5}
                strokeDasharray="8,5"
                markerEnd="url(#arrowhead)"
                style={{
                  filter: isHovered
                    ? 'drop-shadow(0 0 6px var(--accent-rose))'
                    : 'drop-shadow(0 0 3px rgba(255,255,255,0.2))',
                  animation: 'dash 1.5s linear infinite',
                  strokeDashoffset: 0,
                  transition: 'stroke 0.2s, stroke-width 0.2s',
                }}
              />
            </g>
          );
        })}

        {/* Live connector being drawn */}
        {connectingPort && (
          <path
            d={getBezierPath(connectingPort, mousePos, connectingPort.portType)}
            fill="none"
            stroke="var(--accent-cyan)"
            strokeWidth="2.5"
            strokeDasharray="6,4"
            markerEnd="url(#arrowhead-active)"
            style={{ filter: 'drop-shadow(0 0 6px var(--accent-cyan))', animation: 'dash 1s linear infinite' }}
          />
        )}
      </svg>

      {/* ── Nodes layer ── */}
      <div className="canvas-inner" style={{ position: 'absolute', top: 0, left: 0, width: '3000px', height: '3000px', zIndex: 2 }}>
        {nodes.map((node) => {
          const isSelected = selectedNodeId === node.id;
          const isEditing  = editingNodeId  === node.id;
          const dims       = NODE_DIMENSIONS[node.type] || { w: 190, h: 56 };
          const meta       = NODE_META[node.type] || NODE_META.process;
          const { Icon }   = meta;

          let nodeClass = 'canvas-node ';
          if (node.type === 'start')    nodeClass += 'node-start';
          else if (node.type === 'process')  nodeClass += 'node-process';
          else if (node.type === 'decision') nodeClass += 'node-decision';
          else if (node.type === 'database') nodeClass += 'node-database';
          else if (node.type === 'cloud')    nodeClass += 'node-cloud';
          else if (node.type === 'hosting')  nodeClass += 'node-hosting';

          return (
            <div
              key={node.id}
              className={`${nodeClass}${isSelected ? ' selected' : ''}`}
              onMouseDown={(e) => handleNodeMouseDown(e, node)}
              onDoubleClick={() => handleNodeDoubleClick(node)}
              style={{
                left:   `${node.x}px`,
                top:    `${node.y}px`,
                width:  `${dims.w}px`,
                height: `${dims.h}px`,
              }}
            >
              {/* Delete button (shown when selected) */}
              {isSelected && !isEditing && (
                <button
                  className="delete-node-btn"
                  onClick={() => deleteNode(node.id)}
                  title="Delete node (Del)"
                  style={{
                    position: 'absolute',
                    top: '-11px', right: '-11px',
                    width: '22px', height: '22px',
                    borderRadius: '50%',
                    background: '#ef4444',
                    border: '2px solid #0b0f19',
                    color: '#fff',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    cursor: 'pointer',
                    boxShadow: '0 2px 8px rgba(239,68,68,0.6)',
                    zIndex: 20,
                    padding: 0,
                  }}
                >
                  <X size={11} />
                </button>
              )}

              {/* Node content */}
              {isEditing ? (
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '100%', height: '100%' }}>
                  <input
                    type="text"
                    value={editText}
                    onChange={(e) => setEditText(e.target.value)}
                    onBlur={saveNodeText}
                    onKeyDown={(e) => { if (e.key === 'Enter') saveNodeText(); }}
                    autoFocus
                    style={{
                      background: 'rgba(0,0,0,0.85)',
                      border: `1px solid ${meta.color}`,
                      borderRadius: '6px',
                      color: '#fff',
                      padding: '4px 8px',
                      fontSize: '0.82rem',
                      width: '88%',
                      textAlign: 'center',
                      outline: 'none',
                    }}
                  />
                </div>
              ) : (
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: node.type === 'decision' ? 'center' : 'flex-start',
                    gap: '8px',
                    height: '100%',
                    padding: node.type === 'decision' ? '0' : '0 4px',
                  }}
                >
                  {/* Node type icon */}
                  {node.type !== 'decision' && (
                    <span style={{ color: meta.color, opacity: 0.85, flexShrink: 0, display: 'flex' }}>
                      <Icon size={14} />
                    </span>
                  )}
                  <span
                    style={{
                      fontSize: '0.82rem',
                      fontWeight: 600,
                      wordBreak: 'break-word',
                      lineHeight: 1.3,
                      maxWidth: '100%',
                      textAlign: node.type === 'decision' ? 'center' : 'left',
                    }}
                  >
                    {node.label}
                  </span>
                </div>
              )}

              {/* Connection ports (always 4 cardinal ports) */}
              {node.type !== 'decision' && (
                <>
                  <div className="node-port port-top"
                    onMouseDown={(e) => handlePortMouseDown(e, node, 'top')}
                    onMouseUp={(e)   => handlePortMouseUp(e, node, 'top')} />
                  <div className="node-port port-bottom"
                    onMouseDown={(e) => handlePortMouseDown(e, node, 'bottom')}
                    onMouseUp={(e)   => handlePortMouseUp(e, node, 'bottom')} />
                  <div className="node-port port-left"
                    onMouseDown={(e) => handlePortMouseDown(e, node, 'left')}
                    onMouseUp={(e)   => handlePortMouseUp(e, node, 'left')} />
                  <div className="node-port port-right"
                    onMouseDown={(e) => handlePortMouseDown(e, node, 'right')}
                    onMouseUp={(e)   => handlePortMouseUp(e, node, 'right')} />
                </>
              )}

              {/* Decision node: ports at diamond tips */}
              {node.type === 'decision' && (
                <>
                  <div className="node-port" style={{ left: 'calc(50% - 5px)', top: '-5px' }}
                    onMouseDown={(e) => handlePortMouseDown(e, node, 'top')}
                    onMouseUp={(e)   => handlePortMouseUp(e, node, 'top')} />
                  <div className="node-port" style={{ left: 'calc(50% - 5px)', bottom: '-5px' }}
                    onMouseDown={(e) => handlePortMouseDown(e, node, 'bottom')}
                    onMouseUp={(e)   => handlePortMouseUp(e, node, 'bottom')} />
                  <div className="node-port" style={{ left: '-5px', top: 'calc(50% - 5px)' }}
                    onMouseDown={(e) => handlePortMouseDown(e, node, 'left')}
                    onMouseUp={(e)   => handlePortMouseUp(e, node, 'left')} />
                  <div className="node-port" style={{ right: '-5px', top: 'calc(50% - 5px)' }}
                    onMouseDown={(e) => handlePortMouseDown(e, node, 'right')}
                    onMouseUp={(e)   => handlePortMouseUp(e, node, 'right')} />
                </>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default FlowchartCanvas;
