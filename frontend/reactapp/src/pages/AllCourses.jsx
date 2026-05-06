import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Filter as FilterIcon } from 'lucide-react';
import api from '../services/axiosConfig';
import CourseCard from '../components/CourseCard';
import ViewToggle from '../components/ViewToggle';
import CatalogSidebar from '../components/catalog/CatalogSidebar';
import CatalogFilterDrawer from '../components/catalog/CatalogFilterDrawer';
import CatalogPagination from '../components/catalog/CatalogPagination';
import useCatalogQuery from '../hooks/useCatalogQuery';
import { useCurrentUserId } from '../components/ui/CurrentUserSwitcher';
import { statusBadgeClass } from '../utils/statusBadge';

const STAFF_ROLE_NAMES = new Set([
    'Pasniedzējs',
    'Programmas direktors',
    'Administrators',
    'Sistēmas administrators',
]);

function teacherSummary(item) {
    const names = (item.teachers || [])
        .slice(0, 2)
        .map(t => `${t.name || ''} ${t.surname || ''}`.trim())
        .filter(Boolean);
    if (names.length === 0) return '—';
    const more = Math.max(0, (item.teachers?.length || 0) - names.length);
    return more > 0 ? `${names.join(', ')} +${more}` : names.join(', ');
}

function AllCourses() {
    const navigate = useNavigate();
    const currentUserId = useCurrentUserId();

    const [view, setView] = useState('cards');
    const [drawerOpen, setDrawerOpen] = useState(false);

    const [isDesktop, setIsDesktop] = useState(() => {
        if (typeof window === 'undefined') return true;
        return window.matchMedia('(min-width: 768px)').matches;
    });
    useEffect(() => {
        if (typeof window === 'undefined') return undefined;
        const mq = window.matchMedia('(min-width: 768px)');
        const onChange = e => setIsDesktop(e.matches);
        mq.addEventListener('change', onChange);
        return () => mq.removeEventListener('change', onChange);
    }, []);
    const effectiveView = isDesktop ? view : 'cards';

    const [lookups, setLookups] = useState({
        faculties: [],
        programs: [],
        programParts: [],
        academicYears: [],
        semesters: [],
        users: [],
        statuses: [],
    });
    const [lookupsLoaded, setLookupsLoaded] = useState(false);

    useEffect(() => {
        let cancelled = false;
        Promise.all([
            api.get('/faculties').catch(() => ({ data: [] })),
            api.get('/study-programs').catch(() => ({ data: [] })),
            api.get('/study-program-parts').catch(() => ({ data: [] })),
            api.get('/academic-years').catch(() => ({ data: [] })),
            api.get('/semesters').catch(() => ({ data: [] })),
            api.get('/users').catch(() => ({ data: [] })),
            api.get('/version-statuses').catch(() => ({ data: [] })),
        ]).then(([fac, prog, parts, years, sems, users, statuses]) => {
            if (cancelled) return;
            setLookups({
                faculties: fac.data || [],
                programs: prog.data || [],
                programParts: parts.data || [],
                academicYears: years.data || [],
                semesters: sems.data || [],
                users: users.data || [],
                statuses: statuses.data || [],
            });
            setLookupsLoaded(true);
        });
        return () => { cancelled = true; };
    }, []);

    const isStaff = useMemo(() => {
        if (!currentUserId) return false;
        const me = lookups.users.find(u => u.id === currentUserId);
        return !!me && STAFF_ROLE_NAMES.has(me.role?.roleName);
    }, [currentUserId, lookups.users]);

    const {
        filters,
        qDraft,
        setQDraft,
        toggleFilter,
        clearAllFilters,
        page,
        size,
        setPage,
        setSize,
        data,
        loading,
        error,
        ALLOWED_SIZES,
    } = useCatalogQuery();

    const sidebar = (
        <CatalogSidebar
            filters={filters}
            toggleFilter={toggleFilter}
            clearAllFilters={clearAllFilters}
            showStatusFilter={isStaff}
            lookups={lookups}
        />
    );

    return (
        <div className="p-6 max-w-7xl mx-auto">
            <div className="flex items-center gap-3 mb-4 flex-wrap">
                <input
                    type="text"
                    placeholder="Meklēt pēc nosaukuma vai koda..."
                    className="flex-1 min-w-[14rem] p-2 border border-gray-300 rounded focus:border-vea-green focus:ring-1 focus:ring-vea-green outline-none text-base"
                    value={qDraft}
                    onChange={e => setQDraft(e.target.value)}
                    aria-label="Meklēt kursus"
                />
                <button
                    type="button"
                    onClick={() => setDrawerOpen(true)}
                    className="md:hidden inline-flex items-center gap-1.5 bg-white text-vea-green border border-vea-green px-3 py-2 rounded hover:bg-vea-green-light text-sm"
                    aria-label="Atvērt filtrus"
                >
                    <FilterIcon className="w-4 h-4" aria-hidden="true" />
                    Filtri
                </button>
                <div className="hidden md:flex">
                    <ViewToggle view={view} setView={setView} />
                </div>
                <button
                    onClick={() => navigate('/courses/new')}
                    className="bg-vea-green text-white px-4 py-2 rounded hover:bg-vea-green-dark text-base whitespace-nowrap"
                >
                    + Pievienot kursu
                </button>
                <div aria-live="polite" className="sr-only">
                    {loading
                        ? 'Ielādē...'
                        : data.totalElements === 0
                            ? 'Nav rezultātu'
                            : `${data.totalElements} kursi atrasti`}
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-[1fr,18rem] gap-6 items-start">
                <div className="min-w-0">
                    {error && (
                        <div className="bg-red-50 border border-red-200 text-red-700 rounded-lg p-4 mb-4">
                            {error}
                        </div>
                    )}

                    {loading ? (
                        <div className="p-8 text-center text-gray-500">Ielādē kursus...</div>
                    ) : data.content.length === 0 ? (
                        <div className="bg-white border border-gray-200 rounded-lg p-8 text-center text-gray-500">
                            Nav neviena kursa, kas atbilst meklēšanai un filtriem.
                        </div>
                    ) : effectiveView === 'cards' ? (
                        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
                            {data.content.map(item => (
                                <CourseCard key={item.courseId} item={item} />
                            ))}
                        </div>
                    ) : (
                        <div className="vea-table-wrap">
                            <table className="vea-table">
                                <thead>
                                <tr>
                                    <th scope="col">Nosaukums</th>
                                    <th scope="col">Kods</th>
                                    <th scope="col" className="text-center w-16">KP</th>
                                    <th scope="col">Fakultāte</th>
                                    <th scope="col">Gads/Sem</th>
                                    <th scope="col">Pasniedzējs</th>
                                    {isStaff && <th scope="col">Statuss</th>}
                                    <th scope="col" aria-label="Darbības" />
                                </tr>
                                </thead>
                                <tbody>
                                {data.content.map(item => (
                                    <tr key={item.courseId}>
                                        <td className="vea-td">
                                            <button
                                                onClick={() => navigate(`/courses/${item.courseId}`)}
                                                className="text-vea-green hover:underline text-left block"
                                            >
                                                {item.titleLv}
                                            </button>
                                            {item.titleEn && (
                                                <span className="block text-xs text-gray-500 italic">
                                                    {item.titleEn}
                                                </span>
                                            )}
                                        </td>
                                        <td className="vea-td text-gray-600">{item.courseCode || '—'}</td>
                                        <td className="vea-td text-gray-600 text-center">{item.credits}</td>
                                        <td className="vea-td text-gray-600">{item.facultyName || '—'}</td>
                                        <td className="vea-td text-gray-600">
                                            {[item.academicYearName, item.semesterName].filter(Boolean).join(' / ') || '—'}
                                        </td>
                                        <td className="vea-td text-gray-600">{teacherSummary(item)}</td>
                                        {isStaff && (
                                            <td className="vea-td">
                                                {item.statusName && (
                                                    <span className={statusBadgeClass(item.statusName)}>
                                                        {item.statusName}
                                                    </span>
                                                )}
                                            </td>
                                        )}
                                        <td className="vea-td">
                                            <button
                                                className="text-vea-green hover:underline"
                                                onClick={() => navigate(`/courses/${item.courseId}`)}
                                            >
                                                Skatīt
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                                </tbody>
                            </table>
                        </div>
                    )}

                    <CatalogPagination
                        page={page}
                        size={size}
                        totalElements={data.totalElements}
                        totalPages={data.totalPages}
                        allowedSizes={ALLOWED_SIZES}
                        onPageChange={setPage}
                        onSizeChange={setSize}
                    />
                </div>

                <div className="hidden md:block">
                    {lookupsLoaded ? sidebar : (
                        <div className="bg-white border border-gray-200 rounded-lg p-4 text-sm text-gray-500">
                            Ielādē filtrus...
                        </div>
                    )}
                </div>

                <CatalogFilterDrawer open={drawerOpen} onClose={() => setDrawerOpen(false)}>
                    {lookupsLoaded ? sidebar : (
                        <div className="p-4 text-sm text-gray-500">Ielādē filtrus...</div>
                    )}
                </CatalogFilterDrawer>
            </div>
        </div>
    );
}

export default AllCourses;
