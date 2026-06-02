/* ==========================================================================
   Quality Ironworks Material Request Portal - Logic Controller
   ========================================================================== */

// 1. Projects Database (68 parsed folders from the user's images)
const projectsDatabase = [
    { number: "10000", name: "QIW Internal Projects" },
    { number: "43004", name: "Katy Trail" },
    { number: "43007", name: "Addison Heights" },
    { number: "43013", name: "OHT Stemmons" },
    { number: "43015", name: "Eviva @ Trinity Mills" },
    { number: "44003", name: "Loyd Park Phase II" },
    { number: "44005", name: "HS RB3.3" },
    { number: "44007", name: "Castle Hills PH2" },
    { number: "44008", name: "Castle Hills PH1" },
    { number: "44011", name: "The Juniper" },
    { number: "44013", name: "Jefferson Ederville" },
    { number: "44014", name: "Park Lane (current)" },
    { number: "44014-HOLD", name: "Park Lane (Hold)" },
    { number: "44016", name: "Hartwood Square" },
    { number: "44017", name: "The Ambassador" },
    { number: "44018", name: "Northwest Village" },
    { number: "44022", name: "Cypress Creek" },
    { number: "44024", name: "UT Whitis" },
    { number: "44027", name: "Las Colinas" },
    { number: "44028", name: "Dallas Uptown" },
    { number: "44029", name: "Cabana" },
    { number: "44031", name: "Palladium Carver" },
    { number: "44032", name: "Walsh Heights" },
    { number: "45001", name: "Riverfront PH 2" },
    { number: "45002", name: "Custer 121 IN" },
    { number: "45004", name: "Culpepper" },
    { number: "45005", name: "Custer 121 MF" },
    { number: "45006", name: "Custer 121 TH" },
    { number: "45007", name: "The Caroline" },
    { number: "45008", name: "Ash 1" },
    { number: "45009", name: "Ash 2" },
    { number: "45010", name: "HS Expansion" },
    { number: "45011", name: "Thousand Oaks" },
    { number: "45012", name: "Viridian III" },
    { number: "45014", name: "Project X - West" },
    { number: "45016", name: "Trailhead" },
    { number: "45017", name: "Endeavor TCU" },
    { number: "45018", name: "Rosewood Southstone" },
    { number: "45019", name: "Lakewood CC" },
    { number: "45022", name: "Gordon Highlander" },
    { number: "45023", name: "The Grove (Frisco)" },
    { number: "45025", name: "Shiloh Place" },
    { number: "45026", name: "Kirbybrook TH" },
    { number: "45028", name: "Viridain IV TH" },
    { number: "45029", name: "DFW Hyatt House" },
    { number: "45031", name: "Fields West Block D" },
    { number: "45032", name: "Fields West Block E" },
    { number: "45033", name: "Fields West Block H" },
    { number: "45034", name: "Highland Springs RB3.4" },
    { number: "45035", name: "UTSW FW" },
    { number: "45036", name: "Palladium Buckner Station" },
    { number: "45037", name: "930 Military Parkway" },
    { number: "45038", name: "SW Parkway" },
    { number: "45039", name: "Riverfront Ph 1" },
    { number: "45040", name: "Aurora @ Firefly Park" },
    { number: "45043", name: "OHT Rowlett" },
    { number: "45044", name: "Project X - East ULU" },
    { number: "45045", name: "Fields West Block J" },
    { number: "45046", name: "2220 S. Ervay St" },
    { number: "45047", name: "Frisco Fresh (Freemont Fresh)" },
    { number: "45049", name: "805 Elm 711 Elm Projects" },
    { number: "45050", name: "Inwood Senior Living" },
    { number: "45051", name: "Arlington Stephens" },
    { number: "45054", name: "Morgan Hill - Canopies" },
    { number: "46000", name: "Polk Street Residences" },
    { number: "46001", name: "Jefferson Eden Village" },
    { number: "46002", name: "Restland Funeral Home" },
    { number: "46005", name: "Westdale Deep Ellum" },
    { number: "Custom", name: "Custom Project..." }
];

// 2. Line Items State
let lineItems = [];

// 3. Document Ready Setup
document.addEventListener("DOMContentLoaded", () => {
    initializeFormDefaults();
    buildJobDropdown();
    setupEventListeners();
    updateLivePreview();
});

