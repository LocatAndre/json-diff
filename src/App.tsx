import { CheckIcon, CopyIcon, DownloadIcon } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { AppHeader } from "@/components/AppHeader";
import { DiffViewer } from "@/components/DiffViewer";
import { EditorToolbar } from "@/components/EditorToolbar";
import { JsonEditor } from "@/components/JsonEditor";
import { SchemaPanel } from "@/components/SchemaPanel";
import { SplitDiffViewer } from "@/components/SplitDiffViewer";
import { UnifiedDiffViewer } from "@/components/UnifiedDiffViewer";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Field, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { usePersistedState, usePersistedString } from "@/hooks/use-persisted-state";
import { downloadText } from "@/lib/fileUtils";
import { getFormatLabel } from "@/lib/formatMessages";
import {
  type ArrayCompareMode,
  countChanges,
  detectArrayKeyForValues,
  diffJson,
  filterDiffEntries,
  parseJson,
  SAMPLE_LEFT,
  SAMPLE_RIGHT,
} from "@/lib/jsonDiff";
import { type FormatMode, formatToString, normalizeForCompare } from "@/lib/jsonFormat";
import { applyPatch, formatPatch, generatePatch } from "@/lib/jsonPatch";
import { getParseErrorMessage } from "@/lib/parseErrorMessages";
import {
  buildShareUrl,
  copyShareUrl,
  hasShareParams,
  parseShareUrl,
} from "@/lib/shareUrl";
import {
  clearSessionStorage,
  DEFAULT_DIFF_OPTIONS,
  type DisplayMode,
  isValidArrayMode,
  isValidDisplayMode,
  isValidFormatMode,
  isValidViewMode,
  type PersistedDiffOptions,
  STORAGE_KEYS,
  type ViewMode,
} from "@/lib/storage";
import { m } from "@/paraglide/messages.js";

