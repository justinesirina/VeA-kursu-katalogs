import { useState } from 'react';
import api from '../../services/axiosConfig';

/**
 * Rediģēšanas forma kursa tēmu sarakstam.
 * POST /api/course-content, PUT /api/course-content/{id}, DELETE /api/course-content/{id}
 *
 * @param {string}   courseInfoId - CourseInfo UUID
 * @param {Array}    data.topics  - [{id, sequenceNumber, title, description}]
 * @param {Function} onSaved
 * @param {Function} onCancel
 */
function CourseTopicsSection({ courseInfoId, data, onSaved, onCancel }) {
    const [rows, setRows] = useState(
        (data.topics || []).map(t => ({
            id: t.id,
            title: t.title ?? '',
            description: t.description ?? '',
            isNew: false,
        }))
    );
    const [deletedIds, setDeletedIds] = useState([]);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState(null);

    const addRow = () => {
        setRows(prev => [...prev, { id: null, title: '', description: '', isNew: true }]);
    };

    const updateRow = (idx, field, value) => {
        setRows(prev => prev.map((r, i) => i === idx ? { ...r, [field]: value } : r));
    };

    const removeRow = (idx) => {
        const row = rows[idx];
        if (!row.isNew && row.id) {
            setDeletedIds(prev => [...prev, row.id]);
        }
        setRows(prev => prev.filter((_, i) => i !== idx));
    };

    const handleSave = async () => {
        if (rows.some(r => !r.title.trim())) {
            setError('Katra tēma prasa nosaukumu.');
            return;
        }
        setSaving(true);
        setError(null);
        try {
            for (const id of deletedIds) {
                await api.delete(`/course-content/${id}`);
            }
            for (let i = 0; i < rows.length; i++) {
                const row = rows[i];
                const payload = {
                    courseInfo: { id: courseInfoId },
                    sequenceNumber: i + 1,
                    topicTitle: row.title.trim(),
                    topicDescription: row.description.trim() || null,
                    language: 'lv',
                };
                if (row.isNew) {
                    await api.post('/course-content', payload);
                } else {
                    await api.put(`/course-content/${row.id}`, payload);
                }
            }
            onSaved();
        } catch (err) {
            setError('Saglabāšana neizdevās. Pārbaudi datus un mēģini vēlreiz.');
        } finally {
            setSaving(false);
        }
    };

    const cellInput = "w-full border border-gray-300 rounded px-2 py-1 focus:border-vea-green focus:ring-1 focus:ring-vea-green outline-none";

    return (
        <div className="space-y-3">
            {error && <p className="text-red-600 text-sm">{error}</p>}

            <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
                <table className="w-full text-sm">
                    <thead className="bg-vea-green-light">
                    <tr>
                        <th scope="col" className="border-b border-gray-200 px-2 py-2 w-10 text-center text-xs font-semibold text-vea-neutral uppercase tracking-wide">Nr.</th>
                        <th scope="col" className="border-b border-gray-200 px-2 py-2 text-xs font-semibold text-vea-neutral uppercase tracking-wide text-left">Tēmas nosaukums <span className="text-red-500">*</span></th>
                        <th scope="col" className="border-b border-gray-200 px-2 py-2 text-xs font-semibold text-vea-neutral uppercase tracking-wide text-left">Apraksts</th>
                        <th scope="col" aria-label="Darbības" className="border-b border-gray-200 px-2 py-2 w-10"></th>
                    </tr>
                    </thead>
                    <tbody>
                    {rows.map((row, idx) => (
                        <tr key={idx} className="border-t border-gray-100">
                            <td className="px-2 py-1 text-center text-gray-500">{idx + 1}</td>
                            <td className="px-1 py-1">
                                <input type="text" value={row.title}
                                    onChange={e => updateRow(idx, 'title', e.target.value)}
                                    className={cellInput} placeholder="Tēmas nosaukums" />
                            </td>
                            <td className="px-1 py-1">
                                <input type="text" value={row.description}
                                    onChange={e => updateRow(idx, 'description', e.target.value)}
                                    className={cellInput} placeholder="(neobligāts)" />
                            </td>
                            <td className="px-2 py-1 text-center">
                                <button onClick={() => removeRow(idx)}
                                        className="text-red-500 hover:text-red-700 text-lg leading-none"
                                        aria-label="Dzēst tēmu">×</button>
                            </td>
                        </tr>
                    ))}
                    </tbody>
                </table>
            </div>

            <button onClick={addRow} className="text-vea-green hover:underline text-sm">
                + Pievienot tēmu
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

export default CourseTopicsSection;
