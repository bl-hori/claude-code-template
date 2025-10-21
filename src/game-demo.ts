import { UserProgress } from './user-progress';
import {
  MultipleChoiceQuestion,
  TranslationQuestion,
  FillInBlankQuestion,
} from './question-engine';
import { AchievementTracker, ComboSystem, EnergySystem } from './gamification';
import { Lesson, LessonManager, SkillPath, Vocabulary } from './lesson-content';

export class LanguageLearningGame {
  private userProgress: UserProgress;
  private achievementTracker: AchievementTracker;
  private comboSystem: ComboSystem;
  private energySystem: EnergySystem;
  private lessonManager: LessonManager;

  constructor(userId: string) {
    this.userProgress = new UserProgress(userId);
    this.achievementTracker = new AchievementTracker(userId);
    this.comboSystem = new ComboSystem();
    this.energySystem = new EnergySystem(5);
    this.lessonManager = new LessonManager();

    this.initializeContent();
  }

  private initializeContent(): void {
    const beginnerPath = new SkillPath(
      'beginner',
      'Beginner English',
      'Start your English learning journey'
    );

    const greetingsLesson = this.createGreetingsLesson();
    const basicPhrasesLesson = this.createBasicPhrasesLesson();

    beginnerPath.addLesson(greetingsLesson);
    beginnerPath.addLesson(basicPhrasesLesson);

    this.lessonManager.addSkillPath(beginnerPath);
  }

  private createGreetingsLesson(): Lesson {
    const lesson = new Lesson(
      'greetings-1',
      'Basic Greetings',
      'Learn how to greet people in English',
      'easy'
    );

    lesson.addVocabulary(
      new Vocabulary(
        'hello',
        'greeting',
        ['こんにちは', 'やあ'],
        'A common greeting',
        'Hello, how are you?',
        'easy'
      )
    );

    lesson.addVocabulary(
      new Vocabulary(
        'goodbye',
        'greeting',
        ['さようなら', 'バイバイ'],
        'A farewell greeting',
        'Goodbye, see you tomorrow!',
        'easy'
      )
    );

    lesson.addQuestion(
      new MultipleChoiceQuestion(
        'What is a common way to greet someone in English?',
        ['Hello', 'Goodbye', 'Thank you', 'Sorry'],
        0,
        'easy'
      )
    );

    lesson.addQuestion(
      new TranslationQuestion(
        'How do you say "さようなら" in English?',
        'さようなら',
        ['goodbye', 'bye'],
        'easy'
      )
    );

    lesson.addQuestion(
      new FillInBlankQuestion(
        '_____, how are you today?',
        'Hello',
        ['Hello', 'Hi'],
        'easy'
      )
    );

    return lesson;
  }

  private createBasicPhrasesLesson(): Lesson {
    const lesson = new Lesson(
      'phrases-1',
      'Common Phrases',
      'Learn essential everyday phrases',
      'medium'
    );

    lesson.addVocabulary(
      new Vocabulary(
        'thank you',
        'politeness',
        ['ありがとう', 'ありがとうございます'],
        'Express gratitude',
        'Thank you for your help!',
        'easy'
      )
    );

    lesson.addQuestion(
      new MultipleChoiceQuestion(
        'How do you express gratitude in English?',
        ['Thank you', 'Sorry', 'Please', 'Excuse me'],
        0,
        'medium'
      )
    );

    return lesson;
  }

  answerQuestion(
    lessonId: string,
    questionIndex: number,
    answer: string
  ): {
    result: {
      isCorrect: boolean;
      feedback: string;
      points: number;
    };
    leveledUp: boolean;
    newAchievements: string[];
    combo: number;
    energy: number;
  } {
    if (!this.energySystem.hasEnergy()) {
      throw new Error('No energy remaining. Wait for regeneration or refill.');
    }

    const lesson = this.lessonManager.getLessonById(lessonId);
    if (!lesson) {
      throw new Error('Lesson not found');
    }

    const question = lesson.getQuestions()[questionIndex];
    if (!question) {
      throw new Error('Question not found');
    }

    const isFirstTry = true;
    const result = question.checkAnswer(answer, isFirstTry);

    const previousAchievements =
      this.achievementTracker.getUnlockedAchievements();

    this.comboSystem.recordAnswer(result.isCorrect);
    const pointsWithCombo = this.comboSystem.calculatePoints(result.points);

    let leveledUp = false;
    if (result.isCorrect) {
      leveledUp = this.userProgress.addXP(pointsWithCombo);
      lesson.recordQuestionAnswer(questionIndex, true);

      if (lesson.getProgress() === 100) {
        this.completeLesson(lessonId);
      }
    } else {
      this.energySystem.recordAnswer(false);
    }

    this.achievementTracker.checkLessonCompletion(
      this.userProgress.getCompletedLessons().length
    );
    this.achievementTracker.checkStreak(this.userProgress.getStreak());
    const currentAchievements =
      this.achievementTracker.getUnlockedAchievements();

    const newAchievements = currentAchievements
      .filter((a) => !previousAchievements.find((pa) => pa.id === a.id))
      .map((a) => a.name);

    return {
      result: {
        isCorrect: result.isCorrect,
        feedback: result.feedback,
        points: pointsWithCombo,
      },
      leveledUp,
      newAchievements,
      combo: this.comboSystem.getCurrentCombo(),
      energy: this.energySystem.getCurrentEnergy(),
    };
  }

  completeLesson(lessonId: string): void {
    this.userProgress.completeLesson(lessonId);
    this.userProgress.recordActivity();

    const lesson = this.lessonManager.getLessonById(lessonId);
    lesson?.markCompleted();

    this.achievementTracker.checkLessonCompletion(
      this.userProgress.getCompletedLessons().length
    );
  }

  getGameState(): {
    user: {
      xp: number;
      level: number;
      streak: number;
      completedLessons: number;
    };
    current: {
      combo: number;
      energy: number;
    };
    nextLesson: string | null;
  } {
    const nextLesson = this.lessonManager.getNextLesson(
      this.userProgress.getCompletedLessons()
    );

    return {
      user: {
        xp: this.userProgress.getXP(),
        level: this.userProgress.getLevel(),
        streak: this.userProgress.getStreak(),
        completedLessons: this.userProgress.getCompletedLessons().length,
      },
      current: {
        combo: this.comboSystem.getCurrentCombo(),
        energy: this.energySystem.getCurrentEnergy(),
      },
      nextLesson: nextLesson ? nextLesson.getId() : null,
    };
  }

  getLessonManager(): LessonManager {
    return this.lessonManager;
  }
}