// Initialize date inputs and other form fields
function initializeFormDefaults() {
    // Set Request Date default to today (local system timezone)
    const today = new Date();
    const yyyy = today.getFullYear();
    const mm = String(today.getMonth() + 1).padStart(2, '0');
    const dd = String(today.getDate()).padStart(2, '0');
    const formattedToday = `${yyyy}-${mm}-${dd}`;
    
    document.getElementById("requestDate").value = formattedToday;
    
    // Refresh table preview with empty default rows
    renderPreviewTable();
}

// Build the Job Selection dropdown from our database
function buildJobDropdown() {
    const jobSelect = document.getElementById("jobNumber");
    
    // Sort projects by number (except Custom at the end)
    const sortedProjects = [...projectsDatabase].sort((a, b) => {
        if (a.number === 'Custom') return 1;
        if (b.number === 'Custom') return -1;
        return a.number.localeCompare(b.number);
    });

    sortedProjects.forEach(proj => {
        const opt = document.createElement("option");
        opt.value = proj.number;
        opt.textContent = `${proj.number} - ${proj.name}`;
        jobSelect.appendChild(opt);
    });
}

// Setup Event Listeners across the SPA
function setupEventListeners() {
    const form = document.getElementById("materialRequestForm");
    const jobSelect = document.getElementById("jobNumber");
    const categorySelect = document.getElementById("categoryName");
    
    // Listen for changes on standard inputs to sync live preview
    const inputsToSync = [
        "requestDate", "deliveryDate", "subcategoryName", 
        "productFinish", "reason", "customJobNumber", "customJobName", "customCategoryName"
    ];
    
    inputsToSync.forEach(id => {
        document.getElementById(id).addEventListener("input", updateLivePreview);
    });

    // Job Selection Change Handler
    jobSelect.addEventListener("change", (e) => {
        const val = e.target.value;
        const customJobGroup = document.getElementById("customJobGroup");
        const jobNameInput = document.getElementById("jobName");
        const customJobNum = document.getElementById("customJobNumber");
        const customJobName = document.getElementById("customJobName");
        
        if (val === "Custom") {
            // Reveal custom fields
            customJobGroup.classList.remove("hidden");
            customJobGroup.classList.add("open");
            customJobNum.required = true;
            customJobName.required = true;
            jobNameInput.value = "Custom";
        } else {
            // Hide and clear custom fields
            customJobGroup.classList.remove("open");
            setTimeout(() => {
                if (!customJobGroup.classList.contains("open")) customJobGroup.classList.add("hidden");
            }, 350);
            customJobNum.required = false;
            customJobName.required = false;
            customJobNum.value = "";
            customJobName.value = "";
            
            // Map name automatically
            const matchingJob = projectsDatabase.find(j => j.number === val);
            jobNameInput.value = matchingJob ? matchingJob.name : "";
        }
        updateLivePreview();
    });

    // Category Change Handler
    categorySelect.addEventListener("change", (e) => {
        const val = e.target.value;
        const customCategoryGroup = document.getElementById("customCategoryGroup");
        const customCatName = document.getElementById("customCategoryName");
        
        if (val === "Custom") {
            customCategoryGroup.classList.remove("hidden");
            customCategoryGroup.classList.add("open");
            customCatName.required = true;
        } else {
            customCategoryGroup.classList.remove("open");
            setTimeout(() => {
                if (!customCategoryGroup.classList.contains("open")) customCategoryGroup.classList.add("hidden");
            }, 350);
            customCatName.required = false;
            customCatName.value = "";
        }
        updateLivePreview();
    });

    // Location Radio group change
    document.getElementsByName("location").forEach(rad => {
        rad.addEventListener("change", updateLivePreview);
    });

    // Value matrix radio cards change
    document.getElementsByName("valueConfig").forEach(rad => {
        rad.addEventListener("change", updateLivePreview);
    });

    // Dynamic Items Builder: Add Item trigger
    document.getElementById("addItemBtn").addEventListener("click", () => {
        addItemFromBuilder();
    });

    // Trigger forms validation on enter inside builder fields
    const builderInputs = ["itemPcs", "itemDesc", "itemFeet", "itemInches"];
    builderInputs.forEach(id => {
        document.getElementById(id).addEventListener("keypress", (e) => {
            if (e.key === "Enter") {
                e.preventDefault();
                addItemFromBuilder();
            }
        });
    });

    // Document Action triggers
    document.getElementById("downloadPdfBtn").addEventListener("click", () => {
        if (validateForm()) {
            downloadMaterialRequestPDF();
        }
    });

    document.getElementById("emailBtn").addEventListener("click", () => {
        if (validateForm()) {
            openEmailWorkflow();
        }
    });

    // Theme Toggle Trigger
    document.getElementById("themeToggle").addEventListener("click", () => {
        const body = document.body;
        const icon = document.querySelector("#themeToggle i");
        body.classList.toggle("light-theme");
        
        if (body.classList.contains("light-theme")) {
            icon.className = "ph-bold ph-sun";
        } else {
            icon.className = "ph-bold ph-moon";
        }
    });

    // User Guide Modal controls
    const guideModal = document.getElementById("userGuideModal");
    document.getElementById("userGuideBtn").addEventListener("click", () => {
        guideModal.classList.remove("hidden");
    });
    document.getElementById("userGuideBannerBtn").addEventListener("click", () => {
        guideModal.classList.remove("hidden");
    });
    document.getElementById("closeUserGuideModal").addEventListener("click", () => {
        guideModal.classList.add("hidden");
    });
    guideModal.addEventListener("click", (e) => {
        if (e.target === guideModal) {
            guideModal.classList.add("hidden");
        }
    });

    // User Guide Tabs trigger
    const tabBtns = document.querySelectorAll(".modal-tabs .tab-btn");
    tabBtns.forEach(btn => {
        btn.addEventListener("click", () => {
            tabBtns.forEach(b => b.classList.remove("active"));
            document.querySelectorAll(".tab-content").forEach(tc => tc.classList.remove("active"));
            
            btn.classList.add("active");
            document.getElementById(btn.dataset.tab).classList.add("active");
        });
    });

    // (Guide downloads handled directly via HTML anchors for offline compatibility)

    // Standard Document sizing Fit previews
    document.getElementById("btnPreviewCallouts").addEventListener("click", () => {
        alert("The guide is rendered natively in HTML with high fidelity. You can scroll through the interactive view below.");
    });
    document.getElementById("btnPreviewParts").addEventListener("click", () => {
        alert("The guide is rendered natively in HTML with high fidelity. You can scroll through the interactive view below.");
    });

    // Email workflow modal controls
    const emailModal = document.getElementById("emailPromptModal");
    document.getElementById("cancelEmailPrompt").addEventListener("click", () => {
        emailModal.classList.add("hidden");
    });
    document.getElementById("btnEmailDirect").addEventListener("click", () => {
        emailModal.classList.add("hidden");
        triggerEmailLaunch();
    });
    document.getElementById("btnEmailWithPreview").addEventListener("click", () => {
        emailModal.classList.add("hidden");
        // Scroll right side Live Preview into view for they to review
        document.querySelector(".panel-preview").scrollIntoView({ behavior: "smooth" });
        // Flash a subtle border border highlight
        const sheet = document.getElementById("requestDocument");
        sheet.style.boxShadow = "0 0 20px #ff7b00";
        setTimeout(() => {
            sheet.style.boxShadow = "";
        }, 1500);
        
        // Setup a temporary floater button to trigger dispatch after reviewing
        setTimeout(() => {
            if (confirm("Sheet previewed! Ready to dispatch email?")) {
                triggerEmailLaunch();
            }
        }, 800);
    });

    // Close Email Instructions Helper modal
    const emailHelperModal = document.getElementById("emailHelperModal");
    document.getElementById("closeEmailHelperBtn").addEventListener("click", () => {
        emailHelperModal.classList.add("hidden");
    });
    emailHelperModal.addEventListener("click", (e) => {
        if (e.target === emailHelperModal) {
            emailHelperModal.classList.add("hidden");
        }
    });
}

