import { useState, useEffect, useRef } from 'react';
import useNetworkStore from '../../../store/network.store.js';
import { networkService } from '../api/network.service.js';
import { UserCheck, UserPlus, Clock, ShieldAlert, Loader2 } from 'lucide-react';

/**
 * FollowButton — Instagram-strict behavior with race-condition protection.
 * 
 * Uses LOCAL `actionInProgress` ref to prevent rapid double-clicks.
 * The global Zustand `isLoading` is NOT reliable for per-button locking
 * because multiple FollowButtons can exist on screen.
 *
 * Props:
 *   targetId         — user ID to follow/unfollow
 *   onStatusChange   — callback(status, data) when status changes
 *   isHidden         — force-hide (e.g. after block)
 */
export default function FollowButton({ targetId, onStatusChange, isHidden = false }) {
  const [status, setStatus] = useState('loading');
  const [isAllowed, setIsAllowed] = useState(true);
  const [restrictionReason, setRestrictionReason] = useState('');
  const [busy, setBusy] = useState(false); // LOCAL loading state per button
  const actionLock = useRef(false);        // Prevents rapid-fire race conditions

  useEffect(() => {
    if (!targetId) return;
    let cancelled = false;

    const loadStatus = async () => {
      try {
        const data = await useNetworkStore.getState().fetchStatus(targetId);
        if (cancelled) return;
        if (data) {
          if (data.status === 'blocked') {
            setStatus('blocked');
            if (onStatusChange) onStatusChange('blocked', data);
            return;
          }
          setStatus(data.status);
          setIsAllowed(data.is_allowed);
          setRestrictionReason(data.restriction_reason);
          if (onStatusChange) onStatusChange(data.status, data);
        }
      } catch (err) {
        if (!cancelled) setStatus('error');
      }
    };
    loadStatus();

    return () => { cancelled = true; };
  }, [targetId]);

  const handleAction = async () => {
    // STRICT: Prevent rapid-fire — if already processing, ignore
    if (actionLock.current || !isAllowed || status === 'loading') return;
    actionLock.current = true;
    setBusy(true);

    try {
      if (status === 'not_following') {
        const res = await networkService.followUser(targetId);
        const newStatus = res?.data?.status || 'accepted';
        setStatus(newStatus);
        // Fetch fresh full status for parent (includes is_following_back, is_mutual etc.)
        const freshData = await useNetworkStore.getState().fetchStatus(targetId);
        if (onStatusChange) onStatusChange(newStatus, freshData);
      } else if (status === 'following' || status === 'accepted') {
        await networkService.unfollowUser(targetId);
        setStatus('not_following');
        const freshData = await useNetworkStore.getState().fetchStatus(targetId);
        if (onStatusChange) onStatusChange('not_following', freshData);
      } else if (status === 'pending') {
        await networkService.withdrawRequest(targetId);
        setStatus('not_following');
        if (onStatusChange) onStatusChange('not_following', null);
      }
    } catch (err) {
      console.error('Follow action failed:', err);
      // On error, re-fetch true status from server to recover
      try {
        const recovery = await useNetworkStore.getState().fetchStatus(targetId);
        if (recovery) {
          setStatus(recovery.status);
          if (onStatusChange) onStatusChange(recovery.status, recovery);
        }
      } catch {}
    } finally {
      setBusy(false);
      // Release lock after a cooldown to prevent rapid re-clicks
      setTimeout(() => { actionLock.current = false; }, 600);
    }
  };

  // STRICT: Don't show button if blocked or externally hidden
  if (status === 'blocked' || isHidden) return null;
  if (status === 'loading') return <div className="h-9 w-24 bg-gray-100 animate-pulse rounded-lg"></div>;
  if (!isAllowed) {
    return (
      <button 
        disabled
        className="bg-gray-100 text-gray-400 px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2 cursor-not-allowed"
        title={restrictionReason}
      >
        <ShieldAlert className="w-4 h-4" /> Role Restricted
      </button>
    );
  }

  const btnConfig = {
    not_following: { label: 'Follow', icon: <UserPlus className="w-4 h-4" />, classes: 'bg-orange-600 hover:bg-orange-700 text-white border-transparent' },
    following: { label: 'Following', icon: <UserCheck className="w-4 h-4" />, classes: 'bg-gray-100 hover:bg-red-50 text-gray-800 hover:text-red-600 border-gray-200 hover:border-red-200' },
    accepted: { label: 'Following', icon: <UserCheck className="w-4 h-4" />, classes: 'bg-gray-100 hover:bg-red-50 text-gray-800 hover:text-red-600 border-gray-200 hover:border-red-200' },
    pending: { label: 'Requested', icon: <Clock className="w-4 h-4" />, classes: 'bg-white hover:bg-gray-50 text-orange-600 border-orange-200' }
  };

  const current = btnConfig[status] || btnConfig.not_following;

  return (
    <button
      onClick={handleAction}
      disabled={busy}
      className={`border px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2 ${current.classes} ${busy ? 'opacity-50 cursor-not-allowed pointer-events-none' : ''}`}
    >
      {busy ? <Loader2 className="w-4 h-4 animate-spin" /> : current.icon}
      {busy ? 'Wait...' : current.label}
    </button>
  );
}
