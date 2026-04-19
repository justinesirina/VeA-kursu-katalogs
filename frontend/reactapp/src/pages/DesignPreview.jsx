/**
 * Dizaina preview lapa — Kalendāra tabulas variantu salīdzināšana.
 * Piekļūstams /design-preview ceļā. Nav produktīvi redzams.
 */

const MOCK_PLAN = [
    { nr: 1, title: 'Ievads', sessions: [{ type: 'Lekcija', hours: 2 }] },
    { nr: 2, title: 'Mainīgā jēdziens, pamata jeb iebūvētie datu tipi', sessions: [
        { type: 'Lekcija', hours: 4 }, { type: 'Praktiskā nodarbība', hours: 2 }
    ]},
    { nr: 3, title: 'Programmēšanas valoda C++', sessions: [{ type: 'Praktiskā nodarbība', hours: 2 }] },
    { nr: 4, title: 'Attieksmes un loģiskie operatori. Zarošanās priekšraksti.', sessions: [
        { type: 'Pārbaudes darbs', hours: 2 }, { type: 'Lekcija', hours: 4 }
    ]},
    { nr: 5, title: 'Atkārtojuma priekšraksti.', sessions: [
        { type: 'Lekcija', hours: 2 }, { type: 'Laboratorijas darbs', hours: 4 }, { type: 'Lekcija', hours: 2 }
    ]},
    { nr: 6, title: 'Funkcijas jēdziens', sessions: [
        { type: 'Lekcija', hours: 4 }, { type: 'Apgrieztā klase', hours: 1 }, { type: 'Lekcija', hours: 2 }
    ]},
    { nr: 7, title: 'Masīvi, to izveidošana un lietošana', sessions: [{ type: 'Praktiskā nodarbība', hours: 4 }] },
];

const TOTAL = MOCK_PLAN.reduce((s, p) => s + p.sessions.reduce((x, y) => x + y.hours, 0), 0);

const sum = (p) => p.sessions.reduce((s, x) => s + x.hours, 0);

// --- Ak.st. kolonnas renderi ---
const HoursPlain = ({ v }) => <span className="text-base font-semibold text-vea-neutral">{v}</span>;
const HoursAccent = ({ v }) => <span className="text-xl font-bold text-vea-green">{v}</span>;

// === VARIANTS A: Tekstuāls — nodarbības ar separatoru ===
function CalendarA({ Hours }) {
    return (
        <div className="rounded-lg overflow-hidden border border-gray-200 border-t-4 border-t-vea-green bg-white shadow-sm">
            <div className="grid grid-cols-[3rem_minmax(12rem,1fr)_minmax(0,2fr)_5rem] bg-vea-green-light text-sm font-semibold text-vea-neutral uppercase tracking-wider">
                <div className="px-4 py-3 text-center">Nr.</div>
                <div className="px-4 py-3">Tēma</div>
                <div className="px-4 py-3">Nodarbības</div>
                <div className="px-4 py-3 text-center">Ak. st.</div>
            </div>
            <ul className="divide-y divide-gray-100">
                {MOCK_PLAN.map(p => (
                    <li key={p.nr} className="grid grid-cols-[3rem_minmax(12rem,1fr)_minmax(0,2fr)_5rem] hover:bg-vea-green-light/40 transition-colors">
                        <div className="px-4 py-2.5 text-center text-gray-500 text-base">{p.nr}.</div>
                        <div className="px-4 py-2.5 font-medium text-base text-vea-text">{p.title}</div>
                        <div className="px-4 py-2.5 text-base text-vea-text">
                            {p.sessions.map((s, i) => (
                                <span key={i}>
                                    {i > 0 && <span className="text-gray-300 mx-2">•</span>}
                                    <span className="text-vea-neutral/60">{i + 1}.</span>{' '}
                                    <span className="font-medium">{s.type}</span>{' '}
                                    <span className="text-vea-green-dark font-semibold">{s.hours} ak.st.</span>
                                </span>
                            ))}
                        </div>
                        <div className="px-4 py-2.5 text-center"><Hours v={sum(p)} /></div>
                    </li>
                ))}
            </ul>
            <div className="grid grid-cols-[3rem_minmax(12rem,1fr)_minmax(0,2fr)_5rem] bg-vea-green-light font-semibold text-vea-neutral border-t border-gray-200">
                <div className="col-span-3 px-4 py-2.5 text-right text-base">Kopā:</div>
                <div className="px-4 py-2.5 text-center text-base">{TOTAL}</div>
            </div>
        </div>
    );
}

