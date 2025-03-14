import React from "react";
import races from "../data/races";
import jobs from "../data/jobs";

function AbilitySheets({ abilitiesBlock, character }) {
  const sheetInfo = {
    Talents: abilitiesBlock.talents,
    Spells: abilitiesBlock.spells,
    bonusAbs: abilitiesBlock.bonusAbs,
    FamiliarSkills: abilitiesBlock.familiarAbs,
    standAlones: [],
  };

  Object.entries(races[character.race].racialPowersAndFeats).forEach(
    ([title, obj]) => {
      if (Object.keys(obj)[0] === "Base") {
        sheetInfo.standAlones.push({ [title]: obj });
      }
    }
  );

  Object.entries(jobs[character.job].features).forEach(([title, obj]) => {
    sheetInfo.standAlones.push({ [title]: obj });
  });
}

export default AbilitySheets;
