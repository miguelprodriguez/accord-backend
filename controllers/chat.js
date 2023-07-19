const { PrismaClient } = require("@prisma/client")
const prisma = new PrismaClient()

module.exports.allChats = async (req, res) => {
    try {
        const currentUser = req.session.user;
        const chats = await prisma.chat.findMany({
            where: { participants: { some: { userId: currentUser.userId } } },
            include: { participants: true },
        });
        for (const chat of chats) {
            chat.lastMessage = await getLastMessage(chat.id);
        }

        return res.status(200).send(chats);
    } catch (error) {
        return res.status(500).json({ error: "Internal server error" });
    }
}

async function getLastMessage(chatId) {
    const messages = await prisma.message.findMany({
        where: { chatId },
        orderBy: { createdAt: 'desc' }, // Order messages by createdAt in descending order
        take: 1, // Get only the first (most recent) message
        include: { sender: true }, // Include the sender details in the message object
    });

    return messages[0]; // Return the last message or null if there are no messages
}