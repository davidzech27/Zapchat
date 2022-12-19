const useTimeAgo = ({ date }: { date: Date }) => {
	const currentDate = new Date()

	const timeDifference = currentDate.getTime() - date.getTime()

	const [daysAgo, hoursAgo, minutesAgo, secondsAgo] = [
		Math.floor(timeDifference / (1000 * 60 * 60 * 24)),
		Math.floor((timeDifference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
		Math.floor((timeDifference % (1000 * 60 * 60)) / (1000 * 60)),
		Math.floor((timeDifference % (1000 * 60)) / 1000),
	]

	if (daysAgo) {
		return `${daysAgo} day${daysAgo === 1 ? "" : "s"} ago`
	} else if (hoursAgo) {
		return `${hoursAgo} hour${hoursAgo === 1 ? "" : "s"} ago`
	} else if (minutesAgo) {
		return `${minutesAgo} minute${minutesAgo === 1 ? "" : "s"} ago`
	} else if (secondsAgo) {
		return `${secondsAgo} second${secondsAgo === 1 ? "" : "s"} ago`
	}
}

export default useTimeAgo
