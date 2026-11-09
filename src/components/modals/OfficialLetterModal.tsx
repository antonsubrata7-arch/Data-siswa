import React, { useRef } from 'react';
import { Student, ViolationRecord, DisciplinaryStatus } from '../../types/discipline';
import { Printer, X, FileText, CheckCircle2 } from 'lucide-react';

interface OfficialLetterModalProps {
  isOpen: boolean;
  onClose: () => void;
  student: Student;
  status: DisciplinaryStatus;
  violations: ViolationRecord[];
}

export const OfficialLetterModal: React.FC<OfficialLetterModalProps> = ({
  isOpen,
  onClose,
  student,
  status,
  violations,
}) => {
  if (!isOpen) return null;

  const studentViolations = violations.filter((v) => v.studentId === student.id);
  const letterRef = useRef<HTMLDivElement>(null);

  const todayStr = new Date().toLocaleDateString('id-ID', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });

  const nextWeekStr = new Date(Date.now() + 3 * 86400000).toLocaleDateString('id-ID', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm overflow-y-auto">
      <div className="relative w-full max-w-3xl bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl overflow-hidden my-6">
        {/* Header toolbar (Hidden in Print) */}
        <div className="no-print flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-950">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 flex items-center justify-center">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white">Surat Resmi Panggilan Orang Tua / Wali</h2>
              <p className="text-xs text-slate-400">
                Format resmi kedinasan sekolah untuk pembinaan BK & Kesiswaan
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="flex items-center gap-1.5 bg-indigo-600 hover:bg-indigo-500 text-white font-medium text-xs px-3.5 py-2 rounded-xl transition-all shadow-md shadow-indigo-600/20"
            >
              <Printer className="w-4 h-4" />
              Cetak / Simpan PDF
            </button>
            <button
              onClick={onClose}
              aria-label="Tutup surat"
              className="p-2 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Letter Body - Clean Formal Indonesian School Letter */}
        <div
          ref={letterRef}
          className="printable-card p-8 bg-white text-slate-900 font-serif leading-relaxed max-h-[80vh] overflow-y-auto select-text text-sm"
        >
          {/* School Header Kop Surat */}
          <div className="text-center border-b-2 border-slate-900 pb-3 mb-6">
            <h4 className="text-xs uppercase font-sans tracking-widest text-slate-700 font-bold">
              PEMERINTAH KOTA PONTIANAK
            </h4>
            <h4 className="text-xs uppercase font-sans tracking-widest text-slate-700 font-bold">
              DINAS PENDIDIKAN DAN KEBUDAYAAN
            </h4>
            <h2 className="text-xl font-bold font-sans uppercase tracking-tight text-slate-900 mt-0.5">
              SMP NEGERI 1 KOTA PONTIANAK
            </h2>
            <p className="text-[11px] font-sans text-slate-600">
              Jl. Jenderal Urip No. 1, Pontianak Kota, Kalimantan Barat 78111 | Telp: (0561) 734567 | Website: smpn1pontianak.sch.id
            </p>
          </div>

          {/* Letter Meta */}
          <div className="flex justify-between items-start text-xs font-sans mb-6">
            <div>
              <table className="text-xs">
                <tbody>
                  <tr>
                    <td className="pr-4 py-0.5 font-semibold text-slate-600">Nomor</td>
                    <td>: 421.3 / 184 / BK-SMPN1-PTK / {new Date().getFullYear()}</td>
                  </tr>
                  <tr>
                    <td className="pr-4 py-0.5 font-semibold text-slate-600">Lampiran</td>
                    <td>: 1 (satu) Berkas Rekapitulasi Pelanggaran</td>
                  </tr>
                  <tr>
                    <td className="pr-4 py-0.5 font-semibold text-slate-600">Perihal</td>
                    <td className="font-bold underline text-slate-900">
                      Surat Panggilan Orang Tua / Wali ({status.level})
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
            <div className="text-right text-xs text-slate-700">
              Pontianak, {todayStr}
            </div>
          </div>

          {/* Recipient */}
          <div className="mb-4 text-xs font-sans">
            <p>Kepada Yth.</p>
            <p className="font-bold text-slate-900">Bapak / Ibu: {student.parentName}</p>
            <p className="text-slate-700">Orang Tua / Wali dari: <strong className="text-slate-900">{student.name}</strong> ({student.class})</p>
            <p className="text-slate-600">Alamat: {student.address}</p>
            <p className="mt-1">Di Tempat</p>
          </div>

          {/* Greeting */}
          <div className="mb-4 text-xs text-justify font-sans leading-relaxed">
            <p className="mb-2">Dengan hormat,</p>
            <p>
              Sehubungan dengan pelaksanaan Tata Tertib dan Ketentuan Kedisiplinan Siswa di SMP Negeri 1 Kota Pontianak, bersama surat ini kami memberitahukan bahwa putra/putri Bapak/Ibu:
            </p>
          </div>

          {/* Student Identitas Box */}
          <div className="bg-slate-50 border border-slate-300 rounded-lg p-3 mb-4 font-sans text-xs">
            <div className="grid grid-cols-2 gap-2">
              <div><span className="text-slate-600">Nama Lengkap:</span> <strong className="text-slate-900">{student.name}</strong></div>
              <div><span className="text-slate-600">NISN / NIS:</span> <strong className="font-mono">{student.nisn} / {student.nis}</strong></div>
              <div><span className="text-slate-600">Kelas:</span> <strong>{student.class}</strong></div>
              <div><span className="text-slate-600">Wali Kelas:</span> <strong>{student.homeroomTeacher}</strong></div>
              <div className="col-span-2 pt-1 border-t border-slate-200 mt-1 flex items-center justify-between">
                <span>Total Akumulasi Poin Pelanggaran:</span>
                <span className="font-bold text-rose-600 text-sm font-mono">
                  {status.netPoints} Poin ({status.level})
                </span>
              </div>
            </div>
          </div>

          {/* Summary of Infractions Table */}
          <div className="mb-4 font-sans text-xs">
            <p className="font-semibold text-slate-800 mb-1.5">
              Rincian Catatan Pelanggaran yang Tercatat:
            </p>
            <table className="w-full border-collapse border border-slate-300 text-[11px]">
              <thead className="bg-slate-100 font-semibold text-slate-700">
                <tr>
                  <th className="border border-slate-300 px-2 py-1 text-center w-8">No</th>
                  <th className="border border-slate-300 px-2 py-1 text-left">Tanggal & Waktu</th>
                  <th className="border border-slate-300 px-2 py-1 text-left">Bentuk Pelanggaran</th>
                  <th className="border border-slate-300 px-2 py-1 text-center w-16">Poin</th>
                  <th className="border border-slate-300 px-2 py-1 text-left">Status Tindak Lanjut</th>
                </tr>
              </thead>
              <tbody>
                {studentViolations.slice(0, 5).map((v, i) => (
                  <tr key={v.id} className="hover:bg-slate-50">
                    <td className="border border-slate-300 px-2 py-1 text-center">{i + 1}</td>
                    <td className="border border-slate-300 px-2 py-1">{v.date} ({v.time})</td>
                    <td className="border border-slate-300 px-2 py-1 font-medium">{v.ruleName}</td>
                    <td className="border border-slate-300 px-2 py-1 text-center font-mono font-bold text-rose-600">
                      +{v.points}
                    </td>
                    <td className="border border-slate-300 px-2 py-1 text-slate-600">{v.status}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Appointment Schedule */}
          <div className="font-sans text-xs text-justify mb-6 leading-relaxed">
            <p className="mb-2">
              Demi kelangsungan pembinaan karakter dan masa depan akademik siswa tersebut, kami mengharap kehadiran Bapak/Ibu orang tua/wali siswa pada:
            </p>
            <div className="ml-6 my-2 space-y-1">
              <p><strong className="w-32 inline-block">Hari / Tanggal</strong>: {nextWeekStr}</p>
              <p><strong className="w-32 inline-block">Waktu</strong>: Pukul 08.30 – 10.30 WIB</p>
              <p><strong className="w-32 inline-block">Tempat</strong>: Ruang Bimbingan & Konseling (BK) SMP Negeri 1 Kota Pontianak</p>
              <p><strong className="w-32 inline-block">Menemui</strong>: Guru BK & Tim Penegak Disiplin Kesiswaan</p>
            </div>
            <p>
              Demikian surat panggilan ini kami sampaikan. Atas kerja sama dan perhatian Bapak/Ibu demi kebaikan putra/putri kita bersama, kami ucapkan terima kasih.
            </p>
          </div>

          {/* Signatures */}
          <div className="grid grid-cols-2 text-center text-xs font-sans mt-8 pt-4">
            <div>
              <p className="text-slate-600">Mengetahui,</p>
              <p className="font-semibold">Koordinator Bimbingan Konseling</p>
              <div className="h-16"></div>
              <p className="font-bold underline text-slate-900">Dra. Hj. Nurjanah, M.Pd.</p>
              <p className="text-slate-600 text-[10px]">NIP. 19740512 199903 2 004</p>
            </div>

            <div>
              <p className="text-slate-600">Wali Kelas,</p>
              <p className="font-semibold">{student.class}</p>
              <div className="h-16"></div>
              <p className="font-bold underline text-slate-900">{student.homeroomTeacher}</p>
              <p className="text-slate-600 text-[10px]">NIP. 19810815 200604 1 008</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
