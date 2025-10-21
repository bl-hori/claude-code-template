export type Difficulty = 'easy' | 'medium' | 'hard';

export interface QuestionResult {
  isCorrect: boolean;
  feedback: string;
  points: number;
  correctAnswer?: string;
}

abstract class Question {
  protected text: string;
  protected difficulty: Difficulty;

  constructor(text: string, difficulty: Difficulty = 'medium') {
    this.text = text;
    this.difficulty = difficulty;
  }

  getText(): string {
    return this.text;
  }

  getDifficulty(): Difficulty {
    return this.difficulty;
  }

  protected calculatePoints(isCorrect: boolean, isFirstTry: boolean): number {
    if (!isCorrect) {
      return 0;
    }

    const basePoints = this.getBasePoints();
    const bonus = isFirstTry ? 5 : 0;
    return basePoints + bonus;
  }

  private getBasePoints(): number {
    switch (this.difficulty) {
      case 'easy':
        return 5;
      case 'medium':
        return 10;
      case 'hard':
        return 15;
    }
  }

  abstract checkAnswer(answer: string, isFirstTry?: boolean): QuestionResult;
}

export class MultipleChoiceQuestion extends Question {
  private choices: string[];
  private correctIndex: number;

  constructor(
    text: string,
    choices: string[],
    correctIndex: number,
    difficulty: Difficulty = 'medium'
  ) {
    super(text, difficulty);
    this.choices = choices;
    this.correctIndex = correctIndex;
  }

  getChoices(): string[] {
    return this.choices;
  }

  checkAnswer(answer: string, isFirstTry = false): QuestionResult {
    const normalizedAnswer = answer.trim().toLowerCase();
    const correctAnswer = this.choices[this.correctIndex];
    const normalizedCorrect = correctAnswer.toLowerCase();

    const isCorrect = normalizedAnswer === normalizedCorrect;
    const points = this.calculatePoints(isCorrect, isFirstTry);

    if (isCorrect) {
      return {
        isCorrect: true,
        feedback: 'Correct!',
        points,
      };
    }

    return {
      isCorrect: false,
      feedback: `Incorrect. The correct answer is: ${correctAnswer}`,
      points: 0,
      correctAnswer,
    };
  }
}

export class TranslationQuestion extends Question {
  private readonly sourceText: string;
  private acceptedTranslations: string[];

  constructor(
    text: string,
    sourceText: string,
    acceptedTranslations: string[],
    difficulty: Difficulty = 'medium'
  ) {
    super(text, difficulty);
    this.sourceText = sourceText;
    this.acceptedTranslations = acceptedTranslations;
  }

  getSourceText(): string {
    return this.sourceText;
  }

  checkAnswer(answer: string, isFirstTry = false): QuestionResult {
    const normalized = this.normalizeText(answer);

    for (const accepted of this.acceptedTranslations) {
      const normalizedAccepted = this.normalizeText(accepted);

      if (normalized === normalizedAccepted) {
        return {
          isCorrect: true,
          feedback: 'Correct!',
          points: this.calculatePoints(true, isFirstTry),
        };
      }

      if (this.isFuzzyMatch(normalized, normalizedAccepted)) {
        return {
          isCorrect: true,
          feedback: 'Correct! (Note: minor typo detected)',
          points: this.calculatePoints(true, isFirstTry),
        };
      }
    }

    return {
      isCorrect: false,
      feedback: `Not quite. Expected: ${this.acceptedTranslations[0]}`,
      points: 0,
      correctAnswer: this.acceptedTranslations[0],
    };
  }

  private normalizeText(text: string): string {
    return text.trim().toLowerCase();
  }

  private isFuzzyMatch(str1: string, str2: string): boolean {
    const similarity = this.calculateSimilarity(str1, str2);
    return similarity >= 0.85;
  }

  private calculateSimilarity(str1: string, str2: string): number {
    if (str1 === str2) {
      return 1.0;
    }

    const len1 = str1.length;
    const len2 = str2.length;

    if (len1 === 0 || len2 === 0) {
      return 0;
    }

    const maxLen = Math.max(len1, len2);
    const distance = this.levenshteinDistance(str1, str2);
    return 1 - distance / maxLen;
  }

  private levenshteinDistance(str1: string, str2: string): number {
    const matrix: number[][] = [];

    for (let i = 0; i <= str2.length; i++) {
      matrix[i] = [i];
    }

    for (let j = 0; j <= str1.length; j++) {
      matrix[0][j] = j;
    }

    for (let i = 1; i <= str2.length; i++) {
      for (let j = 1; j <= str1.length; j++) {
        if (str2.charAt(i - 1) === str1.charAt(j - 1)) {
          matrix[i][j] = matrix[i - 1][j - 1];
        } else {
          matrix[i][j] = Math.min(
            matrix[i - 1][j - 1] + 1,
            matrix[i][j - 1] + 1,
            matrix[i - 1][j] + 1
          );
        }
      }
    }

    return matrix[str2.length][str1.length];
  }
}

export class FillInBlankQuestion extends Question {
  private correctAnswer: string;
  private acceptedAnswers: string[];

  constructor(
    text: string,
    correctAnswer: string,
    acceptedAnswers: string[],
    difficulty: Difficulty = 'medium'
  ) {
    super(text, difficulty);
    this.correctAnswer = correctAnswer;
    this.acceptedAnswers = acceptedAnswers;
  }

  checkAnswer(answer: string, isFirstTry = false): QuestionResult {
    const normalized = answer.trim().toLowerCase();

    for (const accepted of this.acceptedAnswers) {
      if (normalized === accepted.toLowerCase()) {
        return {
          isCorrect: true,
          feedback: 'Correct!',
          points: this.calculatePoints(true, isFirstTry),
        };
      }
    }

    return {
      isCorrect: false,
      feedback: this.generateHint(),
      points: 0,
      correctAnswer: this.correctAnswer,
    };
  }

  private generateHint(): string {
    if (this.text.includes('yesterday') || this.text.includes('ago')) {
      return 'Hint: Check the past tense form.';
    }
    return `Incorrect. The correct answer is: ${this.correctAnswer}`;
  }
}
