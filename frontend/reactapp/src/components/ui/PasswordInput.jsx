import { useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';

// Paroles lauks ar opciju Rādīt paroli.
// Izmanto LoginPage, UserSection paroles izveidē un atiestatīšanas dialogā.
function PasswordInput({
    id,
    value,
    onChange,
    autoComplete = 'current-password',
    disabled = false,
    autoFocus = false,
    placeholder = '',
}) {
    const [visible, setVisible] = useState(false);

    return (
        <div className="relative">
            <input
                id={id}
                type={visible ? 'text' : 'password'}
                value={value}
                onChange={onChange}
                autoComplete={autoComplete}
                disabled={disabled}
                autoFocus={autoFocus}
                placeholder={placeholder}
                className="w-full border border-gray-300 rounded px-3 py-2 pr-10 text-sm focus:outline-none focus:ring-2 focus:ring-vea-green"
            />
            <button
                type="button"
                onClick={() => setVisible(v => !v)}
                disabled={disabled}
                aria-label={visible ? 'Paslēpt paroli' : 'Rādīt paroli'}
                className="absolute inset-y-0 right-0 px-3 flex items-center text-gray-500 hover:text-vea-green focus:outline-none focus:text-vea-green disabled:opacity-50"
            >
                {visible
                    ? <EyeOff className="w-4 h-4" aria-hidden="true" />
                    : <Eye className="w-4 h-4" aria-hidden="true" />}
            </button>
        </div>
    );
}

export default PasswordInput;
