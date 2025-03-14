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

function AbilityCard({
  abilityInfo,
  setPopupInfo,
  character,
  abilitiesBlock,
  setAbilitiesBlock,
  alterFeats,
  alterSpells
}) {
  // if infoOnly is true, then all buttons will be HIDDEN; only owned feats and spell-levels will be shown
  // it's used for the AbilitySheet component, which is several pages of printable info
  const infoOnly = setPopupInfo == null;

  // used to set CSS class for width of popup
  let infoLength = Object.values(abilityInfo.singleItem)
    .map((value) => value.length)
    .reduce((sum, length) => sum + length, 0);
  infoLength = abilityInfo.mode == "spells" && abilityInfo.title == "Cantrips" ? 3000 : infoLength; //special case for cantrips

  // this code is necessary to know how to add/subtract multiple tiers at once
  // most abilities have all three tiers... but some don't (or skip a tier).
  const feats = Object.keys(abilityInfo.singleItem).filter((tier) => tier == "Adventurer" || tier == "Champion" || tier == "Epic");
  const hasAdv = feats.includes["Adventurer"];
  const hasChamp = feats.includes["Champion"];

  // these variables are used to determine spell level button clickability as well as default spell-level
  let ownedSpellLevel =
    abilitiesBlock.spells
      .find((spell) => Object.keys(spell)[0] == abilityInfo.title)
      ?.[abilityInfo.title].substring(6) ?? -1;
  ownedSpellLevel =
    abilityInfo.mode == "Utility"
      ? abilitiesBlock.spells
          .find((spell) => Object.keys(spell)[0] == "Utility Spell")
          ?.["Utility Spell"].substring(6) ?? 0
      : ownedSpellLevel;

  ownedSpellLevel = Number(ownedSpellLevel);
  const maxSpellLevel =
    character.querySpellLevelMaximums().findLastIndex((num) => num > 0) * 2 + 1;

  const spellLevels = Object.keys(abilityInfo.singleItem).filter((itemKey) => itemKey.length > 5 && itemKey.substring(0, 5) == "Level");
  return (
    <div
      id="popupMod"
      className={`visible
          ${infoLength > 1000 && infoLength <= 2000 ? " wide" : ""}
          ${infoLength > 2000 ? " widest" : ""}
          `}
    >
      {!infoOnly && <button
        className="close-btn"
        onClick={() =>
          setPopupInfo({ title: "", singleItem: null, list: null })
        }
      >
        ✖
      </button>}
      <span className="title">{abilityInfo.title}</span>
      {getSingleItemDescription(abilityInfo)}
      {abilityInfo.mode == "spells" && abilityInfo.title == "Cantrips"
        ? popupModalCantripListing(character)
        : null}
      {abilityInfo.mode == "spells" && abilityInfo.title == "Utility Spell"
        ? popupModalUtilitySpellListing(character, abilitiesBlock, setPopupInfo)
        : null}
      {spellLevels.length > 0 && <span className="single-selectables" id="spell-levels">
        {
          spellLevels.map((itemKey) => {
            const spellLevel = Number(itemKey.substring(5));
            const hasLevel = ownedSpellLevel >= spellLevel;
            const btnVisible = !infoOnly && (hasLevel || spellLevel <= maxSpellLevel);

            // only show KNOWN spell-levels in infoOnly mode
            if (hasLevel || !infoOnly) {
              return (
                <span
                  key={`${abilityInfo.title}-${itemKey}`}
                  className={`selectable ${hasLevel && "owned"}`}
                >
                  {btnVisible && <button
                    onClick={() =>
                      alterSpells(
                        character,
                        abilityInfo.title,
                        spellLevel,
                        !hasLevel,
                        abilitiesBlock,
                        setAbilitiesBlock
                      )
                    }
                    className={`alterBtn ${hasLevel ? "remove" : "add"} ${abilityInfo.mode == "Utility" ? "utility" : ""}`}
                    disabled={abilityInfo.mode == "Utility"}
                  >
                    <span className={`text${hasLevel ? " minus" : ""}`}>{`${hasLevel ? "-" : "+"}`}</span>
                  </button>}
                  <strong>{itemKey}</strong> - {abilityInfo.singleItem[itemKey]}
                </span>
              );
            } else {
              return "";
            }  
          })}
      </span>}
      {feats.length > 0 && <span className="single-selectables" id="feats">
        {feats.map((tier) => {
            const hasFeat = character.queryFeatIsOwned(abilityInfo.title, tier);
            const btnVisible = !infoOnly && (hasFeat || (!(character.level < 8 && tier == "Epic") && !(character.level < 5 && tier == "Champion")));
            
            // only show KNOWN feats in infoOnly mode
            if (hasFeat || !infoOnly) {
              return (
                <span
                  key={`${abilityInfo.title}-${tier}`}
                  className={`selectable ${hasFeat && "owned"}`}
                >
                  {btnVisible && <button
                    onClick={() =>
                      alterFeats(
                        abilityInfo.title,
                        tier,
                        !hasFeat, // add or remove
                        hasAdv,
                        hasChamp,
                        abilitiesBlock,
                        setAbilitiesBlock
                      )
                    }
                    className={`alterBtn ${hasFeat ? "remove" : "add"}`}
                  >
                    <span className={`text${hasFeat ? " minus" : ""}`}>{`${
                      hasFeat ? "-" : "+"
                    }`}</span>
                  </button>}
                  <strong>{tier}</strong> - {abilityInfo.singleItem[tier]}
                </span>
              );
            } else {
              return "";
            }
          })}
      </span>}
    </div>
  );
}

export default AbilityCard;