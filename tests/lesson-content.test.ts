import {
  Lesson,
  LessonManager,
  Vocabulary,
  SkillPath,
} from '../src/lesson-content';
import { MultipleChoiceQuestion } from '../src/question-engine';

describe('Lesson Content - Vocabulary', () => {
  test('creates vocabulary item with translations', () => {
    const vocab = new Vocabulary(
      'hello',
      'greeting',
      ['こんにちは', 'ハロー'],
      'A common greeting'
    );

    expect(vocab.getWord()).toBe('hello');
    expect(vocab.getCategory()).toBe('greeting');
    expect(vocab.getTranslations()).toContain('こんにちは');
  });

  test('provides example sentence', () => {
    const vocab = new Vocabulary(
      'hello',
      'greeting',
      ['こんにちは'],
      'A common greeting',
      'Hello, how are you?'
    );

    expect(vocab.getExample()).toBe('Hello, how are you?');
  });

  test('has difficulty level', () => {
    const vocab = new Vocabulary(
      'hello',
      'greeting',
      ['こんにちは'],
      'A common greeting',
      undefined,
      'easy'
    );

    expect(vocab.getDifficulty()).toBe('easy');
  });
});

describe('Lesson Content - Lesson', () => {
  test('creates lesson with metadata', () => {
    const lesson = new Lesson(
      'lesson-1',
      'Greetings Basics',
      'Learn basic greetings',
      'easy'
    );

    expect(lesson.getId()).toBe('lesson-1');
    expect(lesson.getTitle()).toBe('Greetings Basics');
    expect(lesson.getDifficulty()).toBe('easy');
  });

  test('lesson can have questions', () => {
    const lesson = new Lesson(
      'lesson-1',
      'Greetings Basics',
      'Learn basic greetings',
      'easy'
    );

    const question = new MultipleChoiceQuestion(
      'What is hello in Japanese?',
      ['こんにちは', 'さようなら', 'ありがとう'],
      0
    );

    lesson.addQuestion(question);
    expect(lesson.getQuestions()).toHaveLength(1);
  });

  test('lesson has vocabulary list', () => {
    const lesson = new Lesson(
      'lesson-1',
      'Greetings Basics',
      'Learn basic greetings',
      'easy'
    );

    const vocab = new Vocabulary('hello', 'greeting', ['こんにちは']);
    lesson.addVocabulary(vocab);

    expect(lesson.getVocabulary()).toHaveLength(1);
  });

  test('can check if lesson is completed', () => {
    const lesson = new Lesson(
      'lesson-1',
      'Greetings Basics',
      'Learn basic greetings',
      'easy'
    );

    expect(lesson.isCompleted()).toBe(false);
    lesson.markCompleted();
    expect(lesson.isCompleted()).toBe(true);
  });

  test('tracks lesson progress percentage', () => {
    const lesson = new Lesson(
      'lesson-1',
      'Greetings Basics',
      'Learn basic greetings',
      'easy'
    );

    const q1 = new MultipleChoiceQuestion('Q1', ['A', 'B'], 0);
    const q2 = new MultipleChoiceQuestion('Q2', ['A', 'B'], 0);
    lesson.addQuestion(q1);
    lesson.addQuestion(q2);

    expect(lesson.getProgress()).toBe(0);

    lesson.recordQuestionAnswer(0, true);
    expect(lesson.getProgress()).toBe(50);

    lesson.recordQuestionAnswer(1, true);
    expect(lesson.getProgress()).toBe(100);
  });
});

