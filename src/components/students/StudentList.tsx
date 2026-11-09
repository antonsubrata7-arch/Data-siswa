import React, { useState } from 'react';
import { Student, ViolationRecord } from '../../types/discipline';
import { calculateStudentDisciplinaryStatus } from '../../utils/disciplineLogic';
import {
  Search,
  UserPlus,
  FileText,
  AlertTriangle,
  CheckCircle,
  Phone,
  Shield,
  Eye,
  PlusCircle,
  X,
  Check,
} from 'lucide-react';

interface StudentListProps {
  students: Student[];
  violations: ViolationRecord[];
  onOpenStudentDetail: (studentId: string) => void;
  onOpenLetter: (studentId: string) => void;
  onAddViolationForStudent: (studentId: string) => void;
  onAddStudent: (newStudent: Student) => void;
}

export const StudentList: React.FC<StudentListProps> = ({
  students,
  violations,
  onOpenStudentDetail,
  onOpenLetter,
  onAddViolationForStudent,
  onAddStudent,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'CRITICAL' | 'SAFE'>('ALL');
  const [isAddStudentOpen, setIsAddStudentOpen] = useState(false);

  // New Student Form state
  const [newNisn, setNewNisn] = useState('');
  const [newNis, setNewNis] = useState('');
  const [newName, setNewName] = useState('');
  const [newClass, setNewClass] = useState('VII-A');
  const [newGender, setNewGender] = useState<'L' | 'P'>('L');
  const [newParentName, setNewParentName] = useState('');
  const [newPhone, setNewPhone] = useState('');
  const [newAddress, setNewAddress] = useState('');
  const [newTeacher, setNewTeacher] = useState('Dra. Endang Rahayu, M.Pd.');

  const handleCreateStudent = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim() || !newNisn.trim()) return;

    onAddStudent({
      id: `std-${Date.now()}`,
      nisn: newNisn.trim(),
      nis: newNis.trim() || '2425' + Math.floor(100 + Math.random() * 900),
      name: newName.trim(),
      class: newClass,
      gender: newGender,
      parentName: newParentName.trim() || 'Orang Tua / Wali',
      phoneParent: newPhone.trim() || '0812-0000-0000',
      address: newAddress.trim() || 'Jakarta',
      homeroomTeacher: newTeacher.trim() || 'Wali Kelas',
    });

    setIsAddStudentOpen(false);
    // Reset form
    setNewName('');
    setNewNisn('');
    setNewNis('');
    setNewParentName('');
    setNewPhone('');
    setNewAddress('');
  };

  const studentData = students.map((s) => {
    const status = calculateStudentDisciplinaryStatus(s.id, violations);
    const count = violations.filter((v) => v.studentId === s.id).length;
    return {
      student: s,
      status,
      count,
    };
  });

  const filtered = studentData.filter((item) => {
    const matchesSearch =
      item.student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.student.nisn.includes(searchTerm) ||
      item.student.class.toLowerCase().includes(searchTerm.toLowerCase());

    if (!matchesSearch) return false;

    if (statusFilter === 'CRITICAL') {
      return item.status.netPoints >= 50;
    }
    if (statusFilter === 'SAFE') {
      return item.status.netPoints < 25;
    }
    return true;
  });

  return (
    <div className="space-y-4">
      {/* Search & Actions Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-900/90 border border-slate-800 p-4 rounded-2xl shadow-xl backdrop-blur-sm">
        <div className="flex flex-1 items-center gap-3">
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Cari siswa berdasarkan nama, kelas, atau NISN..."
              className="w-full bg-slate-800/90 border border-slate-700 rounded-xl pl-9 pr-3 py-2 text-xs text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div className="flex items-center gap-1.5 bg-slate-800 p-1 rounded-xl text-xs">
            <button
              onClick={() => setStatusFilter('ALL')}
              className={`px-3 py-1 rounded-lg font-medium transition-colors ${
                statusFilter === 'ALL'
                  ? 'bg-indigo-600 text-white'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Semua ({students.length})
            </button>
            <button
              onClick={() => setStatusFilter('CRITICAL')}
              className={`px-3 py-1 rounded-lg font-medium transition-colors ${
                statusFilter === 'CRITICAL'
                  ? 'bg-rose-600 text-white'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Perlu SP / Panggilan (
              {studentData.filter((s) => s.status.netPoints >= 50).length})
            </button>
            <button
              onClick={() => setStatusFilter('SAFE')}
              className={`px-3 py-1 rounded-lg font-medium transition-colors ${
                statusFilter === 'SAFE'
                  ? 'bg-emerald-600 text-white'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Aman ({studentData.filter((s) => s.status.netPoints < 25).length})
            </button>
          </div>
        </div>

        <button
          onClick={() => setIsAddStudentOpen(true)}
          className="flex items-center gap-2 bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white font-semibold text-xs px-4 py-2.5 rounded-xl shadow-lg shadow-indigo-600/20 transition-all cursor-pointer self-start sm:self-auto"
        >
          <UserPlus className="w-4 h-4" />
          Tambah Siswa Baru
        </button>
      </div>

      {/* Grid of Student Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.map(({ student, status, count }) => (
          <div
            key={student.id}
            className="rounded-2xl border border-slate-800 bg-slate-900/90 p-5 shadow-xl hover:border-slate-700 transition-all backdrop-blur-sm flex flex-col justify-between group"
          >
            <div>
              {/* Header card with name & status */}
              <div className="flex items-start justify-between gap-3 pb-3 border-b border-slate-800">
                <div className="flex items-center gap-3">
                  <div
                    className="w-11 h-11 rounded-xl flex items-center justify-center font-bold text-base font-mono border"
                    style={{
                      backgroundColor: `${status.color}15`,
                      color: status.color,
                      borderColor: `${status.color}35`,
                    }}
                  >
                    {student.name.charAt(0)}
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-white group-hover:text-indigo-400 transition-colors">
                      {student.name}
                    </h4>
                    <p className="text-xs text-slate-400 font-mono">
                      {student.class} • NISN {student.nisn}
                    </p>
                  </div>
                </div>

                <span
                  className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full border whitespace-nowrap ${status.badgeBg}`}
                >
                  {status.level}
                </span>
              </div>

              {/* Point Meter */}
              <div className="py-3">
                <div className="flex items-center justify-between text-xs mb-1.5 font-mono">
                  <span className="text-slate-400">Poin Pelanggaran:</span>
                  <div className="flex items-baseline gap-1">
                    <strong className="text-base font-bold" style={{ color: status.color }}>
                      {status.netPoints}
                    </strong>
                    <span className="text-slate-500 text-[10px]">pts</span>
                  </div>
                </div>

                <div className="h-2 w-full bg-slate-800 rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all duration-300"
                    style={{
                      width: `${Math.min(100, Math.max(5, (status.netPoints / 100) * 100))}%`,
                      backgroundColor: status.color,
                    }}
                  ></div>
                </div>

                <div className="flex items-center justify-between text-[10px] text-slate-500 mt-1 font-mono">
                  <span>{count} insiden dicatat</span>
                  <span>Max SP: 100</span>
                </div>
              </div>

              {/* Parent Contact Preview */}
              <div className="bg-slate-800/40 rounded-xl p-2.5 text-xs text-slate-300 space-y-1 mb-3">
                <div className="flex items-center gap-2 text-slate-400 text-[11px]">
                  <span>Orang Tua:</span>
                  <strong className="text-slate-200">{student.parentName}</strong>
                </div>
                <div className="flex items-center gap-2 text-emerald-400 font-mono text-[11px]">
                  <Phone className="w-3 h-3" />
                  <span>{student.phoneParent}</span>
                </div>
              </div>
            </div>

            {/* Action Bar */}
            <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between gap-2">
              <button
                onClick={() => onOpenStudentDetail(student.id)}
                className="flex-1 flex items-center justify-center gap-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 font-medium text-xs py-2 rounded-xl transition-colors cursor-pointer"
              >
                <Eye className="w-3.5 h-3.5" />
                Kartu Disiplin
              </button>

              <button
                onClick={() => onAddViolationForStudent(student.id)}
                title="Catat Pelanggaran"
                className="p-2 bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 rounded-xl transition-colors border border-rose-500/20 cursor-pointer"
              >
                <PlusCircle className="w-4 h-4" />
              </button>

              {status.netPoints >= 50 && (
                <button
                  onClick={() => onOpenLetter(student.id)}
                  title="Cetak Surat Panggilan Orang Tua"
                  className="p-2 bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 rounded-xl transition-colors border border-amber-500/20 cursor-pointer"
                >
                  <FileText className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>
        ))}

        {filtered.length === 0 && (
          <div className="col-span-full py-12 text-center text-slate-400">
            Tidak ada siswa yang sesuai dengan kriteria filter
          </div>
        )}
      </div>

      {/* Modal Add New Student */}
      {isAddStudentOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm">
          <div className="relative w-full max-w-lg bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl overflow-hidden">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-950">
              <div className="flex items-center gap-2.5">
                <UserPlus className="w-5 h-5 text-indigo-400" />
                <h3 className="text-base font-bold text-white">Tambah Siswa Baru</h3>
              </div>
              <button
                onClick={() => setIsAddStudentOpen(false)}
                className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateStudent} className="p-6 space-y-3.5">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Nama Siswa *
                  </label>
                  <input
                    type="text"
                    required
                    value={newName}
                    onChange={(e) => setNewName(e.target.value)}
                    placeholder="Nama lengkap"
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    NISN *
                  </label>
                  <input
                    type="text"
                    required
                    value={newNisn}
                    onChange={(e) => setNewNisn(e.target.value)}
                    placeholder="Contoh: 0081234567"
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Kelas / Fase
                  </label>
                  <select
                    value={newClass}
                    onChange={(e) => setNewClass(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-2 py-2 text-xs text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  >
                    <option value="VII-A">VII-A</option>
                    <option value="VII-B">VII-B</option>
                    <option value="VII-C">VII-C</option>
                    <option value="VII-D">VII-D</option>
                    <option value="VIII-A">VIII-A</option>
                    <option value="VIII-B">VIII-B</option>
                    <option value="VIII-C">VIII-C</option>
                    <option value="VIII-D">VIII-D</option>
                    <option value="IX-A">IX-A</option>
                    <option value="IX-B">IX-B</option>
                    <option value="IX-C">IX-C</option>
                    <option value="IX-D">IX-D</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    NIS
                  </label>
                  <input
                    type="text"
                    value={newNis}
                    onChange={(e) => setNewNis(e.target.value)}
                    placeholder="Nomor induk"
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Gender
                  </label>
                  <select
                    value={newGender}
                    onChange={(e) => setNewGender(e.target.value as 'L' | 'P')}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-2 py-2 text-xs text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  >
                    <option value="L">Laki-laki</option>
                    <option value="P">Perempuan</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Nama Orang Tua / Wali
                  </label>
                  <input
                    type="text"
                    value={newParentName}
                    onChange={(e) => setNewParentName(e.target.value)}
                    placeholder="Ayah / Ibu siswa"
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    No. Telp / WhatsApp Ortu
                  </label>
                  <input
                    type="text"
                    value={newPhone}
                    onChange={(e) => setNewPhone(e.target.value)}
                    placeholder="0812-xxxx-xxxx"
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Alamat Rumah
                </label>
                <input
                  type="text"
                  value={newAddress}
                  onChange={(e) => setNewAddress(e.target.value)}
                  placeholder="Alamat domisili siswa"
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Wali Kelas
                </label>
                <input
                  type="text"
                  value={newTeacher}
                  onChange={(e) => setNewTeacher(e.target.value)}
                  placeholder="Nama guru wali kelas"
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsAddStudentOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-medium text-slate-400 hover:text-white hover:bg-slate-800"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold px-4 py-2 rounded-xl text-xs shadow-md shadow-indigo-600/20"
                >
                  <Check className="w-4 h-4" />
                  Simpan Siswa
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
