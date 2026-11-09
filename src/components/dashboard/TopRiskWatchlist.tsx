import React from 'react';
import { Student, ViolationRecord } from '../../types/discipline';
import { getTopRiskStudents } from '../../utils/disciplineLogic';
import { ShieldAlert, AlertTriangle, FileText, ChevronRight, Eye } from 'lucide-react';

interface TopRiskWatchlistProps {
  violations: ViolationRecord[];
  students: Student[];
  onOpenStudentDetail: (studentId: string) => void;
  onOpenLetter: (studentId: string) => void;
}

export const TopRiskWatchlist: React.FC<TopRiskWatchlistProps> = ({
  violations,
  students,
  onOpenStudentDetail,
  onOpenLetter,
}) => {
  const topRisks = getTopRiskStudents(violations, students, 5);

  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-900/90 p-5 shadow-xl backdrop-blur-sm">
      <div className="flex items-center justify-between pb-3">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-rose-500/10 border border-rose-500/20 text-rose-400 flex items-center justify-center">
            <ShieldAlert className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-base font-bold text-white">Siswa Prioritas Pembinaan (Poin Tertinggi)</h3>
            <p className="text-xs text-slate-400">Monitoring ambang batas Surat Peringatan (SP) dan panggilan ortu</p>
          </div>
        </div>
      </div>

      <div className="space-y-3 mt-2">
        {topRisks.map(({ student, status, violationCount }, index) => {
          const isCritical = status.netPoints >= 50;

          return (
            <div
              key={student.id}
              className={`p-3 rounded-xl border transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                isCritical
                  ? 'bg-rose-950/20 border-rose-800/40 hover:border-rose-700/60'
                  : 'bg-slate-800/40 border-slate-800 hover:border-slate-700'
              }`}
            >
              <div className="flex items-center gap-3">
                <span className="w-6 h-6 rounded-full bg-slate-800 border border-slate-700 text-slate-300 font-mono text-xs flex items-center justify-center font-bold">
                  {index + 1}
                </span>

                <div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => onOpenStudentDetail(student.id)}
                      className="font-bold text-slate-100 hover:text-indigo-400 transition-colors text-xs text-left"
                    >
                      {student.name}
                    </button>
                    <span className="text-[10px] bg-slate-800 text-slate-400 px-1.5 py-0.5 rounded font-mono">
                      {student.class}
                    </span>
                  </div>
                  <div className="text-[11px] text-slate-400 mt-0.5 flex items-center gap-2">
                    <span>{violationCount} insiden</span>
                    <span>•</span>
                    <span className="text-amber-400/90 font-medium">{status.actionRequired}</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between sm:justify-end gap-3 pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-800/60">
                <div className="text-right">
                  <span className="text-[10px] text-slate-500 block">Total Poin:</span>
                  <span
                    className="font-mono font-black text-sm"
                    style={{ color: status.color }}
                  >
                    {status.netPoints} Pts
                  </span>
                </div>

                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => onOpenStudentDetail(student.id)}
                    title="Lihat Detail Profil"
                    className="p-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg transition-colors cursor-pointer"
                  >
                    <Eye className="w-3.5 h-3.5" />
                  </button>

                  {isCritical && (
                    <button
                      onClick={() => onOpenLetter(student.id)}
                      className="flex items-center gap-1 bg-rose-600 hover:bg-rose-500 text-white font-medium text-[11px] px-2.5 py-1.5 rounded-lg shadow-sm transition-colors cursor-pointer"
                    >
                      <FileText className="w-3 h-3" />
                      Surat Panggilan
                    </button>
                  )}
                </div>
              </div>
            </div>
          );
        })}

        {topRisks.length === 0 && (
          <div className="py-6 text-center text-xs text-slate-500">
            Tidak ada siswa dengan akumulasi poin pelanggaran aktif.
          </div>
        )}
      </div>
    </div>
  );
};
