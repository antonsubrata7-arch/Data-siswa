import React, { useState } from 'react';
import {
  Student,
  ViolationRule,
  ViolationRecord,
  FollowUpStatus,
} from '../../types/discipline';
import { calculateStudentDisciplinaryStatus } from '../../utils/disciplineLogic';
import { AlertTriangle, X, Check, Search, Calendar, Clock, MapPin, UserCheck, ShieldAlert } from 'lucide-react';

interface AddViolationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (record: Omit<ViolationRecord, 'id' | 'createdAt'>) => void;
  students: Student[];
  rules: ViolationRule[];
  existingViolations: ViolationRecord[];
  initialStudentId?: string;
}

export const AddViolationModal: React.FC<AddViolationModalProps> = ({
  isOpen,
  onClose,
  onSave,
  students,
  rules,
  existingViolations,
  initialStudentId,
}) => {
  if (!isOpen) return null;

  const [studentSearch, setStudentSearch] = useState('');
  const [selectedStudentId, setSelectedStudentId] = useState<string>(
    initialStudentId || (students[0]?.id ?? '')
  );
  const [selectedRuleId, setSelectedRuleId] = useState<string>(rules[0]?.id ?? '');
  const [customPoints, setCustomPoints] = useState<number | ''>('');
  const [date, setDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [time, setTime] = useState<string>(
    new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }).replace('.', ':')
  );
  const [location, setLocation] = useState<string>('Pintu Gerbang Utama');
  const [reporterName, setReporterName] = useState<string>('Guru Piket');
  const [description, setDescription] = useState<string>('');
  const [evidenceNote, setEvidenceNote] = useState<string>('');
  const [status, setStatus] = useState<FollowUpStatus>('Menunggu');

  const selectedStudent = students.find((s) => s.id === selectedStudentId);
  const selectedRule = rules.find((r) => r.id === selectedRuleId);

  // Active points to be added
  const pointsToAdd = customPoints !== '' ? Number(customPoints) : selectedRule?.points || 0;

  // Calculate current status & projected status
  const currentDisciplinary = selectedStudent
    ? calculateStudentDisciplinaryStatus(selectedStudent.id, existingViolations)
    : null;
  const projectedNetPoints = (currentDisciplinary?.netPoints || 0) + pointsToAdd;

  const filteredStudents = students.filter(
    (s) =>
      s.name.toLowerCase().includes(studentSearch.toLowerCase()) ||
      s.nisn.includes(studentSearch) ||
      s.class.toLowerCase().includes(studentSearch.toLowerCase())
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedStudent || !selectedRule) return;

    onSave({
      studentId: selectedStudent.id,
      ruleId: selectedRule.id,
      category: selectedRule.category,
      ruleName: selectedRule.name,
      date,
      time,
      points: pointsToAdd,
      reporterName: reporterName.trim() || 'Guru Piket',
      location: location.trim() || 'Lingkungan Sekolah',
      description: description.trim() || selectedRule.name,
      evidenceNote: evidenceNote.trim() || undefined,
      status,
      restitutionPoints: 0,
    });

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm overflow-y-auto">
      <div className="relative w-full max-w-2xl bg-slate-900 border border-slate-700/80 rounded-2xl shadow-2xl overflow-hidden my-6">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-950/60">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 flex items-center justify-center">
              <ShieldAlert className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white">Catat Pelanggaran Siswa</h2>
              <p className="text-xs text-slate-400">
                Pencatatan pelanggaran tata tertib dan penambahan poin disiplin
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            aria-label="Tutup form catatan"
            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[75vh] overflow-y-auto">
          {/* Student Selector */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1.5">
              Pilih Siswa <span className="text-rose-400">*</span>
            </label>
            <div className="relative mb-2">
              <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
              <input
                type="text"
                value={studentSearch}
                onChange={(e) => setStudentSearch(e.target.value)}
                placeholder="Cari nama siswa, NISN, atau kelas..."
                className="w-full bg-slate-800/80 border border-slate-700 rounded-xl pl-9 pr-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
            <select
              value={selectedStudentId}
              onChange={(e) => setSelectedStudentId(e.target.value)}
              className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2.5 text-sm text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
              required
            >
              {filteredStudents.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name} — {s.class} (NISN: {s.nisn})
                </option>
              ))}
            </select>
          </div>

          {/* Current vs Projected Points Warning Banner */}
          {selectedStudent && currentDisciplinary && (
            <div className="rounded-xl border border-slate-700 bg-slate-800/60 p-3.5 flex items-center justify-between text-xs">
              <div className="flex items-center gap-3">
                <div
                  className="w-9 h-9 rounded-xl flex items-center justify-center font-mono font-bold text-sm"
                  style={{ backgroundColor: `${currentDisciplinary.color}20`, color: currentDisciplinary.color }}
                >
                  {currentDisciplinary.netPoints}
                </div>
                <div>
                  <div className="font-semibold text-slate-200">
                    Akumulasi Poin Saat Ini: {currentDisciplinary.netPoints} Poin
                  </div>
                  <div className="text-slate-400">
                    Status: <span className="font-semibold text-white">{currentDisciplinary.level}</span>
                  </div>
                </div>
              </div>

              <div className="text-right">
                <span className="text-slate-400 block text-[11px]">Proyeksi Setelah Dicatat:</span>
                <span className="font-mono text-base font-extrabold text-amber-400">
                  {projectedNetPoints} Poin
                </span>
                {projectedNetPoints >= 50 && (
                  <span className="ml-2 text-[10px] bg-rose-500/20 text-rose-400 px-1.5 py-0.5 rounded border border-rose-500/30">
                    SP Wajib
                  </span>
                )}
              </div>
            </div>
          )}

          {/* Violation Rule Preset Selector */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1.5">
              Jenis Pelanggaran (Tata Tertib) <span className="text-rose-400">*</span>
            </label>
            <select
              value={selectedRuleId}
              onChange={(e) => {
                setSelectedRuleId(e.target.value);
                setCustomPoints('');
              }}
              className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2.5 text-sm text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
              required
            >
              {rules.map((r) => (
                <option key={r.id} value={r.id}>
                  [{r.code}] [{r.category}] {r.name} (+{r.points} Poin)
                </option>
              ))}
            </select>
            {selectedRule && (
              <div className="mt-1.5 text-xs text-slate-400 flex items-center gap-2">
                <span className="text-indigo-400 font-medium">Sanksi Standar:</span>
                <span>{selectedRule.defaultAction}</span>
              </div>
            )}
          </div>

          {/* Points & Severity override */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Bobot Poin Pelanggaran
              </label>
              <input
                type="number"
                min="1"
                max="100"
                value={customPoints !== '' ? customPoints : selectedRule?.points || 0}
                onChange={(e) => setCustomPoints(e.target.value === '' ? '' : Number(e.target.value))}
                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white font-mono focus:outline-none focus:ring-2 focus:ring-indigo-500"
                required
              />
              <span className="text-[11px] text-slate-400">
                Otomatis dari aturan (bisa disesuaikan jika kasus khusus)
              </span>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Status Tindak Lanjut Awal
              </label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as FollowUpStatus)}
                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="Menunggu">Menunggu Tindak Lanjut</option>
                <option value="Konseling BK">Konseling Guru BK</option>
                <option value="Panggilan Ortu">Panggilan Orang Tua</option>
                <option value="Sanksi Dijalankan">Sanksi Sedang Dijalankan</option>
                <option value="Selesai">Selesai / Terbina</option>
              </select>
            </div>
          </div>

          {/* Date, Time, Location */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Tanggal Kejadian
              </label>
              <div className="relative">
                <Calendar className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
                <input
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl pl-9 pr-3 py-2 text-xs text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Waktu / Jam
              </label>
              <div className="relative">
                <Clock className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
                <input
                  type="time"
                  value={time}
                  onChange={(e) => setTime(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl pl-9 pr-3 py-2 text-xs text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Lokasi Kejadian
              </label>
              <div className="relative">
                <MapPin className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
                <input
                  type="text"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  placeholder="Misal: Kantin, Lab, Gerbang"
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl pl-9 pr-3 py-2 text-xs text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  required
                />
              </div>
            </div>
          </div>

          {/* Reporter */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              Guru / Petugas Pelapor
            </label>
            <div className="relative">
              <UserCheck className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
              <input
                type="text"
                value={reporterName}
                onChange={(e) => setReporterName(e.target.value)}
                placeholder="Nama guru piket, wali kelas, atau satpam"
                className="w-full bg-slate-800 border border-slate-700 rounded-xl pl-9 pr-3 py-2 text-xs text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                required
              />
            </div>
          </div>

          {/* Incident Description */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              Deskripsi & Kronologi Kejadian <span className="text-rose-400">*</span>
            </label>
            <textarea
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Jelaskan secara ringkas kronologi kejadian pelanggaran..."
              className="w-full bg-slate-800 border border-slate-700 rounded-xl p-3 text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              required
            />
          </div>

          {/* Evidence note */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              Catatan Barang Bukti / Saksi (Opsional)
            </label>
            <input
              type="text"
              value={evidenceNote}
              onChange={(e) => setEvidenceNote(e.target.value)}
              placeholder="Misal: Rekaman CCTV gerbang, seragam tidak ber-badge disita"
              className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          {/* Footer Actions */}
          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-medium text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            >
              Batal
            </button>
            <button
              type="submit"
              className="flex items-center gap-2 bg-gradient-to-r from-rose-600 to-indigo-600 hover:from-rose-500 hover:to-indigo-500 text-white font-semibold px-5 py-2 rounded-xl text-xs shadow-lg shadow-rose-600/20 transition-all cursor-pointer"
            >
              <Check className="w-4 h-4" />
              Simpan Catatan Pelanggaran
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
