import races from "./data/races";
import jobs from "./data/jobs";

export class Character {
  constructor(
    abilityScoresBase,
    name,
    level,
    race,
    raceBonus,
    job,
    jobBonus,
    jobTalents,
    feats,
    lightArmor,
    hasShield,
    weaponType,
    oneUniqueThing,
    iconRelationships,
    backgrounds
  ) {
    this.abilityScoresBase = abilityScoresBase; //{str, con, dex, int, wis, cha}
    this.name = name; //a string
    this.level = level; //a number 1-10
    this.race = race; //a string
    this.raceBonus = raceBonus; //a string
    this.job = job; //a string
    this.jobBonus = jobBonus; //a string
    this.jobTalents = jobTalents; //an array of strings
    this.feats = feats; //an array of strings
    this.lightArmor = lightArmor; //true = light armor, false = heavy armor
    this.hasShield = hasShield; //boolean
    this.weaponType = weaponType; //a string
    this.oneUniqueThing = oneUniqueThing; //a longer string
    this.iconRelationships = iconRelationships; //an array of objects, like [{'archmage', 1}, {'lich', -2}]
    this.backgrounds = backgrounds; //an array of objects, like [{'street thief', 4}, {'magician', 2}]

    this.abilityScores = this.calculateAbilityScores();
    this.abilityModifiers = this.calculateAbilityModifiers();
    this.maxHP = this.calculateMaxHP();
    this.AC = this.calculateAC();
    this.PD = this.calculatePD();
    this.MD = this.calculateMD();
    this.recoveryDice = this.calculateRecoveryDice();
    this.racialPowers = this.calculateRacialPowers();
  }

  calculateMaxHP() {
    const levelToMultiplierMap = {
      1: 3,
      2: 4,
      3: 5,
      4: 6,
      5: 8,
      6: 10,
      7: 12,
      8: 16,
      9: 20,
      10: 24,
    };

    //(base value + con mod) * level multiplier
    return (
      (jobs[this.job].baseHP + this.abilityModifiers.con) *
      levelToMultiplierMap[this.level]
    );
  }

  calculateAC() {
    //
  }

  calculatePD() {
    //base PD + middle value of str, con, dex modifier + level
  }

  calculateMD() {
    //base MD + middle value of int, wis, cha modifier + level
  }

  calculateAbilityModifiers() {
    return Object.fromEntries(
      Object.entries(this.abilityScores).map(([key, score]) => [
        key,
        Math.floor((score - 10) / 2),
      ])
    );
  }

  calculateAbilityScores() {
    return Object.fromEntries(
      Object.entries(this.abilityScoresBase).map(([key, score]) => {
        const adjScore =
          key == this.raceBonus.toLowerCase() ||
          key == this.jobBonus.toLowerCase()
            ? score + 2
            : score;
        return [key, adjScore];
      })
    );
  }

  calculateRecoveryDice() {}

  calculateRacialPowers() {}
}
