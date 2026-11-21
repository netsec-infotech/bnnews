'use client';

import React, { useEffect, useState } from 'react';
import { History, RefreshCw } from 'lucide-react';
import { RssLogItem } from '../../../lib/types';
import api from '../../../lib/api';

export default function RssLogsAdminPage() {
  const [logs, setLogs] = useState<RssLogItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const loadLogs = () => {
    setLoading(true);
    api
      .get(`/admin/rss-logs?page=${page}&limit=25`)
      .then((res) => {
        if (res.data?.success) {
          setLogs(res.data.data);
          setTotalPages(res.data.meta?.totalPages || 1);
        }
      })
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadLogs();
  }, [page]);

  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-xs p-5 space-y-6 font-gujarati">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-gray-200 pb-4">
        <div>
          <h1 className="text-xl font-bold text-neutral-text flex items-center gap-2">
            <History className="w-5 h-5 text-primary" />
            <span>RSS કલેક્શન લૉગ્સ (RSS Collection Logs)</span>
          </h1>
          <p className="text-xs text-neutral-muted mt-0.5">
            સ્વયંસંચાલિત RSS ફેચ ઇતિહાસ, સફળતા અને ભૂલોનું વિશ્લેષણ
          </p>
        </div>

        <button
          onClick={loadLogs}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 border rounded-lg text-xs font-semibold hover:bg-gray-50"
        >
          <RefreshCw className="w-3.5 h-3.5 text-primary" />
          <span>રિફ્રેશ</span>
        </button>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs">
          <thead className="bg-gray-50 text-neutral-muted uppercase text-[10px] border-b border-gray-200">
            <tr>
              <th className="py-3 px-3">સ્ત્રોત નામ</th>
              <th className="py-3 px-3">સ્થિતિ</th>
              <th className="py-3 px-3">સંદેશ</th>
              <th className="py-3 px-3">ફેચ આઇટમ્સ</th>
              <th className="py-3 px-3">સેવ આઇટમ્સ (PENDING)</th>
              <th className="py-3 px-3">સમય</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {loading ? (
              <tr>
                <td colSpan={6} className="py-8 text-center text-gray-400">
                  લોડ થઈ રહ્યું છે...
                </td>
              </tr>
            ) : logs.length === 0 ? (
              <tr>
                <td colSpan={6} className="py-8 text-center text-gray-400">
                  કોઈ લૉગ્સ મળ્યા નથી.
                </td>
              </tr>
            ) : (
              logs.map((log) => (
                <tr key={log.id} className="hover:bg-gray-50/60">
                  <td className="py-3 px-3 font-bold text-neutral-text">
                    {log.source?.name || 'સિસ્ટમ'}
                  </td>
                  <td className="py-3 px-3">
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        log.status === 'ERROR'
                          ? 'bg-red-100 text-red-700'
                          : 'bg-emerald-100 text-emerald-800'
                      }`}
                    >
                      {log.status}
                    </span>
                  </td>
                  <td className="py-3 px-3 max-w-md text-neutral-text">{log.message}</td>
                  <td className="py-3 px-3 font-mono">{log.itemsFetched}</td>
                  <td className="py-3 px-3 font-mono font-bold text-primary">+{log.itemsSaved}</td>
                  <td className="py-3 px-3 text-gray-400 whitespace-nowrap">
                    {new Date(log.createdAt).toLocaleString('gu-IN')}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {totalPages > 1 && (
        <div className="flex justify-between items-center pt-3 text-xs border-t">
          <span>પૃષ્ઠ {page} / {totalPages}</span>
          <div className="flex gap-2">
            <button
              disabled={page <= 1}
              onClick={() => setPage((p) => p - 1)}
              className="px-3 py-1 border rounded disabled:opacity-40"
            >
              પાછળ
            </button>
            <button
              disabled={page >= totalPages}
              onClick={() => setPage((p) => p + 1)}
              className="px-3 py-1 border rounded disabled:opacity-40"
            >
              આગળ
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
