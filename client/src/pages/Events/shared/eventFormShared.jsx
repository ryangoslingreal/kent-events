export function Field({ styles, label, htmlFor, children }) {
    return (
        <div className={styles.fieldGroup}>
            <label htmlFor={htmlFor}>{label}</label>
            {children}
        </div>
    );
}

export function createInitialEventForm() {
    return {
        title: "",
        description: "",
        image: null,
        image_mime: null,
        date: "", 
        start_time: "",
        end_time: "",
        location: "",
        tags: [],
        ticket_url: "",
        contact_email: ""
    };
}

export function applyEventInputChange(setFormData) {
    return ({ target }) => {
        const { name, value, type, checked, files } = target;
        let nextValue = type === "checkbox" ? checked : value;

        if (name === "image"){
            const selectedFile = files?.[0] ?? null;
            
            setFormData(prev => ({
                ...prev,
                image: selectedFile,
                image_mime: selectedFile?.type ?? prev.image_mime ?? null
            }));

            return selectedFile;
        }
        
        if (name === "tags") {
            setFormData(prev => ({
                ...prev,
                tags: [value]
            }));

            return null;
        }

        setFormData(prev => ({
            ...prev,
            [name]: nextValue
        }));

        return null;
    };
}

export function mapEventToEditForm(data) {
    return {
        ...data,
        date: data.date.slice(0, 10),
        start_time: data.start_time.toString().slice(0, 5),
        end_time: data.end_time ? data.end_time.toString().slice(0, 5) : ""
    };
}

export function buildEventUpdatePayload(formData, selectedFile, removeImage = false) {
    const payload = {...formData};

    delete payload.image;
    delete payload.image_mime;
    delete payload.remove_image;

    if (removeImage) {
        payload.remove_image = true;
        return payload;
    }
        
    if (selectedFile) {
        payload.image = selectedFile;
    }

    return payload;
}