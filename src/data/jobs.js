import barbarianAbilities from "./abilities/barbarian.json";
import bardAbilities from "./abilities/bard.json";
import clericAbilities from "./abilities/cleric.json";
import fighterAbilities from "./abilities/fighter.json";
import paladinAbilities from "./abilities/paladin.json";
import rangerAbilities from "./abilities/ranger.json";
import rogueAbilities from "./abilities/rogue.json";
import sorcererAbilities from "./abilities/sorcerer.json";
import wizardAbilities from "./abilities/wizard.json";

const jobs = {
  Barbarian: {
    abilityBonus: ["str", "con"],
    armor: {
      None: { AC: 10, ATK: 0 },
      Light: { AC: 12, ATK: 0 },
      Heavy: { AC: 13, ATK: -2 },
      Shield: { AC: 1, ATK: 0 },
    },
    melee: {
      Ability: ["str"],
      Miss: "Level",
      "1H": {
        Small: { ATK: 0, DMG: 4 },
        Light: { ATK: 0, DMG: 6 },
        Heavy: { ATK: 0, DMG: 8 },
      },
      "2H": {
        Small: { ATK: 0, DMG: 6 },
        Light: { ATK: 0, DMG: 8 },
        Heavy: { ATK: 0, DMG: 10 },
      },
    },
    ranged: {
      Ability: ["dex"],
      Miss: "",
      Thrown: {
        Small: { ATK: 0, DMG: 4 },
        Light: { ATK: 0, DMG: 6 },
      },
      Crossbow: {
        Small: { ATK: -5, DMG: 4 },
        Light: { ATK: -5, DMG: 6 },
        Heavy: { ATK: -5, DMG: 8 },
      },
      Bow: {
        Light: { ATK: 0, DMG: 6 },
        Heavy: { ATK: 0, DMG: 8 },
      },
    },
    PD: 11,
    MD: 10,
    baseHP: 7,
    recoveries: [8, 10], //8 uses, 1d10
    talentProgression: {
      Adventurer: [3, 3, 3, 3, 3, 3, 3, 3, 3, 3],
      Champion: [0, 0, 0, 0, 1, 1, 1, 1, 1, 1],
      Epic: [0, 0, 0, 0, 0, 0, 0, 1, 1, 1],
    },
    features: Object.fromEntries(
      Object.entries(barbarianAbilities["Talents"]).filter(
        ([_, value]) => value.Type === "Default"
      )
    ),
    talentChoices: Object.fromEntries(
      Object.entries(barbarianAbilities["Talents"]).filter(
        ([_, value]) => value.Type !== "Default"
      )
    ),
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
      Ability: ["str", "dex"],
      Miss: "Level",
      "1H": {
        Small: { ATK: 0, DMG: 4 },
        Light: { ATK: 0, DMG: 6 },
        Heavy: { ATK: 0, DMG: 8 },
      },
      "2H": {
        Small: { ATK: 0, DMG: 6 },
        Light: { ATK: 0, DMG: 8 },
        Heavy: { ATK: -2, DMG: 10 },
      },
    },
    ranged: {
      Ability: ["dex"],
      Miss: "",
      Thrown: {
        Small: { ATK: 0, DMG: 4 },
        Light: { ATK: 0, DMG: 6 },
      },
      Crossbow: {
        Small: { ATK: 0, DMG: 4 },
        Light: { ATK: 0, DMG: 6 },
        Heavy: { ATK: -1, DMG: 8 },
      },
      Bow: {
        Light: { ATK: 0, DMG: 6 },
        Heavy: { ATK: -2, DMG: 8 },
      },
    },
    PD: 10,
    MD: 11,
    baseHP: 7,
    recoveries: [8, 8], //8 uses, 1d8
    talentProgression: [3, 3, 3, 3, 3, 3, 3, 3, 3, 3],
    features: Object.fromEntries(
      Object.entries(bardAbilities["Talents"]).filter(
        ([_, value]) => value.Type === "Default"
      )
    ),
    talentChoices: Object.fromEntries(
      Object.entries(bardAbilities["Talents"]).filter(
        ([_, value]) => value.Type !== "Default"
      )
    ),
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
      Ability: ["str"],
      Miss: "Level",
      "1H": {
        Small: { ATK: 0, DMG: 4 },
        Light: { ATK: 0, DMG: 6 },
        Heavy: { ATK: -2, DMG: 8 },
      },
      "2H": {
        Small: { ATK: 0, DMG: 6 },
        Light: { ATK: 0, DMG: 8 },
        Heavy: { ATK: -2, DMG: 10 },
      },
    },
    ranged: {
      Ability: ["dex"],
      Miss: "",
      Thrown: {
        Small: { ATK: 0, DMG: 4 },
        Light: { ATK: 0, DMG: 6 },
      },
      Crossbow: {
        Small: { ATK: 0, DMG: 4 },
        Light: { ATK: 0, DMG: 6 },
        Heavy: { ATK: -1, DMG: 8 },
      },
      Bow: {
        Light: { ATK: -2, DMG: 6 },
        Heavy: { ATK: -5, DMG: 8 },
      },
    },
    PD: 11,
    MD: 11,
    baseHP: 7,
    recoveries: [8, 8], //8 uses, 1d8
    talentProgression: [3, 3, 3, 3, 3, 3, 3, 3, 3, 3],
    features: Object.fromEntries(
      Object.entries(clericAbilities["Talents"]).filter(
        ([_, value]) => value.Type === "Default"
      )
    ),
    talentChoices: Object.fromEntries(
      Object.entries(clericAbilities["Talents"]).filter(
        ([_, value]) => value.Type !== "Default"
      )
    ),
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
      Ability: ["str"],
      Miss: "Level",
      "1H": {
        Small: { ATK: 0, DMG: 4 },
        Light: { ATK: 0, DMG: 6 },
        Heavy: { ATK: 0, DMG: 8 },
      },
      "2H": {
        Small: { ATK: 0, DMG: 6 },
        Light: { ATK: 0, DMG: 8 },
        Heavy: { ATK: 0, DMG: 10 },
      },
    },
    ranged: {
      Ability: ["dex"],
      Miss: "",
      Thrown: {
        Small: { ATK: 0, DMG: 4 },
        Light: { ATK: 0, DMG: 6 },
      },
      Crossbow: {
        Small: { ATK: 0, DMG: 4 },
        Light: { ATK: 0, DMG: 6 },
        Heavy: { ATK: 0, DMG: 8 },
      },
      Bow: {
        Light: { ATK: 0, DMG: 6 },
        Heavy: { ATK: 0, DMG: 8 },
      },
    },
    PD: 10,
    MD: 10,
    baseHP: 8,
    recoveries: [9, 10], //9 uses, 1d10,
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
    features: Object.fromEntries(
      Object.entries(fighterAbilities["Talents"]).filter(
        ([_, value]) => value.Type === "Default"
      )
    ),
    talentChoices: Object.fromEntries(
      Object.entries(fighterAbilities["Talents"]).filter(
        ([_, value]) => value.Type !== "Default"
      )
    ),
    bonusAbilitySetTotal: [3, 4, 4, 5, 5, 6, 6, 7, 7, 8],
    bonusAbilitySet: fighterAbilities["Bonus"],
  },
  Paladin: {
    abilityBonus: ["str", "cha"],
    armor: {
      None: { AC: 10, ATK: 0 },
      Light: { AC: 12, ATK: 0 },
      Heavy: { AC: 16, ATK: 0 },
      Shield: { AC: 1, ATK: 0 },
    },
    melee: {
      Ability: ["str"],
      Miss: "Level",
      "1H": {
        Small: { ATK: 0, DMG: 4 },
        Light: { ATK: 0, DMG: 6 },
        Heavy: { ATK: 0, DMG: 8 },
      },
      "2H": {
        Small: { ATK: 0, DMG: 6 },
        Light: { ATK: 0, DMG: 8 },
        Heavy: { ATK: 0, DMG: 10 },
      },
    },
    ranged: {
      Ability: ["dex"],
      Miss: "",
      Thrown: {
        Small: { ATK: 0, DMG: 4 },
        Light: { ATK: 0, DMG: 6 },
      },
      Crossbow: {
        Small: { ATK: 0, DMG: 4 },
        Light: { ATK: 0, DMG: 6 },
        Heavy: { ATK: 0, DMG: 8 },
      },
      Bow: {
        Light: { ATK: 0, DMG: 6 },
        Heavy: { ATK: 0, DMG: 8 },
      },
    },
    PD: 10,
    MD: 12,
    baseHP: 8,
    recoveries: [8, 10], //8 uses, 1d10,
    talentProgression: [
      3, // Level 1
      3, // Level 2
      3, // Level 3
      3, // Level 4
      4, // Level 5
      4, // Level 6
      4, // Level 7
      5, // Level 8
      5, // Level 9
      5, // Level 10
    ],
    features: Object.fromEntries(
      Object.entries(paladinAbilities["Talents"]).filter(
        ([_, value]) => value.Type === "Default"
      )
    ),
    talentChoices: Object.fromEntries(
      Object.entries(paladinAbilities["Talents"]).filter(
        ([_, value]) => value.Type !== "Default"
      )
    ),
  },
  Ranger: {
    abilityBonus: ["str", "dex", "wis"],
    armor: {
      None: { AC: 10, ATK: 0 },
      Light: { AC: 14, ATK: 0 },
      Heavy: { AC: 15, ATK: -2 },
      Shield: { AC: 1, ATK: -2 },
    },
    melee: {
      Ability: ["str", "dex"],
      Miss: "Level",
      "1H": {
        Small: { ATK: 0, DMG: 4 },
        Light: { ATK: 0, DMG: 6 },
        Heavy: { ATK: 0, DMG: 8 },
      },
      "2H": {
        Small: { ATK: 0, DMG: 6 },
        Light: { ATK: 0, DMG: 8 },
        Heavy: { ATK: 0, DMG: 10 },
      },
    },
    ranged: {
      Ability: ["dex"],
      Miss: "Level",
      Thrown: {
        Small: { ATK: 0, DMG: 4 },
        Light: { ATK: 0, DMG: 6 },
      },
      Crossbow: {
        Small: { ATK: 0, DMG: 4 },
        Light: { ATK: 0, DMG: 6 },
        Heavy: { ATK: 0, DMG: 8 },
      },
      Bow: {
        Light: { ATK: 0, DMG: 6 },
        Heavy: { ATK: 0, DMG: 8 },
      },
    },
    PD: 11,
    MD: 10,
    baseHP: 7,
    recoveries: [8, 8], //8 uses, 1d8
    talentProgression: [
      3, // Level 1
      3, // Level 2
      3, // Level 3
      3, // Level 4
      4, // Level 5
      4, // Level 6
      4, // Level 7
      5, // Level 8
      5, // Level 9
      5, // Level 10
    ],
    features: Object.fromEntries(
      Object.entries(rangerAbilities["Talents"]).filter(
        ([_, value]) => value.Type === "Default"
      )
    ),
    talentChoices: Object.fromEntries(
      Object.entries(rangerAbilities["Talents"]).filter(
        ([_, value]) => value.Type !== "Default"
      )
    ),
    ACFeats: rangerAbilities["AC Feats"],
  },
  Rogue: {
    abilityBonus: ["dex", "cha"],
    armor: {
      None: { AC: 11, ATK: 0 },
      Light: { AC: 12, ATK: 0 },
      Heavy: { AC: 13, ATK: -2 },
      Shield: { AC: 1, ATK: -2 },
    },
    melee: {
      Ability: ["dex"],
      Miss: "Level",
      "1H": {
        Small: { ATK: 0, DMG: 8 },
        Light: { ATK: 0, DMG: 8 },
        Heavy: { ATK: -2, DMG: 8 },
      },
      "2H": {
        Small: { ATK: 0, DMG: 6 },
        Light: { ATK: 0, DMG: 8 },
        Heavy: { ATK: -2, DMG: 10 },
      },
    },
    ranged: {
      Ability: ["dex"],
      Miss: "Level",
      Thrown: {
        Small: { ATK: 0, DMG: 4 },
        Light: { ATK: 0, DMG: 6 },
      },
      Crossbow: {
        Small: { ATK: 0, DMG: 4 },
        Light: { ATK: 0, DMG: 6 },
        Heavy: { ATK: -1, DMG: 8 },
      },
      Bow: {
        Light: { ATK: 0, DMG: 6 },
        Heavy: { ATK: -2, DMG: 8 },
      },
    },
    PD: 12,
    MD: 10,
    baseHP: 6,
    recoveries: [8, 8], //8 uses, 1d8
    talentProgression: [3, 3, 3, 3, 3, 3, 3, 3, 3, 3],
    features: Object.fromEntries(
      Object.entries(rogueAbilities["Talents"]).filter(
        ([_, value]) => value.Type === "Default"
      )
    ),
    talentChoices: Object.fromEntries(
      Object.entries(rogueAbilities["Talents"]).filter(
        ([_, value]) => value.Type !== "Default"
      )
    ),
    bonusAbilitySetTotal: [4, 5, 5, 6, 6, 7, 7, 8, 8, 9],
    bonusAbilitySet: rogueAbilities["Bonus"],
  },
  Sorcerer: {
    abilityBonus: ["cha", "con"],
    armor: {
      None: { AC: 10, ATK: 0 },
      Light: { AC: 10, ATK: 0 },
      Heavy: { AC: 11, ATK: -2 },
      Shield: { AC: 1, ATK: -2 },
    },
    melee: {
      Ability: ["str"],
      Miss: "Level",
      "1H": {
        Small: { ATK: 0, DMG: 4 },
        Light: { ATK: 0, DMG: 6 },
        Heavy: { ATK: -2, DMG: 8 },
      },
      "2H": {
        Small: { ATK: 0, DMG: 6 },
        Light: { ATK: 0, DMG: 8 },
        Heavy: { ATK: -2, DMG: 10 },
      },
    },
    ranged: {
      Ability: ["dex"],
      Miss: "",
      Thrown: {
        Small: { ATK: 0, DMG: 4 },
        Light: { ATK: 0, DMG: 6 },
      },
      Crossbow: {
        Small: { ATK: 0, DMG: 4 },
        Light: { ATK: -1, DMG: 6 },
        Heavy: { ATK: -3, DMG: 8 },
      },
      Bow: {
        Light: { ATK: -2, DMG: 6 },
        Heavy: { ATK: -4, DMG: 8 },
      },
    },
    PD: 11,
    MD: 10,
    baseHP: 6,
    recoveries: [8, 6], // 8 uses, 1d6
    talentProgression: [3, 3, 3, 3, 3, 3, 3, 3, 3, 3],
    features: Object.fromEntries(
      Object.entries(sorcererAbilities["Talents"]).filter(
        ([_, value]) => value.Type === "Default"
      )
    ),
    talentChoices: Object.fromEntries(
      Object.entries(sorcererAbilities["Talents"]).filter(
        ([_, value]) => value.Type !== "Default"
      )
    ),
    spellProgression: [
      [4, 0, 0, 0, 0], // Level 1
      [5, 0, 0, 0, 0], // Level 2
      [3, 3, 0, 0, 0], // Level 3
      [0, 6, 0, 0, 0], // Level 4
      [0, 3, 4, 0, 0], // Level 5
      [0, 0, 7, 0, 0], // Level 6
      [0, 0, 3, 5, 0], // Level 7
      [0, 0, 0, 8, 0], // Level 8
      [0, 0, 0, 3, 6], // Level 9
      [0, 0, 0, 0, 9], // Level 10
    ],
    spellList: sorcererAbilities["Spells"],
  },
  Wizard: {
    abilityBonus: ["int", "wis"],
    armor: {
      None: { AC: 10, ATK: 0 },
      Light: { AC: 10, ATK: 0 },
      Heavy: { AC: 11, ATK: -2 },
      Shield: { AC: 1, ATK: -2 },
    },
    melee: {
      Ability: ["str"],
      Miss: "",
      "1H": {
        Small: { ATK: 0, DMG: 4 },
        Light: { ATK: -2, DMG: 6 },
        Heavy: { ATK: -5, DMG: 8 },
      },
      "2H": {
        Small: { ATK: 0, DMG: 6 },
        Light: { ATK: -2, DMG: 8 },
        Heavy: { ATK: -5, DMG: 10 },
      },
    },
    ranged: {
      Ability: ["dex"],
      Miss: "",
      Thrown: {
        Small: { ATK: 0, DMG: 4 },
        Light: { ATK: -2, DMG: 6 },
      },
      Crossbow: {
        Small: { ATK: 0, DMG: 4 },
        Light: { ATK: -1, DMG: 6 },
        Heavy: { ATK: -4, DMG: 8 },
      },
      Bow: {
        Light: { ATK: -2, DMG: 6 },
        Heavy: { ATK: -5, DMG: 8 },
      },
    },
    PD: 10,
    MD: 12,
    baseHP: 6,
    recoveries: [8, 6], // 8 uses, 1d6
    talentProgression: [3, 3, 3, 3, 3, 3, 3, 3, 3, 3],
    features: Object.fromEntries(
      Object.entries(wizardAbilities["Talents"]).filter(
        ([_, value]) => value.Type === "Default"
      )
    ),
    talentChoices: Object.fromEntries(
      Object.entries(wizardAbilities["Talents"]).filter(
        ([_, value]) => value.Type !== "Default"
      )
    ),
    spellProgression: [
      [5, 0, 0, 0, 0], // Level 1
      [6, 0, 0, 0, 0], // Level 2
      [3, 4, 0, 0, 0], // Level 3
      [2, 6, 0, 0, 0], // Level 4
      [1, 4, 4, 0, 0], // Level 5
      [0, 2, 8, 0, 0], // Level 6
      [0, 1, 4, 5, 0], // Level 7
      [0, 0, 3, 8, 0], // Level 8
      [0, 0, 1, 5, 6], // Level 9
      [0, 0, 0, 3, 9], // Level 10
    ],
    spellList: wizardAbilities["Spells"],
    familiarAbilities: wizardAbilities["Familiar Abilities"],
  },
};

export default jobs;
