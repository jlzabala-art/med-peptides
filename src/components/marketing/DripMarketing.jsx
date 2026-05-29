import React from 'react';
import { Mail, Play, Pause, Plus, Clock, Users } from 'lucide-react';

const DripMarketing = () => {
  return (
    <div className="p-6 max-w-6xl mx-auto space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Drip Marketing & Automations</h1>
          <p className="text-slate-500 text-sm mt-1">Manage email sequences and automated patient journeys</p>
        </div>
        <button className="flex items-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors text-sm font-medium">
          <Plus size={16} />
          <span>New Campaign</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex items-center space-x-4">
          <div className="p-3 bg-blue-50 text-blue-600 rounded-lg">
            <Mail size={24} />
          </div>
          <div>
            <p className="text-sm text-slate-500 font-medium">Active Campaigns</p>
            <p className="text-2xl font-bold text-slate-800">3</p>
          </div>
        </div>
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex items-center space-x-4">
          <div className="p-3 bg-emerald-50 text-emerald-600 rounded-lg">
            <Users size={24} />
          </div>
          <div>
            <p className="text-sm text-slate-500 font-medium">Enrolled Patients</p>
            <p className="text-2xl font-bold text-slate-800">142</p>
          </div>
        </div>
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex items-center space-x-4">
          <div className="p-3 bg-indigo-50 text-indigo-600 rounded-lg">
            <Clock size={24} />
          </div>
          <div>
            <p className="text-sm text-slate-500 font-medium">Avg. Open Rate</p>
            <p className="text-2xl font-bold text-slate-800">46.2%</p>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-200">
          <h2 className="text-lg font-semibold text-slate-800">Active Sequences</h2>
        </div>
        <div className="divide-y divide-slate-100">
          {[
            { id: 1, name: 'Welcome Series (New Patients)', status: 'active', steps: 4, enrolled: 45, openRate: '52%' },
            { id: 2, name: 'Post-Purchase BPC-157 Guide', status: 'active', steps: 3, enrolled: 89, openRate: '61%' },
            { id: 3, name: 'Reactivation (60 days inactive)', status: 'paused', steps: 2, enrolled: 210, openRate: '28%' }
          ].map((campaign) => (
            <div key={campaign.id} className="p-6 flex items-center justify-between hover:bg-slate-50 transition-colors">
              <div className="flex items-center space-x-4">
                <div className={`p-2 rounded-full ${campaign.status === 'active' ? 'bg-emerald-100 text-emerald-600' : 'bg-slate-100 text-slate-600'}`}>
                  {campaign.status === 'active' ? <Play size={16} /> : <Pause size={16} />}
                </div>
                <div>
                  <h3 className="font-semibold text-slate-800">{campaign.name}</h3>
                  <p className="text-sm text-slate-500">{campaign.steps} steps • {campaign.enrolled} currently enrolled</p>
                </div>
              </div>
              <div className="flex items-center space-x-8">
                <div className="text-right">
                  <p className="text-sm font-medium text-slate-800">{campaign.openRate}</p>
                  <p className="text-xs text-slate-500">Open Rate</p>
                </div>
                <button className="text-sm text-blue-600 font-medium hover:text-blue-700">
                  Edit Sequence
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default DripMarketing;
