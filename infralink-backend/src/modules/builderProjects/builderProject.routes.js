import { Router } from 'express';
import * as c from './builderProject.controller.js';
import authMiddleware from '../../middleware/auth.middleware.js';
import requireRole from '../../middleware/role.middleware.js';
import validate from '../../middleware/validate.middleware.js';
import { createBuilderProjectSchema, updateBuilderProjectSchema, addUpdateSchema } from './builderProject.validation.js';

const router = Router();

// Public / any-authenticated reads
router.get('/', authMiddleware, c.list);
router.get('/my', authMiddleware, requireRole('builder'), c.getMine);
router.get('/:id/teams', authMiddleware, c.getTeams);
router.get('/:id', authMiddleware, c.getById);

// Builder-only writes
router.post('/', authMiddleware, requireRole('builder'), validate(createBuilderProjectSchema), c.create);
router.patch('/:id', authMiddleware, requireRole('builder'), validate(updateBuilderProjectSchema), c.update);
router.post('/:id/updates', authMiddleware, requireRole('builder'), validate(addUpdateSchema), c.addUpdate);
router.delete('/:id', authMiddleware, requireRole('builder'), c.remove);

// Applications
router.post('/:id/apply', authMiddleware, requireRole('contractor', 'architect', 'worker', 'labour'), c.applyToProject);
router.patch('/:id/apply/:applicationId', authMiddleware, requireRole('builder'), c.updateApplicationStatus);

// Engagement
router.post('/:id/like', authMiddleware, c.likeProject);
router.get('/:id/comments', c.getComments);
router.post('/:id/comments', authMiddleware, c.addComment);

// ── Dynamic Dashboard & Workflow ─────────────────────────────────────────

router.get('/:id/dashboard', authMiddleware, c.getProjectDashboardData);
router.patch('/:id/tasks/assign', authMiddleware, requireRole('builder'), c.assignContractor);

// ── Workforce & Labour Management ────────────────────────────────────────

router.post('/:id/labour-req', authMiddleware, requireRole('contractor'), c.postLabourReq);
router.post('/:id/labour-req/:requirementId/apply', authMiddleware, requireRole('worker', 'labour'), c.applyForLabour);
router.patch('/:id/labour-req/:requirementId/applicants/:applicantId', authMiddleware, requireRole('contractor'), c.updateApplicantStatus);

// ── Daily Site Logs ──────────────────────────────────────────────────────

router.post('/:id/daily-log', authMiddleware, requireRole('worker', 'labour'), c.submitDailyLog);
router.patch('/:id/daily-log/:updateId/verify', authMiddleware, requireRole('contractor'), c.verifyLog);

// ── Issue Tracker ────────────────────────────────────────────────────────

router.post('/:id/issues', authMiddleware, requireRole('builder', 'contractor', 'worker', 'labour'), c.addProjectIssue);
router.patch('/:id/issues/:issueId', authMiddleware, requireRole('builder', 'contractor'), c.updateProjectIssueStatus);

export default router;

