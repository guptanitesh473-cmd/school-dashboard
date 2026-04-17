// Template type definitions (from Bangalore Zone language offering sheet)
// Source: https://docs.google.com/spreadsheets/d/1F8bNOoX0T7ku5yfYWQwruSQwfaRsPJ4yZoykEVnIr9E — "Bangalore Zone" tab
//
// Template determination rules (for G5+):
//   T1: Kannada L1, Hindi L2, French L3   → Hindi L2=App AND French L3=App
//   T2: Hindi L1, Kannada L2, French L3   → Kannada L2=App AND French L3=App
//   T3: Kannada L1, French L2, Hindi L3   → French L2=App AND Hindi L3=App
//   T4: Hindi L1, French L2, Kannada L3   → French L2=App AND Kannada L3=App
//   'bilingual': Kannada+Hindi only, no French

export const TEMPLATE_DEFS = [
  { id: 1, l1: 'Kannada', l2: 'Hindi',   l3: 'French'  },
  { id: 2, l1: 'Hindi',   l2: 'Kannada', l3: 'French'  },
  { id: 3, l1: 'Kannada', l2: 'French',  l3: 'Hindi'   },
  { id: 4, l1: 'Hindi',   l2: 'French',  l3: 'Kannada' },
];

// Each school entry:
//   name     – display name
//   zone     – zone label
//   grades   – ordered array of { range, types }
//              types is number[] (1–4) or ['bilingual']
//              G1–G3 always shown as T1+T2 (both Trilingual programs active, French not yet introduced)

