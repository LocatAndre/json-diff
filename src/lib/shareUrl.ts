import type { FormatMode } from "./jsonFormat";
import {
  isValidArrayMode,
  isValidDisplayMode,
  isValidFormatMode,
  isValidViewMode,
} from "./storage";

const MAX_URL_LENGTH = 2000;

function toBase64Url(bytes: Uint8Array): string {
  let binary = "";
  for (const byte of bytes) {
    binary += String.fromCharCode(byte);
  }
  return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

function fromBase64Url(encoded: string): Uint8Array {
  const base64 = encoded.replace(/-/g, "+").replace(/_/g, "/");
  const padded = base64 + "=".repeat((4 - (base64.length % 4)) % 4);
  const binary = atob(padded);
  const bytes = new Uint8Array(binary.length);
  for (let index = 0; index < binary.length; index += 1) {
    bytes[index] = binary.charCodeAt(index);
  }
  return bytes;
}

async function compressText(text: string): Promise<Uint8Array> {
  if (typeof CompressionStream === "undefined") {
    return new TextEncoder().encode(text);
  }

  const stream = new Blob([text])
    .stream()
    .pipeThrough(new CompressionStream("deflate"));
  const buffer = await new Response(stream).arrayBuffer();
  return new Uint8Array(buffer);
}

async function decompressText(bytes: Uint8Array, compressed: boolean): Promise<string> {
  if (!compressed || typeof DecompressionStream === "undefined") {
    return new TextDecoder().decode(bytes);
  }

  const buffer = new Uint8Array(bytes);
  const stream = new Blob([buffer])
    .stream()
    .pipeThrough(new DecompressionStream("deflate"));
  return new Response(stream).text();
}

export interface ShareUrlParams {
  left: string;
  right: string;
  formatMode?: FormatMode;
  displayMode?: string;
  viewMode?: string;
  arrayMode?: string;
}

export interface ShareUrlResult {
  url: string;
  tooLong: boolean;
}

export async function buildShareUrl(
  baseUrl: string,
  params: ShareUrlParams,
): Promise<ShareUrlResult> {
  const compressed = typeof CompressionStream !== "undefined";
  const leftBytes = await compressText(params.left);
  const rightBytes = await compressText(params.right);

  const searchParams = new URLSearchParams();
  searchParams.set("l", toBase64Url(leftBytes));
  searchParams.set("r", toBase64Url(rightBytes));
  if (compressed) {
    searchParams.set("c", "1");
  }
  if (params.formatMode) {
    searchParams.set("f", params.formatMode);
  }
  if (params.displayMode) {
    searchParams.set("d", params.displayMode);
  }
  if (params.viewMode) {
    searchParams.set("v", params.viewMode);
  }
  if (params.arrayMode) {
    searchParams.set("a", params.arrayMode);
  }

  const url = `${baseUrl}?${searchParams.toString()}`;
  return { url, tooLong: url.length > MAX_URL_LENGTH };
}

export interface ParsedShareUrl {
  left?: string;
  right?: string;
  formatMode?: FormatMode;
  displayMode?: string;
  viewMode?: string;
  arrayMode?: string;
}

export async function parseShareUrl(search: string): Promise<ParsedShareUrl> {
  const params = new URLSearchParams(search);
  const leftEncoded = params.get("l");
  const rightEncoded = params.get("r");

  if (!leftEncoded && !rightEncoded) {
    return {};
  }

  const compressed = params.get("c") === "1";
  const result: ParsedShareUrl = {};

  if (leftEncoded) {
    result.left = await decompressText(fromBase64Url(leftEncoded), compressed);
  }
  if (rightEncoded) {
    result.right = await decompressText(fromBase64Url(rightEncoded), compressed);
  }

  const formatMode = params.get("f");
  if (formatMode && isValidFormatMode(formatMode)) {
    result.formatMode = formatMode;
  }

  const displayMode = params.get("d");
  if (displayMode && isValidDisplayMode(displayMode)) {
    result.displayMode = displayMode;
  }

  const viewMode = params.get("v");
  if (viewMode && isValidViewMode(viewMode)) {
    result.viewMode = viewMode;
  }

  const arrayMode = params.get("a");
  if (arrayMode && isValidArrayMode(arrayMode)) {
    result.arrayMode = arrayMode;
  }

  return result;
}

export function hasShareParams(search: string): boolean {
  const params = new URLSearchParams(search);
  return params.has("l") || params.has("r");
}

export async function copyShareUrl(url: string): Promise<void> {
  await navigator.clipboard.writeText(url);
}
