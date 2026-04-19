import { useState } from 'react';
import api from '../../services/axiosConfig';
import { useToast } from '../ui/ToastProvider';
import StickyBar from '../ui/StickyBar';

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
    const showToast = useToast();
    const [form, setForm] = useState({
        academicHoursTotal: data.academicHoursTotal ?? 0,
        lectureHours: data.lectureHours ?? 0,
        practClassesHours: data.practClassesHours ?? 0,
        independentWorkHours: data.independentWorkHours ?? 0,
        language: data.languageCode ?? 'lv',
        assessmentFormId: data.assessmentFormId ?? '',
        goal: data.goal ?? '',
        annotation: data.annotation ?? '',
        prerequisitesDescription: data.prerequisitesDescription ?? '',
    });
    const [saving, setSaving] = useState(false);
    const [fieldErrors, setFieldErrors] = useState({});

    const inputClass = "w-full border rounded p-2 outline-none focus:ring-1";
    const labelClass = "block text-sm font-medium text-vea-neutral mb-1";

    const fieldClass = (name) =>
        `${inputClass} ${fieldErrors[name]
            ? 'border-red-500 bg-red-50 focus:border-red-500 focus:ring-red-300'
            : 'border-gray-300 focus:border-vea-green focus:ring-vea-green'}`;

    const handleChange = e => {
        const { name, value } = e.target;
        setForm(prev => ({ ...prev, [name]: value }));
        if (fieldErrors[name]) {
            setFieldErrors(prev => { const n = { ...prev }; delete n[name]; return n; });
        }
    };

    const blockNonNumeric = e => {
        if (['e', 'E', '+', '-', '.'].includes(e.key)) e.preventDefault();
    };

    const FieldError = ({ name, message, hoursMessage }) => {
        if (!fieldErrors[name]) return null;
        const isMismatch = fieldErrors.lectureHours && fieldErrors.practClassesHours && fieldErrors.academicHoursTotal;
        const text = (isMismatch && hoursMessage) ? hoursMessage : message;
        return <p className="text-red-500 text-sm mt-1">{text}</p>;
    };

    const handleSave = async () => {
        const missing = {};
        if (!form.academicHoursTotal) missing.academicHoursTotal = true;
        if (!form.independentWorkHours) missing.independentWorkHours = true;
        if (!form.language) missing.language = true;
        if (Object.keys(missing).length > 0) {
            setFieldErrors(missing);
            return;
        }
        const total = Number(form.academicHoursTotal);
        const lectures = Number(form.lectureHours);
        const practical = Number(form.practClassesHours);
        if (lectures + practical !== total) {
            setFieldErrors({ academicHoursTotal: true, lectureHours: true, practClassesHours: true });
            showToast(
                `Stundu neatbilstība: ${lectures} + ${practical} = ${lectures + practical}, bet kopā jābūt ${total}.`,
                'error'
            );
            return;
        }
        setFieldErrors({});
        setSaving(true);
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
            showToast('Apraksts saglabāts veiksmīgi!');
            onSaved();
        } catch (err) {
            showToast('Saglabāšana neizdevās. Pārbaudi datus un mēģini vēlreiz.', 'error');
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="space-y-4 pb-20">

            <div className="grid grid-cols-2 gap-4">
                <div>
                    <label className={labelClass}>
                        Kopējās ak. stundas <span className="text-red-500">*</span>
                    </label>
                    <input type="number" name="academicHoursTotal" min="0"
                        value={form.academicHoursTotal} onChange={handleChange} onKeyDown={blockNonNumeric}
                        className={fieldClass('academicHoursTotal')} />
                    <FieldError name="academicHoursTotal" message="Lauks ir obligāts" hoursMessage="Neatbilst lekciju un praktisko summai" />
                </div>
                <div>
                    <label className={labelClass}>Lekciju stundas</label>
                    <input type="number" name="lectureHours" min="0"
                        value={form.lectureHours} onChange={handleChange} onKeyDown={blockNonNumeric}
                        className={fieldClass('lectureHours')} />
                    <FieldError name="lectureHours" message="Neatbilst kopējai summai" />
                </div>
                <div>
                    <label className={labelClass}>Praktisko nodarbību stundas</label>
                    <input type="number" name="practClassesHours" min="0"
                        value={form.practClassesHours} onChange={handleChange} onKeyDown={blockNonNumeric}
                        className={fieldClass('practClassesHours')} />
                    <FieldError name="practClassesHours" message="Neatbilst kopējai summai" />
                </div>
                <div>
                    <label className={labelClass}>
                        Patstāvīgā darba stundas <span className="text-red-500">*</span>
                    </label>
                    <input type="number" name="independentWorkHours" min="0"
                        value={form.independentWorkHours} onChange={handleChange} onKeyDown={blockNonNumeric}
                        className={fieldClass('independentWorkHours')} />
                    <FieldError name="independentWorkHours" message="Lauks ir obligāts" />
                </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
                <div>
                    <label className={labelClass}>
                        Mācību valoda <span className="text-red-500">*</span>
                    </label>
                    <select name="language" value={form.language} onChange={handleChange} className={fieldClass('language')}>
                        <option value="lv">Latviešu</option>
                        <option value="en">Angļu</option>
                    </select>
                </div>
                <div>
                    <label className={labelClass}>Pārbaudes forma</label>
                    <select name="assessmentFormId" value={form.assessmentFormId} onChange={handleChange} className={inputClass}>
                        <option value="">— nav norādīta —</option>
                        {(lookups.assessmentForms || []).map(af => (
                            <option key={af.id} value={af.id}>{af.name}</option>
                        ))}
                    </select>
                </div>
            </div>

            <div>
                <label className={labelClass}>Kursa mērķis</label>
                <textarea name="goal" value={form.goal} onChange={handleChange} rows={3}
                          className={inputClass} />
            </div>

            <div>
                <label className={labelClass}>Anotācija</label>
                <textarea name="annotation" value={form.annotation} onChange={handleChange} rows={3}
                          className={inputClass} />
            </div>

            <div>
                <label className={labelClass}>Priekšnosacījumu apraksts</label>
                <textarea name="prerequisitesDescription" value={form.prerequisitesDescription}
                          onChange={handleChange} rows={2} className={inputClass} />
            </div>

            {/* Fiksētā saglabāšanas josla — tikai pogas */}
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

export default CourseInfoBasicSection;
