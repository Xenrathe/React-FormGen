export class Character {
    constructor(abilityScores, name, level, race, raceStat, job, jobStat, jobTalents, feats, lightArmor, hasShield, weaponType, oneUniqueThing, iconRelationships, backgrounds) {
        this.abilityScores = abilityScores; //[10, 11, 13, 10, 14, 18] = [str, con, dex, int, wis, cha]
        this.name = name; //a string
        this.level = level; //a number 1-10
        this.race = race; //an enum or string
        this.raceStat = raceStat; //a string
        this.job = job; //a string
        this.jobStat = jobStat; //a string
        this.jobTalents = jobTalents; //an array of #s representing enums,
        this.feats = feats; //an array of #s representing feat enums
        this.lightArmor = lightArmor; //true = light armor, false = heavy armor
        this.hasShield = hasShield; //boolean
        this.weaponType = weaponType; //a number representing a category
        this.oneUniqueThing = oneUniqueThing; //a longer string
        this.iconRelationships = iconRelationships; //an array of objects, like [{'archmage', 1}, {'lich', -2}]
        this.backgrounds = backgrounds; //an array of objects, like [{'street thief', 4}, {'magician', 2}]

        this.maxHP = this.calculateMaxHP();
        this.AC = this.calculateAC();
        this.PD = this.calculatePD();
        this.MD = this.calculateMD();
        this.recoveryDice = this.calculateRecoveryDice();
        this.racialPowers = this.calculateRacialPowers();
      }

    calculateMaxHP() {

    }

    calculateAC() {

    }

    calculatePD() {

    }

    calculateMD() {

    }

    calculateRecoveryDice() {

    }

    calculateRacialPowers() {

    }
}