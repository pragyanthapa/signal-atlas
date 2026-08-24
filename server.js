import express from 'express';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { configured, runRead, closeDriver } from './db.js';
import { communityOverview, introductionsFor, projectBridges, searchPeople } from './queries.js';

const app = express();
const root = path.dirname(fileURLToPath(import.meta.url));
app.use(express.static(path.join(root, 'public')));
const records = (result) => result.records.map((r) => Object.fromEntries(r.keys.map((key) => [key, r.get(key)?.toNumber?.() ?? r.get(key)])));
app.get('/api/health', (_, res) => res.json({ configured: configured() }));
app.get('/api/community', async (_, res, next) => { try { res.json(records(await runRead(communityOverview))); } catch (e) { next(e); } });
app.get('/api/introductions/:personId', async (req, res, next) => { try { res.json(records(await runRead(introductionsFor, { personId: req.params.personId }))); } catch (e) { next(e); } });
app.get('/api/bridges/:projectSlug', async (req, res, next) => { try { res.json(records(await runRead(projectBridges, { projectSlug: req.params.projectSlug }))); } catch (e) { next(e); } });
app.get('/api/search', async (req, res, next) => { try { res.json(records(await runRead(searchPeople, { term: String(req.query.q || '') }))); } catch (e) { next(e); } });
app.use('/api', (error, _, res, __) => res.status(503).json({ error: 'CognoDB is unavailable', detail: error.message }));
app.listen(process.env.PORT || 3000, () => console.log(`Signal Atlas is running at http://localhost:${process.env.PORT || 3000}`));
process.on('SIGINT', async () => { await closeDriver(); process.exit(); });
