const racialPowersAndFeats = {
  "Dark Elf": {
    "Cruel" : { 
      "Description": "Once per battle, deal ongoing damage to a target you hit with a natural even attack roll as a free action. The ongoing damage equals 5 times your level. (For example, at 3rd level you would deal 15 ongoing damage against a single target.) As usual, a normal save (11+) ends the damage. A critical hit doesn't double this ongoing damage.",
      "Champion": "Once per day, you can instead use cruel to deal 5 ongoing damage per level against an enemy you miss or that you roll a natural odd attack against."
    },
    "Adventurer" : {
      "Heritage of the Sword" : "If you can already use swords that deal d6 and d8 damage without attack penalties, you gain a +2 damage bonus with them. (This bonus doesn't increase miss damage.) Otherwise, if your class would ordinarily have an attack penalty with such swords, you can now use them without penalties."
    }
  },
  "Dwarf": {
    "That's Your Best Shot?" : { 
      "Description": "Once per battle as a free action after you have been hit by an enemy attack, you can heal using a recovery. If the escalation die is less than 2, you only get half the usual healing from the recovery. Unlike other recoveries that might allow you to take an average result, you have to roll this one! \n\nNote that you can't use this ability if the attack drops you to 0 hp or below. You've got to be on your feet to sneer at their attack and recover.",
      "Champion": "If the escalation die is 2+ when you use that's your best shot, the recovery is free."
    },
  },
  "Gnome": {
    "Small" : { 
      "Description": "Gnomes have a +2 AC bonus against opportunity attacks.",
    },
    "Confounding" : { 
      "Description": "Once per battle, when you roll a natural 16+ with an attack, you can also daze the target until the end of your next turn.",
      "Champion": "Instead of being dazed, the target of your confounding ability is weakened until the end of your next turn."
    },
    "Minor Illusions" : { 
      "Description": "As a standard action, at-will, you can create a strong smell or a sound nearby. Nearby creatures that fail a normal save notice the smell or sound. Creatures that make the save may notice it but recognize it as not exactly real.",
    },
  },
  "Half-elf": {
    "Surprising" : { 
      "Description": "Once per battle, subtract one from the natural result of one of your own d20 rolls.",
      "Champion": "You gain an additional use of surprising each battle, but you can only use it to affect a nearby ally's d20 roll."
    },
    "Adventurer" : {
      "Heritage of the Sword" : "If you can already use swords that deal d6 and d8 damage without attack penalties, you gain a +2 damage bonus with them. (This bonus doesn't increase miss damage.) Otherwise, if your class would ordinarily have an attack penalty with such swords, you can now use them without penalties."
    }
  },
  "Halfling": {
    "Small" : { 
      "Description": "Halflings have a +2 AC bonus against opportunity attacks.",
    },
    "Evasive" : { 
      "Description": "Once per battle, force an enemy that hits you with an attack to reroll the attack with a -2 penalty.",
      "Champion": "The enemy's reroll takes a -5 penalty instead."
    },
  },
  "Half-orc": {
    "Lethal" : { 
      "Description": "Once per battle, reroll a melee attack and use the roll you prefer as the result.",
      "Champion": "If the lethal attack reroll is a natural 16+, you can use lethal again later this battle."
    },
  },
  "High Elf": {
    "Highblood Teleport" : { 
      "Description": "Once per battle as a move action, place yourself in a nearby location you can see.",
      "Champion": "Deal damage equal to twice your level to one enemy engaged with you before or after you teleport."
    },
    "Adventurer" : {
      "Heritage of the Sword" : "If you can already use swords that deal d6 and d8 damage without attack penalties, you gain a +2 damage bonus with them. (This bonus doesn't increase miss damage.) Otherwise, if your class would ordinarily have an attack penalty with such swords, you can now use them without penalties."
    }
  },
  "Human": {
    "Bonus Feat" : { 
      "Description": "At 1st level, human PCs start with two feats instead of one.",
    },
    "Quick to Fight" : { 
      "Description": "At the start of each battle, roll initiative twice and choose the result you want.",
      "Champion": "If you roll a natural 19 or 20 for initiative, increase the escalation die by 1 (usually from 0 to 1 since it's the start of the battle)."
    },
  },
  "Wood Elf": {
    "Elven Grace" : { 
      "Description": "At the start of each of your turns, roll a die to see if you get an extra standard action. If your roll is equal to or lower than the escalation die, you get an extra standard action that turn.\n\nAt the start of battle, you roll a d6. Each time you successfully gain an extra action, the size of the die you roll increases by one step on the following progression: (d4), d6, d8, d10, d12, d20. If you get an extra action after rolling a d20, you can’t get any more extra actions that battle.",
      "Champion": "Once per day, start a battle rolling a d4 for elven grace instead of a d6."
    },
    "Adventurer" : {
      "Heritage of the Sword" : "If you can already use swords that deal d6 and d8 damage without attack penalties, you gain a +2 damage bonus with them. (This bonus doesn't increase miss damage.) Otherwise, if your class would ordinarily have an attack penalty with such swords, you can now use them without penalties."
    }
  },
};

export function getRacialPowersAndFeats(race) {
  return racialPowersAndFeats[race];
}