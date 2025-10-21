# Language Learning Game

A Duolingo-style English learning game built with Test-Driven Development (TDD) methodology.

## Features

### Core Systems

1. **User Progress Tracking**
   - XP and leveling system
   - Daily streak tracking
   - Lesson completion history
   - Progressive difficulty scaling

2. **Question Engine**
   - Multiple choice questions
   - Translation exercises
   - Fill-in-the-blank challenges
   - Difficulty-based point awards
   - Fuzzy matching for translations

3. **Gamification**
   - Achievement system (Bronze, Silver, Gold, Platinum)
   - Combo multipliers for consecutive correct answers
   - Energy/hearts system (lose hearts on wrong answers)
   - XP bonuses for first-try correct answers

4. **Lesson Management**
   - Organized skill paths
   - Sequential lesson unlocking
   - Vocabulary lists with translations
   - Progress tracking per lesson

## Project Structure

```
src/
├── user-progress.ts      # XP, levels, streaks, lesson tracking
├── question-engine.ts    # Question types and answer validation
├── gamification.ts       # Achievements, combos, energy system
├── lesson-content.ts     # Lessons, vocabulary, skill paths
└── game-demo.ts          # Integration example

tests/
├── user-progress.test.ts
├── question-engine.test.ts
├── gamification.test.ts
├── lesson-content.test.ts
└── game-demo.test.ts
```

## Getting Started

### Installation

```bash
npm install
```

### Run Tests

```bash
npm test                  # Run all tests
npm run test:watch        # Watch mode
npm run test:coverage     # With coverage report
```

### Build

```bash
npm run build
```

### Code Quality

```bash
npm run lint              # ESLint check
npm run format            # Prettier format
```

## Usage Example

```typescript
import { LanguageLearningGame } from './src/game-demo';

// Create a new game instance
const game = new LanguageLearningGame('user-123');

// Get current game state
const state = game.getGameState();
console.log(`Level: ${state.user.level}, XP: ${state.user.xp}`);

// Answer a question
const result = game.answerQuestion('greetings-1', 0, 'Hello');

if (result.result.isCorrect) {
  console.log(`Correct! +${result.result.points} XP`);
  console.log(`Combo: ${result.combo}x`);

  if (result.leveledUp) {
    console.log('Level up!');
  }

  if (result.newAchievements.length > 0) {
    console.log(`New achievements: ${result.newAchievements.join(', ')}`);
  }
} else {
  console.log(`Wrong! ${result.result.feedback}`);
  console.log(`Energy remaining: ${result.energy}`);
}
```

## Architecture

### User Progress Flow

```
Answer Question → Award XP → Check Level Up → Update Streak → Check Achievements
```

### Question Types

1. **Multiple Choice**
   - 4 options
   - Case-insensitive matching
   - Difficulty-based points

2. **Translation**
   - Multiple accepted translations
   - Fuzzy matching (85% similarity threshold)
   - Levenshtein distance algorithm

3. **Fill in the Blank**
   - Context-based hints
   - Multiple valid answers
   - Whitespace trimming

### Gamification Mechanics

**XP System:**
- Easy questions: 5 XP base
- Medium questions: 10 XP base
- Hard questions: 15 XP base
- First-try bonus: +5 XP

**Combo Multipliers:**
- 1-2 correct: 1.0x
- 3-4 correct: 1.5x
- 5+ correct: 2.0x

**Level Thresholds:**
- Level 1: 0 XP
- Level 2: 100 XP
- Level 3: 250 XP
- Level 4: 500 XP
- Level 5: 1000 XP
- Level 6: 2000 XP
- Level 7: 4000 XP
- Level 8: 8000 XP

**Energy System:**
- Start with 5 hearts
- Lose 1 heart per wrong answer
- Regenerate 1 heart per hour
- Instant refill available

## Test Coverage

```
All files           |   94.72% |    80.26% |   92.72% |   94.89%
 game-demo.ts       |   95.31% |     62.5% |    90.9% |   96.82%
 gamification.ts    |   94.52% |    77.27% |   92.59% |   94.52%
 lesson-content.ts  |   91.46% |    66.66% |   92.68% |   91.25%
 question-engine.ts |   96.15% |    88.46% |   94.44% |   95.94%
 user-progress.ts   |   97.72% |      100% |    92.3% |   97.67%
```

**93 tests** covering all core functionality.

## Development Philosophy

This project was built using **Test-Driven Development (TDD)**:

1. **RED**: Write failing tests first
2. **GREEN**: Implement minimal code to pass tests
3. **REFACTOR**: Improve code quality while maintaining test coverage

Every feature has comprehensive test coverage before implementation.

## Extending the Game

### Adding New Question Types

1. Create a new class extending `Question` abstract class
2. Implement `checkAnswer()` method
3. Write tests first (TDD approach)
4. Add to lesson builder methods

### Adding New Achievements

Edit `AchievementTracker.initializeAchievements()`:

```typescript
{
  id: 'custom-achievement',
  name: 'Achievement Name',
  description: 'Description',
  tier: 'gold',
  criteria: { type: 'custom', count: 10 }
}
```

### Creating New Lessons

```typescript
const lesson = new Lesson(
  'lesson-id',
  'Lesson Title',
  'Description',
  'medium'
);

// Add vocabulary
lesson.addVocabulary(new Vocabulary(
  'word',
  'category',
  ['translation1', 'translation2'],
  'definition'
));

// Add questions
lesson.addQuestion(new MultipleChoiceQuestion(
  'Question text?',
  ['Option 1', 'Option 2', 'Option 3', 'Option 4'],
  0, // Correct answer index
  'medium'
));
```

## Future Enhancements

Potential Phase 5 features:

- [ ] React frontend components
- [ ] Real-time leaderboards
- [ ] Social features (friend challenges)
- [ ] Audio pronunciation
- [ ] Spaced repetition algorithm
- [ ] Mobile app version
- [ ] Progress analytics dashboard
- [ ] Custom lesson creator

## License

MIT

## Built With

- TypeScript
- Jest (testing)
- ESLint (linting)
- Prettier (formatting)
