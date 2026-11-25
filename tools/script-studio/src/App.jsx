import React, { useState, useEffect, useMemo, useRef } from 'react';
import {
  BookOpen,
  Clapperboard,
  ShieldCheck,
  Download,
  Upload,
  Settings,
  Plus,
  Trash2,
  Copy,
  Check,
  Lock,
  Unlock,
  Sparkles,
  RefreshCw,
  AlertTriangle,
  AlertCircle,
  CheckCircle2,
  ArrowLeft,
  ArrowRight,
  RotateCcw,
  FileText,
  Eye,
  Edit3,
  X,
  Sliders,
  History,
  Flag,
  Zap,
  Compass,
  Key,
  Loader2,
  Swords,
  MessageSquare,
  Maximize2,
  FileCode2,
  ExternalLink,
  ClipboardPaste,
  Wand2,
} from 'lucide-react';

// ============================================================================
// CONSTANTS & DEFAULTS
// ============================================================================

const STORAGE_KEY = 'aot_script_studio_state_v2';

const CORE_VAULT_DOCS = [
  { id: 'canon-and-characters.md', name: 'canon-and-characters.md', core: true },
  { id: 'comedy-bible.md', name: 'comedy-bible.md', core: true },
  { id: 'workshop-and-map-spec.md', name: 'workshop-and-map-spec.md', core: true },
  { id: 'battle-spec-v11.md', name: 'battle-spec-v11.md', core: true },
  { id: 'bestiary-v11.md', name: 'bestiary-v11.md', core: true },
  { id: 'story-thread.md', name: 'story-thread.md', core: true },
];

// Hosted reference vault: the six core docs live next to this page (script-studio/reference-vault/) and are fetched at
// runtime, so updating the .md files in the repo needs no rebuild. Relative to the page, so it works at any subpath.
const VAULT_BASE = './reference-vault/';

async function fetchHostedDocs() {
  const out = {};
  const failed = [];
  await Promise.all(
    CORE_VAULT_DOCS.map(async (d) => {
      try {
        const res = await fetch(`${VAULT_BASE}${encodeURIComponent(d.name)}`, { cache: 'no-cache' });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        out[d.name] = await res.text();
      } catch {
        failed.push(d.name);
      }
    })
  );
  return { docs: out, failed };
}

// Non-destructive startup merge. Never touches a slot's `content` unless it is empty.
function mergeHostedDefaults(vaultDocs, hosted) {
  const next = [...vaultDocs];
  for (const core of CORE_VAULT_DOCS) {
    const text = hosted[core.name];
    if (!text) continue;
    const idx = next.findIndex((d) => d.name.toLowerCase() === core.name.toLowerCase());
    if (idx < 0) {
      next.push({ ...core, content: text, uploadedContent: text, inject: true });
      continue;
    }
    const doc = next[idx];
    if (!doc.content || !doc.content.trim()) {
      next[idx] = { ...doc, content: text, uploadedContent: text, inject: true };
    } else if (!doc.uploadedContent || !doc.uploadedContent.trim()) {
      next[idx] = { ...doc, uploadedContent: text };
    }
  }
  return next;
}

// Sync Hosted Defaults: reset the six core slots to the hosted files (custom docs are left alone).
function resetCoreToHosted(vaultDocs, hosted) {
  const next = [...vaultDocs];
  for (const core of CORE_VAULT_DOCS) {
    const text = hosted[core.name];
    if (!text) continue;
    const idx = next.findIndex((d) => d.name.toLowerCase() === core.name.toLowerCase());
    if (idx < 0) next.push({ ...core, content: text, uploadedContent: text, inject: true });
    else next[idx] = { ...next[idx], content: text, uploadedContent: text, inject: true };
  }
  return next;
}

const MODEL_PRESETS = [
  { id: 'gemini-2.5-pro', label: 'Gemini 2.5 Pro (Best Writing & Reasoning)' },
  { id: 'gemini-2.5-flash', label: 'Gemini 2.5 Flash (Fast & Balanced)' },
  { id: 'gemini-2.5-flash-lite', label: 'Gemini 2.5 Flash-Lite (Ultra Fast)' },
  { id: 'gemini-2.0-flash', label: 'Gemini 2.0 Flash' },
  { id: 'custom', label: 'Custom Model ID...' },
];

const ITEM_TYPES = [
  { value: 'dialogue', label: 'Dialogue' },
  { value: 'action', label: 'Action' },
  { value: 'text_message', label: 'Text Msg' },
  { value: 'closeup', label: 'Close-Up' },
  { value: 'fight', label: 'Fight' },
];

const VALID_MOODS = [
  'happy',
  'loving',
  'sad',
  'angry',
  'scared',
  'surprised',
  'proud',
  'unimpressed',
];

const VALID_POSES = ['tell', 'point', 'ask', 'answer'];

const ALL_MOOD_POSE_OPTIONS = ['none', ...VALID_MOODS, ...VALID_POSES];

const NO_MOOD_SPEAKERS = ['vance', 'julian vance', 'clara', 'mr. pistachio'];

const QUICK_CAST = [
  'Tom',
  'Grace',
  'Rose',
  'TNB',
  'Deedee',
  'Boppy',
  'Nara',
  'Julian Vance',
  'Olivia',
  'Justin',
];

const FEEDBACK_FLAGS = [
  'Out of Character',
  'Nonsensical',
  'Not Funny',
  'Irrelevant to Story',
  'Continuity / Knowledge Break',
  'Too Long / Wordy',
  'Wrong Tone / Sliders',
  'Stale / Cliché Gag',
];

const DEFAULT_BANNED_WORDS = ['amber', 'rhubarb crisp', 'camera'];

const DEFAULT_SLIDERS = {
  humorDensity: 7,
  banterSpeed: 8,
  groundedVsGoofy: 6,
  sentimentWarmth: 3,
  minLines: 4,
  maxLines: 8,
  directorNotes: '',
};

function uid(prefix = 'id') {
  return `${prefix}_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 7)}`;
}

function approxTokens(text) {
  if (!text) return 0;
  return Math.ceil(text.length / 4);
}

function createEmptyScene(chapterNum, sceneIndex, overrides = {}) {
  const chPrefix = chapterNum === 21 ? 'bonus' : `ch${chapterNum}`;
  return {
    id: uid('scene'),
    sceneId: overrides.sceneId || `${chPrefix}_s${sceneIndex}`,
    title: overrides.title || `Scene ${sceneIndex}`,
    mapId: overrides.mapId || '',
    location: overrides.location || '',
    requiredSpeakers: overrides.requiredSpeakers || [],
    mandatoryBeats: overrides.mandatoryBeats?.length ? overrides.mandatoryBeats : [''],
    knowledgeGate: overrides.knowledgeGate || '',
    physicalSegue: overrides.physicalSegue || '',
    triggers: {
      combatEncounter: overrides.triggers?.combatEncounter || '',
      textMessageBeat: overrides.triggers?.textMessageBeat || '',
      closeupScreen: overrides.triggers?.closeupScreen || '',
    },
    sliders: { ...DEFAULT_SLIDERS, ...(overrides.sliders || {}) },
    lines: overrides.lines || [],
    history: [],
  };
}

function createInitialChapters() {
  const chapters = [];
  for (let i = 1; i <= 21; i++) {
    const isBonus = i === 21;
    chapters.push({
      id: isBonus ? 'bonus' : `ch${i}`,
      number: i,
      label: isBonus ? 'Bonus Chapter' : `Chapter ${i}`,
      title: isBonus ? 'Bonus Chapter' : `Chapter ${i}`,
      purpose: '',
      disabledBannedWords: [],
      scenes: [],
    });
  }
  return chapters;
}

function createInitialState() {
  return {
    vaultDocs: CORE_VAULT_DOCS.map((d) => ({
      ...d,
      content: '',
      uploadedContent: '',
      inject: true,
    })),
    chapters: createInitialChapters(),
    activeChapterId: 'ch1',
    activeSceneId: '',
    settings: {
      apiKey: '',
      genModelPreset: 'gemini-2.5-pro',
      genCustomModel: '',
      auditModelPreset: 'gemini-2.5-pro',
      auditCustomModel: '',
      bannedWords: [...DEFAULT_BANNED_WORDS],
    },
    auditReports: {
      trajectory: {},
      storyline: {},
    },
  };
}

// ============================================================================
// SAFE STORAGE, CLIPBOARD & PARSER HELPERS
// ============================================================================

function loadStateSafe() {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return createInitialState();
    const parsed = JSON.parse(raw);
    const base = createInitialState();
    return {
      ...base,
      ...parsed,
      settings: { ...base.settings, ...(parsed.settings || {}) },
      auditReports: {
        trajectory: parsed.auditReports?.trajectory || {},
        storyline: parsed.auditReports?.storyline || {},
      },
    };
  } catch {
    return createInitialState();
  }
}

function saveStateSafe(state) {
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {
    // Restricted storage in iframe; rely on JSON export/import
  }
}

async function copyTextSafe(text) {
  try {
    if (navigator.clipboard && navigator.clipboard.writeText) {
      await navigator.clipboard.writeText(text);
      return true;
    }
  } catch {
    // Fallback below
  }
  try {
    const ta = document.createElement('textarea');
    ta.value = text;
    ta.style.position = 'fixed';
    ta.style.opacity = '0';
    document.body.appendChild(ta);
    ta.focus();
    ta.select();
    const ok = document.execCommand('copy');
    document.body.removeChild(ta);
    return ok;
  } catch {
    return false;
  }
}

