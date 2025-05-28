import icons from "./data/icons.json";
import jobs from "./data/jobs";

const errorChecker = {
  // returns an empty array if no error
  // otherwise returns an array of strings describing errors
  queryIconRelationshipsHaveError(character, iconRelationships) {
    const [maxTotal, maxPerIcon] = character.queryIconRelationshipsMax();

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
    if (character.jobTalents.includes("Arcane Heritage"))
      heritageIcons.push("archmage");
    if (character.jobTalents.includes("Chromatic Destroyer Heritage"))
      heritageIcons.push("three", "the three");
    if (character.jobTalents.includes("Fey Heritage"))
      heritageIcons.push("elf queen");
    if (character.jobTalents.includes("infernal heritage"))
      heritageIcons.push("diabolist");
    if (character.jobTalents.includes("Metallic Protector Heritage"))
      heritageIcons.push("great gold wyrm");
    if (character.jobTalents.includes("Undead Remnant Heritage"))
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
          `${relationshipType} relationship with ${iconName} is too high (max is ${maxValue})`
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

    if (total > maxTotal) {
      errors.push(
        `icon points (${total}) is more than available points (${maxTotal})`
      );
    } else if (total < maxTotal) {
      errors.push(`${maxTotal - total} unspent icon points`);
    }

    // Cleric's Love & beauty domain give an additional 1 point (or 2 w/ associated feat) CONFLICTED relationship with heroic or ambiguous
    if (character.jobTalents.includes("D: Love/Beauty")) {
      let minRelatedPoints = 1;
      if (character.queryFeatHighestTier("D: Love/Beauty")) {
        minRelatedPoints = 2;
      }

      if (conflictedHeroicAmbiguous < minRelatedPoints) {
        errors.push(
          `Love/Beauty domain ${
            minRelatedPoints == 2 ? "and feat " : ""
          } requires ${minRelatedPoints} points spent in a conflicted relationship with a heroic or ambiguous icon`
        );
      }
    }

    // Paladin's Righteous Endeavor w/ epic feat gives +1 relationship points with a heroic or ambiguous icon
    // Way of Evil Bastards gives the same but with villainous or ambiguous icon
    if (
      character.queryFeatIsOwned("Path of Universal Righteous Endeavor", "Epic")
    ) {
      if (moralityTotals.heroic == 0 && moralityTotals.ambiguous == 0) {
        errors.push(
          "epic feat in Path of Universal Righteous Endeavor talent requires at least 1 point in a relationship with a heroic or ambiguous icon"
        );
      }
    } else if (character.queryFeatIsOwned("Way of Evil Bastards", "Epic")) {
      if (moralityTotals.villainous == 0 && moralityTotals.ambiguous == 0) {
        errors.push(
          "epic feat in Way of Evil Bastards talent requires at least 1 point in a relationship with a villainous or ambiguous icon"
        );
      }
    }

    //adjustments from Sorcerer talents
    // gives an extra 1 point to spend on icon relationships matching the 'heritage' (see code below)
    if (character.jobTalents.includes("Blood Link")) {
      let minBloodLinkPoints = 1;

      // don't need to check which tier because there's only one choice
      if (character.queryFeatHighestTier("Blood Link")) minBloodLinkPoints += 1;

      if (heritagePoints < minBloodLinkPoints) {
        errors.push(
          `Blood Link talent requires at least ${minBloodLinkPoints} icon relationship points in an icon associated with chosen heritage talents ${
            heritageIcons.length > 0 ? `(${heritageIcons})` : ""
          }`
        );
      }
    }

    return errors;
  },

  // returns an empty array if no error
  // otherwise returns an array of strings describing errors
  queryBackgroundsHaveError(character, backgrounds) {
    const bgPointsRemaining =
      character.queryBackgroundPointsRemaining(backgrounds);

    let errors = [];
    if (bgPointsRemaining < 0) {
      errors.push("excess background points spent");
    } else if (bgPointsRemaining > 0) {
      errors.push(`${bgPointsRemaining} unspent background points`);
    }

    return errors;
  },

  // returns an empty array if no error
  // otherwise returns an array of strings describing errors
  queryBonusAbsHaveErrors(character) {
    const bonusAbsRemaining = character.queryBonusAbsRemaining();
    const bonusAbsName = character.queryBonusAbsTitle();

    let errors = [];
    if (bonusAbsRemaining < 0) {
      errors.push(`excess ${bonusAbsName}`);
    } else if (bonusAbsRemaining > 0) {
      errors.push(`unspent ${bonusAbsName}`);
    }

    return errors;
  },

  //returns an object:
  // spells: [array of strings of spell-names that are in error]
  // errors: [array of error messages]
  queryTalentsHaveErrors(character) {
    let errorTalents = [];
    let errors = [];

    // not enough sub/bonus options chosen
    character.jobTalents.forEach((talent) => {
      const abilityInfo = {
        title: talent,
        singleItem:
          talent in jobs[character.job].talentChoices
            ? jobs[character.job].talentChoices[talent]
            : null,
      };
      const maxChoices = abilityInfo
        ? character.querySubOptions(abilityInfo)[0]
        : 0;
      const currChoices = character.bonusOptions.filter(
        (bo) => Object.keys(bo)[0] == talent
      ).length;

      if (currChoices != maxChoices) {
        errors.push(`${talent} has unchosen suboptions`);
        errorTalents.push(talent);
      }
    });

    const ownedTalentsByClass = character.queryOwnedAbilitiesByClass("Talents");
    let maxAllowedTalents = {};
    Object.keys(jobs).forEach((job) => (maxAllowedTalents[job] = 0));
    maxAllowedTalents[character.job] = 100;

    //paladin increase for divine domain
    const divineDomainTalents = character.jobTalents.filter((talent) =>
      talent.startsWith("Divine Domain")
    );
    maxAllowedTalents["Cleric"] += divineDomainTalents.length;

    Object.keys(maxAllowedTalents).forEach((source) => {
      let ownedSourceCount = 0;
      const ownedTalentsForThisSource = ownedTalentsByClass[source];
      if (ownedTalentsForThisSource.length > maxAllowedTalents[source]) {
        errors.push(`excess talents from ${source} class`);
        character.jobTalents.forEach((talent) => {
          if (ownedTalentsForThisSource.includes(talent)) {
            ownedSourceCount += 1;
            if (ownedSourceCount > maxAllowedTalents[source])
              errorTalents.push(talent);
          }
        });
      } else if (
        ownedTalentsForThisSource.length < maxAllowedTalents[source] &&
        source != character.job
      ) {
        errors.push(
          `missing ${
            maxAllowedTalents[source] - ownedTalentsForThisSource.length
          } talents from ${source} class`
        );
      }
    });

    // standard errors (too many talents overall or per tier, such as with barbarian)
    const talentsMax = character.queryTalentsMax();
    if (Array.isArray(talentsMax)) {
      const tiers = ["Adventurer", "Champion", "Epic"];
      let counts = [0, 0, 0];

      character.jobTalents.forEach((talent) => {
        const tierIndex = tiers.indexOf(
          jobs[character.job].talentChoices[talent].Type
        );
        counts[tierIndex] += 1;

        if (counts[tierIndex] > talentsMax[tierIndex])
          errorTalents.push(talent);
      });

      [0, 1, 2].forEach((index) => {
        if (counts[index] > talentsMax[index])
          errors.push(`excess ${tiers[index]} talents`);
        else if (counts[index] < talentsMax[index])
          errors.push(`missing ${tiers[index]} talents`);
      });
    } else {
      let count = 0;
      character.jobTalents.forEach((talent) => {
        count++;
        if (count > talentsMax) errorTalents.push(talent);
      });

      if (count > talentsMax) errors.push(`excess talents chosen`);
      else if (count < talentsMax) errors.push(`missing talent choices`);
    }

    return { talents: errorTalents, errors: errors };
  },

  //returns an object:
  // spells: [array of strings of spell-names that are in error]
  // errors: [array of error messages]
  querySpellsHaveErrors(character) {
    let errorSpells = [];
    let errors = [];

    // class-based errors
    // only necessary for Ranger and Bard's cross-job spell talents
    const ownedJobSpells = character.queryOwnedAbilitiesByClass("Spells"); //an object {"Cleric": ["Heal", "Blessing"], "Sorcerer": [], etc}
    let maxAllowedSpells = {};
    Object.keys(jobs).forEach((job) => {
      if ("spellList" in jobs[job] && job != "Paladin") {
        if (character.job == job) maxAllowedSpells[job] = 100;
        else maxAllowedSpells[job] = 0;
      }
    });

    //paladin increase
    if (character.jobTalents.includes("Cleric Training")) {
      maxAllowedSpells["Cleric"] = 1;
      if (character.queryFeatHighestTier("Cleric Training") == "Epic")
        maxAllowedSpells["Cleric"] = 2;
    }

    const rangerTalents = [
      { "Fey Queen's Enchantments": "Sorcerer" },
      { "Ranger ex Cathedral": "Cleric" },
    ];
    rangerTalents.forEach((RT) => {
      const talentName = Object.keys(RT)[0];
      const source = Object.values(RT)[0];

      if (character.jobTalents.includes(talentName)) {
        const highestTier = character.queryFeatHighestTier(talentName);
        if (highestTier == "Epic") {
          maxAllowedSpells[source] += 2;
        } else {
          maxAllowedSpells[source] += 1;
        }
      }
    });

    // Bard additions
    const options = character.bonusOptions
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
      character.bonusOptions.some(
        (bo) =>
          Object.keys(bo)[0] == "Jack of Spells" &&
          Object.values(bo)[0] == "C" &&
          character.queryFeatIsOwned("Jack of Spells", "Adventurer")
      )
    ) {
      const cantripChoiceNum = character.bonusOptions.filter(
        (bo) => Object.keys(bo)[0] == "Cantrips"
      ).length;
      if (cantripChoiceNum != 3) {
        errorSpells.push("Cantrips");
        errors.push("Jack of Spells wizard/feat grants 3 cantrip choices");
      }
    }

    Object.keys(maxAllowedSpells).forEach((source) => {
      let ownedSourceCount = 0;
      const ownedSpellsForThisSource = ownedJobSpells[source];
      if (ownedSpellsForThisSource.length > maxAllowedSpells[source]) {
        errors.push(`excess spells from ${source} class`);
        character.jobSpells.forEach((spell) => {
          const spellName = Object.keys(spell)[0];
          if (ownedSpellsForThisSource.includes(spellName)) {
            ownedSourceCount += 1;
            if (ownedSourceCount > maxAllowedSpells[source]) {
              errorSpells.push(spellName);
            }
          }
        });
      } else if (
        ownedSpellsForThisSource.length < maxAllowedSpells[source] &&
        source != character.job
      ) {
        errors.push(
          `missing ${
            maxAllowedSpells[source] - ownedSpellsForThisSource.length
          } spells from ${source} class`
        );
      }
    });

    //Basically we only worry about 'standard errors' once more specific errors are taken care of
    if (
      errorSpells.length == 0 ||
      (errorSpells.length == 1 && errorSpells[0] == "Cantrips")
    ) {
      // standard errors (too many at a given spellLevel)
      // this will also cover spells at too high or too low of a level
      const spellLevelMax = character.querySpellLevelMaximums();
      spellLevelMax.forEach((maxCount, index) => {
        const slotLevel = index * 2 + 1;
        let ownedSLCount = 0;
        character.jobSpells.forEach((spell) => {
          const spellLevel = Number(Object.values(spell)[0].substring(6));
          if (spellLevel == slotLevel) {
            ownedSLCount += 1;
            if (ownedSLCount > maxCount) {
              errorSpells.push(Object.keys(spell)[0]);
            }
          }
        });
      });
    }

    //check for not incorrect # of spells
    character.querySpellLevelsRemaining().forEach((spellCount, index) => {
      const spellLevel = index * 2 + 1;

      if (spellCount > 0) {
        errors.push(`unused L${spellLevel} spell slots`);
      } else if (spellCount < 0) {
        errors.push(`excess L${spellLevel} spells`);
      }
    });

    return { spells: errorSpells, errors: errors };
  },

  // returns an empty array if no error
  // otherwise returns an array of strings describing errors
  queryFeatMiscount(character) {
    //returns an array [adv #, champ #, epic #]
    const [advRemain, chmpRemain, epicRemain] = character.queryFeatsRemaining();
    const featCounts = {
      adventurer: advRemain,
      champion: chmpRemain,
      epic: epicRemain,
    };

    let errors = [];
    Object.entries(featCounts).forEach(([tier, count]) => {
      if (count > 0) errors.push(`unspent ${tier} feats`);
      else if (count < 0) errors.push(`excess ${tier} feats`);
    });

    return errors;
  },

  queryFamiliarAbsHaveErrors(character) {
    let errors = [];
    const familiarAbsRemaining = character.queryFamiliarAbilitiesRemaining();

    if (familiarAbsRemaining > 0)
      errors.push(`${familiarAbsRemaining} unspent familiar abilities`);
    else if (familiarAbsRemaining < 0) errors.push(`excess familiar abilities`);

    return errors;
  },
};

export default errorChecker;
