import { useState } from 'react';
import api from '../../services/axiosConfig';
import { useToast } from '../ui/ToastProvider';
import StickyBar from '../ui/StickyBar';

const CATEGORY_META = {
    'Zināšanas': {
        description: 'Zināšanas ir teorētiskais pamats un fakti, ko studējošais ir apguvis.',
        hint: 'Rezultātus parasti definē ar darbības vārdiem: zināt, raksturot, uzskaitīt, definēt, atpazīt.',
    },
    'Prasmes': {
        description: 'Prasmes ir spēja zināšanas pielietot praksē, lai veiktu konkrētus uzdevumus vai risinātu problēmas.',
        hint: 'Rezultātus definē ar: prot pielietot, aprēķināt, demonstrēt, izmantot.',
    },
    'Kompetences': {
        description: 'Kompetence ir spēja patstāvīgi un atbildīgi integrēt zināšanas un prasmes reālās, bieži vien mainīgās situācijās. Tā ietver arī attieksmi un ētisko atbildību.',
        hint: 'Rezultātus definē ar: spēj vadīt, izvērtēt, argumentēt, izstrādāt.',
    },
};

function CourseSKRSection({ courseId, data, lookups, onSaved, onCancel }) {
    const showToast = useToast();
    const [rows, setRows] = useState(() => {
        const categories = lookups.resultsCategories || [];
        return (data.resultAssessments || []).map(r => {
            const matched = categories.find(c => c.name === r.categoryName);
            return {
                id: r.courseResultId,
                learningOutcome: r.learningOutcome ?? '',
                categoryId: matched ? String(matched.id) : '',
                isNew: false,
            };
        });
    });
    const [deletedIds, setDeletedIds] = useState([]);
    const [saving, setSaving] = useState(false);
    const [rowErrors, setRowErrors] = useState({});

    const inputBase = "w-full border rounded px-2 py-1 text-sm focus:ring-1 outline-none";
    const inputOk  = `${inputBase} border-gray-300 focus:border-vea-green focus:ring-vea-green`;
    const inputErr = `${inputBase} border-red-500 bg-red-50 focus:border-red-500 focus:ring-red-300`;
    const fieldClass = (idx, field) => rowErrors[idx]?.[field] ? inputErr : inputOk;

    const addRow = (categoryId) => {
        setRows(prev => [...prev, {
            id: null, learningOutcome: '', categoryId: String(categoryId), isNew: true,
        }]);
    };

    const updateRow = (idx, value) => {
        setRows(prev => prev.map((r, i) => i === idx ? { ...r, learningOutcome: value } : r));
        if (rowErrors[idx]?.learningOutcome) {
            setRowErrors(prev => {
                const n = { ...prev };
                if (n[idx]) { delete n[idx].learningOutcome; if (!Object.keys(n[idx]).length) delete n[idx]; }
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
            if (!r.learningOutcome.trim()) errors[i] = { learningOutcome: true };
        });
        if (Object.keys(errors).length > 0) {
            setRowErrors(errors);
            showToast('Pārbaudi iezīmētos laukus — tie ir obligāti.', 'error');
            return;
        }
        setRowErrors({});
        setSaving(true);
        try {
            for (const id of deletedIds) await api.delete(`/course-results/${id}`);
            for (const row of rows) {
                if (row.isNew) {
                    await api.post('/course-results', {
                        course: { id: courseId },
                        learningOutcome: row.learningOutcome.trim(),
                        category: { id: Number(row.categoryId) },
                        language: 'lv',
                    });
                } else {
                    await api.put(`/course-results/${row.id}`, {
                        course: { id: courseId },
                        learningOutcome: row.learningOutcome.trim(),
                        category: { id: Number(row.categoryId) },
                        language: 'lv',
                    });
                }
            }
            showToast('Kursa rezultāti saglabāti veiksmīgi!');
            onSaved();
        } catch {
            showToast('Saglabāšana neizdevās. Pārbaudi datus un mēģini vēlreiz.', 'error');
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="space-y-5 pb-20">
            <div>
                <h2 className="text-base font-semibold text-vea-neutral mb-1">
                    Studiju kursa sasniedzamie rezultāti
                </h2>
                <p className="text-sm text-gray-500 leading-snug">
                    Nosaka zināšanas, prasmes un kompetences, ko iegūst pēc studiju kursa apguves,
                    saskaņā ar Latvijas Kvalifikācijas ietvarstruktūrā definētajām prasībām un
                    profesionālās kvalifikācijas līmeni atbilstoši studiju programmas līmenim un formai.
                </p>
            </div>

            <div className="space-y-6">
                {(lookups.resultsCategories || []).map((category, catIndex) => {
                    const meta = CATEGORY_META[category.name] || {};
                    const categoryRows = rows
                        .map((r, idx) => ({ r, idx }))
                        .filter(({ r }) => r.categoryId === String(category.id));

                    return (
                        <div key={category.id} className="space-y-3 border-t border-gray-200 pt-5">
                            <div>
                                <h3 className="font-medium text-vea-neutral">{category.name}</h3>
                                {meta.description && (
                                    <p className="text-sm text-gray-500 mt-0.5">{meta.description}</p>
                                )}
                                {meta.hint && (
                                    <p className="text-xs text-gray-400 mt-0.5 italic">{meta.hint}</p>
                                )}
                            </div>

                            <div className="space-y-2">
                                {categoryRows.map(({ r: row, idx }, catIdx) => (
                                    <div key={idx} className="flex items-start gap-2">
                                        <span className="text-sm text-gray-400 pt-2 w-14 shrink-0 text-right">
                                            SKR {catIndex + 1}.{catIdx + 1}
                                        </span>
                                        <div className="flex-1">
                                            <textarea
                                                value={row.learningOutcome}
                                                rows={2}
                                                onChange={e => updateRow(idx, e.target.value)}
                                                className={fieldClass(idx, 'learningOutcome')}
                                                placeholder="Students prot / spēj / izprot..."
                                            />
                                            {rowErrors[idx]?.learningOutcome && (
                                                <p className="text-red-500 text-xs mt-0.5">Rezultāta teksts ir obligāts</p>
                                            )}
                                        </div>
                                        <button onClick={() => removeRow(idx)}
                                                className="text-red-400 hover:text-red-600 text-lg leading-none pt-1.5 shrink-0"
                                                aria-label="Dzēst SKR">×</button>
                                    </div>
                                ))}

                                {categoryRows.length === 0 && (
                                    <p className="text-sm text-gray-400 italic pl-7">Nav pievienotu rezultātu.</p>
                                )}
                            </div>

                            <button onClick={() => addRow(category.id)}
                                    className="text-vea-green hover:underline text-sm pl-7">
                                + Pievienot {category.name.toLowerCase()}
                            </button>
                        </div>
                    );
                })}
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

export default CourseSKRSection;
