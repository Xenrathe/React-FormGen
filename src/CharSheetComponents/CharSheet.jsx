import BasicsBlock from "./BasicsBlock.jsx";
import StatBlock from "./StatBlock.jsx";
import "./CSS/CharSheet.css";
import "./CSS/PopupMod.css";
import "./CSS/AbilityCardAndSheet.css";
import { useState, useEffect } from "react";
import { Character } from "../Character.js";
import NarrativeBlock from "./NarrativeBlock.jsx";
import { handleBackgrounds } from "./NarrativeBlock.jsx";
import AbilitiesBlock from "./AbilitiesBlock.jsx";
import Navbar from "./Navbar.jsx";
import AbilitySheets from "./AbilitySheets.jsx";
import PopupModal from "./PopupModal.jsx";

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
    stats: {
      str: 8,
      con: 8,
      dex: 8,
      int: 8,
      wis: 8,
      cha: 8,
    },
    currentHP: -999, //to make field show as blank
    currentRecs: -1, //to make field show as blank
  });

  const [narrativeBlock, setNarrativeBlock] = useState({
    oneUniqueThing: "",
    iconRelationships: [],
    backgrounds: [],
    items: [],
    gold: 0,
  });

  const [abilitiesBlock, setAbilitiesBlock] = useState({
    talents: [],
    spells: [],
    bonusAbs: [],
    feats: [],
    familiarAbs: [],
    bonusOptions: [],
  });
  // END INDIVIDUAL COMPONENT DATA SETS //

  // SYNTHESIS INTO CHARACTER OBJECT //
  const [character, setCharacter] = useState(
    new Character(
      statBlock.stats,
      statBlock.currentHP,
      statBlock.currentRecs,
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
      abilitiesBlock.bonusOptions, //e.g. choosing two options in Bard's mythkenner
      basicsBlock.armor,
      basicsBlock.shield,
      { melee: basicsBlock.melee, ranged: basicsBlock.ranged },
      narrativeBlock.oneUniqueThing,
      narrativeBlock.iconRelationships,
      narrativeBlock.backgrounds,
      narrativeBlock.items,
      narrativeBlock.gold
    )
  );

  useEffect(() => {
    const updatedCharacter = new Character(
      statBlock.stats,
      statBlock.currentHP,
      statBlock.currentRecs,
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
      abilitiesBlock.bonusOptions, //e.g. choosing two options in Bard's mythkenner
      basicsBlock.armor,
      basicsBlock.shield,
      { melee: basicsBlock.melee, ranged: basicsBlock.ranged },
      narrativeBlock.oneUniqueThing,
      narrativeBlock.iconRelationships,
      narrativeBlock.backgrounds,
      narrativeBlock.items,
      narrativeBlock.gold
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
      bonusOptions: updatedCharacter.bonusOptions,
    };

    // without this, we may end up in an infinite loop
    if (JSON.stringify(newAbilities) !== JSON.stringify(abilitiesBlock)) {
      setAbilitiesBlock(newAbilities);
    }

    setCharacter(updatedCharacter);
    handleBackgrounds(updatedCharacter, narrativeBlock, setNarrativeBlock);
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

  const [popupInfo, setPopupInfo] = useState({
    title: "",
    singleItem: null,
    list: null,
    mode: "",
  });

  // ACTUAL DOM STUFF
  return (
    <>
      <PopupModal
        popupInfo={popupInfo}
        setPopupInfo={setPopupInfo}
        character={character}
        abilitiesBlock={abilitiesBlock}
        setAbilitiesBlock={setAbilitiesBlock}
      />
      <Navbar
        onSave={() => saveCharacterToFile()}
        onLoad={() => loadCharacterFromFile()}
        onPrint={() => window.print()}
      />
      <div className="charsheet">
        <BasicsBlock
          basicsData={basicsBlock}
          setBasicsData={setBasicsBlock}
          setPopupInfo={setPopupInfo}
        />
        <StatBlock
          character={character}
          statBlock={statBlock}
          setStatBlock={setStatBlock}
          setPopupInfo={setPopupInfo}
        />
        <NarrativeBlock
          character={character}
          narrativeBlock={narrativeBlock}
          setNarrativeBlock={setNarrativeBlock}
          setPopupInfo={setPopupInfo}
        />
        <AbilitiesBlock
          character={character}
          abilitiesBlock={abilitiesBlock}
          setAbilitiesBlock={setAbilitiesBlock}
          setPopupInfo={setPopupInfo}
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
