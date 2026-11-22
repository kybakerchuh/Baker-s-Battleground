// Security specification verification cases for Firestore Security Rules
// Covers /users/{userId}, /users/{userId}/games/{gameId}, and /leaderboard/{userId}

export interface DirtyDozenCase {
  id: number;
  name: string;
  targetPath: string;
  operation: 'get' | 'list' | 'create' | 'update' | 'delete';
  expectedResult: 'PERMISSION_DENIED';
  description: string;
}

export const DIRTY_DOZEN_TESTS: DirtyDozenCase[] = [
  {
    id: 1,
    name: 'Unauthenticated Read/Write on Private Profile',
    targetPath: '/users/userA',
    operation: 'get',
    expectedResult: 'PERMISSION_DENIED',
    description: 'Reject when request.auth is null on private /users/{userId}.'
  },
  {
    id: 2,
    name: 'Unverified Email Token',
    targetPath: '/leaderboard/userA',
    operation: 'create',
    expectedResult: 'PERMISSION_DENIED',
    description: 'Reject writes when request.auth.token.email_verified is false.'
  },
  {
    id: 3,
    name: 'Cross-User Get (IDOR)',
    targetPath: '/users/userA/games/game1',
    operation: 'get',
    expectedResult: 'PERMISSION_DENIED',
    description: 'Reject userB reading userA save or game records.'
  },
  {
    id: 4,
    name: 'Private User Collection List Scraping',
    targetPath: '/users',
    operation: 'list',
    expectedResult: 'PERMISSION_DENIED',
    description: 'Disallow listing /users collection.'
  },
  {
    id: 5,
    name: 'Cross-Owner Leaderboard Write / UID Spoofing',
    targetPath: '/leaderboard/userA',
    operation: 'create',
    expectedResult: 'PERMISSION_DENIED',
    description: 'Reject userB writing /leaderboard/userA or incoming().uid != request.auth.uid.'
  },
  {
    id: 6,
    name: 'Shadow Ghost Field & PII Injection',
    targetPath: '/leaderboard/userA',
    operation: 'update',
    expectedResult: 'PERMISSION_DENIED',
    description: 'Reject unexpected or PII fields (email, isAdmin, photoURL) in /leaderboard.'
  },
  {
    id: 7,
    name: 'Immutable Field Tampering',
    targetPath: '/users/userA',
    operation: 'update',
    expectedResult: 'PERMISSION_DENIED',
    description: 'Reject changes to uid or createdAt on update.'
  },
  {
    id: 8,
    name: 'Fake Client Timestamp',
    targetPath: '/leaderboard/userA',
    operation: 'create',
    expectedResult: 'PERMISSION_DENIED',
    description: 'Reject when updatedAt != request.time.'
  },
  {
    id: 9,
    name: 'ID & String Length Poisoning',
    targetPath: '/leaderboard/' + 'x'.repeat(200),
    operation: 'create',
    expectedResult: 'PERMISSION_DENIED',
    description: 'Reject IDs > 128 chars or firstName > 40 chars.'
  },
  {
    id: 10,
    name: 'Invalid / Decreasing Counter Bounds',
    targetPath: '/leaderboard/userA',
    operation: 'update',
    expectedResult: 'PERMISSION_DENIED',
    description: 'Reject negative totalKills, decreasing scores, or totalCorrect > totalAttempted.'
  },
  {
    id: 11,
    name: 'Orphan Game / Leaderboard Create',
    targetPath: '/leaderboard/userA',
    operation: 'create',
    expectedResult: 'PERMISSION_DENIED',
    description: 'Reject creating leaderboard/game doc without parent /users/userA existing.'
  },
  {
    id: 12,
    name: 'Immutable Game Log & Leaderboard Delete',
    targetPath: '/leaderboard/userA',
    operation: 'delete',
    expectedResult: 'PERMISSION_DENIED',
    description: 'Reject deleting leaderboard entries or updating/deleting game records.'
  }
];
