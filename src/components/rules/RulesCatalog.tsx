import React, { useState } from 'react';
import { ViolationRule, ViolationCategory, SeverityLevel } from '../../types/discipline';
import { BookOpen, PlusCircle, Search, ShieldAlert, Award, X, Check } from 'lucide-react';

interface RulesCatalogProps {
  rules: ViolationRule[];
  onAddRule: (rule: ViolationRule) => void;
}

export const RulesCatalog: React.FC<RulesCatalogProps> = ({ rules, onAddRule }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [isAddRuleOpen, setIsAddRuleOpen] = useState(false);

  // New Rule form state
  const [code, setCode] = useState('');
  const [category, setCategory] = useState<ViolationCategory>('Kedisiplinan & Waktu');
  const [name, setName] = useState('');
  const [points, setPoints] = useState<number>(10);
  const [severity, setSeverity] = useState<SeverityLevel>('Sedang');
  const [defaultAction, setDefaultAction] = useState('');

  const filteredRules = rules.filter((r) => {
    const matchesSearch =
      r.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.defaultAction.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'ALL' || r.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const handleCreateRule = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    onAddRule({
      id: `rule-${Date.now()}`,
      code: code.trim() || `TTR-${Math.floor(10 + Math.random() * 90)}`,
      category,
      name: name.trim(),
      points: Number(points),
      severity,
      defaultAction: defaultAction.trim() || 'Pembinaan bimbingan konseling dan pencatatan',
    });

    setIsAddRuleOpen(false);
    setCode('');
    setName('');
    setDefaultAction('');
    setPoints(10);
  };

  const getSeverityBadge = (s: SeverityLevel) => {
    switch (s) {
      case 'Ringan':
        return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20';
      case 'Sedang':
        return 'bg-amber-500/10 text-amber-400 border-amber-500/20';
      case 'Berat':
        return 'bg-rose-500/10 text-rose-400 border-rose-500/20';
    }
  };

  return (
    <div className="space-y-4">
      {/* Header & Filter */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-900/90 border border-slate-800 p-4 rounded-2xl shadow-xl backdrop-blur-sm">
        <div className="flex flex-1 items-center gap-3">
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Cari pasal, nama aturan, atau sanksi..."
              className="w-full bg-slate-800/90 border border-slate-700 rounded-xl pl-9 pr-3 py-2 text-xs text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            <option value="ALL">Semua Kategori</option>
            <option value="Kerapian & Atribut">Kerapian & Atribut</option>
            <option value="Kedisiplinan & Waktu">Kedisiplinan & Waktu</option>
            <option value="Sikap & Perilaku">Sikap & Perilaku</option>
            <option value="Ketertiban Belajar">Ketertiban Belajar</option>
            <option value="Pelanggaran Berat">Pelanggaran Berat</option>
          </select>
        </div>

        <button
          onClick={() => setIsAddRuleOpen(true)}
          className="flex items-center gap-2 bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white font-semibold text-xs px-4 py-2.5 rounded-xl shadow-lg shadow-indigo-600/20 transition-all cursor-pointer self-start sm:self-auto"
        >
          <PlusCircle className="w-4 h-4" />
          Tambah Aturan Tata Tertib
        </button>
      </div>

      {/* Rules Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredRules.map((rule) => (
          <div
            key={rule.id}
            className="rounded-2xl border border-slate-800 bg-slate-900/90 p-5 shadow-xl hover:border-slate-700 transition-all backdrop-blur-sm flex flex-col justify-between"
          >
            <div>
              <div className="flex items-start justify-between gap-2 pb-2">
                <span className="font-mono text-xs font-bold text-indigo-400 bg-indigo-500/10 px-2 py-0.5 rounded border border-indigo-500/20">
                  {rule.code}
                </span>
                <span
                  className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${getSeverityBadge(
                    rule.severity
                  )}`}
                >
                  {rule.severity}
                </span>
              </div>

              <h4 className="text-sm font-bold text-slate-100 mt-2 mb-1 leading-snug">
                {rule.name}
              </h4>
              <span className="inline-block text-[11px] text-slate-400 mb-3">
                Kategori: {rule.category}
              </span>

              <div className="bg-slate-800/40 rounded-xl p-3 border border-slate-800 text-xs space-y-1">
                <div className="text-slate-400 text-[11px] font-semibold">
                  Sanksi & Tindak Lanjut Standar:
                </div>
                <div className="text-slate-200">{rule.defaultAction}</div>
              </div>
            </div>

            <div className="pt-4 mt-3 border-t border-slate-800 flex items-center justify-between">
              <span className="text-xs text-slate-400">Poin Pelanggaran:</span>
              <span className="font-mono font-bold text-base text-rose-400 bg-rose-500/10 px-2.5 py-0.5 rounded-lg border border-rose-500/20">
                +{rule.points} Pts
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* Add Rule Modal */}
      {isAddRuleOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm">
          <div className="relative w-full max-w-lg bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl overflow-hidden">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-950">
              <div className="flex items-center gap-2.5">
                <BookOpen className="w-5 h-5 text-indigo-400" />
                <h3 className="text-base font-bold text-white">Tambah Aturan Tata Tertib</h3>
              </div>
              <button
                onClick={() => setIsAddRuleOpen(false)}
                className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateRule} className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Kode Pasal / Aturan
                  </label>
                  <input
                    type="text"
                    value={code}
                    onChange={(e) => setCode(e.target.value)}
                    placeholder="Contoh: KRP-05"
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 font-mono"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Kategori Pelanggaran
                  </label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value as ViolationCategory)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-2 py-2 text-xs text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  >
                    <option value="Kerapian & Atribut">Kerapian & Atribut</option>
                    <option value="Kedisiplinan & Waktu">Kedisiplinan & Waktu</option>
                    <option value="Sikap & Perilaku">Sikap & Perilaku</option>
                    <option value="Ketertiban Belajar">Ketertiban Belajar</option>
                    <option value="Pelanggaran Berat">Pelanggaran Berat</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Nama / Bunyi Aturan Pelanggaran *
                </label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Contoh: Terlambat masuk setelah istirahat"
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Bobot Poin *
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="100"
                    required
                    value={points}
                    onChange={(e) => setPoints(Number(e.target.value))}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 font-mono"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Tingkat Keparahan
                  </label>
                  <select
                    value={severity}
                    onChange={(e) => setSeverity(e.target.value as SeverityLevel)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-2 py-2 text-xs text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  >
                    <option value="Ringan">Ringan</option>
                    <option value="Sedang">Sedang</option>
                    <option value="Berat">Berat</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Sanksi & Tindak Lanjut Standar
                </label>
                <textarea
                  rows={2}
                  value={defaultAction}
                  onChange={(e) => setDefaultAction(e.target.value)}
                  placeholder="Contoh: Pembinaan oleh guru piket dan teguran tertulis"
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl p-3 text-xs text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsAddRuleOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-medium text-slate-400 hover:text-white hover:bg-slate-800"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold px-4 py-2 rounded-xl text-xs shadow-md shadow-indigo-600/20"
                >
                  <Check className="w-4 h-4" />
                  Simpan Aturan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
