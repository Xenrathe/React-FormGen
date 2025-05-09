import races from "../data/races";
import jobs from "../data/jobs";
import "./CSS/BasicsBlock.css";

function BasicsBlock({ basicsData, setBasicsData, setPopupInfo }) {
  //used for Race & Class/Job drop downs
  function PopulateDropDown(props) {
    return Object.keys(props.data).map((option) => (
      <option key={option} value={option}>
        {option}
      </option>
    ));
  }

  //used for race/class bonus abilities
  function PopulateBonusAbilities(props) {
    const collection = props.collectionKey in races ? races : jobs;

    return collection[props.collectionKey].abilityBonus.map((ability) => (
      <option key={ability} value={ability}>
        {ability}
      </option>
    ));
  }

  const TooltipObjs = {
    weapon: {
      width: "wide",
      description: (
        <div>
          <strong className="sub-title">Melee weapons:</strong>
          <ul>
            <li>
              <strong>Small, one-handed:</strong> club, dagger, knife
            </li>
            <li>
              <strong>Small, two-handed:</strong> big club, scythe
            </li>
            <li>
              <strong>Light, one-handed:</strong> hand axe, javelin, mace,
              shortsword, big knife
            </li>
            <li>
              <strong>Light, two-handed:</strong> spear
            </li>
            <li>
              <strong>Heavy, one-handed:</strong> bastard sword, battleaxe,
              flail, hammer, longsword, morningstar
            </li>
            <li>
              <strong>Heavy, two-handed:</strong> dire flail, greataxe,
              greatsword, halberd, polearms, heavy warhammer
            </li>
          </ul>
          <strong className="sub-title">Ranged weapons:</strong>
          <br />
          <div>
            Reloaded as part of the standard action in which they are used in an
            attack. Hand and light crossbows require a quick action to reload.
            Heavy crossbows require a move action to reload.
          </div>
          <br />

          <strong>Nearby Targets Only</strong>
          <ul>
            <li>Small, thrown: club, dagger, knife</li>
            <li>Small, crossbow: hand crossbow</li>
          </ul>

          <strong>Nearby Targets Okay; Far Away Targets –2 Atk</strong>
          <ul>
            <li>Light, thrown: axe, javelin, spear</li>
          </ul>

          <strong>Nearby and Far Away Targets Okay</strong>
          <ul>
            <li>Light, crossbow: light crossbow</li>
            <li>Light, bow: shortbow, sling</li>
            <li>Heavy, crossbow: heavy crossbow</li>
            <li>Heavy, bow: longbow</li>
          </ul>
        </div>
      ),
    },
    armor: {
      width: "",
      description: (
        <div>
          <div>Armor is classified as either light or heavy.</div>
          <br />
          <div>
            <strong>Light armor includes:</strong> Heavily padded vest, leather
            armor, studded leather, cured hide.
          </div>
          <br />
          <div>
            <strong>Heavy armor includes:</strong> Heavy chainmail, ring armor,
            scale mail, half-plate, plate armor, most dragonscale armor.
          </div>
          <br />
          <div>
            <strong>Shields</strong> increase AC by 1, can only be used with a
            single 1H weapon, and for some classes include ATK roll penalties.
          </div>
        </div>
      ),
    },
  };

  //removes shield if swapping to 2Her
  const handleMeleeChange = (event) => {
    if (
      event.target.value.startsWith("2H") ||
      event.target.value.startsWith("DW")
    ) {
      setBasicsData({
        ...basicsData,
        melee: event.target.value,
        shield: "No Shield",
      });
    } else {
      setBasicsData({ ...basicsData, melee: event.target.value });
    }
  };

  //used for both race & class bonus
  const handleBonusAbilityChange = (event) => {
    if (event.target.id == "raceBonus") {
      if (event.target.value != basicsData.jobBonus) {
        setBasicsData({ ...basicsData, raceBonus: event.target.value });
      }
    } else {
      if (event.target.value != basicsData.raceBonus) {
        setBasicsData({ ...basicsData, jobBonus: event.target.value });
      }
    }
  };

  //necessary because changing class/job can alter bonus abilities,
  //which won't otherwise be automatically updated
  const handleJobChange = (event) => {
    const newJob = jobs[event.target.value];
    if (!newJob.abilityBonus.includes(basicsData.jobBonus)) {
      if (newJob.abilityBonus[0] == basicsData.raceBonus) {
        setBasicsData({
          ...basicsData,
          jobBonus: newJob.abilityBonus[1],
          oldJob: basicsData.job,
          job: event.target.value,
        });
      } else {
        setBasicsData({
          ...basicsData,
          jobBonus: newJob.abilityBonus[0],
          oldJob: basicsData.job,
          job: event.target.value,
        });
      }
    } else {
      setBasicsData({
        ...basicsData,
        oldJob: basicsData.job,
        job: event.target.value,
      });
    }
  };

  //necessary because changing race can alter bonus abilities,
  //which won't otherwise be automatically updated
  const handleRaceChange = (event) => {
    const newRace = races[event.target.value];
    if (!newRace.abilityBonus.includes(basicsData.raceBonus)) {
      if (newRace.abilityBonus[0] == basicsData.jobBonus) {
        setBasicsData({
          ...basicsData,
          raceBonus: newRace.abilityBonus[1],
          oldRace: basicsData.race,
          race: event.target.value,
        });
      } else {
        setBasicsData({
          ...basicsData,
          raceBonus: newRace.abilityBonus[0],
          oldRace: basicsData.race,
          race: event.target.value,
        });
      }
    } else {
      setBasicsData({
        ...basicsData,
        oldRace: basicsData.race,
        race: event.target.value,
      });
    }
  };

  const handleLevelChange = (event) => {
    const newVal = Math.max(0, Math.min(event.target.value, 10)); //0-10
    setBasicsData({ ...basicsData, level: newVal });
  };

  return (
    <div id="basics" className="input-group">
      <div id="name-div" className="input-set">
        <label htmlFor="name">NAME</label>
        <input
          type="text"
          id="name"
          value={basicsData.name}
          onChange={(e) => {
            setBasicsData({ ...basicsData, name: e.target.value });
          }}
        />
      </div>
      <div id="level-div" className="input-set">
        <label htmlFor="level">LEVEL</label>
        <input
          type="number"
          id="level"
          min="1"
          max="10"
          value={basicsData.level}
          onChange={handleLevelChange}
        />
      </div>
      <div id="race-div" className="input-set">
        <label htmlFor="race">RACE</label>
        <select
          name="race"
          id="race"
          value={basicsData.race}
          onChange={handleRaceChange}
        >
          <PopulateDropDown data={races} />
        </select>
        <select
          name="raceBonus"
          id="raceBonus"
          className="small"
          value={basicsData.raceBonus}
          onChange={handleBonusAbilityChange}
        >
          <PopulateBonusAbilities collectionKey={basicsData.race} />
        </select>
      </div>
      <div id="job-div" className="input-set">
        <label htmlFor="job">CLASS</label>
        <select
          name="job"
          id="job"
          value={basicsData.job}
          onChange={handleJobChange}
        >
          <PopulateDropDown data={jobs} />
        </select>
        <select
          name="jobBonus"
          id="jobBonus"
          className="small"
          value={basicsData.jobBonus}
          onChange={handleBonusAbilityChange}
        >
          <PopulateBonusAbilities collectionKey={basicsData.job} />
        </select>
      </div>
      <div id="weapons-div" className="input-set">
        <label
          onClick={() =>
            setPopupInfo({
              title: "Weapons",
              singleItem: TooltipObjs.weapon,
              list: null,
              mode: "tooltip",
            })
          }
        >
          <span className="tooltip">WEAPON</span>
        </label>
        <select
          name="melee"
          id="melee"
          value={basicsData.melee}
          onChange={handleMeleeChange}
        >
          <option key="1H Small" value="1H Small">
            1H Small
          </option>
          <option key="1H Light" value="1H Light">
            1H Light
          </option>
          <option key="1H Heavy" value="1H Heavy">
            1H Heavy
          </option>
          <option key="DW Small" value="DW Small">
            DW Small
          </option>
          <option key="DW Light" value="DW Light">
            DW Light
          </option>
          <option key="DW Heavy" value="DW Heavy">
            DW Heavy
          </option>
          <option key="2H Small" value="2H Small">
            2H Small
          </option>
          <option key="2H Light" value="2H Light">
            2H Light
          </option>
          <option key="2H Heavy" value="2H Heavy">
            2H Heavy
          </option>
        </select>
        <select
          name="ranged"
          id="ranged"
          value={basicsData.ranged}
          onChange={(e) => {
            setBasicsData({ ...basicsData, ranged: e.target.value });
          }}
        >
          <option key="Thrown Small" value="Thrown Small">
            Thrown Small
          </option>
          <option key="Thrown Light" value="Thrown Light">
            Thrown Light
          </option>
          <option key="Crossbow Small" value="Crossbow Small">
            Xbow Small
          </option>
          <option key="Crossbow Light" value="Crossbow Light">
            Xbow Light
          </option>
          <option key="Crossbow Heavy" value="Crossbow Heavy">
            Xbow Heavy
          </option>
          <option key="Bow Light" value="Bow Light">
            Bow Light
          </option>
          <option key="Bow Heavy" value="Bow Heavy">
            Bow Heavy
          </option>
        </select>
      </div>
      <div id="armor-div" className="input-set">
        <label
          onClick={() =>
            setPopupInfo({
              title: "Armor",
              singleItem: TooltipObjs.armor,
              list: null,
              mode: "tooltip",
            })
          }
        >
          <span className="tooltip">ARMOR</span>
        </label>
        <select
          name="armor"
          id="armor"
          value={basicsData.armor}
          onChange={(e) => {
            setBasicsData({ ...basicsData, armor: e.target.value });
          }}
        >
          <option key="None" value="None">
            None
          </option>
          <option key="Light" value="Light">
            Light
          </option>
          <option key="Heavy" value="Heavy">
            Heavy
          </option>
        </select>
        <select
          name="shield"
          id="shield"
          value={basicsData.shield}
          disabled={
            basicsData.melee.startsWith("2H") ||
            basicsData.melee.startsWith("DW")
          }
          onChange={(e) => {
            setBasicsData({
              ...basicsData,
              shield: e.target.value,
            });
          }}
        >
          <option key="No Shield" value="No Shield">
            No Shield
          </option>
          <option key="Shield" value="Shield">
            Shield
          </option>
        </select>
      </div>
    </div>
  );
}

export default BasicsBlock;