// Check and validate required fields in the form
function validateForm() {
    const form = document.getElementById("materialRequestForm");
    
    // Check elements HTML5 validity
    if (!form.checkValidity()) {
        form.reportValidity();
        return false;
    }
    
    // Extra validation: Needs at least 1 line item
    if (lineItems.length === 0) {
        alert("Please add at least one item to your Material Request using the line item builder.");
        document.getElementById("itemDesc").focus();
        return false;
    }
    
    return true;
}

// Add Item from Form Builder into local list array
function addItemFromBuilder() {
    const pcsInput = document.getElementById("itemPcs");
    const shapeSelect = document.getElementById("itemShape");
    const descInput = document.getElementById("itemDesc");
    const feetInput = document.getElementById("itemFeet");
    const inchesInput = document.getElementById("itemInches");
    
    const pcs = parseInt(pcsInput.value);
    const shape = shapeSelect.value;
    const desc = descInput.value.trim();
    const feet = parseInt(feetInput.value) || 0;
    const inches = parseInt(inchesInput.value) || 0;
    
    // Validate builder inputs
    if (!pcs || pcs < 1) {
        alert("Please enter a valid number of pieces (1 or more).");
        pcsInput.focus();
        return;
    }
    if (!shape) {
        alert("Please select a shape from the dropdown list.");
        shapeSelect.focus();
        return;
    }
    if (!desc) {
        alert("Please enter the dimension or description.");
        descInput.focus();
        return;
    }
    if (feet < 0 || inches < 0 || inches > 11) {
        alert("Please enter a valid length (inches must be between 0 and 11).");
        inchesInput.focus();
        return;
    }
    
    // Format description text for PDF drawing & preview
    let formattedDesc = "";
    if (shape === "QIW") {
        const cleanDim = desc.replace(/^QIW-?\s*/i, "").trim();
        formattedDesc = `QIW-${cleanDim}`;
    } else if (shape === "BY") {
        const cleanDim = desc.replace(/^BY\s+/i, "").trim();
        formattedDesc = `BY ${cleanDim}`;
    } else {
        const cleanDim = desc.trim();
        // If the dimension starts with the shape prefix (e.g. "W8x10" or "W 8x10"), don't duplicate the shape prefix
        const regex = new RegExp("^" + shape + "\\b", "i");
        const regexNoSpace = new RegExp("^" + shape + "\\d", "i");
        if (regex.test(cleanDim) || regexNoSpace.test(cleanDim)) {
            formattedDesc = cleanDim;
        } else {
            formattedDesc = `${shape} ${cleanDim}`;
        }
    }
    
    // Push to state array
    lineItems.push({
        pcs: pcs,
        shape: shape,
        dimension: desc,
        desc: formattedDesc,
        feet: feet,
        inches: inches
    });
    
    // Clear builder fields
    pcsInput.value = "";
    shapeSelect.value = "";
    descInput.value = "";
    feetInput.value = "";
    inchesInput.value = "";
    
    // Re-render UI list & sheet table
    renderItemsList();
    renderPreviewTable();
    updateItemCountBadge();
    
    // Focus pcs input for rapid consecutive adding
    pcsInput.focus();
}

