import supabase from "./config/supabaseClient.js";

type Item = {
    _id: string;
    name: { common: string; scientific: string };
    type: string;
    lifespan: string | number;
    wingbeat: number;
    dimension: { size: string | number; wingspan: string | number };
    descriptor: { colours: string[]; features: string[] };
};

function splitList(s: string): string[] {
    return s.split(/[;,]/).map((x) => x.trim()).filter(Boolean);
}

function mapSupabaseRow(row: Record<string, unknown>): Item {
    const freq = Number(row.frequency ?? 0);
    return {
        _id: String(row.insect_id ?? ""),
        name: {
            common: String(row.common_name ?? ""),
            scientific: String(row.scientific_name ?? ""),
        },
        type: String(row.category ?? ""),
        lifespan: "—",
        wingbeat: freq,
        dimension: {
            size: row.size != null && String(row.size) !== "" ? String(row.size) : "—",
            wingspan: "—",
        },
        descriptor: {
            colours: splitList(String(row.colors ?? "")),
            features: splitList(String(row.descriptors ?? "")),
        },
    };
}

function normalizeJsonItem(raw: Record<string, unknown>): Item {
    const name = raw.name as Record<string, string> | undefined;
    const dimension = raw.dimension as Record<string, number> | undefined;
    const descriptor = raw.descriptor as { colours?: unknown; features?: unknown } | undefined;
    const colours = descriptor?.colours;
    const features = descriptor?.features;
    return {
        _id: String(raw._id ?? ""),
        name: {
            common: String(name?.common ?? ""),
            scientific: String(name?.scientific ?? ""),
        },
        type: String(raw.type ?? ""),
        lifespan: typeof raw.lifespan === "number" ? raw.lifespan : String(raw.lifespan ?? "—"),
        wingbeat: Number(raw.wingbeat ?? 0),
        dimension: {
            size: dimension?.size ?? "—",
            wingspan: dimension?.wingspan ?? "—",
        },
        descriptor: {
            colours: Array.isArray(colours) ? (colours as string[]) : splitList(String(colours ?? "")),
            features: Array.isArray(features) ? (features as string[]) : splitList(String(features ?? "")),
        },
    };
}

async function fetchAllInsectRows(): Promise<Record<string, unknown>[]> {
    const base = window.SUPABASE_URL;
    const key = window.SUPABASE_ANON_KEY;
    if (!base || !key) throw new Error("Missing window.SUPABASE_URL or window.SUPABASE_ANON_KEY");
    const root = base.replace(/\/$/, "");
    const urlBase = `${root}/rest/v1/insect`;
    const pageSize = 1000;
    const all: Record<string, unknown>[] = [];
    let from = 0;
    for (;;) {
        const res = await fetch(`${urlBase}?select=*`, {
            headers: {
                apikey: key,
                Authorization: `Bearer ${key}`,
                Range: `${from}-${from + pageSize - 1}`,
                Accept: "application/json",
            },
        });
        if (!res.ok) {
            const text = await res.text();
            throw new Error(`${res.status} ${text}`);
        }
        const batch = (await res.json()) as Record<string, unknown>[];
        all.push(...batch);
        const cr = res.headers.get("Content-Range");
        if (batch.length < pageSize) break;
        from += pageSize;
        if (cr) {
            const totalMatch = cr.match(/\/(\d+)/);
            const total = totalMatch ? parseInt(totalMatch[1], 10) : null;
            if (total !== null && from >= total) break;
        }
    }
    return all;
}

async function loadItems(): Promise<Item[]> {
    try {
        const rows = await fetchAllInsectRows();
        if (rows.length > 0) return rows.map(mapSupabaseRow);
    } catch (e) {
        console.warn("Supabase load failed, using insects.json", e);
    }
    const response = await fetch("./insects.json");
    const raw = (await response.json()) as Record<string, unknown>[];
    return raw.map(normalizeJsonItem);
}

