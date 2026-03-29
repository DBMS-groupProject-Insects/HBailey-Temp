var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import supabase from "./config/supabaseClient.js";
function splitList(s) {
    return s.split(/[;,]/).map((x) => x.trim()).filter(Boolean);
}
function mapSupabaseRow(row) {
    var _a, _b, _c, _d, _e, _f, _g;
    const freq = Number((_a = row.frequency) !== null && _a !== void 0 ? _a : 0);
    return {
        _id: String((_b = row.insect_id) !== null && _b !== void 0 ? _b : ""),
        name: {
            common: String((_c = row.common_name) !== null && _c !== void 0 ? _c : ""),
            scientific: String((_d = row.scientific_name) !== null && _d !== void 0 ? _d : ""),
        },
        type: String((_e = row.category) !== null && _e !== void 0 ? _e : ""),
        lifespan: "—",
        wingbeat: freq,
        dimension: {
            size: row.size != null && String(row.size) !== "" ? (parseFloat(String(row.size)) || "—") : "—",
            wingspan: "—",
        },
        descriptor: {
            colours: splitList(String((_f = row.colors) !== null && _f !== void 0 ? _f : "")),
            features: splitList(String((_g = row.descriptors) !== null && _g !== void 0 ? _g : "")),
        },
    };
}
function normalizeJsonItem(raw) {
    var _a, _b, _c, _d, _e, _f, _g, _h;
    const name = raw.name;
    const dimension = raw.dimension;
    const descriptor = raw.descriptor;
    const colours = descriptor === null || descriptor === void 0 ? void 0 : descriptor.colours;
    const features = descriptor === null || descriptor === void 0 ? void 0 : descriptor.features;
    return {
        _id: String((_a = raw._id) !== null && _a !== void 0 ? _a : ""),
        name: {
            common: String((_b = name === null || name === void 0 ? void 0 : name.common) !== null && _b !== void 0 ? _b : ""),
            scientific: String((_c = name === null || name === void 0 ? void 0 : name.scientific) !== null && _c !== void 0 ? _c : ""),
        },
        type: String((_d = raw.type) !== null && _d !== void 0 ? _d : ""),
        lifespan: typeof raw.lifespan === "number" ? raw.lifespan : String((_e = raw.lifespan) !== null && _e !== void 0 ? _e : "—"),
        wingbeat: Number((_f = raw.wingbeat) !== null && _f !== void 0 ? _f : 0),
        dimension: {
            size: (_g = dimension === null || dimension === void 0 ? void 0 : dimension.size) !== null && _g !== void 0 ? _g : "—",
            wingspan: (_h = dimension === null || dimension === void 0 ? void 0 : dimension.wingspan) !== null && _h !== void 0 ? _h : "—",
        },
        descriptor: {
            colours: Array.isArray(colours) ? colours : splitList(String(colours !== null && colours !== void 0 ? colours : "")),
            features: Array.isArray(features) ? features : splitList(String(features !== null && features !== void 0 ? features : "")),
        },
    };
}
function fetchAllInsectRows() {
    return __awaiter(this, void 0, void 0, function* () {
        const base = window.SUPABASE_URL;
        const key = window.SUPABASE_ANON_KEY;
        if (!base || !key)
            throw new Error("Missing window.SUPABASE_URL or window.SUPABASE_ANON_KEY");
        const root = base.replace(/\/$/, "");
        const urlBase = `${root}/rest/v1/insect`;
        const pageSize = 1000;
        const all = [];
        let from = 0;
        for (;;) {
            const res = yield fetch(`${urlBase}?select=*`, {
                headers: {
                    apikey: key,
                    Authorization: `Bearer ${key}`,
                    Range: `${from}-${from + pageSize - 1}`,
                    Accept: "application/json",
                },
            });
            if (!res.ok) {
                const text = yield res.text();
                throw new Error(`${res.status} ${text}`);
            }
            const batch = (yield res.json());
            all.push(...batch);
            const cr = res.headers.get("Content-Range");
            if (batch.length < pageSize)
                break;
            from += pageSize;
            if (cr) {
                const totalMatch = cr.match(/\/(\d+)/);
                const total = totalMatch ? parseInt(totalMatch[1], 10) : null;
                if (total !== null && from >= total)
                    break;
            }
        }
        return all;
    });
}
function loadItems() {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const rows = yield fetchAllInsectRows();
            if (rows.length > 0)
                return rows.map(mapSupabaseRow);
        }
        catch (e) {
            console.warn("Supabase load failed, using insects.json", e);
        }
        const response = yield fetch("./insects.json");
        const raw = (yield response.json());
        return raw.map(normalizeJsonItem);
    });
}
export function loadBugs() {
    return __awaiter(this, void 0, void 0, function* () {
        const items = yield loadItems();
        let sortKey = "name";
        let sortAsc = true;
        let searchQuery = "";
        function buildAccordion(sorted) {
            let html = '<div class="accordion" id="bugsAccordion">';
            for (const item of sorted) {
                html += `<div class="accordion-item" id="${item._id}">`;
                html += `<h2 class="accordion-header">`;
                html += `<button class="accordion-button collapsed" type="button" data-bs-toggle="collapse" data-bs-target="#collapse-${item._id}">`;
                html += `<span class="me-3 fw-semibold">${item.name.common}</span>`;
                html += `<span class="text-muted">${item.wingbeat} Hz</span>`;
                html += `</button>`;
                html += `</h2>`;
                html += `<div id="collapse-${item._id}" class="accordion-collapse collapse" data-bs-parent="#bugsAccordion">`;
                html += `<div class="accordion-body">`;
                html += `<table class="table table-sm mb-2">`;
                html += `<thead><tr>`;
                html += `<th>Scientific Name</th>`;
                html += `<th>Type</th>`;
                html += `<th>Frequency (Hz)</th>`;
                html += `<th>Size (mm)</th>`;
                html += `<th>Colours</th>`;
                html += `<th>Characteristics</th>`;
                html += `</tr></thead>`;
                html += `<tbody><tr>`;
                html += `<td><em>${item.name.scientific}</em></td>`;
                html += `<td>${item.type}</td>`;
                html += `<td>${item.wingbeat}</td>`;
                html += `<td>${item.dimension.size}</td>`;
                html += `<td>${item.descriptor.colours.join(", ")}</td>`;
                html += `<td>${item.descriptor.features.join(", ")}</td>`;
                html += `</tr></tbody>`;
                html += `</table>`;
                html += `<div class="admin">`;
                html += `<button class="edit-btn btn btn-warning btn-sm me-1" data-id="${item._id}"><i class="bi bi-pencil"></i></button>`;
                html += `<button class="delete-btn btn btn-danger btn-sm" data-id="${item._id}"><i class="bi bi-trash"></i></button>`;
                html += `</div>`;
                html += `</div>`;
                html += `</div>`;
                html += `</div>`;
            }
            html += "</div>";
            return html;
        }
        function getSorted() {
            const q = searchQuery.toLowerCase();
            return [...items]
                .filter((a) => {
                if (!q)
                    return true;
                return a.name.common.toLowerCase().includes(q) || String(a.wingbeat).includes(q);
            })
                .sort((a, b) => {
                const valA = sortKey === "name" ? a.name.common.toLowerCase() : a.wingbeat;
                const valB = sortKey === "name" ? b.name.common.toLowerCase() : b.wingbeat;
                if (valA < valB)
                    return sortAsc ? -1 : 1;
                if (valA > valB)
                    return sortAsc ? 1 : -1;
                return 0;
            });
        }
        function updateSortButtons() {
            const icon = document.getElementById("sortDirIcon");
            if (icon)
                icon.className = sortAsc ? "bi bi-sort-up" : "bi bi-sort-down";
        }
        function renderAccordion() {
            const accordion = document.getElementById("accordion-container");
            accordion.innerHTML = buildAccordion(getSorted());
            updateSortButtons();
            attachButtons();
        }
        function attachButtons() {
            document.querySelectorAll(".edit-btn").forEach((button) => {
                button.addEventListener("click", () => {
                    const id = button.dataset.id;
                    const item = items.find((i) => i._id === id);
                    document.getElementById("editId").value = item._id;
                    document.getElementById("editCommonName").value = item.name.common;
                    document.getElementById("editScientificName").value = item.name.scientific;
                    document.getElementById("editType").value = item.type;
                    document.getElementById("editWingbeat").value = String(item.wingbeat);
                    document.getElementById("editSize").value = String(item.dimension.size);
                    document.getElementById("editColours").value = item.descriptor.colours.join(", ");
                    document.getElementById("editCharacteristics").value = item.descriptor.features.join(", ");
                    const modalEl = document.getElementById("editInsectModal");
                    const modal = new window.bootstrap.Modal(modalEl);
                    modal.show();
                });
            });
            document.querySelectorAll(".delete-btn").forEach((button) => {
                button.addEventListener("click", () => __awaiter(this, void 0, void 0, function* () {
                    const idRaw = button.dataset.id;
                    const insectId = Number.isNaN(Number(idRaw)) ? idRaw : Number(idRaw);
                    const { error } = yield supabase.from("insect").delete().eq("insect_id", insectId);
                    if (error) {
                        console.error(error);
                        alert(`Could not delete insect: ${error.message}`);
                        return;
                    }
                    yield loadBugs();
                }));
            });
        }
        document.querySelectorAll(".sort-key-item").forEach((item) => {
            item.addEventListener("click", (e) => {
                e.preventDefault();
                const key = item.dataset.sort;
                sortKey = key;
                sortAsc = true;
                (document.getElementById("sortLabel")).childNodes[0].textContent = key === "name" ? "Name " : "Frequency ";
                renderAccordion();
            });
        });
        document.getElementById("sortDirBtn").addEventListener("click", () => {
            sortAsc = !sortAsc;
            renderAccordion();
        });
        document.getElementById("searchInput").addEventListener("input", (e) => {
            searchQuery = e.target.value;
            renderAccordion();
        });
        renderAccordion();
    });
}
