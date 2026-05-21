import { useRef } from 'react';
import { Plus } from 'lucide-react';
import UserSection from '../components/admin/UserSection';

// Lomas ir fiksētas un netiek pārvaldītas UI — to cilne tika noņemta.
// Šī lapa rāda tikai lietotāju sarakstu ar pievienošanas pogu.
function AdminUsers() {
    const sectionRef = useRef(null);

    const handleAdd = () => {
        sectionRef.current?.startAdd();
    };

    return (
        <div className="max-w-6xl mx-auto p-6">
            <div className="sticky top-14 z-30 bg-vea-bg -mx-6 px-6 pt-1 mb-4 border-b border-gray-200">
                <div className="flex items-end justify-between gap-3 pb-2">
                    <h2 className="text-lg font-semibold text-vea-green">Lietotāji</h2>
                    <button
                        type="button"
                        onClick={handleAdd}
                        className="flex items-center gap-1 bg-vea-green text-white px-3 py-1.5 rounded hover:bg-vea-green-dark text-sm"
                    >
                        <Plus className="w-4 h-4" aria-hidden="true" /> Pievienot
                    </button>
                </div>
            </div>

            <UserSection ref={sectionRef} />
        </div>
    );
}

export default AdminUsers;
