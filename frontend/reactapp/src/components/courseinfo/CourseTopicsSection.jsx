import { useState } from 'react';
import api from '../../services/axiosConfig';
import { useToast } from '../ui/ToastProvider';
import StickyBar from '../ui/StickyBar';

function CourseTopicsSection({ courseInfoId, data, onSaved, onCancel }) {
    const showToast = useToast();
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
    const [emptyTitleIndices, setEmptyTitleIndices] = useState(new Set());

    const cellBase = "w-full border rounded px-2 py-1 focus:ring-1 outline-none text-sm";
    const cellOk  = `${cellBase} border-gray-300 focus:border-vea-green focus:ring-vea-green`;
    const cellErr = `${cellBase} border-red-500 bg-red-50 focus:border-red-500 focus:ring-red-300`;
    const cellClass = (idx) => emptyTitleIndices.has(idx) ? cellErr : cellOk;

    const addRow = () => {
        setRows(prev => [...prev, { id: null, title: '', description: '', isNew: true }]);
    };

    const updateRow = (idx, field, value) => {
        setRows(prev => prev.map((r, i) => i === idx ? { ...r, [field]: value } : r));
        if (field === 'title' && emptyTitleIndices.has(idx)) {
            setEmptyTitleIndices(prev => { const n = new Set(prev); n.delete(idx); return n; });
        }
    };

    const removeRow = (idx) => {
        const row = rows[idx];
        if (!row.isNew && row.id) setDeletedIds(prev => [...prev, row.id]);
        setRows(prev => prev.filter((_, i) => i !== idx));
        setEmptyTitleIndices(prev => {
            const n = new Set();
            prev.forEach(i => { if (i < idx) n.add(i); else if (i > idx) n.add(i - 1); });
            return n;
        });
    };

    const handleSave = async () => {
        const empty = new Set(
            rows.map((r, i) => (!r.title.trim() ? i : null)).filter(i => i !== null)
        );
        if (empty.size > 0) {
            setEmptyTitleIndices(empty);
            showToast(`${empty.size} tēmai(-ām) trūkst nosaukuma.`, 'error');
            return;
        }
        setEmptyTitleIndices(new Set());
        setSaving(true);
        try {
            for (const id of deletedIds) await api.delete(`/course-content/${id}`);
            for (let i = 0; i < rows.length; i++) {
                const row = rows[i];
                const payload = {
                    courseInfo: { id: courseInfoId },
                    sequenceNumber: i + 1,
                    topicTitle: row.title.trim(),
                    topicDescription: row.description.trim() || null,
                    language: 'lv',
                };
                if (row.isNew) await api.post('/course-content', payload);
                else await api.put(`/course-content/${row.id}`, payload);
            }
            showToast('Tēmas saglabātas veiksmīgi!');
            onSaved();
        } catch {
            showToast('Saglabāšana neizdevās. Pārbaudi datus un mēģini vēlreiz.', 'error');
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="space-y-3 pb-20">
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
                            <td className="px-2 py-1 text-center text-gray-500 align-top pt-2">{idx + 1}</td>
                            <td className="px-1 py-1">
                                <input type="text" value={row.title}
                                    onChange={e => updateRow(idx, 'title', e.target.value)}
                                    className={cellClass(idx)} placeholder="Tēmas nosaukums" />
                                {emptyTitleIndices.has(idx) && (
                                    <p className="text-red-500 text-xs mt-0.5">Nosaukums ir obligāts</p>
                                )}
                            </td>
                            <td className="px-1 py-1">
                                <input type="text" value={row.description}
                                    onChange={e => updateRow(idx, 'description', e.target.value)}
                                    className={cellOk} placeholder="(neobligāts)" />
                            </td>
                            <td className="px-2 py-1 text-center align-top pt-2">
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

export default CourseTopicsSection;
