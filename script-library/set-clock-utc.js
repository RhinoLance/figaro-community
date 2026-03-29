const now = new Date();

const pad = n => String(n).padStart(2, "0");

const timestampUTC =
	pad(now.getUTCHours()) +
	pad(now.getUTCMinutes()) +
	pad(now.getUTCSeconds());

sendCat(`TM${timestampUTC};`, false);