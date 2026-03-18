/* LP21 Lernwelt - Achievements System */

const Achievements = {
    ALL: [
        {
            id: 'erster-versuch',
            name: 'Erster Schritt',
            desc: 'Erstes Spiel abgeschlossen.',
            icon: '🎮'
        },
        {
            id: 'erste-sterne',
            name: 'Aufgehender Stern',
            desc: 'Ersten Stern verdient.',
            icon: '⭐'
        },
        {
            id: 'perfektionist',
            name: 'Perfektionist',
            desc: '3 Sterne bei einer Kompetenz.',
            icon: '🏆'
        },
        {
            id: 'streak-3',
            name: 'Auf Kurs',
            desc: '3 richtige Antworten in Folge.',
            icon: '🔥'
        },
        {
            id: 'streak-5',
            name: 'Auf Feuer!',
            desc: '5 richtige Antworten in Folge.',
            icon: '🔥🔥'
        },
        {
            id: 'zehn-spiele',
            name: 'Dauerspieler',
            desc: '10 Spiele insgesamt gespielt.',
            icon: '🎯'
        },
        {
            id: 'dreissig-spiele',
            name: 'Marathonläufer',
            desc: '30 Spiele insgesamt gespielt.',
            icon: '🏃'
        },
        {
            id: 'level-3',
            name: 'Geselle',
            desc: 'Level 3 erreicht.',
            icon: '⚡'
        },
        {
            id: 'level-5',
            name: 'Meister',
            desc: 'Level 5 erreicht.',
            icon: '🏅'
        },
        {
            id: 'level-8',
            name: 'Legende',
            desc: 'Level 8 erreicht — das Maximum!',
            icon: '🌟'
        },
        {
            id: 'drei-faecher',
            name: 'Vielseitig',
            desc: 'In 3 verschiedenen Fächern gespielt.',
            icon: '📚'
        },
        {
            id: 'alle-faecher',
            name: 'Universalgenie',
            desc: 'In allen Fächern mindestens einmal gespielt.',
            icon: '🌍'
        },
        {
            id: 'schwer-gemeistert',
            name: 'Harte Nuss',
            desc: 'Ein Spiel auf Schwer mit 3 Sternen abgeschlossen.',
            icon: '💎'
        },
        {
            id: 'hundert-xp',
            name: 'Fleissig',
            desc: '100 XP gesammelt.',
            icon: '💪'
        },
        {
            id: 'tausend-xp',
            name: 'Wissensriese',
            desc: '1000 XP gesammelt.',
            icon: '🧠'
        }
    ],

    /** Check which achievements are newly unlocked. Returns array of newly unlocked achievement objects. */
    check(context) {
        const { sterne, streak, level, fachId, difficulty } = context;
        const storage = LP21Storage;
        const totalXP = typeof XPSystem !== 'undefined' ? XPSystem.getTotalXP() : 0;

        // Compute aggregate stats from storage
        const fortschritt = storage._getData();
        let totalGames = 0;
        const fächerGespielt = new Set();
        let totalSterne3 = 0;

        for (const [fid, komps] of Object.entries(fortschritt)) {
            let gespielt = false;
            for (const k of Object.values(komps)) {
                if (k.versuche > 0) {
                    totalGames += k.versuche;
                    gespielt = true;
                }
                if (k.sterne >= 3) totalSterne3++;
            }
            if (gespielt) fächerGespielt.add(fid);
        }

        const conditions = {
            'erster-versuch':    () => totalGames >= 1,
            'erste-sterne':      () => sterne >= 1,
            'perfektionist':     () => sterne === 3,
            'streak-3':          () => streak >= 3,
            'streak-5':          () => streak >= 5,
            'zehn-spiele':       () => totalGames >= 10,
            'dreissig-spiele':   () => totalGames >= 30,
            'level-3':           () => level >= 3,
            'level-5':           () => level >= 5,
            'level-8':           () => level >= 8,
            'drei-faecher':      () => fächerGespielt.size >= 3,
            'alle-faecher':      () => fächerGespielt.size >= 13,
            'schwer-gemeistert': () => difficulty === 'schwer' && sterne === 3,
            'hundert-xp':        () => totalXP >= 100,
            'tausend-xp':        () => totalXP >= 1000
        };

        const newlyUnlocked = [];
        for (const achievement of this.ALL) {
            if (storage.isAchievementUnlocked(achievement.id)) continue;
            const condition = conditions[achievement.id];
            if (condition && condition()) {
                storage.unlockAchievement(achievement.id);
                newlyUnlocked.push(achievement);
            }
        }
        return newlyUnlocked;
    },

    /** Get all achievements with unlock status */
    getAll() {
        return this.ALL.map(a => ({
            ...a,
            unlocked: LP21Storage.isAchievementUnlocked(a.id),
            unlockedDate: LP21Storage.getAchievements()[a.id] || null
        }));
    }
};
