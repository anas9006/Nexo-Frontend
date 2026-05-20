import { useEffect } from "react";
import { X, Trash2 } from "lucide-react";

const ConfirmModal = ({ open, title, message, confirmLabel, onConfirm, onCancel }) => {
  useEffect(() => {
    if (!open) return;
    const handleKey = (e) => { if (e.key === "Escape") onCancel(); };
    document.addEventListener("keydown", handleKey);
    return () => document.removeEventListener("keydown", handleKey);
  }, [open, onCancel]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-[60] flex items-center justify-center bg-black/40 backdrop-blur-sm p-4"
      onClick={onCancel}
    >
      <div
        className="bg-surface rounded-2xl shadow-xl border border-border w-full max-w-sm overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-5 pt-5 pb-2">
          <h2 className="text-base font-bold text-text-primary">{title || "Confirm"}</h2>
          <button
            type="button"
            onClick={onCancel}
            className="p-1 rounded-full text-text-secondary hover:text-text-primary hover:bg-background transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="px-5 py-3">
          <p className="text-sm text-text-secondary leading-relaxed">{message}</p>
        </div>

        <div className="flex items-center justify-end gap-2 px-5 pb-5 pt-1">
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 rounded-xl text-sm font-medium text-text-secondary hover:text-text-primary hover:bg-background border border-border transition-colors"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={onConfirm}
            className="px-4 py-2 rounded-xl text-sm font-medium text-white bg-danger hover:bg-red-600 transition-colors flex items-center gap-1.5"
          >
            <Trash2 className="w-3.5 h-3.5" />
            {confirmLabel || "Delete"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmModal;
