import { useState, useEffect } from "react";
import races from "./data/races"
import jobs from "./data/jobs"

function CharSheet() {
  const [selectedMelee, setSelectedMelee] = useState("");
  const [shieldEquipped, setShieldEquipped] = useState("");

  function PopulateDropDown(props){
    return Object.keys(props.data).map((option) => (
      <option key={option} value={option}>{option}</option>
    ));
  }

  const handleMeleeChange = (event) => {
    setSelectedMelee(event.target.value);

    if (event.target.value.startsWith("2H")) {
      setShieldEquipped(false);
    }
  }

  return (
    <div className="main">
      <label for="text">NAME</label>
      <input type="text" id="name" />
      <label for="level">LEVEL</label>
      <input type="number" id="level" />
      <label for="race">RACE</label>
      <select name="race" id="race">
        <PopulateDropDown data={races} />
      </select>
      <label for="job">CLASS</label>
      <select name="job" id="job">
        <PopulateDropDown data={jobs} />
      </select>
      <label for="melee">MELEE</label>
      <select name="melee" id="melee" onChange={handleMeleeChange} value={selectedMelee}>
        <option key="1H Small" value="1H Small">1H Small</option>
        <option key="1H Light" value="1H Light">1H Light</option>
        <option key="1H Heavy" value="1H Heavy">1H Heavy</option>
        <option key="2H Small" value="2H Small">2H Small</option>
        <option key="2H Light" value="2H Light">2H Light</option>
        <option key="2H Heavy" value="2H Heavy">2H Heavy</option>
      </select>
      <label for="ranged">RANGED</label>
      <select name="ranged" id="ranged">
        <option key="Thrown Small" value="Thrown Small">Thrown Small</option>
        <option key="Thrown Light" value="Thrown Light">Thrown Light</option>
        <option key="Crossbow Small" value="Crossbow Small">Xbow Small</option>
        <option key="Crossbow Light" value="Crossbow Light">Xbow Light</option>
        <option key="Crossbow Heavy" value="Crossbow Heavy">Xbow Heavy</option>
        <option key="Bow Light" value="Bow Light">Bow Light</option>
        <option key="Bow Heavy" value="Bow Heavy">Bow Heavy</option>
      </select>
      <label for="armor">ARMOR</label>
      <select name="armor" id="armor">
        <option key="Light" value="Light">Light</option>
        <option key="Heavy" value="Heavy">Heavy</option>
      </select>
      <label for="shield">SHIELD</label>
      <input 
        type="checkbox" id="shield" name="shield" value="Shield"  checked={shieldEquipped}
        disabled={selectedMelee.startsWith("2H")}
        onChange={(e) => {setShieldEquipped(e.target.checked)}}
      />
    </div>
  );
}

export default CharSheet;