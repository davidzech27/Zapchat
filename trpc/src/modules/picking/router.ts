import { z } from "zod"
import { TRPCError } from "@trpc/server"
import { router } from "../../initTRPC"
import { authedProcedure } from "../../procedures"
import { db } from "../../lib/db"
import { redisLib } from "../shared/redis/client"
import constants from "./constants"
import conversationIdUtil from "../shared/util/conversationIdUtil"

const pickingRouter = router({
	choices: authedProcedure.query(async ({ ctx: { phoneNumber } }) => {
		return redisLib.profile.getFieldsMany({
			phoneNumbers: await redisLib.picking.getChoices({
				phoneNumber,
				number: constants.NUMBER_OF_CHOICES,
			}),
			fields: ["username", "name", "conversationCount"], // ? conversationCount
		})
	}),
	choose: authedProcedure
		.input(
			z.object({
				chooseeUsername: z.string(),
				firstMessage: z.string(),
			})
		)
		.mutation(
			async ({
				input: { chooseeUsername, firstMessage },
				ctx: { phoneNumber: chooserPhoneNumber, username: chooserUsername },
			}) => {
				const [lastPickedAt, chooseePhoneNumber, chooserName] = await Promise.all([
					redisLib.picking.getLastPickedAt({ phoneNumber: chooserPhoneNumber }),
					redisLib.profile.getPhoneNumber({ username: chooseeUsername }),
					(async () =>
						(
							await redisLib.profile.getFields({
								phoneNumber: chooserPhoneNumber,
								fields: ["name"],
							})
						)?.name)(),
				])

				if (
					lastPickedAt &&
					new Date().valueOf() - lastPickedAt.valueOf() <
						constants.MILLISECONDS_CAN_PICK_EVERY
				) {
					throw new TRPCError({ code: "PRECONDITION_FAILED" })
				}

				if (!chooseePhoneNumber || !chooserName) {
					throw new TRPCError({ code: "NOT_FOUND" })
				}

				const chooseeName = (
					await redisLib.profile.getFields({
						phoneNumber: chooseePhoneNumber,
						fields: ["name"],
					})
				)?.name

				if (!chooseeName) {
					throw new TRPCError({ code: "NOT_FOUND" })
				}

				const conversationId = conversationIdUtil.create({
					chooserPhoneNumber,
					chooseePhoneNumber,
				})

				await Promise.all([
					db.execute(
						"INSERT INTO conversation (id, chooser_phone_number, chooser_username, chooser_name, choosee_phone_number, choosee_username, choosee_name, created_at, identified) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)",
						[
							conversationId,
							BigInt(chooserPhoneNumber),
							chooserUsername,
							chooserName,
							BigInt(chooseePhoneNumber),
							chooseeUsername,
							chooseeName,
							new Date(),
							false,
						]
					),
					db.execute(
						"INSERT INTO message (conversation_id, content, sent_at, from_chooser) VALUES (?, ?, ?, ?)",
						[conversationId, firstMessage, new Date(), true]
					),
				])

				await Promise.all([
					redisLib.picking.updateLastPickedAt({ phoneNumber: chooserPhoneNumber }),
					redisLib.profile.incrementChatCount({ phoneNumber: chooserPhoneNumber }),
					redisLib.profile.incrementChatCount({ phoneNumber: chooseePhoneNumber }),
				])
			}
		),
	canPickAt: authedProcedure.query(async ({ ctx: { phoneNumber } }) => {
		const lastPickedAt = await redisLib.picking.getLastPickedAt({ phoneNumber })

		return lastPickedAt !== null
			? new Date(lastPickedAt.valueOf() + constants.MILLISECONDS_CAN_PICK_EVERY)
			: null
	}),
})

export default pickingRouter
