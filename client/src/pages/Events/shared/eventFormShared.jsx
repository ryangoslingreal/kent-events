export const EVENT_TOAST_STYLE = {
    background: "#05345C",
    color: "white"
};

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
        subtitle: "",
        description: "",
        image: null,
        image_mime: null,
        event_date: "",
        event_time: "",
        location: "",
        tags: [],
        price: "",
        repeat_event: "never",
        available_contact: false
    };
}

export function applyEventInputChange(setFormData) {
    return ({ target }) => {
        const { name, value, type, checked, files } = target;
        let nextValue = type === "checkbox" ? checked : value;

        if (name === "price") {
            nextValue = Math.max(0, Number(nextValue || 0));
        }

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
                tags: value
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
        event_time: data.event_time.toString().slice(0, 5),
        event_date: data.event_date.slice(0, 10),
        available_contact: data.available_contact == 1
    };
}

export function buildEventUpdatePayload(formData, selectedFile) {
    const payload = {...formData};
        
    if (selectedFile) {
        payload.image = selectedFile;
    } else {
        delete payload.image;
        delete payload.image_mime;
    }

    return payload;
}