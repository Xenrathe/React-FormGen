import jobs from "../data/jobs";
import errorChecker from "../ErrorChecker.js";
import "./CSS/AbilitiesBlock.css";

//returns a string e.g. "(Feats Remain: 1 A, 2 C, 2 E)" ; returns "" if no Feats remain
function getAbilitiesRemainingString(
  character,
  typeOfAbility,
  includeTitle,
  abilitiesRemainingArray
) {
  const title = includeTitle ? `${typeOfAbility} Remain: ` : "";
  if (
    (character.job == "Barbarian" && typeOfAbility == "Talents") ||
    typeOfAbility == "Feats"
  ) {
    const [advRemain, champRemain, epicRemain] = abilitiesRemainingArray;

    if (advRemain == 0 && champRemain == 0 && epicRemain == 0) {
      return "";
    }

    let returnString = `(${title}${advRemain} A`;
    if (character.level > 4) {
      returnString += `, ${champRemain} C`;
    }
    if (character.level > 7) {
      returnString += `, ${epicRemain} E`;
    }

    returnString += ")";

    return returnString;
  } else if (typeOfAbility == "Spells") {
    const spellText = character
      .querySpellLevelsRemaining()
      .map((spellCount, index) => {
        if (spellCount === 0) return "";
        return `L${index * 2 + 1}: ${spellCount}`;
      })
      .filter(Boolean) // this removes empty strings...
      .join(" "); // ...so we can join with spaces

    return spellText ? `(${spellText})` : "";
  } else {
    return abilitiesRemainingArray[0] != 0
      ? `(${title}${abilitiesRemainingArray[0]})`
      : "";
  }
}

//remove stand-alone feats, spells, etc
function removeAbility(
  mode,
  name,
  spellLevel,
  abilitiesBlock,
  setAbilitiesBlock
) {
  if (mode == "general" || mode == "Animal Companion") {
    const newFeatArray = abilitiesBlock.feats.filter(
      (feat) => Object.keys(feat)[0] != name
    );
    setAbilitiesBlock({ ...abilitiesBlock, feats: newFeatArray });
  } else if (mode == "talents") {
    const newTalentArray = abilitiesBlock.talents.filter(
      (talent) => talent != name
    );
    //and also remove associated feats
    const newFeatArray = abilitiesBlock.feats.filter(
      (feat) => Object.keys(feat)[0] != name
    );
    setAbilitiesBlock({
      ...abilitiesBlock,
      feats: newFeatArray,
      talents: newTalentArray,
    });
  } else if (mode == "Familiar") {
    const newFamiliarAbArray = abilitiesBlock.familiarAbs.filter(
      (familiarAb) => familiarAb != name
    );
    setAbilitiesBlock({ ...abilitiesBlock, familiarAbs: newFamiliarAbArray });
  } else if (mode == "spells") {
    let newSpellArray = [];
    let newFeatArray = [];
    if (name !== "Utility Spell") {
      newSpellArray = abilitiesBlock.spells.filter(
        (spell) => Object.keys(spell)[0] != name
      );
      //and also remove associated feats
      newFeatArray = abilitiesBlock.feats.filter(
        (feat) => Object.keys(feat)[0] != name
      );
    } else {
      const utilitySpellIndex = abilitiesBlock.spells.findIndex(
        (spell) =>
          Object.keys(spell)[0] == name &&
          Number(Object.values(spell)[0].substring(6)) == spellLevel
      );

      newSpellArray = abilitiesBlock.spells.filter(
        (_, index) => index !== utilitySpellIndex
      );
    }

    setAbilitiesBlock({
      ...abilitiesBlock,
      feats: newFeatArray,
      spells: newSpellArray,
    });
  } else if (mode == "bonusAbs") {
    const newBonusAbArray = abilitiesBlock.bonusAbs.filter(
      (ability) => ability != name
    );
    //and also remove associated feats
    const newFeatArray = abilitiesBlock.feats.filter(
      (feat) => Object.keys(feat)[0] != name
    );
    setAbilitiesBlock({
      ...abilitiesBlock,
      feats: newFeatArray,
      bonusAbs: newBonusAbArray,
    });
  }
}

