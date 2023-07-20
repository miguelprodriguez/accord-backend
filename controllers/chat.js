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

module.exports.findOrCreateChat = async (req, res) => {
    // const senderId = "521d4a7e-294c-4036-8ba6-483de7b0b4e2";
    // const recipientId = "15570a37-ab94-4c9c-bc86-325aebcb157e"
    const { senderId, recipientId } = req.body

    try {
        const existingChat = await prisma.chat.findFirst({
            where: {
                AND: [
                    { participants: { some: { userId: senderId } } },
                    { participants: { some: { userId: recipientId } } },
                ],
            },
            include: { participants: true },
        });
        if (existingChat) return res.status(200).send(existingChat)

        const newChat = await prisma.chat.create({
            data: {
                participants: { connect: [{ id: senderId }, { id: recipientId }] },
            },
            include: { participants: true },
        });
        return res.status(200).send(newChat);
    } catch (error) {
        return res.status(500).send("Something went wrong. Please try again later.")
    }
}