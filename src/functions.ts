export async function loadBugs() {
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
    html +=         '<th class="admin"></th>'
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
        html +=     `<td class="admin"><button class="delete-btn" id=${item._id}>Delete</button></td>`
        html += '</tr>'
    }
    html +=     '</tbody>'
    html += '</table>'

    if(list){
        list.innerHTML = html
    }
    const buttons = document.querySelectorAll(".delete-btn");

    // Delete buttons added
    // buttons.forEach((button) => {
    //     button.addEventListener("click", async (event) => {
    //         deleteById(event)
    //     });
    // });
}