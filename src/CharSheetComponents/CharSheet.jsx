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
    oldRace: "Dark Elf",
    raceBonus: "Dex",
    job: "Barbarian",
    oldJob: "Barbarian",
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
    items: [],
  });

  const [abilitiesBlock, setAbilitiesBlock] = useState({
    talents: [],
    spells: [],
    bonusAbs: [],
    feats: [],
    familiarAbs: [],
  });
  // END INDIVIDUAL COMPONENT DATA SETS //

  // SYNTHESIS INTO CHARACTER OBJECT //
  const [character, setCharacter] = useState(
    new Character(
      statBlock,
      basicsBlock.name,
      basicsBlock.level,
      basicsBlock.race,
      basicsBlock.oldRace,
      basicsBlock.raceBonus,
      basicsBlock.job,
      basicsBlock.oldJob,
      basicsBlock.jobBonus,
      abilitiesBlock.talents,
      abilitiesBlock.spells,
      abilitiesBlock.bonusAbs, //e.g. Bard's battle cries
      abilitiesBlock.feats,
      abilitiesBlock.familiarAbs,
      basicsBlock.armor,
      basicsBlock.shield,
      { melee: basicsBlock.melee, ranged: basicsBlock.ranged },
      narrativeBlock.oneUniqueThing,
      narrativeBlock.iconRelationships,
      narrativeBlock.backgrounds,
      narrativeBlock.items
    )
  );

  useEffect(() => {
    const updatedCharacter = new Character(
      statBlock,
      basicsBlock.name,
      basicsBlock.level,
      basicsBlock.race,
      basicsBlock.oldRace,
      basicsBlock.raceBonus,
      basicsBlock.job,
      basicsBlock.oldJob,
      basicsBlock.jobBonus,
      abilitiesBlock.talents,
      abilitiesBlock.spells,
      abilitiesBlock.bonusAbs, // e.g. Bard's battle cries
      abilitiesBlock.feats,
      abilitiesBlock.familiarAbs,
      basicsBlock.armor,
      basicsBlock.shield,
      { melee: basicsBlock.melee, ranged: basicsBlock.ranged },
      narrativeBlock.oneUniqueThing,
      narrativeBlock.iconRelationships,
      narrativeBlock.backgrounds,
      narrativeBlock.items
    );

    // Update oldJob and oldRace only if they have changed
    setBasicsBlock((prev) => {
      if (prev.oldJob !== prev.job || prev.oldRace !== prev.race) {
        return { ...prev, oldJob: prev.job, oldRace: prev.race };
      }
      return prev;
    });

    // because the character constructor potentially trims old racial or job abilities
    // we may need to reupdate the abilities block
    const newAbilities = {
      talents: updatedCharacter.jobTalents,
      spells: updatedCharacter.jobSpells,
      bonusAbs: updatedCharacter.jobBonusAbs,
      feats: updatedCharacter.feats,
      familiarAbs: updatedCharacter.familiarAbs,
    };

    // without this, we may end up in an infinite loop
    if (JSON.stringify(newAbilities) !== JSON.stringify(abilitiesBlock)) {
      setAbilitiesBlock(newAbilities);
    }

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
