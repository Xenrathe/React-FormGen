function NarrativeBlock({ character, narrativeBlock, setNarrativeBlock }) {
  const handleIconRelations = () => {
    const newRelations = {};
  
    for (let i = 1; i <= 4; i++) {
      const key = document.getElementById(`icon-input-${i}`)?.value.trim();
      const value = parseInt(document.getElementById(`icon-input-num-${i}`)?.value, 10) || 0;
  
      if (key) {
        newRelations[key] = value;
      }
    }
  
    setNarrativeBlock({...narrativeBlock, 
      iconRelationships: newRelations,
    });

    const iconRelationshipsDiv = document.getElementById("icon-relationships");
    if (getRelationshipPointsRemaining(newRelations) < 0) {
      iconRelationshipsDiv.classList.add('input-error');
    } else {
      iconRelationshipsDiv.classList.remove('input-error');
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
    Object.values(iconRelationships).forEach ((value) => {
      sum += Math.abs(value);
    })

    return (maxPoints - sum);
  }

  function generateIconRelationshipLines(numLines){
    const lines = [];

    for (let i = 1; i <= numLines; i++) {
      lines.push(
      <div key={`icon-rel-${i}`} className="single-line">
        <input
          type="text"
          id={"icon-input-" + i}
          className="lined-input"
          value={Object.keys(narrativeBlock.iconRelationships)[i - 1] || ""}
          onChange={handleIconRelations}
        />
        <input
          type="number"
          id={"icon-input-num-" + i}
          className="lined-input"
          value={Object.values(narrativeBlock.iconRelationships)[i - 1] || ""}
          onChange={handleIconRelations}
        />
      </div>
      );
    };

    return lines;
  }

  return (
    <div id="narrativeblock" className="input-group">
      <div className="title-label">Narrative</div>
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
        <label className="title">Icon Relationships ({getRelationshipPointsRemaining(narrativeBlock.iconRelationships)} points)</label>
          {generateIconRelationshipLines(4)}
      </div>
    </div>
  );
}

export default NarrativeBlock;
