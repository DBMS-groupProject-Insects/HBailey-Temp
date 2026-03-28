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
import { loadBugs } from "./functions.js";
/** Maps create/edit modal fields to `insect` table columns (shared by insert + update). */
function buildInsectRowFromForm(prefix) {
    const common = document.getElementById(`${prefix}CommonName`).value.trim();
    const scientific = document.getElementById(`${prefix}ScientificName`).value.trim();
    const category = document.getElementById(`${prefix}Type`).value.trim();
    const lifespan = Number(document.getElementById(`${prefix}Lifespan`).value);
    const frequency = Number(document.getElementById(`${prefix}Wingbeat`).value);
    const sizeMm = Number(document.getElementById(`${prefix}Size`).value);
    const wingspanMm = Number(document.getElementById(`${prefix}Wingspan`).value);
    const colours = document.getElementById(`${prefix}Colours`).value;
    const characteristics = document.getElementById(`${prefix}Characteristics`).value;
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
    if (Number.isFinite(lifespan) && lifespan > 0)
        descParts.push(`lifespan ${lifespan} yrs`);
    if (Number.isFinite(wingspanMm) && wingspanMm > 0)
        descParts.push(`wingspan ${wingspanMm} mm`);
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
document.addEventListener("DOMContentLoaded", () => __awaiter(void 0, void 0, void 0, function* () {
    yield loadBugs();
    const modeToggleBtn = document.getElementById("modeToggleBtn");
    const createInsectButton = document.getElementById("saveInsectBtn");
    const saveEditBtn = document.getElementById("saveEditBtn");
    modeToggleBtn === null || modeToggleBtn === void 0 ? void 0 : modeToggleBtn.addEventListener("click", () => {
        const isUser = document.body.classList.toggle("user");
        modeToggleBtn.textContent = isUser ? "Admin Mode" : "User Mode";
    });
    saveEditBtn === null || saveEditBtn === void 0 ? void 0 : saveEditBtn.addEventListener("click", () => __awaiter(void 0, void 0, void 0, function* () {
        const modalElement = document.getElementById("editInsectModal");
        const idRaw = document.getElementById("editId").value;
        const insectId = Number.isNaN(Number(idRaw)) ? idRaw : Number(idRaw);
        const row = buildInsectRowFromForm("edit");
        if (!row)
            return;
        const { data, error } = yield supabase
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
            const modal = window.bootstrap.Modal.getInstance(modalElement) ||
                new window.bootstrap.Modal(modalElement);
            modal.hide();
        }
        yield loadBugs();
    }));
    createInsectButton === null || createInsectButton === void 0 ? void 0 : createInsectButton.addEventListener("click", () => __awaiter(void 0, void 0, void 0, function* () {
        const form = document.getElementById("insectForm");
        const modalElement = document.getElementById("createInsectModal");
        const row = buildInsectRowFromForm("create");
        if (!row)
            return;
        const { data, error } = yield supabase.from("insect").insert([row]).select();
        if (error) {
            console.error(error);
            alert(`Could not save insect: ${error.message}`);
            return;
        }
        console.log("inserted", data);
        form === null || form === void 0 ? void 0 : form.reset();
        if (modalElement) {
            const modal = window.bootstrap.Modal.getInstance(modalElement) ||
                new window.bootstrap.Modal(modalElement);
            modal.hide();
        }
        yield loadBugs();
    }));
}));
