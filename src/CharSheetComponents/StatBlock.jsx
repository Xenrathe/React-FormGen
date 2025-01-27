function StatBlock({ character, statBlock, setStatBlock }) {
  const handleAbilityScoreChange = (event) => {
    let rawValue = event.target.value;
    rawValue = rawValue.replace(/^0+/, ""); //remove leading zeroes
    rawValue = rawValue === "" ? "0" : rawValue; //default to 0 if nothing there
    const sanitizedValue = Math.max(0, Math.min(Number(rawValue), 99)); //clamp
    event.target.value = sanitizedValue; //update input text

    setStatBlock({ ...statBlock, [event.target.id]: sanitizedValue });
  };

  return (
    <div id="statblock" className="input-group">
      <div className="title-label">Stats</div>
      <div id="abilityscores">
        <div className="titles abrow">
          <strong>Abilities</strong>
          <label htmlFor="str">STR</label>
          <label htmlFor="con">CON</label>
          <label htmlFor="dex">DEX</label>
          <label htmlFor="int">INT</label>
          <label htmlFor="wis">WIS</label>
          <label htmlFor="cha">CHA</label>
        </div>
        <div id="scores-base" className="abrow">
          <strong>Base</strong>
          <input
            type="number"
            min="1"
            max="99"
            id="str"
            value={statBlock.str}
            onChange={handleAbilityScoreChange}
          />
          <input
            type="number"
            min="1"
            max="99"
            id="con"
            value={statBlock.con}
            onChange={handleAbilityScoreChange}
          />
          <input
            type="number"
            min="1"
            max="99"
            id="dex"
            value={statBlock.dex}
            onChange={handleAbilityScoreChange}
          />
          <input
            type="number"
            min="1"
            max="99"
            id="int"
            value={statBlock.int}
            onChange={handleAbilityScoreChange}
          />
          <input
            type="number"
            min="1"
            max="99"
            id="wis"
            value={statBlock.wis}
            onChange={handleAbilityScoreChange}
          />
          <input
            type="number"
            min="1"
            max="99"
            id="cha"
            value={statBlock.cha}
            onChange={handleAbilityScoreChange}
          />
        </div>
        <div id="scores-adj" className="abrow">
          <strong>Adjusted</strong>
          <span>{character.abilityScores.str}</span>
          <span>{character.abilityScores.con}</span>
          <span>{character.abilityScores.dex}</span>
          <span>{character.abilityScores.int}</span>
          <span>{character.abilityScores.wis}</span>
          <span>{character.abilityScores.cha}</span>
        </div>
        <div id="modifiers" className="abrow">
          <strong>Modifier</strong>
          <span>{character.abilityModifiers.str}</span>
          <span>{character.abilityModifiers.con}</span>
          <span>{character.abilityModifiers.dex}</span>
          <span>{character.abilityModifiers.int}</span>
          <span>{character.abilityModifiers.wis}</span>
          <span>{character.abilityModifiers.cha}</span>
        </div>
      </div>
      <div id="defenses">
        <strong>Defenses</strong>
        <div id="AC">
          <label htmlFor="AC">AC</label>
          <span>{character.AC}</span>
        </div>
        <div id="PD">
          <label htmlFor="PD">PD</label>
          <span>{character.PD}</span>
        </div>
        <div id="MD">
          <label htmlFor="MD">MD</label>
          <span>{character.MD}</span>
        </div>
      </div>
      <div id="attacks">
        <div className="titles atkrow">
          <strong>ATK</strong>
          <label htmlFor="atk-melee">Melee</label>
          <label htmlFor="atk-ranged">Ranged</label>
        </div>
        <div id="atk-roll" className="atkrow">
          <strong>Roll</strong>
          <span>{character.meleeAtk[0]}</span>
        </div>
        <div id="atk-dmg" className="atkrow">
          <strong>dmg</strong>
          <span>{character.meleeAtk[1]}</span>
        </div>
        <div id="atk-miss" className="atkrow">
          <strong>miss</strong>
          <span>{character.meleeAtk[2]}</span>
        </div>
      </div>
      <p>Max HP: {character.maxHP}</p>

      <p>
        Recovery Dice: {character.recoveries[0]} uses -{" "}
        {character.recoveries[1]}
      </p>
    </div>
  );
}

export default StatBlock;
