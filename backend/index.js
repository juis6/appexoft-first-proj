import express from "express"

const PORT = process.env.PORT || 8000

const app = express()

app.listen(PORT, () => {
    `Server is listening on port ${PORT}`
})

