import { LayoutGrid, List } from 'lucide-react';

function ViewToggle({ view, setView }) {
    return (
        <div className="flex gap-4 mb-6">
            <button
                onClick={() => setView('cards')}
                className={`relative group text-gray-700 hover:text-blue-600 transition ${
                    view === 'cards' ? 'font-bold' : ''
                }`}
            >
                <LayoutGrid className="w-6 h-6" />
                <span className="absolute bottom-full mb-1 left-1/2 -translate-x-1/2 bg-black text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition whitespace-nowrap">
          Kartīšu skats
        </span>
            </button>

            <button
                onClick={() => setView('list')}
                className={`relative group text-gray-700 hover:text-blue-600 transition ${
                    view === 'list' ? 'font-bold' : ''
                }`}
            >
                <List className="w-6 h-6" />
                <span className="absolute bottom-full mb-1 left-1/2 -translate-x-1/2 bg-black text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition whitespace-nowrap">
          Saraksta skats
        </span>
            </button>
        </div>
    );
}

export default ViewToggle;

