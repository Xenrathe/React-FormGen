function NarrativeBlock({ character, narrativeBlock, setNarrativeBlock }) {

  return (
    <div id="narrativeblock" className="input-group">
      <div className="title-label">Narrative</div>
      <div id="one-unique-thing" className="narrative-input">
        <label className="subtitle-label">One Unique Thing</label>
        <textarea
              id="unique-input"
              maxlength="185"
              value={narrativeBlock.oneUniqueThing}
              onChange={(e) => {
                setNarrativeBlock({ ...narrativeBlock, oneUniqueThing: e.target.value });
              }}
        />
      </div>
    </div>
  );
}

export default NarrativeBlock;