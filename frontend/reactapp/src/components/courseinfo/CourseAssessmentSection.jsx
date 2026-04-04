import { useState } from 'react';
import api from '../../services/axiosConfig';

/**
 * Rediģēšanas forma vērtēšanas sadalījumam un patstāvīgā darba aktivitātēm.
 * Divas apakšsekcijas vienā komponentā.
 *
 * @param {string}  courseInfoId
 * @param {object}  data         - { assessmentDistribution, selfStudyActivities }
 * @param {object}  lookups      - { assessmentComponents: [{id,name}], selfStudyActivities: [{id,name}] }
 * @param {Function} onSaved
 * @param {Function} onCancel
 */
function CourseAssessmentSection({ courseInfoId, data, lookups, onSaved, onCancel }) {
    const [assessRows, setAssessRows] = useState(
        (data.assessmentDistribution || []).map(a => ({
            id: a.id,
            componentId: '',   // not in DTO — will be matched by name or left empty for new rows
            componentName: a.componentName,
            percentage: a.percentage,
            isNew: false,
        }))
    );
    const [deletedAssessIds, setDeletedAssessIds] = useState([]);

    const [selfStudyRows, setSelfStudyRows] = useState(
        (data.selfStudyActivities || []).map(s => ({
            id: s.id,
            activityId: '',
            activityName: s.activityName,
            percentage: s.percentage,
            isNew: false,
        }))
    );
    const [deletedSelfStudyIds, setDeletedSelfStudyIds] = useState([]);

    const [saving, setSaving] = useState(false);
    const [error, setError] = useState(null);

    // --- Assessment helpers ---
    const addAssessRow = () => {
        setAssessRows(prev => [...prev, { id: null, componentId: '', componentName: '', percentage: 0, isNew: true }]);
    };
    const updateAssessRow = (idx, field, value) => {
        setAssessRows(prev => prev.map((r, i) => i === idx ? { ...r, [field]: value } : r));
    };
    const removeAssessRow = (idx) => {
        const row = assessRows[idx];
        if (!row.isNew && row.id) setDeletedAssessIds(prev => [...prev, row.id]);
        setAssessRows(prev => prev.filter((_, i) => i !== idx));
    };

    // --- Self-study helpers ---
    const addSelfStudyRow = () => {
        setSelfStudyRows(prev => [...prev, { id: null, activityId: '', activityName: '', percentage: 0, isNew: true }]);
    };
    const updateSelfStudyRow = (idx, field, value) => {
        setSelfStudyRows(prev => prev.map((r, i) => i === idx ? { ...r, [field]: value } : r));
    };
    const removeSelfStudyRow = (idx) => {
        const row = selfStudyRows[idx];
        if (!row.isNew && row.id) setDeletedSelfStudyIds(prev => [...prev, row.id]);
        setSelfStudyRows(prev => prev.filter((_, i) => i !== idx));
    };

    const assessSum = assessRows.reduce((s, r) => s + Number(r.percentage), 0);
    const selfStudySum = selfStudyRows.reduce((s, r) => s + Number(r.percentage), 0);

    const handleSave = async () => {
        if (assessRows.length > 0 && assessSum !== 100) {
            setError(`Vērtēšanas sadalījuma summai jābūt 100% (šobrīd: ${assessSum}%).`);
            return;
        }
        if (selfStudyRows.length > 0 && selfStudySum !== 100) {
            setError(`Patstāvīgā darba summai jābūt 100% (šobrīd: ${selfStudySum}%).`);
            return;
        }
        if (assessRows.some(r => !r.componentId && r.isNew)) {
            setError('Izvēlies vērtēšanas komponenti katrai jaunajai rindai.');
            return;
        }
        if (selfStudyRows.some(r => !r.activityId && r.isNew)) {
            setError('Izvēlies aktivitātes veidu katrai jaunajai rindai.');
            return;
        }
        setSaving(true);
        setError(null);
        try {
            for (const id of deletedAssessIds) {
                await api.delete(`/assessment-distribution/${id}`);
            }
            for (const row of assessRows) {
                if (row.isNew) {
                    await api.post('/assessment-distribution', {
                        courseInfo: { id: courseInfoId },
                        component: { id: Number(row.componentId) },
                        percentage: Number(row.percentage),
                    });
                } else {
                    await api.put(`/assessment-distribution/${row.id}`, {
                        courseInfo: { id: courseInfoId },
                        component: { id: Number(row.componentId) || getComponentIdByName(row.componentName) },
                        percentage: Number(row.percentage),
                    });
                }
            }
            for (const id of deletedSelfStudyIds) {
                await api.delete(`/self-study-distribution/${id}`);
            }
            for (const row of selfStudyRows) {
                if (row.isNew) {
                    await api.post('/self-study-distribution', {
                        courseInfo: { id: courseInfoId },
                        activity: { id: Number(row.activityId) },
                        percentage: Number(row.percentage),
                    });
                } else {
                    await api.put(`/self-study-distribution/${row.id}`, {
                        courseInfo: { id: courseInfoId },
                        activity: { id: Number(row.activityId) || getActivityIdByName(row.activityName) },
                        percentage: Number(row.percentage),
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

    const getComponentIdByName = (name) => {
        const found = (lookups.assessmentComponents || []).find(c => c.name === name);
        return found ? found.id : '';
    };
    const getActivityIdByName = (name) => {
        const found = (lookups.selfStudyActivities || []).find(a => a.name === name);
        return found ? found.id : '';
    };

    return (
        <div className="space-y-6">
            {error && <p className="text-red-600 text-sm">{error}</p>}

            {/* Vērtēšanas sadalījums */}
            <div>
                <h3 className="font-medium mb-2">Vērtēšanas sadalījums</h3>
                <table className="w-full text-sm border border-gray-200">
                    <thead className="bg-gray-50">
                    <tr>
                        <th className="border border-gray-200 px-2 py-1">Komponente</th>
                        <th className="border border-gray-200 px-2 py-1 w-24 text-center">%</th>
                        <th className="border border-gray-200 px-2 py-1 w-10"></th>
                    </tr>
                    </thead>
                    <tbody>
                    {assessRows.map((row, idx) => (
                        <tr key={idx}>
                            <td className="border border-gray-200 px-1 py-1">
                                {row.isNew ? (
                                    <select value={row.componentId}
                                            onChange={e => updateAssessRow(idx, 'componentId', e.target.value)}
                                            className="w-full border rounded px-2 py-1">
                                        <option value="">— izvēlies —</option>
                                        {(lookups.assessmentComponents || []).map(c => (
                                            <option key={c.id} value={c.id}>{c.name}</option>
                                        ))}
                                    </select>
                                ) : (
                                    <span className="px-2">{row.componentName}</span>
                                )}
                            </td>
                            <td className="border border-gray-200 px-1 py-1">
                                <input type="number" min="0" max="100" value={row.percentage}
                                       onChange={e => updateAssessRow(idx, 'percentage', e.target.value)}
                                       className="w-full border rounded px-2 py-1 text-center" />
                            </td>
                            <td className="border border-gray-200 px-2 py-1 text-center">
                                <button onClick={() => removeAssessRow(idx)}
                                        className="text-red-500 hover:text-red-700 text-lg leading-none">×</button>
                            </td>
                        </tr>
                    ))}
                    </tbody>
                </table>
                <div className="flex items-center justify-between mt-1">
                    <button onClick={addAssessRow} className="text-blue-600 hover:underline text-sm">
                        + Pievienot komponenti
                    </button>
                    <span className={`text-sm font-medium ${assessSum === 100 ? 'text-green-600' : 'text-orange-600'}`}>
                        Kopā: {assessSum}%
                    </span>
                </div>
            </div>

            {/* Patstāvīgā darba aktivitātes */}
            <div>
                <h3 className="font-medium mb-2">Patstāvīgā darba sadalījums</h3>
                <table className="w-full text-sm border border-gray-200">
                    <thead className="bg-gray-50">
                    <tr>
                        <th className="border border-gray-200 px-2 py-1">Aktivitāte</th>
                        <th className="border border-gray-200 px-2 py-1 w-24 text-center">%</th>
                        <th className="border border-gray-200 px-2 py-1 w-10"></th>
                    </tr>
                    </thead>
                    <tbody>
                    {selfStudyRows.map((row, idx) => (
                        <tr key={idx}>
                            <td className="border border-gray-200 px-1 py-1">
                                {row.isNew ? (
                                    <select value={row.activityId}
                                            onChange={e => updateSelfStudyRow(idx, 'activityId', e.target.value)}
                                            className="w-full border rounded px-2 py-1">
                                        <option value="">— izvēlies —</option>
                                        {(lookups.selfStudyActivities || []).map(a => (
                                            <option key={a.id} value={a.id}>{a.name}</option>
                                        ))}
                                    </select>
                                ) : (
                                    <span className="px-2">{row.activityName}</span>
                                )}
                            </td>
                            <td className="border border-gray-200 px-1 py-1">
                                <input type="number" min="0" max="100" value={row.percentage}
                                       onChange={e => updateSelfStudyRow(idx, 'percentage', e.target.value)}
                                       className="w-full border rounded px-2 py-1 text-center" />
                            </td>
                            <td className="border border-gray-200 px-2 py-1 text-center">
                                <button onClick={() => removeSelfStudyRow(idx)}
                                        className="text-red-500 hover:text-red-700 text-lg leading-none">×</button>
                            </td>
                        </tr>
                    ))}
                    </tbody>
                </table>
                <div className="flex items-center justify-between mt-1">
                    <button onClick={addSelfStudyRow} className="text-blue-600 hover:underline text-sm">
                        + Pievienot aktivitāti
                    </button>
                    <span className={`text-sm font-medium ${selfStudySum === 100 ? 'text-green-600' : 'text-orange-600'}`}>
                        Kopā: {selfStudySum}%
                    </span>
                </div>
            </div>

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

export default CourseAssessmentSection;
