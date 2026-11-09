import test from 'node:test';
import assert from 'node:assert/strict';
import {
  getDisciplinaryLevel,
  calculateStudentDisciplinaryStatus,
  aggregateByCategory,
  aggregateByDayOfWeek,
  aggregateByClass,
} from './disciplineLogic';
import { Student, ViolationRecord } from '../types/discipline';

test('getDisciplinaryLevel returns correct tiers and status', () => {
  assert.equal(getDisciplinaryLevel(0).level, 'Aman');
  assert.equal(getDisciplinaryLevel(20).level, 'Aman');
  assert.equal(getDisciplinaryLevel(25).level, 'Peringatan');
  assert.equal(getDisciplinaryLevel(49).level, 'Peringatan');
  assert.equal(getDisciplinaryLevel(50).level, 'SP 1');
  assert.equal(getDisciplinaryLevel(74).level, 'SP 1');
  assert.equal(getDisciplinaryLevel(75).level, 'SP 2');
  assert.equal(getDisciplinaryLevel(99).level, 'SP 2');
  assert.equal(getDisciplinaryLevel(100).level, 'SP 3 / Konferensi Kasus');
  assert.equal(getDisciplinaryLevel(150).level, 'SP 3 / Konferensi Kasus');
});

test('calculateStudentDisciplinaryStatus calculates net points with restitution', () => {
  const dummyViolations: ViolationRecord[] = [
    {
      id: 'v1',
      studentId: 's1',
      ruleId: 'r1',
      category: 'Kedisiplinan & Waktu',
      ruleName: 'Terlambat',
      date: '2026-11-01',
      time: '07:15',
      points: 20,
      reporterName: 'Pak Guru',
      location: 'Gerbang',
      description: 'Terlambat 15 menit',
      status: 'Selesai',
      restitutionPoints: 5,
      createdAt: '2026-11-01T07:15:00Z',
    },
    {
      id: 'v2',
      studentId: 's1',
      ruleId: 'r2',
      category: 'Kerapian & Atribut',
      ruleName: 'Sepatu Bukan Hitam',
      date: '2026-11-02',
      time: '07:30',
      points: 15,
      reporterName: 'Bu Guru',
      location: 'Kelas',
      description: 'Sepatu merah terang',
      status: 'Menunggu',
      restitutionPoints: 0,
      createdAt: '2026-11-02T07:30:00Z',
    },
  ];

  const status = calculateStudentDisciplinaryStatus('s1', dummyViolations);
  assert.equal(status.totalGrossPoints, 35);
  assert.equal(status.totalRestitution, 5);
  assert.equal(status.netPoints, 30);
  assert.equal(status.level, 'Peringatan');
});

test('aggregateByCategory groups violations properly', () => {
  const dummyViolations: ViolationRecord[] = [
    {
      id: 'v1',
      studentId: 's1',
      ruleId: 'r1',
      category: 'Kerapian & Atribut',
      ruleName: 'Seragam',
      date: '2026-11-01',
      time: '07:00',
      points: 5,
      reporterName: 'Guru',
      location: 'Gerbang',
      description: 'Tidak memakai dasi',
      status: 'Selesai',
      restitutionPoints: 0,
      createdAt: '2026-11-01T07:00:00Z',
    },
    {
      id: 'v2',
      studentId: 's2',
      ruleId: 'r2',
      category: 'Kerapian & Atribut',
      ruleName: 'Seragam',
      date: '2026-11-02',
      time: '07:00',
      points: 5,
      reporterName: 'Guru',
      location: 'Gerbang',
      description: 'Baju dikeluarkan',
      status: 'Selesai',
      restitutionPoints: 0,
      createdAt: '2026-11-02T07:00:00Z',
    },
    {
      id: 'v3',
      studentId: 's3',
      ruleId: 'r3',
      category: 'Kedisiplinan & Waktu',
      ruleName: 'Terlambat',
      date: '2026-11-02',
      time: '07:20',
      points: 10,
      reporterName: 'Guru',
      location: 'Gerbang',
      description: 'Terlambat 20 menit',
      status: 'Selesai',
      restitutionPoints: 0,
      createdAt: '2026-11-02T07:20:00Z',
    },
  ];

  const aggregated = aggregateByCategory(dummyViolations);
  const kerapian = aggregated.find((a) => a.label === 'Kerapian & Atribut');
  const disiplin = aggregated.find((a) => a.label === 'Kedisiplinan & Waktu');

  assert.equal(kerapian?.value, 2);
  assert.equal(disiplin?.value, 1);
});

test('aggregateByClass correctly maps student classes and counts', () => {
  const students: Student[] = [
    {
      id: 's1',
      nisn: '001',
      nis: '101',
      name: 'Budi',
      class: 'XII MIPA 1',
      gender: 'L',
      parentName: 'Ayah Budi',
      phoneParent: '0812345678',
      address: 'Jl. Merdeka',
      homeroomTeacher: 'Dra. Siti',
    },
    {
      id: 's2',
      nisn: '002',
      nis: '102',
      name: 'Dewi',
      class: 'XI IPS 2',
      gender: 'P',
      parentName: 'Ibu Dewi',
      phoneParent: '0812345679',
      address: 'Jl. Melati',
      homeroomTeacher: 'Drs. Joko',
    },
  ];

  const violations: ViolationRecord[] = [
    {
      id: 'v1',
      studentId: 's1',
      ruleId: 'r1',
      category: 'Kedisiplinan & Waktu',
      ruleName: 'Terlambat',
      date: '2026-11-01',
      time: '07:15',
      points: 10,
      reporterName: 'Guru',
      location: 'Gerbang',
      description: 'Terlambat',
      status: 'Selesai',
      restitutionPoints: 0,
      createdAt: '2026-11-01T07:15:00Z',
    },
    {
      id: 'v2',
      studentId: 's1',
      ruleId: 'r2',
      category: 'Kedisiplinan & Waktu',
      ruleName: 'Bolos',
      date: '2026-11-02',
      time: '10:00',
      points: 20,
      reporterName: 'Guru',
      location: 'Kantin',
      description: 'Bolos jam ke 3',
      status: 'Selesai',
      restitutionPoints: 0,
      createdAt: '2026-11-02T10:00:00Z',
    },
  ];

  const classData = aggregateByClass(violations, students);
  const mipa1 = classData.find((c) => c.label === 'XII MIPA 1');

  assert.equal(mipa1?.value, 2);
  assert.equal(mipa1?.secondaryValue, 30);
});
