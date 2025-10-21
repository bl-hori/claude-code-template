import {
  MultipleChoiceQuestion,
  TranslationQuestion,
  FillInBlankQuestion,
} from '../src/question-engine';

describe('Question Engine - Multiple Choice', () => {
  test('creates multiple choice question with correct answer', () => {
    const question = new MultipleChoiceQuestion(
      'What is "hello" in Japanese?',
      ['Konnichiwa', 'Sayonara', 'Arigato', 'Ohayo'],
      0
    );

    expect(question.getText()).toBe('What is "hello" in Japanese?');
    expect(question.getChoices()).toEqual([
      'Konnichiwa',
      'Sayonara',
      'Arigato',
      'Ohayo',
    ]);
  });

  test('validates correct answer', () => {
    const question = new MultipleChoiceQuestion(
      'What is "hello" in Japanese?',
      ['Konnichiwa', 'Sayonara', 'Arigato', 'Ohayo'],
      0
    );

    const result = question.checkAnswer('Konnichiwa');
    expect(result.isCorrect).toBe(true);
    expect(result.feedback).toBe('Correct!');
  });

  test('validates incorrect answer', () => {
    const question = new MultipleChoiceQuestion(
      'What is "hello" in Japanese?',
      ['Konnichiwa', 'Sayonara', 'Arigato', 'Ohayo'],
      0
    );

    const result = question.checkAnswer('Sayonara');
    expect(result.isCorrect).toBe(false);
    expect(result.feedback).toContain('correct answer');
    expect(result.correctAnswer).toBe('Konnichiwa');
  });

  test('answer check is case-insensitive', () => {
    const question = new MultipleChoiceQuestion(
      'What is "hello" in Japanese?',
      ['Konnichiwa', 'Sayonara', 'Arigato', 'Ohayo'],
      0
    );

    const result = question.checkAnswer('konnichiwa');
    expect(result.isCorrect).toBe(true);
  });

  test('awards points for correct answer', () => {
    const question = new MultipleChoiceQuestion(
      'What is "hello" in Japanese?',
      ['Konnichiwa', 'Sayonara', 'Arigato', 'Ohayo'],
      0
    );

    const result = question.checkAnswer('Konnichiwa');
    expect(result.points).toBe(10);
  });

  test('awards bonus points for first try', () => {
    const question = new MultipleChoiceQuestion(
      'What is "hello" in Japanese?',
      ['Konnichiwa', 'Sayonara', 'Arigato', 'Ohayo'],
      0
    );

    const result = question.checkAnswer('Konnichiwa', true);
    expect(result.points).toBe(15);
  });

  test('no points for incorrect answer', () => {
    const question = new MultipleChoiceQuestion(
      'What is "hello" in Japanese?',
      ['Konnichiwa', 'Sayonara', 'Arigato', 'Ohayo'],
      0
    );

    const result = question.checkAnswer('Sayonara');
    expect(result.points).toBe(0);
  });
});

describe('Question Engine - Translation', () => {
  test('creates translation question', () => {
    const question = new TranslationQuestion(
      'Translate: The cat is sleeping',
      'The cat is sleeping',
      ['El gato está durmiendo', 'El gato duerme']
    );

    expect(question.getText()).toBe('Translate: The cat is sleeping');
  });

  test('validates exact match', () => {
    const question = new TranslationQuestion(
      'Translate: The cat is sleeping',
      'The cat is sleeping',
      ['El gato está durmiendo']
    );

    const result = question.checkAnswer('El gato está durmiendo');
    expect(result.isCorrect).toBe(true);
  });

  test('accepts multiple valid translations', () => {
    const question = new TranslationQuestion(
      'Translate: The cat is sleeping',
      'The cat is sleeping',
      ['El gato está durmiendo', 'El gato duerme']
    );

    const result1 = question.checkAnswer('El gato está durmiendo');
    const result2 = question.checkAnswer('El gato duerme');

    expect(result1.isCorrect).toBe(true);
    expect(result2.isCorrect).toBe(true);
  });

  test('ignores case and extra whitespace', () => {
    const question = new TranslationQuestion(
      'Translate: The cat is sleeping',
      'The cat is sleeping',
      ['El gato está durmiendo']
    );

    const result = question.checkAnswer('  el GATO está durmiendo  ');
    expect(result.isCorrect).toBe(true);
  });

  test('provides fuzzy matching for minor typos', () => {
    const question = new TranslationQuestion(
      'Translate: The cat is sleeping',
      'The cat is sleeping',
      ['El gato está durmiendo']
    );

    const result = question.checkAnswer('El gato esta durmiendo');
    expect(result.isCorrect).toBe(true);
    expect(result.feedback).toContain('minor typo');
  });

  test('rejects significantly different answers', () => {
    const question = new TranslationQuestion(
      'Translate: The cat is sleeping',
      'The cat is sleeping',
      ['El gato está durmiendo']
    );

    const result = question.checkAnswer('El perro está corriendo');
    expect(result.isCorrect).toBe(false);
  });
});

