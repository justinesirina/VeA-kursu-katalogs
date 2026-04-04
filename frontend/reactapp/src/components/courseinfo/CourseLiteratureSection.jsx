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
    // Flatten grouped literature into a flat row list
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

    return (
        <div className="space-y-3">
            {error && <p className="text-red-600 text-sm">{error}</p>}

            <table className="w-full text-sm border border-gray-200">
                <thead className="bg-gray-50">
                <tr>
                    <th className="border border-gray-200 px-2 py-1 w-36">Veids</th>
                    <th className="border border-gray-200 px-2 py-1">Citāts <span className="text-red-500">*</span></th>
                    <th className="border border-gray-200 px-2 py-1 w-40">URL</th>
                    <th className="border border-gray-200 px-2 py-1 w-20">Valoda</th>
                    <th className="border border-gray-200 px-2 py-1 w-10"></th>
                </tr>
                </thead>
                <tbody>
                {rows.map((row, idx) => (
                    <tr key={idx}>
                        <td className="border border-gray-200 px-1 py-1">
                            <select value={row.typeId}
                                    onChange={e => updateRow(idx, 'typeId', e.target.value)}
                                    className="w-full border rounded px-1 py-1 text-sm">
                                <option value="">— izvēlies —</option>
                                {(lookups.literatureTypes || []).map(t => (
                                    <option key={t.id} value={t.id}>{t.name}</option>
                                ))}
                            </select>
                        </td>
                        <td className="border border-gray-200 px-1 py-1">
                            <textarea value={row.citation} rows={2}
                                      onChange={e => updateRow(idx, 'citation', e.target.value)}
                                      className="w-full border rounded px-2 py-1 text-sm"
                                      placeholder="Autors, nosaukums, gads..." />
                        </td>
                        <td className="border border-gray-200 px-1 py-1">
                            <input type="text" value={row.url}
                                   onChange={e => updateRow(idx, 'url', e.target.value)}
                                   className="w-full border rounded px-2 py-1 text-sm"
                                   placeholder="https://..." />
                        </td>
                        <td className="border border-gray-200 px-1 py-1">
                            <select value={row.language}
                                    onChange={e => updateRow(idx, 'language', e.target.value)}
                                    className="w-full border rounded px-1 py-1 text-sm">
                                <option value="lv">LV</option>
                                <option value="en">EN</option>
                            </select>
                        </td>
                        <td className="border border-gray-200 px-2 py-1 text-center">
                            <button onClick={() => removeRow(idx)}
                                    className="text-red-500 hover:text-red-700 text-lg leading-none">×</button>
                        </td>
                    </tr>
                ))}
                </tbody>
            </table>

            <button onClick={addRow} className="text-blue-600 hover:underline text-sm">
                + Pievienot avotu
            </button>

            <div className="flex gap-2">
                <button onClick={handleSave} disabled={saving}
                        className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 disabled:opacity-50">
                    {saving ? 'Saglabā...' : 'Saglabāt'}
                </button>
                <button onClick={onCancel}
                        className="border border-gray-400 px-4 py-2 rounded hover:bg-gray-100">
                    Atcelt
                </button>
            </div>
        </div>
    );
}

export default CourseLiteratureSection;
