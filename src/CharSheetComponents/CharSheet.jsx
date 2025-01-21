import Basics from "./Basics.jsx";
import StatBlock from "./StatBlock.jsx";
import "./CharSheet.css";
import { useState, useEffect } from "react";
import { Character } from "../Character.js";

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
  // END INDIVIDUAL COMPONENT DATA SETS //

  // SYNTHESIS INTO CHARACTER OBJECT //
  const [character, setCharacter] = useState(
    new Character(
      [statBlock.str, statBlock.con, statBlock.dex, statBlock.int, statBlock.wis, statBlock.cha], 
      basicsData.name,
      basicsData.level,
      basicsData.race,
      basicsData.raceBonus,
      basicsData.job,
      basicsData.jobBonus,
      [], // jobTalents
      [], // feats
      basicsData.armor === "Light",
      basicsData.shield === "Shield",
      basicsData.melee,
      "", // oneUniqueThing
      [], // iconRelationships
      [] // backgrounds
    )
  );

  useEffect(() => {
    const updatedCharacter = new Character(
      [statBlock.str, statBlock.con, statBlock.dex, statBlock.int, statBlock.wis, statBlock.cha], 
      basicsData.name,
      basicsData.level,
      basicsData.race,
      basicsData.raceBonus,
      basicsData.job,
      basicsData.jobBonus,
      [], // jobTalents
      [], // feats
      basicsData.armor === "Light",
      basicsData.shield,
      basicsData.melee,
      "", // oneUniqueThing
      [], // iconRelationships
      [] // backgrounds
    );
    setCharacter(updatedCharacter);
  }, [basicsData, statBlock]);
  // END SYNTHESIS INTO CHARACTER OBJECT //

  // ACTUAL DOM STUFF
  return (
    <div className="charsheet">
      <Basics basicsData={basicsData} setBasicsData={setBasicsData} />
      <StatBlock character={character} />
    </div>
  );
}

export default CharSheet;
