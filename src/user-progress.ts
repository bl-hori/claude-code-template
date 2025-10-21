export class UserProgress {
  private readonly userId: string;
  private xp: number;
  private level: number;
  private streak: number;
  private lastActivityDate: Date | null;
  private completedLessons: Set<string>;

  private readonly XP_THRESHOLDS = [0, 100, 250, 500, 1000, 2000, 4000, 8000];

  constructor(userId: string) {
    this.userId = userId;
    this.xp = 0;
    this.level = 1;
    this.streak = 0;
    this.lastActivityDate = null;
    this.completedLessons = new Set();
  }

  getUserId(): string {
    return this.userId;
  }

  getXP(): number {
    return this.xp;
  }

  addXP(amount: number): boolean {
    if (amount < 0) {
      throw new Error('XP must be positive');
    }

    const oldLevel = this.level;
    this.xp += amount;
    this.updateLevel();
    return this.level > oldLevel;
  }

  getLevel(): number {
    return this.level;
  }

  private updateLevel(): void {
    for (let i = this.XP_THRESHOLDS.length - 1; i >= 0; i--) {
      if (this.xp >= this.XP_THRESHOLDS[i]) {
        this.level = i + 1;
        break;
      }
    }
  }

  getStreak(): number {
    return this.streak;
  }

  recordActivity(date: Date = new Date()): void {
    const today = this.stripTime(date);

    if (this.lastActivityDate === null) {
      this.streak = 1;
      this.lastActivityDate = today;
      return;
    }

    const lastActivity = this.stripTime(this.lastActivityDate);
    const daysDiff = this.getDaysDifference(lastActivity, today);

    if (daysDiff === 0) {
      return;
    } else if (daysDiff === 1) {
      this.streak += 1;
      this.lastActivityDate = today;
    } else {
      this.streak = 1;
      this.lastActivityDate = today;
    }
  }

  private stripTime(date: Date): Date {
    return new Date(date.getFullYear(), date.getMonth(), date.getDate());
  }

  private getDaysDifference(date1: Date, date2: Date): number {
    const msPerDay = 24 * 60 * 60 * 1000;
    const diff = date2.getTime() - date1.getTime();
    return Math.floor(diff / msPerDay);
  }

  completeLesson(lessonId: string): void {
    this.completedLessons.add(lessonId);
  }

  getCompletedLessons(): string[] {
    return Array.from(this.completedLessons);
  }

  isLessonCompleted(lessonId: string): boolean {
    return this.completedLessons.has(lessonId);
  }
}
