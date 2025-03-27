import AbilityCard from "./AbilityCard.jsx";

function alterFamiliarAbs(
  familiarAbName,
  isAdding,
  abilitiesBlock,
  setAbilitiesBlock
) {
  let newFamiliarAbArray = [];
  if (isAdding) {
    newFamiliarAbArray.push(...abilitiesBlock.familiarAbs);
    newFamiliarAbArray.push(familiarAbName);
  } else {
    newFamiliarAbArray = abilitiesBlock.familiarAbs.filter(
      (familiarAb) => familiarAb != familiarAbName
    );
  }

  setAbilitiesBlock({ ...abilitiesBlock, familiarAbs: newFamiliarAbArray });
}

function alterBonusOptions(
  talentName,
  bonusKey, // 'A' or 'B' or 'C'
  isAdding, // add or remove
  bonusMaxCount,
  abilitiesBlock,
  setAbilitiesBlock
) {
  let newOptionArray = [];
  if (isAdding) {
    newOptionArray.push(...abilitiesBlock.bonusOptions);
    const currentCount = newOptionArray.filter(
      (bonusOp) => Object.keys(bonusOp)[0] == talentName
    ).length;

    if (currentCount < bonusMaxCount) {
      newOptionArray.push({ [talentName]: bonusKey });
    }
  } else {
    newOptionArray = abilitiesBlock.bonusOptions.filter(
      (bonusOp) =>
        Object.keys(bonusOp)[0] != talentName ||
        Object.values(bonusOp)[0] != bonusKey
    );
  }

  setAbilitiesBlock({ ...abilitiesBlock, bonusOptions: newOptionArray });
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
    newTalentArray = abilitiesBlock.talents.filter(
      (talent) => talent != talentName
    );
  }

  setAbilitiesBlock({ ...abilitiesBlock, talents: newTalentArray });
}

function alterBonusAbs(
  abilityName,
  isAdding,
  abilitiesBlock,
  setAbilitiesBlock
) {
  let newBonusAbArray = [];
  if (isAdding) {
    newBonusAbArray.push(...abilitiesBlock.bonusAbs);
    newBonusAbArray.push(abilityName);
  } else {
    newBonusAbArray = abilitiesBlock.talents.filter(
      (ability) => ability != abilityName
    );
  }

  setAbilitiesBlock({ ...abilitiesBlock, bonusAbs: newBonusAbArray });
}

// this function is used for 1) adding the spell or 2) altering a spell's spell-level
// NOT used for removing the spell entirely
function alterSpells(
  character,
  spellName,
  spellLevelTarget,
  currentSpellLevel,
  isAddingNewSpell,
  abilitiesBlock,
  setAbilitiesBlock,
  setPopupInfo
) {
  let newSpellArray = [...abilitiesBlock.spells];
  const minimumLevel = character.querySpellLevelMinimum();

  // the spellLevel - 2 works because this function will never be called at default / min level
  const newLevel =
    spellLevelTarget > currentSpellLevel
      ? spellLevelTarget
      : Math.max(minimumLevel, spellLevelTarget - 2);

  if (spellName != "Utility Spell") {
    newSpellArray = newSpellArray.filter(
      (spell) => Object.keys(spell)[0] != spellName
    );
  } else if (!isAddingNewSpell) {
    //because there can be multiple utility spells, only find ONE of matching spell level
    const utilitySpellIndex = newSpellArray.findIndex(
      (spell) =>
        Object.keys(spell)[0] == spellName &&
        Number(Object.values(spell)[0].substring(6)) == currentSpellLevel
    );

    newSpellArray = newSpellArray.filter(
      (_, index) => index !== utilitySpellIndex
    );
  }

  if (newLevel != 0) {
    newSpellArray.push({ [spellName]: `Level ${newLevel}` });

    if (setPopupInfo) {
      setPopupInfo((prev) => {
        if (prev.singleItem && prev.title === spellName) {
          return {
            ...prev,
            singleItem: {
              ...prev.singleItem,
              Level: newLevel,
            },
          };
        }
        return prev;
      });
    }
  }

  setAbilitiesBlock({ ...abilitiesBlock, spells: newSpellArray });
}

//returns "" if no exclusive, otherwise returns name of exclusive ability
function checkExclusivity(abilityItem, abilitiesBlock) {
  //no exclusion
  if (typeof abilityItem !== "object" || !("Exclusive" in abilityItem)) {
    return "";
  }

  //only a single item
  const exclusions = abilityItem.Exclusive;
  if (!Array.isArray(exclusions)) {
    return abilitiesBlock.talents.includes(exclusions) ? exclusions : "";
  }

  //run through whole array
  let exclusionName = "";
  exclusions.forEach((abilityName) => {
    if (
      abilitiesBlock.talents.includes(abilityName) ||
      abilitiesBlock.spells.includes(abilityName) ||
      abilitiesBlock.bonusAbs.includes(abilityName) ||
      abilitiesBlock.feats.includes(abilityName)
    ) {
      exclusionName = abilityName;
    }
  });

  return exclusionName;
}

