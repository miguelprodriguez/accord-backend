const { PrismaClient } = require("@prisma/client")
const prisma = new PrismaClient()

module.exports.allChats = async (req, res) => {
    const currentUser = req.session.user
    console.log("Current user is: ", currentUser)

    try {
        const chats = await prisma.chat.findMany({
            include: {
                participants: true
            },
        })
        console.log("Chat participants: ", chats[0]?.participants)

        return res.status(200).send(chats)

    } catch (error) {
        console.log("Error: ", error)
    }
}