// === VARIANTS B: Vienkāršots pill (bez border, vienota krāsa) ===
function CalendarB({ Hours }) {
    return (
        <div className="rounded-lg overflow-hidden border border-gray-200 border-t-4 border-t-vea-green bg-white shadow-sm">
            <div className="grid grid-cols-[3rem_minmax(12rem,1fr)_minmax(0,2fr)_5rem] bg-vea-green-light text-sm font-semibold text-vea-neutral uppercase tracking-wider">
                <div className="px-4 py-3 text-center">Nr.</div>
                <div className="px-4 py-3">Tēma</div>
                <div className="px-4 py-3">Nodarbības</div>
                <div className="px-4 py-3 text-center">Ak. st.</div>
            </div>
            <ul className="divide-y divide-gray-100">
                {MOCK_PLAN.map(p => (
                    <li key={p.nr} className="grid grid-cols-[3rem_minmax(12rem,1fr)_minmax(0,2fr)_5rem] hover:bg-vea-green-light/40 transition-colors">
                        <div className="px-4 py-2.5 text-center text-gray-500 text-base">{p.nr}.</div>
                        <div className="px-4 py-2.5 font-medium text-base text-vea-text">{p.title}</div>
                        <div className="px-4 py-2.5">
                            <div className="flex flex-wrap gap-1.5">
                                {p.sessions.map((s, i) => (
                                    <span key={i} className="inline-flex items-center gap-1.5 bg-vea-green-light/60 text-vea-neutral rounded-full px-3 py-0.5 text-sm">
                                        <span className="text-vea-neutral/60 font-medium">{i + 1}.</span>
                                        <span>{s.type}</span>
                                        <span className="font-semibold">{s.hours} ak.st.</span>
                                    </span>
                                ))}
                            </div>
                        </div>
                        <div className="px-4 py-2.5 text-center"><Hours v={sum(p)} /></div>
                    </li>
                ))}
            </ul>
            <div className="grid grid-cols-[3rem_minmax(12rem,1fr)_minmax(0,2fr)_5rem] bg-vea-green-light font-semibold text-vea-neutral border-t border-gray-200">
                <div className="col-span-3 px-4 py-2.5 text-right text-base">Kopā:</div>
                <div className="px-4 py-2.5 text-center text-base">{TOTAL}</div>
            </div>
        </div>
    );
}

// === VARIANTS C: Vertikāls numurēts saraksts (atbilst edit skatam) ===
function CalendarC({ Hours }) {
    return (
        <div className="rounded-lg overflow-hidden border border-gray-200 border-t-4 border-t-vea-green bg-white shadow-sm">
            <div className="grid grid-cols-[3rem_minmax(12rem,1fr)_minmax(0,2fr)_5rem] bg-vea-green-light text-sm font-semibold text-vea-neutral uppercase tracking-wider">
                <div className="px-4 py-3 text-center">Nr.</div>
                <div className="px-4 py-3">Tēma</div>
                <div className="px-4 py-3">Nodarbības</div>
                <div className="px-4 py-3 text-center">Ak. st.</div>
            </div>
            <ul className="divide-y divide-gray-100">
                {MOCK_PLAN.map(p => (
                    <li key={p.nr} className="grid grid-cols-[3rem_minmax(12rem,1fr)_minmax(0,2fr)_5rem] hover:bg-vea-green-light/40 transition-colors">
                        <div className="px-4 py-3 text-center text-gray-500 text-base align-top">{p.nr}.</div>
                        <div className="px-4 py-3 font-medium text-base text-vea-text align-top">{p.title}</div>
                        <div className="px-4 py-3 space-y-1.5">
                            {p.sessions.map((s, i) => (
                                <div key={i} className="flex items-center gap-2 text-sm">
                                    <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-vea-green-light text-vea-green font-bold text-xs shrink-0">{i + 1}</span>
                                    <span className="w-1 h-4 bg-vea-green rounded-full shrink-0" aria-hidden="true"></span>
                                    <span className="flex-1 text-vea-text">{s.type}</span>
                                    <span className="text-vea-green-dark font-semibold shrink-0">{s.hours} ak.st.</span>
                                </div>
                            ))}
                        </div>
                        <div className="px-4 py-3 text-center"><Hours v={sum(p)} /></div>
                    </li>
                ))}
            </ul>
            <div className="grid grid-cols-[3rem_minmax(12rem,1fr)_minmax(0,2fr)_5rem] bg-vea-green-light font-semibold text-vea-neutral border-t border-gray-200">
                <div className="col-span-3 px-4 py-2.5 text-right text-base">Kopā:</div>
                <div className="px-4 py-2.5 text-center text-base">{TOTAL}</div>
            </div>
        </div>
    );
}

