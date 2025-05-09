import "./CSS/NarrativeBlock.css";

function getBackgroundPointsRemaining(backgrounds, character) {
  const maxBGs = character.queryBackgroundMax();

  let sum = 0;
  Object.values(backgrounds).forEach((value) => {
    sum += value;
  });

  return maxBGs[0] - sum;
}

export function handleBackgrounds(
  character,
  narrativeBlock,
  setNarrativeBlock
) {
  let [, maxDefault, maxExceptions] = character.queryBackgroundMax();
  // this sort is necessary in the situation in which, say, [7, 6] are in maxexceptions
  // if the user inputs a '6' value, we want to remove the '6' not the '7'
  maxExceptions = maxExceptions.sort((a, b) => a.num - b.num);
  const newBackgrounds = {};

  // go through ALL backgrounds
  // because of the nature of 'maxExceptions', every background input needs to be aware of the others
  for (let i = 1; i <= 8; i++) {
    const key = document.getElementById(`background-input-${i}`)?.value;
    let value =
      parseInt(
        document.getElementById(`background-input-num-${i}`)?.value,
        10
      ) || 0;

    if (value < 0) {
      value = 1;
    } else if (value > maxDefault) {
      const exceptionIndex = maxExceptions.findIndex((num) => num >= value);
      if (exceptionIndex != -1) {
        maxExceptions.splice(exceptionIndex, 1);
      } else if (maxExceptions.length > 0) {
        value = maxExceptions[maxExceptions.length - 1];
        maxExceptions.pop();
      } else {
        value = maxDefault;
      }
    }

    if (key) {
      newBackgrounds[key] = value;
    }
  }

  //Special additions for various job talents
  if (character.jobTalents.includes("Tracker")) {
    newBackgrounds["Tracker"] = 5;
  }
  if (character.jobTalents.includes("Thievery")) {
    newBackgrounds["Thief"] = 5;
  }

  //necessary to avoid an infinite loop
  if (
    JSON.stringify(newBackgrounds) !==
    JSON.stringify(narrativeBlock.backgrounds)
  ) {
    setNarrativeBlock({ ...narrativeBlock, backgrounds: newBackgrounds });
  }
}

