import { useState } from 'react';
import api from '../../services/axiosConfig';
import { useToast } from '../ui/ToastProvider';
import StickyBar from '../ui/StickyBar';

const TYPE_ORDER = ['Pamatliteratūra', 'Papildliteratūra', 'Citi avoti'];

function CourseLiteratureSection({ courseInfoId, data, lookups, onSaved, onCancel }) {
    const showToast = useToast();

    const flattenLiterature = () => {
        const rows = [];
        for (const group of (data.literature || [])) {
            for (const src of (group.sources || [])) {
                rows.push({
                    id: src.id, typeId: src.typeId,
                    citation: src.citation ?? '', url: src.url ?? '',
                    language: src.language ?? '', isNew: false,
                });
            }
        }
        return rows;
    };

    const [rows, setRows] = useState(flattenLiterature);
    const [deletedIds, setDeletedIds] = useState([]);
    const [saving, setSaving] = useState(false);
    const [rowErrors, setRowErrors] = useState({});

    const cellBase = "w-full border rounded px-2 py-1 text-sm focus:ring-1 outline-none";
    const cellOk  = `${cellBase} border-gray-300 focus:border-vea-green focus:ring-vea-green`;
    const cellErr = `${cellBase} border-red-500 bg-red-50 focus:border-red-500 focus:ring-red-300`;
    const cellClass = (idx, field) => rowErrors[idx]?.[field] ? cellErr : cellOk;

    const addRow = (typeId) => {
        setRows(prev => [...prev, { id: null, typeId, citation: '', url: '', language: '', isNew: true }]);
    };

    const updateRow = (idx, field, value) => {
        setRows(prev => prev.map((r, i) => i === idx ? { ...r, [field]: value } : r));
        if (rowErrors[idx]?.[field]) {
            setRowErrors(prev => {
                const n = { ...prev };
                if (n[idx]) { n[idx] = { ...n[idx] }; delete n[idx][field]; }
                return n;
            });
        }
    };

    const removeRow = (idx) => {
        const row = rows[idx];
        if (!row.isNew && row.id) setDeletedIds(prev => [...prev, row.id]);
        setRows(prev => prev.filter((_, i) => i !== idx));
        setRowErrors(prev => {
            const n = {};
            Object.entries(prev).forEach(([k, v]) => {
                const ki = Number(k);
                if (ki < idx) n[ki] = v;
                else if (ki > idx) n[ki - 1] = v;
            });
            return n;
        });
    };

    const handleSave = async () => {
        const errors = {};
        rows.forEach((r, i) => {
            const e = {};
            if (!r.citation.trim()) e.citation = true;
            if (r.url && !r.url.startsWith('http')) e.url = true;
            if (Object.keys(e).length > 0) errors[i] = e;
        });
        if (Object.keys(errors).length > 0) {
            setRowErrors(errors);
            const hasUrl = Object.values(errors).some(e => e.url);
            showToast(
                hasUrl
                    ? 'URL jāsākas ar http:// vai https://. Pārbaudi iezīmētos laukus.'
                    : 'Pārbaudi iezīmētos laukus — nosaukums ir obligāts.',
                'error'
            );
            return;
        }
        setRowErrors({});
        setSaving(true);
        try {
            for (const id of deletedIds) await api.delete(`/literature-sources/${id}`);
            for (const row of rows) {
                const payload = {
                    courseInfo: { id: courseInfoId },
                    type: { id: Number(row.typeId) },
                    citation: row.citation.trim(),
                    url: row.url.trim() || null,
                    language: row.language || null,
                };
                if (row.isNew) await api.post('/literature-sources', payload);
                else await api.put(`/literature-sources/${row.id}`, payload);
            }
            showToast('Literatūra saglabāta veiksmīgi!');
            onSaved();
        } catch {
            showToast('Saglabāšana neizdevās. Pārbaudi datus un mēģini vēlreiz.', 'error');
        } finally {
            setSaving(false);
        }
    };

    const sortedTypes = [...(lookups.literatureTypes || [])]
        .sort((a, b) => TYPE_ORDER.indexOf(a.name) - TYPE_ORDER.indexOf(b.name));


    return (
        <div className="space-y-4 pb-20">
            {sortedTypes.map(type => {
                const typeRows = rows
                    .map((r, globalIdx) => ({ ...r, globalIdx }))
                    .filter(r => String(r.typeId) === String(type.id));

                return (
                    <div key={type.id} className="space-y-2">
                        <h3 className="text-xl font-semibold font-heading text-vea-neutral">{type.name}</h3>

                        {/* Desktop: tabulas skats */}
                        <div className="hidden md:block vea-table-wrap">
                            <table className="vea-table">
                                <thead>
                                <tr>
                                    <th scope="col">
                                        Nosaukums <span className="text-red-500">*</span>
                                    </th>
                                    <th scope="col" className="w-44">URL</th>
                                    <th scope="col" className="w-20">Valoda</th>
                                    <th scope="col" aria-label="Darbības" className="w-10"></th>
                                </tr>
                                </thead>
                                <tbody>
                                {typeRows.map(({ globalIdx, ...row }) => (
                                    <tr key={globalIdx} className="border-t border-gray-100">
                                        <td className="px-2 py-1 align-top">
                                            <textarea
                                                value={row.citation}
                                                rows={2}
                                                onChange={e => updateRow(globalIdx, 'citation', e.target.value)}
                                                className={cellClass(globalIdx, 'citation')}
                                                placeholder="Autors, nosaukums, gads..."
                                            />
                                            {rowErrors[globalIdx]?.citation && (
                                                <p className="text-red-500 text-sm mt-0.5">Nosaukums ir obligāts</p>
                                            )}
                                        </td>
                                        <td className="px-2 py-1 align-top">
                                            <input
                                                type="text"
                                                value={row.url}
                                                onChange={e => updateRow(globalIdx, 'url', e.target.value)}
                                                className={cellClass(globalIdx, 'url')}
                                                placeholder="https://..."
                                            />
                                            {rowErrors[globalIdx]?.url && (
                                                <p className="text-red-500 text-sm mt-0.5">Jāsākas ar http://</p>
                                            )}
                                        </td>
                                        <td className="px-2 py-1 align-top">
                                            <select
                                                value={row.language}
                                                onChange={e => updateRow(globalIdx, 'language', e.target.value)}
                                                className={cellOk}
                                            >
                                                <option value="">—</option>
                                                <option value="lv">LV</option>
                                                <option value="en">EN</option>
                                            </select>
                                        </td>
                                        <td className="px-2 py-1 text-center align-top pt-2">
                                            <button
                                                onClick={() => removeRow(globalIdx)}
                                                className="text-red-500 hover:text-red-700 text-lg leading-none"
                                                aria-label="Dzēst"
                                            >×</button>
                                        </td>
                                    </tr>
                                ))}
                                </tbody>
                            </table>
                        </div>

                        {/* Mobilā: katrs avots kā kartīte ar pilna platuma laukiem */}
                        <div className="md:hidden space-y-3">
                            {typeRows.map(({ globalIdx, ...row }) => (
                                <div key={globalIdx} className="border border-gray-200 rounded-lg p-3 bg-white shadow-sm">
                                    <label className="block text-xs font-medium text-vea-neutral mb-1">
                                        Nosaukums <span className="text-red-500">*</span>
                                    </label>
                                    <textarea
                                        value={row.citation}
                                        rows={3}
                                        onChange={e => updateRow(globalIdx, 'citation', e.target.value)}
                                        className={cellClass(globalIdx, 'citation')}
                                        placeholder="Autors, nosaukums, gads..."
                                    />
                                    {rowErrors[globalIdx]?.citation && (
                                        <p className="text-red-500 text-sm mt-0.5">Nosaukums ir obligāts</p>
                                    )}

                                    <label className="block text-xs font-medium text-vea-neutral mb-1 mt-3">URL</label>
                                    <input
                                        type="text"
                                        value={row.url}
                                        onChange={e => updateRow(globalIdx, 'url', e.target.value)}
                                        className={cellClass(globalIdx, 'url')}
                                        placeholder="https://..."
                                    />
                                    {rowErrors[globalIdx]?.url && (
                                        <p className="text-red-500 text-sm mt-0.5">Jāsākas ar http://</p>
                                    )}

                                    <div className="mt-3 flex items-end gap-3">
                                        <div className="flex-1">
                                            <label className="block text-xs font-medium text-vea-neutral mb-1">Valoda</label>
                                            <select
                                                value={row.language}
                                                onChange={e => updateRow(globalIdx, 'language', e.target.value)}
                                                className={cellOk}
                                            >
                                                <option value="">—</option>
                                                <option value="lv">LV</option>
                                                <option value="en">EN</option>
                                            </select>
                                        </div>
                                        <button
                                            onClick={() => removeRow(globalIdx)}
                                            className="shrink-0 text-red-600 hover:bg-red-50 rounded px-3 py-2 text-sm border border-red-200"
                                            aria-label="Dzēst avotu"
                                        >✕ Dzēst</button>
                                    </div>
                                </div>
                            ))}
                        </div>

                        <button
                            onClick={() => addRow(type.id)}
                            className="text-vea-green hover:underline text-sm"
                        >
                            + Pievienot avotu
                        </button>
                    </div>
                );
            })}

            <StickyBar>
                <button
                    onClick={onCancel}
                    className="bg-white border border-gray-300 px-4 py-2 rounded hover:bg-gray-100 text-vea-neutral text-sm"
                >
                    Atcelt
                </button>
                <button
                    onClick={handleSave}
                    disabled={saving}
                    className="bg-vea-green text-white px-4 py-2 rounded hover:bg-vea-green-dark disabled:opacity-50 text-sm"
                >
                    {saving ? 'Saglabā...' : 'Saglabāt'}
                </button>
            </StickyBar>
        </div>
    );
}

export default CourseLiteratureSection;
