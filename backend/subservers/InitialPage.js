import Router from '@koa/router';
import { getDb } from '../db.js';
import crypto from 'crypto';

const router = new Router();

// GET all projects
router.get('/projects', async (ctx) => {
  try {
    const db = await getDb();
    const projects = await db.all('SELECT * FROM projects ORDER BY created_at DESC');
    ctx.body = projects;
  } catch (error) {
    ctx.status = 500;
    ctx.body = { error: 'Failed to retrieve projects: ' + error.message };
  }
});

// POST create project
router.post('/projects', async (ctx) => {
  try {
    const { title, description } = ctx.request.body;
    if (!title) {
      ctx.status = 400;
      ctx.body = { error: 'Project title is required' };
      return;
    }

    const db = await getDb();
    const id = crypto.randomUUID();
    
    await db.run(
      'INSERT INTO projects (id, title, description) VALUES (?, ?, ?)',
      [id, title, description || '']
    );

    // Initialize empty map elements for this project
    await db.run(
      'INSERT INTO map_elements (project_id, nodes, links) VALUES (?, ?, ?)',
      [id, '[]', '[]']
    );

    ctx.status = 201;
    ctx.body = { id, title, description };
  } catch (error) {
    ctx.status = 500;
    ctx.body = { error: 'Failed to create project: ' + error.message };
  }
});

// DELETE project
router.delete('/projects/:id', async (ctx) => {
  try {
    const { id } = ctx.params;
    const db = await getDb();
    
    const result = await db.run('DELETE FROM projects WHERE id = ?', id);
    
    if (result.changes === 0) {
      ctx.status = 404;
      ctx.body = { error: 'Project not found' };
      return;
    }

    ctx.body = { message: 'Project deleted successfully', id };
  } catch (error) {
    ctx.status = 500;
    ctx.body = { error: 'Failed to delete project: ' + error.message };
  }
});

export default router;
