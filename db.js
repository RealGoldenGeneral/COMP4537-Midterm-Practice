const mongoose = require('mongoose');
const Pokemon = require('./models/pokemon');
const axios = require('axios');

mongoose.connect('mongodb+srv://nickycheng:nickycheng@cluster0.5dfxdfp.mongodb.net/test', {useNewUrlParser: true});

const db = mongoose.connection;

const fetchPokemonData = async () => {
    pokemonData = await axios({
        method: 'get',
        url: 'https://raw.githubusercontent.com/fanzeyi/pokemon.json/master/pokedex.json',
        responseType: 'json',
    });

    typeData = await axios({
        method: 'get',
        url: 'https://raw.githubusercontent.com/fanzeyi/pokemon.json/master/types.json',
        responseType: 'json',
});
}

fetchPokemonData();

const matchType = (type) => {
    let typeArray = [];
    for (let j = 0; j < type.length; j++) {
        for (let i = 0; i < typeData.data.length; i++) {
            if (typeData.data[i].english === type[j]) {
                typeArray.push(typeData.data[i]);
                break;
            }
        }
    }
    return typeArray;
}

const populateDB = async () => {
    await Pokemon.deleteMany({});
    let pokedex = []
    for (let l = 0; l < pokemonData.data.length; l++) {
        await Pokemon.create({
            id: pokemonData.data[l].id,
            name: {
                english: pokemonData.data[l].name.english,
                japanese: pokemonData.data[l].name.japanese,
                chinese: pokemonData.data[l].name.chinese,
                french: pokemonData.data[l].name.french,
            },
            type: matchType(pokemonData.data[l].type),
            base: {
                HP: pokemonData.data[l].base.HP,
                Attack: pokemonData.data[l].base.Attack,
                Defense: pokemonData.data[l].base.Defense,
                Speed: pokemonData.data[l].base.Speed,
                SpecialAttack: pokemonData.data[l].base["Sp. Attack"],
                SpecialDefense: pokemonData.data[l].base["Sp. Defense"],
            },
        });
    }
    console.log("Connected to DB.");
}

db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', () => {
    populateDB();
});