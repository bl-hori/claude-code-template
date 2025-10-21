import { UserProgress } from '../src/user-progress';

describe('UserProgress - XP and Level System', () => {
  describe('XP Tracking', () => {
    test('new user starts with 0 XP', () => {
      const user = new UserProgress('user-123');
      expect(user.getXP()).toBe(0);
    });

    test('adding XP increases total', () => {
      const user = new UserProgress('user-123');
      user.addXP(10);
      expect(user.getXP()).toBe(10);
    });

    test('adding XP multiple times accumulates', () => {
      const user = new UserProgress('user-123');
      user.addXP(10);
      user.addXP(25);
      user.addXP(5);
      expect(user.getXP()).toBe(40);
    });

    test('cannot add negative XP', () => {
      const user = new UserProgress('user-123');
      expect(() => user.addXP(-10)).toThrow('XP must be positive');
    });
  });

  describe('Level System', () => {
    test('new user starts at level 1', () => {
      const user = new UserProgress('user-123');
      expect(user.getLevel()).toBe(1);
    });

    test('user levels up at 100 XP', () => {
      const user = new UserProgress('user-123');
      user.addXP(100);
      expect(user.getLevel()).toBe(2);
    });

    test('user reaches level 3 at 250 XP', () => {
      const user = new UserProgress('user-123');
      user.addXP(250);
      expect(user.getLevel()).toBe(3);
    });

    test('user reaches level 4 at 500 XP', () => {
      const user = new UserProgress('user-123');
      user.addXP(500);
      expect(user.getLevel()).toBe(4);
    });

    test('addXP returns true when user levels up', () => {
      const user = new UserProgress('user-123');
      user.addXP(50);
      const leveledUp = user.addXP(50);
      expect(leveledUp).toBe(true);
    });

    test('addXP returns false when user does not level up', () => {
      const user = new UserProgress('user-123');
      const leveledUp = user.addXP(50);
      expect(leveledUp).toBe(false);
    });
  });

  describe('Streak System', () => {
    test('new user has 0 day streak', () => {
      const user = new UserProgress('user-123');
      expect(user.getStreak()).toBe(0);
    });

    test('completing activity starts streak at 1', () => {
      const user = new UserProgress('user-123');
      user.recordActivity();
      expect(user.getStreak()).toBe(1);
    });

    test('activity on consecutive days increases streak', () => {
      const user = new UserProgress('user-123');
      const today = new Date('2024-01-01');
      const tomorrow = new Date('2024-01-02');

      user.recordActivity(today);
      user.recordActivity(tomorrow);
      expect(user.getStreak()).toBe(2);
    });

    test('multiple activities on same day do not increase streak', () => {
      const user = new UserProgress('user-123');
      const today = new Date('2024-01-01');

      user.recordActivity(today);
      user.recordActivity(today);
      expect(user.getStreak()).toBe(1);
    });

    test('streak breaks after missing a day', () => {
      const user = new UserProgress('user-123');
      const day1 = new Date('2024-01-01');
      const day3 = new Date('2024-01-03');

      user.recordActivity(day1);
      user.recordActivity(day3);
      expect(user.getStreak()).toBe(1);
    });

    test('streak resets to 1 after break', () => {
      const user = new UserProgress('user-123');
      const day1 = new Date('2024-01-01');
      const day2 = new Date('2024-01-02');
      const day4 = new Date('2024-01-04');

      user.recordActivity(day1);
      user.recordActivity(day2);
      expect(user.getStreak()).toBe(2);

      user.recordActivity(day4);
      expect(user.getStreak()).toBe(1);
    });
  });

  describe('Completed Lessons', () => {
    test('new user has no completed lessons', () => {
      const user = new UserProgress('user-123');
      expect(user.getCompletedLessons()).toEqual([]);
    });

    test('can mark lesson as completed', () => {
      const user = new UserProgress('user-123');
      user.completeLesson('lesson-1');
      expect(user.getCompletedLessons()).toContain('lesson-1');
    });

    test('can complete multiple lessons', () => {
      const user = new UserProgress('user-123');
      user.completeLesson('lesson-1');
      user.completeLesson('lesson-2');
      user.completeLesson('lesson-3');
      expect(user.getCompletedLessons()).toEqual([
        'lesson-1',
        'lesson-2',
        'lesson-3',
      ]);
    });

    test('completing same lesson twice does not duplicate', () => {
      const user = new UserProgress('user-123');
      user.completeLesson('lesson-1');
      user.completeLesson('lesson-1');
      expect(user.getCompletedLessons()).toEqual(['lesson-1']);
    });

    test('can check if specific lesson is completed', () => {
      const user = new UserProgress('user-123');
      user.completeLesson('lesson-1');
      expect(user.isLessonCompleted('lesson-1')).toBe(true);
      expect(user.isLessonCompleted('lesson-2')).toBe(false);
    });
  });
});
