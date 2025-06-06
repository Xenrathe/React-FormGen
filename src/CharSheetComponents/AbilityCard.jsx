function getSingleItemDescription(popupInfo) {
  const exclusionAdd =
    "Exclusive" in popupInfo.singleItem ? (
      <strong className="exclusionadd" key="exclusionadd">
        (Exclusive with{" "}
        {Array.isArray(popupInfo.singleItem.Exclusive)
          ? popupInfo.singleItem.Exclusive.join("; ")
          : popupInfo.singleItem.Exclusive}
        )
        <br />
      </strong>
    ) : null;

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

  const tableAddition = popupInfo.singleItem.Table ? (
    <table border="1">
      <thead>
        <tr>
          {Object.keys(popupInfo.singleItem.Table[0]).map((header) => (
            <th key={header}>{header}</th>
          ))}
        </tr>
      </thead>
      <tbody>
        {popupInfo.singleItem.Table.map((row, rowIndex) => (
          <tr key={rowIndex}>
            {Object.values(row).map((value, colIndex) => (
              <td key={colIndex}>{value}</td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  ) : null;

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
        {popupInfo.singleItem?.Extra ?? ""}
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

  return (
    <span className="description">
      {exclusionAdd}
      {baseDescription}
      {tableAddition}
      {spellBase}
      {spellAdditions}
      {standardAdditions}
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
  utilitySpellLevel,
  setPopupInfo
) {
  const utilityList = character.getUtilitySpells();

  return (
    <span className="single-selectables" id="utility-spells">
      {utilityList.map((utilSpell) => {
        const spellLevel = Number(Object.values(utilSpell)[0].Level);
        const title = Object.keys(utilSpell)[0];
        const hasLevel = utilitySpellLevel >= spellLevel;

        return (
          <span
            key={`${title}`}
            className={`selectable ${hasLevel && "owned"}`}
          >
            <button
              onClick={() =>
                setPopupInfo({
                  title: title,
                  singleItem: { ...utilSpell[title], Level: utilitySpellLevel },
                  list: null,
                  mode: "Utility",
                })
              }
              className="alterBtn visible add"
            >
              <span className="text">?</span>
            </button>
            <strong>{`${title} (L${spellLevel})`}</strong>
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
  alterSpells,
  alterBonusOptions,
}) {
  // if infoOnly is true, then all buttons will be HIDDEN; only owned feats and spell-levels will be shown
  // it's used for the AbilitySheet component, which is several pages of printable info
  const infoOnly = setPopupInfo == null;

  // used to set CSS class for width of popup
  let infoLength = Object.values(abilityInfo.singleItem)
    .map((value) => value.length ? value.length : 0)
    .reduce((sum, length) => sum + length, 0);

  if (Object.keys(abilityInfo.singleItem).includes("Table")) {
    if (Object.keys(abilityInfo.singleItem.Table[0]).length > 5) {
      infoLength = 1500;
    }
  }

  infoLength =
    abilityInfo.mode == "spells" && abilityInfo.title == "Cantrips"
      ? 3000
      : infoLength;

  // this code is necessary to know how to add/subtract multiple tiers at once
  // most abilities have all three tiers... but some don't (or skip a tier).
  const feats = Object.keys(abilityInfo.singleItem).filter(
    (tier) => tier == "Adventurer" || tier == "Champion" || tier == "Epic"
  );
  const hasAdv = feats.includes("Adventurer");
  const hasChamp = feats.includes("Champion");

  // these variables are used to determine spell level button clickability as well as default spell-level
  const SLPenalty = abilityInfo.singleItem?.SLPenalty ?? 0;
  const trueSLSlot =
    SLPenalty != 0 ? `@L${abilityInfo.singleItem?.Level} slot` : "";
  const ownedSpellLevel = (abilityInfo.singleItem?.Level ?? -1) + SLPenalty;
  const maxSpellLevel =
    character.querySpellLevelMaximums().findLastIndex((num) => num > 0) * 2 +
    1 +
    SLPenalty;
  const spellLevels = Object.keys(abilityInfo.singleItem).filter(
    (itemKey) => itemKey.length > 5 && itemKey.substring(0, 5) == "Level"
  );

  const [subOptionChoices, subOptions] = character.querySubOptions(abilityInfo);

  return (
    (!infoOnly || abilityInfo.title != "Utility Spell") && (
      <div
        id={infoOnly ? "" : "popupMod"}
        className={`ability-card visible${
          infoLength > 1000 && infoLength <= 2000 ? " wide" : ""
        }${infoLength > 2000 ? " widest" : ""}`}
      >
        {!infoOnly && (
          <button
            className="close-btn"
            onClick={() =>
              setPopupInfo({ title: "", singleItem: null, list: null })
            }
          >
            ✖
          </button>
        )}
        <span className="title">
          {abilityInfo.title}
          {ownedSpellLevel > 0 ? ` (L${ownedSpellLevel}${trueSLSlot})` : ""}
        </span>
        {getSingleItemDescription(abilityInfo)}
        {abilityInfo.mode == "spells" && abilityInfo.title == "Cantrips"
          ? popupModalCantripListing(character)
          : null}
        {abilityInfo.mode == "spells" && abilityInfo.title == "Utility Spell"
          ? popupModalUtilitySpellListing(
              character,
              ownedSpellLevel,
              setPopupInfo
            )
          : null}
        {spellLevels.length > 0 && (
          <span className="single-selectables" id="spell-levels">
            {spellLevels.map((itemKey) => {
              const spellLevel = Number(itemKey.substring(5));
              const hasLevel = ownedSpellLevel >= spellLevel;
              const btnVisible =
                !infoOnly && (hasLevel || spellLevel <= maxSpellLevel);

              // only show KNOWN spell-levels in infoOnly mode
              if (hasLevel || !infoOnly) {
                return (
                  <span
                    key={`${abilityInfo.title}-${itemKey}`}
                    className={`selectable ${hasLevel ? " owned" : ""} ${!btnVisible ? " unclickable" : ""}`}
                  >
                    {btnVisible && (
                      <button
                        onClick={() =>
                          alterSpells(
                            character,
                            abilityInfo.title,
                            spellLevel - SLPenalty,
                            ownedSpellLevel - SLPenalty,
                            false,
                            abilitiesBlock,
                            setAbilitiesBlock,
                            setPopupInfo
                          )
                        }
                        className={`alterBtn ${hasLevel ? "remove" : "add"} ${
                          abilityInfo.mode == "Utility" ? "utility" : ""
                        }`}
                        disabled={abilityInfo.mode == "Utility"}
                      >
                        <span className={`text${hasLevel ? " minus" : ""}`}>{`${
                          hasLevel ? "-" : "+"
                        }`}</span>
                      </button>
                    )}
                    <strong>{itemKey}</strong> -{" "}
                    {abilityInfo.singleItem[itemKey]}
                  </span>
                );
              } else {
                return "";
              }
            })}
          </span>
        )}
        {subOptions.length > 0 && (
          <span className="single-selectables" id="sub-options">
            {subOptions.map((bonusOption) => {
              const key = Object.keys(bonusOption)[0]; //'A' or 'B' or 'C' or name of cantrip
              const description = Object.values(bonusOption)[0]; //the actual description
              const hasBonus = character.bonusOptions.some(
                (option) => option[abilityInfo.title] === key
              );

              const currentCount = character.bonusOptions.filter(
                (option) => Object.keys(option)[0] == abilityInfo.title
              ).length;
              const maxCount = character.querySubOptions(abilityInfo)[0];

              const btnVisible = !infoOnly && (hasBonus || maxCount > currentCount);

              // only show CHOSEN bonus options in infoOnly mode
              if (hasBonus || !infoOnly) {
                return (
                  <span
                    key={`${abilityInfo.title}-${key}`}
                    className={`selectable${hasBonus ? " owned" : ""}${!btnVisible ? " unclickable" : ""}`}
                  >
                    {btnVisible && (
                      <button
                        onClick={() =>
                          alterBonusOptions(
                            abilityInfo.title,
                            key,
                            !hasBonus, // add or remove
                            subOptionChoices,
                            abilitiesBlock,
                            setAbilitiesBlock
                          )
                        }
                        className={`alterBtn ${hasBonus ? "remove" : "add"}`}
                      >
                        <span className={`text${hasBonus ? " minus" : ""}`}>{`${
                          hasBonus ? "-" : "+"
                        }`}</span>
                      </button>
                    )}
                    <strong>{key}: </strong>
                    {description}
                  </span>
                );
              } else {
                return "";
              }
            })}
          </span>
        )}
        {feats.length > 0 && (
          <span className="single-selectables" id="feats">
            {feats.map((tier) => {
              const hasFeat = character.queryFeatIsOwned(
                abilityInfo.title,
                tier
              );
              const levelRestricted = (character.level < 8 && tier == "Epic") || (character.level < 5 && tier == "Champion");
              const btnVisible = !infoOnly && (hasFeat || !levelRestricted);

              // only show KNOWN feats in infoOnly mode
              if (hasFeat || !infoOnly) {
                return (
                  <span
                    key={`${abilityInfo.title}-${tier}`}
                    className={`selectable${hasFeat ? " owned" : ""}${!btnVisible ? " unclickable" : ""}`}
                  >
                    {btnVisible && (
                      <button
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
                      </button>
                    )}
                    <strong>{tier}</strong> - {abilityInfo.singleItem[tier]}
                  </span>
                );
              } else {
                return "";
              }
            })}
          </span>
        )}
      </div>
    )
  );
}

export default AbilityCard;
