const Pokemon = require('./models/pokemon');
const express = require('express');
const axios = require('axios')
const app = express();

const fetchPokemonData = async () => {
    pokemonData = await axios({
        method: 'get',
        url: 'https://raw.githubusercontent.com/fanzeyi/pokemon.json/master/pokedex.json',
        responseType: 'json',
    });
    return pokemonData
}

const fetchTypeData = async () => {
    typeData = await axios({
        method: 'get',
        url: 'https://raw.githubusercontent.com/fanzeyi/pokemon.json/master/types.json',
        responseType: 'json',
    });
    return typeData
}

const matchType = (pokemonData, typeData) => {
    for (let l = 0; l < pokemonData.data.length; l++) {
        type = pokemonData.data[l].type;
        for (let j = 0; j < type.length; j++) {
            for (let i = 0; i < typeData.data.length; i++) {
                if (typeData.data[i].english === type[j]) {
                    pokemonData.data[l].type[j] = typeData.data[i];
                    break;
                }
            }
        }
    }
    return pokemonData;
}

app.use(express.json());

// require('./db.js');

app.get("/api/v1/pokemons", async (req, res) => {
    let pokemons;
    const count = parseInt(req.query.count);
    const after = parseInt(req.query.after);
    pokemonData = await fetchPokemonData();
    typeData = await fetchTypeData();
    data = await matchType(pokemonData, typeData);
    if (count < 1) {
        res.status(400).json({msg: "Count is under 1. Please try again."});
    } else if (after > 808 || after < 0) {
        res.status(400).json({msg: "After out of range. Please try again."})
    } else {
        try {
            for (let k = count; k < (after + count); k++) {
                if (k > 808) {
                    res.status(400).json({msg: "Count and after are out of range. Please try again."});
                    break;
                } else {
                    pokemons = Pokemon.findOne({id: k});
                }
            }
            if (pokemons.length < count) {
                pokemons = data.data.slice(after, after + count);
            }
            res.status(200).json(pokemons);
        } catch (error) {
            console.log(error);
            res.status(400).send(error);
        }
    }
});

app.post("/api/v1/pokemon", async (req, res) => {
    try {
        const pokemons = await Pokemon.insertMany(req.body);
        res.status(201).json({msg: "Added Successfully", pokeInfo: pokemons[0]});
    } catch (error) {
        if (error.name == "ValidationError") {
            res.status(400).json({errMsg: `ValidationError: check your ${error.errors.type.path} field`});
        } else if (error.code == 11000) {
            res.status(400).json({errMsg: {message: "Duplicate Pokemon ID", code: error.code}});
        }
    }
})

app.get("/api/v1/pokemon/:id", async (req, res) => {
    const id = req.params.id;
    try {
        const pokemon = await Pokemon.findOne({id: id});
        if (!pokemon) {
            res.status(404).json({errMsg : "Pokemon not found"});
        } else {
            res.status(200).json(pokemon);
        }
    } catch (error) {
        if (error.name == "CastError") {
            res.status(400).json({errMsg: "Cast Error: pass pokemon id between 1 and 809"});
        }
    }
});

app.get("/api/v1/pokemonImage/:id", async (req, res) => {
    const id = req.params.id;
    try {
        const pokemon = await Pokemon.findOne({id: id});
        if (!pokemon) {
            res.status(404).json({errMsg : "Pokemon not found"});
        } else {
            res.status(200).json({msg: "Image found", image: `https://github.com/fanzeyi/pokemon.json/blob/master/images/${pokemon.id}.png`});
        }
    } catch (error) {
        res.status(400).send(error);
    }
});

app.put("/api/v1/pokemon/:id", async (req, res) => {
    const id = req.params.id;
    try {
        const pokemon = await Pokemon.findOne({id: id});
        if (!pokemon) {
            const pokemon = await Pokemon.findOneAndUpdate({id: id}, req.body, {new: true, upsert: true});
            res.status(200).json({msg: "Added Successfully", pokeInfo: pokemon});
        } else {
            const pokemon = await Pokemon.findOneAndUpdate({id: id}, req.body, {new: true, upsert: true});
            res.status(200).json({msg: "Updated Successfully", pokeInfo: pokemon});
        }
    } catch (error) {
        if (error.name == "CastError") {
            res.status(400).json({errMsg: `ValidationError: check your ${error.path} field`});
        }
    }
});

app.patch("/api/v1/pokemon/:id", async (req, res) => {
    const id = req.params.id;
    try {
        const pokemon = await Pokemon.findOne({id: id});
        if (!pokemon) {
            res.status(404).json({msg: "Not found"});
        } else {
            const pokemon = await Pokemon.findOneAndUpdate({id: id}, req.body, {new: true, upsert: false})
            res.status(200).json({msg: "Updated Successfully", pokeInfo: pokemon});
        }
    } catch (error) {
        if (error.name == "CastError") {
            res.status(400).json({errMsg: `ValidationError: check your ${error.path} field`});
        }
    }
});

app.delete("/api/v1/pokemon/:id", async (req, res) => {
    const id = req.params.id;
    try{
        const pokemon = await Pokemon.findOneAndDelete({id: id});
        if (!pokemon) {
            res.status(404).json({errMsg: "Pokemon not found"});
        } else {
        res.status(200).json({msg: "Deleted Successfully", pokeInfo: pokemon});
        }
    } catch (error) {
        res.status(400).send(error);
    }
});

app.get("*", (req, res) => {
    res.status(404).json({msg: "Improper route. Check API docs plz."})
});

app.listen(3000, () => {
    console.log("Listening on port 3000.");
});