/**
 * Soļu indikators — vizuāli rāda kurā solī atrodas lietotājs daudzsoļu formā.
 *
 * @param {Object} props
 * @param {number} props.currentStep - Aktīvā soļa numurs (sākas no 1)
 * @param {string[]} props.steps - Soļu nosaukumu masīvs
 */
function StepIndicator({ currentStep, steps }) {
    return (
        <div className="flex items-center w-full mb-6">
            {steps.map((label, index) => {
                const stepNumber = index + 1;
                const isDone = stepNumber < currentStep;
                const isActive = stepNumber === currentStep;

                return (
                    <div key={stepNumber} className="flex items-center flex-1 last:flex-none">
                        <div className="flex flex-col items-center">
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold
                                ${isDone ? 'bg-green-500 text-white' : ''}
                                ${isActive ? 'bg-blue-600 text-white' : ''}
                                ${!isDone && !isActive ? 'bg-gray-200 text-gray-500' : ''}
                            `}>
                                {isDone ? '✓' : stepNumber}
                            </div>
                            <span className={`text-xs mt-1 whitespace-nowrap
                                ${isActive ? 'text-blue-600 font-medium' : 'text-gray-500'}
                            `}>
                                {label}
                            </span>
                        </div>
                        {index < steps.length - 1 && (
                            <div className={`flex-1 h-px mx-2 mb-4 ${isDone ? 'bg-green-400' : 'bg-gray-300'}`} />
                        )}
                    </div>
                );
            })}
        </div>
    );
}

export default StepIndicator;
