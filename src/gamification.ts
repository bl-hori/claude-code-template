export type AchievementTier = 'bronze' | 'silver' | 'gold' | 'platinum';

export interface AchievementData {
  id: string;
  name: string;
  description: string;
  tier: AchievementTier;
  unlockedAt?: number;
}

export class Achievement {
  private readonly id: string;
  private readonly name: string;
  private readonly description: string;
  private readonly tier: AchievementTier;
  private unlocked: boolean;
  private unlockedAt: number | null;

  constructor(
    id: string,
    name: string,
    description: string,
    tier: AchievementTier
  ) {
    this.id = id;
    this.name = name;
    this.description = description;
    this.tier = tier;
    this.unlocked = false;
    this.unlockedAt = null;
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

  getTier(): AchievementTier {
    return this.tier;
  }

  isUnlocked(): boolean {
    return this.unlocked;
  }

  unlock(): void {
    if (!this.unlocked) {
      this.unlocked = true;
      this.unlockedAt = Date.now();
    }
  }

  getUnlockedAt(): number {
    return this.unlockedAt || 0;
  }

  toData(): AchievementData {
    return {
      id: this.id,
      name: this.name,
      description: this.description,
      tier: this.tier,
      unlockedAt: this.unlockedAt || undefined,
    };
  }
}

export class AchievementTracker {
  private readonly userId: string;
  private achievements: Map<string, Achievement>;

  constructor(userId: string) {
    this.userId = userId;
    this.achievements = new Map();
    this.initializeAchievements();
  }

  private initializeAchievements(): void {
    const achievementConfigs = [
      {
        id: 'first-lesson',
        name: 'First Steps',
        description: 'Complete your first lesson',
        tier: 'bronze' as AchievementTier,
        criteria: { type: 'lessons', count: 1 },
      },
      {
        id: 'ten-lessons',
        name: 'Getting Started',
        description: 'Complete 10 lessons',
        tier: 'silver' as AchievementTier,
        criteria: { type: 'lessons', count: 10 },
      },
      {
        id: 'week-streak',
        name: 'Week Warrior',
        description: 'Maintain a 7-day streak',
        tier: 'gold' as AchievementTier,
        criteria: { type: 'streak', count: 7 },
      },
      {
        id: 'month-streak',
        name: 'Dedication Master',
        description: 'Maintain a 30-day streak',
        tier: 'platinum' as AchievementTier,
        criteria: { type: 'streak', count: 30 },
      },
    ];

    for (const config of achievementConfigs) {
      const achievement = new Achievement(
        config.id,
        config.name,
        config.description,
        config.tier
      );
      this.achievements.set(config.id, achievement);
    }
  }

  checkLessonCompletion(lessonCount: number): void {
    if (lessonCount >= 1) {
      this.achievements.get('first-lesson')?.unlock();
    }
    if (lessonCount >= 10) {
      this.achievements.get('ten-lessons')?.unlock();
    }
  }

  checkStreak(streakDays: number): void {
    if (streakDays >= 7) {
      this.achievements.get('week-streak')?.unlock();
    }
    if (streakDays >= 30) {
      this.achievements.get('month-streak')?.unlock();
    }
  }

  getUnlockedAchievements(): AchievementData[] {
    const unlocked: AchievementData[] = [];
    for (const achievement of this.achievements.values()) {
      if (achievement.isUnlocked()) {
        unlocked.push(achievement.toData());
      }
    }
    return unlocked;
  }

  getUserId(): string {
    return this.userId;
  }
}

export class ComboSystem {
  private currentCombo: number;
  private highestCombo: number;

  constructor() {
    this.currentCombo = 0;
    this.highestCombo = 0;
  }

  recordAnswer(isCorrect: boolean): void {
    if (isCorrect) {
      this.currentCombo += 1;
      if (this.currentCombo > this.highestCombo) {
        this.highestCombo = this.currentCombo;
      }
    } else {
      this.currentCombo = 0;
    }
  }

  getCurrentCombo(): number {
    return this.currentCombo;
  }

  getHighestCombo(): number {
    return this.highestCombo;
  }

  getMultiplier(): number {
    if (this.currentCombo >= 5) {
      return 2.0;
    } else if (this.currentCombo >= 3) {
      return 1.5;
    }
    return 1.0;
  }

  calculatePoints(basePoints: number): number {
    return Math.floor(basePoints * this.getMultiplier());
  }
}

export class EnergySystem {
  private readonly maxEnergy: number;
  private currentEnergy: number;
  private lastUpdate: number;

  constructor(maxEnergy: number) {
    this.maxEnergy = maxEnergy;
    this.currentEnergy = maxEnergy;
    this.lastUpdate = Date.now();
  }

  getCurrentEnergy(): number {
    return this.currentEnergy;
  }

  hasEnergy(): boolean {
    return this.currentEnergy > 0;
  }

  recordAnswer(isCorrect: boolean): void {
    if (!isCorrect && this.currentEnergy > 0) {
      this.currentEnergy -= 1;
      this.lastUpdate = Date.now();
    }
  }

  regenerate(currentTime: number = Date.now()): void {
    if (this.currentEnergy >= this.maxEnergy) {
      return;
    }

    const hoursPassed = (currentTime - this.lastUpdate) / (60 * 60 * 1000);
    const energyToRegenerate = Math.floor(hoursPassed);

    if (energyToRegenerate > 0) {
      this.currentEnergy = Math.min(
        this.maxEnergy,
        this.currentEnergy + energyToRegenerate
      );
      this.lastUpdate = currentTime;
    }
  }

  refill(): void {
    this.currentEnergy = this.maxEnergy;
    this.lastUpdate = Date.now();
  }
}