function downloadFile(filename, content, mimeType = 'text/plain;charset=utf-8') {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

// Parse Workshop packet (W <sceneId> <n> + L1: ...) OR plain SPEAKER: text lines
function parseWorkshopText(rawText) {
  const rawLines = rawText
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter(Boolean);

  let detectedSceneId = '';
  const parsedLines = [];

  for (const row of rawLines) {
    const headerMatch = row.match(/^W\s+([A-Za-z0-9_-]+)(?:\s+\d+)?$/i);
    if (headerMatch) {
      detectedSceneId = headerMatch[1];
      continue;
    }

    // Strip optional L1: / L1+: prefix
    const body = row.replace(/^L\d+\+?:\s*/i, '');
    if (body === '[cut]') continue;

    // Match tagged non-dialogue lines: [ACTION] Nara: ... or [FIGHT] ...
    const tagMatch = body.match(/^\[(ACTION|TEXT_MESSAGE|TEXT|CLOSEUP|CLOSE-UP|FIGHT)\]\s*(.*)$/i);
    if (tagMatch) {
      const rawTag = tagMatch[1].toUpperCase();
      const typeMap = {
        ACTION: 'action',
        TEXT_MESSAGE: 'text_message',
        TEXT: 'text_message',
        CLOSEUP: 'closeup',
        'CLOSE-UP': 'closeup',
        FIGHT: 'fight',
      };
      const rest = tagMatch[2].trim();
      const spMatch = rest.match(/^([A-Za-z0-9 .'-]{1,24}):\s*(.+)$/);
      parsedLines.push({
        id: uid('line'),
        type: typeMap[rawTag] || 'action',
        speaker: spMatch ? spMatch[1].trim() : '',
        mood: 'none',
        text: spMatch ? spMatch[2].trim() : rest,
        locked: false,
        flags: [],
        customNote: '',
      });
      continue;
    }

    // Match SPEAKER (mood): text OR SPEAKER: text
    const dlgMatch = body.match(/^([A-Za-z0-9 .'-]{1,28})(?:\s*\(([^)]+)\))?:\s*(.+)$/);
    if (dlgMatch) {
      const sp = dlgMatch[1].trim();
      const moodRaw = (dlgMatch[2] || 'none').trim().toLowerCase();
      const txt = dlgMatch[3].trim();
      const isNara = sp.toLowerCase() === 'nara';
      parsedLines.push({
        id: uid('line'),
        type: isNara ? 'action' : 'dialogue',
        speaker: sp,
        mood: ALL_MOOD_POSE_OPTIONS.includes(moodRaw) ? moodRaw : 'none',
        text: txt,
        locked: false,
        flags: [],
        customNote: '',
      });
      continue;
    }

    // Fallback plain action line
    parsedLines.push({
      id: uid('line'),
      type: 'action',
      speaker: '',
      mood: 'none',
      text: body,
      locked: false,
      flags: [],
      customNote: '',
    });
  }

  return { sceneId: detectedSceneId, lines: parsedLines };
}

// ============================================================================
// CLIENT-SIDE DIALOGUE LINTER (INSTANT ON KEYSTROKE & GENERATION)
// ============================================================================

function lintLine(line, activeBannedWords) {
  const warnings = [];
  const text = line.text || '';
  const speaker = (line.speaker || '').trim();
  const speakerLower = speaker.toLowerCase();
  const type = line.type || 'dialogue';
  const mood = (line.mood || 'none').trim();

  if (type === 'dialogue') {
    if (text.length > 0 && text.length < 35) {
      warnings.push({
        code: 'SHORT',
        severity: 'warn',
        message: `Short box (${text.length} ch; target 35–115)`,
      });
    } else if (text.length > 115) {
      warnings.push({
        code: 'LONG',
        severity: 'error',
        message: `Overflow (${text.length} ch; max 115)`,
      });
    }
  }

  if (text.includes('—')) {
    warnings.push({
      code: 'EM_DASH',
      severity: 'error',
      message: 'Zero em dashes (—) allowed; use en dash (–) or punctuation',
    });
  }

  if (speakerLower === 'tnb') {
    if (text.includes('!')) {
      warnings.push({
        code: 'TNB_BANG',
        severity: 'error',
        message: 'TNB never shouts: remove "!"',
      });
    }
    const capsMatches = text.match(/\b[A-Z]{2,}\b/g);
    if (capsMatches && capsMatches.length > 0) {
      warnings.push({
        code: 'TNB_CAPS',
        severity: 'error',
        message: `TNB never uses ALL-CAPS (${capsMatches.join(', ')})`,
      });
    }
  }

  if (speakerLower === 'nara' && type === 'dialogue') {
    warnings.push({
      code: 'NARA_SPEAKS',
      severity: 'error',
      message: 'Nara NEVER speaks — change type to "action"',
    });
  }

  if (NO_MOOD_SPEAKERS.includes(speakerLower) && mood !== 'none') {
    warnings.push({
      code: 'NO_MOOD_CHAR',
      severity: 'warn',
      message: `${speaker} should not take mood/pose tags`,
    });
  }

  if (mood !== 'none') {
    if (/[\s/+|,]/.test(mood)) {
      warnings.push({
        code: 'MOOD_COMBO',
        severity: 'error',
        message: `Never combine mood and pose ("${mood}")`,
      });
    } else if (!ALL_MOOD_POSE_OPTIONS.includes(mood.toLowerCase())) {
      warnings.push({
        code: 'MOOD_INVALID',
        severity: 'error',
        message: `Invalid mood/pose "${mood}"`,
      });
    }
  }

  for (const word of activeBannedWords) {
    const clean = word.trim();
    if (!clean) continue;
    const escaped = clean.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const regex = new RegExp(`\\b${escaped}\\b`, 'i');
    if (regex.test(text)) {
      warnings.push({
        code: 'BANNED_WORD',
        severity: 'error',
        message: `Banned word: "${clean}"`,
      });
    }
  }

  return warnings;
}

// ============================================================================
// GEMINI API LAYER & PROMPT COMPILERS
// ============================================================================

function getActiveModelId(preset, custom) {
  if (preset === 'custom') return (custom || '').trim();
  return preset;
}

function compileVaultPrompt(vaultDocs) {
  const included = vaultDocs.filter((d) => d.inject && d.content.trim().length > 0);
  if (included.length === 0) {
    return '=== REFERENCE VAULT ===\n(No reference documents loaded or checked.)\n=== END REFERENCE VAULT ===';
  }
  return included
    .map(
      (d) =>
        `=== REFERENCE DOC: ${d.name} ===\n${d.content.trim()}\n=== END REFERENCE DOC: ${d.name} ===`
    )
    .join('\n\n');
}

function compileSlidersPrompt(sliders, activeBannedWords) {
  const s = sliders || DEFAULT_SLIDERS;
  return [
    'EXPLICIT NUMERIC CO-WRITING RULES (FOLLOW STRICTLY):',
    `- Humor Density / Joke Rate: ${s.humorDensity}/10. (${
      s.humorDensity >= 8
        ? 'Pack sharp dry wit or deadpan observational comedy into nearly every exchange (at least 70% of dialogue lines carry a punch, button, or comedic turn).'
        : s.humorDensity >= 5
        ? 'Steady sitcom rhythm: roughly 40–60% of dialogue lines land a dry joke, undercut, or wry turn.'
        : 'Restrained comedy: prioritize plot/atmosphere with occasional dry understatement (under 30% joke lines).'
    })`,
    `- Banter Speed & Tightness: ${s.banterSpeed}/10. (${
      s.banterSpeed >= 8
        ? 'Snappy, clipped volleys. Cut throat-clearing and filler. Average spoken line 45–85 chars.'
        : s.banterSpeed >= 5
        ? 'Brisk natural pacing. Average spoken line 55–100 chars.'
        : 'Unrushed conversational rhythm within the 115-char ceiling.'
    })`,
    `- Grounded vs. Goofy: ${s.groundedVsGoofy}/10. (0 = ultra-dry deadpan realism, 10 = heightened absurdist sitcom escalation.)`,
    `- Sentiment / Warmth: ${s.sentimentWarmth}/10. (${
      s.sentimentWarmth <= 3
        ? 'Keep affection understated, unsentimental, and earned through dry teasing rather than speeches.'
        : s.sentimentWarmth <= 6
        ? 'Balanced warmth with comedic deflection.'
        : 'Allow open family warmth and sincere emotional beats without melodrama.'
    })`,
    `- Target Spoken Dialogue Line Count: STRICTLY between ${s.minLines} and ${s.maxLines} lines of type "dialogue".`,
    `- Hard Engine Rules: Every "dialogue" line MUST be 35–115 chars. ZERO em dashes ("—"). TNB NEVER uses "!" or ALL-CAPS words. Nara NEVER has type "dialogue" (always "action"). Mood/pose MUST be a single valid value from [${ALL_MOOD_POSE_OPTIONS.join(', ')}] (Vance/Clara/Mr. Pistachio must use "none").`,
    `- Active Banned Words for This Chapter (DO NOT USE): ${
      activeBannedWords.length > 0 ? activeBannedWords.join(', ') : '(none)'
    }.`,
    s.directorNotes && s.directorNotes.trim()
      ? `- SCENE-SPECIFIC DIRECTOR NOTES (OVERRIDES REFERENCE DEFAULTS): ${s.directorNotes.trim()}`
      : '',
  ]
    .filter(Boolean)
    .join('\n');
}

function compileBlueprintPrompt(chapter, scene) {
  const beats = (scene.mandatoryBeats || []).filter((b) => b.trim());
  const triggers = [];
  if (scene.triggers?.combatEncounter)
    triggers.push(`Combat Encounter: ${scene.triggers.combatEncounter}`);
  if (scene.triggers?.textMessageBeat)
    triggers.push(`Text Message Beat: ${scene.triggers.textMessageBeat}`);
  if (scene.triggers?.closeupScreen)
    triggers.push(`Close-Up Screen: ${scene.triggers.closeupScreen}`);

  return [
    `CHAPTER: ${chapter.label} — ${chapter.title}`,
    `CHAPTER PURPOSE / ARC GOAL: ${chapter.purpose || '(Not specified)'}`,
    `SCENE ID: ${scene.sceneId} | TITLE: ${scene.title}`,
    `MAP ID: ${scene.mapId || '(unspecified)'} | LOCATION: ${scene.location || '(unspecified)'}`,
    `REQUIRED SPEAKERS: ${(scene.requiredSpeakers || []).join(', ') || '(unspecified)'}`,
    `MANDATORY STORY BEATS:\n${beats.length ? beats.map((b, i) => `  ${i + 1}. ${b}`).join('\n') : '  (None specified)'}`,
    `KNOWLEDGE GATE CARRY-IN (Facts established on-screen so far):\n  ${scene.knowledgeGate || '(None specified)'}`,
    `EXACT PHYSICAL SEGUE TO NEXT SCENE: ${scene.physicalSegue || '(None specified)'}`,
    `OPTIONAL TRIGGERS: ${triggers.length ? triggers.join(' | ') : '(None)'}`,
  ].join('\n');
}

async function callGeminiJSON({ apiKey, modelId, prompt, schema, temperature = 0.7 }) {
  if (!apiKey || !apiKey.trim()) {
    throw new Error('Missing Gemini API Key. Click API Settings in the top right to add your key.');
  }
  if (!modelId || !modelId.trim()) {
    throw new Error('Missing Model ID. Open API Settings and select or enter a Gemini model ID.');
  }

  const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(
    modelId.trim()
  )}:generateContent?key=${encodeURIComponent(apiKey.trim())}`;

  const body = {
    contents: [{ role: 'user', parts: [{ text: prompt }] }],
    generationConfig: {
      responseMimeType: 'application/json',
      temperature,
    },
  };

  if (schema) {
    body.generationConfig.responseSchema = schema;
  }

  const res = await fetch(endpoint, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });

  const data = await res.json().catch(() => null);
  if (!res.ok) {
    const apiMsg = data?.error?.message || `HTTP ${res.status} ${res.statusText}`;
    throw new Error(`Gemini API Error (${modelId}): ${apiMsg}`);
  }

  const rawText = data?.candidates?.[0]?.content?.parts?.[0]?.text;
  if (!rawText) {
    const reason = data?.candidates?.[0]?.finishReason || 'Empty response';
    throw new Error(`Gemini returned no JSON text (finishReason: ${reason}).`);
  }

  try {
    return JSON.parse(rawText);
  } catch {
    const stripped = rawText
      .replace(/^```json\s*/i, '')
      .replace(/^```\s*/i, '')
      .replace(/```$/i, '')
      .trim();
    return JSON.parse(stripped);
  }
}

// JSON Schemas
const CHAPTER_EXTRACT_SCHEMA = {
  type: 'OBJECT',
  properties: {
    chapterTitle: { type: 'STRING' },
    chapterPurpose: { type: 'STRING' },
    scenes: {
      type: 'ARRAY',
      items: {
        type: 'OBJECT',
        properties: {
          sceneId: { type: 'STRING' },
          title: { type: 'STRING' },
          mapId: { type: 'STRING' },
          location: { type: 'STRING' },
          requiredSpeakers: { type: 'ARRAY', items: { type: 'STRING' } },
          mandatoryBeats: { type: 'ARRAY', items: { type: 'STRING' } },
          knowledgeGate: { type: 'STRING' },
          physicalSegue: { type: 'STRING' },
          combatEncounter: { type: 'STRING' },
          textMessageBeat: { type: 'STRING' },
          closeupScreen: { type: 'STRING' },
        },
        required: [
          'sceneId',
          'title',
          'mapId',
          'location',
          'requiredSpeakers',
          'mandatoryBeats',
          'knowledgeGate',
          'physicalSegue',
        ],
      },
    },
  },
  required: ['chapterTitle', 'chapterPurpose', 'scenes'],
};

const SCENE_GEN_SCHEMA = {
  type: 'OBJECT',
  properties: {
    lines: {
      type: 'ARRAY',
      items: {
        type: 'OBJECT',
        properties: {
          type: {
            type: 'STRING',
            enum: ['dialogue', 'action', 'text_message', 'closeup', 'fight'],
          },
          speaker: { type: 'STRING' },
          mood: { type: 'STRING', enum: ALL_MOOD_POSE_OPTIONS },
          text: { type: 'STRING' },
        },
        required: ['type', 'speaker', 'mood', 'text'],
      },
    },
  },
  required: ['lines'],
};

const SURGICAL_REGEN_SCHEMA = {
  type: 'OBJECT',
  properties: {
    patches: {
      type: 'ARRAY',
      items: {
        type: 'OBJECT',
        properties: {
          lineNumber: { type: 'INTEGER' },
          type: {
            type: 'STRING',
            enum: ['dialogue', 'action', 'text_message', 'closeup', 'fight'],
          },
          speaker: { type: 'STRING' },
          mood: { type: 'STRING', enum: ALL_MOOD_POSE_OPTIONS },
          text: { type: 'STRING' },
        },
        required: ['lineNumber', 'type', 'speaker', 'mood', 'text'],
      },
    },
  },
  required: ['patches'],
};

const TRAJECTORY_AUDIT_SCHEMA = {
  type: 'OBJECT',
  properties: {
    overallStatus: { type: 'STRING', enum: ['PASS', 'WARN', 'FAIL'] },
    summary: { type: 'STRING' },
    pacingScore: { type: 'NUMBER' },
    pacingNotes: { type: 'STRING' },
    comedyRhythmScore: { type: 'NUMBER' },
    comedyNotes: { type: 'STRING' },
    beatCoverage: {
      type: 'ARRAY',
      items: {
        type: 'OBJECT',
        properties: {
          sceneId: { type: 'STRING' },
          beat: { type: 'STRING' },
          covered: { type: 'BOOLEAN' },
          note: { type: 'STRING' },
        },
        required: ['sceneId', 'beat', 'covered', 'note'],
      },
    },
    physicalSegueAudit: {
      type: 'ARRAY',
      items: {
        type: 'OBJECT',
        properties: {
          fromSceneId: { type: 'STRING' },
          toSceneId: { type: 'STRING' },
          status: { type: 'STRING', enum: ['PASS', 'WARN', 'FAIL'] },
          note: { type: 'STRING' },
        },
        required: ['fromSceneId', 'toSceneId', 'status', 'note'],
      },
    },
    issues: {
      type: 'ARRAY',
      items: {
        type: 'OBJECT',
        properties: {
          sceneId: { type: 'STRING' },
          lineNumber: { type: 'INTEGER' },
          severity: { type: 'STRING', enum: ['high', 'medium', 'low'] },
          problem: { type: 'STRING' },
          suggestedFix: { type: 'STRING' },
        },
        required: ['sceneId', 'lineNumber', 'severity', 'problem', 'suggestedFix'],
      },
    },
  },
  required: [
    'overallStatus',
    'summary',
    'pacingScore',
    'pacingNotes',
    'comedyRhythmScore',
    'comedyNotes',
    'beatCoverage',
    'physicalSegueAudit',
    'issues',
  ],
};

const STORYLINE_AUDIT_SCHEMA = {
  type: 'OBJECT',
  properties: {
    overallStatus: { type: 'STRING', enum: ['PASS', 'WARN', 'FAIL'] },
    summary: { type: 'STRING' },
    storylineAlignment: {
      type: 'OBJECT',
      properties: {
        status: { type: 'STRING', enum: ['PASS', 'WARN', 'FAIL'] },
        analysis: { type: 'STRING' },
      },
      required: ['status', 'analysis'],
    },
    mysteryScalingIntegrity: {
      type: 'OBJECT',
      properties: {
        status: { type: 'STRING', enum: ['PASS', 'WARN', 'FAIL'] },
        analysis: { type: 'STRING' },
      },
      required: ['status', 'analysis'],
    },
    castKnowledgeGates: {
      type: 'OBJECT',
      properties: {
        status: { type: 'STRING', enum: ['PASS', 'WARN', 'FAIL'] },
        analysis: { type: 'STRING' },
      },
      required: ['status', 'analysis'],
    },
    characterVoiceArc: {
      type: 'OBJECT',
      properties: {
        status: { type: 'STRING', enum: ['PASS', 'WARN', 'FAIL'] },
        analysis: { type: 'STRING' },
      },
      required: ['status', 'analysis'],
    },
    issues: {
      type: 'ARRAY',
      items: {
        type: 'OBJECT',
        properties: {
          sceneId: { type: 'STRING' },
          lineNumber: { type: 'INTEGER' },
          category: { type: 'STRING' },
          severity: { type: 'STRING', enum: ['high', 'medium', 'low'] },
          problem: { type: 'STRING' },
          suggestedFix: { type: 'STRING' },
        },
        required: ['sceneId', 'lineNumber', 'category', 'severity', 'problem', 'suggestedFix'],
      },
    },
  },
  required: [
    'overallStatus',
    'summary',
    'storylineAlignment',
    'mysteryScalingIntegrity',
    'castKnowledgeGates',
    'characterVoiceArc',
    'issues',
  ],
};

// ============================================================================
// EXPORT FORMATTERS
// ============================================================================

// ============================================================================
// SCENE QA PIPELINE (Generate Scene = Draft > Format > QA gate > Auto-rewrite)
// ============================================================================

const QA_MAX_RETRIES = 2;
const QA_PASS_SCORE = 8;

const DEPRECATED_TERMS = ['Tombo', 'Marlowe', 'Little Elsewhere', 'rhubarb crisp', 'amber', 'Tommy'];

const AI_COMEDY_CLICHES = [
  'aggressively',
  'security detail',
  'welcome committee',
  'lifesaver',
  'fan club',
  'sanctioned',
  'concerning amount',
];

// Spoken forms that must be contracted. Matched as whole phrases, case-insensitive.
const UNCONTRACTED_FORMS = [
  'do not', 'does not', 'did not', 'is not', 'are not', 'was not', 'were not', 'have not', 'has not',
  'had not', 'will not', 'would not', 'could not', 'should not', 'cannot', 'can not',
  'i am', 'you are', 'we are', 'they are', 'he is', 'she is', 'it is', 'that is', 'there is',
  'what is', "let us", 'i will', 'you will', 'we will', 'they will', 'i have', 'you have', 'we have',
  'i would', 'you would', 'we would', 'they would', 'i had', 'you had',
];

const TNB_CAPS_OK = ['TNB', 'LA'];

function escapeRegExp(s) {
  return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

// Deterministic linter for a whole generated scene. Returns [{ lineIndex (0-based), speaker, code, message }].
function lintScene(lines, activeBannedWords) {
  const errors = [];
  const push = (idx, line, code, message) =>
    errors.push({ lineIndex: idx, speaker: line.speaker || '', code, message });

  const banned = [...new Set([...(activeBannedWords || []), ...DEPRECATED_TERMS])]
    .map((w) => w.trim())
    .filter(Boolean);

  lines.forEach((line, idx) => {
    const text = line.text || '';
    const type = line.type || 'dialogue';
    const speakerLower = (line.speaker || '').trim().toLowerCase();

    if (text.includes('—') || (line.speaker || '').includes('—')) {
      push(idx, line, 'EM_DASH', 'Contains an em dash. Use a comma, period or en dash instead.');
    }

    if (type === 'dialogue') {
      const lower = ` ${text.toLowerCase().replace(/[’]/g, "'")} `;
      const hits = UNCONTRACTED_FORMS.filter((f) => new RegExp(`[^a-z']${escapeRegExp(f)}[^a-z']`).test(lower));
      if (hits.length) {
        push(idx, line, 'NO_CONTRACTION', `Spoken line is not contracted ("${hits.join('", "')}"). Use contractions.`);
      }
    }

    if (type === 'action') {
      const quoted = text.match(/["“][^"“”]{2,}["”]/g) || [];
      const spoken = quoted.filter((q) => q.trim().split(/\s+/).length >= 2);
      if (spoken.length) {
        push(idx, line, 'QUOTE_IN_ACTION', `Quoted spoken dialogue inside an action line (${spoken[0].slice(0, 40)}). Move it to its own dialogue line.`);
      }
    }

    for (const word of banned) {
      const re = new RegExp(`\\b${escapeRegExp(word)}s?\\b`, 'i');
      if (re.test(text)) {
        const kind = DEPRECATED_TERMS.some((d) => d.toLowerCase() === word.toLowerCase()) ? 'Deprecated term' : 'Banned word';
        push(idx, line, 'BANNED_TERM', `${kind}: "${word}".`);
      }
    }

    // "Rosie" is only allowed as "Cozy Rosie".
    const rosie = /\bRosie\b/gi;
    let m;
    while ((m = rosie.exec(text))) {
      if (!/cozy\s+$/i.test(text.slice(0, m.index))) {
        push(idx, line, 'ROSIE', 'Never "Rosie" alone. Use "Rose", or "Cozy Rosie" when talking TO her.');
        break;
      }
    }

    const lowerText = text.toLowerCase();
    for (const c of AI_COMEDY_CLICHES) {
      if (lowerText.includes(c)) push(idx, line, 'CLICHE', `AI comedy cliche: "${c}". Write a fresher, character-specific joke.`);
    }

    if (speakerLower === 'tnb') {
      if (text.includes('!')) push(idx, line, 'TNB_BANG', 'TNB never uses an exclamation mark.');
      const caps = (text.match(/\b[A-Z]{2,}\b/g) || []).filter((w) => !TNB_CAPS_OK.includes(w));
      if (caps.length) push(idx, line, 'TNB_CAPS', `TNB never uses ALL-CAPS words (${caps.join(', ')}).`);
    }

    // Engine rules that would break the game (overflow, Nara speaking, bad mood tags).
    for (const w of lintLine(line, [])) {
      if (w.severity === 'error' && ['LONG', 'NARA_SPEAKS', 'MOOD_COMBO', 'MOOD_INVALID'].includes(w.code)) {
        push(idx, line, w.code, w.message);
      }
    }
  });

  return errors;
}

// Pull only the dossier material for the scene's speakers out of the two reference docs.
function extractSpeakerDossiers(vaultDocs, speakers) {
  const find = (name) => vaultDocs.find((d) => d.name.toLowerCase() === name && d.content?.trim());
  const canon = find('canon-and-characters.md')?.content || '';
  const comedy = find('comedy-bible.md')?.content || '';
  const out = [];
  const seen = new Set();

  for (const sp of speakers) {
    const name = sp.trim();
    if (!name) continue;
    const first = name.split(/\s+/)[0];
    const re = new RegExp(`\\b${escapeRegExp(name)}\\b|\\*\\*${escapeRegExp(first)}\\*\\*`, 'i');
    const parts = [];

    // Comedy engine sections: "### 2.x Name ..." until the next heading.
    const sections = comedy.split(/\n(?=###? )/);
    for (const sec of sections) {
      const head = sec.split('\n', 1)[0];
      if (/^###\s+2\.\d+/.test(head) && re.test(head) && !seen.has(head)) {
        seen.add(head);
        parts.push(sec.trim());
      }
    }
    // Canon: the cast table row plus bullet lines that name the character.
    for (const ln of canon.split('\n')) {
      if (seen.has(ln)) continue;
      const isRow = /^\|\s*\*\*/.test(ln) && re.test(ln.split('|')[1] || '');
      const isBullet = /^\s*-\s/.test(ln) && re.test(ln) && ln.length < 900;
      if (isRow || isBullet) {
        seen.add(ln);
        parts.push(ln.trim());
      }
    }
    out.push(`--- DOSSIER: ${name} ---\n${parts.length ? parts.join('\n\n') : '(No dossier found in the vault for this speaker.)'}`);
  }
  return out.join('\n\n');
}

function docText(vaultDocs, name) {
  const d = vaultDocs.find((x) => x.name.toLowerCase() === name);
  return d?.content?.trim() ? d.content.trim() : '';
}

function compileSceneFacts(chapter, scene) {
  const beats = (scene.mandatoryBeats || []).filter((b) => b.trim());
  return [
    `SCENE: ${scene.sceneId} | ${scene.title}${scene.location ? ` | ${scene.location}` : ''}`,
    `REQUIRED SPEAKERS: ${(scene.requiredSpeakers || []).join(', ') || '(unspecified)'}`,
    `MANDATORY BEATS (story facts that must happen; never copy their wording, dramatize them):\n${
      beats.length ? beats.map((b, i) => `  ${i + 1}. ${b}`).join('\n') : '  (None specified)'
    }`,
    `KNOWLEDGE GATE (what characters know entering the scene; nobody may know or reference more):\n  ${scene.knowledgeGate || '(None specified)'}`,
    scene.sliders?.directorNotes?.trim() ? `DIRECTOR NOTES (override defaults): ${scene.sliders.directorNotes.trim()}` : '',
  ]
    .filter(Boolean)
    .join('\n');
}

function numberedScript(lines) {
  return lines
    .map((l, i) => `L${i + 1} [${l.type}] ${l.speaker}${l.mood && l.mood !== 'none' ? ` (${l.mood})` : ''}: ${l.text}`)
    .join('\n');
}

async function callGeminiText({ apiKey, modelId, prompt, temperature }) {
  if (!apiKey || !apiKey.trim()) {
    throw new Error('Missing Gemini API Key. Click API Settings in the top right to add your key.');
  }
  if (!modelId || !modelId.trim()) {
    throw new Error('Missing Model ID. Open API Settings and select or enter a Gemini model ID.');
  }
  const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(
    modelId.trim()
  )}:generateContent?key=${encodeURIComponent(apiKey.trim())}`;
  const res = await fetch(endpoint, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      contents: [{ role: 'user', parts: [{ text: prompt }] }],
      generationConfig: { temperature },
    }),
  });
  const data = await res.json().catch(() => null);
  if (!res.ok) {
    throw new Error(`Gemini API Error (${modelId}): ${data?.error?.message || `HTTP ${res.status} ${res.statusText}`}`);
  }
  const text = (data?.candidates?.[0]?.content?.parts || []).map((p) => p.text || '').join('').trim();
  if (!text) {
    throw new Error(`Gemini returned no text (finishReason: ${data?.candidates?.[0]?.finishReason || 'Empty response'}).`);
  }
  return text;
}

const CRITIC_SCHEMA = {
  type: 'OBJECT',
  properties: {
    pass: { type: 'BOOLEAN' },
    score: { type: 'NUMBER' },
    issues: {
      type: 'ARRAY',
      items: {
        type: 'OBJECT',
        properties: {
          lineIndex: { type: 'INTEGER' },
          speaker: { type: 'STRING' },
          category: { type: 'STRING', enum: ['Comedy', 'Voice', 'Logic', 'Canon', 'KnowledgeGate'] },
          problem: { type: 'STRING' },
          fix: { type: 'STRING' },
        },
        required: ['lineIndex', 'speaker', 'category', 'problem', 'fix'],
      },
    },
  },
  required: ['pass', 'score', 'issues'],
};

const HARD_FORMAT_RULES = (activeBannedWords) =>
  [
    'HARD RULES:',
    '- Contractions always in spoken dialogue (I\'m, it\'s, don\'t). ZERO em dashes.',
    '- Never put spoken dialogue (quoted speech) inside an "action" line. Speech is always its own "dialogue" line.',
    '- Every "dialogue" line is 35 to 115 characters.',
    '- TNB never uses "!" or ALL-CAPS words. Nara never speaks (her sounds are "action" lines).',
    `- Mood/pose is one single value from [${ALL_MOOD_POSE_OPTIONS.join(', ')}]. Julian Vance, Clara and Mr. Pistachio use "none".`,
    `- Never use: ${[...new Set([...(activeBannedWords || []), ...DEPRECATED_TERMS, ...AI_COMEDY_CLICHES])].join(', ')}. Never "Rosie" alone (only "Cozy Rosie").`,
  ].join('\n');

function toLineObjects(items) {
  return (items || []).map((item) => ({
    id: uid('line'),
    type: item.type || 'dialogue',
    speaker: item.speaker || '',
    mood: item.mood || 'none',
    text: item.text || '',
    locked: false,
    flags: [],
    customNote: '',
  }));
}

// Runs the whole pipeline. `setStatus` gets the live progress text. Returns { lines, qa }.
async function runSceneQAPipeline({ apiKey, genModelId, auditModelId, vaultDocs, chapter, scene, activeBannedWords, setStatus }) {
  const speakers = scene.requiredSpeakers || [];
  const combat = Boolean(scene.triggers?.combatEncounter?.trim());
  const comedyBible = docText(vaultDocs, 'comedy-bible.md');
  const canon = docText(vaultDocs, 'canon-and-characters.md');
  const dossiers = extractSpeakerDossiers(vaultDocs, speakers);
  const facts = compileSceneFacts(chapter, scene);
  const combatDocs = combat
    ? ['battle-spec-v11.md', 'bestiary-v11.md', 'workshop-and-map-spec.md']
        .map((n) => (docText(vaultDocs, n) ? `=== REFERENCE DOC: ${n} ===\n${docText(vaultDocs, n)}\n=== END ${n} ===` : ''))
        .filter(Boolean)
        .join('\n\n')
    : '';
  const s = scene.sliders || DEFAULT_SLIDERS;

  // PASS 1: plain-text comedy draft (no JSON).
  setStatus('Drafting...');
  const draftPrompt = [
    'You are the head writer of the family comedy JRPG "The Adventures of Tom". Write ONE scene as a plain-text script.',
    'Voice target: Hacks, Schitt\'s Creek and Abbott Elementary. Sharp, specific banter that comes from each character\'s comedy engine (see the dossiers). No sitcom filler, no generic quips.',
    'Dramatize the mandatory beats in your own words. Never paraphrase a beat verbatim or announce it. Respect the knowledge gate.',
    'Format, one item per line:',
    '  ACTION: a short description of what happens (never contains anyone speaking)',
    '  NAME (mood): what the character says   [mood is optional]',
    `Aim for ${s.minLines} to ${s.maxLines} spoken lines, each under 115 characters. Contractions always. Zero em dashes. Never put spoken dialogue inside an ACTION line.`,
    `Never use these words: ${[...new Set([...(activeBannedWords || []), ...DEPRECATED_TERMS])].join(', ')}.`,
    '',
    `=== REFERENCE DOC: comedy-bible.md ===\n${comedyBible || '(not loaded)'}\n=== END comedy-bible.md ===`,
    '',
    '=== SPEAKER DOSSIERS (canon-and-characters.md and comedy engines) ===',
    dossiers || '(No required speakers set.)',
    '=== END DOSSIERS ===',
    combatDocs ? `\n${combatDocs}\n` : '',
    '=== SCENE ===',
    facts,
    '=== END SCENE ===',
    '',
    'Output only the script. No title, no commentary, no markdown.',
  ].join('\n');
  const draftText = await callGeminiText({ apiKey, modelId: genModelId, prompt: draftPrompt, temperature: 0.85 });

  // PASS 2: JSON formatter.
  setStatus('Formatting script...');
  const formatPrompt = [
    'Convert this plain-text scene script into the exact JSON schema (lines[] of {type, speaker, mood, text}).',
    'Keep every word of dialogue exactly as written. Do not add, remove or reorder lines, with ONE exception: if an ACTION line contains anyone speaking in quotes, split the speech out into its own "dialogue" line for that speaker (right after the action) and leave the action line as pure description.',
    'ACTION lines become type "action" with speaker "Narrator" unless a character does the action (then use that character as speaker). Use "dialogue" for speech. Use mood "none" when no mood is given or when it is not in the allowed list.',
    HARD_FORMAT_RULES(activeBannedWords),
    '',
    '=== SCRIPT ===',
    draftText,
    '=== END SCRIPT ===',
  ].join('\n');
  const formatted = await callGeminiJSON({ apiKey, modelId: genModelId, prompt: formatPrompt, schema: SCENE_GEN_SCHEMA, temperature: 0.1 });
  let current = toLineObjects(formatted.lines);
  if (!current.length) throw new Error('Formatter returned no lines.');

  // PASS 3 + 4: QA gate with up to QA_MAX_RETRIES auto-rewrites.
  const runCritic = async (lines) => {
    const criticPrompt = [
      'You are a harsh, experienced sitcom Showrunner reviewing a script for the family JRPG "The Adventures of Tom". You protect the comedy, the characters and the canon. Be specific and unsentimental.',
      'Judge the numbered draft against comedy-bible.md, canon-and-characters.md and the scene\'s knowledge gate.',
      'Look for: jokes that are not funny or are AI-generic; lines that do not sound like that character; lines that make no sense in the moment; sitcom-cheesy or on-the-nose lines; a beat owned by the wrong character; anyone knowing or referencing something the knowledge gate says they do not know yet; canon violations.',
      `Score 1 to 10. Set "pass" to false if the score is below ${QA_PASS_SCORE}, OR if any single line is nonsensical, out of character, sitcom-cheesy, or gives the wrong character ownership of a beat. Otherwise true.`,
      'For each problem give lineIndex (the L number, 1-based), the speaker, a category (Comedy, Voice, Logic, Canon or KnowledgeGate), what is wrong, and a concrete fix. Return an empty issues list only if there is truly nothing to fix.',
      '',
      `=== REFERENCE DOC: comedy-bible.md ===\n${comedyBible || '(not loaded)'}\n=== END ===`,
      '',
      `=== REFERENCE DOC: canon-and-characters.md ===\n${canon || '(not loaded)'}\n=== END ===`,
      '',
      '=== SCENE ===',
      facts,
      '=== END SCENE ===',
      '',
      '=== DRAFT ===',
      numberedScript(lines),
      '=== END DRAFT ===',
      '',
      'Return strict JSON only.',
    ].join('\n');
    const r = await callGeminiJSON({ apiKey, modelId: auditModelId, prompt: criticPrompt, schema: CRITIC_SCHEMA, temperature: 0.2 });
    const score = Number(r.score) || 0;
    return {
      pass: r.pass === true && score >= QA_PASS_SCORE,
      score,
      issues: (r.issues || []).map((i) => ({ ...i, lineIndex: Number(i.lineIndex) || 0 })),
    };
  };

  const evaluate = async (lines, label) => {
    setStatus(label);
    const linter = lintScene(lines, activeBannedWords);
    let critic;
    try {
      critic = await runCritic(lines);
    } catch (err) {
      critic = { pass: false, score: 0, issues: [], unavailable: String(err.message || err) };
    }
    return { lines, linter, critic, ok: linter.length === 0 && critic.pass };
  };

  let best = null;
  const consider = (ev) => {
    const rank = (e) => [e.linter.length, e.critic.unavailable ? 99 : 0, -e.critic.score];
    if (!best) return (best = ev);
    const a = rank(ev);
    const b = rank(best);
    for (let i = 0; i < a.length; i++) {
      if (a[i] < b[i]) return (best = ev);
      if (a[i] > b[i]) return best;
    }
    return (best = ev);
  };

  let ev = await evaluate(current, `Running QA check (Attempt 1/${QA_MAX_RETRIES})...`);
  consider(ev);
  let retries = 0;
  while (!ev.ok && retries < QA_MAX_RETRIES) {
    // A critic outage cannot be fixed by rewriting; only rewrite when there is something concrete to fix.
    if (ev.critic.unavailable && ev.linter.length === 0) break;
    retries += 1;
    setStatus(`Auto-fixing issues (retry ${retries}/${QA_MAX_RETRIES})...`);
    const linterList = ev.linter.length
      ? ev.linter.map((e) => `- L${e.lineIndex + 1} (${e.speaker}) [${e.code}]: ${e.message}`).join('\n')
      : '(none)';
    const criticList = ev.critic.issues.length
      ? ev.critic.issues.map((i) => `- L${i.lineIndex} (${i.speaker}) [${i.category}]: ${i.problem} FIX: ${i.fix}`).join('\n')
      : '(none)';
    const rewritePrompt = [
      'You are the head writer of "The Adventures of Tom". Your draft failed QA. Rewrite the WHOLE scene so every listed problem is fixed. You may rewrite, merge, split, add or delete lines. Keep what already works.',
      'Fix the cause, not the symptom: a flat joke needs a better joke, not a synonym.',
      '',
      `=== REFERENCE DOC: comedy-bible.md ===\n${comedyBible || '(not loaded)'}\n=== END ===`,
      '',
      '=== SPEAKER DOSSIERS ===',
      dossiers || '(none)',
      '=== END DOSSIERS ===',
      combatDocs ? `\n${combatDocs}\n` : '',
      '=== SCENE ===',
      facts,
      '=== END SCENE ===',
      '',
      HARD_FORMAT_RULES(activeBannedWords),
      '',
      '=== CURRENT DRAFT ===',
      numberedScript(ev.lines),
      '=== END CURRENT DRAFT ===',
      '',
      `=== LINTER ERRORS (must all be fixed) ===\n${linterList}\n=== END ===`,
      '',
      `=== SHOWRUNNER ISSUES (score ${ev.critic.score}/10) ===\n${criticList}\n=== END ===`,
      '',
      'Return the full corrected scene as JSON matching the schema.',
    ].join('\n');
    const rewritten = await callGeminiJSON({ apiKey, modelId: genModelId, prompt: rewritePrompt, schema: SCENE_GEN_SCHEMA, temperature: 0.6 });
    const newLines = toLineObjects(rewritten.lines);
    if (!newLines.length) break;
    ev = await evaluate(
      newLines,
      retries < QA_MAX_RETRIES ? `Running QA check (Attempt ${retries + 1}/${QA_MAX_RETRIES})...` : 'Running final QA check...'
    );
    consider(ev);
  }

  const final = ev.ok ? ev : best;
  const notes = [];
  for (const e of final.linter) notes.push(`L${e.lineIndex + 1} (${e.speaker || 'n/a'}) linter: ${e.message}`);
  for (const i of final.critic.issues) notes.push(`L${i.lineIndex} (${i.speaker}) ${i.category}: ${i.problem}`);
  if (final.critic.unavailable) notes.push(`Showrunner critic unavailable: ${final.critic.unavailable}`);
  return {
    lines: final.lines,
    qa: {
      passed: final.ok,
      score: final.critic.unavailable ? null : final.critic.score,
      retries,
      notes,
      at: new Date().toISOString(),
    },
  };
}

function formatWorkshopScene(scene) {
  const header = `W ${scene.sceneId || 'scene'} ${scene.lines.length}`;
  const body = scene.lines.map((line, idx) => {
    const n = idx + 1;
    const sp = (line.speaker || '').trim();
    const moodPart = line.mood && line.mood !== 'none' ? ` (${line.mood})` : '';
    if (line.type === 'dialogue') {
      return `L${n}: ${sp || 'SPEAKER'}${moodPart}: ${line.text}`;
    }
    const tag = line.type.toUpperCase();
    return `L${n}: [${tag}]${sp ? ` ${sp}:` : ''} ${line.text}`;
  });
  return [header, ...body].join('\n');
}

function formatMarkdownScene(scene) {
  const lines = [
    `### ${scene.title} (\`${scene.sceneId}\`)`,
    scene.location || scene.mapId
      ? `*Location: ${scene.location || 'TBD'}${scene.mapId ? ` · Map: \`${scene.mapId}\`` : ''}*`
      : null,
    '',
    ...scene.lines.map((line, idx) => {
      const n = idx + 1;
      const sp = (line.speaker || '').trim();
      const moodStr = line.mood && line.mood !== 'none' ? ` *(${line.mood})*` : '';
      if (line.type === 'dialogue') {
        return `**L${n}. ${sp || 'SPEAKER'}**${moodStr}: ${line.text}`;
      }
      if (line.type === 'action') {
        return `*L${n}. [ACTION]* ${sp ? `${sp} – ` : ''}${line.text}`;
      }
      if (line.type === 'text_message') {
        return `> **L${n}. [TEXT MESSAGE · ${sp || 'PHONE'}]:** ${line.text}`;
      }
      if (line.type === 'closeup') {
        return `**L${n}. [CLOSE-UP]:** ${line.text}`;
      }
      return `**L${n}. [FIGHT]:** ${line.text}`;
    }),
  ].filter((x) => x !== null);
  return lines.join('\n');
}

// ============================================================================
// SUB-COMPONENTS
// ============================================================================

function SimpleMarkdownPreview({ content }) {
  if (!content || !content.trim()) {
    return (
      <div className="flex flex-col items-center justify-center h-64 text-slate-500 text-sm">
        <FileText className="w-8 h-8 mb-2 opacity-40" />
        <p>This document slot is empty.</p>
        <p className="text-xs text-slate-600 mt-1">
          Upload a .md/.txt file or switch to Live Edit to paste content.
        </p>
      </div>
    );
  }

  const lines = content.split('\n');
  return (
    <div className="space-y-1.5 text-sm text-slate-300 leading-relaxed">
      {lines.map((line, i) => {
        if (line.startsWith('### ')) {
          return (
            <h4 key={i} className="text-base font-semibold text-indigo-300 pt-3 pb-0.5">
              {line.slice(4)}
            </h4>
          );
        }
        if (line.startsWith('## ')) {
          return (
            <h3 key={i} className="text-lg font-bold text-slate-100 pt-4 pb-1 border-b border-slate-800">
              {line.slice(3)}
            </h3>
          );
        }
        if (line.startsWith('# ')) {
          return (
            <h2 key={i} className="text-xl font-bold text-white pt-2 pb-1">
              {line.slice(2)}
            </h2>
          );
        }
        if (/^\s*[-*]\s+/.test(line)) {
          return (
            <div key={i} className="flex gap-2 pl-3">
              <span className="text-indigo-400 select-none">•</span>
              <span>{line.replace(/^\s*[-*]\s+/, '')}</span>
            </div>
          );
        }
        if (line.trim() === '') return <div key={i} className="h-2" />;
        return (
          <p key={i} className="whitespace-pre-wrap">
            {line}
          </p>
        );
      })}
    </div>
  );
}

function StatusBadge({ status }) {
  const s = (status || '').toUpperCase();
  if (s === 'PASS') {
    return (
      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-500/15 text-emerald-300 border border-emerald-500/30">
        <CheckCircle2 className="w-3.5 h-3.5" /> PASS
      </span>
    );
  }
  if (s === 'WARN') {
    return (
      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-500/15 text-amber-300 border border-amber-500/30">
        <AlertTriangle className="w-3.5 h-3.5" /> WARN
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-rose-500/15 text-rose-300 border border-rose-500/30">
      <AlertCircle className="w-3.5 h-3.5" /> FAIL
    </span>
  );
}

// ============================================================================
// MAIN APPLICATION
// ============================================================================

export default function App() {
  const [state, setState] = useState(loadStateSafe);
  const [activeTab, setActiveTab] = useState('studio'); // vault | studio | checkers | export
  const [selectedDocId, setSelectedDocId] = useState('canon-and-characters.md');
  const [docViewMode, setDocViewMode] = useState('preview'); // preview | edit
  const [showNewDocInput, setShowNewDocInput] = useState(false);
  const [newDocName, setNewDocName] = useState('');

  // Streamlined Scene Studio UI state
  const [leftPaneTab, setLeftPaneTab] = useState('blueprint'); // blueprint | tone
  const [speakerInput, setSpeakerInput] = useState('');
  const [expandedFlagLineIds, setExpandedFlagLineIds] = useState({});
  const [highlightedLineIdx, setHighlightedLineIdx] = useState(null);
  const [dismissSetupGuide, setDismissSetupGuide] = useState(false);

  // Modals
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [showApiKey, setShowApiKey] = useState(false);
  const [newBannedWord, setNewBannedWord] = useState('');
  const [testConnState, setTestConnState] = useState({ status: 'idle', message: '' });
  const [pasteModalOpen, setPasteModalOpen] = useState(false);
  const [pasteText, setPasteText] = useState('');
  const [confirmModal, setConfirmModal] = useState(null);

  // Loading & Feedback
  const [loadingStatus, setLoadingStatus] = useState('');
  const [errorBanner, setErrorBanner] = useState('');
  const [toast, setToast] = useState('');

  // Export tab state
  const [exportScope, setExportScope] = useState('chapter'); // scene | chapter | all
  const [exportFormat, setExportFormat] = useState('workshop'); // workshop | markdown | json
  const [copiedKey, setCopiedKey] = useState('');

  const vaultFileInputRef = useRef(null);
  const projectImportRef = useRef(null);

  useEffect(() => {
    saveStateSafe(state);
  }, [state]);

  // Auto-load the six hosted reference docs on startup (merge keeps every local edit and upload).
  useEffect(() => {
    let cancelled = false;
    fetchHostedDocs().then(({ docs, failed }) => {
      if (cancelled) return;
      if (Object.keys(docs).length > 0) {
        setState((prev) => ({ ...prev, vaultDocs: mergeHostedDefaults(prev.vaultDocs, docs) }));
      }
      if (failed.length > 0) {
        setErrorBanner(`Could not load hosted reference file(s): ${failed.join(', ')}. Upload them in Tab 1 if needed.`);
      }
    });
    return () => {
      cancelled = true;
    };
  }, []);

  const handleSyncHostedDefaults = () => {
    setConfirmModal({
      title: 'Sync Hosted Defaults?',
      message:
        'This re-fetches the six core reference docs from the website and replaces your current text in those six slots (edits and uploads included). Docs you added yourself are not touched.',
      confirmLabel: 'Sync Hosted Defaults',
      onConfirm: async () => {
        setConfirmModal(null);
        setErrorBanner('');
        setLoadingStatus('Fetching hosted reference docs...');
        try {
          const { docs, failed } = await fetchHostedDocs();
          if (failed.length === CORE_VAULT_DOCS.length) {
            throw new Error('Could not reach the hosted reference files. Nothing was changed.');
          }
          setState((prev) => ({ ...prev, vaultDocs: resetCoreToHosted(prev.vaultDocs, docs) }));
          const okCount = CORE_VAULT_DOCS.length - failed.length;
          showToast(
            failed.length
              ? `Synced ${okCount} of ${CORE_VAULT_DOCS.length}; failed: ${failed.join(', ')}.`
              : `Synced all ${CORE_VAULT_DOCS.length} hosted docs.`
          );
        } catch (err) {
          setErrorBanner(err.message || 'Sync failed.');
        } finally {
          setLoadingStatus('');
        }
      },
    });
  };

  const showToast = (msg) => {
    setToast(msg);
    window.clearTimeout(window.__aotToastTimer);
    window.__aotToastTimer = window.setTimeout(() => setToast(''), 3200);
  };

  // Derived active chapter & scene
  const activeChapter = useMemo(() => {
    return state.chapters.find((c) => c.id === state.activeChapterId) || state.chapters[0];
  }, [state.chapters, state.activeChapterId]);

  const activeScene = useMemo(() => {
    if (!activeChapter || activeChapter.scenes.length === 0) return null;
    return (
      activeChapter.scenes.find((s) => s.id === state.activeSceneId) ||
      activeChapter.scenes[0]
    );
  }, [activeChapter, state.activeSceneId]);

  const selectedDoc = useMemo(() => {
    return state.vaultDocs.find((d) => d.id === selectedDocId) || state.vaultDocs[0];
  }, [state.vaultDocs, selectedDocId]);

  const vaultStats = useMemo(() => {
    const loaded = state.vaultDocs.filter((d) => d.content.trim().length > 0);
    const injected = loaded.filter((d) => d.inject);
    const totalTokens = injected.reduce((acc, d) => acc + approxTokens(d.content), 0);
    return {
      total: state.vaultDocs.length,
      loadedCount: loaded.length,
      injectedCount: injected.length,
      totalTokens,
    };
  }, [state.vaultDocs]);

  const activeBannedWords = useMemo(() => {
    const disabled = activeChapter?.disabledBannedWords || [];
    return (state.settings.bannedWords || []).filter((w) => !disabled.includes(w));
  }, [state.settings.bannedWords, activeChapter]);

  const genModelId = getActiveModelId(
    state.settings.genModelPreset,
    state.settings.genCustomModel
  );
  const auditModelId = getActiveModelId(
    state.settings.auditModelPreset,
    state.settings.auditCustomModel
  );

  // ==========================================================================
  // STATE UPDATERS
  // ==========================================================================

  const updateChapter = (chapterId, updater) => {
    setState((prev) => ({
      ...prev,
      chapters: prev.chapters.map((ch) =>
        ch.id === chapterId
          ? typeof updater === 'function'
            ? updater(ch)
            : { ...ch, ...updater }
          : ch
      ),
    }));
  };

  const updateActiveScene = (updater) => {
    if (!activeChapter || !activeScene) return;
    updateChapter(activeChapter.id, (ch) => ({
      ...ch,
      scenes: ch.scenes.map((sc) =>
        sc.id === activeScene.id
          ? typeof updater === 'function'
            ? updater(sc)
            : { ...sc, ...updater }
          : sc
      ),
    }));
  };

  const updateLine = (lineId, patch) => {
    updateActiveScene((sc) => ({
      ...sc,
      lines: sc.lines.map((l) => (l.id === lineId ? { ...l, ...patch } : l)),
    }));
  };

  // ==========================================================================
  // PROJECT IMPORT / EXPORT
  // ==========================================================================

  const handleExportProjectJSON = () => {
    const safeExport = {
      ...state,
      settings: { ...state.settings, apiKey: '' },
      exportedAt: new Date().toISOString(),
    };
    downloadFile(
      `aot-script-studio-${new Date().toISOString().slice(0, 10)}.json`,
      JSON.stringify(safeExport, null, 2),
      'application/json'
    );
    showToast('Project JSON exported (API key excluded).');
  };

  const handleImportProjectJSON = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const parsed = JSON.parse(String(reader.result || ''));
        if (!Array.isArray(parsed.chapters) || !Array.isArray(parsed.vaultDocs)) {
          throw new Error('Invalid AoT Script Studio project file.');
        }
        setState((prev) => ({
          ...createInitialState(),
          ...parsed,
          settings: {
            ...createInitialState().settings,
            ...(parsed.settings || {}),
            apiKey: parsed.settings?.apiKey || prev.settings.apiKey,
          },
        }));
        setErrorBanner('');
        showToast(`Imported "${file.name}".`);
      } catch (err) {
        setErrorBanner(`Import failed: ${err.message}`);
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  // ==========================================================================
  // VAULT HANDLERS
  // ==========================================================================

  const handleVaultUpload = async (e) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    const readResults = await Promise.all(
      files.map(
        (file) =>
          new Promise((resolve) => {
            const r = new FileReader();
            r.onload = () => resolve({ name: file.name, text: String(r.result || '') });
            r.onerror = () => resolve({ name: file.name, text: '' });
            r.readAsText(file);
          })
      )
    );

    let lastDocId = selectedDocId;
    setState((prev) => {
      const nextDocs = [...prev.vaultDocs];
      for (const item of readResults) {
        const idx = nextDocs.findIndex(
          (d) => d.name.toLowerCase() === item.name.toLowerCase()
        );
        if (idx >= 0) {
          nextDocs[idx] = {
            ...nextDocs[idx],
            content: item.text,
            uploadedContent: item.text,
            inject: true,
          };
          lastDocId = nextDocs[idx].id;
        } else {
          const newId = uid('doc');
          nextDocs.push({
            id: newId,
            name: item.name,
            core: false,
            content: item.text,
            uploadedContent: item.text,
            inject: true,
          });
          lastDocId = newId;
        }
      }
      return { ...prev, vaultDocs: nextDocs };
    });

    setSelectedDocId(lastDocId);
    showToast(`Loaded ${readResults.length} file(s) into Reference Vault.`);
    e.target.value = '';
  };

  const handleAddNewDoc = () => {
    const trimmed = newDocName.trim();
    if (!trimmed) return;
    const finalName = /\.(md|txt)$/i.test(trimmed) ? trimmed : `${trimmed}.md`;
    const newId = uid('doc');
    setState((prev) => ({
      ...prev,
      vaultDocs: [
        ...prev.vaultDocs,
        {
          id: newId,
          name: finalName,
          core: false,
          content: '',
          uploadedContent: '',
          inject: true,
        },
      ],
    }));
    setSelectedDocId(newId);
    setDocViewMode('edit');
    setNewDocName('');
    setShowNewDocInput(false);
    showToast(`Created "${finalName}".`);
  };

  // ==========================================================================
  // SCENE MANAGEMENT & PASTE IMPORT
  // ==========================================================================

  const handleSelectChapter = (chapterId) => {
    const ch = state.chapters.find((c) => c.id === chapterId);
    if (!ch) return;
    setState((prev) => ({
      ...prev,
      activeChapterId: chapterId,
      activeSceneId: ch.scenes[0]?.id || '',
    }));
    setHighlightedLineIdx(null);
  };

  const handleAddScene = () => {
    const newSc = createEmptyScene(activeChapter.number, activeChapter.scenes.length + 1);
    updateChapter(activeChapter.id, (ch) => ({
      ...ch,
      scenes: [...ch.scenes, newSc],
    }));
    setState((prev) => ({ ...prev, activeSceneId: newSc.id }));
    showToast(`Added ${newSc.sceneId}.`);
  };

  const handleDuplicateScene = () => {
    if (!activeScene) return;
    const copy = {
      ...JSON.parse(JSON.stringify(activeScene)),
      id: uid('scene'),
      sceneId: `${activeScene.sceneId}_copy`,
      title: `${activeScene.title} (Copy)`,
      lines: activeScene.lines.map((l) => ({ ...l, id: uid('line') })),
    };
    updateChapter(activeChapter.id, (ch) => ({
      ...ch,
      scenes: [...ch.scenes, copy],
    }));
    setState((prev) => ({ ...prev, activeSceneId: copy.id }));
    showToast(`Duplicated as ${copy.sceneId}.`);
  };

  const handleReorderScene = (sceneId, direction) => {
    updateChapter(activeChapter.id, (ch) => {
      const idx = ch.scenes.findIndex((s) => s.id === sceneId);
      if (idx < 0) return ch;
      const target = idx + direction;
      if (target < 0 || target >= ch.scenes.length) return ch;
      const next = [...ch.scenes];
      const [moved] = next.splice(idx, 1);
      next.splice(target, 0, moved);
      return { ...ch, scenes: next };
    });
  };

  const handleDeleteScene = (sceneId) => {
    const target = activeChapter.scenes.find((s) => s.id === sceneId);
    setConfirmModal({
      title: 'Delete Scene?',
      message: `Remove "${target?.title || sceneId}" (${target?.lines.length || 0} lines)?`,
      confirmLabel: 'Delete Scene',
      onConfirm: () => {
        const remaining = activeChapter.scenes.filter((s) => s.id !== sceneId);
        updateChapter(activeChapter.id, (ch) => ({ ...ch, scenes: remaining }));
        if (state.activeSceneId === sceneId) {
          setState((prev) => ({ ...prev, activeSceneId: remaining[0]?.id || '' }));
        }
        setConfirmModal(null);
        showToast('Scene deleted.');
      },
    });
  };

  const handleImportPastedScript = () => {
    if (!pasteText.trim()) return;
    const { sceneId, lines } = parseWorkshopText(pasteText);
    if (lines.length === 0) {
      showToast('Could not find any lines to import.');
      return;
    }

    const speakers = Array.from(
      new Set(lines.map((l) => l.speaker.trim()).filter(Boolean))
    );

    if (activeScene && activeScene.lines.length === 0) {
      updateActiveScene((sc) => ({
        ...sc,
        sceneId: sceneId || sc.sceneId,
        requiredSpeakers: sc.requiredSpeakers.length ? sc.requiredSpeakers : speakers,
        lines,
      }));
      showToast(`Imported ${lines.length} lines into ${sceneId || activeScene.sceneId}.`);
    } else {
      const newSc = createEmptyScene(activeChapter.number, activeChapter.scenes.length + 1, {
        sceneId: sceneId || undefined,
        title: sceneId ? `Imported ${sceneId}` : `Imported Scene ${activeChapter.scenes.length + 1}`,
        requiredSpeakers: speakers,
        lines,
      });
      updateChapter(activeChapter.id, (ch) => ({
        ...ch,
        scenes: [...ch.scenes, newSc],
      }));
      setState((prev) => ({ ...prev, activeSceneId: newSc.id }));
      showToast(`Created scene ${newSc.sceneId} with ${lines.length} lines.`);
    }

    setPasteText('');
    setPasteModalOpen(false);
  };

  const handleAutoPullKnowledgeGate = () => {
    if (!activeChapter || !activeScene) return;
    const idx = activeChapter.scenes.findIndex((s) => s.id === activeScene.id);
    if (idx <= 0) {
      showToast('This is the first scene in the chapter.');
      return;
    }
    const priorScenes = activeChapter.scenes.slice(0, idx);
    const summaryParts = priorScenes.map((sc) => {
      const beats = (sc.mandatoryBeats || []).filter((b) => b.trim()).join('; ');
      return `[${sc.sceneId} – ${sc.title}]${beats ? ` Beats: ${beats}.` : ''}${
        sc.physicalSegue ? ` Segue: ${sc.physicalSegue}` : ''
      }`;
    });
    updateActiveScene({ knowledgeGate: summaryParts.join('\n') });
    showToast(`Pulled facts from ${priorScenes.length} prior scene(s).`);
  };

  // ==========================================================================
  // AI: AUTO-FILL CHAPTER FROM STORY THREAD
  // ==========================================================================

  const handleAutoFillChapterFromVault = async () => {
    if (!activeChapter) return;
    if (vaultStats.injectedCount === 0) {
      setErrorBanner(
        'Your Reference Vault is empty. Upload story-thread.md (and your canon/map specs) in Tab 1 first.'
      );
      return;
    }

    const executeFill = async () => {
      setConfirmModal(null);
      setErrorBanner('');
      setLoadingStatus(`Reading Reference Vault to build ${activeChapter.label} scenes...`);
      try {
        const vaultText = compileVaultPrompt(state.vaultDocs);
        const prompt = [
          `You are the Showrunner for "The Adventures of Tom".`,
          `Read the Reference Vault documents below (especially story-thread.md, workshop-and-map-spec.md, and canon-and-characters.md) and extract the EXACT canonical scene breakdown for ${activeChapter.label}.`,
          'STRICT RULES:',
          `- Extract ONLY what belongs to ${activeChapter.label} in the loaded Reference Vault. Do NOT invent scenes, locations, or plot beats that contradict story-thread.md.`,
          '- Use exact map IDs and scene ID conventions from workshop-and-map-spec.md (e.g. ch1_s1, ch1_s2...).',
          '- For each scene, populate accurate requiredSpeakers, mandatoryBeats, knowledgeGate (what characters know entering that scene), physicalSegue to the next scene, and any combat/text/closeup triggers.',
          '',
          vaultText,
        ].join('\n');

        const data = await callGeminiJSON({
          apiKey: state.settings.apiKey,
          modelId: genModelId,
          prompt,
          schema: CHAPTER_EXTRACT_SCHEMA,
          temperature: 0.2,
        });

        const builtScenes = (data.scenes || []).map((sc, i) =>
          createEmptyScene(activeChapter.number, i + 1, {
            sceneId: sc.sceneId,
            title: sc.title,
            mapId: sc.mapId,
            location: sc.location,
            requiredSpeakers: sc.requiredSpeakers || [],
            mandatoryBeats: sc.mandatoryBeats?.length ? sc.mandatoryBeats : [''],
            knowledgeGate: sc.knowledgeGate || '',
            physicalSegue: sc.physicalSegue || '',
            triggers: {
              combatEncounter: sc.combatEncounter || '',
              textMessageBeat: sc.textMessageBeat || '',
              closeupScreen: sc.closeupScreen || '',
            },
          })
        );

        if (builtScenes.length === 0) {
          throw new Error(`No scenes found for ${activeChapter.label} in the loaded Reference Vault.`);
        }

        updateChapter(activeChapter.id, {
          title: data.chapterTitle || activeChapter.title,
          purpose: data.chapterPurpose || activeChapter.purpose,
          scenes: builtScenes,
        });
        setState((prev) => ({ ...prev, activeSceneId: builtScenes[0].id }));
        showToast(`Loaded ${builtScenes.length} canonical scenes for ${activeChapter.label}.`);
      } catch (err) {
        setErrorBanner(err.message || 'Auto-fill failed.');
      } finally {
        setLoadingStatus('');
      }
    };

    if (activeChapter.scenes.length > 0) {
      setConfirmModal({
        title: `Replace ${activeChapter.label} Scenes?`,
        message: `Auto-filling from your Story Thread will replace the ${activeChapter.scenes.length} scene(s) currently in ${activeChapter.label}.`,
        confirmLabel: 'Auto-Fill Chapter',
        onConfirm: executeFill,
      });
    } else {
      executeFill();
    }
  };

  // ==========================================================================
  // API TEST CONNECTION
  // ==========================================================================

  const handleTestConnection = async () => {
    setTestConnState({ status: 'loading', message: 'Testing connection...' });
    const t0 = Date.now();
    try {
      await callGeminiJSON({
        apiKey: state.settings.apiKey,
        modelId: genModelId,
        prompt: 'Return JSON {"ok": true, "message": "connected"}',
        schema: {
          type: 'OBJECT',
          properties: { ok: { type: 'BOOLEAN' }, message: { type: 'STRING' } },
          required: ['ok'],
        },
        temperature: 0,
      });
      const ms = Date.now() - t0;
      setTestConnState({ status: 'success', message: `Connected to ${genModelId} (${ms}ms).` });
    } catch (err) {
      setTestConnState({ status: 'error', message: err.message || 'Connection failed.' });
    }
  };

  // ==========================================================================
  // AI SCENE GENERATION & SURGICAL REGENERATION
  // ==========================================================================

  const pushSceneSnapshot = (scene, label) => {
    const snap = {
      id: uid('snap'),
      timestamp: new Date().toLocaleTimeString([], {
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
      }),
      label,
      lines: JSON.parse(JSON.stringify(scene.lines)),
    };
    return [snap, ...(scene.history || [])].slice(0, 15);
  };

  const handleGenerateScene = async () => {
    if (!activeChapter || !activeScene) return;
    setErrorBanner('');
    setLoadingStatus('Drafting...');
    try {
      const { lines: generatedLines, qa } = await runSceneQAPipeline({
        apiKey: state.settings.apiKey,
        genModelId,
        auditModelId,
        vaultDocs: state.vaultDocs,
        chapter: activeChapter,
        scene: activeScene,
        activeBannedWords,
        setStatus: setLoadingStatus,
      });

      updateActiveScene((sc) => ({
        ...sc,
        history:
          sc.lines.length > 0
            ? pushSceneSnapshot(sc, `Before Generate (${sc.lines.length}L)`)
            : sc.history,
        lines: generatedLines,
        qa,
      }));
      showToast(
        `Generated ${generatedLines.length} lines for ${activeScene.sceneId}. QA ${
          qa.score == null ? 'unavailable' : `${qa.score}/10`
        }, ${qa.retries} auto-fix${qa.retries === 1 ? '' : 'es'}.`
      );
    } catch (err) {
      setErrorBanner(err.message || 'Scene generation failed.');
    } finally {
      setLoadingStatus('');
    }
  };

  const handleSurgicalRegenerate = async () => {
    if (!activeChapter || !activeScene || activeScene.lines.length === 0) return;

    const flaggedTargets = activeScene.lines
      .map((l, i) => ({ line: l, lineNumber: i + 1 }))
      .filter(
        ({ line }) =>
          !line.locked &&
          ((line.flags && line.flags.length > 0) ||
            (line.customNote && line.customNote.trim().length > 0))
      );

    const targets =
      flaggedTargets.length > 0
        ? flaggedTargets
        : activeScene.lines
            .map((l, i) => ({ line: l, lineNumber: i + 1 }))
            .filter(({ line }) => !line.locked);

    if (targets.length === 0) {
      showToast('All lines are locked. Unlock or flag lines to rewrite.');
      return;
    }

    setErrorBanner('');
    setLoadingStatus('Compiling Reference Vault & Line Context...');
    try {
      const vaultText = compileVaultPrompt(state.vaultDocs);
      const blueprintText = compileBlueprintPrompt(activeChapter, activeScene);
      const slidersText = compileSlidersPrompt(activeScene.sliders, activeBannedWords);
      const targetNums = new Set(targets.map((t) => t.lineNumber));

      const scriptContext = activeScene.lines
        .map((l, idx) => {
          const n = idx + 1;
          const status = l.locked
            ? '[LOCKED - DO NOT CHANGE]'
            : targetNums.has(n)
            ? '[REWRITE THIS LINE]'
            : '[KEEP VERBATIM]';
          const feedback = [];
          if (l.flags?.length) feedback.push(`Flags: ${l.flags.join(', ')}`);
          if (l.customNote?.trim()) feedback.push(`Note: ${l.customNote.trim()}`);
          return `L${n} ${status} | type=${l.type} | speaker=${l.speaker} | mood=${l.mood} | text="${l.text}"${
            feedback.length ? `\n   -> FIX REQUESTED: ${feedback.join(' | ')}` : ''
          }`;
        })
        .join('\n');

      const prompt = [
        'You are performing a SURGICAL REWRITE on specific lines in a scene of "The Adventures of Tom".',
        '1. Preserve ALL [LOCKED] and [KEEP VERBATIM] lines exactly as written.',
        `2. Rewrite ONLY these exact line numbers: ${Array.from(targetNums).join(', ')}.`,
        '3. Fix every listed flag and custom note while preserving strict line-to-line flow.',
        '',
        vaultText,
        '',
        '=== SCENE BLUEPRINT ===',
        blueprintText,
        '=== END SCENE BLUEPRINT ===',
        '',
        slidersText,
        '',
        '=== CURRENT SCENE SCRIPT ===',
        scriptContext,
        '=== END CURRENT SCENE SCRIPT ===',
      ].join('\n');

      setLoadingStatus(`Rewriting ${targets.length} line(s) with ${genModelId}...`);
      const result = await callGeminiJSON({
        apiKey: state.settings.apiKey,
        modelId: genModelId,
        prompt,
        schema: SURGICAL_REGEN_SCHEMA,
        temperature: 0.7,
      });

      const patchMap = new Map();
      for (const p of result.patches || []) {
        if (targetNums.has(p.lineNumber)) patchMap.set(p.lineNumber, p);
      }

      updateActiveScene((sc) => ({
        ...sc,
        history: pushSceneSnapshot(sc, `Before Surgical Regen (${patchMap.size}L)`),
        lines: sc.lines.map((l, idx) => {
          const patch = patchMap.get(idx + 1);
          if (!patch) return l;
          return {
            ...l,
            type: patch.type || l.type,
            speaker: patch.speaker ?? l.speaker,
            mood: patch.mood || l.mood,
            text: patch.text ?? l.text,
            flags: [],
            customNote: '',
          };
        }),
      }));

      showToast(`Patched ${patchMap.size} line(s) in place.`);
    } catch (err) {
      setErrorBanner(err.message || 'Surgical regeneration failed.');
    } finally {
      setLoadingStatus('');
    }
  };

  // ==========================================================================
  // DUAL NARRATIVE CHECKERS
  // ==========================================================================

  const serializeChapterForAudit = (chapter) => {
    const scenesText = chapter.scenes
      .map((sc, idx) => {
        const bp = compileBlueprintPrompt(chapter, sc);
        const script =
          sc.lines.length > 0
            ? sc.lines
                .map(
                  (l, i) =>
                    `  L${i + 1} [${l.type}] ${l.speaker}${
                      l.mood && l.mood !== 'none' ? ` (${l.mood})` : ''
                    }: ${l.text}`
                )
                .join('\n')
            : '  (No lines written yet)';
        return `--- SCENE ${idx + 1}: ${sc.sceneId} ---\n${bp}\nSCRIPT:\n${script}`;
      })
      .join('\n\n');
    return `CHAPTER: ${chapter.label} — ${chapter.title}\nPURPOSE: ${
      chapter.purpose || '(None)'
    }\n\n${scenesText}`;
  };

  const handleRunTrajectoryAudit = async () => {
    if (!activeChapter || activeChapter.scenes.length === 0) {
      setErrorBanner('Add or Auto-Fill at least one scene in this chapter before auditing.');
      return;
    }
    setErrorBanner('');
    setLoadingStatus('Compiling Reference Vault & Chapter Scenes...');
    try {
      const vaultText = compileVaultPrompt(state.vaultDocs);
      const chapterDump = serializeChapterForAudit(activeChapter);

      const prompt = [
        'You are the Showrunner auditing ONE chapter of "The Adventures of Tom".',
        'Run a strict CHAPTER TRAJECTORY AUDIT evaluating Overall Status, Pacing & Balance (0-10), Comedy Rhythm (0-10), Beat Coverage, Physical Segues, and specific clickable Issue Cards.',
        '',
        vaultText,
        '',
        '=== CHAPTER TO AUDIT ===',
        chapterDump,
        '=== END CHAPTER ===',
      ].join('\n');

      setLoadingStatus(`Running Trajectory Audit with ${auditModelId}...`);
      const report = await callGeminiJSON({
        apiKey: state.settings.apiKey,
        modelId: auditModelId,
        prompt,
        schema: TRAJECTORY_AUDIT_SCHEMA,
        temperature: 0.3,
      });

      setState((prev) => ({
        ...prev,
        auditReports: {
          ...prev.auditReports,
          trajectory: {
            ...prev.auditReports.trajectory,
            [activeChapter.id]: {
              ...report,
              ranAt: new Date().toLocaleTimeString(),
              model: auditModelId,
            },
          },
        },
      }));
      showToast(`Trajectory Audit complete (${report.overallStatus}).`);
    } catch (err) {
      setErrorBanner(err.message || 'Trajectory Audit failed.');
    } finally {
      setLoadingStatus('');
    }
  };

  const handleRunStorylineAudit = async () => {
    if (!activeChapter || activeChapter.scenes.length === 0) {
      setErrorBanner('Add or Auto-Fill at least one scene in this chapter before auditing.');
      return;
    }
    setErrorBanner('');
    setLoadingStatus('Compiling Canon, Story Thread & Chapter...');
    try {
      const vaultText = compileVaultPrompt(state.vaultDocs);
      const chapterDump = serializeChapterForAudit(activeChapter);

      const prompt = [
        'You are the Lead Continuity & Macro-Storyline Auditor for "The Adventures of Tom" (20 chapters + 1 bonus chapter).',
        'Audit the active chapter against canon-and-characters.md, story-thread.md, and all injected Reference Vault docs.',
        'Evaluate: 1) Overarching Storyline Alignment, 2) Mystery & Scaling Rule Integrity (orange-block sizing, no premature knowledge of camera or coin-to-block rules), 3) Cast Knowledge Gates, 4) Character Voice & Arc Consistency.',
        '',
        vaultText,
        '',
        '=== ACTIVE CHAPTER ===',
        chapterDump,
        '=== END ACTIVE CHAPTER ===',
      ].join('\n');

      setLoadingStatus(`Running Overall Storyline Audit with ${auditModelId}...`);
      const report = await callGeminiJSON({
        apiKey: state.settings.apiKey,
        modelId: auditModelId,
        prompt,
        schema: STORYLINE_AUDIT_SCHEMA,
        temperature: 0.3,
      });

      setState((prev) => ({
        ...prev,
        auditReports: {
          ...prev.auditReports,
          storyline: {
            ...prev.auditReports.storyline,
            [activeChapter.id]: {
              ...report,
              ranAt: new Date().toLocaleTimeString(),
              model: auditModelId,
            },
          },
        },
      }));
      showToast(`Storyline Audit complete (${report.overallStatus}).`);
    } catch (err) {
      setErrorBanner(err.message || 'Overall Storyline Audit failed.');
    } finally {
      setLoadingStatus('');
    }
  };

  const handleJumpToIssue = (sceneIdStr, lineNumber) => {
    if (!activeChapter) return;
    const match = activeChapter.scenes.find(
      (s) => s.sceneId.toLowerCase() === (sceneIdStr || '').toLowerCase()
    );
    if (match) setState((prev) => ({ ...prev, activeSceneId: match.id }));
    setActiveTab('studio');
    if (lineNumber && lineNumber > 0) {
      setHighlightedLineIdx(lineNumber - 1);
      window.setTimeout(() => {
        const el = document.getElementById(`line-card-${lineNumber - 1}`);
        if (el) el.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }, 120);
    } else {
      setHighlightedLineIdx(null);
    }
  };

  // ==========================================================================
  // EXPORT OUTPUT
  // ==========================================================================

  const exportOutput = useMemo(() => {
    if (exportFormat === 'json') {
      return JSON.stringify(
        { ...state, settings: { ...state.settings, apiKey: '' } },
        null,
        2
      );
    }

    const targetScenes =
      exportScope === 'scene'
        ? activeScene
          ? [{ chapter: activeChapter, scene: activeScene }]
          : []
        : exportScope === 'chapter'
        ? (activeChapter?.scenes || []).map((scene) => ({ chapter: activeChapter, scene }))
        : state.chapters.flatMap((ch) =>
            ch.scenes
              .filter((sc) => sc.lines.length > 0)
              .map((scene) => ({ chapter: ch, scene }))
          );

    if (targetScenes.length === 0) {
      return '// No written scenes in the selected scope yet.';
    }

    if (exportFormat === 'workshop') {
      return targetScenes.map(({ scene }) => formatWorkshopScene(scene)).join('\n\n');
    }

    let lastChId = '';
    const blocks = [];
    for (const { chapter, scene } of targetScenes) {
      if (chapter.id !== lastChId) {
        blocks.push(`# ${chapter.label}: ${chapter.title}`);
        if (chapter.purpose) blocks.push(`> *Arc Goal:* ${chapter.purpose}`);
        lastChId = chapter.id;
      }
      blocks.push(formatMarkdownScene(scene));
    }
    return blocks.join('\n\n');
  }, [exportFormat, exportScope, state, activeChapter, activeScene]);

  const handleCopyExport = async () => {
    const ok = await copyTextSafe(exportOutput);
    if (ok) {
      setCopiedKey(exportFormat);
      window.setTimeout(() => setCopiedKey(''), 2000);
      showToast('Copied to clipboard.');
    } else {
      setErrorBanner('Could not copy automatically — select the preview text manually.');
    }
  };

  const handleDownloadExport = () => {
    const ext = exportFormat === 'json' ? 'json' : exportFormat === 'markdown' ? 'md' : 'txt';
    const base =
      exportScope === 'scene'
        ? activeScene?.sceneId || 'scene'
        : exportScope === 'chapter'
        ? activeChapter?.id || 'chapter'
        : 'aot-all-chapters';
    downloadFile(
      `${base}-${exportFormat}.${ext}`,
      exportOutput,
      exportFormat === 'json' ? 'application/json' : 'text/plain;charset=utf-8'
    );
    showToast(`Downloaded ${base}-${exportFormat}.${ext}`);
  };

  const flaggedCount = useMemo(() => {
    if (!activeScene) return 0;
    return activeScene.lines.filter(
      (l) => !l.locked && (l.flags.length > 0 || l.customNote.trim().length > 0)
    ).length;
  }, [activeScene]);

  const activeTrajectoryReport = state.auditReports.trajectory[activeChapter?.id];
  const activeStorylineReport = state.auditReports.storyline[activeChapter?.id];
  const needsSetup = !state.settings.apiKey || vaultStats.loadedCount === 0;

  // ==========================================================================
  // RENDER
  // ==========================================================================

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans selection:bg-indigo-500/30">
      <input
        ref={vaultFileInputRef}
        type="file"
        multiple
        accept=".md,.txt,text/markdown,text/plain"
        onChange={handleVaultUpload}
        className="hidden"
      />
      <input
        ref={projectImportRef}
        type="file"
        accept=".json,application/json"
        onChange={handleImportProjectJSON}
        className="hidden"
      />

      {/* CLEAN SINGLE-ROW HEADER */}
      <header className="sticky top-0 z-30 bg-slate-950/95 backdrop-blur border-b border-slate-800/90">
        <div className="max-w-7xl mx-auto px-4 py-2.5 flex flex-wrap items-center justify-between gap-3">
          {/* Brand */}
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center shadow-md shadow-indigo-950">
              <Clapperboard className="w-4 h-4 text-white" />
            </div>
            <div>
              <h1 className="text-sm font-bold tracking-tight text-white leading-tight">
                AoT Script Studio
              </h1>
              <p className="text-[11px] text-slate-400">
                Vault: {vaultStats.injectedCount}/{vaultStats.total} active (~
                {vaultStats.totalTokens.toLocaleString()} tok)
              </p>
            </div>
          </div>

          {/* 4-Step Segmented Nav */}
          <nav className="flex items-center gap-1 bg-slate-900 p-1 rounded-xl border border-slate-800 overflow-x-auto">
            {[
              { id: 'vault', label: '1. Vault', icon: BookOpen, badge: `${vaultStats.loadedCount}/${vaultStats.total}` },
              { id: 'studio', label: '2. Scene Studio', icon: Clapperboard, badge: activeScene?.sceneId || '' },
              { id: 'checkers', label: '3. Checkers', icon: ShieldCheck, badge: activeTrajectoryReport?.overallStatus || '' },
              { id: 'export', label: '4. Export', icon: FileCode2, badge: '' },
            ].map((tab) => {
              const Icon = tab.icon;
              const active = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition ${
                    active
                      ? 'bg-indigo-600 text-white shadow'
                      : 'text-slate-400 hover:text-slate-100 hover:bg-slate-800/70'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  <span>{tab.label}</span>
                  {tab.badge && (
                    <span
                      className={`text-[10px] px-1.5 py-0.2 rounded font-mono ${
                        active ? 'bg-indigo-500/60 text-white' : 'bg-slate-800 text-slate-400'
                      }`}
                    >
                      {tab.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>

          {/* Header Actions */}
          <div className="flex items-center gap-1.5">
            <button
              onClick={() => projectImportRef.current?.click()}
              className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-medium bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-800 transition"
              title="Import Project JSON"
            >
              <Upload className="w-3.5 h-3.5" />
              <span className="hidden md:inline">Import</span>
            </button>
            <button
              onClick={handleExportProjectJSON}
              className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-medium bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-800 transition"
              title="Export Project JSON Backup"
            >
              <Download className="w-3.5 h-3.5" />
              <span className="hidden md:inline">Export</span>
            </button>
            <button
              onClick={() => setSettingsOpen(true)}
              className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium bg-slate-900 hover:bg-slate-800 text-indigo-200 border border-indigo-500/40 transition"
            >
              <span
                className={`w-2 h-2 rounded-full ${
                  state.settings.apiKey
                    ? testConnState.status === 'success'
                      ? 'bg-emerald-400'
                      : 'bg-amber-400'
                    : 'bg-rose-400'
                }`}
              />
              <Settings className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">API</span>
            </button>
          </div>
        </div>
      </header>

      {/* LOADING & ERROR BANNERS */}
      {loadingStatus && (
        <div className="bg-indigo-950/95 border-b border-indigo-500/40 px-4 py-2.5">
          <div className="max-w-7xl mx-auto flex items-center gap-2.5 text-xs sm:text-sm text-indigo-200">
            <Loader2 className="w-4 h-4 animate-spin text-indigo-400 shrink-0" />
            <span className="font-medium">{loadingStatus}</span>
          </div>
        </div>
      )}

      {errorBanner && (
        <div className="bg-rose-950/95 border-b border-rose-500/40 px-4 py-2.5">
          <div className="max-w-7xl mx-auto flex items-start justify-between gap-3 text-xs sm:text-sm text-rose-200">
            <div className="flex items-start gap-2">
              <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
              <span className="break-words">{errorBanner}</span>
            </div>
            <button onClick={() => setErrorBanner('')} className="text-rose-300 hover:text-white">
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* TOAST */}
      {toast && (
        <div className="fixed bottom-5 right-5 z-50 bg-slate-900 border border-indigo-500/40 text-slate-100 px-4 py-2.5 rounded-xl shadow-2xl flex items-center gap-2 text-xs sm:text-sm">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{toast}</span>
        </div>
      )}

      {/* MAIN WORKSPACE */}
      <main className="max-w-7xl mx-auto px-4 py-5">
        {/* ================================================================ */}
        {/* TAB 1: REFERENCE VAULT                                           */}
        {/* ================================================================ */}
        {activeTab === 'vault' && (
          <div className="space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-3 bg-slate-900/70 border border-slate-800 rounded-xl p-4">
              <div>
                <h2 className="text-base font-semibold text-white">Reference Vault</h2>
                <p className="text-xs text-slate-400 mt-0.5">
                  Upload your canon, comedy bible, specs, and story thread here. Every checked doc is injected verbatim into generation and audit prompts.
                </p>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={handleSyncHostedDefaults}
                  className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition"
                  title="Reset the 6 core slots to the latest hosted files"
                >
                  <RefreshCw className="w-3.5 h-3.5 text-slate-400" />
                  Sync Hosted Defaults
                </button>
                <button
                  onClick={() => vaultFileInputRef.current?.click()}
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-xs font-semibold bg-indigo-600 hover:bg-indigo-500 text-white transition"
                >
                  <Upload className="w-3.5 h-3.5" />
                  Upload .md / .txt
                </button>
                <button
                  onClick={() => setShowNewDocInput((v) => !v)}
                  className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition"
                >
                  <Plus className="w-3.5 h-3.5" />
                  Add Doc
                </button>
              </div>
            </div>

            {showNewDocInput && (
              <div className="flex items-center gap-2 bg-slate-900 border border-indigo-500/40 rounded-xl p-3">
                <input
                  type="text"
                  value={newDocName}
                  onChange={(e) => setNewDocName(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleAddNewDoc()}
                  placeholder="e.g. ch5-notes.md"
                  className="flex-1 bg-slate-950 border border-slate-700 rounded-lg px-3 py-1.5 text-sm text-white focus:outline-none focus:border-indigo-400"
                />
                <button
                  onClick={handleAddNewDoc}
                  className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-indigo-600 hover:bg-indigo-500 text-white"
                >
                  Create
                </button>
                <button
                  onClick={() => setShowNewDocInput(false)}
                  className="p-1.5 text-slate-400 hover:text-white"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
              <div className="lg:col-span-4 space-y-2">
                {state.vaultDocs.map((doc) => {
                  const isLoaded = doc.content.trim().length > 0;
                  const isSelected = selectedDoc?.id === doc.id;
                  return (
                    <div
                      key={doc.id}
                      onClick={() => setSelectedDocId(doc.id)}
                      className={`cursor-pointer rounded-xl p-3 border transition ${
                        isSelected
                          ? 'bg-slate-900 border-indigo-500/60'
                          : 'bg-slate-900/40 border-slate-800 hover:border-slate-700'
                      }`}
                    >
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-2 min-w-0">
                          <input
                            type="checkbox"
                            checked={doc.inject}
                            onClick={(e) => e.stopPropagation()}
                            onChange={(e) => {
                              const checked = e.target.checked;
                              setState((prev) => ({
                                ...prev,
                                vaultDocs: prev.vaultDocs.map((d) =>
                                  d.id === doc.id ? { ...d, inject: checked } : d
                                ),
                              }));
                            }}
                            title="Inject into Prompts"
                            className="rounded border-slate-600 bg-slate-950 text-indigo-500"
                          />
                          <span className="text-xs sm:text-sm font-mono font-medium text-slate-100 truncate">
                            {doc.name}
                          </span>
                        </div>
                        <span
                          className={`shrink-0 text-[10px] font-semibold uppercase px-2 py-0.5 rounded-full border ${
                            isLoaded
                              ? 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30'
                              : 'bg-slate-800 text-slate-500 border-slate-700'
                          }`}
                        >
                          {isLoaded ? 'Loaded' : 'Empty'}
                        </span>
                      </div>

                      <div className="flex items-center justify-between mt-1.5 pl-6 text-[11px] text-slate-500">
                        <span>
                          {doc.content.length.toLocaleString()} ch · ~
                          {approxTokens(doc.content).toLocaleString()} tok
                        </span>
                        {!doc.core && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setState((prev) => ({
                                ...prev,
                                vaultDocs: prev.vaultDocs.filter((d) => d.id !== doc.id),
                              }));
                            }}
                            className="text-slate-500 hover:text-rose-400"
                            title="Delete custom doc"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="lg:col-span-8 bg-slate-900/60 border border-slate-800 rounded-xl flex flex-col overflow-hidden min-h-[500px]">
                {selectedDoc && (
                  <>
                    <div className="flex flex-wrap items-center justify-between gap-2 px-4 py-2.5 border-b border-slate-800 bg-slate-900">
                      <div className="flex items-center gap-2">
                        <FileText className="w-4 h-4 text-indigo-400" />
                        <span className="font-mono text-sm font-semibold text-white">
                          {selectedDoc.name}
                        </span>
                        {selectedDoc.uploadedContent &&
                          selectedDoc.content !== selectedDoc.uploadedContent && (
                            <span className="text-[10px] px-2 py-0.5 rounded bg-amber-500/15 text-amber-300 border border-amber-500/30">
                              Edited
                            </span>
                          )}
                      </div>

                      <div className="flex items-center gap-2">
                        {selectedDoc.uploadedContent &&
                          selectedDoc.content !== selectedDoc.uploadedContent && (
                            <button
                              onClick={() => {
                                setState((prev) => ({
                                  ...prev,
                                  vaultDocs: prev.vaultDocs.map((d) =>
                                    d.id === selectedDoc.id
                                      ? { ...d, content: d.uploadedContent }
                                      : d
                                  ),
                                }));
                                showToast(`Reverted ${selectedDoc.name}.`);
                              }}
                              className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-medium bg-slate-800 hover:bg-slate-700 text-amber-300 border border-slate-700"
                            >
                              <RotateCcw className="w-3.5 h-3.5" />
                              Revert
                            </button>
                          )}

                        <div className="inline-flex rounded-lg bg-slate-950 p-0.5 border border-slate-800">
                          <button
                            onClick={() => setDocViewMode('preview')}
                            className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-medium transition ${
                              docViewMode === 'preview'
                                ? 'bg-indigo-600 text-white'
                                : 'text-slate-400 hover:text-white'
                            }`}
                          >
                            <Eye className="w-3.5 h-3.5" /> Preview
                          </button>
                          <button
                            onClick={() => setDocViewMode('edit')}
                            className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-medium transition ${
                              docViewMode === 'edit'
                                ? 'bg-indigo-600 text-white'
                                : 'text-slate-400 hover:text-white'
                            }`}
                          >
                            <Edit3 className="w-3.5 h-3.5" /> Edit
                          </button>
                        </div>
                      </div>
                    </div>

                    <div className="flex-1 p-4 overflow-y-auto">
                      {docViewMode === 'preview' ? (
                        <SimpleMarkdownPreview content={selectedDoc.content} />
                      ) : (
                        <textarea
                          value={selectedDoc.content}
                          onChange={(e) => {
                            const val = e.target.value;
                            setState((prev) => ({
                              ...prev,
                              vaultDocs: prev.vaultDocs.map((d) =>
                                d.id === selectedDoc.id ? { ...d, content: val } : d
                              ),
                            }));
                          }}
                          placeholder={`Paste or write ${selectedDoc.name} here...`}
                          className="w-full h-[450px] bg-slate-950 border border-slate-800 rounded-lg p-3.5 font-mono text-xs sm:text-sm text-slate-200 leading-relaxed focus:outline-none focus:border-indigo-500 resize-y"
                        />
                      )}
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
        )}

        {/* ================================================================ */}
        {/* TAB 2: STREAMLINED 2-PANE SCENE STUDIO                           */}
        {/* ================================================================ */}
        {activeTab === 'studio' && activeChapter && (
          <div className="space-y-4">
            {/* Compact Guided Onboarding Strip (only when API key or Vault missing) */}
            {needsSetup && !dismissSetupGuide && (
              <div className="bg-indigo-950/40 border border-indigo-500/30 rounded-xl px-4 py-2.5 flex flex-wrap items-center justify-between gap-2 text-xs">
                <div className="flex flex-wrap items-center gap-2 text-slate-200">
                  <span className="font-semibold text-indigo-300">Quick Start:</span>
                  <button
                    onClick={() => setSettingsOpen(true)}
                    className={`underline-offset-2 hover:underline ${
                      state.settings.apiKey ? 'text-emerald-400 line-through' : 'text-white font-medium'
                    }`}
                  >
                    1. Add Gemini API Key
                  </button>
                  <span className="text-slate-600">→</span>
                  <button
                    onClick={() => setActiveTab('vault')}
                    className={`underline-offset-2 hover:underline ${
                      vaultStats.loadedCount > 0 ? 'text-emerald-400 line-through' : 'text-white font-medium'
                    }`}
                  >
                    2. Load Reference Vault ({vaultStats.loadedCount}/6)
                  </button>
                  <span className="text-slate-600">→</span>
                  <span className="text-slate-300">3. Auto-Fill Chapter or Paste Script</span>
                </div>
                <button
                  onClick={() => setDismissSetupGuide(true)}
                  className="text-slate-500 hover:text-slate-300"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            )}

            {/* COMPACT CHAPTER & SCENE HEADER BAR */}
            <div className="bg-slate-900/75 border border-slate-800 rounded-xl p-3.5 space-y-3">
              {/* Row 1: Chapter Picker + Quick Actions */}
              <div className="flex flex-wrap items-center justify-between gap-2.5">
                <div className="flex flex-wrap items-center gap-2 flex-1 min-w-[260px]">
                  <select
                    value={activeChapter.id}
                    onChange={(e) => handleSelectChapter(e.target.value)}
                    className="bg-slate-950 border border-slate-700 rounded-lg px-3 py-1.5 text-sm font-semibold text-white focus:outline-none focus:border-indigo-500"
                  >
                    {state.chapters.map((ch) => (
                      <option key={ch.id} value={ch.id}>
                        {ch.label}
                        {ch.title && ch.title !== ch.label ? `: ${ch.title}` : ''} ({ch.scenes.length} sc)
                      </option>
                    ))}
                  </select>

                  <input
                    type="text"
                    value={activeChapter.purpose}
                    onChange={(e) => updateChapter(activeChapter.id, { purpose: e.target.value })}
                    placeholder="Chapter Purpose / Arc Goal (auto-filled from Story Thread or type here)..."
                    className="flex-1 min-w-[220px] bg-slate-950/70 border border-slate-800 rounded-lg px-3 py-1.5 text-xs sm:text-sm text-slate-200 placeholder:text-slate-500 focus:outline-none focus:border-indigo-500"
                  />
                </div>

                <div className="flex flex-wrap items-center gap-1.5">
                  <button
                    onClick={handleAutoFillChapterFromVault}
                    disabled={Boolean(loadingStatus)}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-indigo-600/20 hover:bg-indigo-600/30 text-indigo-200 border border-indigo-500/40 disabled:opacity-40 transition"
                    title="Read story-thread.md and populate this chapter's real scenes"
                  >
                    <Wand2 className="w-3.5 h-3.5" />
                    Auto-Fill from Story Thread
                  </button>
                  <button
                    onClick={() => setPasteModalOpen(true)}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition"
                  >
                    <ClipboardPaste className="w-3.5 h-3.5" />
                    Paste Script
                  </button>
                </div>
              </div>

              {/* Row 2: Scene Selector Strip (shown when scenes exist) */}
              {activeChapter.scenes.length > 0 && (
                <div className="pt-2.5 border-t border-slate-800/80 flex flex-wrap items-center justify-between gap-2">
                  <div className="flex flex-wrap items-center gap-1.5">
                    {activeChapter.scenes.map((sc, idx) => {
                      const isSelected = sc.id === activeScene?.id;
                      return (
                        <div
                          key={sc.id}
                          className={`inline-flex items-center rounded-lg border text-xs transition ${
                            isSelected
                              ? 'bg-indigo-600/25 border-indigo-400 text-white'
                              : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200 hover:border-slate-700'
                          }`}
                        >
                          <button
                            onClick={() => {
                              setState((prev) => ({ ...prev, activeSceneId: sc.id }));
                              setHighlightedLineIdx(null);
                            }}
                            className="px-2.5 py-1 font-medium flex items-center gap-1.5"
                          >
                            <span className="font-mono text-[10px] opacity-75">{sc.sceneId}</span>
                            <span className="max-w-[140px] truncate">{sc.title}</span>
                            <span className="text-[10px] px-1 rounded bg-slate-900 text-slate-400">
                              {sc.lines.length}L
                            </span>
                          </button>
                          {isSelected && (
                            <div className="flex items-center pr-1 gap-0.5 border-l border-indigo-500/30 pl-1">
                              <button
                                onClick={() => handleReorderScene(sc.id, -1)}
                                disabled={idx === 0}
                                className="p-0.5 text-slate-300 hover:text-white disabled:opacity-25"
                                title="Move Earlier"
                              >
                                <ArrowLeft className="w-3 h-3" />
                              </button>
                              <button
                                onClick={() => handleReorderScene(sc.id, 1)}
                                disabled={idx === activeChapter.scenes.length - 1}
                                className="p-0.5 text-slate-300 hover:text-white disabled:opacity-25"
                                title="Move Later"
                              >
                                <ArrowRight className="w-3 h-3" />
                              </button>
                              <button
                                onClick={() => handleDeleteScene(sc.id)}
                                className="p-0.5 text-slate-400 hover:text-rose-400"
                                title="Delete Scene"
                              >
                                <Trash2 className="w-3 h-3" />
                              </button>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>

                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={handleAddScene}
                      className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-medium bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700"
                    >
                      <Plus className="w-3.5 h-3.5" /> Scene
                    </button>
                    <button
                      onClick={handleDuplicateScene}
                      className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-medium bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700"
                    >
                      <Copy className="w-3 h-3" /> Duplicate
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* EMPTY CHAPTER STATE (NO FAKE PLACEHOLDERS!) */}
            {!activeScene ? (
              <div className="bg-slate-900/50 border border-dashed border-slate-800 rounded-2xl p-10 text-center max-w-2xl mx-auto my-8 space-y-5">
                <div className="w-12 h-12 rounded-2xl bg-indigo-500/15 border border-indigo-500/30 flex items-center justify-center mx-auto">
                  <Clapperboard className="w-6 h-6 text-indigo-400" />
                </div>
                <div className="space-y-1.5">
                  <h2 className="text-lg font-bold text-white">
                    {activeChapter.label} has no scenes yet
                  </h2>
                  <p className="text-sm text-slate-400 max-w-md mx-auto">
                    Start from your real canon instead of blank placeholders. Pull this chapter’s scenes straight from your loaded Story Thread, paste an existing Workshop script, or add a scene manually.
                  </p>
                </div>

                <div className="flex flex-wrap items-center justify-center gap-2.5 pt-1">
                  <button
                    onClick={handleAutoFillChapterFromVault}
                    disabled={Boolean(loadingStatus)}
                    className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white shadow-lg shadow-indigo-950 transition"
                  >
                    <Wand2 className="w-4 h-4" />
                    Auto-Fill from Story Thread
                  </button>
                  <button
                    onClick={() => setPasteModalOpen(true)}
                    className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold bg-slate-800 hover:bg-slate-700 text-slate-100 border border-slate-700 transition"
                  >
                    <ClipboardPaste className="w-4 h-4" />
                    Paste Workshop Script
                  </button>
                  <button
                    onClick={handleAddScene}
                    className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-sm font-medium bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-800 transition"
                  >
                    <Plus className="w-4 h-4" />
                    Blank Scene
                  </button>
                </div>
              </div>
            ) : (
              /* 2-PANE WRITERS' ROOM LAYOUT */
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
                {/* LEFT PANE: TABBED INSPECTOR (BLUEPRINT vs TONE & RULES) */}
                <aside className="lg:col-span-4 bg-slate-900/70 border border-slate-800 rounded-xl overflow-hidden lg:sticky lg:top-16">
                  <div className="grid grid-cols-2 bg-slate-900 border-b border-slate-800">
                    <button
                      onClick={() => setLeftPaneTab('blueprint')}
                      className={`py-2.5 text-xs font-semibold flex items-center justify-center gap-1.5 border-b-2 transition ${
                        leftPaneTab === 'blueprint'
                          ? 'border-indigo-400 text-white bg-slate-900/80'
                          : 'border-transparent text-slate-400 hover:text-slate-200'
                      }`}
                    >
                      <Compass className="w-3.5 h-3.5" /> Scene Blueprint
                    </button>
                    <button
                      onClick={() => setLeftPaneTab('tone')}
                      className={`py-2.5 text-xs font-semibold flex items-center justify-center gap-1.5 border-b-2 transition ${
                        leftPaneTab === 'tone'
                          ? 'border-violet-400 text-white bg-slate-900/80'
                          : 'border-transparent text-slate-400 hover:text-slate-200'
                      }`}
                    >
                      <Sliders className="w-3.5 h-3.5" /> Tone & Rules
                    </button>
                  </div>

                  {/* BLUEPRINT INSPECTOR TAB */}
                  {leftPaneTab === 'blueprint' && (
                    <div className="p-4 space-y-4 max-h-[calc(100vh-140px)] overflow-y-auto">
                      <div className="grid grid-cols-2 gap-2.5">
                        <div className="col-span-2">
                          <label className="text-[11px] font-semibold uppercase text-slate-400">
                            Scene Title
                          </label>
                          <input
                            type="text"
                            value={activeScene.title}
                            onChange={(e) => updateActiveScene({ title: e.target.value })}
                            className="mt-1 w-full bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1.5 text-sm text-white focus:outline-none focus:border-indigo-500"
                          />
                        </div>
                        <div>
                          <label className="text-[11px] font-semibold uppercase text-slate-400">
                            Scene ID
                          </label>
                          <input
                            type="text"
                            value={activeScene.sceneId}
                            onChange={(e) => updateActiveScene({ sceneId: e.target.value })}
                            placeholder="ch1_s1"
                            className="mt-1 w-full bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs font-mono text-indigo-300 focus:outline-none focus:border-indigo-500"
                          />
                        </div>
                        <div>
                          <label className="text-[11px] font-semibold uppercase text-slate-400">
                            Map ID
                          </label>
                          <input
                            type="text"
                            value={activeScene.mapId}
                            onChange={(e) => updateActiveScene({ mapId: e.target.value })}
                            placeholder="grands"
                            className="mt-1 w-full bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs font-mono text-slate-200 focus:outline-none focus:border-indigo-500"
                          />
                        </div>
                        <div className="col-span-2">
                          <label className="text-[11px] font-semibold uppercase text-slate-400">
                            Location
                          </label>
                          <input
                            type="text"
                            value={activeScene.location}
                            onChange={(e) => updateActiveScene({ location: e.target.value })}
                            placeholder="Exact in-game location..."
                            className="mt-1 w-full bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs sm:text-sm text-slate-200 focus:outline-none focus:border-indigo-500"
                          />
                        </div>
                      </div>

                      {/* Required Speakers */}
                      <div>
                        <label className="text-[11px] font-semibold uppercase text-slate-400">
                          Required Speakers
                        </label>
                        <div className="mt-1.5 flex flex-wrap gap-1.5">
                          {(activeScene.requiredSpeakers || []).map((sp) => (
                            <span
                              key={sp}
                              className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs bg-indigo-500/20 text-indigo-200 border border-indigo-500/40"
                            >
                              {sp}
                              <button
                                onClick={() =>
                                  updateActiveScene({
                                    requiredSpeakers: activeScene.requiredSpeakers.filter(
                                      (x) => x !== sp
                                    ),
                                  })
                                }
                              >
                                <X className="w-3 h-3" />
                              </button>
                            </span>
                          ))}
                        </div>
                        <input
                          type="text"
                          value={speakerInput}
                          onChange={(e) => setSpeakerInput(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter' && speakerInput.trim()) {
                              e.preventDefault();
                              const name = speakerInput.trim();
                              if (!activeScene.requiredSpeakers.includes(name)) {
                                updateActiveScene({
                                  requiredSpeakers: [...activeScene.requiredSpeakers, name],
                                });
                              }
                              setSpeakerInput('');
                            }
                          }}
                          placeholder="+ Type speaker & press Enter"
                          className="mt-1.5 w-full bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1 text-xs text-white focus:outline-none focus:border-indigo-500"
                        />
                        <div className="mt-1.5 flex flex-wrap gap-1">
                          {QUICK_CAST.filter(
                            (c) => !(activeScene.requiredSpeakers || []).includes(c)
                          )
                            .slice(0, 7)
                            .map((c) => (
                              <button
                                key={c}
                                onClick={() =>
                                  updateActiveScene({
                                    requiredSpeakers: [...(activeScene.requiredSpeakers || []), c],
                                  })
                                }
                                className="text-[10px] px-1.5 py-0.5 rounded bg-slate-950 hover:bg-slate-800 text-slate-400 border border-slate-800"
                              >
                                + {c}
                              </button>
                            ))}
                        </div>
                      </div>

                      {/* Mandatory Beats */}
                      <div className="space-y-1.5">
                        <div className="flex items-center justify-between">
                          <label className="text-[11px] font-semibold uppercase text-slate-400">
                            Mandatory Story Beats
                          </label>
                          <button
                            onClick={() =>
                              updateActiveScene({
                                mandatoryBeats: [...(activeScene.mandatoryBeats || []), ''],
                              })
                            }
                            className="text-[11px] text-indigo-400 hover:text-indigo-300"
                          >
                            + Add Beat
                          </button>
                        </div>
                        {(activeScene.mandatoryBeats || []).map((beat, idx) => (
                          <div key={idx} className="flex items-center gap-1">
                            <span className="text-[10px] font-mono text-slate-500 w-4">
                              {idx + 1}.
                            </span>
                            <input
                              type="text"
                              value={beat}
                              onChange={(e) => {
                                const next = [...activeScene.mandatoryBeats];
                                next[idx] = e.target.value;
                                updateActiveScene({ mandatoryBeats: next });
                              }}
                              placeholder="Required beat..."
                              className="flex-1 bg-slate-950 border border-slate-800 rounded-md px-2 py-1 text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
                            />
                            <button
                              onClick={() => {
                                const next = activeScene.mandatoryBeats.filter((_, i) => i !== idx);
                                updateActiveScene({ mandatoryBeats: next.length ? next : [''] });
                              }}
                              className="text-slate-500 hover:text-rose-400 p-0.5"
                            >
                              <X className="w-3 h-3" />
                            </button>
                          </div>
                        ))}
                      </div>

                      {/* Knowledge Gate */}
                      <div className="space-y-1">
                        <div className="flex items-center justify-between">
                          <label className="text-[11px] font-semibold uppercase text-slate-400">
                            Knowledge Gate Carry-In
                          </label>
                          <button
                            onClick={handleAutoPullKnowledgeGate}
                            className="text-[11px] text-emerald-400 hover:text-emerald-300 inline-flex items-center gap-1"
                          >
                            <RefreshCw className="w-3 h-3" /> Pull Prior
                          </button>
                        </div>
                        <textarea
                          value={activeScene.knowledgeGate}
                          onChange={(e) => updateActiveScene({ knowledgeGate: e.target.value })}
                          rows={3}
                          placeholder="Facts witnessed on-screen so far..."
                          className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
                        />
                      </div>

                      {/* Segue & Triggers */}
                      <div className="space-y-2.5 pt-2 border-t border-slate-800/80">
                        <div>
                          <label className="text-[11px] font-semibold uppercase text-slate-400">
                            Physical Segue to Next Scene
                          </label>
                          <input
                            type="text"
                            value={activeScene.physicalSegue}
                            onChange={(e) => updateActiveScene({ physicalSegue: e.target.value })}
                            placeholder="Exact physical transition out..."
                            className="mt-1 w-full bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
                          />
                        </div>
                        <div className="grid grid-cols-1 gap-2">
                          <div className="flex items-center gap-2">
                            <Swords className="w-3.5 h-3.5 text-rose-400 shrink-0" />
                            <input
                              type="text"
                              value={activeScene.triggers?.combatEncounter || ''}
                              onChange={(e) =>
                                updateActiveScene({
                                  triggers: { ...activeScene.triggers, combatEncounter: e.target.value },
                                })
                              }
                              placeholder="Optional Combat Encounter..."
                              className="flex-1 bg-slate-950 border border-slate-800 rounded-md px-2 py-1 text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
                            />
                          </div>
                          <div className="flex items-center gap-2">
                            <MessageSquare className="w-3.5 h-3.5 text-sky-400 shrink-0" />
                            <input
                              type="text"
                              value={activeScene.triggers?.textMessageBeat || ''}
                              onChange={(e) =>
                                updateActiveScene({
                                  triggers: { ...activeScene.triggers, textMessageBeat: e.target.value },
                                })
                              }
                              placeholder="Optional Text Message Beat..."
                              className="flex-1 bg-slate-950 border border-slate-800 rounded-md px-2 py-1 text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
                            />
                          </div>
                          <div className="flex items-center gap-2">
                            <Maximize2 className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                            <input
                              type="text"
                              value={activeScene.triggers?.closeupScreen || ''}
                              onChange={(e) =>
                                updateActiveScene({
                                  triggers: { ...activeScene.triggers, closeupScreen: e.target.value },
                                })
                              }
                              placeholder="Optional Close-Up Screen..."
                              className="flex-1 bg-slate-950 border border-slate-800 rounded-md px-2 py-1 text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* TONE & RULES INSPECTOR TAB */}
                  {leftPaneTab === 'tone' && (
                    <div className="p-4 space-y-4 max-h-[calc(100vh-140px)] overflow-y-auto">
                      {[
                        { key: 'humorDensity', label: 'Humor Density / Joke Rate', minL: 'Dry', maxL: 'Dense' },
                        { key: 'banterSpeed', label: 'Banter Speed & Tightness', minL: 'Unhurried', maxL: 'Snappy' },
                        { key: 'groundedVsGoofy', label: 'Grounded vs. Goofy', minL: 'Grounded', maxL: 'Goofy' },
                        { key: 'sentimentWarmth', label: 'Sentiment / Warmth', minL: 'Unsentimental', maxL: 'Warm' },
                      ].map((s) => (
                        <div key={s.key} className="space-y-1">
                          <div className="flex items-center justify-between">
                            <span className="text-xs font-medium text-slate-200">{s.label}</span>
                            <span className="text-xs font-mono font-bold text-indigo-300">
                              {activeScene.sliders[s.key]}/10
                            </span>
                          </div>
                          <input
                            type="range"
                            min={0}
                            max={10}
                            value={activeScene.sliders[s.key]}
                            onChange={(e) =>
                              updateActiveScene({
                                sliders: { ...activeScene.sliders, [s.key]: Number(e.target.value) },
                              })
                            }
                            className="w-full accent-indigo-500"
                          />
                          <div className="flex justify-between text-[10px] text-slate-500">
                            <span>{s.minL}</span>
                            <span>{s.maxL}</span>
                          </div>
                        </div>
                      ))}

                      <div className="pt-2 border-t border-slate-800 space-y-2">
                        <label className="text-xs font-medium text-slate-200 block">
                          Target Spoken Line Count
                        </label>
                        <div className="flex items-center gap-2">
                          <input
                            type="number"
                            min={1}
                            max={40}
                            value={activeScene.sliders.minLines}
                            onChange={(e) =>
                              updateActiveScene({
                                sliders: {
                                  ...activeScene.sliders,
                                  minLines: Math.max(1, Number(e.target.value) || 1),
                                },
                              })
                            }
                            className="w-20 bg-slate-950 border border-slate-700 rounded-lg px-2 py-1 text-sm font-mono text-white text-center"
                          />
                          <span className="text-xs text-slate-500">to</span>
                          <input
                            type="number"
                            min={1}
                            max={60}
                            value={activeScene.sliders.maxLines}
                            onChange={(e) =>
                              updateActiveScene({
                                sliders: {
                                  ...activeScene.sliders,
                                  maxLines: Math.max(
                                    activeScene.sliders.minLines,
                                    Number(e.target.value) || 1
                                  ),
                                },
                              })
                            }
                            className="w-20 bg-slate-950 border border-slate-700 rounded-lg px-2 py-1 text-sm font-mono text-white text-center"
                          />
                        </div>
                      </div>

                      <div className="space-y-1">
                        <label className="text-xs font-medium text-slate-200 block">
                          Director Notes (Overrides Reference Defaults)
                        </label>
                        <textarea
                          value={activeScene.sliders.directorNotes}
                          onChange={(e) =>
                            updateActiveScene({
                              sliders: { ...activeScene.sliders, directorNotes: e.target.value },
                            })
                          }
                          rows={3}
                          placeholder="Specific comedic direction or overrides for this scene..."
                          className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
                        />
                      </div>

                      <div className="pt-2 border-t border-slate-800 space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-medium text-slate-200">
                            Chapter Banned Words
                          </span>
                          <button
                            onClick={() => setSettingsOpen(true)}
                            className="text-[11px] text-indigo-400 hover:text-indigo-300"
                          >
                            Manage
                          </button>
                        </div>
                        <div className="flex flex-wrap gap-1.5">
                          {(state.settings.bannedWords || []).map((word) => {
                            const isActive = activeBannedWords.includes(word);
                            return (
                              <button
                                key={word}
                                onClick={() => {
                                  const disabled = activeChapter.disabledBannedWords || [];
                                  const next = isActive
                                    ? [...disabled, word]
                                    : disabled.filter((w) => w !== word);
                                  updateChapter(activeChapter.id, { disabledBannedWords: next });
                                }}
                                className={`text-[11px] px-2 py-0.5 rounded-full border transition ${
                                  isActive
                                    ? 'bg-rose-500/15 text-rose-300 border-rose-500/40'
                                    : 'bg-slate-950 text-slate-500 border-slate-800 line-through'
                                }`}
                              >
                                {word}
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    </div>
                  )}
                </aside>

                {/* RIGHT MAIN STAGE: CLEAN SCRIPT EDITOR */}
                <section className="lg:col-span-8 space-y-3">
                  {/* Script Action Bar */}
                  <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-3 flex flex-wrap items-center justify-between gap-2">
                    <div className="flex flex-wrap items-center gap-2">
                      <button
                        onClick={handleGenerateScene}
                        disabled={Boolean(loadingStatus)}
                        className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-xs sm:text-sm font-semibold bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white shadow transition"
                      >
                        <Sparkles className="w-4 h-4" />
                        Generate Scene
                      </button>

                      <button
                        onClick={handleSurgicalRegenerate}
                        disabled={Boolean(loadingStatus) || activeScene.lines.length === 0}
                        className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs sm:text-sm font-semibold bg-violet-600/20 hover:bg-violet-600/30 disabled:opacity-40 text-violet-200 border border-violet-500/40 transition"
                      >
                        <Zap className="w-4 h-4 text-violet-400" />
                        Rewrite {flaggedCount > 0 ? `${flaggedCount} Flagged` : 'Unlocked'}
                      </button>

                      <button
                        onClick={() =>
                          updateActiveScene((sc) => ({
                            ...sc,
                            lines: [
                              ...sc.lines,
                              {
                                id: uid('line'),
                                type: 'dialogue',
                                speaker: activeScene.requiredSpeakers?.[0] || 'Tom',
                                mood: 'none',
                                text: '',
                                locked: false,
                                flags: [],
                                customNote: '',
                              },
                            ],
                          }))
                        }
                        className="inline-flex items-center gap-1 px-2.5 py-2 rounded-lg text-xs font-medium bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700"
                      >
                        <Plus className="w-3.5 h-3.5" /> Line
                      </button>
                    </div>

                    <div className="flex items-center gap-1.5">
                      <History className="w-3.5 h-3.5 text-slate-500" />
                      <select
                        value=""
                        onChange={(e) => {
                          const snapId = e.target.value;
                          if (!snapId) return;
                          const snap = (activeScene.history || []).find((h) => h.id === snapId);
                          if (!snap) return;
                          updateActiveScene((sc) => ({
                            ...sc,
                            history: pushSceneSnapshot(sc, 'Before Restore'),
                            lines: JSON.parse(JSON.stringify(snap.lines)),
                          }));
                          showToast(`Restored "${snap.label}".`);
                        }}
                        className="bg-slate-950 border border-slate-800 rounded-lg px-2 py-1.5 text-xs text-slate-300 focus:outline-none focus:border-indigo-500"
                      >
                        <option value="">History ({(activeScene.history || []).length})</option>
                        {(activeScene.history || []).map((h) => (
                          <option key={h.id} value={h.id}>
                            {h.timestamp} · {h.label} ({h.lines.length}L)
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  {/* Script Line Cards */}
                  {activeScene.lines.length === 0 ? (
                    <div className="bg-slate-900/40 border border-dashed border-slate-800 rounded-xl p-10 text-center space-y-2">
                      <p className="text-sm font-medium text-slate-300">
                        Ready to write <span className="font-mono text-indigo-300">{activeScene.sceneId}</span>
                      </p>
                      <p className="text-xs text-slate-500 max-w-md mx-auto">
                        Review the Blueprint & Tone sliders on the left, then click <strong>Generate Scene</strong>, <strong>Paste Script</strong>, or <strong>+ Line</strong>.
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-2.5">
                      {activeScene.qa && (
                        <details
                          className={`rounded-xl border px-3 py-2 text-xs ${
                            activeScene.qa.passed
                              ? 'bg-emerald-950/30 border-emerald-500/30 text-emerald-200'
                              : 'bg-amber-950/30 border-amber-500/30 text-amber-200'
                          }`}
                        >
                          <summary className="cursor-pointer select-none font-semibold flex flex-wrap items-center gap-x-3 gap-y-1">
                            <span>{activeScene.qa.passed ? 'QA passed' : 'QA: needs a look'}</span>
                            <span className="font-mono">
                              Score {activeScene.qa.score == null ? 'n/a' : `${activeScene.qa.score}/10`}
                            </span>
                            <span className="font-mono">
                              {activeScene.qa.retries} auto-fix{activeScene.qa.retries === 1 ? '' : 'es'}
                            </span>
                            <span className="font-mono">{(activeScene.qa.notes || []).length} note{(activeScene.qa.notes || []).length === 1 ? '' : 's'}</span>
                          </summary>
                          <ul className="mt-2 space-y-1 list-disc pl-5 text-slate-300">
                            {(activeScene.qa.notes || []).length === 0 ? (
                              <li>No remaining notes.</li>
                            ) : (
                              activeScene.qa.notes.map((n, i) => <li key={i}>{n}</li>)
                            )}
                          </ul>
                        </details>
                      )}
                      {activeScene.lines.map((line, idx) => {
                        const warnings = lintLine(line, activeBannedWords);
                        const charLen = (line.text || '').length;
                        const isHighlighted = highlightedLineIdx === idx;
                        const flagDrawerOpen = Boolean(expandedFlagLineIds[line.id]);
                        const hasFeedback =
                          (line.flags && line.flags.length > 0) ||
                          (line.customNote && line.customNote.trim().length > 0);

                        const charBadgeColor =
                          line.type !== 'dialogue'
                            ? 'text-slate-400 bg-slate-800'
                            : charLen >= 35 && charLen <= 115
                            ? 'text-emerald-300 bg-emerald-500/15'
                            : charLen > 115
                            ? 'text-rose-300 bg-rose-500/15'
                            : 'text-amber-300 bg-amber-500/15';

                        return (
                          <div
                            key={line.id}
                            id={`line-card-${idx}`}
                            className={`rounded-xl border p-3 transition ${
                              isHighlighted
                                ? 'bg-indigo-950/40 border-indigo-400 ring-2 ring-indigo-500/30'
                                : line.locked
                                ? 'bg-slate-900/90 border-emerald-500/35'
                                : hasFeedback
                                ? 'bg-slate-900/80 border-amber-500/40'
                                : 'bg-slate-900/55 border-slate-800/90'
                            }`}
                          >
                            {/* Clean Single-Row Card Header */}
                            <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
                              <div className="flex flex-wrap items-center gap-1.5">
                                <span className="font-mono text-[11px] font-bold px-1.5 py-0.5 rounded bg-slate-800 text-indigo-300">
                                  L{idx + 1}
                                </span>

                                <select
                                  value={line.type}
                                  onChange={(e) => updateLine(line.id, { type: e.target.value })}
                                  className="bg-slate-950 border border-slate-800 rounded-md px-1.5 py-1 text-xs text-slate-300 focus:outline-none focus:border-indigo-500"
                                >
                                  {ITEM_TYPES.map((t) => (
                                    <option key={t.value} value={t.value}>
                                      {t.label}
                                    </option>
                                  ))}
                                </select>

                                <input
                                  type="text"
                                  list="aot-cast-datalist"
                                  value={line.speaker}
                                  onChange={(e) => updateLine(line.id, { speaker: e.target.value })}
                                  placeholder="Speaker"
                                  className="w-28 bg-slate-950 border border-slate-800 rounded-md px-2 py-1 text-xs font-semibold text-white focus:outline-none focus:border-indigo-500"
                                />

                                <select
                                  value={line.mood || 'none'}
                                  onChange={(e) => updateLine(line.id, { mood: e.target.value })}
                                  className="bg-slate-950 border border-slate-800 rounded-md px-1.5 py-1 text-xs text-slate-400 focus:outline-none focus:border-indigo-500"
                                >
                                  <option value="none">none</option>
                                  <optgroup label="Moods (8)">
                                    {VALID_MOODS.map((m) => (
                                      <option key={m} value={m}>
                                        {m}
                                      </option>
                                    ))}
                                  </optgroup>
                                  <optgroup label="Poses (4)">
                                    {VALID_POSES.map((p) => (
                                      <option key={p} value={p}>
                                        {p}
                                      </option>
                                    ))}
                                  </optgroup>
                                </select>

                                <span className={`text-[11px] font-mono px-1.5 py-0.5 rounded ${charBadgeColor}`}>
                                  {charLen} ch
                                </span>
                              </div>

                              {/* Compact Right Controls */}
                              <div className="flex items-center gap-1">
                                <button
                                  onClick={() => updateLine(line.id, { locked: !line.locked })}
                                  className={`inline-flex items-center gap-1 px-2 py-1 rounded-md text-xs font-medium border transition ${
                                    line.locked
                                      ? 'bg-emerald-500/15 text-emerald-300 border-emerald-500/40'
                                      : 'bg-slate-950 text-slate-400 border-slate-800 hover:text-slate-200'
                                  }`}
                                  title="Lock line during Surgical Regenerate"
                                >
                                  {line.locked ? <Lock className="w-3 h-3" /> : <Unlock className="w-3 h-3" />}
                                </button>

                                <button
                                  onClick={() =>
                                    setExpandedFlagLineIds((prev) => ({
                                      ...prev,
                                      [line.id]: !prev[line.id],
                                    }))
                                  }
                                  className={`inline-flex items-center gap-1 px-2 py-1 rounded-md text-xs font-medium border transition ${
                                    hasFeedback || flagDrawerOpen
                                      ? 'bg-amber-500/15 text-amber-300 border-amber-500/40'
                                      : 'bg-slate-950 text-slate-400 border-slate-800 hover:text-slate-200'
                                  }`}
                                  title="Flag line for Surgical Regenerate"
                                >
                                  <Flag className="w-3 h-3" />
                                  <span>
                                    {line.flags.length > 0 ? `Flags (${line.flags.length})` : 'Flag'}
                                  </span>
                                </button>

                                <button
                                  onClick={() => {
                                    updateActiveScene((sc) => {
                                      const next = [...sc.lines];
                                      next.splice(idx + 1, 0, {
                                        id: uid('line'),
                                        type: 'dialogue',
                                        speaker: line.speaker || 'Tom',
                                        mood: 'none',
                                        text: '',
                                        locked: false,
                                        flags: [],
                                        customNote: '',
                                      });
                                      return { ...sc, lines: next };
                                    });
                                  }}
                                  className="p-1.5 rounded-md bg-slate-950 border border-slate-800 text-slate-400 hover:text-indigo-300"
                                  title="Insert Line Below"
                                >
                                  <Plus className="w-3 h-3" />
                                </button>

                                <button
                                  onClick={() =>
                                    updateActiveScene((sc) => ({
                                      ...sc,
                                      lines: sc.lines.filter((l) => l.id !== line.id),
                                    }))
                                  }
                                  className="p-1.5 rounded-md bg-slate-950 border border-slate-800 text-slate-400 hover:text-rose-400"
                                  title="Delete Line"
                                >
                                  <Trash2 className="w-3 h-3" />
                                </button>
                              </div>
                            </div>

                            {/* Clean Script Text Input */}
                            <textarea
                              value={line.text}
                              onChange={(e) => updateLine(line.id, { text: e.target.value })}
                              rows={2}
                              placeholder="Write dialogue or action..."
                              className="w-full bg-slate-950/90 border border-slate-800/80 rounded-lg px-3 py-2 text-sm text-slate-100 leading-relaxed focus:outline-none focus:border-indigo-500 resize-y"
                            />

                            {/* Linter Badges (only when triggered) */}
                            {warnings.length > 0 && (
                              <div className="flex flex-wrap gap-1.5 mt-2">
                                {warnings.map((w, wi) => (
                                  <span
                                    key={wi}
                                    className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-medium border ${
                                      w.severity === 'error'
                                        ? 'bg-rose-500/15 text-rose-300 border-rose-500/30'
                                        : 'bg-amber-500/15 text-amber-300 border-amber-500/30'
                                    }`}
                                  >
                                    <AlertTriangle className="w-3 h-3 shrink-0" />
                                    {w.message}
                                  </span>
                                ))}
                              </div>
                            )}

                            {/* Compact Feedback Summary when drawer collapsed */}
                            {!flagDrawerOpen && hasFeedback && (
                              <div
                                onClick={() =>
                                  setExpandedFlagLineIds((prev) => ({ ...prev, [line.id]: true }))
                                }
                                className="mt-2 flex flex-wrap items-center gap-1.5 text-[11px] text-amber-300/90 cursor-pointer"
                              >
                                {line.flags.map((f) => (
                                  <span
                                    key={f}
                                    className="px-2 py-0.5 rounded-full bg-amber-500/15 border border-amber-500/30"
                                  >
                                    {f}
                                  </span>
                                ))}
                                {line.customNote?.trim() && (
                                  <span className="italic text-slate-400 truncate max-w-xs">
                                    “{line.customNote}”
                                  </span>
                                )}
                              </div>
                            )}

                            {/* Expandable Feedback Drawer */}
                            {flagDrawerOpen && (
                              <div className="mt-2.5 pt-2.5 border-t border-slate-800 space-y-2">
                                <div className="flex flex-wrap gap-1.5">
                                  {FEEDBACK_FLAGS.map((flagName) => {
                                    const selected = (line.flags || []).includes(flagName);
                                    return (
                                      <button
                                        key={flagName}
                                        onClick={() => {
                                          const cur = line.flags || [];
                                          const next = selected
                                            ? cur.filter((f) => f !== flagName)
                                            : [...cur, flagName];
                                          updateLine(line.id, { flags: next });
                                        }}
                                        className={`text-[11px] px-2.5 py-0.5 rounded-full border transition ${
                                          selected
                                            ? 'bg-amber-500/20 text-amber-200 border-amber-400/50 font-medium'
                                            : 'bg-slate-950 text-slate-400 border-slate-800 hover:text-slate-200'
                                        }`}
                                      >
                                        {flagName}
                                      </button>
                                    );
                                  })}
                                </div>
                                <input
                                  type="text"
                                  value={line.customNote || ''}
                                  onChange={(e) =>
                                    updateLine(line.id, { customNote: e.target.value })
                                  }
                                  placeholder="Custom note for Surgical Regenerate (e.g. 'Make Grace drier here')..."
                                  className="w-full bg-slate-950 border border-slate-800 rounded-md px-2.5 py-1.5 text-xs text-slate-200 placeholder:text-slate-600 focus:outline-none focus:border-amber-500/50"
                                />
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  )}
                </section>
              </div>
            )}

            <datalist id="aot-cast-datalist">
              {QUICK_CAST.map((c) => (
                <option key={c} value={c} />
              ))}
            </datalist>
          </div>
        )}

        {/* ================================================================ */}
        {/* TAB 3: DUAL NARRATIVE CHECKERS                                   */}
        {/* ================================================================ */}
        {activeTab === 'checkers' && activeChapter && (
          <div className="space-y-5">
            <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-4 flex flex-wrap items-center justify-between gap-4">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <h2 className="text-base font-semibold text-white">Dual Narrative Checkers</h2>
                  <span className="text-xs font-mono px-2 py-0.5 rounded bg-slate-800 text-indigo-300">
                    Audit Model: {auditModelId || 'Not set'}
                  </span>
                </div>
                <p className="text-xs text-slate-400">
                  Auditing <strong>{activeChapter.label}</strong> ({activeChapter.scenes.length} scene
                  {activeChapter.scenes.length === 1 ? '' : 's'}). Click any Issue Card to jump straight to that line.
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <select
                  value={activeChapter.id}
                  onChange={(e) => handleSelectChapter(e.target.value)}
                  className="bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500"
                >
                  {state.chapters.map((ch) => (
                    <option key={ch.id} value={ch.id}>
                      {ch.label} ({ch.scenes.length} sc)
                    </option>
                  ))}
                </select>

                <button
                  onClick={handleRunTrajectoryAudit}
                  disabled={Boolean(loadingStatus)}
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-xs font-semibold bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white transition"
                >
                  <ShieldCheck className="w-4 h-4" />
                  Chapter Trajectory Checker
                </button>

                <button
                  onClick={handleRunStorylineAudit}
                  disabled={Boolean(loadingStatus)}
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-xs font-semibold bg-violet-600 hover:bg-violet-500 disabled:opacity-50 text-white transition"
                >
                  <Compass className="w-4 h-4" />
                  Overall Storyline Checker
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
              {/* TRAJECTORY REPORT */}
              <div className="bg-slate-900/70 border border-slate-800 rounded-xl p-4 space-y-4">
                <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                  <div>
                    <h3 className="text-sm font-bold text-white flex items-center gap-2">
                      <ShieldCheck className="w-4 h-4 text-indigo-400" />
                      Chapter Trajectory Scorecard
                    </h3>
                    {activeTrajectoryReport && (
                      <p className="text-[11px] text-slate-500 mt-0.5">
                        {activeTrajectoryReport.ranAt} · {activeTrajectoryReport.model}
                      </p>
                    )}
                  </div>
                  {activeTrajectoryReport && (
                    <StatusBadge status={activeTrajectoryReport.overallStatus} />
                  )}
                </div>

                {!activeTrajectoryReport ? (
                  <div className="py-12 text-center text-slate-500 text-xs">
                    Run <strong>Chapter Trajectory Checker</strong> to audit pacing, comedy rhythm, beat coverage, and physical segues.
                  </div>
                ) : (
                  <div className="space-y-4">
                    <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                      {activeTrajectoryReport.summary}
                    </p>
                    <div className="grid grid-cols-2 gap-3">
                      <div className="bg-slate-950 border border-slate-800 rounded-lg p-3">
                        <div className="text-[11px] text-slate-400 uppercase font-semibold">
                          Pacing & Balance
                        </div>
                        <div className="text-2xl font-bold text-indigo-300 mt-1">
                          {activeTrajectoryReport.pacingScore}
                          <span className="text-xs text-slate-500 font-normal">/10</span>
                        </div>
                        <p className="text-xs text-slate-400 mt-1">
                          {activeTrajectoryReport.pacingNotes}
                        </p>
                      </div>
                      <div className="bg-slate-950 border border-slate-800 rounded-lg p-3">
                        <div className="text-[11px] text-slate-400 uppercase font-semibold">
                          Comedy Rhythm
                        </div>
                        <div className="text-2xl font-bold text-violet-300 mt-1">
                          {activeTrajectoryReport.comedyRhythmScore}
                          <span className="text-xs text-slate-500 font-normal">/10</span>
                        </div>
                        <p className="text-xs text-slate-400 mt-1">
                          {activeTrajectoryReport.comedyNotes}
                        </p>
                      </div>
                    </div>

                    {activeTrajectoryReport.beatCoverage?.length > 0 && (
                      <div className="space-y-1.5">
                        <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                          Beat Coverage
                        </h4>
                        {activeTrajectoryReport.beatCoverage.map((b, i) => (
                          <div
                            key={i}
                            className="flex items-start gap-2 bg-slate-950/70 border border-slate-800 rounded-lg p-2.5 text-xs"
                          >
                            {b.covered ? (
                              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                            ) : (
                              <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                            )}
                            <div>
                              <span className="font-mono text-indigo-300 mr-1.5">{b.sceneId}</span>
                              <span className="text-slate-200 font-medium">{b.beat}</span>
                              <p className="text-slate-400 mt-0.5">{b.note}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}

                    {activeTrajectoryReport.physicalSegueAudit?.length > 0 && (
                      <div className="space-y-1.5">
                        <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                          Physical Segue Audit
                        </h4>
                        {activeTrajectoryReport.physicalSegueAudit.map((seg, i) => (
                          <div
                            key={i}
                            className="bg-slate-950/70 border border-slate-800 rounded-lg p-2.5 text-xs flex items-start justify-between gap-2"
                          >
                            <div>
                              <div className="font-mono text-slate-200">
                                {seg.fromSceneId} → {seg.toSceneId}
                              </div>
                              <p className="text-slate-400 mt-0.5">{seg.note}</p>
                            </div>
                            <StatusBadge status={seg.status} />
                          </div>
                        ))}
                      </div>
                    )}

                    <div className="space-y-2">
                      <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                        Issue Cards ({activeTrajectoryReport.issues?.length || 0})
                      </h4>
                      {activeTrajectoryReport.issues?.map((iss, i) => (
                        <button
                          key={i}
                          onClick={() => handleJumpToIssue(iss.sceneId, iss.lineNumber)}
                          className="w-full text-left bg-slate-950 hover:bg-slate-800/80 border border-slate-800 hover:border-indigo-500/50 rounded-lg p-3 transition group"
                        >
                          <div className="flex items-center justify-between gap-2 mb-1">
                            <span className="font-mono text-xs font-bold text-indigo-300">
                              {iss.sceneId}
                              {iss.lineNumber > 0 ? ` · L${iss.lineNumber}` : ''}
                            </span>
                            <span className="text-[11px] text-indigo-400 inline-flex items-center gap-1">
                              Jump <ExternalLink className="w-3 h-3" />
                            </span>
                          </div>
                          <p className="text-xs text-slate-200 font-medium">{iss.problem}</p>
                          <p className="text-xs text-emerald-300/90 mt-1">Fix: {iss.suggestedFix}</p>
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* OVERALL STORYLINE REPORT */}
              <div className="bg-slate-900/70 border border-slate-800 rounded-xl p-4 space-y-4">
                <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                  <div>
                    <h3 className="text-sm font-bold text-white flex items-center gap-2">
                      <Compass className="w-4 h-4 text-violet-400" />
                      Overall Storyline & Canon Continuity
                    </h3>
                    {activeStorylineReport && (
                      <p className="text-[11px] text-slate-500 mt-0.5">
                        {activeStorylineReport.ranAt} · {activeStorylineReport.model}
                      </p>
                    )}
                  </div>
                  {activeStorylineReport && (
                    <StatusBadge status={activeStorylineReport.overallStatus} />
                  )}
                </div>

                {!activeStorylineReport ? (
                  <div className="py-12 text-center text-slate-500 text-xs">
                    Run <strong>Overall Storyline Checker</strong> to audit plot alignment, orange-block/camera rules, cast knowledge gates, and character voice consistency.
                  </div>
                ) : (
                  <div className="space-y-4">
                    <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                      {activeStorylineReport.summary}
                    </p>
                    <div className="space-y-2.5">
                      {[
                        { title: 'Overarching Storyline Alignment', data: activeStorylineReport.storylineAlignment },
                        { title: 'Mystery & Scaling Rule Integrity', data: activeStorylineReport.mysteryScalingIntegrity },
                        { title: 'Cast Knowledge Gates', data: activeStorylineReport.castKnowledgeGates },
                        { title: 'Character Voice & Arc Consistency', data: activeStorylineReport.characterVoiceArc },
                      ].map((pillar, i) => (
                        <div key={i} className="bg-slate-950/80 border border-slate-800 rounded-lg p-3">
                          <div className="flex items-center justify-between gap-2 mb-1">
                            <span className="text-xs font-semibold text-white">{pillar.title}</span>
                            <StatusBadge status={pillar.data?.status} />
                          </div>
                          <p className="text-xs text-slate-300 leading-relaxed">{pillar.data?.analysis}</p>
                        </div>
                      ))}
                    </div>

                    <div className="space-y-2">
                      <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                        Continuity Issues ({activeStorylineReport.issues?.length || 0})
                      </h4>
                      {activeStorylineReport.issues?.map((iss, i) => (
                        <button
                          key={i}
                          onClick={() => handleJumpToIssue(iss.sceneId, iss.lineNumber)}
                          className="w-full text-left bg-slate-950 hover:bg-slate-800/80 border border-slate-800 hover:border-violet-500/50 rounded-lg p-3 transition group"
                        >
                          <div className="flex items-center justify-between gap-2 mb-1">
                            <span className="font-mono text-xs font-bold text-violet-300">
                              {iss.sceneId}
                              {iss.lineNumber > 0 ? ` · L${iss.lineNumber}` : ''} · {iss.category}
                            </span>
                            <span className="text-[11px] text-violet-400 inline-flex items-center gap-1">
                              Jump <ExternalLink className="w-3 h-3" />
                            </span>
                          </div>
                          <p className="text-xs text-slate-200 font-medium">{iss.problem}</p>
                          <p className="text-xs text-emerald-300/90 mt-1">Fix: {iss.suggestedFix}</p>
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* ================================================================ */}
        {/* TAB 4: EXPORT & WORKSHOP OUTPUT                                  */}
        {/* ================================================================ */}
        {activeTab === 'export' && (
          <div className="space-y-4">
            <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-4 flex flex-wrap items-center justify-between gap-3">
              <div className="flex flex-wrap items-center gap-2">
                {[
                  { id: 'workshop', label: 'Workshop Paste-Back (W <id> <n>)' },
                  { id: 'markdown', label: 'Clean Markdown Script' },
                  { id: 'json', label: 'Full Project JSON' },
                ].map((fmt) => (
                  <button
                    key={fmt.id}
                    onClick={() => setExportFormat(fmt.id)}
                    className={`px-3.5 py-2 rounded-lg text-xs font-semibold border transition ${
                      exportFormat === fmt.id
                        ? 'bg-indigo-600 text-white border-indigo-500'
                        : 'bg-slate-950 text-slate-400 border-slate-800 hover:text-slate-200'
                    }`}
                  >
                    {fmt.label}
                  </button>
                ))}
              </div>

              <div className="flex flex-wrap items-center gap-2">
                {exportFormat !== 'json' && (
                  <select
                    value={exportScope}
                    onChange={(e) => setExportScope(e.target.value)}
                    className="bg-slate-950 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
                  >
                    <option value="scene">Current Scene ({activeScene?.sceneId || 'none'})</option>
                    <option value="chapter">Active Chapter ({activeChapter?.label})</option>
                    <option value="all">All Written Chapters</option>
                  </select>
                )}

                <button
                  onClick={handleCopyExport}
                  className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-semibold bg-emerald-600 hover:bg-emerald-500 text-white transition"
                >
                  {copiedKey === exportFormat ? (
                    <>
                      <Check className="w-3.5 h-3.5" /> Copied
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" /> Copy
                    </>
                  )}
                </button>

                <button
                  onClick={handleDownloadExport}
                  className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition"
                >
                  <Download className="w-3.5 h-3.5" /> Download
                </button>
              </div>
            </div>

            <div className="bg-slate-900/70 border border-slate-800 rounded-xl overflow-hidden">
              <div className="px-4 py-2.5 bg-slate-900 border-b border-slate-800 flex items-center justify-between text-xs text-slate-400">
                <span className="font-mono">
                  {exportFormat === 'workshop'
                    ? 'Workshop Paste-Back Format'
                    : exportFormat === 'markdown'
                    ? 'Markdown Script Preview'
                    : 'Project JSON Backup (API key excluded)'}
                </span>
                <span>{exportOutput.length.toLocaleString()} chars</span>
              </div>
              <pre className="p-4 text-xs sm:text-sm font-mono text-slate-200 overflow-x-auto max-h-[580px] overflow-y-auto whitespace-pre-wrap leading-relaxed">
                {exportOutput}
              </pre>
            </div>
          </div>
        )}
      </main>

      {/* ================================================================== */}
      {/* PASTE WORKSHOP SCRIPT MODAL                                        */}
      {/* ================================================================== */}
      {pasteModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl max-w-xl w-full shadow-2xl overflow-hidden">
            <div className="flex items-center justify-between px-5 py-4 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <ClipboardPaste className="w-4 h-4 text-indigo-400" />
                <h2 className="text-base font-bold text-white">Paste Existing Script / Workshop Packet</h2>
              </div>
              <button
                onClick={() => setPasteModalOpen(false)}
                className="text-slate-400 hover:text-white p-1"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="p-5 space-y-3">
              <p className="text-xs text-slate-400">
                Paste a Workshop block (<code className="text-indigo-300">W ch1_s1 6</code> + <code className="text-indigo-300">L1: TOM (tell): ...</code>) or plain <code className="text-indigo-300">SPEAKER: line</code> dialogue. It will parse straight into editable cards with live linting.
              </p>
              <textarea
                value={pasteText}
                onChange={(e) => setPasteText(e.target.value)}
                rows={10}
                placeholder={'W ch1_s1 4\nL1: TOM (tell): ...\nL2: GRACE (unimpressed): ...'}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl p-3 font-mono text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
              />
            </div>
            <div className="px-5 py-3 border-t border-slate-800 flex justify-end gap-2">
              <button
                onClick={() => setPasteModalOpen(false)}
                className="px-3.5 py-1.5 rounded-lg text-xs font-medium bg-slate-800 hover:bg-slate-700 text-slate-200"
              >
                Cancel
              </button>
              <button
                onClick={handleImportPastedScript}
                className="px-4 py-1.5 rounded-lg text-xs font-semibold bg-indigo-600 hover:bg-indigo-500 text-white"
              >
                Import Lines
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ================================================================== */}
      {/* API SETTINGS & BANNED WORDS MODAL                                  */}
      {/* ================================================================== */}
      {settingsOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto shadow-2xl">
            <div className="flex items-center justify-between px-5 py-4 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <Key className="w-4 h-4 text-indigo-400" />
                <h2 className="text-base font-bold text-white">API & Linter Settings</h2>
              </div>
              <button
                onClick={() => setSettingsOpen(false)}
                className="text-slate-400 hover:text-white p-1"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-5 space-y-5">
              <div>
                <label className="text-xs font-semibold uppercase tracking-wider text-slate-400 block mb-1.5">
                  Gemini API Key (Google AI Studio)
                </label>
                <div className="flex gap-2">
                  <input
                    type={showApiKey ? 'text' : 'password'}
                    value={state.settings.apiKey}
                    onChange={(e) =>
                      setState((prev) => ({
                        ...prev,
                        settings: { ...prev.settings, apiKey: e.target.value },
                      }))
                    }
                    placeholder="AIzaSy..."
                    className="flex-1 bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-sm font-mono text-white focus:outline-none focus:border-indigo-500"
                  />
                  <button
                    onClick={() => setShowApiKey((v) => !v)}
                    className="px-3 py-2 rounded-lg text-xs bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700"
                  >
                    {showApiKey ? 'Hide' : 'Show'}
                  </button>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-semibold uppercase tracking-wider text-slate-400 block">
                  Generation (Writer) Model
                </label>
                <select
                  value={state.settings.genModelPreset}
                  onChange={(e) =>
                    setState((prev) => ({
                      ...prev,
                      settings: { ...prev.settings, genModelPreset: e.target.value },
                    }))
                  }
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-indigo-500"
                >
                  {MODEL_PRESETS.map((m) => (
                    <option key={m.id} value={m.id}>
                      {m.label}
                    </option>
                  ))}
                </select>
                {state.settings.genModelPreset === 'custom' && (
                  <input
                    type="text"
                    value={state.settings.genCustomModel}
                    onChange={(e) =>
                      setState((prev) => ({
                        ...prev,
                        settings: { ...prev.settings, genCustomModel: e.target.value },
                      }))
                    }
                    placeholder="Enter exact Gemini model ID"
                    className="w-full bg-slate-950 border border-indigo-500/50 rounded-lg px-3 py-2 text-xs font-mono text-indigo-200 focus:outline-none"
                  />
                )}
              </div>

              <div className="space-y-2">
                <label className="text-xs font-semibold uppercase tracking-wider text-slate-400 block">
                  Checker / Audit Model
                </label>
                <select
                  value={state.settings.auditModelPreset}
                  onChange={(e) =>
                    setState((prev) => ({
                      ...prev,
                      settings: { ...prev.settings, auditModelPreset: e.target.value },
                    }))
                  }
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-indigo-500"
                >
                  {MODEL_PRESETS.map((m) => (
                    <option key={m.id} value={m.id}>
                      {m.label}
                    </option>
                  ))}
                </select>
                {state.settings.auditModelPreset === 'custom' && (
                  <input
                    type="text"
                    value={state.settings.auditCustomModel}
                    onChange={(e) =>
                      setState((prev) => ({
                        ...prev,
                        settings: { ...prev.settings, auditCustomModel: e.target.value },
                      }))
                    }
                    placeholder="Enter exact Gemini audit model ID"
                    className="w-full bg-slate-950 border border-violet-500/50 rounded-lg px-3 py-2 text-xs font-mono text-violet-200 focus:outline-none"
                  />
                )}
              </div>

              <div className="flex items-center justify-between gap-3 pt-1">
                <button
                  onClick={handleTestConnection}
                  disabled={testConnState.status === 'loading'}
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-semibold bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white transition"
                >
                  {testConnState.status === 'loading' ? (
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  ) : (
                    <Zap className="w-3.5 h-3.5" />
                  )}
                  Test Connection
                </button>
                {testConnState.status !== 'idle' && (
                  <span
                    className={`text-xs flex-1 text-right ${
                      testConnState.status === 'success'
                        ? 'text-emerald-400'
                        : testConnState.status === 'error'
                        ? 'text-rose-400'
                        : 'text-slate-400'
                    }`}
                  >
                    {testConnState.message}
                  </span>
                )}
              </div>

              <div className="pt-4 border-t border-slate-800 space-y-2.5">
                <label className="text-xs font-semibold uppercase tracking-wider text-slate-400 block">
                  Global Banned Words (Toggleable Per Chapter)
                </label>
                <div className="flex flex-wrap gap-1.5">
                  {(state.settings.bannedWords || []).map((w) => (
                    <span
                      key={w}
                      className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs bg-rose-500/15 text-rose-200 border border-rose-500/30"
                    >
                      {w}
                      <button
                        onClick={() =>
                          setState((prev) => ({
                            ...prev,
                            settings: {
                              ...prev.settings,
                              bannedWords: prev.settings.bannedWords.filter((x) => x !== w),
                            },
                          }))
                        }
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  ))}
                </div>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={newBannedWord}
                    onChange={(e) => setNewBannedWord(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && newBannedWord.trim()) {
                        const word = newBannedWord.trim().toLowerCase();
                        if (!state.settings.bannedWords.includes(word)) {
                          setState((prev) => ({
                            ...prev,
                            settings: {
                              ...prev.settings,
                              bannedWords: [...prev.settings.bannedWords, word],
                            },
                          }));
                        }
                        setNewBannedWord('');
                      }
                    }}
                    placeholder="Add banned word..."
                    className="flex-1 bg-slate-950 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-white focus:outline-none focus:border-indigo-500"
                  />
                  <button
                    onClick={() => {
                      const word = newBannedWord.trim().toLowerCase();
                      if (word && !state.settings.bannedWords.includes(word)) {
                        setState((prev) => ({
                          ...prev,
                          settings: {
                            ...prev.settings,
                            bannedWords: [...prev.settings.bannedWords, word],
                          },
                        }));
                      }
                      setNewBannedWord('');
                    }}
                    className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700"
                  >
                    Add
                  </button>
                </div>
              </div>
            </div>

            <div className="px-5 py-3 border-t border-slate-800 flex justify-end">
              <button
                onClick={() => setSettingsOpen(false)}
                className="px-4 py-1.5 rounded-lg text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-white"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}

      {/* IN-PAGE CONFIRMATION MODAL */}
      {confirmModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl max-w-sm w-full p-5 space-y-4 shadow-2xl">
            <h3 className="text-base font-bold text-white">{confirmModal.title}</h3>
            <p className="text-sm text-slate-300">{confirmModal.message}</p>
            <div className="flex justify-end gap-2">
              <button
                onClick={() => setConfirmModal(null)}
                className="px-3.5 py-1.5 rounded-lg text-xs font-medium bg-slate-800 hover:bg-slate-700 text-slate-200"
              >
                Cancel
              </button>
              <button
                onClick={confirmModal.onConfirm}
                className="px-3.5 py-1.5 rounded-lg text-xs font-semibold bg-indigo-600 hover:bg-indigo-500 text-white"
              >
                {confirmModal.confirmLabel || 'Confirm'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}