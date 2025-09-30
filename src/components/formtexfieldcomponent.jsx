import React from "react";

export default function FormTexfieldComponent() {
    label,
    type = "text",
    placeholder = "",
    value,
    onChange,
    required = false,
    className = "",
    id = ""
    return (
     <div className="mb-3">
        {label && <label className="block mb-1 font-medium">{label}</label>}
        <input
            id={id}
            type={type}
            placeholder={placeholder}
            value={value}
            onChange={onChange}
            required={required}
            className={`border border-gray-300 rounded-md px-3 py-2 w-full focus:outline-none focus:ring-2 focus:ring-blue-500 ${className}`}
        />
     </div>
    )
}