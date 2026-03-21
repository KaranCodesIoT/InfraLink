import { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { networkService } from '../api/network.service.js';
import { Users, UserMinus, Check, X, ShieldAlert } from 'lucide-react';
import { resolveAvatarUrl } from '../../../utils/avatarUrl.js';

export default function NetworkHub() {
  const [searchParams, setSearchParams] = useSearchParams();
  const currentTab = searchParams.get('tab') || 'followers';
  
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);

  const fetchLists = async () => {
    setLoading(true);
    try {
      let res;
      if (currentTab === 'followers') res = await networkService.getFollowersList();
      if (currentTab === 'following') res = await networkService.getFollowingList();
      if (currentTab === 'requests') res = await networkService.getIncomingRequestsList();
      setData(res.items || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLists();
  }, [currentTab]);

  const handleRemoveFollower = async (id) => {
    try {
      await networkService.removeFollower(id);
      setData(prev => prev.filter(f => f.follower._id !== id));
    } catch (err) { console.error(err); }
  };

  const handleUnfollow = async (id) => {
    try {
      await networkService.unfollowUser(id);
      setData(prev => prev.filter(f => f.following._id !== id));
    } catch (err) { console.error(err); }
  };

  const handleRequestAction = async (id, action) => {
    try {
      if (action === 'accept') await networkService.acceptRequest(id);
      if (action === 'reject') await networkService.rejectRequest(id);
      setData(prev => prev.filter(req => req._id !== id));
    } catch (err) { console.error(err); }
  };

  const handleBulkAction = async (action) => {
    setActionLoading(true);
    try {
      if (action === 'accept') await networkService.bulkAcceptAll();
      if (action === 'reject') await networkService.bulkRejectAll();
      setData([]); // clears the incoming requests list since all handled
    } catch (err) { console.error(err); }
    finally { setActionLoading(false); }
  };

  return (
    <div className="max-w-4xl mx-auto py-8">
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="flex border-b border-gray-200 bg-gray-50">
          <button 
            onClick={() => setSearchParams({ tab: 'followers' })} 
            className={`flex-1 py-4 text-sm font-medium transition-colors ${currentTab === 'followers' ? 'border-b-2 border-orange-500 text-orange-600 bg-white' : 'text-gray-500 hover:text-gray-700'}`}
          >
            Followers
          </button>
          <button 
            onClick={() => setSearchParams({ tab: 'following' })} 
            className={`flex-1 py-4 text-sm font-medium transition-colors ${currentTab === 'following' ? 'border-b-2 border-orange-500 text-orange-600 bg-white' : 'text-gray-500 hover:text-gray-700'}`}
          >
            Following
          </button>
          <button 
            onClick={() => setSearchParams({ tab: 'requests' })} 
            className={`flex-1 py-4 text-sm font-medium transition-colors ${currentTab === 'requests' ? 'border-b-2 border-orange-500 text-orange-600 bg-white' : 'text-gray-500 hover:text-gray-700'}`}
          >
            Requests
          </button>
        </div>

        <div className="p-6 min-h-[400px]">
          {loading ? (
            <div className="flex justify-center py-20"><div className="w-8 h-8 rounded-full border-4 border-orange-500 border-t-transparent animate-spin"/></div>
          ) : (
            <div className="space-y-4">
              {currentTab === 'requests' && data.length > 0 && (
                <div className="flex justify-end gap-2 mb-6 pb-6 border-b border-gray-100">
                  <button onClick={() => handleBulkAction('accept')} disabled={actionLoading} className="px-4 py-2 bg-green-600 text-white rounded-lg text-sm font-bold hover:bg-green-700 disabled:opacity-50">Accept All</button>
                  <button onClick={() => handleBulkAction('reject')} disabled={actionLoading} className="px-4 py-2 bg-red-100 text-red-700 rounded-lg text-sm font-bold hover:bg-red-200 disabled:opacity-50">Reject All</button>
                </div>
              )}

              {data.length === 0 && (
                <div className="text-center py-20 text-gray-500">
                  <Users className="w-12 h-12 mx-auto text-gray-300 mb-4" />
                  <p>No records found in this category.</p>
                </div>
              )}

              {data.map((item) => {
                const isFollower = currentTab === 'followers' || currentTab === 'requests';
                const user = isFollower ? item.follower : item.following;

                return (
                  <div key={item._id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                    <Link to={`/profile/${user._id}`} className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-full overflow-hidden bg-white border border-gray-200">
                        {user.avatar ? <img src={resolveAvatarUrl(user.avatar)} className="w-full h-full object-cover"/> : <div className="w-full h-full bg-gray-200 flex items-center justify-center text-gray-500">N/A</div>}
                      </div>
                      <div>
                        <h4 className="font-bold text-gray-900 leading-tight">{user.name}</h4>
                        <p className="text-xs text-gray-500 capitalize">{user.role}</p>
                      </div>
                    </Link>

                    <div className="flex gap-2">
                       {currentTab === 'followers' && (
                         <button onClick={() => handleRemoveFollower(user._id)} className="px-3 py-1.5 text-xs font-bold bg-white text-gray-700 border border-gray-300 rounded hover:bg-gray-100 flex items-center gap-1">Remove</button>
                       )}
                       {currentTab === 'following' && (
                         <button onClick={() => handleUnfollow(user._id)} className="px-3 py-1.5 text-xs font-bold bg-white text-gray-700 border border-gray-300 rounded hover:bg-red-50 hover:text-red-700 flex items-center gap-1"><UserMinus className="w-3 h-3"/> Unfollow</button>
                       )}
                       {currentTab === 'requests' && (
                         <>
                           <button onClick={() => handleRequestAction(item._id, 'accept')} className="p-2 bg-green-100 text-green-700 rounded hover:bg-green-200" title="Accept"><Check className="w-4 h-4"/></button>
                           <button onClick={() => handleRequestAction(item._id, 'reject')} className="p-2 bg-red-100 text-red-700 rounded hover:bg-red-200" title="Reject"><X className="w-4 h-4"/></button>
                         </>
                       )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