function DesignPreview() {
    return (
        <div className="p-6 max-w-6xl mx-auto space-y-10">
            <header className="space-y-2">
                <h1 className="text-4xl font-bold font-heading text-vea-neutral">Kalendāra tabulas dizaina salīdzinājums</h1>
                <p className="text-vea-text">Trīs varianti × divas "Ak. st." stila iespējas. Izvēlies labāko pāri.</p>
            </header>

            {/* ── Ak. st. akcents: LIELĀKS ZAĻŠ ── */}
            <section className="space-y-8">
                <h2 className="text-2xl font-semibold font-heading text-vea-green border-b-2 border-vea-green pb-1">
                    Kolonna "Ak. st." — liels zaļš akcents (text-xl font-bold text-vea-green)
                </h2>

                <div className="space-y-3">
                    <h3 className="text-xl font-semibold font-heading text-vea-neutral">Variants A — teksts ar separatoriem</h3>
                    <p className="text-sm text-gray-500">Kompakti, minimāls vizuālais troksnis, atbilst SKR un Literātūras sarakstu stilam.</p>
                    <CalendarA Hours={HoursAccent} />
                </div>

                <div className="space-y-3">
                    <h3 className="text-xl font-semibold font-heading text-vea-neutral">Variants B — vienkāršots pill</h3>
                    <p className="text-sm text-gray-500">Saglabā pill formu, bet bez border un bez iekšējām krāsu variācijām.</p>
                    <CalendarB Hours={HoursAccent} />
                </div>

                <div className="space-y-3">
                    <h3 className="text-xl font-semibold font-heading text-vea-neutral">Variants C — vertikāls numurēts saraksts</h3>
                    <p className="text-sm text-gray-500">Atbilst Kalendāra rediģēšanas skatam (numurēts aplis + zaļa zālīte).</p>
                    <CalendarC Hours={HoursAccent} />
                </div>
            </section>

            {/* ── Ak. st. akcents: PARASTS ── */}
            <section className="space-y-8">
                <h2 className="text-2xl font-semibold font-heading text-vea-neutral border-b-2 border-gray-300 pb-1">
                    Kolonna "Ak. st." — parasts stils (text-base font-semibold)
                </h2>

                <div className="space-y-3">
                    <h3 className="text-xl font-semibold font-heading text-vea-neutral">Variants A — teksts ar separatoriem</h3>
                    <CalendarA Hours={HoursPlain} />
                </div>

                <div className="space-y-3">
                    <h3 className="text-xl font-semibold font-heading text-vea-neutral">Variants B — vienkāršots pill</h3>
                    <CalendarB Hours={HoursPlain} />
                </div>

                <div className="space-y-3">
                    <h3 className="text-xl font-semibold font-heading text-vea-neutral">Variants C — vertikāls numurēts saraksts</h3>
                    <CalendarC Hours={HoursPlain} />
                </div>
            </section>
        </div>
    );
}

export default DesignPreview;
