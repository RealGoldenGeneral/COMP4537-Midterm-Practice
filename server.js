const Pokemon = require('./models/pokemon');
const express = require('express');
const app = express();

app.use(express.json());

require('./db.js');

app.get("/api/v1/pokemons", async (req, res) => {

    const count = req.query.count;
    const after = req.query.after;

    if (count < 1) {
        res.status(400).json({msg: "Count is under 1. Please try again."});
    } else if (after > 808 || after < 0) {
        res.status(400).json({msg: "After out of range. Please try again."})
    } else {
        try {
        const pokemons = await Pokemon.find({}).skip(after).limit(count);
        res.status(200).json(pokemons);
        } catch (error) {
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