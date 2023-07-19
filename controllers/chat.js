const { PrismaClient } = require("@prisma/client")
const prisma = new PrismaClient()

module.exports.allChats = async (req, res) => {
    try {
        const currentUser = req.session.user
        const chats = await prisma.chat.findMany({
            where: { participants: { some: { userId: currentUser.userId } } },
            include: {
                participants: true,
            },
        })
        return res.status(200).send(chats)

    } catch (error) {
        console.log("Error: ", error)
    }
}

