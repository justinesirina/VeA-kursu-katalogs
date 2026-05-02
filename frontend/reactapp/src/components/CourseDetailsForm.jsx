/**
 * Jauna kursa izveides "skelets" — tikai satura kodola pamatdati.
 * POST kaskāde: Course → CourseAuthor → CourseVersion (Melnraksts) → CourseInfo (tukšs).
 * Pēc veiksmīgas izveides novirza uz /courses/:id/edit, kur pilnveido saturu.
 */

import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/axiosConfig';
import { useToast } from './ui/ToastProvider';

const STAFF_ROLE_FILTER = ['Pasniedzējs', 'Programmas direktors'];

function CourseDetailsForm() {
    const navigate = useNavigate();
    const showToast = useToast();

    const [titleLv, setTitleLv] = useState('');
    const [titleEn, setTitleEn] = useState('');
    const [courseCode, setCourseCode] = useState('');
    const [credits, setCredits] = useState(2);

    // Autora izvēle ar meklēšanu
    const [users, setUsers] = useState([]);
    const [authorSearch, setAuthorSearch] = useState('');
    const [selectedAuthor, setSelectedAuthor] = useState(null);

    // Melnraksts versijas statuss (ielādēts no /version-statuses)
    const [draftStatusId, setDraftStatusId] = useState(null);

    const [submitting, setSubmitting] = useState(false);
    const [fieldErrors, setFieldErrors] = useState({});

    useEffect(() => {
        const load = async () => {
            try {
                const [usersRes, statusRes] = await Promise.all([
                    api.get('/users'),
                    api.get('/version-statuses'),
                ]);
                setUsers(usersRes.data || []);
                const draft = (statusRes.data || []).find(s => s.name === 'Melnraksts');
                if (draft) setDraftStatusId(draft.id);
                else showToast('Nav atrasts "Melnraksts" versijas statuss. Administratoram tas jāpievieno.', 'error');
            } catch {
                showToast('Neizdevās ielādēt datus. Atsvaidzini lapu.', 'error');
            }
        };
        load();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    // Palīgfunkcijas (identiskas ar CourseEditForm paraugu)
    const sanitizeTitle = (val) =>
        val.replace(/[<>"';`\\={}[\]]/g, '').replace(/https?:\/\/\S*/gi, '');
    const isUrl = (val) => /https?:\/\//i.test(val);
    const blockNonNumeric = e => {
        if (['e', 'E', '+', '-', '.'].includes(e.key)) e.preventDefault();
    };
    const personLabel = (u) => {
        const name = [u.name, u.surname].filter(Boolean).join(' ');
        const extra = [u.position, u.academicDegree].filter(Boolean).join(', ');
        return extra ? `${name}, ${extra}` : name;
    };
    const filterUsers = (query) => {
        if (!query.trim()) return [];
        const q = query.toLowerCase();
        return users
            .filter(u => STAFF_ROLE_FILTER.includes(u.role?.roleName))
            .filter(u => u.name.toLowerCase().includes(q) || u.surname.toLowerCase().includes(q))
            .slice(0, 8);
    };

    const validate = () => {
        const errs = {};
        if (!titleLv.trim()) errs.titleLv = 'Nosaukums latviski ir obligāts';
        else if (isUrl(titleLv)) errs.titleLv = 'Nosaukums nevar būt URL adrese';
        if (!titleEn.trim()) errs.titleEn = 'Nosaukums angliski ir obligāts';
        else if (isUrl(titleEn)) errs.titleEn = 'Nosaukums nevar būt URL adrese';
        if (courseCode && !/^[A-Za-z0-9]{1,10}$/.test(courseCode.trim()))
            errs.courseCode = 'Kods var saturēt tikai burtus un ciparus (maks. 10 zīmes)';
        if (!credits || Number(credits) < 1) errs.credits = 'Kredītpunkti ir obligāti (min. 1)';
        if (!selectedAuthor) errs.author = 'Izvēlies kursa autoru';
        if (!draftStatusId) errs.status = 'Trūkst "Melnraksts" statusa DB';
        return errs;
    };

    const handleCreate = async () => {
        const errs = validate();
        if (Object.keys(errs).length > 0) {
            setFieldErrors(errs);
            showToast('Pārbaudi iezīmētos obligātos laukus.', 'error');
            return;
        }
        setFieldErrors({});
        setSubmitting(true);

        let createdCourseId = null;
        const rollback = async () => {
            if (createdCourseId) {
                try { await api.delete(`/courses/${createdCourseId}`); } catch { /* klusā kļūda rollback laikā */ }
            }
        };

        try {
            // 1. Izveido Course
            const courseRes = await api.post('/courses', {
                titleLv: sanitizeTitle(titleLv.trim()),
                titleEn: sanitizeTitle(titleEn.trim()),
                courseCode: courseCode.trim() ? courseCode.trim().toUpperCase() : null,
                credits: Number(credits),
                active: true,
                archived: false,
            });
            createdCourseId = courseRes.data.id;

            // 2. Piesaista autoru
            await api.post('/course-authors', {
                course: { id: createdCourseId },
                user: { id: selectedAuthor.id },
                role: 'Autors',
            });

            // 3. Izveido Melnraksts versiju (bez ay/semestra/apstiprinājuma)
            const versionRes = await api.post('/course-versions', {
                course: { id: createdCourseId },
                status: { id: draftStatusId },
                versionNumber: 1,
                active: true,
                archived: false,
            });
            const versionId = versionRes.data.id;

            // 4. Tukšs CourseInfo, lai redaktora cilnes darbotos uzreiz
            await api.post('/course-info', {
                course: { id: createdCourseId },
                courseVersion: { id: versionId },
                academicHoursTotal: 0,
                independentWorkHours: 0,
                language: 'lv',
            });

            showToast('Kurss izveidots. Turpini aizpildīt saturu.');
            navigate(`/courses/${createdCourseId}/edit`);
        } catch (err) {
            console.error('Kļūda izveidojot kursu:', err);
            // Atsaukt Course izveidi, ja sekojošie soļi neizdevās
            await rollback();

            const msg = err?.response?.data?.message || err?.response?.data?.error || err?.message || '';
            const isDuplicate = /duplicate key|already exists|unique constraint/i.test(msg) || /course_code/.test(msg);

            if (isDuplicate && !createdCourseId) {
                setFieldErrors(p => ({ ...p, courseCode: 'Šis kursa kods jau izmantots citam kursam' }));
                showToast('Kursa kods jau izmantots. Izvēlies citu vai atstāj tukšu.', 'error');
            } else if (createdCourseId) {
                showToast('Kurss izveidots tikai daļēji un tika atcelts. Mēģini vēlreiz.', 'error');
            } else {
                showToast('Neizdevās izveidot kursu. Pārbaudi datus un mēģini vēlreiz.', 'error');
            }
        } finally {
            setSubmitting(false);
        }
    };

    const inputBase = "w-full p-2 border rounded focus:ring-1 outline-none";
    const inputOk  = `${inputBase} border-gray-300 focus:border-vea-green focus:ring-vea-green`;
    const inputErr = `${inputBase} border-red-500 bg-red-50 focus:border-red-500 focus:ring-red-300`;
    const inputClass = (field) => fieldErrors[field] ? inputErr : inputOk;
    const labelClass = "block text-sm font-medium text-vea-neutral mb-1";
    const FieldError = ({ field }) =>
        fieldErrors[field] ? <p className="text-red-500 text-sm mt-0.5">{fieldErrors[field]}</p> : null;

    const filteredUsers = filterUsers(authorSearch);

    return (
        <div className="p-6 max-w-3xl mx-auto space-y-6">
            <p className="text-base text-vea-text">
                Ievadi kursa pamata datus. Pēc izveides turpināsi aizpildīt saturu rediģēšanas skatā, kurā varēsi pievienot detalizētus kursa datus.
            </p>

            <section className="bg-white rounded-lg p-5 border border-gray-200 space-y-4">
                <h2 className="text-2xl font-semibold font-heading text-vea-neutral">Kursa pamatinformācija</h2>

                <div>
                    <label className={labelClass} htmlFor="titleLv">
                        Nosaukums latviski <span className="text-red-500">*</span>
                    </label>
                    <input id="titleLv" type="text" maxLength={200}
                           className={inputClass('titleLv')}
                           value={titleLv}
                           onChange={e => {
                               setTitleLv(sanitizeTitle(e.target.value));
                               if (fieldErrors.titleLv) setFieldErrors(p => { const n = {...p}; delete n.titleLv; return n; });
                           }}
                           placeholder="Piemēram: Datoru tīkli" />
                    <FieldError field="titleLv" />
                </div>

                <div>
                    <label className={labelClass} htmlFor="titleEn">
                        Nosaukums angliski <span className="text-red-500">*</span>
                    </label>
                    <input id="titleEn" type="text" maxLength={200}
                           className={inputClass('titleEn')}
                           value={titleEn}
                           onChange={e => {
                               setTitleEn(sanitizeTitle(e.target.value));
                               if (fieldErrors.titleEn) setFieldErrors(p => { const n = {...p}; delete n.titleEn; return n; });
                           }}
                           placeholder="Piemēram: Computer Networks" />
                    <FieldError field="titleEn" />
                </div>

                <div>
                    <label className={labelClass} htmlFor="courseCode">
                        Kursa kods
                        <span className="text-xs text-gray-500 font-normal ml-1">
                            (neobligāts — piešķir pēc apstiprinājuma)
                        </span>
                    </label>
                    <input id="courseCode" type="text" maxLength={10}
                           className={inputClass('courseCode')}
                           value={courseCode}
                           onChange={e => {
                               const v = e.target.value.replace(/[^A-Za-z0-9]/g, '').slice(0, 10);
                               setCourseCode(v);
                               if (fieldErrors.courseCode) setFieldErrors(p => { const n = {...p}; delete n.courseCode; return n; });
                           }}
                           placeholder="Piemēram: ITB101" />
                    <FieldError field="courseCode" />
                </div>

                <div>
                    <label className={labelClass} htmlFor="credits">
                        Kredītpunkti <span className="text-red-500">*</span>
                    </label>
                    <input id="credits" type="number" min={1} max={9999}
                           className={inputClass('credits')}
                           value={credits}
                           onKeyDown={blockNonNumeric}
                           onChange={e => {
                               const v = e.target.value.replace(/[^0-9]/g, '').slice(0, 4);
                               setCredits(v);
                               if (fieldErrors.credits) setFieldErrors(p => { const n = {...p}; delete n.credits; return n; });
                           }} />
                    <FieldError field="credits" />
                </div>
            </section>

            <section className="bg-white rounded-lg p-5 border border-gray-200 space-y-3">
                <h2 className="text-2xl font-semibold font-heading text-vea-neutral">
                    Kursa autors <span className="text-red-500 text-base">*</span>
                </h2>

                {selectedAuthor ? (
                    <div className="flex items-center justify-between border border-gray-200 rounded px-3 py-2 text-sm">
                        <span className="text-vea-text min-w-0">
                            {personLabel(selectedAuthor)}
                            <span className="ml-2 text-xs bg-vea-green-light text-vea-green px-1.5 py-0.5 rounded-full">Autors</span>
                        </span>
                        <button onClick={() => setSelectedAuthor(null)}
                                className="text-red-400 hover:text-red-600 ml-3 shrink-0"
                                aria-label="Noņemt autoru">✕</button>
                    </div>
                ) : (
                    <div className="relative">
                        <input type="text" className={inputClass('author')}
                               value={authorSearch}
                               onChange={e => {
                                   setAuthorSearch(e.target.value);
                                   if (fieldErrors.author) setFieldErrors(p => { const n = {...p}; delete n.author; return n; });
                               }}
                               onBlur={() => setTimeout(() => setAuthorSearch(''), 150)}
                               placeholder="Meklēt autoru pēc vārda vai uzvārda..." />
                        {filteredUsers.length > 0 && (
                            <ul className="absolute z-20 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-52 overflow-y-auto">
                                {filteredUsers.map(u => (
                                    <li key={u.id}
                                        onMouseDown={() => {
                                            setSelectedAuthor(u);
                                            setAuthorSearch('');
                                        }}
                                        className="px-3 py-2 hover:bg-vea-green-light cursor-pointer text-sm text-vea-text">
                                        {personLabel(u)}
                                    </li>
                                ))}
                            </ul>
                        )}
                    </div>
                )}
                <FieldError field="author" />
                <p className="text-xs text-gray-500">
                    Papildu autorus un mācībspēkus varēs pievienot pēc izveides rediģēšanas skatā.
                </p>
            </section>

            <div className="flex gap-3">
                <button onClick={() => navigate('/')}
                        className="bg-white border border-gray-300 px-4 py-2 rounded hover:bg-gray-100 text-vea-neutral">
                    Atcelt
                </button>
                <button onClick={handleCreate} disabled={submitting || !draftStatusId}
                        className="bg-vea-green text-white px-4 py-2 rounded hover:bg-vea-green-dark disabled:opacity-50 disabled:cursor-not-allowed">
                    {submitting ? 'Izveido...' : 'Izveidot kursu'}
                </button>
            </div>
        </div>
    );
}

export default CourseDetailsForm;
