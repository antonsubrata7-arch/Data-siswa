export type ViolationCategory =
  | 'Kerapian & Atribut'
  | 'Kedisiplinan & Waktu'
  | 'Sikap & Perilaku'
  | 'Ketertiban Belajar'
  | 'Pelanggaran Berat';

export type SeverityLevel = 'Ringan' | 'Sedang' | 'Berat';

export type FollowUpStatus =
  | 'Menunggu'
  | 'Konseling BK'
  | 'Panggilan Ortu'
  | 'Sanksi Dijalankan'
  | 'Selesai';

export interface Student {
  id: string;
  nisn: string;
  nis: string;
  name: string;
  class: string;
  gender: 'L' | 'P';
  parentName: string;
  phoneParent: string;
  address: string;
  homeroomTeacher: string;
}

export interface ViolationRule {
  id: string;
  code: string;
  category: ViolationCategory;
  name: string;
  points: number;
  severity: SeverityLevel;
  defaultAction: string;
}

export interface ViolationRecord {
  id: string;
  studentId: string;
  ruleId: string;
  category: ViolationCategory;
  ruleName: string;
  date: string; // YYYY-MM-DD
  time: string; // HH:mm
  points: number;
  reporterName: string;
  location: string;
  description: string;
  evidenceNote?: string;
  status: FollowUpStatus;
  restitutionPoints: number; // point deduction / restored via positive acts
  restitutionNotes?: string;
  createdAt: string;
}

export interface DisciplinaryStatus {
  totalGrossPoints: number;
  totalRestitution: number;
  netPoints: number;
  level: 'Aman' | 'Peringatan' | 'SP 1' | 'SP 2' | 'SP 3 / Konferensi Kasus';
  color: string;
  badgeBg: string;
  actionRequired: string;
}

export interface ChartDataPoint {
  label: string;
  value: number;
  secondaryValue?: number;
  percentage?: number;
  color?: string;
}
