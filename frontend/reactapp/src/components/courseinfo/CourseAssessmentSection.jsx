import { useState, useMemo, useEffect, useRef } from 'react';
import api from '../../services/axiosConfig';
import { useToast } from '../ui/ToastProvider';
import StickyBar from '../ui/StickyBar';
import PercentageStackBar from '../ui/PercentageStackBar';

const SKR_CATEGORY_ORDER = ['Zināšanas', 'Prasmes', 'Kompetences'];

function CourseAssessmentSection({ courseId, courseInfoId, data, lookups, onSaved, onCancel }) {
    const showToast = useToast();

    const resolveComponentId = (name) =>
        (lookups.assessmentComponents || []).find(c => c.name === name)?.id ?? '';
    const resolveActivityId = (name) =>
        (lookups.selfStudyActivities || []).find(a => a.name === name)?.id ?? '';

    const [assessRows, setAssessRows] = useState(
        (data.assessmentDistribution || []).map(a => ({
            id: a.id,
            componentId: resolveComponentId(a.componentName),
            componentName: a.componentName,
            percentage: a.percentage,
            isNew: false,
        }))
    );
    const [deletedAssessIds, setDeletedAssessIds] = useState([]);

    const [selfStudyRows, setSelfStudyRows] = useState(
        (data.selfStudyActivities || []).map(s => ({
            id: s.id,
            activityId: resolveActivityId(s.activityName),
            activityName: s.activityName,
            percentage: s.percentage,
            isNew: false,
        }))
    );
    const [deletedSelfStudyIds, setDeletedSelfStudyIds] = useState([]);

    const [saving, setSaving] = useState(false);
    const [missingComponentIdx, setMissingComponentIdx] = useState(new Set());
    const [missingActivityIdx, setMissingActivityIdx] = useState(new Set());

    // Sākotnēji saglabāto komponenšu ID kopa (pēc datu pārlādes) — pret to salīdzina,
    // lai pazītu "atjaunotas" komponentes ar mantotām matricas atzīmēm
    const originalComponentIds = useRef(
        new Set((data.assessmentDistribution || [])
            .map(a => resolveComponentId(a.componentName))
            .filter(Boolean))
    );

    // Sinhronizē stāvokli ar svaigiem datiem (piem., pēc saglabāšanas parent pārlādē courseDetails).
    // Neļauj delete rindām saturēt jau dzēstus ID un atjaunina rindas no svaigiem datiem.
    useEffect(() => {
        originalComponentIds.current = new Set((data.assessmentDistribution || [])
            .map(a => resolveComponentId(a.componentName))
            .filter(Boolean));
        setAssessRows((data.assessmentDistribution || []).map(a => ({
            id: a.id,
            componentId: resolveComponentId(a.componentName),
            componentName: a.componentName,
            percentage: a.percentage,
            isNew: false,
        })));
        setSelfStudyRows((data.selfStudyActivities || []).map(s => ({
            id: s.id,
            activityId: resolveActivityId(s.activityName),
            activityName: s.activityName,
            percentage: s.percentage,
            isNew: false,
        })));
        setDeletedAssessIds([]);
        setDeletedSelfStudyIds([]);
        setMissingComponentIdx(new Set());
        setMissingActivityIdx(new Set());
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [data]);

    // --- SKR × komponentes matrica ---
    const [matrix, setMatrix] = useState({});
    useEffect(() => {
        const m = {};
        (data.resultAssessmentsFull || []).forEach(ra => {
            if (!m[ra.courseResultId]) m[ra.courseResultId] = {};
            m[ra.courseResultId][ra.componentId] = !!ra.isUsed;
        });
        setMatrix(m);
    }, [data]);

    const toggleMatrix = (skrId, compId, val) => {
        setMatrix(prev => ({
            ...prev,
            [skrId]: { ...(prev[skrId] || {}), [compId]: val }
        }));
    };

    // SKR rindas matricai — no resultAssessments (satur courseResultId + categoryName + learningOutcome)
    const skrRows = data.resultAssessments || [];
    const skrByCategory = {};
    skrRows.forEach(r => {
        const cat = r.categoryName || 'Citi';
        if (!skrByCategory[cat]) skrByCategory[cat] = [];
        skrByCategory[cat].push(r);
    });
    const skrCategories = [
        ...SKR_CATEGORY_ORDER.filter(c => skrByCategory[c]),
        ...Object.keys(skrByCategory).filter(c => !SKR_CATEGORY_ORDER.includes(c))
    ];

    // SKR numurēšana: kategorijas kārtas nr. + pozīcija kategorijā (piem., 1.3 = Zināšanas, 3. SKR)
    const skrNumberById = {};
    skrCategories.forEach(cat => {
        const idx = SKR_CATEGORY_ORDER.indexOf(cat);
        const catNum = idx >= 0 ? idx + 1 : SKR_CATEGORY_ORDER.length + 1;
        skrByCategory[cat].forEach((r, i) => {
            skrNumberById[r.courseResultId] = `${catNum}.${i + 1}`;
        });
    });

    // Komponenšu kolonnas = tikai šī kursa sadalījumā pievienotās, unikālas pēc ID
    const usedComponents = useMemo(() => {
        const seen = new Set();
        const out = [];
        assessRows.forEach(r => {
            const cid = Number(r.componentId);
            if (!cid || seen.has(cid)) return;
            seen.add(cid);
            out.push({ id: cid, name: r.componentName });
        });
        return out;
    }, [assessRows]);

    // Komponentes, kas NAV bija sākotnējā sadalījumā, bet tām eksistē vēsturiskas matricas
    // atzīmes ar isUsed=true (lietotājs tās vai nu atjaunoja šajā sesijā, vai pievienoja pirmo reizi).
    const restoredComponents = useMemo(() => {
        return usedComponents.filter(c => {
            if (originalComponentIds.current.has(c.id)) return false;
            const hasHistoryUsed = (data.resultAssessmentsFull || [])
                .some(ra => ra.componentId === c.id && ra.isUsed);
            return hasHistoryUsed;
        });
    }, [usedComponents, data]);

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
        setAssessRows(prev => prev.map((r, i) => {
            if (i !== idx) return r;
            const next = { ...r, [field]: value };
            if (field === 'componentId') {
                const found = (lookups.assessmentComponents || []).find(c => String(c.id) === String(value));
                next.componentName = found ? found.name : '';
            }
            return next;
        }));
        if (field === 'componentId' && missingComponentIdx.has(idx)) {
            setMissingComponentIdx(prev => { const n = new Set(prev); n.delete(idx); return n; });
        }
    };
    const removeAssessRow = (idx) => {
        const row = assessRows[idx];
        if (!row.isNew && row.id) setDeletedAssessIds(prev => [...prev, row.id]);
        setAssessRows(prev => prev.filter((_, i) => i !== idx));
    };
    const moveAssessRow = (idx, dir) => {
        const target = idx + dir;
        if (target < 0 || target >= assessRows.length) return;
        setAssessRows(prev => {
            const next = [...prev];
            [next[idx], next[target]] = [next[target], next[idx]];
            return next;
        });
    };

    const addSelfStudyRow = () => {
        setSelfStudyRows(prev => [...prev, { id: null, activityId: '', activityName: '', percentage: 0, isNew: true }]);
    };
    const updateSelfStudyRow = (idx, field, value) => {
        setSelfStudyRows(prev => prev.map((r, i) => {
            if (i !== idx) return r;
            const next = { ...r, [field]: value };
            if (field === 'activityId') {
                const found = (lookups.selfStudyActivities || []).find(a => String(a.id) === String(value));
                next.activityName = found ? found.name : '';
            }
            return next;
        }));
        if (field === 'activityId' && missingActivityIdx.has(idx)) {
            setMissingActivityIdx(prev => { const n = new Set(prev); n.delete(idx); return n; });
        }
    };
    const removeSelfStudyRow = (idx) => {
        const row = selfStudyRows[idx];
        if (!row.isNew && row.id) setDeletedSelfStudyIds(prev => [...prev, row.id]);
        setSelfStudyRows(prev => prev.filter((_, i) => i !== idx));
    };
    const moveSelfStudyRow = (idx, dir) => {
        const target = idx + dir;
        if (target < 0 || target >= selfStudyRows.length) return;
        setSelfStudyRows(prev => {
            const next = [...prev];
            [next[idx], next[target]] = [next[target], next[idx]];
            return next;
        });
    };

    const assessSum = assessRows.reduce((s, r) => s + Number(r.percentage), 0);
    const selfStudySum = selfStudyRows.reduce((s, r) => s + Number(r.percentage), 0);

    const handleSave = async () => {
        const missingComp = new Set(
            assessRows.map((r, i) => (r.isNew && !r.componentId ? i : null)).filter(i => i !== null)
        );
        const missingAct = new Set(
            selfStudyRows.map((r, i) => (r.isNew && !r.activityId ? i : null)).filter(i => i !== null)
        );
        if (missingComp.size > 0) {
            setMissingComponentIdx(missingComp);
            const rows = [...missingComp].map(i => `${i + 1}. rinda`).join(', ');
            showToast(`Vērtēšanas sadalījumā izvēlies komponenti: ${rows}.`, 'error');
            return;
        }
        if (missingAct.size > 0) {
            setMissingActivityIdx(missingAct);
            const rows = [...missingAct].map(i => `${i + 1}. rinda`).join(', ');
            showToast(`Patstāvīgā darba sadalījumā izvēlies aktivitāti: ${rows}.`, 'error');
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
        // Matricas validācija: katram SKR jābūt vismaz vienai atzīmētai komponentei (ja komponentes ir definētas)
        if (usedComponents.length > 0 && skrRows.length > 0) {
            const missingSkrs = skrRows
                .filter(r => {
                    const comps = matrix[r.courseResultId] || {};
                    return !usedComponents.some(c => comps[c.id]);
                })
                .map(r => skrNumberById[r.courseResultId])
                .sort((a, b) => {
                    const [ac, ar] = a.split('.').map(Number);
                    const [bc, br] = b.split('.').map(Number);
                    return ac - bc || ar - br;
                })
                .map(n => `SKR ${n}`);
            if (missingSkrs.length > 0) {
                showToast(`Atzīmē vismaz vienu vērtēšanas komponenti šiem: ${missingSkrs.join(', ')}.`, 'error');
                return;
            }
        }
        setMissingComponentIdx(new Set());
        setMissingActivityIdx(new Set());
        setSaving(true);
        try {
            for (const id of deletedAssessIds) await api.delete(`/assessment-distribution/${id}`);
            for (let i = 0; i < assessRows.length; i++) {
                const row = assessRows[i];
                if (row.isNew) {
                    await api.post('/assessment-distribution', {
                        courseInfo: { id: courseInfoId },
                        component: { id: Number(row.componentId) },
                        percentage: Number(row.percentage),
                        displayOrder: i,
                    });
                } else {
                    await api.put(`/assessment-distribution/${row.id}`, {
                        courseInfo: { id: courseInfoId },
                        component: { id: Number(row.componentId) || resolveComponentId(row.componentName) },
                        percentage: Number(row.percentage),
                        displayOrder: i,
                    });
                }
            }
            for (const id of deletedSelfStudyIds) await api.delete(`/self-study-distribution/${id}`);
            for (let i = 0; i < selfStudyRows.length; i++) {
                const row = selfStudyRows[i];
                if (row.isNew) {
                    await api.post('/self-study-distribution', {
                        courseInfo: { id: courseInfoId },
                        activity: { id: Number(row.activityId) },
                        percentage: Number(row.percentage),
                        displayOrder: i,
                    });
                } else {
                    await api.put(`/self-study-distribution/${row.id}`, {
                        courseInfo: { id: courseInfoId },
                        activity: { id: Number(row.activityId) || resolveActivityId(row.activityName) },
                        percentage: Number(row.percentage),
                        displayOrder: i,
                    });
                }
            }

            // SKR × komponentes matrica — masveida upsert
            if (courseId && skrRows.length > 0) {
                const entries = [];
                Object.entries(matrix).forEach(([skrId, comps]) => {
                    Object.entries(comps).forEach(([compId, isUsed]) => {
                        entries.push({
                            courseResultId: skrId,
                            componentId: Number(compId),
                            isUsed: !!isUsed,
                        });
                    });
                });
                if (entries.length > 0) {
                    await api.put(`/result-assessments/bulk/${courseId}`, { entries });
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

            {/* Studiju kursa rezultātu vērtēšana */}
            <div>
                <h3 className="text-xl font-semibold font-heading text-vea-neutral mb-2">Studiju kursa rezultātu vērtēšana</h3>
                <PercentageStackBar rows={assessRows} labelKey="componentName" />
                <div className="vea-table-wrap">
                    <table className="vea-table">
                        <thead>
                        <tr>
                            <th scope="col" aria-label="Kārtot" className="w-10"></th>
                            <th scope="col">Vērtēšanas komponente</th>
                            <th scope="col" className="w-24 text-center">%</th>
                            <th scope="col" aria-label="Darbības" className="w-10"></th>
                        </tr>
                        </thead>
                        <tbody>
                        {assessRows.map((row, idx) => (
                            <tr key={idx} className="border-t border-gray-100">
                                <td className="px-2 py-1 align-middle">
                                    <div className="flex flex-col text-vea-neutral/60 text-xs leading-none">
                                        <button type="button" onClick={() => moveAssessRow(idx, -1)}
                                                disabled={idx === 0}
                                                className="hover:text-vea-green disabled:opacity-30 disabled:cursor-not-allowed py-0.5"
                                                aria-label="Pārvietot augšup">▲</button>
                                        <button type="button" onClick={() => moveAssessRow(idx, 1)}
                                                disabled={idx === assessRows.length - 1}
                                                className="hover:text-vea-green disabled:opacity-30 disabled:cursor-not-allowed py-0.5"
                                                aria-label="Pārvietot lejup">▼</button>
                                    </div>
                                </td>
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

            {/* Studējošo individuālā patstāvīgā darba organizācija */}
            <div>
                <h3 className="text-xl font-semibold font-heading text-vea-neutral mb-2">
                    Studējošo individuālā patstāvīgā darba organizācija
                </h3>
                <p className="text-sm text-vea-text mb-3">
                    Studentu patstāvīgais darbs: <strong>{data?.independentWorkHours ?? 0}</strong> akadēmiskās stundas
                </p>
                <PercentageStackBar rows={selfStudyRows} labelKey="activityName" />
                <div className="vea-table-wrap">
                    <table className="vea-table">
                        <thead>
                        <tr>
                            <th scope="col" aria-label="Kārtot" className="w-10"></th>
                            <th scope="col">Aktivitāte</th>
                            <th scope="col" className="w-24 text-center">%</th>
                            <th scope="col" aria-label="Darbības" className="w-10"></th>
                        </tr>
                        </thead>
                        <tbody>
                        {selfStudyRows.map((row, idx) => (
                            <tr key={idx} className="border-t border-gray-100">
                                <td className="px-2 py-1 align-middle">
                                    <div className="flex flex-col text-vea-neutral/60 text-xs leading-none">
                                        <button type="button" onClick={() => moveSelfStudyRow(idx, -1)}
                                                disabled={idx === 0}
                                                className="hover:text-vea-green disabled:opacity-30 disabled:cursor-not-allowed py-0.5"
                                                aria-label="Pārvietot augšup">▲</button>
                                        <button type="button" onClick={() => moveSelfStudyRow(idx, 1)}
                                                disabled={idx === selfStudyRows.length - 1}
                                                className="hover:text-vea-green disabled:opacity-30 disabled:cursor-not-allowed py-0.5"
                                                aria-label="Pārvietot lejup">▼</button>
                                    </div>
                                </td>
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

            {/* Studiju kursa rezultātu vērtēšanas komponentes (matrica) */}
            <div>
                <h3 className="text-xl font-semibold font-heading text-vea-neutral mb-2">
                    Studiju kursa rezultātu vērtēšanas komponentes
                </h3>
                <p className="text-sm text-gray-500 mb-3">
                    Atzīmējiet, kuras vērtēšanas komponentes palīdz sasniegt attiecīgo studiju kursa rezultātu (SKR).
                </p>

                {skrRows.length === 0 && (
                    <p className="text-sm text-gray-500">
                        Vispirms pievienojiet studiju kursa rezultātus cilnē „Kursa rezultāti“.
                    </p>
                )}
                {skrRows.length > 0 && usedComponents.length === 0 && (
                    <p className="text-sm text-gray-500">
                        Vispirms pievienojiet vērtēšanas komponentes augšējā sadaļā.
                    </p>
                )}

                {restoredComponents.length > 0 && (
                    <div className="mb-3 px-3 py-2 rounded border border-vea-orange/40 bg-vea-orange-light text-vea-orange text-sm flex items-start gap-2">
                        <span aria-hidden="true" className="text-base leading-none mt-0.5">⚠</span>
                        <div>
                            Komponentēm{' '}
                            {restoredComponents.map((c, i) => (
                                <span key={c.id}>
                                    <strong>„{c.name}"</strong>{i < restoredComponents.length - 1 ? ', ' : ''}
                                </span>
                            ))}{' '}
                            ielādētas iepriekšējās atzīmes. Pārbaudi, vai tās joprojām ir pareizas, pirms saglabā!
                        </div>
                    </div>
                )}

                {skrRows.length > 0 && usedComponents.length > 0 && (
                    <>
                        {/* Desktop: tabulas matrica ar sticky galveni un pirmo kolonnu */}
                        <div className="hidden md:block border border-gray-200 border-t-4 border-t-vea-green rounded-lg overflow-auto max-h-[70vh] shadow-sm bg-white">
                            <table className="w-full text-sm" style={{ borderCollapse: 'separate', borderSpacing: 0 }}>
                                <thead>
                                <tr>
                                    <th scope="col"
                                        className="sticky top-0 left-0 z-30 bg-vea-green-light px-4 py-3 text-left text-sm font-semibold text-vea-neutral uppercase tracking-wider border-b border-r border-gray-200 min-w-[16rem]">
                                        SKR
                                    </th>
                                    {usedComponents.map(c => (
                                        <th key={c.id} scope="col"
                                            className="sticky top-0 z-20 bg-vea-green-light px-2 py-3 text-center text-xs font-semibold text-vea-neutral uppercase tracking-wide leading-tight align-bottom border-b border-r border-gray-200 last:border-r-0 min-w-[6.5rem] max-w-[10rem]">
                                            <span className="break-words whitespace-normal block">{c.name}</span>
                                        </th>
                                    ))}
                                </tr>
                                </thead>
                                <tbody>
                                {skrCategories.map(cat =>
                                    skrByCategory[cat].map((r, i) => (
                                        <tr key={r.courseResultId}>
                                            <td className="sticky left-0 z-10 bg-white px-4 py-2.5 text-base text-vea-text border-b border-r border-gray-200 align-top">
                                                {i === 0 && (
                                                    <span className="font-semibold text-vea-green block mb-1 text-xs uppercase tracking-wide">{cat}</span>
                                                )}
                                                <div className="flex gap-2">
                                                    <span className="font-semibold text-vea-neutral shrink-0 whitespace-nowrap">SKR {skrNumberById[r.courseResultId]}.</span>
                                                    <span className="leading-snug">{r.learningOutcome}</span>
                                                </div>
                                            </td>
                                            {usedComponents.map(c => {
                                                const checked = !!matrix[r.courseResultId]?.[c.id];
                                                return (
                                                    <td key={c.id}
                                                        className={`p-0 border-b border-r border-gray-200 last:border-r-0 transition-colors ${
                                                            checked ? 'bg-vea-green-light/60' : 'bg-white hover:bg-gray-50'
                                                        }`}>
                                                        <label className="flex items-center justify-center w-full h-full py-3 cursor-pointer">
                                                            <input
                                                                type="checkbox"
                                                                checked={checked}
                                                                onChange={e => toggleMatrix(r.courseResultId, c.id, e.target.checked)}
                                                                className="h-5 w-5 accent-vea-green cursor-pointer"
                                                                aria-label={`${c.name} — SKR ${skrNumberById[r.courseResultId]}`}
                                                            />
                                                        </label>
                                                    </td>
                                                );
                                            })}
                                        </tr>
                                    ))
                                )}
                                </tbody>
                            </table>
                        </div>

                        {/* Mobilā: katrs SKR ir atsevišķa kartīte ar vertikālu komponenšu sarakstu */}
                        <div className="md:hidden space-y-3">
                            {skrCategories.map(cat =>
                                skrByCategory[cat].map((r, i) => (
                                    <div key={r.courseResultId} className="border border-gray-200 border-t-4 border-t-vea-green rounded-lg p-3 bg-white shadow-sm">
                                        {i === 0 && (
                                            <div className="text-xs font-semibold text-vea-green uppercase tracking-wide mb-1.5">{cat}</div>
                                        )}
                                        <div className="flex gap-2 mb-2 text-sm">
                                            <span className="font-semibold text-vea-neutral shrink-0 whitespace-nowrap">SKR {skrNumberById[r.courseResultId]}.</span>
                                            <span className="text-vea-text leading-snug">{r.learningOutcome}</span>
                                        </div>
                                        <div className="pt-2 border-t border-gray-100 space-y-1">
                                            {usedComponents.map(c => {
                                                const checked = !!matrix[r.courseResultId]?.[c.id];
                                                return (
                                                    <label key={c.id}
                                                           className={`flex items-center gap-2 px-2 py-2 rounded cursor-pointer transition-colors ${
                                                               checked ? 'bg-vea-green-light/60' : 'hover:bg-gray-50'
                                                           }`}>
                                                        <input
                                                            type="checkbox"
                                                            checked={checked}
                                                            onChange={e => toggleMatrix(r.courseResultId, c.id, e.target.checked)}
                                                            className="h-5 w-5 accent-vea-green shrink-0"
                                                            aria-label={`${c.name} — SKR ${skrNumberById[r.courseResultId]}`}
                                                        />
                                                        <span className="text-sm text-vea-text">{c.name}</span>
                                                    </label>
                                                );
                                            })}
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </>
                )}
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
