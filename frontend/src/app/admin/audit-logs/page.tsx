'use client';

import React, { useEffect, useState } from 'react';
import { ShieldAlert, RefreshCw } from 'lucide-react';
import api from '../../../lib/api';

export default function AuditLogsAdminPage() {
  const [logs, setLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const loadLogs = () => {
    setLoading(true);
    api
      .get(`/admin/audit-logs?page=${page}&limit=25`)
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
            <ShieldAlert className="w-5 h-5 text-primary" />
            <span>સુરક્ષા ઓડિટ લૉગ્સ (Security Audit Logs)</span>
          </h1>
          <p className="text-xs text-neutral-muted mt-0.5">
            સંપાદકીય ક્રિયાઓ, પ્રકાશન, નકારણા અને વપરાશકર્તા લોગિનનો અપરિવર્તનીય ઇતિહાસ
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
              <th className="py-3 px-3">વપરાશકર્તા</th>
              <th className="py-3 px-3">ક્રિયા (Action)</th>
              <th className="py-3 px-3">લક્ષ્ય (Target)</th>
              <th className="py-3 px-3">IP સરનામું</th>
              <th className="py-3 px-3">વિગતો</th>
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
                  કોઈ ઓડિટ લૉગ્સ મળ્યા નથી.
                </td>
              </tr>
            ) : (
              logs.map((log) => (
                <tr key={log.id} className="hover:bg-gray-50/60">
                  <td className="py-3 px-3 font-bold text-neutral-text">
                    {log.user ? `${log.user.name} (${log.user.role})` : 'સિસ્ટમ'}
                  </td>
                  <td className="py-3 px-3">
                    <span className="font-mono font-bold bg-blue-50 text-primary px-2 py-0.5 rounded text-[10px]">
                      {log.action}
                    </span>
                  </td>
                  <td className="py-3 px-3 text-gray-600 font-mono">
                    {log.targetType} {log.targetId ? `(${log.targetId.slice(0, 8)}...)` : ''}
                  </td>
                  <td className="py-3 px-3 font-mono text-gray-500">{log.ipAddress || 'localhost'}</td>
                  <td className="py-3 px-3 max-w-xs truncate text-gray-500 font-mono text-[10px]">
                    {log.details ? JSON.stringify(log.details) : '-'}
                  </td>
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
