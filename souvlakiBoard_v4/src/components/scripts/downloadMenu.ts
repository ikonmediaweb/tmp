let sourceTable = base.getTable("Speisekarten");
let targetTable = base.getTable("Kunden");

// Get the first record with menuTrigger = "1"
let targetQuery = await targetTable.selectRecordsAsync({
    fields: ["menuTrigger", "menuFood", "Name", "menuJSON"],
    filterByFormula: "{menuTrigger} = '1'"
});

let targetRecord = targetQuery.records[0];
if (!targetRecord) {
    output.set('error', 'No record found with menuTrigger = 1');
    return;
}

let sourceQuery = await sourceTable.selectRecordsAsync({ fields: ["w", "plu", "article", "description", "p1", "m1", "m2", "p2"] });

// Kategorien mit speziellen Mengen-/Preisformaten
let specialCategories = ["Alkoholfreie Getränke", "Spirituosen", "Flaschenweine", "Biere", "Aperitif"];

// UUID-Funktion (statt `crypto.randomUUID()`)
function generateUUID() {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
        let r = (Math.random() * 16) | 0;
        let v = c === 'x' ? r : (r & 0x3) | 0x8;
        return v.toString(16);
    });
}

// Funktion zur Generierung einer eindeutigen PLU
function generatePLU() {
    return Math.floor(1000 + Math.random() * 9000).toString();
}

// **Fügt die Validierungsfunktion hinzu**
function validateMenuData(data) {
    if (typeof data !== 'object' || data === null) {
        return { isValid: false, error: 'Invalid JSON: must be an object' };
    }

    if (!data.restaurantName || typeof data.restaurantName !== 'string') {
        return { isValid: false, error: 'Missing or invalid restaurantName: must be a string' };
    }

    if (!Array.isArray(data.sections)) {
        return { isValid: false, error: 'Missing or invalid sections: must be an array' };
    }

    for (const section of data.sections) {
        if (typeof section.name !== 'string') {
            return { isValid: false, error: `Section name must be a string` };
        }

        if (!Array.isArray(section.items)) {
            return { isValid: false, error: `Items in section "${section.name}" must be an array` };
        }

        for (const item of section.items) {
            if (!item.plu || typeof item.plu !== 'string') {
                item.plu = generatePLU();
            }

            if (!item.name || typeof item.name !== 'string') {
                return { isValid: false, error: `Missing or invalid article name in section "${section.name}"` };
            }

            if (typeof item.description !== 'string') {
                item.description = 'Klassischer Spirituose aus traditioneller Herstellung';
            }

            // Falls `prices` nicht existiert oder falsch ist, setze es als leeres Array
            if (!Array.isArray(item.prices)) {
                item.prices = [];
            }
        }
    }

    return { isValid: true };
}

// **Airtable-Datenverarbeitung**
for (let targetRecord of targetQuery.records) {
    let menuTrigger = targetRecord.getCellValue("menuTrigger") || "";
    if (menuTrigger !== "1") continue;

    let relatedRecords = targetRecord.getCellValue("menuFood") || [];
    if (relatedRecords.length === 0) continue;

    let restaurantName = targetRecord.getCellValue("Name") || "Unbekanntes Restaurant";
    let menuData = {
        restaurantName,
        sections: []
    };

    let sectionMap = {};  // Um Kategorien den Abschnitten zuzuordnen

    for (let relatedRecord of relatedRecords) {
        let record = sourceQuery.getRecord(relatedRecord.id);
        if (!record) continue;

        let categories = record.getCellValue("w") || [];
        let plu = record.getCellValue("plu") || generatePLU();
        let article = record.getCellValue("article")?.trim() || "Unbenanntes Gericht";
        let description = record.getCellValue("description")?.trim() || "Keine Beschreibung verfügbar";

        let p1 = record.getCellValue("p1") || "";
        let m1 = record.getCellValue("m1") || "";
        let p2 = record.getCellValue("p2") || "";
        let m2 = record.getCellValue("m2") || "";

        for (let categoryObj of categories) {
            let categoryName = categoryObj.name?.trim() || "Uncategorized";

            // Falls die Kategorie noch nicht existiert, erstelle sie
            if (!sectionMap[categoryName]) {
                let newSection = {
                    id: generateUUID(),
                    name: categoryName,
                    showPlu: true,
                    items: []
                };
                sectionMap[categoryName] = newSection;
                menuData.sections.push(newSection);
            }

            // Preise korrekt formatieren (immer als Array vorhanden)
            let priceData = [];
            if (specialCategories.includes(categoryName)) {
                if (m2 && p2) priceData.push({ "size": m2, "price": parseFloat(p2) });
                if (m1 && p1) priceData.push({ "size": m1, "price": parseFloat(p1) });
            } else {
                if (p2) priceData.push({ "price": parseFloat(p2) });
            }

            let itemData = {
                id: generateUUID(),
                plu,
                name: article,
                description,
                prices: priceData.length > 0 ? priceData : []
            };

            sectionMap[categoryName].items.push(itemData);
        }
    }

    // Validierung vor dem Speichern
    let validation = validateMenuData(menuData);
    if (!validation.isValid) {
        console.error(`Fehler in Menüdaten: ${validation.error}`);
        continue;
    }

    // Das JSON-Objekt in das Feld "menuJSON" schreiben
    // After the menu generation and update
    await targetTable.updateRecordAsync(targetRecord.id, {
        "menuJSON": JSON.stringify(menuData, null, 2)
    });
    // Fetch the updated record to ensure we have the latest data
    targetRecord = (await targetTable.selectRecordsAsync({
        fields: ["menuTrigger", "menuFood", "Name", "menuJSON", "menuDownload"],
        filterByFormula: `RECORD_ID() = '${targetRecord.id}'`
    })).records[0];
    // Add debug output
    output.set('debug', `Menu JSON exists: ${!!targetRecord.getCellValue("menuJSON")}`);
    let menuJSON = targetRecord.getCellValue("menuJSON");
    if (!menuJSON) {
        output.set('error', 'No menu JSON found in the record');
    }
    // If menuJSON is not a string, stringify it
    if (typeof menuJSON !== "string") {
        menuJSON = JSON.stringify(menuJSON, null, 2);
    }
    // Get current date and restaurant name for filename
    const currentDate = new Date().toISOString().split('T')[0];
    const fileName = `menu-${restaurantName.toLowerCase().replace(/\s+/g, '-')}-${currentDate}.json`;
    const dataUrl = `data:application/json;charset=utf-8,${encodeURIComponent(menuJSON)}`;  // Changed from jsonString to menuJSON

    // Update the download URL
    await targetTable.updateRecordAsync(targetRecord.id, {
        "menuDownload": dataUrl
    });

    output.set('message', 'Download URL has been saved to menuDownload field');
}