const now = new Date();

const pad = n => String(n).padStart(2, "0");

const timestamp =
	pad(now.getHours()) +
	pad(now.getMinutes()) +
	pad(now.getSeconds());

sendCat(`TM${timestamp};`);