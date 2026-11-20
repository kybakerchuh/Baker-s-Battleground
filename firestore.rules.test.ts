// Security specification verification cases for Firestore Security Rules
// Maps each Dirty Dozen attack vector against /users/{userId} and /users/{userId}/games/{gameId}

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
    name: 'Unauthenticated Read/Write',
    targetPath: '/users/userA',
    operation: 'get',
    expectedResult: 'PERMISSION_DENIED',
    description: 'Reject when request.auth is null.'
  },
  {
    id: 2,
    name: 'Unverified Email Token',
    targetPath: '/users/userA',
    operation: 'create',
    expectedResult: 'PERMISSION_DENIED',
    description: 'Reject when request.auth.token.email_verified is false.'
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
    name: 'User Collection List Scraping',
    targetPath: '/users',
    operation: 'list',
    expectedResult: 'PERMISSION_DENIED',
    description: 'Disallow listing /users collection.'
  },
  {
    id: 5,
    name: 'UID Spoofing on Create',
    targetPath: '/users/userA',
    operation: 'create',
    expectedResult: 'PERMISSION_DENIED',
    description: 'Reject when incoming().uid != request.auth.uid.'
  },
  {
    id: 6,
    name: 'Shadow Ghost Field Injection',
    targetPath: '/users/userA',
    operation: 'update',
    expectedResult: 'PERMISSION_DENIED',
    description: 'Reject unallowlisted keys via hasOnly() checks.'
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
    targetPath: '/users/userA',
    operation: 'create',
    expectedResult: 'PERMISSION_DENIED',
    description: 'Reject when createdAt != request.time or updatedAt != request.time.'
  },
  {
    id: 9,
    name: 'ID & String Length Poisoning',
    targetPath: '/users/userA/games/' + 'x'.repeat(200),
    operation: 'create',
    expectedResult: 'PERMISSION_DENIED',
    description: 'Reject IDs > 128 chars or oversized string fields.'
  },
  {
    id: 10,
    name: 'Invalid Counter / Rate Bounds',
    targetPath: '/users/userA',
    operation: 'update',
    expectedResult: 'PERMISSION_DENIED',
    description: 'Reject negative stats, totalCorrect > totalAttempted, or rate > 100.'
  },
  {
    id: 11,
    name: 'Orphan Game Record Create',
    targetPath: '/users/userA/games/game1',
    operation: 'create',
    expectedResult: 'PERMISSION_DENIED',
    description: 'Reject creating game record when parent /users/userA does not exist.'
  },
  {
    id: 12,
    name: 'Immutable Game Log Mutation',
    targetPath: '/users/userA/games/game1',
    operation: 'delete',
    expectedResult: 'PERMISSION_DENIED',
    description: 'Reject updating or deleting historical game records.'
  }
];
