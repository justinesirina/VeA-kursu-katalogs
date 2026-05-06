import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import api from '../services/axiosConfig';

/**
 * F5 hook — sinhronizē kataloga filtru stāvokli ar URL searchParams un
 * pieprasa /api/courses/catalog. Teksta meklēšana tiek debounce'ota
 * (DEBOUNCE_MS), pārējie filtri lieto URL uzreiz.
 *
 * Filtri ir multi-select — katra grupa glabājas kā skaitļu masīvs un
 * URL parametrā atkārtojas vairākas reizes (piem., ?facultyIds=1&facultyIds=2).
 * `toggleFilter(key, value)` pievieno vai noņem vērtību no masīva.
 */

const DEBOUNCE_MS = 300;

const LIST_FILTER_KEYS = [
    'facultyIds',
    'academicYearIds',
    'semesterIds',
    'statusIds',
    'programIds',
    'programPartIds',
    'authorUserIds',
    'teacherUserIds',
];

const DEFAULT_PAGE_SIZE = 25;
const ALLOWED_SIZES = [25, 50, 100, 500];

function readNumberArray(searchParams, key) {
    return searchParams.getAll(key)
        .map(v => Number(v))
        .filter(n => Number.isFinite(n));
}

function buildFilters(searchParams) {
    const filters = {
        q: searchParams.get('q') || '',
    };
    LIST_FILTER_KEYS.forEach(key => {
        filters[key] = readNumberArray(searchParams, key);
    });
    return filters;
}

function buildPaging(searchParams) {
    const rawPage = Number(searchParams.get('page'));
    const rawSize = Number(searchParams.get('size'));
    const page = Number.isFinite(rawPage) && rawPage >= 0 ? rawPage : 0;
    const size = ALLOWED_SIZES.includes(rawSize) ? rawSize : DEFAULT_PAGE_SIZE;
    return { page, size };
}

function arraysEqual(a, b) {
    if (a === b) return true;
    if (a.length !== b.length) return false;
    for (let i = 0; i < a.length; i += 1) {
        if (a[i] !== b[i]) return false;
    }
    return true;
}

export default function useCatalogQuery() {
    const [searchParams, setSearchParams] = useSearchParams();

    const filters = useMemo(() => buildFilters(searchParams), [searchParams]);
    const { page, size } = useMemo(() => buildPaging(searchParams), [searchParams]);

    const [qDraft, setQDraft] = useState(filters.q);
    useEffect(() => {
        setQDraft(filters.q);
    }, [filters.q]);

    const debounceRef = useRef(null);
    useEffect(() => {
        if (qDraft === filters.q) return;
        if (debounceRef.current) clearTimeout(debounceRef.current);
        debounceRef.current = setTimeout(() => {
            setSearchParams(prev => {
                const next = new URLSearchParams(prev);
                if (qDraft) next.set('q', qDraft);
                else next.delete('q');
                next.delete('page');
                return next;
            });
        }, DEBOUNCE_MS);
        return () => debounceRef.current && clearTimeout(debounceRef.current);
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [qDraft]);

    const setListFilter = useCallback((key, values) => {
        setSearchParams(prev => {
            const next = new URLSearchParams(prev);
            next.delete(key);
            (values || []).forEach(v => next.append(key, String(v)));
            next.delete('page');
            return next;
        });
    }, [setSearchParams]);

    const toggleFilter = useCallback((key, value) => {
        setSearchParams(prev => {
            const current = prev.getAll(key).map(Number);
            const numericValue = Number(value);
            const exists = current.includes(numericValue);
            const nextValues = exists
                ? current.filter(v => v !== numericValue)
                : [...current, numericValue];

            const next = new URLSearchParams(prev);
            next.delete(key);
            nextValues.forEach(v => next.append(key, String(v)));
            next.delete('page');
            return next;
        });
    }, [setSearchParams]);

    const clearAllFilters = useCallback(() => {
        setSearchParams(prev => {
            const next = new URLSearchParams();
            const keepSize = prev.get('size');
            if (keepSize) next.set('size', keepSize);
            return next;
        });
        setQDraft('');
    }, [setSearchParams]);

    const setPage = useCallback((nextPage) => {
        setSearchParams(prev => {
            const next = new URLSearchParams(prev);
            if (!nextPage || nextPage <= 0) next.delete('page');
            else next.set('page', String(nextPage));
            return next;
        });
    }, [setSearchParams]);

    const setSize = useCallback((nextSize) => {
        if (!ALLOWED_SIZES.includes(nextSize)) return;
        setSearchParams(prev => {
            const next = new URLSearchParams(prev);
            if (nextSize === DEFAULT_PAGE_SIZE) next.delete('size');
            else next.set('size', String(nextSize));
            next.delete('page');
            return next;
        });
    }, [setSearchParams]);

    const [data, setData] = useState({
        content: [],
        totalElements: 0,
        totalPages: 0,
        number: 0,
        size: DEFAULT_PAGE_SIZE,
    });
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Stable string key, lai useEffect nepārslogo, kad filtru objekts tiek
    // atjaunots, bet saturs nav mainījies (shallow equality nedarbojas masīviem).
    const queryKey = useMemo(() => {
        const parts = [`q=${filters.q}`];
        LIST_FILTER_KEYS.forEach(k => {
            if (filters[k].length) parts.push(`${k}=${filters[k].join(',')}`);
        });
        parts.push(`page=${page}`, `size=${size}`);
        return parts.join('&');
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [filters, page, size]);

    useEffect(() => {
        const params = new URLSearchParams();
        if (filters.q) params.set('q', filters.q);
        LIST_FILTER_KEYS.forEach(key => {
            filters[key].forEach(v => params.append(key, String(v)));
        });
        params.set('page', String(page));
        params.set('size', String(size));

        const controller = new AbortController();
        setLoading(true);
        setError(null);
        api.get('/courses/catalog', { params, signal: controller.signal })
            .then(res => {
                const body = res.data || {};
                setData({
                    content: Array.isArray(body.content) ? body.content : [],
                    totalElements: body.totalElements || 0,
                    totalPages: body.totalPages || 0,
                    number: typeof body.number === 'number' ? body.number : 0,
                    size: body.size || size,
                });
            })
            .catch(err => {
                if (err.name === 'CanceledError' || err.code === 'ERR_CANCELED') return;
                console.error('Kļūda ielādējot katalogu:', err);
                setError('Neizdevās ielādēt kursu katalogu. Pārbaudi savienojumu ar serveri.');
            })
            .finally(() => setLoading(false));

        return () => controller.abort();
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [queryKey]);

    return {
        filters,
        qDraft,
        setQDraft,
        toggleFilter,
        setListFilter,
        clearAllFilters,
        page,
        size,
        setPage,
        setSize,
        data,
        loading,
        error,
        ALLOWED_SIZES,
    };
}

export { arraysEqual };
