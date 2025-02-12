import races from "../data/races";
import jobs from "../data/jobs";
import genFeats from "../data/abilities/generalfeats.json";
import { useState } from "react";

function generateLinedInputWithBtn(mode, character, setPopupInfo) {
  let numLines = 10;
  let dataArray = [];

  if (mode == "general") {
    // includes racialpowers from races[character.race].racialPowersAndFeats
    Object.entries(races[character.race].racialPowersAndFeats).forEach(
      ([title, obj]) => {
        if (!["Adventurer", "Champion", "Epic"].includes(title)) {
          dataArray.push({ [title]: obj });
        }
      }
    );

    // --includes racialfeats from character.feats.racial
    // data structure: {"Heritage of the Sword": "Adventurer"}
    character.getFeats("racial").forEach((entry) => {
      const tier = Object.values(entry)[0];
      const title = Object.keys(entry)[0];
      const adjTitle = `(${tier.substring(0, 1)}) ${title}`;
      const obj = {
        Base: races[character.race].racialpowersAndFeats[tier][title],
      };
      dataArray.push({ [title]: obj });
    });

    // includes features from jobs[character.job].features
    Object.entries(jobs[character.job].features).forEach(([title, obj]) => {
      if (!["Adventurer", "Champion", "Epic"].includes(title)) {
        dataArray.push({ [title]: obj });
      }
    });

    // includes feats from the character.feats.general
    character.getFeats("general").forEach((entry) => {
      const tier = Object.values(entry)[0];
      const title = Object.keys(entry)[0];
      const adjTitle = `(${tier.substring(0, 1)}) ${title}`;
      const obj = {
        Base: genFeats[title][tier],
      };
      dataArray.push({ [title]: obj });
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

  // needs to be altered to show if ability has associated feats
  // maybe just by adding an (A) or (C) or (E) after?
  for (let i = 1; i <= numLines; i++) {
    const item = dataArray[i - 1];
    const title = item ? Object.keys(item)[0] : "";
    const obj = item ? Object.values(item)[0] : "";

    lines.push(
      <div key={`k-${mode}-${i}`} className="single-line-w-btn">
        <span className="lined-input">{title}</span>
        {item ? (
          <button
            onClick={() =>
              setPopupInfo({ title: title, singleItem: obj, list: null })
            }
          >
            i
          </button>
        ) : (
          <button>+</button>
        )}
      </div>
    );
  }

  return lines;
}

function getFeatsRemainingString(character) {
  const advFeatsRemain =
    character.queryMaxFeats().Adventurer -
    character.queryCurrentFeats().Adventurer;
  const champFeatsRemain =
    character.queryMaxFeats().Champion - character.queryCurrentFeats().Champion;
  const epicFeatsRemain =
    character.queryMaxFeats().Epic - character.queryCurrentFeats().Epic;

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

function alterFeats(
  featName,
  featTier,
  isAdding,
  hasAdv,
  hasChamp,
  abilitiesBlock,
  setAbilitiesBlock
) {
  let newFeatArray = [];

  if (isAdding) {
    //remove all feats of the given name
    newFeatArray = abilitiesBlock.feats.filter((feat) => {
      const name = Object.keys(feat)[0];
      return !(name == featName)
    });

    //add multiple tiers of feats, depending on situation
    if (featTier == "Adventurer" || hasAdv) {
      newFeatArray.push({[featName]: "Adventurer" });
    }

    if (featTier == "Champion" || (featTier == "Epic") && hasChamp) {
      newFeatArray.push({[featName]: "Champion" });
    }

    if (featTier == "Epic") {
      newFeatArray.push({[featName]: "Epic" });
    }
  } else {
    const tiers = ["Adventurer", "Champion", "Epic"];
    const removeIndex = tiers.indexOf(featTier); //gives minimumIndex of removal

    //remove potentially multiple tiers of feat
    newFeatArray = abilitiesBlock.feats.filter((feat) => {
      const [name, tier] = Object.entries(feat)[0];
      return !(name == featName && tiers.indexOf(tier) >= removeIndex);
    });
  }

  console.log(newFeatArray);
  setAbilitiesBlock({ ...abilitiesBlock, feats: newFeatArray });
}

// Popup box when users clicks [i] or [+] button
// [i] will populate the PopupModal with information + associated feats to add
// [+] will populate the PopupModal with talents, spells, etc to add
function PopupModal({
  popupInfo,
  setPopupInfo,
  character,
  abilitiesBlock,
  setAbilitiesBlock,
}) {

  if (popupInfo.list != null) {
    //NEEDS IMPLEMENTATION
    return <div id="popupMod" className="visible"></div>;
  } else if (popupInfo.singleItem != null) {

    // this block is necessary to know how to add/subtract multiple tiers at once
    // most abilities have all three tiers... but some don't / skip a tier.
    let hasAdv = false;
    let hasChamp = false;
    Object.keys(popupInfo.singleItem).forEach((tier) => {
      if (tier == "Adventurer") {
        hasAdv = true;
      } else if (tier == "Champion") {
        hasChamp = true;
      }
    });


    return (
      <div
        id="popupMod"
        className={`visible ${
          popupInfo.singleItem.Base.length > 1000 ? "wide" : ""
        }`}
      >
        <button
          className="close-btn"
          onClick={() =>
            setPopupInfo({ title: "", singleItem: null, list: null })
          }
        >
          ✖
        </button>
        <span className="title">{popupInfo.title}</span>
        <span className="description">
          {popupInfo.singleItem.Base.split("\n\n").map((paragraph, index) => (
            <span key={index}>
              {paragraph}
              <br />
              <br />
            </span>
          ))}
        </span>
        <span className="feats">
          {Object.keys(popupInfo.singleItem)
            .filter((tier) => tier !== "Base" && tier !== "Type")
            .map((tier) => {
              const featText = `${tier} - ${popupInfo.singleItem[tier]}`;
              const btnVisible =
                !(character.level < 8 && tier == "Epic") &&
                !(character.level < 5 && tier == "Champion");
              const hasFeat = character.queryHasFeat(popupInfo.title, tier);
              return (
                <span
                  key={`${popupInfo.title}-${tier}`}
                  className={`feat ${hasFeat && "owned"}`}
                >
                  <button
                    onClick={() => 
                      alterFeats(
                        popupInfo.title,
                        tier,
                        !hasFeat, // add or remove
                        hasAdv,
                        hasChamp,
                        abilitiesBlock,
                        setAbilitiesBlock
                      )
                    }
                    className={`${btnVisible ? "visible" : "hidden"} ${
                      hasFeat ? "remove" : "add"
                    }`}
                  >
                    <span className={`text${hasFeat ? " minus" : ""}`}>{`${
                      hasFeat ? "-" : "+"
                    }`}</span>
                  </button>
                  <strong>{tier}</strong> - {popupInfo.singleItem[tier]}
                </span>
              );
            })}
        </span>
      </div>
    );
  } else {
    return <div id="popupMod" className="hidden"></div>;
  }
}

function AbilitiesBlock({ character, abilitiesBlock, setAbilitiesBlock }) {
  const [popupInfo, setPopupInfo] = useState({
    title: "",
    singleItem: null,
    list: null,
  });

  return (
    <div id="abilitiesblock" className="input-group">
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
        {generateLinedInputWithBtn("general", character, setPopupInfo)}
      </div>
      <div id="talents" className="abilities-input lined-inputs">
        <label className="subtitle-label">Talents</label>
        {generateLinedInputWithBtn("talents", character, setPopupInfo)}
      </div>
      <div id="spells" className="abilities-input lined-inputs">
        <label className="subtitle-label">Spells</label>
        {generateLinedInputWithBtn("spells", character, setPopupInfo)}
      </div>
      <div id="bonusAbs" className="abilities-input lined-inputs">
        <label className="subtitle-label">Bonus Abs</label>
        {generateLinedInputWithBtn("bonusAbs", character, setPopupInfo)}
      </div>
    </div>
  );
}

export default AbilitiesBlock;
