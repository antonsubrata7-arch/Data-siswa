import React, { useState, useEffect } from 'react';
import {
  Student,
  ViolationRule,
  ViolationRecord,
  ChartDataPoint,
} from './types/discipline';
import {
  INITIAL_STUDENTS,
  INITIAL_RULES,
  INITIAL_VIOLATIONS,
} from './data/initialData';
import {
  calculateStudentDisciplinaryStatus,
  aggregateByCategory,
  aggregateByClass,
  aggregateByDateTrend,
  aggregateByDayOfWeek,
} from './utils/disciplineLogic';
import { InteractiveTrendChart } from './components/charts/InteractiveTrendChart';
import { InteractiveCategoryDonut } from './components/charts/InteractiveCategoryDonut';
import { InteractiveClassBarChart } from './components/charts/InteractiveClassBarChart';
import { InteractiveDayOfWeekChart } from './components/charts/InteractiveDayOfWeekChart';
import { TopRiskWatchlist } from './components/dashboard/TopRiskWatchlist';
import { ViolationTable } from './components/tables/ViolationTable';
import { StudentList } from './components/students/StudentList';
import { RulesCatalog } from './components/rules/RulesCatalog';
import { AddViolationModal } from './components/modals/AddViolationModal';
import { OfficialLetterModal } from './components/modals/OfficialLetterModal';
import { RestitutionModal } from './components/modals/RestitutionModal';
import { StudentDetailModal } from './components/modals/StudentDetailModal';
import {
  BarChart3,
  BookOpen,
  ClipboardList,
  GraduationCap,
  PlusCircle,
  RotateCcw,
  ShieldAlert,
  Users,
  CheckCircle,
  AlertTriangle,
  Award,
  Bell,
  Sparkles,
} from 'lucide-react';