// Delete item row from local state
function deleteLineItem(index) {
    lineItems.splice(index, 1);
    renderItemsList();
    renderPreviewTable();
    updateItemCountBadge();
}

// Update the numerical item badge in form
function updateItemCountBadge() {
    const badge = document.getElementById("itemCountBadge");
    badge.textContent = `${lineItems.length} Item${lineItems.length !== 1 ? 's' : ''}`;
}

// Render the items list on the form panel
function renderItemsList() {
    const listContainer = document.getElementById("addedItemsList");
    listContainer.innerHTML = "";
    
    if (lineItems.length === 0) {
        listContainer.innerHTML = `<li class="empty-list-msg">No items added yet. Formulate items using the builder above.</li>`;
        return;
    }
    
    lineItems.forEach((item, index) => {
        const li = document.createElement("li");
        li.className = "item-list-row";
        
        // Formatted length label
        const lenText = (item.feet > 0 || item.inches > 0) 
            ? `${item.feet}'-${item.inches}"` 
            : 'N/A';
            
        li.innerHTML = `
            <span class="item-number">${index + 1}</span>
            <span class="item-qty-lbl">${item.pcs} pcs</span>
            <span class="item-desc-txt">${item.desc}</span>
            <span class="item-len-lbl"><i class="ph ph-ruler"></i> ${lenText}</span>
            <button type="button" class="item-delete-btn" title="Remove item" onclick="deleteLineItem(${index})">
                <i class="ph-bold ph-trash"></i>
            </button>
        `;
        listContainer.appendChild(li);
    });
}

// Render the Items table inside the Live PDF sheet
function renderPreviewTable() {
    const tbody = document.getElementById("previewTableBody");
    tbody.innerHTML = "";
    
    // Render our added items
    lineItems.forEach((item, index) => {
        const tr = document.createElement("tr");
        tr.innerHTML = `
            <td></td>
            <td></td>
            <td></td>
            <td>${item.pcs}</td>
            <td class="col-desc-bottom">${item.desc}</td>
            <td>${item.feet > 0 || item.inches > 0 ? item.feet : '-'}</td>
            <td>${item.feet > 0 || item.inches > 0 ? item.inches : '-'}</td>
            <td></td>
        `;
        tbody.appendChild(tr);
    });
    
    // Pad the table with empty yellow rows up to exactly 8 rows matching the image
    const minRows = 8;
    if (lineItems.length < minRows) {
        const padCount = minRows - lineItems.length;
        for (let i = 0; i < padCount; i++) {
            const tr = document.createElement("tr");
            tr.innerHTML = `
                <td></td>
                <td></td>
                <td></td>
                <td></td>
                <td></td>
                <td></td>
                <td></td>
                <td></td>
            `;
            tbody.appendChild(tr);
        }
    }
}

