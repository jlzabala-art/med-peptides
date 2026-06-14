import ShieldCheck from "lucide-react/dist/esm/icons/shield-check";
import AlertTriangle from "lucide-react/dist/esm/icons/alert-triangle";
import FileWarning from "lucide-react/dist/esm/icons/file-warning";
import CheckCircle2 from "lucide-react/dist/esm/icons/check-circle-2";
import XCircle from "lucide-react/dist/esm/icons/x-circle";
import Search from "lucide-react/dist/esm/icons/search";
import Calendar from "lucide-react/dist/esm/icons/calendar";
import Activity from "lucide-react/dist/esm/icons/activity";
import Bot from "lucide-react/dist/esm/icons/bot";
import Clock from "lucide-react/dist/esm/icons/clock";
import BellRing from "lucide-react/dist/esm/icons/bell-ring";
import FileSignature from "lucide-react/dist/esm/icons/file-signature";
import ArrowRight from "lucide-react/dist/esm/icons/arrow-right";
import TrendingUp from "lucide-react/dist/esm/icons/trending-up";
import Download from "lucide-react/dist/esm/icons/download";
import AlertCircle from "lucide-react/dist/esm/icons/alert-circle";
import React, { useState } from 'react';

















export default function RegulatoryTrackerView({ products = [] }) {
  // Generate mock compliance data if products list is empty or lacks compliance fields
  const mockProducts = products.length > 0 ? products : [
    { id: 1, name: 'BPC-157 5mg', supplier: 'BioPeptide Labs', registration: 'Active', coa: 'Valid', gmp: 'Missing', stability: 'Valid', permit: 'Active', risk: 'Amber' },
    { id: 2, name: 'TB-500 10mg', supplier: 'Advanced Syntho', registration: 'Pending', coa: 'Valid', gmp: 'Valid', stability: 'Expired', permit: 'Active', risk: 'Amber' },
    { id: 3, name: 'CJC-1295 2mg', supplier: 'EuroPeptides', registration: 'Active', coa: 'Valid', gmp: 'Valid', stability: 'Valid', permit: 'Active', risk: 'Green' },
    { id: 4, name: 'Ipamorelin 5mg', supplier: 'BioPeptide Labs', registration: 'Expired', coa: 'Missing', gmp: 'Valid', stability: 'Valid', permit: 'Expired', risk: 'Red' },
    { id: 5, name: 'Semaglutide 5mg', supplier: 'Alpha Sciences', registration: 'Active', coa: 'Valid', gmp: 'Valid', stability: 'Valid', permit: 'Active', risk: 'Green' },
  ];

  const metrics = {
    registered: mockProducts.filter(p => p.registration === 'Active').length,
    pending: mockProducts.filter(p => p.registration === 'Pending').length,
    missingCOA: mockProducts.filter(p => p.coa === 'Missing').length,
    missingGMP: mockProducts.filter(p => p.gmp === 'Missing').length,
    missingStability: mockProducts.filter(p => p.stability === 'Missing' || p.stability === 'Expired').length,
    score: 82,
  };

  const [aiQuery, setAiQuery] = useState('');

  const renderRiskBadge = (risk) => {
    switch(risk) {
      case 'Green': return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-100 text-emerald-800 border border-emerald-200"><CheckCircle2 className="w-3 h-3 mr-1" /> Low Risk</span>;
      case 'Amber': return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-amber-100 text-amber-800 border border-amber-200"><AlertTriangle className="w-3 h-3 mr-1" /> Med Risk</span>;
      case 'Red': return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-rose-100 text-rose-800 border border-rose-200"><XCircle className="w-3 h-3 mr-1" /> High Risk</span>;
      default: return null;
    }
  };

  const renderStatusIcon = (status) => {
    if (status === 'Valid' || status === 'Active') return <CheckCircle2 className="w-4 h-4 text-emerald-500 mx-auto" />;
    if (status === 'Missing') return <XCircle className="w-4 h-4 text-rose-500 mx-auto" />;
    if (status === 'Pending') return <Clock className="w-4 h-4 text-amber-500 mx-auto" />;
    if (status === 'Expired') return <AlertTriangle className="w-4 h-4 text-rose-500 mx-auto" />;
    return <span className="text-sm text-gray-500">{status}</span>;
  };

  return (
    <div className="space-y-6">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-gray-900 flex items-center gap-2">
            <ShieldCheck className="w-7 h-7 text-indigo-600" />
            Regulatory & Compliance
          </h2>
          <p className="mt-1 text-sm text-gray-500">Monitor product registrations, certifications, and compliance risks.</p>
        </div>
        <div className="flex items-center gap-3">
          <button className="inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-indigo-600 border border-gray-200 bg-white shadow-sm hover:bg-gray-50 h-9 px-4 py-2 text-gray-700">
            <Download className="w-4 h-4 mr-2" />
            Export Audit Report
          </button>
        </div>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {[
          { label: 'Compliance Score', value: `${metrics.score}%`, icon: Activity, color: 'text-indigo-600', bg: 'bg-indigo-50', trend: '+2%' },
          { label: 'Registered', value: metrics.registered, icon: ShieldCheck, color: 'text-emerald-600', bg: 'bg-emerald-50' },
          { label: 'Pending Reg.', value: metrics.pending, icon: Clock, color: 'text-amber-600', bg: 'bg-amber-50' },
          { label: 'Missing COA', value: metrics.missingCOA, icon: FileWarning, color: 'text-rose-600', bg: 'bg-rose-50' },
          { label: 'Missing GMP', value: metrics.missingGMP, icon: AlertTriangle, color: 'text-rose-600', bg: 'bg-rose-50' },
          { label: 'Stability Issues', value: metrics.missingStability, icon: TrendingUp, color: 'text-amber-600', bg: 'bg-amber-50' },
        ].map((metric, i) => (
          <div key={i} className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden group">
            <div className={`absolute top-0 right-0 p-3 opacity-20 group-hover:scale-110 transition-transform ${metric.color}`}>
              <metric.icon className="w-12 h-12 -mt-4 -mr-4" />
            </div>
            <div className={`inline-flex p-2 rounded-lg ${metric.bg} ${metric.color} mb-3`}>
              <metric.icon className="w-5 h-5" />
            </div>
            <p className="text-sm font-medium text-gray-500">{metric.label}</p>
            <div className="flex items-baseline gap-2 mt-1">
              <h3 className="text-2xl font-bold text-gray-900">{metric.value}</h3>
              {metric.trend && <span className="text-xs font-medium text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded">{metric.trend}</span>}
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content Area */}
        <div className="lg:col-span-2 space-y-6">
          {/* AI Compliance Assistant */}
          <div className="bg-gradient-to-r from-indigo-900 to-slate-900 rounded-xl p-6 shadow-lg text-white border border-indigo-800 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse"></div>
            <div className="relative z-10 flex flex-col md:flex-row gap-6 items-start md:items-center">
              <div className="flex-shrink-0 bg-indigo-500/20 p-3 rounded-xl border border-indigo-500/30">
                <Bot className="w-8 h-8 text-indigo-300" />
              </div>
              <div className="flex-1 w-full space-y-3">
                <div>
                  <h3 className="text-lg font-semibold text-white">Atlas Compliance Assistant</h3>
                  <p className="text-indigo-200 text-sm">Ask me about regulatory statuses, missing documents, or risk profiles.</p>
                </div>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Search className="h-4 w-4 text-indigo-300" />
                  </div>
                  <input
                    type="text"
                    value={aiQuery}
                    onChange={(e) => setAiQuery(e.target.value)}
                    placeholder="e.g., 'Show products missing COA' or 'Which products are at high risk?'"
                    className="block w-full pl-10 pr-3 py-2.5 border border-indigo-500/30 rounded-lg leading-5 bg-slate-800/50 text-indigo-100 placeholder-indigo-300/50 focus:outline-none focus:bg-slate-800 focus:ring-1 focus:ring-indigo-400 focus:border-indigo-400 sm:text-sm transition-colors"
                  />
                </div>
                <div className="flex flex-wrap gap-2 pt-1">
                  <button onClick={() => setAiQuery('Show products missing COA')} className="text-xs px-2.5 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-200 hover:bg-indigo-500/20 transition-colors">Missing COAs</button>
                  <button onClick={() => setAiQuery('Show suppliers with missing GMP')} className="text-xs px-2.5 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-200 hover:bg-indigo-500/20 transition-colors">GMP Issues</button>
                  <button onClick={() => setAiQuery('Which products are at regulatory risk?')} className="text-xs px-2.5 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-200 hover:bg-indigo-500/20 transition-colors">High Risk</button>
                </div>
              </div>
            </div>
          </div>

          {/* Compliance Table/Cards */}
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden flex flex-col">
            <div className="p-4 border-b border-gray-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-gray-50/50">
              <h3 className="font-semibold text-gray-900 flex items-center gap-2">
                <FileSignature className="w-5 h-5 text-gray-500" />
                Product Compliance Matrix
              </h3>
              <div className="flex items-center gap-2">
                <div className="relative max-w-sm">
                  <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-400" />
                  <input type="text" placeholder="Search matrix..." className="pl-9 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white w-full sm:w-64" />
                </div>
              </div>
            </div>
            {/* Desktop Table */}
            <div className="hidden md:block overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200 text-sm">
                <thead className="bg-gray-50 text-xs text-gray-500 uppercase tracking-wider">
                  <tr>
                    <th scope="col" className="px-4 py-3 text-left font-medium">Product / Supplier</th>
                    <th scope="col" className="px-3 py-3 text-center font-medium">Registration</th>
                    <th scope="col" className="px-3 py-3 text-center font-medium">COA</th>
                    <th scope="col" className="px-3 py-3 text-center font-medium">GMP</th>
                    <th scope="col" className="px-3 py-3 text-center font-medium">Stability</th>
                    <th scope="col" className="px-3 py-3 text-center font-medium">Import Permit</th>
                    <th scope="col" className="px-4 py-3 text-right font-medium">Risk Level</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {mockProducts.map((product) => (
                    <tr key={product.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-4 py-3 whitespace-nowrap">
                        <div className="font-medium text-gray-900">{product.name}</div>
                        <div className="text-xs text-gray-500">{product.supplier}</div>
                      </td>
                      <td className="px-3 py-3 whitespace-nowrap text-center">{renderStatusIcon(product.registration)}</td>
                      <td className="px-3 py-3 whitespace-nowrap text-center">{renderStatusIcon(product.coa)}</td>
                      <td className="px-3 py-3 whitespace-nowrap text-center">{renderStatusIcon(product.gmp)}</td>
                      <td className="px-3 py-3 whitespace-nowrap text-center">{renderStatusIcon(product.stability)}</td>
                      <td className="px-3 py-3 whitespace-nowrap text-center">{renderStatusIcon(product.permit)}</td>
                      <td className="px-4 py-3 whitespace-nowrap text-right">{renderRiskBadge(product.risk)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile Cards */}
            <div className="md:hidden divide-y divide-gray-200">
              {mockProducts.map((product) => (
                <div key={product.id} className="p-4 bg-white space-y-3">
                  <div className="flex justify-between items-start">
                    <div>
                      <div className="font-medium text-gray-900 text-base">{product.name}</div>
                      <div className="text-sm text-gray-500">{product.supplier}</div>
                    </div>
                    {renderRiskBadge(product.risk)}
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-sm pt-2 border-t border-gray-100">
                    <div className="flex items-center justify-between bg-gray-50 px-2 py-1.5 rounded">
                      <span className="text-gray-500 text-xs">Reg:</span>
                      {renderStatusIcon(product.registration)}
                    </div>
                    <div className="flex items-center justify-between bg-gray-50 px-2 py-1.5 rounded">
                      <span className="text-gray-500 text-xs">COA:</span>
                      {renderStatusIcon(product.coa)}
                    </div>
                    <div className="flex items-center justify-between bg-gray-50 px-2 py-1.5 rounded">
                      <span className="text-gray-500 text-xs">GMP:</span>
                      {renderStatusIcon(product.gmp)}
                    </div>
                    <div className="flex items-center justify-between bg-gray-50 px-2 py-1.5 rounded">
                      <span className="text-gray-500 text-xs">Stability:</span>
                      {renderStatusIcon(product.stability)}
                    </div>
                  </div>
                  <div className="pt-2 flex gap-2">
                    <button className="flex-1 bg-white border border-gray-200 text-gray-700 py-1.5 px-3 rounded-lg text-sm font-medium hover:bg-gray-50">View Details</button>
                    <button className="flex-1 bg-indigo-50 text-indigo-700 py-1.5 px-3 rounded-lg text-sm font-medium hover:bg-indigo-100 border border-indigo-100 flex items-center justify-center gap-1">
                      <Bot className="w-3.5 h-3.5" /> Ask Atlas
                    </button>
                  </div>
                </div>
              ))}
            </div>
            <div className="p-3 border-t border-gray-200 bg-gray-50 text-center">
              <button className="text-sm text-indigo-600 hover:text-indigo-700 font-medium inline-flex items-center">
                View full matrix <ArrowRight className="w-4 h-4 ml-1" />
              </button>
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Regulatory Alerts */}
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
            <div className="p-4 border-b border-gray-200 bg-gray-50/50 flex items-center justify-between">
              <h3 className="font-semibold text-gray-900 flex items-center gap-2">
                <BellRing className="w-5 h-5 text-rose-500" />
                Action Required
              </h3>
              <span className="bg-rose-100 text-rose-700 text-xs font-bold px-2 py-0.5 rounded-full">3</span>
            </div>
            <div className="divide-y divide-gray-100 p-2">
              <div className="p-3 flex items-start gap-3 hover:bg-gray-50 rounded-lg transition-colors cursor-pointer">
                <div className="bg-rose-100 p-1.5 rounded-md mt-0.5"><Clock className="w-4 h-4 text-rose-600" /></div>
                <div>
                  <h4 className="text-sm font-medium text-gray-900">Registration expiring soon</h4>
                  <p className="text-xs text-gray-500 mt-0.5"><span className="font-semibold">Ipamorelin 5mg</span> expires in 12 days.</p>
                  <button className="text-xs text-indigo-600 font-medium mt-1.5">Renew Now</button>
                </div>
              </div>
              <div className="p-3 flex items-start gap-3 hover:bg-gray-50 rounded-lg transition-colors cursor-pointer">
                <div className="bg-amber-100 p-1.5 rounded-md mt-0.5"><FileWarning className="w-4 h-4 text-amber-600" /></div>
                <div>
                  <h4 className="text-sm font-medium text-gray-900">Missing GMP Certificate</h4>
                  <p className="text-xs text-gray-500 mt-0.5"><span className="font-semibold">BioPeptide Labs</span> is missing current GMP.</p>
                  <button className="text-xs text-indigo-600 font-medium mt-1.5">Request Document</button>
                </div>
              </div>
              <div className="p-3 flex items-start gap-3 hover:bg-gray-50 rounded-lg transition-colors cursor-pointer">
                <div className="bg-rose-100 p-1.5 rounded-md mt-0.5"><AlertCircle className="w-4 h-4 text-rose-600" /></div>
                <div>
                  <h4 className="text-sm font-medium text-gray-900">Missing COA (Batch #492)</h4>
                  <p className="text-xs text-gray-500 mt-0.5"><span className="font-semibold">TB-500 10mg</span> shipment arrived without COA.</p>
                  <button className="text-xs text-indigo-600 font-medium mt-1.5">Resolve Issue</button>
                </div>
              </div>
            </div>
          </div>

          {/* Compliance Calendar */}
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
            <div className="p-4 border-b border-gray-200 bg-gray-50/50 flex items-center justify-between">
              <h3 className="font-semibold text-gray-900 flex items-center gap-2">
                <Calendar className="w-5 h-5 text-indigo-500" />
                Compliance Calendar
              </h3>
            </div>
            <div className="p-4 space-y-4">
              <div className="relative pl-4 border-l-2 border-amber-400">
                <div className="absolute -left-1.5 top-1.5 w-3 h-3 bg-white border-2 border-amber-400 rounded-full"></div>
                <div className="text-xs text-gray-500 font-medium mb-0.5">Next Week • Jun 18</div>
                <div className="text-sm font-medium text-gray-900">EuroPeptides GMP Renewal</div>
                <div className="text-xs text-gray-500 mt-1">Supplier facility certification renewal</div>
              </div>
              <div className="relative pl-4 border-l-2 border-rose-400">
                <div className="absolute -left-1.5 top-1.5 w-3 h-3 bg-white border-2 border-rose-400 rounded-full"></div>
                <div className="text-xs text-gray-500 font-medium mb-0.5">In 2 Weeks • Jun 25</div>
                <div className="text-sm font-medium text-gray-900">Ipamorelin Registration Expiry</div>
                <div className="text-xs text-gray-500 mt-1">Requires updated stability data submission</div>
              </div>
              <div className="relative pl-4 border-l-2 border-gray-300">
                <div className="absolute -left-1.5 top-1.5 w-3 h-3 bg-white border-2 border-gray-300 rounded-full"></div>
                <div className="text-xs text-gray-500 font-medium mb-0.5">Next Month • Jul 12</div>
                <div className="text-sm font-medium text-gray-900">Q3 Internal Audit</div>
                <div className="text-xs text-gray-500 mt-1">Quarterly compliance document review</div>
              </div>
            </div>
            <div className="p-3 border-t border-gray-200 bg-gray-50 text-center">
              <button className="text-sm text-gray-600 hover:text-gray-900 font-medium inline-flex items-center">
                Open full calendar <Calendar className="w-4 h-4 ml-1.5" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}