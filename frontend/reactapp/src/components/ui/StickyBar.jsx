function StickyBar({ children }) {
    return (
        <div className="fixed bottom-0 left-0 right-0 z-30 bg-white/5 backdrop-blur-[2px] border-t border-gray-200 shadow-[0_-2px_8px_rgba(0,0,0,0.08)] px-6 py-3 flex justify-end gap-2 print:hidden">
            {children}
        </div>
    );
}

export default StickyBar;
