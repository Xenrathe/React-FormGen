import { useState } from "react";
import "./Navbar.css";

export default function Navbar({ onSave, onLoad, onPrint }) {
  const [extraInfo, setExtraInfo] = useState(false);

  return (
    <nav className="navbar no-print">
      <span id="nav-title">13th Age CharGen</span>
      <div id="save-load">
        <button onClick={onSave}>Save To File</button>
        <button onClick={onLoad}>Load From File</button>
      </div>
      <div id="print">
        <button onClick={onPrint}>Print</button>
      
        <label className="checkbox-container">
          <input 
            type="checkbox" 
            checked={extraInfo}
            onChange={() => setExtraInfo((prev) => !prev)} 
          />
          Print Ability Info
        </label>
      </div>
    </nav>
  );
}