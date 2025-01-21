import { useState, useEffect } from "react";
import "./App.css";
import CharSheet from "./CharSheetComponents/CharSheet.jsx";

function App() {
  /*
  const [characters, setCharacters] = useState([]);

  // Load characters from LocalStorage on component mount
  useEffect(() => {
    const storedCharacters =
      JSON.parse(localStorage.getItem("lancerCharacters")) || [];
    setCharacters(storedCharacters);
  }, []);

  // Handle creating a new character
  const handleNewCharacter = () => {
    const newCharacter = {
      id: Date.now(),
      name: `Character ${characters.length + 1}`,
    };
    const updatedCharacters = [...characters, newCharacter];
    setCharacters(updatedCharacters);
    localStorage.setItem("lancerCharacters", JSON.stringify(updatedCharacters));
  };

  return (
    <div className="barracks">
      <h1>Barracks</h1>
      <div className="character-list">
        {characters.length > 0 ? (
          characters.map((character) => (
            <button key={character.id} className="character-button">
              {character.name}
            </button>
          ))
        ) : (
          <p>No characters created yet.</p>
        )}
      </div>
      <button className="new-character-button" onClick={handleNewCharacter}>
        New Character
      </button>
    </div>
  );*/

  return <CharSheet />;
}

export default App;
