import BasicsBlock from "./BasicsBlock.jsx";
import StatBlock from "./StatBlock.jsx";
import "./CharSheet.css";
import { useState, useEffect } from "react";
import { Character } from "../Character.js";
import NarrativeBlock from "./NarrativeBlock.jsx";

function CharSheet() {
  // INDIVIDUAL COMPONENT DATA SETS //
  const [basicsData, setBasicsData] = useState({
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
    iconRelationships: {},
    backgrounds: {}
  })
  // END INDIVIDUAL COMPONENT DATA SETS //

  // SYNTHESIS INTO CHARACTER OBJECT //
  const [character, setCharacter] = useState(
    new Character(
      statBlock,
      basicsData.name,
      basicsData.level,
      basicsData.race,
      basicsData.raceBonus,
      basicsData.job,
      basicsData.jobBonus,
      [], // jobTalents
      [], // feats
      basicsData.armor,
      basicsData.shield,
      { melee: basicsData.melee, ranged: basicsData.ranged },
      narrativeBlock.oneUniqueThing,
      narrativeBlock.iconRelationships,
      narrativeBlock.backgrounds
    )
  );

  useEffect(() => {
    const updatedCharacter = new Character(
      statBlock,
      basicsData.name,
      basicsData.level,
      basicsData.race,
      basicsData.raceBonus,
      basicsData.job,
      basicsData.jobBonus,
      [], // jobTalents
      [], // feats
      basicsData.armor,
      basicsData.shield,
      { melee: basicsData.melee, ranged: basicsData.ranged },
      narrativeBlock.oneUniqueThing,
      narrativeBlock.iconRelationships,
      narrativeBlock.backgrounds
    );
    setCharacter(updatedCharacter);
  }, [basicsData, statBlock, narrativeBlock]);
  // END SYNTHESIS INTO CHARACTER OBJECT //

  // ACTUAL DOM STUFF
  return (
    <div className="charsheet">
      <BasicsBlock basicsData={basicsData} setBasicsData={setBasicsData} />
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
    </div>
  );
}

export default CharSheet;
