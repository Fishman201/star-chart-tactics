export default class Dice {
    static rollD20() {
        return Math.floor(Math.random() * 20) + 1;
    }

    static rollD6() {
        return Math.floor(Math.random() * 6) + 1;
    }

    static roll(count, sides) {
        let total = 0;
        for (let i = 0; i < count; i++) {
            total += Math.floor(Math.random() * sides) + 1;
        }
        return total;
    }
}
