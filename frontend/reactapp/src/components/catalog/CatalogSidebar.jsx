import { useState } from 'react';
import { ChevronDown, Check } from 'lucide-react';

/**
 * F5 filtru sānjosla — sakļaujamas grupas: fakultāte, programma,
 * programmas daļa, akadēmiskais gads, semestris, autors, pasniedzējs
 * un (staff lietotājiem) statuss.
 *
 * Katra grupa ir multi-select: lietotājs var atzīmēt vairākas vērtības;
 * grupas iekšienē tiek apvienotas ar OR (IN), starp grupām — ar AND.
 * Klikšķis uz atzīmētas opcijas to noņem (toggle uzvedība).
 */

function CheckboxIcon({ checked }) {
    return (
        <span
            aria-hidden="true"
            className={
                'inline-flex items-center justify-center w-4 h-4 rounded border shrink-0 '
                + (checked
                    ? 'bg-vea-green border-vea-green text-white'
                    : 'bg-white border-gray-400')
            }
        >
            {checked && <Check className="w-3 h-3" strokeWidth={3} />}
        </span>
    );
}

function FilterGroup({ title, options, selectedIds, onToggle, searchable, defaultOpen = true }) {
    const [open, setOpen] = useState(defaultOpen);
    const [filter, setFilter] = useState('');

    const visible = filter
        ? options.filter(opt => opt.label.toLowerCase().includes(filter.toLowerCase()))
        : options;

    const activeCount = selectedIds.length;

    return (
        <section className="border-b border-gray-200 last:border-b-0">
            <button
                type="button"
                onClick={() => setOpen(o => !o)}
                aria-expanded={open}
                className="w-full flex items-center justify-between px-4 py-3 text-left text-sm font-semibold text-vea-neutral hover:bg-vea-green-light"
            >
                <span className="flex items-center gap-2 min-w-0">
                    <span>{title}</span>
                    {activeCount > 0 && (
                        <span className="vea-badge bg-vea-green-light text-vea-green">
                            {activeCount}
                        </span>
                    )}
                </span>
                <ChevronDown
                    className={`w-4 h-4 transition-transform ${open ? 'rotate-180' : ''}`}
                    aria-hidden="true"
                />
            </button>
            {open && (
                <div className="px-4 pb-3 space-y-2">
                    {searchable && options.length >= 8 && (
                        <input
                            type="text"
                            value={filter}
                            onChange={e => setFilter(e.target.value)}
                            placeholder="Meklēt..."
                            className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:border-vea-green focus:ring-1 focus:ring-vea-green outline-none"
                            aria-label={`Meklēt ${title}`}
                        />
                    )}
                    <ul
                        className={
                            'space-y-1 ' + (options.length >= 8 ? 'max-h-48 overflow-y-auto pr-1' : '')
                        }
                    >
                        {visible.length === 0 && (
                            <li className="text-xs text-gray-400 px-2 py-1">Nav rezultātu</li>
                        )}
                        {visible.map(opt => {
                            const checked = selectedIds.includes(opt.id);
                            return (
                                <li key={opt.id}>
                                    <button
                                        type="button"
                                        onClick={() => onToggle(opt.id)}
                                        aria-pressed={checked}
                                        className={
                                            'w-full flex items-center gap-2 text-left px-2 py-1 text-sm rounded '
                                            + (checked
                                                ? 'bg-vea-green-light text-vea-neutral font-medium'
                                                : 'text-gray-700 hover:bg-gray-50')
                                        }
                                    >
                                        <CheckboxIcon checked={checked} />
                                        <span className="truncate">{opt.label}</span>
                                    </button>
                                </li>
                            );
                        })}
                    </ul>
                </div>
            )}
        </section>
    );
}

function CatalogSidebar({
    filters,
    toggleFilter,
    clearAllFilters,
    showStatusFilter,
    lookups,
}) {
    const {
        faculties = [],
        programs = [],
        programParts = [],
        academicYears = [],
        semesters = [],
        users = [],
        statuses = [],
    } = lookups;

    const personLabel = u => {
        const full = [u.name, u.surname].filter(Boolean).join(' ').trim();
        return full || u.email || `Lietotājs Nr. ${u.id}`;
    };

    const facultyOptions = faculties.map(f => ({ id: f.id, label: f.name }));
    const programOptions = programs.map(p => ({ id: p.id, label: p.name }));
    const partOptions = programParts.map(p => ({ id: p.id, label: p.name }));
    const yearOptions = academicYears.map(y => ({ id: y.id, label: y.name }));
    const semesterOptions = semesters.map(s => ({ id: s.id, label: s.name }));
    const statusOptions = statuses.map(s => ({ id: s.id, label: s.name }));
    const personOptions = users.map(u => ({ id: u.id, label: personLabel(u) }));

    const totalActive = (filters.facultyIds?.length || 0)
        + (filters.academicYearIds?.length || 0)
        + (filters.semesterIds?.length || 0)
        + (filters.statusIds?.length || 0)
        + (filters.programIds?.length || 0)
        + (filters.programPartIds?.length || 0)
        + (filters.authorUserIds?.length || 0)
        + (filters.teacherUserIds?.length || 0);

    return (
        <aside className="bg-white border border-gray-200 rounded-lg overflow-hidden">
            <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200">
                <h2 className="text-sm font-semibold text-vea-neutral uppercase tracking-wider flex items-center gap-2">
                    Filtri
                    {totalActive > 0 && (
                        <span className="vea-badge bg-vea-green text-white">{totalActive}</span>
                    )}
                </h2>
                {totalActive > 0 && (
                    <button
                        type="button"
                        onClick={clearAllFilters}
                        className="text-xs text-vea-green hover:underline"
                    >
                        Notīrīt visus
                    </button>
                )}
            </div>

            <FilterGroup
                title="Fakultāte"
                options={facultyOptions}
                selectedIds={filters.facultyIds || []}
                onToggle={id => toggleFilter('facultyIds', id)}
            />
            <FilterGroup
                title="Studiju programma"
                options={programOptions}
                selectedIds={filters.programIds || []}
                onToggle={id => toggleFilter('programIds', id)}
                searchable
            />
            <FilterGroup
                title="Programmas daļa"
                options={partOptions}
                selectedIds={filters.programPartIds || []}
                onToggle={id => toggleFilter('programPartIds', id)}
            />
            <FilterGroup
                title="Akadēmiskais gads"
                options={yearOptions}
                selectedIds={filters.academicYearIds || []}
                onToggle={id => toggleFilter('academicYearIds', id)}
            />
            <FilterGroup
                title="Semestris"
                options={semesterOptions}
                selectedIds={filters.semesterIds || []}
                onToggle={id => toggleFilter('semesterIds', id)}
            />
            <FilterGroup
                title="Autors"
                options={personOptions}
                selectedIds={filters.authorUserIds || []}
                onToggle={id => toggleFilter('authorUserIds', id)}
                searchable
            />
            <FilterGroup
                title="Pasniedzējs"
                options={personOptions}
                selectedIds={filters.teacherUserIds || []}
                onToggle={id => toggleFilter('teacherUserIds', id)}
                searchable
            />
            {showStatusFilter && (
                <FilterGroup
                    title="Statuss"
                    options={statusOptions}
                    selectedIds={filters.statusIds || []}
                    onToggle={id => toggleFilter('statusIds', id)}
                />
            )}
        </aside>
    );
}

export default CatalogSidebar;
