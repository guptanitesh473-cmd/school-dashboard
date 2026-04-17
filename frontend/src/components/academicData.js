// Static data from Google Sheet "Report" subsheet
// Status: 'Y'=Yes, 'N'=No, 'F'=In Future

export const SCHOOLS = [
  { id: 'din',  name: 'OIS Dindigul',           type: 'existing' },
  { id: 'kel',  name: 'OIS Kelambakkam',         type: 'existing' },
  { id: 'ora',  name: 'OIS Oragadam',            type: 'existing' },
  { id: 'thi',  name: 'OIS Thirumudivakkam',     type: 'existing', note: 'Hold' },
  { id: 'tat',  name: 'OIS Tattva',              type: 'existing' },
  { id: 'vm',   name: 'OIS VELS Marathalli',     type: 'existing' },
  { id: 'hsr',  name: 'OIS HSR',                 type: 'existing' },
  { id: 'ark',  name: 'OIS Arkere',              type: 'existing' },
  { id: 'ray',  name: 'OIS Rayasandara',         type: 'existing' },
  { id: 'mah',  name: 'OIS Mahadevpura',         type: 'existing' },
  { id: 'per',  name: 'OIS Perungudi',           type: 'new_building' },
  { id: 'van',  name: 'OIS Vandalur',            type: 'new_building' },
  { id: 'coi',  name: 'OIS Coimbatore',          type: 'new_building' },
  { id: 'hes',  name: 'OIS Hesarghatta',         type: 'existing' },
  { id: 'yel',  name: 'OIS Yelahanka New Town',  type: 'new_building' },
  { id: 'kun',  name: 'OIS Kuntaloor',           type: 'new_building' },
  { id: 'man',  name: 'OIS Manneguda',           type: 'new_building' },
  { id: 'ram',  name: 'OIS Ramamurthynagar',     type: 'existing' },
  { id: 'mahb', name: 'OIS Mahbubnagar',         type: 'new_building' },
  { id: 'dha',  name: 'OCSE Dharwad',            type: 'existing' },
  { id: 'hub',  name: 'OIS Hubli',               type: 'new_building' },
  { id: 'che',  name: 'OIS Cheemasandara',       type: 'new_building' },
  { id: 'bho',  name: 'OIS Bhopal',              type: 'new_building', note: 'Not This Year' },
  { id: 'nag',  name: 'OIS Nagpur',              type: 'new_building' },
];

