import { useState, useEffect } from 'react';
import useNetworkStore from '../../../store/network.store.js';
import { networkService } from '../api/network.service.js';
import { Ban, ShieldAlert } from 'lucide-react';

export default function BlockButton({ targetId, onBlockChange }) {
  const [isBlocked, setIsBlocked] = useState(false);
  const [loading, setLoading] = useState(true);
  const { blockUser, unblockUser } = useNetworkStore();

  useEffect(() => {
    if (!targetId) return;
    const loadStatus = async () => {
      try {
        const blockStatus = await networkService.getBlockStatus(targetId);
        setIsBlocked(blockStatus.isBlocked);
      } catch (err) {
        console.error("Failed to check block status", err);
      } finally {
        setLoading(false);
      }
    };
    loadStatus();
  }, [targetId]);

  const handleToggleBlock = async () => {
    setLoading(true);
    try {
      if (isBlocked) {
        await unblockUser(targetId);
        setIsBlocked(false);
        if (onBlockChange) onBlockChange(false);
      } else {
        if (window.confirm("Are you sure you want to block this user?")) {
          await blockUser(targetId);
          setIsBlocked(true);
          if (onBlockChange) onBlockChange(true);
        }
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return null;

  return (
    <button
      onClick={handleToggleBlock}
      className={`border px-3 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2 ${
        isBlocked 
          ? 'bg-red-50 text-red-700 border-red-200 hover:bg-red-100' 
          : 'bg-white text-gray-700 border-gray-300 hover:bg-red-50 hover:text-red-700 hover:border-red-200'
      }`}
      title={isBlocked ? "Unblock User" : "Block User"}
    >
      {isBlocked ? <ShieldAlert className="w-4 h-4" /> : <Ban className="w-4 h-4" />}
      {isBlocked ? 'Unblock' : 'Block'}
    </button>
  );
}