//returns [dataForLines, dataToAdd] based on which mode / dataset is desired
export function getDataSets(mode, character) {
  let dataOnLines = [];
  let dataForAdd = [];

  function processOwnedAbs(abilityInfo, removableCheck = () => true) {
    abilityInfo.owned.forEach((entry) => {
      const title = Object.keys(entry)[0];
      const obj = Object.fromEntries(
        Object.entries(Object.values(entry)[0]).map(([subKey, subValue]) => [
          subKey,
          subValue,
        ])
      );
      dataOnLines.push({ [title]: obj, removable: removableCheck(obj) });
    });
  }

  const modeMapping = {
    general: () => {
      const jobFeatures = character.getFeatures();
      dataOnLines.push(...jobFeatures);

      const racialFeatInfo = character.getFeats("racial");
      dataForAdd.push(...racialFeatInfo.potential);
      processOwnedAbs(racialFeatInfo, () => true);

      const generalFeatInfo = character.getFeats("general");
      dataForAdd.push(...generalFeatInfo.potential);
      processOwnedAbs(generalFeatInfo, () => true);
    },

    talents: () => {
      const talentInfo = character.getTalents();
      dataForAdd.push(...talentInfo.potential);
      processOwnedAbs(talentInfo, () => true);
    },

    Familiar: () => {
      const familiarAbInfo = character.getFamiliarAbs();
      dataForAdd.push(...familiarAbInfo.potential);
      //data structure is a little different so I opted to not complicate processOwnedAbs
      familiarAbInfo.owned.forEach((entry) => {
        const title = Object.keys(entry)[0];
        const obj = { Base: Object.values(entry)[0] };
        dataOnLines.push({ [title]: obj, removable: true });
      });
    },

    "Animal Companion": () => {
      const acFeatInfo = character.getFeats("ac");
      dataForAdd.push(...acFeatInfo.potential);
      processOwnedAbs(acFeatInfo, () => true);
    },

    spells: () => {
      const spellInfo = character.getSpells();
      dataForAdd.push(...spellInfo.potential);
      processOwnedAbs(spellInfo, (obj) => obj.Level !== 0);
    },

    bonusAbs: () => {
      const bonusAbInfo = character.getBonusAbs();
      dataForAdd.push(...bonusAbInfo.potential);
      processOwnedAbs(bonusAbInfo, (obj) => obj.Level !== 0);
    },
  };

  if (mode in modeMapping) {
    modeMapping[mode]();
  }

  return [dataOnLines, dataForAdd];
}

