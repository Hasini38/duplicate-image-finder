const express = require("express");
const { imageHash } = require("image-hash");
const path = require("path");

const router = express.Router();

function hammingDistance(str1, str2) {
    let distance = 0;

    for (let i = 0; i < str1.length; i++) {
        if (str1[i] !== str2[i]) {
            distance++;
        }
    }

    return distance;
}

router.post("/", async (req, res) => {

    try {

        const files = req.files;

        if (!files || files.length < 2) {
            return res.status(400).json({
                success: false,
                message: "Please upload at least two images."
            });
        }

        const hashes = [];

        for (const file of files) {

            const hash = await new Promise((resolve, reject) => {

                imageHash(
                    path.join(file.destination, file.filename),
                    16,
                    true,
                    (error, data) => {

                        if (error) reject(error);

                        else resolve(data);

                    }
                );

            });

            hashes.push({
                name: file.originalname,
                hash
            });

        }

        const matches = [];

        for (let i = 0; i < hashes.length; i++) {

            for (let j = i + 1; j < hashes.length; j++) {

                const distance = hammingDistance(
                    hashes[i].hash,
                    hashes[j].hash
                );

                const similarity =
                    (
                        (
                            hashes[i].hash.length - distance
                        ) /
                        hashes[i].hash.length
                    ) * 100;

                matches.push({

                    image1: hashes[i].name,

                    image2: hashes[j].name,

                    similarity: similarity.toFixed(2) + "%"

                });

            }

        }

        res.json({

            success: true,

            comparisons: matches

        });

    } catch (err) {

        console.error(err);

        res.status(500).json({

            success: false,

            message: err.message

        });

    }

});

module.exports = router;