// Each offering: { name, statuses: [24 values in SCHOOLS order] }
export const CATEGORIES = [
  {
    name: 'Sports Infrastructure',
    color: 'bg-green-600',
    offerings: [
      { name: 'Football Ground',    statuses: ['Y','Y','Y','Y','Y','Y','Y','Y','Y','Y','Y','Y','Y','Y','N','Y','Y','Y','Y','Y','Y','Y','Y','Y'] },
      { name: 'Cricket Ground',     statuses: ['N','Y','N','N','Y','N','Y','N','Y','N','N','N','N','N','Y','Y','N','Y','Y','Y','Y','Y','Y','Y'] },
      { name: 'Basketball Court',   statuses: ['Y','Y','Y','Y','Y','Y','Y','Y','Y','Y','Y','Y','Y','Y','Y','Y','Y','Y','Y','Y','Y','Y','Y','Y'] },
      { name: 'Indoor Sports Area', statuses: ['Y','N','Y','Y','N','Y','Y','N','Y','Y','Y','Y','Y','Y','N','Y','Y','Y','Y','N','N','Y','N','N'] },
      { name: 'Swimming Pool',      statuses: ['Y','N','N','N','Y','Y','Y','N','Y','Y','Y','F','Y','Y','Y','Y','Y','N','Y','Y','Y','Y','Y','N'] },
    ],
  },
  {
    name: 'Academic Infrastructure',
    color: 'bg-blue-600',
    offerings: [
      { name: 'Digital Classrooms', statuses: ['Y','Y','Y','Y','Y','Y','Y','Y','Y','Y','Y','Y','Y','Y','Y','Y','Y','Y','Y','Y','Y','Y','Y','N'] },
      { name: 'Science Lab',        statuses: ['Y','N','N','N','Y','Y','Y','Y','Y','Y','Y','Y','Y','N','Y','Y','Y','Y','Y','Y','Y','Y','Y','F'] },
      { name: 'Math Lab',           statuses: ['N','N','N','Y','Y','Y','Y','N','Y','N','N','N','F','N','N','Y','Y','Y','Y','N','N','Y','N','N'] },
      { name: 'Language Lab',       statuses: ['N','N','F','Y','Y','Y','Y','N','F','N','N','N','F','N','N','Y','Y','Y','Y','Y','N','F','N','N'] },
      { name: 'Chemistry Lab',      statuses: ['Y','Y','Y','Y','Y','N','N','N','N','Y','N','N','N','Y','N','N','N','N','N','N','N','N','N','N'] },
      { name: 'Physics Lab',        statuses: ['Y','Y','Y','Y','Y','N','N','N','N','Y','N','N','N','Y','N','N','N','N','N','N','N','N','N','N'] },
      { name: 'Bio Lab',            statuses: ['Y','Y','Y','Y','Y','N','N','N','N','Y','N','N','N','Y','N','N','N','N','N','N','N','N','N','N'] },
    ],
  },
  {
    name: 'General Facilities',
    color: 'bg-purple-600',
    offerings: [
      { name: 'Library / Reading Room',       statuses: ['Y','Y','Y','Y','Y','Y','Y','Y','Y','Y','Y','Y','Y','Y','Y','Y','Y','Y','Y','Y','Y','Y','Y','Y'] },
      { name: 'Auditorium / Multipurpose Hall',statuses: ['Y','Y','N','Y','Y','Y','Y','N','Y','N','N','Y','Y','N','N','N','N','Y','N','Y','Y','Y','Y','Y'] },
      { name: 'Play Area (Pre-Primary)',       statuses: ['Y','Y','Y','Y','Y','Y','Y','Y','Y','Y','Y','Y','Y','Y','Y','Y','Y','Y','Y','Y','Y','Y','Y','Y'] },
    ],
  },
  {
    name: 'Visual & Performing Arts',
    color: 'bg-pink-600',
    offerings: [
      { name: 'Art & Craft Room',       statuses: ['Y','Y','Y','N','Y','Y','Y','N','Y','N','N','N','Y','N','N','Y','Y','Y','Y','Y','Y','Y','Y','Y'] },
      { name: 'Music Room',             statuses: ['Y','Y','Y','Y','Y','Y','Y','Y','Y','Y','Y','Y','Y','Y','Y','Y','Y','Y','Y','Y','Y','Y','Y','Y'] },
      { name: 'Dance Studio',           statuses: ['Y','Y','Y','Y','Y','Y','Y','Y','Y','Y','Y','Y','Y','Y','Y','Y','Y','Y','Y','Y','Y','Y','Y','Y'] },
      { name: 'Theatre / Drama Room',   statuses: ['Y','Y','Y','Y','Y','Y','Y','Y','Y','Y','Y','Y','Y','Y','Y','Y','Y','Y','Y','Y','Y','Y','Y','Y'] },
      { name: 'Pottery Studio/Textile', statuses: ['Y','Y','Y','N','F','Y','Y','Y','Y','N','Y','Y','Y','N','N','Y','Y','N','Y','N','N','Y','N','N'] },
    ],
  },
  {
    name: 'STEM Infrastructure',
    color: 'bg-orange-600',
    offerings: [
      { name: 'Coding / Robotics Lab',    statuses: ['Y','Y','Y','Y','Y','Y','Y','Y','Y','Y','Y','Y','Y','Y','Y','Y','Y','Y','Y','Y','Y','Y','Y','Y'] },
      { name: 'DIY / Maker Lab',          statuses: ['Y','Y','Y','Y','Y','Y','Y','Y','Y','Y','Y','Y','Y','Y','Y','Y','Y','Y','Y','N','N','Y','N','N'] },
      { name: 'Horticulture Lab/Garden',  statuses: ['Y','Y','Y','Y','Y','Y','F','N','Y','Y','N','Y','Y','N','N','Y','Y','F','Y','Y','Y','F','N','N'] },
      { name: 'Astronomy Lab',            statuses: ['N','N','N','N','N','N','N','N','N','N','N','N','N','N','N','N','N','N','N','N','N','N','N','N'] },
    ],
  },
];
