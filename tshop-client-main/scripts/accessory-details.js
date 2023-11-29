const BASE_URL = "http://localhost:8080/api/v1/accessories";
const FORMATTER = new Intl.NumberFormat("vi-VN");
const form = document.getElementById("accessory-form");
const pageSize = document.getElementById("size");
const firstPage = document.getElementById("first-page");
const prevPage = document.getElementById("prev-page");
const pageNumber = document.getElementById("page");
const nextPage = document.getElementById("next-page");
const lastPage = document.getElementById("last-page");
const tbody = document.getElementById("accessories");
const inputs = document.getElementsByTagName("input");
const buttons = document.getElementsByTagName("button");
const loadings = document.getElementsByClassName("loading");
const selects = document.getElementsByTagName("select");

const [today] = new Date().toISOString().split("T");
form.repairDate.setAttribute("value", today);
form.repairDate.setAttribute("max", today);

form.addEventListener("submit", async function (e) {
	e.preventDefault();
	const data = new FormData(this);
	showLoading();
	const accessory = Object.fromEntries(data.entries());
	accessory.price = accessory.price.replace(/[,.]/g, "");
	const savedAccessory = await save(accessory);
	log("Saved accessory:", savedAccessory, "#27ae60");
	const page = await findAll();
	setTimeout(() => {
		this.reset();
		hideLoading();
		updatePagination(page);
	}, Math.random() * 2000);
});

form.price.addEventListener("input", function () {
	const price = this.value.replace(/[,.]/g, "");
	this.value = FORMATTER.format(price);
});

pageSize.addEventListener("change", refresh);

refresh();

async function refresh() {
	showLoading();
	const page = await findAll();
	setTimeout(() => {
		hideLoading();
		updatePagination(page);
	}, Math.random() * 2000);
}

async function findAll() {
	const params = {
		page: pageNumber.value,
		size: pageSize.value
	};
	const url = new URL(`${BASE_URL}/findAll`);
	url.search = new URLSearchParams(params).toString();
	console.log(`%cFinding all accessory:\n${url}`, "color: #2980b9");
	const response = await fetch(url, {
		method: "GET",
		headers: {
			"Accept-Language": "vi",
			"Content-Type": "application/json"
		}
	});
	const page = await response.json();
	log("Found all accessory:", page, "#27ae60");
	showAccessories(page.content);
	return page;
}

function showAccessories(accessories) {
	tbody.innerHTML = "";
	for (const accessory of accessories) {
		accessory.price = FORMATTER.format(accessory.price);
		const row = tbody.insertRow();
		for (const key in accessory) {
			const node = document.createTextNode(accessory[key]);
			row.insertCell().appendChild(node);
		}

		const btnEdit = createButton("🖊️", function () {
			for (const key in accessory) {
				form[key].value = accessory[key];
			}
		});
		const btnDelete = createButton("❌", async function () {
			const confirmed = confirm("Do you want to delete this accessory?");
			if (confirmed) {
				showLoading();
				const ok = await deleteById(accessory.id);
				if (ok) {
					const page = await findAll();
					hideLoading();
					updatePagination(page);
				} else {
					hideLoading();
				}
			}
		});
		row.insertCell().append(btnEdit, btnDelete);
	}
}

function createButton(text, click) {
	const btn = document.createElement("button");
	btn.setAttribute("type", "button");
	const node = document.createTextNode(text);
	btn.appendChild(node);
	btn.addEventListener("click", click);
	return btn;
}

async function deleteById(id) {
	console.log(`%cDeleting accessory: ${id}`, "color: $2980b9");
	const response = await fetch(`${BASE_URL}/delete/${id}`, {
		method: "DELETE",
		headers: {
			"Accept-Language": "vi",
			"Content-Type": "application/json"
		}
	});
	console.log(`%cIs accessory (${id}) deleted: ${response.ok}`, "color: #27ae60");
	return response.ok;
}

async function save(accessory) {
	log("Saving accessory:", accessory, "#2980b9");
	const url = accessory.id
		? `${BASE_URL}/update/${accessory.id}`
		: `${BASE_URL}/create`;
	const method = accessory.id ? "PUT" : "POST";
	const response = await fetch(url, {
		method: method,
		headers: {
			"Accept-Language": "vi",
			"Content-Type": "application/json"
		},
		body: JSON.stringify(accessory)
	});
	return await response.json();
}

function updatePagination({ first, last, pageable, totalPages }) {
	const currentPage = pageable.pageNumber + 1;
	pageNumber.value = currentPage;
	pageSize.value = pageable.pageSize;
	if (first) {
		firstPage.setAttribute("disabled", "");
		prevPage.setAttribute("disabled", "");
	} else {
		firstPage.removeAttribute("disabled");
		prevPage.removeAttribute("disabled");
	}
	if (last) {
		nextPage.setAttribute("disabled", "");
		lastPage.setAttribute("disabled", "");
	} else {
		nextPage.removeAttribute("disabled");
		lastPage.removeAttribute("disabled");
	}
	const goToPage = page => () => {
		pageNumber.value = page;
		refresh();
	};
	pageNumber.onchange = refresh;
	firstPage.onclick = goToPage(1);
	prevPage.onclick = goToPage(currentPage - 1);
	nextPage.onclick = goToPage(currentPage + 1);
	lastPage.onclick = goToPage(totalPages);
}

function showLoading() {
	for (const input of inputs) {
		input.setAttribute("disabled", "");
	}
	for (const button of buttons) {
		button.setAttribute("disabled", "");
	}
	for (const select of selects) {
		select.setAttribute("disabled", "");
	}
	for (const loading of loadings) {
		loading.style.display = "grid";
	}
}

function hideLoading() {
	for (const input of inputs) {
		input.removeAttribute("disabled");
	}
	for (const button of buttons) {
		button.removeAttribute("disabled");
	}
	for (const select of selects) {
		select.removeAttribute("disabled");
	}
	for (const loading of loadings) {
		loading.style.display = "none";
	}
}

function log(prefix, object, color) {
	const json = JSON.stringify(object, undefined, 4);
	console.log(`%c${prefix}:\n${json}`, `color: ${color}`);
}
