import { Check, X } from 'lucide-react';

// Paroles izveides nosacījumu vizualizācija, atbilstoši backend PasswordPolicy.
// Katra prasība rāda zaļu ✓ vai pelēku ✗ atbilstoši pašreizējam ievadam.

const RULES = [
    { id: 'len',   label: 'Vismaz 8 simboli',        test: p => p.length >= 8 },
    { id: 'upper', label: 'Vismaz viens lielais burts', test: p => /[A-ZĀČĒĢĪĶĻŅŠŪŽ]/.test(p) },
    { id: 'lower', label: 'Vismaz viens mazais burts', test: p => /[a-zāčēģīķļņšūž]/.test(p) },
    { id: 'digit', label: 'Vismaz viens skaitlis',      test: p => /\d/.test(p) },
];

function PasswordHints({ password = '' }) {
    return (
        <ul className="mt-2 space-y-1 text-xs">
            {RULES.map(rule => {
                const ok = rule.test(password);
                return (
                    <li key={rule.id} className={`flex items-center gap-1.5 ${ok ? 'text-green-700' : 'text-gray-500'}`}>
                        {ok
                            ? <Check className="w-3.5 h-3.5" aria-hidden="true" />
                            : <X className="w-3.5 h-3.5" aria-hidden="true" />}
                        {rule.label}
                    </li>
                );
            })}
        </ul>
    );
}

export default PasswordHints;
