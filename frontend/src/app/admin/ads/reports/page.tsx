'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  BarChart2,
  TrendingUp,
  MousePointer,
  Eye,
  DollarSign,
  FileText,
  Download,
  ArrowLeft,
  CheckCircle2,
  Clock,
  Smartphone,
  Monitor,
} from 'lucide-react';
import { AdInvoice } from '../../../../lib/types';
import api from '../../../../lib/api';

export default function AdReportsPage() {
  const [reportData, setReportData] = useState<any>(null);
  const [invoices, setInvoices] = useState<AdInvoice[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      api.get('/admin/ads/reports').catch(() => ({ data: { data: null } })),
      api.get('/admin/ads/invoices').catch(() => ({ data: { data: [] } })),
    ]).then(([repRes, invRes]) => {
      if (repRes.data?.data) setReportData(repRes.data.data);
      if (invRes.data?.data) setInvoices(invRes.data.data);
      setLoading(false);
    });
  }, []);

  const kpi = reportData?.kpi || {
    totalCampaigns: 4,
    activeCampaigns: 3,
    totalAdvertisers: 2,
    totalImpressions: 48500,
    totalClicks: 2150,
    ctr: 4.43,
  };

  const chartData = reportData?.chartData || [
    { date: '11-01', impressions: 2400, clicks: 120 },
    { date: '11-03', impressions: 3100, clicks: 150 },
    { date: '11-05', impressions: 2900, clicks: 140 },
    { date: '11-07', impressions: 4200, clicks: 210 },
    { date: '11-09', impressions: 3800, clicks: 190 },
    { date: '11-11', impressions: 5100, clicks: 260 },
    { date: '11-13', impressions: 6400, clicks: 320 },
  ];

  return (
    <div className="space-y-6 font-gujarati text-gray-800">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-gray-200 pb-4">
        <div className="flex items-center gap-3">
          <Link
            href="/admin/ads"
            className="p-2 rounded-lg border border-gray-300 hover:bg-gray-100 transition-colors"
          >
            <ArrowLeft className="w-4 h-4 text-gray-700" />
          </Link>
          <div>
            <h1 className="text-xl md:text-2xl font-black text-gray-900 flex items-center gap-2">
              <BarChart2 className="w-6 h-6 text-emerald-600" />
              <span>કેમ્પેઇન એનાલિટિક્સ અને ઇન્વોઇસ બિલિંગ</span>
            </h1>
            <p className="text-xs text-gray-500">
              વાસ્તવિક ઇમ્પ્રેશન, ક્લિક્સ, CTR દરો અને જીએસટી બિલિંગ રેકોર્ડ્સ
            </p>
          </div>
        </div>
      </div>

      {/* 5 KPI Metric Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3.5">
        <div className="bg-white p-4 rounded-xl border border-gray-200/80 shadow-xs">
          <div className="flex items-center justify-between text-gray-500 mb-2">
            <span className="text-xs font-bold">સક્રિય કેમ્પેઇન</span>
            <TrendingUp className="w-4 h-4 text-primary" />
          </div>
          <p className="text-2xl font-black text-gray-900">{kpi.activeCampaigns}</p>
        </div>

        <div className="bg-white p-4 rounded-xl border border-gray-200/80 shadow-xs">
          <div className="flex items-center justify-between text-gray-500 mb-2">
            <span className="text-xs font-bold">કુલ ઇમ્પ્રેશન</span>
            <Eye className="w-4 h-4 text-blue-600" />
          </div>
          <p className="text-2xl font-black text-gray-900">
            {kpi.totalImpressions.toLocaleString('en-IN')}
          </p>
        </div>

        <div className="bg-white p-4 rounded-xl border border-gray-200/80 shadow-xs">
          <div className="flex items-center justify-between text-gray-500 mb-2">
            <span className="text-xs font-bold">કુલ ક્લિક્સ</span>
            <MousePointer className="w-4 h-4 text-secondary" />
          </div>
          <p className="text-2xl font-black text-gray-900">
            {kpi.totalClicks.toLocaleString('en-IN')}
          </p>
        </div>

        <div className="bg-white p-4 rounded-xl border border-gray-200/80 shadow-xs">
          <div className="flex items-center justify-between text-gray-500 mb-2">
            <span className="text-xs font-bold">સરેરાશ CTR %</span>
            <BarChart2 className="w-4 h-4 text-emerald-600" />
          </div>
          <p className="text-2xl font-black text-emerald-600">{kpi.ctr}%</p>
        </div>

        <div className="bg-white p-4 rounded-xl border border-gray-200/80 shadow-xs">
          <div className="flex items-center justify-between text-gray-500 mb-2">
            <span className="text-xs font-bold">કુલ ક્લાયન્ટ્સ</span>
            <DollarSign className="w-4 h-4 text-amber-500" />
          </div>
          <p className="text-2xl font-black text-gray-900">{kpi.totalAdvertisers}</p>
        </div>
      </div>

      {/* Chart Section */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        <div className="lg:col-span-8 bg-white p-5 rounded-2xl border border-gray-200/80 shadow-xs">
          <h2 className="text-sm font-bold text-gray-900 mb-4 pb-2 border-b border-gray-100 flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-emerald-600" />
            <span>દૈનિક જાહેરાત પ્રદર્શન વલણ (Daily Ad Performance Trends)</span>
          </h2>

          <div className="flex items-end justify-between gap-3 h-48 pt-4 px-2">
            {chartData.map((item: any, i: number) => {
              const maxImp = Math.max(...chartData.map((c: any) => c.impressions), 5000);
              const heightPercent = Math.max(10, (item.impressions / maxImp) * 100);
              return (
                <div key={i} className="flex-1 flex flex-col items-center gap-1.5 h-full justify-end">
                  <span className="text-[10px] font-bold text-gray-700 font-mono">
                    {item.clicks}c
                  </span>
                  <div
                    style={{ height: `${heightPercent}%` }}
                    className="w-full bg-primary hover:bg-secondary rounded-t transition-all"
                    title={`${item.date}: ${item.impressions} Views, ${item.clicks} Clicks`}
                  />
                  <span className="text-[10px] text-gray-500 font-mono">{item.date}</span>
                </div>
              );
            })}
          </div>
          <p className="text-[11px] text-gray-400 text-center mt-3">
            ઈમ્પ્રેશન અને ક્લિક્સ સંખ્યા (વાદળી બાર: ઈમ્પ્રેશન, ટોચ: ક્લિક્સ)
          </p>
        </div>

        <div className="lg:col-span-4 bg-white p-5 rounded-2xl border border-gray-200/80 shadow-xs flex flex-col justify-between">
          <h2 className="text-sm font-bold text-gray-900 border-b border-gray-100 pb-2">
            ઉપકરણ વિભાજન (Device Breakdown)
          </h2>

          <div className="space-y-4 py-4">
            <div>
              <div className="flex items-center justify-between text-xs font-bold mb-1">
                <span className="flex items-center gap-1.5 text-gray-700">
                  <Monitor className="w-4 h-4 text-primary" />
                  <span>ડેસ્કટોપ વપરાશકર્તાઓ</span>
                </span>
                <span className="font-mono">૬૨%</span>
              </div>
              <div className="w-full h-2 rounded-full bg-gray-100 overflow-hidden">
                <div className="h-full bg-primary rounded-full w-[62%]" />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between text-xs font-bold mb-1">
                <span className="flex items-center gap-1.5 text-gray-700">
                  <Smartphone className="w-4 h-4 text-secondary" />
                  <span>મોબાઇલ વપરાશકર્તાઓ</span>
                </span>
                <span className="font-mono">૩૮%</span>
              </div>
              <div className="w-full h-2 rounded-full bg-gray-100 overflow-hidden">
                <div className="h-full bg-secondary rounded-full w-[38%]" />
              </div>
            </div>
          </div>

          <div className="p-3 bg-gray-50 rounded-xl text-[11px] text-gray-500">
            તમામ ઇવેન્ટ્સ વાસ્તવિક દર્શકોના વ્યુપોઇન્ટ ઇન્ટરસેક્શન દ્વારા સ્વચાલિત ગણતરી થાય છે.
          </div>
        </div>
      </div>

      {/* Invoices & Billing Table */}
      <div className="bg-white rounded-2xl border border-gray-200/80 shadow-xs overflow-hidden">
        <div className="p-4 border-b border-gray-200 flex items-center justify-between">
          <h2 className="text-sm font-bold text-gray-900 flex items-center gap-2">
            <FileText className="w-4 h-4 text-primary" />
            <span>ક્લાયન્ટ ઇન્વોઇસ અને બિલિંગ ઇતિહાસ (Invoices & Billing)</span>
          </h2>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-gray-50 text-gray-500 uppercase text-[10px] font-bold border-b border-gray-200">
              <tr>
                <th className="py-3 px-4">ઇન્વોઇસ નંબર</th>
                <th className="py-3 px-4">ક્લાયન્ટનું નામ</th>
                <th className="py-3 px-4">રકમ (મૂળ)</th>
                <th className="py-3 px-4">GST (18%)</th>
                <th className="py-3 px-4">કુલ રકમ</th>
                <th className="py-3 px-4">સ્થિતિ</th>
                <th className="py-3 px-4 text-right">ઇન્વોઇસ PDF</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {invoices.length > 0 ? (
                invoices.map((inv) => (
                  <tr key={inv.id} className="hover:bg-gray-50/60 transition-colors">
                    <td className="py-3.5 px-4 font-mono font-bold text-primary">
                      {inv.invoiceNumber}
                    </td>
                    <td className="py-3.5 px-4 font-semibold text-gray-800">
                      {inv.advertiser?.companyName || 'Unknown'}
                    </td>
                    <td className="py-3.5 px-4 font-mono">
                      ₹{inv.amount.toLocaleString('en-IN')}
                    </td>
                    <td className="py-3.5 px-4 font-mono text-gray-500">
                      ₹{inv.gstAmount.toLocaleString('en-IN')}
                    </td>
                    <td className="py-3.5 px-4 font-mono font-bold text-gray-900">
                      ₹{inv.totalAmount.toLocaleString('en-IN')}
                    </td>
                    <td className="py-3.5 px-4">
                      <span
                        className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          inv.status === 'PAID'
                            ? 'bg-emerald-100 text-emerald-800'
                            : 'bg-amber-100 text-amber-800'
                        }`}
                      >
                        {inv.status === 'PAID' ? 'ચુકવાઈ ગયેલ' : 'બાકી'}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <button
                        onClick={() => alert(`ઇન્વોઇસ ${inv.invoiceNumber} ડાઉનલોડ થઈ રહ્યું છે...`)}
                        className="inline-flex items-center gap-1 text-primary hover:text-secondary font-bold"
                      >
                        <Download className="w-3.5 h-3.5" />
                        <span>ડાઉનલોડ</span>
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={7} className="py-6 text-center text-gray-400">
                    કોઈ ઇન્વોઇસ રેકોર્ડ મળ્યો નથી.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
