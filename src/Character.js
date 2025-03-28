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
    this.jobTalents = [...jobTalents]; //an array of strings
    this.jobSpells = jobSpells.map((spell) => ({ ...spell })); //an array of objects {"Acid Arrow": "Level 1"}
    this.jobBonusAbs = [...jobBonusAbs]; //an array of strings
    this.feats = feats.map((f) => ({ ...f })); //an array of objects {"Linguist": "Champion"}
    this.familiarAbs = [...familiarAbs]; //an array of strings
    this.bonusOptions = bonusOptions.map((opt) => ({ ...opt })); //an array of objects {"Mythkenner": ["A", "B"]}

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

    //if player removes any of the 'divine domain' talents, may also remove an associated domain
    if (this.job == "Paladin") {
      const maxDomains = this.jobTalents.filter((talent) =>
        talent.startsWith("Divine Domain")
      ).length;
      const ownedDomains = this.jobTalents.filter((talent) =>
        talent.startsWith("D: ")
      ).length;

      for (let i = 0; i < ownedDomains - maxDomains; i++) {
        const talentIndex = this.jobTalents.findLastIndex((talent) =>
          talent.startsWith("D: ")
        );
        const talentName = this.jobTalents[talentIndex];
        this.removeFeat(talentName, "Adventurer");
        this.jobTalents.splice(talentIndex);
      }
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
    if (this.feats.some((feat) => Object.keys(feat)[0] == "Toughness")) {
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
    if (
      this.feats.some(
        (feat) =>
          Object.keys(feat)[0] == "Strongheart" &&
          Object.values(feat)[0] == "Champion"
      )
    ) {
      featBonus += 1;
    }

    // Paladin adjustments
    if (
      this.feats.some(
        (feat) =>
          Object.keys(feat)[0] == "Implacable" &&
          Object.values(feat)[0] == "Epic"
      )
    ) {
      featBonus += 1;
    }

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
    if (
      this.feats.some(
        (feat) =>
          Object.keys(feat)[0] == "Implacable" &&
          Object.values(feat)[0] == "Epic"
      )
    ) {
      featBonus += 1;
    }

    // Rogue adjustments
    // since this feat is adventurer tier, no need to check for tier
    if (this.feats.some((feat) => Object.keys(feat)[0] == "Cunning")) {
      featBonus += 1;
    }

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

    //Adjustments for Fighter
    if (this.feats.some((feat) => Object.keys(feat)[0] == "Extra Tough")) {
      uses += 1;
    }
    if (
      this.feats.some(
        (feat) =>
          Object.keys(feat)[0] == "Tough as Iron" &&
          Object.values(feat)[0] == "Champion"
      )
    ) {
      uses += 2;
    }

    //Adjustments for Paladin
    if (
      this.feats.some(
        (feat) =>
          Object.keys(feat)[0] == "Bastion" &&
          Object.values(feat)[0] == "Adventurer"
      )
    ) {
      uses += 1;
    }

    //Adjustments for Ranger
    if (this.jobTalents.some((talent) => talent.startsWith("AC - "))) {
      uses += 2;
    }

    //Adjustments for Sorcerer
    if (
      this.feats.some(
        (feat) => Object.keys(feat)[0] == "Undead Remnant Heritage"
      )
    ) {
      uses -= 1;
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
    //Note that DW (Dual Wield) uses 1H stats - but will get some adjustments for certain talents or feats
    let weaponData =
      jobs[this.job][attackType][
        weaponStringSplit[0] == "DW" ? "1H" : weaponStringSplit[0]
      ][weaponStringSplit[1]]; //{ATK: #, DMG: #}

    //get highest mod in case of multiple abilities
    let highestMod = this.#getHighestMod(jobs[this.job][attackType].Ability);

    // ATK ROLL STRING
    let rollMod = highestMod + this.level + weaponData.ATK;

    //adjustments for Cleric
    if (
      this.jobTalents.includes("D: Strength") &&
      weaponStringSplit[1].endsWith("Heavy") &&
      attackType == "melee" &&
      weaponData.ATK < 0
    ) {
      rollMod += 2;
    }

    //adjustments for Ranger
    if (
      this.jobTalents.includes("Two-Weapon Mastery") &&
      weaponStringSplit[0].startsWith("DW")
    ) {
      rollMod += 1;
    }

    //adjustments for Sorcerer
    if (
      this.feats.some(
        (feat) =>
          Object.keys(feat)[0] == "Undead Remnant Heritage" &&
          Object.values(feat)[0] == "Epic"
      )
    ) {
      rollMod += 1;
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

    //adjustments for fighter
    let dmgDiceBonus = 0;
    if (
      this.jobTalents.includes("Deadeye Archer") &&
      attackType == "ranged" &&
      weaponStringSplit[0] != "Thrown" &&
      (weaponData.DMG == 8 || weaponData.DMG == 6)
    ) {
      dmgDiceBonus = 2;
    }

    //adjustments for ranger
    let alternateDmg = "";
    if (
      this.jobTalents.includes("Double Melee Attack") &&
      weaponStringSplit[0].startsWith("DW")
    ) {
      alternateDmg = `(${weaponData.DMG - 2})`;
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
      this.feats.some((feat) => Object.keys(feat)[0] == "Two-Weapon Mastery")
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
  getCantrips() {
    const list = Object.fromEntries(Object.entries(jobs[this.job].spellList).filter(
      ([_, data]) => data.baseLevel == 0
    ));

    return list;
  }

  //in core, only wizard should be calling for this
  getUtilitySpells() {
    if (!("spellList" in jobs[this.job]) || !("Utility" in jobs[this.job].spellList)) return [];
  
    const list = Object.entries(jobs[this.job].spellList.Utility)
      .map(([name, data]) => ({ [name]: data }));
  
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
    if (type == "spells"){
      if (Object.keys(jobs[this.job].features).includes("Access to Wizardry")) {
        const wizardAdditions = Object.entries(jobs["Wizard"].spellList)
          .flatMap(([name, data]) => {
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
      let talentJobPairs = [
        { "Fey Queen's Enchantments": "Sorcerer" },
        { "Ranger ex Cathedral": "Cleric" },
      ];
      talentJobPairs.forEach((pair) => {
        const talent = Object.keys(pair)[0];
        const source = pair[talent];
        const maxSpells = this.queryFeatIsOwned(talent, "Epic") ? 2 : 1;
        const ownedSpells = this.#querySpellsByClass()[source].length;
    
        let acceptableFreq = ["Daily", "Recha"]; // use first 5 characters only!
        if (this.queryFeatIsOwned(talent, "Champion")) {
          acceptableFreq.push("At-Wi"); //first 5 characters again!
        }
  
        let filteredSpells = Object.entries(jobs[source].spellList)
          .filter(([name, data]) => abilityNames.has(name) || (this.jobTalents.includes(talent) && filterFn(data) && acceptableFreq.includes(data.Frequency?.substring(0, 5)) && ownedSpells < maxSpells))
          .flatMap(([spellName, data]) => {
            return [{[spellName]: {...data, Level: this.level, Source: source}}]});
          
        potential.push(...filteredSpells)
      }
      );

      // Utility spell can be added multiple times, if it's available
      if ("Utility Spell" in jobs[this.job].features) {
        potential.unshift({
          "Utility Spell": {
            Level: 1,
            Effect:
              "Take a spell-slot to allow using utility spells",
            "Level 3": "Levitate; Message; Speak with Item",
            "Level 5": "Water Breathing",
            "Level 7": "Scrying",
            "Level 9": "Upgrades only",
          },
        });
      }

      if (this.job === "Cleric" || this.queryFeatIsOwned("Cleric Training", "Champion")) {
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
      }

    }

    // Special additions for spells
    // wizard's cantrip and counter-magic, cleric's heal
    // Owned spells for Ranger talents
    if (type === "spells") {
      /*const talentJobPairs = [
        { "Fey Queen's Enchantments": "Sorcerer" },
        { "Ranger ex Cathedral": "Cleric" },
      ];
      talentJobPairs.forEach((pair) => {
        const [name, source] = Object.entries(pair)[0];
        const ownedSpells = this.#querySpellsByClass()[source];
        const hasEpicFeat = this.feats.some(
          (feat) =>
            Object.keys(feat)[0] == name && Object.values(feat)[0] == "Epic"
        );
        const maxSpellsFromSource = hasEpicFeat ? 2 : 1;

        //We only need to include this special addition if there's no slots.
        if (
          this.jobTalents.includes(name) &&
          ownedSpells.length == maxSpellsFromSource
        ) {
          // Flatten all spells into a single { spellName: data } object
          const flattenedSpells = Object.entries(jobs[source].spellList).reduce(
            (acc, [level, spells]) => {
              Object.entries(spells).forEach(([spellName, data]) => {
                acc[spellName] = { ...data, Level: this.level };
              });
              return acc;
            },
            {}
          );

          // Grab just the ones the character owns
          const ownedSpellData = ownedSpells
            .filter((spellName) => flattenedSpells[spellName])
            .map((spellName) => ({
              [spellName]: flattenedSpells[spellName],
            }));

          owned.push(...ownedSpellData);
        }
      });*/
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

    if (type === "talents" && maxDomains > 0) {
      const clericDomainTalents = Object.entries(jobs["Cleric"].talentChoices)
        .filter(([name, _]) => abilityNames.has(name) || (maxDomains > ownedDomains))
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

        //Utility spell can be taken multiple times
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

  //this gives spells, separated into { owned, potential }
  getSpells() {
    let spellList = jobs[this.job]?.spellList ?? {};

    return this.#getOptions(
      "spells",
      spellList,
      this.jobSpells,
      (data) => data.baseLevel !== "Utility" && data.baseLevel !== 0 && data.baseLevel <= this.level
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

  // returns an array [totalPointsMax, maxPerIcon]
  queryIconRelationshipsMax() {
    let totalPointsMax = 3;
    let maxPerIcon = 3;

    if (this.level >= 8) {
      totalPointsMax = 5;
      maxPerIcon = 4;
    } else if (this.level >= 5) {
      totalPointsMax = 4;
    }

    //adjustments from Bard talents
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
    if (this.jobTalents.includes("D: Love/Beauty")) {
      totalPointsMax += 1;

      if (this.queryFeatHighestTier("D: Love/Beauty")) {
        totalPointsMax += 1;
      }
    }

    //adjustments from Paladin talents
    if (this.queryFeatIsOwned("Path of Universal Righteous Endeavor", "Epic")) {
      totalPointsMax += 1;
    } else if (this.queryFeatIsOwned("Way of Evil Bastards", "Epic")) {
      totalPointsMax += 1;
    }

    //adjustments from Sorcerer talents
    if (this.jobTalents.includes("Blood Link")) {
      totalPointsMax += 1;

      // don't need to check which tier because there's only one choice
      if (this.queryFeatHighestTier("Blood Link")) {
        totalPointsMax += 1;
      }
    }

    return [totalPointsMax, maxPerIcon];
  }

  queryBonusAbsTitle() {

    return jobs[this.job]?.bonusAbilityName ?? "";;
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

  //used for talents that can use spells from other classes
  //returns an object {"Cleric": ["Heal", "Blessing"], "Sorcerer": [], etc}
  #querySpellsByClass() {
  let ownedSpells = {};

  Object.keys(jobs).forEach((job) => {
    if ("spellList" in jobs[job]) {
      ownedSpells[job] = [];

      Object.keys(jobs[job].spellList).forEach((spellName) => {
        this.jobSpells.forEach((spell) => {
          const name = Object.keys(spell)[0];
          if (name === spellName) {
            ownedSpells[job].push(name);
          }
        });
      });
    }
  });

  return ownedSpells;
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
    }

    return spellSlots;
  }

  querySpellsOwnedCount() {
    let spellCount = this.jobSpells.length;

    // addition for heal and cantrip
    if (this.job == "Wizard" || this.job == "Cleric") {
      spellCount++;
    }

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
        spellMaxCounts[spellMaxCounts.findLastIndex((num) => num > 0)] += 1;
      }

      return spellMaxCounts;
    } else {
      let defaultCase = [0, 0, 0, 0, 0];

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
            defaultCase[Math.floor((this.level - 1) / 2)] += 2;
          } else {
            defaultCase[Math.floor((this.level - 1) / 2)] += 1;
          }
        }
      });

      return defaultCase;
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
      const AnimalAdjustment = this.jobTalents.some((talent) =>
        talent.startsWith("AC - ")
      )
        ? 1
        : 0;
      return this.jobTalents.length + AnimalAdjustment;
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
    const sorcPetFeat = this.queryFeatHighestTier("Sorcerer's Familiar");
    const rangPetFeat = this.queryFeatHighestTier("Ranger's Pet");
    const wizPetFeat = this.queryFeatHighestTier("Wizard's Familiar");

    if (
      !this.jobTalents.some((talent) => talent.endsWith("Familiar")) &&
      !this.jobTalents.includes("Ranger's Pet")
    ) {
      return 0;
    } else if (sorcPetFeat == "Epic" || rangPetFeat == "Epic") return 5;
    else if (wizPetFeat == "Epic" || sorcPetFeat == "Adventurer" || rangPetFeat == "Champion") return 4;
    else if (wizPetFeat == "Adventurer" || rangPetFeat == "Adventurer" || this.jobTalents.includes("Sorcerer's Familiar")) return 3;
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
