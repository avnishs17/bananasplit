
import React, { useState, useCallback } from 'react';
import { UploadIcon, SparklesIcon } from './icons';

interface ImageUploaderProps {
    onImageUpload: (file: File) => void;
    isLoading: boolean;
}

const ImageUploader: React.FC<ImageUploaderProps> = ({ onImageUpload, isLoading }) => {
    const [isDragging, setIsDragging] = useState(false);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            onImageUpload(e.target.files[0]);
        }
    };

    const handleDrop = useCallback((e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragging(false);
        if (e.dataTransfer.files && e.dataTransfer.files[0]) {
            onImageUpload(e.dataTransfer.files[0]);
        }
    }, [onImageUpload]);

    const handleDragOver = useCallback((e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        e.stopPropagation();
    }, []);

    const handleDragEnter = useCallback((e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragging(true);
    }, []);
    
    const handleDragLeave = useCallback((e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragging(false);
    }, []);

    return (
        <div className="flex items-center justify-center h-screen bg-gray-900">
            <div className="text-center p-8 max-w-2xl mx-auto">
                <div className="flex justify-center items-center mb-4">
                    <SparklesIcon className="w-10 h-10 text-yellow-400 mr-3" />
                    <h1 className="text-5xl font-bold tracking-tight text-white sm:text-6xl">
                        Banana<span className="text-yellow-400">Split</span>
                    </h1>
                </div>
                <p className="mt-4 text-lg leading-8 text-gray-300">
                    The Git-Inspired Version Control System for Images.
                    <br />
                    Upload a starting image to begin your creative journey.
                </p>

                <div
                    onDrop={handleDrop}
                    onDragOver={handleDragOver}
                    onDragEnter={handleDragEnter}
                    onDragLeave={handleDragLeave}
                    className={`mt-10 mx-auto w-full max-w-lg p-8 border-2 border-dashed rounded-xl transition-colors duration-300 ${isDragging ? 'border-yellow-400 bg-gray-800/50' : 'border-gray-600 hover:border-gray-500'}`}
                >
                    <label htmlFor="file-upload" className="cursor-pointer">
                        <div className="flex flex-col items-center justify-center space-y-4">
                            <UploadIcon className="w-12 h-12 text-gray-400" />
                            <div className="flex text-sm text-gray-400">
                                <span className="relative font-semibold text-yellow-400 hover:text-yellow-300">
                                    {isLoading ? 'Processing...' : 'Upload an image'}
                                </span>
                                <input id="file-upload" name="file-upload" type="file" className="sr-only" onChange={handleFileChange} accept="image/png, image/jpeg, image/webp" disabled={isLoading} />
                                <p className="pl-1">or drag and drop</p>
                            </div>
                            <p className="text-xs text-gray-500">PNG, JPG, WEBP up to 10MB</p>
                        </div>
                    </label>
                </div>
            </div>
        </div>
    );
};

export default ImageUploader;
