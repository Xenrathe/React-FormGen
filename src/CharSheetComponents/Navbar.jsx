import { useState, useEffect } from "react";
import "./CSS/Navbar.css";
import SaveIcon from "../assets/download.svg?react";
import LoadIcon from "../assets/open.svg?react";
import PrintIcon from "../assets/printer.svg?react";

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
            <SaveIcon className="icon" alt="Save" />
          ) : (
            "Save To File"
          )}
        </button>
        <button onClick={onLoad}>
          {isSmallScreen ? (
            <LoadIcon className="icon" alt="Load"/>
          ) : (
            "Load From File"
          )}
        </button>
      </div>
      <div id="print">
        <button onClick={onPrint}>
          {isSmallScreen ? (
            <PrintIcon className="icon" alt="Load" />
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
