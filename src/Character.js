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
    bonusOptions,
    armorType,
    hasShield,
    weaponType,
    oneUniqueThing,
    iconRelationships,
    backgrounds,
    items
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
    this.jobSpells = jobSpells; //an array of objects {"Acid Arrow": "Level 1"}
    this.jobBonusAbs = jobBonusAbs; //an array of strings
    this.feats = feats; //an array of objects {"Linguist": "Champion"}.
    this.familiarAbs = familiarAbs; //an array of strings
    this.bonusOptions = bonusOptions; //an array of objects {"Mythkenner": ["A", "B"]}

    this.#trimFeatsAndAbilities(); //removes feats, talents, spells, etc incompatible with job, race, and new level

    this.armorType = armorType; //a string, "None", "Light", or "Heavy"
    this.hasShield = hasShield == "Shield"; //boolean
    this.weaponType = weaponType; //an object {"melee": meleeString, "ranged": rangedString}
    this.oneUniqueThing = oneUniqueThing; //a longer string
    this.iconRelationships = iconRelationships; //just strings but eventually an array of objects, like [{'archmage', 1}, {'lich', -2}]
    this.backgrounds = backgrounds; //an array of objects, like [{'street thief', 4}, {'magician', 2}]
    this.items = items; //an array of user-inputted strings "Longsword +1"

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

    //if job changed, remove all non-general or racial abilities and feats
    if (this.job != this.oldJob) {
      //there's no overlap for these so clear them
      this.jobTalents = [];
      this.jobSpells = [];
      this.jobBonusAbs = [];
      this.familiarAbs = [];
      this.bonusOptions = [];

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
    } /*else {
      let newSpellList = [];
      this.jobSpells.forEach((spell) => {
        const name = Object.keys(spell)[0];
        const spellLevel = Number(Object.values(spell)[0].substr(-1));
        
        if (spellLevel > this.level) {
          this.feats = this.feats.filter((feat) => Object.keys(feat)[0] !== name)
        } else {
          newSpellList.push(spell);
        }
      })

      this.jobSpells = newSpellList;
    }*/

    //if player removes familiar as a talent, it also removes associated information
    if (
      !this.jobTalents.includes("Wizard's Familiar") &&
      !this.jobTalents.includes("Sorcerer's Familiar")
    ) {
      this.familiarAbs = [];
    }

    //if player removes a talent that has bonus options, it also removes associated information
    this.bonusOptions = this.bonusOptions.filter((bonusOp) =>
      this.jobTalents.includes(Object.keys(bonusOp)[0])
    );

    //if player removes any of the "AC" (animal companion) talents, will also remove associated feats
    if (
      this.jobTalents.filter((talent) => talent.substring(0, 2) == "AC")
        .length < 1
    ) {
      Object.keys(jobs["Ranger"].ACFeats).forEach((title) => {
        this.removeFeat(title, "Adventurer");
      });
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

    const SHFeatTiers = this.feats
      .filter((feat) => Object.keys(feat)[0] == "Strongheart")
      .map((SHFeatObj) => Object.values(SHFeatObj)[0]);

    const featBonus = SHFeatTiers.includes("Champion") ? 1 : 0;

    return basePD + bonusMod + featBonus + this.level;
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
    let uses = jobs[this.job].recoveries[0];
    let diceSize = jobs[this.job].recoveries[1];
    const plusSign = this.abilityModifiers.con >= 0 ? "+" : "";

    if (this.jobTalents.includes("Strongheart")) {
      const SHFeatTiers = this.feats
        .filter((feat) => Object.keys(feat)[0] == "Strongheart")
        .map((SHFeatObj) => Object.values(SHFeatObj)[0]);

      if (SHFeatTiers.includes("Adventurer")) {
        uses += 1;
      }

      if (SHFeatTiers.includes("Epic")) {
        uses += 1;
      }

      diceSize = 12;
    }

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

  //in core, only wizard should be calling for this
  getCantrips() {
    const list = Object.entries(jobs[this.job].spellList).filter(
      ([level, _]) => level == "Level 0"
    )[0][1];
    return list;
  }

  //in core, only wizard should be calling for this
  getUtilitySpells() {
    if (
      !("spellList" in jobs[this.job]) ||
      !("Utility" in jobs[this.job].spellList)
    ) {
      return [];
    }

    const utilityObject = jobs[this.job].spellList["Utility"];
    const list = Object.entries(utilityObject).flatMap(([level, spells]) =>
      Object.entries(spells).map(([spellName, spellData]) => ({
        [spellName]: {
          ...spellData,
          Level: parseInt(level.replace("Level ", ""), 10),
        },
      }))
    );
    return list;
  }

  #getOptions(type, sourceData, ownedThings, filterFn = () => true) {
    let owned = [];
    let potential = [];

    // Extract potential options from the provided source
    if (type === "bonusAbs" || type === "spells") {
      const abilityNames = new Set(
        ownedThings.map((entry) =>
          typeof entry == "object" ? Object.keys(entry)[0] : entry
        )
      );

      potential = Object.entries(sourceData).flatMap(([level, abilities]) =>
        Object.entries(abilities)
          .filter(([name, _]) => filterFn(level) || abilityNames.has(name))
          .map(([name, data]) => ({
            [name]: {
              ...data,
              Level: parseInt(level.replace("Level ", ""), 10),
            },
          }))
      );
    } else {
      potential = Object.entries(sourceData)
        .filter(([_, tiers]) => filterFn(tiers))
        .map(([name, tiers]) => ({
          [name]: tiers,
        }));
    }

    // Special cases for Spells
    if (type === "spells") {
      if (this.job === "Cleric" && sourceData["Level 0"]?.Heal) {
        owned.push({ Heal: { ...sourceData["Level 0"].Heal, Level: 0 } });
      } else if (this.job === "Wizard") {
        owned.push({
          Cantrips: {
            Type: "Ranged",
            Frequency: "At-will",
            Action: "Standard",
            Level: 0,
          },
        });

        const ownedUtility = this.jobSpells.find(
          (spell) => Object.keys(spell)[0] === "Utility Spell"
        );
        const utilitySpellLevel = ownedUtility
          ? Number(Object.values(ownedUtility)[0].substring(5))
          : 0;
        owned.push({
          "Utility Spell": {
            Level: utilitySpellLevel,
            Effect:
              "Take a spell-slot to allow using the following utility spells:",
            "Level 1": "Disguise Self; Feather Fall; Hold Portal",
            "Level 3": "Levitate; Message; Speak with Item",
            "Level 5": "Water Breathing",
            "Level 7": "Scrying",
            "Level 9": "Upgrades only",
          },
        });

        if (this.jobTalents.includes("High Arcana")) {
          owned.push({
            "Counter-magic":
              jobs["Wizard"].talentChoices["High Arcana"]["Counter-magic"],
          });
        }
      }
    }

    // Determine owned items and remove them from potential
    ownedThings.forEach((item) => {
      const itemName =
        type == "talents" || type == "bonusAbs" || type == "familiarAbs"
          ? item
          : Object.keys(item)[0];
      const index = potential.findIndex((f) => itemName in f);
      if (index !== -1) {
        if (type === "spells") {
          let spellItem = potential[index];
          spellItem[itemName].Level = parseInt(
            Object.values(item)[0].replace("Level ", ""),
            10
          );
          owned.push(spellItem);
        } else {
          owned.push(potential[index]);
        }
        potential.splice(index, 1);
      }
    });

    return { owned, potential };
  }

  //in core, only Bard, Fighter, and Rogue should be calling this
  getBonusAbs() {
    return this.#getOptions(
      "bonusAbs",
      jobs[this.job].bonusAbilitySet,
      this.jobBonusAbs,
      (level) => level !== "Name" && Number(level.substring(6)) <= this.level
    );
  }

  //type can be "general" or "racial" or "ac" (animal companion)
  //this gives STAND ALONE (or ANIMAL COMPANION) feats only, separated into { owned, potential }
  getFeats(type) {
    let source;
    let filterFn = () => true;
    if (type.toLowerCase() === "racial") {
      source = races[this.race]?.racialPowersAndFeats || {};
      filterFn = (tiers) => !("Base" in tiers);
    } else if (type.toLowerCase() === "general") {
      source = genFeats;
    } else if (type.toLowerCase() === "ac" && "ACFeats" in jobs[this.job]) {
      source = jobs[this.job].ACFeats;
    } else {
      return { owned: [], potential: [] };
    }
    return this.#getOptions("feats", source, this.feats, filterFn);
  }

  //this gives spells, separated into { owned, potential }
  getSpells() {
    return this.#getOptions(
      "spells",
      jobs[this.job].spellList,
      this.jobSpells,
      (level) =>
        level !== "Utility" &&
        level !== "Level 0" &&
        Number(level.substring(6)) <= this.level
    );
  }

  //this gives talents, separated into { owned, potential }
  getTalents() {
    return this.#getOptions(
      "talents",
      jobs[this.job].talentChoices,
      this.jobTalents
    );
  }

  //this gives familiar abilities, separated into { owned, potential }
  getFamiliarAbs() {
    const familiarDataSet =
      "familiarAbilities" in jobs[this.job]
        ? this.#getOptions(
            "familiarAbs",
            jobs[this.job].familiarAbilities,
            this.familiarAbs
          )
        : { owned: [], potential: [] };
    return familiarDataSet;
  }

  //returns an array [totalPointsMax, maxPerBG]
  queryBackgroundMax() {
    let maxTotal = 8;
    let maxPer = 5;

    // further backgrounding feat?
    // something else?

    return [maxTotal, maxPer];
  }

  queryBonusAbsTitle() {
    const bonusAbilitySetTitle =
      "bonusAbilitySet" in jobs[this.job]
        ? jobs[this.job].bonusAbilitySet.Name
        : "";

    return bonusAbilitySetTitle;
  }

  #queryBonusAbsMax() {
    let maxBonusAbs =
      "bonusAbilitySetTotal" in jobs[this.job]
        ? jobs[this.job].bonusAbilitySetTotal[this.level - 1]
        : 0;

    if (this.jobTalents.includes("Battle Skald")) {
      maxBonusAbs += 1;
    }

    return maxBonusAbs;
  }

  queryBonusAbsRemaining() {
    const maxBonusAbs = this.#queryBonusAbsMax();
    const currentBonusAbs = this.jobBonusAbs.length;
    return maxBonusAbs - currentBonusAbs;
  }

  //Returns the total number of slots
  //Is this redundant with querySpellsOwnedCount? it might be.
  querySpellsMax() {
    if (!("spellProgression" in jobs[this.job])) {
      return 0;
    }

    let spellSlots = this.querySpellLevelMaximums().reduce(
      (sum, current) => sum + current,
      0
    );

    if (this.job == "Wizard") {
      spellSlots += 2; //for Utility and Cantrip
      if (this.jobTalents.includes("High Arcana")) {
        spellSlots += 1;
      }
    } else if (this.job == "Cleric") {
      spellSlots += 1; //for the Heal cantrip
    }

    return spellSlots;
  }

  querySpellsOwnedCount() {
    if (!"spellList" in jobs[this.job]) {
      return 0;
    }

    let spellCount = 0;
    if (
      "Utility" in jobs[this.job].spellList &&
      !this.jobSpells.some((spell) => Object.keys(spell)[0] == "Utility Spell")
    ) {
      spellCount++;
    }

    if ("Level 0" in jobs[this.job].spellList) {
      spellCount++;
    }

    spellCount += this.jobSpells.length;

    return spellCount;
  }

  querySpellLevelMinimum() {
    return this.querySpellLevelMaximums().findIndex((num) => num > 0) * 2 + 1;
  }

  querySpellLevelMaximums() {
    if ("spellProgression" in jobs[this.job]) {
      let spellMaxCounts = [
        ...jobs[this.job].spellProgression[Math.max(0, this.level - 1)],
      ];

      if (this.jobTalents.includes("Spellsinger")) {
        spellMaxCounts[spellMaxCounts.findIndex((num) => num > 0)] += 1;
      }

      return spellMaxCounts;
    } else {
      return [0, 0, 0, 0, 0];
    }
  }

  #querySpellLevelCurrentCounts() {
    let spellCounts = [0, 0, 0, 0, 0];

    this.jobSpells.forEach((spell) => {
      const spellLevel = Number(Object.values(spell)[0].substring(6));
      spellCounts[parseInt(spellLevel / 2)] += 1;
    });

    return spellCounts;
  }

  querySpellLevelsRemaining() {
    return this.querySpellLevelMaximums().map(
      (item, index) => item - this.#querySpellLevelCurrentCounts()[index]
    );
  }

  // for most jobs, returns a single number
  // for barbarian (and other non-core class?), however, returns an array [adventurer max, champ max, epic max]
  queryTalentsMax() {
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
        counts[tiers.indexOf(jobs[this.job].talentChoices[talent].Type)] += 1;
      });

      return counts;
    } else {
      return this.jobTalents.length;
    }
  }

  //for most jobs, returns an array with one number [#]
  // for barbarian (or other non-core classes?), however, returns an array [adventurer #, champ #, epic #]
  queryTalentsRemaining() {
    const currentTalentCounts = this.#queryTalentsCurrentCounts();
    const maxTalents = this.queryTalentsMax();

    const hasTieredTalents = "Adventurer" in jobs[this.job].talentProgression;

    if (hasTieredTalents) {
      let advTalentsRemain = maxTalents[0] - currentTalentCounts[0];
      let champTalentsRemain = maxTalents[1] - currentTalentCounts[1];
      let epicTalentsRemain = maxTalents[2] - currentTalentCounts[2];

      // excess adv talents will try to borrow from remaining champ (which may also end up trying to borrow from epic)
      if (advTalentsRemain < 0 && champTalentsRemain > 0) {
        champTalentsRemain += advTalentsRemain;
        advTalentsRemain = 0;
      } else if (advTalentsRemain < 0 && epicTalentsRemain > 0) {
        champTalentsRemain += advTalentsRemain;
        advTalentsRemain = 0;
      }

      // excess champ talents will try to borrow from remaining epic talents
      if (champTalentsRemain < 0 && epicTalentsRemain > 0) {
        epicTalentsRemain += champTalentsRemain;
        champTalentsRemain = 0;
      }

      return [advTalentsRemain, champTalentsRemain, epicTalentsRemain];
    } else {
      return [maxTalents - currentTalentCounts];
    }
  }

  #queryFamiliarAbsMax() {
    //order matters in these control statements. Epic must be before Adventurer
    if (
      !this.jobTalents.includes("Wizard's Familiar") &&
      !this.jobTalents.includes("Sorcerer's Familiar")
    ) {
      return 0;
    } else if (
      this.feats.some((feat) => feat["Sorcerer's Familiar"] == "Epic")
    ) {
      return 5;
    } else if (
      this.feats.some(
        (feat) =>
          feat["Wizard's Familiar"] == "Epic" ||
          feat["Sorcerer's Familiar"] == "Adventurer"
      )
    ) {
      return 4;
    } else if (
      this.feats.some((feat) => feat["Wizard's Familiar"] == "Adventurer") ||
      this.jobTalents.includes("Sorcerer's Familiar")
    ) {
      return 3;
    } else {
      return 2;
    }
  }

  #queryFamiliarAbsCurrent() {
    return this.familiarAbs.length;
  }

  queryFamiliarAbilitiesRemaining() {
    return this.#queryFamiliarAbsMax() - this.#queryFamiliarAbsCurrent();
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

  //gives number of Animal Companion feats; used for expanding animal companion box in case user really wants to load up on AC feats
  queryACFeatsCount() {
    let count = 0;
    if ("ACFeats" in jobs[this.job]) {
      count = this.feats.filter((ownedFeat) =>
        Object.keys(jobs[this.job].ACFeats).includes(Object.keys(ownedFeat)[0])
      ).length;
    }
    return count;
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
  }
}
