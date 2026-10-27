// Load .env into process.env. Variables already set in the environment win.
// A missing .env is fine when the host provides the variables itself.
try {
	process.loadEnvFile();
} catch (error) {
	if (error.code !== "ENOENT") throw error;
}
