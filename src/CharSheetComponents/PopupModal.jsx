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

// please note that this spell NEVER fully removes a spell - but only reduces its level
function alterSpells(
  character,
  spellName,
  spellLevel,
  isAdding,
  abilitiesBlock,
  setAbilitiesBlock
) {
  let newSpellArray = [];
  const minimumLevel =
    spellName == "Utility Spell" ? 0 : character.querySpellLevelMinimum();
  let newLevel = isAdding ? spellLevel : Math.max(minimumLevel, spellLevel - 2); // the spellLevel - 2 works because this function will never be called at default / min level

  newSpellArray = abilitiesBlock.spells.filter(
    (spell) => Object.keys(spell)[0] != spellName
  );

  newSpellArray.push({ [spellName]: `Level ${newLevel}` });
  setAbilitiesBlock({ ...abilitiesBlock, spells: newSpellArray });
}

function getSingleItemDescription(popupInfo) {
  const baseCategories = ["Base"];
  const baseDescription = baseCategories
    .filter((category) => category in popupInfo.singleItem)
    .map((category) => (
      <span key={category}>
        {popupInfo.singleItem[category]
          .split("\n\n")
          .map((paragraph, index) => (
            <span key={`${category}-${index}`}>
              {paragraph}
              <br />
              <br />
            </span>
          ))}
      </span>
    ));

  const spellBase =
    "Frequency" in popupInfo.singleItem ? (
      <span key="spellbase">
        {popupInfo.singleItem.Type}; {popupInfo.singleItem.Frequency};{" "}
        {"Sustain" in popupInfo.singleItem
          ? `${popupInfo.singleItem.Sustain} to cast/sustain`
          : `${popupInfo.singleItem?.Action ?? "Standard"} action to ${
              popupInfo.mode == "spells" ? "cast" : "use"
            }`}
        <br />
        <br />
      </span>
    ) : null;

  const spellCategories = [
    "Triggering Roll",
    "Trigger",
    "Target",
    "Attack",
    "Effect",
    "Effect (Power)",
    "Effect (Broad)",
    "Opening & Sustained Effect",
    "Hit",
    "Hit by 4+",
    "Hit by 8+",
    "Hit by 12+ or Natural 20",
    "Final Verse",
    "Miss",
    "Natural Even Miss",
    "Special (Miss)",
    "Special",
    "Limited Casting",
    "Limited Resurrection",
  ];
  const spellAdditions = spellCategories.map((category) => {
    return category in popupInfo.singleItem ? (
      <span key={category}>
        <strong>{category}: </strong>
        {popupInfo.singleItem[category]}
        <br />
      </span>
    ) : null;
  });

  /*if (spellAdditions.length > 1) {
    spellAdditions.push(<br key="spell-addition-break" />);
  }*/

  const additionCategories = ["Invocation", "Advantage", "Acts"];
  const standardAdditions = additionCategories.map((category) => {
    return category in popupInfo.singleItem ? (
      <span key={category}>
        <strong>{category}: </strong>
        {popupInfo.singleItem[category]}
        <br />
        <br />
      </span>
    ) : null;
  });

  const exclusionAdd =
    "Exclusive" in popupInfo.singleItem ? (
      <strong key="exclusionadd">
        Exclusive with{" "}
        {Array.isArray(popupInfo.singleItem.Exclusive)
          ? popupInfo.singleItem.Exclusive.join("; ")
          : popupInfo.singleItem.Exclusive}
        <br />
        <br />
      </strong>
    ) : null;

  return (
    <span className="description">
      {baseDescription}
      {spellBase}
      {spellAdditions}
      {standardAdditions}
      {exclusionAdd}
    </span>
  );
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
}