// Formats YYYY-MM-DD input date to standard MM/DD/YYYY print date
function formatPrintDate(dateStr) {
    if (!dateStr) return "-- / -- / ----";
    const parts = dateStr.split('-');
    if (parts.length !== 3) return dateStr;
    return `${parts[1]}/${parts[2]}/${parts[0]}`;
}

// Sync Form variables to PDF sheet Live preview
function updateLivePreview() {
    // 1. Map Dates
    const reqDate = document.getElementById("requestDate").value;
    const delDate = document.getElementById("deliveryDate").value;
    document.getElementById("previewReqDate").textContent = formatPrintDate(reqDate);
    document.getElementById("previewDelDate").textContent = formatPrintDate(delDate);
    
    // 2. Map Job details
    const jobNumSelect = document.getElementById("jobNumber").value;
    let jobNumFinal = "-----";
    let jobNameFinal = "Select a project...";
    
    if (jobNumSelect === "Custom") {
        jobNumFinal = document.getElementById("customJobNumber").value.trim() || "Custom";
        jobNameFinal = document.getElementById("customJobName").value.trim() || "Custom Name";
    } else if (jobNumSelect) {
        jobNumFinal = jobNumSelect;
        const matchingJob = projectsDatabase.find(j => j.number === jobNumSelect);
        jobNameFinal = matchingJob ? matchingJob.name : "-----";
    }
    
    document.getElementById("previewJobNum").textContent = jobNumFinal;
    document.getElementById("previewJobName").textContent = jobNameFinal;
    
    // 3. Map Categories
    const categorySelect = document.getElementById("categoryName").value;
    let categoryFinal = "-----";
    if (categorySelect === "Custom") {
        categoryFinal = document.getElementById("customCategoryName").value.trim() || "Custom Category";
    } else if (categorySelect) {
        categoryFinal = categorySelect;
    }
    document.getElementById("previewCategory").textContent = categoryFinal;
    
    // 4. Map Subcategory & Finish
    const subcat = document.getElementById("subcategoryName").value.trim();
    const finish = document.getElementById("productFinish").value.trim();
    document.getElementById("previewSubcategory").textContent = subcat || "-----";
    document.getElementById("previewFinish").textContent = finish || "-----";
    
    // 5. Map Location checkboxes
    const locActive = document.querySelector('input[name="location"]:checked').value;
    if (locActive === "Pick up parts room") {
        document.getElementById("previewPickupChecked").textContent = "✓";
        document.getElementById("previewDeliveryChecked").textContent = "";
    } else {
        document.getElementById("previewPickupChecked").textContent = "";
        document.getElementById("previewDeliveryChecked").textContent = "✓";
    }
    
    // 6. Map Reason text
    const reason = document.getElementById("reason").value.trim();
    document.getElementById("previewReason").textContent = reason || "-----";
    
    // 7. Value configuration Matrix
    const activeValue = document.querySelector('input[name="valueConfig"]:checked');
    const valText = activeValue ? activeValue.value : "$1";
    
    // Reset preview slots
    document.getElementById("fillContract").textContent = "";
    document.getElementById("fillCO").textContent = "";
    document.getElementById("fillNoValue").textContent = "";
    
    // Apply logic based on select value
    if (valText === "$2" || valText === "$3") {
        document.getElementById("fillCO").textContent = valText;
    } else if (valText === "$1") {
        document.getElementById("fillNoValue").textContent = "✓";
    } else if (valText === "Scope item") {
        document.getElementById("fillContract").textContent = "Scope Item";
    }
}