export default function App() {
  const [leftInput, setLeftInput] = usePersistedString(STORAGE_KEYS.left, SAMPLE_LEFT);
  const [rightInput, setRightInput] = usePersistedString(
    STORAGE_KEYS.right,
    SAMPLE_RIGHT,
  );
  const [viewMode, setViewMode] = usePersistedState<ViewMode>(
    STORAGE_KEYS.viewMode,
    "changes",
    {
      serialize: (value) => value,
      deserialize: (raw) => (isValidViewMode(raw) ? raw : "changes"),
    },
  );
  const [displayMode, setDisplayMode] = usePersistedState<DisplayMode>(
    STORAGE_KEYS.displayMode,
    "split",
    {
      serialize: (value) => value,
      deserialize: (raw) => (isValidDisplayMode(raw) ? raw : "split"),
    },
  );
  const [formatMode, setFormatMode] = usePersistedState<FormatMode>(
    STORAGE_KEYS.formatMode,
    "sorted-pretty-2",
    {
      serialize: (value) => value,
      deserialize: (raw) => (isValidFormatMode(raw) ? raw : "sorted-pretty-2"),
    },
  );
  const [arrayMode, setArrayMode] = usePersistedState<ArrayCompareMode>(
    STORAGE_KEYS.arrayMode,
    "by-index",
    {
      serialize: (value) => value,
      deserialize: (raw) => (isValidArrayMode(raw) ? raw : "by-index"),
    },
  );
  const [arrayKey, setArrayKey] = usePersistedString(STORAGE_KEYS.arrayKey, "");
  const [diffOptions, setDiffOptions] = usePersistedState<PersistedDiffOptions>(
    STORAGE_KEYS.diffOptions,
    DEFAULT_DIFF_OPTIONS,
  );
  const [schemaInput, setSchemaInput] = usePersistedString(STORAGE_KEYS.schema, "");
  const [searchQuery, setSearchQuery] = useState("");
  const [shareState, setShareState] = useState<
    "idle" | "success" | "error" | "too-long"
  >("idle");
  const [patchCopyState, setPatchCopyState] = useState<"idle" | "success" | "error">(
    "idle",
  );
  const [showPatch, setShowPatch] = useState(false);
  const [shareLoaded, setShareLoaded] = useState(false);

  useEffect(() => {
    if (shareLoaded || typeof window === "undefined") return;
    if (!hasShareParams(window.location.search)) {
      setShareLoaded(true);
      return;
    }

    void parseShareUrl(window.location.search).then((params) => {
      if (params.left !== undefined) setLeftInput(params.left);
      if (params.right !== undefined) setRightInput(params.right);
      if (params.formatMode) setFormatMode(params.formatMode);
      if (params.displayMode && isValidDisplayMode(params.displayMode)) {
        setDisplayMode(params.displayMode);
      }
      if (params.viewMode && isValidViewMode(params.viewMode)) {
        setViewMode(params.viewMode);
      }
      if (params.arrayMode && isValidArrayMode(params.arrayMode)) {
        setArrayMode(params.arrayMode);
      }
      window.history.replaceState({}, "", window.location.pathname);
      setShareLoaded(true);
    });
  }, [
    shareLoaded,
    setLeftInput,
    setRightInput,
    setFormatMode,
    setDisplayMode,
    setViewMode,
    setArrayMode,
  ]);

  const leftParsed = useMemo(() => parseJson(leftInput), [leftInput]);
  const rightParsed = useMemo(() => parseJson(rightInput), [rightInput]);
  const formatLabel = useMemo(() => getFormatLabel(formatMode), [formatMode]);

  const detectedArrayKey = useMemo(() => {
    if (
      !leftParsed.ok ||
      !rightParsed.ok ||
      arrayMode !== "by-key" ||
      arrayKey.trim()
    ) {
      return undefined;
    }
    const left = normalizeForCompare(leftParsed.value, formatMode);
    const right = normalizeForCompare(rightParsed.value, formatMode);
    return detectArrayKeyForValues(left, right);
  }, [leftParsed, rightParsed, formatMode, arrayMode, arrayKey]);

  const effectiveArrayKey = arrayKey.trim() || detectedArrayKey || "";

  const diffEngineOptions = useMemo(
    () => ({
      arrayMode,
      arrayKey: effectiveArrayKey || undefined,
      treatNullAsMissing: diffOptions.treatNullAsMissing,
      numericTolerance: diffOptions.numericTolerance,
      maxDepth: diffOptions.maxDepth,
    }),
    [arrayMode, effectiveArrayKey, diffOptions],
  );

  const normalizedValues = useMemo(() => {
    if (!leftParsed.ok || !rightParsed.ok) {
      return null;
    }

    return {
      left: normalizeForCompare(leftParsed.value, formatMode),
      right: normalizeForCompare(rightParsed.value, formatMode),
    };
  }, [leftParsed, rightParsed, formatMode]);

  const diffResult = useMemo(() => {
    if (!normalizedValues) {
      return null;
    }

    return diffJson(normalizedValues.left, normalizedValues.right, diffEngineOptions);
  }, [normalizedValues, diffEngineOptions]);

  const filteredDiffResult = useMemo(() => {
    if (!diffResult) return null;
    return filterDiffEntries(diffResult, searchQuery);
  }, [diffResult, searchQuery]);

  const stats = useMemo(
    () => (diffResult ? countChanges(diffResult) : null),
    [diffResult],
  );

  const patchOperations = useMemo(() => {
    if (!normalizedValues) return null;
    return generatePatch(
      normalizedValues.left,
      normalizedValues.right,
      diffEngineOptions,
    );
  }, [normalizedValues, diffEngineOptions]);

  const canCompare = leftParsed.ok && rightParsed.ok;

  function loadSamples() {
    setLeftInput(SAMPLE_LEFT);
    setRightInput(SAMPLE_RIGHT);
  }

  function formatInputs() {
    if (leftParsed.ok) {
      setLeftInput(formatToString(leftParsed.value, formatMode));
    }
    if (rightParsed.ok) {
      setRightInput(formatToString(rightParsed.value, formatMode));
    }
  }

  function clearInputs() {
    setLeftInput("");
    setRightInput("");
  }

  function resetSession() {
    clearSessionStorage();
    setLeftInput(SAMPLE_LEFT);
    setRightInput(SAMPLE_RIGHT);
    setViewMode("changes");
    setDisplayMode("split");
    setFormatMode("sorted-pretty-2");
    setArrayMode("by-index");
    setArrayKey("");
    setDiffOptions(DEFAULT_DIFF_OPTIONS);
    setSchemaInput("");
    setSearchQuery("");
    setShowPatch(false);
  }

  function swapInputs() {
    setLeftInput(rightInput);
    setRightInput(leftInput);
  }

  async function shareComparison() {
    try {
      const { url, tooLong } = await buildShareUrl(
        window.location.origin + window.location.pathname,
        {
          left: leftInput,
          right: rightInput,
          formatMode,
          displayMode,
          viewMode,
          arrayMode,
        },
      );

      if (tooLong) {
        setShareState("too-long");
      } else {
        await copyShareUrl(url);
        setShareState("success");
      }
    } catch {
      setShareState("error");
    }

    window.setTimeout(() => setShareState("idle"), 3000);
  }

  async function copyPatch() {
    if (!patchOperations) return;

    try {
      await navigator.clipboard.writeText(formatPatch(patchOperations));
      setPatchCopyState("success");
    } catch {
      setPatchCopyState("error");
    }

    window.setTimeout(() => setPatchCopyState("idle"), 2000);
  }

  function downloadPatch() {
    if (!patchOperations) return;
    downloadText(formatPatch(patchOperations), "patch.json");
  }

  function applyPatchToLeft() {
    if (!leftParsed.ok || !patchOperations || patchOperations.length === 0) return;

    try {
      const result = applyPatch(leftParsed.value, patchOperations);
      setLeftInput(formatToString(result, formatMode));
    } catch {
      // patch application failed silently
    }
  }

  return (
    <>
      <AppHeader />

      <main className="container mx-auto flex min-h-screen flex-col gap-6 px-4 py-6 md:px-8 md:py-8">
        <p className="max-w-3xl text-muted-foreground">{m.app_description()}</p>

        <EditorToolbar
          formatMode={formatMode}
          onFormatModeChange={setFormatMode}
          arrayMode={arrayMode}
          onArrayModeChange={setArrayMode}
          arrayKey={effectiveArrayKey}
          onArrayKeyChange={setArrayKey}
          diffOptions={diffOptions}
          onDiffOptionsChange={setDiffOptions}
          onSample={loadSamples}
          onFormat={formatInputs}
          onClear={clearInputs}
          onResetSession={resetSession}
          onSwap={swapInputs}
          onShare={shareComparison}
          shareState={shareState}
        />

        <div className="grid gap-4 lg:grid-cols-2">
          <JsonEditor
            label={m.json_a()}
            value={leftInput}
            onChange={setLeftInput}
            error={leftParsed.ok ? undefined : getParseErrorMessage(leftParsed)}
            downloadFilename="json-a.json"
          />
          <JsonEditor
            label={m.json_b()}
            value={rightInput}
            onChange={setRightInput}
            error={rightParsed.ok ? undefined : getParseErrorMessage(rightParsed)}
            downloadFilename="json-b.json"
          />
        </div>

        <SchemaPanel
          schemaInput={schemaInput}
          onSchemaChange={setSchemaInput}
          leftValue={leftParsed.ok ? leftParsed.value : null}
          rightValue={rightParsed.ok ? rightParsed.value : null}
        />

        <Card>
          <CardHeader className="gap-4 p-4 md:flex-row md:items-center md:justify-between md:p-6">
            <div className="space-y-2">
              <CardTitle>{m.comparison_title()}</CardTitle>
              <CardDescription>
                {m.comparison_mode({ mode: formatLabel })}
              </CardDescription>
              {stats && (
                <div className="flex flex-wrap gap-2">
                  <Badge variant="secondary" className="text-[var(--color-added)]">
                    {m.stats_added({ count: stats.added })}
                  </Badge>
                  <Badge variant="secondary" className="text-[var(--color-removed)]">
                    {m.stats_removed({ count: stats.removed })}
                  </Badge>
                  <Badge variant="secondary" className="text-[var(--color-changed)]">
                    {m.stats_changed({ count: stats.changed })}
                  </Badge>
                </div>
              )}
            </div>

            <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center">
              <Tabs
                value={displayMode}
                onValueChange={(value) => setDisplayMode(value as DisplayMode)}
              >
                <TabsList>
                  <TabsTrigger value="split">{m.view_side_by_side()}</TabsTrigger>
                  <TabsTrigger value="unified">{m.view_unified()}</TabsTrigger>
                  <TabsTrigger value="path">{m.view_by_path()}</TabsTrigger>
                </TabsList>
              </Tabs>

              <Tabs
                value={viewMode}
                onValueChange={(value) => setViewMode(value as ViewMode)}
              >
                <TabsList>
                  <TabsTrigger value="changes">{m.view_changes_only()}</TabsTrigger>
                  <TabsTrigger value="all">{m.view_all()}</TabsTrigger>
                </TabsList>
              </Tabs>

              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowPatch((prev) => !prev)}
                disabled={!canCompare}
              >
                {m.btn_export_patch()}
              </Button>
            </div>
          </CardHeader>

          <CardContent className="space-y-4 p-4 pt-0 md:p-6 md:pt-0">
            <Field>
              <FieldLabel htmlFor="diff-search">
                {m.diff_search_placeholder()}
              </FieldLabel>
              <Input
                id="diff-search"
                value={searchQuery}
                onChange={(event) => setSearchQuery(event.target.value)}
                placeholder={m.diff_search_placeholder()}
              />
            </Field>

            {showPatch && canCompare && (
              <div className="space-y-3 rounded-lg border border-border bg-[var(--color-inset)] p-4">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <h3 className="font-medium text-sm">{m.patch_title()}</h3>
                  <div className="flex flex-wrap gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={copyPatch}
                      disabled={!patchOperations?.length}
                    >
                      {patchCopyState === "success" ? <CheckIcon /> : <CopyIcon />}
                      {patchCopyState === "success" ? m.copy_success() : m.btn_copy()}
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={downloadPatch}
                      disabled={!patchOperations?.length}
                    >
                      <DownloadIcon />
                      {m.btn_download()}
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={applyPatchToLeft}
                      disabled={!patchOperations?.length}
                    >
                      {m.btn_apply_patch()}
                    </Button>
                  </div>
                </div>
                <pre className="max-h-48 overflow-auto rounded-md border border-border bg-background p-3 font-mono text-xs">
                  {patchOperations && patchOperations.length > 0
                    ? formatPatch(patchOperations)
                    : m.patch_empty()}
                </pre>
              </div>
            )}

            {!canCompare ? (
              <Alert variant="destructive">
                <AlertDescription className="text-center">
                  {m.fix_json_errors()}
                </AlertDescription>
              </Alert>
            ) : displayMode === "split" && normalizedValues ? (
              <SplitDiffViewer
                left={normalizedValues.left}
                right={normalizedValues.right}
                viewMode={viewMode}
              />
            ) : displayMode === "unified" && normalizedValues ? (
              <UnifiedDiffViewer
                left={normalizedValues.left}
                right={normalizedValues.right}
                viewMode={viewMode}
              />
            ) : (
              <DiffViewer
                entries={filteredDiffResult ?? []}
                viewMode={viewMode}
                searchQuery={searchQuery}
              />
            )}
          </CardContent>
        </Card>
      </main>
    </>
  );
}
