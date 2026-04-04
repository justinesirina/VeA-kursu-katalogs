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

    return (
        <div className="space-y-3">
            {error && <p className="text-red-600 text-sm">{error}</p>}

            <table className="w-full text-sm border border-gray-200">
                <thead className="bg-gray-50">
                <tr>
                    <th className="border border-gray-200 px-2 py-1 w-10 text-center">Nr.</th>
                    <th className="border border-gray-200 px-2 py-1">Tēmas nosaukums <span className="text-red-500">*</span></th>
                    <th className="border border-gray-200 px-2 py-1">Apraksts</th>
                    <th className="border border-gray-200 px-2 py-1 w-10"></th>
                </tr>
                </thead>
                <tbody>
                {rows.map((row, idx) => (
                    <tr key={idx}>
                        <td className="border border-gray-200 px-2 py-1 text-center text-gray-500">{idx + 1}</td>
                        <td className="border border-gray-200 px-1 py-1">
                            <input
                                type="text" value={row.title}
                                onChange={e => updateRow(idx, 'title', e.target.value)}
                                className="w-full border rounded px-2 py-1"
                                placeholder="Tēmas nosaukums"
                            />
                        </td>
                        <td className="border border-gray-200 px-1 py-1">
                            <input
                                type="text" value={row.description}
                                onChange={e => updateRow(idx, 'description', e.target.value)}
                                className="w-full border rounded px-2 py-1"
                                placeholder="(neobligāts)"
                            />
                        </td>
                        <td className="border border-gray-200 px-2 py-1 text-center">
                            <button onClick={() => removeRow(idx)}
                                    className="text-red-500 hover:text-red-700 text-lg leading-none"
                                    title="Dzēst">×</button>
                        </td>
                    </tr>
                ))}
                </tbody>
            </table>

            <button onClick={addRow}
                    className="text-blue-600 hover:underline text-sm">
                + Pievienot tēmu
            </button>

            <div className="flex gap-2">
                <button
                    onClick={handleSave} disabled={saving}
                    className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 disabled:opacity-50"
                >
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

export default CourseTopicsSection;