// PDF Export Execution (html2pdf.js integration with absolute DOM cloning to fix scroll crops and left boundaries)
function downloadMaterialRequestPDF() {
    const original = document.getElementById("requestDocument");
    
    // Create a temporary absolute container at the body level (avoid negative left positions to prevent cropping!)
    const tempContainer = document.createElement("div");
    tempContainer.style.position = "absolute";
    tempContainer.style.left = "0";
    tempContainer.style.top = "0";
    tempContainer.style.width = "794px";
    tempContainer.style.height = "1024px";
    tempContainer.style.zIndex = "-9999"; // Render behind the active UI surface
    tempContainer.style.overflow = "visible";
    tempContainer.style.background = "#ffffff";
    tempContainer.style.margin = "0";
    tempContainer.style.padding = "0";
    tempContainer.style.border = "none";
    
    // Clone the sheet element
    const clone = original.cloneNode(true);
    clone.style.transform = "none";
    clone.style.margin = "0";
    clone.style.position = "relative";
    clone.style.boxShadow = "none";
    
    tempContainer.appendChild(clone);
    document.body.appendChild(tempContainer);
    
    // Pull active numbers to formulate unique professional filename
    const jobNumSelect = document.getElementById("jobNumber").value;
    let jobNumFinal = "JOB";
    if (jobNumSelect === "Custom") {
        jobNumFinal = document.getElementById("customJobNumber").value.trim() || "CUSTOM";
    } else if (jobNumSelect) {
        jobNumFinal = jobNumSelect;
    }
    
    // Replace any unsafe whitespace and characters
    const cleanNum = jobNumFinal.replace(/[^a-zA-Z0-9]/g, "_");
    const dateStamp = new Date().toISOString().slice(0,10);
    const pdfFilename = `QIW_Material_Request_${cleanNum}_${dateStamp}.pdf`;
    
    const opt = {
        margin:       0,
        filename:     pdfFilename,
        image:        { type: 'jpeg', quality: 0.98 },
        html2canvas:  { 
            scale: 2.0, 
            useCORS: true, 
            letterRendering: true,
            logging: false,
            scrollY: 0,
            scrollX: 0,
            x: 0,
            y: 0,
            windowWidth: 794,
            windowHeight: 1024
        },
        jsPDF:        { unit: 'px', format: [794, 1024], orientation: 'portrait' }
    };
    
    // Render and trigger direct local download
    return html2pdf().from(clone).set(opt).save()
        .then(() => {
            console.log("Material Request PDF generated successfully!");
            document.body.removeChild(tempContainer);
            
            // Ask user if they also want to download the FBOM Excel
            setTimeout(() => {
                if (confirm("Material Request PDF downloaded successfully!\n\nWould you like to also download the FBOM Excel spreadsheet populated with these items?")) {
                    downloadFBOMExcel();
                }
            }, 500);
        })
        .catch(err => {
            console.error("PDF generation failure: ", err);
            if (document.body.contains(tempContainer)) {
                document.body.removeChild(tempContainer);
            }
            alert("Encountered error generating PDF. Please ensure your browser supports modern rendering.");
        });
}

// Open Prompt Overlay for Outlook dispatch
function openEmailWorkflow() {
    const emailModal = document.getElementById("emailPromptModal");
    emailModal.classList.remove("hidden");
}

