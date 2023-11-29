const BASE_URL = "http://localhost:8080/api/v1/car";
const form = document.getElementById("car-create-form");
const loading = document.getElementById("loading");

const [today] = new Date().toISOString().split("T");
form.repairDate.setAttribute("value", today);
form.repairDate.setAttribute("max", today);

form.addEventListener("submit", async function (e) {
	e.preventDefault();
	const data = new FormData(this);
	showLoading();
	const car = Object.fromEntries(data.entries());
	const savedCar = await save(car);
	log("Saved car:", savedCar, "#27ae60");
	setTimeout(() => {
		this.reset();
		hideLoading();
	}, Math.random() * 2000);
});

async function save(car) {
	log("Saving car:", car, "#2980b9");
	const response = await fetch(`${BASE_URL}/create`, {
		method: "POST",
		headers: {
			"Accept-Language": "vi",
			"Content-Type": "application/json"
		},
		body: JSON.stringify(car)
	});
	return await response.json();
}

function showLoading() {
	for (const element of form) {
		element.setAttribute("disabled", "");
	}
	loading.style.display = "grid";
}

function hideLoading() {
	for (const element of form) {
		element.removeAttribute("disabled");
	}
	loading.style.display = "none";
}

function log(prefix, object, color) {
	const json = JSON.stringify(object, undefined, 4);
	console.log(`%c${prefix}:\n${json}`, `color: ${color}`);
}
