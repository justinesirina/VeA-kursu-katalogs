import { useState } from 'react';
import api from '../../services/axiosConfig';
import { useToast } from '../ui/ToastProvider';
import StickyBar from '../ui/StickyBar';

function CourseLiteratureSection({ courseInfoId, data, lookups, onSaved, onCancel }) {
    const showToast = useToast();

    const flattenLiterature = () => {
        const rows = [];
        for (const group of (data.literature || [])) {
            for (const src of (group.sources || [])) {
                rows.push({
                    id: src.id, typeId: src.typeId,
                    citation: src.citation ?? '', url: src.url ?? '',
                    language: 'lv', isNew: false,
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

    const addRow = () => {
        setRows(prev => [...prev, { id: null, typeId: '', citation: '', url: '', language: 'lv', isNew: true }]);
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
            if (!r.typeId) e.typeId = true;
            if (r.url && !r.url.startsWith('http')) e.url = true;
            if (Object.keys(e).length > 0) errors[i] = e;
        });
        if (Object.keys(errors).length > 0) {
            setRowErrors(errors);
            const hasUrl = Object.values(errors).some(e => e.url);
            showToast(
                hasUrl
                    ? 'URL jāsākas ar http:// vai https://. Pārbaudi iezīmētos laukus.'
                    : 'Pārbaudi iezīmētos laukus — citāts un veids ir obligāti.',
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
                    language: row.language,
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

    const thClass = "border-b border-gray-200 px-2 py-2 text-xs font-semibold text-vea-neutral uppercase tracking-wide text-left";

    return (
        <div className="space-y-3 pb-20">
            <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
                <table className="w-full text-sm">
                    <thead className="bg-vea-green-light">
                    <tr>
                        <th scope="col" className={`${thClass} w-36`}>Veids <span className="text-red-500">*</span></th>
                        <th scope="col" className={thClass}>Citāts <span className="text-red-500">*</span></th>
                        <th scope="col" className={`${thClass} w-40`}>URL</th>
                        <th scope="col" className={`${thClass} w-20`}>Valoda</th>
                        <th scope="col" aria-label="Darbības" className="border-b border-gray-200 px-2 py-2 w-10"></th>
                    </tr>
                    </thead>
                    <tbody>
                    {rows.map((row, idx) => (
                        <tr key={idx} className="border-t border-gray-100">
                            <td className="px-1 py-1 align-top">
                                <select value={row.typeId}
                                        onChange={e => updateRow(idx, 'typeId', e.target.value)}
                                        className={cellClass(idx, 'typeId')}>
                                    <option value="">— izvēlies —</option>
                                    {(lookups.literatureTypes || []).map(t => (
                                        <option key={t.id} value={t.id}>{t.name}</option>
                                    ))}
                                </select>
                                {rowErrors[idx]?.typeId && (
                                    <p className="text-red-500 text-xs mt-0.5">Veids ir obligāts</p>
                                )}
                            </td>
                            <td className="px-1 py-1 align-top">
                                <textarea value={row.citation} rows={2}
                                          onChange={e => updateRow(idx, 'citation', e.target.value)}
                                          className={cellClass(idx, 'citation')}
                                          placeholder="Autors, nosaukums, gads..." />
                                {rowErrors[idx]?.citation && (
                                    <p className="text-red-500 text-xs mt-0.5">Citāts ir obligāts</p>
                                )}
                            </td>
                            <td className="px-1 py-1 align-top">
                                <input type="text" value={row.url}
                                       onChange={e => updateRow(idx, 'url', e.target.value)}
                                       className={cellClass(idx, 'url')} placeholder="https://..." />
                                {rowErrors[idx]?.url && (
                                    <p className="text-red-500 text-xs mt-0.5">Jāsākas ar http://</p>
                                )}
                            </td>
                            <td className="px-1 py-1 align-top">
                                <select value={row.language}
                                        onChange={e => updateRow(idx, 'language', e.target.value)}
                                        className={cellOk}>
                                    <option value="lv">LV</option>
                                    <option value="en">EN</option>
                                </select>
                            </td>
                            <td className="px-2 py-1 text-center align-top pt-2">
                                <button onClick={() => removeRow(idx)}
                                        className="text-red-500 hover:text-red-700 text-lg leading-none"
                                        aria-label="Dzēst">×</button>
                            </td>
                        </tr>
                    ))}
                    </tbody>
                </table>
            </div>

            <button onClick={addRow} className="text-vea-green hover:underline text-sm">
                + Pievienot avotu
            </button>

            <StickyBar>
                <button onClick={onCancel}
                    className="bg-white border border-gray-300 px-4 py-2 rounded hover:bg-gray-100 text-vea-neutral text-sm">
                    Atcelt
                </button>
                <button onClick={handleSave} disabled={saving}
                    className="bg-vea-green text-white px-4 py-2 rounded hover:bg-vea-green-dark disabled:opacity-50 text-sm">
                    {saving ? 'Saglabā...' : 'Saglabāt'}
                </button>
            </StickyBar>
        </div>
    );
}

export default CourseLiteratureSection;
