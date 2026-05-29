import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown } from 'lucide-react';
import './CustomDropdown.css';

const CustomDropdown = ({ options, value, onChange, placeholder = "Select option", label }) => {
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef(null);

    const selectedOption = options.find(opt => opt === value || opt.value === value);
    const displayValue = selectedOption 
        ? (typeof selectedOption === 'string' ? selectedOption : selectedOption.label)
        : placeholder;

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleSelect = (option) => {
        const val = typeof option === 'string' ? option : option.value;
        onChange(val);
        setIsOpen(false);
    };

    return (
        <div className="custom-dropdown-container" ref={dropdownRef}>
            {label && <label className="dropdown-field-label">{label}</label>}
            <div 
                className={`dropdown-trigger ${isOpen ? 'active' : ''}`} 
                onClick={() => setIsOpen(!isOpen)}
            >
                <span>{displayValue}</span>
                <ChevronDown size={18} className={`chevron ${isOpen ? 'rotate' : ''}`} />
            </div>

            {isOpen && (
                <div className="dropdown-options-menu">
                    {options.map((option, index) => {
                        const optLabel = typeof option === 'string' ? option : option.label;
                        const optValue = typeof option === 'string' ? option : option.value;
                        const isSelected = optValue === value;

                        return (
                            <div 
                                key={index} 
                                className={`dropdown-option ${isSelected ? 'selected' : ''}`}
                                onClick={() => handleSelect(option)}
                            >
                                {optLabel}
                                {isSelected && <div className="selected-dot" />}
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
};

export default CustomDropdown;
