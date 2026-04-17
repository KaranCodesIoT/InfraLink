import { useState } from 'react';
import { Users, HardHat, Pickaxe, Ruler } from 'lucide-react';
import ContractorsTab from './ContractorsTab.jsx';
import ArchitectsTab from './ArchitectsTab.jsx';
import EngineersTab from './EngineersTab.jsx';
import LabourTab from './LabourTab.jsx';
import '../styles/project-dashboard.css';

export default function TeamsPage() {
  const [activeTab, setActiveTab] = useState('contractors');

  const tabs = [
    { id: 'contractors', label: 'Contractors', icon: HardHat },
    { id: 'labour', label: 'Labour Workforce', icon: Pickaxe },
    { id: 'architects', label: 'Architects', icon: Ruler },
    { id: 'engineers', label: 'Internal Engineers', icon: Users },
  ];

  const renderContent = () => {
    switch (activeTab) {
      case 'contractors': return <ContractorsTab />;
      case 'labour': return <LabourTab />;
      case 'architects': return <ArchitectsTab />;
      case 'engineers': return <EngineersTab />;
      default: return null;
    }
  };

  return (
    <div className="dash-fade-in pb-12">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-6 gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-gray-900">Teams & Stakeholders</h2>
          <p className="text-sm text-gray-500 mt-1">Manage contractors, workforce hiring, and design approvals.</p>
        </div>
      </div>

      {/* Modern Tabs */}
      <div className="mb-8 border-b border-gray-200">
        <div className="flex gap-8">
          {tabs.map(tab => {
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`pb-4 text-sm font-medium transition-colors relative flex items-center gap-2 ${
                  isActive ? 'text-gray-900' : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                <tab.icon size={16} />
                {tab.label}
                {isActive && (
                  <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-orange-500 rounded-t-full" />
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Tab Content */}
      <div className="mt-4">
        {renderContent()}
      </div>
    </div>
  );
}
