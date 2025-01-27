import getRacialPowersAndFeats from "./racialpowers";

const races = {
  "Dark Elf": {
    abilityBonus: ["dex", "cha"],
    racialPowersAndFeats: getRacialPowersAndFeats("Dark Elf"),
  },
  Dwarf: {
    abilityBonus: ["con", "wis"],
    racialPowersAndFeats: getRacialPowersAndFeats("Dwarf"),
  },
  Gnome: {
    abilityBonus: ["dex", "int"],
    racialPowersAndFeats: getRacialPowersAndFeats("Gnome"),
  },
  "Half-elf": {
    abilityBonus: ["con", "cha"],
    racialPowersAndFeats: getRacialPowersAndFeats("Half-elf"),
  },
  Halfling: {
    abilityBonus: ["con", "dex"],
    racialPowersAndFeats: getRacialPowersAndFeats("Halfling"),
  },
  "Half-orc": {
    abilityBonus: ["str", "dex"],
    racialPowersAndFeats: getRacialPowersAndFeats("Half-orc"),
  },
  "High Elf": {
    abilityBonus: ["int", "cha"],
    racialPowersAndFeats: getRacialPowersAndFeats("High Elf"),
  },
  Human: {
    abilityBonus: ["str", "con", "dex", "int", "wis", "cha"],
    racialPowersAndFeats: getRacialPowersAndFeats("Human"),
  },
  "Wood Elf": {
    abilityBonus: ["dex", "wis"],
    racialPowersAndFeats: getRacialPowersAndFeats("High Elf"),
  },
};

export default races;
