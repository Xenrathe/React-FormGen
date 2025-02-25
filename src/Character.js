import races from "./data/races";
import jobs from "./data/jobs";
import genFeats from "./data/abilities/generalfeats.json";

export class Character {
  constructor(
    abilityScoresBase,
    name,
    level,
    race,
    oldRace,
    raceBonus,
    job,
    oldJob,
    jobBonus,
    jobTalents,
    jobSpells,
    jobBonusAbs,
    feats,
    familiarAbs,
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
    this.oldRace = oldRace;
    this.raceBonus = raceBonus; //a string representing BONUS STAT from race
    this.job = job; //a string
    this.oldJob = oldJob;
    this.jobBonus = jobBonus; //a string representing BONUS STAT from job
    this.jobTalents = jobTalents; //an array of strings
    this.jobSpells = jobSpells;
    this.jobBonusAbs = jobBonusAbs;
    this.feats = feats; //an array of objects {"Linguist": "Champion"}.
    this.familiarAbs = familiarAbs; //an array of strings

    this.#trimFeatsAndAbilities(); //removes feats, talents, spells, etc incompatible with job and race

    this.armorType = armorType; //a string, "None", "Light", or "Heavy"
    this.hasShield = hasShield == "Shield"; //boolean
    this.weaponType = weaponType; //an object {"melee": meleeString, "ranged": rangedString}
    this.oneUniqueThing = oneUniqueThing; //a longer string
    this.iconRelationships = iconRelationships; //just strings but eventually an array of objects, like [{'archmage', 1}, {'lich', -2}]
    this.backgrounds = backgrounds; //an array of objects, like [{'street thief', 4}, {'magician', 2}]

    this.abilityScores = this.calculateAbilityScores(); //object with key-value, like ["Str"] = 12
    this.abilityModifiers = this.calculateAbilityModifiers(); //must be after calculateAbilityScores(), object same as above

    //all these must be called after calculateAbilityModifiers()
    this.AC = this.calculateAC(); //a number
    this.PD = this.calculatePD(); //a number
    this.MD = this.calculateMD(); //a number
    this.meleeAtk = this.calculateAtk(true); //[roll string, hit-dmg string, miss-dmg string], e.g. ["+4 vs AC", "4d8 + 5", "5"]
    this.rangedAtk = this.calculateAtk(false); //same as above
    this.maxHP = this.calculateMaxHP();
    this.recoveries = this.calculateRecoveryDice(); //[# daily, "XdY + Z"]
  }

