import { useNavigate } from 'react-router-dom';
import { Database, Users, GraduationCap, Archive, ChevronRight, History } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

// Katra cilne pieprasa noteiktu minimālo lomu — kas nav, tas tiek paslēpts.
const TILES = [
    {
        key: 'system-fields',
        path: '/admin/system-fields',
        title: 'Sistēmas lauki',
        description: 'Uzziņu tabulas un sistēmas datu sadaļas',
        Icon: Database,
        requireRole: 'SYSTEM_ADMIN',
    },
    {
        key: 'users',
        path: '/admin/users',
        title: 'Lietotāji',
        description: 'Lietotāju kontu un lomu pārvaldība',
        Icon: Users,
        requireRole: 'SYSTEM_ADMIN',
    },
    {
        key: 'programs',
        path: '/admin/programs',
        title: 'Studiju programmas',
        description: 'Programmas un to daļas',
        Icon: GraduationCap,
        requireRole: 'ADMIN',
    },
    {
        key: 'activity-log',
        path: '/admin/activity-log',
        title: 'Kursu darbību žurnāls',
        description: 'Kursu un versiju darbību vēsture (izveide, statusi, arhivēšana)',
        Icon: History,
        requireRole: 'PROGRAM_DIRECTOR',
    },
    {
        key: 'archive',
        path: '/admin/archive',
        title: 'Arhīvs',
        description: 'Arhivētie kursi un versijas',
        Icon: Archive,
        requireRole: 'ADMIN',
    },
];

function AdminTile({ tile, onClick }) {
    const { title, description, Icon } = tile;
    return (
        <button
            type="button"
            onClick={onClick}
            className="group bg-white rounded-lg border border-gray-200 border-l-4 border-l-vea-green hover:shadow-sm hover:border-l-vea-green-dark transition-all p-3 flex items-center gap-3 text-left focus-visible:ring-2 focus-visible:ring-vea-green focus-visible:ring-offset-2 outline-none"
        >
            <div className="w-10 h-10 rounded-lg bg-vea-green-light flex items-center justify-center shrink-0">
                <Icon className="w-5 h-5 text-vea-green" aria-hidden="true" />
            </div>
            <div className="flex-1 min-w-0">
                <h2 className="font-semibold font-heading text-vea-green text-base leading-tight">
                    {title}
                </h2>
                <p className="text-xs text-gray-500 leading-tight mt-0.5">
                    {description}
                </p>
            </div>
            <ChevronRight
                className="w-5 h-5 text-gray-400 group-hover:text-vea-green group-hover:translate-x-1 transition-all shrink-0"
                aria-hidden="true"
            />
        </button>
    );
}

function AdminLanding() {
    const navigate = useNavigate();
    const { hasRole } = useAuth();
    const visibleTiles = TILES.filter(t => !t.requireRole || hasRole(t.requireRole));

    return (
        <div className="max-w-5xl mx-auto p-6">
            <p className="text-sm text-gray-500 mb-4">
                Izvēlies darbības kategoriju.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {visibleTiles.map(tile => (
                    <AdminTile
                        key={tile.key}
                        tile={tile}
                        onClick={() => navigate(tile.path)}
                    />
                ))}
            </div>
        </div>
    );
}

export default AdminLanding;
