import races from "../data/races";
import jobs from "../data/jobs";

function Basics({ basicsData, setBasicsData }) {
  function PopulateDropDown(props) {
    return Object.keys(props.data).map((option) => (
      <option key={option} value={option}>
        {option}
      </option>
    ));
  }

  function PopulateBonusAbilities(props) {
    const collection = props.collectionKey in races ? races : jobs;

    return collection[props.collectionKey].abilityBonus.map((ability) => (
      <option key={ability} value={ability}>
        {ability}
      </option>
    ));
  }

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

  return (
    <div id="basics" className="input-group">
      <div id="name-div" className="input-set">
        <label htmlFor="text">NAME</label>
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
          onChange={(e) => {
            setBasicsData({ ...basicsData, level: e.target.value });
          }}
        />
      </div>
      <div id="race-div" className="input-set">
        <label htmlFor="race">RACE</label>
        <select
          name="race"
          id="race"
          value={basicsData.race}
          onChange={(e) => {
            setBasicsData({ ...basicsData, race: e.target.value });
          }}
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
          onChange={(e) => {
            setBasicsData({ ...basicsData, job: e.target.value });
          }}
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
        <label htmlFor="weapons">WEAPONS</label>
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
        <label htmlFor="armor">ARMOR</label>
        <select
          name="armor"
          id="armor"
          value={basicsData.armor}
          onChange={(e) => {
            setBasicsData({ ...basicsData, armor: e.target.value });
          }}
        >
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
  );
}

export default Basics;
