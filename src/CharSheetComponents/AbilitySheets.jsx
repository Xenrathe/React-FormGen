import jobs from "../data/jobs";
import { getDataSets } from "./AbilitiesBlock.jsx";
import AbilityCard from "./AbilityCard.jsx";
import Packery from "packery";
import { useEffect, useRef } from "react";

function AbilitySheets({ abilitiesBlock, basicsBlock, character }) {
  const bonusAbTitle = "bonusAbilitySet" in jobs[character.job] ? jobs[character.job].bonusAbilitySet.Name : "bonusAbs";
  const utilityList = character.getUtilitySpells();
  const utilitySpellLevel = abilitiesBlock.spells.find((spell) => Object.keys(spell)[0] == "Utility Spell")?.["Utility Spell"].substring(6) ?? 0;

  const sheetInfo = {
    "Class Features, Racial, and Gen. Feats": {
      data: getDataSets("general", character)[0],
      mode: "general",
    },
    Talents: {
      data: getDataSets("talents", character)[0],
      mode: "talents",
    },
    ["Familiar Skills"]: {
      data: abilitiesBlock.talents.find((talent) => talent.endsWith("Familiar")) ? getDataSets("Familiar", character)[0] : [],
      mode: "Familiar",
    },
    ["Animal Companion Feats"]: {
      data: abilitiesBlock.talents.find((talent) => talent.startsWith("AC")) ? getDataSets("Animal Companion", character)[0] : [],
      mode: "Animal Companion",
    },
    Spells: {
      data: "spellList" in jobs[character.job] ? getDataSets("spells", character)[0] : [],
      mode: "spells",
    },
    [`Utility Spells (L${utilitySpellLevel} Slot)`]: {
      data: utilityList.filter((utilSpell) => utilitySpellLevel >= Number(Object.values(utilSpell)[0].Level)),
      mode: "Utility",
    },
    [bonusAbTitle]: {
      data: "bonusAbilitySet" in jobs[character.job] ? getDataSets("bonusAbs", character)[0] : [],
      mode: "bonusAbs",
    },
  };

  const packeryRefs = useRef([]);

  useEffect(() => {
    const cardsContainers = document.querySelectorAll(".cards");
  
    cardsContainers.forEach((container) => {
      if (container) {
        const packeryInstance = new Packery(container, {
          itemSelector: ".ability-card",
          gutter: 10,
          percentPosition: true,
        });
  
        setTimeout(() => {
          packeryInstance.reloadItems();
          packeryInstance.layout();
        }, 50);
      }
    });
  }, [abilitiesBlock, basicsBlock.race, basicsBlock.job]); // Re-run when abilities change

  return (
    <div id="ability-sheets">
      {Object.entries(sheetInfo).map(([title, values], index) => {
        if (values.data.length > 0) {
          return (
            <div id={values.mode} className="sheet-category" key={`absheet-${values.mode}`}>
              <div className="sheet-title">{title}</div>
              <div
                className="cards"
                ref={(el) => (packeryRefs.current[index] = el)}
              >
                <div className="grid-sizer"></div>{" "}
                {values.data.map((ability) => {
                  const abilityInfo = {
                    title: Object.keys(ability)[0],
                    singleItem: Object.values(ability)[0],
                    mode: values.mode,
                  };
                  return (
                    <AbilityCard
                      key={`ABCard: ${abilityInfo.title}`}
                      abilityInfo={abilityInfo}
                      setPopupInfo={null}
                      character={character}
                      abilitiesBlock={abilitiesBlock}
                      setAbilitiesBlock={null}
                      alterFeats={null}
                      alterSpells={null}
                    />
                  );
                })}
              </div>
            </div>
          );
        } else {
          //for packery to correctly initialize, we still need this empty div, we'll just keep it hidden
          return (
          <div id={values.mode} className="sheet-category invisible" key={`absheet-${values.mode}`}>
            <div className="sheet-title">{title}</div>
            <div
              className="cards invisible"
              ref={(el) => (packeryRefs.current[index] = el)}
            >;
            </div>
          </div>
          )
        }
      })}
    </div>
  );
}

export default AbilitySheets;
