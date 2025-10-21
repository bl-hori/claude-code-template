import {
  Achievement,
  AchievementTracker,
  ComboSystem,
  EnergySystem,
} from '../src/gamification';

describe('Gamification - Achievement System', () => {
  test('creates achievement with criteria', () => {
    const achievement = new Achievement(
      'first-lesson',
      'First Steps',
      'Complete your first lesson',
      'bronze'
    );

    expect(achievement.getId()).toBe('first-lesson');
    expect(achievement.getName()).toBe('First Steps');
    expect(achievement.getTier()).toBe('bronze');
  });

  test('achievement starts as not unlocked', () => {
    const achievement = new Achievement(
      'first-lesson',
      'First Steps',
      'Complete your first lesson',
      'bronze'
    );

    expect(achievement.isUnlocked()).toBe(false);
  });

  test('can unlock achievement', () => {
    const achievement = new Achievement(
      'first-lesson',
      'First Steps',
      'Complete your first lesson',
      'bronze'
    );

    achievement.unlock();
    expect(achievement.isUnlocked()).toBe(true);
  });

  test('achievement tracks unlock timestamp', () => {
    const achievement = new Achievement(
      'first-lesson',
      'First Steps',
      'Complete your first lesson',
      'bronze'
    );

    const before = Date.now();
    achievement.unlock();
    const after = Date.now();

    const unlockTime = achievement.getUnlockedAt();
    expect(unlockTime).toBeGreaterThanOrEqual(before);
    expect(unlockTime).toBeLessThanOrEqual(after);
  });
});

describe('Gamification - Achievement Tracker', () => {
  test('tracks user achievements', () => {
    const tracker = new AchievementTracker('user-123');
    expect(tracker.getUnlockedAchievements()).toEqual([]);
  });

  test('unlocks achievement when criteria met', () => {
    const tracker = new AchievementTracker('user-123');

    tracker.checkLessonCompletion(1);
    const unlocked = tracker.getUnlockedAchievements();

    expect(unlocked).toContainEqual(
      expect.objectContaining({
        id: 'first-lesson',
        name: 'First Steps',
      })
    );
  });

  test('unlocks streak achievements', () => {
    const tracker = new AchievementTracker('user-123');

    tracker.checkStreak(7);
    const unlocked = tracker.getUnlockedAchievements();

    expect(unlocked).toContainEqual(
      expect.objectContaining({
        id: 'week-streak',
        name: 'Week Warrior',
      })
    );
  });

  test('does not unlock same achievement twice', () => {
    const tracker = new AchievementTracker('user-123');

    tracker.checkLessonCompletion(1);
    tracker.checkLessonCompletion(2);

    const unlocked = tracker.getUnlockedAchievements();
    const firstLessonAchievements = unlocked.filter(
      (a: { id: string }) => a.id === 'first-lesson'
    );

    expect(firstLessonAchievements).toHaveLength(1);
  });

  test('unlocks multiple tier achievements', () => {
    const tracker = new AchievementTracker('user-123');

    tracker.checkLessonCompletion(10);
    const unlocked = tracker.getUnlockedAchievements();

    expect(unlocked.length).toBeGreaterThan(1);
  });
});

describe('Gamification - Combo System', () => {
  test('starts with no combo', () => {
    const combo = new ComboSystem();
    expect(combo.getCurrentCombo()).toBe(0);
  });

  test('increases combo on correct answer', () => {
    const combo = new ComboSystem();

    combo.recordAnswer(true);
    expect(combo.getCurrentCombo()).toBe(1);

    combo.recordAnswer(true);
    expect(combo.getCurrentCombo()).toBe(2);
  });

  test('resets combo on incorrect answer', () => {
    const combo = new ComboSystem();

    combo.recordAnswer(true);
    combo.recordAnswer(true);
    combo.recordAnswer(false);

    expect(combo.getCurrentCombo()).toBe(0);
  });

  test('tracks highest combo achieved', () => {
    const combo = new ComboSystem();

    combo.recordAnswer(true);
    combo.recordAnswer(true);
    combo.recordAnswer(true);
    expect(combo.getHighestCombo()).toBe(3);

    combo.recordAnswer(false);
    expect(combo.getHighestCombo()).toBe(3);
  });

  test('applies multiplier at combo milestones', () => {
    const combo = new ComboSystem();

    expect(combo.getMultiplier()).toBe(1.0);

    combo.recordAnswer(true);
    combo.recordAnswer(true);
    combo.recordAnswer(true);
    expect(combo.getMultiplier()).toBe(1.5);

    combo.recordAnswer(true);
    combo.recordAnswer(true);
    expect(combo.getMultiplier()).toBe(2.0);
  });

  test('calculates points with multiplier', () => {
    const combo = new ComboSystem();

    combo.recordAnswer(true);
    combo.recordAnswer(true);
    combo.recordAnswer(true);

    const points = combo.calculatePoints(10);
    expect(points).toBe(15);
  });
});

describe('Gamification - Energy System', () => {
  test('starts with full energy', () => {
    const energy = new EnergySystem(5);
    expect(energy.getCurrentEnergy()).toBe(5);
  });

  test('loses energy on incorrect answer', () => {
    const energy = new EnergySystem(5);

    energy.recordAnswer(false);
    expect(energy.getCurrentEnergy()).toBe(4);
  });

  test('does not lose energy on correct answer', () => {
    const energy = new EnergySystem(5);

    energy.recordAnswer(true);
    expect(energy.getCurrentEnergy()).toBe(5);
  });

  test('can run out of energy', () => {
    const energy = new EnergySystem(2);

    energy.recordAnswer(false);
    energy.recordAnswer(false);

    expect(energy.getCurrentEnergy()).toBe(0);
    expect(energy.hasEnergy()).toBe(false);
  });

  test('regenerates energy over time', () => {
    const energy = new EnergySystem(5);

    energy.recordAnswer(false);
    energy.recordAnswer(false);
    expect(energy.getCurrentEnergy()).toBe(3);

    const futureTime = Date.now() + 5 * 60 * 60 * 1000;
    energy.regenerate(futureTime);

    expect(energy.getCurrentEnergy()).toBe(5);
  });

  test('regenerates one energy per hour', () => {
    const energy = new EnergySystem(5);

    energy.recordAnswer(false);
    energy.recordAnswer(false);
    energy.recordAnswer(false);
    expect(energy.getCurrentEnergy()).toBe(2);

    const oneHourLater = Date.now() + 60 * 60 * 1000;
    energy.regenerate(oneHourLater);

    expect(energy.getCurrentEnergy()).toBe(3);
  });

  test('does not regenerate beyond max energy', () => {
    const energy = new EnergySystem(5);

    energy.recordAnswer(false);
    const tenHoursLater = Date.now() + 10 * 60 * 60 * 1000;
    energy.regenerate(tenHoursLater);

    expect(energy.getCurrentEnergy()).toBe(5);
  });

  test('can refill energy instantly', () => {
    const energy = new EnergySystem(5);

    energy.recordAnswer(false);
    energy.recordAnswer(false);
    energy.refill();

    expect(energy.getCurrentEnergy()).toBe(5);
  });
});
