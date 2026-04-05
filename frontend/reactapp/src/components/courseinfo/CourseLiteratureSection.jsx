import { useState } from 'react';
import api from '../../services/axiosConfig';

/**
 * Rediģēšanas forma literatūras avotiem.
 * POST /api/literature-sources, PUT /api/literature-sources/{id}, DELETE /api/literature-sources/{id}
 *
 * @param {string}  courseInfoId
 * @param {object}  data         - { literature: [{type, sources: [{id, typeId, citation, url}]}] }
 * @param {object}  lookups      - { literatureTypes: [{id, name}] }
 * @param {Function} onSaved
 * @param {Function} onCancel
 */
function CourseLiteratureSection({ courseInfoId, data, lookups, onSaved, onCancel }) {
    const flattenLiterature = () => {
        const rows = [];
        for (const group of (data.literature || [])) {
            for (const src of (group.sources || [])) {
                rows.push({
                    id: src.id,
                    typeId: src.typeId,
                    citation: src.citation ?? '',
                    url: src.url ?? '',
                    language: 'lv',
                    isNew: false,
                });
            }
        }
        return rows;
    };

    const [rows, setRows] = useState(flattenLiterature);
    const [deletedIds, setDeletedIds] = useState([]);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState(null);

    const cellInput = "w-full border border-gray-300 rounded px-2 py-1 text-sm focus:border-vea-green focus:ring-1 focus:ring-vea-green outline-none";

    const addRow = () => {
        setRows(prev => [...prev, { id: null, typeId: '', citation: '', url: '', language: 'lv', isNew: true }]);
    };

    const updateRow = (idx, field, value) => {
        setRows(prev => prev.map((r, i) => i === idx ? { ...r, [field]: value } : r));
    };

    const removeRow = (idx) => {
        const row = rows[idx];
        if (!row.isNew && row.id) setDeletedIds(prev => [...prev, row.id]);
        setRows(prev => prev.filter((_, i) => i !== idx));
    };

    const handleSave = async () => {
        if (rows.some(r => !r.citation.trim())) {
            setError('Katram literatūras avotam jābūt citātam.');
            return;
        }
        if (rows.some(r => !r.typeId)) {
            setError('Katram literatūras avotam jānorāda veids.');
            return;
        }
        if (rows.some(r => r.url && !r.url.startsWith('http'))) {
            setError('URL jāsākas ar http:// vai https://');
            return;
        }
        setSaving(true);
        setError(null);
        try {
            for (const id of deletedIds) {
                await api.delete(`/literature-sources/${id}`);
            }
            for (const row of rows) {
                const payload = {
                    courseInfo: { id: courseInfoId },
                    type: { id: Number(row.typeId) },
                    citation: row.citation.trim(),
                    url: row.url.trim() || null,
                    language: row.language,
                };
                if (row.isNew) {
                    await api.post('/literature-sources', payload);
                } else {
                    await api.put(`/literature-sources/${row.id}`, payload);
                }
            }
            onSaved();
        } catch (err) {
            setError('Saglabāšana neizdevās. Pārbaudi datus un mēģini vēlreiz.');
        } finally {
            setSaving(false);
        }
    };

    const thClass = "border-b border-gray-200 px-2 py-2 text-xs font-semibold text-vea-neutral uppercase tracking-wide text-left";

    return (
        <div className="space-y-3">
            {error && <p className="text-red-600 text-sm">{error}</p>}

            <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
                <table className="w-full text-sm">
                    <thead className="bg-vea-green-light">
                    <tr>
                        <th scope="col" className={`${thClass} w-36`}>Veids</th>
                        <th scope="col" className={thClass}>Citāts <span className="text-red-500">*</span></th>
                        <th scope="col" className={`${thClass} w-40`}>URL</th>
                        <th scope="col" className={`${thClass} w-20`}>Valoda</th>
                        <th scope="col" aria-label="Darbības" className="border-b border-gray-200 px-2 py-2 w-10"></th>
                    </tr>
                    </thead>
                    <tbody>
                    {rows.map((row, idx) => (
                        <tr key={idx} className="border-t border-gray-100">
                            <td className="px-1 py-1">
                                <select value={row.typeId}
                                        onChange={e => updateRow(idx, 'typeId', e.target.value)}
                                        className={cellInput}>
                                    <option value="">— izvēlies —</option>
                                    {(lookups.literatureTypes || []).map(t => (
                                        <option key={t.id} value={t.id}>{t.name}</option>
                                    ))}
                                </select>
                            </td>
                            <td className="px-1 py-1">
                                <textarea value={row.citation} rows={2}
                                          onChange={e => updateRow(idx, 'citation', e.target.value)}
                                          className={cellInput}
                                          placeholder="Autors, nosaukums, gads..." />
                            </td>
                            <td className="px-1 py-1">
                                <input type="text" value={row.url}
                                       onChange={e => updateRow(idx, 'url', e.target.value)}
                                       className={cellInput} placeholder="https://..." />
                            </td>
                            <td className="px-1 py-1">
                                <select value={row.language}
                                        onChange={e => updateRow(idx, 'language', e.target.value)}
                                        className={cellInput}>
                                    <option value="lv">LV</option>
                                    <option value="en">EN</option>
                                </select>
                            </td>
                            <td className="px-2 py-1 text-center">
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

            <div className="flex gap-2">
                <button onClick={handleSave} disabled={saving}
                    className="bg-vea-green text-white px-4 py-2 rounded hover:bg-vea-green-dark disabled:opacity-50">
                    {saving ? 'Saglabā...' : 'Saglabāt'}
                </button>
                <button onClick={onCancel}
                    className="border border-gray-300 px-4 py-2 rounded hover:bg-gray-100 text-vea-neutral">
                    Atcelt
                </button>
            </div>
        </div>
    );
}

export default CourseLiteratureSection;
