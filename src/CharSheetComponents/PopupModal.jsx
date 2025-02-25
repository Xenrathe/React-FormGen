function alterFamiliarAbs(familiarAbName, isAdding, abilitiesBlock, setAbilitiesBlock){
  let newFamiliarAbArray = [];
  if (isAdding) {
    newFamiliarAbArray.push(...abilitiesBlock.familiarAbs);
    newFamiliarAbArray.push(familiarAbName);
  } else {
    newFamiliarAbArray = abilitiesBlock.familiarAbs.filter((familiarAb) => familiarAb != familiarAbName);
  }

  setAbilitiesBlock({...abilitiesBlock, familiarAbs: newFamiliarAbArray});
}

//add or remove a feat WITHIN another feat/ability
//not for STAND ALONE feats or abilities
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
      return !(name == featName);
    });

    //add multiple tiers of feats, depending on situation
    if (featTier == "Adventurer" || hasAdv) {
      newFeatArray.push({ [featName]: "Adventurer" });
    }

    if (featTier == "Champion" || (featTier == "Epic" && hasChamp)) {
      newFeatArray.push({ [featName]: "Champion" });
    }

    if (featTier == "Epic") {
      newFeatArray.push({ [featName]: "Epic" });
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

  setAbilitiesBlock({ ...abilitiesBlock, feats: newFeatArray });
}

function alterTalents(talentName, isAdding, abilitiesBlock, setAbilitiesBlock) {
  let newTalentArray = [];
  if (isAdding) {
    newTalentArray.push(...abilitiesBlock.talents);
    newTalentArray.push(talentName);
  } else {
    newTalentArray = abilitiesBlock.talents.filter((talent) => talent != talentName);
  }

  setAbilitiesBlock({...abilitiesBlock, talents: newTalentArray});
}

//returns "" if no exclusive, otherwise returns name of exclusive ability
function checkExclusivity(abilityItem, abilitiesBlock) {
  //no exclusion
  if (typeof abilityItem !== 'object' || !("Exclusive" in abilityItem)) {
    return "";
  }

  //only a single item
  const exclusions = abilityItem.Exclusive;
  if (!Array.isArray(exclusions)){
    return abilitiesBlock.talents.includes(exclusions) ? exclusions : "";
  }

  //run through whole array
  let exclusionName = "";
  exclusions.forEach((abilityName) => {
    if (abilitiesBlock.talents.includes(abilityName) || abilitiesBlock.spells.includes(abilityName) || abilitiesBlock.bonusAbs.includes(abilityName) || abilitiesBlock.feats.includes(abilityName)) {
      exclusionName = abilityName;
    }
  });

  return exclusionName;
}

function addableItemInfo(popupInfo, item, abilitiesBlock, setAbilitiesBlock) {
  const name = Object.keys(item)[0];
  let tier = "";
  if (popupInfo.mode == "general") {
    tier = Object.keys(Object.values(item)[0])[0];
  } else if (popupInfo.mode == "talents") {
    tier = Object.values(item)[0].Type;
  }

  let text = "";
  if (popupInfo.mode == "general") {
    text = Object.values(Object.values(item)[0]);
  } else if (popupInfo.mode == "talents") {
    text = Object.values(item)[0].Base;
  } else if (popupInfo.mode == "Familiar") {
    text = Object.values(item)[0];
  }

  let onClickFn = null;
  if (popupInfo.mode == "general") {
    onClickFn = () => alterFeats(
      name,
      tier,
      true, 
      false, 
      false, 
      abilitiesBlock,
      setAbilitiesBlock
    );
  } else if (popupInfo.mode == "talents") {
    onClickFn = () => alterTalents(name, true, abilitiesBlock, setAbilitiesBlock);
  } else if (popupInfo.mode == "Familiar") {
    onClickFn = () => alterFamiliarAbs(name, true, abilitiesBlock, setAbilitiesBlock);
  }

  return ([name, tier, text, onClickFn])
}

