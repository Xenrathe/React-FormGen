function StatBlock({ character }) {
  return (
    <div id="statblock">
      <h2>Stats</h2>
      <div id="abilityscores">
        <div id="titles" className="abrow">
          <strong>Abilities</strong>
          <span>STR</span>
          <span>CON</span>
          <span>DEX</span>
          <span>INT</span>
          <span>WIS</span>
          <span>CHA</span>
        </div>
        <div id="scores" className="abrow">
          <strong>Score</strong>
          <span>{character.abilityScores[0]}</span>
          <span>{character.abilityScores[1]}</span>
          <span>{character.abilityScores[2]}</span>
          <span>{character.abilityScores[3]}</span>
          <span>{character.abilityScores[4]}</span>
          <span>{character.abilityScores[5]}</span>
        </div>
        <div id="modifiers" className="abrow">
          <strong>Modifier</strong>
          <span>{character.abilityModifiers[0]}</span>
          <span>{character.abilityModifiers[1]}</span>
          <span>{character.abilityModifiers[2]}</span>
          <span>{character.abilityModifiers[3]}</span>
          <span>{character.abilityModifiers[4]}</span>
          <span>{character.abilityModifiers[5]}</span>
        </div>
      </div>
      <p>Max HP: {character.maxHP}</p>
      <p>AC: {character.AC}</p>
      <p>PD: {character.PD}</p>
      <p>MD: {character.MD}</p>
      <p>Recovery Dice: {character.recoveryDice}</p>
    </div>
  );
}

export default StatBlock;