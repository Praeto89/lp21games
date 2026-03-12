/* LP21 Lernwelt - Array Utilities */

const ArrayUtils = {
    /** Fisher-Yates Shuffle */
    shuffle(array) {
        const arr = [...array];
        for (let i = arr.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [arr[i], arr[j]] = [arr[j], arr[i]];
        }
        return arr;
    },

    /** Zufällige Auswahl von n Elementen */
    pickRandom(array, n) {
        return this.shuffle(array).slice(0, n);
    },

    /** Zufälliges einzelnes Element */
    randomItem(array) {
        return array[Math.floor(Math.random() * array.length)];
    }
};
