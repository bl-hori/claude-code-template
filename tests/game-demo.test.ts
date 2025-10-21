import { LanguageLearningGame } from '../src/game-demo';

describe('Language Learning Game - Integration', () => {
  test('creates new game instance with initialized content', () => {
    const game = new LanguageLearningGame('user-123');
    const state = game.getGameState();

    expect(state.user.xp).toBe(0);
    expect(state.user.level).toBe(1);
    expect(state.user.streak).toBe(0);
    expect(state.nextLesson).toBe('greetings-1');
  });

  test('complete learning journey from start to finish', () => {
    const game = new LanguageLearningGame('user-123');

    const lesson = game.getLessonManager().getLessonById('greetings-1');
    expect(lesson).toBeDefined();
    expect(lesson?.getQuestions()).toHaveLength(3);

    let result = game.answerQuestion('greetings-1', 0, 'Hello');
    expect(result.result.isCorrect).toBe(true);
    expect(result.result.points).toBeGreaterThan(0);
    expect(result.combo).toBe(1);

    result = game.answerQuestion('greetings-1', 1, 'goodbye');
    expect(result.result.isCorrect).toBe(true);
    expect(result.combo).toBe(2);

    result = game.answerQuestion('greetings-1', 2, 'Hello');
    expect(result.result.isCorrect).toBe(true);
    expect(result.combo).toBe(3);
    expect(result.leveledUp).toBe(false);

    const finalState = game.getGameState();
    expect(finalState.user.completedLessons).toBe(1);
    expect(finalState.user.xp).toBeGreaterThan(0);
    expect(finalState.user.streak).toBe(1);
  });

  test('combo system increases points', () => {
    const game = new LanguageLearningGame('user-123');

    const firstAnswer = game.answerQuestion('greetings-1', 0, 'Hello');
    const firstPoints = firstAnswer.result.points;

    game.answerQuestion('greetings-1', 1, 'goodbye');

    const thirdAnswer = game.answerQuestion('greetings-1', 2, 'Hello');
    const thirdPoints = thirdAnswer.result.points;

    expect(thirdPoints).toBeGreaterThan(firstPoints);
    expect(thirdAnswer.combo).toBe(3);
  });

  test('wrong answer breaks combo and costs energy', () => {
    const game = new LanguageLearningGame('user-123');
    const initialState = game.getGameState();

    game.answerQuestion('greetings-1', 0, 'Hello');
    game.answerQuestion('greetings-1', 1, 'goodbye');

    const wrongAnswer = game.answerQuestion('greetings-1', 2, 'Wrong');
    expect(wrongAnswer.result.isCorrect).toBe(false);
    expect(wrongAnswer.combo).toBe(0);
    expect(wrongAnswer.energy).toBe(initialState.current.energy - 1);
  });

  test('achievements unlock on milestones', () => {
    const game = new LanguageLearningGame('user-123');

    game.answerQuestion('greetings-1', 0, 'Hello');
    game.answerQuestion('greetings-1', 1, 'goodbye');
    const result = game.answerQuestion('greetings-1', 2, 'Hello');

    expect(result.newAchievements).toContain('First Steps');
  });

  test('lessons unlock progressively', () => {
    const game = new LanguageLearningGame('user-123');
    const lessonManager = game.getLessonManager();

    const firstLesson = lessonManager.getLessonById('greetings-1');
    const secondLesson = lessonManager.getLessonById('phrases-1');

    expect(firstLesson).toBeDefined();
    expect(secondLesson).toBeDefined();

    const skillPath = lessonManager.getSkillPathById('beginner');
    expect(skillPath?.isLessonUnlocked('greetings-1', [])).toBe(true);
    expect(skillPath?.isLessonUnlocked('phrases-1', [])).toBe(false);

    game.answerQuestion('greetings-1', 0, 'Hello');
    game.answerQuestion('greetings-1', 1, 'goodbye');
    game.answerQuestion('greetings-1', 2, 'Hello');

    expect(skillPath?.isLessonUnlocked('phrases-1', ['greetings-1'])).toBe(
      true
    );
  });

  test('throws error when out of energy', () => {
    const game = new LanguageLearningGame('user-123');

    for (let i = 0; i < 5; i++) {
      game.answerQuestion('greetings-1', 0, 'Wrong');
    }

    expect(() => {
      game.answerQuestion('greetings-1', 0, 'Hello');
    }).toThrow('No energy remaining');
  });

  test('next lesson updates after completion', () => {
    const game = new LanguageLearningGame('user-123');

    let state = game.getGameState();
    expect(state.nextLesson).toBe('greetings-1');

    game.answerQuestion('greetings-1', 0, 'Hello');
    game.answerQuestion('greetings-1', 1, 'goodbye');
    game.answerQuestion('greetings-1', 2, 'Hello');

    state = game.getGameState();
    expect(state.nextLesson).toBe('phrases-1');
  });
});
