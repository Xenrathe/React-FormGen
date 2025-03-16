import BasicsBlock from "./BasicsBlock.jsx";
import StatBlock from "./StatBlock.jsx";
import "./CharSheet.css";
import { useState, useEffect } from "react";
import { Character } from "../Character.js";
import NarrativeBlock from "./NarrativeBlock.jsx";
import AbilitiesBlock from "./AbilitiesBlock.jsx";
import Navbar from "./Navbar.jsx";
import AbilitySheets from "./AbilitySheets.jsx";

function CharSheet() {
  // INDIVIDUAL COMPONENT DATA SETS //
  const [basicsBlock, setBasicsBlock] = useState({
    name: "",
    level: 1,
    race: "Dark Elf",
    oldRace: "Dark Elf",
    raceBonus: "dex",
    job: "Barbarian",
    oldJob: "Barbarian",
    jobBonus: "con",
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

  // CHARACTER SAVING / LOADING //
  function saveCharacterToFile() {
    const characterData = JSON.stringify({
      basicsBlock,
      statBlock,
      narrativeBlock,
      abilitiesBlock,
    });
    const blob = new Blob([characterData], { type: "application/json" });
    const fileName = basicsBlock.name.trim()
      ? `${basicsBlock.name}-L${basicsBlock.level}`
      : "AHeroHasNoName";
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `${fileName}.13a`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  function loadCharacterFromFile() {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = ".13a";

    input.onchange = (event) => {
      const file = event.target.files[0];
      if (!file) return;

      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const parsedData = JSON.parse(e.target.result);
          setBasicsBlock(parsedData.basicsBlock);
          setStatBlock(parsedData.statBlock);
          setNarrativeBlock(parsedData.narrativeBlock);
          setAbilitiesBlock(parsedData.abilitiesBlock);
          alert("Character loaded!");
        } catch (error) {
          alert(
            "Failed to load character: Please load a valid .13a character file."
          );
        }
      };
      reader.readAsText(file);
    };

    input.click();
  }

  // END CHARACTER SAVE / LOAD //

  // ACTUAL DOM STUFF
  return (
    <>
      <Navbar
        onSave={() => saveCharacterToFile()}
        onLoad={() => loadCharacterFromFile()}
        onPrint={() => window.print()}
      />
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
      <AbilitySheets
        abilitiesBlock={abilitiesBlock}
        basicsBlock={basicsBlock}
        character={character}
      />
    </>
  );
}

export default CharSheet;
