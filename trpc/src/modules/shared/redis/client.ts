import { friendsClient } from "./friends"
import { profileClient } from "./profile"
import { requestsClient } from "./requests"
import { pickingClient } from "./picking"
import { chooseePresenceClient } from "./chooseePresence"
import { schoolsClient } from "./school"

export const redisClient = {
	friends: friendsClient,
	profile: profileClient,
	requests: requestsClient,
	picking: pickingClient,
	chooseePresence: chooseePresenceClient,
	schools: schoolsClient,
}
