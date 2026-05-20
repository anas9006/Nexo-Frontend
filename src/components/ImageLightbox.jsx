import { useEffect } from "react";
import { X, Download, ChevronLeft, ChevronRight } from "lucide-react";

const ImageLightbox = ({
  src,
  alt = "Image",
  onClose,
  onPrev,
  onNext,
  showPrev = false,
  showNext = false,
  onDownload,
}) => {
  useEffect(() => {
    if (!src) return;

    const onKeyDown = (e) => {
      if (e.key === "Escape") onClose();
    };

    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", onKeyDown);

    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [src, onClose]);

  if (!src) return null;

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center p-3 sm:p-6"
      role="dialog"
      aria-modal="true"
      aria-label="Image preview"
    >
      <button
        type="button"
        className="absolute inset-0 bg-black/75 backdrop-blur-sm"
        onClick={onClose}
        aria-label="Close preview"
      />

      <button
        type="button"
        onClick={onClose}
        className="absolute top-3 right-3 sm:top-4 sm:right-4 z-10 p-2 rounded-full bg-surface/90 text-text-primary hover:bg-surface shadow-lg border border-border transition-colors"
        aria-label="Close"
      >
        <X className="w-5 h-5" />
      </button>

      {(showPrev || showNext || onDownload) && (
        <div className="absolute top-3 left-1/2 -translate-x-1/2 sm:top-4 z-10 flex items-center gap-2">

          {showPrev && (
            <button
              type="button"
              onClick={onPrev}
              className="p-2 rounded-full bg-surface/90 text-text-primary hover:bg-surface shadow-lg border border-border transition-colors"
              aria-label="Previous"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
          )}
          {onDownload && (
            <button
              type="button"
              onClick={onDownload}
              className="p-2 rounded-full bg-surface/90 text-text-primary hover:bg-surface shadow-lg border border-border transition-colors"
              aria-label="Download"
            >
              <Download className="w-5 h-5" />
            </button>
          )}
          {showNext && (
            <button
              type="button"
              onClick={onNext}
              className="p-2 rounded-full bg-surface/90 text-text-primary hover:bg-surface shadow-lg border border-border transition-colors"
              aria-label="Next"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          )}
        </div>
      )}

      <img
        src={src}
        alt={alt}
        className="relative z-[1] max-w-full max-h-[90dvh] w-auto h-auto object-contain rounded-lg shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      />
    </div>
  );
};

export default ImageLightbox;

