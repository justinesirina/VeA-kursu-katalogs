import { useState } from 'react';
import api from '../../services/axiosConfig';

/**
 * Rediģēšanas forma CourseInfo pamata laukiem.
 * Saglabā ar PUT /api/course-info/{courseInfoId}.
 *
 * @param {string} courseInfoId - CourseInfo UUID
 * @param {object} data - sākotnējie dati no CourseDetailsDTO
 * @param {Array}  lookups.assessmentForms - [{id, name}]
 * @param {Function} onSaved - izsaucam pēc veiksmīgas saglabāšanas
 * @param {Function} onCancel - izsaucam, kad lietotājs atceļ
 */
function CourseInfoBasicSection({ courseInfoId, data, lookups, onSaved, onCancel }) {
    const [form, setForm] = useState({
        academicHoursTotal: data.academicHoursTotal ?? 0,
        lectureHours: data.lectureHours ?? 0,
        practClassesHours: data.practClassesHours ?? 0,
        independentWorkHours: data.independentWorkHours ?? 0,
        language: data.language ?? 'lv',
        assessmentFormId: data.assessmentFormId ?? '',
        goal: data.goal ?? '',
        annotation: data.annotation ?? '',
        prerequisitesDescription: data.prerequisitesDescription ?? '',
    });
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState(null);

    const handleChange = e => {
        const { name, value } = e.target;
        setForm(prev => ({ ...prev, [name]: value }));
    };

    const handleSave = async () => {
        if (!form.academicHoursTotal || !form.independentWorkHours || !form.language) {
            setError('Obligātie lauki: kopējās stundas, patstāvīgā darba stundas, valoda.');
            return;
        }
        setSaving(true);
        setError(null);
        try {
            const payload = {
                academicHoursTotal: Number(form.academicHoursTotal),
                lectureHours: Number(form.lectureHours),
                practClassesHours: Number(form.practClassesHours),
                independentWorkHours: Number(form.independentWorkHours),
                language: form.language,
                assessmentForm: form.assessmentFormId ? { id: Number(form.assessmentFormId) } : null,
                goal: form.goal || null,
                annotation: form.annotation || null,
                prerequisitesDescription: form.prerequisitesDescription || null,
            };
            await api.put(`/course-info/${courseInfoId}`, payload);
            onSaved();
        } catch (err) {
            setError('Saglabāšana neizdevās. Pārbaudi datus un mēģini vēlreiz.');
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="space-y-4">
            {error && <p className="text-red-600 text-sm">{error}</p>}

            <div className="grid grid-cols-2 gap-4">
                <div>
                    <label className="block text-sm font-medium mb-1">
                        Kopējās ak. stundas <span className="text-red-500">*</span>
                    </label>
                    <input
                        type="number" name="academicHoursTotal" min="0"
                        value={form.academicHoursTotal}
                        onChange={handleChange}
                        className="w-full border rounded p-2"
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium mb-1">Lekciju stundas</label>
                    <input
                        type="number" name="lectureHours" min="0"
                        value={form.lectureHours}
                        onChange={handleChange}
                        className="w-full border rounded p-2"
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium mb-1">Praktisko nodarbību stundas</label>
                    <input
                        type="number" name="practClassesHours" min="0"
                        value={form.practClassesHours}
                        onChange={handleChange}
                        className="w-full border rounded p-2"
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium mb-1">
                        Patstāvīgā darba stundas <span className="text-red-500">*</span>
                    </label>
                    <input
                        type="number" name="independentWorkHours" min="0"
                        value={form.independentWorkHours}
                        onChange={handleChange}
                        className="w-full border rounded p-2"
                    />
                </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
                <div>
                    <label className="block text-sm font-medium mb-1">
                        Mācību valoda <span className="text-red-500">*</span>
                    </label>
                    <select name="language" value={form.language} onChange={handleChange}
                            className="w-full border rounded p-2">
                        <option value="lv">Latviešu</option>
                        <option value="en">Angļu</option>
                    </select>
                </div>
                <div>
                    <label className="block text-sm font-medium mb-1">Pārbaudes forma</label>
                    <select name="assessmentFormId" value={form.assessmentFormId} onChange={handleChange}
                            className="w-full border rounded p-2">
                        <option value="">— nav norādīta —</option>
                        {(lookups.assessmentForms || []).map(af => (
                            <option key={af.id} value={af.id}>{af.name}</option>
                        ))}
                    </select>
                </div>
            </div>

            <div>
                <label className="block text-sm font-medium mb-1">Kursa mērķis</label>
                <textarea name="goal" value={form.goal} onChange={handleChange} rows={3}
                          className="w-full border rounded p-2" />
            </div>

            <div>
                <label className="block text-sm font-medium mb-1">Anotācija</label>
                <textarea name="annotation" value={form.annotation} onChange={handleChange} rows={3}
                          className="w-full border rounded p-2" />
            </div>

            <div>
                <label className="block text-sm font-medium mb-1">Priekšnosacījumu apraksts</label>
                <textarea name="prerequisitesDescription" value={form.prerequisitesDescription}
                          onChange={handleChange} rows={2}
                          className="w-full border rounded p-2" />
            </div>

            <div className="flex gap-2">
                <button
                    onClick={handleSave} disabled={saving}
                    className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 disabled:opacity-50"
                >
                    {saving ? 'Saglabā...' : 'Saglabāt'}
                </button>
                <button
                    onClick={onCancel}
                    className="border border-gray-400 px-4 py-2 rounded hover:bg-gray-100"
                >
                    Atcelt
                </button>
            </div>
        </div>
    );
}

export default CourseInfoBasicSection;