export async function loadBugs() {
    const items: Item[] = await loadItems();

    let sortKey: "name" | "wingbeat" = "name";
    let sortAsc = true;
    let searchQuery = "";

    function buildAccordion(sorted: Item[]) {
        let html = '<div class="accordion" id="bugsAccordion">';
        for (const item of sorted) {
            html += `<div class="accordion-item" id="${item._id}">`;
            html +=     `<h2 class="accordion-header">`;
            html +=         `<button class="accordion-button collapsed" type="button" data-bs-toggle="collapse" data-bs-target="#collapse-${item._id}">`;
            html +=             `<span class="me-3 fw-semibold">${item.name.common}</span>`;
            html +=             `<span class="text-muted">${item.wingbeat} Hz</span>`;
            html +=         `</button>`;
            html +=     `</h2>`;
            html +=     `<div id="collapse-${item._id}" class="accordion-collapse collapse" data-bs-parent="#bugsAccordion">`;
            html +=         `<div class="accordion-body">`;
            html +=             `<table class="table table-sm mb-2">`;
            html +=                 `<thead><tr>`;
            html +=                     `<th>Scientific Name</th>`;
            html +=                     `<th>Type</th>`;
            html +=                     `<th>Lifespan (yrs)</th>`;
            html +=                     `<th>Frequency (Hz)</th>`;
            html +=                     `<th>Size (mm)</th>`;
            html +=                     `<th>Wingspan (mm)</th>`;
            html +=                     `<th>Colours</th>`;
            html +=                     `<th>Characteristics</th>`;
            html +=                 `</tr></thead>`;
            html +=                 `<tbody><tr>`;
            html +=                     `<td><em>${item.name.scientific}</em></td>`;
            html +=                     `<td>${item.type}</td>`;
            html +=                     `<td>${item.lifespan}</td>`;
            html +=                     `<td>${item.wingbeat}</td>`;
            html +=                     `<td>${item.dimension.size}</td>`;
            html +=                     `<td>${item.dimension.wingspan}</td>`;
            html +=                     `<td>${item.descriptor.colours.join(", ")}</td>`;
            html +=                     `<td>${item.descriptor.features.join(", ")}</td>`;
            html +=                 `</tr></tbody>`;
            html +=             `</table>`;
            html +=             `<div class="admin">`;
            html +=                 `<button class="edit-btn btn btn-warning btn-sm me-1" data-id="${item._id}"><i class="bi bi-pencil"></i></button>`;
            html +=                 `<button class="delete-btn btn btn-danger btn-sm" data-id="${item._id}"><i class="bi bi-trash"></i></button>`;
            html +=             `</div>`;
            html +=         `</div>`;
            html +=     `</div>`;
            html += `</div>`;
        }
        html += "</div>";
        return html;
    }

    function getSorted() {
        const q = searchQuery.toLowerCase();
        return [...items]
            .filter((a) => {
                if (!q) return true;
                return a.name.common.toLowerCase().includes(q) || String(a.wingbeat).includes(q);
            })
            .sort((a, b) => {
                const valA = sortKey === "name" ? a.name.common.toLowerCase() : a.wingbeat;
                const valB = sortKey === "name" ? b.name.common.toLowerCase() : b.wingbeat;
                if (valA < valB) return sortAsc ? -1 : 1;
                if (valA > valB) return sortAsc ? 1 : -1;
                return 0;
            });
    }

    function updateSortButtons() {
        const icon = document.getElementById("sortDirIcon");
        if (icon) icon.className = sortAsc ? "bi bi-sort-up" : "bi bi-sort-down";
    }

    function renderAccordion() {
        const accordion = document.getElementById("accordion-container")!;
        accordion.innerHTML = buildAccordion(getSorted());
        updateSortButtons();
        attachButtons();
    }

    function attachButtons() {
        document.querySelectorAll(".edit-btn").forEach((button) => {
            button.addEventListener("click", () => {
                const id = (button as HTMLElement).dataset.id!;
                const item = items.find((i) => i._id === id)!;

                (document.getElementById("editId") as HTMLInputElement).value = item._id;
                (document.getElementById("editCommonName") as HTMLInputElement).value = item.name.common;
                (document.getElementById("editScientificName") as HTMLInputElement).value = item.name.scientific;
                (document.getElementById("editType") as HTMLInputElement).value = item.type;
                (document.getElementById("editLifespan") as HTMLInputElement).value = String(item.lifespan);
                (document.getElementById("editWingbeat") as HTMLInputElement).value = String(item.wingbeat);
                (document.getElementById("editSize") as HTMLInputElement).value = String(item.dimension.size);
                (document.getElementById("editWingspan") as HTMLInputElement).value = String(item.dimension.wingspan);
                (document.getElementById("editColours") as HTMLInputElement).value = item.descriptor.colours.join(", ");
                (document.getElementById("editCharacteristics") as HTMLInputElement).value = item.descriptor.features.join(", ");

                const modalEl = document.getElementById("editInsectModal")!;
                const modal = new (window as any).bootstrap.Modal(modalEl);
                modal.show();
            });
        });

        document.querySelectorAll(".delete-btn").forEach((button) => {
            button.addEventListener("click", async () => {
                const idRaw = (button as HTMLElement).dataset.id!;
                const insectId: string | number = Number.isNaN(Number(idRaw)) ? idRaw : Number(idRaw);

                const { error } = await supabase.from("insect").delete().eq("insect_id", insectId);
                if (error) {
                    console.error(error);
                    alert(`Could not delete insect: ${error.message}`);
                    return;
                }

                await loadBugs();
            });
        });
    }

    document.querySelectorAll(".sort-key-item").forEach((item) => {
        item.addEventListener("click", (e) => {
            e.preventDefault();
            const key = (item as HTMLElement).dataset.sort as "name" | "wingbeat";
            sortKey = key;
            sortAsc = true;
            (document.getElementById("sortLabel")!).childNodes[0].textContent = key === "name" ? "Name " : "Frequency ";
            renderAccordion();
        });
    });

    document.getElementById("sortDirBtn")!.addEventListener("click", () => {
        sortAsc = !sortAsc;
        renderAccordion();
    });

    document.getElementById("searchInput")!.addEventListener("input", (e) => {
        searchQuery = (e.target as HTMLInputElement).value;
        renderAccordion();
    });

    renderAccordion();
}

