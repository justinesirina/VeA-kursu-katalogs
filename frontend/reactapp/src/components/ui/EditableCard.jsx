import { useRef } from 'react';
import { GripVertical, Copy, X } from 'lucide-react';

/**
 * EditableCard — koplietojama kartīte ar drag-and-drop, dublēšanas un dzēšanas atbalstu.
 *
 * Props:
 *   index        {number}    — rindas numurs (rādāms, 1-based)
 *   isDragging   {boolean}   — vai šī kartīte šobrīd tiek vilkta
 *   onDragStart  {function}  — izsaukts, kad sākas vilkšana (tikai no roktura)
 *   onDragOver   {function}  — izsaukts ar drag-over notikumu
 *   onDrop       {function}  — izsaukts, kad elements tiek nomests uz šīs kartītes
 *   onDragEnd    {function}  — izsaukts, kad vilkšana beidzas
 *   onDuplicate  {function}  — izsaukts, nospiežot dublēšanas pogu
 *   onRemove     {function}  — izsaukts, nospiežot dzēšanas pogu
 *   children     {ReactNode} — ievadlauki vai cits saturs kartītes iekšienē
 */
function EditableCard({
    index,
    isDragging,
    onDragStart,
    onDragOver,
    onDrop,
    onDragEnd,
    onDuplicate,
    onRemove,
    children,
}) {
    const fromHandle = useRef(false);

    return (
        <div
            draggable
            onDragStart={e => {
                if (!fromHandle.current) { e.preventDefault(); return; }
                onDragStart();
            }}
            onDragOver={onDragOver}
            onDrop={onDrop}
            onDragEnd={() => { fromHandle.current = false; onDragEnd(); }}
            className={`bg-white rounded-lg border border-gray-200 p-3 transition-opacity ${
                isDragging ? 'opacity-40' : ''
            }`}
        >
            <div className="flex items-start gap-2">
                {/* Drag handle */}
                <div
                    className="cursor-grab text-gray-300 hover:text-gray-500 pt-1.5 shrink-0 select-none"
                    onMouseDown={() => { fromHandle.current = true; }}
                    onMouseUp={()   => { fromHandle.current = false; }}
                >
                    <GripVertical size={16} />
                </div>

                {/* Row number */}
                <span className="text-gray-400 text-xs font-medium pt-2 w-5 shrink-0 select-none">
                    {index}.
                </span>

                {/* Content slot */}
                <div className="flex-1 space-y-2 min-w-0">
                    {children}
                </div>

                {/* Action buttons */}
                <div className="flex flex-col gap-1 shrink-0 pt-0.5">
                    <button
                        type="button"
                        onClick={onDuplicate}
                        title="Dublēt"
                        aria-label="Dublēt rindu"
                        className="text-gray-400 hover:text-vea-green p-0.5 rounded transition-colors"
                    >
                        <Copy size={14} />
                    </button>
                    <button
                        type="button"
                        onClick={onRemove}
                        title="Dzēst"
                        aria-label="Dzēst rindu"
                        className="text-gray-400 hover:text-red-500 p-0.5 rounded transition-colors"
                    >
                        <X size={14} />
                    </button>
                </div>
            </div>
        </div>
    );
}

export default EditableCard;
