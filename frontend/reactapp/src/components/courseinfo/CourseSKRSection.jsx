import { useState } from 'react';
import api from '../../services/axiosConfig';

/**
 * Rediģēšanas forma studiju kursa rezultātiem (SKR).
 *
 * @param {string}  courseId
 * @param {object}  data         - { resultAssessments: [{courseResultId, learningOutcome, spsr, components}] }
 * @param {object}  lookups      - { resultsCategories: [{id,name}], assessmentComponents: [{id,name}] }
 * @param {Function} onSaved
 * @param {Function} onCancel
 */
function CourseSKRSection({ courseId, data, lookups, onSaved, onCancel }) {
    const [rows, setRows] = useState(
        (data.resultAssessments || []).map(r => ({
            id: r.courseResultId,
            learningOutcome: r.learningOutcome ?? '',
            categoryId: '',
            language: 'lv',
            isNew: false,
            checkedComponents: new Set(r.components || []),
        }))
    );
    const [deletedIds, setDeletedIds] = useState([]);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState(null);

    const inputClass = "w-full border border-gray-300 rounded px-2 py-1 text-sm focus:border-vea-green focus:ring-1 focus:ring-vea-green outline-none";
    const labelClass = "block text-sm font-medium text-vea-neutral mb-1";

    const addRow = () => {
        setRows(prev => [...prev, {
            id: null, learningOutcome: '', categoryId: '', language: 'lv', isNew: true,
            checkedComponents: new Set(),
        }]);
    };

    const updateRow = (idx, field, value) => {
        setRows(prev => prev.map((r, i) => i === idx ? { ...r, [field]: value } : r));
    };

    const toggleComponent = (idx, componentName) => {
        setRows(prev => prev.map((r, i) => {
            if (i !== idx) return r;
            const next = new Set(r.checkedComponents);
            if (next.has(componentName)) next.delete(componentName);
            else next.add(componentName);
            return { ...r, checkedComponents: next };
        }));
    };

    const removeRow = (idx) => {
        const row = rows[idx];
        if (!row.isNew && row.id) setDeletedIds(prev => [...prev, row.id]);
        setRows(prev => prev.filter((_, i) => i !== idx));
    };

    const handleSave = async () => {
        if (rows.some(r => !r.learningOutcome.trim())) {
            setError('Katram SKR jābūt sasniedzamā rezultāta tekstam.');
            return;
        }
        if (rows.filter(r => r.isNew).some(r => !r.categoryId)) {
            setError('Katram jaunam SKR jānorāda kategorija.');
            return;
        }
        setSaving(true);
        setError(null);
        try {
            for (const id of deletedIds) {
                await api.delete(`/course-results/${id}`);
            }
            for (const row of rows) {
                if (row.isNew) {
                    const res = await api.post('/course-results', {
                        course: { id: courseId },
                        learningOutcome: row.learningOutcome.trim(),
                        category: { id: Number(row.categoryId) },
                        language: row.language,
                    });
                    const newId = res.data.id;
                    for (const comp of (lookups.assessmentComponents || [])) {
                        if (row.checkedComponents.has(comp.name)) {
                            await api.post('/result-assessments', {
                                courseResult: { id: newId },
                                component: { id: comp.id },
                                isUsed: true,
                            });
                        }
                    }
                } else {
                    await api.put(`/course-results/${row.id}`, {
                        course: { id: courseId },
                        learningOutcome: row.learningOutcome.trim(),
                        category: row.categoryId ? { id: Number(row.categoryId) } : null,
                        language: row.language,
                    });
                }
            }
            onSaved();
        } catch (err) {
            setError('Saglabāšana neizdevās. Pārbaudi datus un mēģini vēlreiz.');
        } finally {
            setSaving(false);
        }
    };

    const components = lookups.assessmentComponents || [];

    return (
        <div className="space-y-3">
            {error && <p className="text-red-600 text-sm">{error}</p>}

            <div className="space-y-4">
                {rows.map((row, idx) => (
                    <div key={idx} className="bg-white border border-gray-200 rounded-lg p-4 space-y-3">
                        <div className="flex justify-between items-center">
                            <span className="text-sm font-medium text-gray-500">{idx + 1}.</span>
                            <button onClick={() => removeRow(idx)}
                                    className="text-red-500 hover:text-red-700 text-lg leading-none"
                                    aria-label="Dzēst SKR">×</button>
                        </div>
                        <div>
                            <label className={labelClass}>
                                Sasniedzamais rezultāts <span className="text-red-500">*</span>
                            </label>
                            <textarea value={row.learningOutcome} rows={2}
                                      onChange={e => updateRow(idx, 'learningOutcome', e.target.value)}
                                      className={inputClass}
                                      placeholder="Students prot / spēj / izprot..." />
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                            <div>
                                <label className={labelClass}>
                                    Kategorija {row.isNew && <span className="text-red-500">*</span>}
                                </label>
                                <select value={row.categoryId}
                                        onChange={e => updateRow(idx, 'categoryId', e.target.value)}
                                        className={inputClass}>
                                    <option value="">— izvēlies —</option>
                                    {(lookups.resultsCategories || []).map(c => (
                                        <option key={c.id} value={c.id}>{c.name}</option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <label className={labelClass}>Valoda</label>
                                <select value={row.language}
                                        onChange={e => updateRow(idx, 'language', e.target.value)}
                                        className={inputClass}>
                                    <option value="lv">Latviešu</option>
                                    <option value="en">Angļu</option>
                                </select>
                            </div>
                        </div>
                        {components.length > 0 && (
                            <div>
                                <label className={labelClass}>Vērtēšanas komponentes</label>
                                <div className="flex flex-wrap gap-3">
                                    {components.map(comp => (
                                        <label key={comp.id} className="flex items-center gap-1.5 text-sm cursor-pointer">
                                            <input type="checkbox"
                                                checked={row.checkedComponents.has(comp.name)}
                                                onChange={() => toggleComponent(idx, comp.name)}
                                                className="accent-vea-green" />
                                            {comp.name}
                                        </label>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                ))}
            </div>

            <button onClick={addRow} className="text-vea-green hover:underline text-sm">
                + Pievienot SKR
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

export default CourseSKRSection;
