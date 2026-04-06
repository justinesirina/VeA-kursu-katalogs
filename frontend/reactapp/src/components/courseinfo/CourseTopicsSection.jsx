import { useState, useRef } from 'react';
import api from '../../services/axiosConfig';
import { useToast } from '../ui/ToastProvider';
import StickyBar from '../ui/StickyBar';
import RichTextEditor from '../ui/RichTextEditor';
import EditableCard from '../ui/EditableCard';

function CourseTopicsSection({ courseInfoId, data, onSaved, onCancel }) {
    const showToast = useToast();
    const nextTempId = useRef(0);

    const [rows, setRows] = useState(
        (data.topics || []).map(t => ({
            id: t.id,
            tempId: null,
            title: t.title ?? '',
            description: t.description ?? '',
            isNew: false,
        }))
    );
    const [deletedIds, setDeletedIds]             = useState([]);
    const [saving, setSaving]                     = useState(false);
    const [emptyTitleIndices, setEmptyTitleIndices] = useState(new Set());
    const [dragRowIdx, setDragRowIdx]             = useState(null);

    // -----------------------------------------------------------------------
    // Row operations
    // -----------------------------------------------------------------------
    const addRow = () => {
        setRows(prev => [...prev, {
            id: null,
            tempId: `new-${nextTempId.current++}`,
            title: '',
            description: '',
            isNew: true,
        }]);
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

    const duplicateRow = (idx) => {
        const row = rows[idx];
        setRows(prev => {
            const next = [...prev];
            next.splice(idx + 1, 0, {
                id: null,
                tempId: `new-${nextTempId.current++}`,
                title: row.title,
                description: row.description,
                isNew: true,
            });
            return next;
        });
    };

    // -----------------------------------------------------------------------
    // Drag-and-drop
    // -----------------------------------------------------------------------
    const handleDragOver = (e) => e.preventDefault();
    const handleDrop = (dropIdx) => {
        if (dragRowIdx === null || dragRowIdx === dropIdx) { setDragRowIdx(null); return; }
        setRows(prev => {
            const next = [...prev];
            const [moved] = next.splice(dragRowIdx, 1);
            next.splice(dropIdx, 0, moved);
            return next;
        });
        setEmptyTitleIndices(new Set());
        setDragRowIdx(null);
    };

    // -----------------------------------------------------------------------
    // Save
    // -----------------------------------------------------------------------
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
                    topicDescription: row.description || null,
                    language: 'lv',
                };
                if (row.isNew) await api.post('/course-content', payload);
                else           await api.put(`/course-content/${row.id}`, payload);
            }
            showToast('Tēmas saglabātas veiksmīgi!');
            onSaved();
        } catch {
            showToast('Saglabāšana neizdevās. Pārbaudi datus un mēģini vēlreiz.', 'error');
        } finally {
            setSaving(false);
        }
    };

    // -----------------------------------------------------------------------
    // Render
    // -----------------------------------------------------------------------
    return (
        <div className="space-y-3 pb-20">

            {rows.length === 0 ? (
                <div className="bg-white rounded-lg border border-dashed border-gray-300 py-12 text-center">
                    <p className="text-sm text-gray-400 mb-3">Nav pievienotu tēmu</p>
                    <button onClick={addRow} className="text-vea-green hover:underline text-sm font-medium">
                        + Pievienot pirmo tēmu
                    </button>
                </div>
            ) : (
                <>
                    <div className="space-y-2">
                        {rows.map((row, idx) => (
                            <EditableCard
                                key={row.id ?? row.tempId}
                                index={idx + 1}
                                isDragging={dragRowIdx === idx}
                                onDragStart={() => setDragRowIdx(idx)}
                                onDragOver={handleDragOver}
                                onDrop={() => handleDrop(idx)}
                                onDragEnd={() => setDragRowIdx(null)}
                                onDuplicate={() => duplicateRow(idx)}
                                onRemove={() => removeRow(idx)}
                            >
                                {/* Title */}
                                <div>
                                    <input
                                        type="text"
                                        value={row.title}
                                        onChange={e => updateRow(idx, 'title', e.target.value)}
                                        placeholder="Tēmas nosaukums"
                                        className={`w-full border rounded px-2 py-1.5 text-sm outline-none focus:ring-1 ${
                                            emptyTitleIndices.has(idx)
                                                ? 'border-red-500 bg-red-50 focus:border-red-500 focus:ring-red-300'
                                                : 'border-gray-300 focus:border-vea-green focus:ring-vea-green'
                                        }`}
                                    />
                                    {emptyTitleIndices.has(idx) && (
                                        <p className="text-red-500 text-xs mt-0.5">Nosaukums ir obligāts</p>
                                    )}
                                </div>

                                {/* Description */}
                                <RichTextEditor
                                    initialValue={row.description}
                                    onChange={val => updateRow(idx, 'description', val)}
                                />
                            </EditableCard>
                        ))}
                    </div>

                    <button onClick={addRow} className="text-vea-green hover:underline text-sm">
                        + Pievienot tēmu
                    </button>
                </>
            )}

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
