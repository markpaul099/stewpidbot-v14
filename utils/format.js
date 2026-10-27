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

// Parses "#2B65EC", "2b65ec" or "#fff" into a color number, or null if it isn't a hex color
function parseHexColor(input) {
	const match = String(input ?? "").trim().match(/^#?([0-9a-f]{3}|[0-9a-f]{6})$/i);
	if (!match) return null;
	const hex = match[1].length === 3 ? [...match[1]].map(c => c + c).join("") : match[1];
	return parseInt(hex, 16);
}

// Slash command options can't contain newlines, so commands accept a typed \n instead
function unescapeNewlines(text) {
	return text.replace(/\\n/g, "\n");
}

module.exports = { formatDuration, parseHexColor, unescapeNewlines };