// Trigger direct mailto launcher with CCs, Subject, Body, and download PDF locally
function triggerEmailLaunch() {
    // Pull active numbers to formulate unique professional filename
    const jobNumSelect = document.getElementById("jobNumber").value;
    let jobNumFinal = "JOB";
    if (jobNumSelect === "Custom") {
        jobNumFinal = document.getElementById("customJobNumber").value.trim() || "CUSTOM";
    } else if (jobNumSelect) {
        jobNumFinal = jobNumSelect;
    }
    
    // Replace any unsafe whitespace and characters
    const cleanNum = jobNumFinal.replace(/[^a-zA-Z0-9]/g, "_");
    const dateStamp = new Date().toISOString().slice(0,10);
    const pdfFilename = `QIW_Material_Request_${cleanNum}_${dateStamp}.pdf`;
    
    // Populate the helper filename placeholder
    const helperFilenameElem = document.getElementById("helperFilename");
    if (helperFilenameElem) {
        helperFilenameElem.textContent = pdfFilename;
    }
    
    // Customize helper description for direct drag & drop attachment
    const helperStepsContainer = document.querySelector(".helper-steps");
    if (helperStepsContainer) {
        helperStepsContainer.innerHTML = `
            <div style="margin-bottom: 10px; display: flex; gap: 8px; align-items: start;">
                <span style="background: var(--accent-orange); color: white; border-radius: 50%; width: 18px; height: 18px; display: inline-flex; align-items: center; justify-content: center; font-size: 0.65rem; font-weight: bold; flex-shrink: 0; margin-top: 2px;">1</span>
                <span>Your Material Request PDF has been downloaded: <br><strong style="font-family: monospace; color: var(--accent-orange); word-break: break-all;">${pdfFilename}</strong></span>
            </div>
            <div style="margin-bottom: 10px; display: flex; gap: 8px; align-items: start;">
                <span style="background: var(--accent-orange); color: white; border-radius: 50%; width: 18px; height: 18px; display: inline-flex; align-items: center; justify-content: center; font-size: 0.65rem; font-weight: bold; flex-shrink: 0; margin-top: 2px;">2</span>
                <span>An Outlook email has been launched in the background with pre-filled CCs (<strong>gbabin@qiworks.com; mvancha@qiworks.com</strong>).</span>
            </div>
            <div style="display: flex; gap: 8px; align-items: start;">
                <span style="background: var(--accent-orange); color: white; border-radius: 50%; width: 18px; height: 18px; display: inline-flex; align-items: center; justify-content: center; font-size: 0.65rem; font-weight: bold; flex-shrink: 0; margin-top: 2px;">3</span>
                <span>Simply **drag and drop** the downloaded PDF directly from your browser's Downloads bar or folder into the opened Outlook window to attach it!</span>
            </div>
        `;
    }
    
    // Open the visual Email Helper instructions modal
    const emailHelperModal = document.getElementById("emailHelperModal");
    if (emailHelperModal) {
        emailHelperModal.classList.remove("hidden");
    }
    
    // Generate and download the PDF locally
    downloadMaterialRequestPDF();
    
    // Map email parameters
    let jobNameFinal = "Custom Job";
    if (jobNumSelect && jobNumSelect !== "Custom") {
        const matchingJob = projectsDatabase.find(j => j.number === jobNumSelect);
        jobNameFinal = matchingJob ? matchingJob.name : "-----";
    }
    
    const reqDate = document.getElementById("requestDate").value;
    const delDate = document.getElementById("deliveryDate").value;
    const category = document.getElementById("categoryName").value;
    const subcategory = document.getElementById("subcategoryName").value;
    const finish = document.getElementById("productFinish").value;
    const location = document.querySelector('input[name="location"]:checked').value;
    
    // Format cc list
    const ccList = "gbabin@qiworks.com; mvancha@qiworks.com";
    
    // Format email subject
    const subject = encodeURIComponent(`Material Request - Job ${jobNumFinal} - ${jobNameFinal}`);
    
    // Compile very clean, shortened body summary that will never exceed 1000 characters
    let bodyText = `Quality Ironworks Operations Division,\n\n`;
    bodyText += `A manual material request has been generated for Job #${jobNumFinal} (${jobNameFinal}).\n\n`;
    bodyText += `Please find the generated Material Request PDF in your Downloads folder and ATTACH it to this email.\n\n`;
    bodyText += `SUMMARY:\n`;
    bodyText += `------------------------------------------\n`;
    bodyText += `* Request Date: ${formatPrintDate(reqDate)}\n`;
    bodyText += `* Required Delivery/Ship Date: ${formatPrintDate(delDate)}\n`;
    bodyText += `* Job Details: #${jobNumFinal} - ${jobNameFinal}\n`;
    bodyText += `* Category: ${category === "Custom" ? document.getElementById("customCategoryName").value : category}\n`;
    bodyText += `* Subcategory: ${subcategory}\n`;
    bodyText += `* Product Finish: ${finish}\n`;
    bodyText += `* Destination: ${location}\n`;
    bodyText += `------------------------------------------\n\n`;
    bodyText += `Total Line Items: ${lineItems.length} items.\n\n`;
    bodyText += `Requested by: Field Engineering Representative\n`;
    bodyText += `Quality Ironworks Field Portal System`;
    
    const bodyEncoded = encodeURIComponent(bodyText);
    
    // Generate mailto link
    const mailtoLink = `mailto:?cc=${ccList}&subject=${subject}&body=${bodyEncoded}`;
    
    // Launch Outlook (or default systems mail handler) using standard safe anchor click
    const mailAnchor = document.createElement('a');
    mailAnchor.href = mailtoLink;
    mailAnchor.target = '_blank';
    mailAnchor.click();
}

// Parse dynamic steel descriptions into Shape and Dimensions (size)
function parseSteelDescription(desc) {
    const d = desc.trim();
    
    // Check for "BY" shape first explicitly: when they put BY, they can put whatever text they want.
    // In FBOM, the shape should be "BY" and description (Dimensions column) should be whatever they type (the full text).
    const byRegex = /^(BY)(?:\b|\s|$)/i;
    if (byRegex.test(d)) {
        return {
            shape: "BY",
            dimensions: d // Exactly whatever they type
        };
    }
    
    // Pre-defined shapes list sorted by length (descending) to avoid partial matches
    const shapes = ["FLAT BAR", "FLATBAR", "BAR", "PIPE", "HSS", "MC", "TS", "WT", "HP", "PL", "W", "L", "C"];
    
    for (const shape of shapes) {
        // Match shape at the beginning, case-insensitive, followed by space, number, or end of string
        const regex = new RegExp("^(" + shape + ")(?:\\b|[\\s\\d\\-X\\*]|$)", "i");
        const match = d.match(regex);
        if (match) {
            const shapePart = match[1].toUpperCase();
            const dimPart = d.substring(match[0].length).trim();
            return {
                shape: shapePart,
                dimensions: dimPart || d
            };
        }
    }
    
    // Fallback: entire string as dimensions
    return {
        shape: "",
        dimensions: d
    };
}

