import races from "../data/races";
import jobs from "../data/jobs";
import genFeats from "../data/abilities/general.json"

function generateLinedInputWithBtn(mode) {
  let numLines = 1;
  let dataArray = [];

  //mode = "general"
  // includes feats from the character.feats.general
  // includes racialpowers from races[character.race].racialPowersAndFeats
  // --includes racialfeats from character.feats.racial
  // includes features from jobs[character.job].features 
  // --includes associated feats from character.feats.talent

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
        <button>i</button>
        <button>+</button>
      </div>
    );
  }

  return lines;
}

function AbilitiesBlock({ character, abilitiesBlock, setAbilitiesBlock }) {
  return (
    <div id="abilitiesblock" className="input-group">
      <div className="title-label">Abilities</div>
      <div id="job-race-gen" className="abilities-input">
        <label className="subtitle-label">Class, Race, Gen Feats</label>
        {generateLinedInputWithBtn("general")}
      </div>
      <div id="talents" className="abilities-input">
        <label className="subtitle-label">Talents</label>
        {generateLinedInputWithBtn("talents")}
      </div>
      <div id="spells" className="abilities-input">
        <label className="subtitle-label">Spells</label>
        {generateLinedInputWithBtn("spells")}
      </div>
      <div id="bonusAbs" className="abilities-input">
        <label className="subtitle-label">Bonus Abs</label>
        {generateLinedInputWithBtn("bonusAbs")}
      </div>
    </div>
  );
}

export default AbilitiesBlock;