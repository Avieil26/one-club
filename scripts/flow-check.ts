import { seedDatabase } from '../lib/seed';
import * as logic from '../lib/logic';
import { buildStrategies, DEFAULT_ITEM_SCORES } from '../lib/sbcCalculator';
import { toSnapshot } from '../lib/snapshot';
import { featuredSquads, pendingCount } from '../lib/selectors';
import { commentVisibility } from '../lib/moderation';

function assert(condition: boolean, message: string) {
  if (!condition) throw new Error(message);
}

const db = seedDatabase();
db.sessionUserId = 'noam';
logic.submitCareer(db, {
  challengeId: 'ch-debut',
  playerOrClubName: 'דניאל',
  note: 'שער במחזור השני',
  imageUris: ['placeholder'],
});
const noamSub = db.careerSubmissions[0];
assert(noamSub.status === 'pending', 'new player stays pending');

db.sessionUserId = 'admin';
logic.moderateCareer(db, noamSub.id, 'approved');
assert(db.careerSubmissions[0].status === 'approved', 'admin approves');
assert(db.profiles.find((profile) => profile.id === 'noam')?.approvedCount === 2, 'approval count grows');

db.sessionUserId = 'maya';
const before = db.profiles.find((profile) => profile.id === 'maya')?.approvedCount ?? 0;
logic.submitCareer(db, {
  challengeId: 'ch-debut',
  playerOrClubName: 'נועה',
  note: 'עוד שער',
  imageUris: ['placeholder'],
});
assert(db.careerSubmissions[0].status === 'approved', 'trusted player publishes immediately');
assert((db.profiles.find((profile) => profile.id === 'maya')?.approvedCount ?? 0) === before + 1, 'trusted count grows');

db.sessionUserId = 'noam';
const held = logic.addComment(db, {
  targetType: 'fut_post',
  targetId: 'fut-maya-squad',
  preset: null,
  body: 'איזה מטומטם הרכב',
});
assert(held, 'insult is held');
assert(db.comments[0].status === 'hidden_pending', 'held comment is not visible');

db.sessionUserId = 'maya';
logic.reportComment(db, 'cmt-1');
assert(db.comments.find((comment) => comment.id === 'cmt-1')?.status === 'hidden_pending', 'report hides comment');

const strategies = buildStrategies(400, 75, DEFAULT_ITEM_SCORES);
assert(strategies.length >= 3, 'calculator returns strategies');
assert(strategies.every((strategy) => strategy.totalScore >= 400), 'strategies meet the target');

const snap = toSnapshot(db, 'local');
assert(snap.user?.id === 'maya', 'snapshot user');
const admin = db.profiles.find((profile) => profile.id === 'admin');
assert(admin !== undefined, 'admin exists');
db.sessionUserId = 'admin';
const adminSnap = toSnapshot(db, 'local');
assert(pendingCount(adminSnap) >= 1, 'admin sees the level screenshot in the queue');
const featured = featuredSquads(db.futPosts, db.futRatings);
assert(featured[0]?.post.id === 'fut-maya-squad', 'weekly squad is the higher rating');
assert(commentVisibility('יפה מאוד') === 'visible', 'clean comment stays visible');

console.log('flow checks passed');
