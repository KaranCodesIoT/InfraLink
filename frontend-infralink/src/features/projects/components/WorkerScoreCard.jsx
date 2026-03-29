import React from 'react';
import { TrendingUp, CheckCircle, Star, Award } from 'lucide-react';

export default function WorkerScoreCard({ scoreCard, isLoading }) {
  if (isLoading) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 animate-pulse">
        <div className="h-6 bg-gray-200 rounded w-1/3 mb-4"></div>
        <div className="grid grid-cols-2 gap-4">
          <div className="h-16 bg-gray-100 rounded"></div>
          <div className="h-16 bg-gray-100 rounded"></div>
          <div className="h-16 bg-gray-100 rounded"></div>
          <div className="h-16 bg-gray-100 rounded"></div>
        </div>
      </div>
    );
  }

  if (!scoreCard) return null;

  // Derive color based on consistency
  let consistencyColor = 'text-green-600';
  let consistencyBg = 'bg-green-50';
  if (scoreCard.consistencyScore < 50) {
    consistencyColor = 'text-red-600';
    consistencyBg = 'bg-red-50';
  } else if (scoreCard.consistencyScore < 80) {
    consistencyColor = 'text-orange-600';
    consistencyBg = 'bg-orange-50';
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
      <div className="p-4 border-b border-gray-100 bg-gray-50 flex items-center gap-2">
        <Award className="text-primary-600 h-5 w-5" />
        <h3 className="font-semibold text-gray-900">Performance Score</h3>
      </div>
      
      <div className="p-6">
        <div className="grid grid-cols-2 gap-4">
          
          {/* Consistency */}
          <div className={`rounded-lg p-4 ${consistencyBg} flex flex-col items-center justify-center text-center`}>
            <div className={`text-2xl font-bold ${consistencyColor}`}>
              {scoreCard.consistencyScore}%
            </div>
            <div className="text-sm font-medium text-gray-600 mt-1 flex items-center">
              <CheckCircle className="mr-1 h-4 w-4" />
              Consistency
            </div>
          </div>

          {/* Points */}
          <div className="rounded-lg p-4 bg-primary-50 flex flex-col items-center justify-center text-center border border-primary-100">
            <div className="text-2xl font-bold text-primary-700">
              {scoreCard.totalPoints}
            </div>
            <div className="text-sm font-medium text-primary-600 mt-1 flex items-center">
              <Star className="mr-1 h-4 w-4" />
              Total Points
            </div>
          </div>

          {/* Streak */}
          <div className="rounded-lg p-4 bg-gray-50 flex flex-col items-center justify-center text-center border border-gray-100">
            <div className="text-xl font-bold text-gray-800">
              {scoreCard.streakCurrent} 🔥
            </div>
            <div className="text-xs font-medium text-gray-500 mt-1 flex items-center">
              <TrendingUp className="mr-1 h-3 w-3" />
              Current Streak (Days)
            </div>
          </div>

          {/* Projects */}
          <div className="rounded-lg p-4 bg-gray-50 flex flex-col items-center justify-center text-center border border-gray-100">
            <div className="text-xl font-bold text-gray-800">
              {scoreCard.projectsCompleted}
            </div>
            <div className="text-xs font-medium text-gray-500 mt-1">
              Projects Done
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
