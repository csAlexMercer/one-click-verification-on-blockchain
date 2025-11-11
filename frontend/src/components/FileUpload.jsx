import React, { useState } from 'react';

const FileUpload = ({ onFileSelect, accept = ".pdf" }) => {
    const [selectedFile, setSelectedFile] = useState(null);
    const [dragging, setDragging] = useState(false);

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
        setSelectedFile(file);
        if (onFileSelect) onFileSelect(file);
        }
    };

    const handleDragOver = (e) => {
        e.preventDefault();
        setDragging(true);
    };

    const handleDragLeave = () => {
        setDragging(false);
    };

    const handleDrop = (e) => {
        e.preventDefault();
        setDragging(false);
        
        const file = e.dataTransfer.files[0];
        if (file && file.type === 'application/pdf') {
        setSelectedFile(file);
        if (onFileSelect) onFileSelect(file);
        }
    };

    return (
        <div>
        <div
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${
            dragging ? 'border-primary bg-blue-50' : 'border-gray-300 hover:border-primary'
            }`}
            onClick={() => document.getElementById('file-input').click()}
        >
            <input
            id="file-input"
            type="file"
            accept={accept}
            onChange={handleFileChange}
            className="hidden"
            />
            
            <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
            </svg>
            
            <p className="mt-2 text-sm text-gray-600">
            {selectedFile ? selectedFile.name : 'Click to upload or drag and drop PDF file'}
            </p>
            
            {selectedFile && (
            <p className="mt-1 text-xs text-gray-500">
                {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
            </p>
            )}
        </div>
        </div>
    );
    };

export default FileUpload;