import React from 'react';
import { Student, ViolationRecord, DisciplinaryStatus } from '../../types/discipline';
import { calculateStudentDisciplinaryStatus } from '../../utils/disciplineLogic';
import { X, User, Phone, MapPin, School, AlertTriangle, ShieldCheck, FileText, Calendar, Clock, PlusCircle } from 'lucide-react';

interface StudentDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  student: Student;
  violations: ViolationRecord[];
  onOpenLetter: () => void;
  onAddViolationForStudent: () => void;
}

export const StudentDetailModal: React.FC<StudentDetailModalProps> = ({
  isOpen,
  onClose,
  student,
  violations,
  onOpenLetter,
  onAddViolationForStudent,
}) => {
  if (!isOpen) return null;

  const status = calculateStudentDisciplinaryStatus(student.id, violations);
  const studentViolations = violations
    .filter((v) => v.studentId === student.id)
    .sort((a, b) => new Date(b.date + ' ' + b.time).getTime() - new Date(a.date + ' ' + a.time).getTime());

  // Progress percentage against critical threshold 100
  const progressPercent = Math.min(100, Math.round((status.netPoints / 100) * 100));

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm overflow-y-auto">
      <div className="relative w-full max-w-3xl bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl overflow-hidden my-6">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-950">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 flex items-center justify-center font-bold text-lg font-mono">
              {student.name.charAt(0)}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-bold text-white">{student.name}</h2>
                <span className="text-xs bg-slate-800 text-slate-300 px-2 py-0.5 rounded-md font-mono border border-slate-700">
                  {student.class}
                </span>
              </div>
              <p className="text-xs text-slate-400">
                NISN: <span className="font-mono text-slate-300">{student.nisn}</span> | NIS: <span className="font-mono text-slate-300">{student.nis}</span>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {status.netPoints >= 50 && (
              <button
                onClick={onOpenLetter}
                className="flex items-center gap-1.5 bg-rose-600/90 hover:bg-rose-500 text-white font-medium text-xs px-3 py-1.5 rounded-xl transition-all shadow-md shadow-rose-600/20 cursor-pointer"
              >
                <FileText className="w-3.5 h-3.5" />
                Cetak Surat Panggilan
              </button>
            )}
            <button
              onClick={onClose}
              aria-label="Tutup detail siswa"
              className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6 max-h-[75vh] overflow-y-auto">
          {/* Status Gauge & Overview Card */}
          <div className="bg-slate-950/70 border border-slate-800 rounded-2xl p-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800/80">
              <div>
                <span className="text-xs font-semibold uppercase tracking-wider text-slate-400 block mb-1">
                  Status Disiplin Siswa
                </span>
                <div className="flex items-center gap-2.5">
                  <span
                    className={`inline-block px-3 py-1 rounded-full text-xs font-bold border ${status.badgeBg}`}
                  >
                    {status.level}
                  </span>
                  <span className="text-xs text-slate-400">
                    {studentViolations.length} total insiden tercatat
                  </span>
                </div>
              </div>

              <div className="flex items-baseline gap-2 text-right">
                <div>
                  <span className="text-[11px] text-slate-400 block">Akumulasi Poin Bersih:</span>
                  <span className="text-2xl font-black font-mono" style={{ color: status.color }}>
                    {status.netPoints}
                  </span>
                  <span className="text-slate-500 text-xs ml-1 font-mono">/ 100 Pts</span>
                </div>
              </div>
            </div>

            {/* Gauge progress bar */}
            <div className="pt-4">
              <div className="flex justify-between text-[11px] text-slate-400 mb-1.5 font-medium">
                <span>0 Poin (Aman)</span>
                <span>25 (Peringatan)</span>
                <span>50 (SP 1)</span>
                <span>75 (SP 2)</span>
                <span>100 (SP 3)</span>
              </div>
              <div className="h-3 w-full bg-slate-800 rounded-full overflow-hidden p-0.5 border border-slate-700/60 relative">
                <div
                  className="h-full rounded-full transition-all duration-500 shadow-sm"
                  style={{
                    width: `${Math.max(5, progressPercent)}%`,
                    backgroundColor: status.color,
                  }}
                ></div>
              </div>
              <div className="mt-2.5 text-xs text-slate-300 bg-slate-900/90 p-2.5 rounded-xl border border-slate-800 flex items-start gap-2">
                <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                <div>
                  <strong className="text-white">Rekomendasi Tindakan: </strong>
                  <span>{status.actionRequired}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Student Info & Guardian info */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div className="bg-slate-800/40 border border-slate-800 p-4 rounded-xl space-y-2">
              <h4 className="font-semibold text-slate-200 flex items-center gap-1.5 pb-1 border-b border-slate-700/50">
                <User className="w-4 h-4 text-indigo-400" />
                Data Siswa & Akademik
              </h4>
              <div className="text-slate-300">
                <span className="text-slate-400">Jenis Kelamin:</span> {student.gender === 'L' ? 'Laki-laki' : 'Perempuan'}
              </div>
              <div className="text-slate-300">
                <span className="text-slate-400">Kelas / Fase:</span> {student.class}
              </div>
              <div className="text-slate-300">
                <span className="text-slate-400">Wali Kelas:</span> {student.homeroomTeacher}
              </div>
            </div>

            <div className="bg-slate-800/40 border border-slate-800 p-4 rounded-xl space-y-2">
              <h4 className="font-semibold text-slate-200 flex items-center gap-1.5 pb-1 border-b border-slate-700/50">
                <Phone className="w-4 h-4 text-emerald-400" />
                Kontak Orang Tua / Wali
              </h4>
              <div className="text-slate-300">
                <span className="text-slate-400">Nama Orang Tua:</span> {student.parentName}
              </div>
              <div className="text-slate-300 flex items-center gap-2">
                <span className="text-slate-400">No. WhatsApp / HP:</span>
                <span className="font-mono text-emerald-400 font-semibold">{student.phoneParent}</span>
              </div>
              <div className="text-slate-300">
                <span className="text-slate-400">Alamat Rumah:</span> {student.address}
              </div>
            </div>
          </div>

          {/* Violations Timeline */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Calendar className="w-4 h-4 text-indigo-400" />
                Riwayat Kejadian Pelanggaran
              </h3>
              <button
                onClick={onAddViolationForStudent}
                className="flex items-center gap-1.5 text-xs text-indigo-400 hover:text-indigo-300 font-medium"
              >
                <PlusCircle className="w-3.5 h-3.5" />
                Tambah untuk Siswa Ini
              </button>
            </div>

            <div className="space-y-3">
              {studentViolations.map((v, i) => (
                <div
                  key={v.id}
                  className="bg-slate-800/60 border border-slate-800 p-3.5 rounded-xl hover:border-slate-700 transition-colors"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-slate-100">{v.ruleName}</span>
                        <span className="text-[10px] bg-slate-700 text-slate-300 px-2 py-0.5 rounded">
                          {v.category}
                        </span>
                      </div>
                      <p className="text-xs text-slate-300 mt-1">{v.description}</p>
                      {v.evidenceNote && (
                        <p className="text-[11px] text-amber-400/90 mt-1 italic">
                          Bukti: {v.evidenceNote}
                        </p>
                      )}
                      <div className="flex items-center gap-3 text-[11px] text-slate-400 mt-2">
                        <span>{v.date} ({v.time})</span>
                        <span>•</span>
                        <span>Lokasi: {v.location}</span>
                        <span>•</span>
                        <span>Pelapor: {v.reporterName}</span>
                      </div>
                    </div>

                    <div className="text-right shrink-0">
                      <div className="font-mono font-bold text-sm text-rose-400">
                        +{v.points} Pts
                      </div>
                      {v.restitutionPoints > 0 && (
                        <div className="font-mono text-xs text-emerald-400">
                          -{v.restitutionPoints} Restitusi
                        </div>
                      )}
                      <span className="inline-block mt-1 text-[10px] bg-slate-700/80 text-slate-300 px-2 py-0.5 rounded-full">
                        {v.status}
                      </span>
                    </div>
                  </div>
                </div>
              ))}

              {studentViolations.length === 0 && (
                <div className="p-8 text-center text-xs text-slate-400 bg-slate-800/30 rounded-xl border border-dashed border-slate-800">
                  Siswa ini belum memiliki catatan pelanggaran. Disiplin terjaga dengan baik!
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
