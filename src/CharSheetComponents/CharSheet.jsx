import BasicsBlock from "./BasicsBlock.jsx";
import StatBlock from "./StatBlock.jsx";
import "./CharSheet.css";
import { useState, useEffect } from "react";
import { Character } from "../Character.js";
import NarrativeBlock from "./NarrativeBlock.jsx";
import AbilitiesBlock from "./AbilitiesBlock.jsx";

function CharSheet() {
  // INDIVIDUAL COMPONENT DATA SETS //
  const [basicsBlock, setBasicsBlock] = useState({
    name: "",
    level: 1,
    race: "Dark Elf",
    raceBonus: "Dex",
    job: "Barbarian",
    jobBonus: "Con",
    melee: "1H Small",
    ranged: "Thrown Small",
    armor: "Light",
    shield: "No Shield",
  });

  const [statBlock, setStatBlock] = useState({
    str: 8,
    con: 8,
    dex: 8,
    int: 8,
    wis: 8,
    cha: 8,
  });

  const [narrativeBlock, setNarrativeBlock] = useState({
    oneUniqueThing: "",
    iconRelationships: [],
    backgrounds: {},
  });

  const [abilitiesBlock, setAbilitiesBlock] = useState({
    talents: [],
    spells: [],
    bonusAbs: [],
    feats: {
      "general": [],
      "racial": [],
      "talent": [],
      "spell": [],
      "bonus": []  
    },
  });
  // END INDIVIDUAL COMPONENT DATA SETS //

  // SYNTHESIS INTO CHARACTER OBJECT //
  const [character, setCharacter] = useState(
    new Character(
      statBlock,
      basicsBlock.name,
      basicsBlock.level,
      basicsBlock.race,
      basicsBlock.raceBonus,
      basicsBlock.job,
      basicsBlock.jobBonus,
      abilitiesBlock.talents,
      abilitiesBlock.spells,
      abilitiesBlock.bonusAbs, //e.g. Bard's battle cries
      abilitiesBlock.feats,
      basicsBlock.armor,
      basicsBlock.shield,
      { melee: basicsBlock.melee, ranged: basicsBlock.ranged },
      narrativeBlock.oneUniqueThing,
      narrativeBlock.iconRelationships,
      narrativeBlock.backgrounds
    )
  );

  useEffect(() => {
    const updatedCharacter = new Character(
      statBlock,
      basicsBlock.name,
      basicsBlock.level,
      basicsBlock.race,
      basicsBlock.raceBonus,
      basicsBlock.job,
      basicsBlock.jobBonus,
      abilitiesBlock.talents,
      abilitiesBlock.spells,
      abilitiesBlock.bonusAbs, //e.g. Bard's battle cries
      abilitiesBlock.feats,
      basicsBlock.armor,
      basicsBlock.shield,
      { melee: basicsBlock.melee, ranged: basicsBlock.ranged },
      narrativeBlock.oneUniqueThing,
      narrativeBlock.iconRelationships,
      narrativeBlock.backgrounds
    );
    setCharacter(updatedCharacter);
  }, [basicsBlock, statBlock, narrativeBlock, abilitiesBlock]);
  // END SYNTHESIS INTO CHARACTER OBJECT //

  // ACTUAL DOM STUFF
  return (
    <div className="charsheet">
      <BasicsBlock basicsData={basicsBlock} setBasicsData={setBasicsBlock} />
      <StatBlock
        character={character}
        statBlock={statBlock}
        setStatBlock={setStatBlock}
      />
      <NarrativeBlock
        character={character}
        narrativeBlock={narrativeBlock}
        setNarrativeBlock={setNarrativeBlock}
      />
      <AbilitiesBlock
        character={character}
        abilitiesBlock={abilitiesBlock}
        setAbilitiesBlock={setAbilitiesBlock}
      />
    </div>
  );
}

export default CharSheet;
