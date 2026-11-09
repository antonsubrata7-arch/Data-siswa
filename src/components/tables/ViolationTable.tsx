import React, { useState } from 'react';
import {
  ViolationRecord,
  Student,
  ViolationCategory,
  FollowUpStatus,
} from '../../types/discipline';
import {
  Search,
  Filter,
  Download,
  Trash2,
  HeartHandshake,
  FileText,
  User,
  AlertCircle,
  Eye,
  CheckCircle2,
} from 'lucide-react';

interface ViolationTableProps {
  violations: ViolationRecord[];
  students: Student[];
  onDelete: (id: string) => void;
  onOpenRestitution: (record: ViolationRecord) => void;
  onOpenStudentDetail: (studentId: string) => void;
  onOpenLetter: (studentId: string) => void;
}

export const ViolationTable: React.FC<ViolationTableProps> = ({
  violations,
  students,
  onDelete,
  onOpenRestitution,
  onOpenStudentDetail,
  onOpenLetter,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [selectedClass, setSelectedClass] = useState<string>('ALL');
  const [selectedStatus, setSelectedStatus] = useState<string>('ALL');

  const studentMap = new Map<string, Student>();
  students.forEach((s) => studentMap.set(s.id, s));

  // Get distinct classes for filter dropdown
  const classes = Array.from(new Set(students.map((s) => s.class))).sort();

  // Filter records
  const filteredViolations = violations.filter((record) => {
    const student = studentMap.get(record.studentId);
    const studentName = student?.name.toLowerCase() || '';
    const studentNisn = student?.nisn || '';
    const studentClass = student?.class || '';
    const query = searchTerm.toLowerCase();

    const matchesSearch =
      studentName.includes(query) ||
      studentNisn.includes(query) ||
      studentClass.toLowerCase().includes(query) ||
      record.ruleName.toLowerCase().includes(query) ||
      record.description.toLowerCase().includes(query) ||
      record.location.toLowerCase().includes(query);

    const matchesCategory =
      selectedCategory === 'ALL' || record.category === selectedCategory;
    const matchesClass = selectedClass === 'ALL' || studentClass === selectedClass;
    const matchesStatus = selectedStatus === 'ALL' || record.status === selectedStatus;

    return matchesSearch && matchesCategory && matchesClass && matchesStatus;
  });

  // Export to CSV
  const exportToCSV = () => {
    const headers = [
      'No',
      'Tanggal',
      'Waktu',
      'Nama Siswa',
      'NISN',
      'Kelas',
      'Kategori',
      'Pelanggaran',
      'Poin',
      'Restitusi',
      'Pelapor',
      'Lokasi',
      'Status Tindak Lanjut',
      'Deskripsi',
    ];

    const rows = filteredViolations.map((v, idx) => {
      const student = studentMap.get(v.studentId);
      return [
        idx + 1,
        v.date,
        v.time,
        `"${student?.name || '-'}"`,
        `'${student?.nisn || '-'}`,
        `"${student?.class || '-'}"`,
        `"${v.category}"`,
        `"${v.ruleName}"`,
        v.points,
        v.restitutionPoints || 0,
        `"${v.reporterName}"`,
        `"${v.location}"`,
        `"${v.status}"`,
        `"${v.description.replace(/"/g, '""')}"`,
      ].join(',');
    });

    const csvContent = '\uFEFF' + [headers.join(','), ...rows].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `rekap-pelanggaran-siswa-${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const getStatusBadge = (status: FollowUpStatus) => {
    switch (status) {
      case 'Menunggu':
        return 'bg-amber-500/10 text-amber-400 border-amber-500/30';
      case 'Konseling BK':
        return 'bg-sky-500/10 text-sky-400 border-sky-500/30';
      case 'Panggilan Ortu':
        return 'bg-rose-500/10 text-rose-400 border-rose-500/30 animate-pulse';
      case 'Sanksi Dijalankan':
        return 'bg-purple-500/10 text-purple-400 border-purple-500/30';
      case 'Selesai':
        return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30';
      default:
        return 'bg-slate-700 text-slate-300';
    }
  };

  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-900/90 shadow-xl overflow-hidden backdrop-blur-sm">
      {/* Top Controls */}
      <div className="p-4 sm:p-5 border-b border-slate-800 space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-rose-500"></span>
              Buku Catatan Pelanggaran Siswa
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Daftar kronologi kejadian dan tindak lanjut tata tertib
            </p>
          </div>

          <button
            onClick={exportToCSV}
            className="inline-flex items-center gap-2 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 px-3.5 py-1.5 rounded-xl text-xs font-medium transition-colors cursor-pointer self-start sm:self-auto"
          >
            <Download className="w-3.5 h-3.5 text-indigo-400" />
            Export Data CSV / Excel
          </button>
        </div>

        {/* Filter & Search Bar */}
        <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 pt-1">
          {/* Search box */}
          <div className="sm:col-span-5 relative">
            <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Cari siswa, kelas, NISN, atau kasus..."
              className="w-full bg-slate-800/80 border border-slate-700 rounded-xl pl-9 pr-3 py-2 text-xs text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          {/* Category Filter */}
          <div className="sm:col-span-3">
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-full bg-slate-800/80 border border-slate-700 rounded-xl px-2.5 py-2 text-xs text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="ALL">Semua Kategori</option>
              <option value="Kerapian & Atribut">Kerapian & Atribut</option>
              <option value="Kedisiplinan & Waktu">Kedisiplinan & Waktu</option>
              <option value="Sikap & Perilaku">Sikap & Perilaku</option>
              <option value="Ketertiban Belajar">Ketertiban Belajar</option>
              <option value="Pelanggaran Berat">Pelanggaran Berat</option>
            </select>
          </div>

          {/* Class Filter */}
          <div className="sm:col-span-2">
            <select
              value={selectedClass}
              onChange={(e) => setSelectedClass(e.target.value)}
              className="w-full bg-slate-800/80 border border-slate-700 rounded-xl px-2.5 py-2 text-xs text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="ALL">Semua Kelas</option>
              {classes.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>

          {/* Status Filter */}
          <div className="sm:col-span-2">
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="w-full bg-slate-800/80 border border-slate-700 rounded-xl px-2.5 py-2 text-xs text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="ALL">Semua Status</option>
              <option value="Menunggu">Menunggu</option>
              <option value="Konseling BK">Konseling BK</option>
              <option value="Panggilan Ortu">Panggilan Ortu</option>
              <option value="Sanksi Dijalankan">Sanksi Dijalankan</option>
              <option value="Selesai">Selesai</option>
            </select>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse text-xs">
          <thead>
            <tr className="border-b border-slate-800 bg-slate-950/60 text-slate-400 font-semibold uppercase tracking-wider text-[11px]">
              <th className="py-3 px-4">Waktu & Tanggal</th>
              <th className="py-3 px-4">Siswa & Kelas</th>
              <th className="py-3 px-4">Bentuk Pelanggaran</th>
              <th className="py-3 px-4 text-center">Poin</th>
              <th className="py-3 px-4">Status & Bukti</th>
              <th className="py-3 px-4 text-right">Aksi Tindak Lanjut</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/60">
            {filteredViolations.map((v) => {
              const student = studentMap.get(v.studentId);
              return (
                <tr
                  key={v.id}
                  className="hover:bg-slate-800/40 transition-colors group"
                >
                  {/* Date & Time */}
                  <td className="py-3 px-4 whitespace-nowrap">
                    <div className="font-medium text-slate-200">{v.date}</div>
                    <div className="text-[11px] text-slate-400 font-mono">
                      Pukul {v.time} WIB
                    </div>
                  </td>

                  {/* Student */}
                  <td className="py-3 px-4 whitespace-nowrap">
                    <button
                      onClick={() => onOpenStudentDetail(v.studentId)}
                      className="font-bold text-slate-100 hover:text-indigo-400 transition-colors text-left flex items-center gap-1.5 cursor-pointer"
                    >
                      <span>{student?.name || 'Siswa Tidak Ditemukan'}</span>
                    </button>
                    <div className="text-[11px] text-slate-400 font-mono">
                      {student?.class} • NISN {student?.nisn}
                    </div>
                  </td>

                  {/* Violation Description */}
                  <td className="py-3 px-4 max-w-xs">
                    <div className="font-semibold text-slate-200 line-clamp-1">
                      {v.ruleName}
                    </div>
                    <div className="text-[11px] text-slate-400 line-clamp-1">
                      {v.description}
                    </div>
                    <div className="text-[10px] text-indigo-400/90 mt-0.5">
                      Lokasi: {v.location} (Pelapor: {v.reporterName})
                    </div>
                  </td>

                  {/* Points */}
                  <td className="py-3 px-4 text-center whitespace-nowrap">
                    <span className="font-mono font-bold text-rose-400 text-sm">
                      +{v.points}
                    </span>
                    {v.restitutionPoints > 0 && (
                      <span className="block text-[10px] font-mono text-emerald-400 font-medium">
                        -{v.restitutionPoints} rest
                      </span>
                    )}
                  </td>

                  {/* Status & Evidence */}
                  <td className="py-3 px-4 whitespace-nowrap">
                    <span
                      className={`inline-block px-2.5 py-0.5 rounded-full text-[11px] font-semibold border ${getStatusBadge(
                        v.status
                      )}`}
                    >
                      {v.status}
                    </span>
                    {v.evidenceNote && (
                      <div className="text-[10px] text-slate-400 italic mt-0.5 line-clamp-1 max-w-[140px]">
                        Bukti: {v.evidenceNote}
                      </div>
                    )}
                  </td>

                  {/* Action Buttons */}
                  <td className="py-3 px-4 text-right whitespace-nowrap">
                    <div className="flex items-center justify-end gap-1">
                      {/* View Student Card */}
                      <button
                        onClick={() => onOpenStudentDetail(v.studentId)}
                        title="Buka Kartu Disiplin Siswa"
                        aria-label={`Lihat kartu siswa ${student?.name}`}
                        className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors cursor-pointer"
                      >
                        <User className="w-4 h-4" />
                      </button>

                      {/* Restitution */}
                      <button
                        onClick={() => onOpenRestitution(v)}
                        title="Pemulihan Poin / Restitusi"
                        aria-label={`Beri restitusi untuk ${student?.name}`}
                        className="p-1.5 text-emerald-400 hover:text-emerald-300 rounded-lg hover:bg-emerald-500/10 transition-colors cursor-pointer"
                      >
                        <HeartHandshake className="w-4 h-4" />
                      </button>

                      {/* Print Summons Letter if critical */}
                      <button
                        onClick={() => onOpenLetter(v.studentId)}
                        title="Surat Panggilan Orang Tua"
                        aria-label={`Surat panggilan ortu ${student?.name}`}
                        className="p-1.5 text-indigo-400 hover:text-indigo-300 rounded-lg hover:bg-indigo-500/10 transition-colors cursor-pointer"
                      >
                        <FileText className="w-4 h-4" />
                      </button>

                      {/* Delete */}
                      <button
                        onClick={() => {
                          if (confirm(`Yakin ingin menghapus catatan pelanggaran untuk ${student?.name}?`)) {
                            onDelete(v.id);
                          }
                        }}
                        title="Hapus Catatan"
                        aria-label={`Hapus catatan pelanggaran ${v.ruleName}`}
                        className="p-1.5 text-slate-500 hover:text-rose-400 rounded-lg hover:bg-rose-500/10 transition-colors cursor-pointer"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}

            {filteredViolations.length === 0 && (
              <tr>
                <td colSpan={6} className="py-12 text-center text-slate-400">
                  <div className="flex flex-col items-center justify-center gap-2">
                    <AlertCircle className="w-8 h-8 text-slate-600" />
                    <p className="text-sm font-medium">Tidak ada catatan pelanggaran yang sesuai</p>
                    <p className="text-xs text-slate-500">Coba ubah kata kunci pencarian atau reset filter</p>
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Footer Info */}
      <div className="p-3 bg-slate-950/40 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400 px-4">
        <span>
          Menampilkan <strong className="text-slate-200">{filteredViolations.length}</strong> dari{' '}
          <strong className="text-slate-200">{violations.length}</strong> total catatan
        </span>
        <span className="text-[11px] text-slate-500">
          Sistem Kedisiplinan Siswa Berbasis Poin © SMP Negeri 1 Kota Pontianak
        </span>
      </div>
    </div>
  );
};
