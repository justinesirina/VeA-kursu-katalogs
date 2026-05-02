import { useState, useRef } from 'react';
import { Plus } from 'lucide-react';
import UserSection from '../components/admin/UserSection';
import LookupSection from '../components/admin/LookupSection';

const TABS = [
    { key: 'users', label: 'Lietotāji' },
    { key: 'roles', label: 'Lomas' },
];

const ROLES_CONFIG = {
    title: 'Lietotāju lomas',
    endpoint: '/user-roles',
    fields: [
        { key: 'roleName', label: 'Lomas nosaukums', required: true },
    ],
};

function AdminUsers() {
    const [activeTab, setActiveTab] = useState('users');
    const sectionRef = useRef(null);

    const handleAdd = () => {
        sectionRef.current?.startAdd();
    };

    return (
        <div className="max-w-6xl mx-auto p-6">
            <div className="sticky top-14 z-30 bg-vea-bg -mx-6 px-6 pt-1 mb-4 border-b border-gray-200">
                <div className="flex items-end justify-between gap-3">
                    <div className="flex gap-1" role="tablist" aria-label="Lietotāju sadaļas">
                        {TABS.map(tab => {
                            const isActive = activeTab === tab.key;
                            return (
                                <button
                                    key={tab.key}
                                    type="button"
                                    role="tab"
                                    aria-selected={isActive}
                                    onClick={() => setActiveTab(tab.key)}
                                    className={`px-4 py-2 text-sm font-medium border-b-2 -mb-px transition-colors ${
                                        isActive
                                            ? 'border-vea-green text-vea-green'
                                            : 'border-transparent text-vea-neutral hover:text-vea-green hover:bg-vea-green-light/40'
                                    }`}
                                >
                                    {tab.label}
                                </button>
                            );
                        })}
                    </div>
                    <button
                        type="button"
                        onClick={handleAdd}
                        className="mb-2 flex items-center gap-1 bg-vea-green text-white px-3 py-1.5 rounded hover:bg-vea-green-dark text-sm"
                    >
                        <Plus className="w-4 h-4" aria-hidden="true" /> Pievienot
                    </button>
                </div>
            </div>

            {activeTab === 'users' && <UserSection ref={sectionRef} />}
            {activeTab === 'roles' && (
                <LookupSection
                    ref={sectionRef}
                    title={ROLES_CONFIG.title}
                    endpoint={ROLES_CONFIG.endpoint}
                    fields={ROLES_CONFIG.fields}
                    hideTitle
                    externalAddButton
                />
            )}
        </div>
    );
}

export default AdminUsers;
