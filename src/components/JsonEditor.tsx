import { CheckIcon, CopyIcon, DownloadIcon, UploadIcon } from "lucide-react";
import { useRef, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Field, FieldError } from "@/components/ui/field";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
import { downloadText, readFileAsText } from "@/lib/fileUtils";
import { cn } from "@/lib/utils";
import { m } from "@/paraglide/messages.js";

interface JsonEditorProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  error?: string;
  downloadFilename?: string;
}

export function JsonEditor({
  label,
  value,
  onChange,
  error,
  downloadFilename = "document.json",
}: JsonEditorProps) {
  const [copyState, setCopyState] = useState<"idle" | "success" | "error">("idle");
  const [dragOver, setDragOver] = useState(false);
  const [fileError, setFileError] = useState<string | undefined>();
  const fileInputRef = useRef<HTMLInputElement>(null);

  async function copyJson() {
    if (!value.trim()) {
      return;
    }

    try {
      await navigator.clipboard.writeText(value);
      setCopyState("success");
      window.setTimeout(() => setCopyState("idle"), 2000);
    } catch {
      setCopyState("error");
      window.setTimeout(() => setCopyState("idle"), 2000);
    }
  }

  async function handleFile(file: File) {
    setFileError(undefined);
    try {
      const text = await readFileAsText(file);
      onChange(text);
    } catch {
      setFileError(m.file_read_error());
    }
  }

  function handleDrop(event: React.DragEvent) {
    event.preventDefault();
    setDragOver(false);
    const file = event.dataTransfer.files[0];
    if (file) {
      void handleFile(file);
    }
  }

  function handleDownload() {
    if (!value.trim()) return;
    downloadText(value, downloadFilename);
  }

  const copyLabel =
    copyState === "success"
      ? m.copy_success()
      : copyState === "error"
        ? m.copy_error()
        : m.btn_copy();

  return (
    <Card className="min-h-[320px]">
      <CardHeader className="gap-3">
        <div className="flex items-center justify-between gap-2">
          <CardTitle className="font-semibold text-muted-foreground text-sm uppercase tracking-wide">
            {label}
          </CardTitle>
          <div className="flex flex-wrap items-center justify-end gap-2">
            <input
              ref={fileInputRef}
              type="file"
              accept=".json,application/json"
              className="sr-only"
              onChange={(event) => {
                const file = event.target.files?.[0];
                if (file) void handleFile(file);
                event.target.value = "";
              }}
            />
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => fileInputRef.current?.click()}
              aria-label={m.btn_upload()}
            >
              <UploadIcon />
              {m.btn_upload()}
            </Button>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleDownload}
              disabled={!value.trim()}
              aria-label={m.btn_download()}
            >
              <DownloadIcon />
              {m.btn_download()}
            </Button>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={copyJson}
              disabled={!value.trim()}
              aria-label={copyLabel}
            >
              {copyState === "success" ? <CheckIcon /> : <CopyIcon />}
              {copyLabel}
            </Button>
            <Badge
              variant={error ? "destructive" : "secondary"}
              className={cn(
                !error &&
                  "border-[color-mix(in_srgb,var(--color-added)_35%,transparent)] bg-[color-mix(in_srgb,var(--color-added)_12%,transparent)] text-[var(--color-added)]",
              )}
            >
              {error ? m.json_invalid() : m.json_valid()}
            </Badge>
          </div>
        </div>
        <Separator />
      </CardHeader>
      <CardContent>
        <Field data-invalid={Boolean(error || fileError)}>
          <Textarea
            value={value}
            onChange={(event) => onChange(event.target.value)}
            onDragOver={(event) => {
              event.preventDefault();
              setDragOver(true);
            }}
            onDragLeave={() => setDragOver(false)}
            onDrop={handleDrop}
            spellCheck={false}
            placeholder={m.json_placeholder()}
            aria-invalid={Boolean(error || fileError)}
            className={cn(
              "field-sizing-fixed h-96 resize-none overflow-y-auto font-mono text-sm leading-6",
              dragOver && "ring-2 ring-[var(--color-accent)]",
            )}
          />
          {dragOver && (
            <p className="mt-2 text-center text-muted-foreground text-xs">
              {m.drag_drop_hint()}
            </p>
          )}
          <FieldError>{fileError ?? error}</FieldError>
        </Field>
      </CardContent>
    </Card>
  );
}