//A REACT COMPONENT
function LinedInputsWithBtn({
  mode,
  character,
  setPopupInfo,
  abilitiesBlock,
  setAbilitiesBlock,
  numLines = 10,
}) {
  const [dataOnLines, dataForAdd] = getDataSets(mode, character);

  const lines = [];

  for (let i = 1; i <= numLines; i++) {
    const item = dataOnLines[i - 1];
    const obj = item ? Object.values(item)[0] : "";
    const removable = item ? item.removable : false;
    const title = item ? Object.keys(item)[0] : "";

    let hasError = false;
    if (mode == "spells") {
      const spellsWithError =
        errorChecker.querySpellsHaveErrors(character).spells;
      hasError = spellsWithError.includes(title);
    } else if (mode == "talents") {
      const talentsWithError =
        errorChecker.queryTalentsHaveErrors(character).talents;
      hasError = talentsWithError.includes(title);
    }

    // tier letter addon
    let highestTier = character.queryFeatHighestTier(title);
    let highestTierLetter = highestTier ? `(${highestTier.charAt(0)})` : "";

    if (mode == "talents" && obj != "") {
      const tiers = ["Adventurer", "Champion", "Epic"];
      highestTierLetter = tiers.includes(obj.Type)
        ? ` (${obj.Type.charAt(0)})`
        : "";
    }

    //spell-level addon
    const spellLevel = mode == "spells" && obj != "" ? obj.Level : 0;
    const spellLevelAddon = spellLevel != 0 ? `(${spellLevel})` : "";

    let addTitle = "Add";
    if (!item) {
      if (mode == "general") {
        addTitle = "Add Feats";
      } else if (mode == "talents") {
        addTitle = "Add Talents";
      } else if (mode == "spells") {
        addTitle = "Add Spells";
      } else if (mode == "Familiar") {
        addTitle = "Add Familiar Abilities";
      } else if (mode == "Animal Companion") {
        addTitle = "Add AC Feats";
      } else if (
        mode == "bonusAbs" &&
        "bonusAbilitySet" in jobs[character.job]
      ) {
        addTitle = `Add ${character.queryBonusAbsTitle()}`;
      }
    }

    lines.push(
      <div key={`k-${mode}-${i}`} className="single-line-w-btn">
        <span
          className={`lined-input${hasError ? " error" : ""}${
            item ? "" : " empty"
          }`}
          onClick={
            item
              ? () =>
                  setPopupInfo({
                    title: title,
                    singleItem: obj,
                    list: null,
                    mode: mode,
                  })
              : () =>
                  setPopupInfo({
                    title: addTitle,
                    singleItem: null,
                    list: dataForAdd,
                    mode: mode,
                  })
          }
        >
          {title + highestTierLetter + spellLevelAddon}
        </span>
        <div className="buttons no-print">
          {item ? (
            removable && (
              <button
                onClick={() =>
                  removeAbility(
                    mode,
                    title,
                    spellLevel,
                    abilitiesBlock,
                    setAbilitiesBlock
                  )
                }
              >
                x
              </button>
            )
          ) : (
            <button
              onClick={() =>
                setPopupInfo({
                  title: addTitle,
                  singleItem: null,
                  list: dataForAdd,
                  mode: mode,
                })
              }
            >
              +
            </button>
          )}
          {item && (
            <button
              onClick={() =>
                setPopupInfo({
                  title: title,
                  singleItem: obj,
                  list: null,
                  mode: mode,
                })
              }
            >
              i
            </button>
          )}
        </div>
      </div>
    );
  }

  return lines;
}

//A REACT COMPONENT
function AbilitySubBlock({
  mode,
  character,
  setPopupInfo,
  abilitiesBlock,
  setAbilitiesBlock,
  title,
  errors,
  numLines,
}) {
  const hasError = errors.length > 0;

  return (
    <div
      id={mode}
      className={`abilities-input lined-inputs ${
        hasError ? "input-error" : ""
      }`}
    >
      {hasError && (
        <button
          className="error-btn no-print"
          onClick={() =>
            setPopupInfo({
              title: "Errors",
              singleItem: null,
              list: errors,
              mode: "errors",
            })
          }
        >
          !
        </button>
      )}
      <label className="subtitle-label">{title}</label>
      <LinedInputsWithBtn
        mode={mode}
        character={character}
        setPopupInfo={setPopupInfo}
        abilitiesBlock={abilitiesBlock}
        setAbilitiesBlock={setAbilitiesBlock}
        numLines={numLines}
      />
    </div>
  );
}