function NarrativeBlock({ character, narrativeBlock, setNarrativeBlock, setPopupInfo }) {
  const handleIconRelations = () => {
    const newRelations = {};

    for (let i = 1; i <= 4; i++) {
      const key = document.getElementById(`icon-input-${i}`)?.value;
      let value =
        parseInt(document.getElementById(`icon-input-num-${i}`)?.value, 10) ||
        0;

      const maxPerIcon = character.queryIconRelationshipsMax()[1];

      if (value < 0) {
        value = 1;
      } else if (value > maxPerIcon) {
        value = maxPerIcon;
      }

      if (key) {
        newRelations[key] = value;
      }
    }

    setNarrativeBlock({ ...narrativeBlock, iconRelationships: newRelations });

    const iconRelationshipsDiv = document.getElementById("icon-relationships");
    if (getRelationshipPointsRemaining(newRelations) < 0) {
      iconRelationshipsDiv.classList.add("input-error");
    } else {
      iconRelationshipsDiv.classList.remove("input-error");
    }
  };

  function getRelationshipPointsRemaining(iconRelationships) {
    const totalPoints = character.queryIconRelationshipsMax()[0];

    let sum = 0;
    Object.values(iconRelationships).forEach((value) => {
      sum += Math.abs(value);
    });

    return totalPoints - sum;
  }

  const handleItems = () => {
    const newItems = [];

    for (let i = 1; i <= 8; i++) {
      const item = document.getElementById(`item-input-${i}`)?.value;
      newItems.push(item);
    }

    setNarrativeBlock({ ...narrativeBlock, items: newItems });
  };

  function generateLinedInput(
    numLines,
    idBase,
    placeholder,
    dataObject,
    onChangeFn,
    includeNumber
  ) {
    const lines = [];

    for (let i = 1; i <= numLines; i++) {
      lines.push(
        <div key={`k-${idBase}-${i}`} className="single-line">
          <input
            type="text"
            id={`${idBase}-` + i}
            className="lined-input"
            placeholder={i == 1 ? placeholder : ""}
            value={
              includeNumber
                ? Object.keys(dataObject)[i - 1] || ""
                : dataObject[i - 1] ?? ""
            }
            onChange={onChangeFn}
          />
          {includeNumber && (
            <input
              type="number"
              id={`${idBase}-num-` + i}
              className="lined-input"
              value={Object.values(dataObject)[i - 1] || ""}
              onChange={onChangeFn}
            />
          )}
        </div>
      );
    }

    return lines;
  }

  const relationshipPointsRemaining = getRelationshipPointsRemaining(
    narrativeBlock.iconRelationships
  );
  const relationError = relationshipPointsRemaining != 0;

  const backgroundPointsRemaining = getBackgroundPointsRemaining(
    narrativeBlock.backgrounds,
    character
  );
  const BGError = backgroundPointsRemaining != 0;

  const TooltipObjs = {
    icons: {
      width: "widest",
      description: (
        <table>
          <thead>
            <tr>
              <th>Icon</th>
              <th>Positive Relationship</th>
              <th>Conflicted Relationship</th>
              <th>Negative Relationship</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td><strong>Heroic Icon</strong></td>
              <td>
                Spend 1, 2, or 3 points. As far as this icon is concerned, you’re one of the good guys, a white-hat hero. Authorities often help you, and civilians often trust you. On the downside, you may be called on to serve representatives of the icon even when you have other plans. You might also be a target of villainous icons or this heroic icon’s rivals.
              </td>
              <td>
                Spend 1, 2, or 3 points. You’re probably one of the good guys, but for some reason you’re suspect to the icon. Maybe you’re a convict who has served his time, or an imperial soldier who was too good and got drummed out of his legion. You have insider knowledge and allies who are in good with the icon but you also have enemies associated with the icon.
              </td>
              <td>
                Spend 1 point. In the icon’s eyes, you’re a dissident, opponent, rival, or foe. You may have contacts or inside knowledge that you can use to your advantage, but some form of trouble waits for you wherever this heroic icon has influence.
              </td>
            </tr>
            <tr>
              <td><strong>Ambiguous Icon</strong></td>
              <td>
                Spend 1, 2, or 3 points. Thanks to your relationship with the icon, you are a hero to some, a villain to others, and possibly even a monster to a few. The enemies of your friends may turn out to be your friends, and vice versa. Advantages and complications will come from all sides.
              </td>
              <td>
                Spend 1, 2, or 3 points. Your relationship with the icon is complex, an uneven relationship with an icon who’s a hero to some and a villain to others. One way or another, you can find help or hostility anywhere. You don’t just live in interesting times—you create them.
              </td>
              <td>
                Spend 1 or 2 points. Your enmity with this icon makes you some enemies, but it also makes you some useful friends. You may be a dissenter, unwanted family member, or even a traitor in some way.
              </td>
            </tr>
            <tr>
              <td><strong>Villainous Icon</strong></td>
              <td>
                Spend 1 point. You are able to gain secrets or secretive allies, but your connection to this icon brings trouble from people associated with the heroic icons who oppose the villain. Be prepared to justify why you’re not imprisoned, interrogated, or otherwise harassed by the heroic icons and their representatives whenever they encounter you. Or for that matter, by the other PCs.
              </td>
              <td>
                Spend 1 or 2 points. You mostly work against the icon but you’re also connected to the icon in a way you can’t deny. Your connection sometimes gives you special knowledge or contacts, but it also makes you suspect in the eyes of many right-minded would-be heroes.
              </td>
              <td>
                Spend 1 or 2 points. You are a special foe of this icon, perhaps because of your virtue or possibly for less happy motives. Your enmity wins you allies among right-thinking people, but some of the villainous icon’s forces are out to get you in some way.
              </td>
            </tr>
          </tbody>
        </table>
      ),
    },
    bgs: {
      width: "wide",
      description: (
        <div>
          <div>
            Backgrounds represent pieces of your character's history that contributes to your character's history as well as their ability to succeed with non-combat skills. These are broad categories of experience (cat burglar, for example) rather than specific implementations of that experience (climbing and hiding).
          </div>
          <br />
          <strong className="sub-title">Choosing Your Backgrounds</strong>
          <div>
            Choose backgrounds that help you make sense of your characters past, jobs, and settings. Background and skill use is meant to be about fun in-character methods of attempting to advance the plot.
          </div>
          <br />
          <div>
            A few possible backgrounds include: acrobat, alchemist, animal trainer, architect, aristocratic noble, assassin, chef, con-woman, goblin exterminator, hunted outlaw, knight errant, magecraft, priest, refugee, scout, shepherd, soldier, spy, temple acolyte, thief, torturer, transformed animal, traveling martial arts pupil, tribal healer, tunnel scout, wandering minstrel, warrior poet, and so on.
          </div>
          <br />
          <strong className="sub-title">Assigning Points</strong>
          <div>
            Each character gets 8 points, plus any extra from talents or feats. Assign your background points to as many backgrounds as you want, up to your total points. A single background can have a max of 5 points, unless a feat allows otherwise.
          </div>
          <br />
          <strong className="sub-title">Making Skill Checks</strong>
          <div>
            To make a skill check, use this formula, with prompt / details from your GM:
          </div>
          <br />
          <div>
            D20 + relevant ability modifier (from GM) + level + relevant background points <strong>vs</strong> DC set by the environment/GM.
          </div>
          <br />
          <div>
            You can’t apply multiple backgrounds to the same check; the background with the highest (or tied for highest) bonus applies.
          </div>
        </div>
      ),
    },
  };

  return (
    <div id="narrativeblock" className="input-group">
      <div className="title-label">Narrative & Items</div>
      <div id="one-unique-thing" className="narrative-input">
        <label className="subtitle-label">One Unique Thing</label>
        <textarea
          id="unique-input"
          maxLength="185"
          value={narrativeBlock.oneUniqueThing}
          onChange={(e) => {
            setNarrativeBlock({
              ...narrativeBlock,
              oneUniqueThing: e.target.value,
            });
          }}
        />
      </div>
      <div
        id="icon-relationships"
        className={`narrative-input lined-inputs${
          relationError ? " input-error" : ""
        }`}
      >
        <label className="title"
        onClick={() =>
          setPopupInfo({
            title: "Icons",
            singleItem: TooltipObjs.icons,
            list: null,
            mode: "tooltip",
          })
        }>
          <span className="tooltip">Icon Relations {relationError ? ` (${relationshipPointsRemaining} pts)` : null}{" "}</span>
        </label>
        {generateLinedInput(
          4,
          "icon-input",
          "Archmage...",
          narrativeBlock.iconRelationships,
          handleIconRelations,
          true
        )}
      </div>
      <div
        id="backgrounds"
        className={`narrative-input lined-inputs${
          BGError ? " input-error" : ""
        }`}
      >
        <label className="title"
        onClick={() =>
          setPopupInfo({
            title: "Backgrounds",
            singleItem: TooltipObjs.bgs,
            list: null,
            mode: "tooltip",
          })
        }>
          <span className="tooltip">Backgrounds {BGError ? ` (${backgroundPointsRemaining} pts)` : null}{" "}</span>
        </label>
        {generateLinedInput(
          8,
          "background-input",
          "Street urchin...",
          narrativeBlock.backgrounds,
          () => handleBackgrounds(character, narrativeBlock, setNarrativeBlock),
          true
        )}
      </div>
      <div id="items" className="narrative-input lined-inputs">
        <label className="title">Items & Currency</label>
        <div className="single-line">
          <label className="title gold" htmlFor="gold">{` Gold`}</label>
          <input
            type="number"
            id="gold"
            name="gold"
            step="1"
            min="0"
            value={narrativeBlock.gold}
            onChange={(e) => {
              setNarrativeBlock({
                ...narrativeBlock,
                gold: Math.round(e.target.value),
              });
            }}
          />
        </div>
        {generateLinedInput(
          8,
          "item-input",
          "",
          narrativeBlock.items,
          handleItems,
          false
        )}
      </div>
    </div>
  );
}

export default NarrativeBlock;
