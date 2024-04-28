const prefix = process.cwd();

const ELIGIBLE_PLAYERS = new Set([
    'Mike Cheek',
    'baseballover723',
    'Doomerdinger',
    'ImStuckSettBro',
]);

const GAME_EVENTS_TO_AUDIO = {
    GameStart: {
        soundFile: `${prefix}/assets/double-kill.mp3`,
        volume: 0.4,
    },
    MinionsSpawning: {
        soundFile: `${prefix}/assets/quadraaa-kill.mp3`,
        volume: 0.4,
    },
    FirstBrick: {},
    TurretKilled: {},
    InhibKilled: {},
    DragonKill: {},
    DragonKillStolen: {},
    DragonKillElder: {},
    DragonKillElderStolen: {
        soundFile: `${prefix}/assets/40IQ.mp3`,
        volume: 0.4,
    },
    HeraldKill: {},
    HeraldKillStolen: {
        soundFile:  `${prefix}/assets/40IQ.mp3`,
        volume: 0.4,
    },
    BaronKill: {},
    BaronKillStolen: {
        soundFile:  `${prefix}/assets/40IQ.mp3`,
        volume: 0.4,
    },
    ChampionKill: {},
    Multikill2: {
        soundFile:  `${prefix}/assets/double-kill.mp3`,
        volume: 0.5,
    },
    Multikill3: {
        soundFile: `${prefix}/assets/oh=baby-a-triple.mp3`,
        volume: 0.5,
    },
    Multikill4: {
        soundFile: `${prefix}/assets/quadraaa-kill.mp3`,
        volume: 0.5,
    },
    Multikill5: {
        soundFile: `${prefix}/assets/penta-kill.mp3`,
        volume: 0.5,
    },
    Ace: {},
    FirstBlood: {
        soundFile: `${prefix}/assets/faker-what-was-that.mp3`,
        volume: 0.5,
    },
};

module.exports = { ELIGIBLE_PLAYERS, GAME_EVENTS_TO_AUDIO };
