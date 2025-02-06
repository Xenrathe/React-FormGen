import races from "../data/races";
import jobs from "../data/jobs";
import genFeats from "../data/abilities/general.json"
import { useState } from "react";

function PopupModal({popupInfo, setPopupInfo}) {
  if (popupInfo.mode == "hidden") {
    return (
      <div id="popupMod" className="hidden">

      </div>
    );
  } else if (popupInfo.list != null) {
    return (
      <div id="popupMod" className="visible">

      </div>
    );
  } else if (popupInfo.singleItem != null) {
    return (
      <div id="popupMod" className="visible">
        <button className="close-btn" onClick={() => setPopupInfo({ ...popupInfo, mode: "hidden" })}>✖</button>
        <span className="title">{popupInfo.title}</span>
        <span className="description">{popupInfo.singleItem.Base}</span>
      </div>
    );
  }
}

function generateLinedInputWithBtn(mode, character) {
  let numLines = 10;
  let dataArray = [];

  //mode = "general"
  // --includes associated feats from character.feats.talent
  if (mode == "general") {

    // includes racialpowers from races[character.race].racialPowersAndFeats
    Object.keys(races[character.race].racialPowersAndFeats).forEach((title) => {
      if (title != "Adventurer" && title != "Champion" && title != "Epic") {
        dataArray.push(title);
      }
    });

    // --includes racialfeats from character.feats.racial
    Object.keys(character.feats.racial).forEach((title) => {
        dataArray.push(title);
    });

    // includes features from jobs[character.job].features 
    Object.keys(jobs[character.job].features).forEach((title) => {
      if (title != "Adventurer" && title != "Champion" && title != "Epic") {
        dataArray.push(title);
      }
    });

    // includes feats from the character.feats.general
    Object.keys(character.feats.general).forEach((title) => {
      dataArray.push(title);
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
    lines.push(
      <div key={`k-${mode}-${i}`} className="single-line-w-btn">
        <span className="lined-input">{dataArray[i - 1] || ""}</span>
        {dataArray[i - 1] && <button>i</button>}
        {!dataArray[i - 1] && <button>+</button>}
      </div>
    );
  }

  return lines;
}

function AbilitiesBlock({ character, abilitiesBlock, setAbilitiesBlock }) {

  const [popupInfo, setPopupInfo] = useState({
    mode: "",
    title: "Cruel",
    singleItem: races["Dark Elf"].racialPowersAndFeats["Cruel"],
    list: null,
  });

  return (
    <div id="abilitiesblock" className="input-group">
      <PopupModal popupInfo={popupInfo} setPopupInfo={setPopupInfo}/>
      <div className="title-label">Abilities</div>
      <div id="job-race-gen" className="abilities-input lined-inputs">
        <label className="subtitle-label">Class, Race, Gen Feats</label>
        {generateLinedInputWithBtn("general", character)}
      </div>
      <div id="talents" className="abilities-input lined-inputs">
        <label className="subtitle-label">Talents</label>
        {generateLinedInputWithBtn("talents", character)}
      </div>
      <div id="spells" className="abilities-input lined-inputs">
        <label className="subtitle-label">Spells</label>
        {generateLinedInputWithBtn("spells", character)}
      </div>
      <div id="bonusAbs" className="abilities-input lined-inputs">
        <label className="subtitle-label">Bonus Abs</label>
        {generateLinedInputWithBtn("bonusAbs", character)}
      </div>
    </div>
  );
}

export default AbilitiesBlock;