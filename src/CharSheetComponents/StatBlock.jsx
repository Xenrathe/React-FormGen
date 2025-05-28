import "./CSS/StatBlock.css";

function StatBlock({ character, statBlock, setStatBlock, setPopupInfo }) {
  const handleAbilityScoreChange = (event) => {
    let newStats = { ...statBlock.stats };
    let rawValue = event.target.value;
    rawValue = rawValue.replace(/^0+/, ""); //remove leading zeroes
    rawValue = rawValue === "" ? "0" : rawValue; //default to 0 if nothing there
    const sanitizedValue = Math.max(0, Math.min(Number(rawValue), 99)); //clamp
    event.target.value = sanitizedValue; //update input text

    newStats[event.target.id] = sanitizedValue;
    setStatBlock({ ...statBlock, stats: newStats });
  };

  const TooltipObjs = {
    roll: {
      width: "",
      description: (
        <div>
          <div>
            Stat bonus (dex or str, based on class) + level + feat and talent
            bonuses + armor or shield penalties + magic item bonuses (not
            implemented).
          </div>
          <br />
          <div>
            When making a weapon attack, roll a d20 and add your atk modifier.
            If the total is equal to or higher than AC, you hit and roll Dmg.
            Otherwise you deal miss dmg, if any.
          </div>
        </div>
      ),
    },
    dmg: {
      width: "",
      description: (
        <div>
          <div>
            You get one weapon dice per level. Dice size comes from weapon type
            (and class and some talents).
          </div>
          <br />
          <div>
            Bonus is either dex or str mod. This ability bonus - including
            negative values - doubles at 5th level and triples at 8th level.
          </div>
        </div>
      ),
    },
    ac: {
      width: "",
      description: (
        <div>
          AC protects you from weapon attacks. It is equal to AC from
          armor/class + shield + middle value among Con, Dex, and Wis mods.
        </div>
      ),
    },
    pd: {
      width: "",
      description: (
        <div>
          PD protects you from other physical attacks. It is equal to base value
          (from class) + middle value among Str, Con, and Dex mods.
        </div>
      ),
    },
    md: {
      width: "",
      description: (
        <div>
          MD protects you against mental attacks. It is equal to base value
          (from class) + middle value among Int, Wis, and Cha mods.
        </div>
      ),
    },
    hp: {
      width: "",
      description: (
        <div>
          <div>
            Hit points are based on class, Con modifier, and level, e.g. a level
            1 barbarian has (7 + CON mod) x 3 max hp.
          </div>{" "}
          <br />
          <div>
            Level multipliers are: x3, x4, x5, x6, x8, x10, x12, x16, x20, x24.
          </div>
        </div>
      ),
    },
    recs: {
      width: "",
      description: (
        <div>
          <div>
            Recoveries represent your ability to heal or bounce back from
            damage. Many healing spells and potions require you to use up a
            recovery. So does rallying during a battle.
          </div>
          <br />
          <div>
            If you perform an action that requires a recovery but have none
            left, you get half the healing you would otherwise get and take a -1
            penalty to all defenses and attack rolls until your next full
            heal-up. This penalty stacks for each recovery used that you don't
            possess.
          </div>
          <br />
          <div>Recoveries are replenished during a full heal-up.</div>
        </div>
      ),
    },
    recroll: {
      width: "",
      description: (
        <div>
          <div>
            When you use a recovery, regain lost hit points by rolling recovery
            dice equal to your level and adding your Constitution modifier. Your
            class indicates which recovery die to use.
          </div>
          <br />
          <div>
            At 5th level, double the bonus you get from your Con modifier. At
            8th level, triple it.
          </div>
        </div>
      ),
    },
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
            value={statBlock.stats.str}
            onChange={handleAbilityScoreChange}
          />
          <input
            type="number"
            min="1"
            max="99"
            id="con"
            value={statBlock.stats.con}
            onChange={handleAbilityScoreChange}
          />
          <input
            type="number"
            min="1"
            max="99"
            id="dex"
            value={statBlock.stats.dex}
            onChange={handleAbilityScoreChange}
          />
          <input
            type="number"
            min="1"
            max="99"
            id="int"
            value={statBlock.stats.int}
            onChange={handleAbilityScoreChange}
          />
          <input
            type="number"
            min="1"
            max="99"
            id="wis"
            value={statBlock.stats.wis}
            onChange={handleAbilityScoreChange}
          />
          <input
            type="number"
            min="1"
            max="99"
            id="cha"
            value={statBlock.stats.cha}
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
      <div id="attacks">
        <div className="titles atkrow">
          <strong>ATK</strong>
          <strong>Melee</strong>
          <strong>Ranged</strong>
        </div>
        <div id="atk-roll" className="atkrow">
          <strong
            onClick={() =>
              setPopupInfo({
                title: "Roll Calculation",
                singleItem: TooltipObjs.roll,
                list: null,
                mode: "tooltip",
              })
            }
          >
            <span className="tooltip">Roll</span>
          </strong>
          <span>{character.meleeAtk[0]}</span>
          <span>{character.rangedAtk[0]}</span>
        </div>
        <div id="atk-dmg" className="atkrow">
          <strong
            onClick={() =>
              setPopupInfo({
                title: "DMG Calculation",
                singleItem: TooltipObjs.dmg,
                list: null,
                mode: "tooltip",
              })
            }
          >
            <span className="tooltip">Dmg</span>
          </strong>
          <span>{character.meleeAtk[1]}</span>
          <span>{character.rangedAtk[1]}</span>
        </div>
        <div id="atk-miss" className="atkrow">
          <strong>Miss</strong>
          <span>{character.meleeAtk[2]}</span>
          <span>{character.rangedAtk[2]}</span>
        </div>
      </div>
      <div id="defenses">
        <strong>Defenses</strong>
        <div id="AC">
          <strong
            htmlFor="AC"
            onClick={() =>
              setPopupInfo({
                title: "Armor Class",
                singleItem: TooltipObjs.ac,
                list: null,
                mode: "tooltip",
              })
            }
          >
            <span className="tooltip">AC</span>
          </strong>
          <span className="num">{character.AC}</span>
        </div>
        <div id="PD">
          <strong
            onClick={() =>
              setPopupInfo({
                title: "Physical Defense",
                singleItem: TooltipObjs.pd,
                list: null,
                mode: "tooltip",
              })
            }
          >
            <span className="tooltip">PD</span>
          </strong>
          <span className="num">{character.PD}</span>
        </div>
        <div id="MD">
          <strong
            onClick={() =>
              setPopupInfo({
                title: "Mental Defense",
                singleItem: TooltipObjs.md,
                list: null,
                mode: "tooltip",
              })
            }
          >
            <span className="tooltip">MD</span>
          </strong>
          <span className="num">{character.MD}</span>
        </div>
      </div>
      <div id="hitpoints">
        <div className="titles hprow">
          <strong></strong>
          <strong>Now</strong>
          <strong>Max</strong>
        </div>
        <div id="hp" className="hprow">
          <strong
            onClick={() =>
              setPopupInfo({
                title: "Hitpoints",
                singleItem: TooltipObjs.hp,
                list: null,
                mode: "tooltip",
              })
            }
          >
            <span className="tooltip">HP</span>
          </strong>
          <input
            type="number"
            min="-500"
            max="999"
            step={1}
            id="currHP"
            value={statBlock.currentHP >= -500 ? statBlock.currentHP : ""}
            onChange={(e) =>
              setStatBlock({
                ...statBlock,
                currentHP: e.target.value,
              })
            }
          />
          <span>{character.maxHP}</span>
        </div>
        <div id="recovery" className="hprow">
          <strong
            onClick={() =>
              setPopupInfo({
                title: "Recoveries",
                singleItem: TooltipObjs.recs,
                list: null,
                mode: "tooltip",
              })
            }
          >
            <span className="tooltip">Recs</span>
          </strong>
          <input
            type="number"
            min="-1"
            max="99"
            id="currRecs"
            value={statBlock.currentRecs >= 0 ? statBlock.currentRecs : ""}
            onChange={(e) =>
              setStatBlock({ ...statBlock, currentRecs: e.target.value })
            }
          />
          <span>{character.recoveries[0]}</span>
        </div>
        <div id="recovery-roll" className="hprow">
          <strong
            onClick={() =>
              setPopupInfo({
                title: "Recovery Roll",
                singleItem: TooltipObjs.recroll,
                list: null,
                mode: "tooltip",
              })
            }
          >
            <span className="tooltip">Roll</span>
          </strong>
          <span>{character.recoveries[1]}</span>
        </div>
      </div>
    </div>
  );
}

export default StatBlock;
