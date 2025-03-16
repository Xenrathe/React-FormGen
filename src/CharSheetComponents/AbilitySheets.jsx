import jobs from "../data/jobs";
import { getDataSets } from "./AbilitiesBlock.jsx";
import AbilityCard from "./AbilityCard.jsx";
import Packery from "packery";
import { useEffect, useRef } from "react";

function AbilitySheets({ abilitiesBlock, basicsBlock, character }) {
  const sheetInfo = {
    "Class Features, Racial, and Gen. Feats": {
      data: getDataSets("general", character)[0],
      mode: "general",
    },
    Talents: {
      data: getDataSets("talents", character)[0],
      mode: "talents",
    },
  };

  if ("spellList" in jobs[character.job]) {
    sheetInfo.Spells = {
      data: getDataSets("spells", character)[0],
      mode: "spells",
    };
  }

  if ("bonusAbilitySet" in jobs[character.job]) {
    sheetInfo[`${jobs[character.job].bonusAbilitySet.Name}`] = {
      data: getDataSets("bonusAbs", character)[0],
      mode: "bonusAbs",
    };
  }

  if (abilitiesBlock.talents.find((talent) => talent.endsWith("Familiar"))) {
    sheetInfo["Familiar Skills"] = {
      data: getDataSets("Familiar", character)[0],
      mode: "Familiar",
    };
  }

  if (abilitiesBlock.talents.find((talent) => talent.startsWith("AC"))) {
    sheetInfo["Animal Companion Feats"] = {
      data: getDataSets("Animal Companion", character)[0],
      mode: "Animal Companion",
    };
  }

  const packeryRefs = useRef([]);

  useEffect(() => {
    packeryRefs.current.forEach((ref) => {
      if (ref) {
        const packeryInstance = new Packery(ref, {
          itemSelector: ".ability-card",
          gutter: 10,
          percentPosition: true,
        });

        // Delay to allow React to complete updates
        setTimeout(() => {
          packeryInstance.reloadItems();
          packeryInstance.layout();
        }, 100);
      }
    });
  }, [abilitiesBlock, basicsBlock.race, basicsBlock.job]); // Re-run when abilities change

  return (
    <div id="ability-sheets">
      {Object.entries(sheetInfo).map(([title, values], index) => {
        if (values.data.length > 0) {
          return (
            <div id={title} className="sheet-category" key={`absheet-${title}`}>
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
          return null;
        }
      })}
    </div>
  );
}

export default AbilitySheets;
