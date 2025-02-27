import races from "../data/races";
import jobs from "../data/jobs";
import PopupModal from "./PopupModal.jsx";
import { useState } from "react";

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
  } else if (typeOfAbility == "Talents") {
    return `(${title}${abilitiesRemainingArray[0]})`;
  }
}

//remove stand-alone feats, spells, etc
function removeAbility(mode, name, abilitiesBlock, setAbilitiesBlock) {
  if (mode == "general" || mode == "Animal Companion") {
    const newFeatArray = abilitiesBlock.feats.filter(
      (feat) => Object.keys(feat)[0] != name
    );
    setAbilitiesBlock({ ...abilitiesBlock, feats: newFeatArray });
  } else if (mode == "talents") {
    const newTalentArray = abilitiesBlock.talents.filter(
      (talent) => talent != name
    );
    setAbilitiesBlock({ ...abilitiesBlock, talents: newTalentArray });
  } else if (mode == "Familiar") {
    const newFamiliarAbArray = abilitiesBlock.familiarAbs.filter(
      (familiarAb) => familiarAb != name
    );
    setAbilitiesBlock({ ...abilitiesBlock, familiarAbs: newFamiliarAbArray });
  } else if (mode == "spells") {
    const newSpellArray = abilitiesBlock.spells.filter(
      (spell) => Object.keys(spell)[0] != name
    );
    setAbilitiesBlock({ ...abilitiesBlock, spells: newSpellArray });
  }
}

