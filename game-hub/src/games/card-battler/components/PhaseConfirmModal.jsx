export default function PhaseConfirmModal({ phasePromptMessage, confirmPhaseTransition, cancelPhaseTransition }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/90 p-4">
      <div className="w-full max-w-lg rounded-3xl border border-slate-800 bg-slate-900 p-8 text-center shadow-2xl">
        <h2 className="text-xl font-black text-slate-100 mb-3">Confirm Phase Change</h2>
        <p className="text-sm text-slate-300 mb-8">{phasePromptMessage}</p>
        <div className="flex flex-col gap-3 sm:flex-row sm:justify-center">
          <button
            onClick={confirmPhaseTransition}
            className="flex-1 rounded-xl bg-emerald-500 px-4 py-3 text-sm font-bold text-slate-950 hover:bg-emerald-400 transition"
          >
            Yes, continue
          </button>
          <button
            onClick={cancelPhaseTransition}
            className="flex-1 rounded-xl border border-slate-700 bg-slate-800 px-4 py-3 text-sm font-bold text-slate-300 hover:bg-slate-700 transition"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}
