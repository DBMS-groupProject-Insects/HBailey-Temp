import supabase from "./config/supabaseClient.js";
import { loadBugs } from "./functions.js";

/** Maps create/edit modal fields to `insect` table columns (shared by insert + update). */
function buildInsectRowFromForm(prefix: "create" | "edit"): Record<string, string | number> | null {
    const common = (document.getElementById(`${prefix}CommonName`) as HTMLInputElement).value.trim();
    const scientific = (document.getElementById(`${prefix}ScientificName`) as HTMLInputElement).value.trim();
    const category = (document.getElementById(`${prefix}Type`) as HTMLInputElement).value.trim();
    const frequency = Number((document.getElementById(`${prefix}Wingbeat`) as HTMLInputElement).value);
    const sizeMm = Number((document.getElementById(`${prefix}Size`) as HTMLInputElement).value);

    const colours = (document.getElementById(`${prefix}Colours`) as HTMLInputElement).value;
    const characteristics = (document.getElementById(`${prefix}Characteristics`) as HTMLInputElement).value;

    if (!common) {
        alert("Common name is required.");
        return null;
    }
    if (!Number.isFinite(frequency)) {
        alert("Frequency (Hz) must be a valid number.");
        return null;
    }

    const sizeStr = Number.isFinite(sizeMm) && sizeMm > 0 ? `${sizeMm}mm` : "";
    const colorsNormalized = colours
        .split(/[;,]/)
        .map((s) => s.trim())
        .filter(Boolean)
        .join("; ");
    const descParts = characteristics
        .split(/[;,]/)
        .map((s) => s.trim())
        .filter(Boolean);
    const descriptorsNormalized = descParts.join("; ");

    return {
        common_name: common,
        scientific_name: scientific,
        category: category || "Unknown",
        size: sizeStr,
        colors: colorsNormalized,
        descriptors: descriptorsNormalized,
        frequency,
    };
}

document.addEventListener("DOMContentLoaded", async () => {
    await loadBugs();

    const modeToggleBtn = document.getElementById("modeToggleBtn");
    const createInsectButton = document.getElementById("saveInsectBtn");
        const saveEditBtn = document.getElementById("saveEditBtn");


    modeToggleBtn?.addEventListener("click", () => {
        const isUser = document.body.classList.toggle("user");
        modeToggleBtn.textContent = isUser ? "Admin Mode" : "User Mode";
    });

    saveEditBtn?.addEventListener("click", async () => {
        const modalElement = document.getElementById("editInsectModal");

        const idRaw = (document.getElementById("editId") as HTMLInputElement).value;
        const insectId: string | number = Number.isNaN(Number(idRaw)) ? idRaw : Number(idRaw);

        const row = buildInsectRowFromForm("edit");
        if (!row) return;

        const { data, error } = await supabase
            .from("insect")
            .update(row)
            .eq("insect_id", insectId)
            .select();

        if (error) {
            console.error(error);
            alert(`Could not update insect: ${error.message}`);
            return;
        }

        console.log("updated", data);

        if (modalElement) {
            const modal =
                (window as any).bootstrap.Modal.getInstance(modalElement) ||
                new (window as any).bootstrap.Modal(modalElement);
            modal.hide();
        }

        await loadBugs();
    });

    createInsectButton?.addEventListener("click", async () => {
        const form = document.getElementById("insectForm") as HTMLFormElement | null;
        const modalElement = document.getElementById("createInsectModal");

        const row = buildInsectRowFromForm("create");
        if (!row) return;

        const { data, error } = await supabase.from("insect").insert([row]).select();
        if (error) {
            console.error(error);
            alert(`Could not save insect: ${error.message}`);
            return;
        }

        console.log("inserted", data);

        form?.reset();

        if (modalElement) {
            const modal =
                (window as any).bootstrap.Modal.getInstance(modalElement) ||
                new (window as any).bootstrap.Modal(modalElement);
            modal.hide();
        }

        await loadBugs();
    });
})