function getBackgroundPointsRemaining(backgrounds, character) {
  const maxBGs = character.queryBackgroundMax();

  let sum = 0;
  Object.values(backgrounds).forEach((value) => {
    sum += value;
  });

  return maxBGs[0] - sum;
}

function handleBackgrounds(character, narrativeBlock, setNarrativeBlock) {
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

    setNarrativeBlock({ ...narrativeBlock, backgrounds: newBackgrounds });

    const backgroundsDiv = document.getElementById("backgrounds");
    if (getBackgroundPointsRemaining(newBackgrounds, character) < 0) {
      backgroundsDiv.classList.add("input-error");
    } else {
      backgroundsDiv.classList.remove("input-error");
    }
}

function NarrativeBlock({ character, narrativeBlock, setNarrativeBlock }) {

  const handleIconRelations = () => {
    const newRelations = {};

    for (let i = 1; i <= 4; i++) {
      const key = document.getElementById(`icon-input-${i}`)?.value;
      let value =
        parseInt(document.getElementById(`icon-input-num-${i}`)?.value, 10) ||
        0;

      let maxPoints = 3;

      if (character.level >= 8) {
        maxPoints = 4;
      }

      if (value < 0) {
        value = 1;
      } else if (value > maxPoints) {
        value = maxPoints;
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
    let maxPoints = 3;

    if (character.level >= 8) {
      maxPoints = 5;
    } else if (character.level >= 5) {
      maxPoints = 4;
    }

    let sum = 0;
    Object.values(iconRelationships).forEach((value) => {
      sum += Math.abs(value);
    });

    return maxPoints - sum;
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
            value={includeNumber ? (Object.keys(dataObject)[i - 1] || "") : dataObject[i - 1] ?? ""}
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
      <div id="icon-relationships" className="narrative-input lined-inputs">
        <label className="title">
          Icon Relations (
          {getRelationshipPointsRemaining(narrativeBlock.iconRelationships)}{" "}
          pts)
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
      <div id="backgrounds" className="narrative-input lined-inputs">
        <label className="title">
          Backgrounds (
          {getBackgroundPointsRemaining(narrativeBlock.backgrounds, character)} pts)
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
        <label className="title">Items</label>
        {generateLinedInput(
          9,
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
