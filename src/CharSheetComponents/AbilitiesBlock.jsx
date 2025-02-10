import races from "../data/races";
import jobs from "../data/jobs";
import genFeats from "../data/abilities/general.json";
import { useState } from "react";

function PopupModal({ popupInfo, setPopupInfo }) {
  if (popupInfo.list != null) {
    return <div id="popupMod" className="visible"></div>;
  } else if (popupInfo.singleItem != null) {
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
      </div>
    );
  } else {
    return <div id="popupMod" className="hidden"></div>;
  }
}

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
    character.feats.racial.forEach((entry) => {
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

    console.log(dataArray);
    /* 
    // includes feats from the character.feats.general
    Object.keys(character.feats.general).forEach((title) => {
      dataArray.push(title);
    });*/
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

function getFeatsRemaining(character) {
  const advFeatsRemain = character.queryMaxFeats().Adventurer - character.queryCurrentFeats().Adventurer;
  const champFeatsRemain = character.queryMaxFeats().Champion - character.queryCurrentFeats().Champion;
  const epicFeatsRemain = character.queryMaxFeats().Epic - character.queryCurrentFeats().Epic;

  if (advFeatsRemain == 0 && champFeatsRemain == 0 && epicFeatsRemain == 0) {
    return '';
  }

  let returnString = `(Feats Remain: ${advFeatsRemain} A`
  if (character.level > 4) {
    returnString += `, ${champFeatsRemain} C`
  }
  if (character.level > 7 ) {
    returnString += `, ${epicFeatsRemain} E`
  }

  returnString += ')';

  return returnString;
}

function AbilitiesBlock({ character, abilitiesBlock, setAbilitiesBlock }) {
  const [popupInfo, setPopupInfo] = useState({
    title: "Cruel",
    singleItem: races["Dark Elf"].racialPowersAndFeats["Cruel"],
    list: null,
  });

  return (
    <div id="abilitiesblock" className="input-group">
      <PopupModal popupInfo={popupInfo} setPopupInfo={setPopupInfo} />
      <div className="title-label">
        Abilities {getFeatsRemaining(character)}
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
