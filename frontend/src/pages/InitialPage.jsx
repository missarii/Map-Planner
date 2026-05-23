import React, { useState, useEffect } from 'react';
import { Plus, Folder, Trash2, Map, Sparkles, Clock, ArrowRight, Loader2 } from 'lucide-react';

function InitialPage({ onOpenProject }) {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState(null);

  // Fetch projects on load
  const fetchProjects = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/projects');
      if (!response.ok) throw new Error('Failed to load projects');
      const data = await response.json();
      setProjects(data);
    } catch (err) {
      console.error(err);
      setError('Could not retrieve projects from server.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProjects();
  }, []);

  // Handle Project Creation
  const handleCreateProject = async (e) => {
    e.preventDefault();
    if (!title.trim()) return;

    try {
      setCreating(true);
      const response = await fetch('/api/projects', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title, description }),
      });

      if (!response.ok) throw new Error('Failed to create project');
      const newProject = await response.json();
      
      setTitle('');
      setDescription('');
      setIsModalOpen(false);
      
      // Auto open the newly created project
      onOpenProject(newProject.id);
    } catch (err) {
      console.error(err);
      setError('Could not create project. Try again.');
    } finally {
      setCreating(false);
    }
  };

  // Handle Project Deletion
  const handleDeleteProject = async (e, id) => {
    e.stopPropagation(); // Avoid triggering project open
    if (!confirm('Are you sure you want to delete this project? All associated flowcharts will be lost.')) return;

    try {
      const response = await fetch(`/api/projects/${id}`, { method: 'DELETE' });
      if (!response.ok) throw new Error('Failed to delete project');
      
      // Filter out deleted project
      setProjects(projects.filter((p) => p.id !== id));
    } catch (err) {
      console.error(err);
      alert('Failed to delete project.');
    }
  };

  return (
    <div style={{ flexGrow: 1, padding: '40px 20px', maxWidth: '1200px', margin: '0 auto', width: '100%' }}>
      {/* Hero Header Section */}
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '48px', flexWrap: 'wrap', gap: '20px' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
            <Sparkles size={24} color="var(--accent-cyan)" />
            <span style={{ fontSize: '0.85rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.15em', color: 'var(--accent-cyan)' }}>
              Interactive Systems Visualizer
            </span>
          </div>
          <h1 style={{ fontSize: '3rem', fontWeight: 800, margin: 0 }}>
            Map <span className="text-gradient-cyan-purple">Planner</span>
          </h1>
          <p style={{ color: 'var(--text-secondary)', marginTop: '8px', fontSize: '1.05rem', maxWidth: '600px' }}>
            Plan, orchestrate, and map out your systems, dev workflows, and project architecture with gorgeous interactive flowcharts.
          </p>
        </div>

        <button className="glow-button" onClick={() => setIsModalOpen(true)}>
          <Plus size={20} />
          Create Project
        </button>
      </header>

      {error && (
        <div style={{ background: 'rgba(239, 68, 68, 0.1)', border: '1px solid #ef4444', color: '#fca5a5', padding: '16px', borderRadius: '12px', marginBottom: '32px' }}>
          {error}
        </div>
      )}

      {/* Main projects grid */}
      {loading ? (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '100px 0', gap: '16px' }}>
          <Loader2 className="animate-spin" size={48} color="var(--accent-cyan)" style={{ animation: 'spin 1s linear infinite' }} />
          <p style={{ color: 'var(--text-secondary)' }}>Loading planning workspaces...</p>
        </div>
      ) : projects.length === 0 ? (
        <div className="glass-panel" style={{ padding: '60px 40px', textAlign: 'center', maxWidth: '600px', margin: '40px auto' }}>
          <div style={{ width: '80px', height: '80px', borderRadius: '50%', background: 'rgba(255, 255, 255, 0.03)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 24px' }}>
            <Map size={40} color="var(--accent-purple)" />
          </div>
          <h2 style={{ fontSize: '1.75rem', marginBottom: '12px' }}>No maps planned yet</h2>
          <p style={{ color: 'var(--text-secondary)', marginBottom: '30px', lineHeight: '1.6' }}>
            Get started by creating your first system mapping project. Draw processes, cloud servers, databases, and deployment pipelines.
          </p>
          <button className="glow-button" onClick={() => setIsModalOpen(true)}>
            <Plus size={20} />
            Create First Project
          </button>
        </div>
      ) : (
        <div>
          <h2 style={{ fontSize: '1.5rem', marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Folder size={22} color="var(--accent-purple)" />
            Your Projects ({projects.length})
          </h2>
          <div className="dashboard-grid">
            {projects.map((project) => (
              <div
                key={project.id}
                className="glass-panel project-card"
                onClick={() => onOpenProject(project.id)}
                style={{ padding: '24px', cursor: 'pointer', display: 'flex', flexDirection: 'column', height: '220px' }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
                  <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: 'rgba(0, 242, 254, 0.08)', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid rgba(0, 242, 254, 0.2)' }}>
                    <Map size={24} color="var(--accent-cyan)" />
                  </div>
                  <button
                    className="outline-button"
                    onClick={(e) => handleDeleteProject(e, project.id)}
                    style={{ padding: '8px', borderRadius: '8px', color: 'var(--text-muted)' }}
                    title="Delete project"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>

                <h3 style={{ fontSize: '1.25rem', marginBottom: '8px', textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap' }}>
                  {project.title}
                </h3>
                
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', lineHeight: '1.5', overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', flexGrow: 1 }}>
                  {project.description || 'No description provided.'}
                </p>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '16px', borderTop: '1px solid var(--border-color)', paddingTop: '12px', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <Clock size={12} />
                    {new Date(project.created_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                  </span>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '4px', fontWeight: 600, color: 'var(--accent-cyan)' }}>
                    Open Map <ArrowRight size={12} />
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Modal - Create Project */}
      {isModalOpen && (
        <div className="modal-overlay" onClick={() => setIsModalOpen(false)}>
          <div className="glass-panel modal-content" onClick={(e) => e.stopPropagation()} style={{ borderTop: '4px solid var(--accent-cyan)' }}>
            <h2 style={{ fontSize: '1.75rem', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Plus size={24} color="var(--accent-cyan)" />
              New Project
            </h2>
            <p style={{ color: 'var(--text-secondary)', marginBottom: '24px', fontSize: '0.9rem' }}>
              Define your system planning workspace parameters.
            </p>

            <form onSubmit={handleCreateProject} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <label style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-secondary)' }}>Project Title</label>
                <input
                  type="text"
                  className="glass-input"
                  placeholder="e.g. Production Hosting Pipeline"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  required
                  autoFocus
                />
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <label style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-secondary)' }}>Description</label>
                <textarea
                  className="glass-input"
                  placeholder="Explain what system components you will map..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  style={{ minHeight: '100px', resize: 'vertical' }}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '12px' }}>
                <button type="button" className="outline-button" onClick={() => setIsModalOpen(false)}>
                  Cancel
                </button>
                <button type="submit" className="glow-button" disabled={creating}>
                  {creating ? 'Creating...' : 'Create Project'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Global CSS spinner rule */}
      <style>{`
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}

export default InitialPage;
