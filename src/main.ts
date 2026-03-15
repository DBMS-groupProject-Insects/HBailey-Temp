document.addEventListener("DOMContentLoaded", async () => {
    const modeToggleBtn = document.getElementById("modeToggleBtn");
    // const createInsectModal = document.getElementById("createInsectModal");
    const createInsectButton = document.getElementById("saveInsectBtn");

    modeToggleBtn?.addEventListener("click", () => {
        const isUser = document.body.classList.toggle("user");
        modeToggleBtn.textContent = isUser ? "Admin Mode" : "User Mode";
    });

    createInsectButton?.addEventListener("click", () => {
        const typeSelect = document.getElementById("insectType") as HTMLSelectElement | null;

        const form = document.getElementById("insectForm") as HTMLFormElement | null;
        const modalElement = document.getElementById("createInsectModal");
        
        if (!typeSelect) {
            alert("Form elements missing");
            return;
        }

        const type = typeSelect.value;
        console.log(type)
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