function AbilitiesBlock({
  character,
  abilitiesBlock,
  setAbilitiesBlock,
  setPopupInfo,
}) {
  /* ERROR CHECKING AND TITLE STRINGS */
  const featsRemainingString = getAbilitiesRemainingString(
    character,
    "Feats",
    true,
    character.queryFeatsRemaining()
  );
  const featErrors = errorChecker.queryFeatMiscount(character);
  const hasFeatError = featErrors.length > 0;

  const talentsRemainingString = getAbilitiesRemainingString(
    character,
    "Talents",
    false,
    character.queryTalentsRemaining()
  );
  const talentErrors = errorChecker.queryTalentsHaveErrors(character);

  const spellsRemainingString = getAbilitiesRemainingString(
    character,
    "Spells",
    false,
    null
  );
  const spellErrors = errorChecker.querySpellsHaveErrors(character);

  const familiarAbsRemainingString = getAbilitiesRemainingString(
    character,
    "animalsBlock",
    false,
    [character.queryFamiliarAbilitiesRemaining()]
  );
  const familiarErrors = errorChecker.queryFamiliarAbsHaveErrors(character);

  const bonusAbsRemainingString = getAbilitiesRemainingString(
    character,
    "BonusAbs",
    false,
    [character.queryBonusAbsRemaining()]
  );
  const bonusAbsErrors = errorChecker.queryBonusAbsHaveErrors(character);
  /* END ERROR CHECKING */

  //for rangers animal companion or wizard's familiar, adds an extra block to add feats/abilities
  let animalsBlock = "";
  abilitiesBlock.talents.forEach((talent) => {
    if (talent.endsWith("Familiar") || talent.endsWith("Pet")) {
      animalsBlock = "Familiar";
    } else if (talent.startsWith("AC")) {
      animalsBlock = "Animal Companion";
    }
  });

  return (
    <div
      id="abilitiesblock"
      className={`input-group${hasFeatError ? " input-error" : ""}`}
    >
      {hasFeatError && (
        <button
          className="error-btn no-print"
          onClick={() =>
            setPopupInfo({
              title: "Errors",
              singleItem: null,
              list: featErrors,
              mode: "errors",
            })
          }
        >
          !
        </button>
      )}
      <div className={`title-label`}>
        Abilities <span>{featsRemainingString}</span>
      </div>
      <AbilitySubBlock
        mode="general"
        character={character}
        setPopupInfo={setPopupInfo}
        abilitiesBlock={abilitiesBlock}
        setAbilitiesBlock={setAbilitiesBlock}
        title={"Class, Race, Gen Feats"}
        errors={[]}
        numLines={10}
      />
      <AbilitySubBlock
        mode="talents"
        character={character}
        setPopupInfo={setPopupInfo}
        abilitiesBlock={abilitiesBlock}
        setAbilitiesBlock={setAbilitiesBlock}
        title={`Talents ${talentsRemainingString}`}
        errors={talentErrors.errors}
        numLines={10}
      />
      {animalsBlock && (
        <AbilitySubBlock
          mode={animalsBlock}
          character={character}
          setPopupInfo={setPopupInfo}
          abilitiesBlock={abilitiesBlock}
          setAbilitiesBlock={setAbilitiesBlock}
          title={`${animalsBlock} ${familiarAbsRemainingString}`}
          errors={familiarErrors}
          numLines={10}
        />
      )}
      {(character.querySpellsMax() != 0 || character.jobSpells.length > 0) && (
        <AbilitySubBlock
          mode="spells"
          character={character}
          setPopupInfo={setPopupInfo}
          abilitiesBlock={abilitiesBlock}
          setAbilitiesBlock={setAbilitiesBlock}
          title={`Spells ${spellsRemainingString}`}
          errors={spellErrors.errors}
          numLines={Math.max(
            10,
            Math.max(
              character.querySpellsMax(),
              character.querySpellsOwnedCount()
            )
          )}
        />
      )}
      {character.queryBonusAbsTitle() != "" && (
        <AbilitySubBlock
          mode="bonusAbs"
          character={character}
          setPopupInfo={setPopupInfo}
          abilitiesBlock={abilitiesBlock}
          setAbilitiesBlock={setAbilitiesBlock}
          title={`${character.queryBonusAbsTitle()} ${bonusAbsRemainingString}`}
          errors={bonusAbsErrors}
          numLines={10}
        />
      )}
    </div>
  );
}

export default AbilitiesBlock;
