import { useState } from 'react';
import FormBorrow from '@/components/FormBorrow';
import FormReturn from '@/components/FormReturn';
import UmbrellaStatus from '@/components/UmbrellaStatus';
import DatabaseInitializer from '@/components/DatabaseInitializer';

export default function Home() {
  const [activeTab, setActiveTab] = useState<'borrow' | 'return' | 'status' | 'admin'>('borrow');
  const [currentTime, setCurrentTime] = useState(new Date());

  // Update time every minute
  useState(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 60000);

    return () => clearInterval(timer);
  });

  const tabs = [
    { id: 'borrow', label: 'ยืมร่ม', icon: 'fas fa-plus-circle' },
    { id: 'return', label: 'คืนร่ม', icon: 'fas fa-undo' },
    { id: 'status', label: 'สถานะร่ม', icon: 'fas fa-chart-bar' },
    { id: 'admin', label: 'จัดการ', icon: 'fas fa-cog' }
  ] as const;

  return (
    <div className="min-h-screen bg-slate-50 font-inter">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                <i className="fas fa-umbrella text-white text-sm"></i>
              </div>
              <div>
                <h1 className="text-lg font-semibold text-gray-900">ระบบยืม-คืนร่ม</h1>
                <p className="text-xs text-gray-500 hidden sm:block">โรงเรียนสาธิตจุฬาลงกรณ์มหาวิทยาลัย</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <div className="hidden md:flex items-center space-x-2 text-sm text-gray-600">
                <i className="fas fa-clock text-gray-400"></i>
                <span>
                  {currentTime.toLocaleTimeString('th-TH', { 
                    hour: '2-digit', 
                    minute: '2-digit' 
                  })}
                </span>
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Navigation Tabs */}
        <div className="mb-8">
          <div className="bg-white rounded-lg shadow-sm p-1 flex">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex-1 px-4 py-3 text-sm font-medium rounded-md transition-all duration-200 flex items-center justify-center ${
                  activeTab === tab.id
                    ? 'bg-primary text-white'
                    : 'text-gray-700 hover:bg-gray-50'
                }`}
              >
                <i className={`${tab.icon} mr-2`}></i>
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Tab Content */}
        <div className="tab-content">
          {activeTab === 'borrow' && <FormBorrow />}
          {activeTab === 'return' && <FormReturn />}
          {activeTab === 'status' && <UmbrellaStatus />}
          {activeTab === 'admin' && <DatabaseInitializer />}
        </div>
      </main>
    </div>
  );
}
