import { loadBugs } from "./functions.js"

document.addEventListener("DOMContentLoaded", async () => {
    loadBugs();

    const modeToggleBtn = document.getElementById("modeToggleBtn");
    const createInsectButton = document.getElementById("saveInsectBtn");
        const saveEditBtn = document.getElementById("saveEditBtn");


    modeToggleBtn?.addEventListener("click", () => {
        const isUser = document.body.classList.toggle("user");
        modeToggleBtn.textContent = isUser ? "Admin Mode" : "User Mode";
    });

    saveEditBtn?.addEventListener("click", () => {
        const modalElement = document.getElementById("editInsectModal");

        const insect = {
            _id: (document.getElementById("editId") as HTMLInputElement).value,
            name: {
                common: (document.getElementById("editCommonName") as HTMLInputElement).value,
                scientific: (document.getElementById("editScientificName") as HTMLInputElement).value,
            },
            lifespan: Number((document.getElementById("editLifespan") as HTMLInputElement).value),
            wingbeat: Number((document.getElementById("editWingbeat") as HTMLInputElement).value),
            dimension: {
                size: Number((document.getElementById("editSize") as HTMLInputElement).value),
                wingspan: Number((document.getElementById("editWingspan") as HTMLInputElement).value),
            },
        };
        // REPLACE LINE BELOW TO API EDIT ENDPOINT
        console.log(JSON.stringify(insect, null, 2));

        // Hiding Modal
        if (modalElement) {
            const modal =
                (window as any).bootstrap.Modal.getInstance(modalElement) ||
                new (window as any).bootstrap.Modal(modalElement);
            modal.hide();
        }
    });

    createInsectButton?.addEventListener("click", () => {
        const form = document.getElementById("insectForm") as HTMLFormElement | null;
        const modalElement = document.getElementById("createInsectModal");

        const insect = {
            name: {
                common: (document.getElementById("createCommonName") as HTMLInputElement).value,
                scientific: (document.getElementById("createScientificName") as HTMLInputElement).value,
            },
            lifespan: Number((document.getElementById("createLifespan") as HTMLInputElement).value),
            wingbeat: Number((document.getElementById("createWingbeat") as HTMLInputElement).value),
            dimension: {
                size: Number((document.getElementById("createSize") as HTMLInputElement).value),
                wingspan: Number((document.getElementById("createWingspan") as HTMLInputElement).value),
            },
        };
        
        // REPLACE LINE BELOW TO API CREATE ENDPOINT
        console.log(JSON.stringify(insect, null, 2));

        // Resetting the form
        form?.reset();

        // Hiding Modal
        if (modalElement) {
            const modal =
                (window as any).bootstrap.Modal.getInstance(modalElement) ||
                new (window as any).bootstrap.Modal(modalElement);
            modal.hide();
        }
    });
})