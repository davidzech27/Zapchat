let sequenceNumber = 0 //! doesn't scale

const currentTimestamp = () => {
	const timestamp = new Date()

	timestamp.setMilliseconds(sequenceNumber)

	sequenceNumber++
	sequenceNumber %= 1000

	return timestamp.toISOString().slice(0, 19).replace("T", " ")
}

export default currentTimestamp