function addableItemInfo(
  popupInfo,
  item,
  character,
  abilitiesBlock,
  setAbilitiesBlock
) {
  const name = Object.keys(item)[0];
  let tier = "";
  if (popupInfo.mode == "general" || popupInfo.mode == "Animal Companion") {
    tier = Object.keys(Object.values(item)[0])[0];
  } else if (popupInfo.mode == "talents") {
    tier = Object.values(item)[0].Type;
  }

  const spellLevel =
    popupInfo.mode == "spells"
      ? Math.max(
          Object.values(item)[0].Level,
          character.querySpellLevelMinimum()
        )
      : "";

  let text = "";
  if (popupInfo.mode == "general" || popupInfo.mode == "Animal Companion") {
    text = Object.values(Object.values(item)[0]);
  } else if (popupInfo.mode == "talents") {
    text = Object.values(item)[0].Base;
    if ("Options" in Object.values(item)[0]) {
      Object.entries(Object.values(item)[0].Options)
        .filter(([key, _]) => key != "Count")
        .forEach(([key, val]) => {
          text += ` (${key}) ${val}`;
        });
    }
  } else if (popupInfo.mode == "Familiar") {
    text = Object.values(item)[0];
  } else if (popupInfo.mode == "spells" || popupInfo.mode == "bonusAbs") {
    const itemValues = Object.values(item)[0];
    if ("Effect" in itemValues) {
      text = itemValues.Effect;
    } else if ("Hit" in itemValues) {
      text = itemValues.Hit;
    } else if ("Effect (Power)" in itemValues) {
      text = itemValues["Effect (Power)"];
    } else if ("Opening & Sustained Effect" in itemValues) {
      text = itemValues["Opening & Sustained Effect"];
    }

    if (`Level ${spellLevel}` in itemValues) {
      text += `\n\n(Level ${spellLevel}: ${itemValues[`Level ${spellLevel}`]})`;
    }

    if ("Triggering Roll" in itemValues) {
      text = `[${itemValues["Triggering Roll"]}] ${text}`;
    }

    if ("Trigger" in itemValues) {
      text = `[${itemValues["Trigger"]}] ${text}`;
    }

    if ("Special" in itemValues) {
      text += `\n\n(${itemValues["Special"]})`;
    }
  }

  let onClickFn = null;
  if (popupInfo.mode == "general" || popupInfo.mode == "Animal Companion") {
    onClickFn = () =>
      alterFeats(
        name,
        tier,
        true,
        false,
        false,
        abilitiesBlock,
        setAbilitiesBlock
      );
  } else if (popupInfo.mode == "talents") {
    onClickFn = () =>
      alterTalents(name, true, abilitiesBlock, setAbilitiesBlock);
  } else if (popupInfo.mode == "Familiar") {
    onClickFn = () =>
      alterFamiliarAbs(name, true, abilitiesBlock, setAbilitiesBlock);
  } else if (popupInfo.mode == "spells") {
    onClickFn = () =>
      alterSpells(
        character,
        name,
        spellLevel,
        0,
        true,
        abilitiesBlock,
        setAbilitiesBlock
      );
  } else if (popupInfo.mode == "bonusAbs") {
    onClickFn = () =>
      alterBonusAbs(name, true, abilitiesBlock, setAbilitiesBlock);
  }

  return [name, tier, text, onClickFn];
}

function popupModalList(
  popupInfo,
  setPopupInfo,
  character,
  abilitiesBlock,
  setAbilitiesBlock
) {
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
          const [name, tier, text, onClickFn] = addableItemInfo(
            popupInfo,
            item,
            character,
            abilitiesBlock,
            setAbilitiesBlock
          );

          // tier / level restrictions
          const levelRestricted =
            (tier == "Epic" && character.level < 8) ||
            (tier == "Champion" && character.level < 5);
          // or exclusive restrictions
          //let exclusiveRestricted = (popupInfo.mode == "talents" && "Exclusive" in Object.values(item)[0] && abilitiesBlock.talents.includes(Object.values(item)[0].Exclusive));
          const exclusiveRestricted = checkExclusivity(
            Object.values(item)[0],
            abilitiesBlock
          );

          let buttonText = levelRestricted ? "Tier Too High" : "+";
          buttonText =
            exclusiveRestricted !== ""
              ? `Exclusive w/ ${exclusiveRestricted}`
              : buttonText;

          return (
            <span key={`${name}`} className={`addable-item${"Level" in item[name] ? ` SL${item[name].Level}` : ""}${"Source" in item[name] ? ` ${item[name].Source}` : ""}`}>
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
    return popupModalList(
      popupInfo,
      setPopupInfo,
      character,
      abilitiesBlock,
      setAbilitiesBlock
    );
  } else if (popupInfo.singleItem != null) {
    return (
      <AbilityCard
        abilityInfo={popupInfo}
        setPopupInfo={setPopupInfo}
        character={character}
        abilitiesBlock={abilitiesBlock}
        setAbilitiesBlock={setAbilitiesBlock}
        alterFeats={alterFeats}
        alterSpells={alterSpells}
        alterBonusOptions={alterBonusOptions}
      />
    );
  } else {
    return <div id="popupMod" className="hidden"></div>;
  }
}

export default PopupModal;