describe('Question Engine - Fill in the Blank', () => {
  test('creates fill in blank question', () => {
    const question = new FillInBlankQuestion(
      'I ___ to the store yesterday',
      'went',
      ['went', 'go']
    );

    expect(question.getText()).toBe('I ___ to the store yesterday');
  });

  test('validates correct answer', () => {
    const question = new FillInBlankQuestion(
      'I ___ to the store yesterday',
      'went',
      ['went']
    );

    const result = question.checkAnswer('went');
    expect(result.isCorrect).toBe(true);
  });

  test('accepts alternative correct answers', () => {
    const question = new FillInBlankQuestion(
      'I ___ to the store yesterday',
      'went',
      ['went', 'walked']
    );

    const result1 = question.checkAnswer('went');
    const result2 = question.checkAnswer('walked');

    expect(result1.isCorrect).toBe(true);
    expect(result2.isCorrect).toBe(true);
  });

  test('is case-insensitive', () => {
    const question = new FillInBlankQuestion(
      'I ___ to the store yesterday',
      'went',
      ['went']
    );

    const result = question.checkAnswer('WENT');
    expect(result.isCorrect).toBe(true);
  });

  test('trims whitespace from answer', () => {
    const question = new FillInBlankQuestion(
      'I ___ to the store yesterday',
      'went',
      ['went']
    );

    const result = question.checkAnswer('  went  ');
    expect(result.isCorrect).toBe(true);
  });

  test('provides hint for wrong answer', () => {
    const question = new FillInBlankQuestion(
      'I ___ to the store yesterday',
      'went',
      ['went']
    );

    const result = question.checkAnswer('go');
    expect(result.isCorrect).toBe(false);
    expect(result.feedback).toContain('past tense');
  });
});

describe('Question Engine - Difficulty Adaptation', () => {
  test('question starts at specified difficulty', () => {
    const question = new MultipleChoiceQuestion(
      'Easy question',
      ['A', 'B', 'C', 'D'],
      0,
      'easy'
    );

    expect(question.getDifficulty()).toBe('easy');
  });

  test('question defaults to medium difficulty', () => {
    const question = new MultipleChoiceQuestion(
      'Default question',
      ['A', 'B', 'C', 'D'],
      0
    );

    expect(question.getDifficulty()).toBe('medium');
  });

  test('harder questions award more points', () => {
    const easy = new MultipleChoiceQuestion('Q', ['A', 'B'], 0, 'easy');
    const medium = new MultipleChoiceQuestion('Q', ['A', 'B'], 0, 'medium');
    const hard = new MultipleChoiceQuestion('Q', ['A', 'B'], 0, 'hard');

    const easyResult = easy.checkAnswer('A', true);
    const mediumResult = medium.checkAnswer('A', true);
    const hardResult = hard.checkAnswer('A', true);

    expect(easyResult.points).toBeLessThan(mediumResult.points);
    expect(mediumResult.points).toBeLessThan(hardResult.points);
  });
});
