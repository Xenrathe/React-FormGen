import races from "../data/races";
import jobs from "../data/jobs";
import genFeats from "../data/abilities/generalfeats.json";
import PopupModal from "./PopupModal.jsx";
import { useState } from "react";

//returns an array [adv #, champ #, epic #]
function getFeatsRemaining(character) {
  const currentFeatCounts = character.queryCurrentFeatCounts();
  const maxFeats = character.queryMaxFeats();
  const advFeatsRemain = maxFeats.Adventurer - currentFeatCounts.Adventurer;
  const champFeatsRemain = maxFeats.Champion - currentFeatCounts.Champion;
  const epicFeatsRemain = maxFeats.Epic - currentFeatCounts.Epic;

  return [advFeatsRemain, champFeatsRemain, epicFeatsRemain];
}

//returns a string e.g. "(Feats Remain: 1 A, 2 C, 2 E)" ; returns "" if no Feats remain
function getFeatsRemainingString(character) {
  const [advFeatsRemain, champFeatsRemain, epicFeatsRemain] =
    getFeatsRemaining(character);

  if (advFeatsRemain == 0 && champFeatsRemain == 0 && epicFeatsRemain == 0) {
    return "";
  }

  let returnString = `(Feats Remain: ${advFeatsRemain} A`;
  if (character.level > 4) {
    returnString += `, ${champFeatsRemain} C`;
  }
  if (character.level > 7) {
    returnString += `, ${epicFeatsRemain} E`;
  }

  returnString += ")";

  return returnString;
}

//remove stand-alone feats, spells, etc
function removeAbility(mode, name, abilitiesBlock, setAbilitiesBlock) {
  if (mode == "general") {
    const newFeatArray = abilitiesBlock.feats.filter(
      (feat) => Object.keys(feat)[0] != name
    );
    setAbilitiesBlock({ ...abilitiesBlock, feats: newFeatArray });
  }
}

function LinedInputsWithBtn({
  mode,
  character,
  setPopupInfo,
  abilitiesBlock,
  setAbilitiesBlock,
}) {
  let numLines = 10;
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
    const racialFeatInfo = character.getFeats("racial"); //returns both ownedFeats and potentialFeats
    dataForAdd.push(...racialFeatInfo.potentialFeats);
    racialFeatInfo.ownedFeats.forEach((entry) => {
      const title = Object.keys(entry)[0];
      const tier = Object.keys(Object.values(entry)[0])[0];
      const adjTitle = `(${tier.substring(0, 1)}) ${title}`;
      const obj = Object.fromEntries(
        Object.entries(Object.values(entry)[0]).map(([subKey, subValue]) => [
          subKey,
          subValue,
        ])
      );
      dataOnLines.push({ [title]: obj, removable: true });
    });

    // includes OPTIONAL feats from the character.feats.general
    const generalFeatInfo = character.getFeats("general");
    dataForAdd.push(...generalFeatInfo.potentialFeats);
    generalFeatInfo.ownedFeats.forEach((entry) => {
      const title = Object.keys(entry)[0];
      const tier = Object.keys(Object.values(entry)[0])[0];
      const adjTitle = `(${tier.substring(0, 1)}) ${title}`;
      // put the object into standard form
      const obj = Object.fromEntries(
        Object.entries(Object.values(entry)[0]).map(([subKey, subValue]) => [
          subKey,
          subValue,
        ])
      );
      console.log(obj);
      dataOnLines.push({ [title]: obj, removable: true });
    });
  }

  //mode = "talents"
  // includes talents from character.jobTalents
  // --includes associated feats from character.feats.talent

  //mode = "spells"
  // includes spells from character.jobSpells
  // --includes associated feats from character.feats.spell

  //mode = "bonusAbs"
  // includes bonusAbs from character.jobBonusAbs
  // --includes associated feats from character.feats.bonus

  const lines = [];

  for (let i = 1; i <= numLines; i++) {
    const item = dataOnLines[i - 1];
    const obj = item ? Object.values(item)[0] : "";
    const removable = item ? item.removable : false;
    const title = item ? Object.keys(item)[0] : "";
    const highestTier = character.queryHighestFeatTier(title);
    const highestTierLetter = highestTier ? `(${highestTier.charAt(0)})` : "";

    let addTitle = "Add";
    if (!item) {
      if (mode == "general") {
        addTitle = "Add Feats";
      } else if (mode == "talents") {
        addTitle = "Add Talents";
      } else if (mode == "spells") {
        addTitle = "Add Spells";
      } else if (
        mode == "bonusAbs" &&
        "bonusAbilitySet" in jobs[character.job]
      ) {
        addTitle = `Add ${jobs[character.job].bonusAbilitySet.Name}`;
      }
    }

    // need functionality for x button
    // need functionality for + button
    lines.push(
      <div key={`k-${mode}-${i}`} className="single-line-w-btn">
        <span className="lined-input">{title + highestTierLetter}</span>
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
                })
              }
            >
              +
            </button>
          )}
          {item && (
            <button
              onClick={() =>
                setPopupInfo({ title: title, singleItem: obj, list: null })
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
  });

  let tooManyFeats = false;
  getFeatsRemaining(character).forEach((featNum) => {
    if (featNum < 0) {
      tooManyFeats = true;
    }
  });

  return (
    <div
      id="abilitiesblock"
      className={"input-group" + (tooManyFeats ? " input-error" : "")}
    >
      <PopupModal
        popupInfo={popupInfo}
        setPopupInfo={setPopupInfo}
        character={character}
        abilitiesBlock={abilitiesBlock}
        setAbilitiesBlock={setAbilitiesBlock}
      />
      <div className="title-label">
        Abilities {getFeatsRemainingString(character)}
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
      <div id="talents" className="abilities-input lined-inputs">
        <label className="subtitle-label">Talents</label>
        <LinedInputsWithBtn
          mode="talents"
          character={character}
          setPopupInfo={setPopupInfo}
          abilitiesBlock={abilitiesBlock}
          setAbilitiesBlock={setAbilitiesBlock}
        />
      </div>
      <div id="spells" className="abilities-input lined-inputs">
        <label className="subtitle-label">Spells</label>
        <LinedInputsWithBtn
          mode="spells"
          character={character}
          setPopupInfo={setPopupInfo}
          abilitiesBlock={abilitiesBlock}
          setAbilitiesBlock={setAbilitiesBlock}
        />
      </div>
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
