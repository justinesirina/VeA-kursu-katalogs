import { useState } from 'react';
import api from '../../services/axiosConfig';
import { useToast } from '../ui/ToastProvider';
import StickyBar from '../ui/StickyBar';

function CourseAssessmentSection({ courseInfoId, data, lookups, onSaved, onCancel }) {
    const showToast = useToast();

    const [assessRows, setAssessRows] = useState(
        (data.assessmentDistribution || []).map(a => ({
            id: a.id, componentId: '', componentName: a.componentName,
            percentage: a.percentage, isNew: false,
        }))
    );
    const [deletedAssessIds, setDeletedAssessIds] = useState([]);

    const [selfStudyRows, setSelfStudyRows] = useState(
        (data.selfStudyActivities || []).map(s => ({
            id: s.id, activityId: '', activityName: s.activityName,
            percentage: s.percentage, isNew: false,
        }))
    );
    const [deletedSelfStudyIds, setDeletedSelfStudyIds] = useState([]);

    const [saving, setSaving] = useState(false);
    const [missingComponentIdx, setMissingComponentIdx] = useState(new Set());
    const [missingActivityIdx, setMissingActivityIdx] = useState(new Set());

    const blockNonNumeric = e => {
        if (['e', 'E', '+', '-', '.'].includes(e.key)) e.preventDefault();
    };

    const cellBase = "w-full border rounded px-2 py-1 focus:ring-1 outline-none text-sm";
    const cellOk  = `${cellBase} border-gray-300 focus:border-vea-green focus:ring-vea-green`;
    const cellErr = `${cellBase} border-red-500 bg-red-50 focus:border-red-500 focus:ring-red-300`;

    const addAssessRow = () => {
        setAssessRows(prev => [...prev, { id: null, componentId: '', componentName: '', percentage: 0, isNew: true }]);
    };
    const updateAssessRow = (idx, field, value) => {
        setAssessRows(prev => prev.map((r, i) => i === idx ? { ...r, [field]: value } : r));
        if (field === 'componentId' && missingComponentIdx.has(idx)) {
            setMissingComponentIdx(prev => { const n = new Set(prev); n.delete(idx); return n; });
        }
    };
    const removeAssessRow = (idx) => {
        const row = assessRows[idx];
        if (!row.isNew && row.id) setDeletedAssessIds(prev => [...prev, row.id]);
        setAssessRows(prev => prev.filter((_, i) => i !== idx));
    };

    const addSelfStudyRow = () => {
        setSelfStudyRows(prev => [...prev, { id: null, activityId: '', activityName: '', percentage: 0, isNew: true }]);
    };
    const updateSelfStudyRow = (idx, field, value) => {
        setSelfStudyRows(prev => prev.map((r, i) => i === idx ? { ...r, [field]: value } : r));
        if (field === 'activityId' && missingActivityIdx.has(idx)) {
            setMissingActivityIdx(prev => { const n = new Set(prev); n.delete(idx); return n; });
        }
    };
    const removeSelfStudyRow = (idx) => {
        const row = selfStudyRows[idx];
        if (!row.isNew && row.id) setDeletedSelfStudyIds(prev => [...prev, row.id]);
        setSelfStudyRows(prev => prev.filter((_, i) => i !== idx));
    };

    const assessSum = assessRows.reduce((s, r) => s + Number(r.percentage), 0);
    const selfStudySum = selfStudyRows.reduce((s, r) => s + Number(r.percentage), 0);

    const getComponentIdByName = (name) =>
        (lookups.assessmentComponents || []).find(c => c.name === name)?.id ?? '';
    const getActivityIdByName = (name) =>
        (lookups.selfStudyActivities || []).find(a => a.name === name)?.id ?? '';

    const handleSave = async () => {
        const missingComp = new Set(
            assessRows.map((r, i) => (r.isNew && !r.componentId ? i : null)).filter(i => i !== null)
        );
        const missingAct = new Set(
            selfStudyRows.map((r, i) => (r.isNew && !r.activityId ? i : null)).filter(i => i !== null)
        );
        if (missingComp.size > 0) {
            setMissingComponentIdx(missingComp);
            showToast('Izvēlies vērtēšanas komponenti katrai jaunajai rindai.', 'error');
            return;
        }
        if (missingAct.size > 0) {
            setMissingActivityIdx(missingAct);
            showToast('Izvēlies aktivitātes veidu katrai jaunajai rindai.', 'error');
            return;
        }
        if (assessRows.length > 0 && assessSum !== 100) {
            showToast(`Vērtēšanas sadalījuma summai jābūt 100% (šobrīd: ${assessSum}%).`, 'error');
            return;
        }
        if (selfStudyRows.length > 0 && selfStudySum !== 100) {
            showToast(`Patstāvīgā darba summai jābūt 100% (šobrīd: ${selfStudySum}%).`, 'error');
            return;
        }
        setMissingComponentIdx(new Set());
        setMissingActivityIdx(new Set());
        setSaving(true);
        try {
            for (const id of deletedAssessIds) await api.delete(`/assessment-distribution/${id}`);
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
            for (const id of deletedSelfStudyIds) await api.delete(`/self-study-distribution/${id}`);
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
            showToast('Vērtēšana saglabāta veiksmīgi!');
            onSaved();
        } catch {
            showToast('Saglabāšana neizdevās. Pārbaudi datus un mēģini vēlreiz.', 'error');
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="space-y-6 pb-20">

            {/* Vērtēšanas sadalījums */}
            <div>
                <h3 className="text-xl font-semibold font-heading text-vea-neutral mb-2">Vērtēšanas sadalījums</h3>
                <div className="vea-table-wrap">
                    <table className="vea-table">
                        <thead>
                        <tr>
                            <th scope="col">Komponente</th>
                            <th scope="col" className="w-24 text-center">%</th>
                            <th scope="col" aria-label="Darbības" className="w-10"></th>
                        </tr>
                        </thead>
                        <tbody>
                        {assessRows.map((row, idx) => (
                            <tr key={idx} className="border-t border-gray-100">
                                <td className="px-1 py-1">
                                    {row.isNew ? (
                                        <>
                                            <select value={row.componentId}
                                                    onChange={e => updateAssessRow(idx, 'componentId', e.target.value)}
                                                    className={missingComponentIdx.has(idx) ? cellErr : cellOk}>
                                                <option value="">— izvēlies —</option>
                                                {(lookups.assessmentComponents || []).map(c => (
                                                    <option key={c.id} value={c.id}>{c.name}</option>
                                                ))}
                                            </select>
                                            {missingComponentIdx.has(idx) && (
                                                <p className="text-red-500 text-sm mt-0.5">Komponente ir obligāta</p>
                                            )}
                                        </>
                                    ) : (
                                        <span className="px-2">{row.componentName}</span>
                                    )}
                                </td>
                                <td className="px-1 py-1">
                                    <input type="number" min="0" max="100" value={row.percentage}
                                           onChange={e => updateAssessRow(idx, 'percentage', e.target.value)}
                                           onKeyDown={blockNonNumeric}
                                           className={`${cellOk} text-center`} />
                                </td>
                                <td className="px-2 py-1 text-center">
                                    <button onClick={() => removeAssessRow(idx)}
                                            className="text-red-500 hover:text-red-700 text-lg leading-none"
                                            aria-label="Dzēst">×</button>
                                </td>
                            </tr>
                        ))}
                        </tbody>
                    </table>
                </div>
                <div className="flex items-center justify-between mt-2">
                    <button onClick={addAssessRow} className="text-vea-green hover:underline text-sm">
                        + Pievienot komponenti
                    </button>
                    <span className={`text-sm font-medium ${assessSum === 100 ? 'text-green-600' : 'text-vea-orange'}`}>
                        Kopā: {assessSum}%
                    </span>
                </div>
            </div>

            {/* Patstāvīgā darba aktivitātes */}
            <div>
                <h3 className="text-xl font-semibold font-heading text-vea-neutral mb-2">Patstāvīgā darba sadalījums</h3>
                <div className="vea-table-wrap">
                    <table className="vea-table">
                        <thead>
                        <tr>
                            <th scope="col">Aktivitāte</th>
                            <th scope="col" className="w-24 text-center">%</th>
                            <th scope="col" aria-label="Darbības" className="w-10"></th>
                        </tr>
                        </thead>
                        <tbody>
                        {selfStudyRows.map((row, idx) => (
                            <tr key={idx} className="border-t border-gray-100">
                                <td className="px-1 py-1">
                                    {row.isNew ? (
                                        <>
                                            <select value={row.activityId}
                                                    onChange={e => updateSelfStudyRow(idx, 'activityId', e.target.value)}
                                                    className={missingActivityIdx.has(idx) ? cellErr : cellOk}>
                                                <option value="">— izvēlies —</option>
                                                {(lookups.selfStudyActivities || []).map(a => (
                                                    <option key={a.id} value={a.id}>{a.name}</option>
                                                ))}
                                            </select>
                                            {missingActivityIdx.has(idx) && (
                                                <p className="text-red-500 text-sm mt-0.5">Aktivitāte ir obligāta</p>
                                            )}
                                        </>
                                    ) : (
                                        <span className="px-2">{row.activityName}</span>
                                    )}
                                </td>
                                <td className="px-1 py-1">
                                    <input type="number" min="0" max="100" value={row.percentage}
                                           onChange={e => updateSelfStudyRow(idx, 'percentage', e.target.value)}
                                           onKeyDown={blockNonNumeric}
                                           className={`${cellOk} text-center`} />
                                </td>
                                <td className="px-2 py-1 text-center">
                                    <button onClick={() => removeSelfStudyRow(idx)}
                                            className="text-red-500 hover:text-red-700 text-lg leading-none"
                                            aria-label="Dzēst">×</button>
                                </td>
                            </tr>
                        ))}
                        </tbody>
                    </table>
                </div>
                <div className="flex items-center justify-between mt-2">
                    <button onClick={addSelfStudyRow} className="text-vea-green hover:underline text-sm">
                        + Pievienot aktivitāti
                    </button>
                    <span className={`text-sm font-medium ${selfStudySum === 100 ? 'text-green-600' : 'text-vea-orange'}`}>
                        Kopā: {selfStudySum}%
                    </span>
                </div>
            </div>

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

export default CourseAssessmentSection;