export const TEMPLATE_SCHOOLS = [
  // ─── Blr 2 (Manjula) ───────────────────────────────────────────────────────
  {
    name: 'OIS Mysore Road', zone: 'Blr 2 (Manjula)',
    grades: [
      { range: 'G1–G3',  types: [1, 2] },
      { range: 'G5–G8',  types: [1, 2] },
      { range: 'G9–G10', types: [3, 4] },
    ],
  },
  {
    name: 'OIS Sarjapur', zone: 'Blr 2 (Manjula)',
    grades: [
      { range: 'G1–G3',  types: [1, 2] },
      { range: 'G5',     types: [1, 2] },
      { range: 'G6–G10', types: [1, 2, 3, 4] },
    ],
  },
  {
    name: 'OIS Majestic', zone: 'Blr 2 (Manjula)',
    grades: [
      { range: 'G1–G3',  types: [1, 2] },
      { range: 'G5–G10', types: ['bilingual'] },
    ],
  },
  {
    name: 'OIS Kadugodi', zone: 'Blr 2 (Manjula)',
    grades: [
      { range: 'G1–G3',  types: [1, 2] },
      { range: 'G5–G10', types: [1, 2, 3, 4] },
    ],
  },
  {
    name: 'OIS Whitefield', zone: 'Blr 2 (Manjula)',
    grades: [
      { range: 'G1–G3',  types: [1, 2] },
      { range: 'G6–G8',  types: [1, 2] },
      { range: 'G9–G10', types: ['bilingual'] },
    ],
  },
  {
    name: 'OIS Kengeri', zone: 'Blr 2 (Manjula)',
    grades: [
      { range: 'G1–G3',  types: [1, 2] },
      { range: 'G5–G10', types: ['bilingual'] },
    ],
  },

  // ─── Blr 3 (Sakina) ────────────────────────────────────────────────────────
  {
    name: 'OIS BTM', zone: 'Blr 3 (Sakina)',
    grades: [
      { range: 'G1–G3',  types: [1, 2] },
      { range: 'G5–G7',  types: [1, 2] },
      { range: 'G8',     types: [1, 2, 3, 4] },
      { range: 'G9–G10', types: [3, 4] },
    ],
  },
  {
    name: 'OIS Panathur', zone: 'Blr 3 (Sakina)',
    grades: [
      { range: 'G1–G3',  types: [1, 2] },
      { range: 'G5–G10', types: [1, 2, 3, 4] },
    ],
  },
  {
    name: 'OIS Horamavu', zone: 'Blr 3 (Sakina)',
    grades: [
      { range: 'G1–G3',  types: [1, 2] },
      { range: 'G5–G10', types: [1, 2, 3, 4] },
    ],
  },
  {
    name: 'OIS Haralur', zone: 'Blr 3 (Sakina)',
    grades: [
      { range: 'G1–G3',  types: [1, 2] },
      { range: 'G5–G8',  types: [1, 2, 3, 4] },
      { range: 'G9–G10', types: ['bilingual'] },
    ],
  },
  {
    name: 'OIS Hennur Road', zone: 'Blr 3 (Sakina)',
    grades: [
      { range: 'G1–G3',  types: [1, 2] },
      { range: 'G5–G10', types: [1, 2, 3, 4] },
    ],
  },
  {
    name: 'OIS Jakkur', zone: 'Blr 3 (Sakina)',
    grades: [
      { range: 'G1–G3',  types: [1, 2] },
      { range: 'G5–G8',  types: ['bilingual'] },
    ],
  },

  // ─── Blr 4 (Ranjan) ────────────────────────────────────────────────────────
  {
    name: 'OIS JP Nagar', zone: 'Blr 4 (Ranjan)',
    grades: [
      { range: 'G1–G3',  types: [1, 2] },
      { range: 'G5–G7',  types: [1, 2, 3, 4] },
      { range: 'G8',     types: [1, 2] },
      { range: 'G9–G10', types: ['bilingual'] },
    ],
  },
  {
    name: 'OIS Vijayanagar', zone: 'Blr 4 (Ranjan)',
    grades: [
      { range: 'G1–G3',  types: [1, 2] },
      { range: 'G5–G8',  types: [1, 2, 3, 4] },
      { range: 'G9–G10', types: ['bilingual'] },
    ],
  },
  {
    name: 'OIS Annapoorneshwari Nagar', zone: 'Blr 4 (Ranjan)',
    grades: [
      { range: 'G1–G3',  types: [1, 2] },
      { range: 'G5–G8',  types: [1, 2] },
      { range: 'G9–G10', types: ['bilingual'] },
    ],
  },
  {
    name: 'OIS Bannerghatta', zone: 'Blr 4 (Ranjan)',
    grades: [
      { range: 'G1–G3',  types: [1, 2] },
      { range: 'G5–G10', types: [1, 2] },
    ],
  },
  {
    name: 'OIS Magadi Road', zone: 'Blr 4 (Ranjan)',
    grades: [
      { range: 'G1–G3',  types: [1, 2] },
      { range: 'G5–G10', types: [1, 2, 3, 4] },
    ],
  },
  {
    name: 'OIS Kanakapura Road', zone: 'Blr 4 (Ranjan)',
    grades: [
      { range: 'G1–G3',  types: [1, 2] },
      { range: 'G5–G10', types: [1, 2, 3, 4] },
    ],
  },
  {
    name: 'OIS Kumbalgodu', zone: 'Blr 4 (Ranjan)',
    grades: [
      { range: 'G1–G3',  types: [1, 2] },
      { range: 'G5–G10', types: ['bilingual'] },
    ],
  },

  // ─── Blr 5 (Cebin) ─────────────────────────────────────────────────────────
  {
    name: 'OIS Jalahalli', zone: 'Blr 5 (Cebin)',
    grades: [
      { range: 'G1–G3',  types: [1, 2] },
      { range: 'G5–G10', types: [1, 2, 3, 4] },
    ],
  },
  {
    name: 'OIS Mahalakshmi Layout', zone: 'Blr 5 (Cebin)',
    grades: [
      { range: 'G1–G3',  types: [1, 2] },
      { range: 'G5–G10', types: [1, 2, 3, 4] },
    ],
  },
  {
    name: 'OIS Tumkur', zone: 'Blr 5 (Cebin)',
    grades: [
      { range: 'G1–G3',  types: [1, 2] },
      { range: 'G5–G6',  types: ['bilingual'] },
    ],
  },
  {
    name: 'OIS Dharwad', zone: 'Blr 5 (Cebin)',
    grades: [
      { range: 'G1–G3',  types: [1, 2] },
      { range: 'G5–G10', types: ['bilingual'] },
    ],
  },
  {
    name: 'OIS Hubbali Airport Road', zone: 'Blr 5 (Cebin)',
    grades: [
      { range: 'G1–G3',  types: [1, 2] },
      { range: 'G5–G6',  types: ['bilingual'] },
    ],
  },

  // ─── Blr 7 (Vivek) ─────────────────────────────────────────────────────────
  {
    name: 'OIS CV Raman Nagar', zone: 'Blr 7 (Vivek)',
    grades: [
      { range: 'G1–G3',  types: [1, 2] },
      { range: 'G5–G8',  types: [1, 2] },
      { range: 'G9–G10', types: [3, 4] },
    ],
  },
  {
    name: 'OIS Sahakar Nagar', zone: 'Blr 7 (Vivek)',
    grades: [
      { range: 'G1–G3',  types: [1, 2] },
      { range: 'G5–G10', types: ['bilingual'] },
    ],
  },
  {
    name: 'OIS Yelahanka CBSE Campus', zone: 'Blr 7 (Vivek)',
    grades: [
      { range: 'G1–G3',  types: [1, 2] },
      { range: 'G5–G10', types: [1, 2, 3, 4] },
    ],
  },
  {
    name: 'OIS Rajaji Nagar', zone: 'Blr 7 (Vivek)',
    grades: [
      { range: 'G1–G3',  types: [1, 2] },
      { range: 'G5–G8',  types: [1, 2] },
      { range: 'G9–G10', types: ['bilingual'] },
    ],
  },
  {
    name: 'OIS Makali', zone: 'Blr 7 (Vivek)',
    grades: [
      { range: 'G1–G3',  types: [1, 2] },
      { range: 'G5–G10', types: ['bilingual'] },
    ],
  },
  {
    name: 'OIS Yelahanka ICSE Campus', zone: 'Blr 7 (Vivek)',
    grades: [
      { range: 'G1–G3',  types: [1, 2] },
      { range: 'G5–G10', types: ['bilingual'] },
    ],
  },
  {
    name: 'OIS Hesaraghatta Road', zone: 'Blr 7 (Vivek)',
    grades: [
      { range: 'G1–G3',  types: [1, 2] },
      { range: 'G5–G10', types: ['bilingual'] },
    ],
  },
  {
    name: 'OIS Yelahanka Newtown', zone: 'Blr 7 (Vivek)',
    grades: [
      { range: 'G1–G3',  types: [1, 2] },
      { range: 'G5–G10', types: ['bilingual'] },
    ],
  },

  // ─── Blr 8 (Sandeep) ───────────────────────────────────────────────────────
  {
    name: 'OIS Budigere Cross', zone: 'Blr 8 (Sandeep)',
    grades: [
      { range: 'G1–G3',  types: [1, 2] },
      { range: 'G5–G7',  types: ['bilingual'] },
    ],
  },

  // ─── Sakina (standalone) ───────────────────────────────────────────────────
  {
    name: 'OIS Arekere', zone: 'Sakina',
    grades: [
      { range: 'G1–G3',  types: [1, 2] },
      { range: 'G5–G10', types: ['bilingual'] },
    ],
  },
  {
    name: 'OIS Mahadevpura', zone: 'Sakina',
    grades: [
      { range: 'G1–G3',  types: [1, 2] },
      { range: 'G5–G8',  types: [2] },        // Only T2: Hindi-L1 → Kannada L2 → French L3
    ],
  },
  {
    name: 'OIS HSR', zone: 'Sakina',
    grades: [
      { range: 'G1–G3',  types: [1, 2] },
      { range: 'G5–G10', types: ['bilingual'] },
    ],
  },
  {
    name: 'OIS Marathahalli', zone: 'Sakina',
    grades: [
      { range: 'G1–G3',  types: [1, 2] },
      { range: 'G5–G10', types: ['bilingual'] }, // + Tamil (special offering)
    ],
  },
  {
    name: 'OIS TC Palya / Raisandra', zone: 'Sakina',
    grades: [
      { range: 'G1–G3',  types: [1, 2] },
      { range: 'G5–G8',  types: ['bilingual'] },
    ],
  },
];
