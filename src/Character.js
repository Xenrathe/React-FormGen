export class Character {
    constructor(abilityScores, name, level, race, raceBonus, job, jobBonus, jobTalents, feats, lightArmor, hasShield, weaponType, oneUniqueThing, iconRelationships, backgrounds) {
        this.abilityScores = abilityScores; //[10, 11, 13, 10, 14, 18] = [str, con, dex, int, wis, cha]
        this.name = name; //a string
        this.level = level; //a number 1-10
        this.race = race; //a string
        this.raceBonus = raceBonus; //a string
        this.job = job; //a string
        this.jobBonus = jobBonus; //a string
        this.jobTalents = jobTalents; //an array of strings
        this.feats = feats; //an array of strings
        this.lightArmor = lightArmor; //true = light armor, false = heavy armor
        this.hasShield = hasShield; //boolean
        this.weaponType = weaponType; //a string
        this.oneUniqueThing = oneUniqueThing; //a longer string
        this.iconRelationships = iconRelationships; //an array of objects, like [{'archmage', 1}, {'lich', -2}]
        this.backgrounds = backgrounds; //an array of objects, like [{'street thief', 4}, {'magician', 2}]

        this.abilityModifiers = this.calculateAbilityModifiers();
        this.maxHP = this.calculateMaxHP();
        this.AC = this.calculateAC();
        this.PD = this.calculatePD();
        this.MD = this.calculateMD();
        this.recoveryDice = this.calculateRecoveryDice();
        this.racialPowers = this.calculateRacialPowers();
      }

    calculateMaxHP() {
      //(base value + con mod) * level multiplier
    }

    calculateAC() {
      //
    }

    calculatePD() {
      //base PD + middle value of str, con, dex modifier + level
    }

    calculateMD() {
      //base MD + middle value of int, wis, cha modifier + level
    }

    calculateAbilityModifiers(){
      return this.abilityScores.map ((score) => 
        Math.floor((score - 10) / 2)
      );
    }

    calculateRecoveryDice() {

    }

    calculateRacialPowers() {

    }
}