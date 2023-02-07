const mongoose = require('mongoose');

const pokemonSchema = new mongoose.Schema({
    id: {type: Number, unique: true},
    name: {
        english: String,
        japanese: String,
        chinese: String,
        french: String,
    },
    type: [{
        english: String,
        chinese: String,
        japanese: String,
    }],
    base: {
        HP: Number,
        Attack: Number,
        Defense: Number,
        Speed: Number,
        SpecialAttack: Number,
        SpecialDefense: Number,
    },
});

const Pokemon = mongoose.model('Pokemon', pokemonSchema);

module.exports = Pokemon;