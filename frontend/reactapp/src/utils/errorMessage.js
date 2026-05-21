// Kļūdas ziņojuma izvilkšana no axios atbildes.
// Backend GlobalExceptionHandler atgriež {kļūda: "..."} objektu HTTP 5xx un 403 gadījumos,
// bet kontrolieri ar try/catch atgriež tīru string. Šis helper apstrādā abus variantus,
// lai ziņojums vienmēr būtu string un React nepakļautu uz "Objects are not valid as a child".
export function extractErrorMessage(err, fallback = 'Neizdevās izpildīt darbību.') {
    const data = err?.response?.data;
    if (typeof data === 'string' && data.trim()) return data;
    if (data && typeof data === 'object') {
        return data.kļūda || data.message || data.error || fallback;
    }
    return fallback;
}
