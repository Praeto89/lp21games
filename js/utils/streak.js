/* LP21 Lernwelt - Streak System */

const StreakTracker = {
    current: 0,
    best: 0,

    reset() {
        this.current = 0;
        this.best = 0;
    },

    recordCorrect() {
        this.current++;
        if (this.current > this.best) this.best = this.current;

        let bonus = 0;
        if (this.current >= 7) bonus = 15;
        else if (this.current >= 5) bonus = 10;
        else if (this.current >= 3) bonus = 5;

        return { streak: this.current, bonus };
    },

    recordWrong() {
        this.current = 0;
    }
};