  //utility function returns middleMod from a set of 3
  #getMiddleMod(arrayOfThree) {
    arrayOfThree.sort((a, b) => a - b); //ascending order
    return arrayOfThree[1];
  }

  //utility function returns highest mod from an array (of any length) of mods
  #getHighestMod(arrayOfMods) {
    let highestMod = -100;
    arrayOfMods.forEach((abMod) => {
      highestMod =
        this.abilityModifiers[abMod] > highestMod
          ? this.abilityModifiers[abMod]
          : highestMod;
    });

    return highestMod;
  }

  //adjust jobTalents, jobSpells, jobBonusAbs, and feats to remove ones incompatible with job and
  #trimFeatsAndAbilities() {
    //if race changed, remove racialFeats from old race
    if (this.race !== this.oldRace) {
      Object.keys(races[this.oldRace].racialPowersAndFeats).forEach((name) => {
        this.removeFeat(name, "Adventurer");
      });

      this.oldRace = this.race; //reset to say they're synchronized now
    }

    if (this.job != this.oldJob) {
      //there's no overlap for these so clear them
      this.jobTalents = [];
      this.jobSpells = [];
      this.jobBonusAbs = [];

      //clear all feats that are NOT general or racial
      const racialPowersNames = Object.keys(
        races[this.race].racialPowersAndFeats
      );
      const generalFeatNames = Object.keys(genFeats);
      this.feats.forEach((feat) => {
        const featName = Object.keys(feat)[0];
        if (
          !racialPowersNames.includes(featName) &&
          !generalFeatNames.includes(featName)
        ) {
          this.removeFeat(featName, "Adventurer");
        }
      });

      this.oldJob = this.job;
    }
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
    const bonusMod = this.#getMiddleMod([
      this.abilityModifiers.con,
      this.abilityModifiers.dex,
      this.abilityModifiers.wis,
    ]);

    return baseAC + shieldBonus + bonusMod + this.level;
  }

  calculatePD() {
    //base PD from class/job + middle value of str, con, dex modifier + level
    const basePD = jobs[this.job].PD;
    const bonusMod = this.#getMiddleMod([
      this.abilityModifiers.str,
      this.abilityModifiers.con,
      this.abilityModifiers.dex,
    ]);

    return basePD + bonusMod + this.level;
  }

  calculateMD() {
    //base MD + middle value of int, wis, cha modifier + level
    const baseMD = jobs[this.job].MD;
    const bonusMod = this.#getMiddleMod([
      this.abilityModifiers.int,
      this.abilityModifiers.wis,
      this.abilityModifiers.cha,
    ]);

    return baseMD + bonusMod + this.level;
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
          key == this.raceBonus || key == this.jobBonus ? score + 2 : score;
        return [key, adjScore];
      })
    );
  }

  calculateRecoveryDice() {
    const uses = jobs[this.job].recoveries[0];
    const diceSize = jobs[this.job].recoveries[1];
    const plusSign = this.abilityModifiers.con >= 0 ? "+" : "";

    return [
      uses,
      `${this.level}d${diceSize}${plusSign}${this.abilityModifiers.con}`,
    ];
  }

  calculateAtk(isMelee) {
    const attackType = isMelee ? "melee" : "ranged";
    let atkArray = [];

    //get weapon from jobs data
    const weaponStringSplit = this.weaponType[attackType].split(" "); //e.g. ["1H", "Small"]
    const weaponData =
      jobs[this.job][attackType][weaponStringSplit[0]][weaponStringSplit[1]]; //{ATK: #, DMG: #}

    //get highest mod in case of multiple abilities
    let highestMod = this.#getHighestMod(jobs[this.job][attackType].Ability);

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
    atkArray.push(
      `${this.level}d${weaponData.DMG}${dmgAbModPlusOrMinus + highestMod}`
    );

    //miss-string
    const missDmg =
      jobs[this.job][attackType]["Miss"] == "Level" ? this.level : 0;
    atkArray.push(missDmg);

    return atkArray;
  }

  //type can be "general" or "racial"
  //this gives STAND ALONE feats only, separated into { owned, potential }
  getFeats(type) {
    let owned = [];
    let potential = [];

    if (type.toLowerCase() === "racial") {
      potential = Object.entries(
        races[this.race]?.racialPowersAndFeats || {}
      )
        .filter(([_, tiers]) => !("Base" in tiers)) // exclude default / required features
        .map(([name, tiers]) => ({ [name]: tiers }));
    } else if (type.toLowerCase() === "general") {
      potential = Object.entries(genFeats).map(([name, tiers]) => ({
        [name]: tiers,
      }));
    }

    this.feats.forEach((feat) => {
      const featName = Object.keys(feat)[0];
      const index = potential.findIndex((f) => featName in f);
      if (index !== -1) {
        owned.push(potential[index]);
        potential.splice(index, 1);
      }
    });

    return { owned, potential };
  }

  //featName = string
  //featTier = "Adventurer", "Champion", or "Epic"
  //you may need to call this multiple times to add multiple tiers in a single click
  //the logic to do so is left to whatever external function calls this
  addFeat(featName, featTier) {
    this.feats.push({ [featName]: featTier });
  }

  //featName = string
  //featTier = "Adventurer", "Champion", or "Epic"
  //will also remove all higher tiers. e.g. removing Adventurer tier will also remove Champ + Epic
  removeFeat(featName, featTier) {
    const tiers = ["Adventurer", "Champion", "Epic"];
    const removeIndex = tiers.indexOf(featTier); //gives minimumIndex of removal

    this.feats = this.feats.filter((feat) => {
      const [name, tier] = Object.entries(feat)[0];
      return !(name == featName && tiers.indexOf(tier) >= removeIndex);
    });
  }

  //returns an array [totalPointsMax, maxPerBG]
  queryMaxBackground() {
    let maxTotal = 8;
    let maxPer = 5;

    // further backgrounding feat?
    // something else?

    return [maxTotal, maxPer];
  }

  // for most jobs, returns a single number
  // for barbarian (and other non-core class?), however, returns an array [adventurer max, champ max, epic max]
  #queryTalentsMax() {
    const hasTieredTalents = "Adventurer" in jobs[this.job].talentProgression;
    if (hasTieredTalents) {
      const maxAdv =
        jobs[this.job].talentProgression.Adventurer[this.level - 1];
      const maxChamp =
        jobs[this.job].talentProgression.Champion[this.level - 1];
      const maxEpic = jobs[this.job].talentProgression.Epic[this.level - 1];

      return [maxAdv, maxChamp, maxEpic];
    } else {
      const maxTalents = jobs[this.job].talentProgression[this.level - 1];

      return maxTalents;
    }
  }

  // for most jobs, returns a single number
  // for barbarian (and other non-core class?), however, returns an array [adventurer #, champ #, epic #]
  #queryTalentsCurrentCounts() {
    const hasTieredTalents = "Adventurer" in jobs[this.job].talentProgression;
    if (hasTieredTalents) {
      const tiers = ["Adventurer", "Champion", "Epic"];
      let counts = [0, 0, 0];

      this.jobTalents.forEach((talent) => {
        counts[
          tiers.indexOf(jobs[this.job].talentChoices[talent].Type)
        ] += 1;
      });

      return counts;
    } else {
      return this.jobTalents.length;
    }
  }

  //this gives talents, separated into { owned, potential }
  getTalents() {
    let owned = [];
    let potential = [];

    potential = Object.entries(jobs[this.job].talentChoices).map(([name, tiers]) => ({
      [name]: tiers,
    }));

    this.jobTalents.forEach((talent) => {
      const index = potential.findIndex((f) => talent in f);
      if (index !== -1) { // remove from potential because already owned
        owned.push(potential[index]);
        potential.splice(index, 1);
      }
      
    });

    return { owned, potential };
  }

  //for most jobs, returns an array with one number [#]
  // for barbarian (or other non-core classes?), however, returns an array [adventurer #, champ #, epic #]
  queryTalentsRemaining() {
    const currentTalentCounts = this.#queryTalentsCurrentCounts();
    const maxTalents = this.#queryTalentsMax();

    const hasTieredTalents = "Adventurer" in jobs[this.job].talentProgression;

    if (hasTieredTalents) {
      const advTalentsRemain = maxTalents[0] - currentTalentCounts[0];
      const champTalentsRemain = maxTalents[1] - currentTalentCounts[1];
      const epicTalentsRemain = maxTalents[2] - currentTalentCounts[2];

      return [advTalentsRemain, champTalentsRemain, epicTalentsRemain];
    } else {
      return [maxTalents - currentTalentCounts];
    }
  }

  #queryFamiliarAbsMax(){
    if (!this.jobTalents.includes("Wizard's Familiar")) {
      return 0;
    } else if (this.feats.some(feat => feat["Wizard's Familiar"] == "Epic")) { //THIS MUST BE BEFORE ADVENTURER!
      return 4;
    } else if (this.feats.some(feat => feat["Wizard's Familiar"] == "Adventurer")) {
      return 3;
    } else {
      return 2;
    }
  }

  #queryFamiliarAbsCurrent(){
    return this.familiarAbs.length;
  }

  queryFamiliarAbilitiesRemaining() {
    return this.#queryFamiliarAbsMax() - this.#queryFamiliarAbsCurrent();
  }

  //this gives familiar abilities, separated into { owned, potential }
  getFamiliarAbs(){
    let owned = [];
    let potential = [];

    potential = Object.entries(jobs["Wizard"].familiarAbilities).map(([name, value]) => ({
      [name]: value,
    }));

    this.familiarAbs.forEach((familiarAb) => {
      const index = potential.findIndex((f) => familiarAb in f);
      if (index !== -1) { // remove from potential because already owned
        owned.push(potential[index]);
        potential.splice(index, 1);
      }
      
    });

    return { owned, potential };
  }

  // 1A - 2A - 3A - 4A (levels 1-4)
  // 1C - 2C - 3C (levels 5-7)
  // 1E - 2E - 3E (levels 8-10)
  // returns an object {"Adventurer": #, "Champion": #, "Epic": #}
  #queryFeatsMax() {
    let maxAdv = this.level > 4 ? 4 : this.level;
    maxAdv = this.race == "Human" ? maxAdv + 1 : maxAdv;

    // clamped between 0 and 3
    const maxChamp = Math.min(3, Math.max(this.level - 4, 0));

    // clamped between 0 and 3
    const maxEpic = Math.min(3, Math.max(this.level - 7, 0));

    return { Adventurer: maxAdv, Champion: maxChamp, Epic: maxEpic };
  }

  // this.feats must be in correct data structure (see constructor above)
  // returns an object {"Adventurer": #, "Champion": #, "Epic": #}
  #queryFeatsCurrentCounts() {
    let counts = { Adventurer: 0, Champion: 0, Epic: 0 };

    this.feats.forEach((feat) => {
      const tier = Object.values(feat)[0];
      counts[tier] += 1;
    });

    return counts;
  }

  //returns an array [adv #, champ #, epic #]
  queryFeatsRemaining() {
    const currentFeatCounts = this.#queryFeatsCurrentCounts();
    const maxFeats = this.#queryFeatsMax();
    const advFeatsRemain = maxFeats.Adventurer - currentFeatCounts.Adventurer;
    const champFeatsRemain = maxFeats.Champion - currentFeatCounts.Champion;
    const epicFeatsRemain = maxFeats.Epic - currentFeatCounts.Epic;

    return [advFeatsRemain, champFeatsRemain, epicFeatsRemain];
  }

  //returns true or false
  queryFeatIsOwned(featName, featTier) {
    const highestFeatTier = this.queryFeatHighestTier(featName);

    // does not have feat at all
    if (!highestFeatTier) {
      return false;
    }

    if (highestFeatTier == "Epic") {
      return true;
    } else if (highestFeatTier == "Champion" && featTier != "Epic") {
      return true;
    } else if (highestFeatTier == "Adventurer" && featTier == "Adventurer") {
      return true;
    } else {
      return false;
    }
  }

  //returns highest tier (e.g. "Epic") of feat owned
  //returns false if not owned
  queryFeatHighestTier(featName) {
    // search through this.feats to see if feat is owned
    let owned = [];
    this.feats.forEach((feat) => {
      if (Object.keys(feat)[0] == featName) {
        owned.push(feat);
      }
    });

    if (owned.length == 0) {
      return false;
    }

    const tiers = ["Adventurer", "Champion", "Epic"];
    let highestIndex = 0;

    owned.forEach((feat) => {
      const tierIndex = tiers.indexOf(Object.values(feat)[0]);
      if (tierIndex >= highestIndex) {
        highestIndex = tierIndex;
      }
    });

    return tiers[highestIndex];

    /* OLD CODE FOR OLD IMPLEMENTATION
    this.feats = this.feats.filter(feat => {
      const [name, tier] = Object.entries(feat)[0];
      return !(name == featName && tiers.indexOf(tier) >= removeIndex);
    });

    const ownedFeatTier = Object.values(ownedFeat)[0];

    if (ownedFeatTier == "Epic") {
      return true;
    } else if (ownedFeatTier == "Champion" && featTier != "Epic") {
      return true;
    } else if (ownedFeatTier == "Adventurer" && featTier == "Adventurer") {
      return true;
    } else {
      return false;
    }*/
  }
}