// Generate SheetJS workbook matching the exact QIW FBOM structure and trigger download
function downloadFBOMExcel() {
    if (lineItems.length === 0) {
        alert("Cannot generate FBOM because no line items are added yet.");
        return;
    }
    
    // Create new empty workbook
    const wb = XLSX.utils.book_new();
    
    // Define column headers matching the QIW FBOM schema
    const headers = [
        "Approval Status", "Drawing #", "Main Mark", "Piece Mark", 
        "Quantity", "Shape", "Dimensions", "Length", 
        "Grade", "Finish", "Remark", "Category", 
        "Sub-Category", "Sequence", "Lot #", "Sequence Qty"
    ];
    
    // Map portal's line items array to Excel schema rows
    const dataRows = lineItems.map(item => {
        let fbomShape = item.shape || "";
        let fbomDim = item.dimension || item.desc || "";
        
        if (fbomShape === "BY") {
            fbomShape = "BY";
            // For BY: shape should be BY and description/dimension should be exactly whatever they typed
        } else if (fbomShape === "QIW") {
            fbomShape = "BY"; // "when they selct the QIW in the FBOM the shape shuold be BY and in discription it should be QIW- what ever they type"
            const cleanDim = fbomDim.replace(/^QIW-?\s*/i, "").trim();
            fbomDim = `QIW-${cleanDim}`;
        } else if (fbomShape) {
            // Standard shapes: clean leading shape prefix from dimension to keep FBOM clean (e.g. if they typed "W8x10" under shape "W", write "8x10")
            const prefixRegex = new RegExp("^" + fbomShape + "\\s*-?\\s*", "i");
            fbomDim = fbomDim.replace(prefixRegex, "").trim();
        } else {
            // Fallback parsing for legacy/safety
            const parsed = parseSteelDescription(item.desc);
            fbomShape = parsed.shape;
            fbomDim = parsed.dimensions;
        }
        
        // Format length string (e.g. 10'-6" or empty)
        const lengthText = (item.feet > 0 || item.inches > 0)
            ? `${item.feet}'-${item.inches}"`
            : "";
            
        // Get dynamic category
        const categorySelect = document.getElementById("categoryName").value;
        let categoryFinal = categorySelect;
        if (categorySelect === "Custom") {
            categoryFinal = document.getElementById("customCategoryName").value.trim();
        }
        
        // Get dynamic subcategory & finish
        const subcategoryFinal = document.getElementById("subcategoryName").value.trim();
        const finishFinal = document.getElementById("productFinish").value.trim();
        
        // Return 16-field mapping matching headers exactly
        return {
            "Approval Status": "",
            "Drawing #": "",
            "Main Mark": "",
            "Piece Mark": "",
            "Quantity": item.pcs,
            "Shape": fbomShape,
            "Dimensions": fbomDim,
            "Length": lengthText,
            "Grade": "",
            "Finish": finishFinal,
            "Remark": "",
            "Category": categoryFinal,
            "Sub-Category": subcategoryFinal,
            "Sequence": "",
            "Lot #": "",
            "Sequence Qty": ""
        };
    });
    
    // Convert JSON records to a native Worksheet
    const ws = XLSX.utils.json_to_sheet(dataRows, { header: headers });
    
    // Append Worksheet named 'FBOM' to Workbook
    XLSX.utils.book_append_sheet(wb, ws, "FBOM");
    
    // Formulate unique file name based on selected Job Number
    const jobNumSelect = document.getElementById("jobNumber").value;
    let jobNumFinal = "JOB";
    if (jobNumSelect === "Custom") {
        jobNumFinal = document.getElementById("customJobNumber").value.trim() || "CUSTOM";
    } else if (jobNumSelect) {
        jobNumFinal = jobNumSelect;
    }
    const cleanNum = jobNumFinal.replace(/[^a-zA-Z0-9]/g, "_");
    const dateStamp = new Date().toISOString().slice(0,10);
    const excelFilename = `QIW_FBOM_${cleanNum}_${dateStamp}.xlsx`;
    
    // Write and download the spreadsheet file
    XLSX.writeFile(wb, excelFilename);
    console.log("FBOM Excel package compiled and downloaded successfully!");
}
