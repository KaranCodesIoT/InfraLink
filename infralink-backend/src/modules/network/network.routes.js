import express from 'express';
import authMiddleware from '../../middleware/auth.middleware.js';
import * as networkController from './network.controller.js';
import { verifyBlock } from './middleware/block.middleware.js';
import { validateObjectId } from './middleware/validateId.middleware.js';

const router = express.Router();

// Enforce Auth for all network actions
router.use(authMiddleware);

// ---- FOLLOW & REQUEST ROUTES ----
// Every action involving a targetId must validate the ID and check block status
router.post('/follows/:targetId', validateObjectId('targetId'), verifyBlock, networkController.followUser);
router.delete('/follows/:targetId', validateObjectId('targetId'), verifyBlock, networkController.unfollowUser);
router.delete('/follows/withdraw/:targetId', validateObjectId('targetId'), verifyBlock, networkController.withdrawRequest);
router.delete('/follows/followers/:followerId', validateObjectId('followerId'), networkController.removeFollower);

// ---- REQUEST MANAGEMENT ----
router.post('/follows/requests/:requestId/accept', validateObjectId('requestId'), networkController.acceptRequest);
router.post('/follows/requests/:requestId/reject', validateObjectId('requestId'), networkController.rejectRequest);
router.post('/follows/requests/bulk/accept', networkController.bulkAcceptAll);
router.post('/follows/requests/bulk/reject', networkController.bulkRejectAll);

// ---- LISTS ROUTES ----
// Block + privacy guards enforced at service level (getFollowers / getFollowing)
router.get('/follows/requests/incoming', networkController.getIncomingRequestsList);
router.get('/follows/requests/outgoing', networkController.getOutgoingRequestsList);
router.get('/follows/followers/:targetId?', networkController.getFollowersList);
router.get('/follows/following/:targetId?', networkController.getFollowingList);

// ---- BLOCKING ROUTES ----
router.post('/blocks/:targetId', validateObjectId('targetId'), networkController.blockUser);
router.delete('/blocks/:targetId', validateObjectId('targetId'), networkController.unblockUser);
router.get('/blocks', networkController.getBlockedList);
router.get('/blocks/status/:targetId', validateObjectId('targetId'), networkController.getBlockStatus);

// ---- PRIVACY ROUTES ----
router.patch('/privacy', networkController.togglePrivacy);

// ---- STATUS FETCHING ----
router.get('/status/:targetId', validateObjectId('targetId'), networkController.fetchStatus);

export default router;
