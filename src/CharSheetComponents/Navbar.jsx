import { useState, useEffect } from "react";
import "./Navbar.css";
import saveIcon from "../assets/download.svg";
import loadIcon from "../assets/open.svg";
import printIcon from "../assets/printer.svg";

function handleExtraInfoChkBox(event, setExtraInfo) {
  setExtraInfo((prev) => !prev);
  const abilitySheets = document.querySelector("#ability-sheets");
  if (event.target.checked) {
    abilitySheets.classList.add("include-in-printing");
  } else {
    abilitySheets.classList.remove("include-in-printing");
  }
}

export default function Navbar({ onSave, onLoad, onPrint }) {
  const [extraInfo, setExtraInfo] = useState(false);
  const [isSmallScreen, setIsSmallScreen] = useState(window.innerWidth <= 700);

  useEffect(() => {
    const handleResize = () => setIsSmallScreen(window.innerWidth <= 700);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return (
    <nav className="navbar no-print">
      <span id="nav-title">13th Age CharGen</span>
      <div id="save-load">
        <button onClick={onSave}>
          {isSmallScreen ? (
            <img src={saveIcon} alt="Save" width="35" height="35" />
          ) : (
            "Save To File"
          )}
        </button>
        <button onClick={onLoad}>
          {isSmallScreen ? (
            <img src={loadIcon} alt="Load" width="35" height="35" />
          ) : (
            "Load From File"
          )}
        </button>
      </div>
      <div id="print">
        <button onClick={onPrint}>
          {isSmallScreen ? (
            <img src={printIcon} alt="Load" width="35" height="35" />
          ) : (
            "Print"
          )}
        </button>

        <label className="checkbox-container">
          <input
            type="checkbox"
            checked={extraInfo}
            onChange={(event) => handleExtraInfoChkBox(event, setExtraInfo)}
          />
          {isSmallScreen ? <span>Ability<br></br>Info</span> : (<span>Print Ability Info</span>)}
        </label>
      </div>
    </nav>
  );
}
