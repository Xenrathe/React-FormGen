import getRacialPowersAndFeats from "./racialpowers";

const races = {
  "Dark Elf": {
    abilityBonus: ["Dex", "Cha"],
    racialPowersAndFeats: getRacialPowersAndFeats("Dark Elf"),
  },
  Dwarf: {
    abilityBonus: ["Con", "Wis"],
    racialPowersAndFeats: getRacialPowersAndFeats("Dwarf"),
  },
  Gnome: {
    abilityBonus: ["Dex", "Int"],
    racialPowersAndFeats: getRacialPowersAndFeats("Gnome"),
  },
  "Half-elf": {
    abilityBonus: ["Con", "Cha"],
    racialPowersAndFeats: getRacialPowersAndFeats("Half-elf"),
  },
  Halfling: {
    abilityBonus: ["Con", "Dex"],
    racialPowersAndFeats: getRacialPowersAndFeats("Halfling"),
  },
  "Half-orc": {
    abilityBonus: ["Str", "Dex"],
    racialPowersAndFeats: getRacialPowersAndFeats("Half-orc"),
  },
  "High Elf": {
    abilityBonus: ["Int", "Cha"],
    racialPowersAndFeats: getRacialPowersAndFeats("High Elf"),
  },
  Human: {
    abilityBonus: ["Str", "Con", "Dex", "Int", "Wis", "Cha"],
    racialPowersAndFeats: getRacialPowersAndFeats("Human"),
  },
  "Wood Elf": {
    abilityBonus: ["Dex", "Wis"],
    racialPowersAndFeats: getRacialPowersAndFeats("High Elf"),
  },
};

export default races;