// Popup box when users clicks [i] or [+] button
// [i] will populate the PopupModal with information + associated feats to add
// [+] will populate the PopupModal with talents, spells, etc to add
function PopupModal({
  popupInfo,
  setPopupInfo,
  character,
  abilitiesBlock,
  setAbilitiesBlock
}) {
  if (popupInfo.list != null) {
    return (
      <div
        id="popupMod"
        className={`visible
            ${
              popupInfo.list.length > 4 && popupInfo.list.length < 9
                ? " wide"
                : ""
            }
            ${popupInfo.list.length > 8 ? " widest" : ""}`}
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
        <span className="addable-items">
          {popupInfo.list.map((item) => {
            const [name, tier, text, onClickFn] = addableItemInfo(popupInfo, item, abilitiesBlock, setAbilitiesBlock);

            // tier / level restrictions
            const levelRestricted = (tier == "Epic" && character.level < 8 || tier == "Champion" && character.level < 5);
            // or exclusive restrictions
            //let exclusiveRestricted = (popupInfo.mode == "talents" && "Exclusive" in Object.values(item)[0] && abilitiesBlock.talents.includes(Object.values(item)[0].Exclusive));
            const exclusiveRestricted = checkExclusivity(Object.values(item)[0], abilitiesBlock);

            let buttonText = levelRestricted ? "Tier Too High" : "+";
            buttonText = exclusiveRestricted !== "" ? `Exclusive w/ ${exclusiveRestricted}` : buttonText;

            return (
              <span key={`${name}`} className={`addable-item`}>
                <button
                  onClick={() => {
                    onClickFn();
                    setPopupInfo({ title: "", singleItem: null, list: null });
                  }}
                  className="alterBtn visible add"
                  disabled={levelRestricted || exclusiveRestricted}
                >
                  <span className="text">{buttonText}</span>
                </button>
                <strong>{name}</strong> - {text}
              </span>
            );
          })}
        </span>
      </div>
    );
  } else if (popupInfo.singleItem != null) {
    // this block is necessary to know how to add/subtract multiple tiers at once
    // most abilities have all three tiers... but some don't / skip a tier.
    let hasAdv = false;
    let hasChamp = false;

    console.log(popupInfo.singleItem);

    const infoLength = Object.values(popupInfo.singleItem)
      .map((value) => value.length)
      .reduce((sum, length) => sum + length, 0);

    const exclusionAdd = "Exclusive" in popupInfo.singleItem ? (
      <strong>
        Exclusive with {Array.isArray(popupInfo.singleItem.Exclusive) ? popupInfo.singleItem.Exclusive.join("; ") : popupInfo.singleItem.Exclusive}
        <br/>
        <br/>
      </strong>
    ) : null;

    const invocationAdd = "Invocation" in popupInfo.singleItem ? (
      <span>
        <strong>Invocation: </strong>{popupInfo.singleItem.Invocation}
        <br/>
        <br/>
      </span>
    ) : null;

    const advantageAdd = "Advantage" in popupInfo.singleItem ? (
      <span>
        <strong>Advantage: </strong>{popupInfo.singleItem.Advantage}
        <br/>
        <br/>
      </span>
    ) : null;

    const actsAdd = "Acts" in popupInfo.singleItem ? (
      <span>
        <strong>Acts: </strong>{popupInfo.singleItem.Acts}
        <br/>
        <br/>
      </span>
    ) : null;

    const baseDescription =
      "Base" in popupInfo.singleItem ? (
        <span className="description">
          {popupInfo.singleItem.Base.split("\n\n").map((paragraph, index) => (
            <span key={index}>
              {paragraph}
              <br />
              <br />
            </span>
          ))}
          {invocationAdd}{actsAdd}{advantageAdd}{exclusionAdd}
        </span>
      ) : null;

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
        className={`visible
            ${infoLength > 1000 && infoLength <= 2000 ? " wide" : ""}
            ${infoLength > 2000 ? " widest" : ""}
            `}
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
        {baseDescription}
        <span className="feats">
          {Object.keys(popupInfo.singleItem)
            .filter((tier) => tier == "Adventurer" || tier == "Champion" || tier == "Epic")
            .map((tier) => {
              const featText = `${tier} - ${popupInfo.singleItem[tier]}`;
              const btnVisible =
                !(character.level < 8 && tier == "Epic") &&
                !(character.level < 5 && tier == "Champion");
              const hasFeat = character.queryFeatIsOwned(popupInfo.title, tier);

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
                    className={`alterBtn ${btnVisible ? "visible" : "hidden"} ${
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

export default PopupModal;