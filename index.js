import express from "express"

import 'dotenv/config'
import { nanoid } from "nanoid"
import path from "path"
import { writeFile, readFile } from "node:fs/promises";


const app = express()


app.use(express.json());

const getCanciones = async () => {
    const fsResponse = await readFile("./repertorio.json", "utf-8")
    const canciones = JSON.parse(fsResponse)
    return canciones
}

// POST Canciones
app.post("/canciones", (req, res) => {
    const { titulo, artista, tono } = req.body
    const newCancion = {
        id: nanoid(),
        titulo,
        artista,
        tono,
        editar: true,
        eliminar: true
    }
    const canciones = getCanciones();
    canciones.push(newCancion)
    fs.writeFileSync('./repertorio.json', JSON.stringify(canciones))
    res.status(201).json({ message: 'Canción creada con exito' })

})

// Get Canciones
app.get("/", (req, res) => {
    const filePath = path.resolve("./index.html")
    res.sendFile(filePath)
})

app.get("/canciones", (req, res) => {
    try {
        const canciones = getCanciones();
        res.json(canciones)
    } catch (error) {
        console.error(error)
    }
})
//Put canciones ID
app.put("/canciones/:id", async (req, res) => {
    try {
        const id = req.params.id;
        const { titulo, artista, tono } = req.body;

        let canciones = await getCanciones();
        const index = canciones.findIndex((c) => c.id === id);

        // Actualizamos los campos con los valores nuevos (si existen)
        canciones[index] = {
            ...canciones[index],
            ...(titulo && { titulo }),
            ...(artista && { artista }),
            ...(tono && { tono })
        };

        await fs.writeFile('./repertorio.json', JSON.stringify(canciones, null, 2));

        res.json({ message: "Canción actualizada correctamente", cancion: canciones[index] });

    } catch (error) {
        console.error("Error en PUT:", error);
        res.status(500).json({ message: "Error interno del servidor" });
    }
});
//DELETE CANCIONES ID


const PORT = process.env.port ?? 3000
app.listen(PORT, () => {
    console.log(`Servidor corriendo en http://localhost:${PORT}`)
})