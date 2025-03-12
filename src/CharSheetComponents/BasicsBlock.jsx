import races from "../data/races";
import jobs from "../data/jobs";

function BasicsBlock({ basicsData, setBasicsData }) {
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

  //removes shield if swapping to 2Her
  const handleMeleeChange = (event) => {
    if (event.target.value.startsWith("2H")) {
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
      <div id="name-level">
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
      </div>
      <div id="race-class">
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
          <label>CLASS</label>
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
      </div>
      <div id="weapons-armor">
        <div id="weapons-div" className="input-set">
          <label>WEAPON</label>
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
          <label>ARMOR</label>
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
            disabled={basicsData.melee.startsWith("2H")}
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
    </div>
  );
}

export default BasicsBlock;