function popupModalSingleItem(
  popupInfo,
  setPopupInfo,
  character,
  abilitiesBlock,
  setAbilitiesBlock
) {
  // used to set CSS class for width of popup
  let infoLength = Object.values(popupInfo.singleItem)
    .map((value) => value.length)
    .reduce((sum, length) => sum + length, 0);
  infoLength = popupInfo.title == "Cantrips" ? 3000 : infoLength; //special case for cantrips

  // this code is necessary to know how to add/subtract multiple tiers at once
  // most abilities have all three tiers... but some don't (or skip a tier).
  let hasAdv = false;
  let hasChamp = false;
  Object.keys(popupInfo.singleItem).forEach((tier) => {
    if (tier == "Adventurer") {
      hasAdv = true;
    } else if (tier == "Champion") {
      hasChamp = true;
    }
  });

  // these variables are used to determine spell level button clickability as well as default spell-level
  let ownedSpellLevel =
    abilitiesBlock.spells
      .find((spell) => Object.keys(spell)[0] == popupInfo.title)
      ?.[popupInfo.title].substring(6) ?? -1;
  ownedSpellLevel =
    popupInfo.mode == "Utility"
      ? abilitiesBlock.spells
          .find((spell) => Object.keys(spell)[0] == "Utility Spell")
          ?.["Utility Spell"].substring(6) ?? 0
      : ownedSpellLevel;

  ownedSpellLevel = Number(ownedSpellLevel);
  const maxSpellLevel =
    character.querySpellLevelMaximums().findLastIndex((num) => num > 0) * 2 + 1;

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
      {getSingleItemDescription(popupInfo)}
      {popupInfo.title == "Cantrips"
        ? popupModalCantripListing(character)
        : null}
      {popupInfo.title == "Utility Spell"
        ? popupModalUtilitySpellListing(character, abilitiesBlock, setPopupInfo)
        : null}
      <span className="single-selectables" id="spell-levels">
        {Object.keys(popupInfo.singleItem)
          .filter(
            (itemKey) =>
              itemKey.length > 5 && itemKey.substring(0, 5) == "Level"
          )
          .map((itemKey) => {
            const spellLevel = Number(itemKey.substring(5));
            const hasLevel = ownedSpellLevel >= spellLevel;
            const btnVisible = hasLevel || spellLevel <= maxSpellLevel;

            return (
              <span
                key={`${popupInfo.title}-${itemKey}`}
                className={`selectable ${hasLevel && "owned"}`}
              >
                <button
                  onClick={() =>
                    alterSpells(
                      character,
                      popupInfo.title,
                      spellLevel,
                      !hasLevel,
                      abilitiesBlock,
                      setAbilitiesBlock
                    )
                  }
                  className={`alterBtn ${btnVisible ? "visible" : "hidden"} ${
                    hasLevel ? "remove" : "add"
                  } ${popupInfo.mode == "Utility" ? "utility" : ""}`}
                  disabled={popupInfo.mode == "Utility"}
                >
                  <span className={`text${hasLevel ? " minus" : ""}`}>{`${
                    hasLevel ? "-" : "+"
                  }`}</span>
                </button>
                <strong>{itemKey}</strong> - {popupInfo.singleItem[itemKey]}
              </span>
            );
          })}
      </span>
      <span className="single-selectables" id="feats">
        {Object.keys(popupInfo.singleItem)
          .filter(
            (tier) =>
              tier == "Adventurer" || tier == "Champion" || tier == "Epic"
          )
          .map((tier) => {
            const hasFeat = character.queryFeatIsOwned(popupInfo.title, tier);
            const btnVisible =
              hasFeat ||
              (!(character.level < 8 && tier == "Epic") &&
                !(character.level < 5 && tier == "Champion"));

            return (
              <span
                key={`${popupInfo.title}-${tier}`}
                className={`selectable ${hasFeat && "owned"}`}
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
}

function popupModalCantripListing(character) {
  const cantripList = character.getCantrips();

  return (
    <span className="single-selectables" id="cantrips">
      {Object.keys(cantripList).map((itemKey) => {
        const description = cantripList[itemKey].Effect;

        return (
          <span key={`${itemKey}`} className="selectable">
            <strong>{itemKey}</strong> - {description}
          </span>
        );
      })}
    </span>
  );
}

function popupModalUtilitySpellListing(
  character,
  abilitiesBlock,
  setPopupInfo
) {
  const utilityList = character.getUtilitySpells();

  let utilitySpellLevel =
    abilitiesBlock.spells
      .find((spell) => Object.keys(spell)[0] == "Utility Spell")
      ?.["Utility Spell"].substring(6) ?? 0;

  return (
    <span className="single-selectables" id="utility-spells">
      {utilityList.map((utilSpell) => {
        const spellLevel = Number(Object.values(utilSpell)[0].Level);
        const title = Object.keys(utilSpell)[0];
        const hasLevel = utilitySpellLevel >= spellLevel;

        //console.log(utilSpell);

        return (
          <span
            key={`${title}`}
            className={`selectable ${hasLevel && "owned"}`}
          >
            <button
              onClick={() =>
                setPopupInfo({
                  title: title,
                  singleItem: utilSpell[title],
                  list: null,
                  mode: "Utility",
                })
              }
              className="alterBtn visible add"
            >
              <span className="text">?</span>
            </button>
            <strong>{`${title} (Lvl: ${spellLevel})`}</strong>
          </span>
        );
      })}
    </span>
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
    return popupModalSingleItem(
      popupInfo,
      setPopupInfo,
      character,
      abilitiesBlock,
      setAbilitiesBlock
    );
  } else {
    return <div id="popupMod" className="hidden"></div>;
  }
}

export default PopupModal;
