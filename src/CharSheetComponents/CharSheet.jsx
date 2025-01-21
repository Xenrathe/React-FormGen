import Basics from "./Basics.jsx";
import "./CharSheet.css";
import { useState } from "react";

function CharSheet() {
  const [basicsData, setBasicsData] = useState({
    name: "",
    level: 1,
    race: "Dark Elf",
    raceBonus: "Dex",
    job: "Barbarian",
    jobBonus: "Con",
    melee: "1H Small",
    ranged: "Thrown Small",
    armor: "Light",
    shield: false,
  });

  return (
    <div className="charsheet">
      <Basics basicsData={basicsData} setBasicsData={setBasicsData} />
    </div>
  );
}

export default CharSheet;
