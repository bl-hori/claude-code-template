import { MultipleChoiceQuestion, TranslationQuestion, FillInBlankQuestion, Difficulty } from './question-engine';

type Question = MultipleChoiceQuestion | TranslationQuestion | FillInBlankQuestion;

export class Vocabulary {
  private readonly word: string;
  private readonly category: string;
  private readonly translations: string[];
  private readonly description: string;
  private readonly example?: string;
  private readonly difficulty: Difficulty;

  constructor(
    word: string,
    category: string,
    translations: string[],
    description: string = '',
    example?: string,
    difficulty: Difficulty = 'medium'
  ) {
    this.word = word;
    this.category = category;
    this.translations = translations;
    this.description = description;
    this.example = example;
    this.difficulty = difficulty;
  }

  getWord(): string {
    return this.word;
  }

  getCategory(): string {
    return this.category;
  }

  getTranslations(): string[] {
    return this.translations;
  }

  getDescription(): string {
    return this.description;
  }

  getExample(): string | undefined {
    return this.example;
  }

  getDifficulty(): Difficulty {
    return this.difficulty;
  }
}

export class Lesson {
  private readonly id: string;
  private readonly title: string;
  private readonly description: string;
  private readonly difficulty: Difficulty;
  private questions: Question[];
  private vocabulary: Vocabulary[];
  private completed: boolean;
  private questionResults: boolean[];

  constructor(
    id: string,
    title: string,
    description: string,
    difficulty: Difficulty = 'medium'
  ) {
    this.id = id;
    this.title = title;
    this.description = description;
    this.difficulty = difficulty;
    this.questions = [];
    this.vocabulary = [];
    this.completed = false;
    this.questionResults = [];
  }

  getId(): string {
    return this.id;
  }

  getTitle(): string {
    return this.title;
  }

  getDescription(): string {
    return this.description;
  }

  getDifficulty(): Difficulty {
    return this.difficulty;
  }

  addQuestion(question: Question): void {
    this.questions.push(question);
    this.questionResults.push(false);
  }

  getQuestions(): Question[] {
    return this.questions;
  }

  addVocabulary(vocab: Vocabulary): void {
    this.vocabulary.push(vocab);
  }

  getVocabulary(): Vocabulary[] {
    return this.vocabulary;
  }

  isCompleted(): boolean {
    return this.completed;
  }

  markCompleted(): void {
    this.completed = true;
  }

  recordQuestionAnswer(questionIndex: number, isCorrect: boolean): void {
    if (questionIndex >= 0 && questionIndex < this.questionResults.length) {
      this.questionResults[questionIndex] = isCorrect;
    }
  }

  getProgress(): number {
    if (this.questions.length === 0) {
      return 0;
    }

    const correctAnswers = this.questionResults.filter((result) => result).length;
    return Math.floor((correctAnswers / this.questions.length) * 100);
  }
}

export class SkillPath {
  private readonly id: string;
  private readonly name: string;
  private readonly description: string;
  private lessons: Lesson[];

  constructor(id: string, name: string, description: string) {
    this.id = id;
    this.name = name;
    this.description = description;
    this.lessons = [];
  }

  getId(): string {
    return this.id;
  }

  getName(): string {
    return this.name;
  }

  getDescription(): string {
    return this.description;
  }

  addLesson(lesson: Lesson): void {
    this.lessons.push(lesson);
  }

  getLessons(): Lesson[] {
    return this.lessons;
  }

  isLessonUnlocked(lessonId: string, completedLessons: string[]): boolean {
    const lessonIndex = this.lessons.findIndex((l) => l.getId() === lessonId);

    if (lessonIndex === -1) {
      return false;
    }

    if (lessonIndex === 0) {
      return true;
    }

    const previousLesson = this.lessons[lessonIndex - 1];
    return completedLessons.includes(previousLesson.getId());
  }

  getProgress(completedLessons: string[]): number {
    if (this.lessons.length === 0) {
      return 0;
    }

    const completed = this.lessons.filter((lesson) =>
      completedLessons.includes(lesson.getId())
    ).length;

    return Math.floor((completed / this.lessons.length) * 100);
  }
}

export class LessonManager {
  private lessons: Map<string, Lesson>;
  private skillPaths: Map<string, SkillPath>;

  constructor() {
    this.lessons = new Map();
    this.skillPaths = new Map();
  }

  addLesson(lesson: Lesson): void {
    this.lessons.set(lesson.getId(), lesson);
  }

  getAllLessons(): Lesson[] {
    return Array.from(this.lessons.values());
  }

  getLessonById(id: string): Lesson | undefined {
    return this.lessons.get(id);
  }

  getLessonsByDifficulty(difficulty: Difficulty): Lesson[] {
    return this.getAllLessons().filter(
      (lesson) => lesson.getDifficulty() === difficulty
    );
  }

  addSkillPath(path: SkillPath): void {
    this.skillPaths.set(path.getId(), path);

    for (const lesson of path.getLessons()) {
      this.addLesson(lesson);
    }
  }

  getAllSkillPaths(): SkillPath[] {
    return Array.from(this.skillPaths.values());
  }

  getSkillPathById(id: string): SkillPath | undefined {
    return this.skillPaths.get(id);
  }

  getNextLesson(completedLessons: string[]): Lesson | undefined {
    for (const path of this.skillPaths.values()) {
      for (const lesson of path.getLessons()) {
        if (!completedLessons.includes(lesson.getId())) {
          if (path.isLessonUnlocked(lesson.getId(), completedLessons)) {
            return lesson;
          }
        }
      }
    }
    return undefined;
  }
}
