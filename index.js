import express from "express";
import 'dotenv/config';
import { nanoid } from "nanoid";
import path from "path";
import fs from "fs";

const app = express();
app.use(express.json());

const { readFile, writeFile } = fs.promises;

const PORT = process.env.PORT ?? 3000;
app.listen(PORT, () => {
    console.log(`Servidor corriendo en http://localhost:${PORT}`);
});

const getCanciones = async () => {
    const data = await readFile("./repertorio.json", "utf-8");
    return JSON.parse(data);
};

// HTML
app.get("/", (req, res) => {
    const filePath = path.resolve("./index.html");
    res.sendFile(filePath);
});

// GET
app.get("/canciones", async (req, res) => {
    try {
        const canciones = await getCanciones();
        res.json(canciones);
    } catch (error) {
        console.error("Error al obtener canciones:", error);
        res.status(500).json({ message: "Error interno del servidor" });
    }
});

// POST
app.post("/canciones", async (req, res) => {
    try {
        const { titulo, artista, tono } = req.body;
        const newCancion = {
            id: nanoid(),
            titulo,
            artista,
            tono,
            editar: true,
            eliminar: true
        };

        const canciones = await getCanciones();
        canciones.push(newCancion);

        await writeFile("./repertorio.json", JSON.stringify(canciones));
        res.status(201).json({ message: "Canción creada con éxito" });

    } catch (error) {
        console.error("Error al crear canción:", error);
        res.status(500).json({ message: "Error interno del servidor" });
    }
});



// PUT
app.put("/canciones/:id", async (req, res) => {
    try {
        const id = req.params.id;
        const { titulo, artista, tono } = req.body;

        const canciones = await getCanciones();
        const index = canciones.findIndex(c => String(c.id) === String(id));

        if (index === -1) {
            return res.status(404).json({ message: "Canción no encontrada" });
        }

        canciones[index] = {
            ...canciones[index],
            ...(titulo && { titulo }),
            ...(artista && { artista }),
            ...(tono && { tono })
        };

        await writeFile("./repertorio.json", JSON.stringify(canciones));
        res.json({ message: "Canción actualizada correctamente", cancion: canciones[index] });

    } catch (error) {
        console.error("Error al actualizar canción:", error);
        res.status(500).json({ message: "Error interno del servidor" });
    }
});

// DELETE
app.delete("/canciones/:id", async (req, res) => {
    try {
        const id = req.params.id;
        const canciones = await getCanciones();
        const index = canciones.findIndex(c => String(c.id) === String(id));

        if (index === -1) {
            return res.status(404).json({ message: "Canción no encontrada" });
        }

        canciones.splice(index, 1);
        await writeFile("./repertorio.json", JSON.stringify(canciones));
        res.json({ message: "Canción eliminada correctamente" });

    } catch (error) {
        console.error("Error al eliminar canción:", error);
        res.status(500).json({ message: "Error interno del servidor" });
    }
});

