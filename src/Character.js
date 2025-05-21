import races from "./data/races";
import jobs from "./data/jobs";
import icons from "./data/icons.json";
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
    items,
    gold
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
    this.jobTalents = [...jobTalents]; //an array of strings
    this.jobSpells = jobSpells.map((spell) => ({ ...spell })); //an array of objects {"Acid Arrow": "Level 1"}
    this.jobBonusAbs = [...jobBonusAbs]; //an array of strings
    this.feats = feats.map((f) => ({ ...f })); //an array of objects {"Linguist": "Champion"}
    this.familiarAbs = [...familiarAbs]; //an array of strings
    this.bonusOptions = bonusOptions.map((opt) => ({ ...opt })); //an array of objects ["Mythkenner": "A", "Mythkenner": "B"]

    this.#trimFeatsAndAbilities(); //removes feats, talents, spells, etc incompatible with job, race, and new level

    this.armorType = armorType; //a string, "None", "Light", or "Heavy"
    this.hasShield = hasShield == "Shield"; //boolean
    this.weaponType = weaponType; //an object {"melee": meleeString, "ranged": rangedString}
    this.oneUniqueThing = oneUniqueThing; //a longer string
    this.iconRelationships = iconRelationships; //an array of objects, [{name: Archmage, value: 2, type: Conflicted}]
    this.backgrounds = backgrounds; //an array of objects, like [{name: street thief, value: 4}, {name: magician, value: 2}]
    this.items = items; //an array of user-inputted strings "Longsword +1"
    this.gold = gold; //an integer

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
    }

    //if player removes familiar as a talent, it also removes associated information
    if (
      !this.jobTalents.includes("Wizard's Familiar") &&
      !this.jobTalents.includes("Sorcerer's Familiar") &&
      !this.jobTalents.includes("Ranger's Pet")
    ) {
      this.familiarAbs = [];
    }

    //if player removes a talent that has bonus options, it also removes associated information
    //needs a special addition for Bard's Jack of Spells Wizard choice's cantrips, which have a different key name
    this.bonusOptions = this.bonusOptions.filter(
      (bonusOp) =>
        this.jobTalents.includes(Object.keys(bonusOp)[0]) ||
        (Object.keys(bonusOp)[0] == "Cantrips" &&
          this.jobTalents.includes("Jack of Spells"))
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
    const baseHP = jobs[this.job].baseHP;

    //'toughness' feat bonus
    let bonusHP = 0;
    if (this.queryFeatHighestTier("Toughness")) {
      if (this.level >= 8) {
        bonusHP = baseHP * 2;
      } else if (this.level >= 5) {
        bonusHP = baseHP;
      } else {
        bonusHP = Math.floor(baseHP / 2);
      }
    }

    //(base value + con mod) * level multiplier
    return (
      (baseHP + this.abilityModifiers.con) * levelToMultiplierMap[this.level] +
      bonusHP
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

    //adjust for Paladin
    let talentMod = 0;
    if (this.jobTalents.includes("Bastion")) {
      talentMod += 1;
    }

    //adjust for Sorcerer
    if (this.jobTalents.includes("Spell Fist")) {
      talentMod += 2;
    }

    return baseAC + shieldBonus + bonusMod + talentMod + this.level;
  }

  calculatePD() {
    //base PD from class/job + middle value of str, con, dex modifier + level
    const basePD = jobs[this.job].PD;
    const bonusMod = this.#getMiddleMod([
      this.abilityModifiers.str,
      this.abilityModifiers.con,
      this.abilityModifiers.dex,
    ]);

    let featBonus = 0;
    //Barbarian adjustments
    if (this.queryFeatIsOwned("Strongheart", "Champion")) featBonus += 1;

    // Paladin adjustments
    if (this.queryFeatIsOwned("Implacable", "Epic")) featBonus += 1;

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

    let featBonus = 0;
    // Paladin adjustments
    if (this.queryFeatIsOwned("Implacable", "Epic")) featBonus += 1;

    // Rogue adjustments
    if (this.queryFeatHighestTier("Cunning")) featBonus += 1;

    return baseMD + bonusMod + featBonus + this.level;
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

    // Adjustments for Barbarian
    if (this.jobTalents.includes("Strongheart")) {
      const SHHighestTier = this.queryFeatHighestTier("Strongheart");

      if (SHHighestTier == "Adventurer") uses += 1;
      else if (SHHighestTier == "Epic") uses += 2;

      diceSize = 12;
    }

    //Adjustments for Fighter
    if (this.queryFeatHighestTier("Extra Tough")) uses += 1;
    if (this.queryFeatIsOwned("Tough as Iron", "Champion")) uses += 2;

    //Adjustments for Paladin
    if (this.queryFeatIsOwned("Bastion", "Adventurer")) uses += 1;

    //Adjustments for Ranger
    if (this.jobTalents.some((talent) => talent.startsWith("AC - "))) uses += 2;

    //Adjustments for Sorcerer
    if (this.queryFeatHighestTier("Undead Remnant Heritage")) uses -= 1;

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
    //Note that DW (Dual Wield) uses 1H stats - but will get some adjustments for certain talents or feats
    let weaponData =
      jobs[this.job][attackType][
        weaponStringSplit[0] == "DW" ? "1H" : weaponStringSplit[0]
      ][weaponStringSplit[1]]; //{ATK: #, DMG: #}

    //get highest mod in case of multiple abilities
    let highestMod = this.#getHighestMod(jobs[this.job][attackType].Ability);

    //get armor and shield adjustments
    const shieldAdjustment = this.hasShield
      ? jobs[this.job].armor.Shield.ATK
      : 0;
    const armorAdjustment = jobs[this.job].armor[this.armorType].ATK;

    // ATK ROLL STRING
    let rollMod =
      highestMod +
      this.level +
      shieldAdjustment +
      armorAdjustment +
      weaponData.ATK;
    let hasAtkPenalty = weaponData.ATK < 0;

    //adjustments for Cleric
    if (
      this.jobTalents.includes("D: Strength") &&
      weaponStringSplit[1].endsWith("Heavy") &&
      attackType == "melee" &&
      weaponData.ATK < 0
    ) {
      rollMod += 2;
      hasAtkPenalty = false;
    }

    //adjustments for Ranger
    if (
      this.jobTalents.includes("Two-Weapon Mastery") &&
      weaponStringSplit[0].startsWith("DW")
    ) {
      rollMod += 1;
    }

    //adjustments for Sorcerer
    if (this.queryFeatIsOwned("Undead Remnant Heritage", "Epic")) rollMod += 1;

    //adjustments for heritage of the sword
    // removes ATK penalty, if it exists
    // Otherwise damage gets increased (added in the code below)
    if (
      this.queryFeatIsOwned("Heritage of the Sword", "Adventurer") &&
      attackType == "melee" &&
      (weaponData.DMG == 6 || weaponData.DMG == 8) &&
      hasAtkPenalty
    ) {
      rollMod -= weaponData.ATK;
    }

    const rollAbModPlusOrMinus = rollMod >= 0 ? "+" : "";
    atkArray.push(`${rollAbModPlusOrMinus + rollMod} vs AC`);
    // END ATK ROLL STRING

    // DAMAGE STRING
    //ability modifier gets multiplied at higher levels
    if (this.level >= 8) {
      highestMod *= 3;
    } else if (this.level >= 5) {
      highestMod *= 2;
    }

    //adjustments for Heritage of the Sword
    let dmgDiceBonus = 0;
    if (
      this.queryFeatIsOwned("Heritage of the Sword", "Adventurer") &&
      !hasAtkPenalty &&
      attackType == "melee" &&
      (weaponData.DMG == 6 || weaponData.DMG == 8)
    ) {
      dmgDiceBonus = 2;
    }

    //adjustments for fighter
    if (
      this.jobTalents.includes("Deadeye Archer") &&
      attackType == "ranged" &&
      weaponStringSplit[0] != "Thrown" &&
      (weaponData.DMG == 8 || weaponData.DMG == 6)
    ) {
      dmgDiceBonus += 2;
    }

    //adjustments for ranger
    let alternateDmg = "";
    if (
      this.jobTalents.includes("Double Melee Attack") &&
      weaponStringSplit[0].startsWith("DW")
    ) {
      alternateDmg = `(${weaponData.DMG + dmgDiceBonus - 2})`;
    }
    if (
      this.jobTalents.includes("Double Ranged Attack") &&
      attackType == "ranged"
    ) {
      alternateDmg = `(${weaponData.DMG - 2})`;
    }

    const dmgAbModPlusOrMinus = highestMod >= 0 ? "+" : "";
    atkArray.push(
      `${this.level}d${weaponData.DMG + dmgDiceBonus + alternateDmg}${
        dmgAbModPlusOrMinus + highestMod
      }`
    );
    // END DAMAGE STRING

    // MISS DAMAGE
    let missDmg =
      jobs[this.job][attackType]["Miss"] == "Level" ? this.level : 0;

    //adjustments for fighter
    if (
      this.jobTalents.includes("Deadeye Archer") &&
      attackType == "ranged" &&
      weaponStringSplit[0] != "Thrown" &&
      (weaponData.DMG == 8 || weaponData.DMG == 6)
    ) {
      missDmg = this.level;
    }

    //adjustments for ranger
    //this bonus is for 'adventurer' feat, which must always be taken first, hence why I don't bother checking tier
    if (
      weaponStringSplit[0].startsWith("DW") &&
      this.queryFeatHighestTier("Two-Weapon Mastery")
    ) {
      missDmg += this.level;
    }

    atkArray.push(missDmg);
    // END MISS DAMAGE

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
  // bard's jack of spells cantrips are called elsewhere, as subOptions
  getCantrips() {
    const list = Object.fromEntries(
      Object.entries(jobs[this.job].spellList).filter(
        ([_, data]) => data.baseLevel == 0
      )
    );

    return list;
  }

  //in core, only wizard should be calling for this
  getUtilitySpells() {
    if (
      !("spellList" in jobs[this.job]) ||
      !("Utility" in jobs[this.job].spellList)
    )
      return [];

    const list = Object.entries(jobs[this.job].spellList.Utility).map(
      ([name, data]) => ({ [name]: data })
    );

    return list;
  }

  #getOptions(type, sourceData, ownedThings, filterFn = () => true) {
    let owned = [];
    let potential = [];

    // owned spells are added into potential no matter what
    // this prevents issues with things like a player having a level 9 spell but then lowering their level to 7
    // without checking this, that level 9 spell would not be displayed
    const abilityNames = new Set(
      ownedThings.map((entry) =>
        typeof entry == "object" ? Object.keys(entry)[0] : entry
      )
    );

    if (type === "familiarAbs") {
      potential = Object.entries(sourceData)
        .filter(([_, tiers]) => filterFn(tiers))
        .map(([name, description]) => ({
          [name]: description,
        }));
    } else {
      potential = Object.entries(sourceData)
        .filter(([name, data]) => filterFn(data) || abilityNames.has(name))
        .map(([name, data]) => ({
          [name]: {
            ...data,
            Level: data?.baseLevel ?? 0,
          },
        }));
    }

    // special additions from various talents and features
    if (type == "spells") {
      if (Object.keys(jobs[this.job].features).includes("Access to Wizardry")) {
        const wizardAdditions = Object.entries(
          jobs["Wizard"].spellList
        ).flatMap(([name, data]) => {
          const adjustedLevel = data.baseLevel + 2;
          return data.baseLevel !== 0 &&
            (this.level >= adjustedLevel || abilityNames.has(name))
            ? [
                {
                  [name]: {
                    ...data,
                    Level: adjustedLevel,
                    Source: "Wizard",
                    SLPenalty: -2,
                  },
                },
              ]
            : [];
        });

        potential.push(...wizardAdditions);
      }

      // Ranger spell additions
      if (this.job == "Ranger") {
        let talentJobPairs = [
          { "Fey Queen's Enchantments": "Sorcerer" },
          { "Ranger ex Cathedral": "Cleric" },
        ];
        talentJobPairs.forEach((pair) => {
          const talent = Object.keys(pair)[0];
          const source = pair[talent];
          const maxSpells = this.queryFeatIsOwned(talent, "Epic") ? 2 : 1;
          const ownedSpellCount =
            this.#queryOwnedAbilitiesByClass("Spells")[source].length;

          let acceptableFreq = ["Daily", "Recha"]; // use first 5 characters only!
          if (this.queryFeatIsOwned(talent, "Champion")) {
            acceptableFreq.push("At-Wi"); //first 5 characters again!
          }

          let filteredSpells = Object.entries(jobs[source].spellList)
            .filter(
              ([name, data]) =>
                abilityNames.has(name) ||
                (this.jobTalents.includes(talent) &&
                  filterFn(data) &&
                  acceptableFreq.includes(data.Frequency?.substring(0, 5)) &&
                  ownedSpellCount < maxSpells)
            )
            .flatMap(([spellName, data]) => {
              return [
                {
                  [spellName]: {
                    ...data,
                    Level: this.level % 2 == 0 ? this.level - 1 : this.level,
                    Source: source,
                  },
                },
              ];
            });

          potential.push(...filteredSpells);
        });
      }

      //Bard's Jack of Spells additions
      if (this.job == "Bard") {
        const options = this.bonusOptions
          .filter((bo) => Object.keys(bo)[0] == "Jack of Spells")
          .map((bo) => Object.values(bo)[0]);
        const potentialSources = ["Cleric", "Sorcerer", "Wizard"];
        const validSources = options
          ? options.map(
              (option) =>
                jobs["Bard"].talentChoices["Jack of Spells"]["Options"][option]
            )
          : [];

        potentialSources.forEach((source) => {
          const ownedSpellCount =
            this.#queryOwnedAbilitiesByClass("Spells")[source].length;

          let filteredSpells = Object.entries(jobs[source].spellList)
            .filter(
              ([name, data]) =>
                abilityNames.has(name) ||
                (filterFn(data) &&
                  validSources.includes(source) &&
                  ownedSpellCount < 1)
            )
            .flatMap(([spellName, data]) => {
              return [
                {
                  [spellName]: {
                    ...data,
                    Level: this.level % 2 == 0 ? this.level - 1 : this.level,
                    Source: source,
                  },
                },
              ];
            });

          potential.push(...filteredSpells);
        });
      }

      // Utility spell can be added multiple times, if it's available
      if ("Utility Spell" in jobs[this.job].features) {
        potential.unshift({
          "Utility Spell": {
            Level: 1,
            Effect: "Take a spell-slot to allow using utility spells",
            "Level 3": "Levitate; Message; Speak with Item",
            "Level 5": "Water Breathing",
            "Level 7": "Scrying",
            "Level 9": "Upgrades only",
          },
        });
      }

      // Cleric(or Paladin) + Wizard(or Bard) special additions
      if (
        this.job === "Cleric" ||
        this.queryFeatIsOwned("Cleric Training", "Champion")
      ) {
        owned.push({ Heal: { ...jobs["Cleric"].spellList.Heal, Level: 0 } });
      } else if (this.job === "Wizard") {
        owned.push({
          Cantrips: {
            Type: "Ranged",
            Frequency: "At-will",
            Action: "Standard",
            Level: 0,
          },
        });

        if (this.jobTalents.includes("High Arcana")) {
          owned.push({
            "Counter-magic":
              jobs["Wizard"].talentChoices["High Arcana"]["Counter-magic"],
          });
        }
      } else if (
        this.bonusOptions.some(
          (bo) =>
            Object.keys(bo)[0] == "Jack of Spells" &&
            Object.values(bo)[0] == "C"
        )
      ) {
        owned.push({
          Cantrips: {
            Type: "Ranged",
            Frequency: "At-will",
            Action: "Standard.",
            Extra: "Choose 3 Cantrips:",
            Level: 0,
          },
        });
      }
    }

    // Special additions for bonus abs
    // Rogue's thief strike
    if (type === "bonusAbs") {
      if (this.queryFeatHighestTier("Thievery")) {
        owned.push({
          "Thief's Strike": {
            ...jobs["Rogue"].bonusAbilitySet["Thief's Strike"],
            Level: 1,
          },
        });
        const index = potential.findIndex((f) => "Thief's Strike" in f);
        if (index !== -1) {
          potential.splice(index, 1);
        }
      }
    }

    // Special additions for talents
    // Paladin's divine domains
    const maxDomains = this.jobTalents.filter((talent) =>
      talent.startsWith("Divine Domain")
    ).length;
    const ownedDomains = this.jobTalents.filter((talent) =>
      talent.startsWith("D: ")
    ).length;

    if (type === "talents") {
      const clericDomainTalents = Object.entries(jobs["Cleric"].talentChoices)
        .filter(
          ([name, _]) =>
            (this.job != "Cleric" && abilityNames.has(name)) ||
            (maxDomains > 0 && maxDomains > ownedDomains)
        )
        .map(([name, data]) => ({
          [name]: { ...data, Source: "Cleric" },
        }));

      potential.push(...clericDomainTalents);
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
          // because there's potentially duplicate spell entries (utility spell)
          // we need to make a deep copy
          const spellItem = JSON.parse(JSON.stringify(potential[index]));
          spellItem[itemName].Level = parseInt(
            Object.values(item)[0].replace("Level ", ""),
            10
          );
          owned.push(spellItem);
        } else {
          owned.push(potential[index]);
        }

        //Utility spell can be taken multiple time
        if (itemName != "Utility Spell") {
          potential.splice(index, 1);
        }
      }
    });

    //Special removal for Paladin talents
    if (type == "talents") {
      if (this.level < 8) {
        potential = potential.filter(
          (talent) => !Object.keys(talent)[0].endsWith("(E)")
        );
      }

      if (this.level < 5) {
        potential = potential.filter(
          (talent) => !Object.keys(talent)[0].endsWith("(C)")
        );
      }
    }

    return { owned, potential };
  }

  //in core, only Bard, Fighter, and Rogue should be calling this
  getBonusAbs() {
    return this.#getOptions(
      "bonusAbs",
      jobs[this.job].bonusAbilitySet,
      this.jobBonusAbs,
      (data) => data.baseLevel <= this.level // Filter based on baseLevel now
    );
  }

  //type can be "general" or "racial" or "ac" (animal companion)
  //this gives STAND ALONE (or ANIMAL COMPANION) feats only, separated into { owned, potential }
  getFeats(type) {
    let source;
    let filterFn = () => true;
    if (type.toLowerCase() === "racial") {
      source = races[this.race]?.racialPowersAndFeats || {};
      filterFn = (data) => !("Base" in data);
    } else if (type.toLowerCase() === "general") {
      source = genFeats;
    } else if (type.toLowerCase() === "ac" && "ACFeats" in jobs[this.job]) {
      source = jobs[this.job].ACFeats;
    } else {
      return { owned: [], potential: [] };
    }
    return this.#getOptions("feats", source, this.feats, filterFn);
  }

  getFeatures() {
    let features = [];

    Object.entries(races[this.race].racialPowersAndFeats).forEach(
      ([title, obj]) => {
        if (Object.keys(obj)[0] === "Base") {
          features.push({ [title]: obj, removable: false });
        }
      }
    );

    Object.entries(jobs[this.job].features).forEach(([title, obj]) => {
      features.push({ [title]: obj, removable: false });
    });

    //special removal if a ranger lacks Animal Companion
    if (!this.jobTalents.some((talent) => talent.startsWith("AC - "))) {
      features = features.filter((feature) => !("Animal Companion" in feature));
    }

    //special addition for paladin's divine domain
    if (
      this.jobTalents.filter((talent) => talent.startsWith("Divine Domain"))
        .length > 0
    ) {
      features.push({ Invocation: jobs["Cleric"].features.Invocation });
    }

    //special addition for bard's jack of spells
    if (this.jobTalents.includes("Jack of Spells")) {
      const jackOfSpellsOptions = this.bonusOptions.filter(
        (bo) => Object.keys(bo) == "Jack of Spells"
      );
      jackOfSpellsOptions.forEach((option) => {
        const optionVal = Object.values(option)[0];
        //A = Cleric, B = Sorcerer, C = Wizard
        if (optionVal == "B") {
          features.push({
            "Dancing Lights": jobs["Sorcerer"].features["Dancing Lights"],
          });
        } else if (optionVal == "C") {
          features.push({ Cantrips: jobs["Wizard"].features.Cantrips });
        }
      });
    }

    return features;
  }

  //this gives spells, separated into { owned, potential }
  getSpells() {
    let spellList = jobs[this.job]?.spellList ?? {};

    return this.#getOptions(
      "spells",
      spellList,
      this.jobSpells,
      (data) =>
        data.baseLevel !== "Utility" &&
        data.baseLevel !== 0 &&
        data.baseLevel <= this.level
    );
  }

  //this gives talents, separated into { owned, potential }
  getTalents() {
    let talentChoices = jobs[this.job].talentChoices;

    return this.#getOptions("talents", talentChoices, this.jobTalents);
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

  //returns an array [totalPointsMax, maxPerBG, maxExceptions]
  queryBackgroundMax() {
    let maxTotal = 8;
    let maxDefault = 5;
    let maxExceptions = [];

    //adjustments for Bard's Loremaster and Mythkenner
    if (
      this.bonusOptions.some(
        (option) =>
          (Object.keys(option)[0] == "Loremaster" ||
            Object.keys(option)[0] == "Mythkenner") &&
          Object.values(option)[0] == "B"
      )
    ) {
      maxTotal += 2;
      maxExceptions.push(6);
    }

    //adjustments for Cleric's Domain of Knowledge
    if (this.jobTalents.includes("D: Knowledge/Lore")) {
      maxTotal += 4;
    }

    //adjustments for Ranger's Tracking
    if (this.jobTalents.includes("Tracker")) {
      maxTotal += 5;
    }

    //adjustments for Rogue
    if (this.jobTalents.includes("Cunning")) {
      maxTotal += 2;
    }
    if (this.jobTalents.includes("Thievery")) {
      maxTotal += 5;
    }

    //adjustments for Sorcerer
    if (this.jobTalents.includes("Arcane Heritage")) {
      maxTotal += 2;
    }

    //adjustments for Further Backgrounding
    const highestFBFeat = this.queryFeatHighestTier("Further Backgrounding");
    if (highestFBFeat === "Epic") {
      maxTotal += 7;
      maxExceptions.push(7);
    } else if (highestFBFeat === "Champion") {
      maxTotal += 5;
    } else if (highestFBFeat === "Adventurer") {
      maxTotal += 2;
    }

    return [maxTotal, maxDefault, maxExceptions];
  }

  queryBonusAbsTitle() {
    return jobs[this.job]?.bonusAbilityName ?? "";
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

  #queryFamiliarAbsMax() {
    //order matters in these control statements. Epic must be before Adventurer
    const sorcPetFeat = this.queryFeatHighestTier("Sorcerer's Familiar");
    const rangPetFeat = this.queryFeatHighestTier("Ranger's Pet");
    const wizPetFeat = this.queryFeatHighestTier("Wizard's Familiar");

    if (
      !this.jobTalents.some((talent) => talent.endsWith("Familiar")) &&
      !this.jobTalents.includes("Ranger's Pet")
    ) {
      return 0;
    } else if (sorcPetFeat == "Epic" || rangPetFeat == "Epic") return 5;
    else if (
      wizPetFeat == "Epic" ||
      sorcPetFeat == "Adventurer" ||
      rangPetFeat == "Champion"
    )
      return 4;
    else if (
      wizPetFeat == "Adventurer" ||
      rangPetFeat == "Adventurer" ||
      this.jobTalents.includes("Sorcerer's Familiar")
    )
      return 3;
    else return 2;
  }

  #queryFamiliarAbsCurrent() {
    //tough counts as 2
    return (
      this.familiarAbs.length + (this.familiarAbs.includes("Tough") ? 1 : 0)
    );
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

  // returns an array [totalPointsMax, maxPerIcon]
  queryIconRelationshipsMax() {
    let totalPointsMax = 3;
    let maxPerIcon = 3;

    // default level-based totals and maximums
    if (this.level >= 8) {
      totalPointsMax = 5;
      maxPerIcon = 4;
    } else if (this.level >= 5) {
      totalPointsMax = 4;
    }

    //adjustments from Bard talents
    // Loremaster & MythKenner, option C, give one additional point to use
    if (
      this.bonusOptions.some(
        (option) =>
          (Object.keys(option)[0] == "Loremaster" ||
            Object.keys(option)[0] == "Mythkenner") &&
          Object.values(option)[0] == "C"
      )
    ) {
      totalPointsMax += 1;
    }

    //adjustments from Cleric talents
    // Love & beauty give an additional 1 point (or 2 w/ associated feat) CONFLICTED relationship with heroic or ambiguous
    if (this.jobTalents.includes("D: Love/Beauty")) {
      totalPointsMax += 1;

      if (this.queryFeatHighestTier("D: Love/Beauty")) {
        totalPointsMax += 1;
      }
    }

    //adjustments from Paladin talents
    // Righteous Endeavor w/ epic feat gives +1 relationship points with a heroic or ambiguous icon
    // Way of Evil Bastards gives the same but with villainous or ambiguous icon
    if (this.queryFeatIsOwned("Path of Universal Righteous Endeavor", "Epic")) {
      totalPointsMax += 1;
    } else if (this.queryFeatIsOwned("Way of Evil Bastards", "Epic")) {
      totalPointsMax += 1;
    }

    //adjustments from Sorcerer talents
    // gives an extra 1 point to spend on icon relationships matching the 'heritage'
    if (this.jobTalents.includes("Blood Link")) {
      totalPointsMax += 1;

      // don't need to check which tier because there's only one choice
      if (this.queryFeatHighestTier("Blood Link")) {
        totalPointsMax += 1;
      }
    }

    return [totalPointsMax, maxPerIcon];
  }

  // returns an empty array if no error
  // otherwise returns an array of strings describing errors
  queryIconRelationshipsHaveError(iconRelationships = this.iconRelationships) {
    const [maxTotal, maxPerIcon] = this.queryIconRelationshipsMax();

    // heroic: 3, 3, 1
    // ambiguous: 3, 3, 2
    // villainous: 1, 2, 2
    const maxHeroic = {
      positive: maxPerIcon,
      conflicted: maxPerIcon,
      negative: maxPerIcon - 2,
    };
    const maxAmbiguous = {
      positive: maxPerIcon,
      conflicted: maxPerIcon,
      negative: maxPerIcon - 1,
    };
    const maxVillainous = {
      positive: maxPerIcon - 2,
      conflicted: maxPerIcon - 1,
      negative: maxPerIcon - 1,
    };
    const maxValues = {
      heroic: maxHeroic,
      ambiguous: maxAmbiguous,
      villainous: maxVillainous,
    };

    let errors = [];
    let total = 0;
    let conflictedHeroicAmbiguous = 0;
    let moralityTotals = { heroic: 0, ambiguous: 0, villainous: 0 };

    let heritageIcons = [];
    if (this.jobTalents.includes("Arcane Heritage"))
      heritageIcons.push("archmage");
    if (this.jobTalents.includes("Chromatic Destroyer Heritage"))
      heritageIcons.push("three", "the three");
    if (this.jobTalents.includes("Fey Heritage"))
      heritageIcons.push("elf queen");
    if (this.jobTalents.includes("infernal heritage"))
      heritageIcons.push("diabolist");
    if (this.jobTalents.includes("Metallic Protector Heritage"))
      heritageIcons.push("great gold wyrm");
    if (this.jobTalents.includes("Undead Remnant Heritage"))
      heritageIcons.push("lich king");

    let heritagePoints = 0;

    iconRelationships.forEach((iconObj) => {
      const iconName = iconObj.name;
      const relationshipType = iconObj.type;
      const relationshipDice = iconObj.value;
      total += relationshipDice;

      const moralityTypes =
        iconName.toLowerCase() in icons
          ? icons[iconName.toLowerCase()].types
          : ["heroic", "ambiguous", "villainous"];

      let maxValue = 0;
      moralityTypes.forEach((mt) => {
        moralityTotals[mt] += relationshipDice;

        const newVal = maxValues[mt][relationshipType];
        if (newVal > maxValue) maxValue = newVal;
      });

      if (relationshipDice > maxValue) {
        errors.push(
          `${relationshipType} relationship with ${iconName} is too high`
        );
      }

      if (
        relationshipType == "conflicted" &&
        (moralityTypes.includes("heroic") ||
          moralityTypes.includes("ambiguous"))
      ) {
        conflictedHeroicAmbiguous += relationshipDice;
      }

      if (heritageIcons.includes(iconName.toLowerCase()))
        heritagePoints += relationshipDice;
    });

    if (total != maxTotal) {
      errors.push(
        `Your total icon points (${total}) is not equal to your points available (${maxTotal}).`
      );
    }

    // Cleric's Love & beauty domain give an additional 1 point (or 2 w/ associated feat) CONFLICTED relationship with heroic or ambiguous
    if (this.jobTalents.includes("D: Love/Beauty")) {
      let minRelatedPoints = 1;
      if (this.queryFeatHighestTier("D: Love/Beauty")) {
        minRelatedPoints = 2;
      }

      if (conflictedHeroicAmbiguous < minRelatedPoints) {
        errors.push(
          `Your Love/Beauty domain + feat requires ${minRelatedPoints} points spent in a conflicted relationship with a heroic or ambiguous icon.`
        );
      }
    }

    // Paladin's Righteous Endeavor w/ epic feat gives +1 relationship points with a heroic or ambiguous icon
    // Way of Evil Bastards gives the same but with villainous or ambiguous icon
    if (this.queryFeatIsOwned("Path of Universal Righteous Endeavor", "Epic")) {
      if (moralityTotals.heroic == 0 && moralityTotals.ambiguous == 0) {
        errors.push(
          "Your epic feat in Path of Universal Righteous Endeavor talent requires at least 1 point in a relationship with a heroic or ambiguous icon."
        );
      }
    } else if (this.queryFeatIsOwned("Way of Evil Bastards", "Epic")) {
      if (moralityTotals.villainous == 0 && moralityTotals.ambiguous == 0) {
        errors.push(
          "Your epic feat in Way of Evil Bastards talent requires at least 1 point in a relationship with a villainous or ambiguous icon."
        );
      }
    }

    //adjustments from Sorcerer talents
    // gives an extra 1 point to spend on icon relationships matching the 'heritage' (see code below)
    if (this.jobTalents.includes("Blood Link")) {
      let minBloodLinkPoints = 1;

      // don't need to check which tier because there's only one choice
      if (this.queryFeatHighestTier("Blood Link")) minBloodLinkPoints += 1;

      if (heritagePoints < minBloodLinkPoints) {
        errors.push(
          `Your Blood Link talent requires at least ${minBloodLinkPoints} icon relationship points in an icon associated with your chosen heritage talents`
        );
      }
    }

    return errors;
  }

  //returns an array of strings of spell-names that are in error
  querySpellsHaveError() {
    let errorSpells = [];

    // class-based errors
    // only necessary for Ranger and Bard's cross-job spell talents
    const ownedJobSpells = this.#queryOwnedAbilitiesByClass("Spells");
    let maxAllowedSpells = { Bard: 0, Cleric: 0, Sorcerer: 0, Wizard: 0 };
    if (this.job in maxAllowedSpells) maxAllowedSpells[this.job] = 100;

    //paladin increase
    if (this.jobTalents.includes("Cleric Training")) {
      maxAllowedSpells["Cleric"] = 100;
    }

    const rangerTalents = [
      { "Fey Queen's Enchantments": "Sorcerer" },
      { "Ranger ex Cathedral": "Cleric" },
    ];
    rangerTalents.forEach((RT) => {
      const talentName = Object.keys(RT)[0];
      const source = Object.values(RT)[0];

      if (this.jobTalents.includes(talentName)) {
        const highestTier = this.queryFeatHighestTier(talentName);
        if (highestTier == "Epic") {
          maxAllowedSpells[source] += 2;
        } else {
          maxAllowedSpells[source] += 1;
        }
      }
    });

    // Bard additions
    const options = this.bonusOptions
      .filter((bo) => Object.keys(bo)[0] == "Jack of Spells")
      .map((bo) => Object.values(bo)[0]);
    const validSources = options
      ? options.map(
          (option) =>
            jobs["Bard"].talentChoices["Jack of Spells"]["Options"][option]
        )
      : [];
    validSources.forEach((vSource) => (maxAllowedSpells[vSource] += 1));

    //Bard Jack of Spells Cantrip option selection (error if 3 aren't selected)
    if (
      this.bonusOptions.some(
        (bo) =>
          Object.keys(bo)[0] == "Jack of Spells" && Object.values(bo)[0] == "C"
      )
    ) {
      const cantripChoiceNum = this.bonusOptions.filter(
        (bo) => Object.keys(bo)[0] == "Cantrips"
      ).length;
      if (cantripChoiceNum != 3) errorSpells.push("Cantrips");
    }

    Object.keys(maxAllowedSpells).forEach((source) => {
      let ownedSourceCount = 0;
      const ownedTalentsForThisSource = ownedJobSpells[source];
      if (ownedTalentsForThisSource.length > maxAllowedSpells[source]) {
        this.jobSpells.forEach((spell) => {
          const spellName = Object.keys(spell)[0];
          if (ownedTalentsForThisSource.includes(spellName)) {
            ownedSourceCount += 1;
            if (ownedSourceCount > maxAllowedSpells[source])
              errorSpells.push(spellName);
          }
        });
      }
    });

    //Basically we only worry about 'standard errors' once more specific errors are taken care of
    if (
      errorSpells.length == 0 ||
      (errorSpells.length == 1 && errorSpells[0] == "Cantrips")
    ) {
      // standard errors (too many at a given spellLevel)
      // this will also cover spells at too high or too low of a level
      const spellLevelMax = this.querySpellLevelMaximums();
      spellLevelMax.forEach((maxCount, index) => {
        const slotLevel = index * 2 + 1;
        let ownedSLCount = 0;
        this.jobSpells.forEach((spell) => {
          const spellLevel = Number(Object.values(spell)[0].substring(6));
          if (spellLevel == slotLevel) {
            ownedSLCount += 1;
            if (ownedSLCount > maxCount)
              errorSpells.push(Object.keys(spell)[0]);
          }
        });
      });
    }

    return errorSpells;
  }

  //Returns the total number of slots
  //Is this redundant with querySpellsOwnedCount? it might be.
  querySpellsMax() {
    let spellSlots = this.querySpellLevelMaximums().reduce(
      (sum, current) => sum + current,
      0
    );

    if (this.job == "Wizard") {
      spellSlots += 1; //for cantrip
      if (this.jobTalents.includes("High Arcana")) {
        spellSlots += 1;
      }
    } else if (this.job == "Cleric") {
      spellSlots += 1; //for the Heal cantrip
    } else if (
      this.bonusOptions.some(
        (bo) =>
          Object.keys(bo)[0] == "Jack of Spells" && Object.values(bo)[0] == "C"
      )
    ) {
      spellSlots += 1; //for cantrip
    }

    return spellSlots;
  }

  //returns a single number - used for adding lines in the spells block of AbilityBlock
  querySpellsOwnedCount() {
    let spellCount = this.jobSpells.length;

    // addition for heal and cantrip
    if (
      this.job == "Wizard" ||
      this.job == "Cleric" ||
      this.bonusOptions.some(
        (bo) =>
          Object.keys(bo)[0] == "Jack of Spells" && Object.values(bo)[0] == "C"
      )
    ) {
      spellCount++;
    }

    return spellCount;
  }

  //returns a single number - used for automatically leveling new spells to min
  //also used to restrict spell level reductions
  querySpellLevelMinimum() {
    return this.querySpellLevelMaximums().findIndex((num) => num > 0) * 2 + 1;
  }

  //returns an array [a, b, c, d, e] of the MAXIMUM spell count for each level (1, 3, 5, 7, 9)
  querySpellLevelMaximums() {
    let spellMaxCounts = [0, 0, 0, 0, 0];
    if ("spellProgression" in jobs[this.job]) {
      spellMaxCounts = [
        ...jobs[this.job].spellProgression[Math.max(0, this.level - 1)],
      ];

      if (this.jobTalents.includes("Spellsinger")) {
        spellMaxCounts[spellMaxCounts.findLastIndex((num) => num > 0)] += 1;
      }
    }

    //special cases for paladin and ranger
    // must follow the case where base talent gives 1 slot and epic feat gives 2
    const specialCaseTalents = [
      "Cleric Training",
      "Fey Queen's Enchantments",
      "Ranger ex Cathedral",
    ];
    specialCaseTalents.forEach((SCT) => {
      if (this.jobTalents.includes(SCT)) {
        if (this.queryFeatIsOwned(SCT, "Epic")) {
          spellMaxCounts[Math.floor((this.level - 1) / 2)] += 2;
        } else {
          spellMaxCounts[Math.floor((this.level - 1) / 2)] += 1;
        }
      }
    });

    //special case for bard's jack of spells
    if (this.jobTalents.includes("Jack of Spells")) {
      const highestJackTier = this.queryFeatHighestTier("Jack of Spells");
      if (highestJackTier == "Epic") {
        spellMaxCounts[Math.floor((this.level - 1) / 2)] += 3;
      } else if (highestJackTier == "Champion") {
        spellMaxCounts[Math.floor((this.level - 1) / 2)] += 2;
      } else {
        spellMaxCounts[Math.floor((this.level - 1) / 2)] += 1;
      }
    }

    return spellMaxCounts;
  }

  //returns an array [a, b, c, d, e] of the CURRENT spell count for each level (1, 3, 5, 7, 9)
  #querySpellLevelCurrentCounts() {
    let spellCounts = [0, 0, 0, 0, 0];

    this.jobSpells.forEach((spell) => {
      const spellLevel = Number(Object.values(spell)[0].substring(6));
      spellCounts[parseInt(spellLevel / 2)] += 1;
    });

    return spellCounts;
  }

  //returns an array [a, b, c, d, e] of the MAXIMUM - CURRENT spell count for each level (1, 3, 5, 7, 9)
  querySpellLevelsRemaining() {
    return this.querySpellLevelMaximums().map(
      (item, index) => item - this.#querySpellLevelCurrentCounts()[index]
    );
  }

  //returns an array [numChoices, subOptions]
  // where suboptions is itself an array filled with objects
  querySubOptions(abilityInfo) {
    let numChoices = abilityInfo.singleItem?.Options?.Count ?? 0;

    // for Bard's Jack of Spells
    const jackHighestTier = this.queryFeatHighestTier("Jack of Spells");
    if (abilityInfo.title == "Jack of Spells" && jackHighestTier == "Epic") {
      numChoices = 3;
    } else if (
      abilityInfo.title == "Jack of Spells" &&
      jackHighestTier == "Champion"
    ) {
      numChoices = 2;
    }

    // for Bard's Jack of Spells (Wizard) Cantrips
    if (
      abilityInfo.title == "Cantrips" &&
      abilityInfo.mode == "spells" &&
      this.bonusOptions.some(
        (bo) =>
          Object.keys(bo)[0] == "Jack of Spells" && Object.values(bo)[0] == "C"
      )
    ) {
      numChoices = 3;

      const subOptions = Object.entries(jobs["Wizard"].spellList)
        .filter(([_, data]) => data.baseLevel == 0)
        .map(([key, value]) => ({ [key]: value.Effect }));

      return [numChoices, subOptions];
    }

    // for Ranger's favored enemy
    const faveEnemyTier = this.queryFeatHighestTier("Favored Enemy");
    if (abilityInfo.title == "Favored Enemy" && faveEnemyTier == "Epic") {
      numChoices = 2;
    }

    const subOptions = Object.entries(abilityInfo.singleItem?.Options ?? {})
      .filter(([key, _]) => key !== "Count")
      .map(([key, value]) => ({ [key]: value }));

    return [numChoices, subOptions];
  }

  //used for abilities that pull from other classes
  //returns an object {"Cleric": ["Heal", "Blessing"], "Sorcerer": [], etc}
  #queryOwnedAbilitiesByClass(abilityType) {
    let ownedAbilities = {};
    const dataSource = abilityType == "Spells" ? "spellList" : "talentChoices";
    const ownedSource =
      abilityType == "Spells" ? this.jobSpells : this.jobTalents;

    Object.keys(jobs).forEach((job) => {
      if (dataSource in jobs[job]) {
        ownedAbilities[job] = [];

        Object.keys(jobs[job][dataSource]).forEach((abilityName) => {
          ownedSource.forEach((ability) => {
            const name =
              typeof ability == "string" ? ability : Object.keys(ability)[0];
            if (name === abilityName) {
              ownedAbilities[job].push(name);
            }
          });
        });
      }
    });

    return ownedAbilities;
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

      //adjustments for paladin's divine domain
      const maxDomains = this.jobTalents.filter((talent) =>
        talent.startsWith("Divine Domain")
      ).length;

      return maxTalents + maxDomains;
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
      //AC talents cost 2
      const animalAdjustment = this.jobTalents.some((talent) =>
        talent.startsWith("AC - ")
      )
        ? 1
        : 0;

      //Favored Enemy counts as 2 if humanoid suboption chosen
      const FEAdjustment = this.bonusOptions.some(
        (so) =>
          Object.keys(so)[0] == "Favored Enemy" && Object.values(so)[0] == "G"
      )
        ? 1
        : 0;
      return this.jobTalents.length + animalAdjustment + FEAdjustment;
    }
  }

  queryTalentsHaveError() {
    let errorTalents = [];

    // not enough options chosen
    this.jobTalents.forEach((talent) => {
      const abilityInfo = {
        title: talent,
        singleItem:
          talent in jobs[this.job].talentChoices
            ? jobs[this.job].talentChoices[talent]
            : null,
      };
      const maxChoices = abilityInfo ? this.querySubOptions(abilityInfo)[0] : 0;
      const currChoices = this.bonusOptions.filter(
        (bo) => Object.keys(bo)[0] == talent
      ).length;

      if (currChoices != maxChoices) {
        errorTalents.push(talent);
      }
    });

    const ownedTalentsByClass = this.#queryOwnedAbilitiesByClass("Talents");
    let maxAllowedTalents = {};
    Object.keys(jobs).forEach((job) => (maxAllowedTalents[job] = 0));
    maxAllowedTalents[this.job] = 100;

    //paladin increase for divine domain
    const divineDomainTalents = this.jobTalents.filter((talent) =>
      talent.startsWith("Divine Domain")
    );
    maxAllowedTalents["Cleric"] += divineDomainTalents.length;

    Object.keys(maxAllowedTalents).forEach((source) => {
      let ownedSourceCount = 0;
      const ownedTalentsForThisSource = ownedTalentsByClass[source];
      if (ownedTalentsForThisSource.length > maxAllowedTalents[source]) {
        this.jobTalents.forEach((talent) => {
          if (ownedTalentsForThisSource.includes(talent)) {
            ownedSourceCount += 1;
            if (ownedSourceCount > maxAllowedTalents[source])
              errorTalents.push(talent);
          }
        });
      }
    });

    if (errorTalents.length == 0) {
      // standard errors (too many talents overall or per tier, such as with barbarian)
      const talentsMax = this.queryTalentsMax();
      if (Array.isArray(talentsMax)) {
        const tiers = ["Adventurer", "Champion", "Epic"];
        let counts = [0, 0, 0];

        this.jobTalents.forEach((talent) => {
          const tierIndex = tiers.indexOf(
            jobs[this.job].talentChoices[talent].Type
          );
          counts[tierIndex] += 1;

          if (counts[tierIndex] > talentsMax[tierIndex])
            errorTalents.push(talent);
        });
      } else {
        let count = 0;
        this.jobTalents.forEach((talent) => {
          count++;
          if (count > talentsMax) errorTalents.push(talent);
        });
      }
    }

    return errorTalents;
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
}
