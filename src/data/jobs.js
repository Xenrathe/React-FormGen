import { barbarianAbilities } from "./data/barbarian.json";
import { bardAbilities } from "./data/bard.json";
import { clericAbilities } from "./data/bard.json";

export const jobs = {
  Barbarian: {
    abilityBonus: ["str", "con"],
    armor: {
      None: { AC: 10, ATK: 0 },
      Light: { AC: 12, ATK: 0 },
      Heavy: { AC: 13, ATK: -2 },
      Shield: { AC: 1, ATK: 0 },
    },
    melee: {
      OneHanded: {
        Small: 0,
        Light: 0,
        Heavy: 0,
      },
      TwoHanded: {
        Small: 0,
        Light: 0,
        Heavy: 0,
      },
    },
    ranged: {
      Thrown: {
        Small: 0,
        Light: 0,
      },
      Crossbow: {
        Small: -5,
        Light: -5,
        Heavy: -5,
      },
      Bow: {
        Light: 0,
        Heavy: 0,
      },
    },
    PD: 11,
    MD: 10,
    baseHP: 6,
    recoveryDice: 10,
    talentProgression: {
      Adventurer: [3, 3, 3, 3, 3, 3, 3, 3, 3, 3],
      Champion: [0, 0, 0, 0, 1, 1, 1, 1, 1, 1],
      Epic: [0, 0, 0, 0, 0, 0, 0, 1, 1, 1],
    },
    talentChoices: barbarianAbilities["Talents"],
  },
  Bard: {
    abilityBonus: ["dex", "cha"],
    armor: {
      None: { AC: 10, ATK: 0 },
      Light: { AC: 12, ATK: 0 },
      Heavy: { AC: 13, ATK: -2 },
      Shield: { AC: 1, ATK: -1 },
    },
    melee: {
      OneHanded: {
        Small: 0,
        Light: 0,
        Heavy: -2,
      },
      TwoHanded: {
        Small: 0,
        Light: 0,
        Heavy: -2,
      },
    },
    ranged: {
      Thrown: {
        Small: 0,
        Light: 0,
      },
      Crossbow: {
        Light: 0,
        Heavy: -1,
      },
      Bow: {
        Light: 0,
        Heavy: -2,
      },
    },
    PD: 10,
    MD: 11,
    baseHP: 7,
    recoveryDice: 8,
    talentProgression: 3,
    talentChoices: bardAbilities["Talents"],
    spellProgression: [
      [2, 0, 0, 0, 0], // Level 1
      [3, 0, 0, 0, 0], // Level 2
      [1, 2, 0, 0, 0], // Level 3
      [0, 4, 0, 0, 0], // Level 4
      [0, 3, 2, 0, 0], // Level 5
      [0, 0, 5, 0, 0], // Level 6
      [0, 0, 3, 3, 0], // Level 7
      [0, 0, 0, 6, 0], // Level 8
      [0, 0, 0, 4, 3], // Level 9
      [0, 0, 0, 0, 7], // Level 10
    ],
    spellList: bardAbilities["Spells"],
    bonusAbilitySetTotal: [2, 2, 3, 3, 3, 4, 4, 5, 5, 6],
    bonusAbilitySetMax: [1, 1, 3, 3, 5, 5, 7, 7, 9, 9],
    bonusAbilitySet: bardAbilities["Bonus"],
  },
  Cleric: {
    abilityBonus: ["str", "wis"],
    armor: {
      None: { AC: 10, ATK: 0 },
      Light: { AC: 12, ATK: 0 },
      Heavy: { AC: 14, ATK: 0 },
      Shield: { AC: 1, ATK: 0 },
    },
    melee: {
      OneHanded: {
        Small: 0,
        Light: 0,
        Heavy: -2,
      },
      TwoHanded: {
        Small: 0,
        Light: 0,
        Heavy: -2,
      },
    },
    ranged: {
      Thrown: {
        Small: 0,
        Light: 0,
      },
      Crossbow: {
        Light: 0,
        Heavy: -1,
      },
      Bow: {
        Light: -2,
        Heavy: -5,
      },
    },
    PD: 11,
    MD: 11,
    baseHP: 7,
    recoveryDice: 8,
    talentProgression: 3,
    talentChoices: clericAbilities["Talents"],
    spellProgression: [
      [4, 0, 0, 0, 0], // Level 1
      [5, 0, 0, 0, 0], // Level 2
      [2, 3, 0, 0, 0], // Level 3
      [1, 5, 0, 0, 0], // Level 4
      [0, 2, 4, 0, 0], // Level 5
      [0, 1, 6, 0, 0], // Level 6
      [0, 0, 2, 5, 0], // Level 7
      [0, 0, 1, 7, 0], // Level 8
      [0, 0, 0, 2, 6], // Level 9
      [0, 0, 0, 1, 8], // Level 10
    ],
    spellList: clericAbilities["Spells"],
  },
  Fighter: {
    abilityBonus: ["str", "con"],
    armor: {
      None: { AC: 10, ATK: 0 },
      Light: { AC: 13, ATK: 0 },
      Heavy: { AC: 15, ATK: 0 },
      Shield: { AC: 1, ATK: 0 },
    },
    melee: {
      OneHanded: {
        Small: 0,
        Light: 0,
        Heavy: -2,
      },
      TwoHanded: {
        Small: 0,
        Light: 0,
        Heavy: -2,
      },
    },
    ranged: {
      Thrown: {
        Small: 0,
        Light: 0,
      },
      Crossbow: {
        Light: 0,
        Heavy: -1,
      },
      Bow: {
        Light: 0,
        Heavy: -2,
      },
    },
    PD: 10,
    MD: 10,
    baseHP: 8,
    recoveryDice: 9,
    talentProgression: [
      3, // Level 1
      3, // Level 2
      3, // Level 3
      3, // Level 4
      3, // Level 5
      4, // Level 6
      4, // Level 7
      4, // Level 8
      4, // Level 9
      4, // Level 10
    ],
    talentChoices: fighterAbilities["Talents"],
    bonusAbilitySetTotal: [3, 4, 4, 5, 5, 6, 6, 7, 7, 8],
    bonusAbilitySetMax: [1, 1, 3, 3, 4, 4, 5, 5, 6, 6],
    bonusAbilitySet: fighterAbilities["Bonus"],
  },
};
