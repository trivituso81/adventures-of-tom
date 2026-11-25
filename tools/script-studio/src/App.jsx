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
  ChevronDown,
  ChevronUp,
  ArrowUp,
  ArrowDown,
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
} from 'lucide-react';

// ============================================================================
// CONSTANTS & DEFAULTS
// ============================================================================

const STORAGE_KEY = 'aot_script_studio_state_v1';

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
  { value: 'text_message', label: 'Text Message' },
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

function createEmptyScene(chapterNum, sceneIndex) {
  const chPrefix = chapterNum === 21 ? 'bonus' : `ch${chapterNum}`;
  return {
    id: uid('scene'),
    sceneId: `${chPrefix}_s${sceneIndex}`,
    title: `Scene ${sceneIndex}`,
    mapId: '',
    location: '',
    requiredSpeakers: ['Tom', 'Grace'],
    mandatoryBeats: [''],
    knowledgeGate: '',
    physicalSegue: '',
    triggers: {
      combatEncounter: '',
      textMessageBeat: '',
      closeupScreen: '',
    },
    sliders: { ...DEFAULT_SLIDERS },
    lines: [],
    history: [],
  };
}

function createInitialChapters() {
  const chapters = [];
  for (let i = 1; i <= 21; i++) {
    const isBonus = i === 21;
    const ch = {
      id: isBonus ? 'bonus' : `ch${i}`,
      number: i,
      label: isBonus ? 'Bonus Chapter' : `Chapter ${i}`,
      title: isBonus ? 'Nine Scoops' : i === 1 ? 'The Pond & The Porch' : `Chapter ${i}`,
      purpose:
        i === 1
          ? 'Establish Tom, Grace, Rose, and the grandparents on Long Island; seed the first orange cube anomaly without over-explaining it.'
          : isBonus
          ? 'Post-game Los Angeles comedic epilogue featuring a 3-person party.'
          : '',
      disabledBannedWords: [],
      scenes:
        i === 1
          ? [
              {
                id: 'scene_ch1_s1_init',
                sceneId: 'ch1_s1',
                title: 'Kitchen Arrival',
                mapId: 'grands',
                location: "Deedee's Kitchen",
                requiredSpeakers: ['Tom', 'Grace', 'Rose', 'Deedee', 'Nara'],
                mandatoryBeats: [
                  'Rose hops down from Tom’s shoulders inside the kitchen.',
                  'Deedee insists everyone eat before unpacking.',
                  'Nara reacts silently to something odd outside the window.',
                ],
                knowledgeGate:
                  'Party just arrived at Deedee and Boppy’s house on Long Island. Nobody has seen an orange cube yet.',
                physicalSegue: 'Tom steps out the back screen door toward Grump Hollow.',
                triggers: {
                  combatEncounter: '',
                  textMessageBeat: '',
                  closeupScreen: '',
                },
                sliders: { ...DEFAULT_SLIDERS },
                lines: [
                  {
                    id: 'line_init_1',
                    type: 'action',
                    speaker: 'Nara',
                    mood: 'none',
                    text: 'Rose slides off Tom’s shoulders onto the linoleum while Nara stares dead-eyed at the back door.',
                    locked: false,
                    flags: [],
                    customNote: '',
                  },
                  {
                    id: 'line_init_2',
                    type: 'dialogue',
                    speaker: 'Deedee',
                    mood: 'happy',
                    text: 'You all look like you survived a famine on the LIRR. Sit down before I start plating aggressively.',
                    locked: false,
                    flags: [],
                    customNote: '',
                  },
                  {
                    id: 'line_init_3',
                    type: 'dialogue',
                    speaker: 'Grace',
                    mood: 'unimpressed',
                    text: 'We ate forty minutes ago, Deedee. Tata bought airport pretzels that could break a molar.',
                    locked: false,
                    flags: [],
                    customNote: '',
                  },
                  {
                    id: 'line_init_4',
                    type: 'dialogue',
                    speaker: 'Tom',
                    mood: 'tell',
                    text: 'Those pretzels were structural support for the drive. Hang on, what is Nara looking at out back?',
                    locked: false,
                    flags: [],
                    customNote: '',
                  },
                ],
                history: [],
              },
            ]
          : [createEmptyScene(i, 1)],
    };
    chapters.push(ch);
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
    activeSceneId: 'scene_ch1_s1_init',
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
// SAFE STORAGE & CLIPBOARD HELPERS
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
    // Storage restricted in sandbox iframe; fail silently and rely on JSON export/import
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

  // 1. Box length check (dialogue)
  if (type === 'dialogue') {
    if (text.length > 0 && text.length < 35) {
      warnings.push({
        code: 'SHORT',
        severity: 'warn',
        message: `Short box (${text.length} chars; target 35–115)`,
      });
    } else if (text.length > 115) {
      warnings.push({
        code: 'LONG',
        severity: 'error',
        message: `Overflow (${text.length} chars; max 115)`,
      });
    }
  }

  // 2. Zero em dashes
  if (text.includes('—')) {
    warnings.push({
      code: 'EM_DASH',
      severity: 'error',
      message: 'Zero em dashes (—) allowed; use en dash (–) or punctuation',
    });
  }

  // 3. Character-specific rules
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
      message: `${speaker} should not have mood/pose tags (set to "none")`,
    });
  }

  // 4. Mood/pose validation
  if (mood !== 'none') {
    const isCombined = /[\s/+|,]/.test(mood);
    if (isCombined) {
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

  // 5. Banned words
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
    return '=== REFERENCE VAULT ===\n(No reference documents loaded or checked. Rely on scene blueprint and hard engine rules.)\n=== END REFERENCE VAULT ===';
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
        ? 'Snappy, clipped volleys. Cut throat-clearing, greetings, and filler. Average spoken line 45–85 chars.'
        : s.banterSpeed >= 5
        ? 'Brisk natural pacing. Average spoken line 55–100 chars.'
        : 'Unrushed conversational rhythm allowing slightly longer thoughts within the 115-char box ceiling.'
    })`,
    `- Grounded vs. Goofy: ${s.groundedVsGoofy}/10. (0 = ultra-dry deadpan realism, 10 = heightened absurdist sitcom escalation. Calibrate comedic premises strictly to ${s.groundedVsGoofy}/10.)`,
    `- Sentiment / Warmth: ${s.sentimentWarmth}/10. (${
      s.sentimentWarmth <= 3
        ? 'Keep affection understated, unsentimental, and earned through dry teasing rather than speeches.'
        : s.sentimentWarmth <= 6
        ? 'Balanced warmth with comedic deflection—heartfelt moments are brief and grounded.'
        : 'Allow open family warmth and sincere emotional beats without tipping into melodrama.'
    })`,
    `- Target Spoken Dialogue Line Count: STRICTLY between ${s.minLines} and ${s.maxLines} lines of type "dialogue" (actions/triggers may be added as needed, keep total tight).`,
    `- Hard Engine Rules: Every "dialogue" line MUST be 35–115 characters. ZERO em dashes ("—"). TNB NEVER uses "!" or ALL-CAPS words. Nara NEVER has type "dialogue" (always "action"). Mood/pose MUST be a single valid value from [${ALL_MOOD_POSE_OPTIONS.join(', ')}] (never combined; Vance/Clara/Mr. Pistachio must use "none").`,
    `- Active Banned Words for This Chapter (DO NOT USE): ${
      activeBannedWords.length > 0 ? activeBannedWords.join(', ') : '(none)'
    }.`,
    s.directorNotes && s.directorNotes.trim()
      ? `- SCENE-SPECIFIC DIRECTOR NOTES (EXPLICITLY OVERRIDES REFERENCE DEFAULTS): ${s.directorNotes.trim()}`
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
    `KNOWLEDGE GATE CARRY-IN (Facts established on-screen so far — characters MUST NOT reference anything outside this or earlier scenes):\n  ${scene.knowledgeGate || '(None specified)'}`,
    `EXACT PHYSICAL SEGUE TO NEXT SCENE: ${scene.physicalSegue || '(None specified)'}`,
    `OPTIONAL TRIGGERS: ${triggers.length ? triggers.join(' | ') : '(None)'}`,
  ].join('\n');
}

async function callGeminiJSON({ apiKey, modelId, prompt, schema, temperature = 0.7 }) {
  if (!apiKey || !apiKey.trim()) {
    throw new Error('Missing Gemini API Key. Open API Settings in the header to add your key.');
  }
  if (!modelId || !modelId.trim()) {
    throw new Error('Missing Model ID. Open API Settings and select or type a Gemini model ID.');
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

// JSON Schemas for Gemini Structured Output
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
          mood: {
            type: 'STRING',
            enum: ALL_MOOD_POSE_OPTIONS,
          },
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
          mood: {
            type: 'STRING',
            enum: ALL_MOOD_POSE_OPTIONS,
          },
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
        return `*L${n}. [ACTION]* ${sp ? `${sp} — ` : ''}${line.text}`;
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
// SIMPLE MARKDOWN PREVIEWER (SAFE, NO EXTERNAL DEPS)
// ============================================================================

function SimpleMarkdownPreview({ content }) {
  if (!content || !content.trim()) {
    return (
      <div className="flex flex-col items-center justify-center h-64 text-slate-500 text-sm">
        <FileText className="w-8 h-8 mb-2 opacity-40" />
        <p>This document slot is currently empty.</p>
        <p className="text-xs text-slate-600 mt-1">
          Upload a .md/.txt file or switch to Edit mode to paste content.
        </p>
      </div>
    );
  }

  const lines = content.split('\n');
  return (
    <div className="space-y-1.5 text-sm text-slate-300 leading-relaxed font-sans">
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
        if (line.trim() === '') {
          return <div key={i} className="h-2" />;
        }
        return (
          <p key={i} className="whitespace-pre-wrap">
            {line}
          </p>
        );
      })}
    </div>
  );
}

// ============================================================================
// STATUS BADGE COMPONENT
// ============================================================================

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
  const [docViewMode, setDocViewMode] = useState('edit'); // preview | edit
  const [showNewDocInput, setShowNewDocInput] = useState(false);
  const [newDocName, setNewDocName] = useState('');

  // Scene Studio UI state
  const [blueprintOpen, setBlueprintOpen] = useState(true);
  const [slidersOpen, setSlidersOpen] = useState(true);
  const [speakerInput, setSpeakerInput] = useState('');
  const [highlightedLineIdx, setHighlightedLineIdx] = useState(null);

  // Settings Modal state
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [showApiKey, setShowApiKey] = useState(false);
  const [newBannedWord, setNewBannedWord] = useState('');
  const [testConnState, setTestConnState] = useState({ status: 'idle', message: '' });

  // Confirm modal state (replaces window.confirm)
  const [confirmModal, setConfirmModal] = useState(null);

  // Loading & Feedback states
  const [loadingStatus, setLoadingStatus] = useState('');
  const [errorBanner, setErrorBanner] = useState('');
  const [toast, setToast] = useState('');

  // Export tab state
  const [exportScope, setExportScope] = useState('chapter'); // scene | chapter | all
  const [exportFormat, setExportFormat] = useState('workshop'); // workshop | markdown | json
  const [copiedKey, setCopiedKey] = useState('');

  const vaultFileInputRef = useRef(null);
  const projectImportRef = useRef(null);

  // Persist state safely
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
    return (
      state.chapters.find((c) => c.id === state.activeChapterId) || state.chapters[0]
    );
  }, [state.chapters, state.activeChapterId]);

  const activeScene = useMemo(() => {
    if (!activeChapter) return null;
    return (
      activeChapter.scenes.find((s) => s.id === state.activeSceneId) ||
      activeChapter.scenes[0] ||
      null
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
        ch.id === chapterId ? (typeof updater === 'function' ? updater(ch) : { ...ch, ...updater }) : ch
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
      settings: {
        ...state.settings,
        apiKey: '', // Omit API key from backup file for security
      },
      exportedAt: new Date().toISOString(),
    };
    downloadFile(
      `aot-script-studio-${new Date().toISOString().slice(0, 10)}.json`,
      JSON.stringify(safeExport, null, 2),
      'application/json'
    );
    showToast('Project JSON exported (API key excluded for safety).');
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
            // Keep existing API key if imported file left it blank
            apiKey: parsed.settings?.apiKey || prev.settings.apiKey,
          },
        }));
        setErrorBanner('');
        showToast(`Imported "${file.name}" successfully.`);
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
    showToast(`Loaded ${readResults.length} file${readResults.length > 1 ? 's' : ''} into Reference Vault.`);
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
  // SCENE MANAGEMENT HANDLERS
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
    showToast(`Duplicated scene as ${copy.sceneId}.`);
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
    if (activeChapter.scenes.length <= 1) {
      showToast('A chapter must keep at least one scene.');
      return;
    }
    const target = activeChapter.scenes.find((s) => s.id === sceneId);
    setConfirmModal({
      title: 'Delete Scene?',
      message: `Remove "${target?.title || sceneId}" (${target?.lines.length || 0} lines)? This cannot be undone.`,
      confirmLabel: 'Delete Scene',
      onConfirm: () => {
        const remaining = activeChapter.scenes.filter((s) => s.id !== sceneId);
        updateChapter(activeChapter.id, (ch) => ({
          ...ch,
          scenes: remaining,
        }));
        if (state.activeSceneId === sceneId) {
          setState((prev) => ({ ...prev, activeSceneId: remaining[0]?.id || '' }));
        }
        setConfirmModal(null);
        showToast('Scene deleted.');
      },
    });
  };

  const handleAutoPullKnowledgeGate = () => {
    if (!activeChapter || !activeScene) return;
    const idx = activeChapter.scenes.findIndex((s) => s.id === activeScene.id);
    if (idx <= 0) {
      showToast('This is the first scene in the chapter — no prior scenes to pull from.');
      return;
    }
    const priorScenes = activeChapter.scenes.slice(0, idx);
    const summaryParts = priorScenes.map((sc) => {
      const beats = (sc.mandatoryBeats || []).filter((b) => b.trim()).join('; ');
      const lineSnippet =
        sc.lines.length > 0
          ? `Key events: ${sc.lines
              .slice(0, 3)
              .map((l) => `${l.speaker || l.type}: "${l.text.slice(0, 60)}${l.text.length > 60 ? '...' : ''}"`)
              .join(' | ')}`
          : '';
      return `[${sc.sceneId} — ${sc.title}]${beats ? ` Beats: ${beats}.` : ''}${
        lineSnippet ? ` ${lineSnippet}` : ''
      }${sc.physicalSegue ? ` Segue: ${sc.physicalSegue}` : ''}`;
    });
    updateActiveScene({ knowledgeGate: summaryParts.join('\n') });
    showToast(`Pulled carry-in facts from ${priorScenes.length} prior scene(s).`);
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
          properties: {
            ok: { type: 'BOOLEAN' },
            message: { type: 'STRING' },
          },
          required: ['ok'],
        },
        temperature: 0,
      });
      const ms = Date.now() - t0;
      setTestConnState({
        status: 'success',
        message: `Connected to ${genModelId} (${ms}ms).`,
      });
    } catch (err) {
      setTestConnState({
        status: 'error',
        message: err.message || 'Connection failed.',
      });
    }
  };

  // ==========================================================================
  // AI SCENE GENERATION & SURGICAL REGENERATION
  // ==========================================================================

  const pushSceneSnapshot = (scene, label) => {
    const snap = {
      id: uid('snap'),
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
      label,
      lines: JSON.parse(JSON.stringify(scene.lines)),
    };
    return [snap, ...(scene.history || [])].slice(0, 15);
  };

  const handleGenerateScene = async () => {
    if (!activeChapter || !activeScene) return;
    setErrorBanner('');
    setLoadingStatus('Compiling Reference Vault...');
    try {
      const vaultText = compileVaultPrompt(state.vaultDocs);
      const blueprintText = compileBlueprintPrompt(activeChapter, activeScene);
      const slidersText = compileSlidersPrompt(activeScene.sliders, activeBannedWords);

      const prompt = [
        'You are the Head Writer for the turn-based JRPG "The Adventures of Tom".',
        'Write ONE complete, crisp, playable scene strictly adhering to all injected Reference Vault documents, the Scene Blueprint, and the numeric Co-Writing Sliders below.',
        '',
        vaultText,
        '',
        '=== SCENE BLUEPRINT ===',
        blueprintText,
        '=== END SCENE BLUEPRINT ===',
        '',
        slidersText,
        '',
        'Return ONLY valid JSON matching the schema with an array of structured scene lines.',
      ].join('\n');

      setLoadingStatus(`Generating Scene with ${genModelId}...`);
      const result = await callGeminiJSON({
        apiKey: state.settings.apiKey,
        modelId: genModelId,
        prompt,
        schema: SCENE_GEN_SCHEMA,
        temperature: 0.75,
      });

      const generatedLines = (result.lines || []).map((item) => ({
        id: uid('line'),
        type: item.type || 'dialogue',
        speaker: item.speaker || '',
        mood: item.mood || 'none',
        text: item.text || '',
        locked: false,
        flags: [],
        customNote: '',
      }));

      updateActiveScene((sc) => ({
        ...sc,
        history: sc.lines.length > 0 ? pushSceneSnapshot(sc, `Before Generate (${sc.lines.length}L)`) : sc.history,
        lines: generatedLines,
      }));
      showToast(`Generated ${generatedLines.length} lines for ${activeScene.sceneId}.`);
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
          ((line.flags && line.flags.length > 0) || (line.customNote && line.customNote.trim().length > 0))
      );

    // If none explicitly flagged, fall back to all unlocked lines
    const targets =
      flaggedTargets.length > 0
        ? flaggedTargets
        : activeScene.lines
            .map((l, i) => ({ line: l, lineNumber: i + 1 }))
            .filter(({ line }) => !line.locked);

    if (targets.length === 0) {
      showToast('All lines are locked. Unlock or flag lines to regenerate.');
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
        'CRITICAL RULES:',
        '1. Preserve ALL [LOCKED] and [KEEP VERBATIM] lines exactly as written — do NOT return patches for them.',
        `2. Rewrite ONLY these exact line numbers: ${Array.from(targetNums).join(', ')}.`,
        '3. Fix every listed flag and custom note while maintaining seamless line-to-line comedic and narrative flow with the neighboring lines.',
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
        '',
        'Return JSON with "patches" containing ONLY the rewritten lines identified by their 1-based lineNumber.',
      ].join('\n');

      setLoadingStatus(`Surgically Rewriting ${targets.length} Line(s) with ${genModelId}...`);
      const result = await callGeminiJSON({
        apiKey: state.settings.apiKey,
        modelId: genModelId,
        prompt,
        schema: SURGICAL_REGEN_SCHEMA,
        temperature: 0.7,
      });

      const patchMap = new Map();
      for (const p of result.patches || []) {
        if (targetNums.has(p.lineNumber)) {
          patchMap.set(p.lineNumber, p);
        }
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
    if (!activeChapter) return;
    setErrorBanner('');
    setLoadingStatus('Compiling Reference Vault & Chapter Scenes...');
    try {
      const vaultText = compileVaultPrompt(state.vaultDocs);
      const chapterDump = serializeChapterForAudit(activeChapter);

      const prompt = [
        'You are the Showrunner & Story Editor auditing ONE chapter of "The Adventures of Tom".',
        'Run a strict CHAPTER TRAJECTORY AUDIT evaluating:',
        '1. Overall Status (PASS / WARN / FAIL)',
        '2. Pacing & Balance (0-10 score + notes)',
        '3. Comedy Rhythm (0-10 score + notes)',
        '4. Beat Coverage checklist (check every mandatory beat from every scene blueprint)',
        '5. Physical Segue Audit (verify how each scene physically hands off to the next)',
        '6. Specific Issue Cards with exact sceneId, 1-based lineNumber (use 0 if scene-level), severity, problem, and concrete suggestedFix.',
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
            [activeChapter.id]: { ...report, ranAt: new Date().toLocaleTimeString(), model: auditModelId },
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
    if (!activeChapter) return;
    setErrorBanner('');
    setLoadingStatus('Compiling Canon, Story Thread & Chapter...');
    try {
      const canonDoc = state.vaultDocs.find((d) => d.name === 'canon-and-characters.md');
      const threadDoc = state.vaultDocs.find((d) => d.name === 'story-thread.md');
      const vaultText = compileVaultPrompt(state.vaultDocs);
      const chapterDump = serializeChapterForAudit(activeChapter);

      const prompt = [
        'You are the Lead Continuity & Macro-Storyline Auditor for "The Adventures of Tom" (20 chapters + 1 bonus chapter).',
        'Audit the active chapter against canon-and-characters.md, story-thread.md, and all injected Reference Vault docs.',
        `NOTE: canon-and-characters.md is ${canonDoc?.content?.trim() ? 'LOADED' : 'EMPTY'}; story-thread.md is ${
          threadDoc?.content?.trim() ? 'LOADED' : 'EMPTY'
        }.`,
        'Check these four pillars rigorously:',
        '1. Overarching Storyline Alignment: Is the chapter advancing the main plot or drifting?',
        '2. Mystery & Scaling Rule Integrity: Orange-block sizing rules, no premature knowledge of the camera or coin-to-block mechanics.',
        '3. Cast Knowledge Gates: Do characters know ONLY what they have witnessed on-screen so far?',
        '4. Character Voice & Arc Consistency: Are voices, relationships, and arc progression faithful to canon?',
        'Return structured JSON with exact clickable Issue Cards (sceneId, 1-based lineNumber, category, severity, problem, suggestedFix).',
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
            [activeChapter.id]: { ...report, ranAt: new Date().toLocaleTimeString(), model: auditModelId },
          },
        },
      }));
      showToast(`Overall Storyline Audit complete (${report.overallStatus}).`);
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
    if (match) {
      setState((prev) => ({ ...prev, activeSceneId: match.id }));
    }
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
  // EXPORT OUTPUT COMPUTATION
  // ==========================================================================

  const exportOutput = useMemo(() => {
    if (exportFormat === 'json') {
      const safe = {
        ...state,
        settings: { ...state.settings, apiKey: '' },
      };
      return JSON.stringify(safe, null, 2);
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

    // Markdown
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
      setErrorBanner('Could not copy automatically — select the preview text and copy manually.');
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

  // Count flagged/unlocked lines in active scene for Surgical Regen button
  const flaggedCount = useMemo(() => {
    if (!activeScene) return 0;
    return activeScene.lines.filter(
      (l) => !l.locked && (l.flags.length > 0 || l.customNote.trim().length > 0)
    ).length;
  }, [activeScene]);

  const activeTrajectoryReport = state.auditReports.trajectory[activeChapter?.id];
  const activeStorylineReport = state.auditReports.storyline[activeChapter?.id];

  // ==========================================================================
  // RENDER
  // ==========================================================================

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans selection:bg-indigo-500/30">
      {/* Hidden File Inputs */}
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

      {/* TOP HEADER */}
      <header className="sticky top-0 z-30 bg-slate-950/90 backdrop-blur border-b border-slate-800/90">
        <div className="max-w-7xl mx-auto px-4 py-3 flex flex-wrap items-center justify-between gap-3">
          {/* Brand */}
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center shadow-lg shadow-indigo-500/20">
              <Clapperboard className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-base font-bold tracking-tight text-white">
                  AoT Script Studio
                </h1>
                <span className="hidden sm:inline-block text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded bg-slate-800 text-indigo-300 border border-slate-700">
                  The Adventures of Tom
                </span>
              </div>
              <p className="text-xs text-slate-400">
                20 Chapters + Bonus · Vault: {vaultStats.injectedCount}/{vaultStats.total} injected (~
                {vaultStats.totalTokens.toLocaleString()} tok)
              </p>
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => projectImportRef.current?.click()}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-slate-900 hover:bg-slate-800 text-slate-200 border border-slate-700/80 transition"
              title="Import Project JSON"
            >
              <Upload className="w-3.5 h-3.5 text-slate-400" />
              <span className="hidden sm:inline">Import JSON</span>
            </button>
            <button
              onClick={handleExportProjectJSON}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-slate-900 hover:bg-slate-800 text-slate-200 border border-slate-700/80 transition"
              title="Export Project JSON Backup"
            >
              <Download className="w-3.5 h-3.5 text-slate-400" />
              <span className="hidden sm:inline">Export JSON</span>
            </button>
            <button
              onClick={() => setSettingsOpen(true)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-indigo-600/20 hover:bg-indigo-600/30 text-indigo-200 border border-indigo-500/40 transition"
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
              <span>API Settings</span>
            </button>
          </div>
        </div>

        {/* NAVIGATION TABS */}
        <div className="max-w-7xl mx-auto px-4 flex items-center gap-1 overflow-x-auto border-t border-slate-900">
          {[
            {
              id: 'vault',
              label: '1. Reference Vault',
              icon: BookOpen,
              badge: `${vaultStats.loadedCount}/${vaultStats.total}`,
            },
            {
              id: 'studio',
              label: '2. Scene Studio',
              icon: Clapperboard,
              badge: activeScene ? activeScene.sceneId : '',
            },
            {
              id: 'checkers',
              label: '3. Dual Checkers',
              icon: ShieldCheck,
              badge: activeTrajectoryReport?.overallStatus || activeStorylineReport?.overallStatus || '',
            },
            {
              id: 'export',
              label: '4. Export & Workshop',
              icon: FileCode2,
              badge: '',
            },
          ].map((tab) => {
            const Icon = tab.icon;
            const active = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-4 py-2.5 text-xs sm:text-sm font-medium whitespace-nowrap border-b-2 transition ${
                  active
                    ? 'border-indigo-400 text-white bg-slate-900/50'
                    : 'border-transparent text-slate-400 hover:text-slate-200 hover:bg-slate-900/30'
                }`}
              >
                <Icon className={`w-4 h-4 ${active ? 'text-indigo-400' : 'text-slate-500'}`} />
                <span>{tab.label}</span>
                {tab.badge && (
                  <span
                    className={`text-[10px] px-1.5 py-0.5 rounded font-mono ${
                      active ? 'bg-indigo-500/20 text-indigo-200' : 'bg-slate-800 text-slate-400'
                    }`}
                  >
                    {tab.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </header>

      {/* GLOBAL LOADING & ERROR BANNERS */}
      {loadingStatus && (
        <div className="bg-indigo-950/90 border-b border-indigo-500/40 px-4 py-2.5">
          <div className="max-w-7xl mx-auto flex items-center gap-3 text-sm text-indigo-200">
            <Loader2 className="w-4 h-4 animate-spin text-indigo-400 shrink-0" />
            <span className="font-medium">{loadingStatus}</span>
          </div>
        </div>
      )}

      {errorBanner && (
        <div className="bg-rose-950/90 border-b border-rose-500/40 px-4 py-2.5">
          <div className="max-w-7xl mx-auto flex items-start justify-between gap-3 text-sm text-rose-200">
            <div className="flex items-start gap-2.5">
              <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
              <span className="break-words">{errorBanner}</span>
            </div>
            <button
              onClick={() => setErrorBanner('')}
              className="text-rose-300 hover:text-white p-0.5"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* TOAST */}
      {toast && (
        <div className="fixed bottom-5 right-5 z-50 bg-slate-900 border border-indigo-500/40 text-slate-100 px-4 py-2.5 rounded-xl shadow-2xl flex items-center gap-2 text-sm">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{toast}</span>
        </div>
      )}

      {/* MAIN CONTENT */}
      <main className="max-w-7xl mx-auto px-4 py-6">
        {/* ================================================================ */}
        {/* TAB 1: REFERENCE VAULT                                           */}
        {/* ================================================================ */}
        {activeTab === 'vault' && (
          <div className="space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-3 bg-slate-900/70 border border-slate-800 rounded-xl p-4">
              <div>
                <h2 className="text-base font-semibold text-white">Reference Vault</h2>
                <p className="text-xs text-slate-400 mt-0.5">
                  Every checked document is programmatically concatenated and injected verbatim into every generation and audit prompt.
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
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition"
                >
                  <Plus className="w-3.5 h-3.5" />
                  Add New Doc
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
              {/* Left Doc List */}
              <div className="lg:col-span-4 space-y-2">
                {state.vaultDocs.map((doc) => {
                  const isLoaded = doc.content.trim().length > 0;
                  const isSelected = selectedDoc?.id === doc.id;
                  const chars = doc.content.length;
                  const toks = approxTokens(doc.content);
                  return (
                    <div
                      key={doc.id}
                      onClick={() => setSelectedDocId(doc.id)}
                      className={`cursor-pointer rounded-xl p-3 border transition ${
                        isSelected
                          ? 'bg-slate-900 border-indigo-500/60 shadow-lg shadow-indigo-950/30'
                          : 'bg-slate-900/50 border-slate-800 hover:border-slate-700'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2">
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
                            className="rounded border-slate-600 bg-slate-950 text-indigo-500 focus:ring-indigo-500"
                          />
                          <span className="text-sm font-mono font-medium text-slate-100 truncate">
                            {doc.name}
                          </span>
                        </div>
                        <span
                          className={`shrink-0 text-[10px] font-semibold uppercase px-2 py-0.5 rounded-full border ${
                            isLoaded
                              ? 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30'
                              : 'bg-slate-800 text-slate-400 border-slate-700'
                          }`}
                        >
                          {isLoaded ? 'Loaded' : 'Empty'}
                        </span>
                      </div>

                      <div className="flex items-center justify-between mt-2 pl-6 text-[11px] text-slate-400">
                        <span>
                          {chars.toLocaleString()} chars · ~{toks.toLocaleString()} tok
                        </span>
                        <div className="flex items-center gap-2">
                          {doc.inject ? (
                            <span className="text-indigo-400">Injected</span>
                          ) : (
                            <span className="text-slate-500">Skipped</span>
                          )}
                          {!doc.core && (
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                setState((prev) => ({
                                  ...prev,
                                  vaultDocs: prev.vaultDocs.filter((d) => d.id !== doc.id),
                                }));
                                if (selectedDocId === doc.id) {
                                  setSelectedDocId(state.vaultDocs[0]?.id || '');
                                }
                              }}
                              className="text-slate-500 hover:text-rose-400"
                              title="Delete custom doc"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Right Editor / Preview */}
              <div className="lg:col-span-8 bg-slate-900/70 border border-slate-800 rounded-xl flex flex-col overflow-hidden min-h-[520px]">
                {selectedDoc && (
                  <>
                    <div className="flex flex-wrap items-center justify-between gap-2 px-4 py-3 border-b border-slate-800 bg-slate-900">
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
                                showToast(`Reverted ${selectedDoc.name} to uploaded version.`);
                              }}
                              className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-medium bg-slate-800 hover:bg-slate-700 text-amber-300 border border-slate-700"
                            >
                              <RotateCcw className="w-3.5 h-3.5" />
                              Revert to Uploaded
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
                            <Edit3 className="w-3.5 h-3.5" /> Live Edit
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
                          placeholder={`Paste or write ${selectedDoc.name} here, or upload a .md/.txt file...`}
                          className="w-full h-[460px] bg-slate-950 border border-slate-800 rounded-lg p-3.5 font-mono text-xs sm:text-sm text-slate-200 leading-relaxed focus:outline-none focus:border-indigo-500 resize-y"
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
        {/* TAB 2: SCENE STUDIO                                              */}
        {/* ================================================================ */}
        {activeTab === 'studio' && activeChapter && activeScene && (
          <div className="space-y-5">
            {/* TOP CHAPTER & SCENE BAR */}
            <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-4 space-y-4">
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-3 items-start">
                {/* Chapter Selector */}
                <div className="lg:col-span-4 space-y-1">
                  <label className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                    Active Chapter
                  </label>
                  <select
                    value={activeChapter.id}
                    onChange={(e) => handleSelectChapter(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-sm font-medium text-white focus:outline-none focus:border-indigo-500"
                  >
                    {state.chapters.map((ch) => (
                      <option key={ch.id} value={ch.id}>
                        {ch.label}: {ch.title} ({ch.scenes.length} sc)
                      </option>
                    ))}
                  </select>
                </div>

                {/* Chapter Title */}
                <div className="lg:col-span-3 space-y-1">
                  <label className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                    Chapter Title
                  </label>
                  <input
                    type="text"
                    value={activeChapter.title}
                    onChange={(e) => updateChapter(activeChapter.id, { title: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-indigo-500"
                  />
                </div>

                {/* Chapter Purpose / Arc Goal */}
                <div className="lg:col-span-5 space-y-1">
                  <label className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                    Chapter Purpose / Arc Goal
                  </label>
                  <input
                    type="text"
                    value={activeChapter.purpose}
                    onChange={(e) => updateChapter(activeChapter.id, { purpose: e.target.value })}
                    placeholder="What must this chapter accomplish for the story & comedy arc?"
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>

              {/* Scene Strip */}
              <div className="pt-3 border-t border-slate-800/80 flex flex-wrap items-center justify-between gap-2">
                <div className="flex flex-wrap items-center gap-1.5">
                  {activeChapter.scenes.map((sc, idx) => {
                    const isSelected = sc.id === activeScene.id;
                    return (
                      <div
                        key={sc.id}
                        className={`inline-flex items-center rounded-lg border text-xs transition ${
                          isSelected
                            ? 'bg-indigo-600/25 border-indigo-400 text-white'
                            : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700 hover:text-slate-200'
                        }`}
                      >
                        <button
                          onClick={() => {
                            setState((prev) => ({ ...prev, activeSceneId: sc.id }));
                            setHighlightedLineIdx(null);
                          }}
                          className="px-2.5 py-1.5 font-medium flex items-center gap-1.5"
                        >
                          <span className="font-mono text-[10px] opacity-70">{sc.sceneId}</span>
                          <span>{sc.title}</span>
                          <span className="text-[10px] px-1 rounded bg-slate-900/80 text-slate-400">
                            {sc.lines.length}L
                          </span>
                        </button>
                        {isSelected && (
                          <div className="flex items-center pr-1 gap-0.5 border-l border-indigo-500/30 pl-1">
                            <button
                              onClick={() => handleReorderScene(sc.id, -1)}
                              disabled={idx === 0}
                              className="p-0.5 text-slate-300 hover:text-white disabled:opacity-30"
                              title="Move Left"
                            >
                              <ArrowUp className="w-3 h-3 -rotate-90" />
                            </button>
                            <button
                              onClick={() => handleReorderScene(sc.id, 1)}
                              disabled={idx === activeChapter.scenes.length - 1}
                              className="p-0.5 text-slate-300 hover:text-white disabled:opacity-30"
                              title="Move Right"
                            >
                              <ArrowDown className="w-3 h-3 -rotate-90" />
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
                    className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-medium bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700"
                  >
                    <Plus className="w-3.5 h-3.5" /> Add Scene
                  </button>
                  <button
                    onClick={handleDuplicateScene}
                    className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-medium bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700"
                  >
                    <Copy className="w-3.5 h-3.5" /> Duplicate
                  </button>
                </div>
              </div>
            </div>

            {/* COLLAPSIBLE SCENE BLUEPRINT */}
            <div className="bg-slate-900/70 border border-slate-800 rounded-xl overflow-hidden">
              <button
                onClick={() => setBlueprintOpen((v) => !v)}
                className="w-full px-4 py-3 flex items-center justify-between bg-slate-900 hover:bg-slate-800/70 transition text-left"
              >
                <div className="flex items-center gap-2.5">
                  <Compass className="w-4 h-4 text-indigo-400" />
                  <span className="text-sm font-semibold text-white">Scene Blueprint</span>
                  <span className="text-xs text-slate-400 font-mono">
                    {activeScene.sceneId} · {activeScene.mapId || 'no-map'} ·{' '}
                    {activeScene.location || 'No location'}
                  </span>
                </div>
                {blueprintOpen ? (
                  <ChevronUp className="w-4 h-4 text-slate-400" />
                ) : (
                  <ChevronDown className="w-4 h-4 text-slate-400" />
                )}
              </button>

              {blueprintOpen && (
                <div className="p-4 space-y-4 border-t border-slate-800">
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                    <div>
                      <label className="text-[11px] font-semibold uppercase text-slate-400">
                        Scene Title
                      </label>
                      <input
                        type="text"
                        value={activeScene.title}
                        onChange={(e) => updateActiveScene({ title: e.target.value })}
                        className="mt-1 w-full bg-slate-950 border border-slate-700 rounded-lg px-2.5 py-1.5 text-sm text-white focus:outline-none focus:border-indigo-500"
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
                        placeholder="ch2_s1"
                        className="mt-1 w-full bg-slate-950 border border-slate-700 rounded-lg px-2.5 py-1.5 text-sm font-mono text-indigo-300 focus:outline-none focus:border-indigo-500"
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
                        placeholder="lacab"
                        className="mt-1 w-full bg-slate-950 border border-slate-700 rounded-lg px-2.5 py-1.5 text-sm font-mono text-slate-200 focus:outline-none focus:border-indigo-500"
                      />
                    </div>
                    <div>
                      <label className="text-[11px] font-semibold uppercase text-slate-400">
                        Location
                      </label>
                      <input
                        type="text"
                        value={activeScene.location}
                        onChange={(e) => updateActiveScene({ location: e.target.value })}
                        placeholder="Deedee's Kitchen"
                        className="mt-1 w-full bg-slate-950 border border-slate-700 rounded-lg px-2.5 py-1.5 text-sm text-slate-200 focus:outline-none focus:border-indigo-500"
                      />
                    </div>
                  </div>

                  {/* Required Speakers */}
                  <div>
                    <label className="text-[11px] font-semibold uppercase text-slate-400">
                      Required Speakers
                    </label>
                    <div className="mt-1.5 flex flex-wrap items-center gap-1.5">
                      {(activeScene.requiredSpeakers || []).map((sp) => (
                        <span
                          key={sp}
                          className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-indigo-500/20 text-indigo-200 border border-indigo-500/40"
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
                            className="hover:text-white"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </span>
                      ))}
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
                        placeholder="+ Type speaker & Enter"
                        className="bg-slate-950 border border-slate-700 rounded-full px-3 py-1 text-xs text-white focus:outline-none focus:border-indigo-500 w-44"
                      />
                    </div>
                    <div className="mt-2 flex flex-wrap gap-1">
                      {QUICK_CAST.filter(
                        (c) => !(activeScene.requiredSpeakers || []).includes(c)
                      ).map((c) => (
                        <button
                          key={c}
                          onClick={() =>
                            updateActiveScene({
                              requiredSpeakers: [...(activeScene.requiredSpeakers || []), c],
                            })
                          }
                          className="text-[11px] px-2 py-0.5 rounded bg-slate-950 hover:bg-slate-800 text-slate-400 hover:text-slate-200 border border-slate-800"
                        >
                          + {c}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Mandatory Story Beats + Knowledge Gate */}
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                    <div className="space-y-2">
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
                          className="text-xs text-indigo-400 hover:text-indigo-300 inline-flex items-center gap-1"
                        >
                          <Plus className="w-3.5 h-3.5" /> Add Beat
                        </button>
                      </div>
                      <div className="space-y-1.5">
                        {(activeScene.mandatoryBeats || []).map((beat, idx) => (
                          <div key={idx} className="flex items-center gap-1.5">
                            <span className="text-[11px] font-mono text-slate-500 w-5">
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
                              placeholder="Required plot or character beat..."
                              className="flex-1 bg-slate-950 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs sm:text-sm text-slate-200 focus:outline-none focus:border-indigo-500"
                            />
                            <button
                              onClick={() => {
                                const next = activeScene.mandatoryBeats.filter((_, i) => i !== idx);
                                updateActiveScene({ mandatoryBeats: next.length ? next : [''] });
                              }}
                              className="p-1 text-slate-500 hover:text-rose-400"
                            >
                              <X className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <label className="text-[11px] font-semibold uppercase text-slate-400">
                          Knowledge Gate Carry-In
                        </label>
                        <button
                          onClick={handleAutoPullKnowledgeGate}
                          className="text-xs text-emerald-400 hover:text-emerald-300 inline-flex items-center gap-1"
                        >
                          <RefreshCw className="w-3 h-3" /> Auto-Pull from Prior Scenes
                        </button>
                      </div>
                      <textarea
                        value={activeScene.knowledgeGate}
                        onChange={(e) => updateActiveScene({ knowledgeGate: e.target.value })}
                        rows={4}
                        placeholder="Facts established on-screen so far (prevents characters referencing un-witnessed facts)..."
                        className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2.5 text-xs sm:text-sm text-slate-200 focus:outline-none focus:border-indigo-500"
                      />
                    </div>
                  </div>

                  {/* Segue & Optional Triggers */}
                  <div className="grid grid-cols-1 lg:grid-cols-4 gap-3 pt-2 border-t border-slate-800/80">
                    <div className="lg:col-span-1">
                      <label className="text-[11px] font-semibold uppercase text-slate-400">
                        Exact Physical Segue to Next Scene
                      </label>
                      <input
                        type="text"
                        value={activeScene.physicalSegue}
                        onChange={(e) => updateActiveScene({ physicalSegue: e.target.value })}
                        placeholder="Tom walks out to the dock..."
                        className="mt-1 w-full bg-slate-950 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs sm:text-sm text-slate-200 focus:outline-none focus:border-indigo-500"
                      />
                    </div>
                    <div>
                      <label className="text-[11px] font-semibold uppercase text-slate-400 flex items-center gap-1">
                        <Swords className="w-3 h-3 text-rose-400" /> Combat Encounter
                      </label>
                      <input
                        type="text"
                        value={activeScene.triggers?.combatEncounter || ''}
                        onChange={(e) =>
                          updateActiveScene({
                            triggers: { ...activeScene.triggers, combatEncounter: e.target.value },
                          })
                        }
                        placeholder="Optional boss/encounter"
                        className="mt-1 w-full bg-slate-950 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs sm:text-sm text-slate-200 focus:outline-none focus:border-indigo-500"
                      />
                    </div>
                    <div>
                      <label className="text-[11px] font-semibold uppercase text-slate-400 flex items-center gap-1">
                        <MessageSquare className="w-3 h-3 text-sky-400" /> Text Message Beat
                      </label>
                      <input
                        type="text"
                        value={activeScene.triggers?.textMessageBeat || ''}
                        onChange={(e) =>
                          updateActiveScene({
                            triggers: { ...activeScene.triggers, textMessageBeat: e.target.value },
                          })
                        }
                        placeholder="Optional phone text beat"
                        className="mt-1 w-full bg-slate-950 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs sm:text-sm text-slate-200 focus:outline-none focus:border-indigo-500"
                      />
                    </div>
                    <div>
                      <label className="text-[11px] font-semibold uppercase text-slate-400 flex items-center gap-1">
                        <Maximize2 className="w-3 h-3 text-amber-400" /> Close-Up Screen
                      </label>
                      <input
                        type="text"
                        value={activeScene.triggers?.closeupScreen || ''}
                        onChange={(e) =>
                          updateActiveScene({
                            triggers: { ...activeScene.triggers, closeupScreen: e.target.value },
                          })
                        }
                        placeholder="Optional close-up card"
                        className="mt-1 w-full bg-slate-950 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs sm:text-sm text-slate-200 focus:outline-none focus:border-indigo-500"
                      />
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* PRE-GENERATION CO-WRITING SLIDERS */}
            <div className="bg-slate-900/70 border border-slate-800 rounded-xl overflow-hidden">
              <button
                onClick={() => setSlidersOpen((v) => !v)}
                className="w-full px-4 py-3 flex items-center justify-between bg-slate-900 hover:bg-slate-800/70 transition text-left"
              >
                <div className="flex items-center gap-2.5">
                  <Sliders className="w-4 h-4 text-violet-400" />
                  <span className="text-sm font-semibold text-white">
                    Co-Writing Sliders & Director Overrides
                  </span>
                  <span className="hidden md:inline text-xs text-slate-400">
                    Humor {activeScene.sliders.humorDensity} · Banter {activeScene.sliders.banterSpeed} · Goofy{' '}
                    {activeScene.sliders.groundedVsGoofy} · Warmth {activeScene.sliders.sentimentWarmth} ·{' '}
                    {activeScene.sliders.minLines}–{activeScene.sliders.maxLines} lines
                  </span>
                </div>
                {slidersOpen ? (
                  <ChevronUp className="w-4 h-4 text-slate-400" />
                ) : (
                  <ChevronDown className="w-4 h-4 text-slate-400" />
                )}
              </button>

              {slidersOpen && (
                <div className="p-4 space-y-4 border-t border-slate-800">
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    {[
                      { key: 'humorDensity', label: 'Humor Density / Joke Rate', minL: 'Dry', maxL: 'Dense' },
                      { key: 'banterSpeed', label: 'Banter Speed & Tightness', minL: 'Unhurried', maxL: 'Snappy' },
                      { key: 'groundedVsGoofy', label: 'Grounded vs. Goofy', minL: 'Grounded', maxL: 'Goofy' },
                      { key: 'sentimentWarmth', label: 'Sentiment / Warmth', minL: 'Unsentimental', maxL: 'Warm' },
                    ].map((s) => (
                      <div key={s.key} className="bg-slate-950/70 border border-slate-800 rounded-lg p-3">
                        <div className="flex items-center justify-between mb-1.5">
                          <span className="text-xs font-medium text-slate-200">{s.label}</span>
                          <span className="text-xs font-mono font-bold text-indigo-300 bg-indigo-500/15 px-1.5 py-0.5 rounded">
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
                        <div className="flex justify-between text-[10px] text-slate-500 mt-0.5">
                          <span>{s.minL}</span>
                          <span>{s.maxL}</span>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-start">
                    <div className="lg:col-span-3 bg-slate-950/70 border border-slate-800 rounded-lg p-3">
                      <label className="text-xs font-medium text-slate-200 block mb-2">
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
                          className="w-20 bg-slate-900 border border-slate-700 rounded px-2 py-1 text-sm font-mono text-white text-center"
                        />
                        <span className="text-slate-500 text-xs">to</span>
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
                          className="w-20 bg-slate-900 border border-slate-700 rounded px-2 py-1 text-sm font-mono text-white text-center"
                        />
                      </div>
                    </div>

                    <div className="lg:col-span-5">
                      <label className="text-xs font-medium text-slate-300 block mb-1">
                        Scene-Specific Director Notes (Overrides Reference Defaults)
                      </label>
                      <textarea
                        value={activeScene.sliders.directorNotes}
                        onChange={(e) =>
                          updateActiveScene({
                            sliders: { ...activeScene.sliders, directorNotes: e.target.value },
                          })
                        }
                        rows={2}
                        placeholder="e.g. Give Rose the funniest final button; keep Deedee brisk and practical."
                        className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2.5 text-xs sm:text-sm text-slate-200 focus:outline-none focus:border-indigo-500"
                      />
                    </div>

                    {/* Per-Chapter Banned Words Toggles */}
                    <div className="lg:col-span-4 bg-slate-950/70 border border-slate-800 rounded-lg p-3">
                      <div className="flex items-center justify-between mb-1.5">
                        <span className="text-xs font-medium text-slate-200">
                          Chapter Banned Words
                        </span>
                        <button
                          onClick={() => setSettingsOpen(true)}
                          className="text-[11px] text-indigo-400 hover:text-indigo-300"
                        >
                          Edit List
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
                                  : 'bg-slate-900 text-slate-500 border-slate-700 line-through'
                              }`}
                              title="Click to toggle for this chapter"
                            >
                              {word}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* GENERATION & ACTION TOOLBAR */}
            <div className="flex flex-wrap items-center justify-between gap-3 bg-slate-900/90 border border-slate-800 rounded-xl p-3.5">
              <div className="flex flex-wrap items-center gap-2">
                <button
                  onClick={handleGenerateScene}
                  disabled={Boolean(loadingStatus)}
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white shadow-lg shadow-indigo-900/40 transition"
                >
                  <Sparkles className="w-4 h-4" />
                  Generate Scene
                </button>

                <button
                  onClick={handleSurgicalRegenerate}
                  disabled={Boolean(loadingStatus) || activeScene.lines.length === 0}
                  className="inline-flex items-center gap-2 px-3.5 py-2 rounded-lg text-sm font-semibold bg-violet-600/20 hover:bg-violet-600/30 disabled:opacity-40 text-violet-200 border border-violet-500/40 transition"
                >
                  <Zap className="w-4 h-4 text-violet-400" />
                  Surgical Regenerate{' '}
                  {flaggedCount > 0 ? `(${flaggedCount} Flagged)` : '(Unlocked)'}
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
                  className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700"
                >
                  <Plus className="w-3.5 h-3.5" /> Add Line
                </button>
              </div>

              {/* Scene Version History Dropdown */}
              <div className="flex items-center gap-2">
                <History className="w-4 h-4 text-slate-400" />
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
                    showToast(`Restored snapshot "${snap.label}" (${snap.timestamp}).`);
                  }}
                  className="bg-slate-950 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-slate-300 focus:outline-none focus:border-indigo-500"
                >
                  <option value="">
                    Version History ({(activeScene.history || []).length})
                  </option>
                  {(activeScene.history || []).map((h) => (
                    <option key={h.id} value={h.id}>
                      {h.timestamp} — {h.label} ({h.lines.length}L)
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* INTERACTIVE LINE CARDS */}
            <div className="space-y-3">
              {activeScene.lines.length === 0 ? (
                <div className="bg-slate-900/50 border border-dashed border-slate-800 rounded-xl p-10 text-center">
                  <Clapperboard className="w-8 h-8 text-slate-600 mx-auto mb-2" />
                  <p className="text-sm text-slate-300 font-medium">No lines in this scene yet.</p>
                  <p className="text-xs text-slate-500 mt-1">
                    Configure your Blueprint & Sliders above, then click <strong>Generate Scene</strong> or <strong>Add Line</strong>.
                  </p>
                </div>
              ) : (
                activeScene.lines.map((line, idx) => {
                  const warnings = lintLine(line, activeBannedWords);
                  const charLen = (line.text || '').length;
                  const isHighlighted = highlightedLineIdx === idx;
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
                      className={`rounded-xl border p-3.5 transition ${
                        isHighlighted
                          ? 'bg-indigo-950/40 border-indigo-400 ring-2 ring-indigo-500/30'
                          : line.locked
                          ? 'bg-slate-900/90 border-emerald-500/40'
                          : line.flags.length > 0 || line.customNote.trim()
                          ? 'bg-slate-900/80 border-amber-500/40'
                          : 'bg-slate-900/60 border-slate-800'
                      }`}
                    >
                      {/* Top Row of Line Card */}
                      <div className="flex flex-wrap items-center justify-between gap-2 mb-2.5">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="font-mono text-xs font-bold px-2 py-0.5 rounded bg-slate-800 text-indigo-300">
                            L{idx + 1}
                          </span>

                          {/* Item Type */}
                          <select
                            value={line.type}
                            onChange={(e) => updateLine(line.id, { type: e.target.value })}
                            className="bg-slate-950 border border-slate-700 rounded-md px-2 py-1 text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
                          >
                            {ITEM_TYPES.map((t) => (
                              <option key={t.value} value={t.value}>
                                {t.label}
                              </option>
                            ))}
                          </select>

                          {/* Speaker Input */}
                          <input
                            type="text"
                            list="aot-cast-datalist"
                            value={line.speaker}
                            onChange={(e) => updateLine(line.id, { speaker: e.target.value })}
                            placeholder="Speaker"
                            className="w-32 bg-slate-950 border border-slate-700 rounded-md px-2 py-1 text-xs font-semibold text-white focus:outline-none focus:border-indigo-500"
                          />

                          {/* Mood / Pose Dropdown */}
                          <select
                            value={line.mood || 'none'}
                            onChange={(e) => updateLine(line.id, { mood: e.target.value })}
                            className="bg-slate-950 border border-slate-700 rounded-md px-2 py-1 text-xs text-slate-300 focus:outline-none focus:border-indigo-500"
                          >
                            <option value="none">mood/pose: none</option>
                            <optgroup label="Moods (8)">
                              {VALID_MOODS.map((m) => (
                                <option key={m} value={m}>
                                  {m}
                                </option>
                              ))}
                            </optgroup>
                            <optgroup label="Talking Poses (4)">
                              {VALID_POSES.map((p) => (
                                <option key={p} value={p}>
                                  {p}
                                </option>
                              ))}
                            </optgroup>
                          </select>

                          {/* Live Char Meter */}
                          <span
                            className={`text-[11px] font-mono px-2 py-0.5 rounded ${charBadgeColor}`}
                            title="Dialogue box target: 35–115 chars"
                          >
                            {charLen} ch
                          </span>
                        </div>

                        {/* Card Controls */}
                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => updateLine(line.id, { locked: !line.locked })}
                            className={`inline-flex items-center gap-1 px-2 py-1 rounded-md text-xs font-medium border transition ${
                              line.locked
                                ? 'bg-emerald-500/15 text-emerald-300 border-emerald-500/40'
                                : 'bg-slate-950 text-slate-400 border-slate-800 hover:text-slate-200'
                            }`}
                            title="Lock line so Surgical Regenerate keeps it verbatim"
                          >
                            {line.locked ? (
                              <>
                                <Lock className="w-3 h-3" /> Locked
                              </>
                            ) : (
                              <>
                                <Unlock className="w-3 h-3" /> Lock
                              </>
                            )}
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
                            <Plus className="w-3.5 h-3.5" />
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
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>

                      {/* Editable Line Text */}
                      <textarea
                        value={line.text}
                        onChange={(e) => updateLine(line.id, { text: e.target.value })}
                        rows={2}
                        placeholder="Write dialogue or action..."
                        className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm text-slate-100 leading-relaxed focus:outline-none focus:border-indigo-500 resize-y"
                      />

                      {/* Automatic Client-Side Linter Badges */}
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

                      {/* Per-Line Feedback Flags + Custom Feedback Note */}
                      <div className="mt-2.5 pt-2.5 border-t border-slate-800/70 space-y-2">
                        <div className="flex flex-wrap items-center gap-1.5">
                          <span className="text-[10px] uppercase tracking-wider text-slate-500 flex items-center gap-1 mr-1">
                            <Flag className="w-3 h-3" /> Flags:
                          </span>
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
                                className={`text-[11px] px-2 py-0.5 rounded-full border transition ${
                                  selected
                                    ? 'bg-amber-500/20 text-amber-200 border-amber-400/50 font-medium'
                                    : 'bg-slate-950 text-slate-500 border-slate-800 hover:text-slate-300 hover:border-slate-700'
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
                          onChange={(e) => updateLine(line.id, { customNote: e.target.value })}
                          placeholder="Custom feedback note for Surgical Regenerate (e.g. 'Make Grace drier here')..."
                          className="w-full bg-slate-950/70 border border-slate-800 rounded-md px-2.5 py-1 text-xs text-slate-300 placeholder:text-slate-600 focus:outline-none focus:border-amber-500/50"
                        />
                      </div>
                    </div>
                  );
                })
              )}
            </div>

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
            {/* Audit Control Header */}
            <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-4 flex flex-wrap items-center justify-between gap-4">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <h2 className="text-base font-semibold text-white">
                    Dual Narrative Checkers
                  </h2>
                  <span className="text-xs font-mono px-2 py-0.5 rounded bg-slate-800 text-indigo-300">
                    Audit Model: {auditModelId || 'Not set'}
                  </span>
                </div>
                <p className="text-xs text-slate-400">
                  Auditing <strong>{activeChapter.label}: {activeChapter.title}</strong> ({activeChapter.scenes.length} scene
                  {activeChapter.scenes.length === 1 ? '' : 's'}). Click any Issue Card to jump straight to that scene & line.
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
                      {ch.label}: {ch.title}
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

            {/* Two-Column Audit Reports */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
              {/* LEFT: CHAPTER TRAJECTORY CHECKER */}
              <div className="bg-slate-900/70 border border-slate-800 rounded-xl p-4 space-y-4">
                <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                  <div>
                    <h3 className="text-sm font-bold text-white flex items-center gap-2">
                      <ShieldCheck className="w-4 h-4 text-indigo-400" />
                      Chapter Trajectory Scorecard
                    </h3>
                    {activeTrajectoryReport && (
                      <p className="text-[11px] text-slate-500 mt-0.5">
                        Ran at {activeTrajectoryReport.ranAt} · {activeTrajectoryReport.model}
                      </p>
                    )}
                  </div>
                  {activeTrajectoryReport && (
                    <StatusBadge status={activeTrajectoryReport.overallStatus} />
                  )}
                </div>

                {!activeTrajectoryReport ? (
                  <div className="py-12 text-center text-slate-500 text-xs">
                    Click <strong>Chapter Trajectory Checker</strong> to audit pacing, comedy rhythm, beat coverage, and physical segues.
                  </div>
                ) : (
                  <div className="space-y-4">
                    <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                      {activeTrajectoryReport.summary}
                    </p>

                    {/* Scores */}
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

                    {/* Beat Coverage */}
                    {activeTrajectoryReport.beatCoverage?.length > 0 && (
                      <div>
                        <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">
                          Beat Coverage Checklist
                        </h4>
                        <div className="space-y-1.5">
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
                      </div>
                    )}

                    {/* Physical Segue Audit */}
                    {activeTrajectoryReport.physicalSegueAudit?.length > 0 && (
                      <div>
                        <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">
                          Physical Segue Audit
                        </h4>
                        <div className="space-y-1.5">
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
                      </div>
                    )}

                    {/* Clickable Issue Cards */}
                    <div>
                      <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">
                        Issue Cards ({activeTrajectoryReport.issues?.length || 0})
                      </h4>
                      {activeTrajectoryReport.issues?.length === 0 ? (
                        <p className="text-xs text-emerald-400">No trajectory issues flagged.</p>
                      ) : (
                        <div className="space-y-2">
                          {activeTrajectoryReport.issues.map((iss, i) => (
                            <button
                              key={i}
                              onClick={() => handleJumpToIssue(iss.sceneId, iss.lineNumber)}
                              className="w-full text-left bg-slate-950 hover:bg-slate-800/80 border border-slate-800 hover:border-indigo-500/50 rounded-lg p-3 transition group"
                            >
                              <div className="flex items-center justify-between gap-2 mb-1">
                                <div className="flex items-center gap-2">
                                  <span className="font-mono text-xs font-bold text-indigo-300">
                                    {iss.sceneId}
                                    {iss.lineNumber > 0 ? ` · L${iss.lineNumber}` : ''}
                                  </span>
                                  <span
                                    className={`text-[10px] uppercase font-semibold px-1.5 py-0.5 rounded ${
                                      iss.severity === 'high'
                                        ? 'bg-rose-500/20 text-rose-300'
                                        : iss.severity === 'medium'
                                        ? 'bg-amber-500/20 text-amber-300'
                                        : 'bg-slate-800 text-slate-400'
                                    }`}
                                  >
                                    {iss.severity}
                                  </span>
                                </div>
                                <span className="text-[11px] text-indigo-400 opacity-70 group-hover:opacity-100 inline-flex items-center gap-1">
                                  Jump <ExternalLink className="w-3 h-3" />
                                </span>
                              </div>
                              <p className="text-xs text-slate-200 font-medium">{iss.problem}</p>
                              <p className="text-xs text-emerald-300/90 mt-1">
                                Fix: {iss.suggestedFix}
                              </p>
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* RIGHT: OVERALL STORYLINE CHECKER */}
              <div className="bg-slate-900/70 border border-slate-800 rounded-xl p-4 space-y-4">
                <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                  <div>
                    <h3 className="text-sm font-bold text-white flex items-center gap-2">
                      <Compass className="w-4 h-4 text-violet-400" />
                      Overall Storyline & Canon Continuity
                    </h3>
                    {activeStorylineReport && (
                      <p className="text-[11px] text-slate-500 mt-0.5">
                        Ran at {activeStorylineReport.ranAt} · {activeStorylineReport.model}
                      </p>
                    )}
                  </div>
                  {activeStorylineReport && (
                    <StatusBadge status={activeStorylineReport.overallStatus} />
                  )}
                </div>

                {!activeStorylineReport ? (
                  <div className="py-12 text-center text-slate-500 text-xs">
                    Click <strong>Overall Storyline Checker</strong> to audit plot alignment, orange-block/camera mystery integrity, cast knowledge gates, and character voices against your Reference Vault.
                  </div>
                ) : (
                  <div className="space-y-4">
                    <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                      {activeStorylineReport.summary}
                    </p>

                    {/* 4 Pillars */}
                    <div className="space-y-2.5">
                      {[
                        {
                          title: 'Overarching Storyline Alignment',
                          data: activeStorylineReport.storylineAlignment,
                        },
                        {
                          title: 'Mystery & Scaling Rule Integrity',
                          data: activeStorylineReport.mysteryScalingIntegrity,
                        },
                        {
                          title: 'Cast Knowledge Gates',
                          data: activeStorylineReport.castKnowledgeGates,
                        },
                        {
                          title: 'Character Voice & Arc Consistency',
                          data: activeStorylineReport.characterVoiceArc,
                        },
                      ].map((pillar, i) => (
                        <div
                          key={i}
                          className="bg-slate-950/80 border border-slate-800 rounded-lg p-3"
                        >
                          <div className="flex items-center justify-between gap-2 mb-1">
                            <span className="text-xs font-semibold text-white">{pillar.title}</span>
                            <StatusBadge status={pillar.data?.status} />
                          </div>
                          <p className="text-xs text-slate-300 leading-relaxed">
                            {pillar.data?.analysis}
                          </p>
                        </div>
                      ))}
                    </div>

                    {/* Clickable Issue Cards */}
                    <div>
                      <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">
                        Macro-Continuity Issues ({activeStorylineReport.issues?.length || 0})
                      </h4>
                      {activeStorylineReport.issues?.length === 0 ? (
                        <p className="text-xs text-emerald-400">No canon or continuity breaks found.</p>
                      ) : (
                        <div className="space-y-2">
                          {activeStorylineReport.issues.map((iss, i) => (
                            <button
                              key={i}
                              onClick={() => handleJumpToIssue(iss.sceneId, iss.lineNumber)}
                              className="w-full text-left bg-slate-950 hover:bg-slate-800/80 border border-slate-800 hover:border-violet-500/50 rounded-lg p-3 transition group"
                            >
                              <div className="flex items-center justify-between gap-2 mb-1">
                                <div className="flex items-center gap-2 flex-wrap">
                                  <span className="font-mono text-xs font-bold text-violet-300">
                                    {iss.sceneId}
                                    {iss.lineNumber > 0 ? ` · L${iss.lineNumber}` : ''}
                                  </span>
                                  <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-800 text-slate-300">
                                    {iss.category}
                                  </span>
                                  <span
                                    className={`text-[10px] uppercase font-semibold px-1.5 py-0.5 rounded ${
                                      iss.severity === 'high'
                                        ? 'bg-rose-500/20 text-rose-300'
                                        : iss.severity === 'medium'
                                        ? 'bg-amber-500/20 text-amber-300'
                                        : 'bg-slate-800 text-slate-400'
                                    }`}
                                  >
                                    {iss.severity}
                                  </span>
                                </div>
                                <span className="text-[11px] text-violet-400 opacity-70 group-hover:opacity-100 inline-flex items-center gap-1">
                                  Jump <ExternalLink className="w-3 h-3" />
                                </span>
                              </div>
                              <p className="text-xs text-slate-200 font-medium">{iss.problem}</p>
                              <p className="text-xs text-emerald-300/90 mt-1">
                                Fix: {iss.suggestedFix}
                              </p>
                            </button>
                          ))}
                        </div>
                      )}
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
                    <option value="scene">Current Scene ({activeScene?.sceneId})</option>
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
              <pre className="p-4 text-xs sm:text-sm font-mono text-slate-200 overflow-x-auto max-h-[600px] overflow-y-auto whitespace-pre-wrap leading-relaxed">
                {exportOutput}
              </pre>
            </div>
          </div>
        )}
      </main>

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
              {/* Gemini API Key */}
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
                <p className="text-[11px] text-slate-500 mt-1">
                  Calls go directly from your browser to generativelanguage.googleapis.com.
                </p>
              </div>

              {/* Generation Model */}
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
                    placeholder="Enter exact Gemini model ID (e.g. gemini-2.5-pro-preview-06-05)"
                    className="w-full bg-slate-950 border border-indigo-500/50 rounded-lg px-3 py-2 text-xs font-mono text-indigo-200 focus:outline-none focus:border-indigo-400"
                  />
                )}
              </div>

              {/* Checker / Audit Model */}
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
                    className="w-full bg-slate-950 border border-violet-500/50 rounded-lg px-3 py-2 text-xs font-mono text-violet-200 focus:outline-none focus:border-violet-400"
                  />
                )}
              </div>

              {/* Test Connection */}
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

              {/* Configurable Banned Words */}
              <div className="pt-4 border-t border-slate-800 space-y-2.5">
                <label className="text-xs font-semibold uppercase tracking-wider text-slate-400 block">
                  Global Banned Words (Toggleable Per Chapter in Scene Studio)
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
                        className="hover:text-white"
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
                    placeholder="Add banned word or phrase..."
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
                className="px-3.5 py-1.5 rounded-lg text-xs font-semibold bg-rose-600 hover:bg-rose-500 text-white"
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