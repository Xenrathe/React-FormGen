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

  queryBackgroundsHaveError(character, backgrounds) {
    const bgPointsRemaining =
      character.queryBackgroundPointsRemaining(backgrounds);

    let errors = [];
    if (bgPointsRemaining < 0) {
      errors.push("spent too many background points");
    } else if (bgPointsRemaining > 0) {
      errors.push(`have ${bgPointsRemaining} background points left to spend`);
    }

    return errors;
  },

  //returns an object:
  // spells: [array of strings of spell-names that are in error]
  // errors: [array of error messages]
  querySpellsHaveErrors(character) {
    let errorSpells = [];
    let errors = [];

    // class-based errors
    // only necessary for Ranger and Bard's cross-job spell talents
    const ownedJobSpells = character.queryOwnedAbilitiesByClass("Spells");
    let maxAllowedSpells = { Bard: 0, Cleric: 0, Sorcerer: 0, Wizard: 0 };
    if (character.job in maxAllowedSpells)
      maxAllowedSpells[character.job] = 100;

    //paladin increase
    if (character.jobTalents.includes("Cleric Training")) {
      maxAllowedSpells["Cleric"] = 100;
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
          Object.keys(bo)[0] == "Jack of Spells" && Object.values(bo)[0] == "C"
      )
    ) {
      const cantripChoiceNum = character.bonusOptions.filter(
        (bo) => Object.keys(bo)[0] == "Cantrips"
      ).length;
      if (cantripChoiceNum != 3) {
        errorSpells.push("Cantrips");
        errors.push(
          "Bard's Jack of Spells wizard choice requires 3 cantrip choices"
        );
      }
    }

    Object.keys(maxAllowedSpells).forEach((source) => {
      let ownedSourceCount = 0;
      const ownedTalentsForThisSource = ownedJobSpells[source];
      if (ownedTalentsForThisSource.length > maxAllowedSpells[source]) {
        errors.push(`too many spells from ${source} class`);
        this.jobSpells.forEach((spell) => {
          const spellName = Object.keys(spell)[0];
          if (ownedTalentsForThisSource.includes(spellName)) {
            ownedSourceCount += 1;
            if (ownedSourceCount > maxAllowedSpells[source]) {
              errorSpells.push(spellName);
            }
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
      const spellLevelMax = character.querySpellLevelMaximums();
      spellLevelMax.forEach((maxCount, index) => {
        const slotLevel = index * 2 + 1;
        const errorAtThisLevel = false;
        let ownedSLCount = 0;
        character.jobSpells.forEach((spell) => {
          const spellLevel = Number(Object.values(spell)[0].substring(6));
          if (spellLevel == slotLevel) {
            ownedSLCount += 1;
            if (ownedSLCount > maxCount) {
              errorSpells.push(Object.keys(spell)[0]);
              errorAtThisLevel = true;
            }
          }
        });

        if (errorAtThisLevel) errors.add(`too many lvl-${slotLevel} spells`);
      });
    }

    return { spells: errorSpells, errors: errors };
  },
};

export default errorChecker;
