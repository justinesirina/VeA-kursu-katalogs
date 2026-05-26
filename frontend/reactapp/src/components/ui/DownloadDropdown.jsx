import { useEffect, useRef, useState } from 'react';
import { ChevronDown, Download, Eye } from 'lucide-react';
import api from '../../services/axiosConfig';

/**
 * F11 prasība: Lejupielādēšanas poga ar dropdown menu (Apskatīt PDF / Lejupielādēt PDF / DOCX).
 *
 * - "Apskatīt PDF" atver `?inline=true` PDF jaunā cilnē, kuru pārlūks parāda
 *   iebūvētajā skatītājā (bez piespiedu lejupielādes).
 * - "Lejupielādēt PDF" un "Lejupielādēt DOCX" lejupielādē failu uz datora.
 *   Faila nosaukums tiek pārņemts no `Content-Disposition` headera, kas tiek
 *   sūtīts ar latviešu rakstzīmēm (RFC 5987 UTF-8 kodējumā).
 *
 * Aizver menu, kad klikšķis ārpus tā vai nospiests Esc.
 */
function DownloadDropdown({ versionId }) {
    const [open, setOpen] = useState(false);
    const [busy, setBusy] = useState(null); // 'view-pdf' | 'pdf' | 'docx' | null
    const [error, setError] = useState(null);
    const ref = useRef(null);

    useEffect(() => {
        if (!open) return undefined;
        const onClick = (e) => {
            if (ref.current && !ref.current.contains(e.target)) setOpen(false);
        };
        const onKey = (e) => {
            if (e.key === 'Escape') setOpen(false);
        };
        document.addEventListener('mousedown', onClick);
        document.addEventListener('keydown', onKey);
        return () => {
            document.removeEventListener('mousedown', onClick);
            document.removeEventListener('keydown', onKey);
        };
    }, [open]);

    useEffect(() => {
        if (!error) return undefined;
        const timer = setTimeout(() => setError(null), 4000);
        return () => clearTimeout(timer);
    }, [error]);

    const download = async (format) => {
        if (!versionId) {
            setError('Nav norādīta versija eksportam');
            return;
        }
        setBusy(format);
        setError(null);
        try {
            const res = await api.get(
                `/course-versions/${versionId}/export/${format}`,
                { responseType: 'blob' }
            );
            const blob = new Blob([res.data], { type: res.headers['content-type'] });
            const url = window.URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = parseFilename(res.headers['content-disposition'])
                || `kurss.${format}`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            window.URL.revokeObjectURL(url);
            setOpen(false);
        } catch (err) {
            console.error('Eksporta kļūda:', err);
            setError('Neizdevās lejupielādēt failu. Mēģini vēlreiz.');
        } finally {
            setBusy(null);
        }
    };

    const previewPdf = async () => {
        if (!versionId) {
            setError('Nav norādīta versija eksportam');
            return;
        }
        setBusy('view-pdf');
        setError(null);
        try {
            const res = await api.get(
                `/course-versions/${versionId}/export/pdf?inline=true`,
                { responseType: 'blob' }
            );
            const blob = new Blob([res.data], { type: 'application/pdf' });
            const url = window.URL.createObjectURL(blob);
            // Atvert jaunā cilnē, URL atbrīvojam pēc nelielas aiztures, lai
            // pārlūkam paliek laiks nolasīt no atmiņas faila (Blob) saturu.
            window.open(url, '_blank', 'noopener,noreferrer');
            setTimeout(() => window.URL.revokeObjectURL(url), 30_000);
            setOpen(false);
        } catch (err) {
            console.error('Apskates kļūda:', err);
            setError('Neizdevās atvērt apskati. Mēģini vēlreiz.');
        } finally {
            setBusy(null);
        }
    };

    return (
        <div className="relative inline-block" ref={ref}>
            <button
                type="button"
                onClick={() => setOpen(o => !o)}
                aria-haspopup="menu"
                aria-expanded={open}
                disabled={!!busy}
                className="bg-vea-green text-white px-4 py-2 rounded text-base hover:bg-vea-green-dark inline-flex items-center gap-1.5 disabled:opacity-60 disabled:cursor-not-allowed"
            >
                <Download className="w-4 h-4" aria-hidden="true" />
                {busy ? 'Ielādē...' : 'Eksportēt'}
                <ChevronDown className={`w-4 h-4 transition-transform ${open ? 'rotate-180' : ''}`} aria-hidden="true" />
            </button>

            {open && (
                <div
                    role="menu"
                    className="absolute left-0 top-full mt-1 z-50 w-56 bg-white rounded-lg border border-gray-200 shadow-md overflow-hidden"
                >
                    <button
                        type="button"
                        role="menuitem"
                        onClick={previewPdf}
                        disabled={!!busy}
                        className="w-full text-left px-4 py-2 text-sm hover:bg-vea-green-light inline-flex items-center gap-2 disabled:opacity-50"
                    >
                        <Eye className="w-4 h-4" aria-hidden="true" />
                        Apskatīt PDF
                    </button>
                    <button
                        type="button"
                        role="menuitem"
                        onClick={() => download('pdf')}
                        disabled={!!busy}
                        className="w-full text-left px-4 py-2 text-sm hover:bg-vea-green-light inline-flex items-center gap-2 border-t border-gray-100 disabled:opacity-50"
                    >
                        <Download className="w-4 h-4" aria-hidden="true" />
                        Lejupielādēt PDF
                    </button>
                    <button
                        type="button"
                        role="menuitem"
                        onClick={() => download('docx')}
                        disabled={!!busy}
                        className="w-full text-left px-4 py-2 text-sm hover:bg-vea-green-light inline-flex items-center gap-2 border-t border-gray-100 disabled:opacity-50"
                    >
                        <Download className="w-4 h-4" aria-hidden="true" />
                        Lejupielādēt DOCX
                    </button>
                </div>
            )}

            {error && (
                <div
                    role="alert"
                    className="absolute left-0 top-full mt-1 z-50 w-64 bg-red-50 border border-red-200 text-red-700 text-sm px-3 py-2 rounded"
                >
                    {error}
                </div>
            )}
        </div>
    );
}

/**
 * Funkcija, kura mēģina izvilkt faila nosaukumu no `Content-Disposition` headera.
 * Priekšroka tiek dota `filename*=UTF-8''<URL-encoded>` formātam,
 * kas saglabā latviešu rakstzīmes; tikai tad fallback uz vienkāršo
 * `filename="..."` ASCII versiju.
 */
function parseFilename(disposition) {
    if (!disposition) return null;
    const utf8 = /filename\*=UTF-8''([^;]+)/i.exec(disposition);
    if (utf8 && utf8[1]) {
        try { return decodeURIComponent(utf8[1].trim()); } catch (_) { /* ignore */ }
    }
    const plain = /filename="?([^";]+)"?/i.exec(disposition);
    if (plain && plain[1]) return plain[1].trim();
    return null;
}

export default DownloadDropdown;
