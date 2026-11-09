import {
  DisciplinaryStatus,
  Student,
  ViolationCategory,
  ViolationRecord,
  ChartDataPoint,
} from '../types/discipline';

export function getDisciplinaryLevel(netPoints: number): {
  level: DisciplinaryStatus['level'];
  color: string;
  badgeBg: string;
  actionRequired: string;
} {
  if (netPoints >= 100) {
    return {
      level: 'SP 3 / Konferensi Kasus',
      color: '#ef4444', // red-500
      badgeBg: 'bg-red-500/20 text-red-400 border-red-500/30',
      actionRequired: 'Konferensi kasus dengan Kepala Sekolah & Pemanggilan Orang Tua ke-3 (Rekomendasi dikembalikan ke orang tua)',
    };
  }
  if (netPoints >= 75) {
    return {
      level: 'SP 2',
      color: '#f97316', // orange-500
      badgeBg: 'bg-orange-500/20 text-orange-400 border-orange-500/30',
      actionRequired: 'Surat Peringatan II, Pemanggilan Orang Tua ke-2 & Skorsing Akademik 3 hari',
    };
  }
  if (netPoints >= 50) {
    return {
      level: 'SP 1',
      color: '#eab308', // yellow-500
      badgeBg: 'bg-amber-500/20 text-amber-400 border-amber-500/30',
      actionRequired: 'Surat Peringatan I, Konseling Intensif BK & Pemanggilan Orang Tua ke-1',
    };
  }
  if (netPoints >= 25) {
    return {
      level: 'Peringatan',
      color: '#38bdf8', // sky-400
      badgeBg: 'bg-sky-500/20 text-sky-400 border-sky-500/30',
      actionRequired: 'Teguran tertulis & Konseling BK tahap awal bersama Wali Kelas',
    };
  }
  return {
    level: 'Aman',
    color: '#22c55e', // green-500
    badgeBg: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
    actionRequired: 'Perilaku disiplin baik, pertahankan kepatuhan tata tertib sekolah',
  };
}

export function calculateStudentDisciplinaryStatus(
  studentId: string,
  violations: ViolationRecord[]
): DisciplinaryStatus {
  const studentViolations = violations.filter((v) => v.studentId === studentId);
  const totalGrossPoints = studentViolations.reduce((sum, v) => sum + (v.points || 0), 0);
  const totalRestitution = studentViolations.reduce((sum, v) => sum + (v.restitutionPoints || 0), 0);
  const netPoints = Math.max(0, totalGrossPoints - totalRestitution);

  const statusMeta = getDisciplinaryLevel(netPoints);

  return {
    totalGrossPoints,
    totalRestitution,
    netPoints,
    ...statusMeta,
  };
}

export function aggregateByCategory(violations: ViolationRecord[]): ChartDataPoint[] {
  const categoryColors: Record<ViolationCategory, string> = {
    'Kerapian & Atribut': '#38bdf8', // sky
    'Kedisiplinan & Waktu': '#f59e0b', // amber
    'Sikap & Perilaku': '#ec4899', // pink
    'Ketertiban Belajar': '#8b5cf6', // purple
    'Pelanggaran Berat': '#ef4444', // red
  };

  const counts: Record<string, number> = {
    'Kerapian & Atribut': 0,
    'Kedisiplinan & Waktu': 0,
    'Sikap & Perilaku': 0,
    'Ketertiban Belajar': 0,
    'Pelanggaran Berat': 0,
  };

  violations.forEach((v) => {
    if (counts[v.category] !== undefined) {
      counts[v.category] += 1;
    }
  });

  const total = violations.length || 1;

  return Object.entries(counts).map(([label, value]) => ({
    label,
    value,
    percentage: Math.round((value / total) * 100),
    color: categoryColors[label as ViolationCategory] || '#94a3b8',
  }));
}

export function aggregateByClass(
  violations: ViolationRecord[],
  students: Student[]
): ChartDataPoint[] {
  const studentMap = new Map<string, Student>();
  students.forEach((s) => studentMap.set(s.id, s));

  const classCounts: Record<string, { count: number; totalPoints: number }> = {};

  violations.forEach((v) => {
    const student = studentMap.get(v.studentId);
    const className = student?.class || 'Lainnya';
    if (!classCounts[className]) {
      classCounts[className] = { count: 0, totalPoints: 0 };
    }
    classCounts[className].count += 1;
    classCounts[className].totalPoints += v.points;
  });

  return Object.entries(classCounts)
    .map(([label, data]) => ({
      label,
      value: data.count,
      secondaryValue: data.totalPoints,
    }))
    .sort((a, b) => b.value - a.value);
}

export function aggregateByDateTrend(
  violations: ViolationRecord[],
  days: number = 7
): ChartDataPoint[] {
  // Generate date keys for the past `days`
  const result: ChartDataPoint[] = [];
  const now = new Date();

  for (let i = days - 1; i >= 0; i--) {
    const d = new Date(now);
    d.setDate(d.getDate() - i);
    const dateStr = d.toISOString().split('T')[0];
    const displayLabel = d.toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'short',
    });

    const dayViolations = violations.filter((v) => v.date === dateStr);
    const count = dayViolations.length;
    const points = dayViolations.reduce((sum, v) => sum + v.points, 0);

    result.push({
      label: displayLabel,
      value: count,
      secondaryValue: points,
    });
  }

  return result;
}

export function aggregateByDayOfWeek(violations: ViolationRecord[]): ChartDataPoint[] {
  const dayNames = ['Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];
  const dayIndexMap: Record<number, number> = {
    1: 0, // Monday
    2: 1, // Tuesday
    3: 2, // Wednesday
    4: 3, // Thursday
    5: 4, // Friday
    6: 5, // Saturday
  };

  const counts = [0, 0, 0, 0, 0, 0];
  const points = [0, 0, 0, 0, 0, 0];

  violations.forEach((v) => {
    const d = new Date(v.date);
    const dayOfWeek = d.getDay(); // 0 is Sunday, 1 is Monday...
    const idx = dayIndexMap[dayOfWeek];
    if (idx !== undefined) {
      counts[idx] += 1;
      points[idx] += v.points;
    }
  });

  return dayNames.map((name, index) => ({
    label: name,
    value: counts[index],
    secondaryValue: points[index],
  }));
}

export function getTopRiskStudents(
  violations: ViolationRecord[],
  students: Student[],
  limit: number = 5
) {
  const list = students.map((s) => {
    const status = calculateStudentDisciplinaryStatus(s.id, violations);
    const violationCount = violations.filter((v) => v.studentId === s.id).length;
    return {
      student: s,
      status,
      violationCount,
    };
  });

  return list
    .filter((item) => item.status.netPoints > 0)
    .sort((a, b) => b.status.netPoints - a.status.netPoints)
    .slice(0, limit);
}
