const durationUnits = [["days", 86400], ["hrs", 3600], ["mins", 60], ["secs", 1]];

// Formats milliseconds as "2 days, 3 hrs, 0 mins, 5 secs", dropping leading zero units
function formatDuration(ms) {
	let remaining = Math.max(0, Math.floor(ms / 1000));
	const parts = durationUnits.map(([label, size]) => {
		const value = Math.floor(remaining / size);
		remaining %= size;
		return { value, text: `${value} ${label}` };
	});
	const first = parts.findIndex(part => part.value > 0);
	return parts.slice(first === -1 ? parts.length - 1 : first).map(part => part.text).join(", ");
}

module.exports = { formatDuration };
