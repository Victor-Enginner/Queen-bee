import test from 'node:test';
import assert from 'node:assert/strict';
import {
  ease,
  lerp,
  lerpAngle,
  clamp,
  targetAt,
  DESKTOP_KEYFRAMES,
  MOBILE_KEYFRAMES,
} from './flightMath';

test('ease curve endpoints and symmetry', () => {
  assert.equal(ease(0), 0);
  assert.equal(ease(1), 1);
  assert.equal(ease(0.5), 0.5);
  assert.ok(ease(0.25) < 0.25, 'cubic ease-in should accelerate slowly');
  assert.ok(ease(0.75) > 0.75, 'cubic ease-out should decelerate slowly');
});

test('lerp correctly blends values', () => {
  assert.equal(lerp(10, 20, 0), 10);
  assert.equal(lerp(10, 20, 1), 20);
  assert.equal(lerp(10, 20, 0.5), 15);
});

test('lerpAngle handles shortest circular path around wrap-around', () => {
  // From 350 to 10 degrees is a +20 deg turn, mid-point should be 0 (or 360)
  const mid1 = lerpAngle(350, 10, 0.5);
  assert.equal((mid1 + 360) % 360, 0);

  // From 10 to 350 degrees is a -20 deg turn, mid-point should be 0
  const mid2 = lerpAngle(10, 350, 0.5);
  assert.equal((mid2 + 360) % 360, 0);

  // Exact endpoints
  assert.equal(lerpAngle(150, 125, 0), 150);
  assert.equal(lerpAngle(150, 125, 1), 125);
});

test('clamp binds within boundaries', () => {
  assert.equal(clamp(-5, 0, 10), 0);
  assert.equal(clamp(15, 0, 10), 10);
  assert.equal(clamp(4, 0, 10), 4);
});

test('targetAt holds position within deadband and moves during transition', () => {
  // At section 0 (hero)
  const hero = targetAt(0, false);
  assert.equal(hero.x, DESKTOP_KEYFRAMES[0].x);
  assert.equal(hero.y, DESKTOP_KEYFRAMES[0].y);
  assert.equal(hero.s, DESKTOP_KEYFRAMES[0].s);
  assert.equal(hero.yaw, DESKTOP_KEYFRAMES[0].yaw);
  assert.equal(hero.moving, 0);

  // During transition deadband (f <= 0.12), bee should stay at initial keyframe
  const deadband = targetAt(0.08, false);
  assert.equal(deadband.x, DESKTOP_KEYFRAMES[0].x);
  assert.equal(deadband.moving, 0);

  // Mid transition (f ~ 0.5), dive should be negative and moving should be positive
  const mid = targetAt(0.5, false);
  assert.ok(mid.moving > 0.8, 'bee should be moving actively mid-transition');
  assert.ok(mid.y < DESKTOP_KEYFRAMES[0].y, 'bee should dive downward mid-transition');

  // Completed transition to section 1
  const s1 = targetAt(1.0, false);
  assert.equal(s1.x, DESKTOP_KEYFRAMES[1].x);
  assert.equal(s1.y, DESKTOP_KEYFRAMES[1].y);
  assert.equal(s1.yaw, DESKTOP_KEYFRAMES[1].yaw);
});

test('targetAt supports mobile keyframes', () => {
  const mHero = targetAt(0, true);
  assert.equal(mHero.x, MOBILE_KEYFRAMES[0].x);
  assert.equal(mHero.y, MOBILE_KEYFRAMES[0].y);
  assert.equal(mHero.s, MOBILE_KEYFRAMES[0].s);
});