describe('Lesson Content - Skill Path', () => {
  test('creates skill path with lessons', () => {
    const path = new SkillPath(
      'path-1',
      'Basic Communication',
      'Learn essential phrases'
    );

    expect(path.getId()).toBe('path-1');
    expect(path.getName()).toBe('Basic Communication');
  });

  test('lessons are ordered in sequence', () => {
    const path = new SkillPath('path-1', 'Basic', 'Basics');

    const lesson1 = new Lesson('l1', 'Lesson 1', 'First', 'easy');
    const lesson2 = new Lesson('l2', 'Lesson 2', 'Second', 'easy');

    path.addLesson(lesson1);
    path.addLesson(lesson2);

    const lessons = path.getLessons();
    expect(lessons[0].getId()).toBe('l1');
    expect(lessons[1].getId()).toBe('l2');
  });

  test('first lesson is always unlocked', () => {
    const path = new SkillPath('path-1', 'Basic', 'Basics');
    const lesson1 = new Lesson('l1', 'Lesson 1', 'First', 'easy');

    path.addLesson(lesson1);

    expect(path.isLessonUnlocked('l1', [])).toBe(true);
  });

  test('subsequent lessons locked until previous completed', () => {
    const path = new SkillPath('path-1', 'Basic', 'Basics');

    const lesson1 = new Lesson('l1', 'Lesson 1', 'First', 'easy');
    const lesson2 = new Lesson('l2', 'Lesson 2', 'Second', 'easy');

    path.addLesson(lesson1);
    path.addLesson(lesson2);

    expect(path.isLessonUnlocked('l2', [])).toBe(false);
    expect(path.isLessonUnlocked('l2', ['l1'])).toBe(true);
  });

  test('tracks overall skill path progress', () => {
    const path = new SkillPath('path-1', 'Basic', 'Basics');

    const lesson1 = new Lesson('l1', 'Lesson 1', 'First', 'easy');
    const lesson2 = new Lesson('l2', 'Lesson 2', 'Second', 'easy');

    path.addLesson(lesson1);
    path.addLesson(lesson2);

    expect(path.getProgress([])).toBe(0);
    expect(path.getProgress(['l1'])).toBe(50);
    expect(path.getProgress(['l1', 'l2'])).toBe(100);
  });
});

describe('Lesson Content - Lesson Manager', () => {
  test('manages multiple lessons', () => {
    const manager = new LessonManager();

    const lesson1 = new Lesson('l1', 'Lesson 1', 'First', 'easy');
    const lesson2 = new Lesson('l2', 'Lesson 2', 'Second', 'medium');

    manager.addLesson(lesson1);
    manager.addLesson(lesson2);

    expect(manager.getAllLessons()).toHaveLength(2);
  });

  test('retrieves lesson by id', () => {
    const manager = new LessonManager();
    const lesson = new Lesson('l1', 'Lesson 1', 'First', 'easy');

    manager.addLesson(lesson);

    const retrieved = manager.getLessonById('l1');
    expect(retrieved?.getId()).toBe('l1');
  });

  test('filters lessons by difficulty', () => {
    const manager = new LessonManager();

    manager.addLesson(new Lesson('l1', 'Easy 1', 'Desc', 'easy'));
    manager.addLesson(new Lesson('l2', 'Medium 1', 'Desc', 'medium'));
    manager.addLesson(new Lesson('l3', 'Easy 2', 'Desc', 'easy'));

    const easyLessons = manager.getLessonsByDifficulty('easy');
    expect(easyLessons).toHaveLength(2);
  });

  test('organizes lessons into skill paths', () => {
    const manager = new LessonManager();

    const path = new SkillPath('path-1', 'Basics', 'Learn basics');
    manager.addSkillPath(path);

    expect(manager.getAllSkillPaths()).toHaveLength(1);
  });

  test('retrieves skill path by id', () => {
    const manager = new LessonManager();
    const path = new SkillPath('path-1', 'Basics', 'Learn basics');

    manager.addSkillPath(path);

    const retrieved = manager.getSkillPathById('path-1');
    expect(retrieved?.getId()).toBe('path-1');
  });

  test('gets next recommended lesson for user', () => {
    const manager = new LessonManager();

    const path = new SkillPath('path-1', 'Basics', 'Learn basics');
    const lesson1 = new Lesson('l1', 'Lesson 1', 'First', 'easy');
    const lesson2 = new Lesson('l2', 'Lesson 2', 'Second', 'easy');

    path.addLesson(lesson1);
    path.addLesson(lesson2);
    manager.addSkillPath(path);

    const nextLesson = manager.getNextLesson([]);
    expect(nextLesson?.getId()).toBe('l1');

    const nextAfterFirst = manager.getNextLesson(['l1']);
    expect(nextAfterFirst?.getId()).toBe('l2');
  });
});
