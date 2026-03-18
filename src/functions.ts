export async function loadBugs() {
    // REPLACE LINE BELOW TO API GET ENDPOINT
    const response = await fetch("./insects.json");
        const items: {
            _id: string;
            name: { common: string; scientific: string };
            lifespan: number;
            wingbeat: number;
            dimension: { size: number; wingspan: number };
        }[] = await response.json();

    const list = document.getElementById("list")
    let html = ''
    html += '<table style="width: 100%" class="table table-bordered table-hover" id="bugs">'
    html +=     '<thead><tr>'
    html +=         '<th>Common Name</th>'
    html +=         '<th>Scientific Name</th>'
    html +=         '<th>Lifespan (yrs)</th>'
    html +=         '<th>Frequency (Hz)</th>'
    html +=         '<th>Size (mm)</th>'
    html +=         '<th>Wingspan (mm)</th>'
    html +=         '<th class="admin">Actions</th>'
    html +=     '</tr></thead>'
    html +=     '<tbody>'
    for (const item of items) {
        html += `<tr id=${item._id}>`
        html +=     `<td>${item.name.common}</td>`
        html +=     `<td><em>${item.name.scientific}</em></td>`
        html +=     `<td>${item.lifespan}</td>`
        html +=     `<td>${item.wingbeat}</td>`
        html +=     `<td>${item.dimension.size}</td>`
        html +=     `<td>${item.dimension.wingspan}</td>`
        html +=     '<td class="admin">'
        html +=         `<button class="edit-btn btn btn-warning btn-sm me-1" data-id="${item._id}"><i class="bi bi-pencil"></i></button>`
        html +=         `<button class="delete-btn btn btn-danger btn-sm" data-id="${item._id}"><i class="bi bi-trash"></i></button>`
        html +=     '</td>'
        html += '</tr>'
    }
    html +=     '</tbody>'
    html += '</table>'

    if(list){
        list.innerHTML = html
    }
    const editButtons = document.querySelectorAll(".edit-btn");
    const deleteButtons = document.querySelectorAll(".delete-btn");

    // Edit buttons: populate and open the edit modal
    editButtons.forEach((button) => {
        button.addEventListener("click", () => {
            const id = (button as HTMLElement).dataset.id!;
            const item = items.find(i => i._id === id)!;

            (document.getElementById("editId") as HTMLInputElement).value = item._id;
            (document.getElementById("editCommonName") as HTMLInputElement).value = item.name.common;
            (document.getElementById("editScientificName") as HTMLInputElement).value = item.name.scientific;
            (document.getElementById("editLifespan") as HTMLInputElement).value = String(item.lifespan);
            (document.getElementById("editWingbeat") as HTMLInputElement).value = String(item.wingbeat);
            (document.getElementById("editSize") as HTMLInputElement).value = String(item.dimension.size);
            (document.getElementById("editWingspan") as HTMLInputElement).value = String(item.dimension.wingspan);

            const modalEl = document.getElementById("editInsectModal")!;
            const modal = new (window as any).bootstrap.Modal(modalEl);
            modal.show();
        });
    });

    // Delete buttons added
    deleteButtons.forEach((button) => {
        button.addEventListener("click", async (event) => {
            // REPLACE LINE BELOW TO API DELETE ENDPOINT
            console.log('delete')
        });
    });
}