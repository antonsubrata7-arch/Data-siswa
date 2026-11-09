import React, { useState } from 'react';
import { ViolationRecord } from '../../types/discipline';
import { X, HeartHandshake, Check, Award } from 'lucide-react';

interface RestitutionModalProps {
  isOpen: boolean;
  onClose: () => void;
  record: ViolationRecord;
  onUpdate: (updatedRecord: ViolationRecord) => void;
}

export const RestitutionModal: React.FC<RestitutionModalProps> = ({
  isOpen,
  onClose,
  record,
  onUpdate,
}) => {
  if (!isOpen) return null;

  const [deductionPoints, setDeductionPoints] = useState<number>(
    record.restitutionPoints || Math.min(record.points, 5)
  );
  const [restitutionNotes, setRestitutionNotes] = useState<string>(
    record.restitutionNotes || ''
  );
  const [newStatus, setNewStatus] = useState(record.status);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdate({
      ...record,
      restitutionPoints: Number(deductionPoints),
      restitutionNotes: restitutionNotes.trim(),
      status: newStatus,
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm">
      <div className="relative w-full max-w-lg bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-950">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center">
              <HeartHandshake className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white">Pemulihan Poin / Restitusi Disiplin</h2>
              <p className="text-xs text-slate-400">
                Pemberian kompensasi positif & pengurangan poin pelanggaran
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            aria-label="Tutup pemulihan"
            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="p-3 bg-slate-800/60 rounded-xl border border-slate-700 text-xs">
            <div className="text-slate-400">Kasus:</div>
            <div className="font-semibold text-white mt-0.5">{record.ruleName}</div>
            <div className="flex items-center gap-2 mt-1 text-slate-400">
              <span>Poin Terkena: <strong className="text-rose-400 font-mono">+{record.points}</strong></span>
              <span>•</span>
              <span>Tanggal: {record.date}</span>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              Poin Pemulihan / Pengurangan (Restitusi)
            </label>
            <div className="flex items-center gap-2">
              <input
                type="number"
                min="0"
                max={record.points}
                value={deductionPoints}
                onChange={(e) => setDeductionPoints(Number(e.target.value))}
                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-sm text-emerald-400 font-mono font-bold focus:outline-none focus:ring-2 focus:ring-emerald-500"
                required
              />
              <span className="text-xs text-slate-400 whitespace-nowrap">
                Maks: {record.points} pts
              </span>
            </div>
            <p className="text-[11px] text-slate-400 mt-1">
              Poin ini akan memotong akumulasi pelanggaran siswa setelah menyelesaikan pembinaan.
            </p>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              Status Tindak Lanjut Setelah Pemulihan
            </label>
            <select
              value={newStatus}
              onChange={(e) => setNewStatus(e.target.value as any)}
              className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
            >
              <option value="Selesai">Selesai / Terbina</option>
              <option value="Sanksi Dijalankan">Sanksi Dijalankan</option>
              <option value="Konseling BK">Konseling BK Lanjutan</option>
              <option value="Panggilan Ortu">Panggilan Ortu</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              Catatan Bentuk Kompensasi / Konseling
            </label>
            <textarea
              rows={3}
              value={restitutionNotes}
              onChange={(e) => setRestitutionNotes(e.target.value)}
              placeholder="Misal: Siswa telah menyelesaikan piket literasi perpustakaan selama 3 hari dan berkomitmen tidak mengulangi."
              className="w-full bg-slate-800 border border-slate-700 rounded-xl p-3 text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              required
            />
          </div>

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
              className="flex items-center gap-2 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-semibold px-4 py-2 rounded-xl text-xs shadow-lg shadow-emerald-600/20 transition-all cursor-pointer"
            >
              <Check className="w-4 h-4" />
              Simpan Pemulihan Poin
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
