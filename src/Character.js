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
    armorType,
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
    this.armorType = armorType; //a string, "None", "Light", or "Heavy"
    this.hasShield = hasShield == "Shield"; //boolean
    this.weaponType = weaponType; //a string
    this.oneUniqueThing = oneUniqueThing; //a longer string
    this.iconRelationships = iconRelationships; //an array of objects, like [{'archmage', 1}, {'lich', -2}]
    this.backgrounds = backgrounds; //an array of objects, like [{'street thief', 4}, {'magician', 2}]

    this.abilityScores = this.calculateAbilityScores(); //object with key-value, like ["Str"] = 12
    this.abilityModifiers = this.calculateAbilityModifiers(); //must be after calculateAbilityScores(), object same as above
    
    //all these must be called after calculateAbilityModifiers()
    this.AC = this.calculateAC(); //a number
    this.PD = this.calculatePD(); //a number
    this.MD = this.calculateMD(); //a number
    this.meleeAtk = this.calculateMeleeAtk(); //[roll string, hit-dmg string, miss-dmg string], e.g. ["+4 vs AC", "4d8 + 5", "5"]
    this.rangedAtk = this.calculateRangedAtk(); //same as above
    this.maxHP = this.calculateMaxHP();
    this.recoveries = this.calculateRecoveryDice(); //[# daily uses, "XdY + Z"]
    this.racialPowers = this.calculateRacialPowers();
  }

  //utility function returns middleMod from a set of 3
  #getMiddleMod(arrayOfThree) {
    arrayOfThree.sort((a,b) => a - b); //ascending order
    return arrayOfThree[1];
  }

  //utility function returns highest mod from an array (of any length) of mods
  #getHighestMod(arrayOfMods) {
    let highestMod = -100;
    arrayOfMods.forEach ((abMod) => {
      highestMod = this.abilityModifiers[abMod] > highestMod ? this.abilityModifiers[abMod] : highestMod;
    });

    return highestMod;
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
    //base armor from class/job + 1 if shield + middle mod of con/dex/wis + level
    const baseAC = jobs[this.job].armor[this.armorType].AC;
    const shieldBonus = this.hasShield ? 1 : 0;
    const bonusMod = this.#getMiddleMod([this.abilityModifiers.con, this.abilityModifiers.dex, this.abilityModifiers.wis]);

    return baseAC + shieldBonus + bonusMod + this.level
  }

  calculatePD() {
    //base PD from class/job + middle value of str, con, dex modifier + level
    const basePD = jobs[this.job].PD;
    const bonusMod = this.#getMiddleMod([this.abilityModifiers.str, this.abilityModifiers.con, this.abilityModifiers.dex]);

    return basePD + bonusMod + this.level
  }

  calculateMD() {
    //base MD + middle value of int, wis, cha modifier + level
    const baseMD = jobs[this.job].MD; 
    const bonusMod = this.#getMiddleMod([this.abilityModifiers.int, this.abilityModifiers.wis, this.abilityModifiers.cha]);

    return baseMD + bonusMod + this.level
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
          key == this.raceBonus ||
          key == this.jobBonus
            ? score + 2
            : score;
        return [key, adjScore];
      })
    );
  }

  calculateRecoveryDice() {
    const uses = jobs[this.job].recoveries[0];
    const diceSize = jobs[this.job].recoveries[1];

    return [uses, `${this.level}d${diceSize} + ${this.abilityModifiers.con}`]
  }

  calculateMeleeAtk() {
    let atkArray = [];

    //get weapon from jobs data
    const weaponStringSplit = this.weaponType.split(" "); //e.g. ["1H", "Small"]
    const weaponData = jobs[this.job]["melee"][weaponStringSplit[0]][weaponStringSplit[1]]; //{ATK: #, DMG: #}

    //get highest mod in case of multiple abilities
    let highestMod = this.#getHighestMod(jobs[this.job].melee.Ability)

    //roll-string
    const rollMod = highestMod + this.level + weaponData.ATK;
    const rollAbModPlusOrMinus = rollMod >= 0 ? "+" : "";
    atkArray.push(`${rollAbModPlusOrMinus + rollMod} vs AC`);

    //dmg-string
    //ability modifier gets multiplied at higher levels
    if (this.level >= 8) {
      highestMod *= 3;
    } else if (this.level >= 5) {
      highestMod *= 2;
    }

    const dmgAbModPlusOrMinus = highestMod >= 0 ? "+" : "";
    atkArray.push(`${this.level}d${weaponData.DMG}${dmgAbModPlusOrMinus + highestMod}`);

    //miss-string
    const missDmg = jobs[this.job]["melee"]["Miss"] == "Level" ? this.level : 0;
    atkArray.push(missDmg);

    return atkArray;
  }

  calculateRangedAtk(){

  }

  calculateRacialPowers() {}
}