//returns [dataForLines, dataToAdd] based on which mode / dataset is desired
function getDataSets(mode, character) {
  let dataOnLines = [];
  let dataForAdd = [];

  if (mode == "general") {
    // includes racialpowers from races[character.race].racialPowersAndFeats
    Object.entries(races[character.race].racialPowersAndFeats).forEach(
      ([title, obj]) => {
        if (Object.keys(obj)[0] == "Base") {
          //do not include OPTIONAL feats
          dataOnLines.push({ [title]: obj, removable: false });
        }
      }
    );

    // includes features from jobs[character.job].features
    Object.entries(jobs[character.job].features).forEach(([title, obj]) => {
      dataOnLines.push({ [title]: obj, removable: false });
    });

    // --includes OPTIONAL racialfeats from character.feats.racial
    // data structure: {"Heritage of the Sword": "Adventurer"}
    const racialFeatInfo = character.getFeats("racial"); //returns both owned and potential
    dataForAdd.push(...racialFeatInfo.potential);
    racialFeatInfo.owned.forEach((entry) => {
      const title = Object.keys(entry)[0];
      const obj = Object.fromEntries(
        Object.entries(Object.values(entry)[0]).map(([subKey, subValue]) => {
          [subKey, subValue];
        })
      );
      dataOnLines.push({ [title]: obj, removable: true });
    });

    // includes OPTIONAL feats from the character.feats.general
    const generalFeatInfo = character.getFeats("general");
    dataForAdd.push(...generalFeatInfo.potential);
    generalFeatInfo.owned.forEach((entry) => {
      const title = Object.keys(entry)[0];
      // put the object into standard form
      const obj = Object.fromEntries(
        Object.entries(Object.values(entry)[0]).map(([subKey, subValue]) => [
          subKey,
          subValue,
        ])
      );
      dataOnLines.push({ [title]: obj, removable: true });
    });
  } else if (mode == "talents") {
    // includes talents from character.jobTalents
    const talentInfo = character.getTalents();
    dataForAdd.push(...talentInfo.potential);
    talentInfo.owned.forEach((entry) => {
      const title = Object.keys(entry)[0];
      //const tier = Object.keys(Object.values(entry)[0])[0];
      // put the object into standard form
      const obj = Object.fromEntries(
        Object.entries(Object.values(entry)[0]).map(([subKey, subValue]) => [
          subKey,
          subValue,
        ])
      );
      dataOnLines.push({ [title]: obj, removable: true });
    });
  } else if (mode == "Familiar") {
    // includes familiar abilities from character.familiarAbs
    const familiarAbInfo = character.getFamiliarAbs();
    dataForAdd.push(...familiarAbInfo.potential);
    familiarAbInfo.owned.forEach((entry) => {
      const title = Object.keys(entry)[0];
      //put into a standard form
      const obj = { Base: Object.values(entry)[0] };
      dataOnLines.push({ [title]: obj, removable: true });
    });
  } else if (mode == "Animal Companion") {
    const acFeatInfo = character.getFeats("ac");
    dataForAdd.push(...acFeatInfo.potential);
    acFeatInfo.owned.forEach((entry) => {
      const title = Object.keys(entry)[0];
      // put the object into standard form
      const obj = Object.fromEntries(
        Object.entries(Object.values(entry)[0]).map(([subKey, subValue]) => [
          subKey,
          subValue,
        ])
      );
      dataOnLines.push({ [title]: obj, removable: true });
    });
  } else if (mode == "spells") {
    const spellInfo = character.getSpells();
    dataForAdd.push(...spellInfo.potential);
    spellInfo.owned.forEach((entry) => {
      const title = Object.keys(entry)[0];
      //const tier = Object.keys(Object.values(entry)[0])[0];
      // put the object into standard form
      const obj = Object.fromEntries(
        Object.entries(Object.values(entry)[0]).map(([subKey, subValue]) => [
          subKey,
          subValue,
        ])
      );
      dataOnLines.push({ [title]: obj, removable: true });
    });
  }

  //mode = "bonusAbs"
  // includes bonusAbs from character.jobBonusAbs
  // --includes associated feats from character.feats.bonus

  return [dataOnLines, dataForAdd];
}

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
    const spellLevelAddon =
      mode == "spells" && obj != "" ? `(${obj.Level})` : "";

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
        addTitle = `Add ${jobs[character.job].bonusAbilitySet.Name}`;
      }
    }

    lines.push(
      <div key={`k-${mode}-${i}`} className="single-line-w-btn">
        <span className="lined-input">
          {title + highestTierLetter + spellLevelAddon}
        </span>
        <div className="buttons">
          {item ? (
            removable && (
              <button
                onClick={() =>
                  removeAbility(mode, title, abilitiesBlock, setAbilitiesBlock)
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

function AbilitiesBlock({ character, abilitiesBlock, setAbilitiesBlock }) {
  const [popupInfo, setPopupInfo] = useState({
    title: "",
    singleItem: null,
    list: null,
    mode: "",
  });

  let tooManyFeats = false;
  character.queryFeatsRemaining().forEach((featNum) => {
    if (featNum < 0) {
      tooManyFeats = true;
    }
  });

  let tooManyTalents = false;
  character.queryTalentsRemaining().forEach((talentNum) => {
    if (talentNum < 0) {
      tooManyTalents = true;
    }
  });

  let tooManySpells = false;
  character.querySpellLevelsRemaining().forEach((spellNum) => {
    if (spellNum < 0) {
      tooManySpells = true;
    }
  });

  const hasError = tooManyTalents || tooManyFeats || tooManySpells; //used to add an error class to div

  //for rangers animal companion or wizard's familiar, adds an extra block to add feats/abilities
  let animalsBlock = "";
  character.getTalents().owned.forEach((talent) => {
    const name = Object.keys(talent)[0];
    if (name == "Wizard's Familiar") {
      animalsBlock = "Familiar";
    } else if (name.substring(0, 2) == "AC") {
      animalsBlock = "Animal Companion";
    }
  });

  return (
    <div
      id="abilitiesblock"
      className={"input-group" + (hasError ? " input-error" : "")}
    >
      <PopupModal
        popupInfo={popupInfo}
        setPopupInfo={setPopupInfo}
        character={character}
        abilitiesBlock={abilitiesBlock}
        setAbilitiesBlock={setAbilitiesBlock}
      />
      <div className="title-label">
        Abilities{" "}
        {getAbilitiesRemainingString(
          character,
          "Feats",
          true,
          character.queryFeatsRemaining()
        )}
      </div>
      <div id="job-race-gen" className="abilities-input lined-inputs">
        <label className="subtitle-label">Class, Race, Gen Feats</label>
        <LinedInputsWithBtn
          mode="general"
          character={character}
          setPopupInfo={setPopupInfo}
          abilitiesBlock={abilitiesBlock}
          setAbilitiesBlock={setAbilitiesBlock}
        />
      </div>
      <div id="talents-and-pets">
        <div id="talents" className="abilities-input lined-inputs">
          <label className="subtitle-label">
            Talents
            {getAbilitiesRemainingString(
              character,
              "Talents",
              false,
              character.queryTalentsRemaining()
            )}
          </label>
          <LinedInputsWithBtn
            mode="talents"
            character={character}
            setPopupInfo={setPopupInfo}
            abilitiesBlock={abilitiesBlock}
            setAbilitiesBlock={setAbilitiesBlock}
            numLines={animalsBlock == "" ? 10 : character.queryTalentsMax()}
          />
        </div>
        {animalsBlock && (
          <div id="pets" className="abilities-input lined-inputs">
            <label className="subtitle-label">
              {animalsBlock}
              {character.queryFamiliarAbilitiesRemaining() == 0
                ? ""
                : ` (${character.queryFamiliarAbilitiesRemaining()})`}
            </label>
            <LinedInputsWithBtn
              mode={animalsBlock}
              character={character}
              setPopupInfo={setPopupInfo}
              abilitiesBlock={abilitiesBlock}
              setAbilitiesBlock={setAbilitiesBlock}
              numLines={Math.max(4, character.queryACFeatsCount() + 1)}
            />
          </div>
        )}
      </div>
      {character.querySpellsMax() != 0 && (
        <div id="spells" className="abilities-input lined-inputs">
          <label className="subtitle-label">
            Spells{" "}
            {(() => {
              const spellText = character
                .querySpellLevelsRemaining()
                .map((spellCount, index) => {
                  if (spellCount === 0) return "";
                  return `L${index * 2 + 1}: ${spellCount}`;
                })
                .filter(Boolean) // this removes empty strings...
                .join(" "); // ...so we can join with spaces

              return spellText ? `(${spellText})` : "";
            })()}
          </label>
          <LinedInputsWithBtn
            mode="spells"
            character={character}
            setPopupInfo={setPopupInfo}
            abilitiesBlock={abilitiesBlock}
            setAbilitiesBlock={setAbilitiesBlock}
            numLines={Math.max(10, character.querySpellsMax())}
          />
        </div>
      )}
      <div id="bonusAbs" className="abilities-input lined-inputs">
        <label className="subtitle-label">Bonus Abs</label>
        <LinedInputsWithBtn
          mode="bonusAbs"
          character={character}
          setPopupInfo={setPopupInfo}
          abilitiesBlock={abilitiesBlock}
          setAbilitiesBlock={setAbilitiesBlock}
        />
      </div>
    </div>
  );
}

export default AbilitiesBlock;
