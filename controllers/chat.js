const { PrismaClient } = require("@prisma/client");
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

module.exports.findOrCreateChat = async (req, res) => {
    const { senderId, recipientId } = req.body

    try {
        if (!senderId) return res.status(400).send("No sender id received.")
        if (!recipientId) return res.status(400).send("No recipient id received.")

        const existingChat = await prisma.chat.findFirst({
            where: {
                AND: [
                    { participants: { some: { userId: senderId } } },
                    { participants: { some: { userId: recipientId } } },
                ],
            },
            include: { participants: true },
        });
        if (existingChat) return res.status(200).send({ isExisting: true, ...existingChat })

        await prisma.chat.create({
            data: {
                participants: { connect: [{ userId: senderId }, { userId: recipientId }] },
            },
            include: { participants: true },
        });

        const allUserChats = await prisma.chat.findMany({
            where: { participants: { some: { userId: senderId } } },
            include: { participants: true }
        })
        for (const chat of allUserChats) {
            chat.lastMessage = await getLastMessage(chat.id);
        }

        return res.status(200).send({ isExisting: false, allUserChats });
    } catch (error) {
        return res.status(500).send("Something went wrong. Please try again later.")
    }
}

async function getLastMessage(chatId) {
    const messages = await prisma.message.findMany({
        where: { chatId },
        orderBy: { createdAt: 'desc' }, // Order messages by createdAt in descending order
        take: 1, // Get only the first (most recent) message
        include: { sender: true }, // Include the sender details in the message object
    });

    return messages[0] || null; // Return the last message or null if there are no messages
}