export default function App() {
  // Local storage keys
  const STORAGE_KEY_STUDENTS = 'disiplin_smpn1_ptk_students_v1';
  const STORAGE_KEY_RULES = 'disiplin_smpn1_ptk_rules_v1';
  const STORAGE_KEY_VIOLATIONS = 'disiplin_smpn1_ptk_violations_v1';

  // State management with localStorage fallback
  const [students, setStudents] = useState<Student[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEY_STUDENTS);
    return saved ? JSON.parse(saved) : INITIAL_STUDENTS;
  });

  const [rules, setRules] = useState<ViolationRule[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEY_RULES);
    return saved ? JSON.parse(saved) : INITIAL_RULES;
  });

  const [violations, setViolations] = useState<ViolationRecord[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEY_VIOLATIONS);
    return saved ? JSON.parse(saved) : INITIAL_VIOLATIONS;
  });

  // Sync state to local storage
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY_STUDENTS, JSON.stringify(students));
  }, [students]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY_RULES, JSON.stringify(rules));
  }, [rules]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY_VIOLATIONS, JSON.stringify(violations));
  }, [violations]);

  // Tab navigation
  const [activeTab, setActiveTab] = useState<'dashboard' | 'violations' | 'students' | 'rules'>('dashboard');

  // Trend Chart Time Period filter (7 days, 14 days, 30 days)
  const [trendDays, setTrendDays] = useState<number>(7);

  // Modals state
  const [isAddModalOpen, setIsAddModalOpen] = useState<boolean>(false);
  const [activePreselectedStudentId, setActivePreselectedStudentId] = useState<string | undefined>(undefined);

  const [selectedStudentForLetter, setSelectedStudentForLetter] = useState<Student | null>(null);
  const [selectedStudentForDetail, setSelectedStudentForDetail] = useState<Student | null>(null);
  const [selectedRecordForRestitution, setSelectedRecordForRestitution] = useState<ViolationRecord | null>(null);

  // Toast feedback state
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 3500);
  };

  // Metrics calculation
  const totalViolationsCount = violations.length;
  const totalGrossPoints = violations.reduce((sum, v) => sum + v.points, 0);
  const totalRestitutionPoints = violations.reduce((sum, v) => sum + (v.restitutionPoints || 0), 0);
  const totalNetPoints = Math.max(0, totalGrossPoints - totalRestitutionPoints);

  const criticalStudentsCount = students.filter((s) => {
    const st = calculateStudentDisciplinaryStatus(s.id, violations);
    return st.netPoints >= 50;
  }).length;

  // Chart data aggregations
  const trendData = aggregateByDateTrend(violations, trendDays);
  const categoryData = aggregateByCategory(violations);
  const classData = aggregateByClass(violations, students);
  const dayOfWeekData = aggregateByDayOfWeek(violations);

  // Handlers
  const handleSaveViolation = (newRecordData: Omit<ViolationRecord, 'id' | 'createdAt'>) => {
    const newRecord: ViolationRecord = {
      ...newRecordData,
      id: `rec-${Date.now()}`,
      createdAt: new Date().toISOString(),
    };

    setViolations((prev) => [newRecord, ...prev]);
    showToast(`Catatan pelanggaran untuk siswa berhasil ditambahkan (+${newRecord.points} Poin)`);
  };

  const handleDeleteViolation = (id: string) => {
    setViolations((prev) => prev.filter((v) => v.id !== id));
    showToast('Catatan pelanggaran telah dihapus dari sistem');
  };

  const handleUpdateViolation = (updated: ViolationRecord) => {
    setViolations((prev) => prev.map((v) => (v.id === updated.id ? updated : v)));
    showToast('Pemulihan poin / tindak lanjut berhasil diperbarui');
  };

  const handleAddStudent = (newStudent: Student) => {
    setStudents((prev) => [newStudent, ...prev]);
    showToast(`Siswa ${newStudent.name} berhasil didaftarkan`);
  };

  const handleAddRule = (newRule: ViolationRule) => {
    setRules((prev) => [newRule, ...prev]);
    showToast(`Pasal aturan ${newRule.code} berhasil ditambahkan`);
  };

  const handleResetData = () => {
    if (confirm('Kembalikan semua data ke sampel bawaan sekolah? Data yang Anda buat akan di-reset.')) {
      setStudents(INITIAL_STUDENTS);
      setRules(INITIAL_RULES);
      setViolations(INITIAL_VIOLATIONS);
      localStorage.removeItem(STORAGE_KEY_STUDENTS);
      localStorage.removeItem(STORAGE_KEY_RULES);
      localStorage.removeItem(STORAGE_KEY_VIOLATIONS);
      showToast('Data berhasil di-reset ke data bawaan demo');
    }
  };

  const handleOpenLetterForStudent = (studentId: string) => {
    const s = students.find((std) => std.id === studentId);
    if (s) {
      setSelectedStudentForLetter(s);
    }
  };

  const handleOpenDetailForStudent = (studentId: string) => {
    const s = students.find((std) => std.id === studentId);
    if (s) {
      setSelectedStudentForDetail(s);
    }
  };

  const handleAddViolationQuick = (studentId?: string) => {
    setActivePreselectedStudentId(studentId);
    setIsAddModalOpen(true);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-indigo-500 selection:text-white">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-5 right-5 z-50 flex items-center gap-2.5 bg-slate-900/95 border border-indigo-500/50 text-white px-4 py-3 rounded-2xl shadow-2xl backdrop-blur-md animate-bounce text-xs font-medium">
          <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Top Navigation Bar */}
      <header className="sticky top-0 z-40 border-b border-slate-800/80 bg-slate-950/80 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          {/* Logo & School Identity */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 via-violet-600 to-rose-500 flex items-center justify-center text-white shadow-lg shadow-indigo-600/30">
              <ShieldAlert className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-base tracking-tight text-white">
                  Disiplin<span className="text-indigo-400">Siswa</span>
                </span>
                <span className="text-[10px] bg-indigo-500/20 text-indigo-300 font-mono px-2 py-0.5 rounded-full border border-indigo-500/30 hidden sm:inline-block">
                  v2.4 BK & Kesiswaan
                </span>
              </div>
              <p className="text-[11px] text-slate-400 hidden sm:block">
                SMP Negeri 1 Kota Pontianak — Sistem Poin Tata Tertib & Grafik Kedisiplinan
              </p>
            </div>
          </div>

          {/* Quick Header Actions */}
          <div className="flex items-center gap-2.5">
            <button
              onClick={handleResetData}
              title="Reset ke Sampel Demo"
              aria-label="Reset data ke sampel bawaan"
              className="p-2 text-slate-400 hover:text-white rounded-xl hover:bg-slate-800 transition-colors text-xs flex items-center gap-1.5 cursor-pointer"
            >
              <RotateCcw className="w-4 h-4" />
              <span className="hidden md:inline">Reset Demo</span>
            </button>

            <button
              onClick={() => handleAddViolationQuick()}
              className="flex items-center gap-2 bg-gradient-to-r from-rose-600 via-rose-500 to-indigo-600 hover:from-rose-500 hover:to-indigo-500 text-white font-semibold text-xs px-3.5 sm:px-4 py-2 sm:py-2.5 rounded-xl shadow-lg shadow-rose-600/25 transition-all cursor-pointer transform active:scale-95"
            >
              <PlusCircle className="w-4 h-4" />
              <span>Catat Pelanggaran</span>
            </button>
          </div>
        </div>

        {/* Tab Bar */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex space-x-1 sm:space-x-2 overflow-x-auto no-scrollbar border-t border-slate-900/60 py-2">
          <button
            onClick={() => setActiveTab('dashboard')}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
              activeTab === 'dashboard'
                ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
            }`}
          >
            <BarChart3 className="w-4 h-4" />
            Grafik & Statistik Web
          </button>

          <button
            onClick={() => setActiveTab('violations')}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
              activeTab === 'violations'
                ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
            }`}
          >
            <ClipboardList className="w-4 h-4" />
            Buku Catatan Pelanggaran ({violations.length})
          </button>

          <button
            onClick={() => setActiveTab('students')}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
              activeTab === 'students'
                ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
            }`}
          >
            <Users className="w-4 h-4" />
            Data Siswa & Poin ({students.length})
          </button>

          <button
            onClick={() => setActiveTab('rules')}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
              activeTab === 'rules'
                ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
            }`}
          >
            <BookOpen className="w-4 h-4" />
            Master Tata Tertib ({rules.length} Aturan)
          </button>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        {/* KPI Summary Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          {/* Card 1: Total Kasus */}
          <div className="rounded-2xl border border-slate-800 bg-slate-900/90 p-4 shadow-xl backdrop-blur-sm relative overflow-hidden">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                Total Kejadian
              </span>
              <div className="w-7 h-7 rounded-lg bg-indigo-500/10 text-indigo-400 flex items-center justify-center">
                <ClipboardList className="w-4 h-4" />
              </div>
            </div>
            <div className="mt-2 flex items-baseline gap-2">
              <span className="text-2xl sm:text-3xl font-extrabold font-mono text-white">
                {totalViolationsCount}
              </span>
              <span className="text-xs text-slate-400 font-medium">kasus dicatat</span>
            </div>
            <div className="mt-2 text-[11px] text-slate-400">
              Tersebar di {classData.length} kelas aktif
            </div>
          </div>

          {/* Card 2: Poin Bersih */}
          <div className="rounded-2xl border border-slate-800 bg-slate-900/90 p-4 shadow-xl backdrop-blur-sm relative overflow-hidden">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                Akumulasi Poin Bersih
              </span>
              <div className="w-7 h-7 rounded-lg bg-amber-500/10 text-amber-400 flex items-center justify-center">
                <AlertTriangle className="w-4 h-4" />
              </div>
            </div>
            <div className="mt-2 flex items-baseline gap-2">
              <span className="text-2xl sm:text-3xl font-extrabold font-mono text-amber-400">
                {totalNetPoints}
              </span>
              <span className="text-xs text-slate-400 font-medium">poin aktif</span>
            </div>
            <div className="mt-2 text-[11px] text-slate-400 flex items-center gap-1.5">
              <span>Gross: {totalGrossPoints}</span>
              <span>•</span>
              <span className="text-emerald-400">Restitusi: -{totalRestitutionPoints}</span>
            </div>
          </div>

          {/* Card 3: Siswa Butuh Panggilan Ortu (SP) */}
          <div className="rounded-2xl border border-rose-900/50 bg-rose-950/20 p-4 shadow-xl backdrop-blur-sm relative overflow-hidden">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold uppercase tracking-wider text-rose-300">
                Siswa Batas SP
              </span>
              <div className="w-7 h-7 rounded-lg bg-rose-500/20 text-rose-400 flex items-center justify-center">
                <ShieldAlert className="w-4 h-4" />
              </div>
            </div>
            <div className="mt-2 flex items-baseline gap-2">
              <span className="text-2xl sm:text-3xl font-extrabold font-mono text-rose-400">
                {criticalStudentsCount}
              </span>
              <span className="text-xs text-rose-300 font-medium">siswa &ge; 50 Poin</span>
            </div>
            <div className="mt-2 text-[11px] text-rose-300/80">
              Perlu panggilan orang tua & konseling khusus
            </div>
          </div>

          {/* Card 4: Restitusi / Keberhasilan Pembinaan */}
          <div className="rounded-2xl border border-emerald-900/50 bg-emerald-950/20 p-4 shadow-xl backdrop-blur-sm relative overflow-hidden">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold uppercase tracking-wider text-emerald-300">
                Pemulihan Poin
              </span>
              <div className="w-7 h-7 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
                <Award className="w-4 h-4" />
              </div>
            </div>
            <div className="mt-2 flex items-baseline gap-2">
              <span className="text-2xl sm:text-3xl font-extrabold font-mono text-emerald-400">
                {totalRestitutionPoints}
              </span>
              <span className="text-xs text-emerald-300 font-medium">poin dipulihkan</span>
            </div>
            <div className="mt-2 text-[11px] text-emerald-300/80">
              Dari kompensasi positif & konseling BK
            </div>
          </div>
        </div>

        {/* Tab 1: Dashboard & Grafik Web */}
        {activeTab === 'dashboard' && (
          <div className="space-y-6">
            {/* Trend Chart Period Toolbar */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h2 className="text-lg font-bold text-white flex items-center gap-2">
                  <BarChart3 className="w-5 h-5 text-indigo-400" />
                  Grafik Analitik & Visualisasi Kedisiplinan
                </h2>
                <p className="text-xs text-slate-400">
                  Grafik web HTML interaktif untuk pemantauan dinamika tata tertib siswa
                </p>
              </div>

              {/* Time Range Selector */}
              <div className="flex items-center gap-1.5 bg-slate-900 border border-slate-800 p-1 rounded-xl text-xs">
                <button
                  onClick={() => setTrendDays(7)}
                  className={`px-3 py-1 rounded-lg font-medium transition-colors ${
                    trendDays === 7 ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  7 Hari Terakhir
                </button>
                <button
                  onClick={() => setTrendDays(14)}
                  className={`px-3 py-1 rounded-lg font-medium transition-colors ${
                    trendDays === 14 ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  14 Hari
                </button>
                <button
                  onClick={() => setTrendDays(30)}
                  className={`px-3 py-1 rounded-lg font-medium transition-colors ${
                    trendDays === 30 ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  30 Hari
                </button>
              </div>
            </div>

            {/* Row 1: Interactive SVG Trend Line/Area Chart */}
            <InteractiveTrendChart
              data={trendData}
              title={`Tren Kejadian Pelanggaran (${trendDays} Hari Terakhir)`}
              subtitle="Arahkan kursor pada titik grafik untuk melihat rincian tanggal, frekuensi kasus, dan akumulasi poin"
            />

            {/* Row 2: Donut Category Distribution & Class Ranking */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              <div className="lg:col-span-6">
                <InteractiveCategoryDonut
                  data={categoryData}
                  title="Proporsi Kategori Pelanggaran"
                />
              </div>

              <div className="lg:col-span-6">
                <InteractiveClassBarChart
                  data={classData}
                  title="Peringkat Kasus per Kelas"
                />
              </div>
            </div>

            {/* Row 3: Day-of-week incident density & Top Risk Watchlist */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              <div className="lg:col-span-5">
                <InteractiveDayOfWeekChart
                  data={dayOfWeekData}
                  title="Frekuensi Berdasarkan Hari"
                />
              </div>

              <div className="lg:col-span-7">
                <TopRiskWatchlist
                  violations={violations}
                  students={students}
                  onOpenStudentDetail={handleOpenDetailForStudent}
                  onOpenLetter={handleOpenLetterForStudent}
                />
              </div>
            </div>
          </div>
        )}

        {/* Tab 2: Buku Catatan Pelanggaran */}
        {activeTab === 'violations' && (
          <ViolationTable
            violations={violations}
            students={students}
            onDelete={handleDeleteViolation}
            onOpenRestitution={(rec) => setSelectedRecordForRestitution(rec)}
            onOpenStudentDetail={handleOpenDetailForStudent}
            onOpenLetter={handleOpenLetterForStudent}
          />
        )}

        {/* Tab 3: Data Siswa & Poin */}
        {activeTab === 'students' && (
          <StudentList
            students={students}
            violations={violations}
            onOpenStudentDetail={handleOpenDetailForStudent}
            onOpenLetter={handleOpenLetterForStudent}
            onAddViolationForStudent={handleAddViolationQuick}
            onAddStudent={handleAddStudent}
          />
        )}

        {/* Tab 4: Master Tata Tertib */}
        {activeTab === 'rules' && (
          <RulesCatalog rules={rules} onAddRule={handleAddRule} />
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-900 mt-12 py-6 bg-slate-950 text-slate-500 text-xs text-center">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p>© {new Date().getFullYear()} SMP Negeri 1 Kota Pontianak. Buku Disiplin & Tata Tertib Siswa.</p>
          <div className="flex items-center gap-4 text-slate-400">
            <span>Bimbingan Konseling (BK)</span>
            <span>•</span>
            <span>Kesiswaan & Disiplin</span>
            <span>•</span>
            <span>Format Resmi Kemdikbudristek</span>
          </div>
        </div>
      </footer>

      {/* Modals */}
      <AddViolationModal
        isOpen={isAddModalOpen}
        onClose={() => {
          setIsAddModalOpen(false);
          setActivePreselectedStudentId(undefined);
        }}
        onSave={handleSaveViolation}
        students={students}
        rules={rules}
        existingViolations={violations}
        initialStudentId={activePreselectedStudentId}
      />

      {selectedStudentForLetter && (
        <OfficialLetterModal
          isOpen={!!selectedStudentForLetter}
          onClose={() => setSelectedStudentForLetter(null)}
          student={selectedStudentForLetter}
          status={calculateStudentDisciplinaryStatus(selectedStudentForLetter.id, violations)}
          violations={violations}
        />
      )}

      {selectedRecordForRestitution && (
        <RestitutionModal
          isOpen={!!selectedRecordForRestitution}
          onClose={() => setSelectedRecordForRestitution(null)}
          record={selectedRecordForRestitution}
          onUpdate={handleUpdateViolation}
        />
      )}

      {selectedStudentForDetail && (
        <StudentDetailModal
          isOpen={!!selectedStudentForDetail}
          onClose={() => setSelectedStudentForDetail(null)}
          student={selectedStudentForDetail}
          violations={violations}
          onOpenLetter={() => {
            const s = selectedStudentForDetail;
            setSelectedStudentForDetail(null);
            setSelectedStudentForLetter(s);
          }}
          onAddViolationForStudent={() => {
            const sId = selectedStudentForDetail.id;
            setSelectedStudentForDetail(null);
            handleAddViolationQuick(sId);
          }}
        />
      )}
    </div>
  );
}
