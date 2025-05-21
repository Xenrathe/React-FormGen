import icons from "./data/icons.json";

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
};

export default errorChecker;
