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
          <strong></strong>
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
          <strong>Adj.</strong>
          <span>{character.abilityScores.str}</span>
          <span>{character.abilityScores.con}</span>
          <span>{character.abilityScores.dex}</span>
          <span>{character.abilityScores.int}</span>
          <span>{character.abilityScores.wis}</span>
          <span>{character.abilityScores.cha}</span>
        </div>
        <div id="modifiers" className="abrow">
          <strong>Mods</strong>
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
          <strong>Melee</strong>
          <strong>Ranged</strong>
        </div>
        <div id="atk-roll" className="atkrow">
          <strong>Roll</strong>
          <span>{character.meleeAtk[0]}</span>
          <span>{character.rangedAtk[0]}</span>
        </div>
        <div id="atk-dmg" className="atkrow">
          <strong>Dmg</strong>
          <span>{character.meleeAtk[1]}</span>
          <span>{character.rangedAtk[1]}</span>
        </div>
        <div id="atk-miss" className="atkrow">
          <strong>Miss</strong>
          <span>{character.meleeAtk[2]}</span>
          <span>{character.rangedAtk[2]}</span>
        </div>
      </div>
      <div id="hitpoints">
        <div className="titles hprow">
          <strong></strong>
          <strong>Now</strong>
          <strong>Max</strong>
        </div>
        <div id="hp" className="hprow">
          <strong>HP</strong>
          <span></span>
          <span>{character.maxHP}</span>
        </div>
        <div id="recovery" className="hprow">
          <strong>Recs</strong>
          <span></span>
          <span>{character.recoveries[0]}</span>
        </div>
        <div id="recovery-roll" className="hprow">
          <strong>Roll</strong>
          <span>{character.recoveries[1]}</span>
        </div>
      </div>
    </div>
  );
}

export default StatBlock;
