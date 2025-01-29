function NarrativeBlock({ character, narrativeBlock, setNarrativeBlock }) {
  function handleIconRelations(event, index) {
    let newRelations = [...narrativeBlock.iconRelationships];
    newRelations[index] = event.target.value;
    setNarrativeBlock({ ...narrativeBlock, iconRelationships: newRelations });
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
      <div id="icon-relationships" className="narrative-input">
        <label className="subtitle-label">Icon Relationships</label>
        <input
          type="text"
          id="icon-input-1"
          value={narrativeBlock.iconRelationships[0]}
          onChange={(event) => handleIconRelations(event, 0)}
        />
        <input
          type="text"
          id="icon-input-2"
          value={narrativeBlock.iconRelationships[1]}
          onChange={(event) => handleIconRelations(event, 1)}
        />
        <input
          type="text"
          id="icon-input-3"
          value={narrativeBlock.iconRelationships[2]}
          onChange={(event) => handleIconRelations(event, 2)}
        />
        <input
          type="text"
          id="icon-input-4"
          value={narrativeBlock.iconRelationships[3]}
          onChange={(event) => handleIconRelations(event, 3)}
        />
      </div>
    </div>
  );
}

export default NarrativeBlock;
