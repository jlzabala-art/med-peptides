"use client";

import React from 'react';
import { generateCoaData } from '@/services/coaGeneratorService';
import { ShieldCheck, FileText, Download, Printer, X, CheckCircle2, QrCode } from '@/lib/icons';

/**
 * CoaModal
 * ─────────────────────────────────────────────────────────────────────────────
 * Institutional Certificate of Analysis (COA) Viewer & Printable Document.
 * Fully responsive on Mobile and Laptop with clean @media print styles.
 */
export default function CoaModal({ product, variant, isOpen, onClose }) {
  if (!isOpen) return null;

  const coa = generateCoaData(product, variant);

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-[99999] flex items-center justify-center p-2 sm:p-4 bg-slate-950/80 backdrop-blur-md overflow-y-auto">
      {/* Container */}
      <div className="relative w-full max-w-4xl bg-white text-slate-900 rounded-2xl shadow-2xl overflow-hidden border border-slate-200 my-auto flex flex-col max-h-[92vh]">
        
        {/* Modal Action Bar (Hidden on print) */}
        <div className="flex items-center justify-between px-6 py-3.5 bg-slate-900 text-white border-b border-slate-800 print:hidden flex-shrink-0">
          <div className="flex items-center gap-2">
            <FileText size={18} className="text-teal-400" />
            <span className="font-bold text-sm tracking-wide">Certificate of Analysis (COA) Preview</span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-teal-600 hover:bg-teal-500 text-white text-xs font-bold transition-all shadow"
            >
              <Printer size={14} />
              <span>Print / Save PDF</span>
            </button>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Printable Document Body */}
        <div id="printable-coa-document" className="p-6 sm:p-10 overflow-y-auto space-y-6 text-xs font-sans">
          
          {/* Header */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center border-b-2 border-slate-900 pb-4 gap-4">
            <div>
              <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight uppercase">
                {coa.company}
              </h1>
              <p className="text-[11px] text-slate-500 font-medium">
                Analytical Chemistry & Quality Release Laboratory • {coa.labStandard}
              </p>
            </div>
            <div className="text-right sm:text-right flex flex-col items-start sm:items-end">
              <span className="px-2.5 py-1 rounded bg-slate-900 text-white font-mono font-bold text-xs tracking-wider">
                {coa.documentId}
              </span>
              <span className="text-[10px] text-slate-500 mt-1 font-mono">
                Date: {coa.signedDate}
              </span>
            </div>
          </div>

          {/* Product Meta Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-4 bg-slate-50 rounded-xl border border-slate-200">
            <div>
              <span className="text-[10px] font-bold text-slate-400 uppercase block">Product Name</span>
              <span className="font-extrabold text-slate-900 text-sm">{coa.productName}</span>
            </div>
            <div>
              <span className="text-[10px] font-bold text-slate-400 uppercase block">Batch / Lot #</span>
              <span className="font-mono font-bold text-slate-900 text-sm">{coa.lotNumber}</span>
            </div>
            <div>
              <span className="text-[10px] font-bold text-slate-400 uppercase block">Molecular Mass</span>
              <span className="font-mono font-semibold text-slate-800">{coa.molecularWeight}</span>
            </div>
            <div>
              <span className="text-[10px] font-bold text-slate-400 uppercase block">CAS Registry</span>
              <span className="font-mono font-semibold text-slate-800">{coa.casNumber}</span>
            </div>
          </div>

          {/* Analytical Release Specifications Table */}
          <div>
            <h2 className="text-sm font-bold text-slate-900 mb-2 uppercase tracking-wide flex items-center gap-1.5">
              <ShieldCheck size={16} className="text-teal-600" />
              <span>Release Test Results & Specifications</span>
            </h2>
            <div className="overflow-x-auto border border-slate-200 rounded-xl">
              <table className="w-full text-left border-collapse text-[11px]">
                <thead>
                  <tr className="bg-slate-100 border-b border-slate-200 text-slate-700 font-bold uppercase">
                    <th className="py-2.5 px-3">Test Parameter</th>
                    <th className="py-2.5 px-3">Release Specification</th>
                    <th className="py-2.5 px-3">Observed Result</th>
                    <th className="py-2.5 px-3 text-right">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {coa.tests.map((t, idx) => (
                    <tr key={idx} className={idx % 2 === 0 ? 'bg-white' : 'bg-slate-50/50'}>
                      <td className="py-2 px-3 font-semibold text-slate-900">{t.parameter}</td>
                      <td className="py-2 px-3 text-slate-600 font-mono text-[10px]">{t.specification}</td>
                      <td className="py-2 px-3 font-bold font-mono text-slate-900">{t.result}</td>
                      <td className="py-2 px-3 text-right">
                        <span className="px-2 py-0.5 rounded text-[9px] font-extrabold bg-emerald-100 text-emerald-800 border border-emerald-300">
                          {t.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Conclusion & Digital Signature Seal */}
          <div className="pt-4 border-t border-slate-200 grid grid-cols-1 sm:grid-cols-2 gap-6 items-center">
            <div className="space-y-1">
              <span className="text-[10px] font-bold text-slate-400 uppercase block">Quality Disposition</span>
              <p className="text-slate-700 text-[11px] leading-relaxed font-medium">
                {coa.conclusion}
              </p>
              <div className="flex items-center gap-1.5 text-emerald-700 font-bold text-xs pt-1">
                <CheckCircle2 size={14} />
                <span>Released for Research & Compounding Use</span>
              </div>
            </div>

            {/* QA Sign-off */}
            <div className="flex items-center justify-between sm:justify-end gap-6 border-t sm:border-t-0 pt-4 sm:pt-0">
              <div className="text-right">
                <span className="font-serif italic text-base font-bold text-slate-800 block">Elena Vance</span>
                <span className="font-bold text-slate-900 block text-xs">{coa.qaOfficer}</span>
                <span className="text-[10px] text-slate-500 block">{coa.qaTitle}</span>
              </div>
              <div className="p-2 border-2 border-slate-900 rounded-lg flex flex-col items-center justify-center bg-slate-50 text-slate-900">
                <span className="text-[8px] font-mono font-bold uppercase">QA SEAL</span>
                <div className="w-10 h-10 border border-dashed border-slate-400 my-0.5 flex items-center justify-center text-[8px] font-mono">
                  [VERIFIED]
                </div>
                <span className="text-[7px] font-mono">{coa.signedDate}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
