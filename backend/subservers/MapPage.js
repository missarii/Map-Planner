import Router from '@koa/router';
import { getDb } from '../db.js';

const router = new Router();

// GET project details + flowchart map elements
router.get('/projects/:id/map', async (ctx) => {
  try {
    const { id } = ctx.params;
    const db = await getDb();
    
    // Get project meta details
    const project = await db.get('SELECT * FROM projects WHERE id = ?', id);
    if (!project) {
      ctx.status = 404;
      ctx.body = { error: 'Project not found' };
      return;
    }
    
    // Get flowchart map elements
    let mapData = await db.get('SELECT nodes, links FROM map_elements WHERE project_id = ?', id);
    
    if (!mapData) {
      // If none exists, create default empty elements
      await db.run('INSERT INTO map_elements (project_id, nodes, links) VALUES (?, ?, ?)', [id, '[]', '[]']);
      mapData = { nodes: '[]', links: '[]' };
    }

    ctx.body = {
      project,
      nodes: JSON.parse(mapData.nodes || '[]'),
      links: JSON.parse(mapData.links || '[]')
    };
  } catch (error) {
    ctx.status = 500;
    ctx.body = { error: 'Failed to retrieve project map: ' + error.message };
  }
});

// POST save project map elements
router.post('/projects/:id/map', async (ctx) => {
  try {
    const { id } = ctx.params;
    const { nodes, links } = ctx.request.body;
    
    if (!nodes || !links) {
      ctx.status = 400;
      ctx.body = { error: 'Both nodes and links fields are required' };
      return;
    }

    const db = await getDb();

    // Verify project exists
    const project = await db.get('SELECT id FROM projects WHERE id = ?', id);
    if (!project) {
      ctx.status = 404;
      ctx.body = { error: 'Project not found' };
      return;
    }

    // Save/Update nodes and links in DB as JSON strings
    await db.run(
      `INSERT INTO map_elements (project_id, nodes, links)
       VALUES (?, ?, ?)
       ON CONFLICT(project_id) DO UPDATE SET nodes=excluded.nodes, links=excluded.links`,
      [id, JSON.stringify(nodes), JSON.stringify(links)]
    );

    ctx.body = { message: 'Project map saved successfully' };
  } catch (error) {
    ctx.status = 500;
    ctx.body = { error: 'Failed to save project map: ' + error.message };
  }
});

export default router;
