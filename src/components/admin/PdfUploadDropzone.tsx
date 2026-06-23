import { useCallback, useRef, useState } from "react";
import { UploadCloud, FileText, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

export interface PdfUploadDropzoneProps {
  onUpload: (file: File) => Promise<void>;
  disabled?: boolean;
  maxMb?: number;
}

export function PdfUploadDropzone({ onUpload, disabled, maxMb = 15 }: PdfUploadDropzoneProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [drag, setDrag] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [name, setName] = useState<string | null>(null);

  const handle = useCallback(
    async (file: File | undefined) => {
      setError(null);
      if (!file) return;
      if (file.type !== "application/pdf" && !file.name.toLowerCase().endsWith(".pdf")) {
        setError("Apenas arquivos PDF são aceitos");
        return;
      }
      if (file.size > maxMb * 1024 * 1024) {
        setError(`Arquivo excede ${maxMb}MB`);
        return;
      }
      try {
        setBusy(true);
        setName(file.name);
        await onUpload(file);
      } catch (e: any) {
        setError(e?.message ?? "Falha no upload");
      } finally {
        setBusy(false);
      }
    },
    [maxMb, onUpload],
  );

  return (
    <div className="space-y-2">
      <div
        role="button"
        tabIndex={0}
        onClick={() => !disabled && !busy && inputRef.current?.click()}
        onKeyDown={(e) => {
          if ((e.key === "Enter" || e.key === " ") && !disabled && !busy) inputRef.current?.click();
        }}
        onDragOver={(e) => {
          e.preventDefault();
          setDrag(true);
        }}
        onDragLeave={() => setDrag(false)}
        onDrop={(e) => {
          e.preventDefault();
          setDrag(false);
          handle(e.dataTransfer.files?.[0]);
        }}
        className={cn(
          "grid place-items-center rounded-3xl border-2 border-dashed border-border/70 bg-card/40 px-6 py-12 text-center transition-colors",
          drag && "border-primary bg-primary/5",
          (disabled || busy) && "pointer-events-none opacity-60",
        )}
      >
        <div className="flex flex-col items-center gap-2">
          {busy ? (
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          ) : name ? (
            <FileText className="h-8 w-8 text-primary" />
          ) : (
            <UploadCloud className="h-8 w-8 text-muted-foreground" />
          )}
          <p className="text-sm font-medium text-foreground">
            {busy ? "Enviando…" : name ?? "Arraste o PDF ou clique para selecionar"}
          </p>
          <p className="text-xs text-muted-foreground">PDF até {maxMb}MB</p>
        </div>
        <input
          ref={inputRef}
          type="file"
          accept="application/pdf"
          hidden
          onChange={(e) => handle(e.target.files?.[0] ?? undefined)}
        />
      </div>
      {error && <p className="text-xs text-destructive">{error}</p>}
    </div>
  );
}