import type { WordData, GuessResult, WordLength } from './types';

export class BinanceWotdSolver {
    private wordData: WordData;
    private wordLength: WordLength;
    private hardMode: boolean;

    constructor(wordData: WordData, wordLength: WordLength, hardMode: boolean) {
        this.wordData = wordData;
        this.wordLength = wordLength;
        this.hardMode = hardMode;
    }

    static CORRECT = 'G';
    static PRESENT = 'Y';
    static ABSENT = 'B';

    static getDifference(guess: string, answer: string): string {
        const length = guess.length;
        let diff = Array(length).fill(BinanceWotdSolver.ABSENT);
        let answerChars = answer.split('');
        let guessChars = guess.split('');

        for (let i = 0; i < length; i++) {
            if (guessChars[i] === answerChars[i]) {
                diff[i] = BinanceWotdSolver.CORRECT;
                answerChars[i] = null as any;
                guessChars[i] = null as any;
            }
        }

        for (let i = 0; i < length; i++) {
            if (guessChars[i] === null) continue;
            const index = answerChars.indexOf(guessChars[i]);
            if (index !== -1) {
                diff[i] = BinanceWotdSolver.PRESENT;
                answerChars[index] = null as any;
            }
        }

        return diff.join('');
    }

    isValidGuess(guess: string): boolean {
        return guess.length === this.wordLength && this.wordData.all.includes(guess);
    }

    static filterPossibilities(possibilities: string[], guesses: GuessResult[]): string[] {
        return possibilities.filter(word => {
            for (const guess of guesses) {
                const guessDiff = guess.evaluation.map(e =>
                    e === 'correct' ? BinanceWotdSolver.CORRECT :
                        e === 'present' ? BinanceWotdSolver.PRESENT : BinanceWotdSolver.ABSENT
                ).join('');
                const calculatedDiff = BinanceWotdSolver.getDifference(guess.word, word);
                if (calculatedDiff !== guessDiff) return false;
            }
            return true;
        });
    }

    getBestGuesses(possibleAnswers: string[], guessesMade: GuessResult[]): { word: string; score: number; isAnswer: boolean }[] {
        const MAX_CANDIDATES = 100;
        let candidates = this.wordData.all;

        if (this.hardMode && guessesMade.length > 0) {
            candidates = BinanceWotdSolver.filterPossibilities(candidates, guessesMade);
        }

        if (guessesMade.length === 0) {
            const topRanked = Object.entries(this.wordData.rankings)
                .sort((a, b) => (this.hardMode ? a[1].r - b[1].r : a[1].c - b[1].c))
                .slice(0, 10)
                .map(([word, rank]) => ({
                    word,
                    score: this.hardMode ? rank.r : rank.c,
                    isAnswer: possibleAnswers.includes(word)
                }));
            if (topRanked.length > 0) return topRanked;
        }

        if (possibleAnswers.length > 200) {
            const rankedCandidates = candidates
                .filter(w => this.wordData.rankings[w])
                .sort((a, b) => {
                    const rankA = this.hardMode ? this.wordData.rankings[a].r : this.wordData.rankings[a].c;
                    const rankB = this.hardMode ? this.wordData.rankings[b].r : this.wordData.rankings[b].c;
                    return rankA - rankB;
                })
                .slice(0, 20);
            return rankedCandidates.map(w => ({
                word: w,
                score: this.hardMode ? this.wordData.rankings[w].r : this.wordData.rankings[w].c,
                isAnswer: true
            }));
        }

        let bestGuesses: { word: string; score: number; isAnswer: boolean }[] = [];
        let searchSpace = Array.from(new Set([...possibleAnswers, ...candidates.slice(0, 200)]));
        if (searchSpace.length > 200) searchSpace = searchSpace.slice(0, 200);

        const candidateScores = searchSpace.map(guess => {
            const buckets: Record<string, number> = {};
            for (const answer of possibleAnswers) {
                const diff = BinanceWotdSolver.getDifference(guess, answer);
                buckets[diff] = (buckets[diff] || 0) + 1;
            }
            let sumSquares = 0;
            let bucketCount = 0;
            for (const key in buckets) {
                const size = buckets[key];
                sumSquares += size * size;
                bucketCount++;
            }
            const weighted = sumSquares / possibleAnswers.length;
            const threes = bucketCount / possibleAnswers.length;
            const adjusted = (1 - threes) * weighted;
            return { word: guess, score: adjusted, isAnswer: possibleAnswers.includes(guess) };
        });

        candidateScores.sort((a, b) => a.score - b.score);
        return candidateScores.slice(0, 20);
    }
}
